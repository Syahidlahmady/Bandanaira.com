import React, { useState, useEffect } from 'react'
import {
  Sparkles,
  Award,
  Compass,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Bot,
  Send,
} from 'lucide-react'
import {
  dssService,
  SAWCalculationResponse,
  TourismPreferences,
  CrisisPriorityWeights,
} from '../services/dss'

interface DssChatMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
  topName?: string
  topScorePercent?: string
  weightsSummary?: string
}

const TOURISM_QUICK_PROMPTS = [
  'Cari penginapan hemat biaya dengan air RO di Pulau Neira',
  'Prioritaskan fasilitas air bersih RO dan listrik surya lengkap',
  'Suasana alam, snorkeling, dan cagar budaya di Pulau Hatta',
  'Penginapan paling dekat dermaga utama di Pulau Banda Besar',
]

const CRISIS_QUICK_PROMPTS = [
  'Prioritaskan desa dengan kualitas air paling kritis (TDS tinggi)',
  'Fokus bantuan pada desa berpenduduk padat yang butuh air segera',
  'Desa terpencil yang jauh dari sumber air dan sering padam listrik',
  'Kalkulasi seimbang antara krisis TDS, populasi, jarak air, dan listrik',
]

const normalizeWeightMap = <T extends Record<string, number>>(raw: T): T => {
  const keys = Object.keys(raw) as (keyof T)[]
  const total = keys.reduce((sum, key) => sum + (raw[key] || 0), 0) || 1
  const out = {} as T
  for (const key of keys) {
    out[key] = (Math.round(((raw[key] || 0) / total) * 20) / 20) as T[keyof T]
  }
  return out
}

const parseWorkspaceTourismPrompt = (
  prompt: string
): { prefs: TourismPreferences; explanation: string } => {
  const q = prompt.toLowerCase()
  let weightHarga = 0.25
  let weightJarak = 0.2
  let weightFasilitas = 0.3
  let weightDayaTarik = 0.25
  let maxBudget: number | undefined
  let islandFilter = ''
  const reasons: string[] = []

  if (/(hemat|murah|budget|terjangkau|ekonomis|ransel|backpacker)/.test(q)) {
    weightHarga = 0.45
    reasons.push('bobot biaya tarif hemat dinaikkan')
  }
  const ribuMatch = q.match(/\b(\d{3})\s*(rb|ribu)\b/)
  const jutaMatch = q.match(/\b(\d+(?:[.,]\d+)?)\s*(jt|juta)\b/)
  if (ribuMatch) {
    maxBudget = Number(ribuMatch[1]) * 1000
    reasons.push(`batas tarif Rp ${maxBudget.toLocaleString('id-ID')}`)
  } else if (jutaMatch) {
    maxBudget = Math.round(Number(jutaMatch[1].replace(',', '.')) * 1_000_000)
    reasons.push(`batas tarif Rp ${maxBudget.toLocaleString('id-ID')}`)
  }

  if (/(dekat|dermaga|pelabuhan|pusat|kota|cepat|jalan kaki)/.test(q)) {
    weightJarak = 0.4
    reasons.push('kedekatan ke dermaga utama diutamakan')
  }
  if (/(air|ro|surya|plts|listrik|fasilitas|nyaman|keluarga|genset)/.test(q)) {
    weightFasilitas = 0.45
    reasons.push('fasilitas air RO & daya surya diprioritaskan')
  }
  if (/(alam|snorkeling|selam|karang|sejarah|benteng|budaya|pala|pemandangan)/.test(q)) {
    weightDayaTarik = 0.45
    reasons.push('daya tarik cagar budaya & alam ditingkatkan')
  }

  if (/(neira|kota|belgica|nassau)/.test(q)) {
    islandFilter = 'Pulau Neira'
    reasons.push('filter wilayah Pulau Neira')
  } else if (/(banda besar|lonthoir|lontor|benteng hollandia)/.test(q)) {
    islandFilter = 'Pulau Banda Besar'
    reasons.push('filter wilayah Pulau Banda Besar')
  } else if (/(hatta|rozengain)/.test(q)) {
    islandFilter = 'Pulau Hatta'
    reasons.push('filter wilayah Pulau Hatta')
  } else if (/(\bai\b|pulau ai|pulau run|\brun\b)/.test(q)) {
    islandFilter = 'Pulau Ai'
    reasons.push('filter wilayah Pulau Ai')
  }

  const normalized = normalizeWeightMap({
    weight_harga: weightHarga,
    weight_jarak: weightJarak,
    weight_fasilitas: weightFasilitas,
    weight_daya_tarik: weightDayaTarik,
  })

  return {
    prefs: {
      ...normalized,
      max_budget_rp: maxBudget,
      island_filter: islandFilter,
    },
    explanation:
      reasons.length > 0
        ? `Preferensi dihitung ulang dengan ${reasons.join(', ')}.`
        : 'Menggunakan kalkulasi SAW berimbang untuk penginapan dan destinasi kepulauan Banda.',
  }
}

const parseWorkspaceCrisisPrompt = (
  prompt: string
): { weights: CrisisPriorityWeights; explanation: string } => {
  const q = prompt.toLowerCase()
  let weightTds = 0.35
  let weightPopulasi = 0.25
  let weightJarakAir = 0.2
  let weightPadamListrik = 0.2
  const reasons: string[] = []

  if (/(tds|asin|garam|payau|kualitas air|kritis|tercemar|sensor)/.test(q)) {
    weightTds = 0.55
    reasons.push('tingkat salinitas/TDS air diprioritaskan tinggi')
  }
  if (/(penduduk|populasi|warga|padat|jiwa|kk)/.test(q)) {
    weightPopulasi = 0.45
    reasons.push('jumlah penduduk terdampak menjadi bobot utama')
  }
  if (/(jauh|jarak|terpencil|akses air|angkut|dermaga)/.test(q)) {
    weightJarakAir = 0.4
    reasons.push('jarak angkut sumber air tawar diberi urgensi lebih')
  }
  if (/(listrik|padam|pln|genset|mati|energi|plts)/.test(q)) {
    weightPadamListrik = 0.4
    reasons.push('durasi pemadaman listrik diperberat')
  }

  const normalized = normalizeWeightMap({
    weight_tds: weightTds,
    weight_populasi: weightPopulasi,
    weight_jarak_air: weightJarakAir,
    weight_padam_listrik: weightPadamListrik,
  })

  return {
    weights: normalized,
    explanation:
      reasons.length > 0
        ? `Matriks urgensi desa diperbarui: ${reasons.join(', ')}.`
        : 'Menjalankan kalkulasi SAW prioritas krisis air & energi secara berimbang.',
  }
}

export const SmartPlannerWorkspace: React.FC = () => {
  const [activeDssMode, setActiveDssMode] = useState<'tourism' | 'crisis'>('tourism')
  const [loading, setLoading] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Mode 1: Tourism State
  const [tourismPrefs, setTourismPrefs] = useState<TourismPreferences>({
    weight_harga: 0.25,
    weight_jarak: 0.20,
    weight_fasilitas: 0.30,
    weight_daya_tarik: 0.25,
    max_budget_rp: undefined,
    island_filter: '',
  })
  const [tourismResults, setTourismResults] = useState<SAWCalculationResponse | null>(null)

  // Mode 2: Crisis State
  const [crisisWeights, setCrisisWeights] = useState<CrisisPriorityWeights>({
    weight_tds: 0.35,
    weight_populasi: 0.25,
    weight_jarak_air: 0.20,
    weight_padam_listrik: 0.20,
  })
  const [crisisResults, setCrisisResults] = useState<SAWCalculationResponse | null>(null)

  const handleRunTourismSAW = async () => {
    setLoading(true)
    setErrorMsg(null)
    try {
      const res = await dssService.calculateTourismRecommendation(tourismPrefs)
      setTourismResults(res)
    } catch (err: unknown) {
      if (err instanceof Error) setErrorMsg(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRunCrisisSAW = async () => {
    setLoading(true)
    setErrorMsg(null)
    try {
      const res = await dssService.calculateCrisisPriority(crisisWeights)
      setCrisisResults(res)
    } catch (err: unknown) {
      if (err instanceof Error) setErrorMsg(err.message)
    } finally {
      setLoading(false)
    }
  }

  const [chatInput, setChatInput] = useState<string>('')
  const [chatHistory, setChatHistory] = useState<Record<'tourism' | 'crisis', DssChatMessage[]>>({
    tourism: [
      {
        id: 'init-tourism',
        role: 'assistant',
        text: 'Halo! Saya Asisten Kalkulator DSS SAW Wisata Banda. Ceritakan budget, kebutuhan fasilitas air RO/listrik surya, atau pulau tujuan Anda—saya akan menyusun bobot SAW secara otomatis dan memperbarui peringkat di bawah.',
      },
    ],
    crisis: [
      {
        id: 'init-crisis',
        role: 'assistant',
        text: 'Halo! Saya Asisten Kalkulator DSS Ketahanan Desa. Sebutkan fokus penanggulangan (misalnya kadar TDS kritis, kepadatan warga, jarak angkut air, atau pemadaman listrik) untuk mengkalkulasi peringkat urgensi desa.',
      },
    ],
  })

  const appendChatMessage = (mode: 'tourism' | 'crisis', msg: DssChatMessage) => {
    setChatHistory((prev) => ({
      ...prev,
      [mode]: [...prev[mode], msg],
    }))
  }

  const handleWorkspaceChatPrompt = async (rawPrompt: string) => {
    const prompt = rawPrompt.trim()
    if (!prompt || loading) return

    const mode = activeDssMode
    setChatInput('')
    setLoading(true)
    setErrorMsg(null)
    appendChatMessage(mode, {
      id: `user-${Date.now()}`,
      role: 'user',
      text: prompt,
    })

    try {
      if (mode === 'tourism') {
        const { prefs, explanation } = parseWorkspaceTourismPrompt(prompt)
        setTourismPrefs(prefs)
        const res = await dssService.calculateTourismRecommendation(prefs)
        setTourismResults(res)
        const nw = res.normalized_weights || {}
        const wHarga = nw.harga ?? nw.weight_harga ?? prefs.weight_harga ?? 0.25
        const wJarak = nw.jarak ?? nw.weight_jarak ?? prefs.weight_jarak ?? 0.2
        const wFasilitas = nw.fasilitas ?? nw.weight_fasilitas ?? prefs.weight_fasilitas ?? 0.3
        const wDayaTarik = nw.daya_tarik ?? nw.weight_daya_tarik ?? prefs.weight_daya_tarik ?? 0.25
        const weightsSummary = `Biaya ${Math.round(wHarga * 100)}% · Jarak ${Math.round(wJarak * 100)}% · Fasilitas RO ${Math.round(wFasilitas * 100)}% · Daya Tarik ${Math.round(wDayaTarik * 100)}%`
        appendChatMessage('tourism', {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          text: explanation,
          topName: res.top_recommendation?.name,
          topScorePercent: res.top_recommendation
            ? (res.top_recommendation.preference_score * 100).toFixed(1)
            : undefined,
          weightsSummary,
        })
      } else {
        const { weights, explanation } = parseWorkspaceCrisisPrompt(prompt)
        setCrisisWeights(weights)
        const res = await dssService.calculateCrisisPriority(weights)
        setCrisisResults(res)
        const nw = res.normalized_weights || {}
        const wTds = nw.tds ?? nw.weight_tds ?? weights.weight_tds ?? 0.35
        const wPop = nw.populasi ?? nw.weight_populasi ?? weights.weight_populasi ?? 0.25
        const wJarakAir = nw.jarak_air ?? nw.weight_jarak_air ?? weights.weight_jarak_air ?? 0.2
        const wListrik = nw.padam_listrik ?? nw.weight_padam_listrik ?? weights.weight_padam_listrik ?? 0.2
        const weightsSummary = `TDS ${Math.round(wTds * 100)}% · Populasi ${Math.round(wPop * 100)}% · Jarak Air ${Math.round(wJarakAir * 100)}% · Listrik ${Math.round(wListrik * 100)}%`
        appendChatMessage('crisis', {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          text: explanation,
          topName: res.top_recommendation?.name,
          topScorePercent: res.top_recommendation
            ? (res.top_recommendation.preference_score * 100).toFixed(1)
            : undefined,
          weightsSummary,
        })
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menghitung matriks DSS SAW.'
      setErrorMsg(msg)
      appendChatMessage(mode, {
        id: `bot-err-${Date.now()}`,
        role: 'assistant',
        text: `Maaf, kalkulasi API sedang terkendala (${msg}). Anda tetap dapat menyesuaikan bobot slider di bawah.`,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleWorkspaceChatSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    void handleWorkspaceChatPrompt(chatInput)
  }

  useEffect(() => {
    if (activeDssMode === 'tourism' && !tourismResults) {
      handleRunTourismSAW()
    } else if (activeDssMode === 'crisis' && !crisisResults) {
      handleRunCrisisSAW()
    }
  }, [activeDssMode])

  const openWhatsAppBooking = (altName: string, phone?: string) => {
    const targetPhone = phone || '6281234567891'
    const message = encodeURIComponent(
      `Halo Pengelola ${altName}, saya tertarik memesan penginapan melalui rekomendasi cerdas Ekosistem Digital Banda Neira (BST-NIRANA). Mohon informasi ketersediaan kamar.`
    )
    window.open(`https://wa.me/${targetPhone}?text=${message}`, '_blank')
  }

  return (
    <div className="workspace-container animate-fade-in">
      {/* Workspace Header */}
      <div className="workspace-header" style={{ marginBottom: '1.75rem' }}>
        <div>
          <span className="badge badge-emerald" style={{ marginBottom: '0.4rem', display: 'inline-flex', gap: '0.35rem' }}>
            <Sparkles size={12} /> Decision Support System (DSS SAW)
          </span>
          <h2 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 900, color: '#f8fafc', letterSpacing: '-0.02em' }}>
            Perencana Cerdas &amp; Ketahanan Pulau
          </h2>
          <p style={{ margin: '0.35rem 0 0', color: '#94a3b8', fontSize: '0.875rem' }}>
            Mesin optimasi keputusan multikriteria berbasis <b>Simple Additive Weighting (SAW)</b> untuk wisatawan dan pemerintah desa.
          </p>
        </div>

        {/* Segmented Mode Selector */}
        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(15, 23, 42, 0.8)', padding: '0.35rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <button
            type="button"
            onClick={() => setActiveDssMode('tourism')}
            style={{
              padding: '0.55rem 1.15rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              fontSize: '0.825rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              transition: 'all 0.2s',
              background: activeDssMode === 'tourism' ? 'linear-gradient(135deg, #10b981, #06b6d4)' : 'transparent',
              color: activeDssMode === 'tourism' ? '#ffffff' : '#94a3b8',
              boxShadow: activeDssMode === 'tourism' ? '0 0 15px rgba(16, 185, 129, 0.3)' : 'none',
            }}
          >
            <Compass size={15} /> Mode 1: Wisata &amp; Penginapan
          </button>
          <button
            type="button"
            onClick={() => setActiveDssMode('crisis')}
            style={{
              padding: '0.55rem 1.15rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              fontSize: '0.825rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              transition: 'all 0.2s',
              background: activeDssMode === 'crisis' ? 'linear-gradient(135deg, #f59e0b, #ef4444)' : 'transparent',
              color: activeDssMode === 'crisis' ? '#ffffff' : '#94a3b8',
              boxShadow: activeDssMode === 'crisis' ? '0 0 15px rgba(245, 158, 11, 0.3)' : 'none',
            }}
          >
            <AlertTriangle size={15} /> Mode 2: Prioritas Krisis Air &amp; Energi
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="alert alert-danger" style={{ marginBottom: '1.25rem' }}>
          {errorMsg}
        </div>
      )}

      {/* Interactive Chatbot DSS Calculator */}
      <section
        aria-label="Asisten Kalkulator Chatbot DSS"
        style={{
          background: '#FFFFFF',
          color: '#081D35',
          border: '1px solid #E2E8F0',
          borderRadius: '18px',
          padding: '1.35rem',
          marginBottom: '1.5rem',
          boxShadow: '0 8px 24px rgba(8, 29, 53, 0.06)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
            marginBottom: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: '#0f2c59',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Bot size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#081D35' }}>
                Asisten Kalkulator Chatbot DSS
              </h3>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: '#475569' }}>
                {activeDssMode === 'tourism'
                  ? 'Ketik preferensi budget, pulau, atau fasilitas — bobot SAW & peringkat terupdate otomatis.'
                  : 'Ketik prioritas krisis desa (TDS, penduduk, jarak air, pemadaman) — matriks urgensi terupdate otomatis.'}
              </p>
            </div>
          </div>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.3rem 0.75rem',
              borderRadius: '999px',
              background: activeDssMode === 'tourism' ? '#ECFDF5' : '#FEF3C7',
              color: activeDssMode === 'tourism' ? '#065F46' : '#92400E',
              fontSize: '0.72rem',
              fontWeight: 800,
              border: `1px solid ${activeDssMode === 'tourism' ? '#A7F3D0' : '#FDE68A'}`,
            }}
          >
            <Sparkles size={12} />
            {activeDssMode === 'tourism' ? 'Mode Wisata & Penginapan' : 'Mode Ketahanan Desa'}
          </span>
        </div>

        {/* Quick Prompt Scenarios */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.9rem' }}>
          {(activeDssMode === 'tourism' ? TOURISM_QUICK_PROMPTS : CRISIS_QUICK_PROMPTS).map((qPrompt) => (
            <button
              key={qPrompt}
              type="button"
              disabled={loading}
              onClick={() => void handleWorkspaceChatPrompt(qPrompt)}
              style={{
                background: '#F8FAFC',
                color: '#0f2c59',
                border: '1px solid #CBD5E1',
                borderRadius: '999px',
                padding: '0.35rem 0.85rem',
                fontSize: '0.74rem',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {qPrompt}
            </button>
          ))}
        </div>

        {/* Conversational Log */}
        <div
          style={{
            background: '#F7F5F0',
            border: '1px solid #E2E8F0',
            borderRadius: '14px',
            padding: '0.9rem',
            maxHeight: '260px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.7rem',
            marginBottom: '0.9rem',
          }}
        >
          {chatHistory[activeDssMode].map((msg) => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              <div
                style={{
                  maxWidth: '85%',
                  padding: '0.7rem 0.95rem',
                  borderRadius: '14px',
                  fontSize: '0.82rem',
                  lineHeight: 1.5,
                  background: msg.role === 'user' ? '#0f2c59' : '#FFFFFF',
                  color: msg.role === 'user' ? '#FFFFFF' : '#1E293B',
                  border: msg.role === 'user' ? 'none' : '1px solid #E2E8F0',
                  boxShadow: '0 1px 3px rgba(8, 29, 53, 0.05)',
                }}
              >
                <p style={{ margin: 0 }}>{msg.text}</p>
                {msg.topName && (
                  <div
                    style={{
                      marginTop: '0.5rem',
                      paddingTop: '0.45rem',
                      borderTop: '1px solid #E2E8F0',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.45rem',
                      alignItems: 'center',
                    }}
                  >
                    <span
                      style={{
                        background: '#ECFDF5',
                        color: '#065F46',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '999px',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                      }}
                    >
                      Peringkat #1: {msg.topName} ({msg.topScorePercent}%)
                    </span>
                    {msg.weightsSummary && (
                      <span style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 600 }}>
                        {msg.weightsSummary}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Prompt Input Form */}
        <form onSubmit={handleWorkspaceChatSubmit} style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            disabled={loading}
            placeholder={
              activeDssMode === 'tourism'
                ? 'Contoh: Cari homestay hemat air RO bersih di Pulau Neira budget 450rb...'
                : 'Contoh: Prioritaskan desa dengan TDS tinggi dan pemadaman listrik lama...'
            }
            style={{
              flex: '1 1 260px',
              padding: '0.65rem 0.95rem',
              borderRadius: '12px',
              border: '1px solid #CBD5E1',
              background: '#FFFFFF',
              color: '#081D35',
              fontSize: '0.84rem',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            disabled={loading || !chatInput.trim()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.65rem 1.2rem',
              borderRadius: '12px',
              border: 'none',
              background: loading || !chatInput.trim() ? '#94A3B8' : '#0f2c59',
              color: '#FFFFFF',
              fontSize: '0.83rem',
              fontWeight: 700,
              cursor: loading || !chatInput.trim() ? 'not-allowed' : 'pointer',
            }}
          >
            <Send size={15} />
            {loading ? 'Menghitung...' : 'Hitung SAW'}
          </button>
        </form>
      </section>

      {/* ========================================================================= */}
      {/* MODE 1: SMART TOURISM & ACCOMMODATION RECOMMENDATION */}
      {/* ========================================================================= */}
      {activeDssMode === 'tourism' && (
        <div>
          {/* Preference Tuning Control Panel */}
          <div className="app-card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                  Sesuaikan Bobot Preferensi Wisatawan
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0.25rem 0 0' }}>
                  Atur persentase kepentingan Anda terhadap harga, jarak, ketersediaan air tawar RO, dan pesona cagar budaya.
                </p>
              </div>
              <button
                type="button"
                onClick={handleRunTourismSAW}
                disabled={loading}
                className="btn btn-primary"
                style={{
                  padding: '0.6rem 1.35rem',
                  fontSize: '0.85rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                {loading ? 'Menghitung Matriks...' : 'Kalkulasi Rekomendasi SAW'}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                  <span style={{ color: '#cbd5e1', fontWeight: 600 }}>Biaya / Tarif Sewa (Cost)</span>
                  <span style={{ color: '#38bdf8', fontWeight: 700 }}>{Math.round((tourismPrefs.weight_harga || 0.25) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.60"
                  step="0.05"
                  value={tourismPrefs.weight_harga}
                  onChange={(e) => setTourismPrefs({ ...tourismPrefs, weight_harga: parseFloat(e.target.value) })}
                  style={{ width: '100%', accentColor: '#38bdf8' }}
                />
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Semakin murah tarif per malam, semakin disukai</span>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                  <span style={{ color: '#cbd5e1', fontWeight: 600 }}>Jarak ke Dermaga Utama (Cost)</span>
                  <span style={{ color: '#38bdf8', fontWeight: 700 }}>{Math.round((tourismPrefs.weight_jarak || 0.20) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.50"
                  step="0.05"
                  value={tourismPrefs.weight_jarak}
                  onChange={(e) => setTourismPrefs({ ...tourismPrefs, weight_jarak: parseFloat(e.target.value) })}
                  style={{ width: '100%', accentColor: '#38bdf8' }}
                />
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Semakin dekat ke pusat aktivitas pulau, semakin disukai</span>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                  <span style={{ color: '#cbd5e1', fontWeight: 600 }}>Fasilitas Air RO &amp; Surya (Benefit)</span>
                  <span style={{ color: '#10b981', fontWeight: 700 }}>{Math.round((tourismPrefs.weight_fasilitas || 0.30) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.60"
                  step="0.05"
                  value={tourismPrefs.weight_fasilitas}
                  onChange={(e) => setTourismPrefs({ ...tourismPrefs, weight_fasilitas: parseFloat(e.target.value) })}
                  style={{ width: '100%', accentColor: '#10b981' }}
                />
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Jaminan air tawar minum layak dan genset/PLTS mandiri</span>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                  <span style={{ color: '#cbd5e1', fontWeight: 600 }}>Daya Tarik Budaya/Alam (Benefit)</span>
                  <span style={{ color: '#f59e0b', fontWeight: 700 }}>{Math.round((tourismPrefs.weight_daya_tarik || 0.25) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.60"
                  step="0.05"
                  value={tourismPrefs.weight_daya_tarik}
                  onChange={(e) => setTourismPrefs({ ...tourismPrefs, weight_daya_tarik: parseFloat(e.target.value) })}
                  style={{ width: '100%', accentColor: '#f59e0b' }}
                />
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Akses panorama alam, snorkeling, dan jejak cagar budaya</span>
              </div>
            </div>

            {/* Quick Filters */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '1rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Filter Lokasi Pulau:</span>
              {['', 'Pulau Neira', 'Pulau Banda Besar', 'Pulau Hatta', 'Pulau Ai'].map((isl) => (
                <button
                  key={isl}
                  type="button"
                  onClick={() => {
                    const updated = { ...tourismPrefs, island_filter: isl }
                    setTourismPrefs(updated)
                    dssService.calculateTourismRecommendation(updated).then(setTourismResults)
                  }}
                  className={`badge ${tourismPrefs.island_filter === isl ? 'badge-emerald' : 'badge-neutral'}`}
                  style={{ cursor: 'pointer', padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                >
                  {isl === '' ? 'Semua Pulau' : isl}
                </button>
              ))}
            </div>
          </div>

          {/* Top Recommendation Highlight Card */}
          {tourismResults && tourismResults.top_recommendation && (
            <div
              className="app-card animate-fade-in"
              style={{
                marginBottom: '1.75rem',
                padding: '1.5rem',
                borderLeft: '4px solid #10b981',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(15, 23, 42, 0.85))',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.45rem' }}>
                    <span className="badge badge-emerald" style={{ display: 'inline-flex', gap: '0.35rem', fontWeight: 800 }}>
                      <Award size={13} /> REKOMENDASI TERBAIK #1
                    </span>
                    <span className="badge badge-blue">
                      Skor Preferensi: {(tourismResults.top_recommendation.preference_score * 100).toFixed(1)}%
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#f8fafc', margin: '0 0 0.35rem' }}>
                    {tourismResults.top_recommendation.name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.825rem', color: '#94a3b8', flexWrap: 'wrap' }}>
                    <span>📍 {String(tourismResults.top_recommendation.metadata?.island || 'Kepulauan Banda')}</span>
                    <span>&bull;</span>
                    <span style={{ color: '#38bdf8', fontWeight: 700 }}>
                      Rp {Number(tourismResults.top_recommendation.raw_values.c1_harga).toLocaleString('id-ID')} / malam
                    </span>
                    <span>&bull;</span>
                    <span>Jarak: {tourismResults.top_recommendation.raw_values.c2_jarak} km</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: '0.75rem 0 0', maxWidth: '750px', lineHeight: 1.5 }}>
                    {String(tourismResults.top_recommendation.metadata?.description || '')}
                  </p>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <button
                    type="button"
                    onClick={() => openWhatsAppBooking(
                      tourismResults.top_recommendation!.name,
                      String(tourismResults.top_recommendation!.metadata?.contact_whatsapp || '')
                    )}
                    className="btn btn-success"
                    style={{
                      padding: '0.75rem 1.5rem',
                      fontSize: '0.9rem',
                      fontWeight: 800,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      boxShadow: '0 0 20px rgba(16, 185, 129, 0.35)',
                    }}
                  >
                    <span>💬 Hubungi Pemilik via WA</span>
                  </button>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.45rem' }}>
                    Konfirmasi instan ke admin vila
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Ranked Alternatives Table */}
          {tourismResults && (
            <div className="app-card" style={{ padding: '1.25rem' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 1rem' }}>
                Peringkat Lengkap Alternatif Penginapan (Metode SAW)
              </h4>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '60px' }}>Rank</th>
                      <th>Nama Akomodasi</th>
                      <th>Lokasi Pulau</th>
                      <th>Tarif / Malam</th>
                      <th>Jarak Dermaga</th>
                      <th>Eco-Stay (Air RO / Surya)</th>
                      <th>Skor Preferensi (Vi)</th>
                      <th style={{ textAlign: 'right' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tourismResults.results.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <span
                            className="badge"
                            style={{
                              background: item.rank === 1 ? '#10b981' : item.rank === 2 ? '#06b6d4' : item.rank === 3 ? '#f59e0b' : 'rgba(255,255,255,0.08)',
                              color: item.rank <= 3 ? '#ffffff' : '#94a3b8',
                              fontWeight: 800,
                            }}
                          >
                            #{item.rank}
                          </span>
                        </td>
                        <td>
                          <b style={{ color: '#f8fafc', display: 'block' }}>{item.name}</b>
                          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{String(item.metadata?.type || 'Akomodasi')}</span>
                        </td>
                        <td style={{ color: '#cbd5e1' }}>{String(item.metadata?.island || '-')}</td>
                        <td style={{ color: '#38bdf8', fontWeight: 700 }}>
                          Rp {Number(item.raw_values.c1_harga).toLocaleString('id-ID')}
                        </td>
                        <td style={{ color: '#cbd5e1' }}>{item.raw_values.c2_jarak} km</td>
                        <td>
                          {item.metadata?.eco_stay_badge ? (
                            <span className="badge badge-emerald" style={{ display: 'inline-flex', gap: '0.25rem' }}>
                              <CheckCircle2 size={11} /> Eco-Stay Lolos
                            </span>
                          ) : (
                            <span className="badge badge-neutral">Standar</span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '60px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                              <div
                                style={{
                                  width: `${Math.round(item.preference_score * 100)}%`,
                                  height: '100%',
                                  background: 'linear-gradient(90deg, #10b981, #06b6d4)',
                                }}
                              />
                            </div>
                            <b style={{ color: '#f8fafc', fontSize: '0.85rem' }}>{item.preference_score.toFixed(4)}</b>
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={() => openWhatsAppBooking(item.name, String(item.metadata?.contact_whatsapp || ''))}
                            className="btn btn-secondary"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                          >
                            Booking WA
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: VILLAGE CRISIS & INFRASTRUCTURE PRIORITY */}
      {/* ========================================================================= */}
      {activeDssMode === 'crisis' && (
        <div>
          {/* Crisis Weight Controls */}
          <div className="app-card" style={{ marginBottom: '1.5rem', padding: '1.5rem', borderLeft: '4px solid #f59e0b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <span className="badge badge-amber" style={{ marginBottom: '0.3rem', display: 'inline-flex', gap: '0.35rem' }}>
                  <AlertTriangle size={12} /> Mandat Strategis Prof. Purwo
                </span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                  Bobot Urgensi Intervensi Air Bersih &amp; Energi Mandiri
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0.25rem 0 0' }}>
                  Analisis perankingan prioritas desa untuk penempatan unit penjernihan air laut/payau (BWRO) dan instalasi PLTS.
                </p>
              </div>
              <button
                type="button"
                onClick={handleRunCrisisSAW}
                disabled={loading}
                className="btn btn-warning"
                style={{
                  padding: '0.6rem 1.35rem',
                  fontSize: '0.85rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: 800,
                }}
              >
                <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                {loading ? 'Menganalisis Krisis...' : 'Simulasi Prioritas Bantuan Desa'}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                  <span style={{ color: '#cbd5e1', fontWeight: 600 }}>Kadar Garam / TDS Sumur (Urgency)</span>
                  <span style={{ color: '#ef4444', fontWeight: 700 }}>{Math.round((crisisWeights.weight_tds || 0.35) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="0.60"
                  step="0.05"
                  value={crisisWeights.weight_tds}
                  onChange={(e) => setCrisisWeights({ ...crisisWeights, weight_tds: parseFloat(e.target.value) })}
                  style={{ width: '100%', accentColor: '#ef4444' }}
                />
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Semakin asin/tinggi TDS ppm, semakin mendesak butuh RO</span>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                  <span style={{ color: '#cbd5e1', fontWeight: 600 }}>Populasi Terdampak (Benefit)</span>
                  <span style={{ color: '#f59e0b', fontWeight: 700 }}>{Math.round((crisisWeights.weight_populasi || 0.25) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="0.50"
                  step="0.05"
                  value={crisisWeights.weight_populasi}
                  onChange={(e) => setCrisisWeights({ ...crisisWeights, weight_populasi: parseFloat(e.target.value) })}
                  style={{ width: '100%', accentColor: '#f59e0b' }}
                />
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Semakin banyak jumlah jiwa/KK, semakin prioritas</span>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                  <span style={{ color: '#cbd5e1', fontWeight: 600 }}>Jarak ke Mata Air Tawar (Benefit)</span>
                  <span style={{ color: '#38bdf8', fontWeight: 700 }}>{Math.round((crisisWeights.weight_jarak_air || 0.20) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="0.50"
                  step="0.05"
                  value={crisisWeights.weight_jarak_air}
                  onChange={(e) => setCrisisWeights({ ...crisisWeights, weight_jarak_air: parseFloat(e.target.value) })}
                  style={{ width: '100%', accentColor: '#38bdf8' }}
                />
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Semakin jauh dari mata air terdekat, semakin butuh tandon</span>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                  <span style={{ color: '#cbd5e1', fontWeight: 600 }}>Durasi Pemadaman Diesel (Benefit)</span>
                  <span style={{ color: '#a855f7', fontWeight: 700 }}>{Math.round((crisisWeights.weight_padam_listrik || 0.20) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="0.50"
                  step="0.05"
                  value={crisisWeights.weight_padam_listrik}
                  onChange={(e) => setCrisisWeights({ ...crisisWeights, weight_padam_listrik: parseFloat(e.target.value) })}
                  style={{ width: '100%', accentColor: '#a855f7' }}
                />
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Semakin sering mati lampu, semakin butuh PLTS pompa</span>
              </div>
            </div>
          </div>

          {/* Crisis Results Table */}
          {crisisResults && (
            <div className="app-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                  Peringkat Urgensi Intervensi Infrastruktur Desa (Metode SAW)
                </h4>
                <span className="badge badge-emerald">Total {crisisResults.total_alternatives} Wilayah Dianalisis</span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '60px' }}>Rank</th>
                      <th>Wilayah / Dusun</th>
                      <th>Desa &amp; Pulau</th>
                      <th>Kadar TDS Air Sumur</th>
                      <th>Warga Terdampak</th>
                      <th>Jarak Air Tawar</th>
                      <th>Pemadaman Listrik</th>
                      <th>Tingkat Urgensi</th>
                      <th>Skor SAW (Vi)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {crisisResults.results.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <span
                            className="badge"
                            style={{
                              background: item.rank === 1 ? '#ef4444' : item.rank === 2 ? '#f59e0b' : 'rgba(255,255,255,0.08)',
                              color: item.rank <= 2 ? '#ffffff' : '#94a3b8',
                              fontWeight: 800,
                            }}
                          >
                            #{item.rank}
                          </span>
                        </td>
                        <td>
                          <b style={{ color: '#f8fafc', display: 'block' }}>{item.name}</b>
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{String(item.metadata?.notes || '')}</span>
                        </td>
                        <td style={{ color: '#cbd5e1' }}>
                          {String(item.metadata?.village || '-')}, {String(item.metadata?.island || '-')}
                        </td>
                        <td style={{ color: Number(item.raw_values.c1_kadar_tds) > 2000 ? '#ef4444' : '#f59e0b', fontWeight: 700 }}>
                          {item.raw_values.c1_kadar_tds} ppm
                        </td>
                        <td style={{ color: '#cbd5e1' }}>{item.raw_values.c2_populasi} jiwa</td>
                        <td style={{ color: '#cbd5e1' }}>{item.raw_values.c3_jarak_air} m</td>
                        <td style={{ color: '#cbd5e1' }}>{item.raw_values.c4_durasi_padam} jam/hari</td>
                        <td>
                          <span
                            className={`badge ${
                              item.metadata?.urgency_level === 'SANGAT_KRITIS'
                                ? 'badge-rose'
                                : item.metadata?.urgency_level === 'KRITIS'
                                ? 'badge-amber'
                                : 'badge-blue'
                            }`}
                          >
                            {String(item.metadata?.urgency_level || 'PRIORITAS')}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '50px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                              <div
                                style={{
                                  width: `${Math.round(item.preference_score * 100)}%`,
                                  height: '100%',
                                  background: item.rank === 1 ? '#ef4444' : '#f59e0b',
                                }}
                              />
                            </div>
                            <b style={{ color: '#f8fafc', fontSize: '0.85rem' }}>{item.preference_score.toFixed(4)}</b>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
