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
  Layers,
  Search,
  RefreshCw,
  Volume2,
  Radio,
  HardDriveDownload,
  Wifi,
  WifiOff,
  CheckCircle2,
  AlertCircle,
  Trash2,
} from 'lucide-react'
import {
  gisService,
  GeoJSONFeature,
  GISSummaryResponse,
} from '../services/gis'
import { JelajahPetaDesktopView } from './maps/JelajahPetaDesktopView'

// Helper icons mapping
const LAYER_ICONS: Record<string, React.ReactNode> = {
  LAYER_TOURISM_4A: <Compass size={14} />,
  LAYER_HERITAGE: <Landmark size={14} />,
  LAYER_ACCOMMODATION: <Home size={14} />,
  LAYER_KOPERASI_UMKM: <Store size={14} />,
  LAYER_PUBLIC_SAFETY: <Shield size={14} />,
  LAYER_WATER_INFRA: <Droplets size={14} />,
  LAYER_ENERGY_WASTE: <Zap size={14} />,
}

const LAYER_COLORS: Record<string, string> = {
  LAYER_TOURISM_4A: '#06b6d4', // Cyan
  LAYER_HERITAGE: '#f59e0b', // Amber
  LAYER_ACCOMMODATION: '#10b981', // Emerald
  LAYER_KOPERASI_UMKM: '#8b5cf6', // Violet
  LAYER_PUBLIC_SAFETY: '#3b82f6', // Blue
  LAYER_WATER_INFRA: '#0ea5e9', // Sky Teal
  LAYER_ENERGY_WASTE: '#f43f5e', // Rose
}

const LAYER_LABELS: Record<string, string> = {
  LAYER_TOURISM_4A: 'Daya Tarik Wisata 4A',
  LAYER_HERITAGE: '177 Cagar Budaya',
  LAYER_ACCOMMODATION: 'Eco-Stay & Vila',
  LAYER_KOPERASI_UMKM: 'Koperasi & UMKM',
  LAYER_PUBLIC_SAFETY: 'Keselamatan Publik',
  LAYER_WATER_INFRA: 'Air Bersih RO (IoT TDS)',
  LAYER_ENERGY_WASTE: 'Energi Surya & Sampah',
}

export const InteractiveMapWorkspace: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const layerGroupRef = useRef<L.LayerGroup | null>(null)

  // State
  const [features, setFeatures] = useState<GeoJSONFeature[]>([])
  const [gisMeta, setGisMeta] = useState<GISSummaryResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [mapViewMode, setMapViewMode] = useState<'leaflet' | 'figma'>('figma')
  const [selectedFeature, setSelectedFeature] = useState<GeoJSONFeature | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [islandFilter, setIslandFilter] = useState<string>('')
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'publik' | 'resiliensi'>('all')

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
    }

    return () => {
      // Clean up map when component unmounts
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Filter features according to active filters
  const filteredFeatures = useMemo(() => {
    return features.filter((feat) => {
      const { layer_type, category, island_name, name, description } = feat.properties

      // Layer multi-selection filter
      if (!selectedLayers.has(layer_type)) return false

      // Category filter
      if (categoryFilter !== 'all' && category !== categoryFilter) return false

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
  }, [features, selectedLayers, categoryFilter, islandFilter, searchQuery])

  // Update Leaflet markers whenever filteredFeatures change
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return

    layerGroupRef.current.clearLayers()

    filteredFeatures.forEach((feat) => {
      const [lng, lat] = feat.geometry.coordinates
      const { name, layer_type, island_name, description } = feat.properties

      const color = LAYER_COLORS[layer_type] || '#10b981'
      const label = LAYER_LABELS[layer_type] || layer_type

      // Create Custom SVG DivIcon
      const iconHtml = `
        <div style="
          position: relative;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: ${color};
            opacity: 0.3;
            animation: pulse-ring 2s infinite;
          "></div>
          <div style="
            position: relative;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: #0f172a;
            border: 2px solid ${color};
            box-shadow: 0 0 10px ${color}88, 0 2px 6px rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            color: ${color};
            font-size: 11px;
            font-weight: 900;
          ">
            ●
          </div>
        </div>
      `

      const customIcon = L.divIcon({
        className: 'custom-gis-pin',
        html: iconHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
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
            📍 ${island_name}
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
  }, [filteredFeatures])

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
      const [lng, lat] = feat.geometry.coordinates
      mapInstanceRef.current.setView([lat, lng], 15, { animate: true })
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
      <div className="workspace-header" style={{ marginBottom: '1.25rem' }}>
        <div>
          <span className="badge badge-emerald" style={{ marginBottom: '0.4rem', display: 'inline-flex', gap: '0.35rem' }}>
            <Layers size={12} /> Mandat Fauzan Arisanto &amp; SRS 10.1 (PostGIS &amp; Leaflet)
          </span>
          <h2 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 900, color: '#f8fafc', letterSpacing: '-0.02em' }}>
            Peta Spasial Interaktif 7-Layer Banda Neira
          </h2>
          <p style={{ margin: '0.35rem 0 0', color: '#94a3b8', fontSize: '0.875rem' }}>
            Visualisasi terpadu pariwisata 4A, 177 cagar budaya, eco-stay mandiri, koperasi UMKM, keselamatan pelayaran, serta telemetri resiliensi air RO &amp; energi surya.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'inline-flex', background: 'rgba(15, 23, 42, 0.8)', padding: '0.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <button
              type="button"
              onClick={() => setMapViewMode('figma')}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                background: mapViewMode === 'figma' ? '#d97706' : 'transparent',
                color: '#ffffff',
                transition: 'all 0.2s',
              }}
            >
              🗺️ Peta Vektor Figma
            </button>
            <button
              type="button"
              onClick={() => setMapViewMode('leaflet')}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                background: mapViewMode === 'leaflet' ? '#0284c7' : 'transparent',
                color: '#ffffff',
                transition: 'all 0.2s',
              }}
            >
              🛰️ 7-Layer Leaflet
            </button>
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={loadGISData}
            disabled={loading}
            style={{ fontSize: '0.8rem', padding: '0.5rem 0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Muat Ulang Data
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleResetMapView}
            style={{ fontSize: '0.8rem', padding: '0.5rem 0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Compass size={13} />
            Pusat Banda
          </button>
        </div>
      </div>

      {/* Alert Notification Toast */}
      {notificationMsg && (
        <div
          className="animate-fade-in"
          style={{
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1rem',
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
            fontSize: '0.85rem',
            fontWeight: 600,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {notificationMsg.type === 'success' ? (
              <CheckCircle2 size={16} />
            ) : notificationMsg.type === 'info' ? (
              <AlertCircle size={16} />
            ) : (
              <AlertCircle size={16} />
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
              fontWeight: 800,
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* PWA Offline Caching & Island Resilience HUD Bar */}
      <div
        className="app-card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: '0.85rem 1.25rem',
          marginBottom: '1.25rem',
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          {/* Status Indicator */}
          {isUsingCachedData || isOffline ? (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.35rem 0.85rem',
                borderRadius: '999px',
                background: 'rgba(245, 158, 11, 0.16)',
                border: '1px solid rgba(245, 158, 11, 0.45)',
                color: '#fbbf24',
                fontSize: '0.78rem',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
              }}
            >
              <WifiOff size={14} />
              <span>OFFLINE: MEMAKAI CACHE LOKAL ({features.length} TITIK)</span>
            </div>
          ) : cacheInfo.isCached ? (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.35rem 0.85rem',
                borderRadius: '999px',
                background: 'rgba(16, 185, 129, 0.14)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                color: '#34d399',
                fontSize: '0.78rem',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
              }}
            >
              <CheckCircle2 size={14} />
              <span>PETA TERSIMPAN DI PERANGKAT ({cacheInfo.featureCount} TITIK • SIAP OFFLINE)</span>
            </div>
          ) : (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.35rem 0.85rem',
                borderRadius: '999px',
                background: 'rgba(6, 182, 212, 0.12)',
                border: '1px solid rgba(6, 182, 212, 0.35)',
                color: '#38bdf8',
                fontSize: '0.78rem',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
              }}
            >
              <Wifi size={14} />
              <span>ONLINE LIVE (BELUM DI-CACHE SECARA PERMANEN)</span>
            </div>
          )}

          {cacheInfo.cachedAt && (
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Sinkronisasi Terakhir:{' '}
              <strong style={{ color: '#e2e8f0' }}>
                {new Date(cacheInfo.cachedAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </strong>
            </span>
          )}
        </div>

        {/* Cache Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleCacheMapForOffline}
            disabled={cachingMap}
            className="btn btn-sm btn-primary"
            style={{
              fontWeight: 800,
              fontSize: '0.78rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: '0 0 15px rgba(16, 185, 129, 0.3)',
            }}
            title="Unduh seluruh data 7-layer PostGIS ke IndexedDB agar bisa dibuka saat tidak ada sinyal di kebun"
          >
            <HardDriveDownload size={14} className={cachingMap ? 'animate-spin' : ''} />
            {cachingMap ? 'Menyimpan...' : '💾 Simpan Peta Offline (IndexedDB)'}
          </button>

          {cacheInfo.isCached && (
            <button
              type="button"
              onClick={handleClearCache}
              className="btn btn-sm btn-secondary"
              style={{
                fontSize: '0.78rem',
                color: '#94a3b8',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
              title="Bersihkan cache lokal peta dari memori browser"
            >
              <Trash2 size={13} /> Bersihkan Cache
            </button>
          )}
        </div>
      </div>

      {/* Layer Switcher & Filter Controller Card */}
      <div
        className="card"
        style={{
          padding: '1.25rem',
          background: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '1.25rem',
        }}
      >
        {/* Category Tabs & Quick Batch Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.75rem' }}>
          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginRight: '0.25rem' }}>
              Kelompok:
            </span>
            <button
              type="button"
              onClick={() => setCategoryFilter('all')}
              style={{
                fontSize: '0.75rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '20px',
                border: categoryFilter === 'all' ? '1px solid #10b981' : '1px solid var(--border-color)',
                background: categoryFilter === 'all' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                color: categoryFilter === 'all' ? '#10b981' : '#94a3b8',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              Semua ({gisMeta?.total_features ?? features.length})
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter('publik')}
              style={{
                fontSize: '0.75rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '20px',
                border: categoryFilter === 'publik' ? '1px solid #06b6d4' : '1px solid var(--border-color)',
                background: categoryFilter === 'publik' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                color: categoryFilter === 'publik' ? '#06b6d4' : '#94a3b8',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              Pariwisata &amp; Publik ({gisMeta?.public_layers_count ?? 19})
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter('resiliensi')}
              style={{
                fontSize: '0.75rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '20px',
                border: categoryFilter === 'resiliensi' ? '1px solid #0ea5e9' : '1px solid var(--border-color)',
                background: categoryFilter === 'resiliensi' ? 'rgba(14, 165, 233, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                color: categoryFilter === 'resiliensi' ? '#0ea5e9' : '#94a3b8',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              Resiliensi &amp; Infrastruktur ({gisMeta?.resiliency_layers_count ?? 9})
            </button>
          </div>

          {/* Layer Quick Selectors */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              type="button"
              onClick={selectAllLayers}
              style={{
                background: 'none',
                border: 'none',
                color: '#10b981',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Pilih Semua Layer
            </button>
            <span style={{ color: '#475569' }}>•</span>
            <button
              type="button"
              onClick={clearAllLayers}
              style={{
                background: 'none',
                border: 'none',
                color: '#ef4444',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Kosongkan
            </button>
          </div>
        </div>

        {/* 7 Layer Checkbox Toggle Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1rem' }}>
          {gisMeta?.layers.map((layer) => {
            const isActive = selectedLayers.has(layer.id)
            const color = layer.color
            return (
              <button
                key={layer.id}
                type="button"
                onClick={() => toggleLayer(layer.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.4rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: isActive ? `1.5px solid ${color}` : '1px solid rgba(255, 255, 255, 0.1)',
                  background: isActive ? `${color}22` : 'rgba(15, 23, 42, 0.4)',
                  color: isActive ? '#f8fafc' : '#94a3b8',
                  fontSize: '0.775rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: isActive ? color : 'transparent',
                    color: isActive ? '#080c14' : color,
                  }}
                >
                  {LAYER_ICONS[layer.id] || <Layers size={11} />}
                </span>
                <span>{layer.name}</span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '10px',
                    background: isActive ? `${color}44` : 'rgba(255, 255, 255, 0.05)',
                    color: isActive ? color : '#64748b',
                    fontWeight: 800,
                  }}
                >
                  {layer.feature_count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Island Filters & Search Input */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          {/* Island Filter Buttons */}
          <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', marginRight: '0.2rem' }}>
              Wilayah:
            </span>
            {['', 'Pulau Neira', 'Banda Besar', 'Pulau Hatta', 'Pulau Ay', 'Gunung Api'].map((isl) => (
              <button
                type="button"
                key={isl}
                onClick={() => setIslandFilter(isl)}
                style={{
                  fontSize: '0.725rem',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '16px',
                  border: islandFilter === isl ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.08)',
                  background: islandFilter === isl ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
                  color: islandFilter === isl ? '#f59e0b' : '#94a3b8',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                {isl || 'Semua'}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              placeholder="Cari situs, benteng, vila..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.4rem 0.75rem 0.4rem 2rem',
                fontSize: '0.775rem',
                background: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                color: '#f8fafc',
                outline: 'none',
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Content: Figma Desktop Vector Map vs Leaflet Map */}
      {mapViewMode === 'figma' ? (
        <div style={{ marginBottom: '1.5rem' }}>
          <JelajahPetaDesktopView />
        </div>
      ) : (
      /* Main Grid: Interactive Map + Inspection Sidebar */
      <div style={{ display: 'grid', gridTemplateColumns: selectedFeature ? '1fr 340px' : '1fr', gap: '1.25rem', alignItems: 'start' }}>
        {/* Leaflet Map Card */}
        <div
          className="card"
          style={{
            padding: 0,
            overflow: 'hidden',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
            position: 'relative',
          }}
        >
          {/* Active Features Status Badge */}
          <div
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              zIndex: 1000,
              background: 'rgba(8, 12, 20, 0.85)',
              backdropFilter: 'blur(8px)',
              border: '1px solid var(--border-color)',
              padding: '0.35rem 0.75rem',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 800,
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}
          >
            <Radio size={12} className="animate-pulse" />
            {filteredFeatures.length} Objek Aktif
          </div>

          {/* Leaflet Map Div */}
          <div
            ref={mapContainerRef}
            style={{
              width: '100%',
              height: '560px',
              background: '#0a0f1d',
            }}
          />

          {/* Map Legend Footer */}
          <div
            style={{
              padding: '0.65rem 1rem',
              background: 'rgba(15, 23, 42, 0.95)',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.725rem',
              color: '#94a3b8',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', gap: '0.9rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 800, color: '#f8fafc' }}>Legenda Simbol:</span>
              {Object.entries(LAYER_COLORS).map(([lyr, col]) => (
                <span key={lyr} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: col }}></span>
                  {LAYER_LABELS[lyr]?.split(' ')[0]}
                </span>
              ))}
            </div>
            <span>Peta Kepulauan Banda Neira (WGS 84 / GeoJSON RFC 7946)</span>
          </div>
        </div>

        {/* Selected Feature Detail Inspection Drawer */}
        {selectedFeature && (
          <div
            className="card animate-fade-in"
            style={{
              padding: '1.25rem',
              background: 'rgba(15, 23, 42, 0.9)',
              border: `1px solid ${LAYER_COLORS[selectedFeature.properties.layer_type] || 'var(--border-color)'}`,
              borderRadius: 'var(--radius-lg)',
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
                background: 'rgba(255, 255, 255, 0.05)',
                border: 'none',
                color: '#94a3b8',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
              }}
            >
              ✕
            </button>

            {/* Layer Type Tag */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: LAYER_COLORS[selectedFeature.properties.layer_type],
                  background: `${LAYER_COLORS[selectedFeature.properties.layer_type]}22`,
                  padding: '0.2rem 0.5rem',
                  borderRadius: '12px',
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
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.15rem', fontWeight: 900, color: '#f8fafc' }}>
              {selectedFeature.properties.name}
            </h3>

            {/* Description */}
            {selectedFeature.properties.description && (
              <p style={{ margin: '0 0 1rem', fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                {selectedFeature.properties.description}
              </p>
            )}

            {/* Contextual Data Boxes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem' }}>
              {/* Coordinates */}
              <div style={{ background: 'rgba(8, 12, 20, 0.6)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Titik Koordinat:</span>
                <span style={{ color: '#f8fafc', fontFamily: 'monospace' }}>
                  {selectedFeature.geometry.coordinates[1].toFixed(5)}, {selectedFeature.geometry.coordinates[0].toFixed(5)}
                </span>
              </div>

              {/* Water Infra Attributes */}
              {selectedFeature.properties.layer_type === 'LAYER_WATER_INFRA' && (
                <>
                  {selectedFeature.properties.live_tds_ppm !== undefined && (
                    <div style={{ background: 'rgba(14, 165, 233, 0.1)', border: '1px solid rgba(14, 165, 233, 0.3)', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Live TDS Sensor ESP32:</span>
                        <span style={{ fontSize: '1rem', fontWeight: 900, color: '#0ea5e9' }}>
                          {selectedFeature.properties.live_tds_ppm} ppm
                        </span>
                      </div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: selectedFeature.properties.live_tds_ppm < 100 ? '#10b981' : '#f59e0b' }}>
                        ✓ {selectedFeature.properties.water_quality_status || 'Memenuhi Standar WHO'}
                      </div>
                    </div>
                  )}
                  {selectedFeature.properties.tank_level_pct !== undefined && (
                    <div style={{ background: 'rgba(8, 12, 20, 0.6)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>Level Tandon Komunal:</span>
                      <span style={{ color: '#0ea5e9', fontWeight: 800 }}>{selectedFeature.properties.tank_level_pct}% Penuh</span>
                    </div>
                  )}
                </>
              )}

              {/* Accommodation Attributes */}
              {selectedFeature.properties.layer_type === 'LAYER_ACCOMMODATION' && (
                <>
                  {selectedFeature.properties.price_per_night_rp && (
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Tarif Menginap:</span>
                      <span style={{ fontSize: '0.95rem', fontWeight: 900, color: '#10b981' }}>
                        Rp {selectedFeature.properties.price_per_night_rp.toLocaleString('id-ID')} / malam
                      </span>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {selectedFeature.properties.has_clean_ro_water && (
                      <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
                        <Droplets size={10} /> Air RO Higienis
                      </span>
                    )}
                    {selectedFeature.properties.has_solar_backup && (
                      <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>
                        <Zap size={10} /> Listrik Surya
                      </span>
                    )}
                  </div>
                  {selectedFeature.properties.contact_whatsapp && (
                    <a
                      href={`https://wa.me/${selectedFeature.properties.contact_whatsapp}?text=${encodeURIComponent(
                        `Halo Pengelola ${selectedFeature.properties.name}, saya menemukan vila Anda melalui Peta Digital GIS Banda Neira dan ingin reservasi kamar.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                      style={{ marginTop: '0.25rem', width: '100%', justifyContent: 'center', fontSize: '0.8rem', padding: '0.5rem' }}
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
                    <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Tahun Pendirian:</span>
                      <span style={{ fontSize: '0.95rem', fontWeight: 900, color: '#f59e0b' }}>
                        Tahun {selectedFeature.properties.built_year}
                      </span>
                    </div>
                  )}
                  {selectedFeature.properties.audio_url && (
                    <a
                      href={selectedFeature.properties.audio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary"
                      style={{ marginTop: '0.25rem', width: '100%', justifyContent: 'center', fontSize: '0.8rem', padding: '0.5rem', display: 'inline-flex', gap: '0.4rem' }}
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
                    <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Kapasitas PLTS:</span>
                      <span style={{ fontSize: '0.95rem', fontWeight: 900, color: '#f43f5e' }}>
                        {selectedFeature.properties.capacity_kwp} kWp (Surya)
                      </span>
                    </div>
                  )}
                  {selectedFeature.properties.plastic_conversion_rule && (
                    <div style={{ background: 'rgba(8, 12, 20, 0.6)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.725rem', color: '#10b981' }}>
                      ♻️ Mandat Prof. Purwo: {selectedFeature.properties.plastic_conversion_rule}
                    </div>
                  )}
                </>
              )}

              {/* Koperasi & UMKM Attributes */}
              {selectedFeature.properties.layer_type === 'LAYER_KOPERASI_UMKM' && (
                <>
                  {selectedFeature.properties.commodities_accepted && (
                    <div style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)' }}>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: '0.2rem' }}>
                        Komoditas Diterima:
                      </span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#8b5cf6' }}>
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
              className="btn btn-secondary"
              onClick={() => handleFocusFeature(selectedFeature)}
              style={{ width: '100%', justifyContent: 'center', fontSize: '0.75rem', padding: '0.4rem' }}
            >
              Fokuskan Titik Ini di Peta
            </button>
          </div>
        )}
      </div>
      )}

      {/* Island Spatial Resiliency Bento Summary */}
      <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div className="card" style={{ padding: '1rem', background: 'rgba(15, 23, 42, 0.7)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <Compass size={16} color="#06b6d4" />
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Wisata &amp; Bahari</span>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#06b6d4' }}>5 Lokasi Unggulan</div>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: '#64748b' }}>Lava Flow, Hatta Reef, Pasir Enam, Puncak Vulkanik</p>
        </div>

        <div className="card" style={{ padding: '1rem', background: 'rgba(15, 23, 42, 0.7)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <Landmark size={16} color="#f59e0b" />
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Cagar Budaya</span>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#f59e0b' }}>7 Situs Kurasi Inti</div>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: '#64748b' }}>Benteng Belgica, Nassau, Rumah Hatta, Audio Guide</p>
        </div>

        <div className="card" style={{ padding: '1rem', background: 'rgba(15, 23, 42, 0.7)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <Droplets size={16} color="#0ea5e9" />
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Infrastruktur Air RO</span>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0ea5e9' }}>4 Stasiun IoT Aktif</div>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: '#64748b' }}>Telemetri TDS real-time &amp; Dispenser Otomatis</p>
        </div>

        <div className="card" style={{ padding: '1rem', background: 'rgba(15, 23, 42, 0.7)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <Zap size={16} color="#f43f5e" />
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Bauran Energi Surya</span>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#f43f5e' }}>50 kWp Micro-Grid</div>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: '#64748b' }}>PLTS Hatta mandiri menghemat 42L solar/hari</p>
        </div>
      </div>
    </div>
  )
}
