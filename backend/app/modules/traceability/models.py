from datetime import date, datetime
from typing import Any, Dict, List, Optional
import uuid
from sqlalchemy import Column, Date, DateTime, Float, ForeignKey, JSON, String, Table, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.database.base import Base, TimestampMixin
from backend.app.modules.auth.models import User
from backend.app.modules.harvests.models import Harvest


class BatchHarvest(Base):
    __tablename__ = "batch_harvests"

    batch_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("product_batches.id", ondelete="CASCADE"), primary_key=True
    )
    harvest_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("harvests.id", ondelete="CASCADE"), primary_key=True
    )
    allocated_quantity_kg: Mapped[float] = mapped_column(Float, nullable=False)

    harvest: Mapped[Harvest] = relationship("Harvest", lazy="selectin")
    batch: Mapped["ProductBatch"] = relationship("ProductBatch", back_populates="batch_harvests")


class ProductBatch(Base, TimestampMixin):
    __tablename__ = "product_batches"

    batch_code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    commodity: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    total_quantity_kg: Mapped[float] = mapped_column(Float, nullable=False)
    production_date: Mapped[date] = mapped_column(Date, nullable=False)
    public_verification_token: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="created", nullable=False)  # created, processing, packaged, distributed
    blockchain_status: Mapped[str] = mapped_column(String(50), default="pending", nullable=False)  # pending, submitted, confirmed, failed

    batch_harvests: Mapped[List[BatchHarvest]] = relationship(
        "BatchHarvest", back_populates="batch", cascade="all, delete-orphan", lazy="selectin"
    )
    events: Mapped[List["BatchEvent"]] = relationship(
        "BatchEvent", back_populates="batch", cascade="all, delete-orphan", order_by="BatchEvent.event_timestamp", lazy="selectin"
    )

    def __repr__(self) -> str:
        return f"<ProductBatch code={self.batch_code} commodity={self.commodity} token={self.public_verification_token}>"


class BatchEvent(Base):
    __tablename__ = "batch_events"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    batch_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("product_batches.id", ondelete="CASCADE"), nullable=False, index=True
    )
    event_type: Mapped[str] = mapped_column(String(50), nullable=False)  # harvest_aggregated, fermentation, drying, sorting, packaging, transfer
    event_timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    recorded_by_user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )
    location: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    metadata_json: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    event_hash: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    previous_event_hash: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=func.now(), nullable=False
    )

    batch: Mapped[ProductBatch] = relationship("ProductBatch", back_populates="events")
    recorder: Mapped[User] = relationship("User", lazy="selectin")

    def __repr__(self) -> str:
        return f"<BatchEvent type={self.event_type} hash={self.event_hash[:10]}...>"
