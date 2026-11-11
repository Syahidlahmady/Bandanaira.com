from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.database.session import get_db
from backend.app.modules.qr.service import generate_qr_base64
from backend.app.modules.traceability.models import ProductBatch
from backend.app.modules.traceability.schemas import (
    PublicBatchVerificationResponse,
    PublicEventTimeline,
)

router = APIRouter(prefix="/public/verify", tags=["Public QR Verification"])


@router.get("/{token}", response_model=PublicBatchVerificationResponse)
async def verify_batch_public(token: str, db: AsyncSession = Depends(get_db)):
    """
    Public QR Verification Endpoint (Zero Authentication Required).
    Safe for public consumers. Exposes NO personal identifiable information.
    """
    stmt = select(ProductBatch).where(ProductBatch.public_verification_token == token)
    result = await db.execute(stmt)
    batch = result.scalar_one_or_none()

    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Kode QR atau token verifikasi tidak valid / tidak ditemukan.",
        )

    # Origin farm names (without personal identity)
    origin_farms = list(
        {bh.harvest.farm.name for bh in batch.batch_harvests if bh.harvest and bh.harvest.farm}
    )

    # Timeline of events
    timeline = [
        PublicEventTimeline(
            event_type=e.event_type,
            event_timestamp=e.event_timestamp,
            location=e.location,
            description=e.description,
            event_hash=e.event_hash,
        )
        for e in batch.events
    ]

    qr_base64 = generate_qr_base64(batch.public_verification_token)

    return PublicBatchVerificationResponse(
        batch_code=batch.batch_code,
        commodity=batch.commodity,
        total_quantity_kg=batch.total_quantity_kg,
        production_date=batch.production_date,
        origin_village="Desa Banda Neira, Maluku",
        origin_farms=origin_farms or ["Perkebunan Rempah Banda Neira"],
        status=batch.status,
        blockchain_status=batch.blockchain_status,
        verified_integrity=len(batch.events) > 0,
        timeline=timeline,
        qr_code_base64=qr_base64,
    )


@router.get("/image/{token}")
async def get_qr_image(token: str):
    """
    Returns direct PNG image response for QR code of given token.
    Publicly accessible, high performance, can be directly used in <img src="..." />.
    """
    from io import BytesIO
    import qrcode
    from fastapi.responses import Response

    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=3,
    )
    qr.add_data(token)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    return Response(content=buffer.getvalue(), media_type="image/png")

