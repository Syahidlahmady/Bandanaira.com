# DOKUMEN SPESIFIKASI KEBUTUHAN PERANGKAT LUNAK (SRS)
## Mandat Spesialis UI/UX Designer & Security Specialist
**Ekosistem Digital Banda Neira (Banda Smart Tourism & Island Resource Ecosystem)**

---

| Metadata Dokumen | Keterangan |
| :--- | :--- |
| **Nama Proyek** | Banda Digital Ecosystem (BST-NIRANA) |
| **Spesialis Pelaksana** | **Syahid Ahmad Lahmady** |
| **Peran / Posisi** | **UI/UX Designer & Security Specialist** |
| **Institusi** | LabSos Informatika Universitas Nahdlatul Ulama (UNU) Yogyakarta & Tim KKN-PPM UGM Neira Basudara 2026 |
| **Lokasi Implementasi** | Kepulauan Banda (Banda Neira, Lonthoir, Banda Besar, Pulau Ai, Pulau Rhun, Pulau Hatta), Kab. Maluku Tengah |
| **Dosen Pembimbing Lapangan** | Restiadi Bayu Taruno, S.T., M.Eng. |
| **Status Dokumen** | **Active Master Specification & Agent Operational Guide** |
| **Tanggal Pembaruan** | 27 November 2026 |

---

## BAB I: PENDAHULUAN & TUJUAN DOKUMEN

### 1.1 Tujuan Dokumen (Purpose)
Dokumen **Spesifikasi Kebutuhan Perangkat Lunak (SRS)** ini disusun khusus sebagai acuan tunggal (*Single Source of Truth*) dan panduan instruksional bagi **AI Agent** dan pengembang untuk memahami, memetakan, memverifikasi, serta memproduksi laporan-laporan resmi yang diamanatkan dalam dokumen **Mandat Syahid Ahmad Lahmady** (`Mandat_SyahidAhmadLahmady.docx`).

Dokumen ini membedakan secara tegas antara:
1. **Tugas yang Telah Selesai Dikerjakan (Done & Verified)**: Dihasilkan laporannya secara komprehensif, berbasis data nyata sistem, dan terdokumentasi lengkap dalam repositori.
2. **Tugas yang Belum Dikerjakan (Pending / Future Roadmap)**: Diberikan spesifikasi teknis, batasan, prasyarat, dan langkah kerja yang jelas agar AI Agent dapat mengeksekusinya pada sesi mendatang tanpa kehilangan konteks.

---

### 1.2 Profil & Ruang Lingkup Peran (Role Profile)
- **Nama Anggota:** Syahid Ahmad Lahmady
- **Fokus Keahlian:** 
  1. *UI/UX Design* untuk platform web terpadu dan aplikasi mobile responsif.
  2. *Security Engineering & Data Protection* berbasis pendekatan *Security-by-Design* dan *Defense in Depth*.
  3. *Security Audit, Vulnerability Assessment, & Digital Forensics* berbasis OWASP dan UU No. 27 Tahun 2022 (UU PDP).
  4. Pengembangan fitur layanan publik kesehatan kepulauan (*Find Health Facilities*).
  5. Kolaborasi pemetaan infrastruktur digital dan konektivitas kepulauan.

---

## BAB II: MATRIKS STATUS MANDAT (COMPLETED VS PENDING)

Berdasarkan mandat resmi dan hasil implementasi aktual pada basis kode sistem, berikut adalah status pencapaian tugas Syahid Ahmad Lahmady:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│               MATRIKS STATUS PENYELESAIAN MANDAT SYAHID AHMAD LAHMADY                  │
├────┬────────────────────────────────────────┬───────────┬──────────────────────────────┤
│ No │ Tugas Mandat Dokumen                   │ Status    │ Bukti / Artefak Terkait      │
├────┼────────────────────────────────────────┼───────────┼──────────────────────────────┤
│ 1  │ Merancang UI/UX Platform Web & Mobile  │ SELESAI   │ `frontend/src/`, Tailwind,   │
│    │ (Design System, High-Fidelity, Kiosk)  │ (100%)    │ Color Tokens, Dashboard, GIS │
├────┼────────────────────────────────────────┼───────────┼──────────────────────────────┤
│ 2  │ Mengimplementasikan Sistem Keamanan &  │ SELESAI   │ 5-Layer Defense in Depth,    │
│    │ Proteksi Data (Security-by-Design)     │ (100%)    │ AES-256 PII, RBAC, Blacklist │
├────┼────────────────────────────────────────┼───────────┼──────────────────────────────┤
│ 3  │ Melakukan Audit Keamanan & Digital     │ SELESAI   │ `pengujian-V1.md`, V2,       │
│    │ Forensics (Testing Agent, VA/PT)       │ (100%)    │ Sesi `20261126T173846Z`      │
├────┼────────────────────────────────────────┼───────────┼──────────────────────────────┤
│ 4  │ Mengembangkan Aplikasi Android BST     │ BELUM     │ Direncanakan pada sprint     │
│    │ (Skeleton, Kotlin/RN, APK Alpha)       │ (PENDING) │ pengembangan mobile mandiri  │
├────┼────────────────────────────────────────┼───────────┼──────────────────────────────┤
│ 5  │ Mengembangkan Fitur Mobile             │ BELUM     │ Menunggu integrasi data      │
│    │ "Find Health Facilities"               │ (PENDING) │ Faskes bersama CoP Fauzan    │
├────┼────────────────────────────────────────┼───────────┼──────────────────────────────┤
│ 6  │ Pemetaan Infrastruktur Digital & Akses │ BELUM     │ Menunggu agenda survei sinyal│
│    │ Internet Kepulauan (bersama Reyhan)    │ (PENDING) │ lapangan bersama Reyhan      │
└────┴────────────────────────────────────────┴───────────┴──────────────────────────────┘
```

---

## BAB III: SPESIFIKASI MODUL & TUGAS YANG TELAH SELESAI (COMPLETED)

### 3.1 Modul 1: UI/UX Platform Web & Mobile Responsive
- **Kondisi Implementasi:**
  - Antarmuka berbasis React 18, Vite, TypeScript, dan Tailwind CSS.
  - Skema warna identitas resmi Kepulauan Banda:
    - **Deep Navy (`#081D35` / `#0a192f`):** Merepresentasikan kedalaman Palung Laut Banda dan stabilitas platform pemerintahan desa.
    - **Nutmeg Gold (`#F4B75E` / `#e5a93c`):** Merepresentasikan buah pala emas dan kejayaan historis rempah Banda.
    - **Ocean Blue (`#2563eb` / `#1d4ed8`):** Merepresentasikan maritim, konektivitas antarpulau, dan keterbukaan publik.
    - **Purity White / Slate (`#F8FAFC` / `#0f172a`):** Tipografi berkontras tinggi memenuhi standar WCAG 2.2 AA.
  - **Dua Paradigma Penggunaan Antarmuka:**
    1. *Personal Mobile/Desktop Mode*: Digunakan oleh wisatawan, masyarakat pribadi, surveyor, dan admin dari perangkat mandiri.
    2. *Shared Kiosk Mode (Kantor Desa / Balai Desa)*: Digunakan bergantian oleh warga untuk cetak surat mandiri dan cek kuota air/tabungan. Menggunakan isolasi `sessionStorage` agar data warga sebelumnya terhapus seketika saat peramban ditutup.
  - **Ruang Kerja Multi-Aktor:**
    - Dasbor Ekosistem Dinamis (`UserEcosystemDashboard.tsx`) dengan *multi-role switcher*.
    - Ruang Kerja Kependudukan Satu-Klik NIK (`ResidentsWorkspace.tsx`).
    - Peta Spasial Interaktif Fullscreen Leaflet.js (`InteractiveMapWorkspace.tsx`).
    - Portal Wisata, Ecostay, dan CMS Sejarah Pokdarwis (`PokdarwisHistoryCms.tsx`).
    - Kasir Koperasi Terpadu Timbangan & Bank Sampah (`KoperasiWorkspace.tsx`).
- **Dokumen Laporan Terkait:**
  - `01_DOKUMEN_DESAIN_UIUX_DAN_DESIGN_SYSTEM.md`
  - `02_LAPORAN_PENGUJIAN_UIUX_DAN_USABILITY.md`

---

### 3.2 Modul 2: Sistem Keamanan & Proteksi Data Pribadi (Security-by-Design)
- **Kondisi Implementasi:**
  - Menerapkan arsitektur **5-Lapisan Pertahanan Berlapis (*Defense in Depth*)**:
    1. **Lapisan 1 (Browser & Client Perimeter):** Injeksi 5 Security Headers OWASP (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection`, `Referrer-Policy`, `Permissions-Policy`), pemindahan penyimpanan auto-save draf dari `localStorage` ke `sessionStorage`.
    2. **Lapisan 2 (Network Perimeter & Rate Limiting):** Perlindungan endpoint publik `/auth/identify-account` dari pemindaian bot via sliding-window IP rate limiter (maksimal 20 request/menit per IP) dan sensor nama warga (*data masking*, e.g., `S**** A****`).
    3. **Lapisan 3 (Identity, Auth, & Session Controls):** Otentikasi berbasis JWT dengan *thread-safe server-side revocation store* (`TokenBlacklistStore`), penghapusan total pintu belakang `offline-jwt-*` dev token secara *fail-closed*.
    4. **Lapisan 4 (API Authorization & Function-Level RBAC):** Penghapusan celah BOLA/IDOR pada pengajuan surat kependudukan, validasi hak kepemilikan NIK, dan pengetatan izin kasir/koperasi (`ROLE_ADMIN`, `ROLE_COOP_MANAGER`, `ROLE_VILLAGE_OFFICER`).
    5. **Lapisan 5 (Data Protection & Storage at Rest):** Utilitas kriptografi AES-256-GCM terotentikasi untuk data sensitif di `crypto_nik.py`, *Fail-Closed Secret Guard* pada startup server yang menggagalkan proses boot jika mendeteksi kunci rahasia default di lingkungan produksi, serta prinsip mutlak **Zero PII on Blockchain**.
- **Dokumen Laporan Terkait:**
  - `03_DOKUMEN_THREAT_MODEL_DAN_RANCANGAN_KEAMANAN.md`
  - `06_CHECKLIST_KEAMANAN_OWASP_DAN_KEPATUHAN_PDP.md`

---

### 3.3 Modul 3: Audit Keamanan, Penetration Testing, & Digital Forensics
- **Kondisi Implementasi:**
  - Menggunakan perkakas forensik dan audit independen **Testing Agent** (`.agents/skills/testing-agent`).
  - **Siklus Audit Lengkap Terbukti:**
    - **Audit Putaran 1 (Run `20261126T162919Z-ff3ab810`):** Mengidentifikasi 9 kerentanan riil (1 Critical, 3 High, 4 Medium, 1 Low). Seluruh temuan terdokumentasi pada berkas root `pengujian-V1.md`.
    - **Remedi & Perbaikan Keamanan:** Mengimplementasikan perbaikan teknis pada backend, frontend, konfigurasi, dan unit testing. Seluruh langkah dicatat pada `perbaikan-V1.md`.
    - **Pengujian Ulang Putaran 2 (Run `20261126T173846Z-ceb0daa0`):** Menjalankan 17 checks ulang, 13 berkas bukti forensik terindeks hash kriptografis SHA-256, diverifikasi dengan perintah `testing_support.py verify-run`. Hasil: **17 passed (100%), 0 confirmed findings**. Dicatat pada `pengujian-V2.md`.
- **Dokumen Laporan Terkait:**
  - `04_LAPORAN_VULNERABILITY_ASSESSMENT_VA.md`
  - `05_LAPORAN_PENETRATION_TESTING_DAN_DIGITAL_FORENSIK.md`

---

## BAB IV: SPESIFIKASI TUGAS YANG BELUM DIKERJAKAN (PENDING / ROADMAP)

Bagian ini menjadi acuan mutlak bagi AI Agent di masa mendatang untuk mengeksekusi tugas lanjutan Syahid Ahmad Lahmady:

### 4.1 Tugas Pending 1: Pengembangan Aplikasi Android BST (MVP/Alpha)
- **Latar Belakang:** Dibutuhkan aplikasi native/cross-platform Android ringan yang dapat beroperasi lancar di smartphone warga dan wisatawan dengan keterbatasan RAM (2–3 GB) dan sinyal lemah.
- **Kebutuhan Teknis:**
  - Pilihan Framework: React Native / Expo atau Kotlin Jetpack Compose.
  - Fitur Utama:
    - Splash Screen & Onboarding ramah kepulauan.
    - Katalog Wisata 4A & Cagar Budaya Banda.
    - Peta Offline Caching (Tiles mbtiles/vector sederhana untuk navigasi tanpa kuota).
    - Mode Cek Permohonan Surat NIK Warga.
- **Prasyarat Eksekusi:** Penyusunan skeleton proyek pada direktori `android/` atau repositori terpisah, build konfigurasi Gradle, dan ekspor berkas APK Alpha.

### 4.2 Tugas Pending 2: Fitur "Find Health Facilities" (Puskesmas & Posyandu Finder)
- **Latar Belakang:** Akses faskes darurat di kepulauan (Puskesmas Banda Neira, RSUD Banda, Poskesdes Lonthoir, Posyandu Pulau Ai/Hatta) sangat krusial saat insiden kecelakaan diving, gigitan hewan laut beracun, atau persalinan.
- **Kebutuhan Teknis:**
  - Pengumpulan data koordinat geospasial faskes, jadwal dokter, kontak ambulans laut / perahu cepat, ketersediaan tabung oksigen & antivenom.
  - Antarmuka pencarian instan berdasarkan kedekatan radius GPS pengguna (*Geofencing/Haversine formula*).
  - Mode offline: menyimpan nomor darurat dan lokasi faskes di SQLite/AsyncStorage lokal.
- **Prasyarat Eksekusi:** Penyelarasan dataset faskes dengan anggota tim CoP Kesehatan (Fauzan).

### 4.3 Tugas Pending 3: Laporan Infrastruktur Digital & Akses Internet
- **Latar Belakang:** Kondisi topografi vulkanik Pulau Banda Besar dan isolasi laut antarpulau (Pulau Ai, Pulau Rhun, Pulau Hatta) menyebabkan kesenjangan sinyal (blank spot 4G Telkomsel/Indosat).
- **Kebutuhan Teknis:**
  - Pemetaan titik menara BTS, kecepatan bandwidth download/upload via Speedtest, stabilitas latensi (*jitter & ping*), dan rasio downtime saat pemadaman listrik PLTD Neira.
  - Perumusan rekomendasi teknologi *offline-first sync* dan *local intranet mesh node*.
- **Prasyarat Eksekusi:** Survei sinyal langsung di lapangan berkoordinasi dengan rekan tim Reyhan.

---

## BAB V: DAFTAR DOKUMEN LAPORAN RESMI YANG DITERBITKAN

Berdasarkan pembagian tugas di atas, berikut adalah inventaris dokumen laporan resmi yang diterbitkan di dalam folder `docs/mandat_syahidl_ahmady/`:

| Nomor Berkas | Nama Berkas Laporan | Ruang Lingkup Tugas | Status Penerbitan |
| :--- | :--- | :--- | :--- |
| **00** | [`SRS.md`](file:///home/hid/Projects/BTS-NEIRA/penduduk/docs/mandat_syahidl_ahmady/SRS.md) | Spesifikasi Induk Kebutuhan & Panduan Agent | **TERBIT (Aktif)** |
| **01** | [`01_DOKUMEN_DESAIN_UIUX_DAN_DESIGN_SYSTEM.md`](file:///home/hid/Projects/BTS-NEIRA/penduduk/docs/mandat_syahidl_ahmady/01_DOKUMEN_DESAIN_UIUX_DAN_DESIGN_SYSTEM.md) | Desain UI/UX Web, Mobile, & Design System | **TERBIT (Selesai)** |
| **02** | [`02_LAPORAN_PENGUJIAN_UIUX_DAN_USABILITY.md`](file:///home/hid/Projects/BTS-NEIRA/penduduk/docs/mandat_syahidl_ahmady/02_LAPORAN_PENGUJIAN_UIUX_DAN_USABILITY.md) | Hasil Pengujian Usability, Kiosk, & Web Vitals | **TERBIT (Selesai)** |
| **03** | [`03_DOKUMEN_THREAT_MODEL_DAN_RANCANGAN_KEAMANAN.md`](file:///home/hid/Projects/BTS-NEIRA/penduduk/docs/mandat_syahidl_ahmady/03_DOKUMEN_THREAT_MODEL_DAN_RANCANGAN_KEAMANAN.md) | Threat Modeling STRIDE & Arsitektur Berlapis | **TERBIT (Selesai)** |
| **04** | [`04_LAPORAN_VULNERABILITY_ASSESSMENT_VA.md`](file:///home/hid/Projects/BTS-NEIRA/penduduk/docs/mandat_syahidl_ahmady/04_LAPORAN_VULNERABILITY_ASSESSMENT_VA.md) | Laporan Penilaian Kerentanan Awal (VA V1) | **TERBIT (Selesai)** |
| **05** | [`05_LAPORAN_PENETRATION_TESTING_DAN_DIGITAL_FORENSIK.md`](file:///home/hid/Projects/BTS-NEIRA/penduduk/docs/mandat_syahidl_ahmady/05_LAPORAN_PENETRATION_TESTING_DAN_DIGITAL_FORENSIK.md) | Laporan Uji Penetrasi & Forensik Retest (V2) | **TERBIT (Selesai)** |
| **06** | [`06_CHECKLIST_KEAMANAN_OWASP_DAN_KEPATUHAN_PDP.md`](file:///home/hid/Projects/BTS-NEIRA/penduduk/docs/mandat_syahidl_ahmady/06_CHECKLIST_KEAMANAN_OWASP_DAN_KEPATUHAN_PDP.md) | Matriks Kepatuhan OWASP & UU PDP 27/2022 | **TERBIT (Selesai)** |

---

## BAB VI: PETUNJUK OPERASIONAL BAGI AI AGENT (AGENT INSTRUCTIONS)

1. **Prinsip Validitas & Kebenaran (Rule 10 AGENTS.md):**
   - AI Agent dilarang memalsukan hasil implementasi atau menyatakan fitur mobile/Android telah selesai padahal belum dibangun.
   - Laporan yang diterbitkan saat ini **HANYA** mencakup tiga tugas yang telah tuntas: UI/UX Web-Mobile, Sistem Keamanan Berlapis, dan Audit Forensik Keamanan.
2. **Konsistensi Visual & Nilai Identitas:**
   - Pertahankan identitas warna Banda Neira (*Deep Navy*, *Nutmeg Gold*, *Ocean Blue*). Hindari elemen visual generik (*anti-slop*).
3. **Keterkaitan Bukti Digital Forensik:**
   - Seluruh klaim keamanan dalam laporan harus merujuk ke data empiris pada [`pengujian-V1.md`](file:///home/hid/Projects/BTS-NEIRA/penduduk/pengujian-V1.md), [`perbaikan-V1.md`](file:///home/hid/Projects/BTS-NEIRA/penduduk/perbaikan-V1.md), [`pengujian-V2.md`](file:///home/hid/Projects/BTS-NEIRA/penduduk/pengujian-V2.md), dan berkas pengujian unit `backend/tests/test_defense_in_depth.py`.
4. **Instruksi Pelaksanaan Tugas Lanjutan:**
   - Saat pengguna meminta mengerjakan tugas lanjutan (Android, Faskes, atau Infrastruktur Jaringan), baca Bab IV dalam dokumen ini, rancang arsitekturnya terlebih dahulu, dan implementasikan secara bertahap.
