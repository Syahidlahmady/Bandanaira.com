"""
Seeder Data Geospasial PostGIS 7-Layer & Rute Maritim Banda Neira
Memuat 37 objek spasial autentik kepulauan Banda:
- Destinasi Wisata Bahari & Cagar Budaya 4A
- Infrastruktur Air Bersih (Embung, Sumur Komunal, Sumur Pusaka)
- Pos Keamanan, Dermaga Laut & Hub Penyeberangan Speedboat Antar-Pulau
- Rute Maritim Jalur Penyeberangan Speedboat (LineString & Waypoints)
- Titik Resiliensi & Energi
"""

import asyncio
import json
import logging
import os
from pathlib import Path
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.database.session import AsyncSessionLocal
from backend.app.modules.gis.models import SpatialFeature

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("seed_spatial_features")

SEED_JSON_PATH = Path(__file__).resolve().parent.parent / "app" / "seeds" / "gis_spatial_features.json"


async def seed_spatial_features(session: AsyncSession) -> int:
    """Fungsi pembantu seeding objek spasial yang dapat dipanggil dari script lain."""
    if not os.path.exists(SEED_JSON_PATH):
        logger.error(f"Berkas seed tidak ditemukan: {SEED_JSON_PATH}")
        return 0

    with open(SEED_JSON_PATH, "r", encoding="utf-8") as f:
        features_data = json.load(f)

    logger.info(f"Memuat {len(features_data)} objek spasial dari {SEED_JSON_PATH.name}...")

    inserted_count = 0
    updated_count = 0

    for item in features_data:
        name = item["name"]
        layer_type = item["layer_type"]

        stmt = select(SpatialFeature).where(
            SpatialFeature.name == name,
            SpatialFeature.layer_type == layer_type,
        )
        existing = (await session.execute(stmt)).scalar_one_or_none()

        if existing:
            existing.category = item.get("category", "publik")
            existing.island_name = item.get("island_name", "Pulau Neira")
            existing.latitude = item["latitude"]
            existing.longitude = item["longitude"]
            existing.geometry_geojson = item.get("geometry_geojson")
            existing.properties_meta = item.get("properties_meta", {})
            existing.description = item.get("description", "")
            existing.is_active = True
            updated_count += 1
        else:
            new_feat = SpatialFeature(
                name=name,
                layer_type=layer_type,
                category=item.get("category", "publik"),
                island_name=item.get("island_name", "Pulau Neira"),
                latitude=item["latitude"],
                longitude=item["longitude"],
                geometry_geojson=item.get("geometry_geojson"),
                properties_meta=item.get("properties_meta", {}),
                description=item.get("description", ""),
                is_active=True,
            )
            session.add(new_feat)
            inserted_count += 1

    await session.commit()
    logger.info(f"Selesai! {inserted_count} baru ditambahkan, {updated_count} diperbarui.")
    return inserted_count + updated_count


async def main():
    logger.info("Memulai seeding objek spasial PostGIS Banda...")
    async with AsyncSessionLocal() as session:
        total = await seed_spatial_features(session)
        logger.info(f"Total {total} objek spasial terkalibrasi berhasil disinkronkan ke basis data.")


if __name__ == "__main__":
    asyncio.run(main())
