# PANDUAN PENGGUNA SISTEM KETERTELUSURAN
## Buku Panduan Operasional Lapangan: Petugas Desa, Poktan, Nelayan & UMKM
**Spesialis:** Khoirul Anam (*Blockchain & Traceability Specialist*)  
**Wilayah:** Kepulauan Banda, Maluku Tengah  
**Bahasa:** Bahasa Indonesia Praktis & Lugas

---

## 1. Pendahuluan

Buku panduan ini disusun untuk memudahkan seluruh pemangku kepentingan di Banda Neira—mulai dari petani di lereng kebun, nelayan di dermaga pesisir, pengrajin pengasapan ikan, hingga operator desa—dalam mengoperasikan aplikasi ketertelusuran digital.

Sistem ini memastikan setiap kilogram pala, fuli, cengkeh, dan ikan tangkapan Banda memiliki "akta kelahiran digital" yang terdaftar di jaringan blockchain terdesentralisasi, melindungi harga jual komoditas warga dari praktik tengkulak dan percampuran komoditas palsu.

---

## 2. Panduan untuk Petani Rempah & Nelayan (Pencatatan Panen/Tangkapan)

### 2.1. Cara Mencatat Panen Pala atau Cengkeh
1. Buka aplikasi di ponsel Anda (dapat dibuka melalui browser Chrome/Safari di `http://192.168.8.89:5175` atau aplikasi PWA terpasang).
2. Masuk menggunakan akun petani Anda (atau minta bantuan petugas desa/ketua kelompok tani).
3. Pilih menu **📦 Catatan Panen Saya**.
4. Klik tombol hijau **+ Catat Panen Baru**.
5. Isi formulir sederhana:
   - **Komoditas:** Pilih `Pala Banda` atau `Cengkeh`.
   - **Pilih Petak Kebun:** Pilih lokasi kebun Anda (misal: *Petak Lereng Lonthoir Blok A*).
   - **Bobot Panen (kg):** Masukkan berat timbangan panen hari ini (misal: `75.5`).
   - **Kadar Air Awal (%):** Masukkan hasil pengukuran alat ukur kadar air (jika ada).
   - **Kualitas:** Pilih `Grade A Super`, `Grade B`, atau `Campuran`.
6. Klik **Simpan Panen**.
   > **Catatan Jika Tanpa Sinyal (Offline):** Jangan khawatir! Data otomatis tersimpan di ponsel Anda. Ketika Anda turun ke desa dan mendapat sinyal internet, data akan otomatis terkirim ke server desa.

---

### 2.2. Cara Mencatat Tangkapan Ikan Cakalang / Tuna
1. Pada menu **Catatan Hasil Tangkap**, klik **+ Catat Tangkapan Baru**.
2. Pilih komoditas: `Ikan Cakalang` atau `Tuna Sirip Kuning`.
3. Masukkan bobot total tangkapan (kg) dan jumlah ekor.
4. Pilih metode tangkap: `Pancing Ulur Tradisional` atau `Pancing Tonda`.
5. Catat kondisi pendinginan (misal: *Palka Es Curah Suhu 2°C*).
6. Klik **Simpan Tangkapan**.

---

## 3. Panduan untuk Pengurus Kelompok Tani / KUB Nelayan (Pembentukan Batch)

Setelah hasil panen atau tangkapan terkumpul di balai kelompok, pengurus menggabungkan beberapa panen menjadi satu **Nomor Batch**:

1. Masuk ke tab **Traceability & Paspor Mutu**.
2. Klik tombol **Buat Batch Komoditas Baru**.
3. Masukkan informasi batch:
   - **Kode Batch:** Gunakan format standar desa, contoh: `BN-BTC-2026-005`.
   - **Nama Produk:** Contoh: *Pala Banda Grade A Super Kemasan 250g*.
   - **Pilih Panen Terdaftar:** Centang catatan panen anggota yang digabungkan ke dalam batch ini.
   - **Desa Asal:** Pilih desa (Lonthoir, Dender, Waer, dll.).
4. Klik **Terbitkan Batch**.
5. Sistem akan langsung memunculkan **Gambar QR Code Resmi** produk tersebut.

---

## 4. Panduan untuk UMKM & Pengolah Pangan (Pencatatan Event Pengolahan)

Bagi UMKM pengolah sirup pala, manisan pala, atau pengasapan **Ikan Asar Lonthoir**:

### 4.1. Menambahkan Peristiwa Pengasapan Ikan Asar
1. Cari nomor batch Ikan Asar yang sedang diproses pada daftar batch.
2. Klik tombol **+ Tambah Peristiwa**.
3. Pilih tipe peristiwa: `SMOKED (PENGASAPAN TRADISIONAL)`.
4. Isi keterangan proses:
   - *Bahan Bakar Asap:* Sabut kelapa tua dan tempurung buah kenari Banda.
   - *Lama Pengasapan:* 5 jam pada suhu 75°C.
   - *Lokasi:* Rumah Asap Tradisional Dusun Lonthoir.
5. Unggah foto proses pengasapan jika ada.
6. Klik **Simpan Peristiwa**.

### 4.2. Mengalihkan Kepemilikan Batch (Transfer of Custody)
Ketika produk Ikan Asar atau pala kemasan dibeli oleh gerai UMKM atau toko oleh-oleh:
1. Buka detail batch.
2. Klik tombol **Alihkan Kepemilikan (Transfer)**.
3. Masukkan alamat dompet digital atau nama unit UMKM penerima (misal: *Syafa Mart Banda*).
4. Klik **Konfirmasi Pengalihan**. Riwayat pengalihan ini akan tercatat permanen di blockchain.

---

## 5. Panduan untuk Petugas Desa / Administrator (Anchoring Blockchain)

Petugas desa yang memiliki wewenang verifikasi resmi:

1. Periksa kelengkapan berkas batch dan hasil uji laboratorium (bebas aflatoksin atau bebas formalin).
2. Pastikan seluruh peristiwa penting (panen, penjemuran, pengasapan) sudah diinput secara benar.
3. Pada kartu batch, klik tombol ungu berikon rantai: **⛓️ Anchor ke Smart Contract**.
4. Sistem akan menghitung *Canonical SHA-256 Hash* dan mengirimkan transaksi ke jaringan blockchain EVM (Sepolia atau Amoy).
5. Dalam beberapa detik, status batch akan berubah menjadi **ANCHORED** dengan lencana biru, lengkap dengan nomor blok dan *Transaction Hash*.

---

## 6. Panduan Mencetak Label Kemasan & Pemindaian oleh Wisatawan

1. Pada kartu batch yang telah berstatus *Anchored*, klik tombol **Unduh Citra QR**.
2. Cetak stiker QR code menggunakan printer stiker standar ukuran 3x3 cm atau 4x4 cm.
3. Tempelkan stiker pada kemasan plastik vakum Ikan Asar, karung goni mini rempah pala, atau botol sirup pala.
4. **Uji Coba Pemindaian:**
   - Arahkan kamera ponsel smartphone Anda ke stiker QR.
   - Ketuk tautan web yang muncul di layar kamera.
   - Halaman **Sertifikat Paspor Mutu Banda** akan langsung terbuka dan menampilkan bukti keaslian tanpa perlu login.

---

## 7. Panduan Pemecahan Masalah (Troubleshooting)

| Kendala yang Terjadi | Kemungkinan Penyebab | Langkah Solusi Praktis |
|---|---|---|
| **Data panen tidak muncul di akun petugas desa.** | Ponsel petani masih dalam kondisi *offline* di tengah kebun. | Pastikan petani menghubungkan ponsel ke Wi-Fi balai desa atau sinyal seluler, lalu tekan tombol **Sinkronkan Sekarang** di pojok kanan atas. |
| **Kamera wisatawan tidak memunculkan link saat scan QR.** | Stiker QR kotor, buram, atau pencahayaan kurang. | Pastikan lensa kamera bersih. Wisatawan juga dapat membuka halaman utama website dan mengetik kode batch secara manual pada kotak pencarian. |
| **Status Blockchain menampilkan "Peringatan Manipulasi".** | Ada perubahan data bobot atau kadar air pada database lokal setelah batch di-anchor. | Hubungi Administrator Desa untuk memeriksa log audit trail (`AuditTrailWorkspace`) guna melacak siapa operator yang mengubah data. |
| **Transaksi Anchoring Blockchain Gagal.** | Saldo testnet gas (ETH/POL) pada dompet admin habis atau node RPC sibuk. | Periksa sisa saldo di faucet atau alihkan ke node RPC cadangan yang tertera di panduan deployment. |

---

*Disetujui untuk panduan resmi pelatihan masyarakat Banda Neira - Khoirul Anam.*
