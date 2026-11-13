import React, { useEffect, useState } from 'react'
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
  Farmer,
  FarmerGroup,
  Farm,
  FarmStatistics,
} from './services/farmers.ts'
import {
  traceabilityService,
  Harvest,
  ProductBatch,
  PublicBatchVerification,
  BlockchainVerification,
} from './services/traceability.ts'
import { LoginSection } from './components/LoginSection.tsx'
import { RegisterSection } from './components/RegisterSection.tsx'
import { BlockchainModal } from './components/BlockchainModal.tsx'
import { OfflineQueueModal } from './components/OfflineQueueModal.tsx'
import { PublicVerifyModal } from './components/PublicVerifyModal.tsx'
import { VerifiedMarketplaceModal } from './components/VerifiedMarketplaceModal.tsx'
import { QuickLoginModal } from './components/QuickLoginModal.tsx'
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
const LandingPortalWorkspace = React.lazy(() => import('./views/LandingPortalWorkspace.tsx').then(m => ({ default: m.LandingPortalWorkspace })))
const UserEcosystemDashboard = React.lazy(() => import('./views/dashboard/UserEcosystemDashboard.tsx').then(m => ({ default: m.UserEcosystemDashboard })))
import { DashboardLayout } from './views/dashboard/DashboardLayout.tsx'
import { BandaUnifiedFooter } from './components/common/BandaUnifiedFooter.tsx'
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


export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'landing' | 'register' | 'dashboard' | 'population' | 'letters' | 'farming' | 'traceability' | 'koperasi' | 'iot' | 'tourism' | 'gis' | 'audit' | 'smart_planner' | 'survei'>('landing')
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [loadingHealth, setLoadingHealth] = useState<boolean>(true)
  const [healthError, setHealthError] = useState<string | null>(null)

  // Offline PWA & Sync states
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true)
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0)
  const [isSyncing, setIsSyncing] = useState<boolean>(false)
  const [showQueueModal, setShowQueueModal] = useState<boolean>(false)
  const [queueList, setQueueList] = useState<SyncQueueItem[]>([])

  // Auth states
  const [currentUser, setCurrentUser] = useState<User | null>(null)
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
  const [farmForm, setFarmForm] = useState({
    farmer_id: '',
    farm_code: 'BN-FARM-001',
    name: 'Kebun Pala Lonthoir',
    location_description: 'Desa Lonthoir, Banda Besar',
    latitude: -4.5312,
    longitude: 129.8974,
    area_sqm: 6500,
    primary_commodity: 'Pala',
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
      const [groups, farmerList, farmList, geo, fStats] = await Promise.all([
        farmerService.listGroups(),
        farmerService.listFarmers(),
        farmerService.listFarms(),
        farmerService.getFarmsGeoJSON(),
        farmerService.getStatistics(),
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
  const isHomestayOperator = Boolean(
    currentUser && currentUser.roles.some((r) => r.name === 'homestay_operator')
  )
  const isSmartTourismAdmin = Boolean(
    currentUser && currentUser.roles.some((r) => r.name === 'smart_tourism_admin')
  )
  const isFieldSurveyor = Boolean(
    currentUser && currentUser.roles.some((r) => r.name === 'field_surveyor')
  )
  const isFarmerGroupAdmin = Boolean(
    currentUser && currentUser.roles.some((r) => r.name === 'farmer_group_admin')
  )
  const isFarmer = Boolean(currentUser && currentUser.roles.some((r) => r.name === 'farmer'))
  const isResident = Boolean(currentUser && currentUser.roles.some((r) => r.name === 'resident'))
  const isFarmerOnly = Boolean(isFarmer && !isOfficerOrAdmin && !isFarmerGroupAdmin)

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
        .catch(() => authService.clearTokens())
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
    if (currentUser) {
      if (isOfficerOrAdmin) {
        fetchPopulationData()
        fetchFarmingData()
        fetchTraceabilityData()
      } else if (isFarmerGroupAdmin || isFarmer) {
        fetchFarmingData()
        fetchTraceabilityData()
      }
    }
  }, [currentUser, isOfficerOrAdmin, isFarmerGroupAdmin, isFarmer])

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
      setActiveTab(getRoleDefaultTab(response.user))
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
      setActiveTab(getRoleDefaultTab(response.user))
    } catch (err: unknown) {
      if (err instanceof Error) setAuthError(err.message)
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = () => {
    authService.logout()
    setCurrentUser(null)
    setActiveTab('landing')
    setResidents([])
    setFarmers([])
    setFarms([])
    setHarvests([])
    setBatches([])
    setSelectedBatch(null)
  }

  const handleManualSync = async () => {
    setIsSyncing(true)
    try {
      const res = await syncManager.processSync()
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

    if (!navigator.onLine) {
      await syncManager.enqueue(
        'resident_create',
        `${apiBase}/population/residents`,
        'POST',
        popForm as unknown as Record<string, unknown>,
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
      await populationService.createResident(popForm)
      setPopMsg({ type: 'success', text: `Penduduk ${popForm.full_name} berhasil didaftarkan!` })
      const nextNik = (BigInt(popForm.nik) + 1n).toString()
      setPopForm({ ...popForm, nik: nextNik, full_name: '' })
      fetchPopulationData()
    } catch (err: unknown) {
      if (err instanceof TypeError || (err instanceof Error && err.message.toLowerCase().includes('fetch'))) {
        await syncManager.enqueue(
          'resident_create',
          `${apiBase}/population/residents`,
          'POST',
          popForm as unknown as Record<string, unknown>,
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

    if (!navigator.onLine) {
      await syncManager.enqueue(
        'farm_create',
        `${apiBase}/farmers/farms`,
        'POST',
        { ...farmForm, farmer_id: farmForm.farmer_id || (farmers[0]?.id || '') },
        `Pemetaan Lahan: ${farmForm.name} (${farmForm.farm_code})`
      )
      const optimisticFarm: Farm = {
        id: `offline-${Date.now()}`,
        farmer_id: farmForm.farmer_id || (farmers[0]?.id || ''),
        farm_code: farmForm.farm_code,
        name: farmForm.name,
        location_description: farmForm.location_description,
        latitude: farmForm.latitude,
        longitude: farmForm.longitude,
        area_sqm: farmForm.area_sqm,
        primary_commodity: farmForm.primary_commodity,
        verification_status: isOfficerOrAdmin ? 'verified' : 'pending',
        created_at: new Date().toISOString(),
      }
      setFarms((prev) => [optimisticFarm, ...prev])
      const offText = isOfficerOrAdmin
        ? `📦 Mode Offline: Kebun ${farmForm.name} disimpan ke antrean lokal!`
        : `📦 Mode Offline: Pengajuan kebun ${farmForm.name} disimpan ke antrean lokal (Menunggu Persetujuan Desa saat online).`
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
          const newGrp = await farmerService.createGroup({ name: 'Kelompok Tani Pala Banda Neira' })
          groupId = newGrp.id
        }
        const newFrm = await farmerService.createFarmer({
          farmer_code: `BN-FRM-00${farmers.length + 1}`,
          name: 'Ibrahim Lonthoir',
          phone: '081233445566',
          farmer_group_id: groupId,
        })
        targetFarmerId = newFrm.id
      }

      await farmerService.createFarm({ ...farmForm, farmer_id: targetFarmerId })
      const successText = isOfficerOrAdmin
        ? `Kebun ${farmForm.name} berhasil dipetakan dan disahkan!`
        : `Pengajuan plot kebun "${farmForm.name}" berhasil dikirim! Menunggu persetujuan verifikasi dari Petugas Kantor Desa.`
      setFarmMsg({ type: 'success', text: successText })
      setFarmForm((prev) => ({
        ...prev,
        farm_code: `BN-FARM-00${farms.length + 2}`,
        name: '',
      }))
      fetchFarmingData()
    } catch (err: unknown) {
      if (err instanceof TypeError || (err instanceof Error && err.message.toLowerCase().includes('fetch'))) {
        await syncManager.enqueue(
          'farm_create',
          `${apiBase}/farmers/farms`,
          'POST',
          { ...farmForm, farmer_id: farmForm.farmer_id || (farmers[0]?.id || '') },
          `Pemetaan Lahan: ${farmForm.name} (${farmForm.farm_code})`
        )
        setFarmMsg({
          type: 'success',
          text: `📦 Jaringan terputus: Data kebun ${farmForm.name} diamankan ke antrean offline lokal!`,
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

  const handlePublicVerify = async (token: string) => {
    try {
      const res = await traceabilityService.verifyPublic(token)
      setPublicVerifyData(res)
    } catch (err: unknown) {
      if (err instanceof Error) alert(err.message)
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
        overflowX: 'hidden',
      }}
    >
      {/* 1. LANDING PORTAL UTAMA (SATU PINTU UTAMA EKOSISTEM - HANYA 1 LANDING PAGE) */}
      {(!currentUser || activeTab === 'landing') && activeTab !== 'register' && activeTab !== 'population' && (
        <LandingPortalWorkspace
          onNavigate={(tab) =>
            setActiveTab(
              tab === 'population' && currentUser ? getRoleDefaultTab(currentUser) : tab
            )
          }
          onOpenLogin={() => setActiveTab('population')}
          onOpenRegister={() => setActiveTab('register')}
          onOpenMarketplace={() => setShowMarketplaceModal(true)}
          onPublicVerify={(token) => handlePublicVerify(token)}
          currentUser={currentUser}
          isOnline={isOnline}
          onLogout={handleLogout}
          onOpenQuickLogin={() => setShowQuickLoginModal(true)}
        />
      )}

      {/* 1B. REGISTER DESKTOP SPLIT-SCREEN PAGE (Sesuai desainsaatini/register-dekstop) */}
      {activeTab === 'register' && (
        <RegisterSection
          onBackToHome={() => setActiveTab('landing')}
          onSwitchToLogin={() => setActiveTab('population')}
          onQuickLogin={handleQuickLogin}
          onNavigate={(tab) => setActiveTab(tab)}
        />
      )}

      {/* 2. Login Portal Section for Non-authenticated Users (Sesuai desainsaatini/login-desktop) */}
      {!currentUser && activeTab === 'population' && (
        <LoginSection
          username={username}
          setUsername={setUsername}
          password={password}
          setPassword={setPassword}
          onLogin={handleLogin}
          onQuickLogin={handleQuickLogin}
          onBackToHome={() => setActiveTab('landing')}
          onOpenRegister={() => setActiveTab('register')}
          onVerifySampleBatch={(token) => handlePublicVerify(token)}
          onPublicVerify={(token) => handlePublicVerify(token)}
          onOpenMarketplace={() => setShowMarketplaceModal(true)}
          onOpenPlanner={() => setActiveTab('smart_planner')}
          onOpenKoperasi={() => setActiveTab('koperasi')}
          onOpenTelemetry={() => setActiveTab('iot')}
          onOpenTourism={() => setActiveTab('tourism')}
          onOpenGIS={() => setActiveTab('gis')}
          onOpenSurvei={() => setActiveTab('survei')}
          loading={authLoading}
          error={authError}
        />
      )}




      {/* =====================================================================
          4. DASBOR EKOSISTEM DENGAN SIDEBAR NAVIGASI DI SAMPING (UNTUK USER LOGIN)
             Semua Ruang Kerja Operasional Terintegrasi di Dalam Dasbor Sesuai Hak Akses Role
      ====================================================================== */}
      {currentUser && activeTab !== 'landing' && activeTab !== 'register' && (
        <DashboardLayout
          currentUser={currentUser}
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
          onOpenLanding={() => setActiveTab('landing')}
          onOpenMarketplace={() => setShowMarketplaceModal(true)}
          onPublicVerify={(token) => handlePublicVerify(token || '')}
          onOpenQueueModal={handleOpenQueueModal}
          onOpenQuickSwitch={() => setShowQuickLoginModal(true)}
          onLogout={handleLogout}
          isOnline={isOnline}
          pendingSyncCount={pendingSyncCount}
          isSyncing={isSyncing}
          adminPendingLettersCount={adminRequests.filter((r) => r.status === 'submitted').length}
          pendingFarmsCount={farms.filter((f) => f.verification_status === 'pending').length}
        >
          <React.Suspense fallback={<div className="p-8 text-center text-slate-500 font-medium">Memuat antarmuka...</div>}>
          {/* TAB 0: RINGKASAN DASBOR (OVERVIEW BENTO GRID 21st.dev DENGAN WARNA BERANDA) */}
          {activeTab === 'dashboard' && (
            <UserEcosystemDashboard
              currentUser={currentUser}
              onNavigate={(tab) => setActiveTab(tab as any)}
              onOpenMarketplace={() => setShowMarketplaceModal(true)}
              onPublicVerify={(token) => handlePublicVerify(token)}
              onLogout={handleLogout}
              isOnline={isOnline}
            />
          )}

          {/* TAB 1: WARGA & PROFESI (POPULATION) */}
          {isOfficerOrAdmin && activeTab === 'population' && (
            <ResidentsWorkspace
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
            />
          )}

          {/* TAB 2: PELAYANAN SURAT WARGA (LETTERS) */}
          {(isResident || isOfficerOrAdmin) && activeTab === 'letters' && (
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
          {(isOfficerOrAdmin || isFarmerGroupAdmin || isFarmer) && activeTab === 'farming' && (
            <FarmsGisWorkspace
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
          )}

          {/* TAB 4: PANEN & MUTU REMPAH (TRACEABILITY) */}
          {(isOfficerOrAdmin || isFarmerGroupAdmin || isFarmer || isCoopManager) && activeTab === 'traceability' && (
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
          )}

          {/* TAB 5: KOPERASI HATTA, BANK SAMPAH & DISPENSER AIR RO */}
          {(isCoopManager || isOfficerOrAdmin) && activeTab === 'koperasi' && (
            <KoperasiKasirWorkspace />
          )}

          {/* TAB 6: SMART TOURISM, ECO-STAY & WARISAN BUDAYA */}
          {(isHomestayOperator || isSmartTourismAdmin || isOfficerOrAdmin) && activeTab === 'tourism' && (
            <TourismEcoStayWorkspace currentUser={currentUser} />
          )}

          {/* TAB 7: PETA SPASIAL INTERAKTIF 7-LAYER */}
          {(isFieldSurveyor || isSmartTourismAdmin || isHomestayOperator || isOfficerOrAdmin) && activeTab === 'gis' && (
            <InteractiveMapWorkspace currentUser={currentUser} />
          )}

          {/* TAB 8: PERENCANA CERDAS SAW (DSS) */}
          {(isSmartTourismAdmin || isHomestayOperator || isFieldSurveyor || isOfficerOrAdmin) && activeTab === 'smart_planner' && (
            <SmartPlannerWorkspace />
          )}

          {/* TAB 9: PUSAT KOMANDO TELEMETRI IoT & RESILIENSI PULAU */}
          {(isFieldSurveyor || isCoopManager || isOfficerOrAdmin) && activeTab === 'iot' && (
            <IslandTelemetryWorkspace />
          )}

          {/* TAB 10: SURVEI LAPANGAN DINAMIS & PIPA ETL HYBRID */}
          {(isFieldSurveyor || isOfficerOrAdmin) && activeTab === 'survei' && (
            <SurveyEtlWorkspace onNavigateToMap={() => setActiveTab('gis')} />
          )}

          {/* TAB 11: REKAPITULASI DESA & AUDIT TRAIL */}
          {isOfficerOrAdmin && activeTab === 'audit' && (
            <AuditTrailWorkspace isOnline={isOnline} />
          )}

          {/* System Telemetry Section (Khusus untuk Administrator Sistem) */}
          {isAdmin && (
            <section
              className="app-card animate-fade-in"
              style={{
                marginTop: '2rem',
                border: '1px solid rgba(244, 183, 94, 0.2)',
                padding: '1.5rem',
                borderRadius: '1rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h2 className="font-serif" style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: '#081D35' }}>
                    Telemetri Infrastruktur Kepulauan
                  </h2>
                  <p style={{ fontSize: '0.825rem', color: '#64748B', margin: '0.25rem 0 0' }}>
                    Ketersediaan backend API, mesin geospasial PostGIS, dan persistensi database terdistribusi.
                  </p>
                </div>
                <span className="badge badge-emerald">
                  ● SISTEM OPERASIONAL LENGKAP
                </span>
              </div>

              {loadingHealth && <p style={{ color: '#64748B', fontSize: '0.875rem' }}>Memeriksa koneksi layanan backend...</p>}
              {healthError && (
                <div style={{ color: '#fca5a5', background: 'rgba(239, 68, 68, 0.15)', padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', border: '1px solid rgba(239, 68, 68, 0.35)', fontSize: '0.875rem', fontWeight: 600 }}>
                  ⚠️ Backend offline: {healthError}
                </div>
              )}
              {health && (
                <div className="stat-grid">
                  <div className="stat-card" style={{ borderLeft: '4px solid #f4b75e' }}>
                    <span className="stat-label">API Gateway</span>
                    <div className="stat-value" style={{ color: '#f4b75e', fontSize: '1.25rem' }}>
                      {health.services.api.toUpperCase()}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#64748B', fontFamily: 'var(--font-mono)' }}>Versi: v{health.version}</span>
                  </div>
                  <div className="stat-card" style={{ borderLeft: `4px solid ${health.services.database === 'connected' ? '#10b981' : '#f59e0b'}` }}>
                    <span className="stat-label">Database Engine</span>
                    <div className="stat-value" style={{ color: health.services.database === 'connected' ? '#34d399' : '#fbbf24', fontSize: '1.25rem' }}>
                      {health.services.database.toUpperCase()}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>PostgreSQL 15 &amp; PostGIS 3</span>
                  </div>
                  <div className="stat-card" style={{ borderLeft: '4px solid #38bdf8' }}>
                    <span className="stat-label">Status Global</span>
                    <div className="stat-value" style={{ color: '#38bdf8', fontSize: '1.25rem' }}>
                      {health.status.toUpperCase()}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>bandanaira.com Operational</span>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* UNIFIED ECOSYSTEM FOOTER DI BAGIAN BAWAH KONTEN DASBOR */}
          <div style={{ marginTop: '4rem', marginLeft: '-1rem', marginRight: '-1rem', marginBottom: '-1rem' }}>
            <BandaUnifiedFooter />
          </div>
          </React.Suspense>
        </DashboardLayout>
      )}

      {/* MODALS */}
      <BlockchainModal
        data={verificationModal}
        onClose={() => setVerificationModal(null)}
      />
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
      <PublicVerifyModal
        data={publicVerifyData}
        onClose={() => setPublicVerifyData(null)}
      />
      <VerifiedMarketplaceModal
        isOpen={showMarketplaceModal}
        onClose={() => setShowMarketplaceModal(false)}
        onVerifyProduct={(token) => handlePublicVerify(token)}
      />
      <QuickLoginModal
        isOpen={showQuickLoginModal}
        onClose={() => setShowQuickLoginModal(false)}
        currentUser={currentUser}
        onQuickLogin={handleQuickLogin}
        onLogout={handleLogout}
      />
    </div>
  )
}

export default App
