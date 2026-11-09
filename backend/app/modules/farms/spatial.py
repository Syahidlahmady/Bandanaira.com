import math
from typing import Any, Dict, List, Optional, Tuple
import uuid
from backend.app.modules.farms.models import Farm


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
