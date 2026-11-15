import asyncio
import json
import os
import sys
from pathlib import Path

current_dir = Path(__file__).resolve().parent
backend_dir = current_dir.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.database.session import AsyncSessionLocal
from app.modules.gis.models import SpatialFeature
from sqlalchemy import select

SEEDS_DIR = backend_dir / "app" / "seeds"
VILLAGES_GEOJSON_SEED = SEEDS_DIR / "banda_villages.geojson"
GIS_FEATURES_SEED = SEEDS_DIR / "gis_spatial_features.json"
RECOVERED_PATH = SEEDS_DIR / "nusantara_3parts_complete.json"

async def update_nusantara_3parts():
    with open(RECOVERED_PATH, "r", encoding="utf-8") as f:
        coords_3parts = json.load(f)

    print("Loaded 3 parts for Nusantara:")
    for idx, p in enumerate(coords_3parts):
        ring = p[0]
        lngs = [pt[0] for pt in ring]
        lats = [pt[1] for pt in ring]
        print(f"  Part {idx}: {len(ring)} pts | Lng [{min(lngs):.4f}, {max(lngs):.4f}] | Lat [{min(lats):.4f}, {max(lats):.4f}]")

    nusantara_geom = {
        "type": "MultiPolygon",
        "coordinates": coords_3parts
    }

    # 1. Update Database PostGIS
    async with AsyncSessionLocal() as db:
        stmt = select(SpatialFeature).where(
            SpatialFeature.name == "Batas Wilayah Nusantara",
            SpatialFeature.layer_type == "LAYER_DESA_ADMIN",
        )
        existing = (await db.execute(stmt)).scalars().first()
        if existing:
            existing.geometry_geojson = nusantara_geom
            all_pts = []
            for p in coords_3parts:
                all_pts.extend(p[0])
            c_lng = sum(pt[0] for pt in all_pts) / len(all_pts)
            c_lat = sum(pt[1] for pt in all_pts) / len(all_pts)
            existing.latitude = c_lat
            existing.longitude = c_lng
            meta = existing.properties_meta or {}
            meta["polygon_type"] = "MultiPolygon"
            meta["vertex_count"] = len(all_pts)
            meta["parts_count"] = 3
            existing.properties_meta = meta
            await db.commit()
            print("Successfully updated Batas Wilayah Nusantara in PostGIS database with 3 parts!")
        else:
            print("Error: Batas Wilayah Nusantara not found in DB!")

    # 2. Update backend/app/seeds/banda_villages.geojson
    if VILLAGES_GEOJSON_SEED.exists():
        with open(VILLAGES_GEOJSON_SEED, "r", encoding="utf-8") as f:
            v_data = json.load(f)
        for feat in v_data.get("features", []):
            if feat.get("id") == "desa-nusantara" or feat.get("properties", {}).get("name") == "Nusantara":
                feat["geometry"] = nusantara_geom
                print("Updated Nusantara in banda_villages.geojson")
        with open(VILLAGES_GEOJSON_SEED, "w", encoding="utf-8") as f:
            json.dump(v_data, f, indent=2, ensure_ascii=False)

    # 3. Update backend/app/seeds/gis_spatial_features.json
    if GIS_FEATURES_SEED.exists():
        with open(GIS_FEATURES_SEED, "r", encoding="utf-8") as f:
            gis_data = json.load(f)
        for item in gis_data:
            if item.get("name") == "Batas Wilayah Nusantara":
                item["geometry_geojson"] = nusantara_geom
                print("Updated Nusantara in gis_spatial_features.json")
        with open(GIS_FEATURES_SEED, "w", encoding="utf-8") as f:
            json.dump(gis_data, f, indent=2, ensure_ascii=False)

    # 4. Update frontend/src/data/bandaVillagesData.ts
    frontend_ts_path = backend_dir.parent / "frontend" / "src" / "data" / "bandaVillagesData.ts"
    if frontend_ts_path.exists():
        with open(VILLAGES_GEOJSON_SEED, "r", encoding="utf-8") as f:
            fresh_fc = json.load(f)
        with open(frontend_ts_path, "r", encoding="utf-8") as f:
            lines = f.readlines()
        split_idx = -1
        for i, l in enumerate(lines):
            if "export const BANDA_VILLAGES_GEOJSON" in l:
                split_idx = i
                break
        if split_idx != -1:
            header = "".join(lines[:split_idx])
            new_code = header + "export const BANDA_VILLAGES_GEOJSON: any = " + json.dumps(fresh_fc, indent=2) + ";\n"
            with open(frontend_ts_path, "w", encoding="utf-8") as f:
                f.write(new_code)
            print("Updated BANDA_VILLAGES_GEOJSON in frontend/src/data/bandaVillagesData.ts!")

if __name__ == "__main__":
    asyncio.run(update_nusantara_3parts())
