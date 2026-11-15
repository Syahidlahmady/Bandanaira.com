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
VILLAGES_JSON_PATH = Path(__file__).resolve().parent.parent / "app" / "seeds" / "banda_villages.geojson"
VILLAGE_DETAILS_PATH = Path(__file__).resolve().parent.parent / "app" / "seeds" / "banda_village_details.json"


async def seed_spatial_features(session: AsyncSession) -> int:
    """Fungsi pembantu seeding objek spasial dan zona wilayah desa."""
    if not os.path.exists(SEED_JSON_PATH):
        logger.error(f"Berkas seed tidak ditemukan: {SEED_JSON_PATH}")
        return 0

    with open(SEED_JSON_PATH, "r", encoding="utf-8") as f:
        features_data = json.load(f)

    logger.info(f"Memuat {len(features_data)} objek spasial dari {SEED_JSON_PATH.name}...")

    inserted_count = 0
    updated_count = 0

    # 1. Seeding 37 Titik Spasial & Rute Maritim
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

    # 2. Seeding Zona Poligon Batas Wilayah Desa ke PostGIS
    if os.path.exists(VILLAGES_JSON_PATH):
        with open(VILLAGES_JSON_PATH, "r", encoding="utf-8") as vf:
            villages_data = json.load(vf)

        village_details = {}
        if os.path.exists(VILLAGE_DETAILS_PATH):
            with open(VILLAGE_DETAILS_PATH, "r", encoding="utf-8") as df:
                village_details = json.load(df)

        v_features = villages_data.get("features", [])
        logger.info(f"Memuat {len(v_features)} zona batas wilayah desa dari {VILLAGES_JSON_PATH.name}...")

        for feat in v_features:
            v_name = feat.get("properties", {}).get("name")
            v_island = feat.get("properties", {}).get("island", "Pulau Neira")
            if not v_name:
                continue

            feat_name = f"Batas Wilayah {v_name}"
            geom = feat.get("geometry", {})
            coords = geom.get("coordinates", [])

            center_lat, center_lng = -4.525, 129.897
            if geom.get("type") == "Polygon" and len(coords) > 0 and len(coords[0]) > 0:
                ring = coords[0]
                center_lat = sum(c[1] for c in ring) / len(ring)
                center_lng = sum(c[0] for c in ring) / len(ring)
            elif geom.get("type") == "MultiPolygon" and len(coords) > 0 and len(coords[0]) > 0 and len(coords[0][0]) > 0:
                ring = coords[0][0]
                center_lat = sum(c[1] for c in ring) / len(ring)
                center_lng = sum(c[0] for c in ring) / len(ring)

            v_detail = village_details.get(v_name, {})
            props = {
                "village_name": v_name,
                "color": feat.get("properties", {}).get("color", "#3b82f6"),
                "population": v_detail.get("population", ""),
                "main_commodity": v_detail.get("main_commodity", ""),
                "area_ha": v_detail.get("area_ha", ""),
                "highlights": v_detail.get("highlights", ""),
                "demographics": v_detail.get("demographics", {}),
                "is_zone": True,
            }

            stmt = select(SpatialFeature).where(
                SpatialFeature.name == feat_name,
                SpatialFeature.layer_type == "LAYER_DESA_ADMIN",
            )
            existing = (await session.execute(stmt)).scalar_one_or_none()

            if existing:
                existing.geometry_geojson = geom
                existing.island_name = v_island
                existing.latitude = center_lat
                existing.longitude = center_lng
                existing.properties_meta = props
                existing.description = v_detail.get("description", "")
                existing.is_active = True
                updated_count += 1
            else:
                new_f = SpatialFeature(
                    name=feat_name,
                    layer_type="LAYER_DESA_ADMIN",
                    category="zona_wilayah",
                    island_name=v_island,
                    latitude=center_lat,
                    longitude=center_lng,
                    geometry_geojson=geom,
                    properties_meta=props,
                    description=v_detail.get("description", ""),
                    is_active=True,
                )
                session.add(new_f)
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
