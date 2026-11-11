from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from backend.app.modules.dss.schemas import (
    SAWCalculationRequest,
    SAWCalculationResponse,
    TourismPreferences,
    CrisisPriorityWeights,
    SAWCriterion,
    CriterionType,
    SAWAlternativeInput,
)
from backend.app.modules.dss.engine import SAWMachine
from backend.app.modules.dss.sample_data import (
    TOURISM_DEFAULT_CRITERIA,
    TOURISM_SAMPLE_ALTERNATIVES,
    CRISIS_DEFAULT_CRITERIA,
    CRISIS_SAMPLE_ALTERNATIVES,
)

router = APIRouter(prefix="/dss", tags=["Decision Support System (SAW)"])


@router.post(
    "/hitung-saw",
    response_model=SAWCalculationResponse,
    status_code=status.HTTP_200_OK,
    summary="Perhitungan Generik Metode Simple Additive Weighting (SAW)",
)
async def hitung_saw_generik(request: SAWCalculationRequest):
    """
    Menghitung perankingan multi-kriteria menggunakan metode Simple Additive Weighting (SAW).
    Mendukung kriteria bertipe BENEFIT (keuntungan) dan COST (biaya) dengan normalisasi matriks otomatis.
    """
    try:
        response = SAWMachine.calculate(request, mode_name="CUSTOM_SAW")
        return response
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get(
    "/wisata/alternatives",
    response_model=List[SAWAlternativeInput],
    summary="Daftar Alternatif Akomodasi & Wisata Banda Neira",
)
async def list_wisata_alternatives():
    """Mengambil daftar alternatif penginapan dan destinasi wisata di Kepulauan Banda."""
    return TOURISM_SAMPLE_ALTERNATIVES


@router.post(
    "/rekomendasi-wisata",
    response_model=SAWCalculationResponse,
    status_code=status.HTTP_200_OK,
    summary="DSS Mode 1: Rekomendasi Wisata & Penginapan bagi Wisatawan",
)
async def rekomendasi_wisata(prefs: Optional[TourismPreferences] = None):
    """
    Menghitung rekomendasi penginapan dan destinasi wisata optimal berdasarkan preferensi wisatawan.
    Kriteria:
    - c1_harga (Cost): Tarif per malam (Rp)
    - c2_jarak (Cost): Jarak ke dermaga utama (km)
    - c3_fasilitas (Benefit): Fasilitas air bersih RO & cadangan listrik surya
    - c4_daya_tarik (Benefit): Nilai sejarah dan keindahan alam
    """
    if prefs is None:
        prefs = TourismPreferences()

    # Susun kriteria dengan bobot yang disesuaikan pengguna
    criteria = [
        SAWCriterion(
            code="c1_harga",
            name="Tarif Sewa per Malam (Rp)",
            criterion_type=CriterionType.COST,
            weight=prefs.weight_harga,
        ),
        SAWCriterion(
            code="c2_jarak",
            name="Jarak ke Dermaga Utama (km)",
            criterion_type=CriterionType.COST,
            weight=prefs.weight_jarak,
        ),
        SAWCriterion(
            code="c3_fasilitas",
            name="Fasilitas Air RO & Energi Surya",
            criterion_type=CriterionType.BENEFIT,
            weight=prefs.weight_fasilitas,
        ),
        SAWCriterion(
            code="c4_daya_tarik",
            name="Daya Tarik Budaya & Sejarah",
            criterion_type=CriterionType.BENEFIT,
            weight=prefs.weight_daya_tarik,
        ),
    ]

    # Filter alternatif berdasarkan batas budget atau pulau jika diisi
    filtered_alternatives: List[SAWAlternativeInput] = []
    for alt in TOURISM_SAMPLE_ALTERNATIVES:
        if prefs.max_budget_rp and alt.values.get("c1_harga", 0) > prefs.max_budget_rp:
            continue
        if prefs.island_filter and alt.metadata and prefs.island_filter.lower() not in str(alt.metadata.get("island", "")).lower():
            continue
        filtered_alternatives.append(alt)

    if len(filtered_alternatives) < 2:
        # Jika filter terlalu ketat, gunakan seluruh alternatif agar perhitungan SAW tetap valid
        filtered_alternatives = TOURISM_SAMPLE_ALTERNATIVES

    request = SAWCalculationRequest(
        criteria=criteria,
        alternatives=filtered_alternatives,
    )

    response = SAWMachine.calculate(request, mode_name="MODE_1_SMART_TOURISM_SAW")
    return response


@router.get(
    "/krisis/alternatives",
    response_model=List[SAWAlternativeInput],
    summary="Daftar Alternatif Dusun & Wilayah Krisis Air/Energi",
)
async def list_krisis_alternatives():
    """Mengambil data telemetri/survei wilayah dusun di Kepulauan Banda untuk analisis krisis."""
    return CRISIS_SAMPLE_ALTERNATIVES


@router.post(
    "/prioritas-krisis",
    response_model=SAWCalculationResponse,
    status_code=status.HTTP_200_OK,
    summary="DSS Mode 2: Prioritas Intervensi Infrastruktur Air & Energi Desa",
)
async def prioritas_krisis(weights: Optional[CrisisPriorityWeights] = None):
    """
    Menghitung perankingan prioritas intervensi infrastruktur desa (tandon air RO bertenaga surya).
    Kriteria:
    - c1_kadar_tds (Benefit/Urgency): Semakin tinggi kadar garam sumur warga, semakin darurat butuh filter RO
    - c2_populasi (Benefit): Semakin banyak warga terdampak, semakin prioritas
    - c3_jarak_air (Benefit): Semakin jauh dari sumber air tawar alami, semakin butuh bantuan
    - c4_durasi_padam (Benefit): Semakin lama pemadaman listrik PLTD diesel, semakin mendesak PLTS
    """
    if weights is None:
        weights = CrisisPriorityWeights()

    criteria = [
        SAWCriterion(
            code="c1_kadar_tds",
            name="Kadar Garam / TDS Sumur Warga (ppm)",
            criterion_type=CriterionType.BENEFIT,
            weight=weights.weight_tds,
        ),
        SAWCriterion(
            code="c2_populasi",
            name="Jumlah Jiwa Terdampak (Orang)",
            criterion_type=CriterionType.BENEFIT,
            weight=weights.weight_populasi,
        ),
        SAWCriterion(
            code="c3_jarak_air",
            name="Jarak ke Sumber Air Tawar (Meter)",
            criterion_type=CriterionType.BENEFIT,
            weight=weights.weight_jarak_air,
        ),
        SAWCriterion(
            code="c4_durasi_padam",
            name="Durasi Pemadaman Listrik Diesel (Jam/Hari)",
            criterion_type=CriterionType.BENEFIT,
            weight=weights.weight_padam_listrik,
        ),
    ]

    request = SAWCalculationRequest(
        criteria=criteria,
        alternatives=CRISIS_SAMPLE_ALTERNATIVES,
    )

    response = SAWMachine.calculate(request, mode_name="MODE_2_INFRA_CRISIS_SAW")
    return response
