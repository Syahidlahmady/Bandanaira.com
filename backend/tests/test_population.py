import pytest
from httpx import AsyncClient
from sqlalchemy import select
from backend.app.modules.audit.models import AuditLog


async def get_admin_token(client: AsyncClient) -> str:
    res = await client.post(
        "/api/v1/auth/login",
        json={"username_or_email": "admin", "password": "Admin123!"},
    )
    return res.json()["access_token"]


@pytest.mark.asyncio
async def test_create_resident_happy_path(client: AsyncClient):
    token = await get_admin_token(client)
    res = await client.post(
        "/api/v1/population/residents",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "nik": "8171010101900001",
            "full_name": "Ahmad Baadilla",
            "gender": "L",
            "birth_place": "Banda Neira",
            "birth_date": "1990-01-01",
            "address": "Jl. Nusantara No. 12",
            "rt": "001",
            "rw": "002",
            "village": "Banda Neira",
            "occupation": "Petani Rempah Pala",
            "phone_number": "081234567890",
        },
    )
    assert res.status_code == 201
    data = res.json()
    assert data["nik"] == "8171010101900001"
    assert data["full_name"] == "Ahmad Baadilla"
    assert data["verification_status"] == "pending"
    assert data["village"] == "Banda Neira"


@pytest.mark.asyncio
async def test_create_resident_invalid_nik_and_gender(client: AsyncClient):
    token = await get_admin_token(client)
    # Invalid NIK length (not 16 digits)
    res = await client.post(
        "/api/v1/population/residents",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "nik": "12345",
            "full_name": "Salah NIK",
            "gender": "L",
        },
    )
    assert res.status_code == 422

    # Invalid gender
    res_gender = await client.post(
        "/api/v1/population/residents",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "nik": "8171010101900002",
            "full_name": "Salah Gender",
            "gender": "X",
        },
    )
    assert res_gender.status_code == 422


@pytest.mark.asyncio
async def test_duplicate_nik_rejected(client: AsyncClient):
    token = await get_admin_token(client)
    payload = {
        "nik": "8171010101900003",
        "full_name": "Penduduk Asli",
        "gender": "P",
        "village": "Banda Neira",
    }
    res1 = await client.post(
        "/api/v1/population/residents",
        headers={"Authorization": f"Bearer {token}"},
        json=payload,
    )
    assert res1.status_code == 201

    # Second attempt with same NIK -> 409
    res2 = await client.post(
        "/api/v1/population/residents",
        headers={"Authorization": f"Bearer {token}"},
        json=payload,
    )
    assert res2.status_code == 409
    assert "already exists" in res2.json()["detail"]


@pytest.mark.asyncio
async def test_list_and_search_residents(client: AsyncClient):
    token = await get_admin_token(client)
    # Seed residents with diverse occupations
    await client.post(
        "/api/v1/population/residents",
        headers={"Authorization": f"Bearer {token}"},
        json={"nik": "8171010101900010", "full_name": "Siti Fatimah", "gender": "P", "occupation": "Petani Rempah Pala"},
    )
    await client.post(
        "/api/v1/population/residents",
        headers={"Authorization": f"Bearer {token}"},
        json={"nik": "8171010101900020", "full_name": "Budi Santoso", "gender": "L", "occupation": "Nelayan Tangkap Banda"},
    )

    # Search for Siti
    search_res = await client.get(
        "/api/v1/population/residents?search=Siti",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert search_res.status_code == 200
    search_data = search_res.json()
    assert search_data["total"] >= 1
    assert any("Siti" in item["full_name"] for item in search_data["items"])

    # Search by occupation 'Nelayan'
    occ_search_res = await client.get(
        "/api/v1/population/residents?search=Nelayan",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert occ_search_res.status_code == 200
    occ_data = occ_search_res.json()
    assert any("Nelayan" in item.get("occupation", "") for item in occ_data["items"])

    # Filter explicitly by occupation parameter
    occ_filter_res = await client.get(
        "/api/v1/population/residents?occupation=Nelayan",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert occ_filter_res.status_code == 200
    assert any("Nelayan" in item.get("occupation", "") for item in occ_filter_res.json()["items"])


@pytest.mark.asyncio
async def test_verify_resident_workflow(client: AsyncClient):
    token = await get_admin_token(client)
    create_res = await client.post(
        "/api/v1/population/residents",
        headers={"Authorization": f"Bearer {token}"},
        json={"nik": "8171010101900030", "full_name": "Warga Verifikasi", "gender": "L"},
    )
    resident_id = create_res.json()["id"]

    # Verify resident
    verify_res = await client.post(
        f"/api/v1/population/residents/{resident_id}/verify",
        headers={"Authorization": f"Bearer {token}"},
        json={"verification_status": "verified", "notes": "Berkas identitas sesuai"},
    )
    assert verify_res.status_code == 200
    verified_data = verify_res.json()
    assert verified_data["verification_status"] == "verified"
    assert verified_data["verified_by"] is not None
    assert verified_data["verified_at"] is not None


@pytest.mark.asyncio
async def test_create_administrative_request(client: AsyncClient):
    token = await get_admin_token(client)
    create_res = await client.post(
        "/api/v1/population/residents",
        headers={"Authorization": f"Bearer {token}"},
        json={"nik": "8171010101900040", "full_name": "Pemohon Layanan", "gender": "L"},
    )
    resident_id = create_res.json()["id"]

    req_res = await client.post(
        "/api/v1/population/requests",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "resident_id": resident_id,
            "request_type": "Surat Keterangan Usaha Perkebunan Rempah",
            "notes": "Keperluan pengajuan kelompok tani",
        },
    )
    assert req_res.status_code == 201
    req_data = req_res.json()
    assert req_data["request_type"] == "Surat Keterangan Usaha Perkebunan Rempah"
    assert req_data["status"] == "submitted"


@pytest.mark.asyncio
async def test_list_and_update_administrative_request(client: AsyncClient):
    token = await get_admin_token(client)
    create_res = await client.post(
        "/api/v1/population/residents",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "nik": "8171010101900041",
            "full_name": "Pemohon Nelayan",
            "gender": "L",
            "occupation": "Nelayan Tangkap Tradisional",
        },
    )
    resident_id = create_res.json()["id"]

    # 1. Create request
    create_req = await client.post(
        "/api/v1/population/requests",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "resident_id": resident_id,
            "request_type": "Surat Keterangan Usaha Nelayan Tradisional Banda (SKU-N)",
            "notes": "Keperluan subsidi solar",
        },
    )
    assert create_req.status_code == 201
    req_id = create_req.json()["id"]

    # 2. List requests
    list_res = await client.get(
        "/api/v1/population/requests",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert list_res.status_code == 200
    list_data = list_res.json()
    assert list_data["total"] >= 1
    matched = next((item for item in list_data["items"] if item["id"] == req_id), None)
    assert matched is not None
    assert matched["resident_name"] == "Pemohon Nelayan"
    assert matched["resident_occupation"] == "Nelayan Tangkap Tradisional"
    assert matched["status"] == "submitted"

    # 3. Update status to approved
    update_res = await client.patch(
        f"/api/v1/population/requests/{req_id}/status",
        headers={"Authorization": f"Bearer {token}"},
        json={"status": "approved", "notes": "Disetujui kantor desa"},
    )
    assert update_res.status_code == 200
    assert update_res.json()["status"] == "approved"
    assert update_res.json()["notes"] == "Disetujui kantor desa"


@pytest.mark.asyncio
async def test_population_statistics(client: AsyncClient):
    token = await get_admin_token(client)
    # Add a farmer and verify
    r1 = await client.post(
        "/api/v1/population/residents",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "nik": "8171010101900050",
            "full_name": "Petani Satu",
            "gender": "L",
            "occupation": "Petani Rempah",
        },
    )
    await client.post(
        f"/api/v1/population/residents/{r1.json()['id']}/verify",
        headers={"Authorization": f"Bearer {token}"},
        json={"verification_status": "verified"},
    )

    stats_res = await client.get(
        "/api/v1/population/statistics",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert stats["total_residents"] >= 1
    assert stats["total_verified"] >= 1
    assert "L" in stats["gender_distribution"]
    assert "Petani Rempah" in stats["top_occupations"]


@pytest.mark.asyncio
async def test_population_unauthorized_access(client: AsyncClient):
    # Unauthenticated -> 401
    res = await client.get("/api/v1/population/residents")
    assert res.status_code == 401

    # Authenticated as farmer -> 403 Forbidden
    admin_token = await get_admin_token(client)
    await client.post(
        "/api/v1/auth/users",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "email": "farmer1@bandaneira.id",
            "username": "petani1",
            "password": "FarmerPassword123!",
            "full_name": "Petani Cengkih",
            "roles": ["farmer"],
        },
    )
    login_farmer = await client.post(
        "/api/v1/auth/login",
        json={"username_or_email": "petani1", "password": "FarmerPassword123!"},
    )
    farmer_token = login_farmer.json()["access_token"]

    farmer_access_res = await client.get(
        "/api/v1/population/residents",
        headers={"Authorization": f"Bearer {farmer_token}"},
    )
    assert farmer_access_res.status_code == 403
    assert "Operation not permitted" in farmer_access_res.json()["detail"]


@pytest.mark.asyncio
async def test_village_officer_territorial_scoping_residents_and_stats(client: AsyncClient):
    admin_token = await get_admin_token(client)
    # Petugas Desa Lonthoir
    petugas_res = await client.post(
        "/api/v1/auth/login",
        json={"username_or_email": "petugas", "password": "Petugas123!"},
    )
    petugas_token = petugas_res.json()["access_token"]

    # 1. Admin daftarkan 1 warga Lonthoir dan 1 warga Selamon
    r_lonthoir = await client.post(
        "/api/v1/population/residents",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "nik": "8171010101900111",
            "full_name": "Warga Asli Lonthoir",
            "gender": "L",
            "village": "Lonthoir",
        },
    )
    assert r_lonthoir.status_code == 201

    r_selamon = await client.post(
        "/api/v1/population/residents",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "nik": "8171010101900222",
            "full_name": "Warga Asli Selamon",
            "gender": "P",
            "village": "Selamon",
        },
    )
    assert r_selamon.status_code == 201
    selamon_resident_id = r_selamon.json()["id"]

    # 2. Petugas Lonthoir memanggil daftar warga -> Hanya melihat warga Lonthoir
    list_res = await client.get(
        "/api/v1/population/residents",
        headers={"Authorization": f"Bearer {petugas_token}"},
    )
    assert list_res.status_code == 200
    items = list_res.json()["items"]
    names = [i["full_name"] for i in items]
    assert "Warga Asli Lonthoir" in names
    assert "Warga Asli Selamon" not in names

    # 3. Petugas Lonthoir mencoba mendaftarkan warga ke Desa Selamon -> Ditolak 403!
    fail_create = await client.post(
        "/api/v1/population/residents",
        headers={"Authorization": f"Bearer {petugas_token}"},
        json={
            "nik": "8171010101900333",
            "full_name": "Warga Campur",
            "gender": "L",
            "village": "Selamon",
        },
    )
    assert fail_create.status_code == 403
    assert "hanya berwenang mendaftarkan warga untuk desa lonthoir" in fail_create.json()["detail"].lower()

    # 4. Petugas Lonthoir mencoba memverifikasi warga Selamon -> Ditolak 403!
    fail_verify = await client.post(
        f"/api/v1/population/residents/{selamon_resident_id}/verify",
        headers={"Authorization": f"Bearer {petugas_token}"},
        json={"verification_status": "verified"},
    )
    assert fail_verify.status_code == 403
    assert "hanya berwenang memverifikasi data warga desa lonthoir" in fail_verify.json()["detail"].lower()


@pytest.mark.asyncio
async def test_create_resident_auto_provisions_user_and_allows_login(client: AsyncClient):
    token = await get_admin_token(client)
    nik = "8171010101900555"
    pin = "Warga2026!"

    res = await client.post(
        "/api/v1/population/residents",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "nik": nik,
            "full_name": "Siti Nurul Hidayah",
            "gender": "P",
            "village": "Lonthoir",
            "access_pin": pin,
        },
    )
    assert res.status_code == 201
    data = res.json()
    assert data["nik"] == nik
    assert data["access_pin"] == pin
    assert data["account_username"] == nik
    resident_id = data["id"]

    # Login using resident NIK and PIN
    login_res = await client.post(
        "/api/v1/auth/login",
        json={"username_or_email": nik, "password": pin},
    )
    assert login_res.status_code == 200
    login_data = login_res.json()
    assert login_data["user"]["username"] == nik
    assert any(r["name"] == "resident" for r in login_data["user"]["roles"])

    # Reset PIN by officer
    new_pin = "SandiBaru2026!"
    reset_res = await client.post(
        f"/api/v1/population/residents/{resident_id}/reset-pin",
        headers={"Authorization": f"Bearer {token}"},
        json={"pin": new_pin},
    )
    assert reset_res.status_code == 200
    reset_data = reset_res.json()
    assert reset_data["access_pin"] == new_pin
    assert reset_data["username"] == nik

    # Verify old PIN is rejected
    old_login = await client.post(
        "/api/v1/auth/login",
        json={"username_or_email": nik, "password": pin},
    )
    assert old_login.status_code == 401

    # Verify new PIN succeeds
    new_login = await client.post(
        "/api/v1/auth/login",
        json={"username_or_email": nik, "password": new_pin},
    )
    assert new_login.status_code == 200


@pytest.mark.asyncio
async def test_nik_cannot_be_duplicated_across_any_village(client: AsyncClient):
    token = await get_admin_token(client)
    shared_nik = "8171010101900999"

    # 1. Register in Lonthoir
    res1 = await client.post(
        "/api/v1/population/residents",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "nik": shared_nik,
            "full_name": "Warga Asal Lonthoir",
            "gender": "L",
            "village": "Lonthoir",
        },
    )
    assert res1.status_code == 201

    # 2. Check NIK availability via check-nik endpoint -> False
    check_dup = await client.get(
        f"/api/v1/population/residents/check-nik?nik={shared_nik}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert check_dup.status_code == 200
    assert check_dup.json()["available"] is False
    assert check_dup.json()["village"] == "Lonthoir"

    # 3. Attempt registering same NIK in a DIFFERENT village (Selamon) -> MUST BE REJECTED (409)
    res2 = await client.post(
        "/api/v1/population/residents",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "nik": shared_nik,
            "full_name": "Warga Asal Selamon",
            "gender": "P",
            "village": "Selamon",
        },
    )
    assert res2.status_code == 409
    detail = res2.json()["detail"].lower()
    assert "already exists" in detail
    assert "tidak boleh sama di desa manapun" in detail

    # 4. Check an unused NIK -> True
    check_free = await client.get(
        "/api/v1/population/residents/check-nik?nik=8171010101900888",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert check_free.status_code == 200
    assert check_free.json()["available"] is True


@pytest.mark.asyncio
async def test_report_and_revoke_resident_death(client: AsyncClient):
    token = await get_admin_token(client)
    nik = "8171010101900777"

    # 1. Register resident with auto-account
    create_res = await client.post(
        "/api/v1/population/residents",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "nik": nik,
            "full_name": "Almarhum Warga Uji",
            "gender": "L",
            "village": "Dwiwarna",
            "access_pin": "654321",
        },
    )
    assert create_res.status_code == 201
    res_data = create_res.json()
    resident_id = res_data["id"]

    # 2. Verify account is active and can login
    login_before = await client.post(
        "/api/v1/auth/login",
        json={"username_or_email": nik, "password": "654321"},
    )
    assert login_before.status_code == 200

    # 3. Report death
    death_res = await client.post(
        f"/api/v1/population/residents/{resident_id}/report-death",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "death_date": "2026-11-20",
            "death_place": "RSUD Banda Neira",
            "death_cause": "Usia Lanjut",
            "death_certificate_no": "SKM/DW/2026/088",
            "death_notes": "Dilaporkan oleh keluarga inti",
        },
    )
    assert death_res.status_code == 200
    updated_res = death_res.json()
    assert updated_res["residence_status"] == "deceased"
    assert updated_res["death_place"] == "RSUD Banda Neira"
    assert updated_res["death_certificate_no"] == "SKM/DW/2026/088"

    # 4. Attempt login with deceased resident account -> MUST FAIL (inactive 403)
    login_after = await client.post(
        "/api/v1/auth/login",
        json={"username_or_email": nik, "password": "654321"},
    )
    assert login_after.status_code == 403

    # 5. Attempt initiating mutation on deceased resident -> MUST FAIL (400)
    mut_attempt = await client.post(
        "/api/v1/population/mutations",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "resident_id": resident_id,
            "destination_village": "Nusantara",
            "reason": "Mencoba mutasi warga wafat",
        },
    )
    assert mut_attempt.status_code == 400
    assert "meninggal dunia" in mut_attempt.json()["detail"].lower()

    # 6. Revoke death (administrative correction)
    revoke_res = await client.post(
        f"/api/v1/population/residents/{resident_id}/revoke-death",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert revoke_res.status_code == 200
    assert revoke_res.json()["residence_status"] == "active"
    assert revoke_res.json()["death_date"] is None

    # Login works again after revocation
    login_restored = await client.post(
        "/api/v1/auth/login",
        json={"username_or_email": nik, "password": "654321"},
    )
    assert login_restored.status_code == 200


@pytest.mark.asyncio
async def test_resident_mutation_dual_village_workflow(client: AsyncClient):
    token = await get_admin_token(client)
    nik = "8171010101900666"

    # 1. Register resident in Dwiwarna
    create_res = await client.post(
        "/api/v1/population/residents",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "nik": nik,
            "full_name": "Warga Mutasi Neira",
            "gender": "P",
            "village": "Dwiwarna",
            "address": "Jl. Asal No. 1",
            "rt": "001",
            "rw": "001",
            "access_pin": "123456",
        },
    )
    assert create_res.status_code == 201
    resident_id = create_res.json()["id"]

    # 2. Initiate mutation to Nusantara (Origin initiates -> pending_destination)
    init_res = await client.post(
        "/api/v1/population/mutations",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "resident_id": resident_id,
            "destination_village": "Nusantara",
            "new_address": "Jl. Baru Nusantara No. 88",
            "new_rt": "003",
            "new_rw": "004",
            "reason": "Mengikuti suami bertugas",
            "skpwni_number": "SKPWNI/DW/2026/012",
        },
    )
    assert init_res.status_code == 201
    mut_data = init_res.json()
    mutation_id = mut_data["id"]
    assert mut_data["status"] == "pending_destination"
    assert mut_data["origin_village"] == "Dwiwarna"
    assert mut_data["destination_village"] == "Nusantara"

    # Check resident is marked as 'moving'
    res_check = await client.get(
        f"/api/v1/population/residents/{resident_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res_check.json()["residence_status"] == "moving"

    # 3. Check mutation listed in list_mutations
    list_mut = await client.get(
        "/api/v1/population/mutations?status=pending_destination",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert list_mut.status_code == 200
    assert any(m["id"] == mutation_id for m in list_mut.json()["items"])

    # 4. Destination village verifies and approves the mutation
    approve_res = await client.post(
        f"/api/v1/population/mutations/{mutation_id}/approve",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "new_address": "Jl. Baru Nusantara No. 88 Definitif",
            "new_rt": "003",
            "new_rw": "004",
        },
    )
    assert approve_res.status_code == 200
    comp_mut = approve_res.json()
    assert comp_mut["status"] == "completed"

    # 5. Resident data is now definitively in Nusantara!
    final_res = await client.get(
        f"/api/v1/population/residents/{resident_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    r_data = final_res.json()
    assert r_data["village"] == "Nusantara"
    assert r_data["residence_status"] == "active"
    assert r_data["address"] == "Jl. Baru Nusantara No. 88 Definitif"
    assert r_data["rt"] == "003"


@pytest.mark.asyncio
async def test_resident_mutation_rejection(client: AsyncClient):
    token = await get_admin_token(client)
    nik = "8171010101900555"

    # 1. Register resident in Lonthoir
    create_res = await client.post(
        "/api/v1/population/residents",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "nik": nik,
            "full_name": "Warga Batal Mutasi",
            "gender": "L",
            "village": "Lonthoir",
        },
    )
    assert create_res.status_code == 201
    resident_id = create_res.json()["id"]

    # 2. Initiate mutation to Selamon
    init_res = await client.post(
        "/api/v1/population/mutations",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "resident_id": resident_id,
            "destination_village": "Selamon",
            "reason": "Pindah kerja",
        },
    )
    assert init_res.status_code == 201
    mutation_id = init_res.json()["id"]

    # 3. Reject mutation
    reject_res = await client.post(
        f"/api/v1/population/mutations/{mutation_id}/reject",
        headers={"Authorization": f"Bearer {token}"},
        json={"reason": "Berkas SKPWNI belum lengkap dari kecamatan"},
    )
    assert reject_res.status_code == 200
    assert reject_res.json()["status"] == "rejected"
    assert reject_res.json()["rejection_reason"] == "Berkas SKPWNI belum lengkap dari kecamatan"

    # 4. Resident returns to active in origin village
    res_check = await client.get(
        f"/api/v1/population/residents/{resident_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res_check.json()["residence_status"] == "active"
    assert res_check.json()["village"] == "Lonthoir"
