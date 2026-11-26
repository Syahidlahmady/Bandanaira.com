# Banda Digital Ecosystem

Platform digital terintegrasi untuk mendukung digitalisasi pelayanan masyarakat, pendataan petani rempah, pemetaan perkebunan, dan transparansi rantai pasok produk rempah di Desa Banda Neira, Maluku.

---

## 🏛️ Subsistem Utama
1. **Population Identity & Administration:** Manajemen identitas digital internal warga desa dan pencatatan layanan desa.
2. **Spice Farmer Mapping:** Pemetaan petani, kelompok tani, dan koordinat kebun rempah berbasis PostGIS & Leaflet.
3. **Blockchain-Based Spice Traceability:** Pelacakan rantai pasok rempah (panen, pengolahan, pengemasan) dengan bukti integritas hash di smart contract blockchain dan verifikasi QR Code publik.

---

## 🛠️ Tech Stack
- **Backend:** Python 3.12+, FastAPI, SQLAlchemy, Alembic, Pydantic v2
- **Frontend:** React 18, Vite, TypeScript, React Router, TanStack Query, Leaflet, Lenis (Smooth Scroll)
- **Database:** PostgreSQL 16 + PostGIS 3.4
- **Blockchain:** Solidity, Local EVM Testnet, Web3.py
- **Infrastruktur:** Docker & Docker Compose

---

## 📖 Dokumentasi Teknis
- [ECOSYSTEM_KNOWLEDGE_BASE.md](file:///home/hid/Projects/BTS-NEIRA/penduduk/ECOSYSTEM_KNOWLEDGE_BASE.md) — **Master Knowledge Base & AI Context (Baca ini pertama kali bagi agen AI).**
- [AGENTS.md](file:///home/hid/Projects/BTS-NEIRA/penduduk/AGENTS.md) — Aturan wajib dan alur kerja AI Coding Agent.
- [SRS.md](file:///home/hid/Projects/BTS-NEIRA/penduduk/SRS.md) — Software Requirements Specification lengkap.
- [ARCHITECTURE.md](file:///home/hid/Projects/BTS-NEIRA/penduduk/ARCHITECTURE.md) — Arsitektur teknis modular monolith.
- [DATABASE.md](file:///home/hid/Projects/BTS-NEIRA/penduduk/DATABASE.md) — Desain skema database dan entitas relasional.
- [API.md](file:///home/hid/Projects/BTS-NEIRA/penduduk/API.md) — Spesifikasi REST API dan format respon.
- [TASKS.md](file:///home/hid/Projects/BTS-NEIRA/penduduk/TASKS.md) — Roadmap dan progres pengerjaan bertahap.
- [USER_GUIDE.md](file:///home/hid/Projects/BTS-NEIRA/penduduk/docs/USER_GUIDE.md) — Panduan operasional dan pengguna lengkap.

---

## 🚀 Memulai Proyek (Local Development)

### 1. Salin Environment Variables
```bash
cp .env.example .env
```

### 2. Jalankan via Docker Compose
```bash
docker compose -f infrastructure/docker/docker-compose.yml up -d --build
```

### 3. Jalankan Database Migrations & Seed Data Demonstrasi
```bash
poetry run alembic -c backend/alembic.ini upgrade head

# 1. Seeding Data Lengkap Ekosistem (Pengguna, Petani, Lahan, Koperasi, NIK Kependudukan, & GIS):
docker compose exec backend python scripts/demo_seed.py
# atau via Host:
poetry run python backend/scripts/demo_seed.py

# 2. Seeding Spasial & Batas Desa Khusus GIS (36 titik fasilitas + 2 rute maritim + 18 poligon desa resmi):
docker compose exec backend python scripts/seed_spatial_features.py
# atau via Host:
python backend/scripts/seed_spatial_features.py
```

### 4. Akses Layanan
- **Frontend Web:** `http://localhost:5175`
- **Backend API:** `http://localhost:8005`
- **API Interactive Docs (Swagger):** `http://localhost:8005/docs`
- **Health Check Endpoint:** `http://localhost:8005/api/v1/health`

---

## ⚡ Optimalisasi Performa & Smooth Scrolling (Lenis)
Halaman landing page editorial mengimplementasikan *kinetic smooth scrolling* menggunakan **Lenis** dan optimasi Lighthouse (code-splitting dinamis, lazy-loading gambar & modul Leaflet berbobot tinggi):

### Pemasangan Dependensi Lenis
Jika menginstal dependensi frontend secara manual di luar Docker:
```bash
cd frontend
npm install lenis
```
> **Catatan Teknis Leaflet:** Kontainer kanvas peta Leaflet dilengkapi atribut `data-lenis-prevent` guna memastikan *scroll-wheel zoom* pada peta spasial tidak berbenturan dengan *page smooth scroll*.

---

## 📱 Aplikasi Mobile Android (Banda Digital Ecosystem)

Aplikasi seluler **Banda Digital Ecosystem** dibangun menggunakan **Capacitor Native Android Shell** yang mengemas seluruh platform web terpadu dengan performa native, akses sensor perangkat keras (GPS, status jaringan fisik), dan dukungan mode luring (*offline-first*).

### 1. Cara Mengunduh Berkas APK dari GitHub Actions (Rilis Otomatis CI/CD)
Setiap kali ada pembaruan kode yang di-push ke cabang `main`, GitHub Actions secara otomatis mengompilasi berkas APK Android terbaru:
1. Buka peramban ke halaman Actions repositori:  
   👉 **[GitHub Actions — Build Android APK](https://github.com/Syahidlahmady/Bandanaira.com/actions?query=workflow%3A%22Build+Android+APK+%28Banda+Ecosystem%29%22)**
2. Pilih alur kerja (*Workflow Run*) paling atas yang bertanda centang hijau (**Success**).
3. Gulir ke bagian paling bawah halaman pada seksi **Artifacts**.
4. Klik tautan **`banda-digital-ecosystem-debug-apk`** (Ukuran berkas: ~38 MB).
5. Berkas `.zip` akan terunduh. Ekstrak file zip tersebut untuk mendapatkan berkas biner aplikasi **`app-debug.apk`**.

---

### 2. Cara Memasang (*Install*) & Menjalankan di Smartphone Android
1. **Transfer Berkas ke Ponsel:**
   - Kirimkan berkas `app-debug.apk` ke ponsel Android Anda melalui WhatsApp Web, Telegram, Google Drive, atau kabel data USB.
2. **Pasang Aplikasi:**
   - Buka pengelola berkas (*File Manager*) di ponsel Anda, lalu ketuk berkas `app-debug.apk`.
   - Jika muncul dialog peringatan *"Demi keamanan, ponsel Anda tidak diizinkan memasang aplikasi dari sumber ini"*:
     - Ketuk **Setelan (Settings)**.
     - Aktifkan opsi **"Izinkan dari sumber ini / Allow from this source"**.
   - Ketuk tombol **Instal (Install)** dan tunggu proses selesai.
3. **Jalankan Aplikasi:**
   - Buka aplikasi **Banda Digital**.
   - Berikan izin lokasi (*Location / GPS*) saat diminta agar fitur pencarian fasilitas kesehatan terdekat (**Find Health Facilities**) dan panggilan darurat ambulans laut dapat berfungsi maksimal.

---

### 3. Cara Menjalankan di Emulator Android (Bagi Pengembang)
Jika Anda memiliki Android SDK dan AVD (*Android Virtual Device*) di komputer pengembang:
```bash
# 1. Jalankan emulator lokal (contoh AVD ThinkNote_API34)
$ANDROID_HOME/emulator/emulator -avd ThinkNote_API34 &

# 2. Hubungkan koneksi jaringan API backend lokal ke emulator
adb reverse tcp:8005 tcp:8005

# 3. Pasang berkas APK yang telah dikompilasi
adb install -r frontend/android/app/build/outputs/apk/debug/app-debug.apk

# 4. Luncurkan aplikasi langsung di layar emulator
adb shell am start -n com.bandanaira.ecosystem/.MainActivity
```

---

### 4. Cara Kompilasi Manual APK di Komputer Lokal
Jika ingin melakukan build APK sendiri dari basis kode:
```bash
# 1. Kompilasi aset bundle produksi frontend
cd frontend
npm run build

# 2. Sinkronkan aset ke kontainer Android native Capacitor
npx cap sync android

# 3. Kompilasi biner debug APK menggunakan Gradle & JDK 21
cd android
./gradlew assembleDebug --stacktrace

# Berkas APK siap di: frontend/android/app/build/outputs/apk/debug/app-debug.apk
```

