from typing import Any, Dict, Optional
import uuid
from sqlalchemy import Float, ForeignKey, JSON, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.database.base import Base, TimestampMixin


class Farm(Base, TimestampMixin):
    __tablename__ = "farms"

    farmer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("farmers.id", ondelete="CASCADE"), nullable=False, index=True
    )
    farm_code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    location_description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    polygon_boundary_geojson: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    area_sqm: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    primary_commodity: Mapped[str] = mapped_column(String(100), index=True, nullable=False)  # Pala, Cengkih
    verification_status: Mapped[str] = mapped_column(String(20), default="pending", nullable=False)

    farmer: Mapped["Farmer"] = relationship("Farmer", back_populates="farms")

    def __repr__(self) -> str:
        return f"<Farm code={self.farm_code} name={self.name} commodity={self.primary_commodity}>"
