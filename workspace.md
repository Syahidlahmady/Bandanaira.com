# Dokumentasi Arsitektur & Inventarisasi Fitur Workspace
## Ekosistem Digital Terpadu Kepulauan Banda Neira (Banda Digital Ecosystem)

---

## 1. Pendahuluan & Filosofi Arsitektur Workspace

Banda Digital Ecosystem dirancang untuk memenuhi kebutuhan tata kelola kepulauan terluar, pelestarian cagar budaya jalur rempah dunia, pemberdayaan ekonomi komoditas pala, serta layanan publik desa kepulauan secara terpadu.

Sistem menerapkan prinsip-prinsip utama:
- **Strict Role-Based Access Control (RBAC):** Backend selalu memvalidasi token JWT dan wewenang pengguna. Frontend secara dinamis menyesuaikan navigasi dan antarmuka.
- **Privacy & Security by Design:** Perlindungan PII (Nomor Induk Kependudukan, nomor kontak privat, koordinat rumah tangga) terenkripsi dan tidak pernah diekspos ke publik atau dicatat di blockchain.
- **Off-Chain Data, On-Chain Verification:** Data operasional disimpan di PostgreSQL/PostGIS, sementara identitas kanonikal (*deterministic JSON hash*) diterbitkan ke blockchain EVM (Sepolia/Arbitrum) untuk integritas anti-manipulasi.
- **Island-Resilient & Offline-Tolerant:** Antarmuka responsif terhadap fluktuasi sinyal kepulauan dengan TanStack Query caching dan fallback lokal.

---

## 2. Matriks Hak Akses Peran Pengguna (Role Access Matrix)

Sistem melayani 10 peran pengguna resmi:
1. `admin` : Administrator Sistem Kepulauan (Akses Penuh)
2. `village_officer` : Aparatur Pemerintah Desa (Kaur Pemerintahan, Sekdes, Kades)
3. `farmer_group_admin` : Ketua Kelompok Tani (Poktan)
4. `farmer` : Petani Rempah Mandiri (Pala & Fuli Banda)
5. `resident` : Warga Desa Kepulauan
6. `coop_manager` : Pengelola Koperasi Banda (Koperasi Hatta & Unit Usaha)
7. `homestay_operator` : Operator Homestay & Eco-Stay
8. `smart_tourism_admin` : Redaksi & Pengurus Pokdarwis (Kelompok Sadar Wisata)
9. `field_surveyor` : Surveyor Geospasial & Lapangan Desa
10. `tourist` : Wisatawan Domestik / Mancanegara (Publik)

| Modul Workspace | Admin | Perangkat Desa | Ketua Poktan | Petani | Warga | Pengelola Koperasi | Operator Homestay | Admin Wisata / Pokdarwis | Surveyor | Wisatawan / Publik |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Dashboard Terpadu** (`UserEcosystemDashboard.tsx`) | Full (Multi-Role Switcher) | View Officer | View Poktan | View Farmer | View Warga | View Koperasi | View Homestay | View Pokdarwis / CMS | View Surveyor | View Tourist |
| **Kependudukan Master** (`ResidentsWorkspace.tsx`) | CRUD + Verifikasi | CRUD + Verifikasi | - | - | - | - | - | - | - | - |
| **Portal Mandiri Warga** (`CitizenPortalWorkspace.tsx`) | Audit | Verifikasi Surat | Read | Read | Ajukan Surat & Cek Kuota | - | - | - | - | - |
| **Verifikasi Surat Desa** (`LettersWorkspace.tsx`) | Approval + Cetak | Approval + Cetak | - | - | - | - | - | - | - | - |
| **GIS Kebun Pala** (`FarmsGisWorkspace.tsx`) | Full | Full | Kelola Blok & Petani | Plot Batas Sendiri | - | Read | - | - | Validasi Spasial | Read Terbuka |
| **Panen & Mutu Pala** (`HarvestGradingWorkspace.tsx`) | Full + On-Chain | Full | Input Panen Poktan | Input Panen Sendiri | - | Terima Setoran | - | - | - | Cek QR Traceability |
| **Kasir & Koperasi Hatta** (`KoperasiKasirWorkspace.tsx`) | Full | Audit | Read | Transaksi | Cek Saldo & Air RO | Kasir & Bank Sampah | Mitra Belanja | - | - | Beli Retail |
| **Cagar & Homestay** (`TourismEcoStayWorkspace.tsx`) | Full | Validasi Izin | - | - | - | Mitra Logistik | Kelola Kamar & WhatsApp | Kelola Wisata & CMS Sejarah | Survei Cagar | Reservasi & Ulasan |
| **Peta Spasial GIS 7-Layer** (`InteractiveMapWorkspace.tsx`) | Full Spatial Studio | Full Analisis | Layer Pertanian | Layer Kebun | Layer Layanan | Layer Ekonomi | Layer Wisata | Layer Heritage | Editor Spasial | Layer Publik |
| **Smart Tour Planner SAW** (`SmartPlannerWorkspace.tsx`) | Read/Config | Read | - | - | - | - | Rekomendasi Homestay | Rekomendasi Rute | Read | DSS Perencana Rute |
| **Telemetri IoT 4 Stasiun** (`IslandTelemetryWorkspace.tsx`) | Full + Alert Config | Full Pantau | Pantau Cuaca Kebun | Pantau Cuaca | Pantau Kualitas Air RO | Pantau TDS RO | Pantau Pasang Surut | Pantau Cuaca Bahari | Sensor Status | Pantau Cuaca Publik |
| **Survei Lapangan Dinamis** (`SurveyEtlWorkspace.tsx`) | Desain Formulir & ETL | Rekap Data | - | - | - | - | - | - | Input Survei Lapangan | - |
| **Jejak Audit & Blockchain** (`AuditTrailWorkspace.tsx`) | Full Audit + Resync | Audit Trail | - | - | - | - | - | - | - | Verifikasi Publik |
| **Artikel & CMS Sejarah** (`HistoryArticlesWorkspace.tsx`) | Moderasi | Moderasi | - | - | - | - | - | Editor Naskah / CMS Pokdarwis | - | Baca Artikel Publik |
| **Pojok Baca Komunitas** (`CommunityLiteracyHub.tsx`) | Kelola Buku | Kelola Buku | - | - | Baca & Pinjam | - | - | Pojok Edukasi | - | Baca Terbuka |

---

## 3. Rincian Detail Fitur per Workspace

### 3.1. Dashboard Ekosistem Pengguna (`UserEcosystemDashboard.tsx`)
- **Tujuan:** Pusat kendali personalisasi yang menampilkan indikator kinerja utama (KPI), visualisasi analitik tren, jalan pintas aksi, dan transparansi domain sesuai peran pengguna.
- **Lokasi Kode:** `frontend/src/views/dashboard/`
- **Fitur Utama:**
  1. **Clock Sinkron Waktu Indonesia Timur (WIT):** Sinkronisasi waktu nyata berdasar zona Jayapura/Maluku (UTC+9).
  2. **Role Perspective Switcher Bar:** Fitur eksklusif administrator untuk memeriksa antarmuka seluruh 10 peran tanpa login ulang.
  3. **4 KPI Metric Cards Dinamis:** Kartu metrik dengan komparasi persentase tren bulanan/musiman.
  4. **Grafik Analitik Recharts:**
     - Multi-Line Chart (tren volume, pergerakan harga, atau kunjungan) dilengkapi nilai akhir dan tooltip.
     - Donut Pie Chart (distribusi mutu komoditas, segmentasi bansos, atau okupansi penginapan) dengan total sentral.
  5. **3 Kartu Ringkasan Lintas Workspace:**
     - Progress bar pencapaian blok kerja.
     - Peta mini geospasial vektor Pulau Banda (Neira, Banda Besar/Lonthoir, Gunung Api, Ay, Rhun, Hatta).
     - Mini bar chart kontribusi volume operasional mingguan.
  6. **Panel Transparansi & Integritas Data:** Menampilkan 4 pilar kepatuhan dan validasi kriptografis domain pengguna.
  7. **Unduh Data Terbuka (Open Data Engine):** Ekspor instan dalam 4 format resmi: CSV, Excel (XLSX), JSON terstruktur, dan REST API link.
  8. **Radar Verifikasi Cepat Batch Blockchain:** Formulir instan pengecekan keabsahan kode batch rempah on-chain.
  9. **Drawer Peluncur Ruang Kerja (Workspaces Launchpad):** Akses instan modul operasional tanpa melalui menu utama.

---

### 3.2. Ruang Kependudukan Master (`ResidentsWorkspace.tsx`)
- **Tujuan:** Pengelolaan data induk warga kepulauan, verifikasi status tinggal, klasifikasi pekerjaan, dan demografi desa.
- **Lokasi Kode:** `frontend/src/views/ResidentsWorkspace.tsx`
- **Backend Service:** `frontend/src/services/population.ts` (`/api/v1/residents`)
- **Model Database:** `residents`, `occupations`
- **Fitur Utama:**
  1. **Tabel Induk Kependudukan:** Pencarian real-time berdasarkan NIK, nama lengkap, atau alamat dusun.
  2. **Filter Multi-Profesi Kepulauan:** Klasifikasi pekerjaan khas (Petani Pala, Nelayan Tangkap, Operator Homestay, Pemandu Wisata, Pengrajin, Pedagang, ASN/Guru).
  3. **Kartu Statistik Demografi:** Total penduduk terdaftar, rasio kepala keluarga, persentase verifikasi identitas, dan distribusi dusun.
  4. **Formulir Pendaftaran Warga Baru:** Validasi ketat format NIK (16 digit), tanggal lahir, jenis kelamin, dan nomor KK.
  5. **Aksi Verifikasi & Validasi:** Perangkat desa dapat menandai data sebagai `verified` atau `rejected` dengan pencatatan audit trail.
  6. **Ekspor Data Agregat:** Pengunduhan rekapitulasi data demografi untuk laporan dinas sosial dan kependudukan kabupaten.

---

### 3.3. Portal Mandiri Warga (`CitizenPortalWorkspace.tsx`)
- **Tujuan:** Antarmuka layanan terpusat untuk masyarakat desa kepulauan dalam mengurus administrasi dan mengecek hak bantuan secara mandiri.
- **Lokasi Kode:** `frontend/src/views/CitizenPortalWorkspace.tsx`
- **Backend Service:** `frontend/src/services/population.ts`
- **Fitur Utama:**
  1. **Pengajuan Surat Keterangan Online:**
     - Formulir mandiri untuk SKU (Surat Keterangan Usaha), Surat Domisili, Keterangan Tidak Mampu (SKTM), dan Surat Pengantar Nikah.
     - Unggah dokumen pendukung dan pengisian maksud permohonan.
  2. **Riwayat & Pelacak Status Surat:**
     - Pemantauan tahap berkas (*Menunggu Verifikasi*, *Sedang Diproses*, *Disetujui*, *Siap Diambil/Cetak*).
  3. **Pemberitahuan Status Sukses:** Umpan balik langsung saat permohonan berhasil dikirim ke meja aparatur desa.
  4. **Pemeriksaan Hak Layanan Komunitas:** Pengecekan saldo air bersih RO harian, kepemilikan tabungan bank sampah, dan kupon literasi.

---

### 3.4. Ruang Verifikasi & Administrasi Surat Desa (`LettersWorkspace.tsx`)
- **Tujuan:** Meja kerja aparatur desa (Kaur TU / Sekdes / Kades) untuk memproses, menandatangani, dan menerbitkan surat resmi desa.
- **Lokasi Kode:** `frontend/src/views/LettersWorkspace.tsx`
- **Backend Service:** `frontend/src/services/population.ts`
- **Fitur Utama:**
  1. **Inbox Permohonan Masuk:** Antrian terurut permohonan surat masuk warga dengan indikator waktu tunggu.
  2. **Filter Status Administrasi:** Memisahkan berkas `pending`, `approved`, dan `rejected`.
  3. **Tindakan Persetujuan Sekali Klik:** Persetujuan instan yang membubuhkan nomor registrasi surat desa resmi secara otomatis.
  4. **Penolakan dengan Catatan Edukatif:** Pengembalian berkas disertai keterangan kekurangan lampiran dokumen warga.
  5. **Mesin Cetak Berkas Standar Resmi (Print Layout Engine):**
     - Pratinjau langsung format surat baku desa lengkap dengan kop desa, lambang garuda/pemerintah daerah, isi klausul, dan blok tanda tangan basah / barcode TTE.
     - Pemicu dialog cetak peramban bawaan (`window.print()`).

---

### 3.5. Ruang Pemetaan Kebun Pala & Poktan GIS (`FarmsGisWorkspace.tsx`)
- **Tujuan:** Pengelolaan batas lahan kebun pala, kepemilikan pohon, verifikasi spasial bebas sengketa (*zero overlap*), dan pembinaan kelompok tani.
- **Lokasi Kode:** `frontend/src/views/FarmsGisWorkspace.tsx`
- **Komponen Spasial:** `frontend/src/components/FarmMap.tsx`
- **Backend Service:** `frontend/src/services/farmers.ts`, `frontend/src/services/gis.ts` (`/api/v1/farms`, `/api/v1/farmers`)
- **Model Database:** `farms`, `farmers`, `farmer_groups`, tipe PostGIS `Polygon` / `MultiPolygon` SRID 4326.
- **Fitur Utama:**
  1. **Visualisasi Poligon Geodesi Interaktif:** Peta Leaflet/MapLibre interaktif dengan batas kebun per petani di pulau-pulau Banda.
  2. **Deteksi Bebas Tumpang Tindih (Zero Overlap Enforcement):** Validasi otomatis algoritma geospasial backend untuk mencegah klaim ganda atas bidang tanah adat/perkebunan.
  3. **Pencatatan Aset Lahan:** Luas area (hektare), estimasi jumlah tegakan pohon pala dewasa, usia tanaman, dan metode irigasi/lereng.
  4. **Manajemen Kelompok Tani (Poktan):** Pengelompokan petani berdasarkan desa/dusun (contoh: Poktan Lonthoir, Poktan Selamon, Poktan Ay).
  5. **Alur Verifikasi Legalitas Kebun:** Perangkat desa / admin memverifikasi titik koordinat dan status sertifikat/girik adat.

---

### 3.6. Ruang Pencatatan Panen, Mutu & Ketertelusuran (`HarvestGradingWorkspace.tsx`)
- **Tujuan:** Pencatatan komoditas rempah harian, sortasi mutu standar ekspor, penerbitan kode batch blockchain, dan transparansi rantai pasok.
- **Lokasi Kode:** `frontend/src/views/HarvestGradingWorkspace.tsx`
- **Backend Service:** `frontend/src/services/traceability.ts` (`/api/v1/harvests`, `/api/v1/batches`)
- **Model Database:** `harvests`, `product_batches`, `traceability_events`
- **Fitur Utama:**
  1. **Formulir Catat Panen Baru:** Input tanggal panen, blok kebun asal, petani penanggung jawab, bobot panen (kg), dan jenis komoditas (Biji Pala Kering, Bunga Fuli Merah, Daging Buah).
  2. **Grading Mutu Standar Internasional:**
     - Grade A Super (Biji utuh berbobot tinggi tanpa cacat serangga)
     - Grade B (Biji utuh standar)
     - Grade C (Biji keriput)
     - Afkir / Biji Minyak Atsiri
  3. **Pembuatan Batch Produksi Kolektif:** Penggabungan beberapa panen terverifikasi menjadi satu kontainer batch bertanggal.
  4. **Generator Label & QR Code Unik:** Pembuatan label fisik ber-QR Code untuk ditempel pada karung goni rempah.
  5. **Pencatatan Event Rantai Pasok (Supply Chain Journey):** Riwayat tahap penjemuran, pengasapan, pengemasan di Koperasi Hatta, hingga pelabuhan keberangkatan Banda.
  6. **Penerbitan Hash On-Chain:** Penandatanganan metadata batch menjadi hash SHA-256 yang siap diverifikasi di smart contract EVM.

---

### 3.7. Ruang Kasir Koperasi Hatta & Dispenser RO (`KoperasiKasirWorkspace.tsx`)
- **Tujuan:** Operasional keuangan mikro komunitas, pembelian hasil bumi, kasir sembako, tabungan bank sampah pilah, dan automasi isi ulang air minum RO (Reverse Osmosis).
- **Lokasi Kode:** `frontend/src/views/KoperasiKasirWorkspace.tsx`
- **Backend Service:** `frontend/src/services/koperasi.ts` (`/api/v1/coop`)
- **Fitur Utama:**
  1. **POS Kasir Cepat (Point of Sale):** Transaksi kasir untuk kebutuhan pokok warga kepulauan dan sarana pertanian rempah.
  2. **Unit Pembelian Rempah Langsung:** Pembayaran tunai atau transfer saldo koperasi saat petani menyetorkan pala/fuli hasil panen.
  3. **Unit Bank Sampah Kepulauan:**
     - Penerimaan sampah plastik bernilai ekonomis (PET, HDPE, kardus).
     - Konversi bobot timbangan sampah menjadi saldo tabungan warga secara otomatis.
  4. **Integrasi Telemetri Dispenser Air Minum RO:**
     - Pemantauan 4 stasiun pengisian air minum warga pulau.
     - Pengecekan sensor TDS (Total Dissolved Solids) secara real-time untuk menjamin air layak minum (< 50 PPM).
     - Pemotongan kuota air harian berbasis kartu/nomor identitas warga.
  5. **Buku Rekapitulasi Ekosistem Koperasi:** Laporan omzet harian, total volume sampah tereduksi dari laut Banda, dan volume air bersih terdistribusi.

---

### 3.8. Ruang Cagar Budaya & Eco-Stay Homestay (`TourismEcoStayWorkspace.tsx`)
- **Tujuan:** Pengelolaan pariwisata berkelanjutan, inventarisasi cagar budaya cagar maritim Banda, reservasi homestay ramah lingkungan, dan komunikasi via WhatsApp langsung.
- **Lokasi Kode:** `frontend/src/views/TourismEcoStayWorkspace.tsx`
- **Komponen Pendukung:** `frontend/src/views/CommunityLiteracyHub.tsx`, `frontend/src/components/dashboard/PokdarwisHistoryCms.tsx`
- **Backend Service:** `frontend/src/services/tourism.ts` (`/api/v1/tourism`)
- **Fitur Utama:**
  1. **Katalog Cagar Budaya & Sejarah:** Profil Benteng Belgica, Benteng Nassau, Rumah Pengasingan Bung Hatta, Rumah Sjahrir, Istana Mini VOC, dan Titik Nol Monopoli Rhun.
  2. **Inventarisasi Homestay & Eco-Stay:**
     - Pengelolaan daftar kamar, fasilitas (panel surya, air minum isi ulang, AC/kipas, view laut).
     - Tarif per malam transparan tanpa komisi predatorik pihak ketiga.
  3. **Generator Reservasi WhatsApp Instan:**
     - Formulir cerdas pemilihan tanggal check-in/out dan jumlah tamu.
     - Merangkai teks pesan WhatsApp resmi yang langsung mengarahkan wisatawan ke nomor WhatsApp pemilik homestay.
  4. **Modul Pengaturan Operator Homestay:**
     - Pemilik homestay dapat menyunting foto, status ketersediaan kamar, dan kontak penginapannya.
  5. **Audit Kelestarian Lingkungan (Eco-Rating):** Penilaian penggunaan wadah ramah lingkungan, pengolahan limbah organik, dan efisiensi air.

---

### 3.9. Ruang Peta Geospasial 7-Layer Interaktif (`InteractiveMapWorkspace.tsx`)
- **Tujuan:** Pusat informasi geospasial terpadu (*Spatial Decision Support System*) seluruh Kepulauan Banda dengan lapisan multi-tematik.
- **Lokasi Kode:** `frontend/src/views/InteractiveMapWorkspace.tsx`
- **Backend Service:** `frontend/src/services/gis.ts` (`/api/v1/gis`)
- **Fitur Utama:**
  1. **7 Layer Tematik Geospasial:**
     - *Layer 1:* Batas Administrasi Desa & Pulau (Neira, Banda Besar, Ay, Rhun, Hatta, Pisang, Karaka).
     - *Layer 2:* Tutupan Kebun Rempah Pala & Kontur Geologi Gunung Api.
     - *Layer 3:* Titik Situs Cagar Budaya & Sejarah Banda Neira.
     - *Layer 4:* Fasilitas Publik (Dermaga, Puskesmas, Sekolah, Kantor Desa, Koperasi).
     - *Layer 5:* Spot Snorkeling, Diving Terumbu Karang & Kawasan Konservasi Laut (KKL).
     - *Layer 6:* Jaringan Stasiun Telemetri IoT Cuaca & Sensor TDS Air Bersih.
     - *Layer 7:* Zona Risiko Bencana Vulkanik & Tsunami Kepulauan.
  2. **Spatial Studio & Pengukuran Lapangan:** Penggaris ukur jarak antar pulau (nautical miles/km) dan kalkulator poligon luas lahan.
  3. **Inspektur Objek Spasial (Property Inspector):** Klik pada poligon atau pin untuk menampilkan kartu informasi komprehensif.

---

### 3.10. Ruang Perencana Rute Wisata Cerdas SAW (`SmartPlannerWorkspace.tsx`)
- **Tujuan:** Sistem pendukung keputusan (DSS) berbasis metode *Simple Additive Weighting* (SAW) untuk merekomendasikan itinerari perjalanan terbaik di Kepulauan Banda.
- **Lokasi Kode:** `frontend/src/views/SmartPlannerWorkspace.tsx`
- **Fitur Utama:**
  1. **Parameter Preferensi Wisatawan:**
     - Durasi liburan (1 hari, 3 hari, 5 hari, 7 hari).
     - Minat utama (Sejarah & Benteng, Snorkeling & Bahari, Trekking Gunung Api, Kuliner Rempah).
     - Tingkat kebugaran fisik dan anggaran perjalanan.
  2. **Kalkulasi Algoritma SAW:**
     - Normalisasi matriks kriteria (biaya sewa perahu kora-kora, jarak antar pulau, waktu tempuh ombak, nilai sejarah).
     - Perhitungan nilai preferensi (*V*) untuk perangkingan destinasi.
  3. **Visualisasi Jadwal Perjalanan Terpadu (Day-by-Day Timeline):** Rekomendasi jam keberangkatan kapal antar-pulau, titik istirahat, dan panduan etika cagar budaya.

---

### 3.11. Ruang Telemetri Lingkungan & IoT 4 Stasiun (`IslandTelemetryWorkspace.tsx`)
- **Tujuan:** Pemantauan kondisi mikroklimat, tinggi gelombang laut, kualitas air desalinasi/RO, dan daya energi terbarukan pulau.
- **Lokasi Kode:** `frontend/src/views/IslandTelemetryWorkspace.tsx`
- **Fitur Utama:**
  1. **Pantauan 4 Stasiun IoT Kepulauan:**
     - Stasiun 1: Dermaga Neira (Pasang Surut & Cuaca Maritim)
     - Stasiun 2: Lereng Gunung Api Banda (Suhu, Kelembaban Tanah Kebun Pala, Seismik Mikro)
     - Stasiun 3: Pulau Ay (Kualitas Air TDS & Tenaga Surya PLTS)
     - Stasiun 4: Pulau Rhun (Kecepatan Angin & Curah Hujan)
  2. **Grafik Sensor Real-Time:** Visualisasi kurva 24 jam untuk suhu udara, kelembaban relatif, dan nilai TDS air minum.
  3. **Sistem Peringatan Dini Lingkungan (Early Warning Trigger):** Penanda warna merah jika TDS melampaui ambang higienis atau gelombang laut tinggi membahayakan perahu nelayan.

---

### 3.12. Ruang Survei Lapangan & Validasi Dinamis (`SurveyEtlWorkspace.tsx`)
- **Tujuan:** Alat bantu pengumpulan data survei lapangan oleh petugas/surveyor desa, transformasi data spasial (ETL), dan integrasi pendaftaran objek pajak desa.
- **Lokasi Kode:** `frontend/src/views/SurveyEtlWorkspace.tsx`
- **Fitur Utama:**
  1. **Formulir Survei Multi-Kategori Dinamis:** Pengisian data survei lapangan (pajak bumi, fasilitas sosial, inventarisasi pohon pala adat).
  2. **Mesin Validasi & ETL Geospasial:** Pemeriksaan format berkas GeoJSON/CSV sebelum dimasukkan ke dalam basis data utama.
  3. **Sinkronisasi Offline-to-Online:** Penyimpanan antrian survei di penyimpanan lokal saat bertugas di pulau terpencil tanpa sinyal internet, dengan sinkronisasi otomatis saat terhubung kembali.

---

### 3.13. Ruang Jejak Audit & Validasi Blockchain EVM (`AuditTrailWorkspace.tsx`)
- **Tujuan:** Akuntabilitas mutlak tata kelola desa kepulauan, perekaman setiap tindakan penting, dan pembuktian matematis integritas data on-chain.
- **Lokasi Kode:** `frontend/src/views/AuditTrailWorkspace.tsx`
- **Backend Service:** `/api/v1/audit`, `/api/v1/blockchain`
- **Fitur Utama:**
  1. **Catatan Jejak Audit Kronologis:** Log setiap operasi pembuatan, pengubahan, verifikasi surat, dan mutasi lahan.
  2. **Verifikasi Hash Kriptografis (SHA-256):** Pembandingan hash rekaman saat ini dengan hash awal untuk menjamin zero-tampering.
  3. **Penjelajah Transaksi EVM (Block Explorer Bridge):** Tautan langsung ke penjelajah blok publik (Etherscan/Arbiscan) untuk memeriksa status transaksi terbit, nomor blok, dan gas fee transaksi.
  4. **Pemicu Sinkronisasi Ulang (Emergency Resync):** Tombol bagi administrator untuk memvalidasi ulang konsistensi seluruh riwayat transaksi.

---

### 3.14. Ruang Redaksi & Artikel Sejarah Pokdarwis (`HistoryArticlesWorkspace.tsx` & `PokdarwisHistoryCms.tsx`)
- **Tujuan:** Portal literasi sejarah jalur rempah Banda Neira bagi publik serta ruang redaksi CMS naskah bagi pengurus Pokdarwis.
- **Lokasi Kode:** `frontend/src/views/HistoryArticlesWorkspace.tsx`, `frontend/src/components/dashboard/PokdarwisHistoryCms.tsx`
- **Fitur Utama:**
  1. **Katalog Naskah Sejarah Publik:** Menampilkan naskah riset berbobot (Perjanjian Breda 1667 Pulau Rhun, Sejarah Benteng Belgica 1611, Botani Pala Banda, dan Jejak Pengasingan Hatta-Sjahrir).
  2. **Redaksi Naskah CMS Pokdarwis:**
     - Editor naskah interaktif bagi admin wisata / pokdarwis.
     - Penyesuaian judul, kategori (Diplomasi, Benteng, Rempah, Tokoh Bangsa), waktu baca, dan ringkasan eksekutif.
  3. **Peninjau Status Publikasi:** Naskah yang tayang otomatis sinkron ke halaman depan publik (`/sejarah`).

---

### 3.15. Pojok Baca Komunitas & Literasi Warga (`CommunityLiteracyHub.tsx`)
- **Tujuan:** Fasilitas literasi warga kepulauan, pencatatan pinjaman buku cetak perpustakaan desa, dan repositori naskah digital jalur rempah.
- **Lokasi Kode:** `frontend/src/views/CommunityLiteracyHub.tsx`
- **Fitur Utama:**
  1. **Katalog Buku & Manuskrip Banda:** Pencarian koleksi pustaka sejarah lokal, pertanian tropis, kelautan, dan buku anak.
  2. **Pencatatan Peminjaman Mandiri:** Peminjaman buku oleh warga dan pelajar kepulauan dengan pemantauan tanggal kembali.
  3. **Ruang Baca Terbuka:** Akses digital ke salinan naskah sejarah tanpa batasan hak cipta komersial.

---

### 3.16. Pusat Bantuan, SOP & Tiket Aduan Sistem (`HelpDeskWorkspace.tsx`)
- **Tujuan:** Pusat dokumentasi resmi operasional kepulauan, panduan langkah-demi-langkah (SOP) seluruh 14 ruang kerja, tanya jawab terverifikasi (FAQ), tiket aduan teknis terpadu, dan alat diagnostik jaringan perangkat.
- **Lokasi Kode:** `frontend/src/views/HelpDeskWorkspace.tsx`
- **Akses Rute:** `/help`, `/bantuan`, `/panduan` serta Tab Ruang Kerja Sidebar Dasbor (`help`).
- **Fitur Utama:**
  1. **Top Barometer Metrik Layanan:** Pantauan status infrastruktur (100% Aktif), 14 Modul Dokumentasi, 28 Topik FAQ Valid, dan SLA respon aduan (< 15 menit).
  2. **Pencarian Real-Time & Filter Kategori:** Mesin pencari instan berbasis kata kunci di seluruh artikel tanya jawab dan panduan SOP.
  3. **Direktori Tanya Jawab Interaktif (FAQ Accordion):** Jawaban terverifikasi aparatur desa & pengurus pokdarwis dengan tombol salin teks, feedback kebermanfaatan (thumbs up/down), dan tautan langsung ke ruang kerja terkait.
  4. **Modul Panduan SOP Multi-Peran:** Panduan langkah-demi-langkah untuk pengajuan surat warga, grading pala ekspor, kasir koperasi, dan pemetaan plot PostGIS.
  5. **Helpdesk & Tiket Aduan Interaktif:** Formulir pelaporan masalah beridentitas tiket unik (`TKT-BN-2026-XXX`) dengan estimasi SLA penanganan langsung.
  6. **Pemeriksaan Diagnostik Mandiri Sistem:** Uji latensi BTS, status IndexedDB cache offline PWA, sensor GPS perangkat, API backend FastAPI, dan ledger EVM blockchain.

---

## 4. Alur Integrasi Lintas Workspace (Inter-Workspace Data Flow)

```
[ Warga / Petani ]
       │
       ├─► Panen Rempah ──► [ HarvestGradingWorkspace ]
       │                           │
       │                           ├─► Setor ke Koperasi ──► [ KoperasiKasirWorkspace ]
       │                           │                                │
       │                           └─► Terbitkan Batch ────► [ AuditTrailWorkspace ] (Blockchain)
       │
       ├─► Plot Batas Lahan ───────────────────────────────► [ FarmsGisWorkspace ]
       │                                                            │
       │                                                            └─► [ InteractiveMapWorkspace ]
       │
       ├─► Ajukan Surat (SKU/Domisili) ─► [ CitizenPortalWorkspace ]
       │                                         │
       │                                         └─► [ LettersWorkspace ] ──► Verifikasi Perangkat Desa
       │
[ Pelaku Wisata / Pokdarwis ]
       │
       ├─► Kelola Homestay & Kamar ────────────────────────► [ TourismEcoStayWorkspace ]
       │                                                            │
       ├─► Publikasi Naskah Sejarah ──► [ HistoryArticlesWorkspace ]│
       │                                                            ├─► [ SmartPlannerWorkspace ]
[ Wisatawan Publik ] ◄──────────────────────────────────────────────┴─► (Rekomendasi Rute & Reservasi WA)
```

---

## 5. Standar Pengembang untuk Upgrade Halaman Dashboard per Role

Untuk memfasilitasi pemeliharaan dan peningkatan berkelanjutan tanpa risiko regresi:
1. **Modul Terpisah per Role:** Setiap dashboard peran pengguna ditempatkan di direktori `frontend/src/views/dashboard/roles/` dengan berkas independen.
2. **Kemandirian State & Data:** Komponen role dashboard menerima antarmuka props baku (`onNavigate`, `onOpenMarketplace`, `onPublicVerify`, `currentUser`) sehingga penambahan komponen/fitur baru pada salah satu role tidak mempengaruhi role lain.
3. **Penyelarasan Warna & Tipografi:** Mengikuti token sistem Banda Neira:
   - Primary Deep Navy: `#081D35`
   - Accent Warm Gold: `#F4B75E` & `#D97706`
   - Secondary Blue: `#2563EB`
   - Emerald Spice Green: `#059669`
   - Slate Neutral: `#64748B`, `#E2E8F0`
   - Font Serif Tradisional untuk Judul & Font Sans Kontemporer untuk Metrik/Data.
