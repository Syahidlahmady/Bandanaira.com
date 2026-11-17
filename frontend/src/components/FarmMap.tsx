import React, { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  Compass,
  Crosshair,
  Layers,
  MapPin,
  Maximize2,
  Minimize2,
  Navigation,
  RefreshCw,
  Trash2,
  Undo,
} from 'lucide-react'
import { FarmGeoJSONFeature } from '../services/farmers'

export type FarmBasemapId = 'satellite' | 'standard' | 'terrain'

export interface FarmDraftGeometry {
  latitude: number
  longitude: number
  area_sqm: number
  vertices: [number, number][]
  polygon_boundary_geojson?: Record<string, unknown>
}

export interface FarmMapProps {
  features: FarmGeoJSONFeature[]
  onSelectFarm?: (farmId: string) => void
  editable?: boolean
  draftLat?: number
  draftLng?: number
  draftVertices?: [number, number][]
  onDraftChange?: (draft: FarmDraftGeometry) => void
  focusFarmId?: string | null
  activeVillageName?: string
  villageBoundaryGeoJSON?: any
}

const BANDA_ARCHIPELAGO_BOUNDS = L.latLngBounds(
  [-4.7000, 129.6000],
  [-4.3800, 130.1500]
)

const ISLAND_JUMP_PRESETS = [
  { label: 'Pulau Neira', lat: -4.5255, lng: 129.9042, zoom: 14 },
  { label: 'Lonthoir / Banda Besar', lat: -4.5460, lng: 129.9140, zoom: 14 },
  { label: 'Pulau Ai', lat: -4.5260, lng: 129.7740, zoom: 14 },
  { label: 'Pulau Hatta', lat: -4.5880, lng: 130.0360, zoom: 14 },
  { label: 'Pulau Rhun', lat: -4.5520, lng: 129.6830, zoom: 14 },
] as const

const BASEMAP_OPTIONS: Record<
  FarmBasemapId,
  { label: string; url: string; attribution: string; maxZoom: number; subdomains?: string[] }
> = {
  satellite: {
    label: 'Satelit',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; DigitalGlobe, GeoEye, Earthstar Geographics',
    maxZoom: 19,
  },
  standard: {
    label: 'Standar',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
    subdomains: ['a', 'b', 'c'],
  },
  terrain: {
    label: 'Topografi',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; USGS, DeLorme, NAVTEQ',
    maxZoom: 19,
  },
}

const computeSphericalAreaSqm = (vertices: [number, number][]): number => {
  if (vertices.length < 3) return 0
  const closed = [...vertices, vertices[0]]
  const rEarth = 6371008.8
  let total = 0
  for (let i = 0; i < closed.length - 1; i++) {
    const lat1 = (closed[i][0] * Math.PI) / 180
    const lon1 = (closed[i][1] * Math.PI) / 180
    const lat2 = (closed[i + 1][0] * Math.PI) / 180
    const lon2 = (closed[i + 1][1] * Math.PI) / 180
    total += (lon2 - lon1) * (2 + Math.sin(lat1) + Math.sin(lat2))
  }
  return Math.round(Math.abs((total * rEarth * rEarth) / 2))
}

const buildPolygonGeoJSON = (vertices: [number, number][]): Record<string, unknown> | undefined => {
  if (vertices.length < 3) return undefined
  const ring = vertices.map(([lat, lng]) => [parseFloat(lng.toFixed(6)), parseFloat(lat.toFixed(6))])
  ring.push([ring[0][0], ring[0][1]])
  return {
    type: 'Polygon',
    coordinates: [ring],
  }
}

const computeCentroid = (vertices: [number, number][], fallbackLat: number, fallbackLng: number): [number, number] => {
  if (vertices.length === 0) return [fallbackLat, fallbackLng]
  const sumLat = vertices.reduce((acc, pt) => acc + pt[0], 0)
  const sumLng = vertices.reduce((acc, pt) => acc + pt[1], 0)
  return [
    parseFloat((sumLat / vertices.length).toFixed(6)),
    parseFloat((sumLng / vertices.length).toFixed(6)),
  ]
}

export const generateSquarePolygonVertices = (
  lat: number,
  lng: number,
  targetAreaSqm: number
): [number, number][] => {
  const halfSideMeters = Math.sqrt(targetAreaSqm) / 2
  const dLat = halfSideMeters / 111320
  const cosLat = Math.max(Math.cos((lat * Math.PI) / 180), 0.1)
  const dLng = halfSideMeters / (111320 * cosLat)
  return [
    [parseFloat((lat + dLat).toFixed(6)), parseFloat((lng - dLng).toFixed(6))],
    [parseFloat((lat + dLat).toFixed(6)), parseFloat((lng + dLng).toFixed(6))],
    [parseFloat((lat - dLat).toFixed(6)), parseFloat((lng + dLng).toFixed(6))],
    [parseFloat((lat - dLat).toFixed(6)), parseFloat((lng - dLng).toFixed(6))],
  ]
}

export const FarmMap: React.FC<FarmMapProps> = ({
  features,
  onSelectFarm,
  editable = false,
  draftLat = -4.5255,
  draftLng = 129.9042,
  draftVertices = [],
  onDraftChange,
  focusFarmId = null,
  activeVillageName,
  villageBoundaryGeoJSON,
}) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const layerGroupRef = useRef<L.LayerGroup | null>(null)
  const villageBoundaryLayerRef = useRef<L.GeoJSON | null>(null)
  const baseTileLayerRef = useRef<L.TileLayer | null>(null)
  const labelsTileLayerRef = useRef<L.TileLayer | null>(null)
  const draftCenterMarkerRef = useRef<L.Marker | null>(null)
  const draftPolygonRef = useRef<L.Polygon | L.Polyline | null>(null)
  const draftVertexMarkersRef = useRef<L.Marker[]>([])
  const markersByFarmIdRef = useRef<Record<string, L.Marker>>({})

  const [activeBasemap, setActiveBasemap] = useState<FarmBasemapId>(editable ? 'satellite' : 'standard')
  const [showLabels, setShowLabels] = useState<boolean>(true)
  const [editMode, setEditMode] = useState<'move' | 'add'>(editable ? 'add' : 'move')
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)

  // Keep latest props & callback in refs so Leaflet event handlers never capture stale closures
  const latestStateRef = useRef({
    editable,
    editMode,
    draftLat,
    draftLng,
    draftVertices,
    onDraftChange,
  })
  latestStateRef.current = {
    editable,
    editMode,
    draftLat,
    draftLng,
    draftVertices,
    onDraftChange,
  }

  const emitDraftUpdate = (nextVertices: [number, number][], overrideLat?: number, overrideLng?: number) => {
    const { draftLat: curLat, draftLng: curLng, onDraftChange: cb } = latestStateRef.current
    if (!cb) return
    const [centerLat, centerLng] =
      overrideLat !== undefined && overrideLng !== undefined
        ? [overrideLat, overrideLng]
        : computeCentroid(nextVertices, curLat, curLng)
    const polygonGeoJSON = buildPolygonGeoJSON(nextVertices)
    const areaSqm = polygonGeoJSON ? computeSphericalAreaSqm(nextVertices) : 0
    cb({
      latitude: centerLat,
      longitude: centerLng,
      area_sqm: areaSqm,
      vertices: nextVertices,
      polygon_boundary_geojson: polygonGeoJSON,
    })
  }

  // Listen to native fullscreen exit
  useEffect(() => {
    const handleFsChange = () => {
      const active = Boolean(document.fullscreenElement)
      setIsFullscreen(active)
      setTimeout(() => mapInstanceRef.current?.invalidateSize(), 150)
    }
    document.addEventListener('fullscreenchange', handleFsChange)
    return () => document.removeEventListener('fullscreenchange', handleFsChange)
  }, [])

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (wrapperRef.current?.requestFullscreen) {
          await wrapperRef.current.requestFullscreen()
          return
        }
      } else if (document.exitFullscreen) {
        await document.exitFullscreen()
        return
      }
    } catch {
      // fallback to CSS fullscreen toggle
    }
    setIsFullscreen((prev) => !prev)
    setTimeout(() => mapInstanceRef.current?.invalidateSize(), 150)
  }

  // Basemap updater
  const applyBasemap = (basemap: FarmBasemapId, labelsEnabled: boolean, targetMap?: L.Map | null) => {
    const map = targetMap || mapInstanceRef.current
    if (!map) return
    const cfg = BASEMAP_OPTIONS[basemap]
    if (baseTileLayerRef.current) {
      map.removeLayer(baseTileLayerRef.current)
      baseTileLayerRef.current = null
    }
    if (labelsTileLayerRef.current) {
      map.removeLayer(labelsTileLayerRef.current)
      labelsTileLayerRef.current = null
    }
    const baseLayer = L.tileLayer(cfg.url, {
      attribution: cfg.attribution,
      maxZoom: cfg.maxZoom,
      subdomains: cfg.subdomains || ['a', 'b', 'c'],
    }).addTo(map)
    baseLayer.bringToBack()
    baseTileLayerRef.current = baseLayer

    if (basemap === 'satellite' && labelsEnabled) {
      const labelsLayer = L.tileLayer(
        'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        { attribution: '&copy; Esri', maxZoom: 19 }
      ).addTo(map)
      labelsTileLayerRef.current = labelsLayer
    }
  }

  // Initialize Leaflet Map once
  useEffect(() => {
    if (!mapContainerRef.current) return

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [draftLat || -4.5255, draftLng || 129.9042],
        zoom: 13,
        minZoom: 11,
        maxZoom: 19,
        maxBounds: BANDA_ARCHIPELAGO_BOUNDS,
        maxBoundsViscosity: 1.0,
      })

      layerGroupRef.current = L.layerGroup().addTo(map)
      mapInstanceRef.current = map
      applyBasemap(activeBasemap, showLabels, map)

      map.on('click', (e: L.LeafletMouseEvent) => {
        const { editable: canEdit, editMode: mode, draftVertices: curVerts } = latestStateRef.current
        if (!canEdit) return
        const lat = parseFloat(e.latlng.lat.toFixed(6))
        const lng = parseFloat(e.latlng.lng.toFixed(6))

        if (mode === 'add') {
          const nextVerts: [number, number][] = [...curVerts, [lat, lng]]
          emitDraftUpdate(nextVerts)
        }
      })

      setTimeout(() => mapInstanceRef.current?.invalidateSize(), 150)
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Update basemap when toggled
  useEffect(() => {
    if (mapInstanceRef.current) {
      applyBasemap(activeBasemap, showLabels)
    }
  }, [activeBasemap, showLabels])

  // Render saved farms layer
  useEffect(() => {
    if (!layerGroupRef.current) return
    layerGroupRef.current.clearLayers()
    markersByFarmIdRef.current = {}

    features.forEach((feature) => {
      const [lng, lat] = feature.geometry.coordinates
      const { name, commodity, area_sqm, farm_code, location_description, verification_status } = feature.properties

      const isPala = commodity.toLowerCase().includes('pala')
      const markerColor = isPala ? '#1e3a8a' : '#059669'
      const isPending = verification_status === 'pending'
      const isRejected = verification_status === 'rejected'
      const borderColor = isPending ? '#f59e0b' : isRejected ? '#ef4444' : '#10b981'

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

      markersByFarmIdRef.current[feature.id] = marker
      layerGroupRef.current?.addLayer(marker)

      if (feature.properties.polygon_boundary_geojson) {
        try {
          const polyLayer = L.geoJSON(feature.properties.polygon_boundary_geojson as any, {
            style: {
              color: borderColor,
              weight: 2,
              opacity: 0.9,
              fillColor: markerColor,
              fillOpacity: 0.24,
            },
          })
          polyLayer.bindTooltip(`Plot: ${name} (${area_sqm.toLocaleString()} m²)`, {
            sticky: true,
            direction: 'top',
          })
          layerGroupRef.current?.addLayer(polyLayer)
        } catch {
          // ignore invalid polygon
        }
      }
    })
  }, [features, onSelectFarm])

  // Focus specific farm from table
  useEffect(() => {
    if (!focusFarmId || !mapInstanceRef.current) return
    const targetFeature = features.find((f) => f.id === focusFarmId)
    if (!targetFeature) return
    const [lng, lat] = targetFeature.geometry.coordinates
    mapInstanceRef.current.flyTo([lat, lng], 16, { duration: 0.7 })
    const marker = markersByFarmIdRef.current[focusFarmId]
    if (marker) {
      setTimeout(() => marker.openPopup(), 450)
    }
  }, [focusFarmId, features])

  // Render official village administrative boundary if provided
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    if (villageBoundaryLayerRef.current) {
      villageBoundaryLayerRef.current.remove()
      villageBoundaryLayerRef.current = null
    }

    if (villageBoundaryGeoJSON) {
      try {
        const boundaryLayer = L.geoJSON(villageBoundaryGeoJSON as any, {
          style: {
            color: '#d97706',
            weight: 2.5,
            dashArray: '6, 6',
            fillColor: '#fef3c7',
            fillOpacity: 0.12,
          },
        })
        boundaryLayer.bindTooltip(
          `Batas Resmi Wilayah: Desa ${activeVillageName || 'Yurisdiksi'}`,
          { sticky: true, direction: 'center' }
        )
        boundaryLayer.addTo(map)
        villageBoundaryLayerRef.current = boundaryLayer

        try {
          const bounds = boundaryLayer.getBounds()
          if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [35, 35], maxZoom: 15 })
          }
        } catch {
          // ignore invalid bounds
        }
      } catch (err) {
        console.warn('Gagal memuat batas resmi desa pada peta kebun:', err)
      }
    }
  }, [villageBoundaryGeoJSON, activeVillageName])

  // Render editable draft center pin + draft polygon + draggable vertex handles
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    if (draftCenterMarkerRef.current) {
      draftCenterMarkerRef.current.remove()
      draftCenterMarkerRef.current = null
    }
    if (draftPolygonRef.current) {
      draftPolygonRef.current.remove()
      draftPolygonRef.current = null
    }
    draftVertexMarkersRef.current.forEach((m) => m.remove())
    draftVertexMarkersRef.current = []

    if (!editable) return

    // 1. Draft center marker (draggable)
    const centerPinIcon = L.divIcon({
      className: 'farm-draft-center-pin',
      html: `
        <div style="position: relative; width: 32px; height: 42px; display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 4px 10px rgba(239, 68, 68, 0.45)); cursor: grab;">
          <svg width="32" height="42" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 0C6.268 0 0 6.268 0 14C0 23.8 12.2 34.6 13.3 35.6C13.7 35.9 14.3 35.9 14.7 35.6C15.8 34.6 28 23.8 28 14C28 6.268 21.732 0 14 0Z" fill="#ef4444" stroke="#ffffff" stroke-width="2" />
            <circle cx="14" cy="13.5" r="5.5" fill="#ffffff" />
            <circle cx="14" cy="13.5" r="2.8" fill="#ef4444" />
          </svg>
        </div>
      `,
      iconSize: [32, 42],
      iconAnchor: [16, 42],
      popupAnchor: [0, -42],
    })

    const centerMarker = L.marker([draftLat, draftLng], {
      icon: centerPinIcon,
      draggable: true,
      zIndexOffset: 500,
    }).addTo(map)
    centerMarker.bindTooltip('Titik Tengah Lahan Baru (Geser untuk memindahkan)', { direction: 'top' })
    centerMarker.on('dragend', (ev: any) => {
      const pos = ev.target.getLatLng()
      const newLat = parseFloat(pos.lat.toFixed(6))
      const newLng = parseFloat(pos.lng.toFixed(6))
      const { draftLat: prevLat, draftLng: prevLng, draftVertices: curVerts } = latestStateRef.current
      const dLat = newLat - prevLat
      const dLng = newLng - prevLng
      const shiftedVerts: [number, number][] = curVerts.map(([vLat, vLng]) => [
        parseFloat((vLat + dLat).toFixed(6)),
        parseFloat((vLng + dLng).toFixed(6)),
      ])
      emitDraftUpdate(shiftedVerts, newLat, newLng)
    })
    draftCenterMarkerRef.current = centerMarker

    // 2. Draft polygon / polyline
    if (draftVertices.length >= 3) {
      const poly = L.polygon(draftVertices, {
        color: '#f59e0b',
        weight: 3,
        fillColor: '#fbbf24',
        fillOpacity: 0.35,
      }).addTo(map)
      draftPolygonRef.current = poly
    } else if (draftVertices.length === 2) {
      const line = L.polyline(draftVertices, {
        color: '#f59e0b',
        weight: 2.5,
        dashArray: '5, 5',
      }).addTo(map)
      draftPolygonRef.current = line
    }

    // 3. Numbered draggable vertex handles
    draftVertices.forEach(([vLat, vLng], idx) => {
      const vertexIcon = L.divIcon({
        className: 'farm-draft-vertex-handle',
        html: `
          <div style="
            width: 24px;
            height: 24px;
            background: #ffffff;
            border: 2.5px solid #d97706;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: 800;
            color: #0f2c59;
            box-shadow: 0 2px 6px rgba(0,0,0,0.32);
            cursor: grab;
            user-select: none;
          ">
            ${idx + 1}
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      })

      const vMarker = L.marker([vLat, vLng], {
        icon: vertexIcon,
        draggable: true,
        zIndexOffset: 600,
      }).addTo(map)

      vMarker.on('drag', (ev: any) => {
        const pos = ev.target.getLatLng()
        const preview = [...draftVertices]
        preview[idx] = [parseFloat(pos.lat.toFixed(6)), parseFloat(pos.lng.toFixed(6))]
        if (draftPolygonRef.current) {
          draftPolygonRef.current.setLatLngs(preview)
        }
      })

      vMarker.on('dragend', (ev: any) => {
        const pos = ev.target.getLatLng()
        const nextVerts = [...latestStateRef.current.draftVertices]
        nextVerts[idx] = [parseFloat(pos.lat.toFixed(6)), parseFloat(pos.lng.toFixed(6))]
        emitDraftUpdate(nextVerts)
      })

      vMarker.on('contextmenu', (ev: any) => {
        L.DomEvent.stopPropagation(ev)
        const nextVerts = latestStateRef.current.draftVertices.filter((_, i) => i !== idx)
        emitDraftUpdate(nextVerts)
      })

      draftVertexMarkersRef.current.push(vMarker)
    })
  }, [editable, draftLat, draftLng, draftVertices])

  const handleApplySquarePreset = (areaSqm: number) => {
    const verts = generateSquarePolygonVertices(draftLat, draftLng, areaSqm)
    emitDraftUpdate(verts, draftLat, draftLng)
    setEditMode('move')
    mapInstanceRef.current?.flyTo([draftLat, draftLng], 17, { duration: 0.6 })
  }

  const handleJumpToIsland = (lat: number, lng: number, zoom: number) => {
    mapInstanceRef.current?.flyTo([lat, lng], zoom, { duration: 0.65 })
    if (editable && draftVertices.length === 0) {
      emitDraftUpdate([], lat, lng)
    }
  }

  const draftAreaSqm = draftVertices.length >= 3 ? computeSphericalAreaSqm(draftVertices) : 0

  return (
    <div
      ref={wrapperRef}
      style={{
        position: isFullscreen ? 'fixed' : 'relative',
        inset: isFullscreen ? 0 : undefined,
        zIndex: isFullscreen ? 9999 : undefined,
        width: '100%',
        background: '#ffffff',
        borderRadius: isFullscreen ? 0 : '12px',
        border: '1px solid #cbd5e1',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Toolbar: Quick Island Jumps & Basemap Switcher */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
          padding: '0.6rem 0.85rem',
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0f2c59', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginRight: '0.2rem' }}>
            <Compass size={13} /> Lompat ke Pulau:
          </span>
          {ISLAND_JUMP_PRESETS.map((isl) => (
            <button
              key={isl.label}
              type="button"
              onClick={() => handleJumpToIsland(isl.lat, isl.lng, isl.zoom)}
              style={{
                padding: '0.28rem 0.6rem',
                borderRadius: '999px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#0f2c59',
                fontSize: '0.72rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {isl.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => mapInstanceRef.current?.flyTo([-4.5255, 129.9042], 13, { duration: 0.6 })}
            style={{
              padding: '0.28rem 0.6rem',
              borderRadius: '999px',
              border: '1px solid #cbd5e1',
              background: '#f1f5f9',
              color: '#475569',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
            title="Kembalikan tampilan peta ke pusat Kepulauan Banda"
          >
            <RefreshCw size={11} /> Pusat Banda
          </button>
          {activeVillageName && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.25rem 0.6rem',
                borderRadius: '999px',
                background: '#fef3c7',
                border: '1px solid #fde68a',
                color: '#92400e',
                fontSize: '0.72rem',
                fontWeight: 700,
              }}
              title={`Yurisdiksi aktif dibatasi pada Desa ${activeVillageName}`}
            >
              🏛️ Desa {activeVillageName}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.18rem' }}>
            <Layers size={13} color="#0f2c59" style={{ marginLeft: '0.35rem' }} />
            {(Object.keys(BASEMAP_OPTIONS) as FarmBasemapId[]).map((bId) => (
              <button
                key={bId}
                type="button"
                onClick={() => setActiveBasemap(bId)}
                style={{
                  padding: '0.25rem 0.55rem',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: activeBasemap === bId ? '#0f2c59' : 'transparent',
                  color: activeBasemap === bId ? '#f4b75e' : '#475569',
                }}
              >
                {BASEMAP_OPTIONS[bId].label}
              </button>
            ))}
          </div>

          {activeBasemap === 'satellite' && (
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', fontWeight: 600, color: '#0f2c59', cursor: 'pointer', padding: '0.25rem 0.45rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px' }}>
              <input
                type="checkbox"
                checked={showLabels}
                onChange={(e) => setShowLabels(e.target.checked)}
              />
              Label Lokasi
            </label>
          )}

          <button
            type="button"
            onClick={toggleFullscreen}
            style={{
              padding: '0.32rem 0.65rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#0f2c59',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
            title={isFullscreen ? 'Keluar dari Layar Penuh' : 'Perbesar Peta Layar Penuh'}
          >
            {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            <span>{isFullscreen ? 'Kecilkan' : 'Layar Penuh'}</span>
          </button>
        </div>
      </div>

      {/* Non-technical interactive mapping bar (only shown to Poktan / Officer / Admin) */}
      {editable && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.55rem',
            padding: '0.65rem 0.85rem',
            background: '#fffbeb',
            borderBottom: '1px solid #fde68a',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#92400e', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                <MapPin size={14} /> Mode Pemetaan Lahan:
              </span>
              <button
                type="button"
                onClick={() => setEditMode('add')}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '8px',
                  border: editMode === 'add' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                  background: editMode === 'add' ? '#eff6ff' : '#ffffff',
                  color: editMode === 'add' ? '#1d4ed8' : '#334155',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                <Crosshair size={13} /> + Klik Peta Tambah Sudut Lahan
              </button>
              <button
                type="button"
                onClick={() => setEditMode('move')}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '8px',
                  border: editMode === 'move' ? '2px solid #0f766e' : '1px solid #cbd5e1',
                  background: editMode === 'move' ? '#f0fdf4' : '#ffffff',
                  color: editMode === 'move' ? '#166534' : '#334155',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                <Navigation size={13} /> Hanya Geser Titik Batas
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#78350f' }}>Kotak Cepat:</span>
              {[
                { label: '2.500 m²', area: 2500 },
                { label: '5.000 m²', area: 5000 },
                { label: '10.000 m² (1 Ha)', area: 10000 },
              ].map((preset) => (
                <button
                  key={preset.area}
                  type="button"
                  onClick={() => handleApplySquarePreset(preset.area)}
                  style={{
                    padding: '0.28rem 0.6rem',
                    borderRadius: '6px',
                    border: '1px solid #f59e0b',
                    background: '#ffffff',
                    color: '#92400e',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {preset.label}
                </button>
              ))}
              {draftVertices.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={() => emitDraftUpdate(draftVertices.slice(0, -1))}
                    style={{
                      padding: '0.28rem 0.6rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#334155',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    <Undo size={12} /> Urungkan Titik
                  </button>
                  <button
                    type="button"
                    onClick={() => emitDraftUpdate([], draftLat, draftLng)}
                    style={{
                      padding: '0.28rem 0.6rem',
                      borderRadius: '6px',
                      border: '1px solid #fecaca',
                      background: '#fef2f2',
                      color: '#dc2626',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    <Trash2 size={12} /> Bersihkan
                  </button>
                </>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem', fontSize: '0.74rem' }}>
            <span style={{ color: '#78350f' }}>
              {draftVertices.length >= 3 ? (
                <>
                  <b>Batas terpetakan:</b> {draftVertices.length} titik sudut &bull; Luas otomatis{' '}
                  <b style={{ color: '#065f46' }}>
                    {draftAreaSqm.toLocaleString('id-ID')} m² ({(draftAreaSqm / 10000).toFixed(2)} Ha)
                  </b>{' '}
                  &bull; Klik kanan nomor titik (1, 2, 3...) untuk menghapus sudut tertentu.
                </>
              ) : draftVertices.length > 0 ? (
                <>
                  Terpasang <b>{draftVertices.length} titik sudut</b>. Klik minimal <b>{3 - draftVertices.length} titik</b> lagi pada peta untuk menutup area kebun.
                </>
              ) : (
                <>
                  Klik langsung pada lahan kebun di peta satelit untuk menandai sudut batas, atau klik <b>Kotak Cepat</b> lalu geser sudutnya.
                </>
              )}
            </span>
            <span style={{ fontFamily: 'monospace', color: '#0f2c59', fontWeight: 700, background: '#ffffff', padding: '0.15rem 0.45rem', borderRadius: '6px', border: '1px solid #fde68a' }}>
              Titik Tengah: {draftLat.toFixed(5)}, {draftLng.toFixed(5)}
            </span>
          </div>
        </div>
      )}

      {/* Map Canvas */}
      <div style={{ position: 'relative', width: '100%', height: isFullscreen ? '100%' : '460px', flex: isFullscreen ? 1 : undefined }}>
        <div
          ref={mapContainerRef}
          style={{
            width: '100%',
            height: '100%',
            cursor: editable && editMode === 'add' ? 'crosshair' : 'grab',
          }}
        />
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
            {editable && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '11px', height: '11px', borderRadius: '2px', background: '#fbbf24', border: '2px solid #d97706', display: 'inline-block' }} />
                <span style={{ color: '#92400e', fontWeight: 600 }}>Batas Draf Baru</span>
              </div>
            )}
            {activeVillageName && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '13px', height: '0px', borderTop: '2px dashed #d97706', display: 'inline-block' }} />
                <span style={{ color: '#92400e', fontWeight: 600 }}>Batas Wilayah {activeVillageName}</span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', fontSize: '10px', color: '#64748b', paddingTop: '3px', borderTop: '1px dashed #e2e8f0' }}>
              <span style={{ color: '#047857', fontWeight: 600 }}>Terverifikasi</span>
              <span style={{ color: '#b45309', fontWeight: 600 }}>Menunggu</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
