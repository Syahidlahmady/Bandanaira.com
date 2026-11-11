from datetime import datetime, timezone
from typing import Dict, List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.permissions import (
    ROLE_ADMIN,
    ROLE_FARMER_GROUP_ADMIN,
    ROLE_VILLAGE_OFFICER,
    require_roles,
)
from backend.app.database.session import get_db
from backend.app.modules.audit.models import AuditLog
from backend.app.modules.audit.schemas import (
    AuditLogListResponse,
    AuditLogResponse,
    EcosystemSummaryResponse,
    FarmsSummary,
    HarvestsSummary,
    LettersSummary,
    PopulationSummary,
    TraceabilitySummary,
)
from backend.app.modules.auth.models import User
from backend.app.modules.farmers.models import Farmer, FarmerGroup
from backend.app.modules.farms.models import Farm
from backend.app.modules.harvests.models import Harvest
from backend.app.modules.population.models import AdministrativeRequest, Resident
from backend.app.modules.traceability.models import BatchEvent, ProductBatch

router = APIRouter(prefix="/audit", tags=["Centralized Audit & Ecosystem Recap"])


@router.get("/logs", response_model=AuditLogListResponse)
async def list_audit_logs(
    entity_name: Optional[str] = Query(None, description="Filter by entity e.g. resident, farm, harvest, batch, request, blockchain"),
    action: Optional[str] = Query(None, description="Filter by action name or keyword"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([ROLE_ADMIN, ROLE_VILLAGE_OFFICER])),
):
    """
    Mengambil riwayat log audit aktivitas ekosistem desa dengan filter entitas dan aksi.
    Hanya dapat diakses oleh Administrator Desa dan Petugas Kantor Desa.
    """
    stmt = select(AuditLog)
    if entity_name:
        entity_clean = entity_name.strip().rstrip("s")
        stmt = stmt.where(
            or_(
                AuditLog.entity_name == entity_name,
                AuditLog.entity_name.ilike(f"%{entity_clean}%"),
            )
        )
    if action:
        stmt = stmt.where(AuditLog.action.ilike(f"%{action}%"))

    # Total count query
    count_stmt = select(func.count()).select_from(stmt.subquery())
    total_res = await db.execute(count_stmt)
    total = total_res.scalar_one()

    # Paginated results ordered by creation time descending
    stmt = stmt.order_by(AuditLog.created_at.desc()).limit(limit).offset(offset)
    result = await db.execute(stmt)
    logs = result.scalars().all()

    return AuditLogListResponse(
        total=total,
        limit=limit,
        offset=offset,
        items=logs,
    )


@router.get("/ecosystem-summary", response_model=EcosystemSummaryResponse)
async def get_ecosystem_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([ROLE_ADMIN, ROLE_VILLAGE_OFFICER, ROLE_FARMER_GROUP_ADMIN])),
):
    """
    Menghasilkan rekapitulasi data agregat seluruh pilar Ekosistem Digital Banda Neira:
    kependudukan, peta perkebunan, catatan panen rempah, rantai pasok blockchain,
    pelayanan surat warga, serta jejak audit terkini.
    """
    # 1. Population Statistics
    res_total = (await db.execute(select(func.count(Resident.id)))).scalar_one() or 0
    res_verified = (
        await db.execute(select(func.count(Resident.id)).where(Resident.verification_status == "verified"))
    ).scalar_one() or 0
    res_pending = (
        await db.execute(select(func.count(Resident.id)).where(Resident.verification_status == "pending"))
    ).scalar_one() or 0

    occ_rows = (
        await db.execute(
            select(Resident.occupation, func.count(Resident.id))
            .group_by(Resident.occupation)
        )
    ).all()
    livelihoods_count: Dict[str, int] = {row[0] or "Lainnya": row[1] for row in occ_rows}

    # 2. Farmers & Farmland Statistics
    farmers_total = (await db.execute(select(func.count(Farmer.id)))).scalar_one() or 0
    groups_total = (await db.execute(select(func.count(FarmerGroup.id)))).scalar_one() or 0
    farms_total = (await db.execute(select(func.count(Farm.id)))).scalar_one() or 0
    farms_verified = (
        await db.execute(select(func.count(Farm.id)).where(Farm.verification_status == "verified"))
    ).scalar_one() or 0
    farms_pending = (
        await db.execute(select(func.count(Farm.id)).where(Farm.verification_status == "pending"))
    ).scalar_one() or 0

    area_sum_raw = (await db.execute(select(func.sum(Farm.area_sqm)))).scalar_one()
    total_area_sqm = float(area_sum_raw or 0.0)
    total_area_hectares = round(total_area_sqm / 10000.0, 3)

    # 3. Harvest Statistics
    harvest_records_total = (await db.execute(select(func.count(Harvest.id)))).scalar_one() or 0
    qty_sum_raw = (await db.execute(select(func.sum(Harvest.quantity_kg)))).scalar_one()
    total_qty_kg = float(qty_sum_raw or 0.0)

    comm_rows = (
        await db.execute(
            select(Harvest.commodity, func.sum(Harvest.quantity_kg))
            .group_by(Harvest.commodity)
        )
    ).all()
    commodity_dist: Dict[str, float] = {row[0]: float(row[1] or 0.0) for row in comm_rows}

    grade_rows = (
        await db.execute(
            select(Harvest.quality_grade, func.sum(Harvest.quantity_kg))
            .group_by(Harvest.quality_grade)
        )
    ).all()
    grade_dist: Dict[str, float] = {row[0] or "Belum Tergrade": float(row[1] or 0.0) for row in grade_rows}

    # 4. Traceability & Blockchain Statistics
    batches_total = (await db.execute(select(func.count(ProductBatch.id)))).scalar_one() or 0
    batches_anchored = (
        await db.execute(
            select(func.count(ProductBatch.id)).where(ProductBatch.blockchain_status == "confirmed")
        )
    ).scalar_one() or 0
    events_total = (await db.execute(select(func.count(BatchEvent.id)))).scalar_one() or 0

    # 5. Administrative Letters Statistics
    requests_total = (await db.execute(select(func.count(AdministrativeRequest.id)))).scalar_one() or 0
    requests_approved = (
        await db.execute(
            select(func.count(AdministrativeRequest.id)).where(AdministrativeRequest.status == "approved")
        )
    ).scalar_one() or 0
    requests_pending = (
        await db.execute(
            select(func.count(AdministrativeRequest.id)).where(AdministrativeRequest.status == "pending")
        )
    ).scalar_one() or 0
    requests_rejected = (
        await db.execute(
            select(func.count(AdministrativeRequest.id)).where(AdministrativeRequest.status == "rejected")
        )
    ).scalar_one() or 0

    # 6. Audit Trail Health & Recent Logs
    audit_total = (await db.execute(select(func.count(AuditLog.id)))).scalar_one() or 0
    recent_logs = (
        await db.execute(
            select(AuditLog).order_by(AuditLog.created_at.desc()).limit(10)
        )
    ).scalars().all()

    return EcosystemSummaryResponse(
        generated_at=datetime.now(timezone.utc),
        village_name="Desa Banda Neira",
        population=PopulationSummary(
            total_residents=res_total,
            verified_residents=res_verified,
            pending_residents=res_pending,
            livelihoods_count=livelihoods_count,
        ),
        farms=FarmsSummary(
            total_farmers=farmers_total,
            total_farmer_groups=groups_total,
            total_farms=farms_total,
            verified_farms=farms_verified,
            pending_farms=farms_pending,
            total_area_sqm=total_area_sqm,
            total_area_hectares=total_area_hectares,
        ),
        harvests=HarvestsSummary(
            total_harvest_records=harvest_records_total,
            total_quantity_kg=total_qty_kg,
            commodity_distribution=commodity_dist,
            grade_distribution=grade_dist,
        ),
        traceability=TraceabilitySummary(
            total_batches=batches_total,
            blockchain_anchored_batches=batches_anchored,
            total_trace_events=events_total,
        ),
        letters=LettersSummary(
            total_requests=requests_total,
            approved_requests=requests_approved,
            pending_requests=requests_pending,
            rejected_requests=requests_rejected,
        ),
        total_audit_events=audit_total,
        recent_audit_logs=recent_logs,
    )
