/**
 * migrate-photos-v2.js
 * ---------------------
 * Versi perbaikan: mendukung folder terpisah per warna
 * (misal "ALL NEW CBR 150 ABS BK" dan "ALL NEW CBR 150 ABS RD" untuk 1 produk yang sama)
 *
 * CARA PAKAI: sama seperti sebelumnya
 *   node migrate-photos-v2.js
 */

const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");
const sharp = require("sharp");

const FOTO_DIR = "Foto Produk";
const SERVICE_ACCOUNT_PATH = "./serviceAccountKey.json";
const STORAGE_BUCKET = "yusuf-selamat-motor.firebasestorage.app";

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

function slugify(text) {
  return text.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

function wordsOf(slug) {
  return new Set(slug.split("-").filter(Boolean));
}

// Skor kemiripan antara 2 kumpulan kata (0 = tidak mirip sama sekali, 1 = identik)
function similarity(wordsA, wordsB) {
  const intersection = [...wordsA].filter((w) => wordsB.has(w)).length;
  const union = new Set([...wordsA, ...wordsB]).size;
  return union === 0 ? 0 : intersection / union;
}

function hexToRgb(hex) {
  const clean = (hex || "#000000").replace("#", "");
  const bigint = parseInt(clean, 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}

function colorDistance(c1, c2) {
  return Math.sqrt((c1.r - c2.r) ** 2 + (c1.g - c2.g) ** 2 + (c1.b - c2.b) ** 2);
}

async function getAverageColor(filePath) {
  const { data } = await sharp(filePath).resize(1, 1).raw().toBuffer({ resolveWithObject: true });
  return { r: data[0], g: data[1], b: data[2] };
}

async function uploadImage(localPath, destPath) {
  await bucket.upload(localPath, { destination: destPath, metadata: { contentType: "image/jpeg" } });
  const file = bucket.file(destPath);
  await file.makePublic();
  return `https://storage.googleapis.com/${STORAGE_BUCKET}/${destPath}`;
}

async function main() {
  // 1. Ambil semua produk dari Firestore dulu
  const snapshot = await db.collection("products").get();
  const allProducts = [];
  snapshot.forEach((doc) => {
    allProducts.push({ id: doc.id, words: wordsOf(doc.id), data: doc.data() });
  });
  console.log(`Ditemukan ${allProducts.length} produk di Firestore.\n`);

  // 2. Baca semua folder foto
  const productFolders = fs
    .readdirSync(FOTO_DIR)
    .filter((f) => fs.statSync(path.join(FOTO_DIR, f)).isDirectory());
  console.log(`Ditemukan ${productFolders.length} folder foto.\n`);

  // 3. Cocokkan tiap folder ke produk yang paling mirip (skor kemiripan kata)
  const MIN_SIMILARITY = 0.5;
  const groupedByProduct = {}; // docId -> [ { folder, fullPath } ]
  const tidakCocok = [];

  for (const folder of productFolders) {
    const folderSlug = slugify(folder);
    const folderWords = wordsOf(folderSlug);

    let best = null;
    let bestScore = 0;
    for (const product of allProducts) {
      const score = similarity(folderWords, product.words);
      if (score > bestScore) {
        bestScore = score;
        best = product;
      }
    }

    if (best && bestScore >= MIN_SIMILARITY) {
      if (!groupedByProduct[best.id]) groupedByProduct[best.id] = [];
      groupedByProduct[best.id].push({ folder, fullPath: path.join(FOTO_DIR, folder) });
    } else {
      tidakCocok.push(folder);
    }
  }

  // 4. Proses tiap produk: kumpulkan semua foto dari semua folder yang cocok, lalu cocokkan ke warna
  let sukses = 0;
  let gagal = 0;

  for (const product of allProducts) {
    const folders = groupedByProduct[product.id];
    if (!folders || folders.length === 0) {
      console.log(`[LEWATI] "${product.id}" -> tidak ada folder foto yang cocok.`);
      continue;
    }

    const colors = product.data.colors || [];
    if (colors.length === 0) {
      console.log(`[LEWATI] "${product.id}" -> tidak ada data warna.`);
      continue;
    }

    try {
      // Kumpulkan semua foto dari semua folder yang cocok untuk produk ini
      const allPhotos = [];
      for (const { folder, fullPath } of folders) {
        const imgFiles = fs.readdirSync(fullPath).filter((f) => /\.(jpe?g|png)$/i.test(f));
        for (const imgFile of imgFiles) {
          const fp = path.join(fullPath, imgFile);
          const avgColor = await getAverageColor(fp);
          allPhotos.push({ file: `${folder}/${imgFile}`, fullPath: fp, avgColor });
        }
      }

      if (allPhotos.length === 0) {
        console.log(`[LEWATI] "${product.id}" -> folder ditemukan tapi tidak ada foto.`);
        continue;
      }

      const usedPhotos = new Set();
      const updatedColors = [];

      for (const colorEntry of colors) {
        const targetRgb = hexToRgb(colorEntry.hex);
        let bestPhoto = null;
        let bestDistance = Infinity;

        for (const photo of allPhotos) {
          if (usedPhotos.has(photo.file)) continue;
          const dist = colorDistance(targetRgb, photo.avgColor);
          if (dist < bestDistance) {
            bestDistance = dist;
            bestPhoto = photo;
          }
        }
        if (!bestPhoto) bestPhoto = allPhotos[0];
        else usedPhotos.add(bestPhoto.file);

        const destPath = `products/${product.id}/${slugify(colorEntry.colorName || "warna")}.jpg`;
        const url = await uploadImage(bestPhoto.fullPath, destPath);
        updatedColors.push({ ...colorEntry, image: url });
        console.log(`  - "${colorEntry.colorName}" <- ${bestPhoto.file}`);
      }

      await db.collection("products").doc(product.id).update({ colors: updatedColors });
      console.log(`[SUKSES] "${product.id}" -> ${updatedColors.length} warna diperbarui (dari ${folders.length} folder).\n`);
      sukses++;
    } catch (err) {
      console.error(`[GAGAL] "${product.id}" -> ${err.message}\n`);
      gagal++;
    }
  }

  console.log("=== RINGKASAN ===");
  console.log(`Berhasil     : ${sukses}`);
  console.log(`Gagal        : ${gagal}`);
  console.log(`Folder tidak cocok ke produk manapun (${tidakCocok.length}):`);
  tidakCocok.forEach((f) => console.log(`  - ${f}`));
}

main().catch((err) => {
  console.error("Terjadi error fatal:", err);
  process.exit(1);
});
