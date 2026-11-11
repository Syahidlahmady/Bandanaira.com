from datetime import datetime, date
from typing import Optional, List, Tuple
from pydantic import BaseModel, Field


class AccommodationCreateInput(BaseModel):
    name: str = Field(..., max_length=150, description="Nama homestay atau vila")
    type: str = Field(default="HOMESTAY", description="HOMESTAY, VILA, HOTEL, CABIN")
    island_name: str = Field(default="Pulau Neira", description="Nama pulau")
    address: str = Field(default="Banda Neira, Maluku Tengah", description="Alamat lengkap")
    price_per_night_rp: float = Field(..., gt=0, description="Tarif sewa per malam (Rp)")
    rooms_available: int = Field(default=3, ge=1, description="Jumlah kamar tersedia")
    has_clean_ro_water: bool = Field(default=True, description="Memiliki fasilitas air minum RO higienis")
    has_solar_backup: bool = Field(default=True, description="Memiliki cadangan listrik panel surya")
    eco_stay_badge: bool = Field(default=True, description="Lencana penginapan ramah lingkungan")
    contact_whatsapp: str = Field(..., description="Nomor WhatsApp pengelola")
    description: str = Field(..., description="Deskripsi fasilitas dan keunggulan")
    photo_url: Optional[str] = Field(default=None, description="URL foto penginapan")


class AccommodationItemResponse(BaseModel):
    id: str
    name: str
    type: str
    island_name: str
    address: str
    price_per_night_rp: float
    rooms_available: int
    has_clean_ro_water: bool
    has_solar_backup: bool
    eco_stay_badge: bool
    contact_whatsapp: str
    description: str
    photo_url: Optional[str] = None
    is_verified: bool
    created_at: datetime


class BookingCreateInput(BaseModel):
    accommodation_id: str = Field(..., description="ID penginapan yang dipesan")
    guest_name: str = Field(..., min_length=2, max_length=150, description="Nama lengkap tamu")
    guest_whatsapp: str = Field(..., min_length=9, max_length=20, description="Nomor WhatsApp aktif tamu")
    guest_email: Optional[str] = Field(default=None, description="Email tamu (opsional)")
    check_in: date = Field(..., description="Tanggal check-in (YYYY-MM-DD)")
    check_out: date = Field(..., description="Tanggal check-out (YYYY-MM-DD)")
    rooms_count: int = Field(default=1, ge=1, le=10, description="Jumlah kamar")
    notes: Optional[str] = Field(default=None, description="Catatan kebutuhan khusus tamu")


class BookingItemResponse(BaseModel):
    id: str
    booking_code: str
    accommodation_id: str
    accommodation_name: str
    guest_name: str
    guest_whatsapp: str
    check_in: date
    check_out: date
    total_nights: int
    rooms_count: int
    total_price_rp: float
    status: str
    wa_link: str
    notes: Optional[str] = None
    created_at: datetime


class HeritageCatalogItem(BaseModel):
    slug: str
    title: str
    category: str
    island: str
    historical_period: str
    narrative: str
    audio_guide_url: str
    coordinates: Tuple[float, float]
    photo_url: str
