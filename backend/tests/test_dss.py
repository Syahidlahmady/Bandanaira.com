import pytest
from httpx import AsyncClient, ASGITransport
from backend.app.main import app
from backend.app.modules.dss.schemas import (
    SAWCalculationRequest,
    SAWCriterion,
    CriterionType,
    SAWAlternativeInput,
)
from backend.app.modules.dss.engine import SAWMachine


@pytest.mark.asyncio
async def test_saw_engine_mathematical_precision():
    """Uji keakuratan rumus normalisasi Benefit/Cost dan skor preferensi Vi."""
    # 2 Kriteria: c1 (Benefit, bobot 0.6) dan c2 (Cost, bobot 0.4)
    criteria = [
        SAWCriterion(code="c1", name="Kualitas", criterion_type=CriterionType.BENEFIT, weight=0.6),
        SAWCriterion(code="c2", name="Biaya", criterion_type=CriterionType.COST, weight=0.4),
    ]

    # Alternatif A: c1=80, c2=200
    # Alternatif B: c1=100, c2=400
    # Alternatif C: c1=60, c2=100
    alternatives = [
        SAWAlternativeInput(id="A", name="Opsi A", values={"c1": 80, "c2": 200}),
        SAWAlternativeInput(id="B", name="Opsi B", values={"c1": 100, "c2": 400}),
        SAWAlternativeInput(id="C", name="Opsi C", values={"c1": 60, "c2": 100}),
    ]

    # Max c1 = 100, Min c2 = 100
    # Norm A: c1 = 80/100 = 0.8, c2 = 100/200 = 0.5. Vi = 0.6*0.8 + 0.4*0.5 = 0.48 + 0.20 = 0.68
    # Norm B: c1 = 100/100 = 1.0, c2 = 100/400 = 0.25. Vi = 0.6*1.0 + 0.4*0.25 = 0.60 + 0.10 = 0.70
    # Norm C: c1 = 60/100 = 0.6, c2 = 100/100 = 1.0. Vi = 0.6*0.6 + 0.4*1.0 = 0.36 + 0.40 = 0.76

    req = SAWCalculationRequest(criteria=criteria, alternatives=alternatives)
    resp = SAWMachine.calculate(req)

    assert resp.total_alternatives == 3
    # Urutan ranking seharusnya C (0.76), B (0.70), A (0.68)
    assert resp.results[0].id == "C"
    assert resp.results[0].rank == 1
    assert abs(resp.results[0].preference_score - 0.76) < 0.001

    assert resp.results[1].id == "B"
    assert resp.results[1].rank == 2
    assert abs(resp.results[1].preference_score - 0.70) < 0.001

    assert resp.results[2].id == "A"
    assert resp.results[2].rank == 3
    assert abs(resp.results[2].preference_score - 0.68) < 0.001


@pytest.mark.asyncio
async def test_dss_generic_endpoint():
    """Uji endpoint POST /api/v1/dss/hitung-saw"""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        payload = {
            "criteria": [
                {"code": "speed", "name": "Kecepatan", "criterion_type": "BENEFIT", "weight": 0.5},
                {"code": "cost", "name": "Biaya", "criterion_type": "COST", "weight": 0.5},
            ],
            "alternatives": [
                {"id": "alt-1", "name": "Pilihan 1", "values": {"speed": 100, "cost": 50}},
                {"id": "alt-2", "name": "Pilihan 2", "values": {"speed": 80, "cost": 25}},
            ],
        }
        res = await ac.post("/api/v1/dss/hitung-saw", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["total_alternatives"] == 2
        assert len(data["results"]) == 2
        assert data["top_recommendation"] is not None


@pytest.mark.asyncio
async def test_dss_mode_1_tourism_recommendation():
    """Uji DSS Mode 1: Rekomendasi Wisata & Penginapan Banda Neira."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Panggil dengan bobot custom (fokus ke fasilitas air RO)
        payload = {
            "weight_harga": 0.20,
            "weight_jarak": 0.15,
            "weight_fasilitas": 0.40,
            "weight_daya_tarik": 0.25,
        }
        res = await ac.post("/api/v1/dss/rekomendasi-wisata", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["mode"] == "MODE_1_SMART_TOURISM_SAW"
        assert data["total_alternatives"] >= 5
        top = data["top_recommendation"]
        assert top["rank"] == 1
        assert "metadata" in top
        assert top["metadata"]["has_clean_ro_water"] is True


@pytest.mark.asyncio
async def test_dss_mode_2_crisis_infrastructure_priority():
    """Uji DSS Mode 2: Prioritas Intervensi Krisis Air & Energi Desa."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        payload = {
            "weight_tds": 0.40,
            "weight_populasi": 0.25,
            "weight_jarak_air": 0.20,
            "weight_padam_listrik": 0.15,
        }
        res = await ac.post("/api/v1/dss/prioritas-krisis", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["mode"] == "MODE_2_INFRA_CRISIS_SAW"
        assert data["total_alternatives"] >= 4
        # Periksa bahwa wilayah dengan TDS sangat tinggi atau pulau terisolasi menempati ranking atas
        top = data["top_recommendation"]
        assert top["rank"] == 1
        assert top["raw_values"]["c1_kadar_tds"] >= 2000.0


@pytest.mark.asyncio
async def test_dss_alternatives_list_endpoints():
    """Uji endpoint daftar alternatif wisata dan krisis."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res_wisata = await ac.get("/api/v1/dss/wisata/alternatives")
        assert res_wisata.status_code == 200
        data_wisata = res_wisata.json()
        assert len(data_wisata) >= 5
        assert any(item["name"] == "Delfika Homestay & Heritage Villa" for item in data_wisata)

        res_krisis = await ac.get("/api/v1/dss/krisis/alternatives")
        assert res_krisis.status_code == 200
        data_krisis = res_krisis.json()
        assert len(data_krisis) >= 4
        assert any("Lonthoir" in item["name"] for item in data_krisis)
