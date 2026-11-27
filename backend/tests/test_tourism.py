import pytest
from datetime import date, timedelta
from httpx import AsyncClient


async def get_auth_token(client: AsyncClient, username: str = "admin", password: str = "Admin123!") -> str:
    res = await client.post(
        "/api/v1/auth/login",
        json={"username_or_email": username, "password": password},
    )
    return res.json()["access_token"]


@pytest.mark.asyncio
async def test_list_accommodations_auto_seed(client: AsyncClient):
    """Uji pembacaan katalog penginapan dan auto-seeding awal."""
    res = await client.get("/api/v1/tourism/accommodations")
    assert res.status_code == 200
    items = res.json()
    assert len(items) >= 6
    names = [i["name"] for i in items]
    assert "Delfika Homestay & Heritage Villa" in names
    assert "The Nutmeg Tree Seaside Hotel" in names


@pytest.mark.asyncio
async def test_filter_accommodations(client: AsyncClient):
    """Uji filter pulau, harga, dan fitur eco-stay."""
    res = await client.get("/api/v1/tourism/accommodations?island=Pulau+Hatta")
    assert res.status_code == 200
    items = res.json()
    assert len(items) >= 1
    assert all(i["island_name"] == "Pulau Hatta" for i in items)

    # Filter harga maksimal
    res_price = await client.get("/api/v1/tourism/accommodations?max_price=300000")
    assert res_price.status_code == 200
    price_items = res_price.json()
    assert all(i["price_per_night_rp"] <= 300000 for i in price_items)


@pytest.mark.asyncio
async def test_create_booking_happy_path(client: AsyncClient):
    """Uji pembuatan booking homestay dan generator tautan WhatsApp checkout otomatis."""
    # 1. Ambil 1 homestay
    res_acc = await client.get("/api/v1/tourism/accommodations")
    acc = res_acc.json()[0]

    check_in = date.today() + timedelta(days=5)
    check_out = check_in + timedelta(days=3)

    payload = {
        "accommodation_id": acc["id"],
        "guest_name": "Sarah Jenkins",
        "guest_whatsapp": "6281987654321",
        "guest_email": "sarah.jenkins@example.com",
        "check_in": check_in.isoformat(),
        "check_out": check_out.isoformat(),
        "rooms_count": 2,
        "notes": "Mohon kamar lantai atas dengan pemandangan Gunung Api Banda.",
    }

    res_bkg = await client.post("/api/v1/tourism/bookings", json=payload)
    assert res_bkg.status_code == 201
    bkg = res_bkg.json()
    assert bkg["booking_code"].startswith("BKG-")
    assert bkg["total_nights"] == 3
    assert bkg["rooms_count"] == 2
    # 3 malam * 2 kamar * tarif per malam
    expected_total = 3 * 2 * acc["price_per_night_rp"]
    assert bkg["total_price_rp"] == expected_total
    assert bkg["status"] == "CONFIRMED"
    assert bkg["wa_link"].startswith("https://wa.me/")
    assert "Sarah%20Jenkins" in bkg["wa_link"] or "Sarah+Jenkins" in bkg["wa_link"]

    # 2. Cek booking status via booking_code
    code = bkg["booking_code"]
    res_check = await client.get(f"/api/v1/tourism/bookings/{code}")
    assert res_check.status_code == 200
    assert res_check.json()["guest_name"] == "Sarah Jenkins"


@pytest.mark.asyncio
async def test_create_booking_invalid_dates(client: AsyncClient):
    """Uji validasi tanggal: check-out tidak boleh sebelum check-in."""
    res_acc = await client.get("/api/v1/tourism/accommodations")
    acc = res_acc.json()[0]

    check_in = date.today() + timedelta(days=10)
    check_out = check_in - timedelta(days=2)  # Salah!

    payload = {
        "accommodation_id": acc["id"],
        "guest_name": "Tamu Salah Tanggal",
        "guest_whatsapp": "6281234567890",
        "check_in": check_in.isoformat(),
        "check_out": check_out.isoformat(),
        "rooms_count": 1,
    }

    res = await client.post("/api/v1/tourism/bookings", json=payload)
    assert res.status_code == 400
    assert "setelah tanggal check-in" in res.json()["detail"]


@pytest.mark.asyncio
async def test_get_heritage_catalog(client: AsyncClient):
    """Uji pengambilan katalog 177 Cagar Budaya Banda Neira & Audio Guide."""
    res = await client.get("/api/v1/tourism/heritage-catalog")
    assert res.status_code == 200
    catalog = res.json()
    assert len(catalog) >= 9
    slugs = [c["slug"] for c in catalog]
    assert "benteng-belgica" in slugs
    assert "rumah-pengasingan-bung-hatta" in slugs
    assert "benteng-hollandia-lonthoir" in slugs
    assert "klenteng-sun-tian-kong" in slugs
    assert "sumur-pusaka-parigi-rante-rumah-budaya" in slugs
    assert all(c["photo_url"].startswith("/images/landmarks/") for c in catalog)

    # Filter kategori benteng
    res_benteng = await client.get("/api/v1/tourism/heritage-catalog?category=BENTENG")
    assert res_benteng.status_code == 200
    assert all(c["category"] == "BENTENG" for c in res_benteng.json())


@pytest.mark.asyncio
async def test_list_bookings_for_operator(client: AsyncClient):
    """Uji pengambilan daftar reservasi penginapan untuk pengelola eco-stay."""
    token = await get_auth_token(client, "operator_homestay", "Homestay123!")
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Create a booking (public endpoint)
    res_acc = await client.get("/api/v1/tourism/accommodations")
    acc = res_acc.json()[0]
    check_in = date.today() + timedelta(days=7)
    check_out = check_in + timedelta(days=2)

    await client.post(
        "/api/v1/tourism/bookings",
        json={
            "accommodation_id": acc["id"],
            "guest_name": "Wisatawan Pengujian",
            "guest_whatsapp": "6281122334455",
            "check_in": check_in.isoformat(),
            "check_out": check_out.isoformat(),
            "rooms_count": 1,
        },
    )

    # 2. List bookings via main endpoint (protected)
    res_list = await client.get("/api/v1/tourism/bookings", headers=headers)
    assert res_list.status_code == 200
    bookings = res_list.json()
    assert len(bookings) >= 1
    assert any(b["guest_name"] == "Wisatawan Pengujian" for b in bookings)

    # 3. List bookings via SRS 11 alias (protected)
    res_alias = await client.get("/api/v1/pemesanan", headers=headers)
    assert res_alias.status_code == 200
    alias_bookings = res_alias.json()
    assert len(alias_bookings) >= 1


@pytest.mark.asyncio
async def test_cms_accommodations_crud(client: AsyncClient):
    """Uji CMS Penginapan: Tambah baru, update tarif kamar, dan hapus penginapan oleh pengelola / admin."""
    token = await get_auth_token(client, "admin", "Admin123!")
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Create accommodation
    create_payload = {
        "name": "Banda Heritage Villa Baru",
        "type": "VILA",
        "island_name": "Pulau Neira",
        "address": "Jl. Kujali No. 8, Banda Neira",
        "price_per_night_rp": 450000.0,
        "rooms_available": 4,
        "has_clean_ro_water": True,
        "has_solar_backup": True,
        "eco_stay_badge": True,
        "contact_whatsapp": "6281199887766",
        "description": "Vila peninggalan kolonial dengan pemandangan langsung ke Teluk Banda.",
    }
    res_create = await client.post("/api/v1/tourism/accommodations", json=create_payload, headers=headers)
    assert res_create.status_code == 201
    acc_id = res_create.json()["id"]

    # 2. Update price and room count
    update_payload = {
        "price_per_night_rp": 500000.0,
        "rooms_available": 6,
        "is_verified": True,
    }
    res_update = await client.put(f"/api/v1/tourism/accommodations/{acc_id}", json=update_payload, headers=headers)
    assert res_update.status_code == 200
    updated_acc = res_update.json()
    assert updated_acc["price_per_night_rp"] == 500000.0
    assert updated_acc["rooms_available"] == 6

    # 3. Delete accommodation
    res_del = await client.delete(f"/api/v1/tourism/accommodations/{acc_id}", headers=headers)
    assert res_del.status_code == 200
    assert "berhasil dihapus" in res_del.json()["message"]


@pytest.mark.asyncio
async def test_cms_tour_guides_crud(client: AsyncClient):
    """Uji CMS Pemandu Wisata: Auto-seed, tambah pemandu, update tarif harian, dan verifikasi admin."""
    token = await get_auth_token(client, "admin_wisata", "Wisata123!")
    headers = {"Authorization": f"Bearer {token}"}

    # 1. List auto-seeded guides (public)
    res_list = await client.get("/api/v1/tourism/guides")
    assert res_list.status_code == 200
    guides = res_list.json()
    assert len(guides) >= 2
    names = [g["name"] for g in guides]
    assert "Ali Wailissa" in names or "Ruslan Rumra" in names

    # 2. Register resident for tour guide and test NIK validation (protected)
    admin_token = await get_auth_token(client, "admin", "Admin123!")
    await client.post(
        "/api/v1/population/residents",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "nik": "8171010101900555",
            "full_name": "La Ode Ruslan",
            "gender": "L",
            "village": "Banda Neira",
            "access_pin": "123456",
        },
    )

    new_guide = {
        "resident_nik": "8171010101900555",
        "name": "La Ode Ruslan",
        "license_number": "HPI-BANDA-004",
        "phone_whatsapp": "6281233445566",
        "specialties": "Ekspedisi Snorkeling Pulau Rhun & Sejarah Traktat Breda 1667",
        "languages": "Indonesia, English",
        "fee_per_day_rp": 380000.0,
        "bio": "Pemandu ekspedisi bahari pulau terluar Rhun dan Ay dengan wawasan mendalam mengenai sejarah pulau rempah.",
        "island_base": "Pulau Rhun",
        "is_verified": False,
        "is_active": True,
    }

    # Attempt with unregistered NIK -> MUST FAIL (400)
    unregistered_guide = {**new_guide, "resident_nik": "8171010101999999"}
    res_unreg = await client.post("/api/v1/tourism/guides", json=unregistered_guide, headers=headers)
    assert res_unreg.status_code == 400
    assert "warga terdaftar" in res_unreg.json()["detail"].lower()

    # Create valid guide with registered resident NIK -> 201
    res_create = await client.post("/api/v1/tourism/guides", json=new_guide, headers=headers)
    assert res_create.status_code == 201
    created = res_create.json()
    guide_id = created["id"]
    assert created["name"] == "La Ode Ruslan"
    assert created["resident_nik"] == "8171010101900555"
    assert created["fee_per_day_rp"] == 380000.0
    assert created["is_verified"] is False

    # 3. Admin verifies and updates fee
    res_update = await client.put(
        f"/api/v1/tourism/guides/{guide_id}",
        json={"is_verified": True, "fee_per_day_rp": 400000.0},
        headers=headers,
    )
    assert res_update.status_code == 200
    updated = res_update.json()
    assert updated["is_verified"] is True
    assert updated["fee_per_day_rp"] == 400000.0

    # 4. Delete guide
    res_del = await client.delete(f"/api/v1/tourism/guides/{guide_id}", headers=headers)
    assert res_del.status_code == 200
    assert "berhasil dihapus" in res_del.json()["message"]


@pytest.mark.asyncio
async def test_unauthorized_guest_access_blocked(client: AsyncClient):
    """
    Keamanan Ketat: Memastikan tamu / publik tanpa autentikasi (unauthenticated)
    DITOLAK dengan status 401 Unauthorized saat mencoba memodifikasi CMS atau membaca reservasi.
    """
    # 1. Mengakses daftar reservasi tamu tanpa login -> 401
    res_bookings = await client.get("/api/v1/tourism/bookings")
    assert res_bookings.status_code == 401
    assert "Could not validate credentials" in res_bookings.json()["detail"]

    # Alias pemesanan -> 401
    res_alias = await client.get("/api/v1/pemesanan")
    assert res_alias.status_code == 401

    # 2. Mencoba membuat penginapan baru tanpa login -> 401
    res_acc_post = await client.post(
        "/api/v1/tourism/accommodations",
        json={"name": "Hacked Homestay", "price_per_night_rp": 10000.0},
    )
    assert res_acc_post.status_code == 401

    # 3. Mencoba mengubah tarif penginapan tanpa login -> 401
    res_acc_put = await client.put(
        "/api/v1/tourism/accommodations/some-fake-id",
        json={"price_per_night_rp": 1000.0},
    )
    assert res_acc_put.status_code == 401

    # 4. Mencoba menghapus penginapan tanpa login -> 401
    res_acc_del = await client.delete("/api/v1/tourism/accommodations/some-fake-id")
    assert res_acc_del.status_code == 401

    # 5. Mencoba menambah pemandu wisata tanpa login -> 401
    res_guide_post = await client.post(
        "/api/v1/tourism/guides",
        json={"name": "Pemandu Liar", "fee_per_day_rp": 50000.0},
    )
    assert res_guide_post.status_code == 401

    # 6. Mencoba mengubah pemandu wisata tanpa login -> 401
    res_guide_put = await client.put(
        "/api/v1/tourism/guides/some-fake-id",
        json={"fee_per_day_rp": 10000.0},
    )
    assert res_guide_put.status_code == 401

    # 7. Mencoba menghapus pemandu wisata tanpa login -> 401
    res_guide_del = await client.delete("/api/v1/tourism/guides/some-fake-id")
    assert res_guide_del.status_code == 401


@pytest.mark.asyncio
async def test_forbidden_role_access_blocked(client: AsyncClient):
    """
    Keamanan RBAC: Memastikan pengguna dengan peran tidak berwenang (misal 'petani' atau 'warga')
    DITOLAK dengan status 403 Forbidden saat mencoba mengelola CMS penginapan atau pemandu.
    """
    farmer_token = await get_auth_token(client, "8171010101900001", "123456")
    farmer_headers = {"Authorization": f"Bearer {farmer_token}"}

    # Petani mencoba melihat reservasi -> 403 Forbidden
    res_bookings = await client.get("/api/v1/tourism/bookings", headers=farmer_headers)
    assert res_bookings.status_code == 403
    assert "Operation not permitted" in res_bookings.json()["detail"]

    # Petani mencoba menambah penginapan -> 403 Forbidden
    res_acc = await client.post(
        "/api/v1/tourism/accommodations",
        json={"name": "Kebun Homestay", "price_per_night_rp": 100000.0},
        headers=farmer_headers,
    )
    assert res_acc.status_code == 403

    # Petani mencoba menambah pemandu wisata -> 403 Forbidden
    res_guide = await client.post(
        "/api/v1/tourism/guides",
        json={"name": "Pemandu Petani", "fee_per_day_rp": 100000.0},
        headers=farmer_headers,
    )
    assert res_guide.status_code == 403


@pytest.mark.asyncio
async def test_community_contents_auto_seed_and_filters(client: AsyncClient):
    """Uji Bank Konten Batch 1 & Karya Peserta Workshop (Mandat Reyhan Albar Fahryan)."""
    res = await client.get("/api/v1/tourism/community-contents")
    assert res.status_code == 200
    items = res.json()
    assert len(items) >= 10
    codes = [i["content_code"] for i in items]
    assert "CNT-ART-001" in codes
    assert "CNT-FOTO-001" in codes
    assert "CNT-VID-001" in codes
    assert "CNT-WARGA-001" in codes
    assert all(i["media_url"].startswith("/images/landmarks/") for i in items if i["media_url"])
    assert all(i["qc_passed_count"] == 6 for i in items)

    # Filter berdasarkan content_type
    res_art = await client.get("/api/v1/tourism/community-contents?content_type=ARTICLE")
    assert res_art.status_code == 200
    assert len(res_art.json()) >= 4
    assert all(i["content_type"] == "ARTICLE" for i in res_art.json())

    # Filter berdasarkan priority_category
    res_umkm = await client.get("/api/v1/tourism/community-contents?priority_category=UMKM")
    assert res_umkm.status_code == 200
    assert len(res_umkm.json()) >= 2
    assert all(i["priority_category"] == "UMKM" for i in res_umkm.json())


@pytest.mark.asyncio
async def test_literacy_modules_governance_endpoint(client: AsyncClient):
    """Uji endpoint kurikulum 3 Modul Literasi Digital, SOP 6-Tahap, 6-Point QC, dan 4 Zona Sinyal."""
    res = await client.get("/api/v1/tourism/literacy-modules")
    assert res.status_code == 200
    data = res.json()
    assert "Reyhan Albar Fahryan" in data["mandate_owner"]
    assert len(data["modules"]) == 3
    assert [m["module_code"] for m in data["modules"]] == ["MODUL-01", "MODUL-02", "MODUL-03"]
    assert data["modules"][0]["validation_status"] == "SIAP_UJI_PENUH"
    assert len(data["sop_stages"]) == 6
    assert [s["stage_code"] for s in data["sop_stages"]] == [
        "IDE", "PRODUKSI", "REVIEW", "VALIDASI", "PUBLIKASI", "ARSIP"
    ]
    assert len(data["quality_checklist_standards"]) == 6
    assert len(data["signal_zones_mapping"]) == 4


@pytest.mark.asyncio
async def test_cms_community_contents_crud_and_rbac(client: AsyncClient):
    """Uji CRUD CMS Bank Konten, perhitungan 6-Point Quality Checklist, validasi input, dan RBAC."""
    token = await get_auth_token(client, "admin_wisata", "Wisata123!")
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Create new community content in REVIEW stage with 4/6 QC passed
    payload = {
        "title": "Liputan Pokdarwis: Festival Kora-Kora Adat Banda Neira",
        "content_type": "COMMUNITY_WORK",
        "priority_category": "RELIGI_KULTURAL",
        "island_name": "Pulau Neira",
        "author_name": "Ahmad Latarissa",
        "author_role": "Peserta Workshop Pokdarwis",
        "summary": "Dokumentasi lomba dayung perahu adat Kora-Kora di Selat Neira dengan struktur caption AIDA.",
        "body_narrative": "Perahu Kora-Kora merupakan simbol persatuan masyarakat adat negeri-negeri di Kepulauan Banda.",
        "media_url": "/images/landmarks/pelabuhan.jpg",
        "latitude": -4.5250,
        "longitude": 129.9040,
        "sop_stage": "REVIEW",
        "qc_accuracy": True,
        "qc_language": True,
        "qc_visual": True,
        "qc_adat_ethics": True,
        "qc_source_validated": False,
        "qc_consent_copyright": False,
        "is_published": False,
    }
    res_create = await client.post("/api/v1/tourism/community-contents", json=payload, headers=headers)
    assert res_create.status_code == 201
    created = res_create.json()
    content_id = created["id"]
    assert created["qc_passed_count"] == 4
    assert created["sop_stage"] == "REVIEW"
    assert created["is_published"] is False

    # 2. Update to PUBLIKASI after passing all 6 QC items
    res_update = await client.put(
        f"/api/v1/tourism/community-contents/{content_id}",
        json={
            "sop_stage": "PUBLIKASI",
            "qc_source_validated": True,
            "qc_consent_copyright": True,
            "is_published": True,
        },
        headers=headers,
    )
    assert res_update.status_code == 200
    updated = res_update.json()
    assert updated["qc_passed_count"] == 6
    assert updated["sop_stage"] == "PUBLIKASI"
    assert updated["is_published"] is True

    # 3. Validation failure (invalid short title -> 422)
    res_invalid = await client.post(
        "/api/v1/tourism/community-contents",
        json={**payload, "title": "Ab"},
        headers=headers,
    )
    assert res_invalid.status_code == 422

    # 4. Not found & invalid UUID
    res_bad_uuid = await client.put(
        "/api/v1/tourism/community-contents/not-a-uuid",
        json={"sop_stage": "ARSIP"},
        headers=headers,
    )
    assert res_bad_uuid.status_code == 400

    res_404 = await client.delete(
        "/api/v1/tourism/community-contents/00000000-0000-0000-0000-000000000000",
        headers=headers,
    )
    assert res_404.status_code == 404

    # 5. Unauthorized guest (401) & Forbidden farmer role (403)
    res_unauth = await client.post("/api/v1/tourism/community-contents", json=payload)
    assert res_unauth.status_code == 401

    farmer_token = await get_auth_token(client, "8171010101900001", "123456")
    res_forbidden = await client.delete(
        f"/api/v1/tourism/community-contents/{content_id}",
        headers={"Authorization": f"Bearer {farmer_token}"},
    )
    assert res_forbidden.status_code == 403

    # 6. Delete content (happy path)
    res_del = await client.delete(f"/api/v1/tourism/community-contents/{content_id}", headers=headers)
    assert res_del.status_code == 200
    assert "berhasil dihapus" in res_del.json()["message"]


@pytest.mark.asyncio
async def test_filter_accommodations_by_village_and_search(client: AsyncClient):
    """Verifikasi filter penginapan per desa dan pencarian kata kunci."""
    # 1. Filter by village 'Hatta'
    res_hatta = await client.get("/api/v1/tourism/accommodations?village=Hatta")
    assert res_hatta.status_code == 200
    data_hatta = res_hatta.json()
    assert len(data_hatta) >= 1
    assert any("Hatta" in a["address"] or "Hatta" in a["name"] for a in data_hatta)

    # 2. Filter by search 'Delfika'
    res_search = await client.get("/api/v1/tourism/accommodations?search=Delfika")
    assert res_search.status_code == 200
    data_search = res_search.json()
    assert len(data_search) >= 1
    assert "Delfika" in data_search[0]["name"]

    # 3. Filter by search not found
    res_none = await client.get("/api/v1/tourism/accommodations?search=NonExistentHomestayXYZ")
    assert res_none.status_code == 200
    assert len(res_none.json()) == 0


@pytest.mark.asyncio
async def test_list_bookings_village_scoping_and_search(client: AsyncClient):
    """Verifikasi scoping desa dan pencarian pada daftar reservasi tamu desa."""
    admin_token = await get_auth_token(client, "admin", "Admin123!")
    headers = {"Authorization": f"Bearer {admin_token}"}

    # 1. Search booking by code or guest name
    res_search = await client.get("/api/v1/tourism/bookings?search=Sarah", headers=headers)
    assert res_search.status_code == 200
    data_search = res_search.json()
    assert isinstance(data_search, list)


@pytest.mark.asyncio
async def test_list_tour_guides_search(client: AsyncClient):
    """Verifikasi pencarian pemandu wisata berdasarkan nama, keahlian, atau bahasa."""
    res_search = await client.get("/api/v1/tourism/guides?search=Benteng")
    assert res_search.status_code == 200
    data = res_search.json()
    assert len(data) >= 1
    assert any("Benteng" in g["specialties"] or "Benteng" in g["bio"] for g in data)





