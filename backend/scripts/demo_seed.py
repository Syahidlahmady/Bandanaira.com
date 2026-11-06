"""
Banda Digital Ecosystem - Comprehensive Demonstration Seed Script
Populates realistic synthetic data for Desa Banda Neira:
- 5 RBAC Users (admin, village_officer, farmer_group_admin, farmer, resident)
- Farmer Groups & Farmers
- Georeferenced Farms (PostGIS coordinates on Banda Neira island)
- Population Registry (Civil Administration)
- Harvest Records
- Traceability Product Batches & Supply Chain Timeline Events
- Blockchain On-Chain Anchored Transactions
"""

import asyncio
import hashlib
import json
import logging
import uuid
from datetime import date, datetime, timedelta, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.core.config import settings
from backend.app.core.security import hash_password
from backend.app.database.session import AsyncSessionLocal
from backend.app.modules.auth.models import Role, User
from backend.app.modules.blockchain.models import BlockchainTransaction
from backend.app.modules.farmers.models import Farmer, FarmerGroup
from backend.app.modules.farms.models import Farm
from backend.app.modules.harvests.models import Harvest
from backend.app.modules.population.models import AdministrativeRequest, Resident
from backend.app.modules.traceability.models import BatchEvent, BatchHarvest, ProductBatch
from backend.app.modules.traceability.hashing import calculate_event_hash

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("demo_seed")


async def seed_all():
    logger.info("🌿 Memulai seeding data ekosistem Banda Digital...")

    async with AsyncSessionLocal() as session:
        # 1. ROLES & USERS
        logger.info("👤 Memeriksa dan menginisialisasi peran & pengguna...")
        roles_def = [
            ("admin", "Administrator Sistem Desa"),
            ("village_officer", "Petugas Kantor Desa"),
            ("farmer_group_admin", "Ketua Kelompok Tani"),
            ("farmer", "Petani Rempah Terdaftar"),
            ("resident", "Warga Masyarakat Desa"),
        ]

        roles_dict = {}
        for role_name, desc in roles_def:
            res = await session.execute(select(Role).where(Role.name == role_name))
            role = res.scalar_one_or_none()
            if not role:
                role = Role(name=role_name, description=desc)
                session.add(role)
                await session.flush()
            roles_dict[role_name] = role

        users_def = [
            ("admin", "admin@bandaneira.desa.id", "Admin123!", "Ahmad Baadilla, S.STP", ["admin", "village_officer"]),
            ("petugas", "petugas@bandaneira.desa.id", "Petugas123!", "Siti Rahma Marasabessy", ["village_officer"]),
            ("ketua_kelompok", "ketua@bandaneira.desa.id", "Ketua123!", "Daud Walalayo", ["farmer_group_admin", "farmer"]),
            ("petani", "petani@bandaneira.desa.id", "Petani123!", "Usman Alkatiri", ["farmer"]),
            ("warga", "warga@bandaneira.desa.id", "Warga123!", "Nurul Hidayah Baadilla", ["resident"]),
        ]

        users_dict = {}
        for uname, email, pwd, fname, user_roles in users_def:
            res = await session.execute(select(User).where(User.username == uname))
            u = res.scalar_one_or_none()
            if not u:
                u = User(
                    username=uname,
                    email=email,
                    password_hash=hash_password(pwd),
                    full_name=fname,
                    is_active=True,
                    is_superuser=(uname == "admin"),
                )
                for rname in user_roles:
                    u.roles.append(roles_dict[rname])
                session.add(u)
                await session.flush()
            users_dict[uname] = u

        # 2. FARMER GROUPS
        logger.info("🌾 Menginisialisasi Kelompok Tani...")
        groups_def = [
            ("Kelompok Tani Pala Lonthoir Subur", "Daud Walalayo", "Lonthoir", "081234000001"),
            ("Kelompok Tani Rempah Banda Neira Makmur", "Ibrahim Baadilla", "Banda Neira", "081234000002"),
            ("Kelompok Tani Selamon Bersatu", "Hasan Latarissa", "Selamon", "081234000003"),
        ]

        groups_dict = {}
        for gname, leader, vill, contact in groups_def:
            res = await session.execute(select(FarmerGroup).where(FarmerGroup.name == gname))
            grp = res.scalar_one_or_none()
            if not grp:
                grp = FarmerGroup(name=gname, leader_name=leader, village=vill, contact_number=contact)
                session.add(grp)
                await session.flush()
            groups_dict[gname] = grp

        # 3. FARMERS
        logger.info("👨‍🌾 Menginisialisasi Petani...")
        farmers_def = [
            ("BN-FRM-001", "Usman Alkatiri", "081240111222", "Kelompok Tani Pala Lonthoir Subur"),
            ("BN-FRM-002", "Daud Walalayo", "081240111333", "Kelompok Tani Pala Lonthoir Subur"),
            ("BN-FRM-003", "Fatimah Patty", "081240111444", "Kelompok Tani Rempah Banda Neira Makmur"),
            ("BN-FRM-004", "Ali Renuat", "081240111555", "Kelompok Tani Selamon Bersatu"),
        ]

        farmers_dict = {}
        for fcode, fname, phone, gname in farmers_def:
            res = await session.execute(select(Farmer).where(Farmer.farmer_code == fcode))
            frm = res.scalar_one_or_none()
            if not frm:
                frm = Farmer(
                    farmer_code=fcode,
                    name=fname,
                    phone=phone,
                    status="active",
                    farmer_group_id=groups_dict[gname].id,
                )
                session.add(frm)
                await session.flush()
            farmers_dict[fcode] = frm

        # 4. GEOREFERENCED FARMS (PostGIS Polygons and Points)
        logger.info("🗺️ Menginisialisasi Pemetaan Lahan Rempah...")
        farms_def = [
            (
                "BN-FARM-001",
                "Kebun Pala Lonthoir Barat",
                "BN-FRM-001",
                "Desa Lonthoir, lereng barat Banda Besar",
                -4.5321,
                129.8972,
                8500.0,
                "Pala",
            ),
            (
                "BN-FARM-002",
                "Kebun Pala Lereng Gunung Api",
                "BN-FRM-002",
                "Kaki Gunung Api Banda, tanah vulkanis subur",
                -4.5245,
                129.8890,
                12000.0,
                "Pala & Fuli",
            ),
            (
                "BN-FARM-003",
                "Kebun Rempah Warisan Belgica",
                "BN-FRM-003",
                "Sekitar Benteng Belgica, Nusantara",
                -4.5268,
                129.9045,
                6200.0,
                "Fuli",
            ),
            (
                "BN-FARM-004",
                "Kebun Pala Selamon Pesisir",
                "BN-FRM-004",
                "Pesisir timur Banda Besar, Desa Selamon",
                -4.5380,
                129.9120,
                9400.0,
                "Pala",
            ),
        ]

        farms_dict = {}
        for fcode, fname, farmer_code, loc_desc, lat, lon, area, commodity in farms_def:
            res = await session.execute(select(Farm).where(Farm.farm_code == fcode))
            farm = res.scalar_one_or_none()
            if not farm:
                # Approximate 4-corner polygon around center coordinate
                d = 0.0008
                poly_geojson = {
                    "type": "Polygon",
                    "coordinates": [[
                        [lon - d, lat - d],
                        [lon + d, lat - d],
                        [lon + d, lat + d],
                        [lon - d, lat + d],
                        [lon - d, lat - d],
                    ]],
                }
                farm = Farm(
                    farmer_id=farmers_dict[farmer_code].id,
                    farm_code=fcode,
                    name=fname,
                    location_description=loc_desc,
                    latitude=lat,
                    longitude=lon,
                    area_sqm=area,
                    primary_commodity=commodity,
                    verification_status="verified",
                    polygon_boundary_geojson=poly_geojson,
                )
                session.add(farm)
                await session.flush()
            farms_dict[fcode] = farm

        # 5. RESIDENTS (Civil Population Administration)
        logger.info("👥 Menginisialisasi Data Administrasi Kependudukan...")
        residents_def = [
            ("8171010101850001", "Ahmad Baadilla, S.STP", "L", "Banda Neira", date(1985, 1, 1), "Jl. Nusantara No. 1", "001", "001", "Lonthoir", "Aparatur Desa", "verified"),
            ("8171010202880002", "Siti Rahma Marasabessy", "P", "Banda Neira", date(1988, 2, 2), "Jl. Pelabuhan No. 15", "001", "002", "Banda Neira", "Pegawai Negeri Sipil", "verified"),
            ("8171010303790003", "Daud Walalayo", "L", "Lonthoir", date(1979, 3, 3), "Desa Lonthoir Atas", "002", "001", "Lonthoir", "Petani Rempah Pala", "verified"),
            ("8171010404910004", "Usman Alkatiri", "L", "Lonthoir", date(1991, 4, 4), "Desa Lonthoir Bawah", "002", "002", "Lonthoir", "Petani Rempah Pala", "verified"),
            ("8171010505940005", "Nurul Hidayah Baadilla", "P", "Banda Neira", date(1994, 5, 5), "Jl. Benteng Belgica No. 8", "003", "001", "Banda Neira", "Pedagang Olahan Rempah", "verified"),
            ("8171010606900006", "Ali Renuat", "L", "Selamon", date(1990, 6, 6), "Desa Selamon RT 01", "001", "001", "Selamon", "Petani Pala & Nelayan", "verified"),
            ("8171010707820007", "Fatimah Patty", "P", "Banda Neira", date(1982, 7, 7), "Jl. Cengkeh No. 20", "002", "002", "Banda Neira", "Petani & Pengrajin Selai Pala", "verified"),
            ("8171010808980008", "Muhammad Ridwan", "L", "Diera", date(1998, 8, 8), "Dusun Diera No. 5", "001", "001", "Diera", "Penyuluh Pertanian Lapangan", "pending"),
            ("8171010909950009", "Zainab Latarissa", "P", "Selamon", date(1995, 9, 9), "Desa Selamon RT 02", "002", "001", "Selamon", "Pendidik / Guru Sekolah", "verified"),
            ("8171011010870010", "Hasan Basri Baadilla", "L", "Banda Neira", date(1987, 10, 10), "Jl. Syahrir No. 4", "001", "003", "Banda Neira", "Pemandu Wisata Sejarah", "verified"),
            ("8171011111880011", "La Ode Karim", "L", "Banda Neira", date(1988, 11, 11), "Kampung Nelayan Nusantara", "003", "002", "Banda Neira", "Nelayan Tangkap Tradisional", "verified"),
            ("8171011212850012", "Jafar Rumra", "L", "Selamon", date(1985, 12, 12), "Pesisir Selamon RT 03", "003", "001", "Selamon", "Nelayan Pesisir & Pengering Ikan", "verified"),
            ("8171011301930013", "Marni Kelirey", "P", "Lonthoir", date(1993, 1, 13), "Desa Lonthoir Tengah", "001", "002", "Lonthoir", "Pengolah & Pengering Fuli Merah", "verified"),
        ]

        residents_dict = {}
        for nik, name, gender, bplace, bdate, addr, rt, rw, vill, occ, vstat in residents_def:
            res = await session.execute(select(Resident).where(Resident.nik == nik))
            resident = res.scalar_one_or_none()
            if not resident:
                resident = Resident(
                    nik=nik,
                    full_name=name,
                    gender=gender,
                    birth_place=bplace,
                    birth_date=bdate,
                    address=addr,
                    rt=rt,
                    rw=rw,
                    village=vill,
                    occupation=occ,
                    phone_number=f"0812{nik[-8:]}",
                    verification_status=vstat,
                    verified_by=users_dict["admin"].id if vstat == "verified" else None,
                    verified_at=datetime.now(timezone.utc) if vstat == "verified" else None,
                )
                session.add(resident)
                await session.flush()
            residents_dict[nik] = resident

        # 6. HARVESTS
        logger.info("🧺 Menginisialisasi Catatan Panen Rempah...")
        harvests_def = [
            (
                "BN-HRV-2026-001",
                "BN-FARM-001",
                "BN-FRM-001",
                "Pala",
                date.today() - timedelta(days=20),
                350.0,
                "Grade A Super",
                "Panen petik ranum musim raya Lonthoir",
            ),
            (
                "BN-HRV-2026-002",
                "BN-FARM-003",
                "BN-FRM-003",
                "Fuli Merah",
                date.today() - timedelta(days=18),
                120.0,
                "Grade 1 Export",
                "Bunga pala merah cerah utuh",
            ),
            (
                "BN-HRV-2026-003",
                "BN-FARM-002",
                "BN-FRM-002",
                "Pala",
                date.today() - timedelta(days=15),
                280.0,
                "Grade A",
                "Hasil kebun lereng vulkanik Banda",
            ),
        ]

        harvests_dict = {}
        for hcode, fcode, frmcode, comm, hdate, qty, grade, notes in harvests_def:
            res = await session.execute(select(Harvest).where(Harvest.harvest_code == hcode))
            h = res.scalar_one_or_none()
            if not h:
                h = Harvest(
                    harvest_code=hcode,
                    farm_id=farms_dict[fcode].id,
                    farmer_id=farmers_dict[frmcode].id,
                    commodity=comm,
                    harvest_date=hdate,
                    quantity_kg=qty,
                    quality_grade=grade,
                    notes=notes,
                )
                session.add(h)
                await session.flush()
            harvests_dict[hcode] = h

        # 7. PRODUCT BATCHES & SUPPLY CHAIN EVENTS
        logger.info("📦 Menginisialisasi Batch Produk & Rantai Pasok Traceability...")
        batches_def = [
            (
                "BN-BTC-2026-001",
                "Pala Banda Grade A Super",
                350.0,
                date.today() - timedelta(days=19),
                "BN_VERIFY_PALA_SUPER_2026_LONTHOIR",
                [("BN-HRV-2026-001", 350.0)],
            ),
            (
                "BN-BTC-2026-002",
                "Fuli Banda Super Merah",
                120.0,
                date.today() - timedelta(days=17),
                "BN_VERIFY_FULI_MERAH_2026_BELGICA",
                [("BN-HRV-2026-002", 120.0)],
            ),
        ]

        batches_dict = {}
        for bcode, comm, total_qty, pdate, vtoken, allocations in batches_def:
            res = await session.execute(select(ProductBatch).where(ProductBatch.batch_code == bcode))
            batch = res.scalar_one_or_none()
            if not batch:
                batch = ProductBatch(
                    batch_code=bcode,
                    commodity=comm,
                    total_quantity_kg=total_qty,
                    production_date=pdate,
                    public_verification_token=vtoken,
                    status="packaged",
                    blockchain_status="confirmed",
                )
                session.add(batch)
                await session.flush()

                # Allocations
                for hcode, alloc_qty in allocations:
                    bh = BatchHarvest(
                        batch_id=batch.id,
                        harvest_id=harvests_dict[hcode].id,
                        allocated_quantity_kg=alloc_qty,
                    )
                    session.add(bh)
                await session.flush()
            batches_dict[bcode] = batch

        # Add Events to BN-BTC-2026-001
        batch1 = batches_dict["BN-BTC-2026-001"]
        res_events = await session.execute(select(BatchEvent).where(BatchEvent.batch_id == batch1.id))
        existing_events = res_events.scalars().all()

        if not existing_events:
            logger.info("🔗 Menambahkan rantai peristiwa kriptografis untuk BN-BTC-2026-001...")
            events_seq = [
                (
                    "harvest_aggregated",
                    datetime.now(timezone.utc) - timedelta(days=19),
                    "Sentra Pengumpulan Lonthoir",
                    "Penggabungan 350kg biji pala ranum dari petani mitra",
                    None,
                ),
                (
                    "sorting",
                    datetime.now(timezone.utc) - timedelta(days=18),
                    "Unit Sortasi Lonthoir",
                    "Pemisahan tempurung dan sortasi ukuran butir Grade A Super",
                    None,
                ),
                (
                    "drying",
                    datetime.now(timezone.utc) - timedelta(days=12),
                    "Rumah Jemur Surya Lonthoir",
                    "Pengeringan surya terkontrol 6 hari hingga kadar air < 10%",
                    None,
                ),
                (
                    "packaging",
                    datetime.now(timezone.utc) - timedelta(days=5),
                    "Fasilitas Pengemasan Desa Banda Neira",
                    "Pengemasan vakum nitrogen food-grade standar ekspor Eropa",
                    None,
                ),
                (
                    "quality_inspection",
                    datetime.now(timezone.utc) - timedelta(days=2),
                    "Laboratorium Pengujian Rempah Banda",
                    "Sertifikasi lolos uji aflatoksin & penetapan Indikasi Geografis",
                    None,
                ),
            ]

            prev_hash = None
            last_event = None
            for ev_type, ev_time, loc, desc, _ in events_seq:
                meta = {"location": loc, "description": desc}
                ev_hash = calculate_event_hash(
                    batch_id=batch1.id,
                    event_type=ev_type,
                    event_timestamp=ev_time,
                    metadata=meta,
                    previous_event_hash=prev_hash,
                )
                bev = BatchEvent(
                    batch_id=batch1.id,
                    event_type=ev_type,
                    event_timestamp=ev_time,
                    recorded_by_user_id=users_dict["admin"].id,
                    location=loc,
                    description=desc,
                    metadata_json=meta,
                    event_hash=ev_hash,
                    previous_event_hash=prev_hash,
                )
                session.add(bev)
                await session.flush()
                prev_hash = ev_hash
                last_event = bev

            # 8. BLOCKCHAIN ON-CHAIN ANCHOR TRANSACTION
            logger.info("⛓️ Mencatat transaksi jangkar EVM Smart Contract on-chain...")
            tx_res = await session.execute(
                select(BlockchainTransaction).where(BlockchainTransaction.batch_id == batch1.id)
            )
            if not tx_res.scalar_one_or_none():
                raw_tx = hashlib.sha256(f"evm-tx-{batch1.batch_code}".encode()).hexdigest()
                tx_hash = f"0x{raw_tx}"
                contract_addr = getattr(settings, "BLOCKCHAIN_CONTRACT_ADDRESS", "0x5FbDB2315678afecb367f032d93F642f64180aa3")

                chain_tx = BlockchainTransaction(
                    batch_id=batch1.id,
                    event_id=last_event.id if last_event else None,
                    transaction_hash=tx_hash,
                    block_number=18492041,
                    contract_address=contract_addr,
                    data_hash=prev_hash,
                    status="confirmed",
                    submitted_at=datetime.now(timezone.utc) - timedelta(days=2),
                    confirmed_at=datetime.now(timezone.utc) - timedelta(days=2),
                )
                session.add(chain_tx)
                await session.flush()

        await session.commit()
        logger.info("✅ Seeding ekosistem Banda Digital selesai dengan sukses!")


if __name__ == "__main__":
    asyncio.run(seed_all())
