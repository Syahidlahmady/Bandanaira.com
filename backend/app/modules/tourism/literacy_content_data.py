"""
Data Bank Konten Wisata Batch 1 (H7), Karya Peserta Workshop Literasi Digital (H11),
Katalog 3 Modul Literasi Digital, SOP 6-Tahap Manajemen Konten BST, 6-Point Quality Checklist,
serta Pemetaan 4 Zona Sinyal Kepulauan Banda (Mandat Reyhan Albar Fahryan - Content Manager & Community Engagement).
"""

from typing import List, Dict, Any

SEED_COMMUNITY_CONTENTS: List[Dict[str, Any]] = [
    # =========================================================================
    # 4 ARTIKEL FEATURE / SEO (ARTICLE)
    # =========================================================================
    {
        "content_code": "CNT-ART-001",
        "title": "Menelusuri Benteng Belgica: Mahkota Pertahanan Segi Lima di Puncak Bukit Tabaleku",
        "slug": "menelusuri-benteng-belgica-mahkota-pertahanan-tabaleku",
        "content_type": "ARTICLE",
        "priority_category": "DESTINASI",
        "island_name": "Pulau Neira",
        "author_name": "Reyhan Albar Fahryan",
        "author_role": "Content Manager & Community Engagement",
        "summary": (
            "Panduan lengkap wisata sejarah Benteng Belgica (1611), spot matahari terbit terbaik menghadap "
            "Gunung Api Banda dan Selat Neira yang diabadikan pada uang kertas Rp 1.000."
        ),
        "body_narrative": (
            "Berdiri megah di atas Bukit Tabaleku pada ketinggian 30 meter di atas permukaan laut, Benteng Belgica "
            "merupakan salah satu benteng bintang segi lima (pentagon) paling utuh di Nusantara. Dibangun oleh Gubernur "
            "Jenderal VOC Pieter Both pada tahun 1611 di atas struktur benteng Portugis abad ke-16, Belgica dirancang "
            "untuk mengawasi pergerakan kapal dagang di Selat Neira sekaligus menjadi benteng lapis kedua di belakang "
            "Benteng Nassau. Wisatawan disarankan berkunjung pada pukul 06.00 WIT atau 16.30 WIT untuk mendapatkan "
            "pencahayaan keemasan (golden hour) dengan latar kemegahan kerucut Gunung Api Banda."
        ),
        "media_url": "/images/landmarks/belgica.jpg",
        "latitude": -4.5265,
        "longitude": 129.9015,
        "sop_stage": "PUBLIKASI",
        "qc_accuracy": True,
        "qc_language": True,
        "qc_visual": True,
        "qc_adat_ethics": True,
        "qc_source_validated": True,
        "qc_consent_copyright": True,
        "is_published": True,
    },
    {
        "content_code": "CNT-ART-002",
        "title": "Jejak Emas Hijau Lonthoir: Dari Perkebunan Pala Rakyat Menuju Pasar Terverifikasi Blockchain",
        "slug": "jejak-emas-hijau-lonthoir-perkebunan-pala-rakyat",
        "content_type": "ARTICLE",
        "priority_category": "UMKM",
        "island_name": "Pulau Banda Besar",
        "author_name": "Reyhan Albar Fahryan & Khoirul Anam",
        "author_role": "Tim Editorial BST & Koperasi Hatta",
        "summary": (
            "Kisah petani pala Negeri Lonthoir merawat pohon pelindung kenari berusia ratusan tahun dan mengolah "
            "fuli kualitas Super Grade A serta produk turunan UMKM sirup dan selai pala."
        ),
        "body_narrative": (
            "Di lereng hijau Negeri Administratif Lonthoir, Pulau Banda Besar, pohon-pohon kenari raksasa menaungi "
            "ribuan pohon pala (Myristica fragrans) yang telah mengharumkan perdagangan dunia sejak abad pertengahan. "
            "Melalui pendampingan literasi digital dan integrasi Koperasi Serba Usaha Mohammad Hatta, hasil panen biji "
            "pala dan bunga pala (fuli) kini dicatat secara transparan menggunakan paspor digital QR. Selain rempah mentah, "
            "ibu-ibu kelompok UMKM juga mengolah daging buah pala yang dulunya terbuang menjadi manisan pala kering, "
            "sirup pala organik, dan balsem minyak atsiri bernilai tambah tinggi."
        ),
        "media_url": "/images/landmarks/kebun-pala.jpg",
        "latitude": -4.5450,
        "longitude": 129.9020,
        "sop_stage": "PUBLIKASI",
        "qc_accuracy": True,
        "qc_language": True,
        "qc_visual": True,
        "qc_adat_ethics": True,
        "qc_source_validated": True,
        "qc_consent_copyright": True,
        "is_published": True,
    },
    {
        "content_code": "CNT-ART-003",
        "title": "Harmoni Tabea & Sasi: Panduan Etika Kunjungan Wisata Adat dan Religi di Kepulauan Banda",
        "slug": "harmoni-tabea-dan-sasi-panduan-etika-wisata-adat-banda",
        "content_type": "ARTICLE",
        "priority_category": "RELIGI_KULTURAL",
        "island_name": "Pulau Neira",
        "author_name": "Reyhan Albar Fahryan & Iqbal",
        "author_role": "Divisi Konten Budaya & Sejarah Adat",
        "summary": (
            "Panduan wajib bagi wisatawan dalam menghormati kearifan lokal salam Tabea, pantangan kawasan Sasi Laut/Darat, "
            "serta tata krama mengunjungi sumur pusaka Parigi Rante dan Klenteng Sun Tian Kong (1673)."
        ),
        "body_narrative": (
            "Pariwisata berkelanjutan di Kepulauan Banda berdiri di atas fondasi penghormatan terhadap adat istiadat "
            "Negeri. 'Tabea' bukan sekadar sapaan sopan saat berpapasan dengan warga atau melewati tempat keramat, "
            "melainkan wujud pengakuan atas martabat tuan rumah. Wisatawan wajib mematuhi aturan 'Sasi'—hukum konservasi "
            "adat yang melarang pengambilan biota laut seperti lola, teripang, atau hasil kebun pada zona dan waktu "
            "tertentu. Saat mengunjungi situs sakral seperti Sumur Pusaka Parigi Rante, Rumah Adat, maupun Klenteng "
            "Sun Tian Kong, pengunjung wajib berpakaian sopan, meminta izin juru kunci, dan tidak memindahkan benda ritual."
        ),
        "media_url": "/images/landmarks/perigi-rante.jpg",
        "latitude": -4.5274,
        "longitude": 129.9032,
        "sop_stage": "PUBLIKASI",
        "qc_accuracy": True,
        "qc_language": True,
        "qc_visual": True,
        "qc_adat_ethics": True,
        "qc_source_validated": True,
        "qc_consent_copyright": True,
        "is_published": True,
    },
    {
        "content_code": "CNT-ART-004",
        "title": "Panduan Layanan Publik, Transportasi Ketinting Antar-Pulau & Tanggap Darurat Medis Banda Neira",
        "slug": "panduan-layanan-publik-transportasi-antar-pulau-banda",
        "content_type": "ARTICLE",
        "priority_category": "LAYANAN_PUBLIK",
        "island_name": "Pulau Neira",
        "author_name": "Reyhan Albar Fahryan",
        "author_role": "Content Manager & Community Engagement",
        "summary": (
            "Informasi jadwal kapal reguler Pelabuhan Bandanaira, tarif perahu ketinting menuju Lonthoir, Pulau Ay, "
            "Pulau Rhun, dan Pulau Hatta, serta akses fasilitas kesehatan RSUD Banda dan stasiun Air Bersih RO."
        ),
        "body_narrative": (
            "Mobilitas warga dan wisatawan di gugusan Kepulauan Banda bertumpu pada simpul Pelabuhan Utama Bandanaira "
            "dan dermaga rakyat Pasar Banda. Perahu motor ojek (ketinting) beroperasi rutin menghubungkan Pulau Neira "
            "dengan Desa Lonthoir dan Selamon (10–15 menit), sedangkan penyeberangan menuju Pulau Ay, Pulau Rhun, "
            "dan Pulau Hatta memerlukan waktu 45–75 menit mengikuti kondisi gelombang musim timur atau musim barat. "
            "Untuk layanan darurat kesehatan, RSUD Banda dan Puskesmas Bandanaira siap melayani 24 jam, didukung "
            "stasiun pengisian ulang air minum RO higienis Koperasi Hatta untuk menekan sampah botol plastik sekali pakai."
        ),
        "media_url": "/images/landmarks/pelabuhan.jpg",
        "latitude": -4.5245,
        "longitude": 129.9048,
        "sop_stage": "PUBLIKASI",
        "qc_accuracy": True,
        "qc_language": True,
        "qc_visual": True,
        "qc_adat_ethics": True,
        "qc_source_validated": True,
        "qc_consent_copyright": True,
        "is_published": True,
    },

    # =========================================================================
    # 3 FOTO GEOTAGGED BERKOORDINAT GPS BANDA (PHOTO_GEOTAGGED)
    # =========================================================================
    {
        "content_code": "CNT-FOTO-001",
        "title": "Taman Karang Tumbuh Cepat di Aliran Bekas Letusan Lava Flow 1988 Gunung Api Banda",
        "slug": "foto-geotag-taman-karang-lava-flow-gunung-api",
        "content_type": "PHOTO_GEOTAGGED",
        "priority_category": "DESTINASI",
        "island_name": "Pulau Gunung Api",
        "author_name": "Reyhan Albar Fahryan",
        "author_role": "Dokumentasi Spasial & Visual BST",
        "summary": (
            "Dokumentasi geotagged koloni karang meja (Acropora tabulate) yang pulih alami di atas batuan "
            "beku aliran lava letusan Gunung Api Banda tahun 1988."
        ),
        "body_narrative": (
            "Foto diambil pada koordinat GPS -4.5128, 129.8955 di sisi utara kaki Gunung Api Banda. Kejernihan air "
            "mencapai lebih dari 20 meter memungkinkan wisatawan melakukan snorkeling dangkal (2–5 meter) menyaksikan "
            "suksesi ekologis terumbu karang tercepat di dunia pasca-erupsi vulkanik."
        ),
        "media_url": "/images/landmarks/lava-flow.jpg",
        "latitude": -4.5128,
        "longitude": 129.8955,
        "sop_stage": "PUBLIKASI",
        "qc_accuracy": True,
        "qc_language": True,
        "qc_visual": True,
        "qc_adat_ethics": True,
        "qc_source_validated": True,
        "qc_consent_copyright": True,
        "is_published": True,
    },
    {
        "content_code": "CNT-FOTO-002",
        "title": "Arsitektur Akulturasi Abad ke-17 Klenteng Sun Tian Kong di Jantung Kota Tua Neira",
        "slug": "foto-geotag-klenteng-sun-tian-kong-1673",
        "content_type": "PHOTO_GEOTAGGED",
        "priority_category": "RELIGI_KULTURAL",
        "island_name": "Pulau Neira",
        "author_name": "Reyhan Albar Fahryan",
        "author_role": "Dokumentasi Spasial & Visual BST",
        "summary": (
            "Potret detail bubungan atap naga dan dinding kapur karang Klenteng Sun Tian Kong (berdiri 1673), "
            "saksi bisu jaringan niaga bahari pelaut Tionghoa di kepulauan rempah."
        ),
        "body_narrative": (
            "Direkam pada koordinat -4.5262, 129.9038 di Desa Nusantara. Pencahayaan sore hari menonjolkan tekstur "
            "asli dinding batu karang dan kayu ulin yang bertahan lebih dari tiga setengah abad. Lokasi ini telah "
            "divalidasi bersama penjaga klenteng untuk pemasangan QR Digital Passport Cagar Budaya."
        ),
        "media_url": "/images/landmarks/klenteng.jpg",
        "latitude": -4.5262,
        "longitude": 129.9038,
        "sop_stage": "PUBLIKASI",
        "qc_accuracy": True,
        "qc_language": True,
        "qc_visual": True,
        "qc_adat_ethics": True,
        "qc_source_validated": True,
        "qc_consent_copyright": True,
        "is_published": True,
    },
    {
        "content_code": "CNT-FOTO-003",
        "title": "Geliat Ekonomi Pagi di Pasar Tradisional & Dermaga Rakyat Bandanaira",
        "slug": "foto-geotag-geliat-ekonomi-pasar-bandanaira",
        "content_type": "PHOTO_GEOTAGGED",
        "priority_category": "UMKM",
        "island_name": "Pulau Neira",
        "author_name": "Reyhan Albar Fahryan",
        "author_role": "Dokumentasi Spasial & Visual BST",
        "summary": (
            "Transaksi hasil tangkapan ikan cakalang segar, kacang kenari kupas, dan olahan sukun di Pasar "
            "Bandanaira tepat di tepi dermaga pendaratan perahu desa."
        ),
        "body_narrative": (
            "Foto geotagged (-4.5258, 129.9052) merekam interaksi ekonomi harian antara nelayan Pulau Neira dan "
            "pekebun dari Pulau Banda Besar. Titik ini menjadi sentra edukasi Modul 3 Literasi Digital bagi pedagang "
            "UMKM kuliner lokal."
        ),
        "media_url": "/images/landmarks/pasar-banda.jpg",
        "latitude": -4.5258,
        "longitude": 129.9052,
        "sop_stage": "PUBLIKASI",
        "qc_accuracy": True,
        "qc_language": True,
        "qc_visual": True,
        "qc_adat_ethics": True,
        "qc_source_validated": True,
        "qc_consent_copyright": True,
        "is_published": True,
    },

    # =========================================================================
    # 2 VIDEO REELS / STORYBOARD @neirabasudara (VIDEO_REELS)
    # =========================================================================
    {
        "content_code": "CNT-VID-001",
        "title": "Reels @neirabasudara: 60 Detik Menyelami Palung Karang & Eco-Stay Tenaga Surya Pulau Hatta",
        "slug": "reels-neirabasudara-60-detik-pulau-hatta-eco-stay",
        "content_type": "VIDEO_REELS",
        "priority_category": "DESTINASI",
        "island_name": "Pulau Hatta",
        "author_name": "Tim Kreatif @neirabasudara & Reyhan Albar Fahryan",
        "author_role": "Kanal Komunitas @neirabasudara",
        "summary": (
            "Video vertikal 9:16 berstruktur AIDA yang menampilkan transisi dramatis dari pasir putih Kampung Lama "
            "Pulau Hatta menuju tebing drop-off bawah laut dan penginapan ramah lingkungan."
        ),
        "body_narrative": (
            "STORYBOARD VIDEO REELS (Durasi 60 Detik | Rasio 9:16):\n"
            "• [00:00–00:05] HOOK (Attention): Drone shot perahu ketinting membelah air sebening kaca di bibir palung Pulau Hatta.\n"
            "• [00:05–00:25] INTEREST: Footage bawah air kawanan ikan fusilier dan penyu sisik di Hatta Reef.\n"
            "• [00:25–00:45] DESIRE: Suasana senja di kabin tepi pantai bertenaga surya dengan sajian teh pala hangat dan air minum RO bebas plastik.\n"
            "• [00:45–01:00] ACTION (CTA): Panduan reservasi langsung Eco-Stay tanpa perantara melalui portal BST bandanaira.com."
        ),
        "media_url": "/images/landmarks/pulau-hatta.jpg",
        "latitude": -4.5910,
        "longitude": 129.9880,
        "sop_stage": "PUBLIKASI",
        "qc_accuracy": True,
        "qc_language": True,
        "qc_visual": True,
        "qc_adat_ethics": True,
        "qc_source_validated": True,
        "qc_consent_copyright": True,
        "is_published": True,
    },
    {
        "content_code": "CNT-VID-002",
        "title": "Reels @neirabasudara: Pulau Rhun 1667 — Pulau Kecil Banda yang Ditukar dengan Manhattan New York",
        "slug": "reels-neirabasudara-pulau-rhun-1667-manhattan",
        "content_type": "VIDEO_REELS",
        "priority_category": "RELIGI_KULTURAL",
        "island_name": "Pulau Rhun",
        "author_name": "Tim Kreatif @neirabasudara & Pokdarwis Rhun",
        "author_role": "Kanal Komunitas @neirabasudara",
        "summary": (
            "Storytelling sejarah populer Traktat Breda 1667 antara Belanda dan Inggris yang mempertukarkan Pulau Rhun "
            "penghasil pala dengan Pulau Manhattan (New Amsterdam)."
        ),
        "body_narrative": (
            "STORYBOARD VIDEO REELS (Durasi 55 Detik | Rasio 9:16):\n"
            "• [00:00–00:06] HOOK (Attention): 'Tahukah kamu? Pulau sekecil ini di Maluku pernah lebih berharga daripada kota New York!'\n"
            "• [00:06–00:25] INTEREST: Visual dermaga Pulau Rhun, benteng pertahanan Inggris Nathaniel Courthope, dan pohon pala purba.\n"
            "• [00:25–00:45] DESIRE: Keramahan warga Negeri Rhun menyambut wisatawan dengan tarian Cakalele dan kuliner ikan bakar kenari.\n"
            "• [00:45–00:55] ACTION (CTA): Cek peta interaktif 7-layer dan jadwal penyeberangan ke Pulau Rhun di bandanaira.com."
        ),
        "media_url": "/images/landmarks/pulau-rhun.jpg",
        "latitude": -4.5560,
        "longitude": 129.6840,
        "sop_stage": "PUBLIKASI",
        "qc_accuracy": True,
        "qc_language": True,
        "qc_visual": True,
        "qc_adat_ethics": True,
        "qc_source_validated": True,
        "qc_consent_copyright": True,
        "is_published": True,
    },

    # =========================================================================
    # 2 KARYA MANDIRI PESERTA WORKSHOP POKDARWIS & UMKM (COMMUNITY_WORK)
    # =========================================================================
    {
        "content_code": "CNT-WARGA-001",
        "title": "Dapur Rempah Mama Halimah: Rahasia Selai Pala & Halua Kenari Warisan Leluhur Nusantara",
        "slug": "karya-warga-dapur-rempah-mama-halimah-selai-pala",
        "content_type": "COMMUNITY_WORK",
        "priority_category": "UMKM",
        "island_name": "Pulau Neira",
        "author_name": "Siti Halimah Latarissa (Peserta Workshop UMKM)",
        "author_role": "Pelaku UMKM Kuliner Rempah Desa Nusantara",
        "summary": (
            "Karya praktik langsung peserta Workshop Literasi Digital (H11) menggunakan formula copywriting AIDA "
            "dan teknik foto produk cahaya alami jendela."
        ),
        "body_narrative": (
            "KARYA PESERTA WORKSHOP LITERASI DIGITAL (MODUL 2 & MODUL 3):\n"
            "• [Attention]: Jangan pulang dari Banda Neira sebelum mencicipi manis-hangatnya Selai Daging Buah Pala asli tanpa pengawet!\n"
            "• [Interest]: Diolah langsung dari buah pala segar pilihan kebun rakyat Banda yang dimasak perlahan bersama gula aren dan taburan kacang kenari sangrai.\n"
            "• [Desire]: Cocok untuk olesan roti sarapan maupun oleh-oleh khas kepulauan rempah yang tahan simpan hingga 6 bulan.\n"
            "• [Action]: Tersedia di Etalase Terverifikasi Koperasi Hatta & dapat dipesan langsung via tombol WhatsApp UMKM di portal BST."
        ),
        "media_url": "/images/landmarks/rumah-budaya.jpg",
        "latitude": -4.5280,
        "longitude": 129.9045,
        "sop_stage": "PUBLIKASI",
        "qc_accuracy": True,
        "qc_language": True,
        "qc_visual": True,
        "qc_adat_ethics": True,
        "qc_source_validated": True,
        "qc_consent_copyright": True,
        "is_published": True,
    },
    {
        "content_code": "CNT-WARGA-002",
        "title": "Catatan Pemandu Muda Pokdarwis: Menjaga Kelestarian Rumah Budaya & Koleksi Sejarah Banda",
        "slug": "karya-warga-catatan-pemandu-muda-pokdarwis-rumah-budaya",
        "content_type": "COMMUNITY_WORK",
        "priority_category": "RELIGI_KULTURAL",
        "island_name": "Pulau Neira",
        "author_name": "Rizky Baadilla (Peserta Workshop Pokdarwis)",
        "author_role": "Anggota Muda Pokdarwis Banda Neira",
        "summary": (
            "Artikel refleksi dan foto hasil praktik lapangan peserta pelatihan Pokdarwis mengenai pentingnya "
            "digitalisasi cerita lisan koleksi meriam, uang kuno VOC, dan lukisan sejarah di Rumah Budaya."
        ),
        "body_narrative": (
            "KARYA PESERTA WORKSHOP LITERASI DIGITAL (MODUL 1 & MODUL 2):\n"
            "Sebagai generasi muda Banda Neira, mengikuti pelatihan produksi konten wisata membuka mata kami bahwa "
            "setiap artefak di Rumah Budaya Banda memiliki kisah perjuangan leluhur yang harus diceritakan oleh "
            "anak negeri sendiri. Dengan teknik pengambilan foto sudut lebar (wide-angle) dan penulisan narasi yang "
            "tervalidasi oleh tetua adat, kami kini mampu mengunggah profil cagar budaya secara mandiri ke dalam "
            "CMS BST tanpa takut kehilangan akurasi sejarah."
        ),
        "media_url": "/images/landmarks/perigi-rante.jpg",
        "latitude": -4.5276,
        "longitude": 129.9040,
        "sop_stage": "PUBLIKASI",
        "qc_accuracy": True,
        "qc_language": True,
        "qc_visual": True,
        "qc_adat_ethics": True,
        "qc_source_validated": True,
        "qc_consent_copyright": True,
        "is_published": True,
    },
]


LITERACY_MODULES_CATALOG: List[Dict[str, Any]] = [
    {
        "module_code": "MODUL-01",
        "title": "Dasar Literasi Digital, Keamanan Data Sederhana & Navigasi Platform BST",
        "validation_status": "SIAP_UJI_PENUH",
        "target_audience": "Pokdarwis, Pengelola Homestay, Pelaku UMKM, & Perangkat Desa Kepulauan Banda",
        "duration_minutes": 90,
        "learning_objectives": [
            "Memahami arsitektur ekosistem satu pintu BST-NIRANA dan manfaat promosi wisata berbasis komunitas.",
            "Menerapkan keamanan akun dasar (PIN/kata sandi aman, verifikasi pesan WhatsApp bisnis, dan perlindungan data pribadi/NIK).",
            "Mengoperasikan fitur mode luring (Offline PWA) saat berada di titik blankspot atau sinyal lemah antar-pulau.",
        ],
        "key_topics": [
            "Pengenalan Portal Satu Pintu Banda Smart Tourism (BST)",
            "Etika Digital & Perlindungan Privasi Data Warga",
            "Cara Mengakses Peta Offline 7-Layer & Sinkronisasi Antrean Data Saat Kembali ke Zona 4G",
        ],
        "practical_output": "Peserta berhasil login ke akun peran masing-masing dan menavigasi katalog wisata serta peta interaktif secara offline maupun online.",
        "offline_ready": True,
    },
    {
        "module_code": "MODUL-02",
        "title": "Produksi Konten Wisata Sederhana (Foto Smartphone, Video Pendek 9:16, & Caption AIDA)",
        "validation_status": "DRAFT_TERVALIDASI",
        "target_audience": "Anggota Pokdarwis, Pemandu Wisata Lokal, & Kreator Muda @neirabasudara",
        "duration_minutes": 120,
        "learning_objectives": [
            "Menguasai teknik fotografi smartphone menggunakan komposisi Rule of Thirds dan pencahayaan alami (golden hour).",
            "Menyusun storyboard dan merekam video pendek format vertikal 9:16 berdurasi 30–60 detik untuk Reels/TikTok.",
            "Menulis narasi promosi wisata dan produk UMKM menggunakan struktur AIDA (Attention, Interest, Desire, Action) yang menghormati adat Tabea & Sasi.",
        ],
        "key_topics": [
            "Teknik Foto Destinasi, Homestay, & Kuliner Pala dengan Smartphone",
            "Formula Storytelling Video 60 Detik (Hook 5 Detik Pertama, Isi Visual, dan Call-to-Action)",
            "Penulisan Caption AIDA & Penyematan Koordinat Geotagging Lokasi",
        ],
        "practical_output": "Setiap peserta menghasilkan minimal 1 paket foto produk/destinasi ter-geotag dan 1 naskah caption AIDA siap tayang.",
        "offline_ready": True,
    },
    {
        "module_code": "MODUL-03",
        "title": "Pengelolaan Media Sosial, Etalase Produk UMKM, & Manajemen CMS BST",
        "validation_status": "DRAFT_TERVALIDASI",
        "target_audience": "Admin Komunitas Pokdarwis, Pengurus Koperasi Hatta, & Pelaku UMKM Rempah",
        "duration_minutes": 120,
        "learning_objectives": [
            "Mengelola kalender editorial mingguan untuk kanal media sosial komunitas (@neirabasudara) dan halaman BST.",
            "Mengunggah, menyunting, dan memverifikasi konten menggunakan SOP 6-Tahap dan 6-Point Quality Checklist di CMS BST.",
            "Mengintegrasikan katalog produk UMKM dan paket tur lokal dengan tautan pemesanan langsung WhatsApp.",
        ],
        "key_topics": [
            "Alur Kerja SOP 6-Tahap Manajemen Konten Komunitas (Ide hingga Arsip)",
            "Praktik Verifikasi 6-Point Quality Checklist sebelum Publikasi",
            "Optimasi Konversi Pesanan UMKM & Reservasi Homestay via Integrasi WhatsApp",
        ],
        "practical_output": "Peserta mampu mengunggah karya mandiri ke dalam CMS BST dan menyelesaikan pengecekan mutu 6 poin secara mandiri.",
        "offline_ready": True,
    },
]


SOP_CONTENT_WORKFLOW: List[Dict[str, Any]] = [
    {
        "stage_order": 1,
        "stage_code": "IDE",
        "stage_name": "1. Perencanaan & Riset Ide Lapangan",
        "pic_actor": "Anggota Pokdarwis / Pelaku UMKM / Kontributor Warga",
        "description": (
            "Identifikasi topik berdasarkan 4 kategori prioritas (Destinasi, UMKM, Religi-Kultural, Layanan Publik) "
            "serta wawancara awal dengan tokoh adat, pemilik usaha, atau juru kunci situs."
        ),
        "deliverable": "Lembar ide topik, daftar narasumber lokal, dan titik koordinat rencana liputan.",
    },
    {
        "stage_order": 2,
        "stage_code": "PRODUKSI",
        "stage_name": "2. Produksi Visual & Penulisan Draf Narasi",
        "pic_actor": "Kreator Komunitas / Peserta Workshop",
        "description": (
            "Pengambilan foto/video beresolusi jernih di lapangan (dapat dilakukan secara offline di pulau luar), "
            "pencatatan titik GPS geotagging, dan penyusunan draf artikel atau caption berformula AIDA."
        ),
        "deliverable": "File foto/video terkompresi ramah sinyal 3T dan draf teks narasi lengkap.",
    },
    {
        "stage_order": 3,
        "stage_code": "REVIEW",
        "stage_name": "3. Penyuntingan Bahasa & Kurasi Visual",
        "pic_actor": "Editor Komunitas (@neirabasudara) / Koordinator Konten",
        "description": (
            "Pemeriksaan keterbacaan bahasa, kelengkapan informasi praktis wisatawan (jam buka, rute, tarif), "
            "serta kurasi estetika foto/video agar bebas dari elemen buram atau melanggar privasi."
        ),
        "deliverable": "Draf konten tersunting yang siap diajukan ke tahap validasi adat & fakta.",
    },
    {
        "stage_order": 4,
        "stage_code": "VALIDASI",
        "stage_name": "4. Validasi Fakta Sejarah, Adat Tabea/Sasi & Consent",
        "pic_actor": "Tetua Adat / Juru Kunci Cagar Budaya / Admin Smart Tourism",
        "description": (
            "Verifikasi menyeluruh menggunakan 6-Point Quality Checklist: akurasi tahun/sejarah, kepatuhan etika "
            "adat Tabea & Sasi, persetujuan narasumber (informed consent), serta pencantuman kredit karya warga."
        ),
        "deliverable": "Skor kelulusan penuh 6/6 pada Quality Checklist dan persetujuan tayang.",
    },
    {
        "stage_order": 5,
        "stage_code": "PUBLIKASI",
        "stage_name": "5. Publikasi Multi-Kanal (Portal BST & @neirabasudara)",
        "pic_actor": "Admin Smart Tourism / Pengelola CMS BST",
        "description": (
            "Penayangan konten ke etalase publik Portal BST bandanaira.com (tersinkronisasi otomatis saat perangkat "
            "terhubung ke jaringan 4G Pulau Neira) dan distribusi silang ke Instagram/TikTok @neirabasudara."
        ),
        "deliverable": "Konten berstatus Published di portal web dan tayangan aktif di media sosial komunitas.",
    },
    {
        "stage_order": 6,
        "stage_code": "ARSIP",
        "stage_name": "6. Pengarsipan Bank Konten & Evaluasi Dampak",
        "pic_actor": "Content Manager & Pokdarwis Banda Neira",
        "description": (
            "Penyimpanan aset asli ke dalam repositori Bank Konten Komunitas sebagai materi edukasi berkelanjutan "
            "dan evaluasi jangkauan keterlibatan pengunjung."
        ),
        "deliverable": "Arsip terindeks kode unik (CNT-*) di basis data PostgreSQL untuk keberlanjutan pasca-program.",
    },
]


QUALITY_CHECKLIST_STANDARDS: List[Dict[str, Any]] = [
    {
        "field": "qc_accuracy",
        "code": "QC-01",
        "label": "Akurasi Fakta Sejarah & Data Geospasial",
        "criteria": "Nama tokoh, tahun peristiwa sejarah, harga layanan, dan titik koordinat pulau telah diverifikasi.",
    },
    {
        "field": "qc_language",
        "code": "QC-02",
        "label": "Kerapian Bahasa Indonesia & Struktur AIDA",
        "criteria": "Ejaan rapi, komunikatif, bebas clickbait menyesatkan, dan memuat ajakan bertindak (Call-to-Action) yang jelas.",
    },
    {
        "field": "qc_visual",
        "code": "QC-03",
        "label": "Kualitas Visual & Optimasi Ukuran File 3T",
        "criteria": "Foto/video memiliki pencahayaan baik, fokus tajam, dan telah dioptimasi agar cepat dimuat pada jaringan terbatas.",
    },
    {
        "field": "qc_adat_ethics",
        "code": "QC-04",
        "label": "Kepatuhan Etika Adat Tabea & Hukum Sasi",
        "criteria": "Tidak menampilkan pelanggaran zona Sasi, menghormati kesakralan situs adat/religi, dan menjunjung budaya Tabea.",
    },
    {
        "field": "qc_source_validated",
        "code": "QC-05",
        "label": "Validasi Narasumber Lokal / Juru Kunci",
        "criteria": "Informasi telah dikonfirmasi oleh pelaku UMKM terkait, pemandu HPI, atau juru kunci cagar budaya setempat.",
    },
    {
        "field": "qc_consent_copyright",
        "code": "QC-06",
        "label": "Izin Publikasi (Consent) & Kredit Hak Cipta Warga",
        "criteria": "Warga/subjek foto memberikan izin publikasi dan nama kontributor lokal dicantumkan secara terhormat.",
    },
]


SIGNAL_ZONES_MAPPING: List[Dict[str, Any]] = [
    {
        "zone_code": "ZONA-1",
        "zone_name": "Pusat Administrasi, Pelabuhan & Kota Tua Neira",
        "islands_covered": "Pulau Neira (Desa Nusantara, Dwiwarna, Kampung Baru, Merdeka, Tanah Rata, Rajawali)",
        "signal_status": "4G_STABIL",
        "avg_download_mbps": 18.5,
        "recommended_sync_strategy": "Unggah foto/video beresolusi penuh, sinkronisasi CMS real-time, dan publikasi media sosial.",
    },
    {
        "zone_code": "ZONA-2",
        "zone_name": "Pesisir & Permukiman Pulau Banda Besar",
        "islands_covered": "Pulau Banda Besar (Desa Lonthoir, Selamon, Waer)",
        "signal_status": "4G_MENENGAH_FLUKTUATIF",
        "avg_download_mbps": 6.2,
        "recommended_sync_strategy": "Gunakan gambar terkompresi lokal dan simpan draf survei/konten di antrean PWA saat sinyal melemah.",
    },
    {
        "zone_code": "ZONA-3",
        "zone_name": "Gugus Pulau Terluar Berpenghuni (Ay, Rhun, Hatta)",
        "islands_covered": "Pulau Ay, Pulau Rhun, & Pulau Hatta (Kampung Lama / Pantai Barat)",
        "signal_status": "SINYAL_LEMAH_INTERMITTENT",
        "avg_download_mbps": 1.4,
        "recommended_sync_strategy": "Andalkan mode Offline-First PWA (aset lokal & cache IndexedDB); lakukan sinkronisasi batch di titik dermaga.",
    },
    {
        "zone_code": "ZONA-4",
        "zone_name": "Jalur Laut, Lereng Puncak Gunung Api & Kebun Pedalaman",
        "islands_covered": "Perairan Selat Zonnegat, Kawah Gunung Api Banda, Pulau Nailaka, & Pulau Pisang (Syahrir)",
        "signal_status": "BLANKSPOT_OFFLINE",
        "avg_download_mbps": 0.0,
        "recommended_sync_strategy": "100% Mode Offline PWA: rekam koordinat GPS dan draf cerita di perangkat, unggah otomatis saat kembali ke Pulau Neira.",
    },
]
