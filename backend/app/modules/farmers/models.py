from typing import List, Optional
import uuid
from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.database.base import Base, TimestampMixin
from backend.app.modules.auth.models import User
from backend.app.modules.population.models import Resident


class FarmerGroup(Base, TimestampMixin):
    __tablename__ = "farmer_groups"

    name: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    leader_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    village: Mapped[str] = mapped_column(String(100), default="Banda Neira", nullable=False)
    contact_number: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)

    farmers: Mapped[List["Farmer"]] = relationship("Farmer", back_populates="group", lazy="selectin")

    def __repr__(self) -> str:
        return f"<FarmerGroup name={self.name}>"


class Farmer(Base, TimestampMixin):
    __tablename__ = "farmers"

    farmer_code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="active", nullable=False)  # active, inactive
    
    # Optional foreign keys to user and resident
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    resident_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("residents.id", ondelete="SET NULL"), nullable=True
    )
    farmer_group_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("farmer_groups.id", ondelete="SET NULL"), nullable=True
    )

    group: Mapped[Optional[FarmerGroup]] = relationship("FarmerGroup", back_populates="farmers", lazy="selectin")
    user: Mapped[Optional[User]] = relationship("User", lazy="selectin")
    resident: Mapped[Optional[Resident]] = relationship("Resident", lazy="selectin")
    farms: Mapped[List["Farm"]] = relationship("Farm", back_populates="farmer", cascade="all, delete-orphan", lazy="selectin")

    def __repr__(self) -> str:
        return f"<Farmer code={self.farmer_code} name={self.name}>"
