import uuid
from typing import Optional, List
from sqlalchemy import (
    String,
    Text,
    Numeric,
    Float,
    Integer,
    ForeignKey,
    DateTime,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.database.base import Base, TimestampMixin
from backend.app.modules.population.models import Resident


class CoopAccount(Base, TimestampMixin):
    """
    Akun Terpadu Koperasi Hatta & Bank Sampah Warga Desa (Model Arla).
    Menghubungkan data kependudukan (NIK) dengan Saldo Koperasi, Poin Sampah, dan Kuota Air Bersih.
    """
    __tablename__ = "coop_accounts"

    resident_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("residents.id", ondelete="CASCADE"),
        unique=True,
        index=True,
        nullable=False,
    )
    coop_balance_rp: Mapped[float] = mapped_column(
        Numeric(12, 2), default=0.0, nullable=False
    )
    plastic_points: Mapped[int] = mapped_column(
        Integer, default=0, nullable=False
    )
    clean_water_quota_ltr: Mapped[float] = mapped_column(
        Float, default=20.0, nullable=False  # Kuota awal 20 liter untuk setiap warga desa
    )
    total_commodities_kg: Mapped[float] = mapped_column(
        Float, default=0.0, nullable=False
    )
    total_plastic_recycled_kg: Mapped[float] = mapped_column(
        Float, default=0.0, nullable=False
    )
    pin_hash: Mapped[Optional[str]] = mapped_column(
        String(128), nullable=True
    )

    resident: Mapped[Resident] = relationship("Resident", lazy="selectin")
    transactions: Mapped[List["CoopTransaction"]] = relationship(
        "CoopTransaction", back_populates="account", cascade="all, delete-orphan", lazy="selectin"
    )

    def __repr__(self) -> str:
        return f"<CoopAccount resident_id={self.resident_id} balance={self.coop_balance_rp} water_quota={self.clean_water_quota_ltr}>"


class CoopTransaction(Base, TimestampMixin):
    """
    Log Transaksi Koperasi Hatta, Bank Sampah Plastik, & Tebus Air Bersih RO.
    Setiap transaksi memiliki SHA-256 hash representasi bukti buku besar.
    """
    __tablename__ = "coop_transactions"

    account_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("coop_accounts.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    resident_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("residents.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    transaction_code: Mapped[str] = mapped_column(
        String(36), unique=True, index=True, nullable=False
    )
    transaction_type: Mapped[str] = mapped_column(
        String(50), index=True, nullable=False
    )  # DEPOSIT_COMMODITY, DEPOSIT_WASTE, REDEEM_WATER, WITHDRAW_BALANCE
    item_name: Mapped[str] = mapped_column(String(100), nullable=False)
    weight_or_volume: Mapped[float] = mapped_column(
        Numeric(10, 2), nullable=False
    )
    unit_price_rp: Mapped[float] = mapped_column(
        Numeric(10, 2), default=0.0, nullable=False
    )
    monetary_value_rp: Mapped[float] = mapped_column(
        Numeric(10, 2), default=0.0, nullable=False
    )
    water_quota_impact_ltr: Mapped[float] = mapped_column(
        Float, default=0.0, nullable=False
    )
    destination: Mapped[str] = mapped_column(
        String(20), default="BALANCE", nullable=False
    )  # BALANCE atau WATER_QUOTA
    receipt_hash: Mapped[str] = mapped_column(
        String(66), nullable=False
    )  # SHA-256 transaction digest
    station_code: Mapped[Optional[str]] = mapped_column(
        String(50), nullable=True
    )  # e.g. RO-STATION-LONTHOIR-01
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    account: Mapped[CoopAccount] = relationship("CoopAccount", back_populates="transactions")
    resident: Mapped[Resident] = relationship("Resident", lazy="selectin")

    def __repr__(self) -> str:
        return f"<CoopTransaction {self.transaction_code} type={self.transaction_type} val={self.monetary_value_rp}>"
