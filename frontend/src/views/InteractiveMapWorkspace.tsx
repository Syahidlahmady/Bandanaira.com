import React, { useState, useEffect, useRef, useMemo } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  Compass,
  Landmark,
  Home,
  Store,
  Shield,
  Droplets,
  Zap,
  Search,
  RefreshCw,
  Volume2,
  Radio,
  HardDriveDownload,
  WifiOff,
  CheckCircle2,
  AlertCircle,
  Trash2,
  MapPin,
  Edit2,
  Save,
  X,
  Sparkles,
  Crosshair,
  Globe,
  Check,
  Layers,
  ChevronDown,
  ChevronUp,
  Route,
  Navigation,
  Undo,
  RotateCcw,
} from 'lucide-react'
import {
  gisService,
  GeoJSONFeature,
  GISSummaryResponse,
  GeocodingResult,
} from '../services/gis'
import { authService } from '../services/auth'
import {
  BANDA_VILLAGES_GEOJSON,
  VILLAGE_DETAILS,
  VillageInfo,
} from '../data/bandaVillagesData'

export interface InteractiveMapWorkspaceProps {
  currentUser?: any
}

// Helper icons mapping
const LAYER_ICONS: Record<string, React.ReactNode> = {
  LAYER_TOURISM_4A: <Compass size={14} />,
  LAYER_HERITAGE: <Landmark size={14} />,
  LAYER_ACCOMMODATION: <Home size={14} />,
  LAYER_KOPERASI_UMKM: <Store size={14} />,
  LAYER_PUBLIC_SAFETY: <Shield size={14} />,
  LAYER_DESA_ADMIN: <Shield size={14} />,
  LAYER_WATER_INFRA: <Droplets size={14} />,
  LAYER_ENERGY_WASTE: <Zap size={14} />,
}

const LAYER_COLORS: Record<string, string> = {
  LAYER_TOURISM_4A: '#06b6d4', // Cyan
  LAYER_HERITAGE: '#f59e0b', // Amber
  LAYER_ACCOMMODATION: '#10b981', // Emerald
  LAYER_KOPERASI_UMKM: '#8b5cf6', // Violet
  LAYER_PUBLIC_SAFETY: '#3b82f6', // Blue
  LAYER_DESA_ADMIN: '#3b82f6', // Blue alias
  LAYER_WATER_INFRA: '#0ea5e9', // Sky Teal
  LAYER_ENERGY_WASTE: '#f43f5e', // Rose
}

const LAYER_LABELS: Record<string, string> = {
  LAYER_TOURISM_4A: 'Wisata & Bahari',
  LAYER_HERITAGE: 'Cagar Budaya',
  LAYER_ACCOMMODATION: 'Penginapan',
  LAYER_KOPERASI_UMKM: 'Sentra UMKM',
  LAYER_PUBLIC_SAFETY: 'Fasilitas Umum',
  LAYER_DESA_ADMIN: 'Fasilitas Umum',
  LAYER_WATER_INFRA: 'Air Bersih',
  LAYER_ENERGY_WASTE: 'Energi & Lingkungan',
}

export const InteractiveMapWorkspace: React.FC<InteractiveMapWorkspaceProps> = ({ currentUser }) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const layerGroupRef = useRef<L.LayerGroup | null>(null)
  const draftMarkerRef = useRef<L.Marker | null>(null)

  // Role permissions check
  const activeUser = currentUser || authService.getCachedProfile()
  const userRoleNames: string[] = activeUser
    ? (activeUser.roles || []).map((r: any) => (typeof r === 'string' ? r : r.name))
    : []
  const isSuperuser = Boolean(activeUser?.is_superuser)
  const isOfficerOrAdmin = isSuperuser || userRoleNames.some((r) => ['admin', 'village_officer'].includes(r))

  // State
  const [features, setFeatures] = useState<GeoJSONFeature[]>([])
  const [gisMeta, setGisMeta] = useState<GISSummaryResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [selectedFeature, setSelectedFeature] = useState<GeoJSONFeature | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [islandFilter, setIslandFilter] = useState<string>('')

  // Admin Studio States
  const [adminStudioOpen, setAdminStudioOpen] = useState<boolean>(false)
  const [adminTab, setAdminTab] = useState<'search' | 'form'>('search')
  const [editingFeatureId, setEditingFeatureId] = useState<string | null>(null)

  // External Geocoder States
  const [searchGmapsQuery, setSearchGmapsQuery] = useState<string>('')
  const [searchGmapsResults, setSearchGmapsResults] = useState<GeocodingResult[]>([])
  const [searchGmapsLoading, setSearchGmapsLoading] = useState<boolean>(false)

  // Spatial Feature Form States
  const [formName, setFormName] = useState<string>('')
  const [formLayer, setFormLayer] = useState<string>('LAYER_TOURISM_4A')
  const [formCategory, setFormCategory] = useState<'publik' | 'resiliensi'>('publik')
  const [formIsland, setFormIsland] = useState<string>('Pulau Neira')
  const [formLat, setFormLat] = useState<number>(-4.5261)
  const [formLng, setFormLng] = useState<number>(129.8989)
  const [formDescription, setFormDescription] = useState<string>('')

  // 4A Tourism Specific Form States
  const [form4aSubType, setForm4aSubType] = useState<string>('bahari')
  const [form4aHighlights, setForm4aHighlights] = useState<string>('')
  const [form4aBoatAccess, setForm4aBoatAccess] = useState<string>('')
  const [form4aTravelTime, setForm4aTravelTime] = useState<string>('')
  const [form4aEntryFee, setForm4aEntryFee] = useState<string>('')
  const [form4aBestTime, setForm4aBestTime] = useState<string>('')
  const [form4aFacilities, setForm4aFacilities] = useState<string>('')
  const [form4aContactWhatsapp, setForm4aContactWhatsapp] = useState<string>('')
  const [form4aGuideAvailable, setForm4aGuideAvailable] = useState<boolean>(true)

  // Route / Polyline Drawing States
  const [geometryMode, setGeometryMode] = useState<'point' | 'route'>('point')
  const [routeWaypoints, setRouteWaypoints] = useState<[number, number][]>([])
  const [routeType, setRouteType] = useState<'maritime' | 'heritage' | 'trekking'>('maritime')
  const [routeTransport, setRouteTransport] = useState<string>('Speedboat')
  const [routeTravelTime, setRouteTravelTime] = useState<string>('')
  const [routeStartName, setRouteStartName] = useState<string>('')
  const [routeEndName, setRouteEndName] = useState<string>('')
  const [showRoutes, setShowRoutes] = useState<boolean>(true)

  // Village Boundary (Choropleth Polygons) States
  const [showVillageBoundaries, setShowVillageBoundaries] = useState<boolean>(true)
  const [selectedVillage, setSelectedVillage] = useState<VillageInfo | null>(null)
  const villageBoundariesLayerRef = useRef<L.GeoJSON | null>(null)

  const draftPolylineRef = useRef<L.Polyline | null>(null)
  const draftVertexMarkersRef = useRef<L.Marker[]>([])

  // Calculate distance in km between two [lat, lng] points using Haversine formula
  const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const calculateTotalDistance = (waypoints: [number, number][]): { km: number; nm: number } => {
    if (waypoints.length < 2) return { km: 0, nm: 0 }
    let totalKm = 0
    for (let i = 0; i < waypoints.length - 1; i++) {
      totalKm += calculateDistanceKm(
        waypoints[i][0],
        waypoints[i][1],
        waypoints[i + 1][0],
        waypoints[i + 1][1]
      )
    }
    return {
      km: parseFloat(totalKm.toFixed(2)),
      nm: parseFloat((totalKm * 0.539957).toFixed(2)),
    }
  }

  const [isSavingFeature, setIsSavingFeature] = useState<boolean>(false)
  const [isDeletingFeature, setIsDeletingFeature] = useState<boolean>(false)
  const [atlasLegendOpen, setAtlasLegendOpen] = useState<boolean>(true)

  // Offline Caching State
  const [isOffline, setIsOffline] = useState<boolean>(
    typeof window !== 'undefined' ? !window.navigator.onLine : false
  )
  const [isUsingCachedData, setIsUsingCachedData] = useState<boolean>(false)
  const [cacheInfo, setCacheInfo] = useState<{
    isCached: boolean
    cachedAt: string | null
    featureCount: number
  }>({ isCached: false, cachedAt: null, featureCount: 0 })
  const [cachingMap, setCachingMap] = useState<boolean>(false)
  const [notificationMsg, setNotificationMsg] = useState<{
    type: 'success' | 'info' | 'error'
    text: string
  } | null>(null)

  // Active Layers Multi-selection (all enabled by default)
  const [selectedLayers, setSelectedLayers] = useState<Set<string>>(
    new Set([
      'LAYER_TOURISM_4A',
      'LAYER_HERITAGE',
      'LAYER_ACCOMMODATION',
      'LAYER_KOPERASI_UMKM',
      'LAYER_PUBLIC_SAFETY',
      'LAYER_DESA_ADMIN',
      'LAYER_WATER_INFRA',
      'LAYER_ENERGY_WASTE',
    ])
  )

  // Load Metadata & Features on Mount, plus check offline cache status
  useEffect(() => {
    loadGISData()
    refreshCacheStatus()

    const handleOnline = () => {
      setIsOffline(false)
      loadGISData()
    }
    const handleOffline = () => {
      setIsOffline(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const refreshCacheStatus = async () => {
    try {
      const status = await gisService.getOfflineGISStatus()
      setCacheInfo(status)
    } catch (err) {
      console.warn('Gagal membaca status cache offline:', err)
    }
  }

  const loadGISData = async () => {
    setLoading(true)
    try {
      const [metaRes, layersRes] = await Promise.all([
        gisService.getMetadata(),
        gisService.getLayers(),
      ])
      setGisMeta(metaRes)
      setFeatures(layersRes.features)
      const status = await gisService.getOfflineGISStatus()
      setCacheInfo(status)
      if (typeof window !== 'undefined' && !window.navigator.onLine) {
        setIsUsingCachedData(true)
      } else {
        setIsUsingCachedData(false)
      }
    } catch (err) {
      console.warn('Network request gagal, memeriksa ketersediaan cache offline...', err)
      const cachedStatus = await gisService.getOfflineGISStatus()
      setCacheInfo(cachedStatus)
      if (cachedStatus.isCached) {
        setIsUsingCachedData(true)
      } else {
        setNotificationMsg({
          type: 'error',
          text: 'Peta belum tersimpan di cache lokal. Harap hubungkan internet setidaknya sekali untuk mengunduh layer.',
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCacheMapForOffline = async () => {
    setCachingMap(true)
    try {
      const res = await gisService.cacheAllGISOffline()
      const status = await gisService.getOfflineGISStatus()
      setCacheInfo(status)
      setNotificationMsg({
        type: 'success',
        text: `Berhasil menyimpan seluruh 7 layer spasial (${res.totalFeatures} titik) ke memori IndexedDB perangkat! Peta ini kini dapat dibuka di kebun tanpa sinyal internet.`,
      })
      setTimeout(() => setNotificationMsg(null), 6000)
    } catch (err: any) {
      setNotificationMsg({
        type: 'error',
        text: `Gagal menyimpan peta offline: ${err?.message || 'Terjadi kesalahan sistem'}`,
      })
    } finally {
      setCachingMap(false)
    }
  }

  const handleClearCache = async () => {
    if (!window.confirm('Hapus cache peta offline dari perangkat ini?')) return
    try {
      await gisService.clearOfflineGISCache()
      const status = await gisService.getOfflineGISStatus()
      setCacheInfo(status)
      setNotificationMsg({
        type: 'info',
        text: 'Cache peta offline pada perangkat telah dibersihkan.',
      })
      setTimeout(() => setNotificationMsg(null), 4000)
    } catch (err: any) {
      setNotificationMsg({
        type: 'error',
        text: `Gagal membersihkan cache: ${err?.message || 'Terjadi kesalahan'}`,
      })
    }
  }

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return

    if (!mapInstanceRef.current) {
      // Center coordinates of Banda Neira: -4.524, 129.904
      const map = L.map(mapContainerRef.current, {
        center: [-4.5300, 129.9000],
        zoom: 12,
        minZoom: 10,
        maxZoom: 18,
      })

      // OpenStreetMap Tile Layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Banda Digital Ecosystem',
        maxZoom: 19,
      }).addTo(map)

      layerGroupRef.current = L.layerGroup().addTo(map)
      mapInstanceRef.current = map

      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize()
        }
      }, 200)
    } else {
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize()
        }
      }, 150)
    }

    return () => {
      // Clean up map when component unmounts
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Manage draft marker on the map for Admin Studio
  const updateDraftMarker = (lat: number, lng: number) => {
    if (!mapInstanceRef.current) return
    const map = mapInstanceRef.current

    if (draftMarkerRef.current) {
      draftMarkerRef.current.setLatLng([lat, lng])
    } else {
      const pinIcon = L.divIcon({
        className: 'draft-editor-pin',
        html: `
          <div style="position: relative; width: 34px; height: 44px; display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 4px 10px rgba(239, 68, 68, 0.45)); cursor: grab;">
            <svg width="34" height="44" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M14 0C6.268 0 0 6.268 0 14C0 23.8 12.2 34.6 13.3 35.6C13.7 35.9 14.3 35.9 14.7 35.6C15.8 34.6 28 23.8 28 14C28 6.268 21.732 0 14 0Z"
                fill="#ef4444"
                stroke="#ffffff"
                stroke-width="2"
              />
              <circle cx="14" cy="13.5" r="5.5" fill="#ffffff" />
              <circle cx="14" cy="13.5" r="3" fill="#ef4444" />
            </svg>
          </div>
        `,
        iconSize: [34, 44],
        iconAnchor: [17, 44],
        popupAnchor: [0, -44],
      })
      const marker = L.marker([lat, lng], {
        icon: pinIcon,
        draggable: true,
      }).addTo(map)

      marker.on('dragend', (ev: any) => {
        const pos = ev.target.getLatLng()
        setFormLat(parseFloat(pos.lat.toFixed(6)))
        setFormLng(parseFloat(pos.lng.toFixed(6)))
      })

      draftMarkerRef.current = marker
    }
  }

  const removeDraftMarker = () => {
    if (draftMarkerRef.current) {
      draftMarkerRef.current.remove()
      draftMarkerRef.current = null
    }
  }

  // Handle map click when Admin Studio is open
  useEffect(() => {
    if (!mapInstanceRef.current) return
    const map = mapInstanceRef.current

    const onMapClick = (e: L.LeafletMouseEvent) => {
      if (adminStudioOpen) {
        const lat = parseFloat(e.latlng.lat.toFixed(6))
        const lng = parseFloat(e.latlng.lng.toFixed(6))
        if (geometryMode === 'route') {
          setRouteWaypoints((prev) => [...prev, [lat, lng]])
        } else {
          setFormLat(lat)
          setFormLng(lng)
          updateDraftMarker(lat, lng)
        }
      }
    }

    map.on('click', onMapClick)
    return () => {
      map.off('click', onMapClick)
    }
  }, [adminStudioOpen, geometryMode])

  // Manage draft route polyline and draggable vertex handles for Admin Studio
  useEffect(() => {
    if (!mapInstanceRef.current) return
    const map = mapInstanceRef.current

    // Clean up previous draft route
    if (draftPolylineRef.current) {
      draftPolylineRef.current.remove()
      draftPolylineRef.current = null
    }
    draftVertexMarkersRef.current.forEach((m) => m.remove())
    draftVertexMarkersRef.current = []

    if (!adminStudioOpen || geometryMode !== 'route') return

    // Draw polyline if at least 2 points
    if (routeWaypoints.length >= 2) {
      const color =
        routeType === 'maritime' ? '#0284c7' : routeType === 'heritage' ? '#b45309' : '#dc2626'
      const poly = L.polyline(routeWaypoints, {
        color,
        weight: 4.5,
        dashArray: routeType === 'maritime' ? '8, 8' : undefined,
        opacity: 0.9,
      }).addTo(map)
      draftPolylineRef.current = poly
    }

    // Draw vertex handles for every point in routeWaypoints
    routeWaypoints.forEach(([lat, lng], idx) => {
      const isStart = idx === 0
      const isEnd = idx === routeWaypoints.length - 1
      const vertexColor = isStart ? '#059669' : isEnd ? '#dc2626' : '#0284c7'

      const vertexIcon = L.divIcon({
        className: 'route-vertex-handle',
        html: `
          <div style="
            width: 22px;
            height: 22px;
            border-radius: 50%;
            background: #ffffff;
            border: 3px solid ${vertexColor};
            box-shadow: 0 2px 6px rgba(0,0,0,0.35);
            cursor: grab;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: 800;
            color: #0f172a;
          ">${idx + 1}</div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      })

      const vertexMarker = L.marker([lat, lng], {
        icon: vertexIcon,
        draggable: true,
      }).addTo(map)

      // Live dragging update
      vertexMarker.on('drag', (ev: any) => {
        const pos = ev.target.getLatLng()
        const updated = [...routeWaypoints]
        updated[idx] = [parseFloat(pos.lat.toFixed(6)), parseFloat(pos.lng.toFixed(6))]
        if (draftPolylineRef.current) {
          draftPolylineRef.current.setLatLngs(updated)
        }
      })

      // Commit dragged position on dragend
      vertexMarker.on('dragend', (ev: any) => {
        const pos = ev.target.getLatLng()
        setRouteWaypoints((prev) => {
          const next = [...prev]
          next[idx] = [parseFloat(pos.lat.toFixed(6)), parseFloat(pos.lng.toFixed(6))]
          return next
        })
      })

      draftVertexMarkersRef.current.push(vertexMarker)
    })
  }, [adminStudioOpen, geometryMode, routeWaypoints, routeType])

  const handleUndoLastWaypoint = () => {
    setRouteWaypoints((prev) => prev.slice(0, -1))
  }

  const handleClearRoute = () => {
    setRouteWaypoints([])
  }

  // Admin Studio Handlers
  const handleOpenNewPoint = () => {
    setEditingFeatureId(null)
    setGeometryMode('point')
    setRouteWaypoints([])
    setFormName('')
    setFormLayer('LAYER_TOURISM_4A')
    setFormCategory('publik')
    setFormIsland('Pulau Neira')
    setFormLat(-4.5261)
    setFormLng(129.8989)
    setFormDescription('')
    setForm4aSubType('bahari')
    setForm4aHighlights('')
    setForm4aBoatAccess('')
    setForm4aTravelTime('')
    setForm4aEntryFee('')
    setForm4aBestTime('')
    setForm4aFacilities('')
    setForm4aContactWhatsapp('')
    setForm4aGuideAvailable(true)
    setAdminTab('search')
    setAdminStudioOpen(true)
    updateDraftMarker(-4.5261, 129.8989)
  }

  const handleOpenNewRoute = () => {
    setEditingFeatureId(null)
    setGeometryMode('route')
    setRouteWaypoints([])
    setRouteType('maritime')
    setRouteTransport('Speedboat')
    setRouteTravelTime('25 - 35 Menit')
    setRouteStartName('Pelabuhan Laut Utama Banda Neira')
    setRouteEndName('Terminal Dermaga Pulau Ay')
    setFormName('Jalur Penyeberangan Speedboat Neira - Pulau Ay')
    setFormLayer('LAYER_PUBLIC_SAFETY')
    setFormCategory('publik')
    setFormIsland('Pulau Ay')
    setFormDescription('Jalur penyeberangan speedboat antar-pulau melintasi perairan Selat Ay.')
    setAdminTab('form')
    setAdminStudioOpen(true)
    removeDraftMarker()
  }

  const handleCloseAdminStudio = () => {
    setAdminStudioOpen(false)
    setEditingFeatureId(null)
    removeDraftMarker()
    if (draftPolylineRef.current) {
      draftPolylineRef.current.remove()
      draftPolylineRef.current = null
    }
    draftVertexMarkersRef.current.forEach((m) => m.remove())
    draftVertexMarkersRef.current = []
    setRouteWaypoints([])
  }

  const handleStartEditFeature = (feat: GeoJSONFeature) => {
    const p = feat.properties
    setEditingFeatureId(feat.id)
    setFormName(p.name || '')
    setFormLayer(p.layer_type || 'LAYER_TOURISM_4A')
    setFormCategory(p.category || 'publik')
    setFormIsland(p.island_name || 'Pulau Neira')
    setFormDescription(p.description || '')

    const isLine = feat.geometry?.type === 'LineString' && Array.isArray(feat.geometry.coordinates)
    if (isLine) {
      setGeometryMode('route')
      const waypoints: [number, number][] = feat.geometry.coordinates.map((c: any) => [
        Number(c[1]),
        Number(c[0]),
      ])
      setRouteWaypoints(waypoints)
      setRouteType(p.properties_meta?.route_type || p.route_type || 'maritime')
      setRouteTransport(p.properties_meta?.transport_mode || p.transport_mode || 'Speedboat')
      setRouteTravelTime(p.properties_meta?.travel_time || p.travel_time || '')
      setRouteStartName(p.properties_meta?.start_point || p.start_point || '')
      setRouteEndName(p.properties_meta?.end_point || p.end_point || '')
      removeDraftMarker()
      if (waypoints.length > 0 && mapInstanceRef.current) {
        mapInstanceRef.current.flyTo(waypoints[0], 13)
      }
    } else {
      setGeometryMode('point')
      setRouteWaypoints([])
      const [lng, lat] = feat.geometry.coordinates
      setFormLat(lat)
      setFormLng(lng)
      updateDraftMarker(lat, lng)
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([lat, lng], 15)
      }
    }

    // 4A metadata fields
    setForm4aSubType(p.sub_type || 'bahari')
    setForm4aHighlights(p.highlights || p.era || '')
    setForm4aBoatAccess(p.boat_access || '')
    setForm4aTravelTime(p.travel_time || '')
    setForm4aEntryFee(p.entry_fee_rp?.toString() || p.price_per_night_rp?.toString() || '')
    setForm4aBestTime(p.best_time || '')
    setForm4aFacilities(p.facilities || '')
    setForm4aContactWhatsapp(p.contact_whatsapp || '')
    setForm4aGuideAvailable(Boolean(p.guide_available))

    setAdminTab('form')
    setAdminStudioOpen(true)
  }

  const handleSearchGmaps = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!searchGmapsQuery.trim() || searchGmapsQuery.trim().length < 2) return

    setSearchGmapsLoading(true)
    try {
      const res = await gisService.searchExternal(searchGmapsQuery.trim())
      setSearchGmapsResults(res.results || [])
    } catch (err: any) {
      alert(`Gagal mencari titik eksternal: ${err?.message || 'Terjadi kesalahan'}`)
    } finally {
      setSearchGmapsLoading(false)
    }
  }

  const handleSelectGmapsResult = (res: GeocodingResult) => {
    if (geometryMode === 'route') {
      setRouteWaypoints((prev) => [...prev, [res.lat, res.lng]])
      setAdminTab('form')
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([res.lat, res.lng], 15)
      }
      return
    }

    setFormName(res.name)
    setFormLat(res.lat)
    setFormLng(res.lng)
    setFormIsland(res.island)
    setFormLayer(res.suggested_layer || 'LAYER_TOURISM_4A')
    setFormCategory(['LAYER_WATER_INFRA', 'LAYER_ENERGY_WASTE'].includes(res.suggested_layer) ? 'resiliensi' : 'publik')
    updateDraftMarker(res.lat, res.lng)
    setAdminTab('form')

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([res.lat, res.lng], 15)
    }
  }

  const handleSaveSpatialFeature = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim()) {
      alert(geometryMode === 'route' ? 'Nama rute jalur wajib diisi.' : 'Nama objek/titik wajib diisi.')
      return
    }

    if (geometryMode === 'route' && routeWaypoints.length < 2) {
      alert('Garis rute memerlukan minimal 2 titik belokan pada peta. Silakan klik peta untuk menambahkan lintasan rute.')
      return
    }

    const token = authService.getAccessToken()
    if (!token) {
      alert('Sesi autentikasi telah berakhir. Harap login kembali.')
      return
    }

    setIsSavingFeature(true)
    try {
      let payload: any = {}

      if (geometryMode === 'route') {
        const dist = calculateTotalDistance(routeWaypoints)
        const midIdx = Math.floor(routeWaypoints.length / 2)
        const routePropertiesMeta: Record<string, any> = {
          is_route: true,
          route_type: routeType,
          transport_mode: routeTransport,
          travel_time: routeTravelTime.trim() || undefined,
          total_distance_km: dist.km,
          total_distance_nm: dist.nm,
          waypoints_count: routeWaypoints.length,
          start_point: routeStartName.trim() || undefined,
          end_point: routeEndName.trim() || undefined,
        }

        payload = {
          name: formName.trim(),
          layer_type: formLayer,
          category: ['LAYER_WATER_INFRA', 'LAYER_ENERGY_WASTE'].includes(formLayer) ? 'resiliensi' : formCategory,
          island_name: formIsland,
          latitude: Number(routeWaypoints[midIdx][0]),
          longitude: Number(routeWaypoints[midIdx][1]),
          geometry_geojson: {
            type: 'LineString',
            coordinates: routeWaypoints.map(([lat, lng]) => [lng, lat]),
          },
          properties_meta: routePropertiesMeta,
          description: formDescription.trim() || undefined,
          is_active: true,
        }
      } else {
        const properties_meta: Record<string, any> = {}
        if (formLayer === 'LAYER_TOURISM_4A') {
          if (form4aSubType) properties_meta.sub_type = form4aSubType
          if (form4aHighlights) properties_meta.highlights = form4aHighlights
          if (form4aBoatAccess) properties_meta.boat_access = form4aBoatAccess
          if (form4aTravelTime) properties_meta.travel_time = form4aTravelTime
          if (form4aEntryFee) properties_meta.entry_fee_rp = parseInt(form4aEntryFee, 10) || 0
          if (form4aBestTime) properties_meta.best_time = form4aBestTime
          if (form4aFacilities) properties_meta.facilities = form4aFacilities
          if (form4aContactWhatsapp) properties_meta.contact_whatsapp = form4aContactWhatsapp
          properties_meta.guide_available = form4aGuideAvailable
        } else if (formLayer === 'LAYER_ACCOMMODATION') {
          if (form4aEntryFee) properties_meta.price_per_night_rp = parseInt(form4aEntryFee, 10) || 0
          if (form4aContactWhatsapp) properties_meta.contact_whatsapp = form4aContactWhatsapp
          if (form4aFacilities) properties_meta.facilities = form4aFacilities
        } else if (formLayer === 'LAYER_HERITAGE') {
          if (form4aHighlights) properties_meta.era = form4aHighlights
          if (form4aEntryFee) properties_meta.entry_fee_rp = parseInt(form4aEntryFee, 10) || 0
        }

        payload = {
          name: formName.trim(),
          layer_type: formLayer,
          category: ['LAYER_WATER_INFRA', 'LAYER_ENERGY_WASTE'].includes(formLayer) ? 'resiliensi' : formCategory,
          island_name: formIsland,
          latitude: Number(formLat),
          longitude: Number(formLng),
          properties_meta,
          description: formDescription.trim() || undefined,
          is_active: true,
        }
      }

      if (editingFeatureId) {
        await gisService.updateFeature(editingFeatureId, payload, token)
        setNotificationMsg({
          type: 'success',
          text: `Berhasil memperbarui ${geometryMode === 'route' ? 'garis rute' : 'titik'} '${formName}' di PostGIS!`,
        })
      } else {
        await gisService.createFeature(payload, token)
        setNotificationMsg({
          type: 'success',
          text: `Berhasil menambahkan ${geometryMode === 'route' ? 'rute baru' : 'titik baru'} '${formName}' di PostGIS!`,
        })
      }

      await loadGISData()
      handleCloseAdminStudio()
    } catch (err: any) {
      alert(`Gagal menyimpan: ${err?.message || 'Terjadi kesalahan sistem'}`)
    } finally {
      setIsSavingFeature(false)
    }
  }

  const handleDeleteFeature = async (featureId: string, featureName: string) => {
    if (!window.confirm(`Yakin ingin menghapus titik '${featureName}' dari database PostGIS? Tindakan ini tidak dapat dibatalkan.`)) {
      return
    }

    const token = authService.getAccessToken()
    if (!token) {
      alert('Sesi autentikasi telah berakhir. Harap login kembali.')
      return
    }

    setIsDeletingFeature(true)
    try {
      await gisService.deleteFeature(featureId, token)
      setNotificationMsg({
        type: 'info',
        text: `Titik '${featureName}' berhasil dihapus dari database PostGIS.`,
      })
      setSelectedFeature(null)
      await loadGISData()
    } catch (err: any) {
      alert(`Gagal menghapus titik: ${err?.message || 'Terjadi kesalahan'}`)
    } finally {
      setIsDeletingFeature(false)
    }
  }

  // Filter features according to active filters
  const filteredFeatures = useMemo(() => {
    return features.filter((feat) => {
      const { layer_type, island_name, name, description } = feat.properties

      // Layer multi-selection filter
      if (!selectedLayers.has(layer_type)) return false

      // Island filter
      if (islandFilter && island_name !== islandFilter) return false

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchName = name.toLowerCase().includes(q)
        const matchDesc = description ? description.toLowerCase().includes(q) : false
        const matchIsland = island_name.toLowerCase().includes(q)
        if (!matchName && !matchDesc && !matchIsland) return false
      }

      return true
    })
  }, [features, selectedLayers, islandFilter, searchQuery])

  // Update Leaflet markers whenever filteredFeatures change
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return

    layerGroupRef.current.clearLayers()

    filteredFeatures.forEach((feat) => {
      // 1. Render Route (LineString) features
      if (feat.geometry?.type === 'LineString' && Array.isArray(feat.geometry.coordinates)) {
        if (!showRoutes) return
        const latlngs: [number, number][] = feat.geometry.coordinates.map((c: any) => [
          Number(c[1]),
          Number(c[0]),
        ])
        if (latlngs.length < 2) return

        const { name, properties_meta } = feat.properties
        const rType = properties_meta?.route_type || 'maritime'
        const isSelected = selectedFeature?.id === feat.id

        const color =
          rType === 'maritime'
            ? '#0284c7'
            : rType === 'heritage'
            ? '#b45309'
            : rType === 'trekking'
            ? '#dc2626'
            : '#2563eb'

        const polyline = L.polyline(latlngs, {
          color,
          weight: isSelected ? 5.5 : 4,
          dashArray: rType === 'maritime' ? '8, 8' : undefined,
          opacity: isSelected ? 1 : 0.85,
        })

        const distKm = properties_meta?.total_distance_km ? `${properties_meta.total_distance_km} km` : ''
        const tTime = properties_meta?.travel_time ? ` · ${properties_meta.travel_time}` : ''
        const mode = properties_meta?.transport_mode ? ` · ${properties_meta.transport_mode}` : ''

        polyline.bindTooltip(
          `<div style="font-family: inherit; font-size: 12px; font-weight: 600;"><b>${name}</b><br/><span style="font-size: 10px; color: #64748b;">${distKm}${tTime}${mode}</span></div>`,
          { sticky: true }
        )

        polyline.on('click', () => {
          setSelectedFeature(feat)
        })

        layerGroupRef.current?.addLayer(polyline)
        return
      }

      // 2. Render Point features
      if (!feat.geometry?.coordinates || !Array.isArray(feat.geometry.coordinates)) return
      const [lng, lat] = feat.geometry.coordinates
      if (typeof lng !== 'number' || typeof lat !== 'number') return

      const { name, layer_type, island_name, description } = feat.properties

      const color = LAYER_COLORS[layer_type] || '#10b981'
      const label = LAYER_LABELS[layer_type] || layer_type
      const isSelected = selectedFeature?.id === feat.id

      // Cartographic Location Pin SVG (replacing pulse dots)
      const pinWidth = isSelected ? 32 : 26
      const pinHeight = isSelected ? 40 : 34
      const iconHtml = `
        <div class="banda-gis-pin-wrapper" style="
          position: relative;
          width: ${pinWidth}px;
          height: ${pinHeight}px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          filter: drop-shadow(0 3px 6px rgba(15, 23, 42, 0.35));
          transition: transform 0.15s ease-out;
        ">
          <svg width="${pinWidth}" height="${pinHeight}" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M14 0C6.268 0 0 6.268 0 14C0 23.8 12.2 34.6 13.3 35.6C13.7 35.9 14.3 35.9 14.7 35.6C15.8 34.6 28 23.8 28 14C28 6.268 21.732 0 14 0Z"
              fill="${color}"
              stroke="#ffffff"
              stroke-width="${isSelected ? '2.2' : '1.8'}"
            />
            <circle cx="14" cy="13.5" r="5.5" fill="#ffffff" />
            <circle cx="14" cy="13.5" r="3.2" fill="${color}" />
          </svg>
        </div>
      `

      const customIcon = L.divIcon({
        className: 'custom-gis-pin',
        html: iconHtml,
        iconSize: [pinWidth, pinHeight],
        iconAnchor: [pinWidth / 2, pinHeight],
        popupAnchor: [0, -pinHeight],
      })

      const marker = L.marker([lat, lng], { icon: customIcon })

      // Custom Popup HTML
      const popupContent = `
        <div style="font-family: inherit; font-size: 13px; color: #1e293b; min-width: 220px; max-width: 260px;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${color};"></span>
            <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: ${color}; letter-spacing: 0.05em;">
              ${label}
            </span>
          </div>
          <h4 style="margin: 0 0 4px; font-size: 14px; font-weight: 800; color: #0f172a;">${name}</h4>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 6px; display: flex; align-items: center; gap: 4px;">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>${island_name}</span>
          </div>
          ${description ? `<p style="margin: 0 0 8px; font-size: 11px; color: #475569; line-height: 1.4;">${description.slice(0, 110)}...</p>` : ''}
          <div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; font-family: monospace;">
            Koordinat: ${lat.toFixed(4)}, ${lng.toFixed(4)}
          </div>
        </div>
      `

      marker.bindPopup(popupContent)

      marker.on('click', () => {
        setSelectedFeature(feat)
      })

      layerGroupRef.current?.addLayer(marker)
    })
  }, [filteredFeatures, selectedFeature])

  // Manage and Render Administrative Village Boundaries (Choropleth Polygons)
  useEffect(() => {
    if (!mapInstanceRef.current) return

    if (villageBoundariesLayerRef.current) {
      villageBoundariesLayerRef.current.remove()
      villageBoundariesLayerRef.current = null
    }

    if (!showVillageBoundaries) return

    const geoJsonLayer = L.geoJSON(BANDA_VILLAGES_GEOJSON, {
      style: (feat) => {
        const vName = feat?.properties?.name
        const isSelected = selectedVillage?.name === vName
        const baseColor = feat?.properties?.color || '#3b82f6'
        return {
          fillColor: baseColor,
          fillOpacity: isSelected ? 0.62 : 0.28,
          color: isSelected ? '#0f172a' : baseColor,
          weight: isSelected ? 2.5 : 1.2,
          dashArray: isSelected ? undefined : '3, 3',
        }
      },
      onEachFeature: (feat, layer) => {
        const { name, island, color } = feat.properties
        const details = VILLAGE_DETAILS[name]
        layer.bindTooltip(
          `<div style="font-family: inherit; font-size: 11px; font-weight: 700; color: #0f172a;">
            <span style="display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: ${color}; margin-right: 4px;"></span>
            <b>${name}</b><br/>
            <span style="font-size: 9px; color: #64748b; font-weight: 500;">${island}</span>
          </div>`,
          { sticky: true, opacity: 0.95 }
        )

        layer.on({
          mouseover: (e: any) => {
            const l = e.target
            if (selectedVillage?.name !== name) {
              l.setStyle({
                fillOpacity: 0.52,
                weight: 2,
              })
            }
          },
          mouseout: (e: any) => {
            const l = e.target
            if (selectedVillage?.name !== name) {
              l.setStyle({
                fillOpacity: 0.28,
                weight: 1.2,
              })
            }
          },
          click: (e: any) => {
            L.DomEvent.stopPropagation(e)
            if (details) {
              setSelectedVillage(details)
            } else {
              setSelectedVillage({
                name,
                island,
                color,
                description: 'Wilayah administrasi desa di Kepulauan Banda.',
              })
            }
          },
        })
      },
    })

    geoJsonLayer.addTo(mapInstanceRef.current)
    geoJsonLayer.bringToBack()
    villageBoundariesLayerRef.current = geoJsonLayer
  }, [showVillageBoundaries, selectedVillage])

  const handleFocusVillage = (vName: string) => {
    const details = VILLAGE_DETAILS[vName]
    if (details) setSelectedVillage(details)
    if (villageBoundariesLayerRef.current && mapInstanceRef.current) {
      villageBoundariesLayerRef.current.eachLayer((layer: any) => {
        if (layer.feature?.properties?.name === vName) {
          const bounds = layer.getBounds()
          mapInstanceRef.current?.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 })
        }
      })
    }
  }

  // Toggle single layer
  const toggleLayer = (layerId: string) => {
    setSelectedLayers((prev) => {
      const next = new Set(prev)
      if (next.has(layerId)) {
        next.delete(layerId)
      } else {
        next.add(layerId)
      }
      return next
    })
  }

  // Select all or clear layers
  const selectAllLayers = () => {
    setSelectedLayers(
      new Set([
        'LAYER_TOURISM_4A',
        'LAYER_HERITAGE',
        'LAYER_ACCOMMODATION',
        'LAYER_KOPERASI_UMKM',
        'LAYER_PUBLIC_SAFETY',
        'LAYER_WATER_INFRA',
        'LAYER_ENERGY_WASTE',
      ])
    )
  }

  const clearAllLayers = () => {
    setSelectedLayers(new Set())
  }

  // Center map on specific feature
  const handleFocusFeature = (feat: GeoJSONFeature) => {
    setSelectedFeature(feat)
    if (mapInstanceRef.current) {
      if (feat.geometry?.type === 'LineString' && Array.isArray(feat.geometry.coordinates)) {
        const coords: [number, number][] = feat.geometry.coordinates.map((c: any) => [Number(c[1]), Number(c[0])])
        const bounds = L.latLngBounds(coords)
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] })
      } else if (Array.isArray(feat.geometry?.coordinates)) {
        const [lng, lat] = feat.geometry.coordinates
        mapInstanceRef.current.setView([lat, lng], 15, { animate: true })
      }
    }
  }

  // Reset Map View to default Banda center
  const handleResetMapView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([-4.5300, 129.9000], 12, { animate: true })
    }
  }

  return (
    <div className="workspace-container animate-fade-in">
      {/* Workspace Header */}
      <div className="workspace-header" style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 800, color: '#0f2c59', letterSpacing: '-0.02em' }}>
            Peta Kepulauan Banda Neira
          </h2>
          <p style={{ margin: '0.2rem 0 0', color: '#64748b', fontSize: '0.825rem' }}>
            Eksplorasi destinasi wisata bahari, cagar budaya, penginapan, dan fasilitas umum di seluruh pulau.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Subtle Offline Cache Chip */}
          {isUsingCachedData || isOffline ? (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.4rem 0.75rem',
                borderRadius: '8px',
                background: '#fef3c7',
                border: '1px solid #fde68a',
                color: '#92400e',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
              title="Menggunakan data cache lokal (koneksi offline)"
            >
              <WifiOff size={13} />
              <span>Offline Cache</span>
            </div>
          ) : cacheInfo.isCached ? (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.4rem 0.75rem',
                borderRadius: '8px',
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                color: '#065f46',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
              title={`Peta tersimpan offline (${cacheInfo.featureCount} titik)`}
            >
              <CheckCircle2 size={13} />
              <span>Offline Siap</span>
              <button
                type="button"
                onClick={handleClearCache}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: 0,
                  marginLeft: '4px',
                  display: 'inline-flex',
                }}
                title="Hapus cache lokal"
              >
                <Trash2 size={11} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleCacheMapForOffline}
              disabled={cachingMap}
              style={{
                fontSize: '0.78rem',
                padding: '0.4rem 0.75rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: '#ffffff',
                color: '#334155',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
              }}
              title="Simpan peta ke peramban agar bisa diakses saat tidak ada internet"
            >
              <HardDriveDownload size={13} className={cachingMap ? 'animate-spin' : ''} />
              {cachingMap ? 'Menyimpan...' : 'Simpan Offline'}
            </button>
          )}

          <button
            type="button"
            onClick={loadGISData}
            disabled={loading}
            style={{
              fontSize: '0.78rem',
              padding: '0.4rem 0.75rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: '#ffffff',
              color: '#334155',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Muat Ulang
          </button>

          <button
            type="button"
            onClick={handleResetMapView}
            style={{
              fontSize: '0.78rem',
              padding: '0.4rem 0.85rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: '#081d35',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              boxShadow: '0 1px 3px rgba(8, 29, 53, 0.15)',
            }}
          >
            <Compass size={13} />
            Pusat Banda
          </button>

          {isOfficerOrAdmin && (
            <>
              <button
                type="button"
                onClick={handleOpenNewRoute}
                style={{
                  fontSize: '0.78rem',
                  padding: '0.4rem 0.85rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: adminStudioOpen && geometryMode === 'route' ? '#0284c7' : '#ffffff',
                  color: adminStudioOpen && geometryMode === 'route' ? '#ffffff' : '#0284c7',
                  border: '1.5px solid #0284c7',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                <Route size={13} />
                Tarik Rute Baru
              </button>
              <button
                type="button"
                onClick={() => {
                  if (adminStudioOpen) {
                    handleCloseAdminStudio()
                  } else {
                    handleOpenNewPoint()
                  }
                }}
                style={{
                  fontSize: '0.78rem',
                  padding: '0.4rem 0.85rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: adminStudioOpen && geometryMode === 'point' ? '#059669' : '#ffffff',
                  color: adminStudioOpen && geometryMode === 'point' ? '#ffffff' : '#059669',
                  border: '1.5px solid #059669',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                <Edit2 size={13} />
                {adminStudioOpen && geometryMode === 'point' ? 'Tutup Studio' : 'Tambah Titik'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Alert Notification Toast */}
      {notificationMsg && (
        <div
          className="animate-fade-in"
          style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            background:
              notificationMsg.type === 'success'
                ? 'rgba(16, 185, 129, 0.15)'
                : notificationMsg.type === 'info'
                ? 'rgba(6, 182, 212, 0.15)'
                : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${
              notificationMsg.type === 'success'
                ? 'rgba(16, 185, 129, 0.4)'
                : notificationMsg.type === 'info'
                ? 'rgba(6, 182, 212, 0.4)'
                : 'rgba(239, 68, 68, 0.4)'
            }`,
            color:
              notificationMsg.type === 'success'
                ? '#34d399'
                : notificationMsg.type === 'info'
                ? '#38bdf8'
                : '#f87171',
            fontSize: '0.825rem',
            fontWeight: 600,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {notificationMsg.type === 'success' ? (
              <CheckCircle2 size={15} />
            ) : notificationMsg.type === 'info' ? (
              <AlertCircle size={15} />
            ) : (
              <AlertCircle size={15} />
            )}
            <span>{notificationMsg.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotificationMsg(null)}
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Compact Google Maps Style Toolbar */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem',
          marginBottom: '1rem',
        }}
      >
        {/* Search & Island Chips */}
        <div
          style={{
            display: 'flex',
            gap: '0.65rem',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: '380px' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              placeholder="Cari tempat, benteng, pantai, penginapan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.45rem 2rem 0.45rem 2.2rem',
                fontSize: '0.8rem',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '999px',
                color: '#0f172a',
                outline: 'none',
                boxShadow: '0 2px 6px rgba(15, 44, 89, 0.05)',
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Island Filter Chips */}
          <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {['', 'Pulau Neira', 'Banda Besar', 'Pulau Hatta', 'Pulau Ay', 'Gunung Api'].map((isl) => {
              const isSelected = islandFilter === isl
              return (
                <button
                  type="button"
                  key={isl}
                  onClick={() => setIslandFilter(isl)}
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.3rem 0.75rem',
                    borderRadius: '999px',
                    border: isSelected ? '1.5px solid #081d35' : '1px solid #e2e8f0',
                    background: isSelected ? '#081d35' : '#ffffff',
                    color: isSelected ? '#ffffff' : '#475569',
                    cursor: 'pointer',
                    fontWeight: isSelected ? 700 : 500,
                    boxShadow: isSelected ? '0 2px 4px rgba(8, 29, 53, 0.15)' : '0 1px 2px rgba(0,0,0,0.03)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {isl || 'Semua Pulau'}
                </button>
              )
            })}
          </div>

          {/* Select all / Clear layer shortcuts */}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.45rem', alignItems: 'center' }}>
            <button
              type="button"
              onClick={selectAllLayers}
              style={{
                background: 'none',
                border: 'none',
                color: '#081d35',
                fontSize: '0.725rem',
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Semua Kategori
            </button>
            <span style={{ color: '#cbd5e1', fontSize: '0.7rem' }}>•</span>
            <button
              type="button"
              onClick={clearAllLayers}
              style={{
                background: 'none',
                border: 'none',
                color: '#dc2626',
                fontSize: '0.725rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Kosongkan
            </button>
          </div>
        </div>

        {/* Layer Filter Pills */}
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {gisMeta?.layers.map((layer) => {
            const isActive = selectedLayers.has(layer.id)
            const color = layer.color
            const friendlyName = LAYER_LABELS[layer.id] || layer.name
            return (
              <button
                key={layer.id}
                type="button"
                onClick={() => toggleLayer(layer.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.3rem 0.75rem',
                  borderRadius: '999px',
                  border: isActive ? `1.5px solid ${color}` : '1px solid #e2e8f0',
                  background: isActive ? `${color}14` : '#ffffff',
                  color: isActive ? '#0f172a' : '#64748b',
                  fontSize: '0.75rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
                <span>{friendlyName}</span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    color: isActive ? color : '#94a3b8',
                    fontWeight: 700,
                  }}
                >
                  {layer.feature_count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Admin Studio Editor Panel */}
      {adminStudioOpen && isOfficerOrAdmin && (
        <div
          className="animate-fade-in"
          style={{
            padding: '1.25rem',
            background: '#ffffff',
            border: '1.5px solid #081d35',
            borderRadius: '16px',
            marginBottom: '1.25rem',
            boxShadow: '0 10px 30px rgba(15, 44, 89, 0.08)',
          }}
        >
          {/* Studio Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.75rem',
              marginBottom: '1rem',
              borderBottom: '1px solid #e2e8f0',
              paddingBottom: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: '#ecfdf5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#059669',
                }}
              >
                <Edit2 size={16} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f2c59' }}>
                  {editingFeatureId ? 'Edit Titik Spasial PostGIS' : 'Studio Editor Titik Spasial PostGIS'}
                </h3>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
                  {editingFeatureId
                    ? `Memperbarui titik: ${formName || 'Objek Terpilih'}`
                    : 'Tambah titik baru secara presisi atau tarik koordinat dari Google Maps / OSM'}
                </p>
              </div>
            </div>

            {/* Tab Switcher & Close */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  display: 'flex',
                  background: '#f1f5f9',
                  padding: '0.2rem',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <button
                  type="button"
                  onClick={() => setAdminTab('form')}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: adminTab === 'form' ? '#081d35' : 'transparent',
                    color: adminTab === 'form' ? '#ffffff' : '#64748b',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <MapPin size={12} />
                  Form Atribut &amp; 4A
                </button>
                <button
                  type="button"
                  onClick={() => setAdminTab('search')}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: adminTab === 'search' ? '#0284c7' : 'transparent',
                    color: adminTab === 'search' ? '#ffffff' : '#64748b',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <Globe size={12} />
                  Cari Google Maps / OSM
                </button>
              </div>

              <button
                type="button"
                onClick={handleCloseAdminStudio}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  color: '#64748b',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
                title="Tutup Studio Editor"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Tab 1: Google Maps / OSM Geocoding Search */}
          {adminTab === 'search' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                  <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input
                    type="text"
                    value={searchGmapsQuery}
                    onChange={(e) => setSearchGmapsQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleSearchGmaps()
                      }
                    }}
                    placeholder="Contoh: Benteng Belgica, The Maulana Hotel, Clove Farm..."
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem 0.5rem 2rem',
                      fontSize: '0.8rem',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      color: '#0f172a',
                      outline: 'none',
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSearchGmaps}
                  disabled={searchGmapsLoading || !searchGmapsQuery.trim()}
                  style={{
                    fontSize: '0.8rem',
                    padding: '0.5rem 1rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontWeight: 700,
                    background: '#081d35',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  <Search size={13} className={searchGmapsLoading ? 'animate-spin' : ''} />
                  {searchGmapsLoading ? 'Mencari...' : 'Tarik dari Google Maps / OSM'}
                </button>
              </div>

              {/* Geocoding Results List */}
              {searchGmapsResults.length > 0 && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '0.75rem',
                    marginTop: '0.5rem',
                  }}
                >
                  {searchGmapsResults.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '0.75rem',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '0.5rem',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                          <span style={{ fontSize: '0.7rem', color: '#0284c7', fontWeight: 800, textTransform: 'uppercase' }}>
                            {item.source}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                            {item.island}
                          </span>
                        </div>
                        <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.85rem', fontWeight: 700, color: '#0f2c59' }}>
                          {item.name}
                        </h4>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>
                          {item.lat.toFixed(5)}, {item.lng.toFixed(5)}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSelectGmapsResult(item)}
                        style={{
                          width: '100%',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          padding: '0.4rem 0.5rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          background: '#081d35',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        <Check size={12} />
                        Gunakan Titik Ini &amp; Isi Form
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Form Atribut & 4A Wisata */}
          {adminTab === 'form' && (
            <form onSubmit={handleSaveSpatialFeature} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Geometry Mode Switcher: Point vs Route */}
              <div style={{ display: 'flex', gap: '0.5rem', background: '#f8fafc', padding: '0.35rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => {
                    setGeometryMode('point')
                    if (draftPolylineRef.current) draftPolylineRef.current.remove()
                    draftVertexMarkersRef.current.forEach((m) => m.remove())
                    draftVertexMarkersRef.current = []
                    updateDraftMarker(formLat, formLng)
                  }}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    border: geometryMode === 'point' ? '1.5px solid #0284c7' : '1px solid transparent',
                    background: geometryMode === 'point' ? '#ffffff' : 'transparent',
                    color: geometryMode === 'point' ? '#0284c7' : '#64748b',
                    boxShadow: geometryMode === 'point' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    cursor: 'pointer',
                  }}
                >
                  <MapPin size={14} />
                  <span>Titik Tunggal (Point)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setGeometryMode('route')
                    removeDraftMarker()
                  }}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    border: geometryMode === 'route' ? '1.5px solid #0284c7' : '1px solid transparent',
                    background: geometryMode === 'route' ? '#ffffff' : 'transparent',
                    color: geometryMode === 'route' ? '#0284c7' : '#64748b',
                    boxShadow: geometryMode === 'route' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    cursor: 'pointer',
                  }}
                >
                  <Route size={14} />
                  <span>Garis Rute / Jalur (Polyline)</span>
                </button>
              </div>

              {/* Interactive Instructions / Status */}
              {geometryMode === 'point' ? (
                <div
                  style={{
                    background: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    color: '#065f46',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <Crosshair size={14} />
                  <span>
                    Tip: Klik pada peta atau seret marker pin merah untuk memperbarui titik koordinat secara langsung.
                  </span>
                </div>
              ) : (
                <div
                  style={{
                    background: '#f0f9ff',
                    border: '1px solid #bae6fd',
                    padding: '0.75rem 0.85rem',
                    borderRadius: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0369a1', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Navigation size={14} />
                      <span>{routeWaypoints.length} Titik Lintasan Belokan</span>
                    </div>
                    {routeWaypoints.length > 0 && (
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0284c7', background: '#ffffff', padding: '0.15rem 0.5rem', borderRadius: '6px', border: '1px solid #bae6fd' }}>
                        Panjang: {calculateTotalDistance(routeWaypoints).km} km ({calculateTotalDistance(routeWaypoints).nm} NM)
                      </span>
                    )}
                  </div>
                  <p style={{ margin: 0, fontSize: '0.73rem', color: '#475569', lineHeight: 1.4 }}>
                    Klik berulang kali pada peta untuk menambah titik belokan jalur. Seret nomor titik di peta untuk membelokkan jalur rute secara presisi.
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem' }}>
                    <button
                      type="button"
                      onClick={handleUndoLastWaypoint}
                      disabled={routeWaypoints.length === 0}
                      style={{
                        padding: '0.35rem 0.65rem',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        color: '#334155',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        cursor: routeWaypoints.length === 0 ? 'not-allowed' : 'pointer',
                        opacity: routeWaypoints.length === 0 ? 0.5 : 1,
                      }}
                    >
                      <Undo size={12} />
                      <span>Hapus Titik Terakhir</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleClearRoute}
                      disabled={routeWaypoints.length === 0}
                      style={{
                        padding: '0.35rem 0.65rem',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        background: '#fff1f2',
                        border: '1px solid #fecdd3',
                        color: '#dc2626',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        cursor: routeWaypoints.length === 0 ? 'not-allowed' : 'pointer',
                        opacity: routeWaypoints.length === 0 ? 0.5 : 1,
                      }}
                    >
                      <RotateCcw size={12} />
                      <span>Bersihkan Seluruh Jalur</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Grid 1: Basic Identifiers */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                    Nama Titik / Objek <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Nama objek wisata / fasilitas..."
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.65rem',
                      fontSize: '0.8rem',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      color: '#0f172a',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                    Layer Spasial <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    value={formLayer}
                    onChange={(e) => {
                      const lyr = e.target.value
                      setFormLayer(lyr)
                      if (['LAYER_WATER_INFRA', 'LAYER_ENERGY_WASTE'].includes(lyr)) {
                        setFormCategory('resiliensi')
                      } else {
                        setFormCategory('publik')
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.65rem',
                      fontSize: '0.8rem',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      color: '#0f172a',
                      outline: 'none',
                    }}
                  >
                    <option value="LAYER_TOURISM_4A">4A Wisata &amp; Bahari (Attraction, Access, Amenities, Ancillary)</option>
                    <option value="LAYER_HERITAGE">Situs Sejarah &amp; Cagar Budaya</option>
                    <option value="LAYER_ACCOMMODATION">Akomodasi &amp; Penginapan</option>
                    <option value="LAYER_KOPERASI_UMKM">Koperasi &amp; Sentra UMKM Rempah</option>
                    <option value="LAYER_PUBLIC_SAFETY">Fasilitas Umum &amp; Transportasi (Dermaga, Pelabuhan, Kantor)</option>
                    <option value="LAYER_WATER_INFRA">Infrastruktur Air RO &amp; Sensor IoT</option>
                    <option value="LAYER_ENERGY_WASTE">Energi Surya &amp; Pengelolaan Sampah</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                    Pulau <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    value={formIsland}
                    onChange={(e) => setFormIsland(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.65rem',
                      fontSize: '0.8rem',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      color: '#0f172a',
                      outline: 'none',
                    }}
                  >
                    <option value="Banda Neira">Banda Neira</option>
                    <option value="Banda Besar">Banda Besar (Lonthoir)</option>
                    <option value="Banda Api">Banda Api (Gunung Api)</option>
                    <option value="Pulau Ay">Pulau Ay</option>
                    <option value="Pulau Hatta">Pulau Hatta (Rozengain)</option>
                    <option value="Pulau Rhun">Pulau Rhun (PRun)</option>
                    <option value="Pulau Pisang">Pulau Pisang (Syahrir)</option>
                    <option value="Karang Hatta">Karang Hatta (Atol Selat)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                    Kategori Sistem
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as 'publik' | 'resiliensi')}
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.65rem',
                      fontSize: '0.8rem',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      color: '#0f172a',
                      outline: 'none',
                    }}
                  >
                    <option value="publik">Publik / Pariwisata</option>
                    <option value="resiliensi">Resiliensi &amp; Infrastruktur</option>
                  </select>
                </div>
              </div>

              {/* Coordinates or Route Specific Attributes */}
              {geometryMode === 'point' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                      Latitude (Lintang) <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={formLat}
                      onChange={(e) => {
                        const latVal = parseFloat(e.target.value) || 0
                        setFormLat(latVal)
                        updateDraftMarker(latVal, formLng)
                      }}
                      style={{
                        width: '100%',
                        padding: '0.45rem 0.65rem',
                        fontSize: '0.8rem',
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        color: '#0f172a',
                        outline: 'none',
                        fontFamily: 'monospace',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                      Longitude (Bujur) <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={formLng}
                      onChange={(e) => {
                        const lngVal = parseFloat(e.target.value) || 0
                        setFormLng(lngVal)
                        updateDraftMarker(formLat, lngVal)
                      }}
                      style={{
                        width: '100%',
                        padding: '0.45rem 0.65rem',
                        fontSize: '0.8rem',
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        color: '#0f172a',
                        outline: 'none',
                        fontFamily: 'monospace',
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: '#f8fafc', padding: '0.85rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0369a1', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Navigation size={14} />
                    <span>Parameter Jalur &amp; Navigasi Maritim / Trekking</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.725rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                        Jenis Koridor / Rute
                      </label>
                      <select
                        value={routeType}
                        onChange={(e) => setRouteType(e.target.value as any)}
                        style={{
                          width: '100%',
                          padding: '0.4rem 0.6rem',
                          fontSize: '0.775rem',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          color: '#0f172a',
                          outline: 'none',
                        }}
                      >
                        <option value="maritime">Jalur Pelayaran Laut (Maritime Route)</option>
                        <option value="heritage">Jalur Napak Tilas Sejarah &amp; Rempah</option>
                        <option value="trekking">Jalur Trekking &amp; Pendakian Gunung</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.725rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                        Moda Transportasi Utama
                      </label>
                      <input
                        type="text"
                        value={routeTransport}
                        onChange={(e) => setRouteTransport(e.target.value)}
                        placeholder="Contoh: Speedboat 2 Mesin, Perahu Motor Ketinting, Jalan Kaki"
                        style={{
                          width: '100%',
                          padding: '0.4rem 0.6rem',
                          fontSize: '0.775rem',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          color: '#0f172a',
                          outline: 'none',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.725rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                        Titik Awal (Origin)
                      </label>
                      <input
                        type="text"
                        value={routeStartName}
                        onChange={(e) => setRouteStartName(e.target.value)}
                        placeholder="Contoh: Dermaga Banda Neira"
                        style={{
                          width: '100%',
                          padding: '0.4rem 0.6rem',
                          fontSize: '0.775rem',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          color: '#0f172a',
                          outline: 'none',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.725rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                        Titik Tujuan (Destination)
                      </label>
                      <input
                        type="text"
                        value={routeEndName}
                        onChange={(e) => setRouteEndName(e.target.value)}
                        placeholder="Contoh: Terminal Dermaga Pulau Ay"
                        style={{
                          width: '100%',
                          padding: '0.4rem 0.6rem',
                          fontSize: '0.775rem',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          color: '#0f172a',
                          outline: 'none',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.725rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                        Estimasi Waktu Tempuh
                      </label>
                      <input
                        type="text"
                        value={routeTravelTime}
                        onChange={(e) => setRouteTravelTime(e.target.value)}
                        placeholder="Contoh: 30 - 45 Menit"
                        style={{
                          width: '100%',
                          padding: '0.4rem 0.6rem',
                          fontSize: '0.775rem',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          color: '#0f172a',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                  Deskripsi / Narasi Objek
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Informasi sejarah, keunikan, daya tarik, atau catatan operasional..."
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.65rem',
                    fontSize: '0.8rem',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    color: '#0f172a',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>

              {/* 4A Tourism Dimension Specific Fields */}
              {(formLayer === 'LAYER_TOURISM_4A' || formLayer === 'LAYER_HERITAGE' || formLayer === 'LAYER_ACCOMMODATION') && (
                <div
                  style={{
                    padding: '0.85rem',
                    background: '#f8fafc',
                    border: '1px dashed #cbd5e1',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.4rem' }}>
                    <Sparkles size={14} color="#059669" />
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f2c59' }}>
                      Metadata Dimensi 4A Kepariwisataan (Attraction, Accessibility, Amenities, Ancillary)
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                    {/* Sub-type */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.725rem', fontWeight: 700, color: '#64748b', marginBottom: '0.25rem' }}>
                        Sub-Tipe 4A (Attraction)
                      </label>
                      <input
                        type="text"
                        value={form4aSubType}
                        onChange={(e) => setForm4aSubType(e.target.value)}
                        placeholder="Contoh: Spot Diving, Cagar Budaya, Pantai Pasir Putih"
                        style={{
                          width: '100%',
                          padding: '0.4rem 0.6rem',
                          fontSize: '0.775rem',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          color: '#0f172a',
                          outline: 'none',
                        }}
                      />
                    </div>

                    {/* Highlights */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.725rem', fontWeight: 700, color: '#64748b', marginBottom: '0.25rem' }}>
                        Daya Tarik Utama (Attraction Highlights)
                      </label>
                      <input
                        type="text"
                        value={form4aHighlights}
                        onChange={(e) => setForm4aHighlights(e.target.value)}
                        placeholder="Contoh: Terumbu karang meja raksasa, wall diving"
                        style={{
                          width: '100%',
                          padding: '0.4rem 0.6rem',
                          fontSize: '0.775rem',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          color: '#0f172a',
                          outline: 'none',
                        }}
                      />
                    </div>

                    {/* Boat Access */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.725rem', fontWeight: 700, color: '#64748b', marginBottom: '0.25rem' }}>
                        Aksesibilitas (Boat Access)
                      </label>
                      <input
                        type="text"
                        value={form4aBoatAccess}
                        onChange={(e) => setForm4aBoatAccess(e.target.value)}
                        placeholder="Contoh: Speedboat dari Pelabuhan Neira"
                        style={{
                          width: '100%',
                          padding: '0.4rem 0.6rem',
                          fontSize: '0.775rem',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          color: '#0f172a',
                          outline: 'none',
                        }}
                      />
                    </div>

                    {/* Travel Time */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.725rem', fontWeight: 700, color: '#64748b', marginBottom: '0.25rem' }}>
                        Estimasi Waktu Tempuh
                      </label>
                      <input
                        type="text"
                        value={form4aTravelTime}
                        onChange={(e) => setForm4aTravelTime(e.target.value)}
                        placeholder="Contoh: 25 menit"
                        style={{
                          width: '100%',
                          padding: '0.4rem 0.6rem',
                          fontSize: '0.775rem',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          color: '#0f172a',
                          outline: 'none',
                        }}
                      />
                    </div>

                    {/* Entry Fee */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.725rem', fontWeight: 700, color: '#64748b', marginBottom: '0.25rem' }}>
                        Tarif / Tiket Masuk (Rp)
                      </label>
                      <input
                        type="number"
                        value={form4aEntryFee}
                        onChange={(e) => setForm4aEntryFee(e.target.value)}
                        placeholder="Contoh: 20000"
                        style={{
                          width: '100%',
                          padding: '0.4rem 0.6rem',
                          fontSize: '0.775rem',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          color: '#0f172a',
                          outline: 'none',
                        }}
                      />
                    </div>

                    {/* Best Time */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.725rem', fontWeight: 700, color: '#64748b', marginBottom: '0.25rem' }}>
                        Waktu Kunjungan Terbaik
                      </label>
                      <input
                        type="text"
                        value={form4aBestTime}
                        onChange={(e) => setForm4aBestTime(e.target.value)}
                        placeholder="Contoh: 08:00 - 16:00 WIT, Oktober-April"
                        style={{
                          width: '100%',
                          padding: '0.4rem 0.6rem',
                          fontSize: '0.775rem',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          color: '#0f172a',
                          outline: 'none',
                        }}
                      />
                    </div>

                    {/* Facilities */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.725rem', fontWeight: 700, color: '#64748b', marginBottom: '0.25rem' }}>
                        Fasilitas (Amenities)
                      </label>
                      <input
                        type="text"
                        value={form4aFacilities}
                        onChange={(e) => setForm4aFacilities(e.target.value)}
                        placeholder="Contoh: Toilet, Gazebo, Penyewaan Alat Snorkel"
                        style={{
                          width: '100%',
                          padding: '0.4rem 0.6rem',
                          fontSize: '0.775rem',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          color: '#0f172a',
                          outline: 'none',
                        }}
                      />
                    </div>

                    {/* WhatsApp Contact */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.725rem', fontWeight: 700, color: '#64748b', marginBottom: '0.25rem' }}>
                        WhatsApp Pemandu / Pengelola (Ancillary)
                      </label>
                      <input
                        type="text"
                        value={form4aContactWhatsapp}
                        onChange={(e) => setForm4aContactWhatsapp(e.target.value)}
                        placeholder="6281234567890"
                        style={{
                          width: '100%',
                          padding: '0.4rem 0.6rem',
                          fontSize: '0.775rem',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          color: '#0f172a',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <input
                      type="checkbox"
                      id="guideCheckbox"
                      checked={form4aGuideAvailable}
                      onChange={(e) => setForm4aGuideAvailable(e.target.checked)}
                      style={{ accentColor: '#059669', cursor: 'pointer' }}
                    />
                    <label htmlFor="guideCheckbox" style={{ fontSize: '0.75rem', color: '#334155', cursor: 'pointer' }}>
                      Tersedia Pemandu Lokal Resmi (Kelompok Sadar Wisata Pokdarwis Banda)
                    </label>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={handleCloseAdminStudio}
                  disabled={isSavingFeature}
                  style={{
                    fontSize: '0.8rem',
                    padding: '0.45rem 1rem',
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    color: '#334155',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingFeature}
                  style={{
                    fontSize: '0.8rem',
                    padding: '0.45rem 1.25rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontWeight: 700,
                    background: '#059669',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)',
                  }}
                >
                  <Save size={13} className={isSavingFeature ? 'animate-spin' : ''} />
                  {isSavingFeature
                    ? 'Menyimpan ke PostGIS...'
                    : editingFeatureId
                    ? geometryMode === 'route'
                      ? 'Perbarui Jalur Rute'
                      : 'Perbarui Titik'
                    : geometryMode === 'route'
                    ? 'Simpan Jalur Rute ke PostGIS'
                    : 'Simpan Titik ke PostGIS'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Main Grid: Interactive Map + Inspection Sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedFeature ? '1fr 340px' : '1fr', gap: '1.25rem', alignItems: 'start' }}>
        {/* Leaflet Map Card */}
        <div
          style={{
            padding: 0,
            overflow: 'hidden',
            border: '1px solid #cbd5e1',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(15, 44, 89, 0.06)',
            position: 'relative',
            background: '#ffffff',
          }}
        >
          {/* Active Features Status Badge */}
          <div
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              zIndex: 1000,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(8px)',
              border: '1px solid #e2e8f0',
              padding: '0.35rem 0.75rem',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#0f2c59',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              boxShadow: '0 2px 8px rgba(15, 44, 89, 0.08)',
            }}
          >
            <Radio size={12} className="animate-pulse" color="#059669" />
            <span>{filteredFeatures.length} Objek Aktif</span>
          </div>

          {/* Leaflet Map Div */}
          <div
            ref={mapContainerRef}
            style={{
              width: '100%',
              height: '620px',
              background: '#e0f2fe',
            }}
          />

          {/* Selected Village Detail Inspection Card (Matching User Mockup) */}
          {selectedVillage && (
            <div
              className="animate-fade-in"
              data-lenis-prevent
              style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                zIndex: 1000,
                background: 'rgba(255, 255, 255, 0.98)',
                backdropFilter: 'blur(10px)',
                border: '1.5px solid #cbd5e1',
                borderRadius: '16px',
                padding: '1.15rem 1.25rem',
                maxWidth: '310px',
                width: 'calc(100% - 24px)',
                boxShadow: '0 10px 30px rgba(15, 44, 89, 0.14)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#0f766e', letterSpacing: '-0.02em' }}>
                    {selectedVillage.name}
                  </h3>
                  <div style={{ width: '40px', height: '3.5px', background: '#f97316', borderRadius: '2px', marginTop: '4px' }} />
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedVillage(null)}
                  style={{
                    background: '#f1f5f9',
                    border: 'none',
                    color: '#64748b',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title="Tutup Profil Desa"
                >
                  <X size={13} />
                </button>
              </div>

              <p style={{ margin: '0.65rem 0 0.85rem', fontSize: '0.78rem', color: '#475569', lineHeight: 1.5 }}>
                {selectedVillage.description}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.65rem', fontSize: '0.73rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Pulau:</span>
                  <span style={{ fontWeight: 700, color: '#0f2c59' }}>{selectedVillage.island}</span>
                </div>
                {selectedVillage.population && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Populasi:</span>
                    <span style={{ fontWeight: 700, color: '#0f2c59' }}>{selectedVillage.population}</span>
                  </div>
                )}
                {selectedVillage.main_commodity && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Komoditas / Potensi:</span>
                    <span style={{ fontWeight: 600, color: '#059669', textAlign: 'right', maxWidth: '170px' }}>{selectedVillage.main_commodity}</span>
                  </div>
                )}
                {selectedVillage.highlights && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #e2e8f0', paddingTop: '0.3rem' }}>
                    <span style={{ color: '#64748b' }}>Daya Tarik:</span>
                    <span style={{ fontWeight: 600, color: '#0284c7', textAlign: 'right', maxWidth: '170px' }}>{selectedVillage.highlights}</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => handleFocusVillage(selectedVillage.name)}
                  style={{
                    flex: 1,
                    padding: '0.38rem 0.6rem',
                    borderRadius: '8px',
                    fontSize: '0.73rem',
                    fontWeight: 700,
                    background: '#081d35',
                    color: '#ffffff',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <Compass size={12} />
                  Fokuskan Wilayah
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedVillage(null)}
                  style={{
                    padding: '0.38rem 0.65rem',
                    borderRadius: '8px',
                    fontSize: '0.73rem',
                    fontWeight: 600,
                    background: '#f1f5f9',
                    color: '#475569',
                    border: '1px solid #cbd5e1',
                    cursor: 'pointer',
                  }}
                >
                  Tutup
                </button>
              </div>
            </div>
          )}

          {/* Floating Atlas-Style Map Legend Card (Inside Map - Atlas Cartography Layout) */}
          <div
            data-lenis-prevent
            style={{
              position: 'absolute',
              bottom: '16px',
              left: '16px',
              zIndex: 1000,
              background: 'rgba(255, 255, 255, 0.96)',
              backdropFilter: 'blur(10px)',
              border: '1.5px solid #cbd5e1',
              borderRadius: '10px',
              boxShadow: '0 4px 18px rgba(15, 44, 89, 0.12)',
              maxWidth: '240px',
              width: 'calc(100% - 32px)',
              overflow: 'hidden',
              pointerEvents: 'auto',
            }}
          >
            {/* Legend Card Header */}
            <div
              onClick={() => setAtlasLegendOpen((prev) => !prev)}
              style={{
                padding: '0.55rem 0.75rem',
                borderBottom: atlasLegendOpen ? '1px solid #e2e8f0' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#f8fafc',
                cursor: 'pointer',
                userSelect: 'none',
              }}
              title="Klik untuk menyembunyikan / menampilkan legenda"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Layers size={13} color="#0f2c59" />
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: '#0f2c59',
                  }}
                >
                  Legenda Peta
                </span>
              </div>
              <button
                type="button"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {atlasLegendOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
              </button>
            </div>

            {/* Legend Content */}
            {atlasLegendOpen && (
              <div
                style={{
                  padding: '0.55rem 0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                  maxHeight: '270px',
                  overflowY: 'auto',
                }}
              >
                {Object.entries(LAYER_COLORS).map(([lyr, col]) => {
                  const isActive = selectedLayers.has(lyr)
                  const label = LAYER_LABELS[lyr] || lyr
                  const count = filteredFeatures.filter((f) => f.properties.layer_type === lyr).length
                  return (
                    <div
                      key={lyr}
                      onClick={() => toggleLayer(lyr)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.45rem',
                        cursor: 'pointer',
                        opacity: isActive ? 1 : 0.4,
                        transition: 'opacity 0.15s ease',
                        padding: '0.15rem 0',
                      }}
                      title={isActive ? `Klik untuk menyembunyikan ${label}` : `Klik untuk menampilkan ${label}`}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        {/* Miniature Location Pin Matching the Map Pin */}
                        <svg width="13" height="17" viewBox="0 0 28 36" fill="none" style={{ flexShrink: 0 }}>
                          <path
                            d="M14 0C6.268 0 0 6.268 0 14C0 23.8 12.2 34.6 13.3 35.6C13.7 35.9 14.3 35.9 14.7 35.6C15.8 34.6 28 23.8 28 14C28 6.268 21.732 0 14 0Z"
                            fill={col}
                            stroke="#ffffff"
                            strokeWidth="2"
                          />
                          <circle cx="14" cy="13.5" r="5" fill="#ffffff" />
                          <circle cx="14" cy="13.5" r="2.8" fill={col} />
                        </svg>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: isActive ? 600 : 500,
                            color: isActive ? '#0f2c59' : '#94a3b8',
                            lineHeight: 1.2,
                          }}
                        >
                          {label}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: '0.675rem',
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          color: isActive ? col : '#94a3b8',
                          background: `${col}15`,
                          padding: '0.05rem 0.35rem',
                          borderRadius: '4px',
                          flexShrink: 0,
                        }}
                      >
                        {count}
                      </span>
                    </div>
                  )
                })}

                {/* Routes & Connectivity Toggle */}
                <div
                  onClick={() => setShowRoutes((prev) => !prev)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.45rem',
                    cursor: 'pointer',
                    opacity: showRoutes ? 1 : 0.4,
                    transition: 'opacity 0.15s ease',
                    padding: '0.25rem 0',
                    borderTop: '1px dashed #e2e8f0',
                    marginTop: '0.2rem',
                    paddingTop: '0.35rem',
                  }}
                  title={showRoutes ? 'Sembunyikan seluruh garis rute' : 'Tampilkan seluruh garis rute'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <div style={{ width: '13px', height: '3px', borderTop: '2.5px dashed #0284c7' }} />
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: showRoutes ? 700 : 500,
                        color: showRoutes ? '#0369a1' : '#94a3b8',
                        lineHeight: 1.2,
                      }}
                    >
                      Jalur &amp; Rute Maritim
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.675rem',
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      color: showRoutes ? '#0284c7' : '#94a3b8',
                      background: '#0284c718',
                      padding: '0.05rem 0.35rem',
                      borderRadius: '4px',
                      flexShrink: 0,
                    }}
                  >
                    {filteredFeatures.filter((f) => f.geometry?.type === 'LineString').length}
                  </span>
                </div>

                {/* Administrative Village Boundaries (Polygons) Toggle */}
                <div
                  onClick={() => setShowVillageBoundaries((prev) => !prev)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.45rem',
                    cursor: 'pointer',
                    opacity: showVillageBoundaries ? 1 : 0.4,
                    transition: 'opacity 0.15s ease',
                    padding: '0.25rem 0',
                    borderTop: '1px dashed #e2e8f0',
                    marginTop: '0.2rem',
                    paddingTop: '0.35rem',
                  }}
                  title={showVillageBoundaries ? 'Sembunyikan poligon batas desa' : 'Tampilkan poligon batas desa'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <div style={{ width: '13px', height: '11px', background: 'rgba(52, 211, 153, 0.4)', border: '1.5px solid #059669', borderRadius: '3px' }} />
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: showVillageBoundaries ? 700 : 500,
                        color: showVillageBoundaries ? '#0f766e' : '#94a3b8',
                        lineHeight: 1.2,
                      }}
                    >
                      Batas Administrasi Desa
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.675rem',
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      color: showVillageBoundaries ? '#059669' : '#94a3b8',
                      background: '#05966918',
                      padding: '0.05rem 0.35rem',
                      borderRadius: '4px',
                      flexShrink: 0,
                    }}
                  >
                    17
                  </span>
                </div>

                {/* Sub-list of Villages matching user's exact mockup list */}
                {showVillageBoundaries && (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '0.25rem 0.4rem',
                      padding: '0.35rem 0.3rem',
                      background: '#f8fafc',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                      marginTop: '0.15rem',
                      maxHeight: '130px',
                      overflowY: 'auto',
                    }}
                  >
                    {Object.values(VILLAGE_DETAILS).map((v) => {
                      const isVSelected = selectedVillage?.name === v.name
                      return (
                        <div
                          key={v.name}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleFocusVillage(v.name)
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            cursor: 'pointer',
                            padding: '0.15rem 0.3rem',
                            borderRadius: '4px',
                            background: isVSelected ? '#e2e8f0' : 'transparent',
                            transition: 'all 0.15s ease',
                          }}
                          title={`Klik untuk fokus ke wilayah ${v.name} (${v.island})`}
                        >
                          <span
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              background: v.color,
                              flexShrink: 0,
                            }}
                          />
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: isVSelected ? 800 : 500,
                              color: isVSelected ? '#0f172a' : '#334155',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {v.name}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}

                <div
                  style={{
                    borderTop: '1px solid #e2e8f0',
                    marginTop: '0.3rem',
                    paddingTop: '0.4rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.625rem',
                    color: '#94a3b8',
                  }}
                >
                  <span>Proyeksi Spasial</span>
                  <span style={{ fontWeight: 600, color: '#64748b' }}>WGS 84 · RFC 7946</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Selected Feature Detail Inspection Drawer */}
        {selectedFeature && (
          <div
            className="animate-fade-in"
            style={{
              padding: '1.25rem',
              background: '#ffffff',
              border: '1.5px solid #cbd5e1',
              borderRadius: '16px',
              boxShadow: '0 8px 30px rgba(15, 44, 89, 0.08)',
              position: 'relative',
            }}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedFeature(null)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: '#f1f5f9',
                border: 'none',
                color: '#64748b',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={13} />
            </button>

            {/* Layer Type Tag */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: LAYER_COLORS[selectedFeature.properties.layer_type] || '#0f2c59',
                  background: `${LAYER_COLORS[selectedFeature.properties.layer_type] || '#0f2c59'}18`,
                  padding: '0.2rem 0.5rem',
                  borderRadius: '6px',
                }}
              >
                {LAYER_ICONS[selectedFeature.properties.layer_type]}
                {LAYER_LABELS[selectedFeature.properties.layer_type]}
              </span>
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                • {selectedFeature.properties.island_name}
              </span>
            </div>

            {/* Feature Name */}
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.15rem', fontWeight: 700, color: '#0f2c59' }}>
              {selectedFeature.properties.name}
            </h3>

            {/* Description */}
            {selectedFeature.properties.description && (
              <p style={{ margin: '0 0 1rem', fontSize: '0.8rem', color: '#475569', lineHeight: 1.5 }}>
                {selectedFeature.properties.description}
              </p>
            )}

            {/* Contextual Data Boxes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem' }}>
              {/* Point Coordinates or LineString Stats */}
              {selectedFeature.geometry?.type === 'LineString' ? (
                <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', padding: '0.65rem 0.75rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: '#0369a1', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Route size={13} />
                      Panjang Lintasan:
                    </span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0284c7' }}>
                      {selectedFeature.properties.properties_meta?.total_distance_km || 0} km
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginLeft: '0.3rem' }}>
                        ({selectedFeature.properties.properties_meta?.total_distance_nm || 0} NM)
                      </span>
                    </span>
                  </div>
                  {selectedFeature.properties.properties_meta?.travel_time && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                      <span style={{ color: '#64748b' }}>Waktu Tempuh:</span>
                      <span style={{ fontWeight: 700, color: '#0f2c59' }}>{selectedFeature.properties.properties_meta.travel_time}</span>
                    </div>
                  )}
                  {selectedFeature.properties.properties_meta?.transport_mode && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                      <span style={{ color: '#64748b' }}>Moda Transportasi:</span>
                      <span style={{ fontWeight: 600, color: '#0f2c59' }}>{selectedFeature.properties.properties_meta.transport_mode}</span>
                    </div>
                  )}
                  {(selectedFeature.properties.properties_meta?.origin || selectedFeature.properties.properties_meta?.destination) && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', borderTop: '1px dashed #cbd5e1', paddingTop: '0.3rem' }}>
                      <span style={{ color: '#64748b' }}>Rute:</span>
                      <span style={{ fontWeight: 600, color: '#0f2c59' }}>
                        {selectedFeature.properties.properties_meta?.origin || 'Awal'} &rarr; {selectedFeature.properties.properties_meta?.destination || 'Tujuan'}
                      </span>
                    </div>
                  )}
                  {Array.isArray(selectedFeature.geometry.coordinates) && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b' }}>
                      <span>Jumlah Belokan (Waypoints):</span>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0284c7' }}>
                        {selectedFeature.geometry.coordinates.length} titik
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Koordinat:</span>
                  <span style={{ color: '#0f2c59', fontFamily: 'monospace', fontWeight: 600 }}>
                    {Array.isArray(selectedFeature.geometry.coordinates) && typeof selectedFeature.geometry.coordinates[1] === 'number'
                      ? `${selectedFeature.geometry.coordinates[1].toFixed(5)}, ${selectedFeature.geometry.coordinates[0].toFixed(5)}`
                      : '-'}
                  </span>
                </div>
              )}

              {/* Water Infra Attributes */}
              {selectedFeature.properties.layer_type === 'LAYER_WATER_INFRA' && (
                <>
                  {selectedFeature.properties.live_tds_ppm !== undefined && (
                    <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', padding: '0.6rem 0.75rem', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.75rem', color: '#0369a1', fontWeight: 600 }}>Kualitas Air (TDS):</span>
                        <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0284c7' }}>
                          {selectedFeature.properties.live_tds_ppm} ppm
                        </span>
                      </div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: selectedFeature.properties.live_tds_ppm < 100 ? '#059669' : '#d97706' }}>
                        {selectedFeature.properties.water_quality_status || 'Standar Air Bersih'}
                      </div>
                    </div>
                  )}
                  {selectedFeature.properties.tank_level_pct !== undefined && (
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Level Tandon Komunal:</span>
                      <span style={{ color: '#0284c7', fontWeight: 700 }}>{selectedFeature.properties.tank_level_pct}% Penuh</span>
                    </div>
                  )}
                </>
              )}

              {/* Accommodation Attributes */}
              {selectedFeature.properties.layer_type === 'LAYER_ACCOMMODATION' && (
                <>
                  {selectedFeature.properties.price_per_night_rp && (
                    <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '0.5rem 0.75rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: '#065f46', fontWeight: 600 }}>Tarif Menginap:</span>
                      <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#059669' }}>
                        Rp {selectedFeature.properties.price_per_night_rp.toLocaleString('id-ID')} / malam
                      </span>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {selectedFeature.properties.has_clean_ro_water && (
                      <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: '#ecfdf5', color: '#065f46', borderRadius: '6px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Droplets size={10} /> Air Bersih
                      </span>
                    )}
                    {selectedFeature.properties.has_solar_backup && (
                      <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: '#fffbeb', color: '#92400e', borderRadius: '6px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Zap size={10} /> Listrik Surya
                      </span>
                    )}
                  </div>
                  {selectedFeature.properties.contact_whatsapp && (
                    <a
                      href={`https://wa.me/${selectedFeature.properties.contact_whatsapp}?text=${encodeURIComponent(
                        `Halo Pengelola ${selectedFeature.properties.name}, saya menemukan vila Anda melalui Peta Digital Banda Neira dan ingin reservasi kamar.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        marginTop: '0.25rem',
                        width: '100%',
                        textAlign: 'center',
                        fontSize: '0.8rem',
                        padding: '0.5rem',
                        background: '#059669',
                        color: '#ffffff',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontWeight: 600,
                        display: 'block',
                      }}
                    >
                      Pesan via WhatsApp Langsung
                    </a>
                  )}
                </>
              )}

              {/* Heritage Attributes */}
              {selectedFeature.properties.layer_type === 'LAYER_HERITAGE' && (
                <>
                  {selectedFeature.properties.built_year && (
                    <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '0.5rem 0.75rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: '#92400e', fontWeight: 600 }}>Tahun Pendirian:</span>
                      <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#b45309' }}>
                        Tahun {selectedFeature.properties.built_year}
                      </span>
                    </div>
                  )}
                  {selectedFeature.properties.audio_url && (
                    <a
                      href={selectedFeature.properties.audio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        marginTop: '0.25rem',
                        width: '100%',
                        textAlign: 'center',
                        fontSize: '0.8rem',
                        padding: '0.5rem',
                        background: '#ffffff',
                        border: '1px solid #f59e0b',
                        color: '#b45309',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                      }}
                    >
                      <Volume2 size={14} color="#f59e0b" />
                      Dengarkan Audio Guide Sejarah
                    </a>
                  )}
                </>
              )}

              {/* Energy & Waste Attributes */}
              {selectedFeature.properties.layer_type === 'LAYER_ENERGY_WASTE' && (
                <>
                  {selectedFeature.properties.capacity_kwp && (
                    <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', padding: '0.5rem 0.75rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: '#9f1239', fontWeight: 600 }}>Kapasitas PLTS:</span>
                      <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#e11d48' }}>
                        {selectedFeature.properties.capacity_kwp} kWp (Surya)
                      </span>
                    </div>
                  )}
                  {selectedFeature.properties.plastic_conversion_rule && (
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.725rem', color: '#059669', fontWeight: 600 }}>
                      Program Lingkungan: {selectedFeature.properties.plastic_conversion_rule}
                    </div>
                  )}
                </>
              )}

              {/* Koperasi & UMKM Attributes */}
              {selectedFeature.properties.layer_type === 'LAYER_KOPERASI_UMKM' && (
                <>
                  {selectedFeature.properties.commodities_accepted && (
                    <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', padding: '0.5rem 0.75rem', borderRadius: '8px' }}>
                      <span style={{ fontSize: '0.7rem', color: '#6d28d9', display: 'block', marginBottom: '0.2rem', fontWeight: 600 }}>
                        Komoditas Diterima:
                      </span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#7c3aed' }}>
                        {selectedFeature.properties.commodities_accepted}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Quick Action Button to re-center */}
            <button
              type="button"
              onClick={() => handleFocusFeature(selectedFeature)}
              style={{
                width: '100%',
                justifyContent: 'center',
                fontSize: '0.75rem',
                padding: '0.45rem',
                marginBottom: isOfficerOrAdmin ? '0.6rem' : 0,
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                color: '#334155',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              {selectedFeature.geometry?.type === 'LineString' ? 'Fokuskan Seluruh Jalur di Peta' : 'Fokuskan Titik Ini di Peta'}
            </button>

            {/* Admin Management Actions */}
            {isOfficerOrAdmin && (
              <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => handleStartEditFeature(selectedFeature)}
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    padding: '0.45rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    color: '#0f2c59',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <Edit2 size={12} />
                  {selectedFeature.geometry?.type === 'LineString' ? 'Edit Garis Rute' : 'Edit Titik Ini'}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteFeature(selectedFeature.id, selectedFeature.properties.name)}
                  disabled={isDeletingFeature}
                  style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#dc2626',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.45rem 0.65rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                  title={selectedFeature.geometry?.type === 'LineString' ? 'Hapus rute ini secara permanen dari PostGIS' : 'Hapus titik ini secara permanen dari PostGIS'}
                >
                  <Trash2 size={12} />
                  {isDeletingFeature ? 'Menghapus...' : 'Hapus'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
