import React, { useState, useEffect, useMemo, useRef } from 'react'
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
  Sparkles,
  Search,
  Compass,
  ShoppingBag,
  Landmark,
  Ship,
  FileText,
  Camera,
  Film,
  Award,
  Clock,
  Users,
  ArrowUpRight,
  Check,
  Layers,
  Radio,
  SlidersHorizontal,
} from 'lucide-react'
import {
  tourismService,
  CommunityContentItem,
  CommunityContentCreatePayload,
  LiteracyGovernanceResponse,
} from '../services/tourism'
import { BANDA_PORTRAIT_REELS, BandaVisualReelItem } from '../components/landing/TourismSawSection'

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

const CONTENT_TYPE_META: Record<
  string,
  { label: string; shortLabel: string; icon: React.FC<{ className?: string; size?: number }> }
> = {
  ARTICLE: { label: 'Artikel Feature & Kisah', shortLabel: 'Artikel Feature', icon: FileText },
  PHOTO_GEOTAGGED: { label: 'Esai Foto Geotagged GPS', shortLabel: 'Foto Geotagged', icon: Camera },
  VIDEO_REELS: { label: 'Naskah Reels @neirabasudara', shortLabel: 'Video Reels 9:16', icon: Film },
  COMMUNITY_WORK: { label: 'Karya Warga & UMKM Lokal', shortLabel: 'Karya Komunitas', icon: Award },
}

const PRIORITY_CATEGORY_META: Record<
  string,
  { label: string; shortLabel: string; icon: React.FC<{ className?: string; size?: number }> }
> = {
  DESTINASI: { label: 'Destinasi & Bahari', shortLabel: 'Destinasi', icon: Compass },
  UMKM: { label: 'UMKM & Olahan Rempah', shortLabel: 'UMKM Rempah', icon: ShoppingBag },
  RELIGI_KULTURAL: { label: 'Sejarah, Adat & Tabea', shortLabel: 'Adat & Sejarah', icon: Landmark },
  LAYANAN_PUBLIK: { label: 'Panduan & Transportasi Laut', shortLabel: 'Panduan Pulau', icon: Ship },
}

const SOP_STAGE_STYLES: Record<string, { pill: string; dot: string; label: string }> = {
  IDE: {
    pill: 'bg-slate-100 text-slate-700 border-slate-300',
    dot: 'bg-slate-500',
    label: '01 · Ide & Riset',
  },
  PRODUKSI: {
    pill: 'bg-sky-50 text-sky-800 border-sky-200',
    dot: 'bg-sky-500',
    label: '02 · Produksi Lapangan',
  },
  REVIEW: {
    pill: 'bg-amber-50 text-amber-800 border-amber-200',
    dot: 'bg-amber-500',
    label: '03 · Kurasi & Review',
  },
  VALIDASI: {
    pill: 'bg-purple-50 text-purple-800 border-purple-200',
    dot: 'bg-purple-500',
    label: '04 · Validasi Adat',
  },
  PUBLIKASI: {
    pill: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    dot: 'bg-emerald-500',
    label: '05 · Tayang Publik',
  },
  ARSIP: {
    pill: 'bg-stone-100 text-stone-700 border-stone-300',
    dot: 'bg-stone-500',
    label: '06 · Arsip Bank Konten',
  },
}

const getInitials = (name: string): string => {
  if (!name) return 'BN'
  const parts = name
    .replace(/[^a-zA-Z\s]/g, ' ')
    .trim()
    .split(/\s+/)
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
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
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedContentModal, setSelectedContentModal] = useState<CommunityContentItem | null>(null)
  const [selectedReelPreview, setSelectedReelPreview] = useState<BandaVisualReelItem | null>(null)
  const [reelsInView, setReelsInView] = useState<boolean>(false)
  const reelsGridRef = useRef<HTMLDivElement>(null)

  // CMS States
  const [cmsSearchQuery, setCmsSearchQuery] = useState<string>('')
  const [cmsStageFilter, setCmsStageFilter] = useState<string>('')
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
  const isSuperuser = Boolean(currentUser?.is_superuser)
  const canManageCMS =
    isSuperuser ||
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
      // ignore error in offline fallback
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [mode, categoryFilter, typeFilter])

  useEffect(() => {
    if (hubSubTab !== 'bank_konten') return
    const el = reelsGridRef.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setReelsInView(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setReelsInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: '100px', threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hubSubTab])

  const filteredPublicContents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return contents
    return contents.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.author_name.toLowerCase().includes(q) ||
        item.island_name.toLowerCase().includes(q)
    )
  }, [contents, searchQuery])

  const filteredCmsContents = useMemo(() => {
    return contents.filter((item) => {
      if (cmsStageFilter && item.sop_stage !== cmsStageFilter) return false
      const q = cmsSearchQuery.trim().toLowerCase()
      if (!q) return true
      return (
        item.title.toLowerCase().includes(q) ||
        item.content_code.toLowerCase().includes(q) ||
        item.author_name.toLowerCase().includes(q) ||
        item.island_name.toLowerCase().includes(q)
      )
    })
  }, [contents, cmsSearchQuery, cmsStageFilter])

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
      media_url: item.media_url || '/images/landmarks/belgica.jpg',
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
    try {
      if (editingContentId) {
        await tourismService.updateCommunityContent(editingContentId, contentForm)
        setCmsNotice({
          type: 'success',
          text: `Konten "${contentForm.title}" berhasil diperbarui beserta verifikasi 6-Point Quality Checklist!`,
        })
      } else {
        await tourismService.createCommunityContent(contentForm)
        setCmsNotice({
          type: 'success',
          text: `Karya baru "${contentForm.title}" berhasil disimpan ke Bank Konten Komunitas!`,
        })
      }
      setShowCmsModal(false)
      loadData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan konten ke CMS.'
      setCmsNotice({ type: 'error', text: msg })
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
        text: `Status tayang "${item.title}" diubah menjadi: ${
          !item.is_published ? 'Tayang Publik (PUBLIKASI)' : 'Draft Review'
        }.`,
      })
      loadData()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal mengubah status publikasi.')
    }
  }

  const handleDeleteContent = async (id: string, title: string) => {
    if (!window.confirm(`Yakin ingin menghapus konten "${title}" dari Bank Konten CMS?`)) return
    try {
      await tourismService.deleteCommunityContent(id)
      setCmsNotice({ type: 'success', text: `Konten "${title}" berhasil dihapus.` })
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

  // Restricted state for CMS Manager if unauthorized
  if (mode === 'cms_manager' && !canManageCMS) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm font-sans">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600 border border-amber-200">
          <ShieldCheck size={24} />
        </div>
        <h4 className="text-lg font-bold text-[#081d35] mb-2">
          Akses Ruang Redaksi &amp; CMS Komunitas Terbatas
        </h4>
        <p className="mx-auto max-w-lg text-sm text-slate-600 mb-6 leading-relaxed">
          Silakan masuk sebagai <span className="font-semibold text-[#081d35]">Smart Tourism Admin</span>,{' '}
          <span className="font-semibold text-[#081d35]">Petugas Desa</span>, atau{' '}
          <span className="font-semibold text-[#081d35]">Administrator</span> untuk mengunggah karya warga dan
          memverifikasi 6-Point Quality Checklist SOP.
        </p>
        {onOpenQuickLogin && (
          <button
            type="button"
            onClick={onOpenQuickLogin}
            className="inline-flex items-center gap-2 rounded-full bg-[#f4b75e] px-6 py-2.5 text-xs font-bold text-[#081d35] shadow-md transition hover:bg-amber-400"
          >
            Masuk Akun Pengelola CMS
            <ArrowUpRight size={15} />
          </button>
        )}
      </div>
    )
  }

  const spotlightStory =
    !categoryFilter && !typeFilter && !searchQuery && filteredPublicContents.length > 0
      ? filteredPublicContents[0]
      : null
  const gridStories = spotlightStory ? filteredPublicContents.slice(1) : filteredPublicContents

  return (
    <div className="flex flex-col gap-8 font-sans text-[#081d35]">
      {/* =====================================================================
          MODE 1: PUBLIC HUB (JURNAL WARGA, 3 MODUL LITERASI & 4 ZONA SINYAL)
          Kiblat Desain: Wonderful Indonesia (indonesia.travel) + Patagonia Stories
      ===================================================================== */}
      {showPublicSection && (
        <div className="flex flex-col gap-6">
          {/* Editorial Hero Spotlight Banner */}
          <section className="relative overflow-hidden rounded-3xl bg-[#081d35] px-6 py-8 sm:px-10 sm:py-10 text-white shadow-xl border border-white/10">
            {/* Subtle radial grid & warm ambient glow matching TourismSawSection */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-[0.04] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-amber-500/15 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl"
            />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
              <div className="max-w-2xl">
                <div className="inline-flex flex-wrap items-center gap-2.5 mb-3">
                  <span className="inline-flex items-center gap-2 rounded-full bg-amber-400/15 border border-amber-400/30 px-3.5 py-1 text-[11px] font-bold tracking-[0.2em] text-[#f4b75e] uppercase">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#f4b75e] animate-pulse" />
                    JURNAL KOMUNITAS &amp; LITERASI WARGA
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium text-amber-100">
                    @neirabasudara · Pokdarwis &amp; UMKM Banda
                  </span>
                </div>

                <h2 className="font-sans font-bold text-2xl sm:text-4xl lg:text-[40px] leading-[1.15] tracking-tight text-white">
                  Suara, Kisah &amp; Karya{' '}
                  <span className="font-script font-normal text-[#f4b75e] text-3xl sm:text-5xl lg:text-[48px] inline-block ml-1">
                    Warga Kepulauan
                  </span>
                </h2>

                <p className="mt-3 text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl">
                  Ruang cerita otentik yang ditulis dan dipotret langsung oleh pemuda lokal, pemandu sejarah, serta
                  pengrajin rempah Banda Neira. Setiap karya telah melalui kurasi etika adat{' '}
                  <span className="text-amber-200 font-semibold">Tabea &amp; Sasi</span> sebelum dibagikan kepada dunia.
                </p>

                {/* Quick Ecosystem Micro-Stats */}
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl">
                  <div className="rounded-xl bg-white/[0.06] border border-white/10 px-3.5 py-2.5 backdrop-blur-sm">
                    <div className="text-lg font-bold text-[#f4b75e]">{contents.length} Karya</div>
                    <div className="text-[11px] text-slate-300">Terkurasi di Bank Konten</div>
                  </div>
                  <div className="rounded-xl bg-white/[0.06] border border-white/10 px-3.5 py-2.5 backdrop-blur-sm">
                    <div className="text-lg font-bold text-white">3 Modul</div>
                    <div className="text-[11px] text-slate-300">Kurikulum Literasi Warga</div>
                  </div>
                  <div className="rounded-xl bg-white/[0.06] border border-white/10 px-3.5 py-2.5 backdrop-blur-sm">
                    <div className="text-lg font-bold text-emerald-300">6 Poin QC</div>
                    <div className="text-[11px] text-slate-300">Standar Validasi Adat</div>
                  </div>
                  <div className="rounded-xl bg-white/[0.06] border border-white/10 px-3.5 py-2.5 backdrop-blur-sm">
                    <div className="text-lg font-bold text-sky-300">4 Zona</div>
                    <div className="text-[11px] text-slate-300">Adaptasi Sinyal 3T</div>
                  </div>
                </div>
              </div>

              {/* Clean Segmented Sub-Tab Switcher */}
              <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-2 rounded-2xl bg-white/[0.08] p-1.5 border border-white/10 backdrop-blur-md self-start lg:self-end">
                <button
                  type="button"
                  onClick={() => setHubSubTab('bank_konten')}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                    hubSubTab === 'bank_konten'
                      ? 'bg-[#f4b75e] text-[#081d35] shadow-md'
                      : 'text-slate-200 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Newspaper size={15} />
                  <span>Jurnal &amp; Karya Warga</span>
                  <span
                    className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] ${
                      hubSubTab === 'bank_konten' ? 'bg-[#081d35]/15 text-[#081d35]' : 'bg-white/10 text-slate-200'
                    }`}
                  >
                    {contents.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setHubSubTab('modul_sop')}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                    hubSubTab === 'modul_sop'
                      ? 'bg-[#f4b75e] text-[#081d35] shadow-md'
                      : 'text-slate-200 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <BookOpen size={15} />
                  <span>Kurikulum &amp; Alur Kurasi</span>
                </button>

                <button
                  type="button"
                  onClick={() => setHubSubTab('zona_sinyal')}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                    hubSubTab === 'zona_sinyal'
                      ? 'bg-[#f4b75e] text-[#081d35] shadow-md'
                      : 'text-slate-200 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Radio size={15} />
                  <span>Peta Sinyal &amp; Mode 3T</span>
                </button>
              </div>
            </div>
          </section>

          {/* =================================================================
              SUB-TAB 1: JURNAL & BANK KONTEN KOMUNITAS (PATAGONIA STORIES STYLE)
          ================================================================= */}
          {hubSubTab === 'bank_konten' && (
            <div className="flex flex-col gap-6">
              {/* Editorial Filter & Search Bar */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-2xl bg-white p-4 sm:px-6 border border-slate-200/80 shadow-sm">
                {/* Category Filter Pills */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">
                    Topik Cerita:
                  </span>
                  <button
                    type="button"
                    onClick={() => setCategoryFilter('')}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                      categoryFilter === ''
                        ? 'bg-[#081d35] text-[#f4b75e] shadow-sm'
                        : 'bg-[#f7f5f0] text-slate-600 hover:bg-slate-200/70'
                    }`}
                  >
                    Semua Topik
                  </button>
                  {Object.entries(PRIORITY_CATEGORY_META).map(([code, meta]) => {
                    const IconComp = meta.icon
                    const active = categoryFilter === code
                    return (
                      <button
                        key={code}
                        type="button"
                        onClick={() => setCategoryFilter(code)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                          active
                            ? 'bg-[#081d35] text-[#f4b75e] shadow-sm'
                            : 'bg-[#f7f5f0] text-slate-600 hover:bg-slate-200/70'
                        }`}
                      >
                        <IconComp size={13} />
                        <span>{meta.shortLabel}</span>
                      </button>
                    )
                  })}
                </div>

                {/* Search & Format Dropdown */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <div className="relative flex-1 sm:w-56">
                    <Search
                      size={14}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari kisah, penulis, pulau..."
                      className="w-full rounded-full border border-slate-200 bg-[#f7f5f0]/60 pl-9 pr-3.5 py-1.5 text-xs font-medium text-[#081d35] placeholder:text-slate-400 focus:border-[#081d35] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <SlidersHorizontal size={14} className="text-slate-400 hidden sm:block" />
                    <select
                      aria-label="Filter Format Konten"
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-[#081d35] focus:border-[#081d35] focus:outline-none cursor-pointer"
                    >
                      <option value="">Semua Format Karya</option>
                      <option value="ARTICLE">Artikel Feature &amp; Kisah</option>
                      <option value="PHOTO_GEOTAGGED">Esai Foto Geotagged GPS</option>
                      <option value="VIDEO_REELS">Video Reels 9:16 (@neirabasudara)</option>
                      <option value="COMMUNITY_WORK">Karya Peserta Workshop</option>
                    </select>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                  <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-[#081d35] border-t-[#f4b75e]" />
                  <p className="text-sm font-semibold text-slate-600">
                    Menyiapkan jurnal cerita &amp; karya komunitas Banda Neira...
                  </p>
                </div>
              ) : filteredPublicContents.length === 0 ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                  <p className="text-base font-bold text-[#081d35] mb-1">Belum ada cerita yang cocok</p>
                  <p className="text-xs text-slate-500 mb-4">
                    Coba ubah filter topik atau kata kunci pencarian untuk menjelajahi karya warga lainnya.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setCategoryFilter('')
                      setTypeFilter('')
                      setSearchQuery('')
                    }}
                    className="rounded-full bg-[#081d35] px-4 py-2 text-xs font-bold text-[#f4b75e]"
                  >
                    Tampilkan Semua Karya
                  </button>
                </div>
              ) : (
                <>
                  {/* FEATURED HERO STORY (Editorial Magazine Lead Card) */}
                  {spotlightStory && (
                    <article
                      onClick={() => setSelectedContentModal(spotlightStory)}
                      className="group cursor-pointer overflow-hidden rounded-3xl bg-white border border-slate-200/90 shadow-md hover:shadow-xl transition-all duration-300 grid grid-cols-1 lg:grid-cols-12"
                    >
                      <div className="relative min-h-[260px] sm:min-h-[340px] lg:col-span-7 overflow-hidden bg-[#081d35]">
                        <img
                          src={spotlightStory.media_url || '/images/landmarks/belgica.jpg'}
                          alt={spotlightStory.title}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#081d35]/80 via-transparent to-black/20" />

                        <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f4b75e] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#081d35] shadow-sm">
                            <Sparkles size={11} /> SOROTAN UTAMA KOMUNITAS
                          </span>
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#081d35]/85 backdrop-blur-md px-3 py-1 text-[10px] font-bold text-white border border-white/15">
                            {CONTENT_TYPE_META[spotlightStory.content_type]?.shortLabel ||
                              spotlightStory.content_type}
                          </span>
                        </div>

                        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-2 text-white">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-black/45 backdrop-blur-md px-3 py-1 text-xs font-semibold text-amber-200">
                            <MapPin size={13} />
                            {spotlightStory.island_name}
                            {spotlightStory.latitude && spotlightStory.longitude
                              ? ` · ${spotlightStory.latitude.toFixed(4)}, ${spotlightStory.longitude.toFixed(4)}`
                              : ''}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 px-3 py-1 text-[11px] font-bold text-white shadow-sm">
                            <CheckCircle2 size={12} /> Terverifikasi Adat ({spotlightStory.qc_passed_count}/6 QC)
                          </span>
                        </div>
                      </div>

                      <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-8 bg-white">
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700">
                              {PRIORITY_CATEGORY_META[spotlightStory.priority_category]?.label ||
                                spotlightStory.priority_category}
                            </span>
                            <span className="font-mono text-[11px] font-semibold text-slate-400">
                              {spotlightStory.content_code}
                            </span>
                          </div>

                          <h3 className="text-xl sm:text-2xl font-bold text-[#081d35] leading-snug group-hover:text-[#0f2c59] transition-colors">
                            {spotlightStory.title}
                          </h3>

                          <p className="mt-3 text-sm text-slate-600 leading-relaxed line-clamp-4">
                            {spotlightStory.summary}
                          </p>
                        </div>

                        <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#081d35] text-xs font-bold text-[#f4b75e]">
                              {getInitials(spotlightStory.author_name)}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-[#081d35]">{spotlightStory.author_name}</div>
                              <div className="text-[11px] text-slate-500">{spotlightStory.author_role}</div>
                            </div>
                          </div>

                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#081d35] px-4 py-2 text-xs font-bold text-[#f4b75e] transition-transform group-hover:translate-x-0.5">
                            Baca Cerita
                            <ArrowUpRight size={14} />
                          </span>
                        </div>
                      </div>
                    </article>
                  )}

                  {/* EDITORIAL MAGAZINE CARDS GRID */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {gridStories.map((item) => {
                      const typeMeta = CONTENT_TYPE_META[item.content_type]
                      const catMeta = PRIORITY_CATEGORY_META[item.priority_category]
                      const TypeIcon = typeMeta?.icon || FileText
                      return (
                        <article
                          key={item.id}
                          onClick={() => setSelectedContentModal(item)}
                          className="group cursor-pointer flex flex-col justify-between overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                        >
                          <div>
                            {/* Image Header */}
                            <div className="relative h-52 overflow-hidden bg-[#081d35]">
                              <img
                                src={item.media_url || '/images/landmarks/belgica.jpg'}
                                alt={item.title}
                                loading="lazy"
                                decoding="async"
                                className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-[#081d35]/75 via-transparent to-black/20" />

                              <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#081d35]/85 backdrop-blur-md px-3 py-1 text-[10px] font-bold text-[#f4b75e] border border-white/10">
                                  <TypeIcon size={11} />
                                  {typeMeta?.shortLabel || item.content_type}
                                </span>
                                <span className="rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-extrabold text-[#081d35] shadow-sm">
                                  {catMeta?.shortLabel || item.priority_category}
                                </span>
                              </div>

                              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-200 drop-shadow">
                                  <MapPin size={12} />
                                  {item.island_name}
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-bold text-white">
                                  <CheckCircle2 size={11} /> {item.qc_passed_count}/6 QC
                                </span>
                              </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-5">
                              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                                <span className="font-mono font-semibold text-slate-500">{item.content_code}</span>
                                {item.latitude && item.longitude && (
                                  <span className="font-mono text-[10px]">
                                    {item.latitude.toFixed(3)}, {item.longitude.toFixed(3)}
                                  </span>
                                )}
                              </div>

                              <h4 className="text-base font-bold text-[#081d35] leading-snug mb-2.5 line-clamp-2 group-hover:text-[#0f2c59]">
                                {item.title}
                              </h4>

                              <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{item.summary}</p>
                            </div>
                          </div>

                          {/* Contributor Footer */}
                          <div className="px-5 py-3.5 bg-[#f7f5f0]/70 border-t border-slate-100 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#081d35] text-[10px] font-bold text-[#f4b75e]">
                                {getInitials(item.author_name)}
                              </div>
                              <div className="min-w-0">
                                <div className="truncate text-xs font-bold text-[#081d35]">{item.author_name}</div>
                                <div className="truncate text-[10px] text-slate-500">{item.author_role}</div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedContentModal(item)
                              }}
                              className="shrink-0 inline-flex items-center gap-1 rounded-full bg-[#081d35] px-3.5 py-1.5 text-[11px] font-bold text-[#f4b75e] group-hover:bg-[#f4b75e] group-hover:text-[#081d35] transition-colors"
                            >
                              <Eye size={12} /> Baca
                            </button>
                          </div>
                        </article>
                      )
                    })}
                  </div>

                  {/* 9:16 VERTICAL REELS & PORTRAIT SHOWCASE (@neirabasudara Motion WebP) */}
                  <div
                    ref={reelsGridRef}
                    className="mt-2 rounded-3xl bg-[#081d35] p-6 sm:p-8 text-white shadow-lg border border-white/10"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
                      <div>
                        <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#f4b75e]">
                          <Film size={13} /> REELS &amp; POTRET VERTIKAL 9:16 · @NEIRABASUDARA
                        </span>
                        <h4 className="mt-1 text-xl sm:text-2xl font-bold text-white">
                          Tangkap Suasana{' '}
                          <span className="font-script font-normal text-[#f4b75e] text-2xl sm:text-3xl ml-1">
                            Langsung dari Lapangan
                          </span>
                        </h4>
                      </div>
                      <p className="text-xs text-slate-300 max-w-md">
                        Format potret 9:16 &amp; 3:4 hasil dokumentasi ponsel komunitas yang dioptimasi ke format WebP
                        agar tetap ringan diakses di jaringan kepulauan.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                      {BANDA_PORTRAIT_REELS.map((reel) => (
                        <div
                          key={reel.id}
                          onClick={() => setSelectedReelPreview(reel)}
                          className="group relative aspect-[9/16] max-h-[440px] w-full mx-auto overflow-hidden rounded-2xl border border-white/15 bg-slate-900 cursor-pointer shadow-md hover:ring-2 hover:ring-[#f4b75e] transition-all"
                        >
                          <img
                            src={reelsInView ? reel.src : reel.posterSrc}
                            alt={reel.title}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#081d35] via-[#081d35]/20 to-black/20" />

                          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/55 backdrop-blur-md px-2.5 py-1 text-[10px] font-extrabold text-[#f4b75e] border border-white/15">
                              {reel.isAnimatedWebp && (
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              )}
                              {reel.aspectLabel}
                            </span>
                            <span className="rounded-full bg-white/15 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-semibold text-white">
                              {reel.location}
                            </span>
                          </div>

                          <div className="absolute bottom-4 left-4 right-4">
                            <div className="text-[10px] font-bold text-amber-300 mb-0.5">{reel.subtitle}</div>
                            <h5 className="text-base font-bold text-white leading-snug mb-1 group-hover:text-[#f4b75e] transition-colors">
                              {reel.title}
                            </h5>
                            <p className="text-[11px] text-slate-200 line-clamp-2 leading-relaxed">{reel.caption}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* =================================================================
              SUB-TAB 2: KURIKULUM 3 MODUL LITERASI & ALUR SOP 6-TAHAP
              Kiblat Desain: Stripe Press / Notion Guides
          ================================================================= */}
          {hubSubTab === 'modul_sop' && governance && (
            <div className="flex flex-col gap-8">
              {/* 1. Kurikulum 3 Modul Literasi Digital */}
              <section className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/80 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-5 border-b border-slate-100">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-600">
                      KURIKULUM PEMBERDAYAAN KOMUNITAS
                    </span>
                    <h3 className="mt-1 text-xl sm:text-2xl font-bold text-[#081d35]">
                      3 Modul Literasi Digital{' '}
                      <span className="font-script font-normal text-amber-600 text-2xl sm:text-3xl ml-1">
                        Pokdarwis &amp; UMKM
                      </span>
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 max-w-md">
                    Disusun khusus untuk kebutuhan praktik lapangan warga Banda Neira agar mandiri memproduksi konten
                    promosi wisata dan olahan rempah.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {governance.modules.map((mod, index) => {
                    const isReady = mod.validation_status === 'SIAP_UJI_PENUH'
                    return (
                      <div
                        key={mod.module_code}
                        className={`flex flex-col justify-between rounded-2xl p-6 transition-all ${
                          isReady
                            ? 'bg-[#081d35] text-white shadow-lg ring-2 ring-[#f4b75e]'
                            : 'bg-[#f7f5f0]/70 text-[#081d35] border border-slate-200/90'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-4">
                            <span
                              className={`font-mono text-xs font-bold px-2.5 py-1 rounded-md ${
                                isReady ? 'bg-white/10 text-[#f4b75e]' : 'bg-white text-[#081d35] border border-slate-200'
                              }`}
                            >
                              0{index + 1} · {mod.module_code}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider ${
                                isReady
                                  ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              <CheckCircle2 size={11} />
                              {isReady ? 'Siap Uji Penuh' : 'Tervalidasi'}
                            </span>
                          </div>

                          <h4 className={`text-lg font-bold leading-snug mb-3 ${isReady ? 'text-white' : 'text-[#081d35]'}`}>
                            {mod.title}
                          </h4>

                          <div
                            className={`flex flex-wrap items-center gap-3 text-xs mb-4 pb-4 border-b ${
                              isReady ? 'border-white/10 text-slate-300' : 'border-slate-200 text-slate-600'
                            }`}
                          >
                            <span className="inline-flex items-center gap-1 font-semibold">
                              <Clock size={13} className={isReady ? 'text-[#f4b75e]' : 'text-amber-600'} />
                              {mod.duration_minutes} Menit Praktik
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Users size={13} className={isReady ? 'text-[#f4b75e]' : 'text-sky-700'} />
                              {mod.target_audience}
                            </span>
                          </div>

                          <div className="mb-5">
                            <div
                              className={`text-[11px] font-bold uppercase tracking-wider mb-2.5 ${
                                isReady ? 'text-[#f4b75e]' : 'text-slate-500'
                              }`}
                            >
                              Capaian Pembelajaran:
                            </div>
                            <ul className="space-y-2 text-xs leading-relaxed">
                              {mod.learning_objectives.map((obj, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <Check
                                    size={14}
                                    className={`mt-0.5 shrink-0 ${isReady ? 'text-emerald-400' : 'text-emerald-600'}`}
                                  />
                                  <span className={isReady ? 'text-slate-200' : 'text-slate-700'}>{obj}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div
                          className={`rounded-xl p-3.5 text-xs ${
                            isReady
                              ? 'bg-white/10 border border-white/15 text-amber-100'
                              : 'bg-white border border-slate-200/80 text-[#081d35]'
                          }`}
                        >
                          <span className="block text-[10px] font-extrabold uppercase tracking-wider opacity-75 mb-0.5">
                            Target Luaran Praktik:
                          </span>
                          <span className="font-semibold">{mod.practical_output}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>

              {/* 2. Alur Kerja SOP 6-Tahap Manajemen Konten */}
              <section className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/80 shadow-sm">
                <div className="mb-6">
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-sky-700">
                    TATA KELOLA REDAKSI KOMUNITAS
                  </span>
                  <h3 className="mt-1 text-xl font-bold text-[#081d35]">
                    Alur Kerja SOP 6-Tahap Manajemen Konten BST
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Memastikan setiap cerita warga melewati proses pendampingan yang rapi dari gagasan lapangan hingga
                    publikasi dan pengarsipan desa.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {governance.sop_stages.map((st) => {
                    const style = SOP_STAGE_STYLES[st.stage_code] || SOP_STAGE_STYLES.IDE
                    return (
                      <div
                        key={st.stage_code}
                        className="relative flex flex-col justify-between rounded-2xl bg-[#f7f5f0]/60 p-5 border border-slate-200/80 hover:bg-white hover:shadow-md transition-all"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold ${style.pill}`}
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                              TAHAP 0{st.stage_order} · {st.stage_code}
                            </span>
                          </div>

                          <h4 className="text-base font-bold text-[#081d35] mb-1">{st.stage_name}</h4>
                          <div className="text-[11px] font-semibold text-sky-800 mb-2.5">
                            Penanggung Jawab: {st.pic_actor}
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed mb-4">{st.description}</p>
                        </div>

                        <div className="pt-3 border-t border-slate-200/70 flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-slate-400">Luaran Tahap:</span>
                          <span className="font-bold text-emerald-700">{st.deliverable}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>

              {/* 3. Standar 6-Point Quality Checklist (H6) */}
              <section className="rounded-3xl bg-[#081d35] p-6 sm:p-8 text-white shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#f4b75e]">
                      VERIFIKASI MUTU &amp; ETIKA BUDAYA
                    </span>
                    <h3 className="mt-1 text-xl font-bold text-white flex items-center gap-2">
                      <ShieldCheck size={20} className="text-emerald-400" />
                      6-Point Quality Checklist sebelum Publikasi
                    </h3>
                  </div>
                  <span className="rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3.5 py-1 text-xs font-bold text-emerald-300 self-start sm:self-auto">
                    Wajib Lulus 6/6 Poin untuk Tayang Utama
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {governance.quality_checklist_standards.map((qc) => (
                    <div
                      key={qc.code}
                      className="rounded-2xl bg-white/[0.06] border border-white/10 p-4 backdrop-blur-sm"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="rounded-md bg-[#f4b75e] px-2 py-0.5 font-mono text-[11px] font-extrabold text-[#081d35]">
                          {qc.code}
                        </span>
                        <h4 className="text-sm font-bold text-white">{qc.label}</h4>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{qc.criteria}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* =================================================================
              SUB-TAB 3: PETA SINYAL 4 ZONA PULAU & STRATEGI OFFLINE 3T
          ================================================================= */}
          {hubSubTab === 'zona_sinyal' && governance && (
            <section className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/80 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6 pb-5 border-b border-slate-100">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-sky-700">
                    KETAHANAN DIGITAL KEPULAUAN 3T · SURVEI SRV-202611-007
                  </span>
                  <h3 className="mt-1 text-xl sm:text-2xl font-bold text-[#081d35]">
                    Pemetaan 4 Zona Sinyal &amp; Strategi Konten{' '}
                    <span className="font-script font-normal text-amber-600 text-2xl sm:text-3xl ml-1">
                      Offline-First
                    </span>
                  </h3>
                </div>
                <p className="text-xs text-slate-500 max-w-md">
                  Panduan teknis bagi kontributor warga saat meliput di pulau luar atau titik tanpa sinyal agar foto dan
                  naskah tetap tersimpan aman di perangkat.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {governance.signal_zones_mapping.map((z, idx) => {
                  const isBlankspot = z.signal_status.includes('BLANKSPOT')
                  const isStable = z.signal_status.includes('STABIL')
                  return (
                    <div
                      key={z.zone_code}
                      className={`rounded-2xl p-6 border transition-all ${
                        isBlankspot
                          ? 'bg-rose-50/40 border-rose-200'
                          : isStable
                          ? 'bg-emerald-50/30 border-emerald-200'
                          : 'bg-[#f7f5f0]/60 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#081d35] text-[#f4b75e]">
                            {isBlankspot ? <WifiOff size={15} /> : <Wifi size={15} />}
                          </span>
                          <div>
                            <span className="font-mono text-xs font-bold text-[#081d35]">{z.zone_code}</span>
                            <span className="mx-1.5 text-slate-300">·</span>
                            <span className="font-mono text-xs font-bold text-sky-700">
                              ~{z.avg_download_mbps} Mbps
                            </span>
                          </div>
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider ${
                            isBlankspot
                              ? 'bg-rose-100 text-rose-800'
                              : isStable
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {z.signal_status}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-[#081d35] mb-1">{z.zone_name}</h4>
                      <div className="text-xs font-semibold text-sky-800 mb-3">
                        Wilayah Kepulauan: {z.islands_covered}
                      </div>

                      {/* Signal Visual Indicator */}
                      <div className="flex items-center gap-1.5 mb-4">
                        {[1, 2, 3, 4].map((bar) => {
                          const activeBars = 4 - idx
                          return (
                            <div
                              key={bar}
                              className={`h-1.5 flex-1 rounded-full ${
                                bar <= activeBars
                                  ? isBlankspot
                                    ? 'bg-rose-400'
                                    : isStable
                                    ? 'bg-emerald-500'
                                    : 'bg-amber-500'
                                  : 'bg-slate-200'
                              }`}
                            />
                          )
                        })}
                      </div>

                      <div className="rounded-xl bg-white p-3.5 border border-slate-200/70 text-xs text-slate-700 leading-relaxed">
                        <span className="font-bold text-[#081d35] block mb-0.5">
                          Rekomendasi Unggah &amp; Sinkronisasi:
                        </span>
                        {z.recommended_sync_strategy}
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
          MODE 2: CMS MANAGER (PANEL REDAKSI, SOP 6-TAHAP & 6-POINT QC)
          Kiblat Desain: Ghost CMS / Sanity Studio Editorial Workspace
      ===================================================================== */}
      {showCmsSection && (
        <div className="flex flex-col gap-6">
          {cmsNotice && (
            <div
              className={`flex items-center justify-between gap-4 rounded-2xl border px-5 py-3.5 text-xs font-bold shadow-sm ${
                cmsNotice.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>{cmsNotice.text}</span>
              </div>
              <button
                type="button"
                onClick={() => setCmsNotice(null)}
                className="rounded-lg p-1 hover:bg-black/5 transition-colors"
              >
                <X size={15} />
              </button>
            </div>
          )}

          {/* CMS Top Header & KPI Summary */}
          <div className="rounded-3xl bg-[#081d35] p-6 sm:p-8 text-white shadow-lg">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/15 border border-amber-400/30 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#f4b75e] mb-2">
                  <Layers size={12} /> RUANG REDAKSI &amp; KURASI KOMUNITAS
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  Panel CMS Bank Konten &amp; Verifikasi 6-Point QC
                </h3>
                <p className="mt-1 text-xs text-slate-300 max-w-2xl">
                  Kelola naskah artikel SEO, foto geotagged, dan karya peserta Workshop Pokdarwis/UMKM. Pastikan 6 poin
                  Quality Checklist terpenuhi sebelum ditayangkan ke beranda publik.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenAddContent}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#f4b75e] px-5 py-3 text-xs font-extrabold text-[#081d35] shadow-lg hover:bg-amber-400 transition-all self-start lg:self-auto shrink-0"
              >
                <Plus size={16} />
                <span>+ Unggah Artikel / Karya Warga Baru</span>
              </button>
            </div>

            {/* CMS Quick Metrics */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 border-t border-white/10">
              <div className="rounded-xl bg-white/[0.06] px-4 py-2.5">
                <div className="text-xs text-slate-300">Total Entri CMS</div>
                <div className="text-lg font-bold text-white">{contents.length} Konten</div>
              </div>
              <div className="rounded-xl bg-white/[0.06] px-4 py-2.5">
                <div className="text-xs text-slate-300">Tayang Publik</div>
                <div className="text-lg font-bold text-emerald-300">
                  {contents.filter((c) => c.is_published).length} Tayang
                </div>
              </div>
              <div className="rounded-xl bg-white/[0.06] px-4 py-2.5">
                <div className="text-xs text-slate-300">Tahap Review / Draft</div>
                <div className="text-lg font-bold text-amber-300">
                  {contents.filter((c) => !c.is_published).length} Antrean
                </div>
              </div>
              <div className="rounded-xl bg-white/[0.06] px-4 py-2.5">
                <div className="text-xs text-slate-300">Lulus Penuh 6/6 QC</div>
                <div className="text-lg font-bold text-[#f4b75e]">
                  {contents.filter((c) => c.qc_passed_count === 6).length} Terverifikasi
                </div>
              </div>
            </div>
          </div>

          {/* CMS Filter & Search Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-white p-4 border border-slate-200/80 shadow-sm">
            <div className="relative flex-1 max-w-md">
              <Search size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={cmsSearchQuery}
                onChange={(e) => setCmsSearchQuery(e.target.value)}
                placeholder="Cari kode konten, judul, atau nama kontributor..."
                className="w-full rounded-full border border-slate-200 bg-[#f7f5f0]/60 pl-9 pr-4 py-2 text-xs font-medium text-[#081d35] focus:border-[#081d35] focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-500">Filter Tahap SOP:</span>
              <select
                aria-label="Filter Tahap SOP CMS"
                value={cmsStageFilter}
                onChange={(e) => setCmsStageFilter(e.target.value)}
                className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-[#081d35]"
              >
                <option value="">Semua Tahapan SOP</option>
                <option value="IDE">1. IDE</option>
                <option value="PRODUKSI">2. PRODUKSI</option>
                <option value="REVIEW">3. REVIEW</option>
                <option value="VALIDASI">4. VALIDASI</option>
                <option value="PUBLIKASI">5. PUBLIKASI</option>
                <option value="ARSIP">6. ARSIP</option>
              </select>
            </div>
          </div>

          {/* CMS Content List Rows */}
          <div className="flex flex-col gap-3">
            {filteredCmsContents.map((item) => {
              const stageStyle = SOP_STAGE_STYLES[item.sop_stage] || SOP_STAGE_STYLES.PUBLIKASI
              const catMeta = PRIORITY_CATEGORY_META[item.priority_category]
              return (
                <div
                  key={item.id}
                  className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-2xl bg-white p-4 sm:p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
                    <img
                      src={item.media_url || '/images/landmarks/belgica.jpg'}
                      alt={item.title}
                      className="h-16 w-20 sm:h-20 sm:w-24 rounded-xl object-cover shrink-0 bg-[#081d35]"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <code className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-bold text-[#081d35]">
                          {item.content_code}
                        </code>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${stageStyle.pill}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${stageStyle.dot}`} />
                          SOP: {item.sop_stage}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            item.qc_passed_count === 6
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          <CheckCircle2 size={11} /> QC: {item.qc_passed_count}/6 Poin Lulus
                        </span>
                        <span className="rounded-full bg-[#f7f5f0] px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
                          {catMeta?.shortLabel || item.priority_category}
                        </span>
                      </div>

                      <h4 className="text-sm sm:text-base font-bold text-[#081d35] truncate">{item.title}</h4>

                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                        <span>
                          Penulis: <strong className="text-[#081d35]">{item.author_name}</strong> ({item.author_role})
                        </span>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1 text-sky-700 font-semibold">
                          <MapPin size={12} /> {item.island_name}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* CMS Row Action Buttons */}
                  <div className="flex items-center gap-2 flex-wrap shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <button
                      type="button"
                      onClick={() => setSelectedContentModal(item)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                    >
                      <Eye size={13} /> Pratinjau
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTogglePublish(item)}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-colors ${
                        item.is_published
                          ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                      }`}
                    >
                      {item.is_published ? 'Tarik ke Review' : 'Tayangkan Publik'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEditContent(item)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#081d35] px-3.5 py-2 text-xs font-bold text-[#f4b75e] hover:bg-[#0f2c59]"
                    >
                      <Edit2 size={13} /> Edit &amp; Cek 6-QC
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteContent(item.id, item.title)}
                      className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100"
                    >
                      <Trash2 size={13} /> Hapus
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 1: READER VIEW (EDITORIAL STORY & STORYBOARD + 6-POINT QC SEAL)
          Kiblat Desain: Airbnb Community Stories / Substack Reader
      ===================================================================== */}
      {selectedContentModal && (
        <div
          onClick={() => setSelectedContentModal(null)}
          className="fixed inset-0 z-[1100] flex items-center justify-center bg-[#081d35]/75 p-4 backdrop-blur-md animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white text-[#081d35] shadow-2xl border border-white/20"
          >
            {/* Cover Photo Header */}
            <div className="relative h-64 sm:h-80 w-full bg-[#081d35]">
              <img
                src={selectedContentModal.media_url || '/images/landmarks/belgica.jpg'}
                alt={selectedContentModal.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#081d35] via-[#081d35]/30 to-transparent" />

              <button
                type="button"
                onClick={() => setSelectedContentModal(null)}
                aria-label="Tutup artikel"
                className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#081d35]/80 text-white backdrop-blur-md hover:bg-[#f4b75e] hover:text-[#081d35] transition-colors"
              >
                <X size={18} />
              </button>

              <div className="absolute bottom-5 left-6 right-6 text-white">
                <div className="flex flex-wrap items-center gap-2 mb-2.5">
                  <span className="rounded-full bg-[#f4b75e] px-3 py-0.5 font-mono text-[11px] font-extrabold text-[#081d35]">
                    {selectedContentModal.content_code}
                  </span>
                  <span className="rounded-full bg-white/15 backdrop-blur-md px-3 py-0.5 text-[11px] font-bold text-white">
                    {CONTENT_TYPE_META[selectedContentModal.content_type]?.label ||
                      selectedContentModal.content_type}
                  </span>
                  <span className="rounded-full bg-emerald-500/90 px-3 py-0.5 text-[11px] font-bold text-white">
                    SOP: {selectedContentModal.sop_stage} ({selectedContentModal.qc_passed_count}/6 QC Lulus)
                  </span>
                </div>

                <h2 className="text-xl sm:text-3xl font-bold leading-tight text-white drop-shadow-sm">
                  {selectedContentModal.title}
                </h2>
              </div>
            </div>

            {/* Reader Content Body */}
            <div className="p-6 sm:p-8">
              {/* Contributor & Location Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-6 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#081d35] text-sm font-bold text-[#f4b75e]">
                    {getInitials(selectedContentModal.author_name)}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#081d35]">{selectedContentModal.author_name}</div>
                    <div className="text-xs text-slate-500">{selectedContentModal.author_role}</div>
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 rounded-full bg-[#f7f5f0] px-4 py-2 text-xs font-bold text-[#081d35] border border-slate-200/80 self-start sm:self-auto">
                  <MapPin size={14} className="text-amber-600" />
                  <span>{selectedContentModal.island_name}</span>
                  {selectedContentModal.latitude && selectedContentModal.longitude && (
                    <span className="font-mono text-[11px] text-slate-500">
                      ({selectedContentModal.latitude.toFixed(4)}, {selectedContentModal.longitude.toFixed(4)})
                    </span>
                  )}
                </div>
              </div>

              {/* Editorial Lead Hook / AIDA Summary */}
              <blockquote className="rounded-2xl bg-[#f7f5f0] border-l-4 border-[#f4b75e] p-5 text-sm sm:text-base font-semibold text-[#081d35] leading-relaxed mb-6">
                “{selectedContentModal.summary}”
              </blockquote>

              {/* Full Narrative / Storyboard Text */}
              <div className="text-sm sm:text-[15px] text-slate-700 leading-[1.8] whitespace-pre-line mb-8">
                {selectedContentModal.body_narrative}
              </div>

              {/* 6-Point Quality Checklist Verification Seal */}
              <div className="rounded-2xl bg-emerald-50/70 border border-emerald-200 p-5">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-emerald-900">
                    <ShieldCheck size={16} className="text-emerald-600" />
                    Bukti Verifikasi 6-Point Quality Checklist SOP BST
                  </div>
                  <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-bold text-white">
                    {selectedContentModal.qc_passed_count}/6 Terverifikasi
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-medium text-emerald-950">
                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      size={14}
                      className={selectedContentModal.qc_accuracy ? 'text-emerald-600' : 'text-slate-300'}
                    />
                    <span>1. Akurasi Fakta Sejarah &amp; Data Lapangan</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      size={14}
                      className={selectedContentModal.qc_language ? 'text-emerald-600' : 'text-slate-300'}
                    />
                    <span>2. Kerapian Bahasa &amp; Struktur Cerita AIDA</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      size={14}
                      className={selectedContentModal.qc_visual ? 'text-emerald-600' : 'text-slate-300'}
                    />
                    <span>3. Kualitas Visual &amp; Optimasi Sinyal 3T</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      size={14}
                      className={selectedContentModal.qc_adat_ethics ? 'text-emerald-600' : 'text-slate-300'}
                    />
                    <span>4. Etika Adat Tabea &amp; Hukum Sasi</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      size={14}
                      className={selectedContentModal.qc_source_validated ? 'text-emerald-600' : 'text-slate-300'}
                    />
                    <span>5. Validasi Narasumber Lokal / Tetua Adat</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      size={14}
                      className={selectedContentModal.qc_consent_copyright ? 'text-emerald-600' : 'text-slate-300'}
                    />
                    <span>6. Izin Publikasi &amp; Atribusi Kredit Warga</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PRATINJAU REELS 9:16 */}
      {selectedReelPreview && (
        <div
          onClick={() => setSelectedReelPreview(null)}
          className="fixed inset-0 z-[1150] flex items-center justify-center bg-[#081d35]/80 p-4 backdrop-blur-md animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex flex-col sm:flex-row max-w-2xl w-full max-h-[90vh] overflow-hidden rounded-3xl bg-[#081d35] border border-white/20 text-white shadow-2xl"
          >
            <div className="relative w-full sm:w-[290px] aspect-[9/16] max-h-[75vh] sm:max-h-[84vh] shrink-0 bg-black mx-auto">
              <img
                src={selectedReelPreview.src}
                alt={selectedReelPreview.title}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-col justify-between p-6 flex-1 overflow-y-auto">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="rounded-full bg-amber-400/20 border border-amber-400/40 px-3 py-1 text-[10px] font-extrabold text-[#f4b75e]">
                    {selectedReelPreview.aspectLabel}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedReelPreview(null)}
                    aria-label="Tutup pratinjau"
                    className="rounded-full bg-white/10 p-1.5 text-white hover:bg-[#f4b75e] hover:text-[#081d35] transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{selectedReelPreview.title}</h3>
                <div className="text-xs font-semibold text-amber-300 mb-4">
                  {selectedReelPreview.location} · {selectedReelPreview.subtitle}
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{selectedReelPreview.caption}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReelPreview(null)}
                className="mt-6 rounded-full bg-[#f4b75e] px-5 py-2.5 text-xs font-extrabold text-[#081d35] hover:bg-amber-400 transition-colors self-start"
              >
                Tutup Pratinjau
              </button>
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
          className="fixed inset-0 z-[1100] flex items-center justify-center bg-[#081d35]/75 p-4 backdrop-blur-md"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 text-[#081d35] shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 pb-4 mb-6 border-b border-slate-200">
              <div>
                <span className="inline-block rounded-full bg-amber-100 px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-800 mb-1">
                  CMS BANK KONTEN &amp; KARYA KOMUNITAS
                </span>
                <h3 className="text-xl font-bold text-[#081d35]">
                  {editingContentId ? 'Edit Konten & Verifikasi 6-Point QC' : 'Unggah Artikel / Karya Warga Baru'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCmsModal(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveContent} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-[#081d35] mb-1.5">
                  Judul Artikel / Karya Komunitas
                </label>
                <input
                  type="text"
                  required
                  value={contentForm.title}
                  onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })}
                  placeholder="Contoh: Kisah Pengrajin Manisan Pala Dapur Mama Halimah"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-medium text-[#081d35] focus:border-[#081d35] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#081d35] mb-1.5">Format Konten</label>
                  <select
                    value={contentForm.content_type}
                    onChange={(e) => setContentForm({ ...contentForm, content_type: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-bold text-[#081d35]"
                  >
                    <option value="ARTICLE">ARTICLE (Artikel SEO)</option>
                    <option value="PHOTO_GEOTAGGED">PHOTO_GEOTAGGED</option>
                    <option value="VIDEO_REELS">VIDEO_REELS (9:16)</option>
                    <option value="COMMUNITY_WORK">COMMUNITY_WORK (Karya Warga)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#081d35] mb-1.5">Kategori Prioritas</label>
                  <select
                    value={contentForm.priority_category}
                    onChange={(e) => setContentForm({ ...contentForm, priority_category: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-bold text-[#081d35]"
                  >
                    <option value="DESTINASI">DESTINASI</option>
                    <option value="UMKM">UMKM</option>
                    <option value="RELIGI_KULTURAL">RELIGI_KULTURAL</option>
                    <option value="LAYANAN_PUBLIK">LAYANAN_PUBLIK</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#081d35] mb-1.5">Pulau Lokasi</label>
                  <select
                    value={contentForm.island_name}
                    onChange={(e) => setContentForm({ ...contentForm, island_name: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-bold text-[#081d35]"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#081d35] mb-1.5">
                    Nama Penulis / Peserta Workshop
                  </label>
                  <input
                    type="text"
                    required
                    value={contentForm.author_name}
                    onChange={(e) => setContentForm({ ...contentForm, author_name: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-medium text-[#081d35]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#081d35] mb-1.5">Peran / Komunitas</label>
                  <input
                    type="text"
                    required
                    value={contentForm.author_role}
                    onChange={(e) => setContentForm({ ...contentForm, author_role: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-medium text-[#081d35]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#081d35] mb-1.5">
                    Pilih Aset Gambar Lokal (Offline-Ready 3T)
                  </label>
                  <select
                    value={contentForm.media_url || '/images/landmarks/belgica.jpg'}
                    onChange={(e) => setContentForm({ ...contentForm, media_url: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-[#081d35]"
                  >
                    {LOCAL_LANDMARK_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#081d35] mb-1.5">Tahap SOP 6-Tahap</label>
                  <select
                    value={contentForm.sop_stage}
                    onChange={(e) => setContentForm({ ...contentForm, sop_stage: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-[#081d35]"
                  >
                    <option value="IDE">1. IDE</option>
                    <option value="PRODUKSI">2. PRODUKSI</option>
                    <option value="REVIEW">3. REVIEW</option>
                    <option value="VALIDASI">4. VALIDASI</option>
                    <option value="PUBLIKASI">5. PUBLIKASI</option>
                    <option value="ARSIP">6. ARSIP</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#081d35] mb-1.5">
                  Ringkasan Konten / Hook Caption AIDA
                </label>
                <textarea
                  rows={2}
                  required
                  value={contentForm.summary}
                  onChange={(e) => setContentForm({ ...contentForm, summary: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs leading-relaxed text-[#081d35]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#081d35] mb-1.5">
                  Isi Narasi Lengkap / Naskah Storyboard AIDA
                </label>
                <textarea
                  rows={4}
                  required
                  value={contentForm.body_narrative}
                  onChange={(e) => setContentForm({ ...contentForm, body_narrative: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs leading-relaxed text-[#081d35]"
                />
              </div>

              {/* Interactive 6-Point Quality Checklist SOP Card */}
              <div className="rounded-2xl bg-[#f7f5f0] p-4 border border-slate-200">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-extrabold text-[#081d35] flex items-center gap-1.5">
                    <ShieldCheck size={16} className="text-emerald-600" />
                    Verifikasi 6-Point Quality Checklist SOP H6
                  </span>
                  <span
                    className={`rounded-full px-3 py-0.5 text-[11px] font-bold ${
                      formQcPassedCount === 6 ? 'bg-emerald-600 text-white' : 'bg-amber-200 text-amber-900'
                    }`}
                  >
                    Skor: {formQcPassedCount}/6 Lulus
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {[
                    {
                      key: 'qc_accuracy' as const,
                      label: '1. Akurasi Fakta Sejarah & Data',
                    },
                    {
                      key: 'qc_language' as const,
                      label: '2. Kerapian Bahasa & Caption AIDA',
                    },
                    {
                      key: 'qc_visual' as const,
                      label: '3. Kualitas Visual & Optimasi 3T',
                    },
                    {
                      key: 'qc_adat_ethics' as const,
                      label: '4. Etika Adat Tabea & Hukum Sasi',
                    },
                    {
                      key: 'qc_source_validated' as const,
                      label: '5. Validasi Narasumber / Tokoh',
                    },
                    {
                      key: 'qc_consent_copyright' as const,
                      label: '6. Consent Form & Kredit Warga',
                    },
                  ].map((item) => (
                    <label
                      key={item.key}
                      className={`flex items-center gap-2.5 rounded-xl border p-2.5 cursor-pointer transition-colors ${
                        contentForm[item.key]
                          ? 'bg-white border-emerald-300 text-[#081d35] font-semibold'
                          : 'bg-white/50 border-slate-200 text-slate-500'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={contentForm[item.key]}
                        onChange={(e) => setContentForm({ ...contentForm, [item.key]: e.target.checked })}
                        className="h-4 w-4 accent-emerald-600 rounded"
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-200">
                <label className="flex items-center gap-2 text-xs font-bold text-[#081d35] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={contentForm.is_published}
                    onChange={(e) => setContentForm({ ...contentForm, is_published: e.target.checked })}
                    className="h-4 w-4 accent-[#081d35] rounded"
                  />
                  Tayangkan Langsung di Portal Publik BST
                </label>

                <div className="flex items-center gap-2.5 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setShowCmsModal(false)}
                    className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="rounded-full bg-[#f4b75e] px-6 py-2.5 text-xs font-extrabold text-[#081d35] shadow-md hover:bg-amber-400 transition-colors"
                  >
                    Simpan ke Bank Konten CMS
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
