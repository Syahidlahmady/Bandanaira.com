import re
import urllib.parse
import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, desc, or_
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.database.session import get_db
from backend.app.core.permissions import (
    ROLE_ADMIN,
    ROLE_VILLAGE_OFFICER,
    ROLE_HOMESTAY_OPERATOR,
    ROLE_SMART_TOURISM_ADMIN,
    require_roles,
)
from backend.app.modules.auth.models import User
from backend.app.modules.tourism.models import Accommodation, Booking, TourGuide, CommunityContent
from backend.app.modules.tourism.schemas import (
    AccommodationCreateInput,
    AccommodationUpdateInput,
    AccommodationItemResponse,
    BookingCreateInput,
    BookingItemResponse,
    HeritageCatalogItem,
    TourGuideCreateInput,
    TourGuideUpdateInput,
    TourGuideItemResponse,
    CommunityContentCreateInput,
    CommunityContentUpdateInput,
    CommunityContentItemResponse,
    LiteracyModuleItem,
    SopStageItem,
    LiteracyGovernanceResponse,
)
from backend.app.modules.tourism.heritage_data import HERITAGE_CATALOG
from backend.app.modules.tourism.literacy_content_data import (
    SEED_COMMUNITY_CONTENTS,
    LITERACY_MODULES_CATALOG,
    SOP_CONTENT_WORKFLOW,
    QUALITY_CHECKLIST_STANDARDS,
    SIGNAL_ZONES_MAPPING,
)

router = APIRouter(prefix="/tourism", tags=["Smart Tourism & Eco-Stay Accommodations"])

HOMESTAY_CMS_ROLES = require_roles(
    ROLE_ADMIN,
    ROLE_VILLAGE_OFFICER,
    ROLE_HOMESTAY_OPERATOR,
    "operator_homestay",
)

GUIDE_CMS_ROLES = require_roles(
    ROLE_ADMIN,
    ROLE_VILLAGE_OFFICER,
    ROLE_SMART_TOURISM_ADMIN,
)

BOOKINGS_VIEW_ROLES = require_roles(
    ROLE_ADMIN,
    ROLE_VILLAGE_OFFICER,
    ROLE_HOMESTAY_OPERATOR,
    "operator_homestay",
    ROLE_SMART_TOURISM_ADMIN,
)

SEED_ACCOMMODATIONS = [
    {
        "name": "Delfika Homestay & Heritage Villa",
        "type": "HOMESTAY",
        "island_name": "Pulau Neira",
        "address": "Jl. Nusantara No. 12, Banda Neira",
        "price_per_night_rp": 350000.0,
        "rooms_available": 6,
        "has_clean_ro_water": True,
        "has_solar_backup": True,
        "eco_stay_badge": True,
        "contact_whatsapp": "6281234567891",
        "description": "Homestay bernuansa kolonial peninggalan abad ke-18 dengan halaman kebun pala luas, air minum RO gratis dari Koperasi Hatta, dan panel surya mandiri.",
        "photo_url": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
    },
    {
        "name": "The Nutmeg Tree Seaside Hotel",
        "type": "HOTEL",
        "island_name": "Pulau Neira",
        "address": "Jl. Pelabuhan Banda Neira No. 04",
        "price_per_night_rp": 600000.0,
        "rooms_available": 10,
        "has_clean_ro_water": True,
        "has_solar_backup": True,
        "eco_stay_badge": True,
        "contact_whatsapp": "6281234567892",
        "description": "Hotel tepi pantai dengan panorama Gunung Api Banda. Dilengkapi stasiun pengisian tumbler air minum higienis dan fasilitas diving terverifikasi PADI.",
        "photo_url": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
    },
    {
        "name": "Maulana Hotel & Heritage Resto",
        "type": "HOTEL",
        "island_name": "Pulau Neira",
        "address": "Jl. Pelabuhan, Banda Neira",
        "price_per_night_rp": 750000.0,
        "rooms_available": 8,
        "has_clean_ro_water": True,
        "has_solar_backup": False,
        "eco_stay_badge": False,
        "contact_whatsapp": "6281234567893",
        "description": "Hotel bersejarah langganan tokoh nasional dan mancanegara dengan dermaga pribadi langsung ke Selat Neira.",
        "photo_url": "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
    },
    {
        "name": "Mutiara Guesthouse Banda",
        "type": "HOMESTAY",
        "island_name": "Pulau Neira",
        "address": "Jl. Kujali, Banda Neira",
        "price_per_night_rp": 250000.0,
        "rooms_available": 4,
        "has_clean_ro_water": True,
        "has_solar_backup": False,
        "eco_stay_badge": True,
        "contact_whatsapp": "6281234567894",
        "description": "Penginapan ramah anggaran dengan sarapan pisang goreng sambal kenari dan teh rempah pala khas Banda.",
        "photo_url": "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80",
    },
    {
        "name": "Hatta Island Coral Reef Cabin",
        "type": "CABIN",
        "island_name": "Pulau Hatta",
        "address": "Kampung Lama, Pulau Hatta",
        "price_per_night_rp": 400000.0,
        "rooms_available": 4,
        "has_clean_ro_water": True,
        "has_solar_backup": True,
        "eco_stay_badge": True,
        "contact_whatsapp": "6281234567895",
        "description": "Kabin kayu ramah lingkungan 100% bertenaga surya langsung di bibir terumbu karang pulau Hatta.",
        "photo_url": "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=800&q=80",
    },
    {
        "name": "Ai Island Spice & Beach Lodge",
        "type": "HOMESTAY",
        "island_name": "Pulau Ay",
        "address": "Pesisir Barat Pulau Ay",
        "price_per_night_rp": 300000.0,
        "rooms_available": 5,
        "has_clean_ro_water": True,
        "has_solar_backup": True,
        "eco_stay_badge": True,
        "contact_whatsapp": "6281234567896",
        "description": "Lodge tepi pantai berpasir putih di dekat benteng Revenge dengan pemandangan lumba-lumba liar di pagi hari.",
        "photo_url": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    },
]


async def ensure_accommodations_seeded(db: AsyncSession):
    stmt = select(Accommodation).limit(1)
    res = await db.execute(stmt)
    if not res.scalar_one_or_none():
        for item in SEED_ACCOMMODATIONS:
            acc = Accommodation(**item)
            db.add(acc)
        await db.commit()


SEED_TOUR_GUIDES = [
    {
        "name": "Dewi Nusantara",
        "license_number": "HPI-BANDA-001",
        "phone_whatsapp": "6281234567896",
        "specialties": "Sejarah Benteng VOC, Rumah Bung Hatta & Sutan Sjahrir",
        "languages": "Indonesia, English, Dutch",
        "fee_per_day_rp": 350000.0,
        "photo_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
        "bio": "Pemandu budaya berlisensi HPI dengan pengalaman lebih dari 8 tahun menceritakan sejarah peradaban rempah dan diplomasi kolonial Banda Neira.",
        "island_base": "Pulau Neira",
        "is_verified": True,
        "is_active": True,
        "rating": 4.95,
        "trips_completed": 48,
    },
    {
        "name": "Umar Baadilla",
        "license_number": "HPI-BANDA-002",
        "phone_whatsapp": "6281234567897",
        "specialties": "Snorkeling Lava Flow, Diving Palung Hatta & Konservasi Terumbu",
        "languages": "Indonesia, English",
        "fee_per_day_rp": 450000.0,
        "photo_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
        "bio": "Instruktur selam bersertifikat PADI dan pemandu bahari spesialis dinding palung Banda serta titik migrasi hiu martil.",
        "island_base": "Pulau Hatta",
        "is_verified": True,
        "is_active": True,
        "rating": 5.0,
        "trips_completed": 62,
    },
    {
        "name": "Hasan Wailissa",
        "license_number": "HPI-BANDA-003",
        "phone_whatsapp": "6281234567898",
        "specialties": "Trekking Kebun Pala Purba Lonthoir & Gastronomi Rempah Kenari",
        "languages": "Indonesia, English",
        "fee_per_day_rp": 300000.0,
        "photo_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
        "bio": "Putra asli Lonthoir yang memandu napak tilas perkebunan pala tertua abad ke-16 serta edukasi panen kenari dan pala organik.",
        "island_base": "Banda Besar",
        "is_verified": True,
        "is_active": True,
        "rating": 4.88,
        "trips_completed": 35,
    },
]


async def ensure_tour_guides_seeded(db: AsyncSession):
    stmt = select(TourGuide).limit(1)
    res = await db.execute(stmt)
    if not res.scalar_one_or_none():
        for item in SEED_TOUR_GUIDES:
            guide = TourGuide(**item)
            db.add(guide)
        await db.commit()



@router.get(
    "/accommodations",
    response_model=List[AccommodationItemResponse],
    summary="Daftar Penginapan Eco-Stay (Vila, Homestay, Hotel)",
)
async def list_accommodations(
    island: Optional[str] = Query(None, description="Filter nama pulau"),
    village: Optional[str] = Query(None, description="Filter nama desa"),
    search: Optional[str] = Query(None, description="Pencarian kata kunci"),
    type: Optional[str] = Query(None, description="HOMESTAY, HOTEL, VILA, CABIN"),
    max_price: Optional[float] = Query(None, description="Batas harga maksimal per malam"),
    has_ro_water: Optional[bool] = Query(None, description="Filter fasilitas air RO"),
    has_solar: Optional[bool] = Query(None, description="Filter panel surya"),
    db: AsyncSession = Depends(get_db),
):
    """Mengambil katalog penginapan terverifikasi dengan fitur filter ramah lingkungan dan lingkup desa."""
    await ensure_accommodations_seeded(db)

    query = select(Accommodation).order_by(Accommodation.price_per_night_rp)

    if isinstance(island, str) and island:
        query = query.where(Accommodation.island_name == island)
    if isinstance(village, str) and village:
        query = query.where(
            or_(
                Accommodation.address.ilike(f"%{village}%"),
                Accommodation.name.ilike(f"%{village}%"),
                Accommodation.description.ilike(f"%{village}%"),
            )
        )
    if isinstance(search, str) and search:
        query = query.where(
            or_(
                Accommodation.name.ilike(f"%{search}%"),
                Accommodation.address.ilike(f"%{search}%"),
                Accommodation.description.ilike(f"%{search}%"),
            )
        )
    if type:
        query = query.where(Accommodation.type == type.upper())
    if max_price:
        query = query.where(Accommodation.price_per_night_rp <= max_price)
    if has_ro_water is not None:
        query = query.where(Accommodation.has_clean_ro_water == has_ro_water)
    if has_solar is not None:
        query = query.where(Accommodation.has_solar_backup == has_solar)

    res = await db.execute(query)
    items = res.scalars().all()

    return [
        AccommodationItemResponse(
            id=str(a.id),
            name=a.name,
            type=a.type,
            island_name=a.island_name,
            address=a.address,
            price_per_night_rp=float(a.price_per_night_rp),
            rooms_available=a.rooms_available,
            has_clean_ro_water=a.has_clean_ro_water,
            has_solar_backup=a.has_solar_backup,
            eco_stay_badge=a.eco_stay_badge,
            contact_whatsapp=a.contact_whatsapp,
            description=a.description,
            photo_url=a.photo_url,
            is_verified=a.is_verified,
            created_at=a.created_at,
        )
        for a in items
    ]


@router.post(
    "/accommodations",
    response_model=AccommodationItemResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Daftarkan Penginapan Baru (CMS Operator & Admin)",
)
async def create_accommodation(
    payload: AccommodationCreateInput,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(HOMESTAY_CMS_ROLES),
):
    """Mendaftarkan homestay atau vila baru ke ekosistem Smart Tourism Banda (khusus operator/admin terautentikasi)."""
    acc = Accommodation(
        name=payload.name,
        type=payload.type.upper(),
        island_name=payload.island_name,
        address=payload.address,
        price_per_night_rp=payload.price_per_night_rp,
        rooms_available=payload.rooms_available,
        has_clean_ro_water=payload.has_clean_ro_water,
        has_solar_backup=payload.has_solar_backup,
        eco_stay_badge=payload.eco_stay_badge,
        contact_whatsapp=payload.contact_whatsapp,
        description=payload.description,
        photo_url=payload.photo_url,
        is_verified=True,
    )
    db.add(acc)
    await db.commit()
    await db.refresh(acc)

    return AccommodationItemResponse(
        id=str(acc.id),
        name=acc.name,
        type=acc.type,
        island_name=acc.island_name,
        address=acc.address,
        price_per_night_rp=float(acc.price_per_night_rp),
        rooms_available=acc.rooms_available,
        has_clean_ro_water=acc.has_clean_ro_water,
        has_solar_backup=acc.has_solar_backup,
        eco_stay_badge=acc.eco_stay_badge,
        contact_whatsapp=acc.contact_whatsapp,
        description=acc.description,
        photo_url=acc.photo_url,
        is_verified=acc.is_verified,
        created_at=acc.created_at,
    )


@router.put(
    "/accommodations/{accommodation_id}",
    response_model=AccommodationItemResponse,
    summary="Update Data / Tarif Penginapan (CMS Operator & Admin)",
)
async def update_accommodation(
    accommodation_id: str,
    payload: AccommodationUpdateInput,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(HOMESTAY_CMS_ROLES),
):
    try:
        acc_uuid = uuid.UUID(accommodation_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="ID Penginapan tidak valid.")

    stmt = select(Accommodation).where(Accommodation.id == acc_uuid)
    res = await db.execute(stmt)
    acc = res.scalar_one_or_none()
    if not acc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Penginapan tidak ditemukan.")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(acc, field, value)

    await db.commit()
    await db.refresh(acc)

    return AccommodationItemResponse(
        id=str(acc.id),
        name=acc.name,
        type=acc.type,
        island_name=acc.island_name,
        address=acc.address,
        price_per_night_rp=float(acc.price_per_night_rp),
        rooms_available=acc.rooms_available,
        has_clean_ro_water=acc.has_clean_ro_water,
        has_solar_backup=acc.has_solar_backup,
        eco_stay_badge=acc.eco_stay_badge,
        contact_whatsapp=acc.contact_whatsapp,
        description=acc.description,
        photo_url=acc.photo_url,
        is_verified=acc.is_verified,
        created_at=acc.created_at,
    )


@router.delete(
    "/accommodations/{accommodation_id}",
    summary="Hapus Penginapan (CMS Admin & Operator)",
)
async def delete_accommodation(
    accommodation_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(HOMESTAY_CMS_ROLES),
):
    try:
        acc_uuid = uuid.UUID(accommodation_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="ID Penginapan tidak valid.")

    stmt = select(Accommodation).where(Accommodation.id == acc_uuid)
    res = await db.execute(stmt)
    acc = res.scalar_one_or_none()
    if not acc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Penginapan tidak ditemukan.")

    await db.delete(acc)
    await db.commit()
    return {"message": "Penginapan berhasil dihapus."}


@router.post(
    "/bookings",
    response_model=BookingItemResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Buat Pemesanan Kamar & Generate Tautan WhatsApp Host Otomatis",
)
async def create_booking(
    payload: BookingCreateInput,
    db: AsyncSession = Depends(get_db),
):
    """
    Membuat pemesanan homestay/vila, menghitung total harga,
    dan membuat tautan WhatsApp API resmi yang langsung terhubung ke pengelola.
    """
    try:
        acc_uuid = uuid.UUID(payload.accommodation_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="ID Penginapan tidak valid.")

    stmt = select(Accommodation).where(Accommodation.id == acc_uuid)
    res = await db.execute(stmt)
    acc = res.scalar_one_or_none()
    if not acc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Penginapan dengan ID {payload.accommodation_id} tidak ditemukan.",
        )

    # Validasi rentang tanggal
    if payload.check_out <= payload.check_in:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tanggal check-out harus setelah tanggal check-in.",
        )

    nights = (payload.check_out - payload.check_in).days
    total_price = nights * payload.rooms_count * float(acc.price_per_night_rp)

    code = f"BKG-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M')}-{uuid.uuid4().hex[:4].upper()}"

    # Generate pesan WhatsApp resmi terstruktur
    wa_message = (
        f"Halo Pengelola {acc.name},\n"
        f"Saya ingin mengonfirmasi pemesanan penginapan via Platform Smart Tourism Banda Neira (BST-NIRANA):\n\n"
        f"📌 *Kode Booking:* {code}\n"
        f"👤 *Nama Tamu:* {payload.guest_name}\n"
        f"📅 *Check-In:* {payload.check_in}\n"
        f"📅 *Check-Out:* {payload.check_out} ({nights} Malam)\n"
        f"🛏️ *Jumlah Kamar:* {payload.rooms_count}\n"
        f"💰 *Total Estimasi:* Rp {total_price:,.0f}\n"
        f"{f'📝 Catatan: {payload.notes}' if payload.notes else ''}\n\n"
        f"Mohon konfirmasi ketersediaan kamar dan instruksi pembayaran. Terima kasih!"
    )
    encoded_text = urllib.parse.quote(wa_message)
    clean_phone = acc.contact_whatsapp.replace("+", "").replace("-", "").replace(" ", "")
    wa_link = f"https://wa.me/{clean_phone}?text={encoded_text}"

    booking = Booking(
        booking_code=code,
        accommodation_id=acc.id,
        guest_name=payload.guest_name,
        guest_whatsapp=payload.guest_whatsapp,
        guest_email=payload.guest_email,
        check_in=payload.check_in,
        check_out=payload.check_out,
        total_nights=nights,
        rooms_count=payload.rooms_count,
        total_price_rp=total_price,
        status="CONFIRMED",
        notes=payload.notes,
        wa_link=wa_link,
    )
    db.add(booking)
    await db.commit()
    await db.refresh(booking)

    return BookingItemResponse(
        id=str(booking.id),
        booking_code=booking.booking_code,
        accommodation_id=str(acc.id),
        accommodation_name=acc.name,
        guest_name=booking.guest_name,
        guest_whatsapp=booking.guest_whatsapp,
        check_in=booking.check_in,
        check_out=booking.check_out,
        total_nights=booking.total_nights,
        rooms_count=booking.rooms_count,
        total_price_rp=float(booking.total_price_rp),
        status=booking.status,
        wa_link=booking.wa_link,
        notes=booking.notes,
        created_at=booking.created_at,
    )


@router.get(
    "/bookings/{booking_code}",
    response_model=BookingItemResponse,
    summary="Cek Status Booking berdasarkan Kode",
)
async def get_booking_by_code(
    booking_code: str,
    db: AsyncSession = Depends(get_db),
):
    """Mengecek detail dan status reservasi penginapan."""
    stmt = (
        select(Booking, Accommodation.name)
        .join(Accommodation, Booking.accommodation_id == Accommodation.id)
        .where(Booking.booking_code == booking_code)
    )
    res = await db.execute(stmt)
    row = res.one_or_none()
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pemesanan dengan kode '{booking_code}' tidak ditemukan.",
        )
    booking, acc_name = row
    return BookingItemResponse(
        id=str(booking.id),
        booking_code=booking.booking_code,
        accommodation_id=str(booking.accommodation_id),
        accommodation_name=acc_name,
        guest_name=booking.guest_name,
        guest_whatsapp=booking.guest_whatsapp,
        check_in=booking.check_in,
        check_out=booking.check_out,
        total_nights=booking.total_nights,
        rooms_count=booking.rooms_count,
        total_price_rp=float(booking.total_price_rp),
        status=booking.status,
        wa_link=booking.wa_link,
        notes=booking.notes,
        created_at=booking.created_at,
    )


@router.get(
    "/bookings",
    response_model=List[BookingItemResponse],
    summary="Daftar Reservasi Masuk untuk Pengelola Penginapan & Wisata",
)
async def list_bookings(
    accommodation_id: Optional[str] = Query(None, description="Filter berdasarkan ID penginapan"),
    search: Optional[str] = Query(None, description="Filter nama tamu, kode booking, atau penginapan"),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(BOOKINGS_VIEW_ROLES),
):
    """Mengambil riwayat dan daftar reservasi penginapan yang masuk (khusus operator/admin terautentikasi dengan lingkup desa)."""
    stmt = (
        select(Booking, Accommodation.name)
        .join(Accommodation, Booking.accommodation_id == Accommodation.id)
        .order_by(desc(Booking.created_at))
        .limit(limit)
    )

    user_role_names = {r.name for r in current_user.roles}
    is_village_officer = (
        ROLE_VILLAGE_OFFICER in user_role_names
        or "kepala_desa" in user_role_names
        or "petugas_desa" in user_role_names
    )
    is_admin = (
        current_user.is_superuser
        or ROLE_ADMIN in user_role_names
        or ROLE_SMART_TOURISM_ADMIN in user_role_names
    )
    if is_village_officer and not is_admin and current_user.village:
        stmt = stmt.where(
            or_(
                Accommodation.address.ilike(f"%{current_user.village}%"),
                Accommodation.name.ilike(f"%{current_user.village}%"),
            )
        )

    if accommodation_id:
        try:
            acc_uuid = uuid.UUID(accommodation_id)
            stmt = stmt.where(Booking.accommodation_id == acc_uuid)
        except ValueError:
            pass

    if isinstance(search, str) and search:
        stmt = stmt.where(
            or_(
                Booking.booking_code.ilike(f"%{search}%"),
                Booking.guest_name.ilike(f"%{search}%"),
                Accommodation.name.ilike(f"%{search}%"),
            )
        )
    res = await db.execute(stmt)
    rows = res.all()
    results = []
    for booking, acc_name in rows:
        results.append(
            BookingItemResponse(
                id=str(booking.id),
                booking_code=booking.booking_code,
                accommodation_id=str(booking.accommodation_id),
                accommodation_name=acc_name,
                guest_name=booking.guest_name,
                guest_whatsapp=booking.guest_whatsapp,
                check_in=booking.check_in,
                check_out=booking.check_out,
                total_nights=booking.total_nights,
                rooms_count=booking.rooms_count,
                total_price_rp=float(booking.total_price_rp),
                status=booking.status,
                wa_link=booking.wa_link,
                notes=booking.notes,
                created_at=booking.created_at,
            )
        )
    return results


@router.get(
    "/heritage-catalog",
    response_model=List[HeritageCatalogItem],
    summary="Katalog 177 Cagar Budaya Banda Neira & Panduan Suara (Audio Guide)",
)
async def get_heritage_catalog(
    category: Optional[str] = Query(None, description="BENTENG, RUMAH_SEJARAH, CAGAR_BUDAYA"),
    island: Optional[str] = Query(None, description="Pulau Neira, Banda Besar, Pulau Ay, dll"),
):
    """Mengambil katalog cagar budaya bersejarah dengan narasi sejarah dan URL audio guide."""
    results = HERITAGE_CATALOG
    if category:
        results = [h for h in results if h.category.upper() == category.upper()]
    if island:
        results = [h for h in results if h.island.lower() == island.lower()]
    return results


# =======================================================================
# CMS JASA PEMANDU WISATA & BUDAYA BANDA NEIRA (HPI & KOMUNITAS ADAT)
# =======================================================================

@router.get(
    "/guides",
    response_model=List[TourGuideItemResponse],
    summary="Daftar Pemandu Wisata & Budaya Terverifikasi",
)
async def list_tour_guides(
    island: Optional[str] = Query(None, description="Filter berdasarkan pulau basis"),
    search: Optional[str] = Query(None, description="Pencarian nama, keahlian, atau bahasa"),
    is_verified: Optional[bool] = Query(None, description="Filter status verifikasi"),
    db: AsyncSession = Depends(get_db),
):
    """Mengambil katalog pemandu wisata dan budaya berlisensi di kepulauan Banda Neira."""
    await ensure_tour_guides_seeded(db)

    stmt = select(TourGuide).order_by(desc(TourGuide.rating))
    if island:
        stmt = stmt.where(TourGuide.island_base.ilike(f"%{island}%"))
    if search:
        stmt = stmt.where(
            or_(
                TourGuide.name.ilike(f"%{search}%"),
                TourGuide.specialties.ilike(f"%{search}%"),
                TourGuide.languages.ilike(f"%{search}%"),
                TourGuide.bio.ilike(f"%{search}%"),
                TourGuide.island_base.ilike(f"%{search}%"),
            )
        )
    if is_verified is not None:
        stmt = stmt.where(TourGuide.is_verified == is_verified)

    res = await db.execute(stmt)
    guides = res.scalars().all()

    return [
        TourGuideItemResponse(
            id=str(g.id),
            name=g.name,
            license_number=g.license_number,
            phone_whatsapp=g.phone_whatsapp,
            specialties=g.specialties,
            languages=g.languages,
            fee_per_day_rp=float(g.fee_per_day_rp),
            photo_url=g.photo_url,
            bio=g.bio,
            island_base=g.island_base,
            is_verified=g.is_verified,
            is_active=g.is_active,
            rating=float(g.rating),
            trips_completed=g.trips_completed,
            created_at=g.created_at,
        )
        for g in guides
    ]


@router.post(
    "/guides",
    response_model=TourGuideItemResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Daftarkan Pemandu Wisata Baru (CMS Pemandu & Admin)",
)
async def create_tour_guide(
    payload: TourGuideCreateInput,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(GUIDE_CMS_ROLES),
):
    """Mendaftarkan pemandu wisata baru ke dalam direktori terverifikasi (khusus smart tourism admin / admin terautentikasi)."""
    guide = TourGuide(
        name=payload.name,
        license_number=payload.license_number,
        phone_whatsapp=payload.phone_whatsapp,
        specialties=payload.specialties,
        languages=payload.languages,
        fee_per_day_rp=payload.fee_per_day_rp,
        photo_url=payload.photo_url,
        bio=payload.bio,
        island_base=payload.island_base,
        is_verified=payload.is_verified,
        is_active=payload.is_active,
    )
    db.add(guide)
    await db.commit()
    await db.refresh(guide)

    return TourGuideItemResponse(
        id=str(guide.id),
        name=guide.name,
        license_number=guide.license_number,
        phone_whatsapp=guide.phone_whatsapp,
        specialties=guide.specialties,
        languages=guide.languages,
        fee_per_day_rp=float(guide.fee_per_day_rp),
        photo_url=guide.photo_url,
        bio=guide.bio,
        island_base=guide.island_base,
        is_verified=guide.is_verified,
        is_active=guide.is_active,
        rating=float(guide.rating),
        trips_completed=guide.trips_completed,
        created_at=guide.created_at,
    )


@router.put(
    "/guides/{guide_id}",
    response_model=TourGuideItemResponse,
    summary="Update Profil & Tarif Jasa Pemandu (CMS Pemandu & Admin)",
)
async def update_tour_guide(
    guide_id: str,
    payload: TourGuideUpdateInput,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(GUIDE_CMS_ROLES),
):
    """Memperbarui informasi pemandu, tarif harian, atau status verifikasi."""
    try:
        g_uuid = uuid.UUID(guide_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="ID Pemandu tidak valid.")

    stmt = select(TourGuide).where(TourGuide.id == g_uuid)
    res = await db.execute(stmt)
    guide = res.scalar_one_or_none()
    if not guide:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pemandu wisata tidak ditemukan.")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(guide, field, value)

    await db.commit()
    await db.refresh(guide)

    return TourGuideItemResponse(
        id=str(guide.id),
        name=guide.name,
        license_number=guide.license_number,
        phone_whatsapp=guide.phone_whatsapp,
        specialties=guide.specialties,
        languages=guide.languages,
        fee_per_day_rp=float(guide.fee_per_day_rp),
        photo_url=guide.photo_url,
        bio=guide.bio,
        island_base=guide.island_base,
        is_verified=guide.is_verified,
        is_active=guide.is_active,
        rating=float(guide.rating),
        trips_completed=guide.trips_completed,
        created_at=guide.created_at,
    )


@router.delete(
    "/guides/{guide_id}",
    summary="Hapus Pemandu Wisata (CMS Admin)",
)
async def delete_tour_guide(
    guide_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(GUIDE_CMS_ROLES),
):
    """Menghapus pemandu wisata dari sistem (khusus admin)."""
    try:
        g_uuid = uuid.UUID(guide_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="ID Pemandu tidak valid.")

    stmt = select(TourGuide).where(TourGuide.id == g_uuid)
    res = await db.execute(stmt)
    guide = res.scalar_one_or_none()
    if not guide:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pemandu wisata tidak ditemukan.")

    await db.delete(guide)
    await db.commit()
    return {"message": "Pemandu wisata berhasil dihapus."}


# Router alias sesuai spesifikasi tabel SRS BAB XI
penginapan_alias_router = APIRouter(tags=["Penginapan & Pemesanan (SRS 11)"])


@penginapan_alias_router.get(
    "/penginapan",
    response_model=List[AccommodationItemResponse],
    summary="Daftar Penginapan (Alias SRS 11)"
)
async def list_penginapan_alias(
    island: Optional[str] = Query(None),
    village: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    max_price: Optional[float] = Query(None),
    has_ro_water: Optional[bool] = Query(None),
    has_solar: Optional[bool] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    return await list_accommodations(
        island=island,
        village=village,
        search=search,
        type=type,
        max_price=max_price,
        has_ro_water=has_ro_water,
        has_solar=has_solar,
        db=db
    )


@penginapan_alias_router.post(
    "/pemesanan",
    response_model=BookingItemResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Reservasi Penginapan & Trigger WhatsApp (Alias SRS 11)"
)
async def create_pemesanan_alias(
    payload: BookingCreateInput,
    db: AsyncSession = Depends(get_db),
):
    return await create_booking(payload=payload, db=db)


@penginapan_alias_router.get(
    "/pemesanan",
    response_model=List[BookingItemResponse],
    summary="Daftar Reservasi Masuk (Alias SRS 11)"
)
async def list_pemesanan_alias(
    accommodation_id: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(BOOKINGS_VIEW_ROLES),
):
    return await list_bookings(
        accommodation_id=accommodation_id,
        search=search,
        limit=limit,
        db=db,
        current_user=current_user
    )


# =======================================================================
# BANK KONTEN WISATA, KARYA WARGA & MODUL LITERASI DIGITAL
# (MANDAT REYHAN ALBAR FAHRYAN - CONTENT MANAGER & COMMUNITY ENGAGEMENT)
# =======================================================================

async def ensure_community_contents_seeded(db: AsyncSession):
    """Menyemai otomatis Bank Konten Batch 1 (H7) & Karya Peserta Workshop (H11) secara idempoten."""
    stmt = select(CommunityContent).limit(1)
    res = await db.execute(stmt)
    if not res.scalar_one_or_none():
        for item in SEED_COMMUNITY_CONTENTS:
            content = CommunityContent(**item)
            db.add(content)
        await db.commit()


def _to_community_content_response(c: CommunityContent) -> CommunityContentItemResponse:
    qc_flags = [
        c.qc_accuracy,
        c.qc_language,
        c.qc_visual,
        c.qc_adat_ethics,
        c.qc_source_validated,
        c.qc_consent_copyright,
    ]
    qc_passed_count = sum(1 for flag in qc_flags if flag)
    return CommunityContentItemResponse(
        id=str(c.id),
        content_code=c.content_code,
        title=c.title,
        slug=c.slug,
        content_type=c.content_type,
        priority_category=c.priority_category,
        island_name=c.island_name,
        author_name=c.author_name,
        author_role=c.author_role,
        summary=c.summary,
        body_narrative=c.body_narrative,
        media_url=c.media_url,
        latitude=c.latitude,
        longitude=c.longitude,
        sop_stage=c.sop_stage,
        qc_accuracy=c.qc_accuracy,
        qc_language=c.qc_language,
        qc_visual=c.qc_visual,
        qc_adat_ethics=c.qc_adat_ethics,
        qc_source_validated=c.qc_source_validated,
        qc_consent_copyright=c.qc_consent_copyright,
        qc_passed_count=qc_passed_count,
        is_published=c.is_published,
        created_at=c.created_at,
        updated_at=c.updated_at,
    )


@router.get(
    "/community-contents",
    response_model=List[CommunityContentItemResponse],
    summary="Daftar Bank Konten Wisata & Karya Peserta Workshop Literasi Digital",
)
async def list_community_contents(
    content_type: Optional[str] = Query(None, description="ARTICLE, PHOTO_GEOTAGGED, VIDEO_REELS, COMMUNITY_WORK"),
    priority_category: Optional[str] = Query(None, description="DESTINASI, UMKM, RELIGI_KULTURAL, LAYANAN_PUBLIK"),
    island: Optional[str] = Query(None, description="Filter berdasarkan nama pulau"),
    only_published: Optional[bool] = Query(None, description="Filter hanya konten berstatus tayang publik"),
    db: AsyncSession = Depends(get_db),
):
    """Mengambil daftar Bank Konten Wisata Batch 1 dan Karya Peserta Workshop Pokdarwis/UMKM."""
    await ensure_community_contents_seeded(db)

    stmt = select(CommunityContent).order_by(CommunityContent.content_code)
    if content_type:
        stmt = stmt.where(CommunityContent.content_type == content_type.upper())
    if priority_category:
        stmt = stmt.where(CommunityContent.priority_category == priority_category.upper())
    if island:
        stmt = stmt.where(CommunityContent.island_name.ilike(f"%{island}%"))
    if only_published is not None:
        stmt = stmt.where(CommunityContent.is_published == only_published)

    res = await db.execute(stmt)
    items = res.scalars().all()
    return [_to_community_content_response(c) for c in items]


@router.post(
    "/community-contents",
    response_model=CommunityContentItemResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Unggah Artikel / Konten Wisata / Karya Warga Baru ke CMS BST",
)
async def create_community_content(
    payload: CommunityContentCreateInput,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(GUIDE_CMS_ROLES),
):
    """Mendaftarkan artikel wisata, foto geotagged, storyboard reels, atau karya peserta workshop ke CMS BST."""
    await ensure_community_contents_seeded(db)

    code = (
        payload.content_code.strip().upper()
        if payload.content_code and payload.content_code.strip()
        else f"CNT-CMS-{uuid.uuid4().hex[:6].upper()}"
    )
    if payload.slug and payload.slug.strip():
        slug_val = payload.slug.strip().lower()
    else:
        base_slug = re.sub(r"[^a-z0-9]+", "-", payload.title.lower()).strip("-")
        slug_val = f"{base_slug[:160]}-{uuid.uuid4().hex[:4].lower()}"

    content = CommunityContent(
        content_code=code,
        title=payload.title.strip(),
        slug=slug_val,
        content_type=payload.content_type.upper(),
        priority_category=payload.priority_category.upper(),
        island_name=payload.island_name.strip(),
        author_name=payload.author_name.strip(),
        author_role=payload.author_role.strip(),
        summary=payload.summary.strip(),
        body_narrative=payload.body_narrative.strip(),
        media_url=payload.media_url,
        latitude=payload.latitude,
        longitude=payload.longitude,
        sop_stage=payload.sop_stage.upper(),
        qc_accuracy=payload.qc_accuracy,
        qc_language=payload.qc_language,
        qc_visual=payload.qc_visual,
        qc_adat_ethics=payload.qc_adat_ethics,
        qc_source_validated=payload.qc_source_validated,
        qc_consent_copyright=payload.qc_consent_copyright,
        is_published=payload.is_published,
    )
    db.add(content)
    await db.commit()
    await db.refresh(content)
    return _to_community_content_response(content)


@router.put(
    "/community-contents/{content_id}",
    response_model=CommunityContentItemResponse,
    summary="Update Konten, Tahap SOP 6-Tahap, atau Verifikasi 6-Point Quality Checklist",
)
async def update_community_content(
    content_id: str,
    payload: CommunityContentUpdateInput,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(GUIDE_CMS_ROLES),
):
    """Memperbarui draf konten, mengubah tahapan SOP manajemen konten, atau memvalidasi 6-Point Quality Checklist."""
    try:
        c_uuid = uuid.UUID(content_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="ID Konten tidak valid.")

    stmt = select(CommunityContent).where(CommunityContent.id == c_uuid)
    res = await db.execute(stmt)
    content = res.scalar_one_or_none()
    if not content:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Konten tidak ditemukan.")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field in ("content_type", "priority_category", "sop_stage") and isinstance(value, str):
            value = value.upper()
        setattr(content, field, value)

    await db.commit()
    await db.refresh(content)
    return _to_community_content_response(content)


@router.delete(
    "/community-contents/{content_id}",
    summary="Hapus Konten dari Bank Konten CMS BST",
)
async def delete_community_content(
    content_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(GUIDE_CMS_ROLES),
):
    """Menghapus item konten dari Bank Konten CMS (khusus admin / pengelola Smart Tourism)."""
    try:
        c_uuid = uuid.UUID(content_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="ID Konten tidak valid.")

    stmt = select(CommunityContent).where(CommunityContent.id == c_uuid)
    res = await db.execute(stmt)
    content = res.scalar_one_or_none()
    if not content:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Konten tidak ditemukan.")

    await db.delete(content)
    await db.commit()
    return {"message": "Konten berhasil dihapus."}


@router.get(
    "/literacy-modules",
    response_model=LiteracyGovernanceResponse,
    summary="Katalog 3 Modul Literasi Digital, SOP 6-Tahap, 6-Point QC & Pemetaan 4 Zona Sinyal Pulau",
)
async def get_literacy_modules_governance():
    """
    Mengembalikan kurikulum 3 Modul Literasi Digital Pokdarwis/UMKM,
    SOP 6-Tahap Manajemen Konten BST, standar 6-Point Quality Checklist,
    dan pemetaan 4 zona sinyal internet pulau untuk arsitektur Offline-First 3T.
    """
    return LiteracyGovernanceResponse(
        mandate_owner="Reyhan Albar Fahryan (Content Manager & Community Engagement)",
        community_brand="@neirabasudara — Komunitas Pariwisata, Sejarah & UMKM Banda Neira",
        modules=[LiteracyModuleItem(**m) for m in LITERACY_MODULES_CATALOG],
        sop_stages=[SopStageItem(**s) for s in SOP_CONTENT_WORKFLOW],
        quality_checklist_standards=QUALITY_CHECKLIST_STANDARDS,
        signal_zones_mapping=SIGNAL_ZONES_MAPPING,
    )



