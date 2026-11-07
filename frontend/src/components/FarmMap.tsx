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
        const { name, commodity, area_sqm, farm_code, location_description, verification_status } = feature.properties

        const isPala = commodity.toLowerCase().includes('pala')
        const markerColor = isPala ? '#1e3a8a' : '#059669'
        const isPending = verification_status === 'pending'
        const isRejected = verification_status === 'rejected'
        const borderColor = isPending ? '#f59e0b' : isRejected ? '#ef4444' : '#10b981'

        // Custom HTML circle marker icon
        const customIcon = L.divIcon({
          className: 'custom-farm-pin',
          html: `<div style="
            background-color: ${markerColor};
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 3px solid ${borderColor};
            box-shadow: 0 2px 5px rgba(0,0,0,0.35);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 10px;
            font-weight: bold;
          ">${isPala ? 'P' : 'C'}</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        })

        const statusBadgeHtml = isPending
          ? '<div style="display: inline-block; padding: 2px 7px; border-radius: 4px; font-size: 11px; font-weight: bold; background: #fffbeb; color: #b45309; border: 1px solid #fde68a; margin-top: 5px;">⏳ Menunggu Persetujuan Kantor Desa</div>'
          : isRejected
          ? '<div style="display: inline-block; padding: 2px 7px; border-radius: 4px; font-size: 11px; font-weight: bold; background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; margin-top: 5px;">✕ Ditolak Kantor Desa</div>'
          : '<div style="display: inline-block; padding: 2px 7px; border-radius: 4px; font-size: 11px; font-weight: bold; background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; margin-top: 5px;">✓ Terverifikasi Kantor Desa</div>'

        const marker = L.marker([lat, lng], { icon: customIcon })
        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 13px; line-height: 1.45; min-width: 180px;">
            <b style="font-size: 14px; color: #1e3a8a;">${name}</b><br/>
            <span style="color: #64748b; font-size: 11px; font-family: monospace;">Kode: ${farm_code}</span><br/>
            <b>Komoditas:</b> <span style="color: ${markerColor}; font-weight: 600;">${commodity}</span><br/>
            <b>Luas Lahan:</b> ${area_sqm.toLocaleString()} m²<br/>
            ${location_description ? `<b>Lokasi:</b> ${location_description}<br/>` : ''}
            <small style="color: #64748b;">Koordinat: ${lat.toFixed(4)}, ${lng.toFixed(4)}</small><br/>
            ${statusBadgeHtml}
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
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '6px 12px',
          borderRadius: '6px',
          fontSize: '11px',
          fontWeight: 600,
          zIndex: 1000,
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <span style={{ color: '#1e3a8a' }}>● Pala (P)</span>
        <span style={{ color: '#059669' }}>● Cengkih (C)</span>
        <span style={{ color: '#047857' }}>✓ Disetujui</span>
        <span style={{ color: '#b45309' }}>⏳ Menunggu Persetujuan</span>
      </div>
    </div>
  )
}
