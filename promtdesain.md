Tolong rombak tata letak halaman utama Dashboard Ekosistem (`Dashboard`) pada project React + TypeScript + Tailwind CSS saya agar mengikuti struktur baru yang menggabungkan Header Floating Search minimalis dan 4 klaster baris grafik lintas seluruh workspace Ekosistem Banda Digital.

Lakukan perubahan dengan spesifikasi detail berikut (pertahankan logika pengambilan data, state, dan integrasi API yang sudah ada, hanya perbarui struktur UI/UX dan tata letaknya):

### 1. HEADER FLOATING SEARCH BAR (SATU BARIS)
- Hapus top bar lama (yang berisi breadcrumb "Dashboard | Administrator Sistem") serta pindahkan kotak pencarian dan kartu profil yang ada di area judul konten agar tidak terjadi duplikasi dengan kartu profil di sidebar bawah.
- Buat komponen Header berbentuk floating bar (persegi panjang memanjang dengan `rounded-xl`, `bg-white`, `border border-slate-200/80`, `shadow-sm`, dan margin rapi dari tepi atas/samping).
- **Sisi Kiri Header:** Input pencarian global dengan ikon kaca pembesar dan placeholder `"Cari data, batch, berkas... (Ctrl+/)"` tanpa border kotak di dalam inputnya. Tambahkan event listener shortcut keyboard `Ctrl + /` agar otomatis memfokuskan kursor ke input ini.
- **Sisi Kanan Header:** Susun deretan ikon utilitas rapi:
  1. Indikator status sistem (`Online` dengan titik hijau).
  2. Tombol toggle Dark/Light mode (ikon bulan).
  3. Tombol Quick Menu / App Grid (ikon kotak 4) yang berisi pintasan menuju `"Beranda Desa"`, `"Unduh Data Terbuka"`, dan `"Verifikasi Batch Blockchain"`.
  4. Tombol Notifikasi (ikon lonceng) lengkap dengan badge angka merah di pojok kanan atas ikon.

### 2. AREA SAPAAN PENGGUNA (WELCOME SUB-HEADER)
- Tepat di bawah Floating Header, tampilkan judul sapaan dinamis sesuai waktu lokal (WIT): `"Selamat Pagi/Siang/Sore/Malam, [Nama User] 👋"` diikuti sub-judul `"Ringkasan Eksekutif Lintas Workspace • Ekosistem Terpadu Banda Neira"`.
- Hapus baris filter "Perspektif Role" dan panel samping kanan lama ("Transparansi Data", "Unduh Data Terbuka", "Verifikasi Batch") dari layar utama (pindahkan fungsi panel kanan ke dalam modal/drawer yang dipicu dari tombol Quick Menu di header) agar area grafik mendapatkan lebar penuh (100% grid).

### 3. TATA LETAK 4 KLASTER BARIS GRAFIK UTAMA (LINTAS 11 WORKSPACE)
Susun konten utama dashboard ke dalam 4 baris grid yang responsif dan proporsional:

- **Baris 1: 4 Kartu KPI Lintas Sektor Utama (`grid-cols-1 sm:grid-cols-2 xl:grid-cols-4`)**
  1. **Kependudukan (`population`):** Total Penduduk Terdaftar & persentase pertumbuhan.
  2. **Produksi Pala (`farming` & `traceability`):** Total Tonase Panen Pala terverifikasi.
  3. **Ekonomi Koperasi (`koperasi`):** Total Perputaran Omzet Koperasi Hatta.
  4. **Pariwisata (`tourism`):** Total Kunjungan Wisatawan & Tingkat Okupansi Eco-Stay.

- **Baris 2: Klaster Komoditas, Koperasi & Ketertelusuran (`grid-cols-1 lg:grid-cols-12`)**
  - **Kolom Kiri (7 kolom):** Grafik Multi-Line / Bar Chart bulanan *"Tren Produksi Pala & Transaksi Koperasi"* (membandingkan tonase panen kebun dan omzet kasir Koperasi Hatta).
  - **Kolom Kanan (5 kolom):** Grafik Donut / Stacked Bar *"Komposisi Mutu & Unit Usaha"* (persentase Grade A, Grade B, Fuli, serta ringkasan tonase Bank Sampah dan distribusi galon Air RO).

- **Baris 3: Klaster Pariwisata, Spasial GIS & Smart Planner (`grid-cols-1 lg:grid-cols-12`)**
  - **Kolom Kiri (7 kolom):** Kartu *"Peta Sebaran Spasial Terpadu (GIS)"* yang menampilkan titik sebaran Plot Kebun Pala, 177 Situs Cagar Budaya, Eco-Stay, dan Stasiun IoT beserta tombol `"Buka Peta"`.
  - **Kolom Kanan (5 kolom):** Grafik Area Chart / Ringkasan *"Wisata & Smart Planner DSS"* (perbandingan wisatawan Nusantara vs Mancanegara, tingkat okupansi Eco-Stay, dan rute favorit Smart Planner).

- **Baris 4: Klaster Layanan Publik, Survei, IoT & Audit Blockchain (`grid-cols-1 lg:grid-cols-12`)**
  - **Kolom Kiri (6 kolom):** Kartu *"Layanan Surat & Survei Desa (`letters` + `survei`)"* berisi progress bar rasio status surat warga (Selesai vs Diproses) dan progres capaian sensus lapangan.
  - **Kolom Kanan (6 kolom):** Kartu *"Telemetri IoT & Audit Blockchain (`iot` + `audit`)"* berisi status kesehatan 4 stasiun cuaca pulau (persentase baterai solar panel, suhu, curah hujan) dan status validasi block terbaru pada ledger blockchain.

### 4. KONSISTENSI VISUAL
- Gunakan palet warna biru gelap (`#0F2C59`) sebagai warna primer aksen judul/ikon agar selaras dengan sidebar yang sudah ada, dengan latar belakang kartu putih bersih (`bg-white`), sudut membulat (`rounded-2xl`), dan garis tepi halus (`border-slate-200/80`).
