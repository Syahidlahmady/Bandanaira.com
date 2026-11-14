from typing import Any, Dict, List, Optional
import uuid
from pydantic import BaseModel, ConfigDict, Field


class SpatialFeatureBase(BaseModel):
    name: str = Field(..., max_length=150)
    layer_type: str = Field(
        ...,
        description="Salah satu dari 7 layer: LAYER_TOURISM_4A, LAYER_HERITAGE, LAYER_ACCOMMODATION, LAYER_KOPERASI_UMKM, LAYER_PUBLIC_SAFETY, LAYER_WATER_INFRA, LAYER_ENERGY_WASTE"
    )
    category: str = Field("publik", description="'publik' atau 'resiliensi'")
    island_name: str = Field(..., max_length=50)
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    geometry_geojson: Optional[Dict[str, Any]] = None
    properties_meta: Optional[Dict[str, Any]] = None
    description: Optional[str] = None
    is_active: bool = True


class SpatialFeatureCreate(SpatialFeatureBase):
    pass


class SpatialFeatureUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=150)
    layer_type: Optional[str] = None
    category: Optional[str] = None
    island_name: Optional[str] = None
    latitude: Optional[float] = Field(None, ge=-90.0, le=90.0)
    longitude: Optional[float] = Field(None, ge=-180.0, le=180.0)
    geometry_geojson: Optional[Dict[str, Any]] = None
    properties_meta: Optional[Dict[str, Any]] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class GeocodingSearchResult(BaseModel):
    name: str
    lat: float
    lng: float
    address: str
    island: str
    suggested_layer: str
    source: str


class GeocodingResponse(BaseModel):
    query: str
    total: int
    results: List[GeocodingSearchResult]


class SpatialFeatureResponse(SpatialFeatureBase):
    id: uuid.UUID
    model_config = ConfigDict(from_attributes=True)


class GeoJSONGeometry(BaseModel):
    type: str = "Point"
    coordinates: Any  # [longitude, latitude] for Point, [[lng, lat], ...] for LineString, or nested list for polygon


class GeoJSONFeature(BaseModel):
    type: str = "Feature"
    id: str
    geometry: GeoJSONGeometry
    properties: Dict[str, Any]


class GeoJSONFeatureCollection(BaseModel):
    type: str = "FeatureCollection"
    features: List[GeoJSONFeature]
    total_features: int = 0
    active_layers: List[str] = []


class LayerMetadata(BaseModel):
    id: str
    name: str
    category: str  # 'publik' atau 'resiliensi'
    color: str
    icon: str
    description: str
    feature_count: int = 0


class GISSummaryResponse(BaseModel):
    total_features: int
    public_layers_count: int
    resiliency_layers_count: int
    layers: List[LayerMetadata]
    available_islands: List[str]
