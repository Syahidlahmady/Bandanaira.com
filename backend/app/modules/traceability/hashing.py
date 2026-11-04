from datetime import datetime
import hashlib
import json
from typing import Any, Dict, Optional
import uuid


def calculate_event_hash(
    batch_id: uuid.UUID,
    event_type: str,
    event_timestamp: datetime,
    metadata: Optional[Dict[str, Any]] = None,
    previous_event_hash: Optional[str] = None,
) -> str:
    """
    Computes a deterministic canonical SHA-256 hash of a batch event.
    Guarantees consistent hashing of keys and formatting.
    """
    canonical_dict = {
        "batch_id": str(batch_id),
        "event_type": event_type,
        "event_timestamp": event_timestamp.isoformat(),
        "metadata": metadata or {},
        "previous_event_hash": previous_event_hash or "",
    }
    # Deterministic JSON representation (sorted keys, compact separators)
    canonical_bytes = json.dumps(
        canonical_dict, sort_keys=True, separators=(",", ":")
    ).encode("utf-8")

    return hashlib.sha256(canonical_bytes).hexdigest()
