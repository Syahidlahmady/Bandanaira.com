# RANCANG BANGUN APLIKASI ANDROID (BLUEPRINT DESAIN & ARSITEKTUR)
## Ekosistem Digital Banda Neira (Banda Smart Tourism & Island Resource Ecosystem)
**Spesialis Pelaksana:** Syahid Ahmad Lahmady (*UI/UX Designer & Security Specialist*)  
**Dokumen Acuan:** `Mandat_SyahidAhmadLahmady.docx` & `docs/mandat_syahidl_ahmady/SRS.md`  
**Kode Dokumen:** `ARCH-ANDROID-BST-2026`  
**Status:** **IMPLEMENTED & READY FOR APK COMPILATION**  
**Tanggal:** 27 November 2026  

---

## 1. Ringkasan Eksekutif & Latar Belakang Mandat

Berdasarkan dokumen resmi **Mandat Syahid Ahmad Lahmady**, salah satu tugas utama yang diamanatkan adalah:
> *"Mengembangkan aplikasi Android BST (MVP/Alpha) dan mengembangkan fitur khusus 'Find Health Facilities' dengan integrasi GPS dan mode offline."*

Kepulauan Banda memiliki karakteristik geografis kepulauan terpencil dengan tantangan nyata:
1. **Fluktuasi Sinyal & Blank Spot Antarpulau:** Sinyal internet sering melemah saat menyeberang antar pulau (Pulau Neira, Pulau Banda Besar, Pulau Ai, Pulau Rhun, Pulau Hatta) atau di perkebunan pala lereng Gunung Api Banda.
2. **Keterbatasan Perangkat Warga:** Mayoritas masyarakat menggunakan smartphone Android kelas menengah ke bawah (*entry-level*, RAM 2–3 GB).
3. **Kebutuhan Akses Cepat Medis Darurat:** Di pulau terpencil, ketiadaan informasi rute puskesmas terdekat atau nomor kontak ambulans laut saat terjadi kecelakaan laut/diving dapat berakibat fatal.

Dokumen ini memuat cetak biru teknis lengkap untuk mengemas seluruh Ekosistem Digital Banda Neira yang telah verified (kependudukan, koperasi, GIS, wisata) ke dalam bentuk **Aplikasi Mobile Android Asli (.APK)** yang tangguh, ringan, dan siap diinstal langsung di smartphone warga serta wisatawan.

---

## 2. Catatan Keputusan Desain (Decision Log)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        LOG KEPUTUSAN ARSITEKTUR APLIKASI ANDROID                       │
├────┬─────────────────────────────┬───────────────────┬─────────────────────────────────┤
│ No │ Aspek Keputusan             │ Pilihan Terpilih  │ Alasan & Pertimbangan Solutif   │
├────┼─────────────────────────────┼───────────────────┼─────────────────────────────────┤
│ 01 │ Arsitektur & Teknologi      │ **Capacitor Native│ Memanfaatkan 100% basis kode    │
│    │ Aplikasi Mobile             │ Android Shell**   │ React/TypeScript yang sudah ada,│
│    │                             │                   │ tanpa membuat dual-codebase,    │
│    │                             │                   │ serta menghasilkan proyek resmi │
│    │                             │                   │ Android Studio (Gradle).        │
├────┼─────────────────────────────┼───────────────────┼─────────────────────────────────┤
│ 02 │ Pipa Otomasi Build (CI/CD)  │ **GitHub Actions  │ Menghasilkan berkas APK secara  │
│    │ & Distribusi File APK       │ Workflow**        │ deterministik di cloud, bebas   │
│    │                             │                   │ kendala SDK lokal, dan artefak  │
│    │                             │                   │ APK langsung siap diunduh.      │
├────┼─────────────────────────────┼───────────────────┼─────────────────────────────────┤
│ 03 │ Strategi Konektivitas Sinyal│ **Offline-First   │ Seluruh aset UI dikemas dalam   │
│    │ di Kepulauan Banda          │ Hybrid Cache**    │ APK; direktori faskes & kontak  │
│    │                             │                   │ darurat bisa dibuka tanpa sinyal│
├────┼─────────────────────────────┼───────────────────┼─────────────────────────────────┤
│ 04 │ Desain Ergonomi Pengguna    │ **Bottom Nav Bar  │ Sesuai standar skill            │
│    │ Smartphone Android          │ (Thumb Zone)**    │ `mobile-design`, tombol aksi    │
│    │                             │                   │ utama berada di jangkauan jempol│
├────┼─────────────────────────────┼───────────────────┼─────────────────────────────────┤
│ 05 │ Fitur Mandat Utama          │ **Dedicated Faskes│ Navigasi cepat 1-klik untuk     │
│    │                             │ & Darurat Hub**   │ lokasi puskesmas via GPS dan    │
│    │                             │                   │ panggil ambulans laut.          │
└────┴─────────────────────────────┴───────────────────┴─────────────────────────────────┘
```

---

## 3. Arsitektur Sistem & Spesifikasi Teknis Proyek

### 3.1. Struktur Integrasi Direktori
Proyek Android diintegrasikan secara bersih berdampingan dengan frontend web tanpa mengubah struktur backend FastAPI yang sudah stabil:

```
penduduk/
├── frontend/                          # Basis Kode Web & Mobile React 18
│   ├── capacitor.config.ts            # Konfigurasi Inti Capacitor
│   ├── android/                       # Proyek Native Android Studio Standar
│   │   ├── app/
│   │   │   ├── build.gradle           # Konfigurasi SDK & dependensi Android
│   │   │   └── src/main/
│   │   │       ├── AndroidManifest.xml# Izin hardware (GPS, Jaringan, Kamera)
│   │   │       ├── java/.../          # MainActivity Native Android
│   │   │       └── res/               # Ikon Aplikasi Banda & Splash Screen
│   │   ├── build.gradle               # Root Gradle Project
│   │   └── gradlew                    # Gradle Wrapper Executable
│   ├── src/
│   │   ├── components/mobile/         # Komponen khusus antarmuka mobile
│   │   │   └── MobileBottomNav.tsx    # Bilah Navigasi Bawah Ramah Jempol
│   │   ├── views/faskes/              # Modul Khusus Mandat Syahid
│   │   │   └── FindHealthFacilities.tsx # Antarmuka Pencari Faskes & Darurat
│   │   └── services/native/           # Bridge Hardware Native
│   │       ├── geolocation.ts         # Integrasi GPS Native Capacitor
│   │       └── networkStatus.ts       # Deteksi Online / Offline Sinyal
├── .github/workflows/
│   └── build-android-apk.yml          # Otomasi GitHub Actions Build APK
```

### 3.2. Identitas Paket & Konfigurasi Versi Android
- **Application ID:** `com.bandanaira.ecosystem`
- **Application Name:** `Banda Digital Ecosystem`
- **Min SDK Version:** `24` (Android 7.0 Nougat) — Menjangkau lebih dari 96% smartphone masyarakat di pulau.
- **Target / Compile SDK Version:** `34` (Android 14) — Mematuhi standar keamanan Google Play Store terbaru.
- **Orientation:** Portrait (dengan auto-responsive jika dibuka di tablet).

### 3.3. Pustaka Inti & Plugin Native
```json
{
  "@capacitor/core": "^6.2.0",
  "@capacitor/cli": "^6.2.0",
  "@capacitor/android": "^6.2.0",
  "@capacitor/geolocation": "^6.1.0",
  "@capacitor/network": "^6.0.2",
  "@capacitor/status-bar": "^6.0.1"
}
```

### 3.4. Deklarasi Izin Android (`AndroidManifest.xml`)
Hanya meminta izin yang benar-benar dibutuhkan demi menjaga privasi warga:
```xml
<!-- Izin Akses GPS Native untuk Fitur Faskes Terdekat -->
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-feature android:name="android.hardware.location.gps" android:required="false" />

<!-- Izin Akses Jaringan & Deteksi Sinyal Offline -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

---

## 4. Perancangan Fitur Unggulan: "Find Health Facilities"

Modul **"Find Health Facilities"** dibangun sebagai implementasi spesifik dari mandat Syahid Ahmad Lahmady untuk menjamin perlindungan keselamatan warga dan wisatawan di pulau.

### 4.1. Data Fasilitas Kesehatan Terdaftar (Kepulauan Banda)
```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                 BASIS DATA FASILITAS KESEHATAN KEPULAUAN BANDA                         │
├────┬─────────────────────────────┬──────────────┬──────────────────┬───────────────────┤
│ ID │ Nama Fasilitas Kesehatan    │ Lokasi Pulau │ Koordinat GPS    │ Layanan Utama     │
├────┼─────────────────────────────┼──────────────┼──────────────────┼───────────────────┤
│ F1 │ RSUD Banda (Rumah Sakit)    │ Pulau Neira  │ -4.5262, 129.9042│ Rawat Inap, UGD   │
│    │                             │ (Nusantara)  │                  │ 24 Jam, Dokter    │
├────┼─────────────────────────────┼──────────────┼──────────────────┼───────────────────┤
│ F2 │ Puskesmas Banda Neira       │ Pulau Neira  │ -4.5245, 129.9015│ Poli Umum, KIA,   │
│    │                             │              │                  │ Tabung Oksigen    │
├────┼─────────────────────────────┼──────────────┼──────────────────┼───────────────────┤
│ F3 │ Poskesdes Lonthoir          │ Banda Besar  │ -4.5518, 129.8973│ Pertolongan P3K,  │
│    │                             │ (Lonthoir)   │                  │ Bidan Desa        │
├────┼─────────────────────────────┼──────────────┼──────────────────┼───────────────────┤
│ F4 │ Poskesdes Selamon           │ Banda Besar  │ -4.5672, 129.9511│ Perawatan Medis   │
│    │                             │ (Selamon)    │                  │ Petani Rempah     │
├────┼─────────────────────────────┼──────────────┼──────────────────┼───────────────────┤
│ F5 │ Pos Medis Darurat & P3K Ai  │ Pulau Ai     │ -4.5190, 129.7750│ Pos Medis Darurat │
│    │                             │              │                  │ Kepulauan Luar    │
├────┼─────────────────────────────┼──────────────┼──────────────────┼───────────────────┤
│ F6 │ Pos Medis Hatta             │ Pulau Hatta  │ -4.5912, 130.0125│ Kontak Radio Medis│
│    │                             │              │                  │ & Oksigen Darurat │
└────┴─────────────────────────────┴──────────────────┴───────────────────┘
```

### 4.2. Logika Algoritma Jarak Radius (Haversine Formula)
Aplikasi mendeteksi posisi GPS perangkat pengguna secara native menggunakan `@capacitor/geolocation`, kemudian secara matematis menghitung jarak langsung (garis lurus/nautika) ke setiap faskes secara *real-time* di sisi klien (*client-side calculation* tanpa perlu server):

$$d = 2r \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)}\right)$$

Hasil perhitungan diurutkan dari faskes **terdekat** ke terjauh, lengkap dengan estimasi waktu tempuh perahu motor (*speedboat*) atau jalan kaki.

### 4.3. Fitur Panggilan Darurat Bahari 1-Klik (*One-Click Emergency*)
Menyediakan tombol panggil langsung (`tel:`) ke:
- **Ambulans Laut Banda (Sea Ambulance):** Siaga evakuasi rujukan pasien antarpulau.
- **Pos SAR & Basarnas Banda:** Evakuasi kecelakaan kapal/diving di perairan laut Banda.
- **Unit Gawat Darurat (UGD) RSUD Banda.**

---

## 5. Alur Otomasi Build APK via GitHub Actions (CI/CD)

Untuk menjamin proses pembuatan APK berjalan lancar tanpa terhambat keterbatasan laptop lokal, dirancang workflow GitHub Actions:

```yaml
name: Build Android APK (Banda Ecosystem)

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  build-apk:
    name: Compile Android Debug APK
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Setup Java JDK 17
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'

      - name: Setup Android SDK
        uses: android-actions/setup-android@v3

      - name: Install Frontend Dependencies
        working-directory: frontend
        run: npm ci

      - name: Build Web Production Assets
        working-directory: frontend
        run: npm run build

      - name: Sync Capacitor to Android
        working-directory: frontend
        run: npx cap sync android

      - name: Build Android Debug APK
        working-directory: frontend/android
        run: ./gradlew assembleDebug --stacktrace

      - name: Upload APK Artifact
        uses: actions/upload-artifact@v4
        with:
          name: banda-digital-ecosystem-debug-apk
          path: frontend/android/app/build/outputs/apk/debug/*.apk
          retention-days: 30
```

---

## 6. Rencana Tahapan Eksekusi (Implementation Steps)

1. **Langkah 1: Setup Dependensi & Konfigurasi Capacitor** (Selesai)
   - Pasang paket `@capacitor/core`, `@capacitor/cli`, `@capacitor/android` di `frontend/`.
   - Buat berkas `capacitor.config.ts`.
   - Generate proyek native `android/` via `npx cap add android`.
2. **Langkah 2: Konfigurasi Plugin Native & Izin Android** (Selesai)
   - Pasang plugin `@capacitor/geolocation`, `@capacitor/network`, `@capacitor/status-bar`.
   - Daftarkan izin lokasi dan jaringan di `frontend/android/app/src/main/AndroidManifest.xml`.
3. **Langkah 3: Pembuatan Antarmuka Mobile & Fitur "Find Health Facilities"** (Selesai)
   - Buat komponen `MobileBottomNav.tsx` untuk navigasi jempol bawah layar.
   - Buat view `FindHealthFacilitiesView.tsx` dengan integrasi GPS dan direktori faskes Banda.
4. **Langkah 4: Kompilasi & Sinkronisasi Native** (Selesai)
   - Eksekusi `npm run build` dan `npx cap sync android`.
5. **Langkah 5: Penyusunan Alur Kerja GitHub Actions CI/CD** (Selesai)
   - Buat berkas `.github/workflows/build-android-apk.yml`.
   - Push ke repositori agar GitHub Actions mengompilasi dan menerbitkan berkas `app-debug.apk`.
6. **Langkah 6: Audit Keamanan APK via `testing-agent`**
   - Menjalankan audit kepatuhan Android sesuai panduan `.agents/skills/testing-agent/references/android.md`.
