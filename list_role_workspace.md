# Daftar Role & Workspace Ekosistem Banda Digital

Dokumen ini memuat pemetaan lengkap 10 peran pengguna (*user roles*) serta modul kerja (*workspaces*) dan fitur utama yang dapat diakses dalam sistem ekosistem Banda Digital.

---

## Matriks Cepat: Role vs Workspace

| Workspace / Modul | `admin` | `village_officer` | `farmer_group_admin` | `farmer` | `resident` | `coop_manager` | `homestay_operator` | `smart_tourism_admin` | `field_surveyor` | `tourist` (Publik) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Dashboard Ekosistem** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Kependudukan (`population`)** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Layanan Surat (`letters`)** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Manajemen Kebun (`farming`)** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Ketertelusuran Pala (`traceability`)**| ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ (Publik) |
| **Koperasi Hatta (`koperasi`)** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Wisata & Budaya (`tourism`)** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Peta Spasial GIS (`gis`)** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Smart Planner DSS (`smart_planner`)** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Telemetri IoT (`iot`)** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Survei Dinamis (`survei`)** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Audit & Blockchain (`audit`)** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## Rincian Peran & Workspace

### 1. `admin` (Super Administrator Sistem)
Memiliki otoritas penuh ke seluruh sistem dan konfigurasi global:
* **Dashboard Ekosistem**: Pemantauan KPI global pulau (total warga, tonase panen pala, omzet koperasi, kunjungan wisata, dan status node blockchain).
* **Kependudukan (`population`)**: Manajemen data kependudukan terpadu, NIK, KK, mutasi penduduk, piramida usia, dan statistik demografi.
* **Layanan Surat (`letters`)**: Pengawasan seluruh antrean surat desa, audit tanda tangan digital kades/sekdes, serta log penerbitan QR Code.
* **Manajemen Kebun (`farming`)**: Master data kelompok tani (Poktan), validasi spasial plot batas poligon lahan pala.
* **Ketertelusuran Pala (`traceability`)**: Pantauan seluruh batch pala, audit sertifikasi asal-usul kebun berbasis blockchain.
* **Koperasi Hatta (`koperasi`)**: Laporan konsolidasi kasir komoditas, neraca unit bank sampah, dan stasiun air minum RO.
* **Wisata & Budaya (`tourism`)**: Kurasi inventaris 177 situs cagar budaya, manajemen direktori mitra Eco-Stay, dan pemandu HPI.
* **Peta Spasial GIS (`gis`)**: Pengelolaan layer spasial (elevasi kontur, tutupan lahan, sebaran situs, jalur evakuasi bencana).
* **Smart Planner DSS (`smart_planner`)**: Konfigurasi bobot kriteria algoritma DSS (*Simple Additive Weighting*) untuk rekomendasi wisata.
* **Telemetri IoT (`iot`)**: Dashboard teknis kesehatan 4 stasiun cuaca pulau (sensor tanah, curah hujan, radiasi matahari, baterai solar panel).
* **Survei Dinamis (`survei`)**: Pembangun formulir survei dinamis (*dynamic form builder*) dan pipa ETL spasial ke PostGIS.
* **Audit & Blockchain (`audit`)**: Ledger transaksi blockchain *tamper-evident*, status block validator, dan riwayat mutasi data sensitif.

---

### 2. `village_officer` (Petugas Kantor Desa)
Fokus pada pelayanan publik administrasi desa, verifikasi data warga, dan legalitas surat:
* **Dashboard Ekosistem**: Metrik antrean surat warga hari ini, statistik permohonan baru, dan agenda desa.
* **Layanan Surat (`letters`)**: Inbox verifikasi dan persetujuan permohonan surat (SKU, Surat Domisili, Pengantar SKCK, Keterangan Tidak Mampu), penandatanganan elektronik, cetak surat ber-QR code resmi.
* **Kependudukan (`population`)**: Pencatatan penduduk baru, pembaruan profesi, dan verifikasi kelayakan bantuan sosial.
* **Manajemen Kebun (`farming`)**: Verifikasi batas administrasi kepemilikan lahan kebun warga guna meminimalisir konflik agraria.
* **Koperasi Hatta (`koperasi`)**: Monitoring program bantuan sosial sembako dan pemanfaatan fasilitas air bersih desa.
* **Survei Lapangan (`survei`)**: Pelaksanaan pengumpulan data kuesioner sensus desa berkala.
* **GIS & Smart Planner**: Analisis zonasi pemukiman warga dan fasilitas umum.

---

### 3. `farmer_group_admin` (Ketua Kelompok Tani / Poktan)
Fokus pada konsolidasi hasil tani anggota dan manajemen kelompok kebun:
* **Dashboard Poktan**: Metrik estimasi tonase panen kelompok, jumlah anggota aktif, dan harga acuan komoditas pala hari ini.
* **Manajemen Kebun (`farming`)**: Pengelolaan daftar anggota poktan, plotting poligon batas kebun bersama, dan kalender rotasi panen.
* **Ketertelusuran Pala (`traceability`)**: Pencatatan panen kolektif poktan, grading mutu (Grade A/B/C/Fuli), penerbitan kartu identitas batch untuk disetor ke koperasi atau eksportir.
* **Layanan Surat (`letters`)**: Pengajuan surat pengantar pupuk bersubsidi atau surat keterangan usaha kelompok tani.
* **Koperasi Hatta (`koperasi`)**: Rekapitulasi setoran timbangan komoditas pala poktan ke Koperasi Hatta.
* **GIS Interaktif (`gis`)**: Peta sebaran spasial pohon pala produktif milik seluruh anggota kelompok.

---

### 4. `farmer` (Petani Rempah Mandiri / Petani Pala)
Antarmuka praktis dan *mobile-friendly* yang mudah digunakan langsung di area kebun:
* **Dashboard Petani**: Riwayat hasil timbang panen, estimasi pendapatan, serta saldo hasil penjualan di koperasi.
* **Peta Kebun Saya (`farming`)**: Pemetaan batas kebun mandiri, inventaris jumlah pohon pala produktif, dan log pemupukan/perawatan.
* **Catat Panen (`traceability`)**: Input hasil petik harian, pencatatan bobot basah/kering biji dan fuli pala, riwayat grading mutu.
* **Layanan Surat (`letters`)**: Pengajuan mandiri surat keterangan usaha tani atau domisili melalui ponsel.
* **Koperasi Hatta (`koperasi`)**: Cek harga beli komoditas terkini di Koperasi Hatta dan riwayat klaim pembayaran.

---

### 5. `resident` (Warga Masyarakat Desa)
Portal pelayanan mandiri warga desa (*Citizen Portal*):
* **Dashboard Warga**: Papan pengumuman desa, jadwal kegiatan desa, dan status pengajuan surat aktif.
* **Citizen Portal (`letters`)**: Formulir pengajuan surat mandiri online (SKU, Keterangan Domisili, Tidak Mampu, dll.) serta pelacak status surat (*Diajukan ➔ Diproses ➔ Selesai / Siap Unduh*).
* **Koperasi Warga (`koperasi`)**: Riwayat transaksi isi ulang air minum galon RO dan buku tabungan digital bank sampah plastik.
* **Peta & Budaya (`tourism` & `gis`)**: Informasi fasilitas kesehatan, jadwal kapal/transportasi, dan peta jalur evakuasi bencana pulau.

---

### 6. `coop_manager` (Pengelola Koperasi Hatta)
Operasional perdagangan komoditas, timbangan digital, dan unit usaha desa:
* **Dashboard Koperasi**: Laporan omzet kasir harian, tonase stok pala di gudang, dan debit distribusi air minum RO.
* **Kasir Timbangan Komoditas (`koperasi`)**: Penimbangan pala dari petani/poktan, pengukuran kadar air, penentuan grade & harga beli otomatis, pencetakan struk pembayaran.
* **Unit Bank Sampah (`koperasi`)**: Penimbangan sampah plastik terpilah warga dan konversi otomatis menjadi saldo tabungan.
* **Unit Stasiun Air Minum RO (`koperasi`)**: Monitoring konsumsi galon air RO warga dan pembayaran token/tunai.
* **Ketertelusuran (`traceability`)**: Penerimaan batch panen petani ke gudang penyimpanan sebelum proses pengiriman/ekspor.

---

### 7. `homestay_operator` (Pengelola Eco-Stay / Mitra Wisata)
Pengelolaan akomodasi penginapan lokal berbasis warga:
* **Dashboard Penginapan**: Tingkat keterisian kamar (*occupancy rate*), jumlah tamu menginap, estimasi pendapatan bulanan.
* **Katalog Eco-Stay (`tourism`)**: Manajemen profil penginapan, galeri foto kamar, fasilitas, tarif per malam, dan kalender ketersediaan.
* **Pemesanan & Tamu (`tourism`)**: Tombol integrasi reservasi langsung via WhatsApp dan pencatatan riwayat tamu.
* **Pariwisata & Budaya (`tourism`)**: Penawaran paket tur lokal (tur rempah, kuliner khas Banda) kepada tamu yang menginap.

---

### 8. `smart_tourism_admin` (Admin Wisata & Pemandu Budaya HPI)
Promosi pariwisata, pelestarian cagar budaya, dan koordinasi pemandu lokal:
* **Dashboard Wisata**: Statistik kunjungan wisatawan bulanan, destinasi cagar budaya terpopuler, dan ulasan wisatawan.
* **Katalog Cagar Budaya (`tourism`)**: Pengelolaan 177 situs bersejarah Banda (Benteng Belgica, Rumah Pengasingan Hatta, Mini Istana, dll.) lengkap dengan narasi sejarah dan audio guide.
* **Direktori Pemandu (`tourism`)**: Manajemen profil anggota Himpunan Pramuwisata Indonesia (HPI) Banda Neira bersertifikat.
* **Smart Planner DSS (`smart_planner`)**: Kurasi paket rute wisata tematik (*Heritage Walk, Spice Trail, Marine & Diving*).
* **Peta Wisata GIS (`gis`)**: Peta interaktif fasilitas wisata, spot diving, dermaga penyeberangan, dan lokasi kuliner.

---

### 9. `field_surveyor` (Surveyor Lapangan & IoT Operator)
Pengumpulan data lapangan primer dan pemantauan sensor fisik:
* **Dashboard Surveyor**: Target kuesioner harian, jumlah data terunggah, dan status baterai stasiun IoT.
* **Survei Lapangan (`survei`)**: Pengisian kuesioner survei berbasis mobile (*offline-first*) yang dilengkapi penandaan koordinat GPS otomatis.
* **Telemetri IoT (`iot`)**: Diagnostik kondisi sensor cuaca di 4 pulau (konektivitas GSM/LoRa, status baterai solar cell, suhu lingkungan).
* **Peta Lapangan GIS (`gis`)**: Validasi titik koordinat infrastruktur desa, sarana air bersih, dan plot kebun.

---

### 10. `tourist` / Pengunjung Publik (Wisatawan)
Antarmuka publik tanpa perlu autentikasi ketat, ramah pelancong:
* **Jelajah Cagar Budaya & Alam (`tourism`)**: Eksplorasi interaktif sejarah Banda Neira, foto panorama, dan panduan audio.
* **Katalog Eco-Stay (`tourism`)**: Pencarian dan reservasi penginapan warga lokal Banda.
* **Smart Trip Planner (`smart_planner`)**: Rekomendasi jadwal perjalanan wisata otomatis berdasarkan durasi menginap dan minat wisatawan.
* **Verifikasi QR Ketertelusuran (`traceability`)**: Halaman publik untuk memindai QR code pada kemasan pala Banda guna melihat keaslian kebun asal dan petani pemanennya.
