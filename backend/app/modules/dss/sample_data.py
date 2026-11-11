from typing import List
from backend.app.modules.dss.schemas import (
    SAWCriterion,
    CriterionType,
    SAWAlternativeInput,
)

# Kriteria Mode 1: Rekomendasi Wisata & Penginapan
TOURISM_DEFAULT_CRITERIA: List[SAWCriterion] = [
    SAWCriterion(
        code="c1_harga",
        name="Tarif Sewa per Malam (Rp)",
        criterion_type=CriterionType.COST,
        weight=0.25,
    ),
    SAWCriterion(
        code="c2_jarak",
        name="Jarak ke Dermaga Utama (km)",
        criterion_type=CriterionType.COST,
        weight=0.20,
    ),
    SAWCriterion(
        code="c3_fasilitas",
        name="Fasilitas Air RO & Energi Surya (Skor 1-100)",
        criterion_type=CriterionType.BENEFIT,
        weight=0.30,
    ),
    SAWCriterion(
        code="c4_daya_tarik",
        name="Daya Tarik Budaya, Snorkeling & Sejarah (Skor 1-100)",
        criterion_type=CriterionType.BENEFIT,
        weight=0.25,
    ),
]

# Alternatif Mode 1: Akomodasi & Wisata Banda Neira
TOURISM_SAMPLE_ALTERNATIVES: List[SAWAlternativeInput] = [
    SAWAlternativeInput(
        id="inap-001",
        name="Delfika Homestay & Heritage Villa",
        values={
            "c1_harga": 350000,
            "c2_jarak": 0.4,
            "c3_fasilitas": 92,
            "c4_daya_tarik": 95,
        },
        metadata={
            "island": "Pulau Neira",
            "type": "HERITAGE_HOMESTAY",
            "has_clean_ro_water": True,
            "has_solar_backup": True,
            "eco_stay_badge": True,
            "contact_whatsapp": "6281234567891",
            "description": "Penginapan cagar budaya kolonial dengan filtrasi air minum RO mandiri dan pemandangan Gunung Api Banda.",
            "photo_url": "/static/img/delfika.jpg",
        },
    ),
    SAWAlternativeInput(
        id="inap-002",
        name="The Nutmeg Tree Eco-Lodge Lonthoir",
        values={
            "c1_harga": 450000,
            "c2_jarak": 4.8,
            "c3_fasilitas": 88,
            "c4_daya_tarik": 98,
        },
        metadata={
            "island": "Pulau Banda Besar",
            "type": "ECO_VILLA",
            "has_clean_ro_water": True,
            "has_solar_backup": True,
            "eco_stay_badge": True,
            "contact_whatsapp": "6281234567892",
            "description": "Vila kayu ramah lingkungan di tengah kebun pala perawan Lonthoir dengan akses trekking sejarah dan pemandangan selat.",
            "photo_url": "/static/img/nutmeg_tree.jpg",
        },
    ),
    SAWAlternativeInput(
        id="inap-003",
        name="Maulana Hotel Waterfront Heritage",
        values={
            "c1_harga": 850000,
            "c2_jarak": 0.2,
            "c3_fasilitas": 95,
            "c4_daya_tarik": 90,
        },
        metadata={
            "island": "Pulau Neira",
            "type": "HOTEL",
            "has_clean_ro_water": True,
            "has_solar_backup": False,
            "eco_stay_badge": False,
            "contact_whatsapp": "6281234567893",
            "description": "Hotel legendaris tepi laut tempat mendiang Des Alwi menyambut tamu negara dunia.",
            "photo_url": "/static/img/maulana.jpg",
        },
    ),
    SAWAlternativeInput(
        id="inap-004",
        name="Mutiara Guesthouse Nusantara",
        values={
            "c1_harga": 220000,
            "c2_jarak": 0.8,
            "c3_fasilitas": 72,
            "c4_daya_tarik": 82,
        },
        metadata={
            "island": "Pulau Neira",
            "type": "GUESTHOUSE",
            "has_clean_ro_water": False,
            "has_solar_backup": False,
            "eco_stay_badge": False,
            "contact_whatsapp": "6281234567894",
            "description": "Akomodasi hemat untuk backpacker dekat pasar ikan dan Benteng Nassau.",
            "photo_url": "/static/img/mutiara.jpg",
        },
    ),
    SAWAlternativeInput(
        id="inap-005",
        name="Hatta Reef Eco-Cabin",
        values={
            "c1_harga": 500000,
            "c2_jarak": 18.5,
            "c3_fasilitas": 80,
            "c4_daya_tarik": 99,
        },
        metadata={
            "island": "Pulau Hatta",
            "type": "ECO_CABIN",
            "has_clean_ro_water": True,
            "has_solar_backup": True,
            "eco_stay_badge": True,
            "contact_whatsapp": "6281234567895",
            "description": "Kabin pesisir terisolasi di bibir drop-off terumbu karang terbaik dunia dengan tenaga surya 100%.",
            "photo_url": "/static/img/hatta_cabin.jpg",
        },
    ),
    SAWAlternativeInput(
        id="inap-006",
        name="Ai Island Spice Homestay",
        values={
            "c1_harga": 280000,
            "c2_jarak": 12.0,
            "c3_fasilitas": 75,
            "c4_daya_tarik": 91,
        },
        metadata={
            "island": "Pulau Ai",
            "type": "HOMESTAY",
            "has_clean_ro_water": True,
            "has_solar_backup": False,
            "eco_stay_badge": False,
            "contact_whatsapp": "6281234567896",
            "description": "Penginapan autentik di pulau penghasil fuli merah dengan air hujan terfiltrasi.",
            "photo_url": "/static/img/ai_homestay.jpg",
        },
    ),
]

# Kriteria Mode 2: Prioritas Intervensi Krisis Infrastruktur Air & Energi
CRISIS_DEFAULT_CRITERIA: List[SAWCriterion] = [
    SAWCriterion(
        code="c1_kadar_tds",
        name="Kadar Garam / TDS Sumur Warga (ppm)",
        criterion_type=CriterionType.BENEFIT,  # Semakin tinggi TDS, semakin darurat butuh RO
        weight=0.35,
    ),
    SAWCriterion(
        code="c2_populasi",
        name="Jumlah Jiwa Terdampak (Orang)",
        criterion_type=CriterionType.BENEFIT,  # Semakin banyak warga, semakin prioritas
        weight=0.25,
    ),
    SAWCriterion(
        code="c3_jarak_air",
        name="Jarak ke Sumber Air Tawar (Meter)",
        criterion_type=CriterionType.BENEFIT,  # Semakin jauh dari air tawar, semakin mendesak
        weight=0.20,
    ),
    SAWCriterion(
        code="c4_durasi_padam",
        name="Durasi Pemadaman Listrik Diesel (Jam/Hari)",
        criterion_type=CriterionType.BENEFIT,  # Semakin lama padam, semakin butuh PLTS
        weight=0.20,
    ),
]

# Alternatif Mode 2: Wilayah Dusun & RT di Kepulauan Banda
CRISIS_SAMPLE_ALTERNATIVES: List[SAWAlternativeInput] = [
    SAWAlternativeInput(
        id="zone-001",
        name="Dusun Lonthoir Pesisir (RT 03/RW 01)",
        values={
            "c1_kadar_tds": 2650.0,
            "c2_populasi": 340.0,
            "c3_jarak_air": 1800.0,
            "c4_durasi_padam": 10.5,
        },
        metadata={
            "island": "Pulau Banda Besar",
            "village": "Desa Lonthoir",
            "urgency_level": "KRITIS",
            "notes": "Air sumur payau berasa asin tinggi, warga membeli air galon seberang pulau.",
        },
    ),
    SAWAlternativeInput(
        id="zone-002",
        name="Dusun Selamon Barat (RT 01/RW 02)",
        values={
            "c1_kadar_tds": 1950.0,
            "c2_populasi": 280.0,
            "c3_jarak_air": 1200.0,
            "c4_durasi_padam": 8.0,
        },
        metadata={
            "island": "Pulau Banda Besar",
            "village": "Desa Selamon",
            "urgency_level": "TINGGI",
            "notes": "Tandon komunal mengalami kebocoran, membutuhkan pompa bertenaga surya.",
        },
    ),
    SAWAlternativeInput(
        id="zone-003",
        name="Kampung Baru Neira (RT 02/RW 01)",
        values={
            "c1_kadar_tds": 420.0,
            "c2_populasi": 510.0,
            "c3_jarak_air": 350.0,
            "c4_durasi_padam": 4.0,
        },
        metadata={
            "island": "Pulau Neira",
            "village": "Desa Nusantara",
            "urgency_level": "SEDANG",
            "notes": "TDS sumur moderat, jaringan listrik relatif lebih stabil dekat PLTD.",
        },
    ),
    SAWAlternativeInput(
        id="zone-004",
        name="Pulau Hatta Sentra Nelayan (RT 01/RW 01)",
        values={
            "c1_kadar_tds": 3100.0,
            "c2_populasi": 220.0,
            "c3_jarak_air": 3500.0,
            "c4_durasi_padam": 16.0,
        },
        metadata={
            "island": "Pulau Hatta",
            "village": "Desa Hatta",
            "urgency_level": "SANGAT_KRITIS",
            "notes": "Hanya mengandalkan tadah hujan saat kemarau, listrik diesel hanya menyala 6 jam malam.",
        },
    ),
    SAWAlternativeInput(
        id="zone-005",
        name="Pulau Ai Lereng Perkebunan (RT 02/RW 01)",
        values={
            "c1_kadar_tds": 2200.0,
            "c2_populasi": 195.0,
            "c3_jarak_air": 2400.0,
            "c4_durasi_padam": 14.0,
        },
        metadata={
            "island": "Pulau Ai",
            "village": "Desa Ai",
            "urgency_level": "TINGGI",
            "notes": "Membutuhkan instalasi BWRO tenaga surya mandiri untuk petani fuli.",
        },
    ),
]
