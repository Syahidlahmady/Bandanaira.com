"""
Layanan Geocoding & Pengambilan Titik Spasial Eksternal (Google Maps / Geocoder Fallback)
untuk Ekosistem Digital Banda Neira.
Bertugas mengambil koordinat latitude/longitude murni dan membuang metadata sampah.
Dilengkapi dengan Offline-First Gazetteer untuk Kepulauan Banda.
"""

import json
import os
import urllib.parse
import urllib.request
from typing import Any, Dict, List, Optional

# Bounding box Kepulauan Banda (EPSG:4326)
BANDA_BBOX = {
    "min_lat": -4.68,
    "max_lat": -4.45,
    "min_lng": 129.75,
    "max_lng": 130.15,
}

# Offline-First Gazetteer Situs Sejarah, Wisata 4A & Infrastruktur Banda Neira
GAZETTEER_BANDA_LOKAL: List[Dict[str, Any]] = [
    {
        "name": "Benteng Belgica (Fort Belgica)",
        "lat": -4.5222,
        "lng": 129.9022,
        "address": "Desa Nusantara, Pulau Neira, Kepulauan Banda, Maluku Tengah",
        "island": "Pulau Neira",
        "suggested_layer": "LAYER_HERITAGE",
        "source": "OFFLINE_GAZETTEER_BANDA",
    },
    {
        "name": "Benteng Nassau (Fort Nassau)",
        "lat": -4.5281,
        "lng": 129.8976,
        "address": "Desa Nusantara, Pulau Neira, Kepulauan Banda, Maluku Tengah",
        "island": "Pulau Neira",
        "suggested_layer": "LAYER_HERITAGE",
        "source": "OFFLINE_GAZETTEER_BANDA",
    },
    {
        "name": "Rumah Pengasingan Mohammad Hatta",
        "lat": -4.5274,
        "lng": 129.8998,
        "address": "Desa Dwiwarna, Pulau Neira, Maluku Tengah",
        "island": "Pulau Neira",
        "suggested_layer": "LAYER_HERITAGE",
        "source": "OFFLINE_GAZETTEER_BANDA",
    },
    {
        "name": "Rumah Pengasingan Sutan Sjahrir",
        "lat": -4.5269,
        "lng": 129.8993,
        "address": "Desa Dwiwarna, Pulau Neira, Maluku Tengah",
        "island": "Pulau Neira",
        "suggested_layer": "LAYER_HERITAGE",
        "source": "OFFLINE_GAZETTEER_BANDA",
    },
    {
        "name": "Istana Mini Banda Neira",
        "lat": -4.5287,
        "lng": 129.9006,
        "address": "Desa Dwiwarna, Pulau Neira, Maluku Tengah",
        "island": "Pulau Neira",
        "suggested_layer": "LAYER_HERITAGE",
        "source": "OFFLINE_GAZETTEER_BANDA",
    },
    {
        "name": "Gereja Tua Banda Neira (Oude Kerk 1873)",
        "lat": -4.5269,
        "lng": 129.8968,
        "address": "Desa Nusantara, Pulau Neira, Maluku Tengah",
        "island": "Pulau Neira",
        "suggested_layer": "LAYER_HERITAGE",
        "source": "OFFLINE_GAZETTEER_BANDA",
    },
    {
        "name": "Benteng Hollandia Lonthoir",
        "lat": -4.5508,
        "lng": 129.8812,
        "address": "Desa Lonthoir, Banda Besar, Maluku Tengah",
        "island": "Banda Besar",
        "suggested_layer": "LAYER_HERITAGE",
        "source": "OFFLINE_GAZETTEER_BANDA",
    },
    {
        "name": "Benteng Revenge Pulau Ay",
        "lat": -4.5255,
        "lng": 129.8322,
        "address": "Pulau Ay, Kepulauan Banda, Maluku Tengah",
        "island": "Pulau Ay",
        "suggested_layer": "LAYER_HERITAGE",
        "source": "OFFLINE_GAZETTEER_BANDA",
    },
    {
        "name": "Benteng Concordia (Waer)",
        "lat": -4.5583,
        "lng": 129.9481,
        "address": "Desa Waer, Banda Besar, Maluku Tengah",
        "island": "Banda Besar",
        "suggested_layer": "LAYER_HERITAGE",
        "source": "OFFLINE_GAZETTEER_BANDA",
    },
    {
        "name": "Lava Flow Snorkeling & Coral Reef",
        "lat": -4.5160,
        "lng": 129.8820,
        "address": "Pesisir Timur Laut Gunung Api, Kepulauan Banda",
        "island": "Gunung Api",
        "suggested_layer": "LAYER_TOURISM_4A",
        "source": "OFFLINE_GAZETTEER_BANDA",
    },
    {
        "name": "Hatta Reef Diving Wall & Drop-Off",
        "lat": -4.5880,
        "lng": 129.9850,
        "address": "Tanjung Selatan, Pulau Hatta, Kepulauan Banda",
        "island": "Pulau Hatta",
        "suggested_layer": "LAYER_TOURISM_4A",
        "source": "OFFLINE_GAZETTEER_BANDA",
    },
    {
        "name": "Pantai Pasir Enam Lonthoir",
        "lat": -4.5420,
        "lng": 129.9320,
        "address": "Pesisir Lonthoir, Banda Besar, Kepulauan Banda",
        "island": "Banda Besar",
        "suggested_layer": "LAYER_TOURISM_4A",
        "source": "OFFLINE_GAZETTEER_BANDA",
    },
    {
        "name": "Puncak Vulkanik Gunung Api Banda (640 mdpl)",
        "lat": -4.5240,
        "lng": 129.8810,
        "address": "Kawah Vulkanik, Pulau Gunung Api, Kepulauan Banda",
        "island": "Gunung Api",
        "suggested_layer": "LAYER_TOURISM_4A",
        "source": "OFFLINE_GAZETTEER_BANDA",
    },
    {
        "name": "Resto Rumah Mande & Kuliner Ikan Kuah Pala",
        "lat": -4.5245,
        "lng": 129.9030,
        "address": "Jl. Pelabuhan No. 12, Pulau Neira",
        "island": "Pulau Neira",
        "suggested_layer": "LAYER_TOURISM_4A",
        "source": "OFFLINE_GAZETTEER_BANDA",
    },
    {
        "name": "Delfika Homestay & Cafe Spice Garden",
        "lat": -4.5248,
        "lng": 129.9032,
        "address": "Desa Nusantara, Pulau Neira",
        "island": "Pulau Neira",
        "suggested_layer": "LAYER_ACCOMMODATION",
        "source": "OFFLINE_GAZETTEER_BANDA",
    },
    {
        "name": "Cilu Bintang Estate Eco-Resort",
        "lat": -4.5240,
        "lng": 129.9040,
        "address": "Desa Nusantara, Pulau Neira",
        "island": "Pulau Neira",
        "suggested_layer": "LAYER_ACCOMMODATION",
        "source": "OFFLINE_GAZETTEER_BANDA",
    },
    {
        "name": "Dermaga Utama Pelabuhan Banda Neira (PELNI & Ferry)",
        "lat": -4.5250,
        "lng": 129.9015,
        "address": "Pelabuhan Nusantara Neira",
        "island": "Pulau Neira",
        "suggested_layer": "LAYER_PUBLIC_SAFETY",
        "source": "OFFLINE_GAZETTEER_BANDA",
    },
    {
        "name": "RSUD / Puskesmas Perawatan Banda Neira",
        "lat": -4.5218,
        "lng": 129.9065,
        "address": "Desa Nusantara, Pulau Neira",
        "island": "Pulau Neira",
        "suggested_layer": "LAYER_PUBLIC_SAFETY",
        "source": "OFFLINE_GAZETTEER_BANDA",
    },
    {
        "name": "Stasiun Desalinasi Air Minum BWRO Desa Nusantara",
        "lat": -4.5248,
        "lng": 129.9045,
        "address": "Desa Nusantara, Pulau Neira",
        "island": "Pulau Neira",
        "suggested_layer": "LAYER_WATER_INFRA",
        "source": "OFFLINE_GAZETTEER_BANDA",
    },
    {
        "name": "Pusat PLTS Komunal 150 kWp Pulau Ay",
        "lat": -4.5290,
        "lng": 129.8350,
        "address": "Desa Ay, Pulau Ay, Kepulauan Banda",
        "island": "Pulau Ay",
        "suggested_layer": "LAYER_ENERGY_WASTE",
        "source": "OFFLINE_GAZETTEER_BANDA",
    },
]


class LayananGeocoding:
    def __init__(self):
        self.google_api_key = os.getenv("GOOGLE_MAPS_API_KEY", "").strip()

    def deteksi_saran_klaster(self, teks: str) -> str:
        """Deteksi rekomendasi 7 layer spasial berdasarkan nama atau kata kunci."""
        t = teks.lower()
        if any(k in t for k in ["diving", "snorkeling", "pantai", "lava flow", "karang", "wisata", "wall", "puncak", "gunung api", "kuah pala", "kuliner"]):
            return "LAYER_TOURISM_4A"
        elif any(k in t for k in ["benteng", "cagar", "sejarah", "hatta", "sjahrir", "istana mini", "gereja tua", "makam", "voc", "museum"]):
            return "LAYER_HERITAGE"
        elif any(k in t for k in ["homestay", "hotel", "penginapan", "villa", "vila", "estate", "resort", "guesthouse"]):
            return "LAYER_ACCOMMODATION"
        elif any(k in t for k in ["koperasi", "umkm", "kebun", "pala", "pasar", "fuli", "tani", "ikan asar", "toko"]):
            return "LAYER_KOPERASI_UMKM"
        elif any(k in t for k in ["dermaga", "pelabuhan", "puskesmas", "rsud", "polsek", "sar", "pos", "rambu", "speedboat"]):
            return "LAYER_PUBLIC_SAFETY"
        elif any(k in t for k in ["air", "ro", "tandon", "sumur", "desalinasi", "bwro", "swro", "filtrasi", "pam"]):
            return "LAYER_WATER_INFRA"
        elif any(k in t for k in ["plts", "surya", "pltd", "sampah", "bank sampah", "energi", "listrik"]):
            return "LAYER_ENERGY_WASTE"
        return "LAYER_TOURISM_4A"

    def deteksi_pulau(self, nama: str, alamat: str = "", lat: float = -4.52, lng: float = 129.90) -> str:
        """Deteksi pulau berdasarkan nama, alamat, atau koordinat."""
        gabung = f"{nama} {alamat}".lower()
        if "hatta" in gabung:
            return "Pulau Hatta"
        if "lonthoir" in gabung or "banda besar" in gabung or "waer" in gabung:
            return "Banda Besar"
        if "gunung api" in gabung:
            return "Gunung Api"
        if "ay" in gabung or "ai" in gabung:
            return "Pulau Ay"
        if "rhun" in gabung or "run" in gabung:
            return "Pulau Rhun"
        if "pisang" in gabung or "syahrir" in gabung:
            return "Pulau Pisang"
        
        # Koordinat proximity fallback
        if lng > 129.95:
            return "Pulau Hatta"
        if lng < 129.85:
            return "Pulau Ay"
        if lat < -4.535:
            return "Banda Besar"
        if lng < 129.895 and lat > -4.535:
            return "Gunung Api"
        return "Pulau Neira"

    def cari_titik(self, kata_kunci: str, limit: int = 8) -> List[Dict[str, Any]]:
        """
        Mencari koordinat presisi [lat, lng] dengan pembersihan POI luar wilayah.
        Prioritas:
        1. Offline Gazetteer Kepulauan Banda (instan & 100% akurat).
        2. Google Places TextSearch API (jika GOOGLE_MAPS_API_KEY aktif).
        3. OpenStreetMap Nominatim Geocoder dengan Geofencing Bounding Box Banda.
        """
        q_bersih = kata_kunci.strip()
        if not q_bersih or len(q_bersih) < 2:
            return []

        q_lower = q_bersih.lower()
        hasil: List[Dict[str, Any]] = []

        # 1. Cari di Offline Gazetteer Banda
        for item in GAZETTEER_BANDA_LOKAL:
            nama_lower = item["name"].lower()
            if q_lower in nama_lower or any(part in nama_lower for part in q_lower.split() if len(part) >= 3):
                hasil.append({
                    "name": item["name"],
                    "lat": round(item["lat"], 6),
                    "lng": round(item["lng"], 6),
                    "address": item["address"],
                    "island": item["island"],
                    "suggested_layer": item["suggested_layer"],
                    "source": item["source"],
                })

        # 2. Jika Google Places API Key Dikonfigurasi
        if self.google_api_key and len(hasil) < limit:
            try:
                gmaps_res = self._cari_via_google_places(q_bersih)
                for g in gmaps_res:
                    if not any(h["name"].lower() == g["name"].lower() for h in hasil):
                        hasil.append(g)
            except Exception:
                pass

        # 3. Fallback OSM Nominatim Geocoder dengan Geofence Bounding Box
        if len(hasil) < limit:
            try:
                osm_res = self._cari_via_nominatim(q_bersih)
                for o in osm_res:
                    if not any(h["name"].lower() == o["name"].lower() for h in hasil):
                        hasil.append(o)
            except Exception:
                pass

        return hasil[:limit]

    def _cari_via_google_places(self, query: str) -> List[Dict[str, Any]]:
        query_terarah = f"{query} Banda Neira Maluku"
        url = (
            "https://maps.googleapis.com/maps/api/place/textsearch/json?"
            + urllib.parse.urlencode({
                "query": query_terarah,
                "location": "-4.5285,129.9015",
                "radius": "25000",
                "key": self.google_api_key,
            })
        )
        req = urllib.request.Request(url, headers={"User-Agent": "BandaDigitalEcosystem/1.0"})
        with urllib.request.urlopen(req, timeout=4) as respon:
            data = json.loads(respon.read().decode("utf-8"))

        daftar = []
        for p in data.get("results", []):
            loc = p.get("geometry", {}).get("location", {})
            lat = float(loc.get("lat", 0))
            lng = float(loc.get("lng", 0))

            # Geofencing Guard Kepulauan Banda
            if not (BANDA_BBOX["min_lat"] <= lat <= BANDA_BBOX["max_lat"] and BANDA_BBOX["min_lng"] <= lng <= BANDA_BBOX["max_lng"]):
                continue

            nama = p.get("name", query)
            alamat = p.get("formatted_address", "Kepulauan Banda, Maluku Tengah")
            saran_layer = self.deteksi_saran_klaster(nama)
            pulau = self.deteksi_pulau(nama, alamat, lat, lng)

            daftar.append({
                "name": nama,
                "lat": round(lat, 6),
                "lng": round(lng, 6),
                "address": alamat,
                "island": pulau,
                "suggested_layer": saran_layer,
                "source": "GOOGLE_MAPS_VERIFIED",
            })
        return daftar

    def _cari_via_nominatim(self, query: str) -> List[Dict[str, Any]]:
        query_terarah = f"{query} Banda Neira"
        url = (
            "https://nominatim.openstreetmap.org/search?"
            + urllib.parse.urlencode({
                "q": query_terarah,
                "format": "json",
                "limit": 5,
                "viewbox": "129.75,-4.45,130.15,-4.68",
                "bounded": 0,
                "addressdetails": 1,
            })
        )
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "BandaDigital-Spatial-Service/1.0 (admin@bandadigital.id)"},
        )
        with urllib.request.urlopen(req, timeout=4) as respon:
            data = json.loads(respon.read().decode("utf-8"))

        daftar = []
        for p in data:
            lat = float(p.get("lat", 0))
            lng = float(p.get("lon", 0))

            # Geofence guard
            if not (BANDA_BBOX["min_lat"] <= lat <= BANDA_BBOX["max_lat"] and BANDA_BBOX["min_lng"] <= lng <= BANDA_BBOX["max_lng"]):
                continue

            nama = p.get("name") or p.get("display_name", "").split(",")[0] or query
            alamat = p.get("display_name", "Kepulauan Banda, Maluku Tengah")
            saran_layer = self.deteksi_saran_klaster(nama)
            pulau = self.deteksi_pulau(nama, alamat, lat, lng)

            daftar.append({
                "name": nama,
                "lat": round(lat, 6),
                "lng": round(lng, 6),
                "address": alamat,
                "island": pulau,
                "suggested_layer": saran_layer,
                "source": "OSM_NOMINATIM_VERIFIED",
            })
        return daftar


geocoding_service = LayananGeocoding()
