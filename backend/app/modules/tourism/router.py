import urllib.parse
import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.database.session import get_db
from backend.app.modules.tourism.models import Accommodation, Booking
from backend.app.modules.tourism.schemas import (
    AccommodationCreateInput,
    AccommodationItemResponse,
    BookingCreateInput,
    BookingItemResponse,
    HeritageCatalogItem,
)
from backend.app.modules.tourism.heritage_data import HERITAGE_CATALOG

router = APIRouter(prefix="/tourism", tags=["Smart Tourism & Eco-Stay Accommodations"])

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


@router.get(
    "/accommodations",
    response_model=List[AccommodationItemResponse],
    summary="Daftar Penginapan Eco-Stay (Vila, Homestay, Hotel)",
)
async def list_accommodations(
    island: Optional[str] = Query(None, description="Filter nama pulau"),
    type: Optional[str] = Query(None, description="HOMESTAY, HOTEL, VILA, CABIN"),
    max_price: Optional[float] = Query(None, description="Batas harga maksimal per malam"),
    has_ro_water: Optional[bool] = Query(None, description="Filter fasilitas air RO"),
    has_solar: Optional[bool] = Query(None, description="Filter panel surya"),
    db: AsyncSession = Depends(get_db),
):
    """Mengambil katalog penginapan terverifikasi dengan fitur filter ramah lingkungan."""
    await ensure_accommodations_seeded(db)

    query = select(Accommodation).order_by(Accommodation.price_per_night_rp)

    if island:
        query = query.where(Accommodation.island_name == island)
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
    summary="Daftarkan Penginapan Baru",
)
async def create_accommodation(
    payload: AccommodationCreateInput,
    db: AsyncSession = Depends(get_db),
):
    """Mendaftarkan homestay atau vila baru ke ekosistem Smart Tourism Banda."""
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


# Router alias sesuai spesifikasi tabel SRS BAB XI
penginapan_alias_router = APIRouter(tags=["Penginapan & Pemesanan (SRS 11)"])


@penginapan_alias_router.get(
    "/penginapan",
    response_model=List[AccommodationItemResponse],
    summary="Daftar Penginapan (Alias SRS 11)"
)
async def list_penginapan_alias(
    island: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    max_price: Optional[float] = Query(None),
    has_ro_water: Optional[bool] = Query(None),
    has_solar: Optional[bool] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    return await list_accommodations(
        island=island,
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
