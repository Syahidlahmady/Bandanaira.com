import React, { useEffect, useRef, useState, useMemo } from 'react'
import {
  MapPin,
  Sprout,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  FileSpreadsheet,
  PlusCircle,
  Users,
  Layers,
  Sparkles,
  X,
  Navigation,
  Compass,
  Search,
  CheckCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts'
import { User } from '../services/auth'
import { gisService } from '../services/gis'
import {
  CandidateResident,
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

const isPointInPolygon = (point: [number, number], ring: [number, number][]): boolean => {
  const [x, y] = point
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0]
    const yi = ring[i][1]
    const xj = ring[j][0]
    const yj = ring[j][1]
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }
  return inside
}

const isPointInsideGeoJSONGeometry = (pt: [number, number], geom: any): boolean => {
  if (!geom || !geom.coordinates) return true
  if (geom.type === 'Polygon') {
    return isPointInPolygon(pt, geom.coordinates[0])
  }
  if (geom.type === 'MultiPolygon') {
    return geom.coordinates.some((poly: any) => isPointInPolygon(pt, poly[0]))
  }
  return true
}

const checkFarmExceedsVillageBoundary = (
  farm: Farm,
  villageGeom: any
): { exceeds: boolean; reason?: string } => {
  if (!villageGeom) return { exceeds: false }
  const pt: [number, number] = [farm.longitude, farm.latitude]
  if (!isPointInsideGeoJSONGeometry(pt, villageGeom)) {
    return { exceeds: true, reason: 'Titik koordinat berada di luar batas wilayah resmi desa.' }
  }
  if (farm.polygon_boundary_geojson && (farm.polygon_boundary_geojson as any).coordinates) {
    const coords = (farm.polygon_boundary_geojson as any).coordinates[0]
    if (Array.isArray(coords)) {
      const outsidePts = coords.filter((c: [number, number]) => !isPointInsideGeoJSONGeometry(c, villageGeom))
      if (outsidePts.length > 0) {
        return {
          exceeds: true,
          reason: `Sebagian titik sudut batas poligon (${outsidePts.length} titik) memotong / keluar batas resmi desa.`,
        }
      }
    }
  }
  return { exceeds: false }
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
  const [showFormDrawer, setShowFormDrawer] = useState(!isFarmerOnly)
  const [savingFarmer, setSavingFarmer] = useState(false)
  const [villagesList, setVillagesList] = useState<any[]>([])
  const [villageBoundaryGeoJSON, setVillageBoundaryGeoJSON] = useState<Record<string, unknown> | null>(null)
  const [searchTableQuery, setSearchTableQuery] = useState('')
  const [showManualCoords, setShowManualCoords] = useState(false)

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
    resident_id: '',
  })
  const [candidateResidents, setCandidateResidents] = useState<CandidateResident[]>([])
  const [loadingCandidates, setLoadingCandidates] = useState(false)
  const [selectedResidentId, setSelectedResidentId] = useState<string>('')

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

  // Muat kandidat warga desa terverifikasi saat kotak pendaftaran petani dibuka
  useEffect(() => {
    if (!showNewFarmerBox) return
    let active = true
    setLoadingCandidates(true)
    farmerService
      .getCandidateResidents({
        farmer_group_id: newFarmerForm.farmer_group_id || accessibleFarmerGroups[0]?.id || undefined,
        village: activeVillage || undefined,
      })
      .then((data) => {
        if (active) {
          setCandidateResidents(data)
        }
      })
      .catch((err) => {
        console.error('Error fetching candidate residents:', err)
      })
      .finally(() => {
        if (active) setLoadingCandidates(false)
      })
    return () => {
      active = false
    }
  }, [showNewFarmerBox, activeVillage, newFarmerForm.farmer_group_id, accessibleFarmerGroups])

  const handleSelectResident = (resId: string) => {
    setSelectedResidentId(resId)
    const res = candidateResidents.find((c) => c.id === resId)
    if (res) {
      setNewFarmerForm((prev) => ({
        ...prev,
        resident_id: res.id,
        name: res.full_name,
        phone: res.phone_number || prev.phone,
      }))
    } else {
      setSelectedResidentId('')
      setNewFarmerForm((prev) => ({
        ...prev,
        resident_id: '',
      }))
    }
  }

  const handleCreateFarmerMember = async () => {
    if (!selectedResidentId && isFarmerGroupAdmin) {
      setNewFarmerMsg({
        type: 'error',
        text: 'Wajib memilih warga terdaftar (NIK) di desa Anda untuk ditambahkan ke kelompok tani.',
      })
      return
    }
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
        resident_id: selectedResidentId || undefined,
        village: activeVillage,
      })
      setFarmForm((prev: any) => ({ ...prev, farmer_id: created.id, village: activeVillage || prev.village }))
      setNewFarmerForm({ name: '', phone: '', farmer_group_id: '', resident_id: '' })
      setSelectedResidentId('')
      setShowNewFarmerBox(false)
      setNewFarmerMsg({
        type: 'success',
        text: `✓ Petani ${created.name} (${created.farmer_code}) berhasil didaftarkan ke Kelompok Tani dan dipilih otomatis.`,
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
  }, [farmForm.name, setFarmForm])

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

  const onSubmitWithPolygon = (e: React.FormEvent) => {
    e.preventDefault()
    if (draftVertices.length >= 3 && !farmForm.polygon_boundary_geojson) {
      const polyGeo = verticesToPolygonGeoJSON(draftVertices)
      farmForm.polygon_boundary_geojson = polyGeo
    }
    handleCreateQuickFarmerAndFarm(e)
  }

  // KPI Calculations
  const totalAreaSqm = farmStats?.total_area_sqm ?? farms.reduce((acc, f) => acc + (f.area_sqm || 0), 0)
  const totalAreaHa = (totalAreaSqm / 10000).toFixed(2)
  const totalFarmsCount = farmStats?.total_farms ?? farms.length
  const verifiedFarmsCount = farms.filter((f) => f.verification_status === 'verified').length
  const pendingFarmsCount = farms.filter((f) => f.verification_status === 'pending').length
  const verifiedRate = totalFarmsCount > 0 ? ((verifiedFarmsCount / totalFarmsCount) * 100).toFixed(1) : '0'

  // Chart 1: Distribusi Luas per Komoditas (Recharts BarChart)
  const commodityAreaData = useMemo(() => {
    const map: Record<string, number> = {}
    farms.forEach((f) => {
      const comm = f.primary_commodity || 'Pala'
      map[comm] = (map[comm] || 0) + (f.area_sqm || 0)
    })
    if (Object.keys(map).length === 0) {
      return [
        { name: 'Pala Banda', area: 185000, ha: 18.5, fill: '#059669' },
        { name: 'Cengkih', area: 65000, ha: 6.5, fill: '#D97706' },
        { name: 'Kayu Manis', area: 25000, ha: 2.5, fill: '#2563EB' },
      ]
    }
    return Object.entries(map).map(([name, area], idx) => ({
      name,
      area,
      ha: parseFloat((area / 10000).toFixed(2)),
      fill: idx % 3 === 0 ? '#059669' : idx % 3 === 1 ? '#D97706' : '#2563EB',
    }))
  }, [farms])

  // Chart 2: Komposisi Status Verifikasi Lahan (Recharts Donut)
  const verificationDonutData = useMemo(() => {
    const verified = verifiedFarmsCount
    const pending = pendingFarmsCount
    const rejected = farms.filter((f) => f.verification_status === 'rejected').length
    const total = totalFarmsCount || 1

    return [
      { name: 'Disahkan & Terverifikasi', value: verified, color: '#10B981', percent: `${Math.round((verified / total) * 100)}%` },
      { name: 'Menunggu Persetujuan', value: pending, color: '#F59E0B', percent: `${Math.round((pending / total) * 100)}%` },
      { name: 'Ditolak / Revisi', value: rejected, color: '#EF4444', percent: `${Math.round((rejected / total) * 100)}%` },
    ]
  }, [farms, verifiedFarmsCount, pendingFarmsCount, totalFarmsCount])

  // Filtered Farms in Table
  const filteredFarms = useMemo(() => {
    return farms.filter((f) => {
      if (farmStatusFilter && f.verification_status !== farmStatusFilter) return false
      if (searchTableQuery.trim()) {
        const q = searchTableQuery.toLowerCase()
        const matchCode = f.farm_code.toLowerCase().includes(q)
        const matchName = f.name.toLowerCase().includes(q)
        const matchComm = f.primary_commodity.toLowerCase().includes(q)
        const matchLoc = (f.location_description || '').toLowerCase().includes(q)
        return matchCode || matchName || matchComm || matchLoc
      }
      return true
    })
  }, [farms, farmStatusFilter, searchTableQuery])

  return (
    <div className="space-y-6 pb-12 animate-fade-in font-sans">
      {/* =========================================================================
          1. HEADER BANNER: SPATIAL CADASTRE & GEOGRAPHICAL TENURE
      ========================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-radial from-emerald-100/40 via-sky-50/20 to-transparent rounded-full pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#081D35] text-[#F4B75E] flex items-center justify-center shrink-0 shadow-md border border-[#F4B75E]/30">
              <MapPin size={28} className="stroke-[2.2]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/70">
                  GIS Spasial &amp; Kadaster Lahan Adat
                </span>
                <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  PostGIS Geodesik Terintegrasi Desa
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#081D35] tracking-tight">
                {isFarmerOnly
                  ? 'Peta Sebaran Lahan Perkebunan Rempah'
                  : isFarmerGroupAdmin && !isOfficerOrAdmin
                  ? 'Peta & Pengajuan Plot Kebun Kelompok Tani'
                  : 'Pemetaan Spasial & Verifikasi Lahan Rempah'}
              </h1>
              <p className="text-sm text-slate-600 max-w-2xl mt-1 leading-relaxed">
                {isFarmerOnly
                  ? 'Visualisasi titik koordinat kebun pala & cengkih Banda Neira. Mode tinjau data petani terdaftar.'
                  : isFarmerGroupAdmin && !isOfficerOrAdmin
                  ? 'Petakan batas kebun langsung pada citra satelit resolusi tinggi untuk diajukan ke meja verifikasi Kantor Desa.'
                  : 'Validasi batas poligon kebun pala & cengkih, pencegahan tumpang tindih lahan antar-petani, dan pengesahan batas administratif desa.'}
              </p>

              {activeVillage && (
                <div className="inline-flex items-center gap-2 mt-3 px-3 py-1 bg-amber-50 border border-amber-200/80 rounded-lg text-xs font-semibold text-amber-900">
                  <ShieldCheck size={14} className="text-amber-700" />
                  <span>Yurisdiksi Wilayah: Desa {activeVillage}</span>
                  <span className="text-slate-400 font-normal">|</span>
                  <span className="text-slate-600 font-medium">Batas Administratif Poligon Aktif</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Header Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {canMapFarms && (
              <button
                type="button"
                onClick={() => setShowFormDrawer((prev) => !prev)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#081D35] hover:bg-[#0F2C59] text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm transition-all hover:shadow hover:-translate-y-0.5"
              >
                <PlusCircle size={16} className="text-[#F4B75E]" />
                <span>{showFormDrawer ? 'Tutup Form Pemetaan' : 'Petakan Kebun Baru'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleExportFarmsCSV}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200/90 shadow-2xs transition-colors"
              title="Unduh seluruh data plot kebun ke file CSV"
            >
              <FileSpreadsheet size={16} className="text-emerald-600" />
              <span>Ekspor CSV</span>
              <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {farms.length}
              </span>
            </button>

            <button
              type="button"
              onClick={fetchFarmingData}
              className="inline-flex items-center justify-center w-10 h-10 bg-white hover:bg-slate-50 text-slate-600 rounded-xl border border-slate-200/90 shadow-2xs transition-colors"
              title="Segarkan data spasial & batas kebun"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Alert Banner Pending Approval for Officers */}
      {isOfficerOrAdmin && pendingFarmsCount > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 shadow-xs flex items-center justify-between flex-wrap gap-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 font-bold">
              <Compass size={18} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                Menunggu Verifikasi Persetujuan Kantor Desa
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                Terdapat <strong>{pendingFarmsCount} plot kebun</strong> yang diajukan oleh kelompok tani dan memerlukan pemeriksaan batas di bawah.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setFarmStatusFilter('pending')}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            Saring Antrean ({pendingFarmsCount})
          </button>
        </div>
      )}

      {/* Farm Msg Banner */}
      {farmMsg && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between gap-3 text-sm font-medium border shadow-xs animate-fade-in ${
            farmMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-3">
            {farmMsg.type === 'success' ? (
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle size={18} className="text-rose-600 shrink-0" />
            )}
            <span>{farmMsg.text}</span>
          </div>
        </div>
      )}

      {/* =========================================================================
          2. EXECUTIVE KPI CARDS CLUSTER (5 BENTO METRIC CARDS)
      ========================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1: Total Luas Lahan */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Luas Lahan</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Layers size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-[#081D35]">{totalAreaHa}</span>
            <span className="text-xs font-semibold text-slate-500">Ha ({totalAreaSqm.toLocaleString('id-ID')} m²)</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-blue-700">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>Kalkulasi Geodesik PostGIS</span>
          </div>
        </div>

        {/* KPI 2: Plot Kebun Terdata */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Plot Terdaftar</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MapPin size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">{totalFarmsCount}</span>
            <span className="text-xs font-semibold text-slate-500">Lahan Plot</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
            <span className="text-emerald-700 font-bold">{verifiedRate}%</span>
            <span>telah disahkan desa ({verifiedFarmsCount})</span>
          </div>
        </div>

        {/* KPI 3: Petani Rempah */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Petani Penggarap</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#D97706] flex items-center justify-center">
              <Users size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#081D35]">{accessibleFarmers.length}</span>
            <span className="text-xs font-semibold text-slate-500">Jiwa</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>Terhubung NIK Dukcapil</span>
          </div>
        </div>

        {/* KPI 4: Kelompok Tani (Poktan) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kelompok Tani</span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Sprout size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-teal-800">{accessibleFarmerGroups.length}</span>
            <span className="text-xs font-semibold text-slate-500">Poktan</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-teal-700 truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
            <span>Kolektif Rempah Desa</span>
          </div>
        </div>

        {/* KPI 5: Antrean Verifikasi Lahan */}
        <div
          onClick={() => setFarmStatusFilter(farmStatusFilter === 'pending' ? '' : 'pending')}
          className={`bg-white rounded-2xl p-5 border shadow-xs transition-all cursor-pointer ${
            farmStatusFilter === 'pending'
              ? 'border-amber-400 ring-2 ring-amber-100 bg-amber-50/20'
              : 'border-slate-200/80 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Antrean Verifikasi</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Compass size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600">{pendingFarmsCount}</span>
            <span className="text-xs font-semibold text-slate-500">Pengajuan</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-amber-800">
            <span>Perlu Tinjauan Desa</span>
            <span className="underline text-[10px]">Klik filter</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. DUAL ANALYTICAL CHARTS CLUSTER (RECHARTS BAR & DONUT)
      ========================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Kolom Kiri (7 Kolom): Bar Chart Luas per Komoditas */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h3 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Distribusi Luas Lahan per Komoditas (Ha)
                </h3>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Pala &amp; Cengkih
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Total luas hamparan kebun berdasarkan jenis komoditas rempah di wilayah kepulauan.
            </p>
          </div>

          <div className="w-full h-56 sm:h-64 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={commodityAreaData} margin={{ top: 10, right: 15, left: -15, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#64748B', fontWeight: 600 }}
                />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  cursor={{ fill: '#F8FAFC' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-[#081D35] text-white p-2.5 rounded-xl text-xs shadow-lg border border-slate-700">
                          <p className="font-bold text-[#F4B75E]">{data.name}</p>
                          <p className="mt-1 font-semibold">{data.ha} Hektar ({data.area.toLocaleString('id-ID')} m²)</p>
                          <p className="text-[10px] text-slate-300 mt-0.5">Data Poligon PostGIS Terdaftar</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar dataKey="ha" radius={[6, 6, 0, 0]} maxBarSize={48}>
                  {commodityAreaData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[11px] text-slate-400 text-center pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5">
            <Sparkles size={13} className="text-amber-500" />
            <span>Kalkulasi luas lahan otomatis diperbarui dari koordinat poligon PostGIS berpresisi tinggi</span>
          </div>
        </div>

        {/* Kolom Kanan (5 Kolom): Donut Chart Status Verifikasi Lahan */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <h3 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider">
                Status Verifikasi &amp; Legalitas Plot
              </h3>
            </div>
            <p className="text-xs text-slate-500">Tingkat pengesahan batas lahan oleh Pemerintah Desa.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-3">
            <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#081D35',
                      color: '#FFFFFF',
                      borderRadius: '10px',
                      border: 'none',
                      fontSize: '11px',
                    }}
                  />
                  <Pie
                    data={verificationDonutData}
                    innerRadius={50}
                    outerRadius={72}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {verificationDonutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Sah</span>
                <span className="text-lg font-black text-[#081D35] leading-none mt-0.5">{verifiedRate}%</span>
              </div>
            </div>

            {/* Legend List */}
            <div className="flex flex-col gap-2 flex-1 min-w-0 w-full sm:w-auto">
              {verificationDonutData.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    const st = idx === 0 ? 'verified' : idx === 1 ? 'pending' : 'rejected'
                    setFarmStatusFilter(farmStatusFilter === st ? '' : st)
                  }}
                  className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                    farmStatusFilter === (idx === 0 ? 'verified' : idx === 1 ? 'pending' : 'rejected')
                      ? 'bg-slate-100 border-slate-300 font-bold'
                      : 'border-slate-100 hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-700 font-medium truncate">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-extrabold text-[#081D35]">{item.value}</span>
                    <span className="text-[10px] text-slate-400 font-medium w-8 text-right">{item.percent}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/60 flex items-center gap-2 text-xs text-emerald-900">
            <ShieldCheck size={16} className="text-emerald-700 shrink-0" />
            <span>Lahan terverifikasi dilindungi oleh arsip data spasial desa anti-sengketa adat.</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          4. PETA SATELIT INTERAKTIF PEMETAAN LAHAN
      ========================================================================== */}
      <div ref={mapSectionRef} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider">
              Kanvas Peta Satelit Interaktif (Leaflet &bull; PostGIS Geometri)
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Gunakan tombol zoom atau shift-drag untuk menjelajahi kebun rempah
          </span>
        </div>

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
        <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Sprout size={16} />
          </div>
          <div className="space-y-1">
            <p className="font-bold text-sm">Mode Tinjau Mandiri Petani:</p>
            <p className="text-slate-600 leading-relaxed">
              Anda sedang membuka tampilan tinjau peta lahan. Pendaftaran plot kebun baru diajukan secara terpadu oleh{' '}
              <strong>Pengurus Kelompok Tani (Poktan)</strong> dan disahkan secara resmi oleh{' '}
              <strong>Petugas Kantor Desa</strong>.
            </p>
          </div>
        </div>
      )}

      {/* =========================================================================
          5. FORMULIR PEMETAAN LAHAN 3 LANGKAH (COLLAPSIBLE DRAWER)
      ========================================================================== */}
      {canMapFarms && showFormDrawer && (
        <div className="bg-white rounded-2xl border-2 border-emerald-400 shadow-md p-6 animate-fade-in relative">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <PlusCircle size={20} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#081D35]">
                  {isOfficerOrAdmin
                    ? 'Pemetaan & Pendaftaran Plot Kebun Baru (Kantor Desa)'
                    : 'Pengajuan Plot Kebun Baru (Kelompok Tani)'}
                </h3>
                <p className="text-xs text-slate-500">
                  Ikuti 3 langkah di bawah untuk menentukan poligon kebun, identitas pemilik, dan komoditas rempah.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowFormDrawer(false)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X size={18} />
            </button>
          </div>

          {/* Langkah 1: Ringkasan Titik & Poligon dari Peta */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 mb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block mb-0.5">
                Langkah 1 &bull; Lokasi &amp; Batas Lahan dari Peta Satelit
              </span>
              <div className="text-xs font-bold text-[#081D35]">
                {draftVertices.length >= 3 ? (
                  <span className="text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    <span>
                      Poligon {draftVertices.length} sudut terpetakan &bull; Luas {farmForm.area_sqm.toLocaleString('id-ID')} m² ({(farmForm.area_sqm / 10000).toFixed(2)} Ha)
                    </span>
                  </span>
                ) : (
                  <span className="text-slate-600">
                    📍 Koordinat aktif: {farmForm.latitude.toFixed(5)}, {farmForm.longitude.toFixed(5)} (klik peta satelit di atas untuk menggambar batas)
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleUseDeviceGps}
                disabled={gettingGps}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors"
              >
                <Navigation size={13} className={gettingGps ? 'animate-spin text-blue-600' : 'text-slate-500'} />
                <span>{gettingGps ? 'Mencari GPS...' : 'GPS Perangkat'}</span>
              </button>
              <button
                type="button"
                onClick={handleValidateBoundary}
                disabled={checkingBoundary}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                <Compass size={13} className={checkingBoundary ? 'animate-spin' : ''} />
                <span>{checkingBoundary ? 'Memeriksa...' : 'Uji PostGIS Tumpang Tindih'}</span>
              </button>
            </div>
          </div>

          {boundaryCheckMsg && (
            <div
              className={`p-3.5 rounded-xl mb-4 text-xs font-semibold flex items-center gap-2 border animate-fade-in ${
                boundaryCheckMsg.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : boundaryCheckMsg.type === 'warning'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              {boundaryCheckMsg.type === 'success' ? (
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle size={16} className="shrink-0 text-amber-600" />
              )}
              <span>{boundaryCheckMsg.text}</span>
            </div>
          )}

          {/* Form Langkah 2 & 3 */}
          <form onSubmit={onSubmitWithPolygon} className="space-y-4">
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
              Langkah 2 &bull; Identitas Kebun &amp; Pemilik Lahan
            </span>

            {newFarmerMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
                  newFarmerMsg.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                <span>{newFarmerMsg.text}</span>
              </div>
            )}

            {/* Kotak Pendaftaran Petani Cepat */}
            {showNewFarmerBox && (
              <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-200 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-[#081D35]">
                      👨‍🌾 Tambah Petani Anggota Poktan dari Warga Terdaftar Desa
                    </span>
                    {activeVillage && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-200">
                        Desa {activeVillage}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewFarmerBox(false)
                      setSelectedResidentId('')
                    }}
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X size={15} />
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-sky-900 mb-1">
                    Pilih NIK &amp; Warga Terverifikasi Dukcapil *
                  </label>
                  <select
                    value={selectedResidentId}
                    onChange={(e) => handleSelectResident(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-sky-300 rounded-xl text-xs font-semibold text-slate-800 outline-none"
                  >
                    <option value="">
                      {loadingCandidates
                        ? 'Memuat data warga desa...'
                        : candidateResidents.length === 0
                        ? `-- Belum ada warga terverifikasi di Desa ${activeVillage || ''} --`
                        : `-- Pilih NIK & Nama Warga (${candidateResidents.length} warga tersedia) --`}
                    </option>
                    {candidateResidents.map((c) => (
                      <option key={c.id} value={c.id} disabled={c.already_member}>
                        NIK: {c.nik} | {c.full_name} ({c.occupation || 'Warga'}{c.already_member ? ' - Sudah Anggota Poktan' : ''})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nama Petani</label>
                    <input
                      type="text"
                      value={newFarmerForm.name}
                      readOnly={Boolean(selectedResidentId)}
                      onChange={(e) => setNewFarmerForm({ ...newFarmerForm, name: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 outline-none"
                      placeholder="Terisi otomatis dari NIK"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp / HP</label>
                    <input
                      type="text"
                      value={newFarmerForm.phone}
                      onChange={(e) => setNewFarmerForm({ ...newFarmerForm, phone: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 outline-none"
                      placeholder="081234567890"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      disabled={savingFarmer || (isFarmerGroupAdmin && !selectedResidentId)}
                      onClick={handleCreateFarmerMember}
                      className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
                    >
                      {savingFarmer ? 'Menyimpan...' : 'Simpan ke Poktan'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Baris Input Kebun */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Petani Pemilik */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">Petani Pemilik Lahan</label>
                  <button
                    type="button"
                    onClick={() => setShowNewFarmerBox((prev) => !prev)}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <span>+ Daftarkan Petani</span>
                  </button>
                </div>
                <select
                  value={farmForm.farmer_id}
                  onChange={(e) => setFarmForm({ ...farmForm, farmer_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:border-emerald-500 outline-none"
                >
                  <option value="">-- Pilih Petani Anggota Poktan --</option>
                  {accessibleFarmers.map((frm) => (
                    <option key={frm.id} value={frm.id}>
                      {frm.name} ({frm.farmer_code}){frm.village ? ` [Desa ${frm.village}]` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Kode Plot */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Kode Plot Kebun</label>
                <input
                  type="text"
                  value={farmForm.farm_code}
                  onChange={(e) => setFarmForm({ ...farmForm, farm_code: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono text-slate-800 focus:bg-white focus:border-emerald-500 outline-none"
                  placeholder="Contoh: PL-LTR-01"
                />
              </div>

              {/* Nama Kebun */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Nama Hamparan Kebun</label>
                <input
                  type="text"
                  placeholder="Mis. Kebun Pala Lonthoir Timur"
                  value={farmForm.name}
                  onChange={(e) => setFarmForm({ ...farmForm, name: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:border-emerald-500 outline-none"
                />
              </div>

              {/* Komoditas */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Komoditas Utama</label>
                <select
                  value={farmForm.primary_commodity}
                  onChange={(e) => setFarmForm({ ...farmForm, primary_commodity: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:border-emerald-500 outline-none"
                >
                  <option value="Pala">Pala Banda (Myristica fragrans)</option>
                  <option value="Cengkih">Cengkih Banda Asli</option>
                  <option value="Kayu Manis">Kayu Manis</option>
                </select>
              </div>

              {/* Luas m2 */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Luas Lahan (m²)</label>
                <input
                  type="number"
                  value={farmForm.area_sqm}
                  onChange={(e) => setFarmForm({ ...farmForm, area_sqm: Number(e.target.value) })}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:border-emerald-500 outline-none"
                  placeholder="5000"
                />
              </div>

              {/* Dusun / Lokasi */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Dusun / Keterangan Lokasi</label>
                <input
                  type="text"
                  placeholder="Mis. Dusun Batu Laki, Desa Lonthoir"
                  value={farmForm.location_description}
                  onChange={(e) => setFarmForm({ ...farmForm, location_description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            {/* Input Koordinat Manual (Collapsible) */}
            <div>
              <button
                type="button"
                onClick={() => setShowManualCoords((prev) => !prev)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5"
              >
                {showManualCoords ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                <span>Input Koordinat Geodesik Manual (Opsional)</span>
              </button>

              {showManualCoords && (
                <div className="grid grid-cols-2 gap-3 mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={farmForm.latitude}
                      onChange={(e) => setFarmForm({ ...farmForm, latitude: parseFloat(e.target.value) || 0 })}
                      required
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={farmForm.longitude}
                      onChange={(e) => setFarmForm({ ...farmForm, longitude: parseFloat(e.target.value) || 0 })}
                      required
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Form Bottom Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <span className="text-[11px] text-slate-500">
                {farmForm.polygon_boundary_geojson
                  ? '✓ Poligon batas kustom siap disimpan dan ditautkan ke database spasial PostGIS.'
                  : 'Batas poligon dapat disempurnakan kapan saja melalui kanvas peta di atas.'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowFormDrawer(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  <CheckCheck size={16} />
                  <span>{isOfficerOrAdmin ? 'Simpan & Sahkan di Peta' : 'Kirim Pengajuan ke Desa'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================================
          6. TABEL DAFTAR PLOT KEBUN & STATUS VERIFIKASI DESA
      ========================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-[#081D35]">
                {isOfficerOrAdmin
                  ? `Daftar Plot Kebun & Verifikasi Kantor Desa (${farms.length} Plot)`
                  : `Daftar Sebaran Plot Kebun Rempah (${farms.length} Plot)`}
              </h3>
              <span className="text-xs text-slate-500 font-medium">({filteredFarms.length} ditampilkan)</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Klik "Lihat di Peta" untuk mengarahkan kamera kanvas satelit langsung ke batas lahan terkait.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari kode/nama kebun..."
                value={searchTableQuery}
                onChange={(e) => setSearchTableQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white focus:border-emerald-500 outline-none w-40 sm:w-48"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {[
                { key: '', label: 'Semua' },
                { key: 'pending', label: 'Menunggu' },
                { key: 'verified', label: 'Disetujui' },
              ].map((item) => {
                const count =
                  item.key === ''
                    ? farms.length
                    : farms.filter((f) => f.verification_status === item.key).length
                const active = farmStatusFilter === item.key
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setFarmStatusFilter(item.key)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      active ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {item.label} ({count})
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {filteredFarms.length === 0 ? (
          <div className="py-12 px-4 text-center text-slate-500">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <MapPin size={22} />
            </div>
            <p className="font-bold text-slate-800 text-sm">Tidak ada plot kebun yang cocok</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Periksa kata kunci pencarian atau bersihkan saringan status verifikasi yang aktif.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Kode &amp; Nama Kebun</th>
                  <th className="py-3.5 px-4">Komoditas</th>
                  <th className="py-3.5 px-4">Luas Lahan</th>
                  <th className="py-3.5 px-4">Lokasi &amp; Geometri Poligon</th>
                  <th className="py-3.5 px-4">Status Pengesahan</th>
                  <th className="py-3.5 px-4 text-center">Aksi Peta &amp; Verifikasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredFarms.map((f) => {
                  const boundaryCheck = checkFarmExceedsVillageBoundary(f, villageBoundaryGeoJSON)
                  const isVerified = f.verification_status === 'verified'
                  const isPending = f.verification_status === 'pending'

                  return (
                    <tr key={f.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Nama & Kode */}
                      <td className="py-3.5 px-4">
                        <span className="font-extrabold text-[#081D35] block text-sm">{f.name}</span>
                        <span className="font-mono text-xs font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 inline-block mt-0.5">
                          {f.farm_code}
                        </span>
                      </td>

                      {/* Komoditas */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            f.primary_commodity.toLowerCase().includes('pala')
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {f.primary_commodity}
                        </span>
                      </td>

                      {/* Luas */}
                      <td className="py-3.5 px-4">
                        <span className="font-extrabold text-[#081D35] text-sm">
                          {f.area_sqm.toLocaleString('id-ID')}
                        </span>
                        <span className="text-slate-500 ml-1">m²</span>
                        <span className="block text-[11px] text-slate-400">
                          ({(f.area_sqm / 10000).toFixed(2)} Ha)
                        </span>
                      </td>

                      {/* Lokasi & Geometri */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{f.location_description || '-'}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {f.latitude.toFixed(4)}, {f.longitude.toFixed(4)}
                        </div>
                        <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              f.polygon_boundary_geojson
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {f.polygon_boundary_geojson ? '📐 Batas Poligon' : '📍 Titik Koordinat'}
                          </span>
                          {boundaryCheck.exceeds && (
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200"
                              title={boundaryCheck.reason}
                            >
                              ⛔ Melewati Batas Desa
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status Verifikasi */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            isVerified
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : isPending
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {isVerified ? (
                            <>
                              <CheckCircle2 size={12} className="text-emerald-600" /> Disahkan
                            </>
                          ) : isPending ? (
                            <>
                              <Compass size={12} className="text-amber-600" /> Menunggu Tinjauan
                            </>
                          ) : (
                            <>
                              <X size={12} className="text-rose-600" /> Ditolak
                            </>
                          )}
                        </span>
                      </td>

                      {/* Aksi */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 justify-center flex-wrap">
                          <button
                            type="button"
                            onClick={() => handleFocusFarmOnMap(f.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-2xs transition-colors"
                            title="Tampilkan lokasi plot kebun di kanvas peta satelit"
                          >
                            <MapPin size={12} className="text-blue-600" />
                            <span>Lihat di Peta</span>
                          </button>

                          {isOfficerOrAdmin && isPending && (
                            <>
                              <button
                                type="button"
                                disabled={verifyingFarmId === f.id || boundaryCheck.exceeds}
                                onClick={() => handleVerifyFarm(f.id, 'verified')}
                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50"
                                title={
                                  boundaryCheck.exceeds
                                    ? `Tidak dapat disahkan: ${boundaryCheck.reason}`
                                    : 'Sahkan batas lahan kebun'
                                }
                              >
                                {verifyingFarmId === f.id ? '...' : '✓ Setujui'}
                              </button>
                              <button
                                type="button"
                                disabled={verifyingFarmId === f.id}
                                onClick={() => handleVerifyFarm(f.id, 'rejected')}
                                className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                              >
                                {verifyingFarmId === f.id ? '...' : '✕ Tolak'}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
