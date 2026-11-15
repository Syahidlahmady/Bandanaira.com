import asyncio
import json
import os
import sys
from pathlib import Path

# Adjust path for running inside container or locally
current_dir = Path(__file__).resolve().parent
backend_dir = current_dir.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.database.session import AsyncSessionLocal
from app.modules.gis.models import SpatialFeature
from sqlalchemy import select, delete

SEEDS_DIR = backend_dir / "app" / "seeds"
CLEAN_GEOJSON_PATH = SEEDS_DIR / "clean_banda_villages.json"
VILLAGES_GEOJSON_SEED = SEEDS_DIR / "banda_villages.geojson"
GIS_FEATURES_SEED = SEEDS_DIR / "gis_spatial_features.json"

async def sync_villages():
    if not os.path.exists(CLEAN_GEOJSON_PATH):
        print(f"Error: {CLEAN_GEOJSON_PATH} not found!")
        return

    with open(CLEAN_GEOJSON_PATH, "r", encoding="utf-8") as f:
        fc = json.load(f)

    features = fc.get("features", [])
    print(f"Loaded {len(features)} clean village features.")

    # 1. Update Database
    async with AsyncSessionLocal() as db:
        # Delete invalid records (Gunung Api, Keraka as standalone villages)
        await db.execute(
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
        print("Purged non-village entries (Gunung Api, Keraka) from PostGIS.")

        # Update or Insert each village
        for feat in features:
            props = feat.get("properties", {})
            v_name = props.get("name") or props.get("desa")
            island = props.get("island", "Pulau Neira")
            geom = feat.get("geometry", {})
            feat_name = f"Batas Wilayah {v_name}"

            # Compute centroid
            c_lat, c_lng = -4.525, 129.897
            gtype = geom.get("type")
            coords = geom.get("coordinates", [])
            all_pts = []
            if gtype == "Polygon" and coords and coords[0]:
                all_pts = coords[0]
            elif gtype == "MultiPolygon" and coords:
                for part in coords:
                    if part and part[0]:
                        all_pts.extend(part[0])
            
            if all_pts:
                c_lng = sum(p[0] for p in all_pts) / len(all_pts)
                c_lat = sum(p[1] for p in all_pts) / len(all_pts)

            # Check if exists
            stmt = select(SpatialFeature).where(
                SpatialFeature.layer_type == "LAYER_DESA_ADMIN",
                SpatialFeature.category == "zona_wilayah",
                SpatialFeature.name == feat_name,
            )
            existing = (await db.execute(stmt)).scalars().first()

            meta = {
                "village_name": v_name,
                "island": island,
                "color": props.get("color", "#3b82f6"),
                "polygon_type": gtype,
                "vertex_count": len(all_pts),
            }

            if existing:
                existing.island_name = island
                existing.latitude = c_lat
                existing.longitude = c_lng
                existing.geometry_geojson = geom
                existing.properties_meta = {**(existing.properties_meta or {}), **meta}
                existing.description = f"Batas wilayah administratif resmi {v_name}, {island}."
                existing.is_active = True
                print(f"Updated in DB: {feat_name} ({gtype}, {len(all_pts)} pts)")
            else:
                new_feat = SpatialFeature(
                    name=feat_name,
                    layer_type="LAYER_DESA_ADMIN",
                    category="zona_wilayah",
                    island_name=island,
                    latitude=c_lat,
                    longitude=c_lng,
                    geometry_geojson=geom,
                    properties_meta=meta,
                    description=f"Batas wilayah administratif resmi {v_name}, {island}.",
                    is_active=True,
                )
                db.add(new_feat)
                print(f"Created in DB: {feat_name} ({gtype}, {len(all_pts)} pts)")

        await db.commit()
        print("Database transaction successfully committed!")

    # 2. Update backend/app/seeds/banda_villages.geojson
    with open(VILLAGES_GEOJSON_SEED, "w", encoding="utf-8") as f:
        json.dump(fc, f, indent=2, ensure_ascii=False)
    print(f"Updated {VILLAGES_GEOJSON_SEED}")

    # 3. Update backend/app/seeds/gis_spatial_features.json
    if GIS_FEATURES_SEED.exists():
        with open(GIS_FEATURES_SEED, "r", encoding="utf-8") as f:
            gis_items = json.load(f)

        # Remove old zona_wilayah and non-villages
        retained = [
            item for item in gis_items 
            if item.get("category") != "zona_wilayah" 
            and item.get("name") not in ["Batas Wilayah Gunung Api", "Batas Wilayah Pulau Keraka"]
        ]

        # Append fresh zona_wilayah features
        for feat in features:
            props = feat.get("properties", {})
            v_name = props.get("name") or props.get("desa")
            island = props.get("island", "Pulau Neira")
            geom = feat.get("geometry", {})
            feat_name = f"Batas Wilayah {v_name}"

            all_pts = []
            if geom.get("type") == "Polygon" and geom.get("coordinates"):
                all_pts = geom["coordinates"][0]
            elif geom.get("type") == "MultiPolygon" and geom.get("coordinates"):
                for p in geom["coordinates"]:
                    if p: all_pts.extend(p[0])

            c_lat = sum(p[1] for p in all_pts) / len(all_pts) if all_pts else -4.525
            c_lng = sum(p[0] for p in all_pts) / len(all_pts) if all_pts else 129.897

            retained.append({
                "name": feat_name,
                "layer_type": "LAYER_DESA_ADMIN",
                "category": "zona_wilayah",
                "island_name": island,
                "latitude": c_lat,
                "longitude": c_lng,
                "geometry_geojson": geom,
                "properties_meta": {
                    "village_name": v_name,
                    "island": island,
                    "color": props.get("color", "#3b82f6"),
                },
                "description": f"Batas wilayah administratif resmi {v_name}, {island}.",
                "is_active": True,
            })

        with open(GIS_FEATURES_SEED, "w", encoding="utf-8") as f:
            json.dump(retained, f, indent=2, ensure_ascii=False)
        print(f"Updated {GIS_FEATURES_SEED} (total {len(retained)} items)")

if __name__ == "__main__":
    asyncio.run(sync_villages())
