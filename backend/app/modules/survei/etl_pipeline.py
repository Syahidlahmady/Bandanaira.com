import logging
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.app.modules.survei.models import RawSurvey
from backend.app.modules.gis.models import SpatialFeature
from backend.app.modules.survei.schemas import (
    ETLRunRequest,
    ETLRunResult,
    ETLMigratedFeatureItem,
)

logger = logging.getLogger(__name__)

# Batas Geografis Kepulauan Banda Neira
BANDA_BBOX = {
    "min_lat": -4.65,
    "max_lat": -4.45,
    "min_lng": 129.80,
    "max_lng": 130.05,
}


def map_domain_to_layer_and_category(
    domain: str,
    title: str,
    flexible_attrs: Optional[Dict[str, Any]] = None,
    override_layer: Optional[str] = None
) -> tuple[str, str]:
    """
    Pemetaan cerdas dari Problem Domain ke salah satu dari 7-Layer Spasial PostGIS (SRS 10.1 & SRS 6.1).
    Mengembalikan (layer_type, category).
    """
    if override_layer:
        category = "resiliensi" if override_layer in ("LAYER_WATER_INFRA", "LAYER_ENERGY_WASTE") else "publik"
        return override_layer, category

    domain_upper = (domain or "").upper()
    title_lower = (title or "").lower()
    attrs_str = str(flexible_attrs or {}).lower()

    if domain_upper == "AIR_DAN_SAMPAH":
        # Jika dominan sampah plastik / bank sampah
        if any(k in title_lower or k in attrs_str for k in ("sampah", "plastik", "botol", "daur ulang", "timbulan")):
            return "LAYER_ENERGY_WASTE", "resiliensi"
        return "LAYER_WATER_INFRA", "resiliensi"

    elif domain_upper == "ENERGI":
        return "LAYER_ENERGY_WASTE", "resiliensi"

    elif domain_upper == "EKONOMI":
        return "LAYER_KOPERASI_UMKM", "publik"

    elif domain_upper == "WISATA":
        if any(k in title_lower or k in attrs_str for k in ("vila", "homestay", "hotel", "penginapan", "kamar")):
            return "LAYER_ACCOMMODATION", "publik"
        return "LAYER_TOURISM_4A", "publik"

    elif domain_upper == "BUDAYA":
        return "LAYER_HERITAGE", "publik"

    return "LAYER_WATER_INFRA", "resiliensi"


async def execute_etl_pipeline(
    db: AsyncSession,
    request: ETLRunRequest,
) -> ETLRunResult:
    """
    Menjalankan proses ETL (Extract, Transform, Load) dari data mentah raw_surveys (MongoDB/Staging)
    ke tabel relasional terstruktur spatial_features di PostgreSQL/PostGIS.
    """
    query = select(RawSurvey)

    # Filter by specific IDs or domain
    if request.survey_ids:
        query = query.where(RawSurvey.id.in_(request.survey_ids))
    elif request.problem_domain:
        query = query.where(RawSurvey.problem_domain == request.problem_domain.upper())

    result = await db.execute(query)
    surveys = result.scalars().all()

    total_scanned = len(surveys)
    migrated_count = 0
    skipped_count = 0
    migrated_items: List[ETLMigratedFeatureItem] = []
    errors: List[str] = []

    for survey in surveys:
        # Jika sudah pernah dimigrasi, lewati
        if survey.etl_status == "MIGRATED_TO_POSTGRES":
            skipped_count += 1
            continue

        # Validasi koordinat GPS
        lat = survey.latitude
        lng = survey.longitude
        if not (BANDA_BBOX["min_lat"] <= lat <= BANDA_BBOX["max_lat"] and
                BANDA_BBOX["min_lng"] <= lng <= BANDA_BBOX["max_lng"]):
            msg = f"Survei {survey.survey_code} dilewati: Koordinat ({lat}, {lng}) di luar batas Kepulauan Banda"
            errors.append(msg)
            logger.warning(msg)
            skipped_count += 1
            continue

        # Transformasi Domain -> 7-Layer Spasial
        layer_type, category = map_domain_to_layer_and_category(
            domain=survey.problem_domain,
            title=survey.title,
            flexible_attrs=survey.flexible_attributes,
            override_layer=request.target_layer_type
        )

        # Meta properties untuk GeoJSON Feature
        meta_properties = {
            "source_survey_code": survey.survey_code,
            "source_collector": survey.collector_name,
            "problem_domain": survey.problem_domain,
            "urgency_level": survey.urgency_level,
            "village_name": survey.village_name or "",
            "rt_rw": survey.rt_rw or "",
            "etl_migrated_at": datetime.now(timezone.utc).isoformat(),
            "photo_evidence_url": survey.photo_evidence_url,
            "flexible_attributes": survey.flexible_attributes or {},
        }

        # Jika domain air, tambahkan indikator kualitas air
        if layer_type == "LAYER_WATER_INFRA" and survey.flexible_attributes:
            tds = survey.flexible_attributes.get("kadar_tds_sumur_ppm")
            if tds is not None:
                meta_properties["live_tds_ppm"] = float(tds)
                meta_properties["water_quality_status"] = (
                    "LAYAK KONSUMSI" if float(tds) < 100 else "PERLU DESALINASI / RO"
                )

        # Buat entri SpatialFeature di PostGIS jika auto_promote aktif
        spatial_feature_id = uuid.uuid4()
        if request.auto_promote_spatial:
            spatial_feature = SpatialFeature(
                id=spatial_feature_id,
                name=survey.title,
                layer_type=layer_type,
                category=category,
                island_name=survey.island_name,
                latitude=lat,
                longitude=lng,
                geometry_geojson={
                    "type": "Point",
                    "coordinates": [lng, lat],
                },
                properties_meta=meta_properties,
                description=(
                    f"Survei {survey.survey_code} oleh {survey.collector_name}. "
                    f"Urgensi: {survey.urgency_level}. "
                    f"{survey.notes or ''}"
                ).strip(),
                is_active=True,
            )
            db.add(spatial_feature)

        # Perbarui status di raw_surveys
        survey.etl_status = "MIGRATED_TO_POSTGRES"
        survey.migrated_feature_id = spatial_feature_id
        migrated_count += 1

        migrated_items.append(
            ETLMigratedFeatureItem(
                survey_id=survey.id,
                survey_code=survey.survey_code,
                spatial_feature_id=spatial_feature_id,
                name=survey.title,
                layer_type=layer_type,
                island_name=survey.island_name,
                coordinates=[lng, lat],
            )
        )

    await db.commit()

    return ETLRunResult(
        success=True,
        message=f"Pipa ETL berhasil dijalankan: {migrated_count} survei berhasil dimigrasi ke PostGIS 7-layer.",
        total_scanned=total_scanned,
        migrated_count=migrated_count,
        skipped_count=skipped_count,
        migrated_items=migrated_items,
        errors=errors,
    )
