import asyncio
import json
import os
import sys
from pathlib import Path

# Data dari tabel resmi yang diunggah pengguna:
# No, Nama, Luas (km2), Penduduk (jiwa), Kepadatan (jiwa/km2)
VILLAGE_OFFICIAL_TABLE = {
    "Desa Pulau Rhun": {"area_km2": 13.16, "pop": 1606, "density": 122},
    "Pulau Ay": {"area_km2": 13.19, "pop": 1512, "density": 115},
    "Lonthoir": {"area_km2": 16.07, "pop": 2325, "density": 145},
    "Desa Pulau Hatta": {"area_km2": 15.88, "pop": 681, "density": 43},
    "Selamon": {"area_km2": 12.09, "pop": 1620, "density": 134},
    "Kampung Baru": {"area_km2": 5.7, "pop": 3057, "density": 537},
    "Dwiwarna": {"area_km2": 4.1, "pop": 880, "density": 215},
    "Rajawali": {"area_km2": 2.94, "pop": 891, "density": 303},
    # Merdeka: User requested: "ignore yg desa merdeka ya karena yg merdeka sudah tepat.. cukup tambahin Luas dan Kepadatan penduduknya"
    "Merdeka": {"area_km2": 2.95, "pop": None, "density": 289},
    "Nusantara": {"area_km2": 13.9, "pop": 1865, "density": 147},
    "Waer": {"area_km2": 7.99, "pop": 1444, "density": 181},
    "Tanah Rata": {"area_km2": 7.2, "pop": 906, "density": 126},
    "Uring Tutra": {"area_km2": 2.2, "pop": 441, "density": 200},
    "Lautang": {"area_km2": 4.7, "pop": 546, "density": 116},
    "Walling Spanciby": {"area_km2": 8.4, "pop": 1202, "density": 143},
    "Boiyauw": {"area_km2": 7.15, "pop": 837, "density": 117},
    "Dender": {"area_km2": 2.1, "pop": 413, "density": 197},
    "Combir Kasestoren": {"area_km2": 9.0, "pop": 710, "density": 79},
}

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

from sqlalchemy import select

from sqlalchemy.orm.attributes import flag_modified
from sqlalchemy import select, update

VILLAGE_DETAILS_PATH = backend_dir / "app" / "seeds" / "banda_village_details.json"
GIS_FEATURES_SEED = backend_dir / "app" / "seeds" / "gis_spatial_features.json"
FRONTEND_TS_PATH = root_dir / "frontend" / "src" / "data" / "bandaVillagesData.ts"

def format_number(n):
    return f"{n:,}".replace(",", ".")

async def apply_village_data():
    print("Memperbarui detail data 18 desa Kepulauan Banda...")

    # 1. Update banda_village_details.json
    with open(VILLAGE_DETAILS_PATH, "r", encoding="utf-8") as f:
        village_details = json.load(f)

    for v_name, data in VILLAGE_OFFICIAL_TABLE.items():
        if v_name not in village_details:
            print(f"Warning: {v_name} not found in json!")
            continue

        item = village_details[v_name]
        item["area_km2"] = data["area_km2"]
        item["density"] = data["density"]
        item["area_ha"] = f"{round(data['area_km2'] * 100)} Hektar"

        if data["pop"] is not None:
            item["population"] = f"{format_number(data['pop'])} Jiwa"
            if "demographics" in item:
                item["demographics"]["total_population"] = data["pop"]
        else:
            print(f"Skipping population change for {v_name} as requested (keeping existing: {item.get('population')})")

    with open(VILLAGE_DETAILS_PATH, "w", encoding="utf-8") as f:
        json.dump(village_details, f, indent=2, ensure_ascii=False)
    print(f"Updated {VILLAGE_DETAILS_PATH}")

    # 2. Update PostGIS Database spatial_features
    async with AsyncSessionLocal() as db:
        for v_name, data in VILLAGE_OFFICIAL_TABLE.items():
            feat_name = f"Batas Wilayah {v_name}"
            stmt = select(SpatialFeature).where(
                SpatialFeature.name == feat_name,
                SpatialFeature.layer_type == "LAYER_DESA_ADMIN",
            )
            existing = (await db.execute(stmt)).scalars().first()
            if existing:
                props = dict(existing.properties_meta or {})
                props["area_km2"] = data["area_km2"]
                props["density"] = data["density"]
                props["area_ha"] = f"{round(data['area_km2'] * 100)} Hektar"
                if data["pop"] is not None:
                    props["population"] = f"{format_number(data['pop'])} Jiwa"
                props["main_commodity"] = village_details[v_name].get("main_commodity", "")
                props["highlights"] = village_details[v_name].get("highlights", "")
                existing.properties_meta = props
                flag_modified(existing, "properties_meta")
                print(f"Updated PostGIS: {feat_name} -> Luas: {data['area_km2']} km2, Pop: {props.get('population')}, Kepadatan: {data['density']} jiwa/km2")

        await db.commit()
    print("PostGIS transaction committed successfully!")

    # 3. Update gis_spatial_features.json
    if GIS_FEATURES_SEED.exists():
        with open(GIS_FEATURES_SEED, "r", encoding="utf-8") as f:
            gis_items = json.load(f)

        for item in gis_items:
            if item.get("category") == "zona_wilayah":
                v_name = item.get("properties_meta", {}).get("village_name") or item.get("name", "").replace("Batas Wilayah ", "")
                if v_name in VILLAGE_OFFICIAL_TABLE:
                    d = VILLAGE_OFFICIAL_TABLE[v_name]
                    props = item.setdefault("properties_meta", {})
                    props["area_km2"] = d["area_km2"]
                    props["density"] = d["density"]
                    props["area_ha"] = f"{round(d['area_km2'] * 100)} Hektar"
                    if d["pop"] is not None:
                        props["population"] = f"{format_number(d['pop'])} Jiwa"

        with open(GIS_FEATURES_SEED, "w", encoding="utf-8") as f:
            json.dump(gis_items, f, indent=2, ensure_ascii=False)
        print(f"Updated {GIS_FEATURES_SEED}")

    # 4. Update frontend/src/data/bandaVillagesData.ts
    if FRONTEND_TS_PATH.exists():
        with open(FRONTEND_TS_PATH, "r", encoding="utf-8") as f:
            ts_text = f.read()

        # Update VILLAGE_DETAILS in typescript file
        # We can reconstruct VILLAGE_DETAILS nicely
        new_village_details_json = json.dumps(village_details, indent=2, ensure_ascii=False)
        # Match export const VILLAGE_DETAILS: Record<string, VillageInfo> = { ... };
        import re
        pattern = r"export const VILLAGE_DETAILS: Record<string, VillageInfo> = \{.*?\n\}"
        replacement = f"export const VILLAGE_DETAILS: Record<string, VillageInfo> = {new_village_details_json}"
        ts_text = re.sub(pattern, replacement, ts_text, flags=re.DOTALL)

        with open(FRONTEND_TS_PATH, "w", encoding="utf-8") as f:
            f.write(ts_text)
        print(f"Updated VILLAGE_DETAILS in {FRONTEND_TS_PATH}")

if __name__ == "__main__":
    asyncio.run(apply_village_data())
