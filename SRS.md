# Software Requirements Specification (SRS)

## Banda Digital Ecosystem
- **Version:** 1.0
- **Status:** Initial Development Specification
- **Pilot Location:** Desa Banda Neira, Maluku
- **Target Audience:** Pemerintah Desa, Kelompok Tani Rempah, Wisatawan & Konsumen Publik

---

## 1. Project Overview

### 1.1 Description
Banda Digital Ecosystem adalah platform digital terintegrasi yang dirancang untuk mendukung digitalisasi pelayanan masyarakat, pendataan petani rempah, pemetaan perkebunan, dan transparansi rantai pasok produk rempah di Banda Neira.

Platform ini terdiri atas 3 subsistem utama:
1. **Population Identity & Administration:** Pengelolaan identitas digital internal penduduk dan administrasi layanan desa.
2. **Spice Farmer Mapping:** Pendataan petani rempah, kelompok tani, dan pemetaan perkebunan (spasial PostGIS).
3. **Blockchain-Based Spice Traceability:** Pelacakan rantai pasok rempah (panen, batch pengolahan, distribusi/kemasan) dengan bukti integritas hash tercatat di blockchain EVM lokal dan verifikasi QR Code publik.

Ketiga sistem terhubung dalam satu backend modular monolith dan database relasional terintegrasi. Blockchain **hanya** digunakan untuk mencatat bukti integritas data dan riwayat aktivitas penting, bukan untuk menyimpan data pribadi.

### 1.2 Objectives
- Membantu digitalisasi administrasi kependudukan tingkat desa.
- Menyediakan identitas digital internal bagi penduduk terdaftar (UUID internal).
- Memetakan petani dan lokasi perkebunan rempah di Banda Neira.
- Mendokumentasikan komoditas (pala, cengkih) dan hasil produksi panen.
- Menyediakan sistem pelacakan produk rempah dari kebun petani hingga konsumen.
- Membantu konsumen memeriksa riwayat produk melalui QR Code tanpa harus login.
- Meningkatkan transparansi, akuntabilitas, dan nilai tambah rempah Banda Neira.
- Membangun fondasi digital yang dapat dilanjutkan secara mandiri setelah program KKN selesai.

### 1.3 Scope & Boundaries

#### In-Scope (MVP)
- Web Application responsif & Progressive Web App (PWA) untuk mode offline/lemah sinyal.
- Autentikasi dan Role-Based Access Control (RBAC).
- Manajemen data kependudukan desa (identitas internal, verifikasi, audit trail).
- Pemetaan petani, kelompok tani, dan lahan perkebunan (Leaflet + PostGIS).
- Pencatatan hasil panen dan pembuatan product batches.
- Manajemen rantai pasok (pengolahan, distribusi, pengemasan).
- Generator dan verifikator QR Code publik untuk konsumen.
- Pencatatan transaksi dan integritas hash batch ke Local EVM Smart Contract.
- Audit logging terpusat.
- Dashboard administrasi terpadu.

#### Out-of-Scope (Excluded from MVP)
- Penggantian sistem resmi SIAK / Ditjen Dukcapil Kemendagri.
- Penerbitan dokumen identitas resmi negara (KTP-el/KK).
- Integrasi langsung API Dukcapil.
- Pembayaran digital atau marketplace dengan payment gateway sungguhan.
- Jaringan blockchain publik mainnet dengan gas fee nyata.
- Sensor otomatis IoT perkebunan.
- Aplikasi native Android/iOS (cukup PWA responsif).
- Analisis computer vision/AI untuk deteksi fisik keaslian rempah.

---

## 2. User Roles & Responsibilities

| Role | Tanggung Jawab Utama | Akses Data Pribadi | Akses Blockchain / Verifikasi |
|---|---|---|---|
| **System Administrator** | Pengelolaan pengguna, role, konfigurasi sistem, audit log global | Penuh (dalam batas administrasi) | Pemantauan smart contract |
| **Village Officer** | Registrasi & verifikasi penduduk, pengajuan administrasi desa | Terbatas pada yurisdiksi desa | Tidak langsung |
| **Farmer** | Profil mandiri, pencatatan hasil panen sendiri, status batch produk | Data pribadi sendiri | Melihat status verifikasi batch |
| **Farmer Group Admin** | Pengelolaan anggota kelompok tani, validasi aktivitas anggota | Data anggota kelompok tani | Input data batch kelompok |
| **Smart Tourism Admin** | Pengelolaan katalog produk publik, informasi wisata rempah | Hanya data publik yang disetujui | Menampilkan data terverifikasi |
| **Public Consumer** | Memindai QR Code, melihat riwayat kebun & rantai pasok produk | **Tidak ada akses PII** | Verifikasi integritas catatan |

---

## 3. Functional Requirements

### 3.1 Authentication & Authorization
- **FR-AUTH-001:** Login menggunakan email/username dan password dengan rate limiting.
- **FR-AUTH-002:** Role-based access control (RBAC) pada setiap endpoint backend.
- **FR-AUTH-003:** Password hashing menggunakan Argon2id / Bcrypt aman.
- **FR-AUTH-004:** Mekanisme token berbasis JWT dengan waktu kedaluwarsa dan refresh token aman.
- **FR-AUTH-005:** Administrator dapat mengaktifkan/menonaktifkan akun pengguna.

### 3.2 Population Management
- **FR-POP-001:** Petugas desa dapat mendaftarkan profil penduduk (menggunakan data sintetis pada dev).
- **FR-POP-002:** Sistem menghasilkan Resident ID internal unik berupa UUIDv4.
- **FR-POP-003:** Status verifikasi identitas kependudukan (Pending, Verified, Rejected).
- **FR-POP-004:** Audit trail otomatis pada setiap perubahan data kependudukan.
- **FR-POP-005:** Pencarian dan filter kependudukan berdasarkan RT/RW, status, dan pekerjaan.
- **FR-POP-006 (Privacy):** NIK, no telp, alamat detail, dan berkas pribadi **TIDAK BOLEH** disimpan di blockchain publik atau diekspos di endpoint tanpa otorisasi.

### 3.3 Farmer & Farm Management
- **FR-FARM-001:** Registrasi profil petani dengan Farmer ID internal unik.
- **FR-FARM-002:** Relasi petani dengan kelompok tani (Farmer Groups).
- **FR-FARM-003:** Pencatatan lahan kebun (lokasi koordinat/poligon PostGIS, luas lahan, komoditas pala/cengkih).
- **FR-FARM-004:** Peta persebaran perkebunan dan komoditas interaktif (Leaflet OSM).
- **FR-FARM-005:** Privasi koordinat detail kebun tidak diekspos ke publik tanpa izin.

### 3.4 Harvest & Batch Management
- **FR-HARVEST-001:** Pencatatan panen (petani, komoditas, tanggal panen, kuantitas, satuan, kualitas).
- **FR-TRACE-001:** Pembuatan batch produk (`product_batches`) dari satu atau gabungan catatan panen.
- **FR-TRACE-002:** Setiap batch memiliki nomor batch unik (`Batch ID`) dan token publik acak (`public_verification_token`).
- **FR-TRACE-003:** Pencatatan peristiwa batch (`batch_events`): Pengolahan (pengeringan, sortasi), pemindahan kepemilikan, pengemasan.
- **FR-TRACE-004:** Penghitungan hash integritas kanonikal (SHA-256) untuk setiap tahapan peristiwa batch.

### 3.5 Traceability & Blockchain Integration
- **FR-CHAIN-001:** Modul blockchain terisolasi dari core business logic.
- **FR-CHAIN-002:** Smart contract menyimpan `batchId`, `merkleRoot`/`dataHash`, timestamp, dan signer address.
- **FR-CHAIN-003:** Status transaksi: `Pending`, `Submitted`, `Confirmed`, `Failed`.
- **FR-CHAIN-004:** Sistem dilarang menampilkan status `Verified` jika transaksi belum berstatus `Confirmed` di jaringan blockchain.
- **FR-CHAIN-005:** Perubahan data menghasilkan event baru (append-only audit log), bukan menghapus riwayat sebelumnya.

### 3.6 QR Code & Public Verification
- **FR-QR-001:** Pembuatan QR Code dinamis yang mengarah ke URL publik: `/verify/{public_verification_token}`.
- **FR-QR-002:** Halaman verifikasi publik dapat diakses tanpa login dan responsif di perangkat mobile.
- **FR-QR-003:** Menampilkan profil komoditas, nama desa (Banda Neira), riwayat perjalanan produk, tanggal panen, serta bukti hash blockchain.
- **FR-QR-004:** QR Code yang tidak valid atau tidak terdaftar menghasilkan tampilan ramah 404/Not Found.

---

## 4. Non-Functional Requirements

### 4.1 Security & Privacy
- Enforce backend validation (Pydantic) dan otorisasi (RBAC) pada seluruh API.
- Perlindungan Data Pribadi (UU PDP): Semua data identitas warga terlindungi dan menggunakan data sintetis pada pengujian.
- Seluruh secret dan private key blockchain dikelola via environment variables, tidak dicatat dalam repository.

### 4.2 Performance
- Respon API CRUD kependudukan dan batch < 300ms.
- Endpoint publik verifikasi QR ringan (< 200ms) tanpa query langsung ke node blockchain pada setiap page load (gunakan data snapshot terkonfirmasi di cache/DB).
- Pagination wajib pada semua daftar list data.

### 4.3 Offline Capability & Resiliency
- PWA dengan caching offline untuk formulir pencatatan panen dan verifikasi lapangan.
- Antrean sinkronisasi IndexedDB dengan status: `Offline`, `Pending Sync`, `Synced`, `Failed`.

---

## 5. Acceptance Criteria (Definition of MVP Done)
1. Administrator dan petugas desa dapat login dengan hak akses terpisah.
2. Registrasi dan verifikasi data penduduk sintetis berjalan lengkap dengan audit log.
3. Data petani dan koordinat kebun tersimpan di PostGIS dan tampil di peta.
4. Catatan panen dapat digabungkan menjadi batch produk dengan nomor registrasi unik.
5. Peristiwa pengolahan tercatat dan membentuk rantai hash integritas.
6. Bukti hash terunggah ke smart contract local EVM dengan receipt hash transaksi.
7. QR Code yang dicetak/dipindai menampilkan halaman publik riwayat produk.
8. Formulir panen dapat diisi saat offline dan otomatis tersinkronisasi saat online.
9. Dokumentasi lengkap dan dapat dijalankan via `docker compose up`.
