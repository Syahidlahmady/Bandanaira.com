import React, { useEffect, useState } from 'react'
import { authService, User } from './services/auth.ts'
import {
  populationService,
  PopulationStatistics,
  Resident,
  ResidentCreateInput,
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
import { FarmMap } from './components/FarmMap.tsx'

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
  const [activeTab, setActiveTab] = useState<'farming' | 'population' | 'traceability'>('traceability')
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [loadingHealth, setLoadingHealth] = useState<boolean>(true)
  const [healthError, setHealthError] = useState<string | null>(null)

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
  const [popMsg, setPopMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Farming states
  const [farmers, setFarmers] = useState<Farmer[]>([])
  const [farmerGroups, setFarmerGroups] = useState<FarmerGroup[]>([])
  const [farms, setFarms] = useState<Farm[]>([])
  const [farmGeoJSON, setFarmGeoJSON] = useState<FarmGeoJSONFeatureCollection>({ type: 'FeatureCollection', features: [] })
  const [farmStats, setFarmStats] = useState<FarmStatistics | null>(null)
  const [farmMsg, setFarmMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

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

  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8005/api/v1'

  const fetchPopulationData = () => {
    setLoadingPop(true)
    Promise.all([
      populationService.listResidents(1, 20, searchQuery),
      populationService.getStatistics(),
    ])
      .then(([resList, resStats]) => {
        setResidents(resList.items)
        setPopStats(resStats)
        setLoadingPop(false)
      })
      .catch((err: Error) => {
        setPopMsg({ type: 'error', text: err.message })
        setLoadingPop(false)
      })
  }

  const fetchFarmingData = () => {
    Promise.all([
      farmerService.listGroups(),
      farmerService.listFarmers(),
      farmerService.listFarms(),
      farmerService.getFarmsGeoJSON(),
      farmerService.getStatistics(),
    ])
      .then(([groups, farmerList, farmList, geo, fStats]) => {
        setFarmerGroups(groups)
        setFarmers(farmerList.items)
        setFarms(farmList.items)
        setFarmGeoJSON(geo)
        setFarmStats(fStats)
        if (farmerList.items.length > 0) {
          setFarmForm((prev) => ({ ...prev, farmer_id: prev.farmer_id || farmerList.items[0].id }))
          setHarvestForm((prev) => ({
            ...prev,
            farmer_id: prev.farmer_id || farmerList.items[0].id,
            farm_id: prev.farm_id || (farmList.items[0]?.id || ''),
          }))
        }
      })
      .catch((err: Error) => setFarmMsg({ type: 'error', text: err.message }))
  }

  const fetchTraceabilityData = () => {
    Promise.all([traceabilityService.listHarvests(), traceabilityService.listBatches()])
      .then(([hList, bList]) => {
        setHarvests(hList.items)
        setBatches(bList.items)
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
      })
      .catch((err: Error) => setTraceMsg({ type: 'error', text: err.message }))
  }

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
      fetchPopulationData()
      fetchFarmingData()
      fetchTraceabilityData()
    }
  }, [currentUser])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError(null)
    try {
      const response = await authService.login(username, password)
      setCurrentUser(response.user)
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

  const handleCreateResident = async (e: React.FormEvent) => {
    e.preventDefault()
    setPopMsg(null)
    try {
      await populationService.createResident(popForm)
      setPopMsg({ type: 'success', text: `Penduduk ${popForm.full_name} berhasil didaftarkan!` })
      const nextNik = (BigInt(popForm.nik) + 1n).toString()
      setPopForm({ ...popForm, nik: nextNik, full_name: '' })
      fetchPopulationData()
    } catch (err: unknown) {
      if (err instanceof Error) setPopMsg({ type: 'error', text: err.message })
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
      setFarmMsg({ type: 'success', text: `Kebun ${farmForm.name} berhasil dipetakan!` })
      setFarmForm((prev) => ({
        ...prev,
        farm_code: `BN-FARM-00${farms.length + 2}`,
        name: '',
      }))
      fetchFarmingData()
    } catch (err: unknown) {
      if (err instanceof Error) setFarmMsg({ type: 'error', text: err.message })
    }
  }

  const handleCreateHarvest = async (e: React.FormEvent) => {
    e.preventDefault()
    setTraceMsg(null)
    try {
      await traceabilityService.createHarvest(harvestForm)
      setTraceMsg({ type: 'success', text: `Hasil panen ${harvestForm.harvest_code} berhasil dicatat!` })
      setHarvestForm((prev) => ({
        ...prev,
        harvest_code: `BN-HRV-2026-00${harvests.length + 2}`,
      }))
      fetchTraceabilityData()
    } catch (err: unknown) {
      if (err instanceof Error) setTraceMsg({ type: 'error', text: err.message })
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
    try {
      await traceabilityService.appendEvent(selectedBatch.id, eventForm)
      setTraceMsg({ type: 'success', text: `Peristiwa rantai pasok (${eventForm.event_type}) berhasil dicatat!` })
      fetchTraceabilityData()
    } catch (err: unknown) {
      if (err instanceof Error) setTraceMsg({ type: 'error', text: err.message })
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

  const isOfficerOrAdmin =
    currentUser &&
    (currentUser.is_superuser ||
      currentUser.roles.some(
        (r) => r.name === 'admin' || r.name === 'village_officer' || r.name === 'farmer_group_admin'
      ))

  return (
    <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '2rem 1rem' }}>
      <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.25rem', color: '#1e3a8a', fontWeight: '800' }}>
          Banda Digital Ecosystem
        </h1>
        <p style={{ color: '#475569', marginTop: '0.5rem', fontSize: '1.1rem' }}>
          Platform Terpadu Kependudukan, Pemetaan Petani & Traceability Rempah Banda Neira
        </p>
      </header>

      {/* User Session Bar */}
      <section
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '1.25rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '2rem',
          border: '1px solid #e2e8f0',
        }}
      >
        {currentUser ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <p style={{ fontSize: '1.05rem', fontWeight: 'bold', color: '#1e3a8a' }}>
                {currentUser.full_name} (@{currentUser.username})
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                {currentUser.roles.map((r) => (
                  <span
                    key={r.id}
                    style={{
                      background: '#dbeafe',
                      color: '#1e40af',
                      padding: '0.15rem 0.55rem',
                      borderRadius: '9999px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                    }}
                  >
                    {r.name}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                background: '#ef4444',
                color: '#ffffff',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                fontWeight: '600',
              }}
            >
              Keluar (Logout)
            </button>
          </div>
        ) : (
          <div>
            <h2 style={{ fontSize: '1.15rem', marginBottom: '0.75rem', color: '#0f172a' }}>
              Masuk ke Sistem Administrasi
            </h2>
            <form onSubmit={handleLogin} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', marginBottom: '0.2rem' }}>
                  Username / Email
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  style={{ padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', marginBottom: '0.2rem' }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <button
                type="submit"
                disabled={authLoading}
                style={{
                  background: '#1e40af',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.5rem 1.25rem',
                  borderRadius: '6px',
                  fontWeight: '600',
                  height: '35px',
                }}
              >
                {authLoading ? 'Memproses...' : 'Masuk (Login)'}
              </button>
            </form>
            {authError && (
              <p style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: '0.5rem' }}>{authError}</p>
            )}
          </div>
        )}
      </section>

      {/* Navigation Tabs */}
      {isOfficerOrAdmin && (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('traceability')}
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '700',
              fontSize: '0.95rem',
              background: activeTab === 'traceability' ? '#7c3aed' : '#e2e8f0',
              color: activeTab === 'traceability' ? '#ffffff' : '#475569',
            }}
          >
            📦 Ketertelusuran & Verifikasi QR (Phase 5)
          </button>
          <button
            onClick={() => setActiveTab('farming')}
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '700',
              fontSize: '0.95rem',
              background: activeTab === 'farming' ? '#059669' : '#e2e8f0',
              color: activeTab === 'farming' ? '#ffffff' : '#475569',
            }}
          >
            🗺️ Pemetaan Petani & Kebun (Phase 4)
          </button>
          <button
            onClick={() => setActiveTab('population')}
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '700',
              fontSize: '0.95rem',
              background: activeTab === 'population' ? '#1e40af' : '#e2e8f0',
              color: activeTab === 'population' ? '#ffffff' : '#475569',
            }}
          >
            👥 Administrasi Kependudukan (Phase 3)
          </button>
        </div>
      )}

      {/* TAB: TRACEABILITY & QR VERIFICATION */}
      {isOfficerOrAdmin && activeTab === 'traceability' && (
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', color: '#6d28d9', fontWeight: 'bold' }}>
                Ketertelusuran Rantai Pasok Rempah & QR Code
              </h2>
              <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                Pencatatan hasil panen, pembuatan batch, audit trail berantai hash SHA-256, dan verifikasi QR publik.
              </p>
            </div>
            <button
              onClick={fetchTraceabilityData}
              style={{
                background: '#f1f5f9',
                color: '#334155',
                border: '1px solid #cbd5e1',
                padding: '0.4rem 0.8rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: '600',
              }}
            >
              Segarkan Data
            </button>
          </div>

          {traceMsg && (
            <div
              style={{
                marginBottom: '1rem',
                padding: '0.65rem',
                borderRadius: '6px',
                fontSize: '0.875rem',
                background: traceMsg.type === 'success' ? '#ecfdf5' : '#fef2f2',
                color: traceMsg.type === 'success' ? '#065f46' : '#991b1b',
                border: `1px solid ${traceMsg.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
              }}
            >
              {traceMsg.text}
            </div>
          )}

          {/* Grid: 1. Input Panen & 2. Buat Batch */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {/* Form Catat Panen */}
            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '1.05rem', color: '#0f172a', marginBottom: '0.75rem', fontWeight: '700' }}>
                1. Catat Hasil Panen Petani
              </h3>
              <form onSubmit={handleCreateHarvest} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>Kebun & Petani</label>
                  <select
                    value={harvestForm.farm_id}
                    onChange={(e) => {
                      const f = farms.find((farm) => farm.id === e.target.value)
                      setHarvestForm({
                        ...harvestForm,
                        farm_id: e.target.value,
                        farmer_id: f?.farmer_id || harvestForm.farmer_id,
                      })
                    }}
                    required
                    style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="">-- Pilih Kebun --</option>
                    {farms.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.primary_commodity})
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>Kode Panen</label>
                    <input
                      type="text"
                      value={harvestForm.harvest_code}
                      onChange={(e) => setHarvestForm({ ...harvestForm, harvest_code: e.target.value })}
                      required
                      style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>Jumlah (kg)</label>
                    <input
                      type="number"
                      value={harvestForm.quantity_kg}
                      onChange={(e) => setHarvestForm({ ...harvestForm, quantity_kg: Number(e.target.value) })}
                      required
                      style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  style={{
                    background: '#047857',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    fontWeight: '600',
                    marginTop: '0.5rem',
                  }}
                >
                  Simpan Catatan Panen
                </button>
              </form>
            </div>

            {/* Form Buat Batch Produk */}
            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '1.05rem', color: '#0f172a', marginBottom: '0.75rem', fontWeight: '700' }}>
                2. Buat Batch Produk & QR Code
              </h3>
              <form onSubmit={handleCreateBatch} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>Asal Catatan Panen</label>
                  <select
                    value={batchForm.harvest_id}
                    onChange={(e) => {
                      const h = harvests.find((item) => item.id === e.target.value)
                      setBatchForm({
                        ...batchForm,
                        harvest_id: e.target.value,
                        allocated_qty: h?.quantity_kg || batchForm.allocated_qty,
                        commodity: h?.commodity || batchForm.commodity,
                      })
                    }}
                    required
                    style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="">-- Pilih Panen Terdaftar --</option>
                    {harvests.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.harvest_code} - {h.commodity} ({h.quantity_kg} kg)
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>Kode Batch</label>
                    <input
                      type="text"
                      value={batchForm.batch_code}
                      onChange={(e) => setBatchForm({ ...batchForm, batch_code: e.target.value })}
                      required
                      style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>Alokasi (kg)</label>
                    <input
                      type="number"
                      value={batchForm.allocated_qty}
                      onChange={(e) => setBatchForm({ ...batchForm, allocated_qty: Number(e.target.value) })}
                      required
                      style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  style={{
                    background: '#6d28d9',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    fontWeight: '600',
                    marginTop: '0.5rem',
                  }}
                >
                  Generate Batch & QR Token
                </button>
              </form>
            </div>
          </div>

          {/* Active Batches & Event Lifecycle Append */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#0f172a', marginBottom: '0.75rem', fontWeight: '700' }}>
              Daftar Batch & Riwayat Audit Kriptografis (SHA-256)
            </h3>
            {batches.map((b) => (
              <div
                key={b.id}
                style={{
                  border: selectedBatch?.id === b.id ? '2px solid #7c3aed' : '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '1.25rem',
                  marginBottom: '1rem',
                  background: '#ffffff',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Nomor Batch:</span>
                    <h4 style={{ fontSize: '1.2rem', color: '#1e3a8a', fontWeight: 'bold' }}>
                      {b.batch_code} ({b.commodity} - {b.total_quantity_kg} kg)
                    </h4>
                    <span
                      style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        background: '#dbeafe',
                        color: '#1e40af',
                        display: 'inline-block',
                        marginTop: '0.25rem',
                      }}
                    >
                      STATUS: {b.status.toUpperCase()}
                    </span>
                    <span
                      style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        marginLeft: '0.4rem',
                        background:
                          b.blockchain_status === 'confirmed'
                            ? '#d1fae5'
                            : b.blockchain_status === 'submitted'
                            ? '#dbeafe'
                            : b.blockchain_status === 'failed'
                            ? '#fee2e2'
                            : '#fef3c7',
                        color:
                          b.blockchain_status === 'confirmed'
                            ? '#065f46'
                            : b.blockchain_status === 'submitted'
                            ? '#1e40af'
                            : b.blockchain_status === 'failed'
                            ? '#991b1b'
                            : '#92400e',
                        display: 'inline-block',
                        marginTop: '0.25rem',
                      }}
                    >
                      ⛓️ BLOCKCHAIN: {b.blockchain_status.toUpperCase()}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    {b.qr_code_base64 && (
                      <img
                        src={b.qr_code_base64}
                        alt="QR Code"
                        style={{ width: '70px', height: '70px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      />
                    )}
                    <button
                      onClick={() => handleAnchorBlockchain(b.id)}
                      disabled={blockchainLoading === b.id}
                      style={{
                        background: '#4f46e5',
                        color: '#ffffff',
                        border: 'none',
                        padding: '0.45rem 0.8rem',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        cursor: blockchainLoading === b.id ? 'not-allowed' : 'pointer',
                        opacity: blockchainLoading === b.id ? 0.7 : 1,
                      }}
                    >
                      {blockchainLoading === b.id ? 'Menjangkar...' : '⛓️ Jangkar EVM'}
                    </button>
                    <button
                      onClick={() => handleVerifyBlockchain(b.id)}
                      style={{
                        background: '#0284c7',
                        color: '#ffffff',
                        border: 'none',
                        padding: '0.45rem 0.8rem',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                    >
                      🔍 Verifikasi On-Chain
                    </button>
                    <button
                      onClick={() => handlePublicVerify(b.public_verification_token)}
                      style={{
                        background: '#059669',
                        color: '#ffffff',
                        border: 'none',
                        padding: '0.45rem 0.8rem',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                    >
                      QR Publik ↗
                    </button>
                  </div>
                </div>

                {/* Event Chain Timeline */}
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '0.5rem' }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '0.5rem' }}>
                    Rantai Hash Integritas Peristiwa ({b.events.length} Peristiwa):
                  </p>
                  {b.events.map((ev, idx) => (
                    <div
                      key={ev.id}
                      style={{
                        padding: '0.5rem 0',
                        borderBottom: idx < b.events.length - 1 ? '1px dashed #cbd5e1' : 'none',
                        fontSize: '0.8rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#1e40af', fontWeight: '600' }}>
                        <span>● {ev.event_type.toUpperCase()} ({ev.location})</span>
                        <span style={{ color: '#64748b', fontWeight: 'normal' }}>
                          {new Date(ev.event_timestamp).toLocaleString('id-ID')}
                        </span>
                      </div>
                      <p style={{ color: '#475569', marginTop: '0.1rem' }}>{ev.description || '-'}</p>
                      <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#6d28d9', marginTop: '0.2rem' }}>
                        Hash SHA-256: {ev.event_hash}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Append Event */}
                <form
                  onSubmit={(e) => {
                    setSelectedBatch(b)
                    handleAppendEvent(e)
                  }}
                  style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}
                >
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>Tambah Tahapan</label>
                    <select
                      value={eventForm.event_type}
                      onChange={(e) => setEventForm({ ...eventForm, event_type: e.target.value })}
                      style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    >
                      <option value="drying">Pengeringan (Drying)</option>
                      <option value="sorting">Sortasi Mutu (Sorting)</option>
                      <option value="packaging">Pengemasan (Packaging)</option>
                      <option value="transfer">Distribusi (Transfer)</option>
                    </select>
                  </div>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>Catatan / Lokasi</label>
                    <input
                      type="text"
                      placeholder="Mis. Pengeringan solar dryer Lonthoir"
                      value={eventForm.description}
                      onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                      required
                      style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <button
                    type="submit"
                    style={{
                      background: '#4338ca',
                      color: '#ffffff',
                      border: 'none',
                      padding: '0.45rem 1rem',
                      borderRadius: '6px',
                      fontWeight: '600',
                      fontSize: '0.85rem',
                    }}
                  >
                    + Catat & Rantai Hash
                  </button>
                </form>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* PUBLIC VERIFICATION MODAL / VIEW (OPEN TO ALL CONSUMERS) */}
      {publicVerifyData && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '650px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ background: '#dcfce7', color: '#15803d', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                  ✓ VERIFIKASI REMPAH ASLI BANDA NEIRA
                </span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e3a8a', marginTop: '0.5rem' }}>
                  {publicVerifyData.commodity}
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                  Nomor Batch: <b>{publicVerifyData.batch_code}</b>
                </p>
              </div>
              <button
                onClick={() => setPublicVerifyData(null)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', alignItems: 'center', background: '#f8fafc', padding: '1rem', borderRadius: '10px' }}>
              <img
                src={publicVerifyData.qr_code_base64}
                alt="QR Code"
                style={{ width: '110px', height: '110px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
              <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                <p><b>Asal Desa:</b> {publicVerifyData.origin_village}</p>
                <p><b>Perkebunan Asal:</b> {publicVerifyData.origin_farms.join(', ')}</p>
                <p><b>Tanggal Produksi:</b> {publicVerifyData.production_date}</p>
                <p><b>Kuantitas Batch:</b> {publicVerifyData.total_quantity_kg} kg</p>
                <p><b>Integritas Hash:</b> <span style={{ color: '#059669', fontWeight: 'bold' }}>TERVERIFIKASI ASLI</span></p>
              </div>
            </div>

            <h4 style={{ fontSize: '1.05rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '0.75rem' }}>
              Riwayat Perjalanan Produk (Traceability Timeline)
            </h4>
            <div style={{ borderLeft: '2px solid #7c3aed', paddingLeft: '1rem', marginLeft: '0.5rem' }}>
              {publicVerifyData.timeline.map((item, idx) => (
                <div key={idx} style={{ marginBottom: '1rem', position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: '-1.45rem',
                      top: '0.2rem',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: '#7c3aed',
                    }}
                  />
                  <b style={{ color: '#1e3a8a', textTransform: 'capitalize' }}>{item.event_type}</b>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: '0.5rem' }}>
                    ({item.location || 'Banda Neira'}) - {new Date(item.event_timestamp).toLocaleDateString('id-ID')}
                  </span>
                  <p style={{ fontSize: '0.875rem', color: '#475569', marginTop: '0.2rem' }}>
                    {item.description}
                  </p>
                  <p style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#6d28d9' }}>
                    Hash: {item.event_hash}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setPublicVerifyData(null)}
              style={{
                width: '100%',
                background: '#1e40af',
                color: '#ffffff',
                border: 'none',
                padding: '0.75rem',
                borderRadius: '8px',
                fontWeight: 'bold',
                marginTop: '1rem',
              }}
            >
              Tutup Jendela Verifikasi
            </button>
          </div>
        </div>
      )}

      {/* BLOCKCHAIN ON-CHAIN CRYPTOGRAPHIC VERIFICATION MODAL */}
      {verificationModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 10000,
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #e2e8f0',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <span
                  style={{
                    background: verificationModal.is_verified ? '#dcfce7' : '#fee2e2',
                    color: verificationModal.is_verified ? '#15803d' : '#991b1b',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    display: 'inline-block',
                    marginBottom: '0.5rem',
                  }}
                >
                  {verificationModal.is_verified
                    ? '✓ VERIFIKASI INTEGRITAS BLOCKCHAIN LOLOS'
                    : '⚠️ HASH TIDAK COCOK / BELUM DIJANGKARKAN'}
                </span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1e3a8a' }}>
                  Verifikasi On-Chain Smart Contract EVM
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                  Kode Batch: <b>{verificationModal.batch_code}</b>
                </p>
              </div>
              <button
                onClick={() => setVerificationModal(null)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                background: verificationModal.is_verified ? '#f0fdf4' : '#fffbeb',
                border: `1px solid ${verificationModal.is_verified ? '#bbf7d0' : '#fde68a'}`,
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1.25rem',
                fontSize: '0.9rem',
                color: verificationModal.is_verified ? '#166534' : '#92400e',
              }}
            >
              {verificationModal.message}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Hash Basis Data Lokal (Head SHA-256):</span>
                <code style={{ color: '#4338ca', wordBreak: 'break-all', fontWeight: '600' }}>
                  {verificationModal.latest_db_hash}
                </code>
              </div>

              <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Hash Terjangkar di Smart Contract (On-Chain):</span>
                <code style={{ color: '#059669', wordBreak: 'break-all', fontWeight: '600' }}>
                  {verificationModal.on_chain_hash || '(Belum pernah dijangkarkan)'}
                </code>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Nomor Blok (Block Height):</span>
                  <b>{verificationModal.block_number ? `#${verificationModal.block_number}` : 'N/A'}</b>
                </div>
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>EVM Chain ID:</span>
                  <b>{verificationModal.network_chain_id} (Local Testnet)</b>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Alamat Smart Contract (SpiceRegistry.sol):</span>
                <code style={{ color: '#334155', wordBreak: 'break-all' }}>
                  {verificationModal.contract_address}
                </code>
              </div>

              {verificationModal.transaction_hash && (
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Transaction Hash:</span>
                  <code style={{ color: '#2563eb', wordBreak: 'break-all' }}>
                    {verificationModal.transaction_hash}
                  </code>
                </div>
              )}
            </div>

            <button
              onClick={() => setVerificationModal(null)}
              style={{
                width: '100%',
                background: '#1e3a8a',
                color: '#ffffff',
                border: 'none',
                padding: '0.75rem',
                borderRadius: '8px',
                fontWeight: 'bold',
                marginTop: '1.5rem',
                cursor: 'pointer',
              }}
            >
              Tutup Panel Verifikasi Blockchain
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: FARMING */}
      {isOfficerOrAdmin && activeTab === 'farming' && (
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', color: '#065f46', fontWeight: 'bold' }}>
                Pemetaan Spasial Petani & Perkebunan Rempah
              </h2>
              <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                Visualisasi titik koordinat kebun pala & cengkih Banda Neira menggunakan PostGIS dan Leaflet.
              </p>
            </div>
            <button
              onClick={fetchFarmingData}
              style={{
                background: '#f1f5f9',
                color: '#334155',
                border: '1px solid #cbd5e1',
                padding: '0.4rem 0.8rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: '600',
              }}
            >
              Segarkan Peta
            </button>
          </div>

          {farmStats && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Petani Terdaftar</span>
                <p style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#047857', marginTop: '0.2rem' }}>
                  {farmStats.total_farmers}
                </p>
              </div>
              <div style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Kelompok Tani</span>
                <p style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#1e3a8a', marginTop: '0.2rem' }}>
                  {farmStats.total_farmer_groups}
                </p>
              </div>
              <div style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Total Plot Kebun</span>
                <p style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#7c3aed', marginTop: '0.2rem' }}>
                  {farmStats.total_farms}
                </p>
              </div>
              <div style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Total Luas Lahan</span>
                <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a', marginTop: '0.2rem' }}>
                  {farmStats.total_area_sqm.toLocaleString()} m²
                </p>
              </div>
            </div>
          )}

          {farmMsg && (
            <div
              style={{
                marginBottom: '1rem',
                padding: '0.65rem',
                borderRadius: '6px',
                fontSize: '0.875rem',
                background: farmMsg.type === 'success' ? '#ecfdf5' : '#fef2f2',
                color: farmMsg.type === 'success' ? '#065f46' : '#991b1b',
                border: `1px solid ${farmMsg.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
              }}
            >
              {farmMsg.text}
            </div>
          )}

          <div style={{ marginBottom: '1.5rem' }}>
            <FarmMap features={farmGeoJSON.features} />
          </div>

          <details style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <summary style={{ cursor: 'pointer', fontWeight: '600', color: '#047857' }}>
              + Tambah / Petakan Plot Kebun Baru (Banda Neira)
            </summary>
            <form onSubmit={handleCreateQuickFarmerAndFarm} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginTop: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>Kode Kebun</label>
                <input
                  type="text"
                  value={farmForm.farm_code}
                  onChange={(e) => setFarmForm({ ...farmForm, farm_code: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>Nama Kebun</label>
                <input
                  type="text"
                  placeholder="Mis. Kebun Pala Selamon"
                  value={farmForm.name}
                  onChange={(e) => setFarmForm({ ...farmForm, name: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>Komoditas</label>
                <select
                  value={farmForm.primary_commodity}
                  onChange={(e) => setFarmForm({ ...farmForm, primary_commodity: e.target.value })}
                  style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                >
                  <option value="Pala">Pala</option>
                  <option value="Cengkih">Cengkih</option>
                  <option value="Kayu Manis">Kayu Manis</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>Luas (m²)</label>
                <input
                  type="number"
                  value={farmForm.area_sqm}
                  onChange={(e) => setFarmForm({ ...farmForm, area_sqm: Number(e.target.value) })}
                  required
                  style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={farmForm.latitude}
                  onChange={(e) => setFarmForm({ ...farmForm, latitude: parseFloat(e.target.value) })}
                  required
                  style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={farmForm.longitude}
                  onChange={(e) => setFarmForm({ ...farmForm, longitude: parseFloat(e.target.value) })}
                  required
                  style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
                <button
                  type="submit"
                  style={{
                    background: '#047857',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.5rem 1.25rem',
                    borderRadius: '6px',
                    fontWeight: '600',
                  }}
                >
                  Simpan & Tampilkan di Peta
                </button>
              </div>
            </form>
          </details>
        </section>
      )}

      {/* TAB 3: POPULATION */}
      {isOfficerOrAdmin && activeTab === 'population' && (
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', color: '#1e3a8a', fontWeight: 'bold' }}>
                Modul Administrasi Kependudukan Desa
              </h2>
              <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                Pengelolaan profil warga, verifikasi identitas, dan audit trail mutasi data.
              </p>
            </div>
            <button
              onClick={fetchPopulationData}
              disabled={loadingPop}
              style={{
                background: '#f1f5f9',
                color: '#334155',
                border: '1px solid #cbd5e1',
                padding: '0.4rem 0.8rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: '600',
              }}
            >
              {loadingPop ? 'Memuat...' : 'Segarkan Data'}
            </button>
          </div>

          {popStats && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Total Penduduk</span>
                <p style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#1e3a8a', marginTop: '0.2rem' }}>
                  {popStats.total_residents}
                </p>
              </div>
              <div style={{ padding: '0.85rem', background: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                <span style={{ fontSize: '0.8rem', color: '#047857' }}>Terverifikasi</span>
                <p style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#059669', marginTop: '0.2rem' }}>
                  {popStats.total_verified}
                </p>
              </div>
              <div style={{ padding: '0.85rem', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a' }}>
                <span style={{ fontSize: '0.8rem', color: '#b45309' }}>Menunggu Verifikasi</span>
                <p style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#d97706', marginTop: '0.2rem' }}>
                  {popStats.total_pending}
                </p>
              </div>
              <div style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Gender (L / P)</span>
                <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#334155', marginTop: '0.2rem' }}>
                  {popStats.gender_distribution['L'] || 0} L / {popStats.gender_distribution['P'] || 0} P
                </p>
              </div>
            </div>
          )}

          <details style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <summary style={{ cursor: 'pointer', fontWeight: '600', color: '#1e40af' }}>
              + Tambah Penduduk Baru (Data Sintetis Banda Neira)
            </summary>
            <form onSubmit={handleCreateResident} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginTop: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>NIK (16 Digit)</label>
                <input
                  type="text"
                  value={popForm.nik}
                  onChange={(e) => setPopForm({ ...popForm, nik: e.target.value })}
                  required
                  pattern="^\d{16}$"
                  style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>Nama Lengkap</label>
                <input
                  type="text"
                  value={popForm.full_name}
                  onChange={(e) => setPopForm({ ...popForm, full_name: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>Jenis Kelamin</label>
                <select
                  value={popForm.gender}
                  onChange={(e) => setPopForm({ ...popForm, gender: e.target.value as 'L' | 'P' })}
                  style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                >
                  <option value="L">Laki-laki (L)</option>
                  <option value="P">Perempuan (P)</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>Pekerjaan</label>
                <input
                  type="text"
                  value={popForm.occupation || ''}
                  onChange={(e) => setPopForm({ ...popForm, occupation: e.target.value })}
                  style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
                <button
                  type="submit"
                  style={{
                    background: '#059669',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.5rem 1.25rem',
                    borderRadius: '6px',
                    fontWeight: '600',
                  }}
                >
                  Simpan Penduduk
                </button>
              </div>
            </form>
          </details>

          {popMsg && (
            <div
              style={{
                marginBottom: '1rem',
                padding: '0.65rem',
                borderRadius: '6px',
                fontSize: '0.875rem',
                background: popMsg.type === 'success' ? '#ecfdf5' : '#fef2f2',
                color: popMsg.type === 'success' ? '#065f46' : '#991b1b',
                border: `1px solid ${popMsg.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
              }}
            >
              {popMsg.text}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="Cari penduduk berdasarkan Nama atau NIK..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchPopulationData()}
              style={{ flex: 1, padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
            <button
              onClick={fetchPopulationData}
              style={{
                background: '#1e40af',
                color: '#ffffff',
                border: 'none',
                padding: '0.45rem 1rem',
                borderRadius: '6px',
                fontWeight: '600',
              }}
            >
              Cari
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '0.65rem' }}>NIK</th>
                  <th style={{ padding: '0.65rem' }}>Nama</th>
                  <th style={{ padding: '0.65rem' }}>Gender</th>
                  <th style={{ padding: '0.65rem' }}>Pekerjaan</th>
                  <th style={{ padding: '0.65rem' }}>Status</th>
                  <th style={{ padding: '0.65rem' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {residents.map((r) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.65rem', fontFamily: 'monospace' }}>{r.nik}</td>
                    <td style={{ padding: '0.65rem', fontWeight: '500' }}>{r.full_name}</td>
                    <td style={{ padding: '0.65rem' }}>{r.gender}</td>
                    <td style={{ padding: '0.65rem' }}>{r.occupation || '-'}</td>
                    <td style={{ padding: '0.65rem' }}>{r.verification_status.toUpperCase()}</td>
                    <td style={{ padding: '0.65rem' }}>
                      {r.verification_status !== 'verified' && (
                        <button
                          onClick={() => handleVerifyResident(r.id, 'verified')}
                          style={{
                            background: '#059669',
                            color: '#ffffff',
                            border: 'none',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                          }}
                        >
                          Verifikasi
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
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
    </div>
  )
}

export default App
