# Panduan & Dokumentasi Seeder Basis Data Banda Digital Ecosystem

Dokumentasi resmi arsitektur dan tata kelola dataset seeder untuk seluruh pengembang (*developer* dan anggota tim).

---

## 1. Daftar Berkas Seeder Utama

Folder `backend/app/seeds/` menyimpan berkas sumber kebenaran (*source of truth*) untuk data spasial, kewilayahan desa, dan demografi Kepulauan Banda:

| Berkas | Format | Deskripsi & Isi Data | Jumlah Entitas |
| :--- | :--- | :--- | :--- |
| **`gis_spatial_features.json`** | JSON | Sumber kebenaran terpadu (*Master Dataset*) yang memuat 36 titik objek autentik di 7 layer (Cagar Budaya Benteng/Rumah Pengasingan, Wisata Bahari 4A, Penginapan/Eco-Stay, Titik Air Bersih RO, Pos SAR & Dermaga PELNI, Fasilitas Publik, PLTS & Resiliensi Energi) serta **17 Poligon Batas Wilayah Desa/Negeri Administratif**. | **53 Objek Spasial Terpadu (36 Titik + 17 Poligon Wilayah Desa)** |
| **`banda_villages.geojson`** | GeoJSON (RFC 7946) | Poligon batas administratif wilayah desa/negeri di seluruh gugusan Kepulauan Banda (Neira, Banda Besar, Gunung Api, Ay, Rhun, Hatta, Keraka) berbasis koordinat WGS 84 (EPSG:4326). | **17 Wilayah Desa** |
| **`banda_village_details.json`** | JSON | Data atribut wilayah desa, warna visual, deskripsi sejarah, komoditas unggulan, serta **data agregat demografi & kependudukan resmi 2026**. | **17 Detail Profil Desa** |

---

## 2. Rincian Data Riil Tingkat Desa

### Negeri Administratif Merdeka (Kecamatan Banda - Pulau Neira)
Data desa Merdeka telah dikalibrasi penuh menggunakan **data sensus resmi Pemerintah Kabupaten Maluku Tengah - Negeri Administratif Merdeka Tahun 2026**:
- **Total Populasi:** 834 Jiwa (409 Laki-Laki, 425 Perempuan).
- **Kepala Keluarga:** 234 KK (193 KK Laki-Laki, 41 KK Perempuan).
- **Usia Produktif:** 417 Jiwa (usia 19–50 tahun).
- **Struktur Mata Pencaharian:** 49 Nelayan, 41 Wiraswasta, 32 Asongan, 27 Petani/Pekebun, 26 PNS, 20 Guru/P3K Guru.
- **UMKM Binaan Desa:** 9 unit usaha mikro terdata resmi di bidang olahan pala (selai & manisan), olahan perikanan (pentolan, abon, kerupuk ikan), dan kerajinan tangan.

---

## 3. Kebijakan Integritas Spasial & Privasi (Mandatory Guidelines)

1. **Kebijakan Anti-Titik Sembarangan (*Zero Arbitrary Pin Policy*):**
   - **Dilarang keras** memasang titik koordinat pin (*latitude/longitude*) secara estimasi atau menebak di peta jika titik GPS presisi rumah/lokasi belum disurvei langsung di lapangan.
   - Pelaku usaha atau fasilitas yang belum memiliki koordinat lintang/bujur presisi wajib dicatat pada atribut agregat wilayah desa (`properties_meta.demographics`), bukan dibuatkan pin peta acak.
   - Penambahan titik baru ke peta dilakukan melalui verifikasi lapangan atau melalui fitur **Spatial Studio Map Editor** di web oleh petugas resmi.

2. **Perlindungan Data Pribadi (Zero PII on Public Endpoints):**
   - Data kependudukan yang disimpan pada seeder spasial dan publik **hanya data agregat statistik**.
   - Tidak boleh menyimpan NIK, nomor telepon pribadi, atau identitas privat warga pada layer peta publik maupun pada blockchain.

---

## 4. Panduan Eksekusi Seeder untuk Tim & Pengembang

### A. Sinkronisasi Data Spasial & Wilayah Desa ke PostGIS
Jalankan perintah ini di dalam container backend untuk memasukkan/memperbarui 53 entitas spasial (36 titik objek + 17 zona wilayah desa) ke tabel `spatial_features`:

```bash
docker compose exec backend python scripts/seed_spatial_features.py
```

*Skrip ini bersifat idempoten (menggunakan UPSERT/update jika data sudah ada, sehingga aman dijalankan berulang kali tanpa membuat duplikasi).*

### B. Seeding Penuh Seluruh Modul Ekosistem (Demo Seed)
Untuk mengisi basis data lokal baru dengan seluruh data demonstrasi lengkap (Akun Pengguna RBAC, Data Penduduk, Kelompok Tani Pala, Batch Traceability EVM, Rekening Koperasi Hatta, Log Telemetri IoT, Homestay, dan GIS):

```bash
docker compose exec backend python scripts/demo_seed.py
```

---

## 5. Pemeriksaan Integritas Basis Data

Untuk memverifikasi apakah data di database PostgreSQL/PostGIS lokal Anda telah sinkron:

```bash
# Periksa jumlah fitur spasial dan layer di database
docker compose exec backend python -c "
import asyncio
from app.database.session import AsyncSessionLocal
from sqlalchemy import select, func
from app.modules.gis.models import SpatialFeature

async def check():
    async with AsyncSessionLocal() as s:
        total = (await s.execute(select(func.count(SpatialFeature.id)))).scalar()
        print('Total Spatial Features di PostGIS:', total)

asyncio.run(check())
"
```
