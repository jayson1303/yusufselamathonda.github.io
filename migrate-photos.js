/**
 * migrate-photos.js
 * ------------------
 * Skrip ini akan:
 * 1. Membaca folder "Foto Produk" (1 subfolder = 1 motor)
 * 2. Mencocokkan tiap foto ke warna motor yang paling sesuai (berdasarkan hex)
 * 3. Upload foto ke Firebase Storage
 * 4. Update field "colors[].image" di Firestore dengan URL foto (bukan base64 lagi)
 *
 * CARA PAKAI:
 * 1. Taruh file ini di folder project (sejajar dengan folder "Foto Produk" dan file serviceAccountKey.json)
 * 2. Buka Command Prompt di folder itu, jalankan:
 *      npm init -y
 *      npm install firebase-admin sharp
 * 3. Jalankan skrip:
 *      node migrate-photos.js
 * 4. Tunggu sampai selesai, baca ringkasan di akhir log.
 *
 * AMAN DIJALANKAN ULANG (idempotent) - kalau dijalankan 2x, foto akan di-upload ulang
 * dan URL akan diperbarui, tidak akan duplikat data warna.
 */

const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");
const sharp = require("sharp");

// ============ KONFIGURASI ============
const FOTO_DIR = "Foto Produk";
const SERVICE_ACCOUNT_PATH = "./serviceAccountKey.json";
const STORAGE_BUCKET = "yusuf-selamat-motor.firebasestorage.app";
// ======================================

if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  console.error("ERROR: serviceAccountKey.json tidak ditemukan di folder ini.");
  process.exit(1);
}
if (!fs.existsSync(FOTO_DIR)) {
  console.error(`ERROR: Folder "${FOTO_DIR}" tidak ditemukan di folder ini.`);
  process.exit(1);
}

const serviceAccount = require(SERVICE_ACCOUNT_PATH);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: STORAGE_BUCKET,
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

// Ubah nama folder motor jadi ID dokumen Firestore
// Contoh: "ALL NEW ADV ABS 160" -> "all-new-adv-abs-160"
function folderToDocId(folder) {
  return folder.toLowerCase().replace(/\s+/g, "-");
}

// Ubah hex "#cc1d24" jadi {r, g, b}
function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

// Jarak antar warna (semakin kecil = semakin mirip)
function colorDistance(c1, c2) {
  return Math.sqrt(
    Math.pow(c1.r - c2.r, 2) +
    Math.pow(c1.g - c2.g, 2) +
    Math.pow(c1.b - c2.b, 2)
  );
}

// Ambil warna rata-rata/dominan dari sebuah foto (resize ke 1x1 piksel)
async function getAverageColor(filePath) {
  const { data } = await sharp(filePath)
    .resize(1, 1)
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { r: data[0], g: data[1], b: data[2] };
}

// Upload 1 file foto ke Firebase Storage, kembalikan URL publik
async function uploadImage(localPath, destPath) {
  await bucket.upload(localPath, {
    destination: destPath,
    metadata: { contentType: "image/jpeg" },
  });
  const file = bucket.file(destPath);
  await file.makePublic();
  return `https://storage.googleapis.com/${STORAGE_BUCKET}/${destPath}`;
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function main() {
  const productFolders = fs
    .readdirSync(FOTO_DIR)
    .filter((f) => fs.statSync(path.join(FOTO_DIR, f)).isDirectory());

  console.log(`Ditemukan ${productFolders.length} folder produk.\n`);

  let sukses = 0;
  let dilewati = 0;
  let gagal = 0;

  for (const folder of productFolders) {
    const docId = folderToDocId(folder);
    const docRef = db.collection("products").doc(docId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      console.log(`[LEWATI] "${folder}" -> dokumen "${docId}" tidak ditemukan di Firestore.`);
      dilewati++;
      continue;
    }

    const productData = docSnap.data();
    const colors = productData.colors || [];

    if (colors.length === 0) {
      console.log(`[LEWATI] "${folder}" -> tidak ada data warna (colors kosong).`);
      dilewati++;
      continue;
    }

    const folderPath = path.join(FOTO_DIR, folder);
    const imageFiles = fs
      .readdirSync(folderPath)
      .filter((f) => /\.(jpe?g|png)$/i.test(f));

    if (imageFiles.length === 0) {
      console.log(`[LEWATI] "${folder}" -> tidak ada file foto di folder.`);
      dilewati++;
      continue;
    }

    try {
      // Hitung warna dominan tiap foto
      const photosWithColor = [];
      for (const imgFile of imageFiles) {
        const fullPath = path.join(folderPath, imgFile);
        const avgColor = await getAverageColor(fullPath);
        photosWithColor.push({ file: imgFile, fullPath, avgColor });
      }

      // Cocokkan tiap warna motor ke foto yang paling mirip (greedy, tanpa pakai foto yang sama 2x)
      const usedPhotos = new Set();
      const updatedColors = [];

      for (const colorEntry of colors) {
        const targetRgb = hexToRgb(colorEntry.hex || "#000000");

        let bestPhoto = null;
        let bestDistance = Infinity;

        for (const photo of photosWithColor) {
          if (usedPhotos.has(photo.file)) continue;
          const dist = colorDistance(targetRgb, photo.avgColor);
          if (dist < bestDistance) {
            bestDistance = dist;
            bestPhoto = photo;
          }
        }

        // Kalau semua foto sudah kepakai (motor warna lebih banyak dari jumlah foto), pakai lagi foto pertama
        if (!bestPhoto) {
          bestPhoto = photosWithColor[0];
        } else {
          usedPhotos.add(bestPhoto.file);
        }

        const destPath = `products/${docId}/${slugify(colorEntry.colorName || "warna")}.jpg`;
        const url = await uploadImage(bestPhoto.fullPath, destPath);

        updatedColors.push({
          ...colorEntry,
          image: url,
        });

        console.log(`  - "${colorEntry.colorName}" <- ${bestPhoto.file}`);
      }

      await docRef.update({ colors: updatedColors });
      console.log(`[SUKSES] "${folder}" -> ${updatedColors.length} warna diperbarui.\n`);
      sukses++;
    } catch (err) {
      console.error(`[GAGAL] "${folder}" -> ${err.message}\n`);
      gagal++;
    }
  }

  console.log("=== RINGKASAN ===");
  console.log(`Berhasil : ${sukses}`);
  console.log(`Dilewati : ${dilewati}`);
  console.log(`Gagal    : ${gagal}`);
}

main().catch((err) => {
  console.error("Terjadi error fatal:", err);
  process.exit(1);
});
