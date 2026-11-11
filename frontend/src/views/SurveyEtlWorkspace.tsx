import React, { useEffect, useState } from 'react'
import {
  FileText,
  Database,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Send,
  Plus,
  Trash2,
  MapPin,
  Sparkles,
  Layers,
  Activity,
  Info,
} from 'lucide-react'
import {
  SurveyItem,
  SurveyStats,
  ProblemDomain,
  UrgencyLevel,
  submitSurvey,
  getSurveys,
  runETLMigration,
  getSurveyStats,
  seedSampleSurveys,
} from '../services/survei'

interface SurveyEtlWorkspaceProps {
  onNavigateToMap?: () => void
}

const ISLAND_PRESETS: Record<string, { lat: number; lng: number; defaultVillage: string }> = {
  'Pulau Neira': { lat: -4.5245, lng: 129.9048, defaultVillage: 'Desa Nusantara' },
  'Pulau Banda Besar': { lat: -4.5412, lng: 129.9011, defaultVillage: 'Desa Lonthoir' },
  'Pulau Hatta': { lat: -4.591, lng: 129.988, defaultVillage: 'Kampung Lama' },
  'Pulau Ay': { lat: -4.529, lng: 129.837, defaultVillage: 'Desa Ay' },
  'Pulau Gunung Api': { lat: -4.522, lng: 129.885, defaultVillage: 'Kawasan Konservasi Vulkanik' },
  'Pulau Rhun': { lat: -4.556, lng: 129.721, defaultVillage: 'Desa Rhun' },
}

const PRESET_TEMPLATES: Record<
  ProblemDomain,
  { label: string; fields: Array<{ key: string; value: string }> }
> = {
  AIR_DAN_SAMPAH: {
    label: 'Krisis Air Payau & Sampah Plastik',
    fields: [
      { key: 'sumber_air_utama', value: 'Tadah hujan dan sumur gali payau' },
      { key: 'kadar_tds_sumur_ppm', value: '2650' },
      { key: 'pengeluaran_beli_air_per_bulan_rp', value: '300000' },
      { key: 'timbulan_sampah_botol_plastik_kg', value: '12.5' },
    ],
  },
  ENERGI: {
    label: 'PLTS & Pemadaman Listrik Diesel',
    fields: [
      { key: 'sistem_energi', value: 'PLTS Off-Grid Komunal 15 kWp' },
      { key: 'kondisi_baterai', value: 'SoC drop ke 35% sebelum jam 21:00 WIT' },
      { key: 'durasi_pemadaman_jam', value: '8' },
      { key: 'penggunaan_genset_solar_liter', value: '25' },
    ],
  },
  EKONOMI: {
    label: 'Potensi Kebun Pala & UMKM',
    fields: [
      { key: 'luas_kebun_ha', value: '2.5' },
      { key: 'populasi_pohon_pala', value: '180' },
      { key: 'kualitas_biji_pala', value: 'Super Grade A (kadar air < 10%)' },
      { key: 'kelompok_tani', value: 'Poktan Mandiri Banda' },
    ],
  },
  WISATA: {
    label: 'Potensi Wisata & Homestay',
    fields: [
      { key: 'tipe_daya_tarik', value: 'Spot Snorkeling & Homestay Ramah Lingkungan' },
      { key: 'ketersediaan_air_ro', value: 'Ada dari galon Koperasi' },
      { key: 'aksesibilitas_dermaga_menit', value: '10' },
    ],
  },
  BUDAYA: {
    label: 'Inventarisasi Cagar Budaya',
    fields: [
      { key: 'tahun_estimasi', value: '1650' },
      { key: 'kondisi_fisik', value: 'Perlu restorasi struktur batu karang' },
      { key: 'rekomendasi_tindakan', value: 'Pemasangan QR Digital Passport' },
    ],
  },
}

export const SurveyEtlWorkspace: React.FC<SurveyEtlWorkspaceProps> = ({ onNavigateToMap }) => {
  const [activeTab, setActiveTab] = useState<'survei' | 'etl'>('survei')
  const [surveys, setSurveys] = useState<SurveyItem[]>([])
  const [stats, setStats] = useState<SurveyStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Form State
  const [collectorName, setCollectorName] = useState('Syafa Nailah Mufidah (KKN-PPM UGM)')
  const [problemDomain, setProblemDomain] = useState<ProblemDomain>('AIR_DAN_SAMPAH')
  const [islandName, setIslandName] = useState('Pulau Banda Besar')
  const [villageName, setVillageName] = useState('Desa Lonthoir')
  const [rtRw, setRtRw] = useState('RT 03 / RW 01')
  const [latitude, setLatitude] = useState(-4.5412)
  const [longitude, setLongitude] = useState(129.9011)
  const [title, setTitle] = useState('Krisis Air Payau & Sumur Galian Warga Lonthoir')
  const [urgencyLevel, setUrgencyLevel] = useState<UrgencyLevel>('KRITIS')
  const [notes, setNotes] = useState('Warga terpaksa menyeberang ke Neira untuk membeli galon isi ulang saat kemarau.')
  const [customFields, setCustomFields] = useState<Array<{ key: string; value: string }>>([
    { key: 'sumber_air_utama', value: 'Tadah hujan dan sumur gali payau' },
    { key: 'kadar_tds_sumur_ppm', value: '2650' },
    { key: 'pengeluaran_beli_air_per_bulan_rp', value: '300000' },
    { key: 'timbulan_sampah_botol_plastik_kg', value: '4.5' },
  ])

  // ETL Filter State
  const [domainFilter, setDomainFilter] = useState<string>('ALL')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [isMigrating, setIsMigrating] = useState(false)
  const [selectedSurveyForModal, setSelectedSurveyForModal] = useState<SurveyItem | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [surveyList, surveyStats] = await Promise.all([
        getSurveys({
          problem_domain: domainFilter === 'ALL' ? undefined : domainFilter,
          etl_status: statusFilter === 'ALL' ? undefined : statusFilter,
        }),
        getSurveyStats(),
      ])
      setSurveys(surveyList)
      setStats(surveyStats)
    } catch (err: any) {
      console.error(err)
      setActionMsg({ type: 'error', text: err.message || 'Gagal memuat data survei.' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [domainFilter, statusFilter])

  const handleIslandChange = (newIsland: string) => {
    setIslandName(newIsland)
    const preset = ISLAND_PRESETS[newIsland]
    if (preset) {
      setLatitude(preset.lat)
      setLongitude(preset.lng)
      setVillageName(preset.defaultVillage)
    }
  }

  const applyTemplate = (domain: ProblemDomain) => {
    const tmpl = PRESET_TEMPLATES[domain]
    if (tmpl) {
      setCustomFields(tmpl.fields.map((f) => ({ ...f })))
    }
  }

  const addCustomField = () => {
    setCustomFields([...customFields, { key: '', value: '' }])
  }

  const updateCustomField = (index: number, key: string, value: string) => {
    const updated = [...customFields]
    updated[index] = { key, value }
    setCustomFields(updated)
  }

  const removeCustomField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index))
  }

  const handleSubmitSurvey = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      setActionMsg(null)

      const flexibleAttrs: Record<string, any> = {}
      customFields.forEach((f) => {
        if (f.key.trim()) {
          const num = Number(f.value)
          flexibleAttrs[f.key.trim()] = !isNaN(num) && f.value.trim() !== '' ? num : f.value.trim()
        }
      })

      const created = await submitSurvey({
        collector_name: collectorName,
        problem_domain: problemDomain,
        island_name: islandName,
        village_name: villageName,
        rt_rw: rtRw,
        latitude,
        longitude,
        title,
        urgency_level: urgencyLevel,
        flexible_attributes: flexibleAttrs,
        notes,
      })

      setActionMsg({
        type: 'success',
        text: `Survei berhasil disimpan ke staging NoSQL/MongoDB dengan kode ${created.survey_code}! Siap ditransformasikan oleh Pipa ETL.`,
      })
      fetchData()
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message || 'Gagal menyimpan survei.' })
    } finally {
      setLoading(false)
    }
  }

  const handleRunETL = async () => {
    try {
      setIsMigrating(true)
      setActionMsg(null)
      const res = await runETLMigration({
        problem_domain: domainFilter === 'ALL' ? undefined : domainFilter,
        auto_promote_spatial: true,
      })
      setActionMsg({
        type: 'success',
        text: `${res.message} (${res.migrated_count} termigrasi, ${res.skipped_count} dilewati). Data kini aktif di Peta 7-Layer PostGIS.`,
      })
      fetchData()
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message || 'Gagal menjalankan pipa ETL.' })
    } finally {
      setIsMigrating(false)
    }
  }

  const handleSeedSamples = async () => {
    try {
      setLoading(true)
      setActionMsg(null)
      const res = await seedSampleSurveys()
      setActionMsg({
        type: 'success',
        text: `${res.message} (${res.seeded_count} data baru disemai).`,
      })
      fetchData()
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message || 'Gagal menyemai survei sampel.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div
        className="app-card"
        style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(6, 182, 212, 0.05) 100%)',
          borderColor: 'rgba(16, 185, 129, 0.3)',
          padding: '1.75rem',
          marginBottom: '1.5rem',
          borderRadius: '16px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Database size={22} color="#10b981" />
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: '#f8fafc', letterSpacing: '-0.02em' }}>
                  Pemetaan Masalah Dinamis & Pipa ETL Hybrid Database
                </h1>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
                  Mandat Syafa Nailah Mufidah & Fauzan Arisanto (SRS 6.1, 9.1 & BAB XI) • NoSQL Staging ➔ PostGIS 7-Layer
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {onNavigateToMap && (
              <button
                onClick={onNavigateToMap}
                style={{
                  background: 'rgba(6, 182, 212, 0.15)',
                  border: '1px solid rgba(6, 182, 212, 0.4)',
                  color: '#06b6d4',
                  padding: '0.6rem 1rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                <Layers size={16} /> Buka Peta 7-Layer
              </button>
            )}
            <button
              onClick={handleSeedSamples}
              disabled={loading}
              style={{
                background: 'rgba(139, 92, 246, 0.15)',
                border: '1px solid rgba(139, 92, 246, 0.4)',
                color: '#a78bfa',
                padding: '0.6rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              <Sparkles size={16} /> Semai Survei Sampel
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
          <button
            onClick={() => setActiveTab('survei')}
            style={{
              background: activeTab === 'survei' ? '#10b981' : 'rgba(255,255,255,0.05)',
              color: activeTab === 'survei' ? '#080c14' : '#94a3b8',
              border: 'none',
              padding: '0.55rem 1.1rem',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <FileText size={16} /> 1. Input Survei Lapangan Fleksibel (NoSQL / MongoDB)
          </button>
          <button
            onClick={() => setActiveTab('etl')}
            style={{
              background: activeTab === 'etl' ? '#06b6d4' : 'rgba(255,255,255,0.05)',
              color: activeTab === 'etl' ? '#080c14' : '#94a3b8',
              border: 'none',
              padding: '0.55rem 1.1rem',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <RefreshCw size={16} /> 2. Manajer Pipa ETL & Validasi PostGIS
            {stats && stats.pending_etl > 0 && (
              <span
                style={{
                  background: '#f59e0b',
                  color: '#080c14',
                  fontSize: '0.7rem',
                  padding: '0.1rem 0.45rem',
                  borderRadius: '999px',
                  fontWeight: 800,
                }}
              >
                {stats.pending_etl} Pending
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Action Notification Message */}
      {actionMsg && (
        <div
          style={{
            padding: '1rem',
            borderRadius: '10px',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '0.9rem',
            background: actionMsg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${actionMsg.type === 'success' ? '#10b981' : '#ef4444'}`,
            color: actionMsg.type === 'success' ? '#34d399' : '#f87171',
          }}
        >
          {actionMsg.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
          <span>{actionMsg.text}</span>
        </div>
      )}

      {/* TAB 1: FORMULIR SURVEI LAPANGAN */}
      {activeTab === 'survei' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>
          {/* Main Form Card */}
          <div className="app-card" style={{ padding: '1.75rem', borderRadius: '14px' }}>
            <h2 style={{ fontSize: '1.15rem', color: '#f8fafc', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={18} color="#10b981" /> Formulir Survei Dinamis Masalah Kepulauan
            </h2>

            <form onSubmit={handleSubmitSurvey}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
                    Nama Peneliti / Surveyor
                  </label>
                  <input
                    type="text"
                    required
                    value={collectorName}
                    onChange={(e) => setCollectorName(e.target.value)}
                    className="app-input"
                    style={{ width: '100%', padding: '0.65rem 0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
                    Domain Masalah
                  </label>
                  <select
                    value={problemDomain}
                    onChange={(e) => {
                      const dom = e.target.value as ProblemDomain
                      setProblemDomain(dom)
                      applyTemplate(dom)
                    }}
                    className="app-input"
                    style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#0f172a' }}
                  >
                    <option value="AIR_DAN_SAMPAH">💧 Air Bersih & Sampah Plastik</option>
                    <option value="ENERGI">⚡ Energi & Kelistrikan Desa</option>
                    <option value="EKONOMI">🥥 Ekonomi & Koperasi Hatta</option>
                    <option value="WISATA">🏖️ Pariwisata & Homestay</option>
                    <option value="BUDAYA">🏛️ Cagar Budaya & Sejarah</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
                    Pulau Wilayah Survei
                  </label>
                  <select
                    value={islandName}
                    onChange={(e) => handleIslandChange(e.target.value)}
                    className="app-input"
                    style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#0f172a' }}
                  >
                    {Object.keys(ISLAND_PRESETS).map((isl) => (
                      <option key={isl} value={isl}>
                        {isl}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
                    Desa / Negeri Administratif
                  </label>
                  <input
                    type="text"
                    value={villageName}
                    onChange={(e) => setVillageName(e.target.value)}
                    className="app-input"
                    style={{ width: '100%', padding: '0.65rem 0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
                    RT / RW / Dusun
                  </label>
                  <input
                    type="text"
                    value={rtRw}
                    onChange={(e) => setRtRw(e.target.value)}
                    className="app-input"
                    style={{ width: '100%', padding: '0.65rem 0.85rem' }}
                  />
                </div>
              </div>

              {/* Title & Urgency */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
                    Judul Temuan / Masalah Lapangan
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Contoh: Krisis Air Payau & Sumur Galian"
                    className="app-input"
                    style={{ width: '100%', padding: '0.65rem 0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
                    Tingkat Urgensi
                  </label>
                  <select
                    value={urgencyLevel}
                    onChange={(e) => setUrgencyLevel(e.target.value as UrgencyLevel)}
                    className="app-input"
                    style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#0f172a' }}
                  >
                    <option value="RENDAH">🟢 Rendah</option>
                    <option value="SEDANG">🟡 Sedang</option>
                    <option value="TINGGI">🟠 Tinggi</option>
                    <option value="KRITIS">🔴 Kritis (Mendesak)</option>
                  </select>
                </div>
              </div>

              {/* GPS Coordinates */}
              <div
                style={{
                  background: 'rgba(0,0,0,0.25)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '10px',
                  padding: '1rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#06b6d4', fontSize: '0.85rem', fontWeight: 600 }}>
                    <MapPin size={16} /> Koordinat Geografis WGS 84 (PostGIS Target)
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Banda Bounding Box: Lat [-4.65, -4.45], Lng [129.80, 130.05]
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                      Latitude (Garis Lintang)
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={latitude}
                      onChange={(e) => setLatitude(parseFloat(e.target.value))}
                      className="app-input"
                      style={{ width: '100%', padding: '0.55rem 0.75rem', fontFamily: 'monospace' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                      Longitude (Garis Bujur)
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={longitude}
                      onChange={(e) => setLongitude(parseFloat(e.target.value))}
                      className="app-input"
                      style={{ width: '100%', padding: '0.55rem 0.75rem', fontFamily: 'monospace' }}
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Key-Value Attributes Builder */}
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.03)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  borderRadius: '10px',
                  padding: '1.25rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '0.9rem', color: '#34d399', fontWeight: 600 }}>
                      Atribut Dinamis NoSQL (Flexible Attributes JSON)
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>
                      Tambahkan pasangan Key-Value secara bebas tanpa dibatasi skema kolom kaku
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addCustomField}
                    style={{
                      background: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid rgba(16, 185, 129, 0.4)',
                      color: '#10b981',
                      padding: '0.4rem 0.75rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <Plus size={14} /> Tambah Kolom
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {customFields.map((field, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 36px', gap: '0.5rem', alignItems: 'center' }}>
                      <input
                        type="text"
                        placeholder="Nama Kunci (e.g. kadar_tds_sumur_ppm)"
                        value={field.key}
                        onChange={(e) => updateCustomField(idx, e.target.value, field.value)}
                        className="app-input"
                        style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', fontFamily: 'monospace' }}
                      />
                      <input
                        type="text"
                        placeholder="Nilai (e.g. 2650 atau teks)"
                        value={field.value}
                        onChange={(e) => updateCustomField(idx, field.key, e.target.value)}
                        className="app-input"
                        style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => removeCustomField(idx)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.15)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: '#f87171',
                          height: '36px',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
                  Catatan Lapangan & Rekomendasi Solusi
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="app-input"
                  style={{ width: '100%', padding: '0.65rem 0.85rem' }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  border: 'none',
                  color: '#080c14',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  padding: '0.85rem 1.75rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                }}
              >
                <Send size={16} /> Simpan ke Staging NoSQL (MongoDB / raw_surveys)
              </button>
            </form>
          </div>

          {/* Sidebar / Info & Preset Guide */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Quick Template Card */}
            <div className="app-card" style={{ padding: '1.25rem', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '0.9rem', color: '#f8fafc', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={16} color="#f59e0b" /> Template Preset Lapangan
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.85rem' }}>
                Pilih template untuk mengisi otomatis atribut dinamis sesuai domain riset:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {(Object.keys(PRESET_TEMPLATES) as ProblemDomain[]).map((dom) => (
                  <button
                    key={dom}
                    type="button"
                    onClick={() => {
                      setProblemDomain(dom)
                      applyTemplate(dom)
                    }}
                    style={{
                      background: problemDomain === dom ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${problemDomain === dom ? '#10b981' : 'rgba(255,255,255,0.08)'}`,
                      color: problemDomain === dom ? '#34d399' : '#cbd5e1',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>{PRESET_TEMPLATES[dom].label}</span>
                    <ArrowRight size={12} />
                  </button>
                ))}
              </div>
            </div>

            {/* Architecture Explanation Card */}
            <div className="app-card" style={{ padding: '1.25rem', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.5)' }}>
              <h3 style={{ fontSize: '0.85rem', color: '#38bdf8', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Info size={14} /> Arsitektur Hybrid Database
              </h3>
              <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.6 }}>
                <li>
                  <strong style={{ color: '#f8fafc' }}>Tahap 1 (Staging NoSQL):</strong> Formulir survei menyimpan dokumen fleksibel (JSON) tanpa migrasi skema tabel.
                </li>
                <li>
                  <strong style={{ color: '#f8fafc' }}>Tahap 2 (ETL Pipeline):</strong> Validasi koordinat Bounding Box Banda dan transformasi ke 7-Layer Spasial PostGIS.
                </li>
                <li>
                  <strong style={{ color: '#f8fafc' }}>Tahap 3 (Peta Leaflet):</strong> Ditampilkan secara langsung di peta interaktif dengan GeoJSON standar RFC 7946.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MANAJER PIPA ETL */}
      {activeTab === 'etl' && (
        <div>
          {/* Top Statistics Bento */}
          {stats && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="app-card" style={{ padding: '1.25rem', borderRadius: '12px' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total Dokumen Survei</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', marginTop: '0.35rem' }}>
                  {stats.total_surveys}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.25rem' }}>
                  Dari 5 pulau Kepulauan Banda
                </div>
              </div>

              <div className="app-card" style={{ padding: '1.25rem', borderRadius: '12px', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
                <span style={{ fontSize: '0.75rem', color: '#f59e0b' }}>Pending Migrasi ETL</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.35rem' }}>
                  {stats.pending_etl}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                  Menunggu verifikasi admin desa
                </div>
              </div>

              <div className="app-card" style={{ padding: '1.25rem', borderRadius: '12px', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                <span style={{ fontSize: '0.75rem', color: '#34d399' }}>Termigrasi ke PostGIS</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34d399', marginTop: '0.35rem' }}>
                  {stats.migrated_to_postgres}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                  Aktif pada 7 Layer Spasial
                </div>
              </div>

              <div className="app-card" style={{ padding: '1.25rem', borderRadius: '12px', borderColor: 'rgba(6, 182, 212, 0.3)' }}>
                <span style={{ fontSize: '0.75rem', color: '#06b6d4' }}>Rasio Transformasi</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#06b6d4', marginTop: '0.35rem' }}>
                  {stats.total_surveys > 0
                    ? Math.round((stats.migrated_to_postgres / stats.total_surveys) * 100)
                    : 0}
                  %
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                  Kesiapan spasial desa
                </div>
              </div>
            </div>
          )}

          {/* ETL Action & Filter Toolbar */}
          <div
            className="app-card"
            style={{
              padding: '1.25rem',
              borderRadius: '12px',
              marginBottom: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Filter Domain:</span>
                <select
                  value={domainFilter}
                  onChange={(e) => setDomainFilter(e.target.value)}
                  className="app-input"
                  style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem', background: '#0f172a' }}
                >
                  <option value="ALL">Semua Domain</option>
                  <option value="AIR_DAN_SAMPAH">💧 Air & Sampah</option>
                  <option value="ENERGI">⚡ Energi</option>
                  <option value="EKONOMI">🥥 Ekonomi</option>
                  <option value="WISATA">🏖️ Wisata</option>
                  <option value="BUDAYA">🏛️ Budaya</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Status ETL:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="app-input"
                  style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem', background: '#0f172a' }}
                >
                  <option value="ALL">Semua Status</option>
                  <option value="PENDING">Pending Migrasi</option>
                  <option value="MIGRATED_TO_POSTGRES">Sudah Termigrasi</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <button
                onClick={fetchData}
                disabled={loading}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#94a3b8',
                  padding: '0.6rem 0.9rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.8rem',
                }}
              >
                <RefreshCw size={14} /> Refresh
              </button>

              <button
                onClick={handleRunETL}
                disabled={isMigrating || loading}
                style={{
                  background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                  border: 'none',
                  color: '#080c14',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  padding: '0.65rem 1.25rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 14px rgba(6, 182, 212, 0.3)',
                }}
              >
                <RefreshCw size={16} className={isMigrating ? 'spin' : ''} />
                {isMigrating ? 'Memproses Pipa ETL...' : 'Eksekusi Pipa ETL ke PostGIS'}
              </button>
            </div>
          </div>

          {/* Raw Surveys Table */}
          <div className="app-card" style={{ padding: '1.25rem', borderRadius: '14px', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
                  <th style={{ padding: '0.75rem' }}>Kode Survei</th>
                  <th style={{ padding: '0.75rem' }}>Judul Temuan</th>
                  <th style={{ padding: '0.75rem' }}>Domain</th>
                  <th style={{ padding: '0.75rem' }}>Pulau / Lokasi</th>
                  <th style={{ padding: '0.75rem' }}>Koordinat</th>
                  <th style={{ padding: '0.75rem' }}>Urgensi</th>
                  <th style={{ padding: '0.75rem' }}>Status ETL</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {surveys.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                      Tidak ada data survei ditemukan untuk filter ini. Klik "Semai Survei Sampel" untuk memuat data awal.
                    </td>
                  </tr>
                ) : (
                  surveys.map((s) => (
                    <tr
                      key={s.id}
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '0.75rem', fontFamily: 'monospace', fontWeight: 600, color: '#38bdf8' }}>
                        {s.survey_code}
                      </td>
                      <td style={{ padding: '0.75rem', fontWeight: 600, color: '#f8fafc' }}>
                        {s.title}
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 400 }}>
                          oleh: {s.collector_name}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <span
                          style={{
                            padding: '0.2rem 0.55rem',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            background:
                              s.problem_domain === 'AIR_DAN_SAMPAH'
                                ? 'rgba(6, 182, 212, 0.15)'
                                : s.problem_domain === 'ENERGI'
                                ? 'rgba(245, 158, 11, 0.15)'
                                : s.problem_domain === 'EKONOMI'
                                ? 'rgba(16, 185, 129, 0.15)'
                                : 'rgba(139, 92, 246, 0.15)',
                            color:
                              s.problem_domain === 'AIR_DAN_SAMPAH'
                                ? '#06b6d4'
                                : s.problem_domain === 'ENERGI'
                                ? '#f59e0b'
                                : s.problem_domain === 'EKONOMI'
                                ? '#10b981'
                                : '#a78bfa',
                          }}
                        >
                          {s.problem_domain}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', color: '#cbd5e1' }}>
                        {s.island_name}
                        {s.village_name && <span style={{ color: '#64748b' }}> • {s.village_name}</span>}
                      </td>
                      <td style={{ padding: '0.75rem', fontFamily: 'monospace', fontSize: '0.75rem', color: '#94a3b8' }}>
                        {s.latitude.toFixed(4)}, {s.longitude.toFixed(4)}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <span
                          style={{
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            background:
                              s.urgency_level === 'KRITIS'
                                ? 'rgba(239, 68, 68, 0.2)'
                                : s.urgency_level === 'TINGGI'
                                ? 'rgba(245, 158, 11, 0.2)'
                                : 'rgba(16, 185, 129, 0.15)',
                            color:
                              s.urgency_level === 'KRITIS'
                                ? '#f87171'
                                : s.urgency_level === 'TINGGI'
                                ? '#fbbf24'
                                : '#34d399',
                          }}
                        >
                          {s.urgency_level}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        {s.etl_status === 'MIGRATED_TO_POSTGRES' ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              color: '#34d399',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                            }}
                          >
                            <CheckCircle2 size={14} /> PostGIS Active
                          </span>
                        ) : (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              color: '#f59e0b',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                            }}
                          >
                            <Activity size={14} /> Pending ETL
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <button
                          onClick={() => setSelectedSurveyForModal(s)}
                          style={{
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: '#cbd5e1',
                            padding: '0.35rem 0.7rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                          }}
                        >
                          Inspeksi Atribut
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* JSON Attribute Modal */}
      {selectedSurveyForModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(6px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
          onClick={() => setSelectedSurveyForModal(null)}
        >
          <div
            className="app-card"
            style={{
              maxWidth: '600px',
              width: '100%',
              background: '#0d1527',
              borderRadius: '16px',
              padding: '1.75rem',
              border: '1px solid rgba(6, 182, 212, 0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#06b6d4', fontFamily: 'monospace' }}>
                  {selectedSurveyForModal.survey_code}
                </span>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#f8fafc' }}>
                  {selectedSurveyForModal.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedSurveyForModal(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '1.25rem',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>
                Lokasi & Surveyor:
              </span>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1' }}>
                {selectedSurveyForModal.island_name} ({selectedSurveyForModal.village_name || '-'}) • Lat: {selectedSurveyForModal.latitude}, Lng: {selectedSurveyForModal.longitude}
              </p>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.35rem' }}>
                Flexible Attributes (NoSQL / MongoDB Staging JSON):
              </span>
              <pre
                style={{
                  background: '#080c14',
                  padding: '1rem',
                  borderRadius: '8px',
                  color: '#34d399',
                  fontSize: '0.8rem',
                  overflowX: 'auto',
                  border: '1px solid rgba(255,255,255,0.08)',
                  margin: 0,
                  fontFamily: 'monospace',
                }}
              >
                {JSON.stringify(selectedSurveyForModal.flexible_attributes, null, 2)}
              </pre>
            </div>

            {selectedSurveyForModal.notes && (
              <div style={{ marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>
                  Catatan Lapangan:
                </span>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#94a3b8', fontStyle: 'italic' }}>
                  "{selectedSurveyForModal.notes}"
                </p>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              {onNavigateToMap && selectedSurveyForModal.etl_status === 'MIGRATED_TO_POSTGRES' && (
                <button
                  onClick={() => {
                    setSelectedSurveyForModal(null)
                    onNavigateToMap()
                  }}
                  style={{
                    background: '#06b6d4',
                    color: '#080c14',
                    border: 'none',
                    padding: '0.55rem 1rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <MapPin size={16} /> Buka di Peta 7-Layer
                </button>
              )}
              <button
                onClick={() => setSelectedSurveyForModal(null)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: '#f8fafc',
                  border: 'none',
                  padding: '0.55rem 1rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
