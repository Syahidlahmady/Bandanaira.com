from datetime import datetime
from typing import Any, Dict, List, Optional
import uuid
from pydantic import BaseModel, ConfigDict


class AuditUserBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    username: str
    full_name: Optional[str] = None


class AuditLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: Optional[uuid.UUID] = None
    user: Optional[AuditUserBrief] = None
    action: str
    entity_name: str
    entity_id: uuid.UUID
    changes_json: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None
    created_at: datetime


class AuditLogListResponse(BaseModel):
    total: int
    limit: int
    offset: int
    items: List[AuditLogResponse]


class PopulationSummary(BaseModel):
    total_residents: int
    verified_residents: int
    pending_residents: int
    livelihoods_count: Dict[str, int]


class FarmsSummary(BaseModel):
    total_farmers: int
    total_farmer_groups: int
    total_farms: int
    verified_farms: int
    pending_farms: int
    total_area_sqm: float
    total_area_hectares: float


class HarvestsSummary(BaseModel):
    total_harvest_records: int
    total_quantity_kg: float
    commodity_distribution: Dict[str, float]
    grade_distribution: Dict[str, float]


class TraceabilitySummary(BaseModel):
    total_batches: int
    blockchain_anchored_batches: int
    total_trace_events: int


class LettersSummary(BaseModel):
    total_requests: int
    approved_requests: int
    pending_requests: int
    rejected_requests: int


class EcosystemSummaryResponse(BaseModel):
    generated_at: datetime
    village_name: str
    population: PopulationSummary
    farms: FarmsSummary
    harvests: HarvestsSummary
    traceability: TraceabilitySummary
    letters: LettersSummary
    total_audit_events: int
    recent_audit_logs: List[AuditLogResponse]
