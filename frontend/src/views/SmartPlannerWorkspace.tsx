import React, { useState, useEffect } from 'react'
import {
  Sparkles,
  Award,
  Compass,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react'
import {
  dssService,
  SAWCalculationResponse,
  TourismPreferences,
  CrisisPriorityWeights,
} from '../services/dss'

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
