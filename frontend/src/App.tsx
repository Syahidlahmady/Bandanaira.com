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
import { HeaderNav } from './components/HeaderNav.tsx'
import { LoginSection } from './components/LoginSection.tsx'
import { BlockchainModal } from './components/BlockchainModal.tsx'
import { OfflineQueueModal } from './components/OfflineQueueModal.tsx'
import { PublicVerifyModal } from './components/PublicVerifyModal.tsx'
import { ResidentsWorkspace } from './views/ResidentsWorkspace.tsx'
import { LettersWorkspace } from './views/LettersWorkspace.tsx'
import { FarmsGisWorkspace } from './views/FarmsGisWorkspace.tsx'
import { HarvestGradingWorkspace } from './views/HarvestGradingWorkspace.tsx'
import { CitizenPortalWorkspace } from './views/CitizenPortalWorkspace.tsx'
import { AuditTrailWorkspace } from './views/AuditTrailWorkspace.tsx'
import {
  MapPin,
  Users,
  QrCode,
  Mail,
  ShieldCheck,
} from 'lucide-react'
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
  const [activeTab, setActiveTab] = useState<'population' | 'letters' | 'farming' | 'traceability' | 'audit'>('population')
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
  const [verifyTokenInput, setVerifyTokenInput] = useState<string>('')
  const [traceMsg, setTraceMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [verificationModal, setVerificationModal] = useState<BlockchainVerification | null>(null)
  const [blockchainLoading, setBlockchainLoading] = useState<string | null>(null)

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

  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8005/api/v1'

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

  const isOfficerOrAdmin = Boolean(
    currentUser &&
      (currentUser.is_superuser ||
        currentUser.roles.some(
          (r) => r.name === 'admin' || r.name === 'village_officer'
        ))
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError(null)
    try {
      const response = await authService.login(username, password)
      setCurrentUser(response.user)
      if (response.user.roles.some((r) => r.name === 'farmer_group_admin')) {
        setActiveTab('farming')
      } else if (response.user.roles.some((r) => r.name === 'farmer') && !response.user.roles.some((r) => r.name === 'admin' || r.name === 'village_officer')) {
        setActiveTab('traceability')
      } else {
        setActiveTab('population')
      }
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
      if (response.user.roles.some((r) => r.name === 'farmer_group_admin')) {
        setActiveTab('farming')
      } else if (response.user.roles.some((r) => r.name === 'farmer') && !response.user.roles.some((r) => r.name === 'admin' || r.name === 'village_officer')) {
        setActiveTab('traceability')
      } else {
        setActiveTab('population')
      }
    } catch (err: unknown) {
      if (err instanceof Error) setAuthError(err.message)
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = () => {
    authService.logout()
    setCurrentUser(null)
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
    <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '1.5rem 1rem 3rem' }}>
      {/* Top Brand Navbar & Offline Status */}
      <HeaderNav
        currentUser={currentUser}
        isOnline={isOnline}
        pendingSyncCount={pendingSyncCount}
        isSyncing={isSyncing}
        onLogout={handleLogout}
        onManualSync={handleManualSync}
        onOpenQueueModal={handleOpenQueueModal}
      />

      {/* Guest Welcome & Persona Switcher if not authenticated */}
      {!currentUser && (
        <LoginSection
          username={username}
          setUsername={setUsername}
          password={password}
          setPassword={setPassword}
          onLogin={handleLogin}
          onQuickLogin={handleQuickLogin}
          onVerifySampleBatch={(token) => handlePublicVerify(token)}
          onPublicVerify={(token) => handlePublicVerify(token)}
          loading={authLoading}
          error={authError}
        />
      )}

      {/* Navigation Tabs when authenticated */}
      {/* Navigation Tabs when authenticated */}
      {currentUser && isFarmerOnly && (
        <div className="tab-nav" style={{ marginBottom: '1.75rem' }}>
          <button
            onClick={() => setActiveTab('traceability')}
            className={`tab-btn ${activeTab === 'traceability' ? 'active' : ''}`}
          >
            <QrCode size={16} /> 📦 Catatan Panen Saya
          </button>
          <button
            onClick={() => setActiveTab('farming')}
            className={`tab-btn ${activeTab === 'farming' ? 'active' : ''}`}
          >
            <MapPin size={16} /> 🗺️ Peta Kebun Saya
          </button>
        </div>
      )}

      {currentUser && isFarmerGroupAdmin && !isOfficerOrAdmin && (
        <div className="tab-nav" style={{ marginBottom: '1.75rem' }}>
          <button
            onClick={() => setActiveTab('farming')}
            className={`tab-btn ${activeTab === 'farming' ? 'active' : ''}`}
          >
            <MapPin size={16} /> 🗺️ Peta & Pengajuan Kebun
            {farms.filter((f) => f.verification_status === 'pending').length > 0 && (
              <span
                style={{
                  background: '#f59e0b',
                  color: '#ffffff',
                  borderRadius: '10px',
                  padding: '0.1rem 0.5rem',
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  marginLeft: '0.4rem',
                }}
              >
                {farms.filter((f) => f.verification_status === 'pending').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('traceability')}
            className={`tab-btn ${activeTab === 'traceability' ? 'active' : ''}`}
          >
            <QrCode size={16} /> 📦 Catatan Hasil Panen Poktan
          </button>
        </div>
      )}

      {currentUser && isOfficerOrAdmin && (
        <div className="tab-nav" style={{ marginBottom: '1.75rem' }}>
          <button
            onClick={() => setActiveTab('population')}
            className={`tab-btn ${activeTab === 'population' ? 'active' : ''}`}
          >
            <Users size={16} /> 👥 Warga & Profesi
          </button>
          <button
            onClick={() => setActiveTab('letters')}
            className={`tab-btn ${activeTab === 'letters' ? 'active' : ''}`}
          >
            <Mail size={16} /> 📬 Pelayanan Surat Warga
            {adminRequests.filter((r) => r.status === 'submitted').length > 0 && (
              <span
                style={{
                  background: '#f59e0b',
                  color: '#ffffff',
                  borderRadius: '10px',
                  padding: '0.1rem 0.5rem',
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  marginLeft: '0.4rem',
                }}
              >
                {adminRequests.filter((r) => r.status === 'submitted').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('farming')}
            className={`tab-btn ${activeTab === 'farming' ? 'active' : ''}`}
          >
            <MapPin size={16} /> 🗺️ Peta Kebun & Poktan
            {farms.filter((f) => f.verification_status === 'pending').length > 0 && (
              <span
                style={{
                  background: '#f59e0b',
                  color: '#ffffff',
                  borderRadius: '10px',
                  padding: '0.1rem 0.5rem',
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  marginLeft: '0.4rem',
                }}
              >
                {farms.filter((f) => f.verification_status === 'pending').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('traceability')}
            className={`tab-btn ${activeTab === 'traceability' ? 'active' : ''}`}
          >
            <QrCode size={16} /> 📦 Panen & Mutu Rempah
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
          >
            <ShieldCheck size={16} /> 🏛️ Rekap & Audit
          </button>
        </div>
      )}


      {/* TAB 1: PANEN & MUTU REMPAH (TRACEABILITY) */}
      {(isOfficerOrAdmin || isFarmerGroupAdmin || isFarmer) && activeTab === 'traceability' && (
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

      {/* TAB 2: PETA & POKTAN (FARMING) */}
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

      {/* TAB 3: WARGA & PROFESI (POPULATION) */}
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

      {/* TAB 4: INBOX PELAYANAN SURAT WARGA */}
      {isOfficerOrAdmin && activeTab === 'letters' && (
        <LettersWorkspace
          adminRequests={adminRequests}
          requestFilterStatus={requestFilterStatus}
          setRequestFilterStatus={setRequestFilterStatus}
          updatingRequestId={updatingRequestId}
          handleUpdateRequestStatus={handleUpdateRequestStatus}
          letterActionMsg={letterActionMsg}
        />
      )}

      {/* TAB 5: REKAPITULASI DESA & AUDIT TRAIL */}
      {isOfficerOrAdmin && activeTab === 'audit' && (
        <AuditTrailWorkspace isOnline={isOnline} />
      )}

      {/* PORTAL KHUSUS WARGA DESA (RESIDENT) */}
      {isResident && (
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
      )}

      {/* Public Search Token Section for Consumers */}
      <section
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '2rem',
          border: '1px solid #e2e8f0',
        }}
      >
        <h3 style={{ fontSize: '1.15rem', color: '#1e3a8a', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          🔍 Verifikasi Mandiri Konsumen / Wisatawan (Scan QR Publik)
        </h3>
        <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.75rem' }}>
          Konsumen dapat memeriksa keaslian asal rempah Banda Neira tanpa harus mendaftar atau masuk ke sistem.
        </p>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            placeholder="Masukkan token publik QR produk (misal: dari kemasan rempah)..."
            value={verifyTokenInput}
            onChange={(e) => setVerifyTokenInput(e.target.value)}
            style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
          <button
            onClick={() => handlePublicVerify(verifyTokenInput)}
            style={{
              background: '#059669',
              color: '#ffffff',
              border: 'none',
              padding: '0.5rem 1.25rem',
              borderRadius: '6px',
              fontWeight: 'bold',
            }}
          >
            Verifikasi Produk
          </button>
        </div>
      </section>

      {/* System Status Section */}
      <section
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0',
        }}
      >
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#0f172a' }}>
          Status Infrastruktur Sistem
        </h2>
        {loadingHealth && <p style={{ color: '#64748b' }}>Memeriksa koneksi layanan backend...</p>}
        {healthError && (
          <div style={{ color: '#b91c1c', background: '#fef2f2', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' }}>
            Backend offline: {healthError}
          </div>
        )}
        {health && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.875rem', color: '#64748b' }}>API Gateway</span>
              <p style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#059669', marginTop: '0.25rem' }}>
                {health.services.api.toUpperCase()} (v{health.version})
              </p>
            </div>
            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Database Engine</span>
              <p style={{ fontSize: '1.125rem', fontWeight: 'bold', color: health.services.database === 'connected' ? '#059669' : '#d97706', marginTop: '0.25rem' }}>
                {health.services.database.toUpperCase()}
              </p>
            </div>
            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Status Global</span>
              <p style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1e40af', marginTop: '0.25rem' }}>
                {health.status.toUpperCase()}
              </p>
            </div>
          </div>
        )}
      </section>

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
    </div>
  )
}

export default App
