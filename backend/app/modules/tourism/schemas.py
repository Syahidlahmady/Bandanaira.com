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


class AccommodationUpdateInput(BaseModel):
    name: Optional[str] = Field(None, max_length=150)
    type: Optional[str] = None
    island_name: Optional[str] = None
    address: Optional[str] = None
    price_per_night_rp: Optional[float] = Field(None, gt=0)
    rooms_available: Optional[int] = Field(None, ge=0)
    has_clean_ro_water: Optional[bool] = None
    has_solar_backup: Optional[bool] = None
    eco_stay_badge: Optional[bool] = None
    contact_whatsapp: Optional[str] = None
    description: Optional[str] = None
    photo_url: Optional[str] = None
    is_verified: Optional[bool] = None


class TourGuideCreateInput(BaseModel):
    name: str = Field(..., max_length=150, description="Nama pemandu wisata")
    license_number: str = Field(default="HPI-BANDA-LOKAL", max_length=50, description="Nomor lisensi / sertifikat HPI")
    phone_whatsapp: str = Field(..., max_length=20, description="Nomor WhatsApp pemandu")
    specialties: str = Field(..., max_length=255, description="Spesialisasi tur (Sejarah VOC, Snorkeling, Diving, dll)")
    languages: str = Field(default="Indonesia, English", max_length=100, description="Bahasa yang dikuasai")
    fee_per_day_rp: float = Field(..., gt=0, description="Tarif jasa per hari (Rp)")
    photo_url: Optional[str] = Field(default=None, description="Foto profil pemandu")
    bio: str = Field(..., description="Profil singkat dan pengalaman memandu")
    island_base: str = Field(default="Pulau Neira", description="Basis pulau pemandu")
    is_verified: bool = Field(default=True, description="Terverifikasi oleh admin pusat")
    is_active: bool = Field(default=True, description="Status aktif menerima tamu")


class TourGuideUpdateInput(BaseModel):
    name: Optional[str] = None
    license_number: Optional[str] = None
    phone_whatsapp: Optional[str] = None
    specialties: Optional[str] = None
    languages: Optional[str] = None
    fee_per_day_rp: Optional[float] = Field(None, gt=0)
    photo_url: Optional[str] = None
    bio: Optional[str] = None
    island_base: Optional[str] = None
    is_verified: Optional[bool] = None
    is_active: Optional[bool] = None


class TourGuideItemResponse(BaseModel):
    id: str
    name: str
    license_number: str
    phone_whatsapp: str
    specialties: str
    languages: str
    fee_per_day_rp: float
    photo_url: Optional[str] = None
    bio: str
    island_base: str
    is_verified: bool
    is_active: bool
    rating: float
    trips_completed: int
    created_at: datetime

