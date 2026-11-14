# Dokumentasi Ekosistem Geospasial GIS 7-Layer & Peta Interaktif Banda Neira

Dokumentasi komprehensif mengenai arsitektur, dataset spasial terkalibrasi, sistem seeder, studio editor interaktif, dan panduan operasional bagi tim pengembang ekosistem **Banda Digital**.

---

## 1. Ikhtisar & Arsitektur Geospasial

Peta Spasial Kepulauan Banda dirancang berbasis standar **OGC / GeoJSON RFC 7946 (EPSG:4326 - WGS 84)** untuk memetakan seluruh potensi pariwisata, cagar budaya, fasilitas umum, mitigasi bencana bahari, serta ketahanan air dan energi di gugus Kepulauan Banda.

### 1.1 Tujuh (7) Layer Tematik
1. **`LAYER_TOURISM_4A` (Wisata & Bahari)**: Spot diving/snorkeling (Lava Flow, Hatta Reef), pantai pasir putih, jalur tracking kawah vulkanik, dan kuliner khas kuah pala.
2. **`LAYER_HERITAGE` (Cagar Budaya & Sejarah)**: Benteng VOC (Belgica, Nassau, Hollandia, Revenge, Concordia), rumah pengasingan tokoh proklamator (Bung Hatta, Sutan Sjahrir, Cipto Mangunkusumo, Iwa Kusuma Sumantri), gereja tua, dan situs sumur pusaka.
3. **`LAYER_ACCOMMODATION` (Penginapan & Eco-Stay)**: Hotel legendaris (Maulana Hotel), homestay ramah lingkungan dengan fasilitas air minum Reverse Osmosis dan cadangan panel surya.
4. **`LAYER_KOPERASI_UMKM` (Koperasi & Sentra Rempah)**: Gerai UMKM rempah pala asli Banda, rumah jemur solar tunnel, dan sentra penimbangan komoditas.
5. **`LAYER_PUBLIC_SAFETY` (Fasilitas Umum & Transportasi)**: Pelabuhan laut utama PELNI, terminal dermaga penyeberangan speedboat antar-pulau, pos SAR, dan rute maritim navigasi laut.
6. **`LAYER_WATER_INFRA` (Infrastruktur Air Bersih)**: Stasiun filtrasi air payau (BWRO), stasiun desalinasi air laut bertenaga surya (SWRO), embung komunal, dan sumur pusaka perbukitan.
7. **`LAYER_ENERGY_WASTE` (Fasilitas Energi & Kebersihan)**: Pembangkit Listrik Tenaga Diesel (PLTD), Microgrid PLTS Surya, bank sampah penukaran botol plastik dengan air minum murni, dan reduksi sampah pesisir.

### 1.2 Cakupan Gugus Kepulauan
- **Pulau Neira**: Pusat administrasi, pelabuhan utama, bandara, cagar budaya.
- **Pulau Banda Besar (Lonthoir, Waer, Selamon)**: Perkebunan pala tertua di dunia, benteng Hollandia & Concordia, sumber air tawar komunal.
- **Pulau Gunung Api**: Gunung berapi aktif 640 mdpl, ekosistem terumbu karang pasca-erupsi (*Lava Flow*).
- **Pulau Ay**: Perkebunan pala organik, Benteng Revenge, embung, dan pantai barat.
- **Pulau Hatta**: Dinding terumbu karang vertikal, stasiun desalinasi SWRO, microgrid PLTS 50 kWp mandiri.
- **Pulau Keraka, Pulau Rhun, dan Pulau Sjahrir (Pisang)**: Gugusan pulau penyangga.

---

## 2. Dataset Terkalibrasi & Integrasi Seeder

Dataset geospasial telah diekspor dan distandarisasi ke dalam format JSON yang dapat langsung digunakan oleh pengembang lain saat mengkloning atau menjalankan lingkungan lokal/CI.

### 2.1 Berkas Sumber Data
- Lokasi berkas: `backend/app/seeds/gis_spatial_features.json`
- Total objek: **54 objek spasial autentik** (termasuk objek titik dan rute maritim LineString).

### 2.2 Cara Menjalankan Seeder (Bagi Rekan Tim Pengembang)

#### Opsi A: Menjalankan Seeder Khusus Geospasial
Gunakan skrip mandiri untuk memperbarui atau mengisi tabel `spatial_features` di PostgreSQL tanpa mengganggu tabel lain:
```bash
# Melalui kontainer Docker
docker exec -it banda_backend python -m backend.scripts.seed_spatial_features

# Atau langsung di environment lokal
python -m backend.scripts.seed_spatial_features
```

#### Opsi B: Menjalankan Seeder Lengkap Ekosistem Demo
Jika rekan tim memulai basis data dari nol (fresh database), skrip demo seed utama sudah otomatis menyertakan seeder spasial ini pada Tahap 8:
```bash
docker exec -it banda_backend python -m backend.scripts.demo_seed
```

#### Opsi C: Inisialisasi Otomatis (Auto-Seed on Startup)
FastAPI backend dikonfigurasi melalui fungsi `ensure_seed_features` di router GIS. Jika tabel `spatial_features` kosong saat server pertama kali dinyalakan, backend akan otomatis membaca berkas `gis_spatial_features.json` dan memuat seluruh 54 fitur ke dalam PostGIS.

---

## 3. Fitur Interaktif Studio Geospasial di Frontend

### 3.1 Penataan Batas Wilayah Desa (Multi-Part Daratan Terpisah)
Banyak desa di Kepulauan Banda memiliki karakteristik kepulauan dengan wilayah daratan yang terpisah oleh perairan selat (misalnya Desa Nusantara dan Desa Merdeka yang memiliki area di Pulau Neira dan bagian dusun di seberang pulau).
- **Masalah yang Diatasi**: Sebelumnya, mengklik titik di pulau seberang menghasilkan garis lurus yang memotong lautan.
- **Solusi yang Diterapkan**:
  - Dukungan struktur data multi-bagian daratan (*Multi-Ring/MultiPolygon* di sisi geospasial).
  - Tombol **+ Tambah Bagian Wilayah Terpisah** di antarmuka admin.
  - Setiap bagian daratan membentuk lingkaran batas mandiri yang terisolasi.
- **Dua Mode Interaksi Peta**:
  - **Hanya Geser Titik Batas**: Mengunci penambahan titik baru sehingga pengguna bebas menggeser peta (*pan/zoom*) dan menarik titik handle tanpa khawatir menambah titik sembarangan.
  - **+ Tambah Titik Baru**: Mengaktifkan penambahan titik batas baru setiap kali peta diklik.
- **Penyelarasan Bahasa Non-Teknis**:
  - Seluruh istilah teknis (*Vertex, MultiPolygon, Choropleth, Hex*) dihilangkan dan diganti dengan bahasa Indonesia natural seperti *Titik Batas, Bagian Wilayah Terpisah, Warna Garis & Arsiran*.

### 3.2 Penarikan Garis Rute Maritim (Speedboat / Pelayaran)
- **Geometry Type**: GeoJSON `LineString`.
- **Kalkulasi Metrik Otomatis**:
  - Jarak total dihitung secara real-time menggunakan formula Haversine geodesik.
  - Ditampilkan dalam format ganda: **Kilometer (km)** dan **Nautical Miles (NM / Mil Laut)** yang lazim dalam navigasi maritim.
  - Contoh data tersimpan: *Jalur Penyeberangan Speedboat Neira - Pulau Ay* (26 titik waypoint, estimasi 25-35 menit tempuh, 2.41 km / 1.30 NM).

---

## 4. Spesifikasi API & Kontrak Data

| Metode | Endpoint | Deskripsi | Akses |
|---|---|---|---|
| `GET` | `/api/v1/gis/layers` | Mengambil seluruh layer fitur dalam format GeoJSON FeatureCollection standar RFC 7946 | Publik |
| `GET` | `/api/v1/peta/geojson` | Alias endpoint kompatibilitas untuk integrasi frontend/mobile | Publik |
| `GET` | `/api/v1/gis/meta` | Statistik jumlah fitur per-layer, daftar pulau, dan ringkasan kategori (publik/resiliensi) | Publik |
| `GET` | `/api/v1/gis/features/{id}` | Mengambil detail atribut lengkap satu objek spasial | Publik |
| `POST` | `/api/v1/gis/features` | Menambahkan objek titik atau rute garis baru ke basis data | Admin / Petugas |
| `PUT` | `/api/v1/gis/features/{id}` | Memperbarui koordinat, waypoints, atau narasi objek spasial | Admin / Petugas |
| `DELETE` | `/api/v1/gis/features/{id}` | Menghapus (atau menonaktifkan) objek spasial | Admin |

### Parameter Kueri Filter:
- `layers`: Memilih layer spesifik dipisahkan koma, contoh: `layers=LAYER_TOURISM_4A,LAYER_HERITAGE`.
- `category`: Memfilter berdasarkan `publik` atau `resiliensi`.
- `island`: Memfilter objek per pulau, contoh: `island=Pulau+Ay`.

---

## 5. Ringkasan Objek Terverifikasi Baru

Beberapa objek penting yang baru saja dipetakan dan telah masuk ke seeder:
1. **Jalur Penyeberangan Speedboat Neira - Pulau Ay** (`LAYER_PUBLIC_SAFETY`): Rute navigasi laut 26 waypoint dari Pelabuhan Neira menuju Dermaga Pulau Ay.
2. **RSUD Banda** (`LAYER_DESA_ADMIN`): Rumah sakit rujukan utama kepulauan di Pulau Neira.
3. **Blood Stone** (`LAYER_HERITAGE`): Situs sejarah penting di Banda Besar.
4. **Hutan Kelle** (`LAYER_TOURISM_4A`): Kawasan hutan alam dan tracking di Banda Besar.
5. **Pantai Tampa Nama & Sabla Pante** (`LAYER_TOURISM_4A`): Wisata pantai alami pesisir barat Pulau Ay.
6. **Embung Pulau Ay** (`LAYER_WATER_INFRA`): Penampungan air komunal untuk ketahanan musim kemarau di Pulau Ay.
7. **Terminal Dermaga Pulau Ay** (`LAYER_PUBLIC_SAFETY`): Titik labuh perahu dan speedboat penyeberangan di Pulau Ay.
