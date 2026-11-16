"""
Seeder Data Geospasial PostGIS 7-Layer & Batas Wilayah 18 Desa Banda Neira
Mendukung eksekusi mandiri (standalone CLI) maupun dipanggil oleh demo_seed.py.
Bisa dijalankan di dalam container Docker maupun langsung dari host.

Perintah eksekusi developer:
  Docker:   docker compose exec backend python scripts/seed_spatial_features.py
  Host:     python backend/scripts/seed_spatial_features.py
"""

import asyncio
import json
import logging
import os
import sys
from pathlib import Path
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

# Setup path agar kompatibel di root host maupun di dalam container /app
current_dir = Path(__file__).resolve().parent
backend_dir = current_dir.parent
root_dir = backend_dir.parent

for p in [str(backend_dir), str(root_dir)]:
    if p not in sys.path:
        sys.path.insert(0, p)

try:
    from app.database.session import AsyncSessionLocal
    from app.modules.gis.models import SpatialFeature
except ImportError:
    from backend.app.database.session import AsyncSessionLocal
    from backend.app.modules.gis.models import SpatialFeature

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("seed_spatial_features")

SEED_JSON_PATH = backend_dir / "app" / "seeds" / "gis_spatial_features.json"
VILLAGES_JSON_PATH = backend_dir / "app" / "seeds" / "banda_villages.geojson"
VILLAGE_DETAILS_PATH = backend_dir / "app" / "seeds" / "banda_village_details.json"


async def seed_spatial_features(session: AsyncSession) -> int:
    """
    Fungsi pembantu seeding objek spasial, cagar budaya, fasilitas publik,
    rute maritim, dan 18 poligon batas wilayah desa terkalibrasi ke PostGIS.
    """
    logger.info("Memulai verifikasi dan seeding layer spasial PostGIS Kepulauan Banda...")

    # 1. Bersihkan entitas usang / non-desa jika ada
    await session.execute(
        delete(SpatialFeature).where(
            SpatialFeature.category == "zona_wilayah",
            SpatialFeature.name.in_([
                "Batas Wilayah Gunung Api",
                "Batas Wilayah Pulau Keraka",
                "Gunung Api",
                "Pulau Keraka",
            ])
        )
    )

    inserted_count = 0
    updated_count = 0

    # 2. Seeding Titik Spasial, Fasilitas Publik, & Rute Maritim
    if os.path.exists(SEED_JSON_PATH):
        with open(SEED_JSON_PATH, "r", encoding="utf-8") as f:
            features_data = json.load(f)

        logger.info(f"Memuat {len(features_data)} objek kurasi spasial dari {SEED_JSON_PATH.name}...")

        for item in features_data:
            name = item["name"]
            layer_type = item["layer_type"]

            # Lewati entri zona wilayah dari berkas ini karena akan dimuat lengkap dari banda_villages.geojson
            if item.get("category") == "zona_wilayah":
                continue

            stmt = select(SpatialFeature).where(
                SpatialFeature.name == name,
                SpatialFeature.layer_type == layer_type,
            )
            existing = (await session.execute(stmt)).scalar_one_or_none()

            if existing:
                # INTEGRITY GUARD: JANGAN menimpa koordinat (latitude & longitude) yang sudah disesuaikan user!
                existing.category = item.get("category", existing.category or "publik")
                existing.island_name = item.get("island_name", existing.island_name or "Pulau Neira")
                if existing.latitude is None:
                    existing.latitude = item["latitude"]
                if existing.longitude is None:
                    existing.longitude = item["longitude"]

                # Merge properties_meta tanpa menimpa data yang telah disesuaikan
                merged_meta = dict(existing.properties_meta or {})
                for k, v in (item.get("properties_meta") or {}).items():
                    if k not in merged_meta or not merged_meta[k]:
                        merged_meta[k] = v
                existing.properties_meta = merged_meta
                if not existing.description and item.get("description"):
                    existing.description = item.get("description")
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

    # 3. Seeding 18 Zona Poligon Batas Wilayah Desa ke PostGIS
    if os.path.exists(VILLAGES_JSON_PATH):
        with open(VILLAGES_JSON_PATH, "r", encoding="utf-8") as vf:
            villages_data = json.load(vf)

        village_details = {}
        if os.path.exists(VILLAGE_DETAILS_PATH):
            with open(VILLAGE_DETAILS_PATH, "r", encoding="utf-8") as df:
                village_details = json.load(df)

        v_features = villages_data.get("features", [])
        logger.info(f"Memuat {len(v_features)} zona batas desa terkalibrasi dari {VILLAGES_JSON_PATH.name}...")

        for feat in v_features:
            v_name = feat.get("properties", {}).get("name")
            v_island = feat.get("properties", {}).get("island", "Pulau Neira")
            if not v_name or v_name in ["Gunung Api", "Pulau Keraka"]:
                continue

            feat_name = f"Batas Wilayah {v_name}"
            geom = feat.get("geometry", {})
            coords = geom.get("coordinates", [])

            # Hitung titik tengah centroid
            all_pts = []
            if geom.get("type") == "Polygon" and coords and coords[0]:
                all_pts = coords[0]
            elif geom.get("type") == "MultiPolygon" and coords:
                for part in coords:
                    if part and part[0]:
                        all_pts.extend(part[0])

            center_lat, center_lng = -4.525, 129.897
            if all_pts:
                center_lat = sum(c[1] for c in all_pts) / len(all_pts)
                center_lng = sum(c[0] for c in all_pts) / len(all_pts)

            v_detail = village_details.get(v_name, {})
            props = {
                "village_name": v_name,
                "color": feat.get("properties", {}).get("color", "#3b82f6"),
                "population": v_detail.get("population", ""),
                "main_commodity": v_detail.get("main_commodity", ""),
                "area_ha": v_detail.get("area_ha", ""),
                "area_km2": v_detail.get("area_km2", ""),
                "density": v_detail.get("density", ""),
                "highlights": v_detail.get("highlights", ""),
                "demographics": v_detail.get("demographics", {}),
                "is_zone": True,
                "polygon_type": geom.get("type"),
                "vertex_count": len(all_pts),
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
                existing.description = v_detail.get("description", f"Batas wilayah administratif resmi {v_name}, {v_island}.")
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
                    description=v_detail.get("description", f"Batas wilayah administratif resmi {v_name}, {v_island}."),
                    is_active=True,
                )
                session.add(new_f)
                inserted_count += 1

    await session.commit()
    logger.info(f"Seeding Selesai! {inserted_count} baru ditambahkan, {updated_count} diperbarui.")
    return inserted_count + updated_count


async def main():
    logger.info("Memulai proses seeding objek spasial & batas desa PostGIS...")
    async with AsyncSessionLocal() as session:
        total = await seed_spatial_features(session)
        logger.info(f"Sukses! Total {total} fitur spasial & batas desa kini aktif di database PostGIS.")


if __name__ == "__main__":
    asyncio.run(main())
