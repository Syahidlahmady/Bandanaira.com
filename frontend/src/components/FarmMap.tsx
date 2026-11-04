import React, { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { FarmGeoJSONFeature } from '../services/farmers'

interface FarmMapProps {
  features: FarmGeoJSONFeature[]
  onSelectFarm?: (farmId: string) => void
}

export const FarmMap: React.FC<FarmMapProps> = ({ features, onSelectFarm }) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const layerGroupRef = useRef<L.LayerGroup | null>(null)

  useEffect(() => {
    if (!mapContainerRef.current) return

    // Initialize Leaflet Map centered on Banda Neira
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current).setView([-4.5255, 129.9042], 13)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map)

      layerGroupRef.current = L.layerGroup().addTo(map)
      mapInstanceRef.current = map
    }

    // Refresh markers
    if (layerGroupRef.current) {
      layerGroupRef.current.clearLayers()

      features.forEach((feature) => {
        const [lng, lat] = feature.geometry.coordinates
        const { name, commodity, area_sqm, farm_code, location_description } = feature.properties

        const isPala = commodity.toLowerCase().includes('pala')
        const markerColor = isPala ? '#1e3a8a' : '#059669'

        // Custom HTML circle marker icon
        const customIcon = L.divIcon({
          className: 'custom-farm-pin',
          html: `<div style="
            background-color: ${markerColor};
            width: 22px;
            height: 22px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 10px;
            font-weight: bold;
          ">${isPala ? 'P' : 'C'}</div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        })

        const marker = L.marker([lat, lng], { icon: customIcon })
        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 13px; line-height: 1.4;">
            <b style="font-size: 14px; color: #1e3a8a;">${name}</b><br/>
            <span style="color: #64748b; font-size: 11px;">Kode: ${farm_code}</span><br/>
            <b>Komoditas:</b> <span style="color: ${markerColor}; font-weight: 600;">${commodity}</span><br/>
            <b>Luas Lahan:</b> ${area_sqm.toLocaleString()} m²<br/>
            ${location_description ? `<b>Lokasi:</b> ${location_description}<br/>` : ''}
            <small style="color: #64748b;">Koordinat: ${lat.toFixed(4)}, ${lng.toFixed(4)}</small>
          </div>
        `)

        if (onSelectFarm) {
          marker.on('click', () => onSelectFarm(feature.id))
        }

        layerGroupRef.current?.addLayer(marker)
      })
    }
  }, [features, onSelectFarm])

  return (
    <div style={{ position: 'relative', width: '100%', height: '420px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
      <div
        style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
          background: 'rgba(255, 255, 255, 0.92)',
          padding: '6px 12px',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: 600,
          zIndex: 1000,
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          display: 'flex',
          gap: '12px',
        }}
      >
        <span style={{ color: '#1e3a8a' }}>● Pala (P)</span>
        <span style={{ color: '#059669' }}>● Cengkih (C)</span>
      </div>
    </div>
  )
}
