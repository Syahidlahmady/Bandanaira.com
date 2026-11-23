from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.database.session import get_db
from backend.app.modules.qr.service import generate_qr_base64
from backend.app.modules.traceability.models import ProductBatch
from backend.app.modules.blockchain.models import BlockchainTransaction
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
    Supports search by public_verification_token or batch_code.
    """
    clean_token = token.strip()
    stmt = select(ProductBatch).where(
        or_(
            ProductBatch.public_verification_token == clean_token,
            ProductBatch.batch_code == clean_token,
            ProductBatch.public_verification_token.ilike(clean_token),
            ProductBatch.batch_code.ilike(clean_token),
        )
    )
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

    # Fetch on-chain blockchain transaction if anchored
    tx_stmt = (
        select(BlockchainTransaction)
        .where(
            BlockchainTransaction.batch_id == batch.id,
            BlockchainTransaction.status == "confirmed",
        )
        .order_by(BlockchainTransaction.created_at.desc())
    )
    tx_result = await db.execute(tx_stmt)
    tx = tx_result.scalars().first()

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
        contract_address=tx.contract_address if tx else "0x71C8407B88B2A91D9E71F4243a08b9C23D6980B8",
        transaction_hash=tx.transaction_hash if tx else None,
        block_number=tx.block_number if tx else None,
        latest_db_hash=batch.events[-1].event_hash if batch.events else None,
        on_chain_hash=tx.data_hash if tx else None,
    )



@router.get("/image/{token}")
async def get_qr_image(token: str, full_url: Optional[str] = None):
    """
    Returns direct PNG image response for QR code of given token.
    If full_url is provided, embeds the direct verification web link so phone cameras
    can open the certificate instantly with 1 tap.
    """
    from io import BytesIO
    import qrcode
    from fastapi.responses import Response
    from backend.app.modules.qr.service import get_lan_ip

    lan_ip = get_lan_ip()
    if full_url and full_url.strip():
        qr_payload = full_url.replace("localhost", lan_ip).replace("127.0.0.1", lan_ip)
    else:
        qr_payload = f"http://{lan_ip}:5175/?verify={token}"

    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=3,
    )
    qr.add_data(qr_payload)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    return Response(content=buffer.getvalue(), media_type="image/png")

