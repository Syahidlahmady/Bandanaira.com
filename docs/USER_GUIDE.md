# Panduan Operasional & Pengguna Ekosistem Digital Banda Neira

Selamat datang di sistem **Banda Digital Ecosystem** — platform terpadu administrasi kependudukan sipil, pemetaan geospasial lahan rempah pala/fuli, ketertelusuran (traceability) rantai pasok berbasis QR, verifikasi integritas on-chain EVM Smart Contract, dan aplikasi web progresif (PWA) siap pakai di area perkebunan tanpa koneksi internet.

---

## 1. Peran Pengguna (Role-Based Access Control)

Sistem menyediakan 5 peran dengan batas kewenangan yang jelas dan aman:

| Peran (Role) | Akun Demo | Password Demo | Hak Akses Utama |
|---|---|---|---|
| **Administrator Desa** (`admin`) | `admin` | `Admin123!` | Akses penuh seluruh modul, manajemen peran, pendaftaran user, jangkar blockchain EVM, konfigurasi sistem. |
| **Petugas Desa** (`village_officer`) | `petugas` | `Petugas123!` | Registrasi & verifikasi penduduk sipil, pemetaan kebun, pencatatan panen, pembuatan batch produk, inspeksi rantai pasok. |
| **Ketua Kelompok Tani** (`farmer_group_admin`) | `ketua_kelompok` | `Ketua123!` | Manajemen anggota kelompok tani, pendaftaran lahan rempah binaan, pemantauan alokasi panen kelompok. |
| **Petani Rempah** (`farmer`) | `petani` | `Petani123!` | Pencatatan hasil panen harian di kebun, melihat pemetaan lahan milik sendiri, riwayat alokasi batch produk. |
| **Warga Desa** (`resident`) | `warga` | `Warga123!` | Portal mandiri warga: cek status identitas sipil, permohonan surat keterangan (SKU, Domisili, dll). |
| **Publik / Konsumen** | *(Tanpa Login)* | *(Tanpa Login)* | Verifikasi keaslian rempah Banda Neira melalui scan QR / input token batch produk. |

---

## 2. Cara Masuk ke Sistem (Login)

1. Buka peramban (browser) dan akses alamat frontend: `http://localhost:5174` (atau URL server desa).
2. Di halaman utama, pada bagian **Masuk ke Sistem Administrasi**:
   - Masukkan **Username / Email** dan **Password**.
   - Atau klik salah satu tombol pintasan **💡 Akun Demo** (`[👑 Admin]`, `[🏛️ Petugas Desa]`, `[🌾 Ketua Kelompok]`, `[👨‍🌾 Petani Pala]`, `[👤 Warga]`) untuk pengisian otomatis.
3. Klik tombol **Masuk (Login)**.
4. Profil pengguna, badge peran, serta navigasi tab modul akan otomatis disesuaikan dengan hak akses akun.

---

## 3. Modul Kependudukan Sipil (Civil Population Registry)

> **Hak Akses:** Administrator & Petugas Desa (`admin`, `village_officer`).

### A. Mendaftarkan Penduduk Baru
1. Buka tab **Kependudukan**.
2. Klik tombol **+ Tambah Penduduk Baru**.
3. Isi formulir pendaftaran:
   - **NIK**: 16 digit angka unik sesuai KTP/KK.
   - **Nama Lengkap**: Nama warga tanpa singkatan.
   - **Jenis Kelamin**: L (Laki-laki) atau P (Perempuan).
   - **Pekerjaan**: Contoh: *Petani Rempah Pala*, *Nelayan*, *Pedagang*.
4. Klik tombol **Simpan Penduduk**.
5. Jika koneksi normal, data tersimpan langsung ke PostgreSQL desa. Jika sedang offline di lapangan, data otomatis diamankan ke antrean IndexedDB lokal.

### B. Pencarian & Verifikasi Berkas
- Gunakan kolom **Cari penduduk** untuk filter cepat berdasarkan NIK atau Nama.
- Pada tabel warga berstatus `PENDING`, klik tombol **Verifikasi** untuk memvalidasi keabsahan data sipil warga.

---

## 4. Modul Pemetaan Lahan Rempah GIS (PostGIS & Leaflet)

> **Hak Akses:** Admin, Petugas Desa, Ketua Kelompok, dan Petani.

### A. Membaca Peta Interaktif Lahan
1. Buka tab **Pemetaan Lahan (GIS)**.
2. Peta interaktif Pulau Banda Neira dan Banda Besar akan menampilkan:
   - Poligon batas kebun berwarna hijau/emas.
   - Titik koordinat sentral kebun rempah.
3. Klik pada poligon kebun untuk menampilkan popup informasi detail:
   - Nama Kebun & Kode Lahan (misal: `BN-FARM-001`).
   - Petani Penggarap & Kelompok Tani.
   - Komoditas utama (Pala / Fuli / Cengkih).
   - Luas kebun (meter persegi).

### B. Mendaftarkan Lahan Kebun Baru
1. Di bawah peta, buka bagian **+ Petakan Lahan Baru**.
2. Pilih Petani pemilik lahan.
3. Masukkan Kode Lahan, Nama Kebun, dan Deskripsi Lokasi.
4. Tentukan koordinat Latitude & Longitude (bisa diambil dari GPS smartphone).
5. Masukkan luas area (m²) dan komoditas utama.
6. Klik **Petakan Lahan Sekarang**.

---

## 5. Modul Panen & Ketertelusuran Rantai Pasok (Traceability)

> **Hak Akses:** Admin, Petugas Desa, dan Petani.

### A. Mencatat Hasil Panen di Kebun
1. Buka tab **Panen & Traceability**.
2. Pada bagian formulir panen:
   - Pilih Lahan dan Petani.
   - Kode Panen di-generate otomatis (`BN-HRV-YYYY-NNN`).
   - Tentukan Komoditas (Pala / Fuli), Tanggal Petik, Bobot Panen (kg), dan Mutu (Grade A Super, Grade 1 Export, dll).
3. Klik **Catat Panen**.
4. Catatan panen akan muncul di tabel riwayat panen dan siap dialokasikan ke dalam batch produksi.

### B. Membuat Batch Produk Ekspor
1. Pada bagian **Buat Batch Produk**, masukkan Kode Batch (`BN-BTC-2026-001`).
2. Pilih catatan panen asal yang dialokasikan ke dalam batch ini.
3. Klik **Buat Batch**.
4. Sistem akan menghasilkan **Token Verifikasi Publik** dan **QR Code digital unik**.

### C. Menambahkan Peristiwa Rantai Pasok (Timeline Event)
1. Pilih batch pada tabel daftar batch.
2. Pada form **Catat Peristiwa Baru (Supply Chain Event)**:
   - Pilih jenis peristiwa: `sorting`, `drying`, `packaging`, `quality_inspection`, `transfer`.
   - Masukkan lokasi (misal: *Sentra Pengeringan Lonthoir*).
   - Masukkan deskripsi kegiatan (misal: *Sortasi kadar air < 10% dan pengemasan vakum nitrogen*).
3. Klik **Catat Event**.
4. Setiap event dirangkai secara kriptografis menggunakan algoritma hashing SHA-256 yang saling mengunci (*hash chaining*).

---

## 6. Verifikasi On-Chain Blockchain EVM (Smart Contract)

> **Smart Contract:** `SpiceRegistry.sol`  
> **Jaminan Keamanan:** **Zero-PII** — Tidak ada data identitas pribadi warga/petani yang masuk ke blockchain; hanya SHA-256 batch hash dan referensi kode batch.

### A. Menjangkarkan (Anchoring) Batch ke Blockchain
1. Pada tabel Batch Produk, temukan batch yang telah lengkap proses pengemasannya.
2. Klik tombol **⛓️ Jangkar EVM**.
3. Sistem backend menghitung root hash kanonikal dari batch dan seluruh peristiwanya, lalu mengirimkan transaksi ke Smart Contract EVM.
4. Status blockchain berubah menjadi `CONFIRMED` dengan bukti **Transaction Hash** dan **Nomor Blok**.

### B. Audit Kriptografis Independen
1. Klik tombol **🔍 Verifikasi On-Chain** pada baris batch.
2. Modal audit akan membandingkan secara real-time:
   - **Database Hash**: Hash yang dihitung langsung dari data basis data saat ini.
   - **On-Chain Hash**: Hash permanen yang tersimpan di dalam Smart Contract EVM.
3. Jika data identik dan belum pernah diubah secara ilegal, indikator hijau **✓ VERIFIKASI INTEGRITAS BLOCKCHAIN LOLOS** akan menyala.

---

## 7. Verifikasi QR Publik Mandiri (Konsumen & Wisatawan)

Konsumen rempah di seluruh dunia maupun wisatawan di Banda Neira dapat memeriksa keaslian rempah tanpa perlu membuat akun:

1. Di halaman bawah aplikasi terdapat kotak **🔍 Verifikasi Mandiri Konsumen / Wisatawan (Scan QR Publik)**.
2. Masukkan token verifikasi publik (misal: `BN_VERIFY_PALA_SUPER_2026_LONTHOIR`).
3. Klik **Verifikasi Produk**.
4. Sistem menampilkan sertifikat digital keaslian produk:
   - Desa Asal (Lonthoir, Banda Besar, Maluku).
   - Kebun Asal & Komoditas.
   - Garis waktu lengkap pemrosesan dari kebun hingga kemasan.
   - Status integritas blockchain EVM terverifikasi.

---

## 8. Mode Lapangan Offline (PWA & IndexedDB Sync Queue)

Banda Neira memiliki titik-titik perkebunan di perbukitan yang minim sinyal seluler. Sistem Banda Digital dirancang dengan arsitektur **Offline-First**:

### A. Tanda Status Jaringan
Pada bagian atas dashboard terdapat indikator jaringan cerdas:
- 🟢 **Online - Terhubung ke Server Desa**: Koneksi normal, data langsung disinkronkan.
- 🔴 **Offline - Mode Lapangan (PWA Aktif)**: Browser mendeteksi hilangnya koneksi. Semua tombol dan formulir tetap dapat digunakan normal.

### B. Cara Kerja Pencatatan Offline
1. Saat petugas/petani mencatat panen, mendaftarkan penduduk, atau memetakan kebun dalam kondisi offline:
2. Sistem tidak akan memunculkan pesan error, melainkan menyimpan data ke penyimpanan aman lokal perangkat (**IndexedDB** `sync_queue`).
3. Tampilan diperbarui secara instan (**optimistic update**) dengan tanda `⏳ Tersimpan di antrean offline lokal`.
4. Muncul notifikasi ramah: *"Mode Offline: Catatan tersimpan di antrean lokal perangkat! Akan disinkronkan otomatis saat online."*

### C. Sinkronisasi Otomatis & Manual
- **Otomatis**: Begitu perangkat kembali mendapatkan sinyal seluler/Wi-Fi, event `online` akan secara otomatis mengeksekusi pengiriman antrean ke server desa.
- **Manual**: Pengguna dapat mengklik tombol **⚡ Sinkronkan Sekarang** atau membuka jendela **📋 Antrean Offline** untuk meninjau, mengulang, atau membersihkan data antrean lokal.

---

## 9. Pemecahan Masalah (Troubleshooting)

| Gejala | Penyebab Umum | Solusi |
|---|---|---|
| *Backend offline: Failed to fetch* | Backend FastAPI belum berjalan atau port diblokir | Jalankan `./backend/.venv/bin/uvicorn backend.app.main:app --port 8005 --reload` dan pastikan PostgreSQL berjalan. |
| *Status Blockchain Gagal* | Node EVM lokal belum aktif | Sistem memiliki fallback verifikasi deterministik aman sehingga aplikasi tetap berjalan 100%. Untuk menghubungkan RPC nyata, atur `BLOCKCHAIN_RPC_URL` di file `.env`. |
| *Peta tidak memuat tiles* | Koneksi internet terputus saat pertama kali membuka peta | Muat peta sekali saat terhubung online agar Service Worker menyimpan cache visual peta untuk penggunaan offline. |

---

*Hak Cipta © 2026 Pemerintah Desa Banda Neira, Kepulauan Banda, Maluku Tengah.*
