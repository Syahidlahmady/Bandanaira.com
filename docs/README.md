# BST-NIRANA Ecosystem

**Banda Smart Tourism & Island Resource Ecosystem**\
Platform terpadu untuk pariwisata cerdas, layanan warga, koperasi,
pemetaan spasial, dan ketahanan sumber daya pulau di Kepulauan Banda.

![Status](https://img.shields.io/badge/status-in%20development-orange)
![Frontend](https://img.shields.io/badge/frontend-React%20%2B%20Vite-61DAFB)
![Backend](https://img.shields.io/badge/backend-FastAPI-009688)
![Database](https://img.shields.io/badge/database-PostgreSQL%20%2B%20PostGIS-4169E1)
![License](https://img.shields.io/badge/license-TBD-lightgrey)

## Tentang Proyek

BST-NIRANA adalah aplikasi web terpadu yang dirancang untuk mendukung
pengembangan pariwisata berkelanjutan dan pengelolaan sumber daya di
Kepulauan Banda. Sistem menggunakan pendekatan **modular monolith**
dalam satu monorepo, dengan frontend React, backend FastAPI, serta
arsitektur basis data hibrida.

Sistem dirancang untuk **dual deployment**: Cloud VPS untuk akses publik
dan Local Edge Server untuk operasional lokal ketika koneksi internet
terganggu.

### Tujuan utama

- Menyediakan portal informasi wisata, cagar budaya, dan akomodasi.
- Mendukung rekomendasi wisata dan prioritas infrastruktur menggunakan
  metode **Simple Additive Weighting (SAW)**.
- Menyediakan layanan mandiri warga berbasis NIK dengan perlindungan
  data.
- Mencatat transaksi Koperasi Hatta dan Bank Sampah serta menyediakan
  verifikasi jejak produk.
- Memetakan data lapangan dan infrastruktur menggunakan GIS.
- Memantau kualitas air, distribusi air, energi, dan timbangan melalui
  perangkat IoT.
- Mendukung operasi offline-first dan sinkronisasi data ketika koneksi
  pulih.

> **Catatan status:** README ini mendokumentasikan rancangan teknologi
> berdasarkan SRS. Keberadaan fitur dalam spesifikasi tidak berarti
> seluruh fitur telah selesai diimplementasikan.

## Fitur Utama

### 1. Portal Smart Tourism

- Peta interaktif destinasi, cagar budaya, akomodasi, koperasi/UMKM,
  dan fasilitas publik.
- Direktori vila, homestay, guest house, dan hotel.
- Formulir pemesanan akomodasi dengan tautan konfirmasi WhatsApp.
- Katalog sejarah dengan narasi, foto/panorama, dan audio guide.
- Etalase produk Koperasi Hatta.
- QR Digital Passport untuk menelusuri informasi dan integritas
  catatan produk.

### 2. Layanan Mandiri Warga

- Pencarian profil menggunakan NIK 16 digit.
- Informasi saldo koperasi, poin bank sampah, dan kuota air bersih.
- Riwayat transaksi warga.
- Pembuatan dokumen atau surat desa dalam format PDF.

### 3. Koperasi Hatta dan Bank Sampah

- Pencatatan setoran komoditas seperti pala, fuli, cengkeh, ikan, dan
  produk olahan.
- Pencatatan sampah plastik dan material daur ulang.
- Pengambilan data berat dari timbangan IoT atau input manual.
- Pembaruan saldo atau kuota berdasarkan aturan transaksi.
- Pencatatan transaksi ke blockchain internal berbasis hash SHA-256.

### 4. GIS dan Pemetaan Lapangan

- Peta berbasis Leaflet.js dan React Leaflet.
- Pertukaran data spasial menggunakan GeoJSON sesuai RFC 7946.
- Penyimpanan geometri menggunakan PostGIS dengan koordinat WGS 84 /
  EPSG:4326.
- Tujuh kelompok layer untuk pariwisata, cagar budaya, akomodasi,
  UMKM, keselamatan publik, infrastruktur air, serta energi dan
  sampah.
- Form survei dinamis dan alur ETL dari MongoDB ke PostgreSQL/PostGIS.

### 5. IoT dan Ketahanan Pulau

- Telemetri kualitas air (TDS), level tandon, dan distribusi air.
- Telemetri panel surya dan sumber energi.
- Integrasi timbangan berbasis ESP32.
- Peringatan ketika nilai sensor melewati ambang batas yang
  dikonfigurasi.
- Pengiriman perintah kendali ke perangkat, sesuai implementasi
  firmware dan mekanisme keselamatan.

### 6. Decision Support System

Mesin DSS menggunakan metode **Simple Additive Weighting (SAW)** untuk
dua skenario: - **Rekomendasi wisata dan akomodasi** berdasarkan
preferensi wisatawan. - **Prioritas infrastruktur** untuk membantu
analisis kebutuhan air dan energi.

## Tech Stack

Versi teknologi berikut mengikuti spesifikasi SRS. Versi paket frontend
yang lebih rinci dapat ditetapkan di `package.json` ketika implementasi
dimulai.

---

Area Teknologi Peran

---

Frontend React.js 18+ Antarmuka pengguna

Build tool Vite Development server dan
build frontend

Styling Tailwind CSS Sistem styling
responsif

Routing React Router DOM Navigasi halaman SPA

HTTP client Axios Komunikasi frontend
dengan API

PWA Workbox Service Workers Cache aplikasi dan
dukungan offline

Local offline storage IndexedDB Penyimpanan data lokal
untuk alur offline yang
dirancang

GIS frontend Leaflet.js, React Peta interaktif
Leaflet

Spatial data format GeoJSON (RFC 7946) Pertukaran data spasial

GIS desktop QGIS Pengolahan data
koordinat dan geometri

Backend Python 3.11+, FastAPI REST API dan logika
bisnis

ASGI server Uvicorn Menjalankan aplikasi
FastAPI

Validation Pydantic v2 Validasi request dan
schema

ORM SQLAlchemy, GeoAlchemy2 Akses PostgreSQL dan
PostGIS

MongoDB driver Motor Akses MongoDB secara
asynchronous

Primary relational DB PostgreSQL 16 Data transaksional dan
terstruktur

Spatial extension PostGIS 3.4 Penyimpanan dan query
geometri

Flexible / telemetry DB MongoDB 7.0 Survei dinamis, konten
fleksibel, dan log
telemetri

DSS computation NumPy, Pandas Pengolahan matriks dan
perhitungan SAW

Cryptography `cryptography` atau AES-256-GCM dan fungsi
PyCryptodome kriptografi

Authentication JWT, RBAC Autentikasi dan
pembatasan hak akses

Internal blockchain Python `hashlib`, Hash transaksi dan
SHA-256, PoA pemeriksaan integritas
rantai

Containerization Docker, Docker Compose Pengemasan dan
orkestrasi layanan

Reverse proxy Nginx Reverse proxy dan
routing deployment

Background jobs APScheduler Penjadwalan
sinkronisasi latar
belakang

IoT firmware C++ / PlatformIO, ESP32 Firmware sensor,
timbangan, dan aktuator

---

## Arsitektur Tingkat Tinggi

```text
Wisatawan / Warga / Mitra / Operator / Admin
                    |
             React + Vite PWA
                    |
             REST API (HTTPS)
                    |
             FastAPI + Uvicorn
                    |
       +------------+-------------+
       |            |             |
  PostgreSQL     MongoDB      Engine Python
  + PostGIS      7.0          - DSS SAW
  - transaksi    - survei     - Blockchain hash
  - warga        - telemetry  - ETL
  - booking      - konten
       |
  GeoJSON untuk peta Leaflet

ESP32: sensor air, energi, dan timbangan
                    |
             API Telemetri FastAPI

Cloud VPS <---- sinkronisasi terjadwal ----> Local Edge Server
```

### Strategi basis data hibrida

- **MongoDB** menampung data survei dinamis, konten fleksibel, dan
  data telemetri.
- **PostgreSQL** menjadi basis data relasional utama untuk data warga,
  transaksi, akomodasi, pemesanan, catatan blockchain, dan hasil DSS.
- **PostGIS** menyimpan geometri spasial serta mendukung query peta.
- Proses **ETL** memvalidasi dan memindahkan data terpilih dari
  MongoDB ke PostgreSQL/PostGIS.

## Zona Aplikasi dan Rute Utama (Bahasa Indonesia)

| Zona | Rute Bahasa Indonesia | Fungsi |
| :--- | :--- | :--- |
| Portal publik | `/` | Beranda dan sorotan wisata |
| Portal publik | `/jelajah-peta` | Peta interaktif 7 layer (Leaflet & PostGIS GeoJSON) |
| Portal publik | `/penginapan` | Direktori akomodasi vila & homestay Eco-Stay |
| Portal publik | `/penginapan/:id` | Detail akomodasi, form booking & konfirmasi WhatsApp |
| Portal publik | `/perencana-cerdas` | Rekomendasi wisata dan vila berbasis DSS SAW Mode 1 |
| Portal publik | `/cagar-budaya/:slug` | Informasi cagar budaya, foto 360 & Audio Guide |
| Portal publik | `/koperasi-hatta` | Katalog produk unggulan Koperasi Hatta |
| Portal publik | `/verifikasi-rantai/:id_batch` | Verifikasi QR Digital Passport produk di Blockchain |
| Layanan warga | `/portal-warga` | Akses layanan mandiri 16 digit NIK (`/dasbor`, `/riwayat`, `/surat`) |
| Operator | `/operator/kasir-timbangan` | Kasir timbangan IoT ESP32 & pencatatan setoran ke Blockchain |
| Operator | `/operator/dispenser-air` | Operasional distribusi air bersih RO & Solenoid Valve |
| Mitra | `/mitra/penginapan` | Pengelolaan kamar akomodasi & daftar pesanan tamu |
| Admin | `/admin/survei-lapangan` | Form survei lapangan dinamis (MongoDB `raw_surveys`) |
| Admin | `/admin/manajer-etl` | Pengelolaan migrasi ETL (MongoDB ke PostgreSQL/PostGIS) |
| Admin | `/admin/komando-iot` | Dashboard telemetri IoT (TDS Air, Tandon & Energi Surya) |
| Admin | `/admin/ketahanan-dss` | Analisis prioritas infrastruktur desa (DSS SAW Mode 2) |
| Admin | `/admin/audit-keamanan` | Audit aktivitas sistem, kriptografi NIK AES-256 & integritas blok |

## Struktur Repository (Penamaan Direktori Bahasa Indonesia)

Struktur monorepo menggunakan penamaan folder berbahasa Indonesia di dalam modul aplikasi untuk memudahkan pengembang membaca kode dan rute:

```text
banda-neira/
├── docker-compose.yml
├── .env.example
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py
│       ├── inti/
│       │   ├── konfigurasi.py
│       │   ├── keamanan.py
│       │   └── basis_data.py
│       ├── mesin/
│       │   ├── node_blockchain.py
│       │   ├── mesin_saw_dss.py
│       │   ├── pipa_etl.py
│       │   └── generator_surat.py
│       ├── model/
│       │   └── model_data.py
│       ├── skema/
│       │   └── skema_api.py
│       └── rute/
│           ├── survei.py
│           ├── warga.py
│           ├── koperasi.py
│           ├── blockchain.py
│           ├── peta_gis.py
│           ├── dss.py
│           ├── penginapan.py
│           ├── iot.py
│           └── autentikasi.py
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── komponen/
│       │   ├── tata-letak/
│       │   ├── peta/
│       │   ├── kios/
│       │   └── lacak/
│       ├── halaman/
│       │   ├── publik/
│       │   ├── warga/
│       │   ├── mitra-operator/
│       │   └── admin/
│       └── layanan/
│           ├── api.js
│           └── sinkronisasiLuring.js
└── firmware_iot/
    ├── stasiun_air_energi_esp32/
    └── timbangan_cerdas_koperasi_esp32/
```

## Persyaratan Sistem

Untuk lingkungan pengembangan, siapkan:

- Git.
- Python 3.11 atau lebih baru.
- Node.js versi LTS yang kompatibel dengan dependensi frontend.
- npm.
- Docker Engine dan Docker Compose (disarankan untuk menjalankan
  layanan pendukung).
- PostgreSQL 16 dengan PostGIS 3.4, serta MongoDB 7.0 jika tidak
  dijalankan melalui Docker.
- PlatformIO untuk pengembangan firmware ESP32, jika mengerjakan
  bagian IoT.

## Konfigurasi Environment

Buat `.env` berdasarkan `.env.example`. Jangan commit file `.env` atau
kredensial ke repository.

Contoh nama variabel yang perlu disiapkan (sesuaikan dengan nama yang
digunakan implementasi):

```dotenv
APP_ENV=development
APP_NAME=BST-NIRANA
API_PREFIX=/api/v1

# PostgreSQL / PostGIS
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=bst_nirana
POSTGRES_USER=bst_nirana_app
POSTGRES_PASSWORD=change-me
DATABASE_URL=postgresql+psycopg://bst_nirana_app:change-me@localhost:5432/bst_nirana

# MongoDB
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=bst_nirana

# Security: gunakan secret kuat yang dibuat secara aman.
JWT_SECRET_KEY=replace-with-a-strong-secret
NIK_ENCRYPTION_KEY=replace-with-a-valid-32-byte-key
NIK_HMAC_SECRET=replace-with-a-strong-independent-secret

# Frontend
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

**Penting:** - Samakan variabel environment dengan
`backend/app/inti/konfigurasi.py`, konfigurasi frontend, dan
`docker-compose.yml`. - Jangan gunakan nilai contoh di lingkungan
produksi. - Kunci AES-256-GCM harus memenuhi format dan panjang yang
diwajibkan oleh implementasi. - Pisahkan secret JWT, kunci enkripsi, dan
secret HMAC. Kelola rotasi serta backup kunci dengan prosedur yang aman.

## Menjalankan Proyek

Panduan ini merupakan alur awal. Perintah persisnya mengikuti berkas
konfigurasi yang tersedia di repository.

### 1. Clone repository

```bash
git clone <URL_REPOSITORY>
cd banda-neira
```

Ganti `<URL_REPOSITORY>` dengan URL repository yang sebenarnya.

### 2. Siapkan konfigurasi

```bash
cp .env.example .env
```

Edit `.env` dan isi konfigurasi database serta secret yang diperlukan.

### 3. Jalankan layanan pendukung

Jika `docker-compose.yml` sudah tersedia dan dikonfigurasi:

```bash
docker compose up -d
```

Perintah ini hanya akan menjalankan layanan yang didefinisikan di file
Compose. Periksa status dengan:

```bash
docker compose ps
```

### 4. Jalankan backend FastAPI

Contoh alur untuk lingkungan Python lokal:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Jika entry point atau konfigurasi Uvicorn berbeda pada implementasi,
sesuaikan perintah tersebut. Setelah backend berjalan, dokumentasi
interaktif FastAPI umumnya tersedia pada `/docs` dan `/redoc` sesuai
konfigurasi aplikasi.

### 5. Jalankan frontend React

Buka terminal baru dari root repository:

```bash
cd frontend
npm install
npm run dev
```

Alamat development akan ditampilkan oleh Vite di terminal. Pastikan
`VITE_API_BASE_URL` menunjuk ke alamat backend yang benar.

### 6. Firmware IoT (opsional)

Firmware ESP32 dikembangkan dari direktori terkait di `firmware_iot/`.
Gunakan PlatformIO dan sesuaikan board, pin, protokol komunikasi, serta
kredensial jaringan dengan perangkat lapangan yang sebenarnya.

## API (Endpoint Bahasa Indonesia)

Prefix API adalah `/api/v1`.

| Method | Endpoint | Kegunaan |
| :--- | :--- | :--- |
| `POST` | `/api/v1/survei/mentah` | Menyimpan survei lapangan dinamis ke MongoDB |
| `POST` | `/api/v1/survei/migrasi-etl` | Menjalankan proses migrasi ETL ke PostgreSQL/PostGIS |
| `POST` | `/api/v1/warga/cari-nik` | Pencarian warga berbasis blind index NIK (HMAC-SHA256) |
| `GET` | `/api/v1/warga/{id_warga}/surat-pdf` | Menghasilkan surat keterangan desa PDF otomatis |
| `POST` | `/api/v1/koperasi/transaksi` | Mencatat transaksi koperasi & membuat blok SHA-256 |
| `POST` | `/api/v1/koperasi/tebus-air` | Memotong kuota air bersih NIK & membuka Solenoid Valve |
| `GET` | `/api/v1/blockchain/lacak/{kode_qr}` | Mengambil data verifikasi paspor produk Koperasi Hatta |
| `GET` | `/api/v1/blockchain/verifikasi` | Memverifikasi keutuhan seluruh rantai blok SHA-256 |
| `GET` | `/api/v1/peta/geojson` | Mengambil layer peta spasial dalam GeoJSON (RFC 7946) |
| `POST` | `/api/v1/dss/hitung-saw` | Menghitung peringkat metode SAW (Wisata & Krisis) |
| `GET` | `/api/v1/penginapan` | Mengambil daftar akomodasi vila/homestay |
| `POST` | `/api/v1/pemesanan` | Membuat pemesanan akomodasi & tautan konfirmasi WhatsApp |
| `POST` | `/api/v1/iot/telemetri` | Menerima data telemetri sensor IoT ESP32 |
| `GET` | `/api/v1/audit-keamanan` | Mengambil status enkripsi NIK AES-256 & log audit sistem |

## Keamanan

Sistem dirancang dengan lapisan keamanan berikut:

- **NIK:** enkripsi AES-256-GCM untuk nilai NIK dan HMAC-SHA256
  sebagai blind index pencarian.
- **Password:** hashing menggunakan bcrypt.
- **Autentikasi dan otorisasi:** JWT dan Role-Based Access Control
  (RBAC).
- **Validasi input:** skema Pydantic pada backend.
- **Rate limiting:** perlindungan endpoint pencarian NIK dari
  percobaan berulang.
- **Audit:** pencatatan aktivitas dan pemeriksaan integritas
  blockchain internal.
- **Secret management:** kredensial dan kunci kriptografi disimpan di
  environment atau secret manager, bukan di source code.

Hash blockchain membantu mendeteksi perubahan data yang tercakup dalam
perhitungan hash, tetapi tidak dengan sendirinya membuktikan kebenaran
data asal atau menyediakan jaminan keamanan setara blockchain publik.
Mekanisme validator PoA, penyimpanan kunci, otorisasi, dan audit tetap
perlu diimplementasikan dan diuji.

## Offline-First dan Sinkronisasi

Desain sistem mencakup:

- PWA dengan service worker untuk cache aset dan halaman yang dipilih.
- IndexedDB untuk penyimpanan lokal sesuai kebutuhan fitur offline.
- Local Edge Server untuk operasi lokal ketika internet terputus.
- Background worker terjadwal untuk sinkronisasi edge-cloud ketika
  koneksi tersedia.

Dukungan offline memerlukan strategi konflik data, idempotensi
transaksi, penanganan kegagalan sinkronisasi, dan batasan data yang
boleh disimpan di perangkat. Cache PWA saja tidak otomatis membuat
seluruh fitur dan transaksi dapat digunakan secara offline.

## Pengembangan dan Kontribusi

1.  Baca SRS sebagai acuan ruang lingkup dan kontrak teknis.
2.  Tentukan issue dan modul yang dikerjakan sebelum mengubah struktur
    bersama.
3.  Gunakan branch terpisah untuk setiap fitur atau perbaikan.
4.  Tambahkan validasi dan pengujian untuk perubahan backend, frontend,
    ETL, GIS, keamanan, dan IoT.
5.  Jangan commit secret, data NIK asli, data pribadi warga, atau
    telemetri sensitif.
6.  Perbarui dokumentasi jika kontrak API, skema data, atau konfigurasi
    deployment berubah.

Contoh alur Git:

```bash
git checkout -b feature/nama-fitur
git add .
git commit -m "feat: deskripsi singkat perubahan"
git push -u origin feature/nama-fitur
```

## Tim Pengembang

---

Anggota Peran utama

---

Ahmad Nor Hidayah Aditya Pavilion System Architect & Full-Stack Lead;
FastAPI, database hibrida, Docker,
dan DSS SAW

Khoirul Anam Blockchain & IoT Hardware Lead

Syahid Ahmad Lahmady UI/UX Designer & Cyber Security
Specialist

Fauzan Arisanto Data Engineer & GIS Specialist

Reyhan Albar Fahryan Content Manager & Community
Engagement

---

## Ruang Lingkup Deployment

Target deployment dalam SRS adalah:

- **Cloud VPS:** akses publik portal wisata dan API.
- **Local Edge Server:** layanan lokal untuk kebutuhan desa dan
  koperasi saat koneksi internet terganggu.
- **Docker Compose:** orkestrasi layanan aplikasi dan database.
- **Nginx:** reverse proxy pada lingkungan deployment.
- **Background Sync Worker:** sinkronisasi data edge-cloud.

Detail domain, TLS, backup, monitoring, strategi migrasi database, dan
prosedur pemulihan perlu ditetapkan pada konfigurasi deployment.

## Dokumen Acuan

Spesifikasi utama proyek:

**SRS-BST-NIRANA-2026-FINAL --- Versi 2.0**\
_Banda Smart Tourism & Island Resource Ecosystem (Platform Terpadu
BST-NIRANA)._

README ini merupakan dokumentasi pengantar repository. Jika terdapat
perbedaan antara README dan SRS, gunakan SRS sebagai acuan ruang
lingkup; untuk detail operasional, gunakan konfigurasi dan implementasi
kode yang berlaku.

## Lisensi
