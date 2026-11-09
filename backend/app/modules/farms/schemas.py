from datetime import datetime
from typing import Any, Dict, List, Optional
import uuid
from pydantic import BaseModel, ConfigDict, Field


class FarmCreate(BaseModel):
    farmer_id: uuid.UUID
    farm_code: str = Field(..., min_length=3, max_length=50)
    name: str = Field(..., min_length=2, max_length=255)
    location_description: Optional[str] = None
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    polygon_boundary_geojson: Optional[Dict[str, Any]] = None
    area_sqm: float = Field(..., ge=0.0)
    primary_commodity: str = Field(..., min_length=2, max_length=100)  # e.g. "Pala", "Cengkih"


class FarmUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    location_description: Optional[str] = None
    latitude: Optional[float] = Field(None, ge=-90.0, le=90.0)
    longitude: Optional[float] = Field(None, ge=-180.0, le=180.0)
    polygon_boundary_geojson: Optional[Dict[str, Any]] = None
    area_sqm: Optional[float] = Field(None, ge=0.0)
    primary_commodity: Optional[str] = None
    verification_status: Optional[str] = Field(None, pattern=r"^(pending|verified|rejected)$")


class FarmVerificationUpdate(BaseModel):
    verification_status: str = Field(..., pattern=r"^(verified|rejected|pending)$")
    notes: Optional[str] = None


class FarmResponse(BaseModel):
    id: uuid.UUID
    farmer_id: uuid.UUID
    farm_code: str
    name: str
    location_description: Optional[str] = None
    latitude: float
    longitude: float
    polygon_boundary_geojson: Optional[Dict[str, Any]] = None
    area_sqm: float
    primary_commodity: str
    verification_status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FarmListResponse(BaseModel):
    items: List[FarmResponse]
    total: int
    page: int
    limit: int


# GeoJSON schemas for Leaflet map display
class GeoJSONGeometry(BaseModel):
    type: str = "Point"
    coordinates: List[float]  # [longitude, latitude]


class GeoJSONFeature(BaseModel):
    type: str = "Feature"
    id: str
    geometry: GeoJSONGeometry
    properties: Dict[str, Any]


class GeoJSONFeatureCollection(BaseModel):
    type: str = "FeatureCollection"
    features: List[GeoJSONFeature]


class FarmStatisticsResponse(BaseModel):
    total_farmers: int
    total_farmer_groups: int
    total_farms: int
    total_area_sqm: float
    commodity_distribution: Dict[str, int]
    verified_farms: int = 0
    pending_farms: int = 0


class FarmBoundaryValidationRequest(BaseModel):
    polygon_boundary_geojson: Dict[str, Any]
    exclude_farm_id: Optional[uuid.UUID] = None


class FarmBoundaryValidationResponse(BaseModel):
    is_valid: bool
    has_overlap: bool
    overlapping_farm_id: Optional[str] = None
    overlapping_farm_code: Optional[str] = None
    overlapping_farm_name: Optional[str] = None
    calculated_area_sqm: float = 0.0
    message: str

