import json
import math
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
import uuid
from backend.app.modules.farms.models import Farm

_SEEDS_DIR = Path(__file__).resolve().parent.parent.parent / "seeds"
_VILLAGES_GEOJSON_PATH = _SEEDS_DIR / "banda_villages.geojson"


def load_village_boundary_from_file(village_name: str) -> Optional[Dict[str, Any]]:
    """Memuat geometri poligon batas desa dari berkas seeder GeoJSON resmi."""
    if not _VILLAGES_GEOJSON_PATH.exists():
        return None
    try:
        with open(_VILLAGES_GEOJSON_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
            v_lower = village_name.strip().lower()
            if v_lower in ("banda neira", "neira", "desa banda neira", "pulau neira"):
                multi_coords = []
                for feat in data.get("features", []):
                    props = feat.get("properties", {})
                    island = (props.get("island") or "").strip().lower()
                    if island == "pulau neira":
                        geom = feat.get("geometry")
                        if geom:
                            if geom.get("type") == "MultiPolygon":
                                multi_coords.extend(geom.get("coordinates", []))
                            elif geom.get("type") == "Polygon":
                                multi_coords.append(geom.get("coordinates", []))
                if multi_coords:
                    return {"type": "MultiPolygon", "coordinates": multi_coords}

            for feat in data.get("features", []):
                props = feat.get("properties", {})
                name = props.get("village_name") or props.get("name") or ""
                n_lower = name.strip().lower()
                if n_lower == v_lower or v_lower in n_lower or n_lower in v_lower:
                    return feat.get("geometry")
    except Exception:
        pass
    return None


def find_village_for_point(lon: float, lat: float) -> Optional[str]:
    """Mencari nama desa resmi yang menaungi titik koordinat [lon, lat]."""
    if not _VILLAGES_GEOJSON_PATH.exists():
        return None
    try:
        with open(_VILLAGES_GEOJSON_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
            for feat in data.get("features", []):
                geom = feat.get("geometry")
                if geom and is_point_inside_geojson_geom([lon, lat], geom):
                    props = feat.get("properties", {})
                    return props.get("village_name") or props.get("name")

            # Fallback jika titik dekat dengan salah satu desa (< 0.02 derajat / ~2km)
            nearest_name = None
            min_dist = float("inf")
            for feat in data.get("features", []):
                geom = feat.get("geometry", {})
                coords = []
                if geom.get("type") == "MultiPolygon":
                    for p in geom.get("coordinates", []):
                        for ring in p:
                            coords.extend(ring)
                elif geom.get("type") == "Polygon":
                    for ring in geom.get("coordinates", []):
                        coords.extend(ring)
                if coords:
                    c_lon = sum(c[0] for c in coords) / len(coords)
                    c_lat = sum(c[1] for c in coords) / len(coords)
                    dist = math.hypot(lon - c_lon, lat - c_lat)
                    if dist < min_dist:
                        min_dist = dist
                        props = feat.get("properties", {})
                        nearest_name = props.get("village_name") or props.get("name")
            if min_dist <= 0.02:
                return nearest_name
    except Exception:
        pass
    return None


def extract_polygon_rings(geojson: Dict[str, Any]) -> List[List[List[float]]]:
    """
    Ekstrak cincin koordinat (outer rings) dari GeoJSON Polygon atau MultiPolygon.
    Format koordinat: [[lon, lat], [lon, lat], ...]
    """
    if not isinstance(geojson, dict):
        raise ValueError("GeoJSON harus berupa objek dictionary JSON.")

    geom_type = geojson.get("type")
    coords = geojson.get("coordinates")

    if not geom_type or not coords:
        raise ValueError("GeoJSON harus memiliki 'type' dan 'coordinates'.")

    rings: List[List[List[float]]] = []
    if geom_type == "Polygon":
        if not isinstance(coords, list) or len(coords) == 0:
            raise ValueError("Polygon coordinates harus berupa list non-kosong.")
        rings.append(coords[0])
    elif geom_type == "MultiPolygon":
        if not isinstance(coords, list) or len(coords) == 0:
            raise ValueError("MultiPolygon coordinates harus berupa list non-kosong.")
        for poly in coords:
            if isinstance(poly, list) and len(poly) > 0:
                rings.append(poly[0])
    else:
        raise ValueError(f"Tipe geometri '{geom_type}' tidak didukung. Gunakan 'Polygon' atau 'MultiPolygon'.")

    return rings


def validate_polygon_geojson(geojson: Dict[str, Any]) -> List[List[float]]:
    """
    Validasi cincin poligon:
    - Minimal 4 titik (3 vertex + 1 titik penutup)
    - Titik awal dan akhir harus identik
    - Rentang latitude [-90, 90] dan longitude [-180, 180]
    """
    rings = extract_polygon_rings(geojson)
    if not rings:
        raise ValueError("Tidak ditemukan cincin poligon yang valid.")

    outer_ring = rings[0]
    if len(outer_ring) < 4:
        raise ValueError("Poligon batas kebun harus memiliki minimal 4 titik koordinat (cincin tertutup).")

    # Pastikan cincin tertutup
    first, last = outer_ring[0], outer_ring[-1]
    if abs(first[0] - last[0]) > 1e-6 or abs(first[1] - last[1]) > 1e-6:
        raise ValueError("Titik awal dan titik akhir poligon harus sama (cincin tertutup).")

    for idx, pt in enumerate(outer_ring):
        if not isinstance(pt, (list, tuple)) or len(pt) < 2:
            raise ValueError(f"Titik #{idx} tidak valid. Harus berupa [longitude, latitude].")
        lon, lat = float(pt[0]), float(pt[1])
        if not (-180.0 <= lon <= 180.0):
            raise ValueError(f"Longitude titik #{idx} ({lon}) di luar rentang valid [-180, 180].")
        if not (-90.0 <= lat <= 90.0):
            raise ValueError(f"Latitude titik #{idx} ({lat}) di luar rentang valid [-90, 90].")

    return outer_ring


def calculate_polygon_area_sqm(coords: List[List[float]]) -> float:
    """
    Menghitung luas poligon geodesik pada permukaan bumi (WGS84) dalam meter persegi (m²)
    menggunakan rumus spherical excess.
    """
    if len(coords) < 4:
        return 0.0

    r_earth = 6371008.8  # Radius rata-rata bumi dalam meter
    total = 0.0

    for i in range(len(coords) - 1):
        lon1 = math.radians(coords[i][0])
        lat1 = math.radians(coords[i][1])
        lon2 = math.radians(coords[i + 1][0])
        lat2 = math.radians(coords[i + 1][1])
        total += (lon2 - lon1) * (2 + math.sin(lat1) + math.sin(lat2))

    area = abs(total * r_earth * r_earth / 2.0)
    return round(area, 2)


def _ccw(a: List[float], b: List[float], c: List[float]) -> bool:
    return (c[1] - a[1]) * (b[0] - a[0]) > (b[1] - a[1]) * (c[0] - a[0])


def _segments_intersect(a: List[float], b: List[float], c: List[float], d: List[float]) -> bool:
    """Memeriksa apakah segmen garis AB memotong segmen garis CD."""
    return _ccw(a, c, d) != _ccw(b, c, d) and _ccw(a, b, c) != _ccw(a, b, d)


def _point_in_polygon(pt: List[float], poly: List[List[float]]) -> bool:
    """Ray casting algorithm untuk memeriksa apakah titik berada di dalam poligon."""
    x, y = pt[0], pt[1]
    inside = False
    n = len(poly)
    for i in range(n - 1):
        x1, y1 = poly[i][0], poly[i][1]
        x2, y2 = poly[i + 1][0], poly[i + 1][1]
        if ((y1 > y) != (y2 > y)) and (x < (x2 - x1) * (y - y1) / (y2 - y1 + 1e-12) + x1):
            inside = not inside
    return inside


def check_polygons_overlap(poly1: List[List[float]], poly2: List[List[float]]) -> bool:
    """
    Memeriksa apakah dua poligon tumpang tindih (overlap):
    1. Ada perpotongan antar sisi poligon
    2. Atau salah satu poligon berada di dalam poligon lainnya (nested)
    """
    # 1. Periksa perpotongan sisi
    for i in range(len(poly1) - 1):
        for j in range(len(poly2) - 1):
            if _segments_intersect(poly1[i], poly1[i + 1], poly2[j], poly2[j + 1]):
                return True

    # 2. Periksa apakah titik poly1 berada di dalam poly2
    for pt in poly1[:-1]:
        if _point_in_polygon(pt, poly2):
            return True

    # 3. Periksa apakah titik poly2 berada di dalam poly1
    for pt in poly2[:-1]:
        if _point_in_polygon(pt, poly1):
            return True

    return False


def find_overlapping_farm(
    new_geojson: Dict[str, Any],
    existing_farms: List[Farm],
    exclude_farm_id: Optional[uuid.UUID] = None,
) -> Optional[Farm]:
    """
    Mencari kebun lain yang batas poligonnya bertubrukan (overlap) dengan poligon baru.
    """
    try:
        new_ring = validate_polygon_geojson(new_geojson)
    except ValueError:
        return None

    for farm in existing_farms:
        if exclude_farm_id and farm.id == exclude_farm_id:
            continue
        if not farm.polygon_boundary_geojson:
            continue
        try:
            existing_ring = validate_polygon_geojson(farm.polygon_boundary_geojson)
            if check_polygons_overlap(new_ring, existing_ring):
                return farm
        except Exception:
            continue

    return None


def is_point_inside_geojson_geom(pt: List[float], geom: Dict[str, Any]) -> bool:
    """
    Memeriksa apakah titik [lon, lat] berada di dalam geometri GeoJSON (Polygon / MultiPolygon).
    """
    gtype = geom.get("type")
    coords = geom.get("coordinates")
    if not gtype or not coords:
        return False

    if gtype == "Polygon":
        if isinstance(coords, list) and len(coords) > 0:
            return _point_in_polygon(pt, coords[0])
    elif gtype == "MultiPolygon":
        if isinstance(coords, list):
            for poly in coords:
                if isinstance(poly, list) and len(poly) > 0:
                    if _point_in_polygon(pt, poly[0]):
                        return True
    return False


def check_farm_within_village_boundary(
    farm_geojson: Dict[str, Any],
    village_geom: Dict[str, Any],
    village_name: str,
) -> Tuple[bool, Optional[str]]:
    """
    Memvalidasi apakah poligon lahan kebun berada sepenuhnya di dalam batas wilayah desa administratif resmi.
    Menguji centroid (titik tengah), seluruh titik batas, dan perpotongan garis batas desa.
    """
    try:
        outer_ring = validate_polygon_geojson(farm_geojson)
    except ValueError as err:
        return False, str(err)

    pts = outer_ring[:-1]
    if not pts:
        return False, "Poligon kebun tidak memiliki koordinat."

    # 1. Hitung centroid
    center_lon = sum(p[0] for p in pts) / len(pts)
    center_lat = sum(p[1] for p in pts) / len(pts)
    center_inside = is_point_inside_geojson_geom([center_lon, center_lat], village_geom)
    if not center_inside:
        return False, (
            f"Titik tengah lahan kebun berada di luar batas administratif resmi Desa {village_name}."
        )

    # 2. Cek seluruh titik sudut poligon kebun (harus 100% di dalam batas desa)
    outside_pts_count = sum(1 for p in pts if not is_point_inside_geojson_geom(p, village_geom))
    if outside_pts_count > 0:
        return False, (
            f"Batas lahan melewati/keluar dari wilayah administratif Desa {village_name}. "
            f"Terdapat {outside_pts_count} dari {len(pts)} titik batas kebun yang berada di luar batas resmi desa."
        )

    # 3. Cek perpotongan sisi (segmen batas poligon kebun tidak boleh menabrak/memotong garis batas desa)
    try:
        village_rings = extract_polygon_rings(village_geom)
        farm_ring = outer_ring
        for v_ring in village_rings:
            for i in range(len(farm_ring) - 1):
                p1, p2 = farm_ring[i], farm_ring[i + 1]
                for j in range(len(v_ring) - 1):
                    v1, v2 = v_ring[j], v_ring[j + 1]
                    if _segments_intersect(p1, p2, v1, v2):
                        return False, (
                            f"Batas sisi poligon kebun memotong garis batas administratif resmi Desa {village_name}. "
                            f"Lahan kebun tidak boleh melewati atau bertubrukan dengan batas desa."
                        )
    except Exception:
        pass

    return True, None

