import React, { useEffect, useState, useRef } from 'react'
import { authService, User } from './services/auth.ts'
import {
  populationService,
  PopulationStatistics,
  Resident,
  ResidentCreateInput,
  AdministrativeRequestItem,
} from './services/population.ts'
import {
  farmerService,
  FarmGeoJSONFeatureCollection,
  FarmGeoJSONFeature,
  Farmer,
  FarmerGroup,
  Farm,
  FarmStatistics,
} from './services/farmers.ts'
import { generateSquarePolygonVertices } from './components/FarmMap.tsx'
import {
  traceabilityService,
  Harvest,
  ProductBatch,
  PublicBatchVerification,
  BlockchainVerification,
} from './services/traceability.ts'
import { getSampleBatchVerification } from './data/sampleBatchVerifications.ts'
const LoginSection = React.lazy(() => import('./components/LoginSection.tsx').then(m => ({ default: m.LoginSection })))
const BlockchainModal = React.lazy(() => import('./components/modals/BlockchainModal.tsx').then(m => ({ default: m.BlockchainModal })))
const OfflineQueueModal = React.lazy(() => import('./components/modals/OfflineQueueModal.tsx').then(m => ({ default: m.OfflineQueueModal })))
const PublicVerifyModal = React.lazy(() => import('./components/modals/PublicVerifyModal.tsx').then(m => ({ default: m.PublicVerifyModal })))
const VerifiedMarketplaceModal = React.lazy(() => import('./components/modals/VerifiedMarketplaceModal.tsx').then(m => ({ default: m.VerifiedMarketplaceModal })))
const QuickLoginModal = React.lazy(() => import('./components/modals/QuickLoginModal.tsx').then(m => ({ default: m.QuickLoginModal })))
const ResidentsWorkspace = React.lazy(() => import('./views/ResidentsWorkspace.tsx').then(m => ({ default: m.ResidentsWorkspace })))
const LettersWorkspace = React.lazy(() => import('./views/LettersWorkspace.tsx').then(m => ({ default: m.LettersWorkspace })))
const FarmsGisWorkspace = React.lazy(() => import('./views/FarmsGisWorkspace.tsx').then(m => ({ default: m.FarmsGisWorkspace })))
const HarvestGradingWorkspace = React.lazy(() => import('./views/HarvestGradingWorkspace.tsx').then(m => ({ default: m.HarvestGradingWorkspace })))
const CitizenPortalWorkspace = React.lazy(() => import('./views/CitizenPortalWorkspace.tsx').then(m => ({ default: m.CitizenPortalWorkspace })))
const AuditTrailWorkspace = React.lazy(() => import('./views/AuditTrailWorkspace.tsx').then(m => ({ default: m.AuditTrailWorkspace })))
const SmartPlannerWorkspace = React.lazy(() => import('./views/SmartPlannerWorkspace.tsx').then(m => ({ default: m.SmartPlannerWorkspace })))
const KoperasiKasirWorkspace = React.lazy(() => import('./views/KoperasiKasirWorkspace.tsx').then(m => ({ default: m.KoperasiKasirWorkspace })))
const IslandTelemetryWorkspace = React.lazy(() => import('./views/IslandTelemetryWorkspace.tsx').then(m => ({ default: m.IslandTelemetryWorkspace })))
const TourismEcoStayWorkspace = React.lazy(() => import('./views/TourismEcoStayWorkspace.tsx').then(m => ({ default: m.TourismEcoStayWorkspace })))
const InteractiveMapWorkspace = React.lazy(() => import('./views/InteractiveMapWorkspace.tsx').then(m => ({ default: m.InteractiveMapWorkspace })))
const SurveyEtlWorkspace = React.lazy(() => import('./views/SurveyEtlWorkspace.tsx').then(m => ({ default: m.SurveyEtlWorkspace })))
const HistoryArticlesWorkspace = React.lazy(() => import('./views/HistoryArticlesWorkspace.tsx').then(m => ({ default: m.HistoryArticlesWorkspace })))
const MarketplaceAdminWorkspace = React.lazy(() => import('./views/MarketplaceAdminWorkspace.tsx').then(m => ({ default: m.MarketplaceAdminWorkspace })))
const MarketplaceCatalogWorkspace = React.lazy(() => import('./views/MarketplaceCatalogWorkspace.tsx').then(m => ({ default: m.MarketplaceCatalogWorkspace })))
const HelpDeskWorkspace = React.lazy(() => import('./views/HelpDeskWorkspace.tsx').then(m => ({ default: m.HelpDeskWorkspace })))
import { LandingPortalWorkspace } from './views/LandingPortalWorkspace.tsx'
const UserEcosystemDashboard = React.lazy(() => import('./views/dashboard/UserEcosystemDashboard.tsx').then(m => ({ default: m.UserEcosystemDashboard })))
import { DashboardLayout } from './views/dashboard/DashboardLayout.tsx'
import { ArrowLeft, Compass, Sparkles } from 'lucide-react'
import { ErrorBoundary } from './components/common/ErrorBoundary.tsx'
import { AccessRestrictedNotice } from './components/common/AccessRestrictedNotice.tsx'
import { BandaUnifiedFooter } from './components/common/BandaUnifiedFooter.tsx'
import { setPreferredTourismSubTab } from './services/tourism.ts'
import { offlineDB } from './offline/db.ts'
import { syncManager, SyncQueueItem } from './offline/syncManager.ts'

interface HealthResponse {
  status: string
  version: string
  timestamp: string
  services: {
    api: string
    database: string
  }
}

export type TabId =
  | 'landing'
  | 'dashboard'
  | 'population'
  | 'letters'
  | 'farming'
  | 'traceability'
  | 'koperasi'
  | 'iot'
  | 'tourism'
  | 'gis'
  | 'audit'
  | 'smart_planner'
  | 'survei'
  | 'sejarah'
  | 'marketplace'
  | 'help'

export const TAB_ROUTES: Record<TabId, string> = {
  landing: '/',
  dashboard: '/dashboard',
  population: '/population',
  letters: '/letters',
  farming: '/farming',
  traceability: '/traceability',
  koperasi: '/koperasi',
  iot: '/iot',
  tourism: '/tourism',
  gis: '/gis',
  audit: '/audit',
  smart_planner: '/smart_planner',
  survei: '/survei',
  sejarah: '/sejarah',
  marketplace: '/marketplace',
  help: '/help',
}

export const ROUTE_TO_TAB: Record<string, TabId> = {
  '/help': 'help',
  '/bantuan': 'help',
  '/panduan': 'help',
  '/marketplace': 'marketplace',
  '/pasar': 'marketplace',
  '/katalog': 'marketplace',
  '/': 'landing',
  '/landing': 'landing',
  '/beranda': 'landing',
  '/home': 'landing',
  '/register': 'population',
  '/daftar': 'population',
  '/dashboard': 'dashboard',
  '/dasbor': 'dashboard',
  '/population': 'population',
  '/warga': 'population',
  '/penduduk': 'population',
  '/login': 'population',
  '/masuk': 'population',
  '/letters': 'letters',
  '/surat': 'letters',
  '/farming': 'farming',
  '/kebun': 'farming',
  '/lahan': 'farming',
  '/traceability': 'traceability',
  '/panen': 'traceability',
  '/mutu': 'traceability',
  '/koperasi': 'koperasi',
  '/iot': 'iot',
  '/telemetri': 'iot',
  '/tourism': 'tourism',
  '/destinasi': 'tourism',
  '/penginapan': 'tourism',
  '/wisata': 'tourism',
  '/homestay': 'tourism',
  '/gis': 'gis',
  '/peta': 'gis',
  '/map': 'gis',
  '/maps': 'gis',
  '/audit': 'audit',
  '/smart_planner': 'smart_planner',
  '/planner': 'smart_planner',
  '/survei': 'survei',
  '/survey': 'survei',
  '/sejarah': 'sejarah',
  '/artikel': 'sejarah',
  '/history': 'sejarah',
  '/articles': 'sejarah',
}

/** Zona 1: Rute Eksplorasi Publik Wisatawan & Pembeli tanpa wajib login */
export const PUBLIC_EXPLORER_TABS: TabId[] = ['tourism', 'gis', 'smart_planner', 'sejarah', 'marketplace', 'help']

export const getInitialTab = (): TabId => {
  if (typeof window === 'undefined') return 'landing'
  const path = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/'
  if (path.startsWith('/verify')) return 'landing'

  if (path === '/sejarah' || path.startsWith('/sejarah/') || path.startsWith('/artikel') || path.startsWith('/history')) {
    return 'sejarah'
  }

  if (path === '/destinasi' || path.startsWith('/destinasi/')) {
    setPreferredTourismSubTab('destinations')
    return 'tourism'
  }

  if (path === '/penginapan' || path.startsWith('/penginapan/')) {
    setPreferredTourismSubTab('accommodations')
    return 'tourism'
  }

  const hasToken = Boolean(authService.getAccessToken())
  const savedTab = localStorage.getItem('banda_active_tab') as TabId | null

  // 1. If URL specifies a specific workspace route (e.g. /gis, /dashboard, /tourism, /letters, /peta)
  if (path !== '/' && path !== '' && ROUTE_TO_TAB[path]) {
    return ROUTE_TO_TAB[path]
  }

  // 2. If on root '/' and user is authenticated, restore their active workspace if previously saved
  if ((path === '/' || path === '') && hasToken && savedTab && TAB_ROUTES[savedTab] && savedTab !== 'landing') {
    return savedTab
  }

  // 3. Fallback to route table for root or default to landing
  if (ROUTE_TO_TAB[path]) {
    return ROUTE_TO_TAB[path]
  }

  return 'landing'
}

export const getInitialArticleSlug = (): string | null => {
  if (typeof window === 'undefined') return null
  const path = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/'
  const match = path.match(/^\/(?:sejarah|artikel|history)\/([a-z0-9-]+)$/)
  if (match) return match[1]
  const params = new URLSearchParams(window.location.search)
  return params.get('slug') || null
}

const ensureFarmPolygonGeoJSON = (
  polygon?: Record<string, unknown> | null,
  lat?: number,
  lng?: number,
  areaSqm?: number
): Record<string, unknown> => {
  if (polygon && polygon.type === 'Polygon' && Array.isArray((polygon as any).coordinates)) {
    return polygon
  }
  const validLat = typeof lat === 'number' && !isNaN(lat) ? lat : -4.5550
  const validLng = typeof lng === 'number' && !isNaN(lng) ? lng : 129.8940
  const targetArea = typeof areaSqm === 'number' && areaSqm > 0 ? areaSqm : 2500
  const verts = generateSquarePolygonVertices(validLat, validLng, targetArea)
  const ring = verts.map(([vlat, vlng]) => [parseFloat(vlng.toFixed(6)), parseFloat(vlat.toFixed(6))])
  ring.push([ring[0][0], ring[0][1]])
  return {
    type: 'Polygon',
    coordinates: [ring],
  }
}

export const App: React.FC = () => {
  const [activeTab, setActiveTabState] = useState<TabId>(getInitialTab)
  const [selectedArticleSlug, setSelectedArticleSlug] = useState<string | null>(getInitialArticleSlug)
  const lastFetchedUserIdRef = useRef<string | null>(null)

  const handleNavigateToSejarah = (slug?: string) => {
    if (activeTab === 'landing' && typeof window !== 'undefined') {
      const scrollY = window.scrollY || document.documentElement.scrollTop || 0
      if (scrollY > 0) {
        try {
          sessionStorage.setItem('banda_landing_scroll_y', String(scrollY))
        } catch {
          // ignore
        }
      }
    }
    setSelectedArticleSlug(slug || null)
    setActiveTabState('sejarah')
    try {
      localStorage.setItem('banda_active_tab', 'sejarah')
      const targetPath = slug ? `/sejarah?slug=${encodeURIComponent(slug)}` : '/sejarah'
      window.history.pushState({ tab: 'sejarah', slug }, '', targetPath)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      // ignore
    }
  }

  const handleNavigateWithSlug = (tab: TabId, slug?: string) => {
    if (tab === 'sejarah') {
      handleNavigateToSejarah(slug)
      return
    }
    setActiveTab(tab)
    if (tab === 'gis' && slug) {
      const q = slug.startsWith('?') ? slug : `?${slug}`
      try {
        window.history.pushState({ tab: 'gis' }, '', `/gis${q}`)
      } catch {
        // ignore
      }
    }
  }

  const setActiveTab = (tab: TabId, replace: boolean = false) => {
    if (activeTab === 'landing' && tab !== 'landing' && typeof window !== 'undefined') {
      const scrollY = window.scrollY || document.documentElement.scrollTop || 0
      if (scrollY > 0) {
        try {
          sessionStorage.setItem('banda_landing_scroll_y', String(scrollY))
        } catch {
          // ignore
        }
      }
    }
    if (tab !== 'sejarah') {
      setSelectedArticleSlug(null)
    }
    setActiveTabState(tab)
    try {
      localStorage.setItem('banda_active_tab', tab)
      const targetPath = tab === 'sejarah' && selectedArticleSlug
        ? `/sejarah?slug=${encodeURIComponent(selectedArticleSlug)}`
        : TAB_ROUTES[tab] || '/'
      if (typeof window !== 'undefined' && window.location.pathname !== targetPath) {
        if (replace) {
          window.history.replaceState({ tab }, '', targetPath)
        } else {
          window.history.pushState({ tab }, '', targetPath)
        }
      }
      if (tab !== 'landing' && typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'instant' })
      }
    } catch {
      // ignore
    }
  }

  // Synchronize browser history and handle popstate (back/forward)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const currentPath = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/'
    if (!currentPath.startsWith('/verify')) {
      if (activeTab === 'sejarah') {
        const targetPath = selectedArticleSlug
          ? `/sejarah?slug=${encodeURIComponent(selectedArticleSlug)}`
          : '/sejarah'
        if (currentPath !== targetPath && !currentPath.startsWith('/sejarah/')) {
          window.history.replaceState({ tab: 'sejarah', slug: selectedArticleSlug }, '', targetPath)
        }
      } else {
        const targetPath = TAB_ROUTES[activeTab] || '/'
        if (currentPath !== targetPath) {
          window.history.replaceState({ tab: activeTab }, '', targetPath)
        }
      }
    }

    const handlePopState = () => {
      const p = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/'
      if (p.startsWith('/verify')) return
      if (p === '/sejarah' || p.startsWith('/sejarah/') || p.startsWith('/artikel') || p.startsWith('/history')) {
        const match = p.match(/^\/(?:sejarah|artikel|history)\/([a-z0-9-]+)$/)
        const params = new URLSearchParams(window.location.search)
        const slug = match ? match[1] : params.get('slug')
        setSelectedArticleSlug(slug || null)
        setActiveTabState('sejarah')
        localStorage.setItem('banda_active_tab', 'sejarah')
        return
      }
      setSelectedArticleSlug(null)
      const matchedTab = ROUTE_TO_TAB[p] || 'landing'
      setActiveTabState(matchedTab)
      localStorage.setItem('banda_active_tab', matchedTab)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [activeTab, selectedArticleSlug])

  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [loadingHealth, setLoadingHealth] = useState<boolean>(true)
  const [healthError, setHealthError] = useState<string | null>(null)

  // Offline PWA & Sync states
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true)
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0)
  const [isSyncing, setIsSyncing] = useState<boolean>(false)
  const [showQueueModal, setShowQueueModal] = useState<boolean>(false)
  const [queueList, setQueueList] = useState<SyncQueueItem[]>([])

  // Auth states: load cached user immediately to prevent flash or unintended redirect to landing
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const token = authService.getAccessToken()
    if (token) {
      return authService.getCachedProfile()
    }
    return null
  })
  const [username, setUsername] = useState<string>('admin')
  const [password, setPassword] = useState<string>('Admin123!')
  const [authLoading, setAuthLoading] = useState<boolean>(false)
  const [authError, setAuthError] = useState<string | null>(null)

  // Population states
  const [residents, setResidents] = useState<Resident[]>([])
  const [popStats, setPopStats] = useState<PopulationStatistics | null>(null)
  const [loadingPop, setLoadingPop] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedOccupationFilter, setSelectedOccupationFilter] = useState<string>('')
  const [popMsg, setPopMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [credentialReceipt, setCredentialReceipt] = useState<{
    nik: string
    full_name: string
    username: string
    access_pin: string
    village: string
  } | null>(null)
  const [adminRequests, setAdminRequests] = useState<AdministrativeRequestItem[]>([])
  const [requestFilterStatus, setRequestFilterStatus] = useState<string>('')
  const [updatingRequestId, setUpdatingRequestId] = useState<string | null>(null)
  const [letterActionMsg, setLetterActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Farming states
  const [farmers, setFarmers] = useState<Farmer[]>([])
  const [farmerGroups, setFarmerGroups] = useState<FarmerGroup[]>([])
  const [farms, setFarms] = useState<Farm[]>([])
  const [farmGeoJSON, setFarmGeoJSON] = useState<FarmGeoJSONFeatureCollection>({ type: 'FeatureCollection', features: [] })
  const [farmStats, setFarmStats] = useState<FarmStatistics | null>(null)
  const [farmMsg, setFarmMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [verifyingFarmId, setVerifyingFarmId] = useState<string | null>(null)
  const [farmStatusFilter, setFarmStatusFilter] = useState<string>('')

  // Traceability states
  const [harvests, setHarvests] = useState<Harvest[]>([])
  const [batches, setBatches] = useState<ProductBatch[]>([])
  const [selectedBatch, setSelectedBatch] = useState<ProductBatch | null>(null)
  const [publicVerifyData, setPublicVerifyData] = useState<PublicBatchVerification | null>(null)
  const [showPublicVerifyModal, setShowPublicVerifyModal] = useState<boolean>(false)
  const [verifyInitialToken, setVerifyInitialToken] = useState<string>('')
  const [traceMsg, setTraceMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [verificationModal, setVerificationModal] = useState<BlockchainVerification | null>(null)
  const [blockchainLoading, setBlockchainLoading] = useState<string | null>(null)
  const [showMarketplaceModal, setShowMarketplaceModal] = useState<boolean>(false)
  const [showQuickLoginModal, setShowQuickLoginModal] = useState<boolean>(false)

  // Form: Resident
  const [popForm, setPopForm] = useState<ResidentCreateInput>({
    nik: '8171010101900001',
    full_name: 'Ahmad Baadilla',
    gender: 'L',
    birth_place: 'Banda Neira',
    address: 'Jl. Nusantara No. 12',
    rt: '001',
    rw: '002',
    occupation: 'Petani Rempah Pala',
    phone_number: '081234567890',
  })

  // Form: Farm
  const [farmForm, setFarmForm] = useState<{
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
  }>({
    farmer_id: '',
    farm_code: 'BN-FARM-001',
    name: 'Kebun Pala Lonthoir',
    location_description: 'Desa Lonthoir, Banda Besar',
    latitude: -4.5312,
    longitude: 129.8974,
    area_sqm: 6500,
    primary_commodity: 'Pala',
    village: 'Lonthoir',
  })

  // Form: Harvest
  const [harvestForm, setHarvestForm] = useState({
    farm_id: '',
    farmer_id: '',
    harvest_code: 'BN-HRV-2026-001',
    commodity: 'Pala',
    harvest_date: new Date().toISOString().split('T')[0],
    quantity_kg: 150,
    quality_grade: 'Grade A Super',
  })

  // Form: Batch
  const [batchForm, setBatchForm] = useState({
    batch_code: 'BN-BTC-2026-001',
    commodity: 'Pala Banda',
    production_date: new Date().toISOString().split('T')[0],
    harvest_id: '',
    allocated_qty: 150,
  })

  // Form: Batch Event
  const [eventForm, setEventForm] = useState({
    event_type: 'drying',
    location: 'Sentra Pengeringan Lonthoir',
    description: 'Pengeringan alami sinar matahari selama 5 hari',
  })

  // Letters: Citizen Requests
  const [letters, setLetters] = useState<
    Array<{ id: number; type: string; purpose: string; date: string; status: 'menunggu' | 'disetujui' }>
  >([
    {
      id: 1,
      type: 'Surat Keterangan Usaha Petani Rempah (SKU)',
      purpose: 'Pengajuan Modal KUR Pertanian di Bank Mandiri Banda',
      date: '2026-11-04',
      status: 'disetujui',
    },
    {
      id: 2,
      type: 'Surat Keterangan Domisili Tempat Tinggal',
      purpose: 'Persyaratan Berkas Kependudukan',
      date: '2026-11-05',
      status: 'menunggu',
    },
  ])
  const [showLetterForm, setShowLetterForm] = useState(false)
  const [letterTypeInput, setLetterTypeInput] = useState('Surat Keterangan Usaha Petani Rempah (SKU)')
  const [letterPurposeInput, setLetterPurposeInput] = useState('')
  const [letterSuccessNotice, setLetterSuccessNotice] = useState<string | null>(null)

  const handleSubmitLetter = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!letterPurposeInput.trim()) return
    const newReq = {
      id: Date.now(),
      type: letterTypeInput,
      purpose: letterPurposeInput.trim(),
      date: new Date().toISOString().split('T')[0],
      status: 'menunggu' as const,
    }
    setLetters((prev) => [newReq, ...prev])
    const sentPurpose = letterPurposeInput.trim()
    const sentType = letterTypeInput
    setLetterPurposeInput('')
    setShowLetterForm(false)

    try {
      if (navigator.onLine) {
        await populationService.createRequest({
          request_type: sentType,
          notes: sentPurpose,
        })
        setLetterSuccessNotice(`Permohonan ${sentType} berhasil dikirim ke kantor desa!`)
      } else {
        await syncManager.enqueue(
          'resident_request',
          `${apiBase}/population/requests`,
          'POST',
          { request_type: sentType, notes: sentPurpose },
          `Permohonan Surat: ${sentType}`
        )
        setLetterSuccessNotice(`📦 Mode Offline: Permohonan ${sentType} tersimpan di antrean lokal!`)
      }
    } catch {
      await syncManager.enqueue(
        'resident_request',
        `${apiBase}/population/requests`,
        'POST',
        { request_type: sentType, notes: sentPurpose },
        `Permohonan Surat: ${sentType}`
      )
      setLetterSuccessNotice(`📦 Permohonan ${sentType} diamankan ke antrean offline lokal!`)
    }
    setTimeout(() => setLetterSuccessNotice(null), 5000)
  }

  const handleUpdateRequestStatus = async (id: string, status: 'approved' | 'rejected') => {
    setUpdatingRequestId(id)
    setLetterActionMsg(null)
    try {
      await populationService.updateRequestStatus(
        id,
        status,
        status === 'approved' ? 'Disetujui oleh petugas desa Banda Neira' : 'Permohonan ditolak / berkas belum lengkap'
      )
      const notice = `Surat permohonan berhasil di-${status === 'approved' ? 'setujui' : 'tolak'}!`
      setLetterActionMsg({ type: 'success', text: notice })
      setPopMsg({ type: 'success', text: notice })
      setTimeout(() => setLetterActionMsg(null), 5000)
      await fetchPopulationData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memperbarui status permohonan'
      setLetterActionMsg({ type: 'error', text: msg })
      setPopMsg({ type: 'error', text: msg })
    } finally {
      setUpdatingRequestId(null)
    }
  }

  const apiBase = import.meta.env.VITE_API_BASE_URL || '/api/v1'

  const fetchPopulationData = async (queryOverride?: string, occOverride?: string) => {
    setLoadingPop(true)
    const q = typeof queryOverride === 'string' ? queryOverride : searchQuery
    const occ = typeof occOverride === 'string' ? occOverride : selectedOccupationFilter

    // Stale-While-Revalidate: tampilkan data cache seketika jika memori kosong
    if (residents.length === 0) {
      offlineDB.getCachedData<Resident[]>('residents').then((cached) => {
        if (cached && cached.length > 0) setResidents((prev) => (prev.length === 0 ? cached : prev))
      })
      offlineDB.getCachedData<PopulationStatistics>('popStats').then((cachedStats) => {
        if (cachedStats) setPopStats((prev) => prev || cachedStats)
      })
      offlineDB.getCachedData<AdministrativeRequestItem[]>('adminRequests').then((cachedReqs) => {
        if (cachedReqs && cachedReqs.length > 0) setAdminRequests((prev) => (prev.length === 0 ? cachedReqs : prev))
      })
    }

    try {
      const [resList, resStats, reqList] = await Promise.all([
        populationService.listResidents(1, 50, q, occ || undefined),
        populationService.getStatistics(),
        populationService.listRequests(1, 50).catch(() => ({ items: [], total: 0, page: 1, limit: 50 })),
      ])
      setResidents(resList.items)
      setPopStats(resStats)
      setAdminRequests(reqList.items)
      await offlineDB.cacheData('residents', resList.items)
      await offlineDB.cacheData('popStats', resStats)
      await offlineDB.cacheData('adminRequests', reqList.items)
    } catch (err: unknown) {
      const cached = await offlineDB.getCachedData<Resident[]>('residents')
      const cachedStats = await offlineDB.getCachedData<PopulationStatistics>('popStats')
      const cachedRequests = await offlineDB.getCachedData<AdministrativeRequestItem[]>('adminRequests')
      if (cached && cached.length > 0) {
        setResidents(cached)
        if (cachedStats) setPopStats(cachedStats)
        if (cachedRequests) setAdminRequests(cachedRequests)
        setPopMsg({ type: 'success', text: '📦 Menampilkan data kependudukan dari cache offline lokal.' })
      } else {
        const msg = err instanceof Error ? err.message : 'Gagal memuat data penduduk'
        setPopMsg({ type: 'error', text: msg })
      }
    } finally {
      setLoadingPop(false)
    }
  }

  const fetchFarmingData = async () => {
    try {
      const userVillage = currentUser?.village || undefined

      // Stale-While-Revalidate: baca cache kebun seketika jika memori kosong
      if (farms.length === 0) {
        offlineDB.getCachedData<Farm[]>('farms').then((cf) => {
          if (cf && cf.length > 0) setFarms((prev) => (prev.length === 0 ? cf : prev))
        })
        offlineDB.getCachedData<Farmer[]>('farmers').then((cf) => {
          if (cf && cf.length > 0) setFarmers((prev) => (prev.length === 0 ? cf : prev))
        })
        offlineDB.getCachedData<FarmerGroup[]>('farmerGroups').then((cg) => {
          if (cg && cg.length > 0) setFarmerGroups((prev) => (prev.length === 0 ? cg : prev))
        })
        offlineDB.getCachedData<FarmStatistics>('farmStats').then((cs) => {
          if (cs) setFarmStats((prev) => prev || cs)
        })
      }

      const [groups, farmerList, farmList, geo, fStats] = await Promise.all([
        farmerService.listGroups(userVillage),
        farmerService.listFarmers(userVillage),
        farmerService.listFarms(userVillage),
        farmerService.getFarmsGeoJSON(userVillage),
        farmerService.getStatistics(userVillage),
      ])
      setFarmerGroups(groups)
      setFarmers(farmerList.items)
      setFarms(farmList.items)
      setFarmGeoJSON(geo)
      setFarmStats(fStats)
      await offlineDB.cacheData('farmerGroups', groups)
      await offlineDB.cacheData('farmers', farmerList.items)
      await offlineDB.cacheData('farms', farmList.items)
      await offlineDB.cacheData('farmGeoJSON', geo)
      await offlineDB.cacheData('farmStats', fStats)

      if (farmerList.items.length > 0) {
        setFarmForm((prev) => ({ ...prev, farmer_id: prev.farmer_id || farmerList.items[0].id }))
        setHarvestForm((prev) => ({
          ...prev,
          farmer_id: prev.farmer_id || farmerList.items[0].id,
          farm_id: prev.farm_id || (farmList.items[0]?.id || ''),
        }))
      }
    } catch (err: unknown) {
      const cachedFarms = await offlineDB.getCachedData<Farm[]>('farms')
      const cachedFarmers = await offlineDB.getCachedData<Farmer[]>('farmers')
      const cachedGroups = await offlineDB.getCachedData<FarmerGroup[]>('farmerGroups')
      const cachedGeo = await offlineDB.getCachedData<FarmGeoJSONFeatureCollection>('farmGeoJSON')
      const cachedStats = await offlineDB.getCachedData<FarmStatistics>('farmStats')

      if (cachedFarms && cachedFarms.length > 0) {
        if (cachedGroups) setFarmerGroups(cachedGroups)
        if (cachedFarmers) setFarmers(cachedFarmers)
        setFarms(cachedFarms)
        if (cachedGeo) setFarmGeoJSON(cachedGeo)
        if (cachedStats) setFarmStats(cachedStats)
        setFarmMsg({ type: 'success', text: '📦 Menampilkan data lahan & petani dari cache offline lokal.' })
      } else {
        const msg = err instanceof Error ? err.message : 'Gagal memuat data pemetaan lahan'
        setFarmMsg({ type: 'error', text: msg })
      }
    }
  }

  const fetchTraceabilityData = async () => {
    try {
      if (harvests.length === 0) {
        offlineDB.getCachedData<Harvest[]>('harvests').then((ch) => {
          if (ch && ch.length > 0) setHarvests((prev) => (prev.length === 0 ? ch : prev))
        })
        offlineDB.getCachedData<ProductBatch[]>('batches').then((cb) => {
          if (cb && cb.length > 0) setBatches((prev) => (prev.length === 0 ? cb : prev))
        })
      }

      const [hList, bList] = await Promise.all([
        traceabilityService.listHarvests(),
        traceabilityService.listBatches(),
      ])
      setHarvests(hList.items)
      setBatches(bList.items)
      await offlineDB.cacheData('harvests', hList.items)
      await offlineDB.cacheData('batches', bList.items)

      if (hList.items.length > 0 && !batchForm.harvest_id) {
        setBatchForm((prev) => ({
          ...prev,
          harvest_id: hList.items[0].id,
          allocated_qty: hList.items[0].quantity_kg,
        }))
      }
      if (bList.items.length > 0 && !selectedBatch) {
        setSelectedBatch(bList.items[0])
      }
    } catch (err: unknown) {
      const cachedHarvests = await offlineDB.getCachedData<Harvest[]>('harvests')
      const cachedBatches = await offlineDB.getCachedData<ProductBatch[]>('batches')
      if (cachedHarvests && cachedHarvests.length > 0) {
        setHarvests(cachedHarvests)
        if (cachedBatches) setBatches(cachedBatches)
        setTraceMsg({ type: 'success', text: '📦 Menampilkan catatan panen dari cache offline lokal.' })
      } else {
        const msg = err instanceof Error ? err.message : 'Gagal memuat data rantai pasok'
        setTraceMsg({ type: 'error', text: msg })
      }
    }
  }

  const isAdmin = Boolean(
    currentUser &&
      (currentUser.is_superuser || currentUser.roles.some((r) => r.name === 'admin'))
  )
  const isVillageOfficer = Boolean(
    currentUser && currentUser.roles.some((r) => r.name === 'village_officer')
  )
  const isOfficerOrAdmin = Boolean(isAdmin || isVillageOfficer)

  const isCoopManager = Boolean(
    currentUser && currentUser.roles.some((r) => r.name === 'coop_manager')
  )
  const isFieldSurveyor = Boolean(
    currentUser && currentUser.roles.some((r) => r.name === 'field_surveyor')
  )
  const isFarmerGroupAdmin = Boolean(
    currentUser && currentUser.roles.some((r) => r.name === 'farmer_group_admin')
  )
  const isFarmer = Boolean(currentUser && currentUser.roles.some((r) => r.name === 'farmer'))
  const isFarmerOnly = Boolean(isFarmer && !isOfficerOrAdmin && !isFarmerGroupAdmin)
  const currentRoleTitle = currentUser
    ? (currentUser.roles || []).map((r) => r.description || r.name).join(', ') || 'Warga Terdaftar'
    : 'Tamu / Belum Masuk'

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      syncManager.processSync()
    }
    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    syncManager.getPendingCount().then(setPendingSyncCount)

    const unsubscribe = syncManager.subscribe((event) => {
      setPendingSyncCount(event.pendingCount)
      if (event.type === 'sync_start') {
        setIsSyncing(true)
      } else if (event.type === 'sync_complete') {
        setIsSyncing(false)
        if (isOfficerOrAdmin) {
          fetchPopulationData()
          fetchFarmingData()
          fetchTraceabilityData()
        } else if (isFarmerGroupAdmin || isFarmer) {
          fetchFarmingData()
          fetchTraceabilityData()
        }
      }
    })

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      unsubscribe()
    }
  }, [isOfficerOrAdmin, isFarmerGroupAdmin, isFarmer])

  useEffect(() => {
    fetch(`${apiBase}/health`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`)
        return res.json()
      })
      .then((data: HealthResponse) => {
        setHealth(data)
        setLoadingHealth(false)
      })
      .catch((err: Error) => {
        setHealthError(err.message)
        setLoadingHealth(false)
      })

    const token = authService.getAccessToken()
    if (token) {
      authService
        .getMe()
        .then((user) => setCurrentUser(user))
        .catch(() => {
          authService.clearTokens()
          localStorage.removeItem('banda_active_tab')
          setCurrentUser(null)
          const currentPath = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/'
          const mappedTab = ROUTE_TO_TAB[currentPath]
          if (
            currentPath !== '/' &&
            currentPath !== '/landing' &&
            !(mappedTab && PUBLIC_EXPLORER_TABS.includes(mappedTab))
          ) {
            setActiveTab('landing', true)
          }
        })
    }

    // Auto-open public certificate if ?verify=<token> or /verify/<token> is in the URL (e.g. from camera scan)
    try {
      const searchParams = new URLSearchParams(window.location.search)
      let verifyToken = searchParams.get('verify') || searchParams.get('token')
      if (!verifyToken && window.location.pathname.startsWith('/verify/')) {
        verifyToken = window.location.pathname.replace('/verify/', '').trim()
      }
      if (verifyToken) {
        handlePublicVerify(verifyToken)
      }
    } catch {
      // ignore
    }
  }, [apiBase])

  useEffect(() => {
    const userId = currentUser?.id
    if (!userId) {
      lastFetchedUserIdRef.current = null
      return
    }

    // Hindari duplikasi pemanggilan 10 endpoint jika objek user me-refresh token dengan ID yang sama
    if (lastFetchedUserIdRef.current === userId) {
      return
    }
    lastFetchedUserIdRef.current = userId

    if (isOfficerOrAdmin) {
      fetchPopulationData()
      fetchFarmingData()
      fetchTraceabilityData()
    } else if (isFarmerGroupAdmin || isFarmer) {
      fetchFarmingData()
      fetchTraceabilityData()
    }
  }, [currentUser?.id, isOfficerOrAdmin, isFarmerGroupAdmin, isFarmer])

  const getRoleDefaultTab = (user: User | null): typeof activeTab => {
    if (!user) return 'landing'
    // Mengarahkan ke Dasbor Ekosistem Terpadu (Landing Page 2) yang menyesuaikan tampilan dengan role
    return 'dashboard'
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError(null)
    try {
      const response = await authService.login(username, password)
      setCurrentUser(response.user)
      const targetTab = getRoleDefaultTab(response.user)
      setActiveTab(targetTab)
      setShowQuickLoginModal(false)
    } catch (err: unknown) {
      if (err instanceof Error) setAuthError(err.message)
    } finally {
      setAuthLoading(false)
    }
  }

  const handleQuickLogin = async (u: string, p: string) => {
    setUsername(u)
    setPassword(p)
    setAuthLoading(true)
    setAuthError(null)
    try {
      const response = await authService.login(u, p)
      setCurrentUser(response.user)
      const targetTab = getRoleDefaultTab(response.user)
      setActiveTab(targetTab)
      setShowQuickLoginModal(false)
    } catch (err: unknown) {
      if (err instanceof Error) setAuthError(err.message)
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = () => {
    authService.clearTokens()
    try {
      localStorage.removeItem('banda_active_tab')
      localStorage.removeItem('banda_active_user_profile')
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    } catch {
      // ignore
    }
    authService.logout().catch(() => {})
    setCurrentUser(null)
    setActiveTab('landing')
  }

  const handleManualSync = async () => {
    setIsSyncing(true)
    try {
      const res = await syncManager.processSync()
      const updated = await syncManager.getAllQueue()
      setQueueList(updated)
      if (res.total > 0) {
        alert(`Sinkronisasi selesai: ${res.success} berhasil dikirim ke server, ${res.failed} gagal.`)
      } else {
        alert('Tidak ada item antrean yang perlu disinkronkan.')
      }
    } catch (err: unknown) {
      console.error('Manual sync error:', err)
    } finally {
      setIsSyncing(false)
    }
  }

  const handleOpenQueueModal = async () => {
    const list = await syncManager.getAllQueue()
    setQueueList(list)
    setShowQueueModal(true)
  }

  const handleDeleteQueueItem = async (id: number) => {
    await syncManager.removeItem(id)
    const updated = await syncManager.getAllQueue()
    setQueueList(updated)
  }

  const handleClearAllQueue = async () => {
    if (confirm('Yakin ingin mengosongkan seluruh antrean sinkronisasi offline?')) {
      await syncManager.clearAll()
      setQueueList([])
    }
  }

  const handleCreateResident = async (e: React.FormEvent) => {
    e.preventDefault()
    setPopMsg(null)

    // Check duplicate NIK locally first
    if (residents.some((r) => r.nik === popForm.nik)) {
      setPopMsg({
        type: 'error',
        text: `NIK ${popForm.nik} sudah terdaftar di sistem kependudukan. NIK bersifat tunggal nasional dan tidak boleh sama di desa manapun.`,
      })
      return
    }

    if (!navigator.onLine) {
      await syncManager.enqueue(
        'resident_create',
        `${apiBase}/population/residents`,
        'POST',
        { ...popForm, village: 'Banda Neira' } as unknown as Record<string, unknown>,
        `Pendaftaran Penduduk: ${popForm.full_name} (${popForm.nik})`
      )
      const optimisticResident: Resident = {
        id: `offline-${Date.now()}`,
        nik: popForm.nik,
        full_name: popForm.full_name,
        gender: popForm.gender,
        birth_place: popForm.birth_place || 'Banda Neira',
        address: popForm.address,
        rt: popForm.rt,
        rw: popForm.rw,
        village: 'Lonthoir',
        occupation: popForm.occupation,
        phone_number: popForm.phone_number,
        verification_status: 'pending',
        created_at: new Date().toISOString(),
      }
      setResidents((prev) => [optimisticResident, ...prev])
      setPopMsg({
        type: 'success',
        text: `📦 Mode Offline: Data ${popForm.full_name} disimpan ke antrean lokal! Akan dikirim otomatis ke server saat online.`,
      })
      const nextNik = (BigInt(popForm.nik) + 1n).toString()
      setPopForm({ ...popForm, nik: nextNik, full_name: '' })
      return
    }

    try {
      const created = await populationService.createResident(popForm)
      setPopMsg({ type: 'success', text: `Penduduk ${popForm.full_name} berhasil didaftarkan!` })
      if (created.access_pin) {
        setCredentialReceipt({
          nik: created.nik,
          full_name: created.full_name,
          username: created.account_username || created.nik,
          access_pin: created.access_pin,
          village: created.village || popForm.village || 'Lonthoir',
        })
      }
      const nextNik = (BigInt(popForm.nik) + 1n).toString()
      setPopForm({ ...popForm, nik: nextNik, full_name: '', access_pin: '' })
      fetchPopulationData()
    } catch (err: unknown) {
      if (err instanceof TypeError || (err instanceof Error && err.message.toLowerCase().includes('fetch'))) {
        await syncManager.enqueue(
          'resident_create',
          `${apiBase}/population/residents`,
          'POST',
          { ...popForm, village: 'Banda Neira' } as unknown as Record<string, unknown>,
          `Pendaftaran Penduduk: ${popForm.full_name} (${popForm.nik})`
        )
        setPopMsg({
          type: 'success',
          text: `📦 Jaringan bermasalah: Data ${popForm.full_name} diamankan ke antrean offline lokal!`,
        })
      } else if (err instanceof Error) {
        setPopMsg({ type: 'error', text: err.message })
      }
    }
  }

  const handleVerifyResident = async (id: string, newStatus: 'verified' | 'rejected') => {
    setPopMsg(null)
    try {
      await populationService.verifyResident(id, newStatus, 'Verifikasi petugas desa')
      setPopMsg({ type: 'success', text: `Status penduduk diperbarui menjadi ${newStatus}!` })
      fetchPopulationData()
    } catch (err: unknown) {
      if (err instanceof Error) setPopMsg({ type: 'error', text: err.message })
    }
  }

  const handleCreateQuickFarmerAndFarm = async (e: React.FormEvent) => {
    e.preventDefault()
    setFarmMsg(null)

    const targetVillage = currentUser?.village || farmForm.village || undefined
    const effectivePolygon = ensureFarmPolygonGeoJSON(
      farmForm.polygon_boundary_geojson,
      farmForm.latitude,
      farmForm.longitude,
      farmForm.area_sqm
    )

    if (!navigator.onLine) {
      const payload = {
        ...farmForm,
        farmer_id: farmForm.farmer_id || (farmers[0]?.id || ''),
        village: targetVillage,
        polygon_boundary_geojson: effectivePolygon,
      }
      await syncManager.enqueue(
        'farm_create',
        `${apiBase}/farms`,
        'POST',
        payload,
        `Pemetaan Lahan: ${farmForm.name} (${farmForm.farm_code})`
      )
      const offlineFarmId = `offline-${Date.now()}`
      const optimisticFarm: Farm = {
        id: offlineFarmId,
        farmer_id: farmForm.farmer_id || (farmers[0]?.id || ''),
        farm_code: farmForm.farm_code,
        name: farmForm.name,
        location_description: farmForm.location_description,
        latitude: farmForm.latitude,
        longitude: farmForm.longitude,
        polygon_boundary_geojson: effectivePolygon,
        area_sqm: farmForm.area_sqm,
        primary_commodity: farmForm.primary_commodity,
        verification_status: isOfficerOrAdmin ? 'verified' : 'pending',
        village: targetVillage,
        created_at: new Date().toISOString(),
      }

      const optimisticFeature: FarmGeoJSONFeature = {
        type: 'Feature',
        id: offlineFarmId,
        geometry: {
          type: 'Point',
          coordinates: [optimisticFarm.longitude, optimisticFarm.latitude],
        },
        properties: {
          farm_code: optimisticFarm.farm_code,
          name: optimisticFarm.name,
          commodity: optimisticFarm.primary_commodity,
          village: optimisticFarm.village,
          area_sqm: optimisticFarm.area_sqm,
          farmer_id: optimisticFarm.farmer_id,
          location_description: optimisticFarm.location_description,
          verification_status: optimisticFarm.verification_status,
          polygon_boundary_geojson: effectivePolygon,
        },
      }

      const updatedFarms = [optimisticFarm, ...farms]
      const updatedGeoJSON: FarmGeoJSONFeatureCollection = {
        type: 'FeatureCollection',
        features: [optimisticFeature, ...(farmGeoJSON?.features || [])],
      }

      setFarms(updatedFarms)
      setFarmGeoJSON(updatedGeoJSON)
      await offlineDB.cacheData('farms', updatedFarms)
      await offlineDB.cacheData('farmGeoJSON', updatedGeoJSON)

      const offText = isOfficerOrAdmin
        ? `📦 Mode Offline: Kebun & poligon batas ${farmForm.name} tersimpan di peta lokal dan antrean sinkronisasi!`
        : `📦 Mode Offline: Pengajuan kebun & poligon batas ${farmForm.name} tersimpan di peta lokal (Menunggu Persetujuan Desa saat online).`
      setFarmMsg({
        type: 'success',
        text: offText,
      })
      setFarmForm((prev) => ({
        ...prev,
        farm_code: `BN-FARM-00${farms.length + 2}`,
        name: '',
      }))
      return
    }

    try {
      let targetFarmerId = farmForm.farmer_id
      if (!targetFarmerId) {
        let groupId = farmerGroups[0]?.id
        if (!groupId) {
          const newGrp = await farmerService.createGroup({
            name: targetVillage ? `Kelompok Tani Desa ${targetVillage}` : 'Kelompok Tani Pala Banda Neira',
            village: targetVillage,
          })
          groupId = newGrp.id
        }
        const newFrm = await farmerService.createFarmer({
          farmer_code: `BN-FRM-00${farmers.length + 1}`,
          name: targetVillage ? `Petani ${targetVillage}` : 'Ibrahim Lonthoir',
          phone: '081233445566',
          farmer_group_id: groupId,
          village: targetVillage,
        })
        targetFarmerId = newFrm.id
      }

      await farmerService.createFarm({
        ...farmForm,
        farmer_id: targetFarmerId,
        village: targetVillage,
        polygon_boundary_geojson: effectivePolygon,
      })
      const successText = isOfficerOrAdmin
        ? `Kebun ${farmForm.name} berhasil dipetakan beserta batas poligon dan disahkan!`
        : `Pengajuan plot kebun "${farmForm.name}" beserta batas poligon berhasil dikirim! Menunggu persetujuan verifikasi dari Petugas Kantor Desa.`
      setFarmMsg({ type: 'success', text: successText })
      setFarmForm((prev) => ({
        ...prev,
        farm_code: `BN-FARM-00${farms.length + 2}`,
        name: '',
      }))
      fetchFarmingData()
    } catch (err: unknown) {
      if (err instanceof TypeError || (err instanceof Error && err.message.toLowerCase().includes('fetch'))) {
        const payload = {
          ...farmForm,
          farmer_id: farmForm.farmer_id || (farmers[0]?.id || ''),
          village: targetVillage,
          polygon_boundary_geojson: effectivePolygon,
        }
        await syncManager.enqueue(
          'farm_create',
          `${apiBase}/farms`,
          'POST',
          payload,
          `Pemetaan Lahan: ${farmForm.name} (${farmForm.farm_code})`
        )
        const offlineFarmId = `offline-${Date.now()}`
        const optimisticFarm: Farm = {
          id: offlineFarmId,
          farmer_id: farmForm.farmer_id || (farmers[0]?.id || ''),
          farm_code: farmForm.farm_code,
          name: farmForm.name,
          location_description: farmForm.location_description,
          latitude: farmForm.latitude,
          longitude: farmForm.longitude,
          polygon_boundary_geojson: effectivePolygon,
          area_sqm: farmForm.area_sqm,
          primary_commodity: farmForm.primary_commodity,
          verification_status: isOfficerOrAdmin ? 'verified' : 'pending',
          village: targetVillage,
          created_at: new Date().toISOString(),
        }
        const optimisticFeature: FarmGeoJSONFeature = {
          type: 'Feature',
          id: offlineFarmId,
          geometry: {
            type: 'Point',
            coordinates: [optimisticFarm.longitude, optimisticFarm.latitude],
          },
          properties: {
            farm_code: optimisticFarm.farm_code,
            name: optimisticFarm.name,
            commodity: optimisticFarm.primary_commodity,
            village: optimisticFarm.village,
            area_sqm: optimisticFarm.area_sqm,
            farmer_id: optimisticFarm.farmer_id,
            location_description: optimisticFarm.location_description,
            verification_status: optimisticFarm.verification_status,
            polygon_boundary_geojson: effectivePolygon,
          },
        }
        const updatedFarms = [optimisticFarm, ...farms]
        const updatedGeoJSON: FarmGeoJSONFeatureCollection = {
          type: 'FeatureCollection',
          features: [optimisticFeature, ...(farmGeoJSON?.features || [])],
        }
        setFarms(updatedFarms)
        setFarmGeoJSON(updatedGeoJSON)
        await offlineDB.cacheData('farms', updatedFarms)
        await offlineDB.cacheData('farmGeoJSON', updatedGeoJSON)

        setFarmMsg({
          type: 'success',
          text: `📦 Jaringan terputus: Data kebun & poligon batas ${farmForm.name} diamankan ke antrean offline lokal dan peta!`,
        })
      } else if (err instanceof Error) {
        setFarmMsg({ type: 'error', text: err.message })
      }
    }
  }

  const handleVerifyFarm = async (id: string, newStatus: 'verified' | 'rejected') => {
    setVerifyingFarmId(id)
    setFarmMsg(null)
    try {
      await farmerService.verifyFarm(
        id,
        newStatus,
        newStatus === 'verified' ? 'Disetujui oleh petugas kantor desa Banda Neira' : 'Ditolak kantor desa'
      )
      setFarmMsg({
        type: 'success',
        text: `Plot kebun berhasil di-${newStatus === 'verified' ? 'setujui dan disahkan' : 'tolak'} oleh Petugas Kantor Desa!`,
      })
      await fetchFarmingData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memverifikasi status kebun'
      setFarmMsg({ type: 'error', text: msg })
    } finally {
      setVerifyingFarmId(null)
    }
  }

  const handleCreateHarvest = async (e: React.FormEvent) => {
    e.preventDefault()
    setTraceMsg(null)

    if (!navigator.onLine) {
      await syncManager.enqueue(
        'harvest_create',
        `${apiBase}/harvests`,
        'POST',
        harvestForm,
        `Catatan Panen: ${harvestForm.harvest_code} (${harvestForm.commodity} - ${harvestForm.quantity_kg} kg)`
      )
      const optimisticHarvest: Harvest = {
        id: `offline-${Date.now()}`,
        farm_id: harvestForm.farm_id,
        farmer_id: harvestForm.farmer_id,
        harvest_code: harvestForm.harvest_code,
        commodity: harvestForm.commodity,
        harvest_date: harvestForm.harvest_date,
        quantity_kg: harvestForm.quantity_kg,
        quality_grade: harvestForm.quality_grade,
        notes: '⏳ Tersimpan di antrean offline lokal',
      }
      setHarvests((prev) => [optimisticHarvest, ...prev])
      setTraceMsg({
        type: 'success',
        text: `📦 Mode Offline: Catatan panen ${harvestForm.harvest_code} disimpan ke antrean lokal perangkat! Akan disinkronkan otomatis saat online.`,
      })
      setHarvestForm((prev) => ({
        ...prev,
        harvest_code: `BN-HRV-2026-00${harvests.length + 2}`,
      }))
      return
    }

    try {
      await traceabilityService.createHarvest(harvestForm)
      setTraceMsg({ type: 'success', text: `Hasil panen ${harvestForm.harvest_code} berhasil dicatat!` })
      setHarvestForm((prev) => ({
        ...prev,
        harvest_code: `BN-HRV-2026-00${harvests.length + 2}`,
      }))
      fetchTraceabilityData()
    } catch (err: unknown) {
      if (err instanceof TypeError || (err instanceof Error && err.message.toLowerCase().includes('fetch'))) {
        await syncManager.enqueue(
          'harvest_create',
          `${apiBase}/harvests`,
          'POST',
          harvestForm,
          `Catatan Panen: ${harvestForm.harvest_code} (${harvestForm.commodity} - ${harvestForm.quantity_kg} kg)`
        )
        const optimisticHarvest: Harvest = {
          id: `offline-${Date.now()}`,
          farm_id: harvestForm.farm_id,
          farmer_id: harvestForm.farmer_id,
          harvest_code: harvestForm.harvest_code,
          commodity: harvestForm.commodity,
          harvest_date: harvestForm.harvest_date,
          quantity_kg: harvestForm.quantity_kg,
          quality_grade: harvestForm.quality_grade,
          notes: '⏳ Tersimpan di antrean offline lokal',
        }
        setHarvests((prev) => [optimisticHarvest, ...prev])
        setTraceMsg({
          type: 'success',
          text: `📦 Jaringan terputus: Data panen ${harvestForm.harvest_code} berhasil diamankan ke antrean offline lokal!`,
        })
      } else if (err instanceof Error) {
        setTraceMsg({ type: 'error', text: err.message })
      }
    }
  }

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault()
    setTraceMsg(null)
    try {
      const newBatch = await traceabilityService.createBatch({
        batch_code: batchForm.batch_code,
        commodity: batchForm.commodity,
        production_date: batchForm.production_date,
        harvests: [{ harvest_id: batchForm.harvest_id, allocated_quantity_kg: batchForm.allocated_qty }],
      })
      setTraceMsg({ type: 'success', text: `Batch produk ${newBatch.batch_code} berhasil dibuat!` })
      setSelectedBatch(newBatch)
      setBatchForm((prev) => ({
        ...prev,
        batch_code: `BN-BTC-2026-00${batches.length + 2}`,
      }))
      fetchTraceabilityData()
    } catch (err: unknown) {
      if (err instanceof Error) setTraceMsg({ type: 'error', text: err.message })
    }
  }

  const handleAppendEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBatch) return
    setTraceMsg(null)

    if (!navigator.onLine) {
      await syncManager.enqueue(
        'event_create',
        `${apiBase}/batches/${selectedBatch.id}/events`,
        'POST',
        eventForm,
        `Peristiwa: ${eventForm.event_type} (${selectedBatch.batch_code})`
      )
      setTraceMsg({
        type: 'success',
        text: `📦 Mode Offline: Peristiwa (${eventForm.event_type}) disimpan ke antrean lokal perangkat!`,
      })
      return
    }

    try {
      await traceabilityService.appendEvent(selectedBatch.id, eventForm)
      setTraceMsg({ type: 'success', text: `Peristiwa rantai pasok (${eventForm.event_type}) berhasil dicatat!` })
      fetchTraceabilityData()
    } catch (err: unknown) {
      if (err instanceof TypeError || (err instanceof Error && err.message.toLowerCase().includes('fetch'))) {
        await syncManager.enqueue(
          'event_create',
          `${apiBase}/batches/${selectedBatch.id}/events`,
          'POST',
          eventForm,
          `Peristiwa: ${eventForm.event_type} (${selectedBatch.batch_code})`
        )
        setTraceMsg({
          type: 'success',
          text: `📦 Jaringan terputus: Peristiwa (${eventForm.event_type}) diamankan ke antrean offline lokal!`,
        })
      } else if (err instanceof Error) {
        setTraceMsg({ type: 'error', text: err.message })
      }
    }
  }

  const handlePublicVerify = async (token?: string) => {
    setShowPublicVerifyModal(true)
    const cleanToken = token?.trim()

    if (cleanToken) {
      setVerifyInitialToken(cleanToken)
      try {
        const res = await traceabilityService.verifyPublic(cleanToken)
        setPublicVerifyData(res)
      } catch {
        const fallback = getSampleBatchVerification(cleanToken)
        if (fallback) {
          setPublicVerifyData(fallback)
        } else {
          setPublicVerifyData(getSampleBatchVerification('BN-BTC-2026-001'))
        }
      }
    } else {
      setVerifyInitialToken('BN-BTC-2026-001')
      if (!publicVerifyData) {
        setPublicVerifyData(getSampleBatchVerification('BN-BTC-2026-001'))
      }
    }
  }

  const handleAnchorBlockchain = async (batchId: string) => {
    setBlockchainLoading(batchId)
    setTraceMsg(null)
    try {
      const tx = await traceabilityService.anchorToBlockchain(batchId)
      setTraceMsg({
        type: 'success',
        text: `Batch berhasil dijangkarkan ke Smart Contract EVM! Tx Hash: ${tx.transaction_hash?.substring(0, 18)}... (Blok #${tx.block_number || 'N/A'})`,
      })
      fetchTraceabilityData()
    } catch (err: unknown) {
      if (err instanceof Error) setTraceMsg({ type: 'error', text: err.message })
    } finally {
      setBlockchainLoading(null)
    }
  }

  const handleVerifyBlockchain = async (batchId: string) => {
    try {
      const res = await traceabilityService.verifyBlockchain(batchId)
      setVerificationModal(res)
    } catch (err: unknown) {
      if (err instanceof Error) alert(err.message)
    }
  }

  return (
    <div
      style={{
        maxWidth: '100%',
        margin: '0 auto',
        padding: '0',
        overflowX: 'clip',
      }}
    >
      {/* 0. RESTORING SESSION PLACEHOLDER */}
      {Boolean(authService.getAccessToken()) && !currentUser && activeTab !== 'landing' && (
        <div className="min-h-screen bg-[#081d35] flex items-center justify-center text-amber-300 font-sans">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium tracking-wide text-slate-300">Memulihkan sesi ruang kerja Banda Neira...</span>
          </div>
        </div>
      )}

      {/* 1. LANDING PORTAL UTAMA (SATU PINTU UTAMA EKOSISTEM - HANYA 1 LANDING PAGE) */}
      <div style={{ display: activeTab === 'landing' ? 'block' : 'none' }}>
        <ErrorBoundary fallbackTitle="Terjadi Kendala Memuat Beranda Utama">
          <LandingPortalWorkspace
            activeTab={activeTab}
            onNavigate={(tab, slug) => {
              if (tab === 'sejarah') {
                handleNavigateToSejarah(slug)
                return
              }
              setActiveTab(
                tab === 'population' && currentUser ? getRoleDefaultTab(currentUser) : (tab as TabId)
              )
            }}
            onOpenLogin={() => setActiveTab('population')}
            onOpenMarketplace={() => setActiveTab('marketplace')}
            onPublicVerify={(token) => handlePublicVerify(token)}
            currentUser={currentUser}
            isOnline={isOnline}
            onLogout={handleLogout}
            onOpenQuickLogin={() => setShowQuickLoginModal(true)}
          />
        </ErrorBoundary>
      </div>

      {/* 2. Login Portal Section for Non-authenticated Users on Protected Operational Routes */}
      {!currentUser &&
        !authService.getAccessToken() &&
        activeTab !== 'landing' &&
        !PUBLIC_EXPLORER_TABS.includes(activeTab) && (
        <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#081d35] text-amber-300">Memuat portal masuk...</div>}>
          <LoginSection
            username={username}
            setUsername={setUsername}
            password={password}
            setPassword={setPassword}
            onLogin={handleLogin}
            onQuickLogin={handleQuickLogin}
            onBackToHome={() => setActiveTab('landing')}
            onVerifySampleBatch={(token) => handlePublicVerify(token)}
            onPublicVerify={(token) => handlePublicVerify(token)}
            onOpenMarketplace={() => setActiveTab('marketplace')}
            onOpenPlanner={() => setActiveTab('smart_planner')}
            onOpenKoperasi={() => setActiveTab('koperasi')}
            onOpenTelemetry={() => setActiveTab('iot')}
            onOpenTourism={() => setActiveTab('tourism')}
            onOpenGIS={() => setActiveTab('gis')}
            onOpenSurvei={() => setActiveTab('survei')}
            loading={authLoading}
            error={authError}
          />
        </React.Suspense>
      )}

      {/* 2C. Dedicated Edge-to-Edge Fullscreen GIS Workspace for Public Visitors */}
      {!currentUser &&
        !authService.getAccessToken() &&
        activeTab === 'gis' && (
        <div className="fixed inset-0 w-screen h-[100dvh] overflow-hidden bg-slate-900 z-50 flex flex-col">
          <ErrorBoundary fallbackTitle="Terjadi Kendala Memuat Peta GIS Banda Neira">
            <React.Suspense
              fallback={
                <div className="flex-1 flex items-center justify-center bg-slate-900 text-white font-medium text-sm">
                  Memuat Peta Spasial Interaktif Banda Neira...
                </div>
              }
            >
              <InteractiveMapWorkspace
                currentUser={null}
                isPageFullscreen={true}
                onBackToLanding={() => setActiveTab('landing')}
              />
            </React.Suspense>
          </ErrorBoundary>
        </div>
      )}

      {/* 2D. Dedicated Public & Visitor History Articles Workspace (Arsip Sejarah & Cerita Rempah) */}
      {activeTab === 'sejarah' && (
        <ErrorBoundary fallbackTitle="Terjadi Kendala Memuat Arsip Sejarah Banda Neira">
          <React.Suspense
            fallback={
              <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] text-[#081D35] font-medium text-sm">
                Memuat Arsip Sejarah &amp; Cerita Rempah Banda Neira...
              </div>
            }
          >
            <HistoryArticlesWorkspace
              initialSlug={selectedArticleSlug}
              onNavigateHome={() => {
                setSelectedArticleSlug(null)
                setActiveTab('landing')
              }}
              onNavigateToGis={() => setActiveTab('gis')}
              onNavigateToTourism={() => setActiveTab('tourism')}
              onNavigateToDashboard={() => setActiveTab('dashboard')}
              onOpenQuickLogin={() => setShowQuickLoginModal(true)}
              currentUser={currentUser}
            />
          </React.Suspense>
        </ErrorBoundary>
      )}

      {/* 2E. Dedicated Standalone Public Marketplace Catalog Page (Hanya Menampilkan Etalase Katalog Produk) */}
      {!currentUser &&
        !authService.getAccessToken() &&
        activeTab === 'marketplace' && (
        <ErrorBoundary fallbackTitle="Terjadi Kendala Memuat Pasar Komoditas Banda Neira">
          <React.Suspense
            fallback={
              <div className="min-h-screen flex items-center justify-center bg-[#FBFBFA] text-[#081D35] font-bold text-sm">
                Memuat Pasar Komoditas Banda Neira...
              </div>
            }
          >
            <MarketplaceCatalogWorkspace
              onBackToHome={() => setActiveTab('landing')}
              onPublicVerify={(token) => handlePublicVerify(token)}
              onOpenLogin={() => setActiveTab('population')}
              currentUser={null}
            />
          </React.Suspense>
        </ErrorBoundary>
      )}

      {/* 2F. Dedicated Standalone Public Help & Support Center */}
      {!currentUser &&
        !authService.getAccessToken() &&
        activeTab === 'help' && (
        <div className="min-h-screen bg-[#FBFBFA] flex flex-col">
          <header className="sticky top-0 z-40 bg-[#081D35] text-white border-b border-[#1E3A5F] shadow-md px-4 sm:px-8 py-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setActiveTab('landing')}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#F4B75E] text-xs font-bold transition-all cursor-pointer"
            >
              ← Kembali ke Beranda
            </button>
            <span className="font-bold text-sm text-white hidden sm:inline">Pusat Bantuan &amp; Panduan Sistem</span>
            <button
              type="button"
              onClick={() => setActiveTab('population')}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-[#F4B75E] text-[#081D35] text-xs font-bold cursor-pointer"
            >
              Masuk Portal
            </button>
          </header>
          <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex-1">
            <ErrorBoundary fallbackTitle="Terjadi Kendala Memuat Pusat Bantuan">
              <React.Suspense fallback={<div className="p-8 text-center text-slate-500 text-sm">Memuat Pusat Bantuan...</div>}>
                <HelpDeskWorkspace
                  currentUser={null}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                  onOpenLanding={() => setActiveTab('landing')}
                  onOpenMarketplace={() => setShowMarketplaceModal(true)}
                />
              </React.Suspense>
            </ErrorBoundary>
          </div>
        </div>
      )}

      {/* 2G. Dedicated Edge-to-Edge Fullscreen Smart Planner Workspace for Public Visitors */}
      {!currentUser &&
        !authService.getAccessToken() &&
        activeTab === 'smart_planner' && (
        <div className="fixed inset-0 w-screen h-[100dvh] overflow-hidden bg-[#FDFBF7] z-50 flex flex-col">
          <ErrorBoundary fallbackTitle="Terjadi Kendala Memuat Perencana Wisata Banda Neira">
            <React.Suspense
              fallback={
                <div className="flex-1 flex items-center justify-center bg-[#FDFBF7] text-[#081D35] font-medium text-sm">
                  Memuat Perencana Wisata Banda Neira...
                </div>
              }
            >
              <SmartPlannerWorkspace
                onNavigate={(tab, param) => handleNavigateWithSlug(tab as TabId, param)}
                onBackToLanding={() => setActiveTab('landing')}
              />
            </React.Suspense>
          </ErrorBoundary>
        </div>
      )}

      {/* 3. Dedicated Public Tourism Workspace (Direktori Wisata & Penginapan) */}
      {!currentUser &&
        !authService.getAccessToken() &&
        activeTab === 'tourism' && (
        <ErrorBoundary fallbackTitle="Terjadi Kendala Memuat Layanan Wisata Banda Neira">
          <React.Suspense
            fallback={
              <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] text-[#081D35] font-medium text-sm">
                Memuat Direktori Wisata &amp; Penginapan Banda Neira...
              </div>
            }
          >
            <div className="min-h-screen bg-[#FDFBF7] text-[#081D35] flex flex-col selection:bg-[#F4B75E] selection:text-[#081D35]">
              <header className="sticky top-0 z-30 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-[#E8E2D5] px-4 sm:px-8 py-3">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab('landing')}
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white hover:bg-[#F4B75E]/20 text-[#0c2340] border border-[#D5CEBF] text-xs font-semibold transition cursor-pointer shadow-xs active:scale-[0.98]"
                    >
                      <ArrowLeft size={14} />
                      <span>Kembali ke Beranda</span>
                    </button>
                    <span className="font-serif font-bold text-sm tracking-tight text-[#0c2340]">
                      bandanaira<span className="text-[#F4B75E]">.com</span>
                    </span>
                    <span className="hidden sm:inline text-stone-300">|</span>
                    <span className="hidden sm:inline text-xs font-serif font-medium text-stone-600">
                      Destinasi &amp; Penginapan
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('gis')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-stone-50 text-[#0c2340] border border-[#D5CEBF] text-xs font-semibold transition cursor-pointer shadow-xs"
                    >
                      <Compass size={13} />
                      <span className="hidden sm:inline">Peta</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('smart_planner')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-stone-50 text-[#0c2340] border border-[#D5CEBF] text-xs font-semibold transition cursor-pointer shadow-xs"
                    >
                      <Sparkles size={13} className="text-amber-500" />
                      <span className="hidden sm:inline">Perencana Wisata</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowQuickLoginModal(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#081D35] hover:bg-[#0c2340] text-[#F4B75E] text-xs font-semibold transition cursor-pointer shadow-xs"
                    >
                      <span>Masuk Akun</span>
                    </button>
                  </div>
                </div>
              </header>

              <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <TourismEcoStayWorkspace
                  currentUser={null}
                  onNavigate={(tab, param) => handleNavigateWithSlug(tab, param)}
                  onOpenQuickLogin={() => setShowQuickLoginModal(true)}
                />
              </main>

              <BandaUnifiedFooter
                onNavigateTab={(tab) => setActiveTab(tab)}
                onOpenLogin={() => setShowQuickLoginModal(true)}
                onOpenQuickLogin={() => setShowQuickLoginModal(true)}
              />
            </div>
          </React.Suspense>
        </ErrorBoundary>
      )}

      {/* 2B. Loading State when restoring active user session with valid token */}
      {!currentUser && Boolean(authService.getAccessToken()) && activeTab !== 'landing' && activeTab !== 'sejarah' && (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#081D35] text-white p-6">
          <div className="w-12 h-12 border-4 border-[#F4B75E] border-t-transparent rounded-full animate-spin mb-4" />
          <h3 className="font-serif text-lg text-[#F4B75E] font-bold">Memulihkan Sesi Pengguna...</h3>
          <p className="text-slate-400 text-sm mt-1">Menghubungkan ke node ekosistem Banda Neira</p>
        </div>
      )}

      {/* =====================================================================
          4. DASBOR EKOSISTEM DENGAN SIDEBAR NAVIGASI DI SAMPING (UNTUK USER LOGIN)
             Semua Ruang Kerja Operasional Terintegrasi di Dalam Dasbor Sesuai Hak Akses Role
      ====================================================================== */}
      {currentUser && activeTab !== 'landing' && activeTab !== 'sejarah' && (
        <DashboardLayout
          currentUser={currentUser}
          activeTab={activeTab as any}
          onSelectTab={(tab) => setActiveTab(tab)}
          onOpenLanding={() => setActiveTab('landing')}
          onOpenMarketplace={() => setActiveTab('marketplace')}
          onPublicVerify={(token) => handlePublicVerify(token || '')}
          onOpenQueueModal={handleOpenQueueModal}
          onOpenQuickSwitch={() => setShowQuickLoginModal(true)}
          onLogout={handleLogout}
          isOnline={isOnline}
          pendingSyncCount={pendingSyncCount}
          isSyncing={isSyncing}
          adminPendingLettersCount={adminRequests.filter((r) => r.status === 'submitted').length}
          pendingFarmsCount={farms.filter((f) => f.verification_status === 'pending').length}
          systemHealth={health}
          loadingHealth={loadingHealth}
          healthError={healthError}
        >
          <ErrorBoundary fallbackTitle="Terjadi Kendala Memuat Ruang Kerja">
          <React.Suspense fallback={<div className="p-8 text-center text-slate-500 font-medium">Memuat antarmuka...</div>}>
          {/* TAB 0: RINGKASAN DASBOR (OVERVIEW BENTO GRID 21st.dev DENGAN WARNA BERANDA) */}
          {activeTab === 'dashboard' && (
            <UserEcosystemDashboard
              currentUser={currentUser}
              onNavigate={(tab) => setActiveTab(tab as any)}
              onOpenMarketplace={() => setActiveTab('marketplace')}
              onPublicVerify={(token) => handlePublicVerify(token)}
              onLogout={handleLogout}
              isOnline={isOnline}
            />
          )}

          {/* TAB 1: WARGA & PROFESI (POPULATION) */}
          {activeTab === 'population' && (
            isOfficerOrAdmin ? (
              <ResidentsWorkspace
                currentUser={currentUser}
                residents={residents}
                popStats={popStats}
                loadingPop={loadingPop}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedOccupationFilter={selectedOccupationFilter}
                setSelectedOccupationFilter={setSelectedOccupationFilter}
                popMsg={popMsg}
                popForm={popForm}
                setPopForm={setPopForm}
                fetchPopulationData={fetchPopulationData}
                handleCreateResident={handleCreateResident}
                handleVerifyResident={handleVerifyResident}
                credentialReceipt={credentialReceipt}
                setCredentialReceipt={setCredentialReceipt}
              />
            ) : (
              <AccessRestrictedNotice
                workspaceTitle="Data Kependudukan & Profesi Warga"
                roleTitle="Administrator Sistem atau Petugas Kantor Desa"
                currentRole={currentRoleTitle}
                onBackToDashboard={() => setActiveTab('dashboard')}
                onOpenQuickSwitch={() => setShowQuickLoginModal(true)}
              />
            )
          )}

          {/* TAB 2: PELAYANAN SURAT WARGA (LETTERS) */}
          {activeTab === 'letters' && (
            isOfficerOrAdmin ? (
              <LettersWorkspace
                adminRequests={adminRequests}
                requestFilterStatus={requestFilterStatus}
                setRequestFilterStatus={setRequestFilterStatus}
                updatingRequestId={updatingRequestId}
                handleUpdateRequestStatus={handleUpdateRequestStatus}
                letterActionMsg={letterActionMsg}
              />
            ) : (
              <CitizenPortalWorkspace
                currentUser={currentUser}
                letters={letters}
                showLetterForm={showLetterForm}
                setShowLetterForm={setShowLetterForm}
                letterTypeInput={letterTypeInput}
                setLetterTypeInput={setLetterTypeInput}
                letterPurposeInput={letterPurposeInput}
                setLetterPurposeInput={setLetterPurposeInput}
                handleSubmitLetter={handleSubmitLetter}
                letterSuccessNotice={letterSuccessNotice}
              />
            )
          )}

          {/* TAB 3: PETA KEBUN & POKTAN (FARMING) */}
          {activeTab === 'farming' && (
            (isOfficerOrAdmin || isFarmerGroupAdmin || isFarmer) ? (
              <FarmsGisWorkspace
                currentUser={currentUser}
                farmers={farmers}
                farmerGroups={farmerGroups}
                farms={farms}
                farmGeoJSON={farmGeoJSON}
                farmStats={farmStats}
                farmMsg={farmMsg}
                verifyingFarmId={verifyingFarmId}
                farmStatusFilter={farmStatusFilter}
                setFarmStatusFilter={setFarmStatusFilter}
                handleVerifyFarm={handleVerifyFarm}
                isOfficerOrAdmin={isOfficerOrAdmin}
                isFarmerGroupAdmin={isFarmerGroupAdmin}
                isFarmerOnly={isFarmerOnly}
                farmForm={farmForm}
                setFarmForm={setFarmForm}
                handleCreateQuickFarmerAndFarm={handleCreateQuickFarmerAndFarm}
                fetchFarmingData={fetchFarmingData}
              />
            ) : (
              <AccessRestrictedNotice
                workspaceTitle="Peta Lahan Kebun & Kelompok Tani"
                roleTitle="Petani Rempah Pala, Ketua Poktan, atau Petugas Desa"
                currentRole={currentRoleTitle}
                onBackToDashboard={() => setActiveTab('dashboard')}
                onOpenQuickSwitch={() => setShowQuickLoginModal(true)}
              />
            )
          )}

          {/* TAB 4: PANEN & MUTU REMPAH (TRACEABILITY) */}
          {activeTab === 'traceability' && (
            (isOfficerOrAdmin || isFarmerGroupAdmin || isFarmer || isCoopManager) ? (
              <HarvestGradingWorkspace
                harvests={harvests}
                batches={batches}
                selectedBatch={selectedBatch}
                setSelectedBatch={setSelectedBatch}
                traceMsg={traceMsg}
                blockchainLoading={blockchainLoading}
                harvestForm={harvestForm}
                setHarvestForm={setHarvestForm}
                handleCreateHarvest={handleCreateHarvest}
                batchForm={batchForm}
                setBatchForm={setBatchForm}
                handleCreateBatch={handleCreateBatch}
                eventForm={eventForm}
                setEventForm={setEventForm}
                handleAppendEvent={handleAppendEvent}
                handleAnchorBlockchain={handleAnchorBlockchain}
                handleVerifyBlockchain={handleVerifyBlockchain}
                handlePublicVerify={handlePublicVerify}
                farms={farms}
                farmers={farmers}
                isOfficerOrAdmin={isOfficerOrAdmin}
                isFarmerGroupAdmin={isFarmerGroupAdmin}
                isFarmer={isFarmer}
                isFarmerOnly={isFarmerOnly}
                fetchTraceabilityData={fetchTraceabilityData}
              />
            ) : (
              <AccessRestrictedNotice
                workspaceTitle="Rantai Pasok & Mutu Rempah Pala"
                roleTitle="Petani Rempah, Ketua Poktan, Pengelola Koperasi, atau Petugas Desa"
                currentRole={currentRoleTitle}
                onBackToDashboard={() => setActiveTab('dashboard')}
                onOpenQuickSwitch={() => setShowQuickLoginModal(true)}
              />
            )
          )}

          {/* TAB 5: KOPERASI HATTA, BANK SAMPAH & DISPENSER AIR RO */}
          {activeTab === 'koperasi' && (
            <KoperasiKasirWorkspace currentUser={currentUser} />
          )}

          {/* TAB 6: SMART TOURISM, ECO-STAY & WARISAN BUDAYA */}
          {activeTab === 'tourism' && (
            <TourismEcoStayWorkspace
              currentUser={currentUser}
              onNavigate={(tab, param) => handleNavigateWithSlug(tab, param)}
              onOpenQuickLogin={() => setShowQuickLoginModal(true)}
            />
          )}

          {/* TAB 7: PETA SPASIAL INTERAKTIF 7-LAYER */}
          {activeTab === 'gis' && (
            <InteractiveMapWorkspace currentUser={currentUser} />
          )}

          {/* TAB 8: ASISTEN PERENCANA WISATA CERDAS (HANYA ADMINISTRATOR) */}
          {activeTab === 'smart_planner' && (
            isAdmin ? (
              <SmartPlannerWorkspace
                onNavigate={(tab, param) => handleNavigateWithSlug(tab as TabId, param)}
                onBackToLanding={() => setActiveTab('landing')}
              />
            ) : (
              <AccessRestrictedNotice
                workspaceTitle="Perencana Wisata Cerdas DSS"
                roleTitle="Administrator Sistem"
                currentRole={currentRoleTitle}
                onBackToDashboard={() => setActiveTab('dashboard')}
                onOpenQuickSwitch={() => setShowQuickLoginModal(true)}
              />
            )
          )}

          {/* TAB 9: PUSAT KOMANDO TELEMETRI IoT & RESILIENSI PULAU */}
          {activeTab === 'iot' && (
            (isFieldSurveyor || isOfficerOrAdmin) ? (
              <IslandTelemetryWorkspace />
            ) : (
              <AccessRestrictedNotice
                workspaceTitle="Pusat Komando Telemetri IoT & Resiliensi Pulau"
                roleTitle="Surveyor Lapangan atau Administrator Sistem"
                currentRole={currentRoleTitle}
                onBackToDashboard={() => setActiveTab('dashboard')}
                onOpenQuickSwitch={() => setShowQuickLoginModal(true)}
              />
            )
          )}

          {/* TAB 10: SURVEI LAPANGAN DINAMIS & PIPA ETL HYBRID */}
          {activeTab === 'survei' && (
            (isFieldSurveyor || isOfficerOrAdmin) ? (
              <SurveyEtlWorkspace onNavigateToMap={() => setActiveTab('gis')} />
            ) : (
              <AccessRestrictedNotice
                workspaceTitle="Formulir Survei Dinamis & Pipa ETL"
                roleTitle="Surveyor Lapangan atau Administrator Sistem"
                currentRole={currentRoleTitle}
                onBackToDashboard={() => setActiveTab('dashboard')}
                onOpenQuickSwitch={() => setShowQuickLoginModal(true)}
              />
            )
          )}

          {/* TAB 11: REKAPITULASI DESA & AUDIT TRAIL */}
          {activeTab === 'audit' && (
            isOfficerOrAdmin ? (
              <AuditTrailWorkspace isOnline={isOnline} />
            ) : (
              <AccessRestrictedNotice
                workspaceTitle="Rekapitulasi Desa & Jejak Audit Sistem"
                roleTitle="Administrator Sistem atau Petugas Kantor Desa"
                currentRole={currentRoleTitle}
                onBackToDashboard={() => setActiveTab('dashboard')}
                onOpenQuickSwitch={() => setShowQuickLoginModal(true)}
              />
            )
          )}

          {/* TAB 12: TATA KELOLA & INVENTARIS WORKSPACE MARKETPLACE (DASHBOARD ADMIN) */}
          {activeTab === 'marketplace' && (
            (isOfficerOrAdmin || isCoopManager) ? (
              <MarketplaceAdminWorkspace
                onOpenPublicCatalog={() => setShowMarketplaceModal(true)}
                onPublicVerify={(token) => handlePublicVerify(token)}
              />
            ) : (
              <AccessRestrictedNotice
                workspaceTitle="Tata Kelola & Inventaris Marketplace Rempah"
                roleTitle="Administrator Sistem atau Pengelola Koperasi Desa"
                currentRole={currentRoleTitle}
                onBackToDashboard={() => setActiveTab('dashboard')}
                onOpenQuickSwitch={() => setShowQuickLoginModal(true)}
              />
            )
          )}

          {/* TAB 13: PUSAT BANTUAN & PANDUAN SISTEM (HELP DESK WORKSPACE) */}
          {activeTab === 'help' && (
            <HelpDeskWorkspace
              currentUser={currentUser}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenLanding={() => setActiveTab('landing')}
              onOpenMarketplace={() => setShowMarketplaceModal(true)}
            />
          )}
          </React.Suspense>
          </ErrorBoundary>
        </DashboardLayout>
      )}

      {/* MODALS */}
      <React.Suspense fallback={null}>
        {verificationModal && (
          <BlockchainModal
            data={verificationModal}
            onClose={() => setVerificationModal(null)}
          />
        )}
        {showQueueModal && (
          <OfflineQueueModal
            isOpen={showQueueModal}
            queueList={queueList}
            isOnline={isOnline}
            isSyncing={isSyncing}
            onClose={() => setShowQueueModal(false)}
            onDelete={handleDeleteQueueItem}
            onClearAll={handleClearAllQueue}
            onSync={handleManualSync}
          />
        )}
        {showPublicVerifyModal && (
          <PublicVerifyModal
            data={publicVerifyData}
            initialToken={verifyInitialToken}
            onClose={() => {
              setShowPublicVerifyModal(false)
              setPublicVerifyData(null)
            }}
            onVerify={(token) => handlePublicVerify(token)}
          />
        )}
        {showMarketplaceModal && (
          <VerifiedMarketplaceModal
            isOpen={showMarketplaceModal}
            onClose={() => setShowMarketplaceModal(false)}
            onVerifyProduct={(token) => handlePublicVerify(token)}
            onNavigateToAdminWorkspace={() => setActiveTab('marketplace')}
            onNavigateToFullPage={() => {
              setShowMarketplaceModal(false)
              setActiveTab('marketplace')
            }}
          />
        )}
        {showQuickLoginModal && (
          <QuickLoginModal
            isOpen={showQuickLoginModal}
            onClose={() => setShowQuickLoginModal(false)}
            currentUser={currentUser}
            onQuickLogin={handleQuickLogin}
            onLogout={handleLogout}
          />
        )}
      </React.Suspense>
    </div>
  )
}

export default App
