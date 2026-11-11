import pytest
from httpx import AsyncClient


async def get_admin_token(client: AsyncClient) -> str:
    res = await client.post(
        "/api/v1/auth/login",
        json={"username_or_email": "admin", "password": "Admin123!"},
    )
    return res.json()["access_token"]


async def create_sample_resident(
    client: AsyncClient, token: str, nik: str = "8171010101900001", name: str = "Ahmad Baadilla"
):
    res = await client.post(
        "/api/v1/population/residents",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "nik": nik,
            "full_name": name,
            "gender": "L",
            "birth_place": "Banda Neira",
            "birth_date": "1990-01-01",
            "address": "Jl. Pelabuhan Banda",
            "rt": "001",
            "rw": "001",
            "village": "Nusantara",
            "occupation": "Petani Pala",
            "phone_number": "081234567890",
        },
    )
    assert res.status_code == 201
    return res.json()


@pytest.mark.asyncio
async def test_setor_komoditas_balance(client: AsyncClient):
    token = await get_admin_token(client)
    resident = await create_sample_resident(client, token, "8171010101900001", "Ahmad Baadilla")
    nik = resident["nik"]

    # 1. Setor 10 kg Pala Super ke Tabungan Saldo Rp
    # 10 kg * Rp 75,000 = Rp 750,000
    res = await client.post(
        "/api/v1/koperasi/transaksi/setor-komoditas",
        json={
            "nik": nik,
            "commodity_type": "pala_super",
            "weight_kg": 10.0,
            "destination": "BALANCE",
            "notes": "Hasil panen kebun nutmeg Hatta",
        },
    )
    assert res.status_code == 201
    data = res.json()
    assert data["transaction_type"] == "DEPOSIT_COMMODITY"
    assert data["weight_or_volume"] == 10.0
    assert data["monetary_value_rp"] == 750000.0
    assert data["receipt_hash"].startswith("0x")

    # 2. Cek Profil Koperasi Warga
    res_prof = await client.get(f"/api/v1/koperasi/warga/{nik}/profil")
    assert res_prof.status_code == 200
    prof = res_prof.json()
    assert prof["coop_balance_rp"] == 750000.0
    assert prof["total_commodities_kg"] == 10.0
    # Default kuota awal adalah 20.0 liter
    assert prof["clean_water_quota_ltr"] == 20.0


@pytest.mark.asyncio
async def test_setor_komoditas_water_quota(client: AsyncClient):
    token = await get_admin_token(client)
    nik = "8171010101900002"
    await create_sample_resident(client, token, nik, "Fatima Al-Banda")

    # Setor 1 kg Fuli Merah ke Kuota Air Bersih
    # Fuli = Rp 95,000 / kg. Air = Rp 500 / liter -> 95,000 / 500 = 190.0 Liter air
    res = await client.post(
        "/api/v1/koperasi/transaksi/setor-komoditas",
        json={
            "nik": nik,
            "commodity_type": "fuli_merah",
            "weight_kg": 1.0,
            "destination": "WATER_QUOTA",
            "notes": "Tukar fuli jadi kuota air minum",
        },
    )
    assert res.status_code == 201
    data = res.json()
    assert data["water_quota_impact_ltr"] == 190.0

    res_prof = await client.get(f"/api/v1/koperasi/warga/{nik}/profil")
    prof = res_prof.json()
    # Awal 20.0 + 190.0 = 210.0 Liter
    assert prof["clean_water_quota_ltr"] == 210.0
    assert prof["coop_balance_rp"] == 0.0


@pytest.mark.asyncio
async def test_setor_sampah_plastik_air_bersih(client: AsyncClient):
    token = await get_admin_token(client)
    nik = "8171010101900003"
    await create_sample_resident(client, token, nik, "Muhammad Syahrir")

    # Setor 3 kg Botol Plastik PET
    # Mandat Prof Purwo: 1 kg botol plastik = 10 Liter air bersih RO, 10 poin, Rp 5,000
    # 3 kg -> 30 Liter air bersih, 30 poin
    res = await client.post(
        "/api/v1/koperasi/transaksi/setor-sampah",
        json={
            "nik": nik,
            "waste_type": "botol_plastik_pet",
            "weight_kg": 3.0,
            "destination": "WATER_QUOTA",
            "notes": "Sampah pantai Neira Basudara",
        },
    )
    assert res.status_code == 201
    data = res.json()
    assert data["transaction_type"] == "DEPOSIT_WASTE"
    assert data["weight_or_volume"] == 3.0
    assert data["water_quota_impact_ltr"] == 30.0

    # Cek Akun Warga
    res_prof = await client.get(f"/api/v1/koperasi/warga/{nik}/profil")
    prof = res_prof.json()
    assert prof["plastic_points"] == 30
    # Awal 20 + 30 = 50 liter
    assert prof["clean_water_quota_ltr"] == 50.0
    assert prof["total_plastic_recycled_kg"] == 3.0


@pytest.mark.asyncio
async def test_tebus_air_dispenser_happy_path_and_exhaustion(client: AsyncClient):
    token = await get_admin_token(client)
    nik = "8171010101900004"
    await create_sample_resident(client, token, nik, "Siti Rahma")

    # Kuota default warga baru = 20 Liter
    # Tebus 15 Liter di Dispenser RO Lonthoir
    res = await client.post(
        "/api/v1/koperasi/tebus-air",
        json={
            "nik": nik,
            "liters_requested": 15.0,
            "station_code": "RO-STATION-LONTHOIR-01",
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["valve_status"] == "OPEN"
    assert data["liters_dispensed"] == 15.0
    assert data["dispense_duration_sec"] == 45  # 15L * 3 detik/L
    assert data["remaining_quota_ltr"] == 5.0
    assert data["receipt_hash"].startswith("0x")

    # Coba tebus 10 Liter padahal sisa 5 Liter -> Harusnya gagal 400
    res_fail = await client.post(
        "/api/v1/koperasi/tebus-air",
        json={
            "nik": nik,
            "liters_requested": 10.0,
            "station_code": "RO-STATION-LONTHOIR-01",
        },
    )
    assert res_fail.status_code == 400
    assert "tidak mencukupi" in res_fail.json()["detail"]


@pytest.mark.asyncio
async def test_koperasi_ledger_and_recap(client: AsyncClient):
    token = await get_admin_token(client)
    nik = "8171010101900005"
    await create_sample_resident(client, token, nik, "La Ode Rahman")

    # Setor cakalang 5kg = Rp 125,000
    res1 = await client.post(
        "/api/v1/koperasi/transaksi/setor-komoditas",
        json={
            "nik": nik,
            "commodity_type": "ikan_cakalang",
            "weight_kg": 5.0,
            "destination": "BALANCE",
        },
    )
    assert res1.status_code == 201

    # Setor 2kg botol plastik = 20L air, 20 poin
    res2 = await client.post(
        "/api/v1/koperasi/transaksi/setor-sampah",
        json={
            "nik": nik,
            "waste_type": "botol_plastik_pet",
            "weight_kg": 2.0,
            "destination": "WATER_QUOTA",
        },
    )
    assert res2.status_code == 201

    # Cek riwayat buku besar (ledger)
    res_ledger = await client.get(f"/api/v1/koperasi/transaksi?nik={nik}")
    assert res_ledger.status_code == 200
    items = res_ledger.json()
    assert len(items) == 2

    # Cek Rekapitulasi Ekosistem Pulau
    res_recap = await client.get("/api/v1/koperasi/rekapitulasi")
    assert res_recap.status_code == 200
    recap = res_recap.json()
    assert recap["total_transactions_count"] >= 2
    assert recap["total_commodities_recap_kg"] >= 5.0
    assert recap["total_plastic_recycled_kg"] >= 2.0


@pytest.mark.asyncio
async def test_koperasi_invalid_resident(client: AsyncClient):
    # NIK yang tidak terdaftar
    res = await client.post(
        "/api/v1/koperasi/transaksi/setor-komoditas",
        json={
            "nik": "9999999999999999",
            "commodity_type": "pala_super",
            "weight_kg": 5.0,
            "destination": "BALANCE",
        },
    )
    assert res.status_code == 404
    assert "tidak ditemukan" in res.json()["detail"]
