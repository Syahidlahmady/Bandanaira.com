from typing import Any, Dict, Optional
from sqlalchemy import Boolean, Float, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from backend.app.database.base import Base, TimestampMixin


class SpatialFeature(Base, TimestampMixin):
    """
    Tabel fitur spasial 7-layer Kepulauan Banda Neira.
    Mendukung format GeoJSON murni (Point, Polygon, LineString) dengan metadata dinamis.
    """
    __tablename__ = "spatial_features"

    name: Mapped[str] = mapped_column(String(150), index=True, nullable=False)
    layer_type: Mapped[str] = mapped_column(
        String(50), index=True, nullable=False
    )  # LAYER_TOURISM_4A, LAYER_HERITAGE, LAYER_ACCOMMODATION, LAYER_KOPERASI_UMKM,
       # LAYER_PUBLIC_SAFETY, LAYER_WATER_INFRA, LAYER_ENERGY_WASTE
    category: Mapped[str] = mapped_column(
        String(30), index=True, default="publik", nullable=False
    )  # 'publik' atau 'resiliensi'
    island_name: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    geometry_geojson: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    properties_meta: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    def to_geojson_feature(self) -> Dict[str, Any]:
        """Konversi model ORM ke format RFC 7946 GeoJSON Feature."""
        coords = [self.longitude, self.latitude]
        geom = self.geometry_geojson if self.geometry_geojson else {
            "type": "Point",
            "coordinates": coords
        }

        props: Dict[str, Any] = {
            "id": str(self.id),
            "name": self.name,
            "layer_type": self.layer_type,
            "category": self.category,
            "island_name": self.island_name,
            "description": self.description,
            "latitude": self.latitude,
            "longitude": self.longitude,
        }
        if self.properties_meta and isinstance(self.properties_meta, dict):
            props.update(self.properties_meta)

        return {
            "type": "Feature",
            "id": str(self.id),
            "geometry": geom,
            "properties": props
        }

    def __repr__(self) -> str:
        return f"<SpatialFeature {self.name} [{self.layer_type}] island={self.island_name}>"
