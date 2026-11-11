#!/usr/bin/env python3
"""
Simulator Hardware IoT ESP32 untuk Ekosistem Digital Banda Neira (BST-NIRANA).
Mensimulasikan pengiriman paket data sensor:
- Sensor Kualitas Air: TDS Sensor BWRO/SWRO (ppm) & Ketinggian Tandon (%)
- Sensor Energi Terbarukan: Tegangan Panel Surya (V), Arus (A), Watt, & Baterai SoC (%)
"""

import argparse
import json
import random
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone

STATIONS = [
    {
        "code": "RO-STATION-LONTHOIR-01",
        "name": "Stasiun BWRO Lonthoir (Perkebunan Pala)",
        "island": "Banda Besar (Lonthoir)",
        "base_raw_tds": 2400.0,
        "base_filtered_tds": 52.0,
        "tank_pct": 88.0,
        "power_source": "SOLAR_DIRECT_GRAVITY",
    },
    {
        "code": "RO-STATION-NEIRA-PELABUHAN",
        "name": "Dispenser Pelabuhan Banda Neira",
        "island": "Pulau Neira",
        "base_raw_tds": 1850.0,
        "base_filtered_tds": 45.0,
        "tank_pct": 92.0,
        "power_source": "SOLAR_DIRECT_GRAVITY",
    },
    {
        "code": "RO-STATION-HATTA-MASJID",
        "name": "Kiosk Air Bersih Masjid Hatta",
        "island": "Pulau Hatta",
        "base_raw_tds": 2800.0,
        "base_filtered_tds": 65.0,
        "tank_pct": 76.0,
        "power_source": "SOLAR_DIRECT_GRAVITY",
    },
    {
        "code": "RO-STATION-AY-CENTRAL",
        "name": "Stasiun SWRO Pulau Ay Terpadu",
        "island": "Pulau Ay",
        "base_raw_tds": 3200.0,
        "base_filtered_tds": 72.0,
        "tank_pct": 81.0,
        "power_source": "HYBRID_BATTERY",
    },
]


def post_telemetry(api_base: str, payload: dict) -> dict:
    url = f"{api_base.rstrip('/')}/iot/telemetri"
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url, data=data, headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=5) as response:
        return json.loads(response.read().decode("utf-8"))


def run_simulation(api_base: str, iterations: int, delay: float):
    print("=" * 80)
    print(" 📡 SIMULATOR HARDWARE IoT ESP32 — EKOSISTEM PULAU BANDA NEIRA")
    print(f" Target API: {api_base}")
    print(f" Siklus: {iterations} iterasi | Jeda: {delay} detik")
    print("=" * 80)

    for i in range(1, iterations + 1):
        print(f"\n[Gelombang {i}/{iterations} — {datetime.now().strftime('%H:%M:%S')}]")
        for st in STATIONS:
            tds_fluct = round(random.uniform(-2.5, 3.0), 1)
            filtered_tds = round(st["base_filtered_tds"] + tds_fluct, 1)

            volt = round(random.uniform(25.0, 27.5), 1)
            amp = round(random.uniform(7.0, 11.5), 1)
            watts = round(volt * amp, 1)
            soc = round(random.uniform(85.0, 98.0), 1)
            tank = round(st["tank_pct"] + random.uniform(-1.0, 0.5), 1)

            packet = {
                "station_code": st["code"],
                "station_name": st["name"],
                "island_name": st["island"],
                "water_metrics": {
                    "raw_water_tds_ppm": st["base_raw_tds"],
                    "filtered_water_tds_ppm": filtered_tds,
                    "clean_tank_level_pct": tank,
                    "daily_dispensed_liters": round(random.uniform(100.0, 500.0), 1),
                    "valve_status": "CLOSED",
                },
                "energy_metrics": {
                    "active_source": st["power_source"],
                    "solar_panel_voltage_v": volt,
                    "solar_current_a": amp,
                    "power_watt": watts,
                    "battery_soc_pct": soc,
                },
            }

            try:
                res = post_telemetry(api_base, packet)
                alert = res.get("alert_level", "NORMAL")
                icon = "🟢" if alert == "NORMAL" else "🟡" if alert == "WARNING" else "🔴"
                print(
                    f" {icon} [{st['code']}] TDS: {filtered_tds} ppm | Tandon: {tank}% | Daya: {watts} W | Baterai: {soc}% ({alert})"
                )
            except Exception as ex:
                print(f" ❌ Gagal mengirim paket ke {st['code']}: {ex}")

        if i < iterations:
            time.sleep(delay)

    print("\n" + "=" * 80)
    print(" ✅ Simulasi telemetri hardware selesai.")
    print("=" * 80)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Simulate IoT sensor packets")
    parser.add_argument("--api", default="http://localhost:8005/api/v1", help="API base URL")
    parser.add_argument("--iterations", type=int, default=3, help="Number of telemetry waves")
    parser.add_argument("--delay", type=float, default=2.0, help="Seconds between waves")
    args = parser.parse_args()

    run_simulation(args.api, args.iterations, args.delay)
