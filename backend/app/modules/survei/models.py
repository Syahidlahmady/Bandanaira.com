import uuid
from typing import Any, Dict, Optional
from sqlalchemy import (
    String,
    Text,
    Float,
    JSON,
    ForeignKey,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from backend.app.database.base import Base, TimestampMixin


class RawSurvey(Base, TimestampMixin):
    """
    Model Penampungan Survei Dinamis Masalah Lapangan (Koleksi MongoDB / Relational Staging).
    Menampung data survei fleksibel tanpa skema kaku sebelum diproses oleh pipa ETL
    menjadi fitur spasial terstruktur di PostgreSQL/PostGIS (SRS 6.1, 9.1).
    """
    __tablename__ = "raw_surveys"

    survey_code: Mapped[str] = mapped_column(String(30), unique=True, index=True, nullable=False)
    collector_name: Mapped[str] = mapped_column(String(120), nullable=False)
    problem_domain: Mapped[str] = mapped_column(
        String(40), index=True, nullable=False
    )  # AIR_DAN_SAMPAH | ENERGI | EKONOMI | WISATA | BUDAYA
    island_name: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    village_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    rt_rw: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    urgency_level: Mapped[str] = mapped_column(
        String(20), default="SEDANG", nullable=False
    )  # RENDAH | SEDANG | TINGGI | KRITIS
    flexible_attributes: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    photo_evidence_url: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    etl_status: Mapped[str] = mapped_column(
        String(30), index=True, default="PENDING", nullable=False
    )  # PENDING | MIGRATED_TO_POSTGRES | REJECTED
    migrated_feature_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("spatial_features.id", ondelete="SET NULL"), nullable=True
    )

    def to_dict(self) -> Dict[str, Any]:
        """Konversi model ORM ke dictionary representasi JSON / MongoDB Document."""
        return {
            "id": str(self.id),
            "survey_code": self.survey_code,
            "collector_name": self.collector_name,
            "problem_domain": self.problem_domain,
            "island_name": self.island_name,
            "village_name": self.village_name,
            "rt_rw": self.rt_rw,
            "gps_point": {
                "lat": self.latitude,
                "lng": self.longitude,
            },
            "title": self.title,
            "urgency_level": self.urgency_level,
            "flexible_attributes": self.flexible_attributes or {},
            "photo_evidence_url": self.photo_evidence_url,
            "notes": self.notes,
            "etl_status": self.etl_status,
            "migrated_feature_id": str(self.migrated_feature_id) if self.migrated_feature_id else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    def to_geojson_feature(self) -> Dict[str, Any]:
        """Konversi cepat ke GeoJSON Feature RFC 7946 untuk pratinjau sebelum migrasi."""
        props = self.to_dict()
        props.pop("gps_point", None)
        return {
            "type": "Feature",
            "id": str(self.id),
            "geometry": {
                "type": "Point",
                "coordinates": [self.longitude, self.latitude],
            },
            "properties": props,
        }

    def __repr__(self) -> str:
        return f"<RawSurvey {self.survey_code} [{self.problem_domain}] status={self.etl_status}>"
