from typing import Dict

# Standar Harga Beli Komoditas Koperasi Hatta (per Kg)
COMMODITY_PRICES_RP: Dict[str, float] = {
    "pala_super": 75000.0,
    "pala_grade_b": 55000.0,
    "fuli_merah": 95000.0,
    "cengkeh": 60000.0,
    "ikan_cakalang": 25000.0,
    "tuna_sirip_kuning": 45000.0,
}

COMMODITY_DISPLAY_NAMES: Dict[str, str] = {
    "pala_super": "Pala Banda Grade A Super",
    "pala_grade_b": "Pala Banda Grade B Kupas",
    "fuli_merah": "Fuli Merah Murni Banda (Bunga Pala)",
    "cengkeh": "Cengkeh Kering Petik Kebun",
    "ikan_cakalang": "Ikan Cakalang Segar Pesisir",
    "tuna_sirip_kuning": "Tuna Sirip Kuning Segar (Yellowfin)",
}

# Standar Nilai Bank Sampah Plastik & Konversi Kuota Air Bersih
# Sesuai Mandat Prof. Purwo: Setiap 1 kg botol plastik menukar 10 liter air minum bersih!
WASTE_RATES: Dict[str, Dict[str, float]] = {
    "botol_plastik_pet": {
        "price_per_kg": 5000.0,
        "water_liters_per_kg": 10.0,
        "display_name": "Botol Plastik Bekas Air Minum (PET)",
    },
    "jeriken_galon_hdpe": {
        "price_per_kg": 6000.0,
        "water_liters_per_kg": 12.0,
        "display_name": "Jeriken & Galon Rusak (HDPE)",
    },
    "kardus_kertas": {
        "price_per_kg": 2500.0,
        "water_liters_per_kg": 5.0,
        "display_name": "Kardus & Kemasan Karton Bersih",
    },
}

# Standar Nilai Tukar Air RO jika dibeli tunai (Rp/Liter)
WATER_LITER_VALUE_RP = 500.0
