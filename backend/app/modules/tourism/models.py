import uuid
from typing import Optional, List
from datetime import date
from sqlalchemy import (
    String,
    Text,
    Numeric,
    Integer,
    Boolean,
    Date,
    ForeignKey,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.database.base import Base, TimestampMixin


class Accommodation(Base, TimestampMixin):
    """
    Model Penginapan Wisata Banda Neira (Vila, Homestay, Eco-Cabin).
    Menampilkan fitur ramah lingkungan (air minum RO, energi surya mandiri).
    """
    __tablename__ = "accommodations"

    name: Mapped[str] = mapped_column(String(150), nullable=False)
    type: Mapped[str] = mapped_column(String(50), default="HOMESTAY", nullable=False)
    island_name: Mapped[str] = mapped_column(String(100), default="Pulau Neira", nullable=False)
    address: Mapped[str] = mapped_column(String(255), default="Banda Neira, Maluku Tengah", nullable=False)
    price_per_night_rp: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    rooms_available: Mapped[int] = mapped_column(Integer, default=5, nullable=False)
    has_clean_ro_water: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    has_solar_backup: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    eco_stay_badge: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    contact_whatsapp: Mapped[str] = mapped_column(String(20), default="6281234567891", nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    photo_url: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    bookings: Mapped[List["Booking"]] = relationship(
        "Booking", back_populates="accommodation", cascade="all, delete-orphan"
    )


class Booking(Base, TimestampMixin):
    """
    Model Reservasi Homestay / Vila Wisatawan dengan generator tautan WhatsApp otomatis.
    """
    __tablename__ = "bookings"

    booking_code: Mapped[str] = mapped_column(String(36), unique=True, index=True, nullable=False)
    accommodation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("accommodations.id", ondelete="CASCADE"),
        nullable=False,
    )
    guest_name: Mapped[str] = mapped_column(String(150), nullable=False)
    guest_whatsapp: Mapped[str] = mapped_column(String(20), nullable=False)
    guest_email: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    check_in: Mapped[date] = mapped_column(Date, nullable=False)
    check_out: Mapped[date] = mapped_column(Date, nullable=False)
    total_nights: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    rooms_count: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    total_price_rp: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="PENDING", nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    wa_link: Mapped[str] = mapped_column(Text, nullable=False)

    accommodation: Mapped["Accommodation"] = relationship("Accommodation", back_populates="bookings")
