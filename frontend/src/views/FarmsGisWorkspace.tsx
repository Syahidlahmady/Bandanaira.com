import React, { useEffect, useRef, useState } from 'react'
import { MapPin } from 'lucide-react'
import { User } from '../services/auth'
import { gisService } from '../services/gis'
import {
  Farm,
  Farmer,
  FarmerGroup,
  FarmGeoJSONFeatureCollection,
  FarmStatistics,
  farmerService,
} from '../services/farmers'
import {
  FarmDraftGeometry,
  FarmMap,
  generateSquarePolygonVertices,
} from '../components/FarmMap'

interface FarmsGisWorkspaceProps {
  currentUser?: User | null
  farmers: Farmer[]
  farmerGroups: FarmerGroup[]
  farms: Farm[]
  farmGeoJSON: FarmGeoJSONFeatureCollection
  farmStats: FarmStatistics | null
  farmMsg: { type: 'success' | 'error'; text: string } | null
  verifyingFarmId: string | null
  farmStatusFilter: string
  setFarmStatusFilter: (st: string) => void
  handleVerifyFarm: (farmId: string, status: 'verified' | 'rejected') => void
  isOfficerOrAdmin: boolean
  isFarmerGroupAdmin: boolean
  isFarmerOnly: boolean
  farmForm: {
    farmer_id: string
    farm_code: string
    name: string
    location_description: string
    latitude: number
    longitude: number
    area_sqm: number
    primary_commodity: string
    polygon_boundary_geojson?: Record<string, unknown>
    village?: string
  }
  setFarmForm: React.Dispatch<React.SetStateAction<any>>
  handleCreateQuickFarmerAndFarm: (e: React.FormEvent) => void
  fetchFarmingData: () => void
}

const verticesToPolygonGeoJSON = (vertices: [number, number][]): Record<string, unknown> => {
  const ring = vertices.map(([lat, lng]) => [parseFloat(lng.toFixed(6)), parseFloat(lat.toFixed(6))])
  ring.push([ring[0][0], ring[0][1]])
  return {
    type: 'Polygon',
    coordinates: [ring],
  }
}

export const FarmsGisWorkspace: React.FC<FarmsGisWorkspaceProps> = ({
  currentUser,
  farmers,
  farmerGroups,
  farms,
  farmGeoJSON,
  farmStats,
  farmMsg,
  verifyingFarmId,
  farmStatusFilter,
  setFarmStatusFilter,
  handleVerifyFarm,
  isOfficerOrAdmin,
  isFarmerGroupAdmin,
  isFarmerOnly,
  farmForm,
  setFarmForm,
  handleCreateQuickFarmerAndFarm,
  fetchFarmingData,
}) => {
  const mapSectionRef = useRef<HTMLDivElement | null>(null)
  const [checkingBoundary, setCheckingBoundary] = useState(false)
  const [gettingGps, setGettingGps] = useState(false)
  const [draftVertices, setDraftVertices] = useState<[number, number][]>([])
  const [focusFarmId, setFocusFarmId] = useState<string | null>(null)
  const [showNewFarmerBox, setShowNewFarmerBox] = useState(false)
  const [savingFarmer, setSavingFarmer] = useState(false)
  const [villagesList, setVillagesList] = useState<any[]>([])
  const [villageBoundaryGeoJSON, setVillageBoundaryGeoJSON] = useState<Record<string, unknown> | null>(null)

  const activeVillage = currentUser?.village || farmForm.village || undefined

  // Load official village boundary polygons from GIS module
  useEffect(() => {
    let isMounted = true
    gisService
      .getVillages()
      .then((data) => {
        if (isMounted && data?.features) {
          setVillagesList(data.features)
        }
      })
      .catch((err) => {
        console.warn('Gagal memuat GeoJSON batas wilayah desa:', err)
      })
    return () => {
      isMounted = false
    }
  }, [])

  // Find geometry for active village
  useEffect(() => {
    if (!activeVillage || villagesList.length === 0) {
      setVillageBoundaryGeoJSON(null)
      return
    }
    const vLower = activeVillage.trim().toLowerCase()
    const match = villagesList.find((f: any) => {
      const name = f.properties?.name || f.properties?.village_name || ''
      const nLower = name.trim().toLowerCase()
      return nLower === vLower || vLower.includes(nLower) || nLower.includes(vLower)
    })
    if (match) {
      setVillageBoundaryGeoJSON(match.geometry || match)
    } else {
      setVillageBoundaryGeoJSON(null)
    }
  }, [activeVillage, villagesList])

  const [newFarmerForm, setNewFarmerForm] = useState({
    name: '',
    phone: '',
    farmer_group_id: '',
  })
  const [newFarmerMsg, setNewFarmerMsg] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)
  const [boundaryCheckMsg, setBoundaryCheckMsg] = useState<{
    type: 'success' | 'warning' | 'error'
    text: string
  } | null>(null)

  // Filter farmers & groups scoped to active village
  const accessibleFarmers = activeVillage
    ? farmers.filter(
        (f) => !f.village || f.village.trim().toLowerCase() === activeVillage.trim().toLowerCase()
      )
    : farmers

  const accessibleFarmerGroups = activeVillage
    ? farmerGroups.filter(
        (g) => !g.village || g.village.trim().toLowerCase() === activeVillage.trim().toLowerCase()
      )
    : farmerGroups

  const handleCreateFarmerMember = async () => {
    const cleanName = newFarmerForm.name.trim()
    if (cleanName.length < 2) {
      setNewFarmerMsg({ type: 'error', text: 'Nama lengkap petani minimal 2 huruf.' })
      return
    }
    setSavingFarmer(true)
    setNewFarmerMsg(null)
    try {
      const candidate = `BN-FRM-${String(farmers.length + 1).padStart(3, '0')}`
      const farmerCode = farmers.some((f) => f.farmer_code === candidate)
        ? `BN-FRM-${Date.now().toString().slice(-4)}`
        : candidate
      const created = await farmerService.createFarmer({
        farmer_code: farmerCode,
        name: cleanName,
        phone: newFarmerForm.phone.trim() || undefined,
        farmer_group_id: newFarmerForm.farmer_group_id || accessibleFarmerGroups[0]?.id || undefined,
        village: activeVillage,
      })
      setFarmForm((prev: any) => ({ ...prev, farmer_id: created.id, village: activeVillage || prev.village }))
      setNewFarmerForm({ name: '', phone: '', farmer_group_id: '' })
      setShowNewFarmerBox(false)
      setNewFarmerMsg({
        type: 'success',
        text: `✓ Petani ${created.name} (${created.farmer_code}) berhasil didaftarkan ke Kelompok Tani ${activeVillage ? `Desa ${activeVillage} ` : ''}dan dipilih otomatis.`,
      })
      fetchFarmingData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mendaftarkan petani anggota Poktan.'
      setNewFarmerMsg({ type: 'error', text: msg })
    } finally {
      setSavingFarmer(false)
    }
  }

  const canMapFarms = !isFarmerOnly && (isOfficerOrAdmin || isFarmerGroupAdmin)

  const handleMapDraftChange = (draft: FarmDraftGeometry) => {
    setDraftVertices(draft.vertices)
    setBoundaryCheckMsg(null)
    setFarmForm((prev: any) => ({
      ...prev,
      latitude: draft.latitude,
      longitude: draft.longitude,
      area_sqm: draft.polygon_boundary_geojson ? draft.area_sqm : prev.area_sqm,
      polygon_boundary_geojson: draft.polygon_boundary_geojson,
    }))
  }

  const handleUseDeviceGps = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setBoundaryCheckMsg({
        type: 'warning',
        text: 'Peramban tidak mendukung GPS otomatis. Silakan klik langsung lokasi kebun pada peta satelit.',
      })
      return
    }
    setGettingGps(true)
    setBoundaryCheckMsg(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(6))
        const lng = parseFloat(pos.coords.longitude.toFixed(6))
        const inBanda = lat >= -4.7 && lat <= -4.38 && lng >= 129.6 && lng <= 130.15
        if (!inBanda) {
          setBoundaryCheckMsg({
            type: 'warning',
            text: `Lokasi GPS Anda (${lat}, ${lng}) terdeteksi di luar gugusan Kepulauan Banda. Silakan gunakan tombol "Lompat ke Pulau" di atas peta lalu klik lahan kebun secara langsung.`,
          })
          setGettingGps(false)
          return
        }
        setDraftVertices([])
        setFarmForm((prev: any) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          polygon_boundary_geojson: undefined,
        }))
        setBoundaryCheckMsg({
          type: 'success',
          text: `✓ Titik GPS Kepulauan Banda berhasil diambil (${lat}, ${lng}). Klik "Kotak Cepat" pada peta atau klik 3+ sudut kebun untuk membentuk poligon.`,
        })
        setGettingGps(false)
      },
      (err) => {
        setBoundaryCheckMsg({
          type: 'warning',
          text: `Gagal mengakses GPS (${err.message}). Silakan tandai lokasi langsung di peta satelit.`,
        })
        setGettingGps(false)
      },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  const handleValidateBoundary = async () => {
    const lat = farmForm.latitude
    const lng = farmForm.longitude
    if (!lat || !lng) {
      setBoundaryCheckMsg({
        type: 'warning',
        text: 'Harap tandai lokasi atau klik lahan pada peta terlebih dahulu.',
      })
      return
    }

    setCheckingBoundary(true)
    setBoundaryCheckMsg(null)

    let activeVertices = draftVertices
    if (activeVertices.length < 3) {
      const targetArea = farmForm.area_sqm && farmForm.area_sqm >= 100 ? farmForm.area_sqm : 5000
      activeVertices = generateSquarePolygonVertices(lat, lng, targetArea)
      setDraftVertices(activeVertices)
    }

    const polyGeoJSON = verticesToPolygonGeoJSON(activeVertices)

    try {
      const res = await farmerService.validateBoundary({
        polygon_boundary_geojson: polyGeoJSON,
        village: activeVillage || undefined,
      })

      if (!res.is_valid) {
        setBoundaryCheckMsg({ type: 'error', text: `Format poligon tidak valid: ${res.message}` })
      } else if (res.is_within_village === false) {
        setBoundaryCheckMsg({
          type: 'error',
          text: `⛔ Batas di Luar Wilayah: ${res.message || `Poligon kebun berada di luar batas administratif Desa ${activeVillage}`}. Harap petakan di dalam wilayah desa.`,
        })
      } else if (res.has_overlap) {
        setBoundaryCheckMsg({
          type: 'warning',
          text: `Peringatan Tumpang Tindih Batas (PostGIS): ${res.message} Geser sudut atau pin merah pada peta agar tidak menabrak kebun lain.`,
        })
      } else {
        const villageText = activeVillage ? ` & resmi di dalam wilayah Desa ${activeVillage}` : ''
        setBoundaryCheckMsg({
          type: 'success',
          text: `✓ Batas poligon valid${villageText}! Luas geodesik PostGIS: ${res.calculated_area_sqm.toLocaleString('id-ID')} m².`,
        })
        setFarmForm((prev: any) => ({
          ...prev,
          area_sqm: res.calculated_area_sqm,
          polygon_boundary_geojson: polyGeoJSON,
          village: activeVillage || prev.village,
        }))
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menghubungi server validasi batas.'
      setBoundaryCheckMsg({ type: 'error', text: msg })
    } finally {
      setCheckingBoundary(false)
    }
  }

  const handleFocusFarmOnMap = (farmId: string) => {
    setFocusFarmId(null)
    requestAnimationFrame(() => setFocusFarmId(farmId))
    mapSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Clear draft polygon when parent resets form after successful submission
  useEffect(() => {
    if (!farmForm.name && farmMsg?.type === 'success') {
      setDraftVertices([])
      setBoundaryCheckMsg(null)
      try {
        localStorage.removeItem('banda_draft_farm')
      } catch {
        // ignore
      }
    }
  }, [farmForm.name, farmMsg])

  // Auto-save farm form draft in localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('banda_draft_farm')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.name && !farmForm.name) {
          setFarmForm((prev: any) => ({ ...prev, ...parsed }))
          const ring = parsed?.polygon_boundary_geojson?.coordinates?.[0]
          if (Array.isArray(ring) && ring.length >= 4) {
            const restored: [number, number][] = ring
              .slice(0, -1)
              .map(([lng, lat]: [number, number]) => [lat, lng])
            setDraftVertices(restored)
          }
        }
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    if (farmForm.name) {
      try {
        localStorage.setItem('banda_draft_farm', JSON.stringify(farmForm))
      } catch {
        // ignore
      }
    }
  }, [
    farmForm.name,
    farmForm.area_sqm,
    farmForm.latitude,
    farmForm.longitude,
    farmForm.location_description,
    farmForm.polygon_boundary_geojson,
  ])

  const handleExportFarmsCSV = () => {
    if (farms.length === 0) {
      alert('Tidak ada data plot kebun untuk diekspor.')
      return
    }
    const headers = [
      'Kode Kebun',
      'Nama Kebun',
      'Komoditas',
      'Luas (m2)',
      'Lokasi',
      'Latitude',
      'Longitude',
      'Status Verifikasi',
    ]
    const rows = farms.map((f) => [
      `'${f.farm_code}`,
      `"${f.name.replace(/"/g, '""')}"`,
      f.primary_commodity,
      f.area_sqm,
      `"${(f.location_description || '-').replace(/"/g, '""')}"`,
      f.latitude,
      f.longitude,
      f.verification_status,
    ])
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `data-lahan-kebun-banda-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <section className="app-card animate-fade-in" style={{ marginBottom: '2rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge badge-emerald">GIS &amp; PostGIS Spasial</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              &bull; Wilayah Kepulauan Banda
            </span>
          </div>
          <h2 style={{ fontSize: '1.45rem', color: 'var(--text-main)', fontWeight: 800, margin: 0 }}>
            {isFarmerOnly
              ? 'Peta Sebaran Lahan Perkebunan Rempah'
              : isFarmerGroupAdmin && !isOfficerOrAdmin
              ? 'Peta & Pengajuan Plot Kebun Kelompok Tani'
              : 'Pemetaan Spasial & Verifikasi Lahan Rempah'}
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {isFarmerOnly
              ? 'Visualisasi titik koordinat kebun pala & cengkih Banda Neira. Mode tinjau data petani.'
              : isFarmerGroupAdmin && !isOfficerOrAdmin
              ? 'Klik langsung kebun pada peta satelit di bawah untuk menggambar batas lahan dan mengajukannya ke Kantor Desa.'
              : 'Pemetaan interaktif batas kebun pala & cengkih Banda Neira menggunakan PostGIS dan persetujuan desa.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            type="button"
            onClick={handleExportFarmsCSV}
            className="btn btn-outline-primary"
            style={{ fontSize: '0.85rem', padding: '0.5rem 0.9rem' }}
          >
            📥 Export CSV ({farms.length})
          </button>
          <button
            type="button"
            onClick={fetchFarmingData}
            className="btn btn-secondary"
            style={{ fontSize: '0.85rem', padding: '0.5rem 0.9rem' }}
          >
            🔄 Segarkan Peta
          </button>
        </div>
      </div>

      {farmStats && (
        <div className="stat-grid" style={{ marginBottom: '1.5rem' }}>
          <div className="stat-card" style={{ borderTop: '4px solid var(--emerald-600)' }}>
            <span className="stat-label">Petani Terdaftar</span>
            <div className="stat-value" style={{ color: 'var(--emerald-600)' }}>
              {farmStats.total_farmers}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Profil pekebun aktif</span>
          </div>
          <div className="stat-card" style={{ borderTop: '4px solid var(--ocean-600)' }}>
            <span className="stat-label">Kelompok Tani</span>
            <div className="stat-value" style={{ color: 'var(--ocean-600)' }}>
              {farmStats.total_farmer_groups}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Poktan terdata desa</span>
          </div>
          <div className="stat-card" style={{ borderTop: '4px solid #7c3aed' }}>
            <span className="stat-label">Total Plot Kebun</span>
            <div className="stat-value" style={{ color: '#7c3aed' }}>
              {farmStats.total_farms}
            </div>
            <span className="badge badge-emerald" style={{ marginTop: '0.25rem', display: 'inline-block' }}>
              ✓ {farms.filter((f) => f.verification_status === 'verified').length} Terverifikasi
            </span>
          </div>
          <div className="stat-card" style={{ borderTop: '4px solid #0284c7' }}>
            <span className="stat-label">Total Luas Lahan</span>
            <div className="stat-value" style={{ color: '#0284c7' }}>
              {farmStats.total_area_sqm.toLocaleString('id-ID')} m²
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Hasil geodesik PostGIS</span>
          </div>
        </div>
      )}

      {isOfficerOrAdmin && farms.filter((f) => f.verification_status === 'pending').length > 0 && (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.05) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1.25rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem' }}>⏳</span>
            <div>
              <div style={{ fontSize: '0.875rem', color: '#b45309', fontWeight: 700 }}>
                Menunggu Verifikasi Persetujuan Kantor Desa
              </div>
              <div style={{ fontSize: '0.8rem', color: '#92400e' }}>
                Terdapat <b>{farms.filter((f) => f.verification_status === 'pending').length}</b> plot kebun yang diajukan oleh kelompok tani dan memerlukan pemeriksaan.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setFarmStatusFilter('pending')}
            className="btn btn-primary"
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem', background: '#d97706', borderColor: '#b45309' }}
          >
            Tinjau Sekarang ↓
          </button>
        </div>
      )}

      {farmMsg && (
        <div
          style={{
            marginBottom: '1.25rem',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem',
            fontWeight: 500,
            background: farmMsg.type === 'success' ? 'var(--secondary-light)' : 'var(--danger-light)',
            color: farmMsg.type === 'success' ? '#065f46' : '#991b1b',
            border: `1px solid ${farmMsg.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
          }}
        >
          {farmMsg.text}
        </div>
      )}

      {activeVillage && (
        <div
          style={{
            marginBottom: '1.25rem',
            padding: '0.75rem 1rem',
            background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.08) 0%, rgba(245, 158, 11, 0.04) 100%)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid #fde68a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.6rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.35rem' }}>🏛️</span>
            <div>
              <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#92400e' }}>
                Yurisdiksi Wilayah: Desa {activeVillage}
              </div>
              <div style={{ fontSize: '0.76rem', color: '#78350f' }}>
                Akses manajemen data petani, kelompok tani, dan pemetaan poligon kebun dibatasi di dalam batas administratif Desa {activeVillage}.
              </div>
            </div>
          </div>
          <span
            style={{
              padding: '0.2rem 0.6rem',
              borderRadius: '999px',
              background: '#fef3c7',
              border: '1px solid #f59e0b',
              color: '#92400e',
              fontSize: '0.72rem',
              fontWeight: 700,
            }}
          >
            Batas Resmi Aktif
          </span>
        </div>
      )}

      {/* Peta Satelit Interaktif Pemetaan Lahan */}
      <div ref={mapSectionRef} style={{ marginBottom: '1.5rem' }}>
        <FarmMap
          features={farmGeoJSON.features}
          editable={canMapFarms}
          draftLat={farmForm.latitude}
          draftLng={farmForm.longitude}
          draftVertices={draftVertices}
          onDraftChange={handleMapDraftChange}
          focusFarmId={focusFarmId}
          activeVillageName={activeVillage}
          villageBoundaryGeoJSON={villageBoundaryGeoJSON}
        />
      </div>

      {/* Mode Tinjau Petani (Read-Only) */}
      {isFarmerOnly && (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.08) 0%, rgba(16, 185, 129, 0.03) 100%)',
            border: '1px solid rgba(5, 150, 105, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <span style={{ fontSize: '1.6rem' }}>ℹ️</span>
          <div style={{ fontSize: '0.875rem', color: '#166534', lineHeight: 1.5 }}>
            <b>Mode Tinjau Petani:</b> Petani hanya dapat melihat data dan sebaran plot lahan kebun. Penambahan atau pemetaan lahan baru didaftarkan secara kolektif oleh <b>Pengurus Kelompok Tani</b> dan memerlukan persetujuan verifikasi resmi dari <b>Petugas Kantor Desa Banda Neira</b>.
          </div>
        </div>
      )}

      {/* Formulir Terpadu Pemetaan Lahan 3 Langkah (Poktan & Kantor Desa) */}
      {canMapFarms && (
        <details
          style={{
            marginBottom: '1.5rem',
            background: '#f8fafc',
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid #cbd5e1',
          }}
          open
        >
          <summary style={{ cursor: 'pointer', fontWeight: 800, color: '#0f2c59', fontSize: '0.98rem' }}>
            {isOfficerOrAdmin
              ? '➕ Pemetaan & Pendaftaran Plot Kebun Baru (Kantor Desa)'
              : '🌾 Ajukan Plot Kebun Baru (Kelompok Tani ke Kantor Desa)'}
          </summary>

          {!isOfficerOrAdmin && (
            <div
              style={{
                marginTop: '0.75rem',
                marginBottom: '1rem',
                padding: '0.75rem 1rem',
                background: '#fffbeb',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid #fde68a',
                fontSize: '0.84rem',
                color: '#92400e',
                lineHeight: 1.5,
              }}
            >
              <b>Alur Pengajuan Poktan:</b> Klik langsung kebun pada peta satelit di atas untuk menggambar batasnya. Lahan yang diajukan berstatus <b>⏳ Menunggu Persetujuan</b> hingga diverifikasi Petugas Kantor Desa.
            </div>
          )}

          {/* Langkah 1: Ringkasan Titik/Poligon dari Peta & GPS */}
          <div
            style={{
              marginTop: '0.85rem',
              marginBottom: '1rem',
              padding: '0.85rem 1rem',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#0284c7' }}>
                Langkah 1 · Lokasi &amp; Batas Lahan dari Peta Satelit
              </span>
              <div style={{ fontSize: '0.84rem', color: '#0f2c59', fontWeight: 700 }}>
                {draftVertices.length >= 3 ? (
                  <span style={{ color: '#047857' }}>
                    ✓ Poligon {draftVertices.length} sudut terpetakan &bull; Luas {farmForm.area_sqm.toLocaleString('id-ID')} m² (
                    {(farmForm.area_sqm / 10000).toFixed(2)} Ha)
                  </span>
                ) : (
                  <span>
                    📍 Titik tengah aktif di {farmForm.latitude.toFixed(5)}, {farmForm.longitude.toFixed(5)} (klik peta di atas atau pakai Kotak Cepat untuk menggambar batas)
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleUseDeviceGps}
                disabled={gettingGps}
                className="btn btn-secondary"
                style={{ fontSize: '0.78rem', padding: '0.45rem 0.85rem' }}
              >
                {gettingGps ? '⏳ Mencari GPS...' : '📍 Gunakan GPS Perangkat'}
              </button>
              <button
                type="button"
                onClick={handleValidateBoundary}
                disabled={checkingBoundary}
                className="btn btn-outline-primary"
                style={{ fontSize: '0.78rem', padding: '0.45rem 0.85rem' }}
              >
                {checkingBoundary ? '⏳ Memeriksa Batas...' : '📐 Uji Tumpang Tindih Batas (PostGIS)'}
              </button>
            </div>
          </div>

          {boundaryCheckMsg && (
            <div
              style={{
                marginBottom: '1rem',
                padding: '0.7rem 0.9rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 600,
                background:
                  boundaryCheckMsg.type === 'success'
                    ? '#ecfdf5'
                    : boundaryCheckMsg.type === 'warning'
                    ? '#fffbeb'
                    : '#fef2f2',
                color:
                  boundaryCheckMsg.type === 'success'
                    ? '#065f46'
                    : boundaryCheckMsg.type === 'warning'
                    ? '#92400e'
                    : '#991b1b',
                border: `1px solid ${
                  boundaryCheckMsg.type === 'success'
                    ? '#a7f3d0'
                    : boundaryCheckMsg.type === 'warning'
                    ? '#fde68a'
                    : '#fecaca'
                }`,
              }}
            >
              {boundaryCheckMsg.text}
            </div>
          )}

          {/* Langkah 2: Identitas Kebun & Petani */}
          <form onSubmit={handleCreateQuickFarmerAndFarm}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#0284c7', marginBottom: '0.55rem' }}>
              Langkah 2 · Identitas Kebun &amp; Pemilik Lahan
            </div>

            {newFarmerMsg && (
              <div
                style={{
                  marginBottom: '0.75rem',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  background: newFarmerMsg.type === 'success' ? '#ecfdf5' : '#fef2f2',
                  color: newFarmerMsg.type === 'success' ? '#065f46' : '#991b1b',
                  border: `1px solid ${newFarmerMsg.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
                }}
              >
                {newFarmerMsg.text}
              </div>
            )}

            {showNewFarmerBox && (
              <div
                style={{
                  marginBottom: '0.9rem',
                  padding: '0.9rem',
                  background: '#ffffff',
                  border: '1.5px solid #bae6fd',
                  borderRadius: '10px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f2c59' }}>
                    👨‍🌾 Tambah Petani Anggota Poktan
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowNewFarmerBox(false)}
                    style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Tutup ✕
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '0.75rem', alignItems: 'end' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Nama Lengkap Petani</label>
                    <input
                      type="text"
                      placeholder="Mis. La Ode Usman"
                      value={newFarmerForm.name}
                      onChange={(e) => setNewFarmerForm({ ...newFarmerForm, name: e.target.value })}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Nomor WhatsApp / HP</label>
                    <input
                      type="text"
                      placeholder="Mis. 081234567890"
                      value={newFarmerForm.phone}
                      onChange={(e) => setNewFarmerForm({ ...newFarmerForm, phone: e.target.value })}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Kelompok Tani</label>
                    <select
                      value={newFarmerForm.farmer_group_id || (accessibleFarmerGroups[0]?.id || '')}
                      onChange={(e) => setNewFarmerForm({ ...newFarmerForm, farmer_group_id: e.target.value })}
                      className="form-control"
                    >
                      {accessibleFarmerGroups.length === 0 && <option value="">-- Kelompok Tani Bawaan --</option>}
                      {accessibleFarmerGroups.map((grp) => (
                        <option key={grp.id} value={grp.id}>
                          {grp.name} {grp.village ? `(Desa ${grp.village})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <button
                      type="button"
                      disabled={savingFarmer}
                      onClick={handleCreateFarmerMember}
                      className="btn btn-primary"
                      style={{ width: '100%', padding: '0.55rem 0.9rem', fontSize: '0.8rem' }}
                    >
                      {savingFarmer ? '⏳ Menyimpan...' : 'Simpan Petani ke Poktan'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '0.9rem',
              }}
            >
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem', gap: '0.4rem' }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>
                    Petani Pemilik Lahan ({accessibleFarmers.length})
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowNewFarmerBox((prev) => !prev)}
                    style={{
                      background: '#eff6ff',
                      color: '#1d4ed8',
                      border: '1px solid #bfdbfe',
                      borderRadius: '6px',
                      padding: '0.15rem 0.5rem',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    + Tambah Petani Baru
                  </button>
                </div>
                <select
                  value={farmForm.farmer_id}
                  onChange={(e) => setFarmForm({ ...farmForm, farmer_id: e.target.value })}
                  className="form-control"
                >
                  <option value="">-- Otomatis / Pilih Petani Anggota Poktan --</option>
                  {accessibleFarmers.map((frm) => {
                    const groupName =
                      frm.group?.name ||
                      farmerGroups.find((g) => g.id === frm.farmer_group_id)?.name
                    return (
                      <option key={frm.id} value={frm.id}>
                        {frm.name} ({frm.farmer_code}){frm.village ? ` [Desa ${frm.village}]` : ''}{groupName ? ` — ${groupName}` : ''}
                      </option>
                    )
                  })}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Kode Plot Kebun</label>
                <input
                  type="text"
                  value={farmForm.farm_code}
                  onChange={(e) => setFarmForm({ ...farmForm, farm_code: e.target.value })}
                  required
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Nama Kebun</label>
                <input
                  type="text"
                  placeholder="Mis. Kebun Pala Lonthoir Timur"
                  value={farmForm.name}
                  onChange={(e) => setFarmForm({ ...farmForm, name: e.target.value })}
                  required
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Komoditas Utama</label>
                <select
                  value={farmForm.primary_commodity}
                  onChange={(e) => setFarmForm({ ...farmForm, primary_commodity: e.target.value })}
                  className="form-control"
                >
                  <option value="Pala">Pala</option>
                  <option value="Cengkih">Cengkih</option>
                  <option value="Kayu Manis">Kayu Manis</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Luas Lahan (m²)</label>
                <input
                  type="number"
                  value={farmForm.area_sqm}
                  onChange={(e) => setFarmForm({ ...farmForm, area_sqm: Number(e.target.value) })}
                  required
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Dusun / Lokasi Lahan</label>
                <input
                  type="text"
                  placeholder="Mis. Dusun Batu Laki, Desa Lonthoir"
                  value={farmForm.location_description}
                  onChange={(e) => setFarmForm({ ...farmForm, location_description: e.target.value })}
                  className="form-control"
                />
              </div>
            </div>

            {/* Koordinat Manual Opsional */}
            <details style={{ marginTop: '0.85rem' }}>
              <summary style={{ cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>
                ⚙️ Input Koordinat Manual (Opsional — otomatis terisi saat klik peta)
              </summary>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '0.9rem',
                  marginTop: '0.65rem',
                }}
              >
                <div className="form-group">
                  <label className="form-label">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={farmForm.latitude}
                    onChange={(e) => setFarmForm({ ...farmForm, latitude: parseFloat(e.target.value) || 0 })}
                    required
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={farmForm.longitude}
                    onChange={(e) => setFarmForm({ ...farmForm, longitude: parseFloat(e.target.value) || 0 })}
                    required
                    className="form-control"
                  />
                </div>
              </div>
            </details>

            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1.45rem' }}>
                {isOfficerOrAdmin ? 'Simpan & Sahkan di Peta' : 'Kirim Pengajuan Plot ke Kantor Desa'}
              </button>
              <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                {farmForm.polygon_boundary_geojson
                  ? 'Batas poligon kustom siap ikut disimpan bersama plot kebun.'
                  : 'Anda juga dapat menyimpan titik lokasi terlebih dahulu dan menggambar poligon kapan saja.'}
              </span>
            </div>
          </form>
        </details>
      )}

      {/* Tabel Daftar Plot Kebun & Status Verifikasi Desa */}
      <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              {isOfficerOrAdmin
                ? `Daftar Plot Kebun & Verifikasi Kantor Desa (${farms.length} Plot)`
                : `Daftar Sebaran Plot Kebun Rempah (${farms.length} Plot)`}
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
              {isOfficerOrAdmin
                ? 'Klik "Lihat di Peta" untuk meninjau batas lahan secara visual sebelum menyahkan pendaftaran dari kelompok tani.'
                : 'Informasi luasan, komoditas, batas poligon, dan status persetujuan lahan oleh Kantor Desa.'}
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '0.35rem',
              background: '#ffffff',
              padding: '0.3rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #e2e8f0',
              flexWrap: 'wrap',
            }}
          >
            {['', 'pending', 'verified'].map((st) => {
              const label = st === '' ? 'Semua' : st === 'pending' ? 'Menunggu Persetujuan' : 'Disetujui'
              const count = st === '' ? farms.length : farms.filter((f) => f.verification_status === st).length
              const active = farmStatusFilter === st
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setFarmStatusFilter(st)}
                  style={{
                    padding: '0.4rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    border: active ? '1px solid #0f2c59' : '1px solid transparent',
                    background: active ? '#0f2c59' : 'transparent',
                    color: active ? '#f4b75e' : '#475569',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {label} ({count})
                </button>
              )
            })}
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Kode &amp; Nama Kebun</th>
                <th>Komoditas</th>
                <th>Luas (m²)</th>
                <th>Lokasi &amp; Geometri</th>
                <th>Status Verifikasi</th>
                <th style={{ textAlign: 'center' }}>Aksi Peta &amp; Desa</th>
              </tr>
            </thead>
            <tbody>
              {farms
                .filter((f) => !farmStatusFilter || f.verification_status === farmStatusFilter)
                .map((f) => (
                  <tr key={f.id}>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--text-main)', display: 'block' }}>{f.name}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                        {f.farm_code}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          f.primary_commodity.toLowerCase().includes('pala') ? 'badge-blue' : 'badge-emerald'
                        }`}
                      >
                        {f.primary_commodity}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                      {f.area_sqm.toLocaleString('id-ID')} m²
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <div>{f.location_description || '-'}</div>
                      <small style={{ color: 'var(--text-muted)' }}>
                        {f.latitude.toFixed(4)}, {f.longitude.toFixed(4)}
                      </small>
                      <div style={{ marginTop: '0.2rem' }}>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            padding: '0.12rem 0.4rem',
                            borderRadius: '4px',
                            background: f.polygon_boundary_geojson ? '#ecfdf5' : '#f1f5f9',
                            color: f.polygon_boundary_geojson ? '#047857' : '#475569',
                          }}
                        >
                          {f.polygon_boundary_geojson ? '📐 Batas Poligon' : '📍 Titik Saja'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          f.verification_status === 'verified'
                            ? 'badge-emerald'
                            : f.verification_status === 'pending'
                            ? 'badge-amber'
                            : 'badge-rose'
                        }`}
                      >
                        {f.verification_status === 'verified'
                          ? '✓ TERVERIFIKASI'
                          : f.verification_status === 'pending'
                          ? '⏳ MENUNGGU PERSETUJUAN'
                          : '✕ DITOLAK'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleFocusFarmOnMap(f.id)}
                          className="btn btn-xs btn-secondary"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                          title="Tampilkan lokasi plot kebun ini di peta"
                        >
                          <MapPin size={12} /> Lihat di Peta
                        </button>
                        {isOfficerOrAdmin && f.verification_status === 'pending' && (
                          <>
                            <button
                              type="button"
                              disabled={verifyingFarmId === f.id}
                              onClick={() => handleVerifyFarm(f.id, 'verified')}
                              className="btn btn-xs btn-success"
                            >
                              {verifyingFarmId === f.id ? '...' : '✓ Setujui'}
                            </button>
                            <button
                              type="button"
                              disabled={verifyingFarmId === f.id}
                              onClick={() => handleVerifyFarm(f.id, 'rejected')}
                              className="btn btn-xs btn-danger"
                            >
                              {verifyingFarmId === f.id ? '...' : '✕ Tolak'}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              {farms.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Belum ada plot kebun terdaftar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
