from typing import Any, Dict, List

LAYER_DEFINITIONS: Dict[str, Dict[str, Any]] = {
    "LAYER_TOURISM_4A": {
        "id": "LAYER_TOURISM_4A",
        "name": "Wisata & Bahari",
        "category": "publik",
        "color": "#06b6d4",  # Cyan
        "icon": "compass",
        "description": "Wisata bahari, spot diving dan snorkeling, pantai pasir putih, dan panorama alam kepulauan."
    },
    "LAYER_HERITAGE": {
        "id": "LAYER_HERITAGE",
        "name": "Cagar Budaya & Sejarah",
        "category": "publik",
        "color": "#f59e0b",  # Amber / Gold
        "icon": "landmark",
        "description": "Benteng bersejarah (Belgica, Nassau), rumah pengasingan tokoh bangsa, dan situs cagar budaya."
    },
    "LAYER_ACCOMMODATION": {
        "id": "LAYER_ACCOMMODATION",
        "name": "Penginapan & Homestay",
        "category": "publik",
        "color": "#10b981",  # Emerald
        "icon": "home",
        "description": "Vila, homestay, dan penginapan ramah lingkungan di Kepulauan Banda."
    },
    "LAYER_KOPERASI_UMKM": {
        "id": "LAYER_KOPERASI_UMKM",
        "name": "Koperasi & UMKM Rempah",
        "category": "publik",
        "color": "#8b5cf6",  # Purple
        "icon": "store",
        "description": "Sentra koperasi, galeri produk rempah pala Banda, dan gerai UMKM lokal."
    },
    "LAYER_PUBLIC_SAFETY": {
        "id": "LAYER_PUBLIC_SAFETY",
        "name": "Fasilitas Umum & Transportasi",
        "category": "publik",
        "color": "#3b82f6",  # Blue
        "icon": "shield",
        "description": "Pelabuhan PELNI, dermaga penyeberangan speedboat antar pulau, dan fasilitas publik."
    },
    "LAYER_WATER_INFRA": {
        "id": "LAYER_WATER_INFRA",
        "name": "Infrastruktur Air Bersih",
        "category": "resiliensi",
        "color": "#0ea5e9",  # Sky Teal
        "icon": "droplets",
        "description": "Stasiun filtrasi air minum, tandon air komunal, dan titik pasokan air bersih."
    },
    "LAYER_ENERGY_WASTE": {
        "id": "LAYER_ENERGY_WASTE",
        "name": "Fasilitas Energi & Kebersihan",
        "category": "resiliensi",
        "color": "#f43f5e",  # Rose
        "icon": "zap",
        "description": "Pembangkit listrik tenaga surya, bank sampah desa, dan titik pengelolaan kebersihan."
    }
}

INITIAL_SPATIAL_FEATURES: List[Dict[str, Any]] = [
    # ==================== LAYER 1: LAYER_TOURISM_4A ====================
    {
        "name": "Lava Flow Snorkeling & Coral Reef",
        "layer_type": "LAYER_TOURISM_4A",
        "category": "publik",
        "island_name": "Gunung Api",
        "latitude": -4.5160,
        "longitude": 129.8820,
        "description": "Terumbu karang alami yang tumbuh subur di atas batuan lava erupsi Gunung Api 1988. Salah satu spot snorkeling terkaya di dunia.",
        "properties_meta": {
            "sub_type": "bahari",
            "entry_fee_rp": 25000,
            "best_time": "08:00 - 15:00 WIT",
            "boat_access": "5 menit dari pelabuhan Neira",
            "highlights": "Karang meja raksasa, ikan kepe-kepe, jarak pandang 25 meter"
        }
    },
    {
        "name": "Hatta Reef Diving Wall & Drop-Off",
        "layer_type": "LAYER_TOURISM_4A",
        "category": "publik",
        "island_name": "Pulau Hatta",
        "latitude": -4.5880,
        "longitude": 129.9850,
        "description": "Dinding terumbu karang vertikal sedalam 60 meter di ujung selatan Pulau Hatta. Sangat terkenal untuk melihat kawanan penyu dan hiu karang sirip putih.",
        "properties_meta": {
            "sub_type": "bahari",
            "depth_range": "5 - 45 meter",
            "visibility_m": 30,
            "highlights": "White-tip sharks, green sea turtles, giant trevally"
        }
    },
    {
        "name": "Pantai Pasir Enam Lonthoir",
        "layer_type": "LAYER_TOURISM_4A",
        "category": "publik",
        "island_name": "Banda Besar",
        "latitude": -4.5420,
        "longitude": 129.9320,
        "description": "Garis pantai berpasir putih lembut dengan deretan pohon kelapa dan ketapang, terlindung dari ombak besar selat luar.",
        "properties_meta": {
            "sub_type": "pantai",
            "facilities": "Pondok istirahat bambu, kelapa muda segar",
            "entry_fee_rp": 10000
        }
    },
    {
        "name": "Puncak Vulkanik Gunung Api Banda",
        "layer_type": "LAYER_TOURISM_4A",
        "category": "publik",
        "island_name": "Gunung Api",
        "latitude": -4.5240,
        "longitude": 129.8810,
        "description": "Puncak kawah vulkanik aktif berketinggian 640 mdpl dengan pemandangan 360 derajat seluruh gugusan kepulauan Banda.",
        "properties_meta": {
            "sub_type": "alam",
            "trekking_duration_hrs": 3.5,
            "elevation_mdpl": 640,
            "guide_recommended": True
        }
    },
    {
        "name": "Resto Rumah Mande & Kuliner Ikan Kuah Pala",
        "layer_type": "LAYER_TOURISM_4A",
        "category": "publik",
        "island_name": "Pulau Neira",
        "latitude": -4.5245,
        "longitude": 129.9030,
        "description": "Sentra kuliner tradisional Neira menyajikan sup ikan kuah pala segar, rujak buah pala, dan sambal kenari.",
        "properties_meta": {
            "sub_type": "kuliner",
            "specialty": "Ikan Cakalang Kuah Pala & Halwa Pala",
            "average_meal_rp": 45000,
            "opening_hours": "10:00 - 22:00 WIT"
        }
    },

    # ==================== LAYER 2: LAYER_HERITAGE ====================
    {
        "name": "Benteng Belgica (Fort Belgica)",
        "layer_type": "LAYER_HERITAGE",
        "category": "publik",
        "island_name": "Pulau Neira",
        "latitude": -4.5222,
        "longitude": 129.9022,
        "description": "Benteng segi lima bertingkat dibangun Pieter Both tahun 1611 di atas bukit Tabaleku untuk mengawasi seluruh teluk Neira.",
        "properties_meta": {
            "built_year": 1611,
            "slug": "benteng-belgica",
            "audio_url": "https://stream.bandadigital.id/audio/heritage/benteng-belgica.mp3",
            "unesco_candidate": True,
            "era": "VOC Kolonial Belanda"
        }
    },
    {
        "name": "Benteng Nassau (Fort Nassau)",
        "layer_type": "LAYER_HERITAGE",
        "category": "publik",
        "island_name": "Pulau Neira",
        "latitude": -4.5248,
        "longitude": 129.9015,
        "description": "Benteng pertama Belanda yang dibangun di atas reruntuhan loji Portugis pada tahun 1609 oleh Laksamana Verhoeff.",
        "properties_meta": {
            "built_year": 1609,
            "slug": "benteng-nassau",
            "audio_url": "https://stream.bandadigital.id/audio/heritage/benteng-nassau.mp3",
            "era": "VOC Awal Abad 17"
        }
    },
    {
        "name": "Rumah Pengasingan Bung Hatta",
        "layer_type": "LAYER_HERITAGE",
        "category": "publik",
        "island_name": "Pulau Neira",
        "latitude": -4.5265,
        "longitude": 129.9045,
        "description": "Tempat pengasingan Mohammad Hatta oleh kolonial Belanda (1936-1942). Dilengkapi ruang kelas belajar anak-anak Banda dan koleksi buku asli.",
        "properties_meta": {
            "period": "1936-1942",
            "slug": "rumah-pengasingan-bung-hatta",
            "audio_url": "https://stream.bandadigital.id/audio/heritage/rumah-bung-hatta.mp3",
            "era": "Pergerakan Nasional Indonesia"
        }
    },
    {
        "name": "Rumah Pengasingan Sutan Sjahrir",
        "layer_type": "LAYER_HERITAGE",
        "category": "publik",
        "island_name": "Pulau Neira",
        "latitude": -4.5270,
        "longitude": 129.9052,
        "description": "Tempat tinggal Sutan Sjahrir selama dibuang ke Banda Neira. Menampilkan gramofon kuno, meja kerja diplomasi, dan surat korespondensi.",
        "properties_meta": {
            "period": "1936-1942",
            "slug": "rumah-pengasingan-sutan-sjahrir",
            "audio_url": "https://stream.bandadigital.id/audio/heritage/rumah-sutan-sjahrir.mp3",
            "era": "Pergerakan Nasional Indonesia"
        }
    },
    {
        "name": "Istana Mini VOC Banda",
        "layer_type": "LAYER_HERITAGE",
        "category": "publik",
        "island_name": "Pulau Neira",
        "latitude": -4.5235,
        "longitude": 129.9038,
        "description": "Gedung kantor dan kediaman resmi Gubernur VOC di Banda, arsitektur megah neoklasik yang menjadi prototipe Istana Merdeka Jakarta.",
        "properties_meta": {
            "built_year": 1622,
            "slug": "istana-mini-voc",
            "audio_url": "https://stream.bandadigital.id/audio/heritage/istana-mini-voc.mp3",
            "era": "VOC Pemerintahan Kolonial"
        }
    },
    {
        "name": "Benteng Hollandia Lonthoir",
        "layer_type": "LAYER_HERITAGE",
        "category": "publik",
        "island_name": "Banda Besar",
        "latitude": -4.5510,
        "longitude": 129.9080,
        "description": "Benteng VOC di tebing tinggi Lonthoir dengan meriam kuno yang menghadap ke Selat Banda dan Gunung Api.",
        "properties_meta": {
            "built_year": 1624,
            "slug": "benteng-hollandia",
            "era": "VOC Pengawasan Perkebunan Pala"
        }
    },
    {
        "name": "Benteng Revenge Pulau Ay",
        "layer_type": "LAYER_HERITAGE",
        "category": "publik",
        "island_name": "Pulau Ay",
        "latitude": -4.5280,
        "longitude": 129.8370,
        "description": "Benteng pertahanan perebutan monopoli rempah antara armada VOC Belanda dan kongsi dagang Inggris EIC tahun 1616.",
        "properties_meta": {
            "built_year": 1616,
            "slug": "benteng-revenge",
            "era": "Konflik VOC vs EIC"
        }
    },

    # ==================== LAYER 3: LAYER_ACCOMMODATION ====================
    {
        "name": "Delfika Homestay & Heritage Villa",
        "layer_type": "LAYER_ACCOMMODATION",
        "category": "publik",
        "island_name": "Pulau Neira",
        "latitude": -4.5261,
        "longitude": 129.8985,
        "description": "Penginapan bersejarah di pusat kota Neira dengan kebun asri, air minum RO gratis dari tandon komunal, dan sistem solar backup.",
        "properties_meta": {
            "price_per_night_rp": 350000,
            "type": "homestay",
            "has_clean_ro_water": True,
            "has_solar_backup": True,
            "rooms_available": 6,
            "contact_whatsapp": "6281299887711",
            "saw_score": 0.945,
            "saw_rank": 1
        }
    },
    {
        "name": "The Nutmeg Tree Homestay Banda Besar",
        "layer_type": "LAYER_ACCOMMODATION",
        "category": "publik",
        "island_name": "Banda Besar",
        "latitude": -4.5490,
        "longitude": 129.9120,
        "description": "Pondok ramah lingkungan di tengah kebun pala rindang Lonthoir, pemandangan laut dan pasokan air RO terverifikasi.",
        "properties_meta": {
            "price_per_night_rp": 300000,
            "type": "homestay",
            "has_clean_ro_water": True,
            "has_solar_backup": False,
            "rooms_available": 4,
            "contact_whatsapp": "6281299887722",
            "saw_score": 0.880,
            "saw_rank": 2
        }
    },
    {
        "name": "Maulana Hotel Banda Neira",
        "layer_type": "LAYER_ACCOMMODATION",
        "category": "publik",
        "island_name": "Pulau Neira",
        "latitude": -4.5230,
        "longitude": 129.9050,
        "description": "Hotel tepi pantai legendaris Banda didirikan oleh tokoh budaya Des Alwi, pemandangan langsung ke Gunung Api.",
        "properties_meta": {
            "price_per_night_rp": 650000,
            "type": "hotel",
            "has_clean_ro_water": True,
            "has_solar_backup": True,
            "rooms_available": 12,
            "contact_whatsapp": "6281299887733"
        }
    },
    {
        "name": "Hatta Eco-Reef Cabin",
        "layer_type": "LAYER_ACCOMMODATION",
        "category": "publik",
        "island_name": "Pulau Hatta",
        "latitude": -4.5820,
        "longitude": 129.9810,
        "description": "Kabin kayu ramah lingkungan tepi pantai pasir putih Hatta, beroperasi 100% dengan solar panel mandiri dan air RO.",
        "properties_meta": {
            "price_per_night_rp": 400000,
            "type": "cabin",
            "has_clean_ro_water": True,
            "has_solar_backup": True,
            "rooms_available": 5,
            "contact_whatsapp": "6281299887744",
            "saw_score": 0.865,
            "saw_rank": 3
        }
    },
    {
        "name": "Ai Spice Island Homestay",
        "layer_type": "LAYER_ACCOMMODATION",
        "category": "publik",
        "island_name": "Pulau Ay",
        "latitude": -4.5295,
        "longitude": 129.8390,
        "description": "Homestay tradisional keluarga petani pala Pulau Ay, menyajikan pengalaman petik rempah dan masakan rumahan khas.",
        "properties_meta": {
            "price_per_night_rp": 280000,
            "type": "homestay",
            "has_clean_ro_water": True,
            "has_solar_backup": True,
            "rooms_available": 3,
            "contact_whatsapp": "6281299887755"
        }
    },

    # ==================== LAYER 4: LAYER_KOPERASI_UMKM ====================
    {
        "name": "Kantor Pusat Koperasi Hatta & Kasir Timbangan",
        "layer_type": "LAYER_KOPERASI_UMKM",
        "category": "publik",
        "island_name": "Pulau Neira",
        "latitude": -4.5252,
        "longitude": 129.9035,
        "description": "Pusat penerimaan komoditas pala, fuli, cengkeh, penukaran sampah plastik botol PET ke air RO, dan verifikasi sertifikat blockchain.",
        "properties_meta": {
            "sub_type": "koperasi_pusat",
            "commodities_accepted": "Pala Super, Fuli Merah, Cengkeh, Cakalang",
            "plastic_conversion": "1 kg PET = 10 Liter Air RO + 10 Poin",
            "operating_hours": "07:30 - 17:00 WIT"
        }
    },
    {
        "name": "Galeri Rempah UMKM Banda Heritage",
        "layer_type": "LAYER_KOPERASI_UMKM",
        "category": "publik",
        "island_name": "Pulau Neira",
        "latitude": -4.5258,
        "longitude": 129.9040,
        "description": "Pusat oleh-oleh khas Banda: selai pala alami, sirup pala segar, minyak atsiri fuli murni, dan manisan kering kenari.",
        "properties_meta": {
            "sub_type": "toko_umkm",
            "featured_products": "Minyak Atsiri Fuli, Selai Buah Pala, Kopi Rempah",
            "blockchain_verified": True
        }
    },
    {
        "name": "Sentra Kebun Pala Lonthoir Asli #01",
        "layer_type": "LAYER_KOPERASI_UMKM",
        "category": "publik",
        "island_name": "Banda Besar",
        "latitude": -4.5530,
        "longitude": 129.9150,
        "description": "Petak perkebunan pala organik Lonthoir berumur ratusan tahun, ternaungi pohon kenari raksasa dengan ketertelusuran QR blockchain.",
        "properties_meta": {
            "sub_type": "kebun_pala",
            "area_sqm": 25000,
            "primary_commodity": "Myristica fragrans (Pala Banda)",
            "traceability_id": "FARM-BND-LNT-001"
        }
    },
    {
        "name": "Rumah Jemur Solar Tunnel Fuli & Pala Koperasi",
        "layer_type": "LAYER_KOPERASI_UMKM",
        "category": "publik",
        "island_name": "Pulau Ay",
        "latitude": -4.5275,
        "longitude": 129.8360,
        "description": "Fasilitas pengeringan higienis berteknologi surya kubah terpal untuk menjaga kadar air biji pala di bawah 10% dan fuli merah berkilau.",
        "properties_meta": {
            "sub_type": "fasilitas_pasca_panen",
            "drying_capacity_kg": 1500,
            "humidity_target": "9.5%"
        }
    },

    # ==================== LAYER 5: LAYER_PUBLIC_SAFETY ====================
    {
        "name": "Pelabuhan Laut Utama Banda Neira (Dermaga PELNI)",
        "layer_type": "LAYER_PUBLIC_SAFETY",
        "category": "publik",
        "island_name": "Pulau Neira",
        "latitude": -4.5240,
        "longitude": 129.9065,
        "description": "Dermaga sandar kapal penumpang PELNI (KM Nggapulu, KM Pangrango, KM Sangiang) dan logistik utama antar-pulau.",
        "properties_meta": {
            "sub_type": "pelabuhan_utama",
            "berth_depth_m": 12,
            "emergency_contact": "0910-21011"
        }
    },
    {
        "name": "Dermaga Penyeberangan Speedboat Neira - Lonthoir",
        "layer_type": "LAYER_PUBLIC_SAFETY",
        "category": "publik",
        "island_name": "Pulau Neira",
        "latitude": -4.5278,
        "longitude": 129.9028,
        "description": "Hub mobilitas warga dan wisatawan menyeberangi selat Neira menuju pulau Banda Besar menggunakan perahu ketinting dan speedboat.",
        "properties_meta": {
            "sub_type": "dermaga_rakyat",
            "fare_one_way_rp": 10000,
            "transit_time_mins": 7
        }
    },
    {
        "name": "Puskesmas Perawatan & Pos SAR Banda Neira",
        "layer_type": "LAYER_PUBLIC_SAFETY",
        "category": "publik",
        "island_name": "Pulau Neira",
        "latitude": -4.5260,
        "longitude": 129.9032,
        "description": "Fasilitas gawat darurat medis pulau 24 jam dengan ruang rawat inap dan ambulans laut penyeberangan darurat ke RSUD Ambon.",
        "properties_meta": {
            "sub_type": "layanan_kesehatan",
            "emergency_phone": "119 / 0811-4700-119",
            "sea_ambulance": "Tersedia 1 unit speedboat medis"
        }
    },
    {
        "name": "Titik Rawan Ombak Selat Lonthoir (Blind Spot Arus)",
        "layer_type": "LAYER_PUBLIC_SAFETY",
        "category": "publik",
        "island_name": "Banda Besar",
        "latitude": -4.5350,
        "longitude": 129.9000,
        "description": "Zona arus selat berputar dan gelombang pecah saat musim angin timur (Juni - Agustus). Diwajibkan pelampung keselamatan.",
        "properties_meta": {
            "sub_type": "hazard_zone",
            "hazard_type": "Arus Selat Berputar",
            "alert_level": "Waspada Musim Timur",
            "safety_equipment": "Life Jacket Wajib"
        }
    },

    # ==================== LAYER 6: LAYER_WATER_INFRA ====================
    {
        "name": "Stasiun BWRO & Dispenser Mandat Prof. Purwo #1",
        "layer_type": "LAYER_WATER_INFRA",
        "category": "resiliensi",
        "island_name": "Banda Besar",
        "latitude": -4.5389,
        "longitude": 129.9042,
        "description": "Instalasi Reverse Osmosis bertenaga surya mengubah air payau sumur warga Lonthoir menjadi air minum murni sesuai standar WHO.",
        "properties_meta": {
            "station_id": "WS-LONTHOIR-01",
            "water_source": "Filtrasi Air Payau (BWRO) Tenaga Surya",
            "live_tds_ppm": 42.5,
            "water_quality_status": "LAYAK KONSUMSI (WHO STANDAR)",
            "tank_level_pct": 88.0,
            "daily_dispensed_liters": 420.0,
            "solenoid_valve_status": "ACTIVE_READY",
            "saw_score": 0.980,
            "saw_rank": 1
        }
    },
    {
        "name": "Sumur Air Payau Komunal Warga RT 02 Neira",
        "layer_type": "LAYER_WATER_INFRA",
        "category": "resiliensi",
        "island_name": "Pulau Neira",
        "latitude": -4.5270,
        "longitude": 129.9005,
        "description": "Sumur galian komunal warga rentan intrusi air laut saat pasang purnama. Memerlukan pemantauan salinitas dan filtrasi kontinu.",
        "properties_meta": {
            "station_id": "WS-NEIRA-02",
            "water_source": "Sumur Galian Dangkal Warga",
            "live_tds_ppm": 780.0,
            "water_quality_status": "PERLU FILTRASI RO (AIR PAYAU)",
            "tank_level_pct": 45.0
        }
    },
    {
        "name": "Stasiun Desalinasi SWRO Bertenaga Surya Pulau Hatta #2",
        "layer_type": "LAYER_WATER_INFRA",
        "category": "resiliensi",
        "island_name": "Pulau Hatta",
        "latitude": -4.5815,
        "longitude": 129.9805,
        "description": "Desalinasi air laut (SWRO) 5000 liter/hari yang menyelesaikan kelangkaan air bersih historis di Pulau Hatta.",
        "properties_meta": {
            "station_id": "WS-HATTA-02",
            "water_source": "Desalinasi Air Laut (SWRO)",
            "live_tds_ppm": 55.0,
            "water_quality_status": "LAYAK KONSUMSI",
            "tank_level_pct": 74.0,
            "daily_dispensed_liters": 260.0
        }
    },
    {
        "name": "Instalasi Tandon Air Komunal & Filter Pulau Ay #3",
        "layer_type": "LAYER_WATER_INFRA",
        "category": "resiliensi",
        "island_name": "Pulau Ay",
        "latitude": -4.5300,
        "longitude": 129.8380,
        "description": "Tandon sentral penampungan air hujan dan pemurnian air sumur payau untuk 120 kepala keluarga Pulau Ay.",
        "properties_meta": {
            "station_id": "WS-AY-03",
            "water_source": "Penampungan Air Hujan & Filter RO",
            "live_tds_ppm": 62.0,
            "water_quality_status": "LAYAK KONSUMSI",
            "tank_level_pct": 62.0
        }
    },

    # ==================== LAYER 7: LAYER_ENERGY_WASTE ====================
    {
        "name": "Sentra Bank Sampah Plastik Koperasi Hatta",
        "layer_type": "LAYER_ENERGY_WASTE",
        "category": "resiliensi",
        "island_name": "Pulau Neira",
        "latitude": -4.5255,
        "longitude": 129.9025,
        "description": "Pusat penimbangan dan pencacahan limbah botol plastik PET. Terintegrasi dengan kasir digital dan penukaran voucher air minum.",
        "properties_meta": {
            "sub_type": "bank_sampah",
            "total_recycled_kg": 1845.5,
            "daily_plastic_quota_liters": 1000,
            "plastic_conversion_rule": "1 kg botol PET = 10 Liter air RO"
        }
    },
    {
        "name": "Pusat Pembangkit Listrik Tenaga Diesel (PLTD Neira PLN)",
        "layer_type": "LAYER_ENERGY_WASTE",
        "category": "resiliensi",
        "island_name": "Pulau Neira",
        "latitude": -4.5285,
        "longitude": 129.8970,
        "description": "Pembangkit diesel PLN penyedia daya listrik jaringan utama kota Neira dengan konsumsi solar ~1200 liter per hari.",
        "properties_meta": {
            "sub_type": "pltd_diesel",
            "capacity_kw": 1200,
            "fuel_type": "Solar Industri B30",
            "diesel_consumption_lpd": 1200
        }
    },
    {
        "name": "Pusat Pembangkit Surya Terbarukan (PLTS Hatta 50 kWp)",
        "layer_type": "LAYER_ENERGY_WASTE",
        "category": "resiliensi",
        "island_name": "Pulau Hatta",
        "latitude": -4.5800,
        "longitude": 129.9790,
        "description": "Micro-grid tenaga surya mandiri 50 kWp dengan sistem baterai Lithium lifepo4 untuk memasok listrik bersih dan mesin SWRO.",
        "properties_meta": {
            "sub_type": "plts_surya",
            "capacity_kwp": 50,
            "battery_storage_kwh": 120,
            "diesel_saved_liters_daily": 42.0,
            "clean_energy_pct": 100
        }
    },
    {
        "name": "Sentra Reduksi Sampah Pesisir Pantai Malole",
        "layer_type": "LAYER_ENERGY_WASTE",
        "category": "resiliensi",
        "island_name": "Banda Besar",
        "latitude": -4.5450,
        "longitude": 129.9200,
        "description": "Titik penyisiran dan pengumpulan sampah plastik kiriman arus laut pesisir pantai timur Lonthoir oleh relawan KKN dan pemuda desa.",
        "properties_meta": {
            "sub_type": "timbulan_pesisir",
            "cleanup_schedule": "Setiap Sabtu Pagi",
            "marine_debris_intercepted_kg": 620.0
        }
    }
]
