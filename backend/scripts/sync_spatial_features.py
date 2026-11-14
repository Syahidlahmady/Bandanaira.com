"""
Banda Digital Ecosystem - Spatial Features Synchronization Script
Synchronizes the 7-Layer spatial features from curated_layers.py into PostgreSQL PostGIS.
- Removes duplicates
- Upserts coordinates, layer_types, islands, descriptions, and metadata
- Ensures all developers have the exact same 42 high-precision spatial points
"""

import asyncio
import logging
from sqlalchemy import func, select, delete
from backend.app.database.session import AsyncSessionLocal
from backend.app.modules.gis.curated_layers import INITIAL_SPATIAL_FEATURES
from backend.app.modules.gis.models import SpatialFeature

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("sync_spatial_features")


async def sync_spatial_features():
    logger.info(f"Memulai sinkronisasi {len(INITIAL_SPATIAL_FEATURES)} titik spasial ke PostGIS...")

    async with AsyncSessionLocal() as session:
        # 1. Fetch all existing features
        stmt = select(SpatialFeature)
        res = await session.execute(stmt)
        existing_features = res.scalars().all()

        # Group by name to identify duplicates
        by_name = {}
        for feat in existing_features:
            if feat.name not in by_name:
                by_name[feat.name] = []
            by_name[feat.name].append(feat)

        # Remove duplicate records (keep the most recently updated one)
        duplicates_removed = 0
        for name, feats in by_name.items():
            if len(feats) > 1:
                # Sort so newest is first
                feats.sort(key=lambda x: x.updated_at or x.created_at, reverse=True)
                for dup in feats[1:]:
                    await session.delete(dup)
                    duplicates_removed += 1
                by_name[name] = [feats[0]]

        if duplicates_removed > 0:
            logger.info(f"Berhasil membersihkan {duplicates_removed} duplikasi titik lama.")
            await session.commit()

        # 2. Upsert each curated feature
        inserted = 0
        updated = 0
        for item in INITIAL_SPATIAL_FEATURES:
            name = item["name"]
            existing_list = by_name.get(name)

            if existing_list and len(existing_list) > 0:
                # Update existing
                feat = existing_list[0]
                feat.layer_type = item["layer_type"]
                feat.category = item["category"]
                feat.island_name = item["island_name"]
                feat.latitude = item["latitude"]
                feat.longitude = item["longitude"]
                feat.description = item.get("description")
                feat.properties_meta = item.get("properties_meta")
                feat.is_active = True
                updated += 1
            else:
                # Insert new
                new_feat = SpatialFeature(
                    name=item["name"],
                    layer_type=item["layer_type"],
                    category=item["category"],
                    island_name=item["island_name"],
                    latitude=item["latitude"],
                    longitude=item["longitude"],
                    description=item.get("description"),
                    properties_meta=item.get("properties_meta"),
                    is_active=True,
                )
                session.add(new_feat)
                inserted += 1

        await session.commit()

        # Final count
        count_stmt = select(func.count(SpatialFeature.id))
        total = (await session.execute(count_stmt)).scalar() or 0

        logger.info(
            f"Sinkronisasi Selesai! Ditambahkan: {inserted}, Diperbarui: {updated}, Total di PostGIS: {total} titik."
        )


if __name__ == "__main__":
    asyncio.run(sync_spatial_features())
