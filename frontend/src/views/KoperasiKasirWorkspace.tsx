import React, { useState, useEffect } from 'react'
import {
  Scale,
  Recycle,
  Droplets,
  CreditCard,
  Search,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  Building2,
  Activity,
} from 'lucide-react'
import {
  koperasiService,
  CitizenCoopProfileResponse,
  CoopTransactionItem,
  CoopEcosystemRecap,
  COMMODITY_OPTIONS,
  WASTE_OPTIONS,
  WATER_STATIONS,
} from '../services/koperasi'

export const KoperasiKasirWorkspace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'komoditas' | 'sampah' | 'dispenser' | 'ledger'>('komoditas')

  // Citizen Search & Profile
  const [nikInput, setNikInput] = useState<string>('8171010101900001')
  const [citizenProfile, setCitizenProfile] = useState<CitizenCoopProfileResponse | null>(null)
  const [loadingCitizen, setLoadingCitizen] = useState<boolean>(false)
  const [citizenError, setCitizenError] = useState<string | null>(null)

  // Ecosystem Recap
  const [recap, setRecap] = useState<CoopEcosystemRecap | null>(null)

  // Form State: Komoditas
  const [commodityType, setCommodityType] = useState<string>('pala_super')
  const [commodityWeight, setCommodityWeight] = useState<number>(5.0)
  const [commodityDest, setCommodityDest] = useState<'BALANCE' | 'WATER_QUOTA'>('BALANCE')
  const [commodityNotes, setCommodityNotes] = useState<string>('')
  const [submittingKomoditas, setSubmittingKomoditas] = useState<boolean>(false)

  // Form State: Bank Sampah
  const [wasteType, setWasteType] = useState<string>('botol_plastik_pet')
  const [wasteWeight, setWasteWeight] = useState<number>(2.5)
  const [wasteDest, setWasteDest] = useState<'WATER_QUOTA' | 'BALANCE'>('WATER_QUOTA')
  const [wasteNotes, setWasteNotes] = useState<string>('')
  const [submittingWaste, setSubmittingWaste] = useState<boolean>(false)

  // Form State: Dispenser Air RO
  const [dispenserStation, setDispenserStation] = useState<string>('RO-STATION-LONTHOIR-01')
  const [waterLiters, setWaterLiters] = useState<number>(10.0)
  const [dispensingActive, setDispensingActive] = useState<boolean>(false)
  const [dispenseCountdown, setDispenseCountdown] = useState<number>(0)
  const [valveStatus, setValveStatus] = useState<'CLOSED' | 'OPEN'>('CLOSED')
  const [submittingWater, setSubmittingWater] = useState<boolean>(false)

  // Notification / Transaction Success Receipt
  const [lastReceipt, setLastReceipt] = useState<CoopTransactionItem | null>(null)
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null)
  const [actionErrorMsg, setActionErrorMsg] = useState<string | null>(null)

  // Ledger List
  const [ledgerTransactions, setLedgerTransactions] = useState<CoopTransactionItem[]>([])
  const [loadingLedger, setLoadingLedger] = useState<boolean>(false)

  // Initial Data Fetch
  useEffect(() => {
    fetchRecap()
    loadLedger()
    if (nikInput) {
      handleSearchCitizen(nikInput)
    }
  }, [])

  // Timer Solenoid Valve Dispenser
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    if (dispensingActive && dispenseCountdown > 0) {
      timer = setTimeout(() => {
        setDispenseCountdown((prev) => prev - 1)
      }, 1000)
    } else if (dispensingActive && dispenseCountdown === 0) {
      setDispensingActive(false)
      setValveStatus('CLOSED')
    }
    return () => clearTimeout(timer)
  }, [dispensingActive, dispenseCountdown])

  const fetchRecap = async () => {
    try {
      const data = await koperasiService.getRecap()
      setRecap(data)
    } catch {
      // ignore
    }
  }

  const loadLedger = async () => {
    setLoadingLedger(true)
    try {
      const list = await koperasiService.listTransactions({ limit: 20 })
      setLedgerTransactions(list)
    } catch {
      // ignore
    } finally {
      setLoadingLedger(false)
    }
  }

  const handleSearchCitizen = async (nikToSearch: string) => {
    if (!nikToSearch || nikToSearch.trim().length !== 16) {
      setCitizenError('Masukkan 16 digit NIK warga yang valid.')
      return
    }
    setLoadingCitizen(true)
    setCitizenError(null)
    try {
      const profile = await koperasiService.getCitizenProfile(nikToSearch.trim())
      setCitizenProfile(profile)
    } catch (err: unknown) {
      setCitizenProfile(null)
      if (err instanceof Error) {
        setCitizenError(err.message)
      } else {
        setCitizenError('Data warga tidak ditemukan atau server offline.')
      }
    } finally {
      setLoadingCitizen(false)
    }
  }

  const handleDepositKomoditas = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!citizenProfile) {
      setActionErrorMsg('Pilih atau cari NIK warga terlebih dahulu.')
      return
    }
    setSubmittingKomoditas(true)
    setActionErrorMsg(null)
    setActionSuccessMsg(null)

    try {
      const trx = await koperasiService.depositCommodity({
        nik: citizenProfile.nik,
        commodity_type: commodityType,
        weight_kg: commodityWeight,
        destination: commodityDest,
        notes: commodityNotes || undefined,
      })
      setLastReceipt(trx)
      setActionSuccessMsg(`Setoran komoditas berhasil dicatat! Struk hash: ${trx.receipt_hash.slice(0, 14)}...`)
      // Refresh profile & recap & ledger
      handleSearchCitizen(citizenProfile.nik)
      fetchRecap()
      loadLedger()
    } catch (err: unknown) {
      if (err instanceof Error) setActionErrorMsg(err.message)
    } finally {
      setSubmittingKomoditas(false)
    }
  }

  const handleDepositWaste = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!citizenProfile) {
      setActionErrorMsg('Pilih atau cari NIK warga terlebih dahulu.')
      return
    }
    setSubmittingWaste(true)
    setActionErrorMsg(null)
    setActionSuccessMsg(null)

    try {
      const trx = await koperasiService.depositWaste({
        nik: citizenProfile.nik,
        waste_type: wasteType,
        weight_kg: wasteWeight,
        destination: wasteDest,
        notes: wasteNotes || undefined,
      })
      setLastReceipt(trx)
      setActionSuccessMsg(`Bank Sampah: Berhasil konversi sampah jadi kuota air! Struk: ${trx.receipt_hash.slice(0, 14)}...`)
      handleSearchCitizen(citizenProfile.nik)
      fetchRecap()
      loadLedger()
    } catch (err: unknown) {
      if (err instanceof Error) setActionErrorMsg(err.message)
    } finally {
      setSubmittingWaste(false)
    }
  }

  const handleRedeemWater = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!citizenProfile) {
      setActionErrorMsg('Pilih atau cari NIK warga terlebih dahulu.')
      return
    }
    if (citizenProfile.clean_water_quota_ltr < waterLiters) {
      setActionErrorMsg(`Kuota air tidak cukup (Sisa: ${citizenProfile.clean_water_quota_ltr} L, Permintaan: ${waterLiters} L). Silakan setor botol plastik untuk tambah kuota!`)
      return
    }

    setSubmittingWater(true)
    setActionErrorMsg(null)
    setActionSuccessMsg(null)

    try {
      const resp = await koperasiService.redeemWater({
        nik: citizenProfile.nik,
        liters_requested: waterLiters,
        station_code: dispenserStation,
      })

      setValveStatus('OPEN')
      setDispensingActive(true)
      setDispenseCountdown(resp.dispense_duration_sec)
      setActionSuccessMsg(`Dispenser Aktif! Solenoid valve terbuka mengalirkan ${resp.liters_dispensed} Liter air bersih RO.`)

      handleSearchCitizen(citizenProfile.nik)
      fetchRecap()
      loadLedger()
    } catch (err: unknown) {
      if (err instanceof Error) setActionErrorMsg(err.message)
    } finally {
      setSubmittingWater(false)
    }
  }

  const selectedCommodity = COMMODITY_OPTIONS.find((c) => c.code === commodityType) || COMMODITY_OPTIONS[0]
  const estCommodityRp = selectedCommodity.price * commodityWeight
  const estCommodityWaterLtr = Math.round((estCommodityRp / 500) * 10) / 10

  const selectedWaste = WASTE_OPTIONS.find((w) => w.code === wasteType) || WASTE_OPTIONS[0]
  const estWasteWaterLtr = Math.round(selectedWaste.waterPerKg * wasteWeight * 10) / 10
  const estWasteRp = selectedWaste.price * wasteWeight

  return (
    <div className="workspace-container animate-fade-in">
      {/* Workspace Header */}
      <div className="workspace-header" style={{ marginBottom: '1.75rem' }}>
        <div>
          <span className="badge badge-emerald" style={{ marginBottom: '0.4rem', display: 'inline-flex', gap: '0.35rem' }}>
            <Building2 size={12} /> Mandat Prof. Purwo &amp; Koperasi Hatta
          </span>
          <h2 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 900, color: '#f8fafc', letterSpacing: '-0.02em' }}>
            Kasir Koperasi, Bank Sampah &amp; Dispenser RO
          </h2>
          <p style={{ margin: '0.35rem 0 0', color: '#94a3b8', fontSize: '0.875rem' }}>
            Ekosistem sirkular pulau: Timbangan komoditas rempah, tukar 1 kg plastik jadi 10 liter air bersih, &amp; dispenser otomatis Solenoid Valve.
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '0.4rem', background: 'rgba(15, 23, 42, 0.8)', padding: '0.35rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setActiveTab('komoditas')}
            style={{
              padding: '0.5rem 0.9rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s',
              background: activeTab === 'komoditas' ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent',
              color: activeTab === 'komoditas' ? '#ffffff' : '#94a3b8',
            }}
          >
            <Scale size={14} /> ⚖️ Timbangan Rempah
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sampah')}
            style={{
              padding: '0.5rem 0.9rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s',
              background: activeTab === 'sampah' ? 'linear-gradient(135deg, #06b6d4, #0284c7)' : 'transparent',
              color: activeTab === 'sampah' ? '#ffffff' : '#94a3b8',
            }}
          >
            <Recycle size={14} /> ♻️ Bank Sampah Plastik
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('dispenser')}
            style={{
              padding: '0.5rem 0.9rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s',
              background: activeTab === 'dispenser' ? 'linear-gradient(135deg, #3b82f6, #6366f1)' : 'transparent',
              color: activeTab === 'dispenser' ? '#ffffff' : '#94a3b8',
            }}
          >
            <Droplets size={14} /> 🚰 Dispenser Air RO
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ledger')}
            style={{
              padding: '0.5rem 0.9rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s',
              background: activeTab === 'ledger' ? 'linear-gradient(135deg, #8b5cf6, #d946ef)' : 'transparent',
              color: activeTab === 'ledger' ? '#ffffff' : '#94a3b8',
            }}
          >
            <CreditCard size={14} /> 📜 Buku Besar
          </button>
        </div>
      </div>

      {/* Island Ecosystem Top KPI Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '0.85rem 1.15rem', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <Building2 size={14} /> Akun Warga Aktif
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#f8fafc', marginTop: '0.2rem' }}>
            {recap?.total_active_accounts ?? '—'} <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>Warga</span>
          </div>
        </div>

        <div className="card" style={{ padding: '0.85rem 1.15rem', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#06b6d4', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <Droplets size={14} /> Cadangan Kuota Air Bersih
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#f8fafc', marginTop: '0.2rem' }}>
            {recap?.total_clean_water_quota_ltr.toLocaleString() ?? '—'} <span style={{ fontSize: '0.8rem', color: '#06b6d4', fontWeight: 600 }}>Liter RO</span>
          </div>
        </div>

        <div className="card" style={{ padding: '0.85rem 1.15rem', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <Recycle size={14} /> Sampah Plastik Didaur Ulang
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#f8fafc', marginTop: '0.2rem' }}>
            {recap?.total_plastic_recycled_kg.toFixed(1) ?? '—'} <span style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 600 }}>Kg PET/HDPE</span>
          </div>
        </div>

        <div className="card" style={{ padding: '0.85rem 1.15rem', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a78bfa', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <Activity size={14} /> Total Transaksi Kasir
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#f8fafc', marginTop: '0.2rem' }}>
            {recap?.total_transactions_count ?? '—'} <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>Struk</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Citizen Card (Left) & Active Operation Form (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 360px) 1fr', gap: '1.25rem', alignItems: 'start' }}>
        {/* Left Column: Citizen Lookup & Balance Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* NIK Search Box */}
          <div className="card" style={{ padding: '1.15rem', background: 'var(--surface-color)', border: '1px solid var(--border-color)' }}>
            <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.875rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Search size={15} style={{ color: '#10b981' }} /> Identifikasi NIK Warga
            </h4>
            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.65rem' }}>
              <input
                type="text"
                maxLength={16}
                value={nikInput}
                onChange={(e) => setNikInput(e.target.value)}
                placeholder="16 Digit NIK Warga Desa..."
                style={{
                  flex: 1,
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  color: '#f8fafc',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.825rem',
                  fontFamily: 'monospace',
                }}
              />
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleSearchCitizen(nikInput)}
                disabled={loadingCitizen}
                style={{ padding: '0.5rem 0.85rem' }}
              >
                {loadingCitizen ? <RefreshCw size={14} className="animate-spin" /> : 'Cek'}
              </button>
            </div>

            {/* Quick Demo NIK Pickers */}
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.7rem', color: '#64748b', alignSelf: 'center' }}>Sampel:</span>
              <button
                type="button"
                onClick={() => {
                  setNikInput('8171010101900001')
                  handleSearchCitizen('8171010101900001')
                }}
                style={{ fontSize: '0.7rem', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8', borderRadius: '4px', padding: '0.15rem 0.4rem', cursor: 'pointer' }}
              >
                Ahmad (Pala)
              </button>
              <button
                type="button"
                onClick={() => {
                  setNikInput('8171010101900002')
                  handleSearchCitizen('8171010101900002')
                }}
                style={{ fontSize: '0.7rem', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8', borderRadius: '4px', padding: '0.15rem 0.4rem', cursor: 'pointer' }}
              >
                Fatima (Fuli)
              </button>
              <button
                type="button"
                onClick={() => {
                  setNikInput('8171010101900003')
                  handleSearchCitizen('8171010101900003')
                }}
                style={{ fontSize: '0.7rem', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8', borderRadius: '4px', padding: '0.15rem 0.4rem', cursor: 'pointer' }}
              >
                Syahrir (Pesisir)
              </button>
            </div>

            {citizenError && (
              <div style={{ marginTop: '0.65rem', padding: '0.45rem 0.65rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-sm)', color: '#f87171', fontSize: '0.75rem' }}>
                {citizenError}
              </div>
            )}
          </div>

          {/* Citizen Smart Card Details */}
          {citizenProfile ? (
            <div className="card" style={{ padding: '1.25rem', background: 'linear-gradient(145deg, rgba(16, 185, 129, 0.08), rgba(6, 182, 212, 0.05))', border: '1px solid rgba(16, 185, 129, 0.3)', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    KARTU WARGA DESA NEIRA
                  </span>
                  <h3 style={{ margin: '0.2rem 0 0', fontSize: '1.2rem', fontWeight: 900, color: '#f8fafc' }}>
                    {citizenProfile.full_name}
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.15rem' }}>
                    NIK: <span style={{ fontFamily: 'monospace', color: '#cbd5e1' }}>{citizenProfile.nik}</span>
                  </div>
                </div>
                <div style={{ padding: '0.4rem', background: 'rgba(16, 185, 129, 0.15)', borderRadius: 'var(--radius-md)', color: '#10b981' }}>
                  <ShieldCheck size={22} />
                </div>
              </div>

              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '1rem', display: 'flex', gap: '0.75rem' }}>
                <span>Desa: <b style={{ color: '#e2e8f0' }}>{citizenProfile.village || 'Banda Neira'}</b></span>
                <span>Profesi: <b style={{ color: '#e2e8f0' }}>{citizenProfile.occupation || 'Warga'}</b></span>
              </div>

              {/* Balances Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '0.85rem' }}>
                <div style={{ padding: '0.65rem 0.85rem', background: 'rgba(15, 23, 42, 0.7)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Saldo Koperasi</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#10b981', marginTop: '0.15rem' }}>
                    Rp {citizenProfile.coop_balance_rp.toLocaleString()}
                  </div>
                </div>

                <div style={{ padding: '0.65rem 0.85rem', background: 'rgba(15, 23, 42, 0.7)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
                  <div style={{ fontSize: '0.7rem', color: '#06b6d4' }}>Kuota Air RO</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#38bdf8', marginTop: '0.15rem' }}>
                    {citizenProfile.clean_water_quota_ltr.toFixed(1)} <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Liter</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                <div style={{ padding: '0.55rem 0.75rem', background: 'rgba(15, 23, 42, 0.5)', borderRadius: 'var(--radius-sm)', fontSize: '0.72rem', color: '#94a3b8' }}>
                  Poin Sampah: <b style={{ color: '#f59e0b' }}>{citizenProfile.plastic_points} pts</b>
                </div>
                <div style={{ padding: '0.55rem 0.75rem', background: 'rgba(15, 23, 42, 0.5)', borderRadius: 'var(--radius-sm)', fontSize: '0.72rem', color: '#94a3b8' }}>
                  Plastik Disetor: <b style={{ color: '#e2e8f0' }}>{citizenProfile.total_plastic_recycled_kg.toFixed(1)} kg</b>
                </div>
              </div>
            </div>
          ) : (
            <div className="card" style={{ padding: '1.5rem', textAlign: 'center', background: 'rgba(15, 23, 42, 0.4)', border: '1px dashed var(--border-color)', color: '#64748b' }}>
              <Scale size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
              <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Belum Ada Warga Dipilih</div>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem' }}>
                Cari NIK warga untuk melihat saldo koperasi &amp; kuota air minum.
              </p>
            </div>
          )}

          {/* Struk Terakhir Widget */}
          {lastReceipt && (
            <div className="card" style={{ padding: '1rem', background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#10b981', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                <CheckCircle2 size={14} /> Struk Transaksi Terverifikasi
              </div>
              <div style={{ fontSize: '0.8rem', color: '#e2e8f0', fontWeight: 700 }}>
                {lastReceipt.item_name}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '0.2rem 0' }}>
                Kode: <span style={{ fontFamily: 'monospace', color: '#38bdf8' }}>{lastReceipt.transaction_code}</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', wordBreak: 'break-all' }}>
                Hash: <span style={{ fontFamily: 'monospace', color: '#10b981' }}>{lastReceipt.receipt_hash}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Operations Panel */}
        <div>
          {/* Status Message Alerts */}
          {actionSuccessMsg && (
            <div style={{ padding: '0.75rem 1rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: 'var(--radius-md)', color: '#34d399', fontSize: '0.825rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={16} /> {actionSuccessMsg}
            </div>
          )}
          {actionErrorMsg && (
            <div style={{ padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: 'var(--radius-md)', color: '#f87171', fontSize: '0.825rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={16} /> {actionErrorMsg}
            </div>
          )}

          {/* TAB 1: Kasir Timbangan Komoditas */}
          {activeTab === 'komoditas' && (
            <div className="card" style={{ padding: '1.5rem', background: 'var(--surface-color)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Scale size={18} style={{ color: '#10b981' }} /> Kasir Timbangan Hasil Bumi &amp; Laut
                  </h3>
                  <p style={{ margin: '0.2rem 0 0', color: '#94a3b8', fontSize: '0.8rem' }}>
                    Menerima setoran pala, fuli, cengkeh, dan ikan tangkapan nelayan dengan harga acuan Koperasi Hatta.
                  </p>
                </div>
              </div>

              <form onSubmit={handleDepositKomoditas} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                {/* Select Commodity */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                    Pilih Jenis Komoditas:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
                    {COMMODITY_OPTIONS.map((item) => (
                      <button
                        type="button"
                        key={item.code}
                        onClick={() => setCommodityType(item.code)}
                        style={{
                          padding: '0.65rem 0.85rem',
                          background: commodityType === item.code ? 'rgba(16, 185, 129, 0.18)' : 'rgba(15, 23, 42, 0.6)',
                          border: commodityType === item.code ? '1px solid #10b981' : '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-md)',
                          textAlign: 'left',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                        <div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc' }}>{item.name}</div>
                          <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>
                            Rp {item.price.toLocaleString()} / kg
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Weight Input & Destination Selection */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                      Berat Timbangan (Kg):
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="1000"
                      value={commodityWeight}
                      onChange={(e) => setCommodityWeight(parseFloat(e.target.value) || 0)}
                      style={{
                        width: '100%',
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        color: '#f8fafc',
                        padding: '0.6rem 0.75rem',
                        fontSize: '1rem',
                        fontWeight: 700,
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                      Alokasi Nilai Tukar:
                    </label>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        type="button"
                        onClick={() => setCommodityDest('BALANCE')}
                        style={{
                          flex: 1,
                          padding: '0.6rem 0.5rem',
                          borderRadius: 'var(--radius-md)',
                          border: commodityDest === 'BALANCE' ? '1px solid #10b981' : '1px solid var(--border-color)',
                          background: commodityDest === 'BALANCE' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                          color: commodityDest === 'BALANCE' ? '#10b981' : '#94a3b8',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        💰 Tabungan Saldo (Rp)
                      </button>
                      <button
                        type="button"
                        onClick={() => setCommodityDest('WATER_QUOTA')}
                        style={{
                          flex: 1,
                          padding: '0.6rem 0.5rem',
                          borderRadius: 'var(--radius-md)',
                          border: commodityDest === 'WATER_QUOTA' ? '1px solid #06b6d4' : '1px solid var(--border-color)',
                          background: commodityDest === 'WATER_QUOTA' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                          color: commodityDest === 'WATER_QUOTA' ? '#06b6d4' : '#94a3b8',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        🚰 Kuota Air Bersih (RO)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Notes Input */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                    Catatan Kasir (Opsional):
                  </label>
                  <input
                    type="text"
                    value={commodityNotes}
                    onChange={(e) => setCommodityNotes(e.target.value)}
                    placeholder="Contoh: Panen kebun nutmeg Hatta blok utara"
                    style={{
                      width: '100%',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      color: '#f8fafc',
                      padding: '0.55rem 0.75rem',
                      fontSize: '0.8rem',
                    }}
                  />
                </div>

                {/* Calculation Summary Box */}
                <div style={{ padding: '0.9rem 1.15rem', background: 'rgba(16, 185, 129, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.25)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Estimasi Nilai Tukar:</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#10b981' }}>
                      Rp {estCommodityRp.toLocaleString()}
                    </div>
                  </div>
                  {commodityDest === 'WATER_QUOTA' && (
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Konversi Air Minum RO:</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#06b6d4' }}>
                        + {estCommodityWaterLtr.toFixed(1)} Liter
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submittingKomoditas || !citizenProfile}
                  className="btn btn-primary"
                  style={{
                    padding: '0.8rem',
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                  }}
                >
                  {submittingKomoditas ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" /> Memproses Timbangan...
                    </>
                  ) : (
                    <>
                      <Scale size={16} /> Catat Timbangan &amp; Terbitkan Struk Buku Besar
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: Bank Sampah Plastik (Mandat Prof. Purwo) */}
          {activeTab === 'sampah' && (
            <div className="card" style={{ padding: '1.5rem', background: 'var(--surface-color)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Recycle size={18} style={{ color: '#06b6d4' }} /> Bank Sampah Plastik Terpadu
                  </h3>
                  <p style={{ margin: '0.2rem 0 0', color: '#94a3b8', fontSize: '0.8rem' }}>
                    Mandat Kemandirian Prof. Purwo: Setiap 1 kg sampah botol plastik ditukar 10 liter air minum higienis.
                  </p>
                </div>
              </div>

              <form onSubmit={handleDepositWaste} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                {/* Select Waste Type */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                    Kategori Sampah Terpilah:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '0.5rem' }}>
                    {WASTE_OPTIONS.map((item) => (
                      <button
                        type="button"
                        key={item.code}
                        onClick={() => setWasteType(item.code)}
                        style={{
                          padding: '0.75rem',
                          background: wasteType === item.code ? 'rgba(6, 182, 212, 0.18)' : 'rgba(15, 23, 42, 0.6)',
                          border: wasteType === item.code ? '1px solid #06b6d4' : '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-md)',
                          textAlign: 'left',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        <span style={{ fontSize: '1.4rem' }}>{item.icon}</span>
                        <div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc' }}>{item.name}</div>
                          <div style={{ fontSize: '0.72rem', color: '#06b6d4', fontWeight: 700 }}>
                            1 kg = {item.waterPerKg} L Air RO ({item.price.toLocaleString()} Rp)
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Weight & Destination */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                      Berat Sampah Timbangan (Kg):
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="500"
                      value={wasteWeight}
                      onChange={(e) => setWasteWeight(parseFloat(e.target.value) || 0)}
                      style={{
                        width: '100%',
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        color: '#f8fafc',
                        padding: '0.6rem 0.75rem',
                        fontSize: '1rem',
                        fontWeight: 700,
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                      Alokasi Penukaran:
                    </label>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        type="button"
                        onClick={() => setWasteDest('WATER_QUOTA')}
                        style={{
                          flex: 1,
                          padding: '0.6rem 0.5rem',
                          borderRadius: 'var(--radius-md)',
                          border: wasteDest === 'WATER_QUOTA' ? '1px solid #06b6d4' : '1px solid var(--border-color)',
                          background: wasteDest === 'WATER_QUOTA' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                          color: wasteDest === 'WATER_QUOTA' ? '#06b6d4' : '#94a3b8',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        🚰 Kuota Air RO (Utama)
                      </button>
                      <button
                        type="button"
                        onClick={() => setWasteDest('BALANCE')}
                        style={{
                          flex: 1,
                          padding: '0.6rem 0.5rem',
                          borderRadius: 'var(--radius-md)',
                          border: wasteDest === 'BALANCE' ? '1px solid #10b981' : '1px solid var(--border-color)',
                          background: wasteDest === 'BALANCE' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                          color: wasteDest === 'BALANCE' ? '#10b981' : '#94a3b8',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        💰 Saldo Uang (Rp)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Notes Input */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                    Lokasi Asal Sampah:
                  </label>
                  <input
                    type="text"
                    value={wasteNotes}
                    onChange={(e) => setWasteNotes(e.target.value)}
                    placeholder="Contoh: Pembersihan pesisir pantai Pulau Ay / RT 02"
                    style={{
                      width: '100%',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      color: '#f8fafc',
                      padding: '0.55rem 0.75rem',
                      fontSize: '0.8rem',
                    }}
                  />
                </div>

                {/* Impact Calculation Callout */}
                <div style={{ padding: '0.9rem 1.15rem', background: 'rgba(6, 182, 212, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(6, 182, 212, 0.25)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      {wasteDest === 'WATER_QUOTA' ? 'Perolehan Air Minum Bersih:' : 'Nilai Saldo Tabungan (Rp):'}
                    </div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 900, color: wasteDest === 'WATER_QUOTA' ? '#38bdf8' : '#10b981' }}>
                      {wasteDest === 'WATER_QUOTA'
                        ? `+ ${estWasteWaterLtr.toFixed(1)} Liter Air RO`
                        : `Rp ${estWasteRp.toLocaleString()}`}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Bonus Poin Lingkungan:</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#f59e0b' }}>
                      + {Math.round(wasteWeight * 10)} Poin
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submittingWaste || !citizenProfile}
                  className="btn btn-primary"
                  style={{
                    padding: '0.8rem',
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #06b6d4, #0284c7)',
                  }}
                >
                  {submittingWaste ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" /> Memproses Bank Sampah...
                    </>
                  ) : (
                    <>
                      <Recycle size={16} /> Konversi Sampah Jadi Kuota Air Bersih
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: Dispenser Air RO & Solenoid Valve ESP32 */}
          {activeTab === 'dispenser' && (
            <div className="card" style={{ padding: '1.5rem', background: 'var(--surface-color)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Droplets size={18} style={{ color: '#3b82f6' }} /> Dispenser Air Minum RO Otomatis
                  </h3>
                  <p style={{ margin: '0.2rem 0 0', color: '#94a3b8', fontSize: '0.8rem' }}>
                    Solenoid valve berbasis relay microcontroller (ESP32) memotong kuota air NIK dan mengalirkan air minum siap konsumsi.
                  </p>
                </div>

                {/* Valve Status Badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: valveStatus === 'OPEN' ? '#10b981' : '#64748b',
                      boxShadow: valveStatus === 'OPEN' ? '0 0 10px #10b981' : 'none',
                    }}
                  />
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: valveStatus === 'OPEN' ? '#10b981' : '#94a3b8' }}>
                    SOLENOID: {valveStatus}
                  </span>
                </div>
              </div>

              {/* Solenoid Animation Box */}
              {dispensingActive && (
                <div style={{ marginBottom: '1.25rem', padding: '1.5rem', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(6, 182, 212, 0.15))', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(59, 130, 246, 0.4)', textAlign: 'center' }}>
                  <Droplets size={42} style={{ color: '#38bdf8', animation: 'bounce 1s infinite' }} />
                  <h4 style={{ margin: '0.5rem 0 0.2rem', color: '#f8fafc', fontSize: '1.1rem', fontWeight: 800 }}>
                    Air Bersih Sedang Mengalir...
                  </h4>
                  <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.8rem' }}>
                    Letakkan wadah atau galon di bawah nozzle keran dispenser stasiun desa.
                  </p>
                  <div style={{ marginTop: '0.75rem', fontSize: '1.8rem', fontWeight: 900, color: '#38bdf8', fontFamily: 'monospace' }}>
                    00:{dispenseCountdown.toString().padStart(2, '0')} detik
                  </div>
                </div>
              )}

              <form onSubmit={handleRedeemWater} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                {/* Station Code Selector */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                    Pilih Lokasi Stasiun Dispenser RO:
                  </label>
                  <select
                    value={dispenserStation}
                    onChange={(e) => setDispenserStation(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      color: '#f8fafc',
                      padding: '0.6rem 0.75rem',
                      fontSize: '0.825rem',
                    }}
                  >
                    {WATER_STATIONS.map((st) => (
                      <option key={st.code} value={st.code}>
                        {st.name} ({st.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Preset Volume Buttons */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                    Preset Volume Pengisian:
                  </label>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {[
                      { ltr: 2.0, label: '2 Liter (Botol)' },
                      { ltr: 5.0, label: '5 Liter (Jeriken Kecil)' },
                      { ltr: 10.0, label: '10 Liter (Jeriken Sedang)' },
                      { ltr: 19.0, label: '19 Liter (Galon Standar)' },
                    ].map((preset) => (
                      <button
                        type="button"
                        key={preset.ltr}
                        onClick={() => setWaterLiters(preset.ltr)}
                        style={{
                          padding: '0.5rem 0.75rem',
                          borderRadius: 'var(--radius-md)',
                          border: waterLiters === preset.ltr ? '1px solid #3b82f6' : '1px solid var(--border-color)',
                          background: waterLiters === preset.ltr ? 'rgba(59, 130, 246, 0.25)' : 'rgba(15, 23, 42, 0.6)',
                          color: waterLiters === preset.ltr ? '#93c5fd' : '#94a3b8',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Manual Liters Input */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                    Volume Air (Liter):
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="100"
                    value={waterLiters}
                    onChange={(e) => setWaterLiters(parseFloat(e.target.value) || 0)}
                    style={{
                      width: '100%',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      color: '#f8fafc',
                      padding: '0.6rem 0.75rem',
                      fontSize: '1rem',
                      fontWeight: 700,
                    }}
                  />
                </div>

                {/* Submit Dispense */}
                <button
                  type="submit"
                  disabled={submittingWater || dispensingActive || !citizenProfile}
                  className="btn btn-primary"
                  style={{
                    padding: '0.85rem',
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  }}
                >
                  {submittingWater ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" /> Mengirim Sinyal Solenoid...
                    </>
                  ) : dispensingActive ? (
                    <>
                      <Droplets size={16} /> Sedang Mengalirkan Air...
                    </>
                  ) : (
                    <>
                      <Droplets size={16} /> Buka Solenoid &amp; Tebus {waterLiters} Liter Air RO
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: Buku Besar Transaksi (Ledger) */}
          {activeTab === 'ledger' && (
            <div className="card" style={{ padding: '1.5rem', background: 'var(--surface-color)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CreditCard size={18} style={{ color: '#8b5cf6' }} /> Buku Besar Koperasi &amp; Bank Sampah
                  </h3>
                  <p style={{ margin: '0.2rem 0 0', color: '#94a3b8', fontSize: '0.8rem' }}>
                    Log transaksi deterministik dengan enkripsi SHA-256 untuk audit akuntabilitas pulau.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={loadLedger}
                  disabled={loadingLedger}
                  className="btn btn-secondary"
                  style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}
                >
                  <RefreshCw size={13} className={loadingLedger ? 'animate-spin' : ''} /> Muat Ulang
                </button>
              </div>

              {ledgerTransactions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#64748b', fontSize: '0.85rem' }}>
                  Belum ada catatan transaksi di buku besar.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)', color: '#94a3b8', textAlign: 'left' }}>
                        <th style={{ padding: '0.55rem 0.6rem' }}>Waktu</th>
                        <th style={{ padding: '0.55rem 0.6rem' }}>Kode / Tipe</th>
                        <th style={{ padding: '0.55rem 0.6rem' }}>Komoditas / Item</th>
                        <th style={{ padding: '0.55rem 0.6rem' }}>Kuantitas</th>
                        <th style={{ padding: '0.55rem 0.6rem' }}>Nilai (Rp)</th>
                        <th style={{ padding: '0.55rem 0.6rem' }}>Dampak Air</th>
                        <th style={{ padding: '0.55rem 0.6rem' }}>Receipt Hash</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ledgerTransactions.map((trx) => (
                        <tr key={trx.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                          <td style={{ padding: '0.55rem 0.6rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                            {new Date(trx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td style={{ padding: '0.55rem 0.6rem', fontWeight: 700, color: '#f8fafc' }}>
                            <span style={{ fontSize: '0.7rem', color: '#38bdf8' }}>{trx.transaction_type}</span>
                            <div style={{ fontSize: '0.68rem', color: '#64748b', fontFamily: 'monospace' }}>
                              {trx.transaction_code}
                            </div>
                          </td>
                          <td style={{ padding: '0.55rem 0.6rem', color: '#e2e8f0', fontWeight: 600 }}>
                            {trx.item_name}
                          </td>
                          <td style={{ padding: '0.55rem 0.6rem', color: '#f8fafc', fontWeight: 700 }}>
                            {trx.weight_or_volume.toFixed(1)} {trx.transaction_type === 'REDEEM_WATER' ? 'L' : 'Kg'}
                          </td>
                          <td style={{ padding: '0.55rem 0.6rem', color: '#10b981', fontWeight: 700 }}>
                            {trx.monetary_value_rp > 0 ? `Rp ${trx.monetary_value_rp.toLocaleString()}` : '—'}
                          </td>
                          <td style={{ padding: '0.55rem 0.6rem', fontWeight: 700 }}>
                            {trx.water_quota_impact_ltr > 0 ? (
                              <span style={{ color: '#06b6d4' }}>+{trx.water_quota_impact_ltr} L</span>
                            ) : trx.water_quota_impact_ltr < 0 ? (
                              <span style={{ color: '#f87171' }}>{trx.water_quota_impact_ltr} L</span>
                            ) : (
                              <span style={{ color: '#64748b' }}>0</span>
                            )}
                          </td>
                          <td style={{ padding: '0.55rem 0.6rem', fontFamily: 'monospace', color: '#94a3b8', fontSize: '0.68rem' }}>
                            {trx.receipt_hash.slice(0, 10)}...{trx.receipt_hash.slice(-6)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
