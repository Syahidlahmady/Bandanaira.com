from typing import Any, Dict, Optional
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.modules.audit.models import AuditLog


async def log_audit_event(
    db: AsyncSession,
    action: str,
    entity_name: str,
    entity_id: uuid.UUID,
    user_id: Optional[uuid.UUID] = None,
    changes: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = None,
) -> AuditLog:
    log_entry = AuditLog(
        user_id=user_id,
        action=action,
        entity_name=entity_name,
        entity_id=entity_id,
        changes_json=changes,
        ip_address=ip_address,
    )
    db.add(log_entry)
    await db.flush()
    return log_entry
