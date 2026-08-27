# Panduan Setup Firebase & Deployment Admin Panel
## Website Dealer Motor YUSUF SELAMAT MOTOR HONDA

Dokumen ini berisi panduan langkah demi langkah untuk mengaktifkan **Firebase Authentication**, **Cloud Firestore Database**, konfigurasi kredensial, dan deployment ke **Vercel** / **GitHub**.

---

### 1. Menyiapkan Project di Firebase Console

1. Buka [Firebase Console](https://console.firebase.google.com/) dan login menggunakan akun Google Anda.
2. Klik **"Add project"** (Tambah project) dan beri nama project, misalnya: `yusuf-selamat-motor`.
3. Matikan Google Analytics (opsional) lalu klik **Create project**.

---

### 2. Mengaktifkan Firebase Authentication (Login Admin)

1. Di menu sidebar kiri Firebase Console, klik **Build > Authentication**.
2. Klik **Get Started**.
3. Pada tab **Sign-in method**, pilih **Email/Password**.
4. Aktifkan opsi **Enable** pada "Email/Password" lalu klik **Save**.
5. Masuk ke tab **Users** dan klik tombol **Add user**.
6. Masukkan Email dan Kata Sandi untuk Admin Dealer Anda:
   - **Email**: contoh `admin@yusufselamatmotorhonda.com`
   - **Password**: (kata sandi kuat minimal 8 karakter)
7. Klik **Add user**. Akun ini siap digunakan untuk login di halaman `admin.html`.

---

### 3. Mengaktifkan Cloud Firestore Database

1. Di menu sidebar kiri, klik **Build > Firestore Database**.
2. Klik **Create database**.
3. Pilih lokasi server terdekat (misal: `asia-southeast2` Jakarta atau `asia-southeast1` Singapura).
4. Pilih opsi **Start in test mode** atau **Production mode**, lalu klik **Create**.
5. Masuk ke tab **Rules** pada Firestore Database, ganti seluruh isinya dengan Security Rules berikut:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Koleksi Produk Motor: Publik hanya baca, Admin login bisa tambah/edit/hapus
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Koleksi Testimoni: Publik hanya baca, Admin login bisa tambah/edit/hapus
    match /testimonials/{testimonialId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Koleksi Pengaturan Website: Publik hanya baca, Admin login bisa ubah
    match /settings/{settingId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Default fallback
    match /{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```
6. Klik tombol **Publish** di pojok kanan atas.

---

### 4. Mengambil Kredensial Firebase Web App & Menghubungkannya

1. Di menu samping kiri, klik ikon **Project Settings** (ikon gerigi di samping *Project Overview*).
2. Gulir ke bawah ke bagian **Your apps**, lalu klik ikon web **`</>`**.
3. Masukkan App nickname (contoh: `Yusuf Selamat Web`), lalu klik **Register app**.
4. Salin objek `firebaseConfig` yang muncul.
5. Anda dapat memasukkan kredensial tersebut dengan 2 cara:
   - **Cara A (Melalui File Kode):** Buka file `firebase-config.js` di project ini, lalu perbarui variabel `DEFAULT_FIREBASE_CONFIG` dengan kredensial dari Firebase Console.
   - **Cara B (Langsung via UI Admin Panel):** Buka `admin.html` di browser > Masuk ke tab **Konfigurasi Firebase** > Masukkan `apiKey`, `projectId`, `authDomain`, `storageBucket`, `appId` > Klik **Simpan & Muat Ulang**.

---

### 5. Melakukan 1-Click Migrasi Data ke Firestore

Setelah terhubung dengan Firebase:
1. Buka halaman `admin.html` dan login menggunakan email & kata sandi yang telah Anda buat.
2. Di sidebar, buka menu **Migrasi & Cadangan**.
3. Klik tombol **"Mulai Migrasi ke Firestore Sekarang"**.
4. Sistem akan secara otomatis mengunggah seluruh **46 model sepeda motor Honda** (lengkap dengan foto, varian warna, harga OTR, dan skema simulasi cicilan) serta **9 testimoni konsumen** ke Firestore.
5. Perubahan data katalog selanjutnya di Admin Panel akan langsung tersinkronisasi secara real-time ke Landing Page (`index.html`) tanpa perlu edit kode maupun deploy ulang.

---

### 6. Panduan Fitur Admin Panel (`admin.html`)

- **Katalog Produk (CRUD):**
  - **Tambah Motor Baru:** Form lengkap mencakup nama model, kategori, harga OTR cash, cicilan/bulan, DP, dan pembuat varian warna dinamis (bisa tambah banyak warna sekaligus dengan color picker dan upload foto).
  - **Edit Motor:** Ubah harga, nama, varian, atau gambar produk yang sudah ada kapan saja.
  - **Hapus Motor:** Dilengkapi modal konfirmasi keamanan.
  - **Duplikat Motor:** Salin spesifikasi motor dengan cepat untuk membuat tipe/varian baru.
- **Update Harga Massal:**
  - Sesuaikan harga beberapa motor atau seluruh motor dalam kategori tertentu sekaligus (kenaikan nominal Rp atau persentase %, sangat berguna saat ada promo musiman atau penyesuaian harga OTR Sukabumi).
- **Testimoni Konsumen:**
  - Tambah, edit, dan hapus ulasan pelanggan dan foto dokumentasi serah terima unit motor.
- **Pengaturan Umum:**
  - Ubah nomor WhatsApp marketing, email, alamat showroom, jam operasional, link Instagram, TikTok, Facebook, dan peta Google Maps.
- **Ekspor Cadangan:**
  - Unduh seluruh isi database ke file JSON lokal sebagai cadangan kapan pun dibutuhkan.

---

### 7. Deployment ke Vercel

1. Push seluruh folder project ini ke repository GitHub Anda (misal `github.com/jayson1303/yusufselamatmotor`).
2. Buka [Vercel](https://vercel.com/) dan login dengan GitHub.
3. Klik **Add New... > Project** lalu pilih repository project ini.
4. Karena ini adalah project statis HTML/CSS/JS murni:
   - **Framework Preset:** `Other`
   - **Root Directory:** `./`
5. Klik **Deploy**.
6. Project akan langsung aktif dan memiliki fitur auto-deploy setiap kali ada push ke branch GitHub.
7. Buka URL hasil deploy, Anda dapat mengakses Landing Page di `/` dan Admin Panel di `/admin.html`.
