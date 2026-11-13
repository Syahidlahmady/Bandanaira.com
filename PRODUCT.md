# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

1. **Wisatawan & Pengunjung Kepulauan Banda**: Menjelajahi destinasi wisata bahari, cagar budaya kolonial, penginapan eco-stay, dan direktori UMKM rempah melalui peta interaktif yang ringkas dan akurat.
2. **Pemerintah Desa & Pengelola Wisata (Admin / Pokdarwis)**: Mengelola titik koordinat fasilitas publik, cagar budaya, dan amenitas 4A secara berkala.
3. **Masyarakat & Pelaku Usaha Lokal**: Mengakses informasi fasilitas pulau, akomodasi, dan layanan desa.

## Product Purpose

Menyediakan portal digital terpadu dan peta spasial interaktif bagi Kepulauan Banda Neira yang cepat, bersih, informatif, dan mudah digunakan layaknya standar Google Maps modern, tanpa jargon teknis berlebihan atau elemen dekoratif yang mengganggu.

## Positioning

Sistem Informasi Geografis dan Portal Pulau Banda Neira yang memadukan akurasi koordinat WGS 84 dengan kesederhanaan navigasi publik, mendukung ketahanan offline untuk wilayah kepulauan.

## Operating Context

- Digunakan pada perangkat bergerak (ponsel wisatawan/warga saat menjelajah pulau) maupun laptop/desktop pengelola.
- Koneksi internet kepulauan yang fluktuatif sehingga peta harus memprioritaskan keringanan bobot, responsivitas cepat, dan kejelasan visual.

## Capabilities and Constraints

- **Peta Spasial Real-time**: Leaflet map interaktif dengan layer point-of-interest (Wisata 4A, Sejarah & Cagar Budaya, Penginapan, Fasilitas Publik, dll).
- **Studio Editor Spasial**: Manajemen titik (CRUD) berbasis role yang mudah dengan pencarian lokasi dan click-to-pin.
- **Kebijakan Bahasa & Desain**: Bebas dari jargon akademik/mandat artifisial ("Mandat Fauzan", "Mandat Prof Purwo", "SRS 10.1"), bebas klaim bombastis, dan bebas emoji generik. Antarmuka bersih, modular, dan fungsional.

## Brand Commitments

- Identitas bahari Banda Neira yang elegan (palet deep navy, slate, aksen teal/emerald halus).
- Tipografi tajam dan fungsional (Geist / sans-serif bersih, angka tabular monospace).
- Menghormati toponimi asli pulau (Neira, Banda Besar, Banda Api, Pulau Hatta, Pulau Ay, Pulau Rhun).

## Evidence on Hand

- Database PostGIS dengan puluhan titik spasial tervalidasi di Kepulauan Banda.
- Endpoint GeoJSON RFC 7946 aktif dan modular.

## Product Principles

1. **Peta adalah Kanvas Utama**: Pengguna datang untuk melihat peta dan informasi lokasi; peta tidak boleh tergeser ke bawah oleh tumpukan banner atau kartu yang tidak perlu.
2. **Bahasa Manusia, Bukan Jargon Sistem**: Sajikan label yang jelas dan kontekstual bagi wisatawan dan pengelola pulau ("Spot Snorkeling", "Benteng Belgica", "Homestay"), hindari istilah teknis developer/akademik.
3. **Kontrol Modular dan Mengambang**: Filter, pencarian, dan tombol navigasi disajikan ringkas dan proporsional (ala Google Maps).
4. **Kejelasan Aksi**: Fungsi navigasi, reset fokus, dan editor titik dapat ditemukan dalam sekali lirik tanpa kognitif overload.
