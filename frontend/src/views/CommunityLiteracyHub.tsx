import React, { useState, useEffect } from 'react'
import {
  BookOpen,
  CheckCircle2,
  MapPin,
  Wifi,
  WifiOff,
  Plus,
  Edit2,
  Trash2,
  X,
  Eye,
  ShieldCheck,
  Newspaper,
  Radio,
  Check,
} from 'lucide-react'
import {
  tourismService,
  CommunityContentItem,
  CommunityContentCreatePayload,
  LiteracyGovernanceResponse,
} from '../services/tourism'

export interface CommunityLiteracyHubProps {
  mode?: 'public_hub' | 'cms_manager' | 'standalone_full'
  currentUser?: any
  onOpenQuickLogin?: () => void
}

const LOCAL_LANDMARK_OPTIONS = [
  { label: 'Benteng Belgica (/images/landmarks/belgica.jpg)', value: '/images/landmarks/belgica.jpg' },
  { label: 'Perkebunan Pala Rakyat (/images/landmarks/kebun-pala.jpg)', value: '/images/landmarks/kebun-pala.jpg' },
  { label: 'Klenteng Sun Tian Kong (/images/landmarks/klenteng.jpg)', value: '/images/landmarks/klenteng.jpg' },
  { label: 'Sumur Parigi Rante (/images/landmarks/perigi-rante.jpg)', value: '/images/landmarks/perigi-rante.jpg' },
  { label: 'Rumah Budaya Banda (/images/landmarks/rumah-budaya.jpg)', value: '/images/landmarks/rumah-budaya.jpg' },
  { label: 'Taman Karang Lava Flow (/images/landmarks/lava-flow.jpg)', value: '/images/landmarks/lava-flow.jpg' },
  { label: 'Pesisir Pulau Hatta (/images/landmarks/pulau-hatta.jpg)', value: '/images/landmarks/pulau-hatta.jpg' },
  { label: 'Pulau Rhun (/images/landmarks/pulau-rhun.jpg)', value: '/images/landmarks/pulau-rhun.jpg' },
  { label: 'Pelabuhan Bandanaira (/images/landmarks/pelabuhan.jpg)', value: '/images/landmarks/pelabuhan.jpg' },
  { label: 'Pasar Tradisional Banda (/images/landmarks/pasar-banda.jpg)', value: '/images/landmarks/pasar-banda.jpg' },
  { label: 'Pohon Sejuta Umat & Gunung Api (/images/landmarks/pohon-sejuta-umat.webp)', value: '/images/landmarks/pohon-sejuta-umat.webp' },
  { label: 'Potret Gunung Api Banda (/images/landmarks/gunung-api-portrait.webp)', value: '/images/landmarks/gunung-api-portrait.webp' },
  { label: 'Reels 9:16 Pohon Sejuta Umat (/images/media/pohon-sejuta-umat-motion.webp)', value: '/images/media/pohon-sejuta-umat-motion.webp' },
  { label: 'Reels 9:16 Sunset Pelabuhan (/images/media/sunset-pelabuhan-gunung-api.webp)', value: '/images/media/sunset-pelabuhan-gunung-api.webp' },
]

const CONTENT_TYPE_LABELS: Record<string, string> = {
  ARTICLE: 'Artikel Feature',
  PHOTO_GEOTAGGED: 'Foto GPS',
  VIDEO_REELS: 'Reels 9:16',
  COMMUNITY_WORK: 'Karya Warga',
}

const PRIORITY_CATEGORY_LABELS: Record<string, string> = {
  DESTINASI: 'Destinasi',
  UMKM: 'UMKM Rempah',
  RELIGI_KULTURAL: 'Sejarah & Adat',
  LAYANAN_PUBLIK: 'Panduan Pulau',
}

// Guard <img src> against untrusted schemes (javascript:, data:text/html) from API/user input
const SAFE_IMAGE_DATA_URL_RE = /^data:image\/(jpeg|jpg|png|webp);base64,[A-Za-z0-9+/=]+$/i
const safeMediaUrl = (url?: string | null): string => {
  if (!url) return '/images/landmarks/belgica.jpg'
  const trimmed = url.trim()
  if (
    trimmed.startsWith('/images/') ||
    trimmed.startsWith('https://') ||
    SAFE_IMAGE_DATA_URL_RE.test(trimmed)
  ) {
    return trimmed
  }
  return '/images/landmarks/belgica.jpg'
}

export const CommunityLiteracyHub: React.FC<CommunityLiteracyHubProps> = ({
  mode = 'public_hub',
  currentUser,
  onOpenQuickLogin,
}) => {
  const [hubSubTab, setHubSubTab] = useState<'bank_konten' | 'modul_sop' | 'zona_sinyal'>('bank_konten')
  const [contents, setContents] = useState<CommunityContentItem[]>([])
  const [governance, setGovernance] = useState<LiteracyGovernanceResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [selectedContentModal, setSelectedContentModal] = useState<CommunityContentItem | null>(null)

  const [cmsNotice, setCmsNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showCmsModal, setShowCmsModal] = useState<boolean>(false)
  const [editingContentId, setEditingContentId] = useState<string | null>(null)
  const [contentForm, setContentForm] = useState<CommunityContentCreatePayload>({
    title: '',
    content_type: 'COMMUNITY_WORK',
    priority_category: 'UMKM',
    island_name: 'Pulau Neira',
    author_name: '',
    author_role: 'Peserta Workshop Pokdarwis / UMKM',
    summary: '',
    body_narrative: '',
    media_url: '/images/landmarks/belgica.jpg',
    latitude: -4.5265,
    longitude: 129.9015,
    sop_stage: 'PUBLIKASI',
    qc_accuracy: true,
    qc_language: true,
    qc_visual: true,
    qc_adat_ethics: true,
    qc_source_validated: true,
    qc_consent_copyright: true,
    is_published: true,
  })

  const userRoleNames: string[] = currentUser
    ? (currentUser.roles || []).map((r: any) => (typeof r === 'string' ? r : r.name))
    : []
  const canManageCMS =
    Boolean(currentUser?.is_superuser) ||
    userRoleNames.some((r) => ['admin', 'village_officer', 'smart_tourism_admin'].includes(r))

  const loadData = async () => {
    setLoading(true)
    try {
      const [contentList, govData] = await Promise.all([
        tourismService.listCommunityContents({
          content_type: mode === 'public_hub' && typeFilter ? typeFilter : undefined,
          priority_category: mode === 'public_hub' && categoryFilter ? categoryFilter : undefined,
          only_published: mode === 'public_hub' ? true : undefined,
        }),
        tourismService.getLiteracyModules(),
      ])
      setContents(contentList)
      setGovernance(govData)
    } catch {
      // fallback handled inside tourismService
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [mode, categoryFilter, typeFilter])

  const handleOpenAddContent = () => {
    setEditingContentId(null)
    setContentForm({
      title: '',
      content_type: 'COMMUNITY_WORK',
      priority_category: 'UMKM',
      island_name: 'Pulau Neira',
      author_name: currentUser?.full_name || 'Peserta Workshop Pokdarwis',
      author_role: 'Peserta Workshop Pokdarwis / UMKM',
      summary: '',
      body_narrative: '',
      media_url: '/images/landmarks/kebun-pala.jpg',
      latitude: -4.5265,
      longitude: 129.9015,
      sop_stage: 'PUBLIKASI',
      qc_accuracy: true,
      qc_language: true,
      qc_visual: true,
      qc_adat_ethics: true,
      qc_source_validated: true,
      qc_consent_copyright: true,
      is_published: true,
    })
    setShowCmsModal(true)
  }

  const handleOpenEditContent = (item: CommunityContentItem) => {
    setEditingContentId(item.id)
    setContentForm({
      title: item.title,
      content_type: item.content_type,
      priority_category: item.priority_category,
      island_name: item.island_name,
      author_name: item.author_name,
      author_role: item.author_role,
      summary: item.summary,
      body_narrative: item.body_narrative,
      media_url: safeMediaUrl(item.media_url),
      latitude: item.latitude ?? null,
      longitude: item.longitude ?? null,
      sop_stage: item.sop_stage,
      qc_accuracy: item.qc_accuracy,
      qc_language: item.qc_language,
      qc_visual: item.qc_visual,
      qc_adat_ethics: item.qc_adat_ethics,
      qc_source_validated: item.qc_source_validated,
      qc_consent_copyright: item.qc_consent_copyright,
      is_published: item.is_published,
    })
    setShowCmsModal(true)
  }

  const handleSaveContent = async (e: React.FormEvent) => {
    e.preventDefault()
    setCmsNotice(null)
    const sanitizedPayload: CommunityContentCreatePayload = {
      ...contentForm,
      media_url: safeMediaUrl(contentForm.media_url),
    }
    try {
      if (editingContentId) {
        await tourismService.updateCommunityContent(editingContentId, sanitizedPayload)
        setCmsNotice({
          type: 'success',
          text: `Konten "${contentForm.title}" diperbarui.`,
        })
      } else {
        await tourismService.createCommunityContent(sanitizedPayload)
        setCmsNotice({
          type: 'success',
          text: `Konten "${contentForm.title}" ditambahkan ke Bank Konten.`,
        })
      }
      setShowCmsModal(false)
      loadData()
    } catch (err: unknown) {
      setCmsNotice({
        type: 'error',
        text: err instanceof Error ? err.message : 'Gagal menyimpan konten.',
      })
    }
  }

  const handleTogglePublish = async (item: CommunityContentItem) => {
    try {
      await tourismService.updateCommunityContent(item.id, {
        is_published: !item.is_published,
        sop_stage: !item.is_published ? 'PUBLIKASI' : 'REVIEW',
      })
      setCmsNotice({
        type: 'success',
        text: `Status "${item.title}" diubah ke ${!item.is_published ? 'PUBLIKASI' : 'REVIEW'}.`,
      })
      loadData()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal mengubah status publikasi.')
    }
  }

  const handleDeleteContent = async (id: string, title: string) => {
    if (!window.confirm(`Hapus konten "${title}" dari Bank Konten?`)) return
    try {
      await tourismService.deleteCommunityContent(id)
      setCmsNotice({ type: 'success', text: `Konten "${title}" dihapus.` })
      loadData()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal menghapus konten.')
    }
  }

  const formQcPassedCount = [
    contentForm.qc_accuracy,
    contentForm.qc_language,
    contentForm.qc_visual,
    contentForm.qc_adat_ethics,
    contentForm.qc_source_validated,
    contentForm.qc_consent_copyright,
  ].filter(Boolean).length

  const showPublicSection = mode === 'public_hub' || mode === 'standalone_full'
  const showCmsSection = mode === 'cms_manager' || (mode === 'standalone_full' && canManageCMS)

  if (mode === 'cms_manager' && !canManageCMS) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center font-sans">
        <h4 className="text-base font-bold text-[#081d35] mb-1.5">Akses CMS Bank Konten Terbatas</h4>
        <p className="mx-auto max-w-md text-xs text-slate-600 mb-5 leading-relaxed">
          Masuk sebagai <strong>Smart Tourism Admin</strong>, <strong>Petugas Desa</strong>, atau{' '}
          <strong>Administrator</strong> untuk mengelola kiriman warga dan daftar periksa 6-Point QC.
        </p>
        {onOpenQuickLogin && (
          <button
            type="button"
            onClick={onOpenQuickLogin}
            className="rounded-lg bg-[#f4b75e] px-5 py-2 text-xs font-bold text-[#081d35] hover:bg-amber-400"
          >
            Masuk Akun Pengelola
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 font-sans text-[#081d35]">
      {/* =====================================================================
          MODE 1: PUBLIC HUB (BANK KONTEN, 3 MODUL LITERASI, & 4 ZONA SINYAL)
      ===================================================================== */}
      {showPublicSection && (
        <div className="flex flex-col gap-5">
          {/* Header Banner — Solid Deep Ocean Navy, no stock dot-grid or glow blobs */}
          <header className="rounded-xl bg-[#081d35] p-6 sm:p-8 text-white">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="max-w-2xl">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#f4b75e] mb-2">
                  KOMUNITAS @NEIRABASUDARA · POKDARWIS &amp; UMKM
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-snug">
                  Arsip Cerita &amp; Dokumentasi{' '}
                  <span className="font-script font-normal text-[#f4b75e] text-3xl sm:text-4xl ml-1">
                    Warga Banda
                  </span>
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Artikel wisata, foto berkoordinat GPS, naskah Reels 9:16, dan hasil praktik peserta pelatihan
                  Pokdarwis serta pengrajin pala-kenari yang telah diperiksa lewat 6-Point Quality Checklist SOP.
                </p>
              </div>

              {/* Sub-Navigation Switcher */}
              <div className="flex flex-wrap gap-1.5 rounded-lg bg-[#0f2c59] p-1 border border-white/10 self-start lg:self-end">
                <button
                  type="button"
                  onClick={() => setHubSubTab('bank_konten')}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-bold transition-colors ${
                    hubSubTab === 'bank_konten'
                      ? 'bg-[#f4b75e] text-[#081d35]'
                      : 'text-slate-200 hover:text-white'
                  }`}
                >
                  <Newspaper size={14} />
                  <span>Bank Konten ({contents.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setHubSubTab('modul_sop')}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-bold transition-colors ${
                    hubSubTab === 'modul_sop'
                      ? 'bg-[#f4b75e] text-[#081d35]'
                      : 'text-slate-200 hover:text-white'
                  }`}
                >
                  <BookOpen size={14} />
                  <span>3 Modul &amp; SOP 6-Tahap</span>
                </button>
                <button
                  type="button"
                  onClick={() => setHubSubTab('zona_sinyal')}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-bold transition-colors ${
                    hubSubTab === 'zona_sinyal'
                      ? 'bg-[#f4b75e] text-[#081d35]'
                      : 'text-slate-200 hover:text-white'
                  }`}
                >
                  <Radio size={14} />
                  <span>Peta Sinyal 4 Zona</span>
                </button>
              </div>
            </div>
          </header>

          {/* SUB-TAB 1: BANK KONTEN & KARYA KOMUNITAS */}
          {hubSubTab === 'bank_konten' && (
            <div className="flex flex-col gap-5">
              {/* Filter Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg bg-white p-4 border border-slate-200">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-slate-500 mr-1">Kategori:</span>
                  {[
                    { code: '', label: 'Semua' },
                    { code: 'DESTINASI', label: 'Destinasi' },
                    { code: 'UMKM', label: 'UMKM Rempah' },
                    { code: 'RELIGI_KULTURAL', label: 'Sejarah & Adat' },
                    { code: 'LAYANAN_PUBLIK', label: 'Panduan Pulau' },
                  ].map((cat) => (
                    <button
                      key={cat.code}
                      type="button"
                      onClick={() => setCategoryFilter(cat.code)}
                      className={`rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${
                        categoryFilter === cat.code
                          ? 'bg-[#081d35] text-[#f4b75e]'
                          : 'bg-[#f7f5f0] text-slate-700 hover:bg-slate-200/70'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <label htmlFor="content-type-filter" className="text-xs font-bold text-slate-500">
                    Format:
                  </label>
                  <select
                    id="content-type-filter"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-[#081d35]"
                  >
                    <option value="">Semua Format</option>
                    <option value="ARTICLE">Artikel Feature</option>
                    <option value="PHOTO_GEOTAGGED">Foto GPS</option>
                    <option value="VIDEO_REELS">Video Reels 9:16</option>
                    <option value="COMMUNITY_WORK">Karya Peserta Workshop</option>
                  </select>
                </div>
              </div>

              {/* Content Grid */}
              {loading ? (
                <div className="rounded-lg border border-slate-200 bg-white p-10 text-center text-xs text-slate-500">
                  Memuat arsip konten warga...
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {contents.map((item) => (
                    <article
                      key={item.id}
                      className="flex flex-col justify-between overflow-hidden rounded-lg bg-white border border-slate-200"
                    >
                      <div>
                        <div className="relative h-48 bg-[#081d35]">
                          <img
                            src={safeMediaUrl(item.media_url)}
                            alt={item.title}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                            <span className="rounded bg-[#081d35] px-2 py-0.5 text-[11px] font-bold text-[#f4b75e]">
                              {CONTENT_TYPE_LABELS[item.content_type] || item.content_type}
                            </span>
                            <span className="rounded bg-white px-2 py-0.5 text-[11px] font-bold text-[#081d35]">
                              {PRIORITY_CATEGORY_LABELS[item.priority_category] || item.priority_category}
                            </span>
                          </div>
                          <span className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 rounded bg-[#081d35]/90 px-2 py-0.5 text-[11px] font-bold text-white">
                            <CheckCircle2 size={12} className="text-[#f4b75e]" /> {item.qc_passed_count}/6 QC
                          </span>
                        </div>

                        <div className="p-5">
                          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                            <span className="inline-flex items-center gap-1 font-semibold text-[#081d35]">
                              <MapPin size={12} /> {item.island_name}
                              {item.latitude && item.longitude
                                ? ` (${item.latitude.toFixed(4)}, ${item.longitude.toFixed(4)})`
                                : ''}
                            </span>
                            <code className="font-mono text-[11px] text-slate-500">{item.content_code}</code>
                          </div>

                          <h3 className="text-base font-bold text-[#081d35] leading-snug mb-2">{item.title}</h3>
                          <p className="text-xs text-slate-600 leading-relaxed">{item.summary}</p>
                        </div>
                      </div>

                      <div className="px-5 py-3.5 bg-[#f7f5f0] border-t border-slate-200 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-xs font-bold text-[#081d35]">{item.author_name}</div>
                          <div className="truncate text-[11px] text-slate-500">{item.author_role}</div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedContentModal(item)}
                          className="shrink-0 inline-flex items-center gap-1.5 rounded-md bg-[#081d35] px-3 py-1.5 text-xs font-bold text-[#f4b75e] hover:bg-[#0f2c59]"
                        >
                          <Eye size={13} /> Baca
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SUB-TAB 2: 3 MODUL LITERASI DIGITAL & SOP KONTEN 6-TAHAP */}
          {hubSubTab === 'modul_sop' && governance && (
            <div className="flex flex-col gap-6">
              {/* 3 Modul Literasi Digital */}
              <section className="rounded-xl bg-white p-6 border border-slate-200">
                <h3 className="text-lg font-bold text-[#081d35] mb-1">
                  Kurikulum 3 Modul Literasi Digital Pokdarwis &amp; UMKM
                </h3>
                <p className="text-xs text-slate-600 mb-5">
                  Materi pelatihan praktik pembuatan foto produk, penulisan cerita sejarah, dan publikasi mandiri.
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {governance.modules.map((mod) => {
                    const isReady = mod.validation_status === 'SIAP_UJI_PENUH'
                    return (
                      <div
                        key={mod.module_code}
                        className={`flex flex-col justify-between rounded-lg p-5 border ${
                          isReady
                            ? 'bg-[#081d35] text-white border-[#081d35]'
                            : 'bg-[#f7f5f0] text-[#081d35] border-slate-200'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <span
                              className={`font-mono text-xs font-bold ${
                                isReady ? 'text-[#f4b75e]' : 'text-[#081d35]'
                              }`}
                            >
                              {mod.module_code} · {mod.duration_minutes} Menit
                            </span>
                            <span
                              className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                                isReady
                                  ? 'bg-[#f4b75e] text-[#081d35]'
                                  : 'bg-white text-slate-700 border border-slate-300'
                              }`}
                            >
                              {isReady ? 'Siap Uji Penuh (H11)' : 'Draft Tervalidasi'}
                            </span>
                          </div>

                          <h4 className="text-base font-bold leading-snug mb-2">{mod.title}</h4>
                          <p className={`text-xs mb-4 ${isReady ? 'text-slate-300' : 'text-slate-600'}`}>
                            Sasaran: {mod.target_audience}
                          </p>

                          <div className="mb-4">
                            <div
                              className={`text-[11px] font-bold uppercase tracking-wider mb-2 ${
                                isReady ? 'text-[#f4b75e]' : 'text-slate-500'
                              }`}
                            >
                              Tujuan Belajar:
                            </div>
                            <ul className="space-y-1.5 text-xs leading-relaxed">
                              {mod.learning_objectives.map((obj, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <Check
                                    size={13}
                                    className={`mt-0.5 shrink-0 ${isReady ? 'text-[#f4b75e]' : 'text-[#081d35]'}`}
                                  />
                                  <span className={isReady ? 'text-slate-200' : 'text-slate-700'}>{obj}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div
                          className={`rounded-md p-3 text-xs ${
                            isReady
                              ? 'bg-[#0f2c59] text-slate-200'
                              : 'bg-white border border-slate-200 text-[#081d35]'
                          }`}
                        >
                          <strong className="block mb-0.5">Luaran Praktik:</strong>
                          {mod.practical_output}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>

              {/* SOP 6-Tahap Manajemen Konten */}
              <section className="rounded-xl bg-white p-6 border border-slate-200">
                <h3 className="text-lg font-bold text-[#081d35] mb-1">Alur SOP 6-Tahap Manajemen Konten</h3>
                <p className="text-xs text-slate-600 mb-5">
                  Urutan kerja mulai dari pencatatan ide liputan warga, pemeriksaan fakta tetua adat, hingga arsip desa.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {governance.sop_stages.map((st) => (
                    <div
                      key={st.stage_code}
                      className="flex flex-col justify-between rounded-lg bg-[#f7f5f0] p-4 border border-slate-200"
                    >
                      <div>
                        <div className="font-mono text-xs font-bold text-[#081d35] mb-1">
                          TAHAP 0{st.stage_order} · {st.stage_code}
                        </div>
                        <h4 className="text-sm font-bold text-[#081d35] mb-1">{st.stage_name}</h4>
                        <div className="text-xs font-semibold text-slate-600 mb-2">PIC: {st.pic_actor}</div>
                        <p className="text-xs text-slate-600 leading-relaxed mb-3">{st.description}</p>
                      </div>
                      <div className="pt-2.5 border-t border-slate-200 text-xs text-[#081d35]">
                        <strong>Luaran:</strong> {st.deliverable}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* 6-Point Quality Checklist Standards */}
              <section className="rounded-xl bg-[#081d35] p-6 text-white">
                <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                  <ShieldCheck size={18} className="text-[#f4b75e]" />
                  Standar 6-Point Quality Checklist (H6)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {governance.quality_checklist_standards.map((qc) => (
                    <div key={qc.code} className="rounded-lg bg-[#0f2c59] p-4 border border-white/10">
                      <div className="text-xs font-bold text-[#f4b75e] mb-1">
                        [{qc.code}] {qc.label}
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed">{qc.criteria}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* SUB-TAB 3: PETA SINYAL 4 ZONA PULAU & STRATEGI OFFLINE 3T */}
          {hubSubTab === 'zona_sinyal' && governance && (
            <section className="rounded-xl bg-white p-6 border border-slate-200">
              <h3 className="text-lg font-bold text-[#081d35] mb-1">
                Pemetaan 4 Zona Sinyal Kepulauan Banda &amp; Strategi Offline 3T
              </h3>
              <p className="text-xs text-slate-600 mb-5">
                Data survei lapangan (SRV-202611-007) untuk panduan unggah konten di titik sinyal lemah atau blankspot.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {governance.signal_zones_mapping.map((z) => {
                  const isBlankspot = z.signal_status.includes('BLANKSPOT')
                  return (
                    <div
                      key={z.zone_code}
                      className="rounded-lg bg-[#f7f5f0] p-5 border border-slate-200 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-[#081d35]">
                            {isBlankspot ? <WifiOff size={14} /> : <Wifi size={14} />}
                            {z.zone_code} · {z.avg_download_mbps} Mbps
                          </span>
                          <span className="rounded bg-[#081d35] px-2.5 py-0.5 text-[10px] font-bold text-[#f4b75e]">
                            {z.signal_status}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-[#081d35] mb-1">{z.zone_name}</h4>
                        <div className="text-xs font-semibold text-slate-600 mb-3">Cakupan: {z.islands_covered}</div>
                      </div>

                      <div className="rounded-md bg-white p-3 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                        <strong className="text-[#081d35]">Strategi Unggah:</strong> {z.recommended_sync_strategy}
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}
        </div>
      )}

      {/* =====================================================================
          MODE 2: CMS MANAGER (KURASI KONTEN, SOP 6-TAHAP & 6-POINT QC)
      ===================================================================== */}
      {showCmsSection && (
        <div className="flex flex-col gap-4">
          {cmsNotice && (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-300 bg-[#f7f5f0] px-4 py-3 text-xs font-bold text-[#081d35]">
              <span>{cmsNotice.text}</span>
              <button type="button" onClick={() => setCmsNotice(null)} aria-label="Tutup pesan">
                <X size={15} />
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-white p-5 border border-slate-200">
            <div>
              <h4 className="text-base font-bold text-[#081d35]">
                Panel CMS Bank Konten &amp; Verifikasi 6-Point Quality Checklist SOP
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Unggah artikel baru, kurasi karya peserta pelatihan, dan periksa 6 poin mutu sebelum tayang.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenAddContent}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#f4b75e] px-4 py-2.5 text-xs font-bold text-[#081d35] hover:bg-amber-400 self-start sm:self-auto shrink-0"
            >
              <Plus size={15} /> Unggah Karya Baru
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {contents.map((item) => (
              <div
                key={item.id}
                className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-lg bg-white p-4 border border-slate-200"
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <img
                    src={safeMediaUrl(item.media_url)}
                    alt={item.title}
                    loading="lazy"
                    decoding="async"
                    className="h-16 w-16 rounded-md object-cover shrink-0 bg-[#081d35]"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <code className="rounded bg-[#f7f5f0] px-1.5 py-0.5 font-mono text-[11px] font-bold text-[#081d35]">
                        {item.content_code}
                      </code>
                      <span className="rounded bg-[#081d35] px-2 py-0.5 text-[10px] font-bold text-[#f4b75e]">
                        SOP: {item.sop_stage}
                      </span>
                      <span className="rounded bg-[#f7f5f0] border border-slate-300 px-2 py-0.5 text-[10px] font-bold text-[#081d35]">
                        QC: {item.qc_passed_count}/6 Lulus
                      </span>
                    </div>
                    <div className="text-sm font-bold text-[#081d35] truncate">{item.title}</div>
                    <div className="text-xs text-slate-600 mt-0.5">
                      {item.author_name} ({item.author_role}) · {item.island_name}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  <button
                    type="button"
                    onClick={() => handleTogglePublish(item)}
                    className="rounded-md border border-slate-300 bg-[#f7f5f0] px-3 py-1.5 text-xs font-bold text-[#081d35] hover:bg-slate-200"
                  >
                    {item.is_published ? 'Tarik ke Review' : 'Tayangkan Publik'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenEditContent(item)}
                    className="inline-flex items-center gap-1 rounded-md bg-[#081d35] px-3 py-1.5 text-xs font-bold text-[#f4b75e] hover:bg-[#0f2c59]"
                  >
                    <Edit2 size={13} /> Edit &amp; 6-QC
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteContent(item.id, item.title)}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
                  >
                    <Trash2 size={13} /> Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 1: BACA SELENGKAPNYA (NARASI, STORYBOARD & 6-POINT QC)
      ===================================================================== */}
      {selectedContentModal && (
        <div
          onClick={() => setSelectedContentModal(null)}
          className="fixed inset-0 z-[1100] flex items-center justify-center bg-[#081d35]/75 p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white text-[#081d35] shadow-xl border border-slate-200"
          >
            <div className="relative h-60 bg-[#081d35]">
              <img
                src={safeMediaUrl(selectedContentModal.media_url)}
                alt={selectedContentModal.title}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => setSelectedContentModal(null)}
                aria-label="Tutup modal"
                className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-md bg-[#081d35] text-white hover:bg-[#f4b75e] hover:text-[#081d35]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6">
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                <span className="rounded bg-[#081d35] px-2 py-0.5 font-mono text-[11px] font-bold text-[#f4b75e]">
                  {selectedContentModal.content_code}
                </span>
                <span className="rounded bg-[#f7f5f0] border border-slate-200 px-2 py-0.5 text-[11px] font-bold text-[#081d35]">
                  {CONTENT_TYPE_LABELS[selectedContentModal.content_type] || selectedContentModal.content_type}
                </span>
                <span className="rounded bg-[#f7f5f0] border border-slate-200 px-2 py-0.5 text-[11px] font-bold text-[#081d35]">
                  SOP: {selectedContentModal.sop_stage} ({selectedContentModal.qc_passed_count}/6 QC Lulus)
                </span>
              </div>

              <h3 className="text-xl font-bold text-[#081d35] mb-1.5">{selectedContentModal.title}</h3>

              <div className="text-xs text-slate-600 mb-4">
                Oleh <strong>{selectedContentModal.author_name}</strong> ({selectedContentModal.author_role}) · Lokasi:{' '}
                <strong>{selectedContentModal.island_name}</strong>
                {selectedContentModal.latitude && selectedContentModal.longitude
                  ? ` · GPS: ${selectedContentModal.latitude}, ${selectedContentModal.longitude}`
                  : ''}
              </div>

              <blockquote className="rounded-md bg-[#f7f5f0] border-l-4 border-[#f4b75e] p-3.5 text-xs sm:text-sm font-semibold text-[#081d35] mb-4">
                {selectedContentModal.summary}
              </blockquote>

              <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line mb-6">
                {selectedContentModal.body_narrative}
              </div>

              <div className="rounded-lg bg-[#f7f5f0] border border-slate-200 p-4 text-xs">
                <div className="font-bold text-[#081d35] mb-2.5 flex items-center gap-1.5">
                  <ShieldCheck size={15} />
                  Status Verifikasi 6-Point Quality Checklist SOP:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                  <div>{selectedContentModal.qc_accuracy ? '✓' : '—'} 1. Akurasi Fakta Sejarah &amp; Data</div>
                  <div>{selectedContentModal.qc_language ? '✓' : '—'} 2. Kerapian Bahasa &amp; Struktur AIDA</div>
                  <div>{selectedContentModal.qc_visual ? '✓' : '—'} 3. Kualitas Visual &amp; Optimasi 3T</div>
                  <div>{selectedContentModal.qc_adat_ethics ? '✓' : '—'} 4. Etika Adat Tabea &amp; Hukum Sasi</div>
                  <div>{selectedContentModal.qc_source_validated ? '✓' : '—'} 5. Validasi Narasumber Lokal</div>
                  <div>{selectedContentModal.qc_consent_copyright ? '✓' : '—'} 6. Izin Publikasi &amp; Kredit Warga</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 2: FORM UNGGAH / EDIT KONTEN & 6-POINT QUALITY CHECKLIST
      ===================================================================== */}
      {showCmsModal && (
        <div
          onClick={() => setShowCmsModal(false)}
          className="fixed inset-0 z-[1100] flex items-center justify-center bg-[#081d35]/75 p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white p-6 text-[#081d35] shadow-xl border border-slate-200"
          >
            <div className="flex items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  CMS BANK KONTEN KOMUNITAS
                </span>
                <h3 className="text-lg font-bold text-[#081d35]">
                  {editingContentId ? 'Edit Konten & Verifikasi 6-Point QC' : 'Unggah Artikel / Karya Baru'}
                </h3>
              </div>
              <button type="button" onClick={() => setShowCmsModal(false)} aria-label="Tutup form">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveContent} className="flex flex-col gap-3.5 text-xs">
              <div>
                <label className="block font-bold mb-1">Judul Artikel / Karya Komunitas</label>
                <input
                  type="text"
                  required
                  value={contentForm.title}
                  onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })}
                  placeholder="Contoh: Kisah Pengrajin Manisan Pala Dapur Mama Halimah"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-bold mb-1">Format Konten</label>
                  <select
                    value={contentForm.content_type}
                    onChange={(e) => setContentForm({ ...contentForm, content_type: e.target.value })}
                    className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-2"
                  >
                    <option value="ARTICLE">ARTICLE (Artikel SEO)</option>
                    <option value="PHOTO_GEOTAGGED">PHOTO_GEOTAGGED</option>
                    <option value="VIDEO_REELS">VIDEO_REELS (9:16)</option>
                    <option value="COMMUNITY_WORK">COMMUNITY_WORK</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1">Kategori Prioritas</label>
                  <select
                    value={contentForm.priority_category}
                    onChange={(e) => setContentForm({ ...contentForm, priority_category: e.target.value })}
                    className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-2"
                  >
                    <option value="DESTINASI">DESTINASI</option>
                    <option value="UMKM">UMKM</option>
                    <option value="RELIGI_KULTURAL">RELIGI_KULTURAL</option>
                    <option value="LAYANAN_PUBLIK">LAYANAN_PUBLIK</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1">Pulau Lokasi</label>
                  <select
                    value={contentForm.island_name}
                    onChange={(e) => setContentForm({ ...contentForm, island_name: e.target.value })}
                    className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-2"
                  >
                    <option value="Pulau Neira">Pulau Neira</option>
                    <option value="Pulau Banda Besar">Pulau Banda Besar</option>
                    <option value="Pulau Gunung Api">Pulau Gunung Api</option>
                    <option value="Pulau Hatta">Pulau Hatta</option>
                    <option value="Pulau Ay">Pulau Ay</option>
                    <option value="Pulau Rhun">Pulau Rhun</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold mb-1">Nama Penulis / Peserta</label>
                  <input
                    type="text"
                    required
                    value={contentForm.author_name}
                    onChange={(e) => setContentForm({ ...contentForm, author_name: e.target.value })}
                    className="w-full rounded-md border border-slate-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Peran / Komunitas</label>
                  <input
                    type="text"
                    required
                    value={contentForm.author_role}
                    onChange={(e) => setContentForm({ ...contentForm, author_role: e.target.value })}
                    className="w-full rounded-md border border-slate-300 px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label className="block font-bold">Pilih Aset Gambar Lokal atau Unggah Foto (Offline 3T)</label>
                  <select
                    value={
                      LOCAL_LANDMARK_OPTIONS.some((opt) => opt.value === contentForm.media_url)
                        ? contentForm.media_url || '/images/landmarks/belgica.jpg'
                        : '/images/landmarks/belgica.jpg'
                    }
                    onChange={(e) => setContentForm({ ...contentForm, media_url: e.target.value })}
                    className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-2"
                  >
                    {LOCAL_LANDMARK_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      if (file.size > 2 * 1024 * 1024) {
                        alert('Ukuran foto maksimal 2 MB agar hemat kuota sinyal 3T.')
                        return
                      }
                      const reader = new FileReader()
                      reader.onload = () => {
                        if (typeof reader.result === 'string') {
                          setContentForm((prev) => ({ ...prev, media_url: reader.result as string }))
                        }
                      }
                      reader.readAsDataURL(file)
                    }}
                    className="w-full rounded-md border border-slate-300 bg-[#f7f5f0] px-2.5 py-1.5 text-[11px]"
                  />
                </div>

                <div className="flex flex-col justify-between gap-2">
                  <div>
                    <label className="block font-bold mb-1">Tahap SOP 6-Tahap</label>
                    <select
                      value={contentForm.sop_stage}
                      onChange={(e) => setContentForm({ ...contentForm, sop_stage: e.target.value })}
                      className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 font-bold"
                    >
                      <option value="IDE">1. IDE</option>
                      <option value="PRODUKSI">2. PRODUKSI</option>
                      <option value="REVIEW">3. REVIEW</option>
                      <option value="VALIDASI">4. VALIDASI</option>
                      <option value="PUBLIKASI">5. PUBLIKASI</option>
                      <option value="ARSIP">6. ARSIP</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-[#f7f5f0] p-1.5">
                    <img
                      src={safeMediaUrl(contentForm.media_url)}
                      alt="Pratinjau"
                      className="h-10 w-14 rounded object-cover shrink-0 bg-[#081d35]"
                    />
                    <span className="text-[10px] font-semibold text-slate-600 leading-tight">
                      Pratinjau Gambar Aktif
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Ringkasan Konten / Hook AIDA</label>
                <textarea
                  rows={2}
                  required
                  value={contentForm.summary}
                  onChange={(e) => setContentForm({ ...contentForm, summary: e.target.value })}
                  className="w-full rounded-md border border-slate-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Isi Narasi Lengkap / Storyboard</label>
                <textarea
                  rows={4}
                  required
                  value={contentForm.body_narrative}
                  onChange={(e) => setContentForm({ ...contentForm, body_narrative: e.target.value })}
                  className="w-full rounded-md border border-slate-300 px-3 py-2"
                />
              </div>

              <div className="rounded-lg bg-[#f7f5f0] p-3.5 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-[#081d35]">Verifikasi 6-Point Quality Checklist SOP H6</span>
                  <span className="rounded bg-[#081d35] px-2 py-0.5 font-mono text-[11px] font-bold text-[#f4b75e]">
                    Skor: {formQcPassedCount}/6 Lulus
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={contentForm.qc_accuracy}
                      onChange={(e) => setContentForm({ ...contentForm, qc_accuracy: e.target.checked })}
                    />
                    1. Akurasi Fakta Sejarah &amp; Data
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={contentForm.qc_language}
                      onChange={(e) => setContentForm({ ...contentForm, qc_language: e.target.checked })}
                    />
                    2. Kerapian Bahasa &amp; Caption AIDA
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={contentForm.qc_visual}
                      onChange={(e) => setContentForm({ ...contentForm, qc_visual: e.target.checked })}
                    />
                    3. Kualitas Visual &amp; Optimasi 3T
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={contentForm.qc_adat_ethics}
                      onChange={(e) => setContentForm({ ...contentForm, qc_adat_ethics: e.target.checked })}
                    />
                    4. Etika Adat Tabea &amp; Hukum Sasi
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={contentForm.qc_source_validated}
                      onChange={(e) => setContentForm({ ...contentForm, qc_source_validated: e.target.checked })}
                    />
                    5. Validasi Narasumber / Tokoh
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={contentForm.qc_consent_copyright}
                      onChange={(e) => setContentForm({ ...contentForm, qc_consent_copyright: e.target.checked })}
                    />
                    6. Consent Form &amp; Kredit Warga
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={contentForm.is_published}
                    onChange={(e) => setContentForm({ ...contentForm, is_published: e.target.checked })}
                  />
                  Tayangkan Langsung di Portal Publik
                </label>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCmsModal(false)}
                    className="rounded-md border border-slate-300 bg-white px-4 py-2 font-bold text-slate-600"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="rounded-md bg-[#f4b75e] px-4 py-2 font-bold text-[#081d35] hover:bg-amber-400"
                  >
                    Simpan ke CMS
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
