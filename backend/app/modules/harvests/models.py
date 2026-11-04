from datetime import date
from typing import Optional
import uuid
from sqlalchemy import Date, Float, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.database.base import Base, TimestampMixin
from backend.app.modules.farmers.models import Farmer
from backend.app.modules.farms.models import Farm


class Harvest(Base, TimestampMixin):
    __tablename__ = "harvests"

    farm_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("farms.id", ondelete="CASCADE"), nullable=False, index=True
    )
    farmer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("farmers.id", ondelete="CASCADE"), nullable=False, index=True
    )
    harvest_code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    commodity: Mapped[str] = mapped_column(String(100), index=True, nullable=False)  # Pala, Cengkih
    harvest_date: Mapped[date] = mapped_column(Date, nullable=False)
    quantity_kg: Mapped[float] = mapped_column(Float, nullable=False)
    quality_grade: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)  # Grade A, Grade B
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    farm: Mapped[Farm] = relationship("Farm", lazy="selectin")
    farmer: Mapped[Farmer] = relationship("Farmer", lazy="selectin")

    def __repr__(self) -> str:
        return f"<Harvest code={self.harvest_code} commodity={self.commodity} qty={self.quantity_kg}>"
