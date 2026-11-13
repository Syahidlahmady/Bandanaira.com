import uuid
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.core.permissions import (
    ROLE_ADMIN,
    ROLE_VILLAGE_OFFICER,
    require_roles,
)
from backend.app.database.session import get_db
from backend.app.modules.auth.models import User
from backend.app.modules.gis.curated_layers import (
    INITIAL_SPATIAL_FEATURES,
    LAYER_DEFINITIONS,
)
from backend.app.modules.gis.geocoding import geocoding_service
from backend.app.modules.gis.models import SpatialFeature
from backend.app.modules.gis.schemas import (
    GISSummaryResponse,
    GeoJSONFeatureCollection,
    GeocodingResponse,
    LayerMetadata,
    SpatialFeatureCreate,
    SpatialFeatureResponse,
    SpatialFeatureUpdate,
)

router = APIRouter(prefix="/gis", tags=["7-Layer Spatial GIS Peta Interaktif"])
peta_alias_router = APIRouter(prefix="/peta", tags=["Peta Interaktif (SRS 11 Parity)"])


async def ensure_seed_features(db: AsyncSession) -> None:
    """Auto-seed 28 authentic spatial features across 7 layers if table is empty."""
    count_stmt = select(func.count(SpatialFeature.id))
    existing_count = (await db.execute(count_stmt)).scalar() or 0
    if existing_count == 0:
        for item in INITIAL_SPATIAL_FEATURES:
            feat = SpatialFeature(
                name=item["name"],
                layer_type=item["layer_type"],
                category=item["category"],
                island_name=item["island_name"],
                latitude=item["latitude"],
                longitude=item["longitude"],
                properties_meta=item.get("properties_meta"),
                description=item.get("description"),
                is_active=True,
            )
            db.add(feat)
        await db.commit()


@router.get("/layers", response_model=GeoJSONFeatureCollection)
@peta_alias_router.get("/geojson", response_model=GeoJSONFeatureCollection)
async def get_spatial_layers_geojson(
    layers: Optional[str] = Query(
        None,
        description="Filter layer_type dipisahkan koma, misal: LAYER_TOURISM_4A,LAYER_HERITAGE",
    ),
    category: Optional[str] = Query(
        None, description="Filter kategori: 'publik' atau 'resiliensi'"
    ),
    island: Optional[str] = Query(
        None, description="Filter pulau, misal: Pulau Neira, Banda Besar, Pulau Hatta"
    ),
    db: AsyncSession = Depends(get_db),
) -> GeoJSONFeatureCollection:
    """
    Mengambil data fitur spasial format RFC 7946 GeoJSON FeatureCollection.
    Mendukung multi-layer filtering untuk Leaflet.js layer switcher.
    """
    await ensure_seed_features(db)

    stmt = select(SpatialFeature).where(SpatialFeature.is_active == True)  # noqa: E712

    active_layers_filter: List[str] = []
    if layers:
        active_layers_filter = [l.strip() for l in layers.split(",") if l.strip()]
        if active_layers_filter:
            stmt = stmt.where(SpatialFeature.layer_type.in_(active_layers_filter))

    if category:
        stmt = stmt.where(SpatialFeature.category == category.lower())

    if island:
        stmt = stmt.where(SpatialFeature.island_name == island)

    result = await db.execute(stmt)
    records = result.scalars().all()

    features_json = [rec.to_geojson_feature() for rec in records]
    present_layers = sorted(list(set(rec.layer_type for rec in records)))

    return GeoJSONFeatureCollection(
        type="FeatureCollection",
        features=features_json,  # type: ignore
        total_features=len(features_json),
        active_layers=present_layers,
    )


@router.get("/meta", response_model=GISSummaryResponse)
@peta_alias_router.get("/layers-meta", response_model=GISSummaryResponse)
async def get_gis_layers_metadata(
    db: AsyncSession = Depends(get_db),
) -> GISSummaryResponse:
    """
    Mengambil metadata ringkasan 7-layer spasial, palet warna, ikon, dan jumlah fitur aktif.
    """
    await ensure_seed_features(db)

    # Hitung jumlah per layer_type
    stmt = (
        select(SpatialFeature.layer_type, func.count(SpatialFeature.id))
        .where(SpatialFeature.is_active == True)  # noqa: E712
        .group_by(SpatialFeature.layer_type)
    )
    counts = dict((await db.execute(stmt)).all())

    layers_meta: List[LayerMetadata] = []
    public_count = 0
    resiliency_count = 0

    for layer_id, meta in LAYER_DEFINITIONS.items():
        cnt = counts.get(layer_id, 0)
        layers_meta.append(
            LayerMetadata(
                id=layer_id,
                name=meta["name"],
                category=meta["category"],
                color=meta["color"],
                icon=meta["icon"],
                description=meta["description"],
                feature_count=cnt,
            )
        )
        if meta["category"] == "publik":
            public_count += cnt
        else:
            resiliency_count += cnt

    # Daftar pulau tersedia
    island_stmt = (
        select(SpatialFeature.island_name)
        .where(SpatialFeature.is_active == True)  # noqa: E712
        .distinct()
    )
    islands = [row[0] for row in (await db.execute(island_stmt)).all()]

    return GISSummaryResponse(
        total_features=sum(counts.values()),
        public_layers_count=public_count,
        resiliency_layers_count=resiliency_count,
        layers=layers_meta,
        available_islands=sorted(islands),
    )


@router.get("/cagar-budaya/{slug}")
@peta_alias_router.get("/cagar-budaya/{slug}")
async def get_heritage_detail_by_slug(
    slug: str,
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Mengambil narasi sejarah dan audio guide destinasi cagar budaya berdasarkan slug (SRS 11).
    """
    await ensure_seed_features(db)

    stmt = select(SpatialFeature).where(
        SpatialFeature.layer_type == "LAYER_HERITAGE",
        SpatialFeature.is_active == True,  # noqa: E712
    )
    records = (await db.execute(stmt)).scalars().all()

    target_feature = None
    for rec in records:
        if rec.properties_meta and rec.properties_meta.get("slug") == slug:
            target_feature = rec
            break
        # Fallback check slug in name
        if slug.replace("-", " ").lower() in rec.name.lower():
            target_feature = rec
            break

    if not target_feature:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Situs cagar budaya dengan slug '{slug}' tidak ditemukan.",
        )

    return target_feature.to_geojson_feature()


@router.get("/cari-eksternal", response_model=GeocodingResponse)
@peta_alias_router.get("/cari-eksternal", response_model=GeocodingResponse)
async def cari_titik_eksternal(
    q: str = Query(..., min_length=2, description="Nama situs sejarah / objek wisata / infrastruktur"),
    limit: int = Query(default=8, ge=1, le=20),
) -> GeocodingResponse:
    """
    Mencari koordinat presisi [lat, lng] dari Google Maps / OSM Nominatim / Offline Gazetteer Banda.
    Hasil pencarian bersih tanpa POI sampah luar wilayah Banda.
    """
    hasil = geocoding_service.cari_titik(kata_kunci=q, limit=limit)
    return GeocodingResponse(
        query=q,
        total=len(hasil),
        results=hasil,
    )


@router.get("/features/{feature_id}", response_model=SpatialFeatureResponse)
async def get_feature_detail(
    feature_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> SpatialFeatureResponse:
    """Mengambil detail fitur spasial berdasarkan UUID."""
    stmt = select(SpatialFeature).where(SpatialFeature.id == feature_id)
    feature = (await db.execute(stmt)).scalar_one_or_none()
    if not feature:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Fitur spasial ID '{feature_id}' tidak ditemukan.",
        )
    return SpatialFeatureResponse.model_validate(feature)


@router.put(
    "/features/{feature_id}",
    response_model=SpatialFeatureResponse,
    status_code=status.HTTP_200_OK,
)
async def update_spatial_feature(
    feature_id: uuid.UUID,
    data: SpatialFeatureUpdate,
    current_user: User = Depends(require_roles([ROLE_ADMIN, ROLE_VILLAGE_OFFICER])),
    db: AsyncSession = Depends(get_db),
) -> SpatialFeatureResponse:
    """
    Mengubah titik spasial dan metadata 4A di PostGIS (Role: Admin / Village Officer).
    """
    stmt = select(SpatialFeature).where(SpatialFeature.id == feature_id)
    feature = (await db.execute(stmt)).scalar_one_or_none()
    if not feature:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Fitur spasial ID '{feature_id}' tidak ditemukan.",
        )

    update_data = data.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(feature, field, val)

    await db.commit()
    await db.refresh(feature)
    return SpatialFeatureResponse.model_validate(feature)


@router.delete(
    "/features/{feature_id}",
    status_code=status.HTTP_200_OK,
)
async def delete_spatial_feature(
    feature_id: uuid.UUID,
    current_user: User = Depends(require_roles([ROLE_ADMIN, ROLE_VILLAGE_OFFICER])),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Menghapus titik spasial dari PostGIS (Role: Admin / Village Officer).
    """
    stmt = select(SpatialFeature).where(SpatialFeature.id == feature_id)
    feature = (await db.execute(stmt)).scalar_one_or_none()
    if not feature:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Fitur spasial ID '{feature_id}' tidak ditemukan.",
        )

    await db.delete(feature)
    await db.commit()
    return {
        "status": "success",
        "deleted_id": str(feature_id),
        "message": f"Titik spasial '{feature.name}' berhasil dihapus dari database PostGIS.",
    }


@router.post(
    "/features",
    response_model=SpatialFeatureResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_spatial_feature(
    data: SpatialFeatureCreate,
    current_user: User = Depends(require_roles([ROLE_ADMIN, ROLE_VILLAGE_OFFICER])),
    db: AsyncSession = Depends(get_db),
) -> SpatialFeatureResponse:
    """
    Menambahkan titik/poligon spasial baru ke layer (Role: Admin / Village Officer).
    """
    feature = SpatialFeature(
        name=data.name,
        layer_type=data.layer_type,
        category=data.category,
        island_name=data.island_name,
        latitude=data.latitude,
        longitude=data.longitude,
        geometry_geojson=data.geometry_geojson,
        properties_meta=data.properties_meta,
        description=data.description,
        is_active=data.is_active,
    )
    db.add(feature)
    await db.commit()
    await db.refresh(feature)
    return SpatialFeatureResponse.model_validate(feature)


@router.post("/seed-reset")
async def reset_gis_seeds(
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Re-seed atau sinkronisasi data kurasi spasial standar Kepulauan Banda."""
    # Ambil nama yang sudah ada
    existing_stmt = select(SpatialFeature.name)
    existing_names = set((await db.execute(existing_stmt)).scalars().all())

    added_count = 0
    for item in INITIAL_SPATIAL_FEATURES:
        if item["name"] not in existing_names:
            feat = SpatialFeature(
                name=item["name"],
                layer_type=item["layer_type"],
                category=item["category"],
                island_name=item["island_name"],
                latitude=item["latitude"],
                longitude=item["longitude"],
                properties_meta=item.get("properties_meta"),
                description=item.get("description"),
                is_active=True,
            )
            db.add(feat)
            added_count += 1

    await db.commit()
    return {
        "status": "success",
        "features_added": added_count,
        "message": f"Berhasil menyinkronkan {added_count} fitur spasial kurasi.",
    }
