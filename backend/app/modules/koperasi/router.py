import hashlib
import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.database.session import get_db
from backend.app.modules.population.models import Resident
from backend.app.modules.koperasi.models import CoopAccount, CoopTransaction
from backend.app.modules.koperasi.pricing import (
    COMMODITY_PRICES_RP,
    COMMODITY_DISPLAY_NAMES,
    WASTE_RATES,
    WATER_LITER_VALUE_RP,
)
from backend.app.modules.koperasi.schemas import (
    CommodityDepositInput,
    WasteDepositInput,
    WaterRedemptionInput,
    WaterRedemptionResponse,
    CitizenCoopProfileResponse,
    CoopTransactionItem,
    CoopEcosystemRecap,
)

router = APIRouter(prefix="/koperasi", tags=["Koperasi Hatta & Bank Sampah"])


async def get_or_create_coop_account(db: AsyncSession, resident: Resident) -> CoopAccount:
    """Mengambil atau menginisialisasi akun koperasi warga jika belum ada."""
    stmt = select(CoopAccount).where(CoopAccount.resident_id == resident.id)
    result = await db.execute(stmt)
    account = result.scalar_one_or_none()

    if account is None:
        account = CoopAccount(
            resident_id=resident.id,
            coop_balance_rp=0.0,
            plastic_points=0,
            clean_water_quota_ltr=20.0,  # Kuota awal gratis 20 liter untuk setiap warga desa
            total_commodities_kg=0.0,
            total_plastic_recycled_kg=0.0,
        )
        db.add(account)
        await db.flush()
    return account


def generate_receipt_hash(trx_code: str, nik: str, trx_type: str, qty: float, val: float, dt_iso: str) -> str:
    """Membuat SHA-256 hash transaksi deterministik untuk buku besar Koperasi Hatta."""
    payload = f"{trx_code}:{nik}:{trx_type}:{qty:.2f}:{val:.2f}:{dt_iso}"
    return "0x" + hashlib.sha256(payload.encode("utf-8")).hexdigest()


@router.post(
    "/transaksi/setor-komoditas",
    response_model=CoopTransactionItem,
    status_code=status.HTTP_201_CREATED,
    summary="Kasir Timbangan: Setor Hasil Bumi / Perikanan (Pala, Fuli, Ikan)",
)
async def setor_komoditas(
    payload: CommodityDepositInput,
    db: AsyncSession = Depends(get_db),
):
    """
    Mencatat transaksi setoran komoditas petani atau nelayan.
    Mengonversi berat timbangan menjadi Saldo Tabungan Koperasi (Rp) atau Kuota Air Bersih (Liter).
    """
    # 1. Cari data kependudukan warga via NIK
    stmt = select(Resident).where(Resident.nik == payload.nik)
    res = await db.execute(stmt)
    resident = res.scalar_one_or_none()
    if not resident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Warga dengan NIK {payload.nik} tidak ditemukan dalam basis data desa.",
        )

    # 2. Validasi komoditas & tarif
    c_type = payload.commodity_type.lower()
    if c_type not in COMMODITY_PRICES_RP:
        valid_types = ", ".join(COMMODITY_PRICES_RP.keys())
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Jenis komoditas '{payload.commodity_type}' tidak dikenali. Pilihan: {valid_types}",
        )

    unit_price = COMMODITY_PRICES_RP[c_type]
    item_display = COMMODITY_DISPLAY_NAMES.get(c_type, payload.commodity_type)
    total_val_rp = payload.weight_kg * unit_price

    # 3. Ambil/Buat Akun Koperasi
    account = await get_or_create_coop_account(db, resident)

    # 4. Alokasikan ke Saldo atau Kuota Air
    water_impact = 0.0
    if payload.destination.upper() == "WATER_QUOTA":
        water_impact = round(total_val_rp / WATER_LITER_VALUE_RP, 1)
        account.clean_water_quota_ltr += water_impact
    else:
        account.coop_balance_rp += total_val_rp

    account.total_commodities_kg += payload.weight_kg

    # 5. Catat Transaksi Buku Besar
    trx_code = f"TRX-KOM-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:4].upper()}"
    now_iso = datetime.now(timezone.utc).isoformat()
    receipt_hash = generate_receipt_hash(trx_code, payload.nik, "DEPOSIT_COMMODITY", payload.weight_kg, total_val_rp, now_iso)

    trx = CoopTransaction(
        account_id=account.id,
        resident_id=resident.id,
        transaction_code=trx_code,
        transaction_type="DEPOSIT_COMMODITY",
        item_name=item_display,
        weight_or_volume=payload.weight_kg,
        unit_price_rp=unit_price,
        monetary_value_rp=total_val_rp,
        water_quota_impact_ltr=water_impact,
        destination=payload.destination.upper(),
        receipt_hash=receipt_hash,
        notes=payload.notes,
    )
    db.add(trx)
    await db.commit()
    await db.refresh(trx)

    return CoopTransactionItem(
        id=str(trx.id),
        transaction_code=trx.transaction_code,
        transaction_type=trx.transaction_type,
        item_name=trx.item_name,
        weight_or_volume=float(trx.weight_or_volume),
        unit_price_rp=float(trx.unit_price_rp),
        monetary_value_rp=float(trx.monetary_value_rp),
        water_quota_impact_ltr=float(trx.water_quota_impact_ltr),
        destination=trx.destination,
        receipt_hash=trx.receipt_hash,
        notes=trx.notes,
        created_at=trx.created_at,
    )


@router.post(
    "/transaksi/setor-sampah",
    response_model=CoopTransactionItem,
    status_code=status.HTTP_201_CREATED,
    summary="Bank Sampah Plastik: Tukar Sampah Jadi Kuota Air Bersih / Saldo",
)
async def setor_sampah(
    payload: WasteDepositInput,
    db: AsyncSession = Depends(get_db),
):
    """
    Mencatat setoran sampah plastik (botol PET, galon HDPE, kardus) oleh warga desa.
    Mengonversi sampah menjadi Kuota Air Bersih (Liter) atau Saldo Tabungan (Rp) serta Poin Lingkungan.
    """
    stmt = select(Resident).where(Resident.nik == payload.nik)
    res = await db.execute(stmt)
    resident = res.scalar_one_or_none()
    if not resident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Warga dengan NIK {payload.nik} tidak ditemukan dalam basis data desa.",
        )

    w_type = payload.waste_type.lower()
    if w_type not in WASTE_RATES:
        valid_types = ", ".join(WASTE_RATES.keys())
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Jenis sampah '{payload.waste_type}' tidak valid. Pilihan: {valid_types}",
        )

    rate_info = WASTE_RATES[w_type]
    price_per_kg = rate_info["price_per_kg"]
    liters_per_kg = rate_info["water_liters_per_kg"]
    display_name = rate_info["display_name"]

    account = await get_or_create_coop_account(db, resident)

    monetary_val = payload.weight_kg * price_per_kg
    water_impact = 0.0

    if payload.destination.upper() == "WATER_QUOTA":
        water_impact = round(payload.weight_kg * liters_per_kg, 1)
        account.clean_water_quota_ltr += water_impact
    else:
        account.coop_balance_rp += monetary_val

    # Tambah poin lingkungan
    earned_points = int(payload.weight_kg * 10)
    account.plastic_points += earned_points
    account.total_plastic_recycled_kg += payload.weight_kg

    trx_code = f"TRX-SMP-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:4].upper()}"
    now_iso = datetime.now(timezone.utc).isoformat()
    receipt_hash = generate_receipt_hash(trx_code, payload.nik, "DEPOSIT_WASTE", payload.weight_kg, monetary_val, now_iso)

    trx = CoopTransaction(
        account_id=account.id,
        resident_id=resident.id,
        transaction_code=trx_code,
        transaction_type="DEPOSIT_WASTE",
        item_name=display_name,
        weight_or_volume=payload.weight_kg,
        unit_price_rp=price_per_kg,
        monetary_value_rp=monetary_val,
        water_quota_impact_ltr=water_impact,
        destination=payload.destination.upper(),
        receipt_hash=receipt_hash,
        notes=payload.notes,
    )
    db.add(trx)
    await db.commit()
    await db.refresh(trx)

    return CoopTransactionItem(
        id=str(trx.id),
        transaction_code=trx.transaction_code,
        transaction_type=trx.transaction_type,
        item_name=trx.item_name,
        weight_or_volume=float(trx.weight_or_volume),
        unit_price_rp=float(trx.unit_price_rp),
        monetary_value_rp=float(trx.monetary_value_rp),
        water_quota_impact_ltr=float(trx.water_quota_impact_ltr),
        destination=trx.destination,
        receipt_hash=trx.receipt_hash,
        notes=trx.notes,
        created_at=trx.created_at,
    )


@router.post(
    "/tebus-air",
    response_model=WaterRedemptionResponse,
    status_code=status.HTTP_200_OK,
    summary="Dispenser Air Bersih Konsumsi (Potong Kuota NIK & Buka Solenoid Valve)",
)
async def tebus_air_bersih(
    payload: WaterRedemptionInput,
    db: AsyncSession = Depends(get_db),
):
    """
    Warga menebus air minum bersih di stasiun pengolahan BWRO/SWRO desa.
    Memeriksa dan memotong kuota air NIK, lalu menghasilkan sinyal elektrik pembukaan Solenoid Valve.
    """
    stmt = select(Resident).where(Resident.nik == payload.nik)
    res = await db.execute(stmt)
    resident = res.scalar_one_or_none()
    if not resident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Warga dengan NIK {payload.nik} tidak terdaftar.",
        )

    account = await get_or_create_coop_account(db, resident)

    if account.clean_water_quota_ltr < payload.liters_requested:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Kuota air bersih NIK {payload.nik} tidak mencukupi. "
                f"Sisa kuota: {account.clean_water_quota_ltr:.1f} Liter, "
                f"Permintaan: {payload.liters_requested:.1f} Liter. "
                f"Silakan setor sampah plastik atau komoditas ke Koperasi Hatta untuk menambah kuota."
            ),
        )

    # Potong kuota air
    account.clean_water_quota_ltr -= payload.liters_requested

    # Estimasi durasi pembukaan keran Solenoid Valve (rata-rata 3 detik per liter)
    dispense_sec = int(payload.liters_requested * 3)

    trx_code = f"TRX-AIR-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:4].upper()}"
    now_iso = datetime.now(timezone.utc).isoformat()
    monetary_equiv = payload.liters_requested * WATER_LITER_VALUE_RP
    receipt_hash = generate_receipt_hash(trx_code, payload.nik, "REDEEM_WATER", payload.liters_requested, monetary_equiv, now_iso)

    trx = CoopTransaction(
        account_id=account.id,
        resident_id=resident.id,
        transaction_code=trx_code,
        transaction_type="REDEEM_WATER",
        item_name=f"Tebus Air Bersih RO ({payload.liters_requested:.1f} Liter)",
        weight_or_volume=payload.liters_requested,
        unit_price_rp=WATER_LITER_VALUE_RP,
        monetary_value_rp=monetary_equiv,
        water_quota_impact_ltr=-payload.liters_requested,
        destination="WATER_DISPENSER",
        receipt_hash=receipt_hash,
        station_code=payload.station_code,
        notes=f"Dispenser aktif selama {dispense_sec} detik pada stasiun {payload.station_code}",
    )
    db.add(trx)
    await db.commit()

    return WaterRedemptionResponse(
        transaction_code=trx_code,
        liters_dispensed=payload.liters_requested,
        remaining_quota_ltr=round(account.clean_water_quota_ltr, 1),
        valve_status="OPEN",
        dispense_duration_sec=dispense_sec,
        station_code=payload.station_code or "RO-STATION-LONTHOIR-01",
        receipt_hash=receipt_hash,
        message=f"Solenoid valve aktif membuka. Silakan letakkan wadah/galon. Air mengalir {payload.liters_requested:.1f} Liter.",
    )


@router.get(
    "/warga/{nik}/profil",
    response_model=CitizenCoopProfileResponse,
    summary="Profil Mandiri Warga: Saldo Koperasi, Poin Sampah & Kuota Air Bersih",
)
async def get_citizen_coop_profile(
    nik: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Mengambil ringkasan saldo, poin bank sampah, dan kuota air minum bersih berdasarkan 16 digit NIK.
    Digunakan oleh Kiosk Desa, Portal Warga, dan Kasir Koperasi Hatta.
    """
    stmt = select(Resident).where(Resident.nik == nik)
    res = await db.execute(stmt)
    resident = res.scalar_one_or_none()
    if not resident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Warga dengan NIK {nik} tidak ditemukan.",
        )

    account = await get_or_create_coop_account(db, resident)

    # Ambil 10 transaksi terakhir
    stmt_trx = (
        select(CoopTransaction)
        .where(CoopTransaction.account_id == account.id)
        .order_by(desc(CoopTransaction.created_at))
        .limit(10)
    )
    trx_res = await db.execute(stmt_trx)
    transactions = trx_res.scalars().all()

    trx_items = [
        CoopTransactionItem(
            id=str(t.id),
            transaction_code=t.transaction_code,
            transaction_type=t.transaction_type,
            item_name=t.item_name,
            weight_or_volume=float(t.weight_or_volume),
            unit_price_rp=float(t.unit_price_rp),
            monetary_value_rp=float(t.monetary_value_rp),
            water_quota_impact_ltr=float(t.water_quota_impact_ltr),
            destination=t.destination,
            receipt_hash=t.receipt_hash,
            station_code=t.station_code,
            notes=t.notes,
            created_at=t.created_at,
        )
        for t in transactions
    ]

    return CitizenCoopProfileResponse(
        nik=resident.nik,
        full_name=resident.full_name,
        village=resident.village,
        occupation=resident.occupation,
        coop_balance_rp=float(account.coop_balance_rp),
        plastic_points=account.plastic_points,
        clean_water_quota_ltr=round(account.clean_water_quota_ltr, 1),
        total_commodities_kg=round(account.total_commodities_kg, 2),
        total_plastic_recycled_kg=round(account.total_plastic_recycled_kg, 2),
        recent_transactions=trx_items,
    )


@router.get(
    "/transaksi",
    response_model=List[CoopTransactionItem],
    summary="Daftar Log Transaksi Koperasi & Bank Sampah",
)
async def list_coop_transactions(
    nik: Optional[str] = Query(None, description="Filter NIK tertentu"),
    trx_type: Optional[str] = Query(None, description="DEPOSIT_COMMODITY, DEPOSIT_WASTE, REDEEM_WATER"),
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
):
    """Mengambil riwayat transaksi koperasi dengan opsi filter."""
    query = select(CoopTransaction).order_by(desc(CoopTransaction.created_at)).limit(limit)

    if nik:
        stmt_res = select(Resident.id).where(Resident.nik == nik)
        res = await db.execute(stmt_res)
        res_id = res.scalar_one_or_none()
        if res_id:
            query = query.where(CoopTransaction.resident_id == res_id)
        else:
            return []

    if trx_type:
        query = query.where(CoopTransaction.transaction_type == trx_type)

    result = await db.execute(query)
    trxs = result.scalars().all()

    return [
        CoopTransactionItem(
            id=str(t.id),
            transaction_code=t.transaction_code,
            transaction_type=t.transaction_type,
            item_name=t.item_name,
            weight_or_volume=float(t.weight_or_volume),
            unit_price_rp=float(t.unit_price_rp),
            monetary_value_rp=float(t.monetary_value_rp),
            water_quota_impact_ltr=float(t.water_quota_impact_ltr),
            destination=t.destination,
            receipt_hash=t.receipt_hash,
            station_code=t.station_code,
            notes=t.notes,
            created_at=t.created_at,
        )
        for t in trxs
    ]


@router.get(
    "/rekapitulasi",
    response_model=CoopEcosystemRecap,
    summary="Statistik Ekosistem Koperasi Hatta & Bank Sampah",
)
async def get_coop_recap(
    db: AsyncSession = Depends(get_db),
):
    """Menampilkan metrik agregat perputaran ekonomi koperasi, daur ulang plastik, dan distribusi air RO."""
    stmt_accounts = select(
        func.count(CoopAccount.id),
        func.coalesce(func.sum(CoopAccount.coop_balance_rp), 0.0),
        func.coalesce(func.sum(CoopAccount.clean_water_quota_ltr), 0.0),
        func.coalesce(func.sum(CoopAccount.total_commodities_kg), 0.0),
        func.coalesce(func.sum(CoopAccount.total_plastic_recycled_kg), 0.0),
    )
    res_acc = await db.execute(stmt_accounts)
    row = res_acc.one()

    stmt_trxs = select(func.count(CoopTransaction.id))
    res_trxs = await db.execute(stmt_trxs)
    trx_count = res_trxs.scalar() or 0

    return CoopEcosystemRecap(
        total_active_accounts=row[0] or 0,
        total_coop_balance_rp=float(row[1] or 0.0),
        total_clean_water_quota_ltr=round(float(row[2] or 0.0), 1),
        total_commodities_recap_kg=round(float(row[3] or 0.0), 2),
        total_plastic_recycled_kg=round(float(row[4] or 0.0), 2),
        total_transactions_count=trx_count,
    )
