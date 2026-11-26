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
    nik_encrypted: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    nik_blind_index: Mapped[Optional[str]] = mapped_column(String(64), index=True, nullable=True)
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

    # Residence status & Death registry
    residence_status: Mapped[str] = mapped_column(
        String(20), default="active", nullable=False, index=True
    )  # 'active', 'moving', 'moved_out', 'temporary', 'deceased'
    death_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    death_place: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    death_cause: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    death_certificate_no: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    death_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    reported_death_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    reported_death_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    verifier: Mapped[Optional[User]] = relationship("User", foreign_keys=[verified_by], lazy="selectin")
    death_reporter: Mapped[Optional[User]] = relationship("User", foreign_keys=[reported_death_by], lazy="selectin")
    administrative_requests: Mapped[List["AdministrativeRequest"]] = relationship(
        "AdministrativeRequest", back_populates="resident", cascade="all, delete-orphan", lazy="selectin"
    )
    mutations: Mapped[List["ResidentMutation"]] = relationship(
        "ResidentMutation", back_populates="resident", cascade="all, delete-orphan", lazy="selectin"
    )

    def sync_crypto_nik(self) -> None:
        """Sinkronisasi blind index HMAC-SHA256 dan ciphertext AES-256-GCM."""
        from backend.app.core.crypto_nik import compute_nik_blind_index, encrypt_nik
        if self.nik and not self.nik.startswith("*"):
            self.nik_blind_index = compute_nik_blind_index(self.nik)
            self.nik_encrypted = encrypt_nik(self.nik)

    def __repr__(self) -> str:
        return f"<Resident nik={self.nik} name={self.full_name} status={self.verification_status} residence={self.residence_status}>"


class ResidentMutation(Base, TimestampMixin):
    __tablename__ = "resident_mutations"

    resident_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("residents.id", ondelete="CASCADE"), nullable=False, index=True
    )
    origin_village: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    destination_village: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    new_address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    new_rt: Mapped[Optional[str]] = mapped_column(String(5), nullable=True)
    new_rw: Mapped[Optional[str]] = mapped_column(String(5), nullable=True)
    reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    skpwni_number: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    # Status: 'pending_destination', 'pending_origin', 'completed', 'rejected', 'cancelled'
    status: Mapped[str] = mapped_column(
        String(50), default="pending_destination", nullable=False, index=True
    )
    initiated_by_village: Mapped[str] = mapped_column(String(100), nullable=False)

    origin_approved_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    origin_approved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    destination_approved_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    destination_approved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    rejection_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    rejected_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    rejected_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    resident: Mapped[Resident] = relationship("Resident", back_populates="mutations")
    origin_approver: Mapped[Optional[User]] = relationship("User", foreign_keys=[origin_approved_by], lazy="selectin")
    destination_approver: Mapped[Optional[User]] = relationship("User", foreign_keys=[destination_approved_by], lazy="selectin")
    rejecter: Mapped[Optional[User]] = relationship("User", foreign_keys=[rejected_by], lazy="selectin")

    def __repr__(self) -> str:
        return f"<ResidentMutation resident={self.resident_id} from={self.origin_village} to={self.destination_village} status={self.status}>"


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
