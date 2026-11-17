Peran & Tujuan:
Tolong perbarui desain antarmuka (UI layout) halaman utama Dashboard Smart Tourism Banda Neira agar mengikuti struktur tata letak (grid dan hierarki visual) seperti pada gambar referensi, namun wajib mempertahankan:

1. Color Palette Asli: Jangan ubah skema warna utama (primer, sekunder, background, dan aksen) yang sudah ada pada desain proyek saat ini.
2. Fungsi & Logika Eksisting: Pertahankan seluruh state, API, filter, interaksi tombol, dan fungsi backend yang sudah berjalan.
3. Struktur Sidebar Saat Ini: Jangan mengubah daftar menu/workspace yang ada di sidebar proyek saat ini.
   Panduan Penyesuaian Tata Letak (Layout Mapping):
   Ubah area konten utama (main canvas) menjadi struktur grid 3 bagian (Kiri-Tengah sebagai area utama, dan Kanan sebagai panel informasi/aksi cepat) dengan susunan berikut:
   • Baris 1 (4 Kartu KPI Utama - Summary Cards):
   • Buat 4 kartu horizontal sejajar dengan ikon bulat berwarna di sisi kiri tiap kartu, judul metrik di atas, angka utama berukuran besar dan tebal, serta persentase tren kenaikan/penurunan di bawahnya (sesuaikan datanya dengan metrik utama Banda Neira saat ini).
   • Baris 2 (2 Grafik Analitik Utama):
   • Kiri (Lebar ~60%): Multi-line chart untuk membandingkan tren dua kategori utama (misalnya: Wisatawan Mancanegara vs Wisatawan Nusantara di Banda Neira) lengkap dengan legenda di bagian atas.
   • Kanan (Lebar ~40%): Donut chart dengan total angka di bagian tengah untuk menampilkan proporsi asal wisatawan atau distribusi kategori utama, disertai daftar persentase di samping kanannya.
   • Baris 3 (3 Kartu Ringkasan Lintas Workspace):
   • Ubah 3 kartu di baris bawah agar masing-masing menampilkan ringkasan grafik/data dari setiap menu (workspace) yang ada di sidebar proyek saat ini (misalnya: horizontal progress bar untuk Destinasi Populer di Banda Neira seperti Benteng Belgica/Pulau Hatta, choropleth/pin map sebaran kunjungan kepulauan Banda, dan mini bar chart untuk Kontribusi Ekonomi/UMKM).
   • Pastikan setiap kartu memiliki tombol atau interaksi yang menghubungkan pengguna langsung ke workspace terkait di sidebar.
   • Panel Samping Kanan (Right Utility Column):
   • Kartu Atas: Panel informasi status data/transparansi sistem (menampilkan indikator status seperti Sumber Data Terverifikasi, Terbuka untuk Publik, dan Diperbarui Berkala dengan ikon daftar vertikal).
   • Kartu Bawah: Panel Unduh Data Terbuka yang berisi tombol ekspor cepat (CSV, XLSX, JSON, atau sesuai fungsi ekspor yang sudah ada di proyek).
   • Sentuhan Visual Bawah (Footer Banner):
   • Tambahkan ilustrasi siluet/ikonik lanskap Banda Neira (seperti Gunung Api Banda, Benteng Belgica, dan perahu Kora-Kora) secara halus di bagian paling bawah canvas sebagai identitas lokal.
