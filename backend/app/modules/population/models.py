from datetime import date, datetime
from typing import List, Optional
import uuid
from sqlalchemy import Date, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.database.base import Base, TimestampMixin
from backend.app.modules.auth.models import User


class Resident(Base, TimestampMixin):
    __tablename__ = "residents"

    nik: Mapped[str] = mapped_column(String(16), unique=True, index=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    gender: Mapped[str] = mapped_column(String(10), nullable=False)  # 'L' (Laki-laki) or 'P' (Perempuan)
    birth_place: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    birth_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    rt: Mapped[Optional[str]] = mapped_column(String(5), nullable=True)
    rw: Mapped[Optional[str]] = mapped_column(String(5), nullable=True)
    village: Mapped[str] = mapped_column(String(100), default="Banda Neira", nullable=False)
    religion: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    marital_status: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    occupation: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    phone_number: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    
    # Verification workflow
    verification_status: Mapped[str] = mapped_column(
        String(20), default="pending", nullable=False, index=True
    )  # 'pending', 'verified', 'rejected'
    verified_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    verified_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    verifier: Mapped[Optional[User]] = relationship("User", lazy="selectin")
    administrative_requests: Mapped[List["AdministrativeRequest"]] = relationship(
        "AdministrativeRequest", back_populates="resident", cascade="all, delete-orphan", lazy="selectin"
    )

    def __repr__(self) -> str:
        return f"<Resident nik={self.nik} name={self.full_name} status={self.verification_status}>"


class AdministrativeRequest(Base, TimestampMixin):
    __tablename__ = "administrative_requests"

    resident_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("residents.id", ondelete="CASCADE"), nullable=False, index=True
    )
    request_type: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[str] = mapped_column(
        String(50), default="submitted", nullable=False, index=True
    )  # 'submitted', 'in_review', 'approved', 'rejected'
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    resident: Mapped[Resident] = relationship("Resident", back_populates="administrative_requests")

    def __repr__(self) -> str:
        return f"<AdministrativeRequest type={self.request_type} status={self.status}>"
