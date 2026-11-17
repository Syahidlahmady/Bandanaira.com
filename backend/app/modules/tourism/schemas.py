from datetime import datetime, date
from typing import Optional, List, Tuple, Dict, Any
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


class CommunityContentCreateInput(BaseModel):
    content_code: Optional[str] = Field(default=None, max_length=40, description="Kode unik konten (otomatis jika kosong)")
    title: str = Field(..., min_length=3, max_length=200, description="Judul artikel, foto geotagged, video reels, atau karya warga")
    slug: Optional[str] = Field(default=None, max_length=200, description="Slug URL unik (otomatis dari judul jika kosong)")
    content_type: str = Field(default="ARTICLE", max_length=30, description="ARTICLE, PHOTO_GEOTAGGED, VIDEO_REELS, COMMUNITY_WORK")
    priority_category: str = Field(default="DESTINASI", max_length=40, description="DESTINASI, UMKM, RELIGI_KULTURAL, LAYANAN_PUBLIK")
    island_name: str = Field(default="Pulau Neira", max_length=100, description="Nama pulau lokasi objek")
    author_name: str = Field(..., min_length=2, max_length=150, description="Nama penulis atau peserta workshop Pokdarwis/UMKM")
    author_role: str = Field(default="Pokdarwis / Komunitas Lokal", max_length=100, description="Peran penulis atau peserta")
    summary: str = Field(..., min_length=5, description="Ringkasan eksekutif atau caption AIDA")
    body_narrative: str = Field(..., min_length=10, description="Isi narasi lengkap artikel, storyboard video, atau cerita karya")
    media_url: Optional[str] = Field(default="/images/landmarks/belgica.jpg", max_length=255, description="Path gambar/media lokal")
    latitude: Optional[float] = Field(default=None, description="Koordinat lintang GPS (opsional)")
    longitude: Optional[float] = Field(default=None, description="Koordinat bujur GPS (opsional)")
    sop_stage: str = Field(default="PUBLIKASI", max_length=30, description="IDE, PRODUKSI, REVIEW, VALIDASI, PUBLIKASI, ARSIP")
    qc_accuracy: bool = Field(default=True, description="Checklist 1: Akurasi fakta sejarah/data")
    qc_language: bool = Field(default=True, description="Checklist 2: Kerapian bahasa & caption AIDA")
    qc_visual: bool = Field(default=True, description="Checklist 3: Kualitas visual resolusi & pencahayaan")
    qc_adat_ethics: bool = Field(default=True, description="Checklist 4: Etika adat Tabea & Sasi")
    qc_source_validated: bool = Field(default=True, description="Checklist 5: Validasi narasumber/tokoh")
    qc_consent_copyright: bool = Field(default=True, description="Checklist 6: Consent form & kredit hak cipta")
    is_published: bool = Field(default=True, description="Status publikasi di portal BST")


class CommunityContentUpdateInput(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=200)
    content_type: Optional[str] = Field(None, max_length=30)
    priority_category: Optional[str] = Field(None, max_length=40)
    island_name: Optional[str] = Field(None, max_length=100)
    author_name: Optional[str] = Field(None, max_length=150)
    author_role: Optional[str] = Field(None, max_length=100)
    summary: Optional[str] = None
    body_narrative: Optional[str] = None
    media_url: Optional[str] = Field(None, max_length=255)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    sop_stage: Optional[str] = Field(None, max_length=30)
    qc_accuracy: Optional[bool] = None
    qc_language: Optional[bool] = None
    qc_visual: Optional[bool] = None
    qc_adat_ethics: Optional[bool] = None
    qc_source_validated: Optional[bool] = None
    qc_consent_copyright: Optional[bool] = None
    is_published: Optional[bool] = None


class CommunityContentItemResponse(BaseModel):
    id: str
    content_code: str
    title: str
    slug: str
    content_type: str
    priority_category: str
    island_name: str
    author_name: str
    author_role: str
    summary: str
    body_narrative: str
    media_url: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    sop_stage: str
    qc_accuracy: bool
    qc_language: bool
    qc_visual: bool
    qc_adat_ethics: bool
    qc_source_validated: bool
    qc_consent_copyright: bool
    qc_passed_count: int
    is_published: bool
    created_at: datetime
    updated_at: Optional[datetime] = None


class LiteracyModuleItem(BaseModel):
    module_code: str
    title: str
    validation_status: str
    target_audience: str
    duration_minutes: int
    learning_objectives: List[str]
    key_topics: List[str]
    practical_output: str
    offline_ready: bool = True


class SopStageItem(BaseModel):
    stage_order: int
    stage_code: str
    stage_name: str
    pic_actor: str
    description: str
    deliverable: str


class LiteracyGovernanceResponse(BaseModel):
    mandate_owner: str
    community_brand: str
    modules: List[LiteracyModuleItem]
    sop_stages: List[SopStageItem]
    quality_checklist_standards: List[Dict[str, Any]]
    signal_zones_mapping: List[Dict[str, Any]]


