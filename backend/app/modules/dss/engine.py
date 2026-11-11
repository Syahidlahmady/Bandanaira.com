from typing import Dict, List, Tuple
from backend.app.modules.dss.schemas import (
    CriterionType,
    SAWCalculationRequest,
    SAWCalculationResponse,
    SAWAlternativeResult,
)


class SAWMachine:
    """
    Mesin Komputasi Keputusan Multi-Kriteria berbasis Simple Additive Weighting (SAW).
    Mengimplementasikan normalisasi matriks r_ij untuk kriteria Keuntungan (Benefit)
    dan Biaya (Cost) serta menghitung nilai preferensi V_i.
    """

    @staticmethod
    def calculate(request: SAWCalculationRequest, mode_name: str = "CUSTOM") -> SAWCalculationResponse:
        criteria_list = request.criteria
        alternatives = request.alternatives

        if not alternatives or not criteria_list:
            raise ValueError("Alternatif dan kriteria tidak boleh kosong.")

        # 1. Normalisasi Bobot Kriteria agar total = 1.0
        total_raw_weight = sum(c.weight for c in criteria_list)
        if total_raw_weight <= 0:
            raise ValueError("Total bobot kriteria harus lebih besar dari 0.")

        normalized_weights: Dict[str, float] = {
            c.code: round(c.weight / total_raw_weight, 6) for c in criteria_list
        }

        # 2. Cari Nilai Max dan Min per Kriteria
        max_values: Dict[str, float] = {}
        min_values: Dict[str, float] = {}

        for c in criteria_list:
            c_code = c.code
            extracted_vals = []
            for alt in alternatives:
                if c_code not in alt.values:
                    raise ValueError(f"Alternatif '{alt.name}' tidak memiliki nilai untuk kriteria '{c_code}'.")
                extracted_vals.append(float(alt.values[c_code]))

            max_values[c_code] = max(extracted_vals)
            min_values[c_code] = min(extracted_vals)

        # 3. Normalisasi Matriks r_ij & Hitung Skor Preferensi V_i
        calculated_results: List[SAWAlternativeResult] = []

        for alt in alternatives:
            norm_dict: Dict[str, float] = {}
            raw_dict: Dict[str, float] = {}
            preference_score = 0.0

            for c in criteria_list:
                c_code = c.code
                val = float(alt.values[c_code])
                raw_dict[c_code] = val
                w = normalized_weights[c_code]

                if c.criterion_type == CriterionType.BENEFIT:
                    # r_ij = x_ij / max(x_ij)
                    max_v = max_values[c_code]
                    r_ij = (val / max_v) if max_v > 0 else 0.0
                else:
                    # r_ij = min(x_ij) / x_ij (Cost)
                    min_v = min_values[c_code]
                    if val > 0:
                        r_ij = min_v / val
                    else:
                        r_ij = 1.0 if min_v == 0 else 0.0

                norm_val = round(r_ij, 4)
                norm_dict[c_code] = norm_val
                preference_score += w * r_ij

            calculated_results.append(
                SAWAlternativeResult(
                    rank=0,  # diisi setelah sorting
                    id=alt.id,
                    name=alt.name,
                    preference_score=round(preference_score, 4),
                    normalized_values=norm_dict,
                    raw_values=raw_dict,
                    metadata=alt.metadata,
                )
            )

        # 4. Urutkan berdasarkan Skor Preferensi V_i Tertinggi ke Terendah
        calculated_results.sort(key=lambda x: x.preference_score, reverse=True)

        # 5. Tetapkan Peringkat (1..N)
        for idx, res in enumerate(calculated_results, start=1):
            res.rank = idx

        top_rec = calculated_results[0] if calculated_results else None

        return SAWCalculationResponse(
            mode=mode_name,
            total_alternatives=len(calculated_results),
            normalized_weights=normalized_weights,
            results=calculated_results,
            top_recommendation=top_rec,
        )
