import json
from pathlib import Path
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

_VILLAGES_SEED_FILE = Path(__file__).resolve().parent.parent.parent / "seeds" / "banda_villages.geojson"
_VILLAGE_DETAILS_SEED_FILE = Path(__file__).resolve().parent.parent.parent / "seeds" / "banda_village_details.json"
_GIS_FEATURES_SEED_FILE = Path(__file__).resolve().parent.parent.parent / "seeds" / "gis_spatial_features.json"


async def ensure_seed_features(db: AsyncSession) -> None:
    """Auto-seed 53 authentic spatial features (36 curated points/routes + 17 official village boundary polygons) if missing."""
    existing_stmt = select(SpatialFeature.name)
    existing_names = set((await db.execute(existing_stmt)).scalars().all())
    added = False

    # 1. Seed authentic points & maritime routes from INITIAL_SPATIAL_FEATURES
    for item in INITIAL_SPATIAL_FEATURES:
        if item["name"] not in existing_names:
            feat = SpatialFeature(
                name=item["name"],
                layer_type=item["layer_type"],
                category=item["category"],
                island_name=item["island_name"],
                latitude=item["latitude"],
                longitude=item["longitude"],
                geometry_geojson=item.get("geometry_geojson"),
                properties_meta=item.get("properties_meta"),
                description=item.get("description"),
                is_active=True,
            )
            db.add(feat)
            existing_names.add(item["name"])
            added = True

    # 2. Ensure all 17 village boundary polygons from banda_villages.geojson are in database
    if _VILLAGES_SEED_FILE.exists():
        try:
            with open(_VILLAGES_SEED_FILE, "r", encoding="utf-8") as vf:
                villages_data = json.load(vf)
            village_details = {}
            if _VILLAGE_DETAILS_SEED_FILE.exists():
                with open(_VILLAGE_DETAILS_SEED_FILE, "r", encoding="utf-8") as df:
                    village_details = json.load(df)

            for feat in villages_data.get("features", []):
                v_name = feat.get("properties", {}).get("name")
                v_island = feat.get("properties", {}).get("island", "Pulau Neira")
                if not v_name or v_name in ["Gunung Api", "Pulau Keraka"]:
                    continue
                feat_name = f"Batas Wilayah {v_name}"
                if feat_name not in existing_names:
                    geom = feat.get("geometry", {})
                    coords = geom.get("coordinates", [])
                    center_lat, center_lng = -4.525, 129.897
                    if geom.get("type") == "Polygon" and len(coords) > 0 and len(coords[0]) > 0:
                        ring = coords[0]
                        center_lat = sum(c[1] for c in ring) / len(ring)
                        center_lng = sum(c[0] for c in ring) / len(ring)
                    elif geom.get("type") == "MultiPolygon" and len(coords) > 0 and len(coords[0]) > 0 and len(coords[0][0]) > 0:
                        ring = coords[0][0]
                        center_lat = sum(c[1] for c in ring) / len(ring)
                        center_lng = sum(c[0] for c in ring) / len(ring)

                    v_detail = village_details.get(v_name, {})
                    props = {
                        "village_name": v_name,
                        "color": feat.get("properties", {}).get("color", "#3b82f6"),
                        "population": v_detail.get("population", ""),
                        "main_commodity": v_detail.get("main_commodity", ""),
                        "area_ha": v_detail.get("area_ha", ""),
                        "area_km2": v_detail.get("area_km2", ""),
                        "density": v_detail.get("density", ""),
                        "highlights": v_detail.get("highlights", ""),
                        "demographics": v_detail.get("demographics", {}),
                        "is_zone": True,
                    }
                    new_f = SpatialFeature(
                        name=feat_name,
                        layer_type="LAYER_DESA_ADMIN",
                        category="zona_wilayah",
                        island_name=v_island,
                        latitude=round(center_lat, 6),
                        longitude=round(center_lng, 6),
                        geometry_geojson=geom,
                        properties_meta=props,
                        description=v_detail.get("description", ""),
                        is_active=True,
                    )
                    db.add(new_f)
                    existing_names.add(feat_name)
                    added = True
        except Exception:
            pass

    if added:
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

    res = target_feature.to_geojson_feature()
    if "audio_url" not in res["properties"]:
        audio_guide = (
            target_feature.properties_meta.get("audio_url")
            if target_feature.properties_meta
            else None
        ) or f"/audio/{slug}.mp3"
        res["properties"]["audio_url"] = audio_guide

    return res


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
@router.get("/seed-reset")
@peta_alias_router.post("/seed-reset")
@peta_alias_router.get("/seed-reset")
async def reset_gis_seeds(
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Re-seed atau sinkronisasi data kurasi spasial standar Kepulauan Banda (36 titik + 17 poligon desa)."""
    count_before = (await db.execute(select(func.count(SpatialFeature.id)))).scalar() or 0
    await ensure_seed_features(db)
    count_after = (await db.execute(select(func.count(SpatialFeature.id)))).scalar() or 0
    added_count = count_after - count_before
    return {
        "status": "success",
        "total_features": count_after,
        "features_added": added_count,
        "message": f"Berhasil menyinkronkan {count_after} fitur spasial kurasi (termasuk 17 zona wilayah desa).",
    }


# =============================================================================
# ZONA BATAS WILAYAH DESA (POLYGON / MULTIPOLYGON)
# =============================================================================


@router.get("/villages")
@peta_alias_router.get("/villages")
async def get_villages_geojson(db: AsyncSession = Depends(get_db)) -> Dict[str, Any]:
    """Mengambil GeoJSON poligon batas wilayah desa/negeri dari basis data PostGIS atau seeder terkalibrasi."""
    stmt = select(SpatialFeature).where(
        SpatialFeature.layer_type == "LAYER_DESA_ADMIN",
        SpatialFeature.category == "zona_wilayah",
        SpatialFeature.is_active == True,
    )
    records = (await db.execute(stmt)).scalars().all()
    if records:
        features = []
        for r in records:
            props = r.properties_meta or {}
            v_name = props.get("village_name") or r.name.replace("Batas Wilayah ", "").strip()
            feat_id = f"desa-{v_name.lower().replace(' ', '-')}"
            features.append({
                "type": "Feature",
                "id": feat_id,
                "properties": {
                    "name": v_name,
                    "island": r.island_name,
                    "color": props.get("color", "#3b82f6"),
                },
                "geometry": r.geometry_geojson or {},
            })
        return {"type": "FeatureCollection", "features": features}

    if _VILLAGES_SEED_FILE.exists():
        with open(_VILLAGES_SEED_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    raise HTTPException(status_code=404, detail="Dataset zona desa belum tersedia di seeder")


@router.get("/villages/details")
@peta_alias_router.get("/villages/details")
async def get_village_details(db: AsyncSession = Depends(get_db)) -> Dict[str, Any]:
    """Mengambil detail atribut, potensi, dan narasi desa kepulauan dari basis data atau seeder."""
    stmt = select(SpatialFeature).where(
        SpatialFeature.layer_type == "LAYER_DESA_ADMIN",
        SpatialFeature.category == "zona_wilayah",
        SpatialFeature.is_active == True,
    )
    records = (await db.execute(stmt)).scalars().all()
    details: Dict[str, Any] = {}
    if _VILLAGE_DETAILS_SEED_FILE.exists():
        with open(_VILLAGE_DETAILS_SEED_FILE, "r", encoding="utf-8") as f:
            details = json.load(f)

    if records:
        for r in records:
            props = r.properties_meta or {}
            v_name = props.get("village_name") or r.name.replace("Batas Wilayah ", "").strip()
            if v_name in details:
                if props.get("population"):
                    details[v_name]["population"] = props.get("population")
                if props.get("main_commodity"):
                    details[v_name]["main_commodity"] = props.get("main_commodity")
                if props.get("area_ha"):
                    details[v_name]["area_ha"] = props.get("area_ha")
                if props.get("area_km2"):
                    details[v_name]["area_km2"] = props.get("area_km2")
                if props.get("density"):
                    details[v_name]["density"] = props.get("density")
                if props.get("highlights"):
                    details[v_name]["highlights"] = props.get("highlights")
                if props.get("demographics"):
                    details[v_name]["demographics"] = props.get("demographics")
                if r.description:
                    details[v_name]["description"] = r.description
            else:
                details[v_name] = {
                    "name": v_name,
                    "island": r.island_name,
                    "color": props.get("color", "#3b82f6"),
                    "description": r.description or "Wilayah administrasi desa di Kepulauan Banda.",
                    "population": props.get("population", ""),
                    "main_commodity": props.get("main_commodity", ""),
                    "area_ha": props.get("area_ha", ""),
                    "area_km2": props.get("area_km2", ""),
                    "density": props.get("density", ""),
                    "highlights": props.get("highlights", ""),
                    "demographics": props.get("demographics", {}),
                }

    return details


@router.post("/villages/save-polygon")
@peta_alias_router.post("/villages/save-polygon")
async def save_village_polygon(
    payload: Dict[str, Any],
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Menyimpan atau memperbarui poligon batas wilayah desa langsung ke basis data PostGIS dan berkas seeder.
    """
    v_name = payload.get("name")
    if not v_name:
        raise HTTPException(status_code=400, detail="Nama desa wajib diisi")

    v_island = payload.get("island", "Pulau Neira")
    geom = payload.get("geometry", {})
    if not geom or "coordinates" not in geom:
        raise HTTPException(status_code=400, detail="Geometri poligon tidak valid")

    feat_name = f"Batas Wilayah {v_name}"
    coords = geom.get("coordinates", [])
    center_lat, center_lng = -4.525, 129.897

    if geom.get("type") == "Polygon" and len(coords) > 0 and len(coords[0]) > 0:
        ring = coords[0]
        center_lat = sum(c[1] for c in ring) / len(ring)
        center_lng = sum(c[0] for c in ring) / len(ring)
    elif geom.get("type") == "MultiPolygon" and len(coords) > 0 and len(coords[0]) > 0 and len(coords[0][0]) > 0:
        ring = coords[0][0]
        center_lat = sum(c[1] for c in ring) / len(ring)
        center_lng = sum(c[0] for c in ring) / len(ring)

    props = {
        "village_name": v_name,
        "color": payload.get("color", "#3b82f6"),
        "population": payload.get("population", ""),
        "main_commodity": payload.get("main_commodity", ""),
        "area_ha": payload.get("area_ha", ""),
        "area_km2": payload.get("area_km2", ""),
        "density": payload.get("density", ""),
        "highlights": payload.get("highlights", ""),
        "demographics": payload.get("demographics", {}),
        "is_zone": True,
    }

    # 1. Simpan ke database PostGIS
    stmt = select(SpatialFeature).where(
        SpatialFeature.name == feat_name,
        SpatialFeature.layer_type == "LAYER_DESA_ADMIN",
    )
    existing = (await db.execute(stmt)).scalar_one_or_none()

    if existing:
        existing.geometry_geojson = geom
        existing.island_name = v_island
        existing.latitude = round(center_lat, 6)
        existing.longitude = round(center_lng, 6)
        existing.properties_meta = props
        if payload.get("description"):
            existing.description = payload.get("description")
        existing.is_active = True
    else:
        new_f = SpatialFeature(
            name=feat_name,
            layer_type="LAYER_DESA_ADMIN",
            category="zona_wilayah",
            island_name=v_island,
            latitude=round(center_lat, 6),
            longitude=round(center_lng, 6),
            geometry_geojson=geom,
            properties_meta=props,
            description=payload.get("description", ""),
            is_active=True,
        )
        db.add(new_f)

    await db.commit()

    # 2. Update berkas seeder banda_villages.geojson di disk
    try:
        current_geojson = {"type": "FeatureCollection", "features": []}
        if _VILLAGES_SEED_FILE.exists():
            with open(_VILLAGES_SEED_FILE, "r", encoding="utf-8") as f:
                current_geojson = json.load(f)

        features = [f for f in current_geojson.get("features", []) if f.get("properties", {}).get("name") != v_name]
        feat_id = f"desa-{v_name.lower().replace(' ', '-')}"
        features.append({
            "type": "Feature",
            "id": feat_id,
            "properties": {
                "name": v_name,
                "island": v_island,
                "color": payload.get("color", "#3b82f6"),
            },
            "geometry": geom,
        })
        current_geojson["features"] = features
        _VILLAGES_SEED_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(_VILLAGES_SEED_FILE, "w", encoding="utf-8") as f:
            json.dump(current_geojson, f, indent=2, ensure_ascii=False)
    except Exception:
        pass

    return {
        "status": "success",
        "message": f"Batas wilayah {v_name} berhasil disimpan langsung ke basis data PostGIS dan seeder.",
        "village": v_name,
    }


@router.post("/villages/sync")
async def sync_villages(
    payload: Dict[str, Any],
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Menyimpan zona poligon desa hasil kalibrasi ke berkas seeder dan database PostGIS."""
    geojson = payload.get("geojson")
    details = payload.get("details")

    if not geojson or not isinstance(geojson, dict) or "features" not in geojson:
        raise HTTPException(status_code=400, detail="Data GeoJSON tidak valid")

    # 1. Simpan ke berkas seeder JSON permanen
    _VILLAGES_SEED_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(_VILLAGES_SEED_FILE, "w", encoding="utf-8") as f:
        json.dump(geojson, f, indent=2, ensure_ascii=False)

    if details and isinstance(details, dict):
        with open(_VILLAGE_DETAILS_SEED_FILE, "w", encoding="utf-8") as f:
            json.dump(details, f, indent=2, ensure_ascii=False)

    # 2. Sinkronkan ke tabel spatial_features sebagai LAYER_DESA_ADMIN (zona_wilayah)
    active_feat_names = {
        f"Batas Wilayah {feat.get('properties', {}).get('name')}"
        for feat in geojson.get("features", [])
        if feat.get("properties", {}).get("name")
    }

    # Hapus zona desa dari database yang sudah tidak ada di payload (misal dihapus user)
    from sqlalchemy import delete as sql_delete
    delete_stmt = sql_delete(SpatialFeature).where(
        SpatialFeature.layer_type == "LAYER_DESA_ADMIN",
        SpatialFeature.category == "zona_wilayah",
        SpatialFeature.name.not_in(active_feat_names),
    )
    await db.execute(delete_stmt)

    count = len(geojson.get("features", []))
    for feat in geojson.get("features", []):
        v_name = feat.get("properties", {}).get("name")
        v_island = feat.get("properties", {}).get("island", "Pulau Neira")
        if not v_name:
            continue

        feat_name = f"Batas Wilayah {v_name}"
        stmt = select(SpatialFeature).where(
            SpatialFeature.name == feat_name,
            SpatialFeature.layer_type == "LAYER_DESA_ADMIN",
        )
        existing = (await db.execute(stmt)).scalar_one_or_none()

        geom = feat.get("geometry", {})
        coords = geom.get("coordinates", [])
        center_lat, center_lng = -4.525, 129.897

        if geom.get("type") == "Polygon" and len(coords) > 0 and len(coords[0]) > 0:
            ring = coords[0]
            center_lat = sum(c[1] for c in ring) / len(ring)
            center_lng = sum(c[0] for c in ring) / len(ring)
        elif geom.get("type") == "MultiPolygon" and len(coords) > 0 and len(coords[0]) > 0 and len(coords[0][0]) > 0:
            ring = coords[0][0]
            center_lat = sum(c[1] for c in ring) / len(ring)
            center_lng = sum(c[0] for c in ring) / len(ring)

        v_detail = details.get(v_name, {}) if details else {}
        props = {
            "village_name": v_name,
            "color": feat.get("properties", {}).get("color", "#3b82f6"),
            "population": v_detail.get("population", ""),
            "main_commodity": v_detail.get("main_commodity", ""),
            "area_ha": v_detail.get("area_ha", ""),
            "is_zone": True,
        }

        if existing:
            existing.geometry_geojson = geom
            existing.island_name = v_island
            existing.latitude = center_lat
            existing.longitude = center_lng
            existing.properties_meta = props
            existing.description = v_detail.get("description", "")
            existing.is_active = True
        else:
            new_f = SpatialFeature(
                name=feat_name,
                layer_type="LAYER_DESA_ADMIN",
                category="zona_wilayah",
                island_name=v_island,
                latitude=center_lat,
                longitude=center_lng,
                geometry_geojson=geom,
                properties_meta=props,
                description=v_detail.get("description", ""),
                is_active=True,
            )
            db.add(new_f)

    await db.commit()

    return {
        "status": "success",
        "message": f"Berhasil menyimpan {count} zona wilayah desa ke berkas seeder dan database PostGIS.",
        "features_count": count,
    }
