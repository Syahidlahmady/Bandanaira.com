import logging
import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, select

from backend.app.database.session import get_db
from backend.app.modules.survei.models import RawSurvey
from backend.app.modules.survei.schemas import (
    SurveyCreate,
    SurveyResponse,
    ETLRunRequest,
    ETLRunResult,
    SurveyStatsResponse,
)
from backend.app.modules.survei.etl_pipeline import execute_etl_pipeline
from backend.app.modules.survei.seed_data import SAMPLE_RAW_SURVEYS

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/survei", tags=["Survei Dinamis & Pipa ETL (SRS 6.1 & BAB XI)"])


def generate_survey_code() -> str:
    now_str = datetime.now(timezone.utc).strftime("%Y%m%d")
    short_rand = uuid.uuid4().hex[:4].upper()
    return f"SRV-{now_str}-{short_rand}"


@router.post(
    "/mentah",
    response_model=SurveyResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Menyimpan form dinamis pemetaan masalah lapangan (SRS 6.1 / BAB XI)"
)
async def submit_raw_survey(
    payload: SurveyCreate,
    db: AsyncSession = Depends(get_db),
):
    """
    Menyimpan formulir survei lapangan dinamis ke koleksi mentah (MongoDB / Relational Staging).
    Menerima atribut fleksibel tanpa skema kolom kaku (FR-01).
    """
    survey = RawSurvey(
        id=uuid.uuid4(),
        survey_code=generate_survey_code(),
        collector_name=payload.collector_name.strip(),
        problem_domain=payload.problem_domain.value,
        island_name=payload.island_name.strip(),
        village_name=payload.village_name.strip() if payload.village_name else None,
        rt_rw=payload.rt_rw.strip() if payload.rt_rw else None,
        latitude=payload.latitude,
        longitude=payload.longitude,
        title=payload.title.strip(),
        urgency_level=payload.urgency_level.value,
        flexible_attributes=payload.flexible_attributes or {},
        photo_evidence_url=payload.photo_evidence_url,
        notes=payload.notes,
        etl_status="PENDING",
    )
    db.add(survey)
    await db.commit()
    await db.refresh(survey)

    logger.info("Survei baru tersimpan: %s domain=%s", survey.survey_code, survey.problem_domain)

    return SurveyResponse(
        id=survey.id,
        survey_code=survey.survey_code,
        collector_name=survey.collector_name,
        problem_domain=survey.problem_domain,
        island_name=survey.island_name,
        village_name=survey.village_name,
        rt_rw=survey.rt_rw,
        latitude=survey.latitude,
        longitude=survey.longitude,
        gps_point={"lat": survey.latitude, "lng": survey.longitude},
        title=survey.title,
        urgency_level=survey.urgency_level,
        flexible_attributes=survey.flexible_attributes or {},
        photo_evidence_url=survey.photo_evidence_url,
        notes=survey.notes,
        etl_status=survey.etl_status,
        migrated_feature_id=survey.migrated_feature_id,
        created_at=survey.created_at,
    )


@router.get(
    "/mentah",
    response_model=List[SurveyResponse],
    summary="Mengambil daftar survei lapangan mentah dengan filter"
)
async def list_raw_surveys(
    problem_domain: Optional[str] = Query(None, description="Filter domain masalah"),
    etl_status: Optional[str] = Query(None, description="Filter status ETL (PENDING, MIGRATED_TO_POSTGRES, REJECTED)"),
    island_name: Optional[str] = Query(None, description="Filter nama pulau"),
    urgency_level: Optional[str] = Query(None, description="Filter tingkat urgensi"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    query = select(RawSurvey)

    if problem_domain:
        query = query.where(RawSurvey.problem_domain == problem_domain.upper())
    if etl_status:
        query = query.where(RawSurvey.etl_status == etl_status.upper())
    if island_name:
        query = query.where(RawSurvey.island_name.ilike(f"%{island_name}%"))
    if urgency_level:
        query = query.where(RawSurvey.urgency_level == urgency_level.upper())

    query = query.order_by(RawSurvey.created_at.desc()).offset(offset).limit(limit)
    result = await db.execute(query)
    surveys = result.scalars().all()

    items = []
    for s in surveys:
        items.append(
            SurveyResponse(
                id=s.id,
                survey_code=s.survey_code,
                collector_name=s.collector_name,
                problem_domain=s.problem_domain,
                island_name=s.island_name,
                village_name=s.village_name,
                rt_rw=s.rt_rw,
                latitude=s.latitude,
                longitude=s.longitude,
                gps_point={"lat": s.latitude, "lng": s.longitude},
                title=s.title,
                urgency_level=s.urgency_level,
                flexible_attributes=s.flexible_attributes or {},
                photo_evidence_url=s.photo_evidence_url,
                notes=s.notes,
                etl_status=s.etl_status,
                migrated_feature_id=s.migrated_feature_id,
                created_at=s.created_at,
            )
        )
    return items


@router.get(
    "/mentah/{survey_id}",
    response_model=SurveyResponse,
    summary="Detail dokumen survei lapangan mentah"
)
async def get_raw_survey_detail(
    survey_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    query = select(RawSurvey).where(RawSurvey.id == survey_id)
    result = await db.execute(query)
    survey = result.scalar_one_or_none()

    if not survey:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Survei dengan ID {survey_id} tidak ditemukan"
        )

    return SurveyResponse(
        id=survey.id,
        survey_code=survey.survey_code,
        collector_name=survey.collector_name,
        problem_domain=survey.problem_domain,
        island_name=survey.island_name,
        village_name=survey.village_name,
        rt_rw=survey.rt_rw,
        latitude=survey.latitude,
        longitude=survey.longitude,
        gps_point={"lat": survey.latitude, "lng": survey.longitude},
        title=survey.title,
        urgency_level=survey.urgency_level,
        flexible_attributes=survey.flexible_attributes or {},
        photo_evidence_url=survey.photo_evidence_url,
        notes=survey.notes,
        etl_status=survey.etl_status,
        migrated_feature_id=survey.migrated_feature_id,
        created_at=survey.created_at,
    )


@router.post(
    "/migrasi-etl",
    response_model=ETLRunResult,
    summary="Eksekusi pipa ETL transformasi data survei ke PostGIS (SRS 6.1 / BAB XI)"
)
async def run_etl_pipeline(
    payload: ETLRunRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Mengelompokkan data survei mentah, memvalidasi koordinat, dan mengeksekusi
    migrasi ke tabel relasional terstruktur spatial_features di PostgreSQL/PostGIS (FR-02).
    """
    return await execute_etl_pipeline(db=db, request=payload)


@router.get(
    "/stats",
    response_model=SurveyStatsResponse,
    summary="Ringkasan statistik survei lapangan dan kesiapan ETL"
)
async def get_survey_stats(
    db: AsyncSession = Depends(get_db),
):
    # Total
    total_res = await db.execute(select(func.count(RawSurvey.id)))
    total_surveys = total_res.scalar() or 0

    # Pending
    pending_res = await db.execute(
        select(func.count(RawSurvey.id)).where(RawSurvey.etl_status == "PENDING")
    )
    pending_etl = pending_res.scalar() or 0

    # Migrated
    migrated_res = await db.execute(
        select(func.count(RawSurvey.id)).where(RawSurvey.etl_status == "MIGRATED_TO_POSTGRES")
    )
    migrated_to_postgres = migrated_res.scalar() or 0

    # By domain
    domain_res = await db.execute(
        select(RawSurvey.problem_domain, func.count(RawSurvey.id)).group_by(RawSurvey.problem_domain)
    )
    by_domain = {row[0]: row[1] for row in domain_res.all()}

    # By urgency
    urgency_res = await db.execute(
        select(RawSurvey.urgency_level, func.count(RawSurvey.id)).group_by(RawSurvey.urgency_level)
    )
    by_urgency = {row[0]: row[1] for row in urgency_res.all()}

    # By island
    island_res = await db.execute(
        select(RawSurvey.island_name, func.count(RawSurvey.id)).group_by(RawSurvey.island_name)
    )
    by_island = {row[0]: row[1] for row in island_res.all()}

    return SurveyStatsResponse(
        total_surveys=total_surveys,
        pending_etl=pending_etl,
        migrated_to_postgres=migrated_to_postgres,
        by_domain=by_domain,
        by_urgency=by_urgency,
        by_island=by_island,
    )


@router.post(
    "/seed-sample",
    summary="Menyemai data survei autentik Kepulauan Banda Neira"
)
async def seed_sample_surveys(
    db: AsyncSession = Depends(get_db),
):
    created_count = 0
    for data in SAMPLE_RAW_SURVEYS:
        existing = await db.execute(
            select(RawSurvey).where(RawSurvey.survey_code == data["survey_code"])
        )
        if not existing.scalar_one_or_none():
            survey = RawSurvey(
                id=uuid.uuid4(),
                survey_code=data["survey_code"],
                collector_name=data["collector_name"],
                problem_domain=data["problem_domain"],
                island_name=data["island_name"],
                village_name=data.get("village_name"),
                rt_rw=data.get("rt_rw"),
                latitude=data["latitude"],
                longitude=data["longitude"],
                title=data["title"],
                urgency_level=data["urgency_level"],
                flexible_attributes=data["flexible_attributes"],
                notes=data.get("notes"),
                etl_status="PENDING",
            )
            db.add(survey)
            created_count += 1

    await db.commit()
    return {
        "success": True,
        "message": f"Berhasil menyemai {created_count} survei lapangan autentik.",
        "seeded_count": created_count,
    }
