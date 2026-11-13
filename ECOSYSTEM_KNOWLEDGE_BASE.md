# Banda Digital Ecosystem (BST-NIRANA) - Comprehensive Knowledge Base & AI Agent Context

> **Dokumen Panduan Induk & Basis Pengetahuan Ekosistem Digital Banda Neira**  
> *Dibuat sebagai referensi terpadu agar agen AI berikutnya dapat langsung memahami seluruh konteks, arsitektur, basis data, keamanan, smart contract, frontend, backend, dan alur operasional proyek ini secara menyeluruh.*

---

## 📌 Daftar Isi
1. [Identitas & Visi Ekosistem](#1-identitas--visi-ekosistem)
2. [Prinsip Wajib AI Agent (AGENTS.md Compliance)](#2-prinsip-wajib-ai-agent-agentsmd-compliance)
3. [Tech Stack & Lingkungan Kerja](#3-tech-stack--lingkungan-kerja)
4. [Arsitektur Sistem (Modular Monolith & Decoupled Blockchain)](#4-arsitektur-sistem-modular-monolith--decoupled-blockchain)
5. [Model Peran & RBAC (9 Aktor Ekosistem)](#5-model-peran--rbac-9-aktor-ekosistem)
6. [Daftar Modul Backend (`backend/app/modules/`)](#6-daftar-modul-backend-backendappmodules)
7. [Struktur Skema Database & 12 Migrasi Alembic](#7-struktur-skema-database--12-migrasi-alembic)
8. [Arsitektur Keamanan & Kriptografi (OWASP Top 10)](#8-arsitektur-keamanan--kriptografi-owasp-top-10)
9. [Smart Contract & Ketertelusuran Rantai Pasok](#9-smart-contract--ketertelusuran-rantai-pasok)
10. [Frontend Workspaces, Komponen & Desain Neo-Obsidian](#10-frontend-workspaces-komponen--desain-neo-obsidian)
11. [Ketahanan Offline (PWA, IndexedDB & Service Worker)](#11-ketahanan-offline-pwa-indexeddb--service-worker)
12. [Perintah Pengujian & Verifikasi Mutu](#12-perintah-pengujian--verifikasi-mutu)
13. [Peta Berkas Penting (Directory Map)](#13-peta-berkas-penting-directory-map)
14. [Format Laporan Standar AI](#14-format-laporan-standar-ai)

---

## 1. Identitas & Visi Ekosistem

- **Nama Platform:** Banda Digital Ecosystem (BST-NIRANA / Banda Satu Pintu Neira)
- **Lokasi Pilot:** Kepulauan Banda Neira, Kabupaten Maluku Tengah, Maluku (Pulau Neira, Banda Besar/Lonthoir & Selamon, Pulau Hatta, Pulau Ay, Pulau Rhun, Gunung Api Banda).
- **Koordinat Sentral:** `4°31′S 129°54′E`
- **Fokus Utama:**
  1. *Pariwisata & Budaya Cerdas (Smart Tourism):* Pemetaan 7-Layer GIS, katalog penginapan Eco-Stay dengan reservasi langsung via WhatsApp, katalog 177 Cagar Budaya & streaming audio guide, direktori pemandu wisata HPI, marketplace terverifikasi on-chain, serta DSS SAW Mode 1 (Rekomendasi Wisata).
  2. *Layanan Warga & Koperasi Hatta:* Administrasi kependudukan desa, penerbitan surat resmi berkop Pemkab Maluku Tengah (SKU Rempah/Nelayan, Domisili), Koperasi Hatta & Bank Sampah Sirkular Prof. Purwo (1 kg sampah plastik $\rightarrow$ 10 Liter air minum RO + 10 Poin), serta dispenser air RO mandiri.
  3. *Telemetri IoT & Resiliensi Pulau 3T:* Monitoring sensor 4 stasiun pulau untuk kualitas air minum (sensor TDS ppm) sesuai standar WHO, level tandon komunal, bauran energi surya PLTS vs diesel PLTD, dan DSS SAW Mode 2 (Prioritas Krisis Desa).
  4. *Riset, Survei & Tata Kelola:* Survei lapangan dinamis berbasis staging NoSQL, pipa migrasi otomatis ETL ke PostGIS, ketertelusuran rantai pasok multi-komoditas (Pala, Fuli, Cengkeh, Cakalang, Tuna), serta pengerasan keamanan data NIK (AES-256-GCM + Blind Index HMAC-SHA256).

---

## 2. Prinsip Wajib AI Agent (AGENTS.md Compliance)

Setiap agen AI yang bekerja di repositori ini **wajib mematuhi aturan berikut tanpa pengecualian**:
1. **BACA SEBELUM CODING (RULE 1):** Selalu baca `AGENTS.md`, `README.md`, dan dokumen terkait sebelum menyentuh kode.
2. **JANGAN MEROMBAK FITUR YANG SUDAH BERJALAN (RULE 2):** Jangan mengubah arsitektur inti tanpa persetujuan, jangan membuat fungsi/modul duplikat, dan jangan menambahkan pustaka eksternal tanpa justifikasi.
3. **KERJA DALAM SCOPED TASKS (RULE 3):** Kerjakan 1 fitur/perbaikan dalam satu waktu, buat perubahan minimal yang efektif, jalankan uji otomatis, dan laporkan dengan format standar.
4. **INTEGRITAS BASIS DATA (RULE 4):** Semua modifikasi skema harus melalui **Alembic migration**. Dilarang mengubah tabel manual di basis data. Pertahankan relasi dan foreign keys. **DILARANG menyimpan PII di blockchain!**
5. **KEAMANAN & PRIVASI (RULE 5):** Validasi seluruh input di backend dengan Pydantic. Jangan mengekspos NIK, nomor telepon, alamat, atau rahasia ke endpoint publik. Gunakan data sintetis saat demonstrasi dan pengujian.
6. **KONSISTENSI FRONTEND (RULE 6):** Gunakan komponen shared, tangani state *loading*, *empty*, *error*, dan *success*. Pertahankan tema Neo-Obsidian Cyber-Emerald.
7. **PENGUJIAN OTOMATIS (RULE 7):** Setiap perubahan wajib disertai unit/integration test. Seluruh pengujian (87+ tests) harus tetap lulus 100%.
8. **STATUS BLOCKCHAIN JUJUR (RULE 8):** Status transaksi blockchain harus secara akurat merefleksikan: `Pending`, `Submitted`, `Confirmed`, atau `Failed`. Jangan tampilkan `Verified` jika belum `Confirmed` di jaringan.
9. **DISIPLIN DOKUMENTASI (RULE 9):** Selalu perbarui `API.md`, `DATABASE.md`, `TASKS.md`, dan `CHANGELOG.md` ketika kontrak API atau skema berubah.
10. **KEJUJURAN MUTLAK (RULE 10):** Jangan pernah mengklaim fitur bekerja atau tes lulus jika belum benar-benar diverifikasi melalui eksekusi nyata.

---

## 3. Tech Stack & Lingkungan Kerja

| Lapisan | Teknologi | Versi / Detail |
|---|---|---|
| **Backend Framework** | FastAPI (Python) | 3.12+ / 3.14 compatible, Asynchronous |
| **Data Validation** | Pydantic v2 | Skema input/output ketat & deserialisasi otomatis |
| **ORM & Migrations** | SQLAlchemy 2.0 (Async) + Alembic | Driver `asyncpg` untuk PostgreSQL |
| **Database** | PostgreSQL 16 + PostGIS 3.4 | Geometri spasial, spherical geodesy, JSONB |
| **Frontend Framework** | React 18 + Vite | TypeScript 5+, Tailwind/Custom Tokens |
| **State & Data Fetching** | TanStack Query (React Query) | Cache invalidation, retry, optimistic updates |
| **Icons & Maps** | Lucide React + Leaflet 1.9 | OpenStreetMap tiles, custom radar pins |
| **Offline Storage** | IndexedDB (library `idb`) + Service Worker | Offline record queue & GeoJSON tile caching |
| **Blockchain** | Solidity 0.8.20 + Web3.py | Local EVM Hardhat/Anvil/Sepolia testnet |
| **Keamanan Kriptografi** | Cryptography (AES-256-GCM), HMAC-SHA256 | Bcrypt untuk password, JWT untuk session |
| **Containerization** | Docker & Docker Compose | Multi-container: API, Web, PostgreSQL, MongoDB |

---

## 4. Arsitektur Sistem (Modular Monolith & Decoupled Blockchain)

Platform dibangun menggunakan pendekatan **Modular Monolith** untuk meminimalkan kompleksitas operasional pada infrastruktur kepulauan:
1. **Satu Backend FastAPI Terpadu:** Seluruh 15 sub-modul berjalan di dalam satu proses backend, terhubung ke satu database relasional PostgreSQL + PostGIS.
2. **Blockchain sebagai Immutable Audit & Integrity Layer:** PostgreSQL bertindak sebagai *source of truth* operasional. Blockchain hanya berfungsi sebagai pencatat bukti integritas (hash) dan sertifikasi riwayat produk yang tidak dapat dimanipulasi. Keterlambatan atau kegagalan jaringan blockchain tidak akan merusak operasi bisnis utama.
3. **Dual-Mode Decision Support System (DSS SAW):**
   - Menggunakan rumus normalisasi matriks $r_{ij} = \frac{x_{ij}}{\max(x_j)}$ untuk Benefit dan $r_{ij} = \frac{\min(x_j)}{x_{ij}}$ untuk Cost, dilanjutkan perankingan $V_i = \sum w_j \cdot r_{ij}$.
   - Dilengkapi proteksi pembagian nol otomatis jika terdapat nilai alternatif 0.

---

## 5. Model Peran & RBAC (9 Aktor Ekosistem)

Sistem mengimplementasikan pengamanan berbasis peran (*Role-Based Access Control*) teruji pada 9 profil pengguna nyata:

| Username Demo | Kata Sandi | Role Code | Deskripsi & Hak Akses Utama | Tab Default |
|---|---|---|---|---|
| `admin` | `Admin123!` | `admin` | Super Administrator: Akses penuh ke seluruh 11 modul, audit global, tata kelola akun & smart contract. | `landing` / Semua |
| `petugas_desa` | `Petugas123!` | `village_officer` | Perangkat Kantor Desa: Verifikasi warga, approval surat dinas, verifikasi lahan kebun, rekapitulasi desa. | `population` |
| `ketua_poktan` | `Poktan123!` | `farmer_group_admin` | Pengurus Kelompok Tani: Pendaftaran petani anggota, proposal plot kebun (pending), pembuatan batch rempah. | `farming` |
| `petani` | `Petani123!` | `farmer` | Petani Rempah Mandiri: Pencatatan panen komoditas, melihat plot kebun terverifikasi, label QR batch. | `farming` |
| `warga` | `Warga123!` | `resident` | Warga Desa: Portal mandiri permohonan surat SKU/Domisili, lookup profil Koperasi & saldo air. | `citizen_portal` |
| `pengelola_koperasi` | `Koperasi123!` | `coop_manager` | Pengelola Koperasi Hatta: Kasir timbangan komoditas, bank sampah botol plastik, penebusan air RO. | `koperasi` |
| `operator_homestay` | `Homestay123!` | `homestay_operator` | Pengelola Penginapan/Eco-Stay: Update tarif kamar/malam, kelola ketersediaan, daftar reservasi tamu. | `tourism` |
| `admin_wisata` | `Wisata123!` | `smart_tourism_admin` | Dinas Wisata & Pemandu Budaya: Kurasi 177 Cagar Budaya & audio guide, verifikasi lisensi pemandu HPI. | `tourism` |
| `surveyor` | `Surveyor123!` | `field_surveyor` | Surveyor Lapangan & IoT Operator: Pengisian survei dinamis NoSQL, eksekusi ETL ke PostGIS, monitoring IoT. | `survei` |
| *(Public/Guest)* | *(Tanpa Login)* | *(None)* | Wisatawan & Konsumen: Halaman Satu Pintu, scan QR batch publik, katalog homestay, audio guide, DSS wisata. | `landing` |

---

## 6. Daftar Modul Backend (`backend/app/modules/`)

### 1. `auth`
- **Tujuan:** Manajemen akun pengguna, penerbitan token JWT, verifikasi password Bcrypt, dan dependency `require_roles`.
- **Endpoints:**
  - `POST /api/v1/auth/login` (Login user, return JWT tokens)
  - `POST /api/v1/auth/refresh` (Refresh access token)
  - `GET /api/v1/auth/me` (Profil user yang sedang aktif)

### 2. `population`
- **Tujuan:** Manajemen kependudukan desa, verifikasi identitas, dan permohonan surat dinas.
- **Endpoints:**
  - `GET /api/v1/population/residents` (Daftar warga dengan pagination, pencarian nama/NIK, dan filter `occupation`)
  - `POST /api/v1/population/residents` (Pendaftaran profil warga desa sintetis)
  - `GET /api/v1/population/residents/{id}` (Detail warga)
  - `PUT /api/v1/population/residents/{id}` (Pembaruan data warga)
  - `PATCH /api/v1/population/residents/{id}/verify` (Verifikasi status warga: `verified` / `rejected`)
  - `GET /api/v1/population/statistics` (Rekapitulasi demografi, gender, pekerjaan)
  - `GET /api/v1/population/requests` (Kotak masuk permohonan surat desa)
  - `POST /api/v1/population/requests` (Pengajuan surat oleh warga)
  - `PATCH /api/v1/population/requests/{id}/status` (Approval/rejection surat dinas)

### 3. `farmers` & `farms`
- **Tujuan:** Pendataan petani rempah, kelompok tani, dan pemetaan bidang kebun berbasis PostGIS.
- **Fitur Khusus:**
  - Menghitung luas poligon otomatis menggunakan geodesi bola bumi (*spherical geodesy*).
  - Validasi geometri cincin tertutup dan penolakan tumpang tindih (*overlap*) dengan poligon kebun lain (HTTP 409 Conflict).
  - Alur persetujuan tanah: `farmer_group_admin` mengajukan (`status: pending`), `village_officer` / `admin` memverifikasi.
- **Endpoints:**
  - `GET /api/v1/farmers` & `POST /api/v1/farmers`
  - `GET /api/v1/farmers/groups` & `POST /api/v1/farmers/groups`
  - `GET /api/v1/farms` & `POST /api/v1/farms`
  - `POST /api/v1/farms/validate-boundary` (Pre-check overlap secara real-time)
  - `PATCH /api/v1/farms/{id}/verification` (Verifikasi plot tanah)
  - `GET /api/v1/farms/geojson/all` (FeatureCollection GeoJSON batas kebun)

### 4. `harvests`
- **Tujuan:** Pencatatan hasil panen komoditas (Pala, Fuli, Cengkeh, Cakalang, Tuna) dari petani/kebun tertentu.
- **Endpoints:**
  - `GET /api/v1/harvests` & `POST /api/v1/harvests`

### 5. `traceability`
- **Tujuan:** Penggabungan catatan panen menjadi lot/batch produk (`product_batches`), penambahan peristiwa rantai pasok (`batch_events`), dan pembuatan hash rantai kanonikal SHA-256.
- **Endpoints:**
  - `GET /api/v1/batches` & `POST /api/v1/batches`
  - `GET /api/v1/batches/{id}`
  - `POST /api/v1/batches/{id}/events` (Mencatat event fermentasi, pengeringan, sortasi, packaging)

### 6. `blockchain`
- **Tujuan:** Menjembatani hash batch lokal ke smart contract EVM menggunakan Web3.py.
- **Endpoints:**
  - `POST /api/v1/blockchain/batches/{id}/anchor` (Anchoring hash ke blockchain)
  - `GET /api/v1/blockchain/batches/{id}/transactions` (Riwayat transaksi on-chain)
  - `GET /api/v1/blockchain/batches/{id}/verify` (Membandingkan hash DB vs on-chain)

### 7. `qr`
- **Tujuan:** Halaman verifikasi publik tanpa autentikasi untuk konsumen yang memindai label produk.
- **Endpoints:**
  - `GET /api/v1/public/verify/{token}` (Data timeline produk & bukti hash)
  - `GET /api/v1/public/verify/image/{token}` (Stream langsung gambar PNG QR code untuk stiker)

### 8. `audit`
- **Tujuan:** Pencatatan audit trail menyeluruh (`audit_logs`) dan ringkasan eksekutif ekosistem.
- **Endpoints:**
  - `GET /api/v1/audit/logs` (Riwayat log audit dengan filter aksi dan entitas)
  - `GET /api/v1/audit/ecosystem-summary` (Statistik agregat langsung dari database)

### 9. `dss`
- **Tujuan:** Sistem pendukung keputusan berbasis Simple Additive Weighting (SAW) dual-mode.
- **Endpoints:**
  - `POST /api/v1/dss/hitung-saw` (Engine kalkulasi SAW generik)
  - `POST /api/v1/dss/rekomendasi-wisata` (Mode 1: Rekomendasi homestay)
  - `POST /api/v1/dss/prioritas-krisis` (Mode 2: Prioritas krisis air & energi desa)
  - `GET /api/v1/dss/wisata/alternatives` & `GET /api/v1/dss/krisis/alternatives`

### 10. `koperasi`
- **Tujuan:** Koperasi Hatta, bank sampah botol plastik, dan dispenser air minum RO.
- **Endpoints:**
  - `POST /api/v1/koperasi/transaksi/setor-komoditas` (Timbangan rempah/ikan $\rightarrow$ Rupiah / kuota air)
  - `POST /api/v1/koperasi/transaksi/setor-sampah` (Bank sampah: 1 kg botol plastik = 10 L air RO + 10 Poin)
  - `POST /api/v1/koperasi/tebus-air` (Penebusan air RO mandiri dengan pulsa katup solenoid)
  - `GET /api/v1/koperasi/warga/{nik}/profil` (Cek saldo, kuota air, dan riwayat)
  - `GET /api/v1/koperasi/transaksi` (Buku besar transaksi lengkap dengan SHA-256 receipt hash)
  - `GET /api/v1/koperasi/rekapitulasi` (Rekap volume komoditas, plastik, dan air)

### 11. `iot`
- **Tujuan:** Pemantauan telemetri stasiun air dan energi di Pulau Banda Neira.
- **Endpoints:**
  - `POST /api/v1/iot/telemetri` (Ingesti data sensor dari mikrokontroler ESP32)
  - `GET /api/v1/iot/telemetri/terkini` (Status live 4 stasiun pulau)
  - `GET /api/v1/iot/telemetri/riwayat` (Data time-series sensor)
  - `GET /api/v1/iot/resiliency-summary` (Barometer kesiapan pulau & penghematan diesel)
  - `POST /api/v1/iot/simulate-pulse` (Simulasi denyut telemetri realistis)

### 12. `tourism`
- **Tujuan:** Smart tourism eco-stay, direktori pemandu wisata berlisensi HPI, reservasi tamu langsung via WhatsApp, dan katalog 177 Cagar Budaya.
- **Proteksi RBAC Ketat:**
  - `POST/PUT/DELETE /api/v1/tourism/accommodations` hanya untuk `admin`, `village_officer`, `homestay_operator`.
  - `POST/PUT/DELETE /api/v1/tourism/guides` hanya untuk `admin`, `village_officer`, `smart_tourism_admin`.
  - `GET /api/v1/tourism/bookings` terlindungi (hanya host/admin berwenang yang dapat melihat PII tamu).
- **Endpoints:**
  - `GET /api/v1/tourism/accommodations` & alias `GET /api/v1/penginapan`
  - `POST /api/v1/tourism/bookings` & alias `POST /api/v1/pemesanan` (Generate WhatsApp link)
  - `GET /api/v1/tourism/bookings` (Reservasi masuk terlindungi)
  - `GET /api/v1/tourism/guides` & `POST /api/v1/tourism/guides`
  - `PUT /api/v1/tourism/guides/{id}` & `DELETE /api/v1/tourism/guides/{id}`
  - `GET /api/v1/tourism/heritage-catalog` (7 cagar budaya unggulan + narasi audio)

### 13. `gis`
- **Tujuan:** API 7-Layer spasial GeoJSON standar RFC 7946.
- **Layer Definisi:**
  - `LAYER_TOURISM_4A`: Wisata bahari, pantai, diving spot, lava flow.
  - `LAYER_HERITAGE`: Benteng Belgica, Benteng Nassau, Rumah Pengasingan Bung Hatta, Sutan Sjahrir.
  - `LAYER_ACCOMMODATION`: Eco-stays, hotel, homestay (dengan badge RO & solar).
  - `LAYER_KOPERASI_UMKM`: Kantor Koperasi Hatta, Bank Sampah, petak kebun pala Poktan.
  - `LAYER_PUBLIC_SAFETY`: Dermaga pelabuhan, puskesmas, jalur evakuasi gempa/tsunami.
  - `LAYER_WATER_INFRA`: Sumur payau, tandon komunal, instalasi SWRO dengan link IoT TDS.
  - `LAYER_ENERGY_WASTE`: PLTD diesel, PLTS surya terpusat, TPS sampah plastik.
- **Endpoints:**
  - `GET /api/v1/gis/layers` & alias `GET /api/v1/peta/geojson`
  - `GET /api/v1/gis/meta` & `GET /api/v1/gis/cagar-budaya/{slug}`

### 14. `security`
- **Tujuan:** Pengerasan data NIK sesuai OWASP Top 10 A07 / NFR-02.
- **Endpoints:**
  - `POST /api/v1/warga/cari-nik` & `POST /api/v1/security/cari-nik` (Pencarian NIK masked via blind index)
  - `GET /api/v1/audit-keamanan` & `GET /api/v1/security/audit-report` (Laporan audit kriptografi 4 pilar)
  - `POST /api/v1/security/test-crypto-roundtrip` (Sandbox enkripsi-dekripsi langsung)

### 15. `survei`
- **Tujuan:** Pengumpulan data survei lapangan dinamis menggunakan staging NoSQL/JSONB serta validasi otomatis koordinat Banda Neira untuk promosi data ke PostGIS 7-layer.
- **Endpoints:**
  - `POST /api/v1/survei/mentah` (Pengisian survei fleksibel oleh tim lapangan)
  - `GET /api/v1/survei/mentah` (Daftar survei mentah dengan filter domain & urgensi)
  - `POST /api/v1/survei/migrasi-etl` (Pipa transformasi ETL otomatis ke `spatial_features`)
  - `GET /api/v1/survei/stats` & `POST /api/v1/survei/seed-sample`

---

## 7. Struktur Skema Database & 12 Migrasi Alembic

Seluruh migrasi database dikelola secara deterministik di `backend/migrations/versions/`:

1. `001_initial_users_and_roles.py`: Tabel `users`, `roles`, `user_roles`.
2. `002_population_and_audit_tables.py`: Tabel `residents`, `administrative_requests`, `audit_logs`.
3. `003_farmers_and_farms_tables.py`: Tabel `farmer_groups`, `farmers`, `farms` (dengan kolom PostGIS `geometry(Point, 4326)` dan `geometry(Polygon, 4326)`).
4. `004_harvest_and_traceability_tables.py`: Tabel `harvests`, `product_batches`, `batch_harvests`, `batch_events`.
5. `005_blockchain_transactions_table.py`: Tabel `blockchain_transactions`.
6. `006_koperasi_and_water_tables.py`: Tabel `coop_accounts` dan `coop_transactions`.
7. `007_iot_telemetry_tables.py`: Tabel `iot_telemetry_logs`.
8. `008_tourism_accommodations_and_bookings.py`: Tabel `accommodations` dan `bookings`.
9. `009_gis_spatial_features.py`: Tabel `spatial_features` (7 layer spasial GeoJSON).
10. `010_nik_cryptographic_hardening.py`: Penambahan kolom `nik_encrypted` (Text) dan `nik_blind_index` (VARCHAR 64 indexed) pada tabel `residents`.
11. `011_raw_surveys_table.py`: Tabel `raw_surveys` (staging NoSQL dengan kolom `flexible_attributes` JSONB).
12. `012_tour_guides_table.py`: Tabel `tour_guides` (direktori pemandu wisata HPI).

---

## 8. Arsitektur Keamanan & Kriptografi (OWASP Top 10)

Sistem menerapkan protokol pertahanan data berlapis:

1. **Two-Tier Field-Level Encryption (`backend/app/core/crypto_nik.py`):**
   - **Enkripsi Simetris:** NIK dienkripsi dengan algoritma AES-256-GCM. Setiap proses enkripsi menghasilkan IV/nonce acak 12-byte unik, sehingga nilai terenkripsi selalu berbeda (*semantic security*).
   - **Blind Indexing HMAC-SHA256:** Agar database tetap dapat melakukan pencarian $O(1)$ tanpa mendekripsi tabel, dibuat indeks buta menggunakan HMAC-SHA256 yang dibumbui *server-side pepper* rahasia.
   - **Masking NIK:** Seluruh tampilan publik dan log menyensor digit tengah NIK: `817101******0001`.
2. **Anti-Enumeration Rate Limiting:**
   - Membatasi pencarian NIK publik maksimal 20 kali per menit per alamat IP. Permintaan ke-21 akan langsung diblokir dengan HTTP status 429 Too Many Requests.
3. **Zero-PII on Chain:**
   - Rekam jejak di smart contract murni menggunakan hash kriptografis kanonikal (SHA-256 dari string JSON deterministik).
4. **Proteksi Injeksi SQL:**
   - Seluruh kueri basis data menggunakan SQLAlchemy 2.0 parameterized ORM.

---

## 9. Smart Contract & Ketertelusuran Rantai Pasok

Kontrak pintar Solidity disimpan di `blockchain/contracts/BandaTraceabilityRegistry.sol` (Solidity 0.8.20):

- **Kategori Komoditas:**
  - `CommodityCategory.SPICE`: Pala Grade A, Fuli Merah, Cengkeh Super.
  - `CommodityCategory.MARINE`: Ikan Asar Cakalang, Tuna Sirip Kuning Sashimi.
- **Pola Kontrak & Kontrol Akses:**
  - Modifiers: `onlyProducer`, `onlyInspector`, `onlyProcessors`, `onlyBatchOwnerOrAuthorized`.
  - Menerapkan pola *Checks-Effects-Interactions* (CEI) dan proteksi *Reentrancy*.
  - Menyimpan pointer decentralized metadata IPFS (CID) untuk dokumen hasil uji lab dan sertifikasi indikasi geografis.
- **Verifikasi Integritas:**
  - Fungsi on-chain `verifyBatchHash(bytes32 _batchId, bytes32 _computedHash)` mengembalikan status boolean apakah hash lokal sesuai dengan bukti yang ditambatkan pada blockchain.
  - Telah diuji terhadap simulasi serangan manipulasi (*tamper attack test*) di mana perubahan 1 karakter pada catatan batch langsung ditolak (*REJECTED / TAMPER DETECTED*).

---

## 10. Frontend Workspaces, Komponen & Desain Neo-Obsidian

Frontend menggunakan bahasa desain **Neo-Obsidian Cyber-Emerald**:
- **Kanvas:** `#080c14` (Deep space obsidian) dengan micro-mesh spatial grid 24px.
- **Aksen Neon:** Emerald (`#10b981`), Cyan (`#06b6d4`), Nutmeg Amber (`#f59e0b`), Purple (`#8b5cf6`), Fuchsia (`#d946ef`).
- **Komponen Shared (`frontend/src/components/`):**
  - `HeaderNav.tsx`: Cyber-HUD navbar dengan indikator sinyal live, PWA installer, koordinat GPS pulau, dan user pass.
  - `LoginSection.tsx`: Login resmi + Holographic Persona Passes untuk uji coba akun demo.
  - `QuickLoginModal.tsx`: Simulator 9 aktor ekosistem yang dapat dibuka dari tombol melayang `⚡ Uji Peran` di pojok kanan bawah setiap halaman.
  - `VerifiedMarketplaceModal.tsx`: Etalase komoditas terverifikasi on-chain dengan IPFS CID.
  - `PublicVerifyModal.tsx`: Visualisasi timeline perjalanan produk dari kebun hingga konsumen.
  - `FarmMap.tsx`: Peta Leaflet dengan pin plot kebun dan batas poligon.
  - `BlockchainModal.tsx` & `OfflineQueueModal.tsx`: Modal inspeksi receipt transaksi blockchain dan antrean offline.
- **Daftar Workspace (`frontend/src/views/`):**
  1. `LandingPortalWorkspace.tsx`: Portal Satu Pintu BST-NIRANA dengan pemandangan 4 panorama pulau dan pencarian universal.
  2. `ResidentsWorkspace.tsx`: Manajemen data kependudukan desa.
  3. `LettersWorkspace.tsx`: Kotak surat desa dan cetak surat berkop resmi.
  4. `FarmsGisWorkspace.tsx`: Pemetaan kebun dan uji tumpang tindih lahan PostGIS.
  5. `HarvestGradingWorkspace.tsx`: Pencatatan panen dan cetak stiker label QR batch.
  6. `InteractiveMapWorkspace.tsx`: Peta spasial 7-layer dengan filter interaktif.
  7. `TourismEcoStayWorkspace.tsx`: Katalog homestay, reservasi tamu WA, direktori pemandu wisata, dan CMS tarif.
  8. `SmartPlannerWorkspace.tsx`: Perencana cerdas wisata & krisis desa DSS SAW.
  9. `KoperasiKasirWorkspace.tsx`: Kasir Koperasi Hatta, bank sampah botol, dan dispenser air RO.
  10. `IslandTelemetryWorkspace.tsx`: Command center telemetri sensor TDS dan surya 4 pulau.
  11. `SurveyEtlWorkspace.tsx`: Staging survei dinamis NoSQL dan visual ETL manager.
  12. `AuditTrailWorkspace.tsx`: Audit trail visual, diff modal, dan sandbox kriptografi NIK.
  13. `CitizenPortalWorkspace.tsx`: Layanan mandiri permohonan surat warga.

---

## 11. Ketahanan Offline (PWA, IndexedDB & Service Worker)

Mengingat kondisi sinyal seluler di Kepulauan Banda yang fluktuatif:
1. **IndexedDB Client (`frontend/src/offline/db.ts`):**
   - Menyimpan transaksi panen, survei, dan permohonan surat saat offline dalam antrean sinkronisasi.
   - Status antrean: `Offline`, `Pending Sync`, `Synced`, `Failed`.
   - Caching layer GeoJSON 7-layer (`cached_gis_layers`) agar peta tetap dapat dimuat tanpa sambungan internet.
2. **Service Worker (`frontend/public/sw.js`):**
   - Cache-first strategy untuk aset statis aplikasi (`banda-digital-v2`).
   - Caching ubin peta OpenStreetMap secara khusus dalam bucket `banda-map-tiles-v1`.
3. **PWA Installer (`frontend/src/offline/usePWA.ts`):**
   - Mendeteksi event `beforeinstallprompt` untuk mengaktifkan tombol install aplikasi di Android/iOS/Desktop.

---

## 12. Perintah Pengujian & Verifikasi Mutu

Sebelum menyerahkan tugas atau melakukan commit, jalankan pengujian berikut:

### 1. Backend Automated Tests (87 Tests)
```bash
# Jalankan seluruh test suite dengan menyertakan site-packages venv
PYTHONPATH=.:backend/.venv/lib/python3.14/site-packages python3 -m pytest backend/tests/ -v
```
*Status Terverifikasi:* **87 passed in ~3 menit (100% lulus)**.

### 2. Frontend Type Checking & Production Build
```bash
# Type-check TypeScript (0 errors)
cd frontend
node node_modules/typescript/bin/tsc --noEmit

# Production bundle build menggunakan Vite
node node_modules/vite/bin/vite.js build
```
*Status Terverifikasi:* **Built in ~2.85s, 0 TypeScript errors, aset tersimpan di `frontend/dist/`**.

---

## 13. Peta Berkas Penting (Directory Map)

```
.
├── AGENTS.md                  # Aturan wajib & alur kerja coding AI
├── README.md                  # Gambaran umum proyek & quickstart
├── SRS.md                     # Software Requirements Specification lengkap
├── ARCHITECTURE.md            # Desain arsitektur teknis modular monolith
├── DATABASE.md                # Dokumentasi skema basis data & relasi entitas
├── API.md                     # Kontrak REST API & daftar endpoint
├── TASKS.md                   # Roadmap tahapan pengerjaan (Phases 0-29 selesai)
├── CHANGELOG.md               # Riwayat perubahan per versi
├── docker-compose.yml         # Konfigurasi container orkestrasi
├── ECOSYSTEM_KNOWLEDGE_BASE.md# Dokumen ini (Knowledge base komprehensif)
│
├── backend/
│   ├── app/
│   │   ├── main.py            # Entry point FastAPI & registrasi router
│   │   ├── core/              # config.py, crypto_nik.py, permissions.py, security.py
│   │   ├── database/          # session.py, base.py
│   │   └── modules/           # 15 sub-modul (auth, population, farmers, farms, harvests,
│   │                          # traceability, blockchain, qr, audit, dss, koperasi, iot,
│   │                          # tourism, gis, survei)
│   ├── migrations/            # 12 skema migrasi Alembic
│   ├── tests/                 # 15 berkas uji otomatis (test_auth, test_tourism, dll.)
│   └── scripts/               # demo_seed.py, simulate_iot_telemetry.py
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx            # Root component, routing, tab switcher
│   │   ├── components/        # HeaderNav, LoginSection, QuickLoginModal, dll.
│   │   ├── views/             # 13 workspaces modular (LandingPortal, Tourism, GIS, dll.)
│   │   ├── services/          # HTTP API client layer (auth, tourism, gis, dll.)
│   │   ├── offline/           # db.ts, syncManager.ts, usePWA.ts
│   │   └── index.css          # Design system Neo-Obsidian Cyber-Emerald
│   ├── public/                # sw.js, manifest.json
│   └── package.json           # Dependensi React, Vite, TanStack Query, Leaflet
│
├── blockchain/
│   ├── contracts/             # BandaTraceabilityRegistry.sol & SpiceRegistry.sol
│   └── scripts/               # Skrip simulasi testnet & receipt JSON
│
└── docs/
    ├── USER_GUIDE.md          # Panduan operasional pengguna
    └── mandat_anam/           # 14 dokumen riset & handover DSR Scopus
```

---

## 14. Format Laporan Standar AI

Sesuai aturan `AGENTS.md`, di akhir setiap pengerjaan tugas, agen AI **wajib menyajikan laporan dalam format berikut**:

```markdown
### Implementation Summary
[Ringkasan singkat apa yang dibangun, diubah, atau diperbaiki]

### Files Changed / Created
- `path/to/file1`: [tindakan yang diambil]
- `path/to/file2`: [tindakan yang diambil]

### Database Changes
[Perubahan skema, migrasi Alembic yang dibuat, atau "None"]

### API Changes
[Endpoint baru, modifikasi kontrak API, atau "None"]

### Tests Executed
[Daftar pengujian otomatis yang dijalankan beserta status kelulusannya]

### Known Limitations / Issues
[Keterbatasan teknis, kompromi, atau hal yang masih perlu diperhatikan]

### Next Task
[Rekomendasi langkah tindak lanjut terdekat dari TASKS.md]
```
