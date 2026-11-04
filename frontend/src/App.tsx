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
  const [activeTab, setActiveTab] = useState<'population' | 'farming'>('farming')
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

  // Form state: Resident
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

  // Form state: Farm
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
        if (farmerList.items.length > 0 && !farmForm.farmer_id) {
          setFarmForm((prev) => ({ ...prev, farmer_id: farmerList.items[0].id }))
        }
      })
      .catch((err: Error) => {
        setFarmMsg({ type: 'error', text: err.message })
      })
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
      if (err instanceof Error) {
        setAuthError(err.message)
      } else {
        setAuthError('Terjadi kesalahan autentikasi')
      }
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = () => {
    authService.logout()
    setCurrentUser(null)
    setResidents([])
    setPopStats(null)
    setFarmers([])
    setFarms([])
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
      // If no farmer exists yet, create one automatically
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

      await farmerService.createFarm({
        ...farmForm,
        farmer_id: targetFarmerId,
      })

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

      {/* Auth & User Bar */}
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

      {/* Nav Tabs for Admin/Officers */}
      {isOfficerOrAdmin && (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
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
            🗺️ Pemetaan Petani & Kebun Rempah (Phase 4)
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

      {/* TAB 1: FARMING & GIS MAPPING */}
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

          {/* Stats Bar */}
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

          {/* Leaflet Map Visualizer */}
          <div style={{ marginBottom: '1.5rem' }}>
            <FarmMap features={farmGeoJSON.features} />
          </div>

          {/* Form Quick Add Farm */}
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
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>Komoditas Utama</label>
                <select
                  value={farmForm.primary_commodity}
                  onChange={(e) => setFarmForm({ ...farmForm, primary_commodity: e.target.value })}
                  style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                >
                  <option value="Pala">Pala (Nutmeg)</option>
                  <option value="Cengkih">Cengkih (Clove)</option>
                  <option value="Kayu Manis">Kayu Manis</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>Luas Lahan (m²)</label>
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

          {/* Farms Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '0.65rem' }}>Kode Kebun</th>
                  <th style={{ padding: '0.65rem' }}>Nama Kebun</th>
                  <th style={{ padding: '0.65rem' }}>Komoditas</th>
                  <th style={{ padding: '0.65rem' }}>Luas (m²)</th>
                  <th style={{ padding: '0.65rem' }}>Koordinat</th>
                  <th style={{ padding: '0.65rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {farms.map((f) => (
                  <tr key={f.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.65rem', fontFamily: 'monospace' }}>{f.farm_code}</td>
                    <td style={{ padding: '0.65rem', fontWeight: '500' }}>{f.name}</td>
                    <td style={{ padding: '0.65rem' }}>
                      <span
                        style={{
                          padding: '0.15rem 0.5rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          background: f.primary_commodity.toLowerCase().includes('pala') ? '#dbeafe' : '#d1fae5',
                          color: f.primary_commodity.toLowerCase().includes('pala') ? '#1e40af' : '#065f46',
                        }}
                      >
                        {f.primary_commodity}
                      </span>
                    </td>
                    <td style={{ padding: '0.65rem' }}>{f.area_sqm.toLocaleString()}</td>
                    <td style={{ padding: '0.65rem', color: '#64748b', fontSize: '0.8rem' }}>
                      {f.latitude.toFixed(4)}, {f.longitude.toFixed(4)}
                    </td>
                    <td style={{ padding: '0.65rem' }}>
                      <span style={{ color: '#059669', fontWeight: '600', fontSize: '0.75rem' }}>TERCATAT</span>
                    </td>
                  </tr>
                ))}
                {farms.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b' }}>
                      Belum ada kebun rempah yang dipetakan. Silakan gunakan formulir di atas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB 2: POPULATION MANAGEMENT */}
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

          {/* Form Registrasi Penduduk */}
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
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>RT / RW</label>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <input
                    type="text"
                    placeholder="RT"
                    value={popForm.rt || ''}
                    onChange={(e) => setPopForm({ ...popForm, rt: e.target.value })}
                    style={{ width: '50%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                  <input
                    type="text"
                    placeholder="RW"
                    value={popForm.rw || ''}
                    onChange={(e) => setPopForm({ ...popForm, rw: e.target.value })}
                    style={{ width: '50%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
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

          {/* Search bar */}
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

          {/* Residents Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '0.65rem' }}>NIK</th>
                  <th style={{ padding: '0.65rem' }}>Nama Lengkap</th>
                  <th style={{ padding: '0.65rem' }}>Gender</th>
                  <th style={{ padding: '0.65rem' }}>Pekerjaan</th>
                  <th style={{ padding: '0.65rem' }}>RT/RW</th>
                  <th style={{ padding: '0.65rem' }}>Status</th>
                  <th style={{ padding: '0.65rem' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {residents.map((r) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.65rem', fontFamily: 'monospace' }}>{r.nik}</td>
                    <td style={{ padding: '0.65rem', fontWeight: '500' }}>{r.full_name}</td>
                    <td style={{ padding: '0.65rem' }}>{r.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
                    <td style={{ padding: '0.65rem' }}>{r.occupation || '-'}</td>
                    <td style={{ padding: '0.65rem' }}>{r.rt || '-'}/{r.rw || '-'}</td>
                    <td style={{ padding: '0.65rem' }}>
                      <span
                        style={{
                          padding: '0.2rem 0.5rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          background:
                            r.verification_status === 'verified'
                              ? '#d1fae5'
                              : r.verification_status === 'rejected'
                              ? '#fee2e2'
                              : '#fef3c7',
                          color:
                            r.verification_status === 'verified'
                              ? '#065f46'
                              : r.verification_status === 'rejected'
                              ? '#991b1b'
                              : '#92400e',
                        }}
                      >
                        {r.verification_status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '0.65rem' }}>
                      {r.verification_status !== 'verified' && (
                        <button
                          onClick={() => handleVerifyResident(r.id, 'verified')}
                          style={{
                            background: '#059669',
                            color: '#ffffff',
                            border: 'none',
                            padding: '0.25rem 0.6rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            marginRight: '0.3rem',
                          }}
                        >
                          Verifikasi
                        </button>
                      )}
                      {r.verification_status !== 'rejected' && (
                        <button
                          onClick={() => handleVerifyResident(r.id, 'rejected')}
                          style={{
                            background: '#64748b',
                            color: '#ffffff',
                            border: 'none',
                            padding: '0.25rem 0.6rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                          }}
                        >
                          Tolak
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

      {/* System Status Section */}
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
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#0f172a' }}>
          Status Infrastruktur Sistem
        </h2>
        {loadingHealth && <p style={{ color: '#64748b' }}>Memeriksa koneksi layanan backend...</p>}
        {healthError && (
          <div style={{ color: '#b91c1c', background: '#fef2f2', padding: '0.75rem', borderRadius: '8px' }}>
            Backend offline atau belum dapat dihubungi: {healthError}
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
              <p
                style={{
                  fontSize: '1.125rem',
                  fontWeight: 'bold',
                  color: health.services.database === 'connected' ? '#059669' : '#d97706',
                  marginTop: '0.25rem',
                }}
              >
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
