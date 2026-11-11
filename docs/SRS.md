# DOKUMEN SPESIFIKASI KEBUTUHAN PERANGKAT LUNAK (SRS) — FINAL MASTER BLUEPRINT

**Nama Proyek:** Banda Smart Tourism & Island Resource Ecosystem (Platform Terpadu BST-NIRANA)

**Kode Dokumen:** SRS-BST-NIRANA-2026-FINAL

**Versi:** 2.0 (Locked Master Specification — Tidak Berubah)

**Institusi Pelaksana:** LabSos Informatika Universitas Nahdlatul Ulama (UNU) Yogyakarta & Tim KKN-PPM UGM Neira Basudara 2026

**Lokasi Implementasi:** Kepulauan Banda (Banda Neira, Lonthoir/Banda Besar, Pulau Ai, Pulau Run, Pulau Hatta), Kab. Maluku Tengah.

---

## BAB I: PENDAHULUAN & PENYELARASAN VISI STRATEGIS

### 1.1 Tujuan Dokumen

Dokumen ini adalah acuan teknis tertinggi (_Single Source of Truth_) yang mengunci seluruh ruang lingkup pengembangan perangkat lunak, basis data, pemetaan spasial, dan integrasi perangkat keras (_IoT_) untuk tim Informatika selama pelaksanaan program di Kepulauan Banda.

### 1.2 Matriks Penyelarasan Kepentingan Pemangku Kebijakan (_Stakeholder Alignment_)

Sistem ini dirancang sebagai **Satu Aplikasi Web Terpadu (Monolithic Modular)** yang mengakomodasi tiga mandat utama secara simultan tanpa menduplikasi beban kerja tim pengembang:

| Mandat Pemangku Kepentingan | Fokus Masalah Lapangan | Implementasi Modul di Sistem BST-NIRANA |
| --------------------------- | ---------------------- | --------------------------------------- |

| **1. Mandat CoP Smart Tourism & Riset Akademik FTI** _(Pak Restiadi Bayu Taruno, S.T., M.Eng.)_

| Diseminasi informasi wisata 4A, katalog 177 cagar budaya, pemasaran UMKM, serta luaran riset 5 mahasiswa (Blockchain, DSS, Security, GIS, Literasi Digital).

| • Portal Publik _Smart Tourism_ & Sewa Vila/Homestay.<br>

<br>• Peta Interaktif 4A berbasis **Leaflet.js & GeoJSON**.

<br>

<br>• Mesin Rekomendasi Wisata & Infrastruktur berbasis **DSS SAW**.

<br>

<br>• _Traceability_ komoditas berbasis **Python Blockchain Node**.

|
| **2. Mandat Sosial & Kemudahan Birokrasi Warga** _(Tim Akademik LabSos UNU)_

| Pemetaan masalah sosial dari bawah (_bottom-up_) yang dinamis serta kerumitan birokrasi administrasi warga desa. | • Modul **Dynamic Field Survey Mapper** berbasis **MongoDB**.<br>

<br>• Modul **Layanan Satu-Klik Berbasis 16 Digit NIK** (Warga cukup menghafal NIK untuk akses layanan desa & koperasi) dengan enkripsi **AES-256**.

|
| **3. Empat Mandat Strategis Kemandirian Pulau** _(Prof. Purwo)_ | **1. Krisis Air Bersih** (Konsumsi & Mandi dari air payau/tadah hujan).<br>

<br>**2. Pengolahan Sampah** (Limbah botol/galon plastik akibat beli air).<br>

<br>**3. Kemandirian Energi** (Ketergantungan Diesel/PLTD vs Surya).<br>

<br>**4. Koperasi Hatta** (Ekonomi komoditas bernilai tinggi ala Koperasi _Arla_). | • **Koperasi Hatta & Bank Sampah:** Kasir terpadu berbasis NIK untuk setoran komoditas (Pala/Ikan) dan penukaran sampah plastik menjadi kuota air minum bersih.<br>

<br>• **QR Digital Passport (Model Arla):** _Storytelling_ & bukti keaslian produk Koperasi Hatta bagi wisatawan.

<br>

<br>• **IoT Telemetry & DSS:** Pemantauan sensor kualitas air (TDS BWRO/SWRO) dan daya Panel Surya (_Gravity Battery_) vs Diesel. |

---

## BAB II: TIM PENGEMBANG & PEMBAGIAN TANGGUNG JAWAB (PIC)

Seluruh fitur dalam dokumen ini dibagi habis kepada 5 Mahasiswa Informatika sesuai kepakaran masing-masing:

| No | Nama Mahasiswa | Peran Utama (_Role_) | Tanggung Jawab Modul & Fokus Riset

|     |
| --- | ------------------------------------- | ------------------------------------ |
| 1   | **Ahmad Nor Hidayah Aditya Pavilion** | _System Architect & Full-Stack Lead_ |

| Arsitektur **FastAPI**, manajemen _Hybrid Database_ (MongoDB $\leftrightarrow$ PostgreSQL), kontainerisasi **Docker**, dan pengembangan mesin algoritma **DSS (Metode SAW)** untuk rekomendasi wisata & prioritas infrastruktur air/energi.

|
| 2 | **Khoirul Anam** | _Blockchain & IoT Hardware Lead_

| Pengembangan **Python Blockchain Node (SHA-256)** untuk buku besar Koperasi Hatta & _QR Traceability_ pala/ikan, serta perakitan perangkat keras **IoT (ESP32)** untuk sensor TDS air, energi surya, dan timbangan digital.

|
| 3 | **Syahid Ahmad Lahmady** | _UI/UX Designer & Cyber Security Specialist_

| Perancangan antarmuka **React.js (PWA)**, mode layar sentuh Kiosk desa, serta implementasi keamanan berlapis: **Blind Indexing (HMAC-SHA256)** dan **Enkripsi AES-256** pada data NIK warga sesuai standar **OWASP Top 10**.

|
| 4 | **Fauzan Arisanto** | _Data Engineer & GIS Specialist_

| Perancangan _pipeline_ migrasi data (**ETL** dari MongoDB ke PostgreSQL/PostGIS), pengembangan sistem peta interaktif multi-layer berbasis **Leaflet.js & standar GeoJSON**, serta modul katalog sewa vila & _marketplace_ koperasi.

|
| 5 | **Reyhan Albar Fahryan** | _Content Manager & Community Engagement_

| Pengumpulan data survei lapangan awal, pembuatan konten narasi sejarah & _audio guide_, pengemasan _branding_ produk Koperasi Hatta (model _Arla_), pemasangan plang QR Code wisata, dan pelatihan literasi digital warga/Pokdarwis.

|

---

## BAB III: SPESIFIKASI TEKNOLOGI (LOCKED TECH STACK)

Sistem menggunakan arsitektur **Dual-Deployment (Cloud VPS + Local Edge Server)** agar tetap dapat diakses secara _online_ oleh wisatawan mancanegara/domestik sekaligus tahan terhadap gangguan sinyal internet di lokasi desa.

### 3.1 Daftar Komponen Teknologi

1. **Frontend Framework:** React.js 18+ (Vite Build Tool), Tailwind CSS, Axios, React Router DOM.

2. **Offline Web Capability:** Progressive Web App (PWA) dengan _Workbox Service Workers_ dan _IndexedDB_ untuk menyimpan _cache_ halaman dan ubin peta (_map tiles_) secara _offline_.

3. **GIS & Spatial Engine:** **Leaflet.js** (`react-leaflet`), **GeoJSON** (Standar RFC 7946), dan **QGIS** untuk pengolahan poligon/titik koordinat lapangan.

4. **Backend Framework:** **Python 3.11+ FastAPI** (Uvicorn ASGI Server, Pydantic v2 untuk validasi skema data, SQLAlchemy/GeoAlchemy2 ORM, Motor Async MongoDB Driver).

5. **Custom Blockchain Engine:** Modul internal Python berbasis `hashlib` (**SHA-256**) dengan konsensus **Proof-of-Authority (PoA)** untuk memvalidasi setiap blok transaksi Koperasi Hatta tanpa menguras memori server.
6. **Decision Support System (DSS) Engine:** Modul komputasi matriks Python (`NumPy` & `Pandas`) menggunakan algoritma **SAW (_Simple Additive Weighting_)**.

7. **Security & Cryptography:** `cryptography` / `PyCryptodome` (**AES-256-GCM** untuk enkripsi NIK, **HMAC-SHA256** untuk pencarian NIK cepat), **JWT (JSON Web Token)** dengan pembatasan _Role-Based Access Control_ (RBAC).

8. **Hybrid Database Architecture:**

- **Database Tahap Awal & IoT (NoSQL):** **MongoDB 7.0** — Menampung data mentah pemetaan masalah lapangan yang belum terstruktur (_schema-less_), konten artikel/multimedia wisata, dan _stream_ telemetri sensor IoT.
- **Database Inti & Spasial (RDBMS):** **PostgreSQL 16 + Ekstensi PostGIS 3.4** — Menyimpan data terstruktur yang telah divalidasi (Master Warga/NIK, Transaksi Koperasi Hatta & Bank Sampah, Booking Vila, Rantai Blok Blockchain, Matriks SAW, dan Geometri Spasial).

9. **Infrastruktur & DevOps:** **Docker & Docker Compose**, Nginx Reverse Proxy, dan _Background Sync Worker_ (`APScheduler`) untuk sinkronisasi otomatis antara _Local Edge Server_ di Banda dan _Cloud VPS_.

---

## BAB IV: KARAKTERISTIK PENGGUNA (SYSTEM ACTORS)

| Kode Aktor | Nama Aktor                       | Deskripsi Peran & Hak Akses                                                                                                                                                                                              | Metode Autentikasi |
| ---------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------ |
| **ACT-01** | **Wisatawan (Public / Tourist)** | Menjelajahi peta wisata Leaflet, menggunakan fitur rekomendasi perjalanan & penginapan (DSS SAW), menyewa vila/homestay, memesan oleh-oleh Koperasi Hatta, dan memindai QR Code sertifikat keaslian produk (Blockchain). |

| Publik (Tanpa Login) |
| **ACT-02** | **Warga Lokal (Citizen)** | Mengakses layanan mandiri di kantor desa/koperasi: mengecek saldo tabungan Koperasi Hatta (hasil setor pala/ikan/sampah plastik), melihat kuota air bersih konsumsi, dan mencetak surat keterangan desa otomatis. | Input **16 Digit NIK** (Dilengkapi PIN 4 Digit opsional untuk penarikan saldo) |
| **ACT-03** | **Mitra Lokal (Host Vila & UMKM)** | Pemilik homestay/vila dan perajin UMKM yang memperbarui ketersediaan kamar, menerima pesanan tamu via integrasi WhatsApp, dan memantau stok produk mereka di Koperasi Hatta.

| Login JWT (Nomor HP / NIK + Kata Sandi) |
| **ACT-04** | **Operator Koperasi & Desa** | Pengurus Koperasi Hatta dan perangkat desa yang mengoperasikan kasir timbangan IoT (input komoditas pala/ikan & bank sampah plastik), mendistribusikan air bersih RO, dan memverifikasi surat warga. | Login JWT (Role: `OPERATOR`) |
| **ACT-05** | **Super Admin / Peneliti** | Tim Mahasiswa Informatika, LabSos, dan Dosen yang menginput form survei pemetaan masalah (ke MongoDB), mengeksekusi pengelompokan data (ETL ke PostgreSQL), mengelola layer GeoJSON, dan memantau dashboard IoT & DSS desa.

| Login JWT (Role: `ADMIN_RESEARCHER`) |

---

## BAB V: STRUKTUR ARSITEKTUR WEBSITE (SITEMAP)

Aplikasi web dibagi menjadi **4 Zona Antarmuka** dalam satu _repository_ React.js dengan seluruh _route_ menggunakan **Bahasa Indonesia**:

```text
BST-NIRANA WEB APPLICATION
│
├── ZONA 1: PORTAL PUBLIK & SMART TOURISM (Akses Online Wisatawan)
│   ├── /                               -> Beranda Utama, Pencarian Cepat, Sorotan Wisata & Koperasi Hatta
│   ├── /jelajah-peta                   -> Peta Interaktif Leaflet.js (Layer Publik: Wisata 4A, Sejarah, Vila, Dermaga, Faskes)
│   ├── /penginapan                     -> Direktori Sewa Vila, Homestay & Hotel (Dilengkapi Filter & Badge "Eco-Stay")
│   ├── /penginapan/:id                 -> Detail Vila, Peta Lokasi, Kalender Ketersediaan, & Form Booking
│   ├── /perencana-cerdas               -> Fitur Rekomendasi Wisata & Penginapan Berbasis Preferensi (DSS SAW Mode 1)
│   ├── /cagar-budaya/:slug             -> Halaman Cagar Budaya, Foto 360, Narasi Sejarah, & Audio Guide (Akses via QR Lokasi)
│   ├── /koperasi-hatta                 -> Etalase Produk Unggulan Banda (Pala, Fuli, Olahan Ikan ala Koperasi Arla)
│   └── /verifikasi-rantai/:id_batch    -> Halaman Sertifikat Digital Blockchain (Muncul saat scan QR kemasan produk)
│
├── ZONA 2: PORTAL LAYANAN MANDIRI WARGA (Mode Kiosk Desa / Koperasi - Offline Ready)
│   └── /portal-warga                   -> Layar Input 16 Digit NIK Warga:
│       ├── /portal-warga/dasbor        -> Ringkasan Saldo Koperasi Hatta, Poin Bank Sampah, & Kuota Air Minum (Liter)
│       ├── /portal-warga/riwayat       -> Riwayat Setoran Komoditas (Pala/Ikan) & Penukaran Sampah Plastik
│       └── /portal-warga/surat         -> Layanan Cetak Mandiri Surat Pengantar Desa (Auto-fill PDF dari Data NIK)
│
├── ZONA 3: PORTAL MITRA & OPERATOR KOPERASI HATTA
│   ├── /operator/kasir-timbangan       -> Kasir Timbangan Terpadu (Input NIK + Baca Berat IoT ESP32 -> Simpan & Hash Blok)
│   ├── /operator/dispenser-air         -> Kontrol Distribusi Air Bersih Konsumsi (Potong Kuota NIK -> Buka Solenoid Valve)
│   └── /mitra/penginapan               -> Dashboard Pemilik Vila/Homestay (Kelola Kamar & Konfirmasi Booking Wisatawan)
│
└── ZONA 4: PORTAL ADMIN, PEMETAAN MASALAH & RISET (Tim KKN & Pemerintah Desa)
    ├── /admin/survei-lapangan          -> Form Dinamis Pemetaan Masalah Lapangan (Tersimpan ke MongoDB)
    ├── /admin/manajer-etl              -> Panel Pengelompokan & Migrasi Data (MongoDB -> PostgreSQL & PostGIS GeoJSON)
    ├── /admin/komando-iot              -> Dashboard Telemetri Real-time: Kualitas Air (TDS/Level) & Energi (Surya vs Diesel)
    ├── /admin/ketahanan-dss            -> Peta Krisis Internal & Perankingan Prioritas Infrastruktur Desa (DSS SAW Mode 2)
    └── /admin/audit-keamanan           -> Log Aktivitas Sistem, Status Integritas Rantai Blockchain, & Manajemen Pengguna

```

---

## BAB VI: KEBUTUHAN FUNGSIONAL (FUNCTIONAL REQUIREMENTS — FR)

### 6.1 Modul Pemetaan Masalah Dinamis & ETL Hybrid Database

- **FR-01 (Input Survei Lapangan Fleksibel — MongoDB):** Sistem harus menyediakan antarmuka formulir dinamis yang memungkinkan peneliti menambahkan atribut/kolom kustom secara bebas di lapangan (misal: kondisi sumur air payau, jumlah konsumsi galon plastik per minggu, jam nyala listrik diesel, potensi kebun pala) dan menyimpannya sebagai dokumen JSON ke koleksi `raw_surveys` di **MongoDB**.
- **FR-02 (Pengelompokan & Transformasi Data — ETL ke PostgreSQL):** Sistem harus menyediakan fitur di halaman Admin untuk memfilter dokumen survei di MongoDB berdasarkan kategori masalah (`AIR_BERSIH`, `ENERGI`, `SAMPAH`, `EKONOMI_KOPERASI`, `PARIWISATA`, `CAGAR_BUDAYA`), memvalidasi isinya, dan mengeksekusi perintah migrasi otomatis ke tabel relasional **PostgreSQL** serta tabel spasial **PostGIS**.

### 6.2 Modul Layanan Warga Berbasis NIK & Keamanan Kriptografi

- **FR-03 (Registrasi & Enkripsi NIK Warga):** Sistem harus mampu menyimpan data kependudukan dasar warga desa (NIK 16 digit, Nama Lengkap, RT/RW, Pekerjaan). Saat disimpan ke PostgreSQL, NIK wajib diproses menjadi dua kolom:

1. `nik_blind_index`: Hasil _hashing_ satu arah menggunakan **HMAC-SHA256** (dengan _secret salt_ server) untuk kebutuhan pencarian instan (`SELECT ... WHERE nik_blind_index = ?`).
2. `nik_encrypted`: Hasil enkripsi simetris menggunakan **AES-256-GCM** agar nomor NIK asli tidak pernah tersimpan sebagai teks terbuka (_plain text_).

- **FR-04 (Akses Cepat Warga via 16 Digit NIK):** Pada antarmuka `/portal-warga`, warga cukup mengetikkan 16 digit NIK mereka. Sistem memverifikasi `nik_blind_index` dan langsung menampilkan informasi saldo tabungan Koperasi Hatta, jumlah tabungan sampah plastik, sisa kuota air bersih (liter), serta menu pembuatan surat desa.
- **FR-05 (Generator Surat Desa Otomatis):** Sistem harus dapat menggabungkan data warga yang telah didekripsi dengan _template_ dokumen desa (Surat Keterangan Usaha, Surat Pengantar, Surat Keterangan Domisili) dan menghasilkan dokumen **PDF** siap cetak dalam satu klik.

### 6.3 Modul Koperasi Hatta, Bank Sampah Plastik, & Python Blockchain Node

- **FR-06 (Kasir Setoran Ganda: Komoditas & Bank Sampah):** Pada halaman `/operator/kasir-timbangan`, operator Koperasi Hatta dapat memasukkan **NIK Warga**, memilih jenis transaksi:
- **Setoran Hasil Bumi/Laut:** Pala Biji, Fuli (Bunga Pala), Cengkeh, Ikan Tuna/Segar, atau Produk Olahan.

- **Setoran Bank Sampah:** Botol Plastik Bekas Air Kemasan, Jeriken/Galon Rusak, Kardus.

- **FR-07 (Integrasi Berat Timbangan IoT & Konversi Nilai):** Sistem dapat mengambil data berat (dalam satuan Kilogram) secara otomatis dari mikrokontroler **Timbangan IoT (ESP32 + Load Cell)** melalui API maupun input manual, lalu mengalikan berat tersebut dengan harga satuan komoditas/poin sampah untuk langsung ditambahkan ke **Saldo Koperasi Hatta** atau **Kuota Air Bersih** warga bersangkutan.
- **FR-08 (Pencatatan Buku Besar ke Python Blockchain Node):** Setiap transaksi setoran komoditas di Koperasi Hatta wajib memicu fungsi internal `NodeBlockchainKoperasi.buat_blok()` di FastAPI. Fungsi ini membuat blok data yang berisi:
- `indeks_blok`, `waktu_blok`, `id_transaksi`, `hash_nik_petani`, `jenis_komoditas`, `berat_kg`, `zona_asal`, `hash_sebelumnya`, dan `hash_saat_ini` (dihasilkan dengan algoritma **SHA-256**).

- **FR-09 (Verifikasi Integritas Rantai Blok):** Sistem menyediakan endpoint `/api/v1/blockchain/verifikasi` yang melakukan iterasi perhitungan ulang _hash_ dari _Genesis Block_ (Blok 0) hingga blok terakhir untuk memastikan tidak ada satu pun angka transaksi koperasi atau data petani yang dimanipulasi di dalam database.
- **FR-10 (QR-Code Digital Passport — Branding Model Koperasi Arla):** Untuk setiap _batch_ produk kemasan Koperasi Hatta yang siap dipasarkan, sistem men-generate **QR Code unik**. Ketika wisatawan memindai QR Code tersebut, halaman `/verifikasi-rantai/:id_batch` akan menampilkan jejak _hash_ blockchain, nama kelompok tani/nelayan pemanen, tanggal panen, peta lokasi kebun di Leaflet, dan narasi kualitas produk.

### 6.4 Modul Smart Tourism, Sewa Vila/Homestay, & Katalog Budaya

- **FR-11 (Katalog & Pencarian Akomodasi Vila/Hotel):** Wisatawan dapat mencari dan memfilter penginapan (Vila, Homestay, Guest House, Hotel) berdasarkan lokasi pulau, harga per malam, kapasitas tamu, dan **Indikator Keberlanjutan (_Eco-Stay Badge_)** yang menandakan penginapan tersebut memiliki pasokan air tawar bersih (RO) dan cadangan listrik surya.
- **FR-12 (Sistem Pemesanan / Booking Vila Terintegrasi):** Wisatawan dapat memilih tanggal _Check-In_ dan _Check-Out_ serta mengisi formulir pemesanan. Sistem menyimpan pesanan ke tabel `bookings` di PostgreSQL dan secara otomatis men-generate tautan konfirmasi pesanan langsung ke **WhatsApp pemilik vila / Admin Pokdarwis** beserta kode pesanan unik.
- **FR-13 (Katalog Jelajah Sejarah & Scan QR Destinasi):** Sistem menyediakan halaman detail untuk destinasi wisata dan cagar budaya yang memuat artikel sejarah tervalidasi, galeri foto/360, serta pemutar suara (_Audio Guide_ MP3) yang langsung terbuka ketika wisatawan memindai plang QR Code di lokasi wisata.

- **FR-14 (Etalase Pre-Order Oleh-Oleh Koperasi Hatta):** Wisatawan dapat memesan produk olahan Koperasi Hatta melalui website dan memilih opsi pengantaran langsung ke vila/homestay tempat mereka menginap di Banda Neira.

### 6.5 Modul Pemantauan Hardware IoT (Air Bersih Konsumsi & Energi)

- **FR-15 (API Telemetri Kualitas Air Bersih — BWRO/SWRO):** Sistem menyediakan endpoint penerima data dari mikrokontroler **ESP32** pada instalasi penjernihan air desa yang mencatat:

1. Nilai **TDS (_Total Dissolved Solids_)** air baku (air payau/laut) dan air hasil filtrasi (dalam satuan _ppm_) untuk menjamin air layak minum/masak (< 100–150 ppm).
2. Persentase ketinggian volume air bersih di dalam tandon utama (menggunakan sensor ultrasonik tahan air).
3. Total liter air bersih yang telah didistribusikan ke warga (menggunakan _Water Flow Sensor_).

- **FR-16 (API Telemetri Energi Surya vs Diesel):** Sistem menerima dan menampilkan data tegangan (Volt), arus (Ampere), dan daya (Watt) dari **Panel Surya (PLTS Pompa Air / _Gravity Battery_)** serta status ketersediaan listrik jaringan utama (**PLTD Diesel**), guna menghitung penghematan konsumsi BBM solar desa.

- **FR-17 (Kontrol Otomatis & Peringatan Dini Filter Air):** Apabila sensor TDS membaca kenaikan kadar garam/partikel melebihi ambang batas aman konsumsi, sistem menampilkan status peringatan merah pada dashboard dan mengirimkan respons balik (_payload command_) ke ESP32 untuk menutup keran distribusi elektrik (_Solenoid Valve_) hingga filter dicuci (_backwash_).

### 6.6 Modul Decision Support System (DSS — Metode SAW Dual-Mode)

Mesin algoritma **SAW (_Simple Additive Weighting_)** di backend FastAPI wajib melakukan normalisasi matriks keputusan ($r_{ij}$) untuk kriteria keuntungan (_Benefit_) dan biaya (_Cost_), lalu menghitung nilai preferensi akhir ($V_i = \sum w_j \cdot r_{ij}$) pada **2 Skenario Penggunaan**:

$$r_{ij} = \begin{cases} \dfrac{x_{ij}}{\max_i x_{ij}} & \text{jika } j \text{ adalah atribut keuntungan (Benefit)} \\ \dfrac{\min_i x_{ij}}{x_{ij}} & \text{jika } j \text{ adalah atribut biaya (Cost)} \end{cases}$$

- **FR-18 (DSS Mode 1 — Rekomendasi Wisata & Vila bagi Wisatawan):** Wisatawan mengatur bobot kepentingan pada 4 kriteria: Harga Sewa/Tiket (_Cost_), Jarak dari Dermaga Utama (_Cost_), Skor Fasilitas & Ketersediaan Air Bersih (_Benefit_), serta Daya Tarik Sejarah/Alam (_Benefit_). Sistem menghasilkan urutan rekomendasi penginapan dan destinasi wisata paling optimal.

- **FR-19 (DSS Mode 2 — Prioritas Intervensi Infrastruktur Air & Energi Desa):** Admin/Pemerintah Desa menjalankan simulasi SAW untuk menentukan wilayah RT/Dusun mana yang paling mendesak menerima bantuan pembangunan tandon air bersih RO dan panel surya berdasarkan 4 kriteria: Tingkat Kadar Garam/TDS Sumur Warga (_Benefit/Urgency_), Jumlah Penduduk Terdampak (_Benefit_), Jarak ke Sumber Air Tawar Terdekat (_Benefit_), dan Durasi Pemadaman Listrik Diesel (_Benefit_).

---

## BAB VII: KEBUTUHAN NON-FUNGSIONAL (NON-FUNCTIONAL REQUIREMENTS — NFR)

| Kode NFR   | Kategori                                    | Spesifikasi Teknis yang Dikunci                                                                                                                                                                                                                                                                                                        |
| ---------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **NFR-01** | **Offline-First & Sinkronisasi Edge-Cloud** | Sistem wajib tetap berfungsi secara lokal di jaringan Wi-Fi/LAN kantor desa & Koperasi Hatta saat internet Banda Neira padam. Modul _Background Sync_ di FastAPI lokal akan mengirim pembaruan data (transaksi koperasi, blok _hash_ baru, dan status tandon air) ke _Cloud VPS_ secara otomatis saat koneksi internet kembali stabil. |

|
| **NFR-02** | **Keamanan Data Pribadi & Kepatuhan Regulasi** | Mengikuti standar **OWASP Top 10** dan prinsip pelindungan data pribadi: (1) NIK wajib dienkripsi **AES-256**, (2) Password di-hash menggunakan **Bcrypt**, (3) Seluruh input divalidasi ketat dengan skema **Pydantic** untuk mencegah _SQL/NoSQL Injection_, dan (4) Pembatasan jumlah _request_ (_Rate Limiting_) diterapkan pada endpoint pencarian NIK untuk mencegah serangan _Brute-Force_ 16 digit NIK.

|
| **NFR-03** | **Kompatibilitas Perangkat & Keringanan Sistem** | Antarmuka web wajib bersifat _Mobile-Responsive_ (nyaman diakses di layar HP wisatawan dan warga) sekaligus memiliki _Fullscreen Kiosk Layout_ untuk layar sentuh 15 inci di kantor desa. Seluruh kontainer Docker di _Edge Server_ tidak boleh menggunakan memori RAM lebih dari **3.5 GB**.

|
| **NFR-04** | **Standarisasi Pertukaran Data Spasial** | Seluruh _output_ koordinat dari backend ke peta **Leaflet.js** wajib mematuhi spesifikasi **GeoJSON (RFC 7946)** dengan sistem referensi koordinat **WGS 84 (EPSG:4326)** dan waktu respons API di bawah **800 milidetik**.

|

---

## BAB VIII: DATA FLOW DIAGRAM (DFD)

### 8.1 DFD Level 0 (Diagram Konteks)

```text
                       +---------------------------------------------+
                       |      UNIT PERANGKAT KERAS IoT (ESP32)       |
                       | (Sensor TDS Air, Surya/Diesel, & Timbangan) |
                       +----------------------+----------------------+
                                              |
                         Data Telemetri JSON  |  Sinyal Kontrol Relay
                         (TDS, Volt, Kg)      |  (Buka/Tutup Keran Air)
                                              v
+-----------------+     Pencarian Wisata,     +-------------------------------------+     Input Survei Dinamis     +--------------------+
|                 |     Booking Vila & Order  |                                     |     & Parameter Bobot SAW    |                    |
|    WISATAWAN    | ------------------------> |    0. PLATFORM TERPADU BST-NIRANA   | <--------------------------- |   SUPER ADMIN /    |
|  (ACT-01: Turis)|                           |                                     |                              |   TIM PENELITI     |
|                 | <------------------------ |   (Smart Tourism, Koperasi Hatta,   | ---------------------------> |  (ACT-05: KKN/Desa)|
+-----------------+     Peta GeoJSON Leaflet, |    Layanan NIK, GIS, & DSS SAW)     |     Peta Krisis, Ranking SAW |                    |
                        Ranking SAW, Bukti QR +------------------+------------------+     & Dashboard IoT Air/Surya+--------------------+
                                                       ^                    ^
                                   Input 16 Digit NIK  |                    | Input Transaksi Pala/Sampah,
                                   (Tanpa Birokrasi)   |                    | Update Kamar Vila & Stok UMKM
                                                       v                    v
                                        +--------------------+        +---------------------------+
                                        |    WARGA LOKAL     |        | OPERATOR KOPERASI HATTA & |
                                        | (ACT-02: Cek Saldo,|        | MITRA VILA / UMKM         |
                                        |  Air & PDF Surat)  |        | (ACT-03 & ACT-04)         |
                                        +--------------------+        +---------------------------+

```

---

### 8.2 DFD Level 1 (Arsitektur Aliran Data Internal Sistem)

```text
[ACT-05: TIM PENELITI] ---> (Proses 1.0: Akuisisi Survei Dinamis) ---> || D1: MongoDB (raw_surveys & iot_streams) ||
                                    ^                                                        |
                                    | Stream Data Sensor (TDS, Daya, Berat)                  | Dokumen JSON Mentah
                            [HARDWARE IoT ESP32]                                             v
                                                                       (Proses 2.0: Mesin ETL, Validasi & Kategorisasi)
                                                                                             |
                             +---------------------------------------------------------------+----------------------------------+
                             | Data Relasional Bersih                                                                           | Data Koordinat Spasial
                             v                                                                                                  v
              || D2: PostgreSQL (Citizens, Koperasi, Vila) ||                                                    || D3: PostGIS (Spatial Geometry) ||
                     ^                               ^                                                                          |
                     | Enkripsi AES-256              | Simpan Transaksi & Rantai Blok SHA-256                                   | Konversi ke GeoJSON
                     v                               v                                                                          v
[ACT-02: WARGA] <-> (Proses 3.0: Layanan Mandiri  ) (Proses 4.0: Kasir Koperasi Hatta, ) <-> [ACT-04: OPERATOR]  (Proses 5.0: Engine Peta Leaflet ) <-> [ACT-01: WISATAWAN]
                    (NIK & Cetak PDF Surat Desa   ) (Bank Sampah & Node Blockchain     )                         (GeoJSON, Booking Vila & DSS SAW ) <-> [ACT-03: MITRA VILA]

```

---

## BAB IX: ENTITY RELATIONSHIP DIAGRAM (ERD) & SKEMA DATABASE

### 9.1 Skema Koleksi MongoDB (Database Tahap 1: Penampungan Dinamis & Log IoT)

```javascript
// 1. Collection: raw_surveys (Menyimpan pemetaan masalah awal dari lapangan sebelum dikelompokkan)
{
  "_id": ObjectId("671ca100a1b2c3d4e5f60001"),
  "surveyor_name": "Reyhan Albar",
  "survey_date": ISODate("2026-10-26T08:30:00Z"),
  "island_name": "Pulau Lonthoir (Banda Besar)",
  "rt_rw": "RT 03 / RW 01",
  "problem_domain": "AIR_DAN_SAMPAH", // Enum: AIR_DAN_SAMPAH | ENERGI | EKONOMI | WISATA | BUDAYA
  "gps_point": { "lat": -4.541200, "lng": 129.901100 },
  "flexible_attributes": {
    "sumber_air_utama": "Tadah hujan dan sumur payau",
    "kadar_tds_sumur_ppm": 2650,
    "pengeluaran_beli_air_per_bulan_rp": 300000,
    "timbulan_sampah_botol_plastik_kg": 4.5,
    "catatan_warga": "Saat kemarau warga terpaksa beli air galon dari pulau seberang"
  },
  "etl_status": "MIGRATED_TO_POSTGRES" // PENDING | MIGRATED_TO_POSTGRES
}

// 2. Collection: iot_telemetry_logs (Menyimpan tembakan sensor ESP32 secara real-time)
{
  "_id": ObjectId("671ca200a1b2c3d4e5f60002"),
  "station_code": "RO-SOLAR-STATION-01",
  "timestamp": ISODate("2026-10-26T13:15:00Z"),
  "water_metrics": {
    "raw_water_tds_ppm": 2400.0,
    "filtered_water_tds_ppm": 58.5, // < 100 ppm = Aman dikonsumsi/diminum
    "clean_tank_level_pct": 88.0,
    "daily_dispensed_liters": 420.5,
    "valve_status": "OPEN"
  },
  "energy_metrics": {
    "active_source": "SOLAR_DIRECT_GRAVITY", // SOLAR_DIRECT_GRAVITY | DIESEL_GRID
    "solar_panel_voltage_v": 26.4,
    "solar_current_a": 8.2,
    "power_watt": 216.48
  }
}

// 3. Collection: heritage_contents (Menyimpan artikel panjang, narasi sejarah & multimedia wisata)
{
  "_id": ObjectId("671ca300a1b2c3d4e5f60003"),
  "spatial_feature_id": "uuid-benteng-belgica", // Berelasi dengan tabel PostGIS
  "slug": "benteng-belgica-neira",
  "title": "Benteng Belgica",
  "historical_narrative": "Benteng abad ke-17 peninggalan VOC di atas bukit Pulau Neira...",
  "audio_guide_mp3_url": "/static/audio/belgica_id.mp3",
  "panorama_360_url": "/static/panoramas/belgica_360.jpg",
  "photos": ["/static/img/belgica_1.jpg", "/static/img/belgica_2.jpg"]
}

```

---

### 9.2 Diagram Relasi Tabel PostgreSQL + PostGIS (Database Tahap 2: Terstruktur & Spasial)

```text
+------------------------------------+         1 : N         +--------------------------------------+
|              CITIZENS              |---------------------->|          COOP_TRANSACTIONS           |
+------------------------------------+                       +--------------------------------------+
| PK | id (UUID)                     |                       | PK | id (UUID)                       |
| UK | nik_blind_index (VARCHAR 64)  |                       | FK | citizen_id (UUID)               |
|    | nik_encrypted (BYTEA/TEXT)    |                       |    | category (KOMODITAS / SAMPAH /  |
|    | full_name (VARCHAR 150)       |                       |    |           TEBUS_AIR_BERSIH)     |
|    | island_zone (VARCHAR 50)      |                       |    | item_name (PALA/IKAN/PLASTIK)   |
|    | rt_rw (VARCHAR 20)            |                       |    | weight_kg_or_liter (NUMERIC)    |
|    | coop_balance_rp (NUMERIC)     |                       |    | monetary_value_rp (NUMERIC)     |
|    | plastic_points (INT)          |                       |    | water_quota_earned_ltr (NUMERIC)|
|    | clean_water_quota_ltr (FLOAT) |                       |    | created_at (TIMESTAMPTZ)        |
+-----------------+------------------+                       +-------------------+------------------+
                  |                                                              |
                  | 1 : N (Kepemilikan Vila/UMKM)                                | 1 : 1 (Dikunci ke Blok)
                  v                                                              v
+------------------------------------+                       +--------------------------------------+
|           ACCOMMODATIONS           |                       |          BLOCKCHAIN_LEDGER           |
+------------------------------------+                       +--------------------------------------+
| PK | id (UUID)                     |                       | PK | block_index (SERIAL)            |
| FK | owner_citizen_id (UUID)       |                       | FK | transaction_id (UUID)           |
| FK | spatial_feature_id (UUID)     |                       | UK | product_batch_qr (VARCHAR 50)   |
|    | name (VARCHAR 150)            |                       |    | block_timestamp (TIMESTAMPTZ)   |
|    | type (VILA/HOMESTAY/HOTEL)    |                       |    | payload_data (JSONB)            |
|    | price_per_night_rp (NUMERIC)  |                       |    | previous_hash (CHAR 64)         |
|    | rooms_available (INT)         |                       |    | current_hash (CHAR 64)          |
|    | has_clean_ro_water (BOOLEAN)  |                       |    | validator_signature (VARCHAR)   |
|    | has_solar_backup (BOOLEAN)    |                       +--------------------------------------+
|    | contact_whatsapp (VARCHAR 20) |
+-----------------+------------------+                       +--------------------------------------+
                  | 1 : N                                    |      SPATIAL_FEATURES (PostGIS)      |
                  v                                          +--------------------------------------+
+------------------------------------+                       | PK | id (UUID)                       |
|              BOOKINGS              |                       |    | name (VARCHAR 150)              |
+------------------------------------+                       |    | layer_type (ENUM 7 LAYERS)      |
| PK | id (UUID)                     |                       |    | island_name (VARCHAR 50)        |
| UK | booking_code (VARCHAR 20)     |                       |    | geom (GEOMETRY(Geometry, 4326)) |
| FK | accommodation_id (UUID)       |                       |    | properties_meta (JSONB)         |
|    | guest_name (VARCHAR 150)      |                       |    | updated_at (TIMESTAMPTZ)        |
|    | guest_whatsapp (VARCHAR 20)   |                       +-------------------+------------------+
|    | check_in (DATE)               |                                           |
|    | check_out (DATE)              |                                           | 1 : N
|    | total_price_rp (NUMERIC)      |                                           v
|    |coop_souvenir_bundle (JSONB)   |                       +--------------------------------------+
|    | status (PENDING/CONFIRMED)    |                       |           DSS_SAW_MATRICES           |
+------------------------------------+                       +--------------------------------------+
                                                             | PK | id (UUID)                       |
                                                             | FK | spatial_feature_id (UUID)       |
                                                             |    | dss_mode (TOURISM / INFRA_CRISIS|
                                                             |    | c1_raw, c2_raw, c3_raw, c4_raw  |
                                                             |    | normalized_score (FLOAT)        |
                                                             |    | preference_rank (INT)           |
                                                             +--------------------------------------+

```

---

## BAB X: SPESIFIKASI SISTEM PETA INTERAKTIF (LEAFLET.JS & GEOJSON)

Sistem Informasi Geografis (GIS) pada platform ini menggunakan **Leaflet.js** di sisi Frontend dan **PostGIS** di sisi Backend dengan format pertukaran data murni **GeoJSON**.

### 10.1 Definisi 7 Layer Spasial (`layer_type`)

Peta memiliki panel kontrol filter (_Layer Switcher_) yang membagi objek ke dalam 2 kelompok:

**A. Kelompok Layer Publik (Tampil di Portal Smart Tourism):**

1. `LAYER_TOURISM_4A`: Titik daya tarik wisata bahari (_diving/snorkeling_), wisata alam, kuliner, dan fasilitas umum.

2. `LAYER_HERITAGE`: Titik 177 bangunan cagar budaya, benteng VOC, dan rumah pengasingan tokoh sejarah (terhubung ke koleksi `heritage_contents` untuk memutar _Audio Guide_).

3. `LAYER_ACCOMMODATION`: Titik lokasi Vila, Homestay, dan Hotel (terhubung langsung ke form _Booking_ dan menampilkan lencana ketersediaan air bersih RO & listrik surya).
4. `LAYER_KOPERASI_UMKM`: Titik pusat Koperasi Hatta, toko suvenir UMKM, dan 30 poligon/titik perkebunan pala aktif (terhubung ke sertifikat _Blockchain Traceability_).

5. `LAYER_PUBLIC_SAFETY`: Titik dermaga kapal, rute penyeberangan antar pulau, titik rawan ombak (_blind spot_), serta lokasi Puskesmas/RSUD.

**B. Kelompok Layer Resiliensi Pulau (Tampil di Portal Admin & Pengambil Kebijakan):** 6. `LAYER_WATER_INFRA`: Titik sumur air payau warga, lokasi instalasi mesin filter air minum RO/Distilasi, tandon komunal, dan zona merah krisis air bersih (menampilkan indikator angka _Live TDS_ dari sensor ESP32). 7. `LAYER_ENERGY_WASTE`: Titik pembangkit listrik Diesel (PLTD), titik instalasi Panel Surya (PLTS), lokasi Bank Sampah Koperasi Hatta, dan titik timbulan sampah pesisir.

### 10.2 Query PostGIS untuk Menghasilkan GeoJSON Standar di FastAPI

Untuk memastikan performa tinggi (NFR-04), konversi data tabel menjadi **GeoJSON** dilakukan langsung di level database PostgreSQL/PostGIS menggunakan fungsi `ST_AsGeoJSON`:

```sql
SELECT jsonb_build_object(
    'type',     'FeatureCollection',
    'features', COALESCE(jsonb_agg(features.feature), '[]'::jsonb)
)
FROM (
  SELECT jsonb_build_object(
    'type',       'Feature',
    'id',         s.id,
    'geometry',   ST_AsGeoJSON(s.geom)::jsonb,
    'properties', jsonb_build_object(
        'name', s.name,
        'layer_type', s.layer_type,
        'island_name', s.island_name,
        'saw_score', d.normalized_score,
        'saw_rank', d.preference_rank
    ) || s.properties_meta
  ) AS feature
  FROM spatial_features s
  LEFT JOIN dss_saw_matrices d ON s.id = d.spatial_feature_id
  WHERE s.layer_type = ANY(:requested_layers)
) features;

```

### 10.3 Struktur JSON Standar yang Diterima oleh Komponen React Leaflet

Output dari kueri di atas langsung dirender oleh komponen `<GeoJSON data="{geojsonData}"/>` pada `react-leaflet`:

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "id": "a1b2c3d4-0001-4000-8000-000000000001",
      "geometry": {
        "type": "Point",
        "coordinates": [129.898521, -4.52611]
      },
      "properties": {
        "name": "Delfika Homestay & Heritage Villa",
        "layer_type": "LAYER_ACCOMMODATION",
        "island_name": "Pulau Neira",
        "price_per_night_rp": 350000,
        "has_clean_ro_water": true,
        "has_solar_backup": true,
        "saw_score": 0.945,
        "saw_rank": 1,
        "tautan_pemesanan": "/penginapan/inap-001"
      }
    },
    {
      "type": "Feature",
      "id": "a1b2c3d4-0002-4000-8000-000000000002",
      "geometry": {
        "type": "Point",
        "coordinates": [129.904215, -4.538912]
      },
      "properties": {
        "name": "Stasiun Air Minum RO & Bank Sampah Koperasi Hatta #1",
        "layer_type": "LAYER_WATER_INFRA",
        "island_name": "Pulau Lonthoir",
        "water_source": "Filtrasi Air Payau (BWRO) Tenaga Surya",
        "live_tds_ppm": 58.5,
        "water_quality_status": "LAYAK KONSUMSI (MINUM & DAPUR)",
        "tank_level_pct": 88.0,
        "saw_score": 0.98,
        "saw_rank": 1
      }
    }
  ]
}
```

---

## BAB XI: DAFTAR ENDPOINT API INTI (FASTAPI SPECIFICATION — BAHASA INDONESIA)

Berikut adalah kontrak _endpoint_ REST API berbahasa Indonesia yang menjadi jembatan kerja antara tim Backend (Hidayah, Anam, Fauzan) dan tim Frontend/Security (Syahid, Reyhan):

| Method | URI Endpoint | Deskripsi Fungsi | Database Target | PIC |
| ------ | ------------------------------------ | --------------------------------------------------------------------------------------------------------- | ---------------------- | ---------------- |
| `POST` | `/api/v1/survei/mentah`              | Menyimpan form dinamis pemetaan masalah lapangan.                                                         | MongoDB                | Hidayah & Reyhan |
| `POST` | `/api/v1/survei/migrasi-etl`         | Mengelompokkan data MongoDB & memindahkannya ke tabel PostgreSQL/PostGIS.                                 | Mongo $\rightarrow$ PG | Fauzan & Hidayah |
| `POST` | `/api/v1/warga/cari-nik`             | Mencari profil warga, saldo koperasi, & kuota air via 16 digit NIK (_HMAC Blind Index_).                  | PostgreSQL             | Syahid & Hidayah |
| `GET`  | `/api/v1/warga/{id_warga}/surat-pdf` | Men-generate file PDF surat pengantar desa otomatis dari profil NIK terdekripsi.                          | PostgreSQL             | Syahid & Hidayah |
| `POST` | `/api/v1/koperasi/transaksi`         | Mencatat setoran pala/ikan atau sampah plastik, memperbarui saldo NIK, & membuat blok _hash_ baru.        | PostgreSQL             | Anam & Fauzan    |
| `POST` | `/api/v1/koperasi/tebus-air`         | Memotong kuota air bersih NIK warga & memicu pembukaan _Solenoid Valve_ ESP32.                            | PostgreSQL & IoT       | Anam & Hidayah   |
| `GET`  | `/api/v1/blockchain/lacak/{kode_qr}` | Mengambil sertifikat keaslian produk Koperasi Hatta & memvalidasi rantai _hash_ SHA-256.                  | PostgreSQL             | Anam             |
| `GET`  | `/api/v1/blockchain/verifikasi`      | Memverifikasi ulang keutuhan seluruh rantai blok dari _Genesis Block_ hingga blok terakhir.               | PostgreSQL             | Anam             |
| `GET`  | `/api/v1/peta/geojson`               | Mengambil _FeatureCollection_ GeoJSON berdasarkan filter _layer_ untuk dirender di Leaflet.js.            | PostGIS                | Fauzan           |
| `GET`  | `/api/v1/peta/cagar-budaya/{slug}`   | Mengambil narasi sejarah, foto 360, & _Audio Guide_ destinasi cagar budaya.                               | MongoDB & PostGIS      | Reyhan & Fauzan  |
| `POST` | `/api/v1/dss/hitung-saw`             | Menghitung perankingan metode SAW (Mode 1: Rekomendasi Wisata/Vila, Mode 2: Prioritas Krisis Air/Energi). | PostgreSQL             | Hidayah          |
| `GET`  | `/api/v1/penginapan` & `POST /api/v1/pemesanan` | Menampilkan daftar vila/homestay & menyimpan transaksi _booking_ wisatawan (+ _trigger_ WA).   | PostgreSQL             | Fauzan & Syahid  |
| `POST` | `/api/v1/iot/telemetri`              | Menerima data sensor ESP32 (TDS Air, Level Tandon, Daya Surya/Diesel, Berat Timbangan).                   | MongoDB & PG           | Anam & Hidayah   |
| `GET`  | `/api/v1/audit-keamanan`             | Menampilkan audit keamanan sistem, status kriptografi AES-256/HMAC, & integritas rantai blok.             | PostgreSQL             | Syahid & Hidayah |

---

## BAB XII: STRUKTUR DIREKTORI REPOSITORY (MONOREPO BAHASA INDONESIA)

Untuk memudahkan pengembang membaca kode, folder, dan _route_, struktur subdirektori di dalam `backend/app/` dan `frontend/src/` menggunakan **Bahasa Indonesia** (dengan tetap mempertahankan konvensi bawaan _framework_ pada root):

```text
banda-neira/
├── docker-compose.yml                  # Orkestrasi kontainer (FastAPI, React, PostgreSQL/PostGIS, MongoDB)
├── .env.example                        # Variabel lingkungan (Kunci AES-256, Garam HMAC, Kredensial DB)
│
├── backend/                            # Layanan Backend Python FastAPI
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py                     # Entry point FastAPI & konfigurasi CORS
│       ├── inti/
│       │   ├── konfigurasi.py          # Pengaturan koneksi PostgreSQL & MongoDB
│       │   ├── keamanan.py             # Modul AES-256 NIK Encryption, HMAC Blind Index, & JWT (Syahid)
│       │   └── basis_data.py           # Manajemen Basis Data Hibrida & Data Awal Kepulauan Banda
│       ├── mesin/
│       │   ├── node_blockchain.py      # Custom Python SHA-256 Blockchain Ledger Engine (Anam)
│       │   ├── mesin_saw_dss.py        # Mesin Matriks Simple Additive Weighting / SAW (Hidayah)
│       │   ├── pipa_etl.py             # Worker migrasi data MongoDB ke PostgreSQL/PostGIS (Fauzan)
│       │   └── generator_surat.py      # Generator PDF Surat Keterangan Desa Otomatis (Syahid & Hidayah)
│       ├── model/
│       │   └── model_data.py           # Model Tabel SQLAlchemy & GeoAlchemy2 (PostGIS)
│       ├── skema/
│       │   └── skema_api.py            # Skema Validasi Pydantic v2 & Format GeoJSON
│       └── rute/                       # Endpoint API Bahasa Indonesia (survei, warga, koperasi, peta_gis, dss, penginapan, iot)
│
├── frontend/                           # Layanan Frontend React.js (Vite + Tailwind + Leaflet)
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.js                  # Konfigurasi Vite & PWA
│   └── src/
│       ├── komponen/
│       │   ├── tata-letak/NavigasiUtama.jsx      # Navigasi Lintas 4 Zona
│       │   ├── peta/PetaGeoJsonLeaflet.jsx       # Komponen Utama Peta Interaktif 7 Layer (Fauzan)
│       │   ├── kios/ModalPapanKetikNik.jsx       # Komponen Input Cepat 16 Digit NIK Warga (Syahid)
│       │   └── lacak/PasporProduk.jsx            # Tampilan Sertifikat Blockchain ala Arla (Anam & Reyhan)
│       ├── halaman/
│       │   ├── publik/                 # Halaman Smart Tourism, Sewa Vila, Cagar Budaya, & Perencana SAW
│       │   ├── warga/                  # Halaman Kiosk Layanan Mandiri Warga Desa (/portal-warga)
│       │   ├── mitra-operator/         # Halaman Kasir Timbangan IoT, Dispenser Air RO, & Dasbor Mitra Vila
│       │   └── admin/                  # Halaman Form Survei MongoDB, Manajer ETL, Komando IoT, & Audit
│       └── layanan/
│           ├── api.js                  # Instance Axios & Kontrak Endpoint Bahasa Indonesia
│           └── sinkronisasiLuring.js   # Penyimpanan lokal IndexedDB saat sinyal terputus
│
└── firmware_iot/                       # Kode Mikrokontroler Hardware Lapangan (C++ / PlatformIO)
    ├── stasiun_air_energi_esp32/       # Firmware Sensor TDS Air, Ultrasonik Tandon, Solenoid & Surya
    └── timbangan_cerdas_koperasi_esp32/# Firmware Timbangan Load Cell HX711 Koperasi Hatta & Bank Sampah
```

---

Dokumen ini telah mencakup seluruh komponen arsitektur, alur data, struktur basis data ganda, spesifikasi peta **Leaflet.js + GeoJSON**, hingga pembagian kerja yang tidak lagi tumpang tindih. Kalian dapat langsung menjadikan dokumen ini sebagai **Lampiran Teknis Utama** baik untuk laporan ke **Pak Restiadi Bayu Taruno**, **Tim Akademik LabSos**, maupun **Prof. Purwo**.
