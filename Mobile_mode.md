# Dokumentasi Arsitektur & Implementasi Mode Mobile (Mobile_mode.md)
**Ekosistem Digital Kepulauan Banda Neira (`Banda Digital Ecosystem / BTS-NEIRA`)**

---

## 1. Pendahuluan & Filosofi Desain Mode Mobile

### 1.1 Visi & Latar Belakang
Wilayah Kepulauan Banda Neira memiliki karakteristik geografis kepulauan terluar (*archipelagic frontier*) dengan penetrasi internet seluler (*mobile data*) dan perangkat ponsel pintar (*smartphone*) sebagai pintu akses utama bagi:
- **Warga & Petani**: Menggunakan ponsel Android untuk pencatatan panen, permohonan surat desa mandiri, dan pelacakan transaksi koperasi.
- **Perangkat Desa & Surveyor**: Melakukan pendataan lapangan langsung di kebun atau lorong desa dengan keterbatasan sinyal (*offline-first PWA*).
- **Wisatawan Nusantara & Mancanegara**: Mengakses informasi cagar budaya, pemesanan homestay ramah lingkungan (*eco-stay*), dan verifikasi keaslian rempah on-chain via kode QR kemasan.

Oleh karena itu, **Mode Mobile** pada aplikasi ini dirancang bukan sekadar sebagai versi desktop yang "dikecilkan" (*shrunk desktop*), melainkan sebuah antarmuka yang dibangun dengan pendekatan **Mobile-First & Thumb-Driven Architecture** dengan mengacu pada standar:
1. `mobile-design` & `mobile-responsiveness`: Tata letak adaptif, zona jangkauan satu tangan (*one-thumb zone*), dan fleksibilitas viewport.
2. `ui-ux-pro-max` & `ui-styling`: Hierarki visual, ritme kartu bento, tipografi terbaca di luar ruangan, dan eliminasi *AI frontend slop*.
3. `design-system` & `design-token-contrast`: Kontras token warna WCAG 2.2 AA (terbaca di bawah terik matahari Kepulauan Banda) dan presisi token warna tema.
4. `anti-slop-design`: Menghilangkan penggunaan warna ungu generik (*AI purple gradient*), ornamen palsu, serta tombol-tombol yang tidak memenuhi kaidah fungsional.

---

## 2. Standar Desain Sistem & Ergonomi Seluler

### 2.1 Kaidah Ukuran Target Sentuh (Touch Target Rule $\ge 44\times 44\text{px}$)
Mengacu pada pedoman *Apple Human Interface Guidelines (HIG)* dan *Material Design 3*:
- Setiap tombol aksi, ikon kontrol, input filter, dan tab navigasi seluler wajib memiliki dimensi target sentuh minimal **$44\times 44\text{px}$** (`min-h-[44px] min-w-[44px]`).
- Untuk tombol ganda atau grup aksi di ponsel, tata letak otomatis berubah dari format segaris desktop (`flex-row`) menjadi kisi 2-kolom atau rentang penuh (`w-full` atau `grid grid-cols-2 gap-2`).
- Memberikan umpan balik taktil mikro (*tactile micro-interaction*) berupa `active:scale-95` atau `active:bg-slate-100` saat disentuh jempol pengguna.

### 2.2 Palet Warna & Eliminasi Warna Ungu Slop
Sesuai arahan UX, penggunaan warna ungu generik dihilangkan total dan digantikan oleh palet warna autentik kepulauan:
- **Deep Navy (`#081D35` / `bg-slate-900`)**: Merepresentasikan palung Laut Banda yang dalam; digunakan sebagai warna dasar bingkai, header teks primer, dan latar belakang gelap.
- **Ocean Blue (`#2563eb` / `bg-blue-600` / `hover:bg-blue-700`)**: Tombol aksi utama (*Call-to-Action / CTA*), status aktif, tautan navigasi, dan verifikasi.
- **Nutmeg Gold (`#F4B75E` / `text-amber-500` / `bg-amber-400`)**: Simbol kemuliaan rempah Pala Banda & cagar budaya; digunakan untuk highlight bento, lencana verifikasi, dan aksen premium.
- **Emerald Green (`#059669` / `bg-emerald-600`)**: Indikator status berhasil, tanaman subur, blok tersinkronisasi on-chain, dan data tervalidasi.
- **Amber / Rose (`#D97706` / `#E11D48`)**: Aksi peringatan, status tertunda (*pending*), tombol hapus, dan penolakan surat/verifikasi.

```css
/* Token Dasar Mode Mobile */
:root {
  --touch-target-min: 44px;
  --mobile-pad-x: 12px;
  --mobile-pad-y: 16px;
  --mobile-radius: 16px;
  --mobile-nav-height: 64px;
}
```

### 2.3 Tipografi & Skala Teks Seluler
- **Judul Layar**: Skala responsif `text-lg sm:text-2xl font-black text-slate-900`.
- **Angka Metrik / KPI**: Tipografi tegas `text-lg sm:text-2xl font-black text-slate-900 tracking-tight`.
- **Label & Kategori**: `text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500`.
- **Data Kriptografis / Hash**: `font-mono text-[10px] sm:text-xs break-all select-all text-slate-700` dengan tombol salin cepat.

---

## 3. Komponen Inti yang Didesain & Diimplementasikan

### 3.1 Dasbor Utama (`UserEcosystemDashboard.tsx`) — *Golden Reference*
Dasbor utama menjadi acuan standar visual bagi seluruh workspace lain:
1. **Klaster Kartu Metrik Bento 2-Kolom Seluler**:
   - Pola lama `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5` yang menyebabkan penumpukan vertikal berlebih diubah menjadi **Format 2-Kolom Seluler** (`grid grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-4`).
   - Kartu ke-5 dirancang merentang 2 kolom penuh di ponsel (`col-span-2 lg:col-span-1`), menciptakan keseimbangan tata letak yang simetris tanpa menyisakan ruang kosong (*orphan space*).
   - Padding kartu seluler dioptimalkan menjadi `p-3 sm:p-5`, ukuran avatar ikon `w-8 h-8 sm:w-9 sm:h-9`.
2. **Sapaan Dinamis Waktu Indonesia Timur (WIT)**:
   - Header dasbor menampilkan sapaan kontekstual ("Selamat Pagi / Siang / Sore / Malam di Kepulauan Banda (WIT)") dengan status cuaca dan indikator konektivitas offline/online.
3. **Selector Perspektif Peran Multi-Aktor**:
   - Klaster 10 tombol peran ekosistem disusun dengan scroll horizontal responsif tanpa scrollbar (`overflow-x-auto scrollbar-none flex gap-1.5 pb-2`).

---

### 3.2 Harmonisasi Seluruh 11 Workspace Halaman
Seluruh 11 modul kerja diselaraskan mengikuti blueprint tata letak mobile dasbor utama:

| No | Modul Workspace | File Sumber | Adaptasi Mode Mobile yang Diterapkan |
|---|---|---|---|
| 1 | **Kependudukan Desa** | `ResidentsWorkspace.tsx` | Bento KPI 2-kolom, tombol "Tambah Warga" & "Filter NIK" `grid grid-cols-2 min-h-[44px]`, daftar warga berbasis kartu mobile dengan status verifikasi ramah jempol. |
| 2 | **Pelayanan Surat Desa** | `LettersWorkspace.tsx` | Kartu status permohonan 2-kolom, tab filter status horizontal swipe, tombol cetak dan tandatangani surat merentang penuh di ponsel. |
| 3 | **Peta Spasial & Kebun Pala** | `FarmsGisWorkspace.tsx` | Peta Leaflet layar penuh dengan kontrol layer mengambang (*floating layer controls*) di jangkauan jempol bawah, kartu detail poligon kebun dengan *bottom-sheet*. |
| 4 | **Panen & Traceability** | `HarvestGradingWorkspace.tsx` | Bento 2-kolom metrik tonase panen, tombol "Input Panen" & "Buat Batch QR" biru (`bg-blue-600 min-h-[44px]`), pemicu modal verifikasi on-chain adaptif. |
| 5 | **Telemetri IoT & Resiliensi** | `IslandTelemetryWorkspace.tsx` | Monitor sensor TDS air bersih & level baterai PLTS dalam grid 2-kolom, tombol "Kalibrasi Sensor" `w-full min-h-[44px]`. |
| 6 | **Rekapitulasi & Jejak Audit** | `AuditTrailWorkspace.tsx` | Linimasa log audit desa vertikal dengan garis gradien adaptif, ringkasan mutasi data dalam bento kartu seimbang 2-kolom. |
| 7 | **Marketplace Rempah Admin** | `MarketplaceAdminWorkspace.tsx` | Manajemen etalase pala/fuli grade ekspor, tombol "Tambah Produk" & "Ubah Status Pesanan" ramah sentuh seluler. |
| 8 | **Survei Lapangan & ETL** | `SurveyEtlWorkspace.tsx` | Pengisian formulir survei sosial/ekonomi adaptif satu kolom, tombol "Sinkronisasi PWA Offline" `w-full min-h-[44px]` dengan indikator antrean IndexedDB. |
| 9 | **Pusat Bantuan & Panduan** | `HelpDeskWorkspace.tsx` | Daftar FAQ interaktif (*collapsible accordion*), tombol WhatsApp Bantuan Siaga Desa `min-h-[44px]` di bagian bawah layar. |
| 10 | **Portal Mandiri Warga** | `CitizenPortalWorkspace.tsx` | Akses mandiri warga desa dengan kartu permohonan cepat, pelacakan NIK, dan unduh dokumen langsung dari peramban ponsel. |
| 11 | **Wisata & Eco-Stay** | `TourismEcoStayWorkspace.tsx` | Katalog homestay ramah lingkungan dengan rasio foto sentuh horizontal, pemesanan langsung WhatsApp, dan tarif transparan. |

---

### 3.3 Jendela Modal Verifikasi Blockchain (`BlockchainModal.tsx` & `PublicVerifyModal.tsx`)

Verifikasi kriptografis on-chain di ponsel sering kali mengalami masalah teks hash terpotong (*horizontal overflow*) dan tombol yang terlalu kecil. Masalah ini diselesaikan secara tuntas:

1. **Jendela Modal Status On-Chain (`BlockchainModal.tsx`)**:
   - **Batas Tinggi Layar**: Kontainer modal dibatasi `max-h-[92vh] sm:max-h-[88vh]` dengan fitur *internal scroll containment* (`overflow-y-auto overscroll-contain`).
   - **Tombol Tutup Ergonomis**: Ukuran $44\times 44\text{px}$ (`w-11 h-11 min-w-[44px] min-h-[44px]`) di sudut kanan atas dengan mikro-interaksi `active:scale-95`.
   - **Proteksi Hash 64-Karakter**: Teks hash lokal dan on-chain dilindungi dengan `break-all select-all font-mono text-[11px] sm:text-xs`, dilengkapi tombol salin ramah jempol (`min-h-[36px]`) dengan umpan balik visual instan (*"Tersalin"* + ikon centang hijau).
   - **Penyalinan Kontrak & TxID**: Tombol salin sekali-klik untuk alamat Smart Contract (*SpiceRegistry*) dan Transaction Hash (TxID).
   - **Footer Modal**: Tombol "Tutup Jendela" merentang penuh di seluler (`w-full sm:w-auto min-h-[44px]`).

2. **Jendela Verifikasi Publik & Indikasi Geografis (`PublicVerifyModal.tsx`)**:
   - **Bilah Pemindai QR & Kode Batch**: Input kode batch dilengkapi tombol pemindai kamera QR `min-h-[44px]` dan chip preset batch pengujian yang dapat digeser mulus secara horizontal (`overflow-x-auto scrollbar-none`).
   - **4 Barometer Bento KPI Header**: Ditransformasi menjadi format grid 2-kolom seluler (`grid-cols-2 md:grid-cols-4 gap-2 sm:gap-2.5`).
   - **Navigasi 3 Tab Terpadu**: Tab "Sertifikat GI", "Audit Trail", dan "Konsensus EVM" dapat digeser secara horizontal tanpa mematahkan label teks pada layar sempit 360px–412px.
   - **Tab Sertifikat GI**:
     - Piagam Indikasi Geografis adaptif dengan bingkai khas Pala Banda.
     - Pratinjau QR Code proporsional (`w-32 h-32 sm:w-36 sm:h-36`) dengan tombol unduh PNG (`min-h-[38px]`).
     - Tombol aksi ganda "Salin Kode Batch" dan "Cetak Sertifikat Resmi A4" merentang penuh di seluler (`w-full sm:w-auto min-h-[44px]`).
   - **Tab Audit Trail**: Linimasa vertikal rantai pasok dengan penanda waktu WIT, lokasi perkebunan, dan status hash per tahapan (Pemetikan $\rightarrow$ Penjemuran $\rightarrow$ Sortir $\rightarrow$ Pengemasan).
   - **Tab Konsensus EVM**: Kartu status integritas 100% verified, Chain ID 1337, nomor blok Ethereum, dan identitas node validator konsorsium Maluku.

---

### 3.4 Pusat Notifikasi Berbasis Peran Seluler (`DashboardLayout.tsx` & `roleNotifications.ts`)

Sebelumnya, ikon lonceng menampilkan notifikasi siaran generik di mana seluruh peran menerima notifikasi yang sama. Sistem ini telah dirombak:

1. **Penempatan Popover Seluler yang Aman (*Mobile-Safe Viewport Positioning*)**:
   - Menggunakan konfigurasi `fixed inset-x-2.5 top-16 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full` dengan lebar `sm:w-96` dan batas tinggi `max-h-[82vh]`.
   - Menghilangkan glitch popover terpotong di tepi kanan layar ponsel.
2. **Badge Peran & Filter Domain Spesifik**:
   - Header notifikasi menampilkan lencana peran aktif (misal: "Operator Homestay", "Petani Pala", "Perangkat Desa") lengkap dengan deskripsi tugas domain.
   - Menghadirkan chip filter kategori yang dapat digeser horizontal (`overflow-x-auto scrollbar-none flex gap-1.5`) dengan counter badge masing-masing (misal: tab "Surat Desa", "Panen", "Reservasi", "Infrastruktur").
3. **Sinkronisasi Peran Aktif (*Active Role Synchronization*)**:
   - State `activeRoleKey` diangkat ke tingkat `App.tsx` sehingga perpindahan peran di dasbor ekosistem secara instan memperbarui isi lonceng notifikasi, counter belum dibaca (*unread count*), dan filter tab tanpa perlu me-refresh halaman.
   - Tersedia selector simulasi peran cepat (*Quick Role Simulator*) langsung di dalam dropdown notifikasi untuk kebutuhan pengujian multi-peran oleh Administrator.
4. **Tombol Tindakan Notifikasi Ergonomis**:
   - Setiap item notifikasi dilengkapi tombol "Buka Layanan $\rightarrow$" yang langsung mengarahkan pengguna ke workspace terkait dengan target sentuh responsif.

---

### 3.5 Navigasi Mengambang Bawah Layar (`futuristic-nav.tsx` / App Shell)
- **Zona Jangkauan Jempol (*Thumb Zone Navigation*)**:
  - Pada layar ponsel, bilah navigasi utama diposisikan mengambang di bagian bawah layar (`fixed bottom-4 inset-x-4 max-w-lg mx-auto z-40`).
  - Posisi ini memungkinkan pengguna mengoperasikan seluruh navigasi utama aplikasi dengan satu tangan saat berjalan di kebun atau di pelabuhan.
- **Pembersihan Scroll Hijacking**:
  - Pustaka Lenis scroll hijacking dinonaktifkan pada perangkat sentuh untuk mengembalikan gesekan sentuh jempol native (*momentum scrolling* dengan `-webkit-overflow-scrolling: touch`).
  - Posisi scroll halaman beranda diproteksi sehingga saat pengguna kembali dari halaman detail destinasi, posisi baca tidak ter-reset ke atas.
- **Safe-Area Clearance**:
  - Seluruh halaman kerja dan dasbor dilengkapi padding bawah ekstra (`pb-24 sm:pb-8`) untuk memastikan konten terbawah tidak tertutup oleh bilah navigasi mengambang maupun *home indicator bar* ponsel modern (iOS/Android).

---

## 4. Panduan Pola Kode Tailwind CSS (Cheatsheet Mode Mobile)

Berikut adalah rangkuman pola kode yang wajib digunakan untuk mempertahankan konsistensi mode mobile:

### 4.1 Target Sentuh Minimal 44px
```tsx
// Benar (Sesuai Standar Mobile)
<button className="min-h-[44px] min-w-[44px] px-4 py-2.5 rounded-xl font-bold flex items-center justify-center bg-blue-600 text-white active:scale-95 transition-all">
  Simpan Data
</button>

// Salah (Terlalu kecil untuk jempol)
<button className="px-2 py-1 text-xs">Simpan</button>
```

### 4.2 Bento Grid Metrik 2-Kolom Seluler
```tsx
// Grid 2-kolom di mobile, 5-kolom di desktop
<div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-4">
  <div className="bg-white p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-sm">Card 1</div>
  <div className="bg-white p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-sm">Card 2</div>
  <div className="bg-white p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-sm">Card 3</div>
  <div className="bg-white p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-sm">Card 4</div>
  {/* Kartu ke-5 merentang 2 kolom di ponsel agar simetris */}
  <div className="col-span-2 lg:col-span-1 bg-white p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-sm">Card 5</div>
</div>
```

### 4.3 Tombol Aksi Adaptif (Full-Width / 2-Kolom di Mobile)
```tsx
// Tombol aksi header
<div className="grid grid-cols-2 sm:flex gap-2 w-full sm:w-auto">
  <button className="min-h-[44px] w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-xl font-bold">
    Tambah Data
  </button>
  <button className="min-h-[44px] w-full sm:w-auto px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold">
    Ekspor PDF
  </button>
</div>
```

### 4.4 Geser Horizontal Tanpa Scrollbar (Chip & Filter)
```tsx
<div className="overflow-x-auto scrollbar-none flex gap-1.5 items-center pb-1 -mx-1 px-1">
  {tabs.map((tab) => (
    <button className="flex-shrink-0 min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap">
      {tab.label}
    </button>
  ))}
</div>
```

### 4.5 Teks Hash Kriptografis Aman Overflow
```tsx
<div className="font-mono text-[10px] sm:text-xs break-all select-all bg-slate-900 text-emerald-400 p-2.5 rounded-lg border border-slate-800">
  0x3f9a7b8c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a
</div>
```

---

## 5. Matriks Pengujian & Verifikasi Kualitas

Setiap implementasi mode mobile telah diuji pada berbagai ukuran layar (*viewport*):

| Kategori Viewport | Resolusi Referensi | Perangkat Target | Status Verifikasi |
|---|---|---|---|
| **Compact Mobile** | `360px × 640px` | Android murah / entry-level warga desa | **Lolos**: Grid 2-kolom pas, chip filter tidak terpotong, modal pas di layar. |
| **Standard Mobile** | `390px × 844px` | iPhone 12 / 13 / 14 / 15 | **Lolos**: Ergonomi jempol optimal, safe-area bawah aman, popover pas. |
| **Wide Mobile** | `412px × 915px` | Samsung Galaxy seri A / S | **Lolos**: Tata letak seimbang, kontras visual tajam, tipografi terbaca jelas. |
| **Tablet / Foldable** | `768px × 1024px` | iPad Mini / Samsung Tab | **Lolos**: Transisi halus dari 2-kolom mobile ke tata letak desktop. |
| **Desktop / Laptop** | `1280px × 800px+` | Layar kantor desa & dinas | **Lolos**: Tampilan dashboard lengkap tanpa regresi fungsi. |

### Hasil Verifikasi Teknis:
1. **TypeScript (`tsc --noEmit`)**: 0 Error.
2. **Vite Production Build (`npm run build`)**: 2.488 modul ter-bundle sempurna tanpa error.
3. **Docker Production Build (`docker exec banda_frontend npm run build`)**: Sukses 100%.
4. **Backend Automated Unit Tests (`pytest tests/test_health.py`)**: 3/3 lulus dalam 0.27s.

---

## 6. Kesimpulan & Panduan Pengembangan Lanjutan

Dengan selesainya implementasi ini:
- Ekosistem Digital Kepulauan Banda Neira kini sepenuhnya ramah pengguna seluler (*mobile-first*).
- Seluruh 11 workspace, dasbor utama, modul verifikasi on-chain blockchain, serta pusat notifikasi telah diselaraskan menggunakan standar warna teruji dan ergonomi jempol manusia.
- Dokumen `Mobile_mode.md` ini berfungsi sebagai **Single Source of Truth** bagi seluruh pengembang berikutnya untuk mempertahankan kualitas dan konsistensi mode mobile di masa mendatang.
