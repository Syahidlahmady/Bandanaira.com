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

        // Custom Location Pin SVG Icon
        const pinHtml = `
          <div style="
            position: relative;
            width: 28px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            filter: drop-shadow(0 3px 6px rgba(0,0,0,0.35));
            cursor: pointer;
          ">
            <svg width="28" height="36" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M14 0C6.268 0 0 6.268 0 14C0 23.8 12.2 34.6 13.3 35.6C13.7 35.9 14.3 35.9 14.7 35.6C15.8 34.6 28 23.8 28 14C28 6.268 21.732 0 14 0Z"
                fill="${markerColor}"
                stroke="${borderColor}"
                stroke-width="2"
              />
              <circle cx="14" cy="13.5" r="6" fill="#ffffff" />
              <text x="14" y="17" text-anchor="middle" fill="${markerColor}" font-size="9" font-weight="800" font-family="sans-serif">${isPala ? 'P' : 'C'}</text>
            </svg>
          </div>
        `

        const customIcon = L.divIcon({
          className: 'custom-farm-pin',
          html: pinHtml,
          iconSize: [28, 36],
          iconAnchor: [14, 36],
          popupAnchor: [0, -36],
        })

        const statusBadgeHtml = isPending
          ? '<div style="display: inline-block; padding: 2px 7px; border-radius: 4px; font-size: 11px; font-weight: bold; background: #fffbeb; color: #b45309; border: 1px solid #fde68a; margin-top: 5px;">Menunggu Persetujuan Kantor Desa</div>'
          : isRejected
          ? '<div style="display: inline-block; padding: 2px 7px; border-radius: 4px; font-size: 11px; font-weight: bold; background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; margin-top: 5px;">Ditolak Kantor Desa</div>'
          : '<div style="display: inline-block; padding: 2px 7px; border-radius: 4px; font-size: 11px; font-weight: bold; background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; margin-top: 5px;">Terverifikasi Kantor Desa</div>'

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

        // Render polygon boundary jika tersedia
        if (feature.properties.polygon_boundary_geojson) {
          try {
            const polyLayer = L.geoJSON(feature.properties.polygon_boundary_geojson as any, {
              style: {
                color: borderColor,
                weight: 2,
                opacity: 0.85,
                fillColor: markerColor,
                fillOpacity: 0.22,
              },
            })
            polyLayer.bindTooltip(`Plot: ${name} (${area_sqm.toLocaleString()} m²)`, {
              sticky: true,
              direction: 'top',
            })
            layerGroupRef.current?.addLayer(polyLayer)
          } catch {
            // ignore invalid polygon draw
          }
        }
      })
    }
  }, [features, onSelectFarm])


  return (
    <div style={{ position: 'relative', width: '100%', height: '420px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
      {/* Atlas-Style Farm Map Legend Box */}
      <div
        data-lenis-prevent
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          background: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(8px)',
          border: '1.5px solid #cbd5e1',
          borderRadius: '8px',
          padding: '8px 12px',
          fontSize: '11px',
          zIndex: 1000,
          boxShadow: '0 4px 16px rgba(15, 44, 89, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          maxWidth: '220px',
        }}
      >
        <div style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0f2c59', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>
          Legenda Kebun
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="12" height="15" viewBox="0 0 28 36" fill="none">
              <path d="M14 0C6.268 0 0 6.268 0 14C0 23.8 12.2 34.6 13.3 35.6C13.7 35.9 14.3 35.9 14.7 35.6C15.8 34.6 28 23.8 28 14C28 6.268 21.732 0 14 0Z" fill="#1e3a8a" stroke="#ffffff" strokeWidth="2" />
              <circle cx="14" cy="13.5" r="5" fill="#ffffff" />
            </svg>
            <span style={{ color: '#0f2c59', fontWeight: 600 }}>Kebun Pala (P)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="12" height="15" viewBox="0 0 28 36" fill="none">
              <path d="M14 0C6.268 0 0 6.268 0 14C0 23.8 12.2 34.6 13.3 35.6C13.7 35.9 14.3 35.9 14.7 35.6C15.8 34.6 28 23.8 28 14C28 6.268 21.732 0 14 0Z" fill="#059669" stroke="#ffffff" strokeWidth="2" />
              <circle cx="14" cy="13.5" r="5" fill="#ffffff" />
            </svg>
            <span style={{ color: '#0f2c59', fontWeight: 600 }}>Kebun Cengkih (C)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', fontSize: '10px', color: '#64748b', paddingTop: '3px', borderTop: '1px dashed #e2e8f0' }}>
            <span style={{ color: '#047857', fontWeight: 600 }}>Terverifikasi</span>
            <span style={{ color: '#b45309', fontWeight: 600 }}>Menunggu</span>
          </div>
        </div>
      </div>
    </div>
  )
}
