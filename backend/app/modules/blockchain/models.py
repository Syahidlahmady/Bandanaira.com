import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import BigInteger, DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.database.base import Base


class BlockchainTransaction(Base):
    __tablename__ = "blockchain_transactions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    batch_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("product_batches.id", ondelete="CASCADE"), nullable=False, index=True
    )
    event_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("batch_events.id", ondelete="SET NULL"), nullable=True, index=True
    )
    transaction_hash: Mapped[Optional[str]] = mapped_column(String(66), unique=True, index=True, nullable=True)
    block_number: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    contract_address: Mapped[str] = mapped_column(String(42), nullable=False)
    data_hash: Mapped[str] = mapped_column(String(66), nullable=False, index=True)
    status: Mapped[str] = mapped_column(
        String(30), default="pending", nullable=False, index=True
    )  # pending, submitted, confirmed, failed
    submitted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    confirmed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), onupdate=func.now(), nullable=True
    )

    batch = relationship("ProductBatch", lazy="selectin")
    event = relationship("BatchEvent", lazy="selectin")

    def __repr__(self) -> str:
        return f"<BlockchainTransaction id={self.id} tx={self.transaction_hash} status={self.status}>"
