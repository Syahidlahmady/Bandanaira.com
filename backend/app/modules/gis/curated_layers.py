from typing import Any, Dict, List

LAYER_DEFINITIONS: Dict[str, Dict[str, Any]] = {   'LAYER_ACCOMMODATION': {   'category': 'publik',
                               'color': '#10b981',
                               'description': 'Vila, homestay, dan penginapan '
                                              'ramah lingkungan di Kepulauan '
                                              'Banda.',
                               'icon': 'home',
                               'id': 'LAYER_ACCOMMODATION',
                               'name': 'Penginapan & Homestay'},
    'LAYER_ENERGY_WASTE': {   'category': 'resiliensi',
                              'color': '#f43f5e',
                              'description': 'Pembangkit listrik tenaga surya, '
                                             'bank sampah desa, dan titik '
                                             'pengelolaan kebersihan.',
                              'icon': 'zap',
                              'id': 'LAYER_ENERGY_WASTE',
                              'name': 'Fasilitas Energi & Kebersihan'},
    'LAYER_HERITAGE': {   'category': 'publik',
                          'color': '#f59e0b',
                          'description': 'Benteng bersejarah (Belgica, '
                                         'Nassau), rumah pengasingan tokoh '
                                         'bangsa, dan situs cagar budaya.',
                          'icon': 'landmark',
                          'id': 'LAYER_HERITAGE',
                          'name': 'Cagar Budaya & Sejarah'},
    'LAYER_KOPERASI_UMKM': {   'category': 'publik',
                               'color': '#8b5cf6',
                               'description': 'Sentra koperasi, galeri produk '
                                              'rempah pala Banda, dan gerai '
                                              'UMKM lokal.',
                               'icon': 'store',
                               'id': 'LAYER_KOPERASI_UMKM',
                               'name': 'Koperasi & UMKM Rempah'},
    'LAYER_PUBLIC_SAFETY': {   'category': 'publik',
                               'color': '#3b82f6',
                               'description': 'Pelabuhan PELNI, dermaga '
                                              'penyeberangan speedboat antar '
                                              'pulau, dan fasilitas publik.',
                               'icon': 'shield',
                               'id': 'LAYER_PUBLIC_SAFETY',
                               'name': 'Fasilitas Umum & Transportasi'},
    'LAYER_TOURISM_4A': {   'category': 'publik',
                            'color': '#06b6d4',
                            'description': 'Wisata bahari, spot diving dan '
                                           'snorkeling, pantai pasir putih, '
                                           'dan panorama alam kepulauan.',
                            'icon': 'compass',
                            'id': 'LAYER_TOURISM_4A',
                            'name': 'Wisata & Bahari'},
    'LAYER_WATER_INFRA': {   'category': 'resiliensi',
                             'color': '#0ea5e9',
                             'description': 'Stasiun filtrasi air minum, '
                                            'tandon air komunal, dan titik '
                                            'pasokan air bersih.',
                             'icon': 'droplets',
                             'id': 'LAYER_WATER_INFRA',
                             'name': 'Infrastruktur Air Bersih'}}

INITIAL_SPATIAL_FEATURES: List[Dict[str, Any]] = [
    {
        "name": "Benteng Nassau (Fort Nassau)",
        "layer_type": "LAYER_HERITAGE",
        "category": "publik",
        "island_name": "Pulau Neira",
        "latitude": -4.528057,
        "longitude": 129.897618,
        "geometry_geojson": None,
        "properties_meta": {
            "era": "VOC Awal Abad 17"
        },
        "description": "Benteng pertama Belanda yang dibangun di atas reruntuhan loji Portugis pada tahun 1609 oleh Laksamana Verhoeff."
    },
    {
        "name": "Istana Mini VOC Banda",
        "layer_type": "LAYER_HERITAGE",
        "category": "publik",
        "island_name": "Pulau Neira",
        "latitude": -4.528715,
        "longitude": 129.900531,
        "geometry_geojson": None,
        "properties_meta": {
            "era": "VOC Pemerintahan Kolonial"
        },
        "description": "Gedung kantor dan kediaman resmi Gubernur VOC di Banda, arsitektur megah neoklasik yang menjadi prototipe Istana Merdeka Jakarta."
    },
    {
        "name": "Rumah Pengasingan Bung Hatta",
        "layer_type": "LAYER_HERITAGE",
        "category": "publik",
        "island_name": "Pulau Neira",
        "latitude": -4.527351,
        "longitude": 129.89978,
        "geometry_geojson": None,
        "properties_meta": {
            "era": "Pergerakan Nasional Indonesia"
        },
        "description": "Tempat pengasingan Mohammad Hatta oleh kolonial Belanda (1936-1942). Dilengkapi ruang kelas belajar anak-anak Banda dan koleksi buku asli."
    },
    {
        "name": "Rumah Pengasingan Sutan Sjahrir",
        "layer_type": "LAYER_HERITAGE",
        "category": "publik",
        "island_name": "Pulau Neira",
        "latitude": -4.525816,
        "longitude": 129.897333,
        "geometry_geojson": None,
        "properties_meta": {
            "era": "Pergerakan Nasional Indonesia"
        },
        "description": "Tempat tinggal Sutan Sjahrir selama dibuang ke Banda Neira. Menampilkan gramofon kuno, meja kerja diplomasi, dan surat korespondensi."
    },
    {
        "name": "Delfika Homestay & Heritage Villa",
        "layer_type": "LAYER_ACCOMMODATION",
        "category": "publik",
        "island_name": "Pulau Neira",
        "latitude": -4.525779,
        "longitude": 129.897661,
        "geometry_geojson": None,
        "properties_meta": {
            "price_per_night_rp": 350000,
            "contact_whatsapp": "6281299887711"
        },
        "description": "Penginapan bersejarah di pusat kota Neira dengan kebun asri, air minum RO gratis dari tandon komunal, dan sistem solar backup."
    },
    {
        "name": "Puncak Vulkanik Gunung Api Banda",
        "layer_type": "LAYER_TOURISM_4A",
        "category": "publik",
        "island_name": "Gunung Api",
        "latitude": -4.522565,
        "longitude": 129.879867,
        "geometry_geojson": None,
        "properties_meta": {
            "sub_type": "alam",
            "guide_available": False
        },
        "description": "Puncak kawah vulkanik aktif berketinggian 640 mdpl dengan pemandangan 360 derajat seluruh gugusan kepulauan Banda."
    },
    {
        "name": "Maulana Hotel Banda Neira",
        "layer_type": "LAYER_ACCOMMODATION",
        "category": "publik",
        "island_name": "Pulau Neira",
        "latitude": -4.524368,
        "longitude": 129.897392,
        "geometry_geojson": None,
        "properties_meta": {
            "price_per_night_rp": 650000,
            "contact_whatsapp": "6281299887733"
        },
        "description": "Hotel tepi pantai legendaris Banda didirikan oleh tokoh budaya Des Alwi, pemandangan langsung ke Gunung Api."
    },
    {
        "name": "Benteng Revenge Pulau Ay",
        "layer_type": "LAYER_HERITAGE",
        "category": "publik",
        "island_name": "Pulau Ay",
        "latitude": -4.519078,
        "longitude": 129.773319,
        "geometry_geojson": None,
        "properties_meta": {
            "era": "Konflik VOC vs EIC"
        },
        "description": "Benteng pertahanan perebutan monopoli rempah antara armada VOC Belanda dan kongsi dagang Inggris EIC tahun 1616."
    },
    {
        "name": "Lava Flow Snorkeling & Coral Reef",
        "layer_type": "LAYER_TOURISM_4A",
        "category": "publik",
        "island_name": "Gunung Api",
        "latitude": -4.505933,
        "longitude": 129.880038,
        "geometry_geojson": None,
        "properties_meta": {
            "sub_type": "bahari",
            "highlights": "Karang meja raksasa, ikan kepe-kepe, jarak pandang 25 meter",
            "boat_access": "5 menit dari pelabuhan Neira",
            "entry_fee_rp": 25000,
            "best_time": "08:00 - 15:00 WIT",
            "guide_available": False
        },
        "description": "Terumbu karang alami yang tumbuh subur di atas batuan lava erupsi Gunung Api 1988. Salah satu spot snorkeling terkaya di dunia."
    },
    {
        "name": "Pelabuhan Laut Utama Banda Neira (Dermaga PELNI)",
        "layer_type": "LAYER_PUBLIC_SAFETY",
        "category": "publik",
        "island_name": "Pulau Neira",
        "latitude": -4.524928,
        "longitude": 129.896722,
        "geometry_geojson": None,
        "properties_meta": {},
        "description": "Dermaga sandar kapal penumpang PELNI (KM Nggapulu, KM Pangrango, KM Sangiang) dan logistik utama antar-pulau."
    },
    {
        "name": "Dermaga Penyeberangan Speedboat Neira - Lonthoir",
        "layer_type": "LAYER_PUBLIC_SAFETY",
        "category": "publik",
        "island_name": "Pulau Neira",
        "latitude": -4.527039,
        "longitude": 129.894823,
        "geometry_geojson": None,
        "properties_meta": {},
        "description": "Hub mobilitas warga dan wisatawan menyeberangi selat Neira menuju pulau Banda Besar menggunakan perahu ketinting dan speedboat."
    },
    {
        "name": "Pusat Pembangkit Listrik Tenaga Diesel (PLTD Neira PLN)",
        "layer_type": "LAYER_ENERGY_WASTE",
        "category": "resiliensi",
        "island_name": "Pulau Neira",
        "latitude": -4.528092,
        "longitude": 129.906077,
        "geometry_geojson": None,
        "properties_meta": {},
        "description": "Pembangkit diesel PLN penyedia daya listrik jaringan utama kota Neira dengan konsumsi solar ~1200 liter per hari."
    },
    {
        "name": "Benteng Belgica (Fort Belgica)",
        "layer_type": "LAYER_HERITAGE",
        "category": "publik",
        "island_name": "Pulau Neira",
        "latitude": -4.526116,
        "longitude": 129.898835,
        "geometry_geojson": None,
        "properties_meta": {
            "era": "VOC Kolonial Belanda"
        },
        "description": "Benteng segi lima bertingkat dibangun Pieter Both tahun 1611 di atas bukit Tabaleku untuk mengawasi seluruh teluk Neira."
    },
    {
        "name": "Rumah Ex Deputi",
        "layer_type": "LAYER_HERITAGE",
        "category": "publik",
        "island_name": "Banda Neira",
        "latitude": -4.528733,
        "longitude": 129.90087,
        "geometry_geojson": None,
        "properties_meta": {},
        "description": ""
    },
    {
        "name": "Benteng Hollandia Lonthoir",
        "layer_type": "LAYER_HERITAGE",
        "category": "publik",
        "island_name": "Banda Besar",
        "latitude": -4.547798,
        "longitude": 129.881315,
        "geometry_geojson": None,
        "properties_meta": {
            "era": "Benteng Lonthoir",
            "entry_fee_rp": 10000
        },
        "description": ""
    },
    {
        "name": "Benteng Concordia (Waer)",
        "layer_type": "LAYER_HERITAGE",
        "category": "publik",
        "island_name": "Banda Besar",
        "latitude": -4.5583,
        "longitude": 129.9481,
        "geometry_geojson": None,
        "properties_meta": {
            "era": "Benteng Peninggalan Masa Kolonialisme"
        },
        "description": ""
    },
    {
        "name": "Sumur Pusaka Lonthoir",
        "layer_type": "LAYER_WATER_INFRA",
        "category": "resiliensi",
        "island_name": "Banda Besar",
        "latitude": -4.547939,
        "longitude": 129.878333,
        "geometry_geojson": None,
        "properties_meta": {},
        "description": ""
    },
    {
        "name": "Rumah Pengasingan Iwa Kusuma Sumantri",
        "layer_type": "LAYER_HERITAGE",
        "category": "publik",
        "island_name": "Banda Neira",
        "latitude": -4.52786,
        "longitude": 129.901124,
        "geometry_geojson": None,
        "properties_meta": {
            "era": "Rumah Pengasingan Tokoh Bersejarah Indonesia"
        },
        "description": ""
    },
    {
        "name": "Rumah Pengasingan dr. Tjipto Mangunkusumo",
        "layer_type": "LAYER_HERITAGE",
        "category": "publik",
        "island_name": "Banda Neira",
        "latitude": -4.528596,
        "longitude": 129.902875,
        "geometry_geojson": None,
        "properties_meta": {
            "era": "Rumah Pengasingan Tokoh Sejarah"
        },
        "description": ""
    },
    {
        "name": "Rumah Budaya Banda Neira",
        "layer_type": "LAYER_HERITAGE",
        "category": "publik",
        "island_name": "Banda Neira",
        "latitude": -4.52564,
        "longitude": 129.897424,
        "geometry_geojson": None,
        "properties_meta": {
            "era": "Rumah Budaya ",
            "entry_fee_rp": 20000
        },
        "description": ""
    },
    {
        "name": "Gereja Tua Banda",
        "layer_type": "LAYER_HERITAGE",
        "category": "publik",
        "island_name": "Pulau Neira",
        "latitude": -4.526933,
        "longitude": 129.896776,
        "geometry_geojson": None,
        "properties_meta": {},
        "description": ""
    },
    {
        "name": "Gereja Betlehem",
        "layer_type": "LAYER_HERITAGE",
        "category": "publik",
        "island_name": "Pulau Ay",
        "latitude": -4.520132,
        "longitude": 129.773592,
        "geometry_geojson": None,
        "properties_meta": {},
        "description": ""
    },
    {
        "name": "Welvaren",
        "layer_type": "LAYER_HERITAGE",
        "category": "publik",
        "island_name": "Pulau Ay",
        "latitude": -4.518642,
        "longitude": 129.772654,
        "geometry_geojson": None,
        "properties_meta": {},
        "description": ""
    },
    {
        "name": "Sumur Air Payau Komunal Warga RT 02 Neira",
        "layer_type": "LAYER_WATER_INFRA",
        "category": "resiliensi",
        "island_name": "Pulau Neira",
        "latitude": -4.527,
        "longitude": 129.9005,
        "geometry_geojson": None,
        "properties_meta": {
            "live_tds_ppm": 780.0,
            "station_id": "WS-NEIRA-02",
            "tank_level_pct": 45.0,
            "water_quality_status": "PERLU FILTRASI RO (AIR PAYAU)",
            "water_source": "Sumur Galian Dangkal Warga"
        },
        "description": "Sumur galian komunal warga rentan intrusi air laut saat pasang purnama. Memerlukan pemantauan salinitas dan filtrasi kontinu."
    },
    {
        "name": "Puskesmas Perawatan & Pos SAR Banda Neira",
        "layer_type": "LAYER_PUBLIC_SAFETY",
        "category": "publik",
        "island_name": "Pulau Neira",
        "latitude": -4.528897,
        "longitude": 129.89846,
        "geometry_geojson": None,
        "properties_meta": {},
        "description": "Fasilitas gawat darurat medis pulau 24 jam dengan ruang rawat inap dan ambulans laut penyeberangan darurat ke RSUD Ambon."
    },
    {
        "name": "Terminal Dermaga Pulau Ay",
        "layer_type": "LAYER_PUBLIC_SAFETY",
        "category": "publik",
        "island_name": "Pulau Ay",
        "latitude": -4.517628,
        "longitude": 129.775153,
        "geometry_geojson": None,
        "properties_meta": {},
        "description": "Dermaga utama tambatan perahu dan speedboat penyeberangan warga serta wisatawan di pesisir Pulau Ay."
    },
    {
        "name": "Terminal Dermaga Pulau Ay",
        "layer_type": "LAYER_DESA_ADMIN",
        "category": "publik",
        "island_name": "Pulau Neira",
        "latitude": -4.517805,
        "longitude": 129.77511,
        "geometry_geojson": None,
        "properties_meta": {},
        "description": ""
    },
    {
        "name": "Pantai Nama",
        "layer_type": "LAYER_TOURISM_4A",
        "category": "publik",
        "island_name": "Pulau Ay",
        "latitude": -4.519836,
        "longitude": 129.780212,
        "geometry_geojson": None,
        "properties_meta": {
            "sub_type": "Wisata Alam",
            "guide_available": True
        },
        "description": ""
    },
    {
        "name": "Green Coconut Guest House",
        "layer_type": "LAYER_ACCOMMODATION",
        "category": "publik",
        "island_name": "Pulau Ay",
        "latitude": -4.519317,
        "longitude": 129.777669,
        "geometry_geojson": None,
        "properties_meta": {},
        "description": ""
    },
    {
        "name": "Embung Pulau Ay",
        "layer_type": "LAYER_WATER_INFRA",
        "category": "resiliensi",
        "island_name": "Pulau Ay",
        "latitude": -4.521746,
        "longitude": 129.774837,
        "geometry_geojson": None,
        "properties_meta": {},
        "description": ""
    },
    {
        "name": "Sablah Parbai",
        "layer_type": "LAYER_TOURISM_4A",
        "category": "publik",
        "island_name": "Pulau Ay",
        "latitude": -4.518757,
        "longitude": 129.76774,
        "geometry_geojson": None,
        "properties_meta": {
            "sub_type": "Wisata Alam",
            "guide_available": True
        },
        "description": ""
    },
    {
        "name": "Sabla Pante",
        "layer_type": "LAYER_TOURISM_4A",
        "category": "publik",
        "island_name": "Pulau Ay",
        "latitude": -4.522201,
        "longitude": 129.763641,
        "geometry_geojson": None,
        "properties_meta": {
            "sub_type": "Wisata Alam",
            "highlights": "Pantai Bagian Barat di Pulau Ay",
            "guide_available": True
        },
        "description": ""
    },
    {
        "name": "Pantai Tampa Nama",
        "layer_type": "LAYER_TOURISM_4A",
        "category": "publik",
        "island_name": "Pulau Ay",
        "latitude": -4.536875,
        "longitude": 129.771709,
        "geometry_geojson": None,
        "properties_meta": {
            "sub_type": "Pantai",
            "guide_available": True
        },
        "description": ""
    },
    {
        "name": "RSUD Banda",
        "layer_type": "LAYER_DESA_ADMIN",
        "category": "publik",
        "island_name": "Pulau Neira",
        "latitude": -4.515762,
        "longitude": 129.901764,
        "geometry_geojson": None,
        "properties_meta": {},
        "description": ""
    },
    {
        "name": "Blood Stone",
        "layer_type": "LAYER_HERITAGE",
        "category": "publik",
        "island_name": "Banda Besar",
        "latitude": -4.549417,
        "longitude": 129.877222,
        "geometry_geojson": None,
        "properties_meta": {},
        "description": ""
    },
    {
        "name": "Hutan Kelle",
        "layer_type": "LAYER_TOURISM_4A",
        "category": "publik",
        "island_name": "Banda Besar",
        "latitude": -4.548645,
        "longitude": 129.876096,
        "geometry_geojson": None,
        "properties_meta": {
            "sub_type": "Wisata Bahari",
            "guide_available": True
        },
        "description": ""
    },
    {
        "name": "Sentra UMKM RT 01 Negeri Merdeka",
        "layer_type": "LAYER_KOPERASI_UMKM",
        "category": "publik",
        "island_name": "Pulau Neira",
        "latitude": -4.5128,
        "longitude": 129.8986,
        "geometry_geojson": None,
        "properties_meta": {
            "rt_area": "RT. 01 Negeri Merdeka",
            "village": "Negeri Administratif Merdeka",
            "total_umkm": 4,
            "established_years": "2022 - 2024",
            "commodities_accepted": "Olahan Buah Pala & Hasil Perikanan",
            "umkm_units": [
                {
                    "name": "Nurmila",
                    "business": "UMKM Selai Pala",
                    "category": "Olahan Pala",
                    "year": 2024,
                    "workforce": 1,
                    "address": "RT. 01 Negeri Merdeka"
                },
                {
                    "name": "Sumarni Abdullah",
                    "business": "UMKM Pentolan Ikan",
                    "category": "Olahan Ikan",
                    "year": 2024,
                    "workforce": 1,
                    "address": "RT. 01 Negeri Merdeka"
                },
                {
                    "name": "Sumiati",
                    "business": "UMKM Pentolan & Bakso Ikan",
                    "category": "Olahan Ikan",
                    "year": 2023,
                    "workforce": 1,
                    "address": "RT. 01 Negeri Merdeka"
                },
                {
                    "name": "Fatma Nasarudn",
                    "business": "UMKM Kerupuk Ikan",
                    "category": "Olahan Ikan",
                    "year": 2022,
                    "workforce": 1,
                    "address": "RT. 01 Negeri Merdeka"
                }
            ]
        },
        "description": "Sentra usaha mikro warga RT 01 Negeri Merdeka berbasis potensi lokal pesisir dan perkebunan: Selai Pala Alami (Nurmila), Pentolan & Bakso Ikan (Sumarni Abdullah & Sumiati), serta Kerupuk Ikan Gurih (Fatma Nasarudn)."
    },
    {
        "name": "Sentra UMKM RT 02 Negeri Merdeka",
        "layer_type": "LAYER_KOPERASI_UMKM",
        "category": "publik",
        "island_name": "Pulau Neira",
        "latitude": -4.5142,
        "longitude": 129.8998,
        "geometry_geojson": None,
        "properties_meta": {
            "rt_area": "RT. 02 Negeri Merdeka",
            "village": "Negeri Administratif Merdeka",
            "total_umkm": 5,
            "established_years": "2023 - 2024",
            "commodities_accepted": "Olahan Buah Pala, Ikan Asar/Abon & Kerajinan Cendramata",
            "umkm_units": [
                {
                    "name": "Saharia Elwarin",
                    "business": "UMKM Manisan Pala & Abon Ikan",
                    "category": "Olahan Pala & Ikan",
                    "year": 2023,
                    "workforce": 1,
                    "address": "RT. 02 Negeri Merdeka"
                },
                {
                    "name": "Aisa Ahmad",
                    "business": "UMKM Manisan Pala",
                    "category": "Olahan Pala",
                    "year": 2024,
                    "workforce": 1,
                    "address": "RT. 02 Negeri Merdeka"
                },
                {
                    "name": "Swanty Ekasari Madura",
                    "business": "UMKM Kerajinan Cendramata",
                    "category": "Cendramata / Kerajinan",
                    "year": 2024,
                    "workforce": 1,
                    "address": "RT. 02 Negeri Merdeka"
                },
                {
                    "name": "Rasid Madura",
                    "business": "UMKM Kerajinan Cendramata",
                    "category": "Cendramata / Kerajinan",
                    "year": 2023,
                    "workforce": 1,
                    "address": "RT. 02 Negeri Merdeka"
                }
            ]
        },
        "description": "Sentra hilirisasi komoditas dan kerajinan warga RT 02 Jln. Adika Negeri Merdeka: Manisan Buah Pala Segar (Saharia Elwarin & Aisa Ahmad), Abon Ikan Cakalang (Saharia Elwarin), serta Kerajinan Cendramata Khas Banda (Swanty Ekasari Madura & Rasid Madura)."
    }
]
