import React, { useState, useEffect } from 'react'
import {
  BookOpen,
  CheckCircle2,
  MapPin,
  Wifi,
  Plus,
  Edit2,
  Trash2,
  X,
  Eye,
  ShieldCheck,
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
]

const CONTENT_TYPE_LABELS: Record<string, string> = {
  ARTICLE: '📄 Artikel Feature / SEO',
  PHOTO_GEOTAGGED: '📸 Foto Geotagged GPS',
  VIDEO_REELS: '🎬 Video Reels @neirabasudara',
  COMMUNITY_WORK: '🏆 Karya Peserta Workshop',
}

const PRIORITY_CATEGORY_LABELS: Record<string, string> = {
  DESTINASI: '🏝️ Destinasi Wisata',
  UMKM: '🛍️ UMKM & Rempah',
  RELIGI_KULTURAL: '🏛️ Religi & Kultural (Tabea/Sasi)',
  LAYANAN_PUBLIK: '⛵ Layanan Publik & Transportasi',
}

const SOP_STAGE_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  IDE: { bg: '#F1F5F9', color: '#475569', border: '#CBD5E1' },
  PRODUKSI: { bg: '#E0F2FE', color: '#0369A1', border: '#BAE6FD' },
  REVIEW: { bg: '#FEF3C7', color: '#B45309', border: '#FDE68A' },
  VALIDASI: { bg: '#EDE9FE', color: '#6D28D9', border: '#DDD6FE' },
  PUBLIKASI: { bg: '#DCFCE7', color: '#15803D', border: '#BBF7D0' },
  ARSIP: { bg: '#F3F4F6', color: '#374151', border: '#D1D5DB' },
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

  // CMS States
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
          text: `Karya/konten baru "${contentForm.title}" berhasil diunggah ke Bank Konten BST!`,
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
        text: `Status tayang "${item.title}" diubah menjadi: ${!item.is_published ? 'Tayang Publik (PUBLIKASI)' : 'Draft Review'}.`,
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

  if (mode === 'cms_manager' && !canManageCMS) {
    return (
      <div className="card" style={{ padding: '2.5rem 1.5rem', textAlign: 'center', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px' }}>
        <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.15rem', fontWeight: 900, color: '#081D35' }}>
          Akses CMS Bank Konten Terbatas
        </h4>
        <p style={{ margin: '0 auto 1.25rem', maxWidth: '520px', fontSize: '0.84rem', color: '#475569' }}>
          Silakan masuk sebagai <b>Smart Tourism Admin</b>, <b>Petugas Desa</b>, atau <b>Administrator</b> untuk mengunggah karya warga dan memverifikasi 6-Point Quality Checklist SOP.
        </p>
        {onOpenQuickLogin && (
          <button
            type="button"
            onClick={onOpenQuickLogin}
            className="btn btn-primary"
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #F4B75E 0%, #E0A24A 100%)',
              color: '#081D35',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            Masuk Akun Pengelola CMS
          </button>
        )}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* =====================================================================
          MODE 1: PUBLIC HUB (BANK KONTEN, 3 MODUL LITERASI, & 4 ZONA SINYAL)
      ===================================================================== */}
      {showPublicSection && (
        <div>
          {/* Header Banner Mandat Reyhan Albar Fahryan */}
          <div
            className="card"
            style={{
              padding: '1.35rem 1.5rem',
              background: 'linear-gradient(135deg, #081D35 0%, #0F2C59 100%)',
              color: '#FFFFFF',
              borderRadius: '18px',
              marginBottom: '1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              boxShadow: '0 8px 24px rgba(8, 29, 53, 0.14)',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                <span
                  style={{
                    background: 'rgba(244, 183, 94, 0.2)',
                    color: '#F4B75E',
                    border: '1px solid rgba(244, 183, 94, 0.4)',
                    padding: '0.2rem 0.65rem',
                    borderRadius: '999px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                  }}
                >
                  MANDAT CONTENT MANAGER &amp; COMMUNITY ENGAGEMENT
                </span>
                <span
                  style={{
                    background: 'rgba(16, 185, 129, 0.2)',
                    color: '#6EE7B7',
                    padding: '0.2rem 0.65rem',
                    borderRadius: '999px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                  }}
                >
                  @neirabasudara · Pokdarwis &amp; UMKM Banda
                </span>
              </div>
              <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900, color: '#FFFFFF' }}>
                Pusat Bank Konten Wisata, Karya Komunitas &amp; Literasi Digital BST
              </h3>
              <p style={{ margin: '0.35rem 0 0', fontSize: '0.82rem', color: '#CBD5E1', maxWidth: '780px', lineHeight: 1.5 }}>
                Etalase artikel feature SEO, foto geotagged GPS, storyboard video Reels 9:16, serta karya mandiri peserta
                Workshop Literasi Digital Pokdarwis &amp; UMKM yang telah lulus kurasi <b>6-Point Quality Checklist SOP</b>.
              </p>
            </div>

            {/* Sub-Navigation Pills */}
            <div
              style={{
                display: 'flex',
                gap: '0.4rem',
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '0.35rem',
                borderRadius: '12px',
                flexWrap: 'wrap',
              }}
            >
              <button
                type="button"
                onClick={() => setHubSubTab('bank_konten')}
                style={{
                  padding: '0.5rem 0.9rem',
                  borderRadius: '9px',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  background: hubSubTab === 'bank_konten' ? '#F4B75E' : 'transparent',
                  color: hubSubTab === 'bank_konten' ? '#081D35' : '#E2E8F0',
                }}
              >
                📰 Bank Konten &amp; Karya ({contents.length})
              </button>
              <button
                type="button"
                onClick={() => setHubSubTab('modul_sop')}
                style={{
                  padding: '0.5rem 0.9rem',
                  borderRadius: '9px',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  background: hubSubTab === 'modul_sop' ? '#F4B75E' : 'transparent',
                  color: hubSubTab === 'modul_sop' ? '#081D35' : '#E2E8F0',
                }}
              >
                📚 3 Modul Literasi &amp; SOP 6-Tahap
              </button>
              <button
                type="button"
                onClick={() => setHubSubTab('zona_sinyal')}
                style={{
                  padding: '0.5rem 0.9rem',
                  borderRadius: '9px',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  background: hubSubTab === 'zona_sinyal' ? '#F4B75E' : 'transparent',
                  color: hubSubTab === 'zona_sinyal' ? '#081D35' : '#E2E8F0',
                }}
              >
                📡 Peta Sinyal 4 Zona &amp; Offline 3T
              </button>
            </div>
          </div>

          {/* SUB-TAB 1: BANK KONTEN & KARYA KOMUNITAS */}
          {hubSubTab === 'bank_konten' && (
            <div>
              {/* Filter Bar */}
              <div
                className="card"
                style={{
                  padding: '1rem 1.25rem',
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '14px',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.85rem',
                }}
              >
                <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#081D35', marginRight: '0.25rem' }}>
                    Kategori Prioritas:
                  </span>
                  {[
                    { code: '', label: 'Semua Kategori' },
                    { code: 'DESTINASI', label: '🏝️ Destinasi' },
                    { code: 'UMKM', label: '🛍️ UMKM Rempah' },
                    { code: 'RELIGI_KULTURAL', label: '🏛️ Religi & Adat' },
                    { code: 'LAYANAN_PUBLIK', label: '⛵ Layanan Publik' },
                  ].map((cat) => (
                    <button
                      key={cat.code}
                      type="button"
                      onClick={() => setCategoryFilter(cat.code)}
                      style={{
                        padding: '0.38rem 0.75rem',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        background: categoryFilter === cat.code ? '#081D35' : '#F8FAFC',
                        color: categoryFilter === cat.code ? '#F4B75E' : '#475569',
                      }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#081D35' }}>Format:</span>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    style={{
                      padding: '0.4rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      background: '#FFFFFF',
                      color: '#081D35',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                    }}
                  >
                    <option value="">Semua Format Konten</option>
                    <option value="ARTICLE">📄 Artikel Feature / SEO</option>
                    <option value="PHOTO_GEOTAGGED">📸 Foto Geotagged GPS</option>
                    <option value="VIDEO_REELS">🎬 Video Reels 9:16 (@neirabasudara)</option>
                    <option value="COMMUNITY_WORK">🏆 Karya Peserta Workshop (H11)</option>
                  </select>
                </div>
              </div>

              {/* Content Cards Grid */}
              {loading ? (
                <div style={{ textAlign: 'center', padding: '2.5rem', color: '#64748B', fontSize: '0.9rem' }}>
                  Memuat Bank Konten &amp; Karya Komunitas Banda Neira...
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))',
                    gap: '1.25rem',
                  }}
                >
                  {contents.map((item) => (
                    <div
                      key={item.id}
                      className="card"
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: '0 4px 14px rgba(8, 29, 53, 0.05)',
                      }}
                    >
                      <div>
                        <div style={{ position: 'relative', height: '190px', overflow: 'hidden', background: '#081D35' }}>
                          <img
                            src={item.media_url || '/images/landmarks/belgica.jpg'}
                            alt={item.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <div
                            style={{
                              position: 'absolute',
                              top: '0.65rem',
                              left: '0.65rem',
                              display: 'flex',
                              gap: '0.35rem',
                              flexWrap: 'wrap',
                            }}
                          >
                            <span
                              style={{
                                background: 'rgba(8, 29, 53, 0.88)',
                                color: '#F4B75E',
                                padding: '0.22rem 0.55rem',
                                borderRadius: '6px',
                                fontSize: '0.68rem',
                                fontWeight: 800,
                              }}
                            >
                              {CONTENT_TYPE_LABELS[item.content_type] || item.content_type}
                            </span>
                            <span
                              style={{
                                background: 'rgba(255, 255, 255, 0.94)',
                                color: '#081D35',
                                padding: '0.22rem 0.55rem',
                                borderRadius: '6px',
                                fontSize: '0.68rem',
                                fontWeight: 800,
                              }}
                            >
                              {PRIORITY_CATEGORY_LABELS[item.priority_category] || item.priority_category}
                            </span>
                          </div>
                          <div
                            style={{
                              position: 'absolute',
                              bottom: '0.6rem',
                              right: '0.6rem',
                              background: '#DCFCE7',
                              color: '#15803D',
                              border: '1px solid #86EFAC',
                              padding: '0.2rem 0.55rem',
                              borderRadius: '999px',
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}
                          >
                            <CheckCircle2 size={12} /> {item.qc_passed_count}/6 Checklist Mutu SOP
                          </div>
                        </div>

                        <div style={{ padding: '1.15rem' }}>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              fontSize: '0.72rem',
                              color: '#64748B',
                              marginBottom: '0.4rem',
                            }}
                          >
                            <span style={{ fontWeight: 700, color: '#0369A1', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                              <MapPin size={12} /> {item.island_name}
                              {item.latitude && item.longitude ? ` (${item.latitude.toFixed(4)}, ${item.longitude.toFixed(4)})` : ''}
                            </span>
                            <code style={{ background: '#F1F5F9', padding: '0.1rem 0.4rem', borderRadius: '4px', color: '#081D35', fontWeight: 700 }}>
                              {item.content_code}
                            </code>
                          </div>

                          <h4 style={{ margin: '0 0 0.5rem', fontSize: '1rem', fontWeight: 900, color: '#081D35', lineHeight: 1.35 }}>
                            {item.title}
                          </h4>

                          <p style={{ margin: '0 0 0.85rem', fontSize: '0.8rem', color: '#475569', lineHeight: 1.55 }}>
                            {item.summary}
                          </p>
                        </div>
                      </div>

                      <div
                        style={{
                          padding: '0.85rem 1.15rem',
                          borderTop: '1px solid #F1F5F9',
                          background: '#F8FAFC',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        <div style={{ fontSize: '0.72rem' }}>
                          <div style={{ fontWeight: 800, color: '#081D35' }}>{item.author_name}</div>
                          <div style={{ color: '#64748B' }}>{item.author_role}</div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedContentModal(item)}
                          style={{
                            padding: '0.45rem 0.8rem',
                            borderRadius: '8px',
                            border: '1px solid #081D35',
                            background: '#081D35',
                            color: '#F4B75E',
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <Eye size={13} /> Baca Selengkapnya
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SUB-TAB 2: 3 MODUL LITERASI DIGITAL & SOP KONTEN 6-TAHAP */}
          {hubSubTab === 'modul_sop' && governance && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* 3 Modul Literasi Digital */}
              <div>
                <h4 style={{ margin: '0 0 0.85rem', fontSize: '1.08rem', fontWeight: 900, color: '#081D35', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <BookOpen size={18} color="#0284C7" /> Kurikulum 3 Modul Literasi Digital Pokdarwis &amp; UMKM Banda Neira
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '1.15rem' }}>
                  {governance.modules.map((mod) => (
                    <div
                      key={mod.module_code}
                      className="card"
                      style={{
                        padding: '1.25rem',
                        background: '#FFFFFF',
                        border: mod.validation_status === 'SIAP_UJI_PENUH' ? '2px solid #F4B75E' : '1px solid #E2E8F0',
                        borderRadius: '16px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                        <span style={{ fontWeight: 900, fontSize: '0.8rem', color: '#081D35', background: '#F1F5F9', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                          {mod.module_code} · {mod.duration_minutes} Menit
                        </span>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            padding: '0.2rem 0.6rem',
                            borderRadius: '999px',
                            background: mod.validation_status === 'SIAP_UJI_PENUH' ? '#DCFCE7' : '#FEF3C7',
                            color: mod.validation_status === 'SIAP_UJI_PENUH' ? '#15803D' : '#B45309',
                          }}
                        >
                          {mod.validation_status === 'SIAP_UJI_PENUH' ? '✓ SIAP UJI PENUH (H11)' : '✓ DRAFT TERVALIDASI'}
                        </span>
                      </div>

                      <h5 style={{ margin: '0 0 0.5rem', fontSize: '1rem', fontWeight: 900, color: '#081D35', lineHeight: 1.35 }}>
                        {mod.title}
                      </h5>
                      <div style={{ fontSize: '0.74rem', color: '#0369A1', fontWeight: 700, marginBottom: '0.75rem' }}>
                        Sasaran: {mod.target_audience}
                      </div>

                      <div style={{ fontSize: '0.76rem', color: '#334155', marginBottom: '0.75rem' }}>
                        <b style={{ display: 'block', marginBottom: '0.25rem', color: '#081D35' }}>Tujuan Pembelajaran:</b>
                        <ul style={{ margin: 0, paddingLeft: '1.15rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          {mod.learning_objectives.map((obj, idx) => (
                            <li key={idx}>{obj}</li>
                          ))}
                        </ul>
                      </div>

                      <div
                        style={{
                          padding: '0.65rem 0.8rem',
                          background: '#F8FAFC',
                          borderRadius: '10px',
                          border: '1px solid #E2E8F0',
                          fontSize: '0.74rem',
                          color: '#081D35',
                        }}
                      >
                        <b>Target Output Praktik:</b> {mod.practical_output}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SOP 6-Tahap Manajemen Konten BST */}
              <div
                className="card"
                style={{
                  padding: '1.35rem',
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '16px',
                }}
              >
                <h4 style={{ margin: '0 0 0.35rem', fontSize: '1.05rem', fontWeight: 900, color: '#081D35' }}>
                  Alur Kerja SOP 6-Tahap Manajemen Konten Komunitas BST
                </h4>
                <p style={{ margin: '0 0 1rem', fontSize: '0.8rem', color: '#64748B' }}>
                  Standar operasional baku dari perencanaan ide liputan warga hingga kurasi adat dan publikasi lintas kanal.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem' }}>
                  {governance.sop_stages.map((st) => {
                    const badgeStyle = SOP_STAGE_COLORS[st.stage_code] || SOP_STAGE_COLORS.IDE
                    return (
                      <div
                        key={st.stage_code}
                        style={{
                          padding: '0.95rem',
                          borderRadius: '12px',
                          border: `1px solid ${badgeStyle.border}`,
                          background: '#FAFAFA',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                          <span
                            style={{
                              padding: '0.18rem 0.55rem',
                              borderRadius: '6px',
                              fontSize: '0.7rem',
                              fontWeight: 900,
                              background: badgeStyle.bg,
                              color: badgeStyle.color,
                            }}
                          >
                            TAHAP {st.stage_order}: {st.stage_code}
                          </span>
                        </div>
                        <div style={{ fontWeight: 800, fontSize: '0.86rem', color: '#081D35', marginBottom: '0.3rem' }}>
                          {st.stage_name}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#0369A1', fontWeight: 700, marginBottom: '0.35rem' }}>
                          PIC: {st.pic_actor}
                        </div>
                        <p style={{ margin: '0 0 0.45rem', fontSize: '0.74rem', color: '#475569', lineHeight: 1.45 }}>
                          {st.description}
                        </p>
                        <div style={{ fontSize: '0.7rem', color: '#15803D', fontWeight: 700 }}>
                          Luaran: {st.deliverable}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* 6-Point Quality Checklist Standards */}
              <div
                className="card"
                style={{
                  padding: '1.35rem',
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '16px',
                }}
              >
                <h4 style={{ margin: '0 0 0.75rem', fontSize: '1.05rem', fontWeight: 900, color: '#081D35', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <ShieldCheck size={18} color="#15803D" /> Standar 6-Point Quality Checklist sebelum Publikasi (H6)
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
                  {governance.quality_checklist_standards.map((qc) => (
                    <div
                      key={qc.code}
                      style={{
                        padding: '0.8rem 1rem',
                        borderRadius: '10px',
                        border: '1px solid #DCFCE7',
                        background: '#F0FDF4',
                      }}
                    >
                      <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#15803D', marginBottom: '0.2rem' }}>
                        ✓ [{qc.code}] {qc.label}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#334155', lineHeight: 1.45 }}>{qc.criteria}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SUB-TAB 3: PETA SINYAL 4 ZONA PULAU & STRATEGI OFFLINE 3T */}
          {hubSubTab === 'zona_sinyal' && governance && (
            <div
              className="card"
              style={{
                padding: '1.35rem',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '16px',
              }}
            >
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ margin: '0 0 0.3rem', fontSize: '1.08rem', fontWeight: 900, color: '#081D35', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Wifi size={18} color="#0284C7" /> Pemetaan 4 Zona Sinyal Kepulauan Banda &amp; Strategi Konten Offline 3T
                </h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B' }}>
                  Hasil survei kolaborasi Reyhan Albar Fahryan &amp; Syahid (`SRV-202611-007`) sebagai landasan penggunaan aset gambar lokal dan antrean sinkronisasi PWA.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                {governance.signal_zones_mapping.map((z) => (
                  <div
                    key={z.zone_code}
                    style={{
                      padding: '1.1rem',
                      borderRadius: '14px',
                      border: '1px solid #E2E8F0',
                      background: z.signal_status.includes('BLANKSPOT') ? '#FEF2F2' : '#F8FAFC',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 900, fontSize: '0.8rem', color: '#081D35' }}>
                        {z.zone_code} · {z.avg_download_mbps} Mbps
                      </span>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          padding: '0.2rem 0.55rem',
                          borderRadius: '999px',
                          background: z.signal_status.includes('BLANKSPOT')
                            ? '#FEE2E2'
                            : z.signal_status.includes('STABIL')
                            ? '#DCFCE7'
                            : '#FEF3C7',
                          color: z.signal_status.includes('BLANKSPOT')
                            ? '#BE123C'
                            : z.signal_status.includes('STABIL')
                            ? '#15803D'
                            : '#B45309',
                        }}
                      >
                        {z.signal_status}
                      </span>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#081D35', marginBottom: '0.3rem' }}>
                      {z.zone_name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#0369A1', fontWeight: 700, marginBottom: '0.5rem' }}>
                      Cakupan: {z.islands_covered}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#334155', lineHeight: 1.45 }}>
                      <b>Strategi Teknis &amp; Konten:</b> {z.recommended_sync_strategy}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          MODE 2: CMS MANAGER (KURASI KONTEN, SOP 6-TAHAP & 6-POINT QC)
      ===================================================================== */}
      {showCmsSection && (
        <div>
          {cmsNotice && (
            <div
              style={{
                marginBottom: '1rem',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                background: cmsNotice.type === 'success' ? '#DCFCE7' : '#FEE2E2',
                border: `1px solid ${cmsNotice.type === 'success' ? '#86EFAC' : '#FECDD3'}`,
                color: cmsNotice.type === 'success' ? '#15803D' : '#BE123C',
                fontSize: '0.82rem',
                fontWeight: 700,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>{cmsNotice.text}</span>
              <button
                type="button"
                onClick={() => setCmsNotice(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit' }}
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <div>
              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#081D35' }}>
                Panel CMS Bank Konten &amp; Verifikasi 6-Point Quality Checklist SOP
              </h4>
              <span style={{ fontSize: '0.76rem', color: '#64748B' }}>
                Unggah artikel wisata baru, kurasi karya peserta Workshop Pokdarwis/UMKM, dan validasi 6 poin mutu sebelum tayang.
              </span>
            </div>

            <button
              type="button"
              onClick={handleOpenAddContent}
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.6rem 1.05rem',
                fontSize: '0.8rem',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #F4B75E 0%, #E0A24A 100%)',
                color: '#081D35',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(244, 183, 94, 0.35)',
              }}
            >
              <Plus size={15} /> + Unggah Artikel / Karya Warga Baru
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {contents.map((item) => {
              const stageBadge = SOP_STAGE_COLORS[item.sop_stage] || SOP_STAGE_COLORS.PUBLIKASI
              return (
                <div
                  key={item.id}
                  className="card"
                  style={{
                    padding: '1rem 1.25rem',
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', minWidth: '280px', flex: 1 }}>
                    <img
                      src={item.media_url || '/images/landmarks/belgica.jpg'}
                      alt={item.title}
                      style={{ width: '68px', height: '68px', borderRadius: '12px', objectFit: 'cover', flexShrink: 0 }}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                        <code style={{ fontSize: '0.7rem', fontWeight: 800, background: '#F1F5F9', padding: '0.1rem 0.4rem', borderRadius: '4px', color: '#081D35' }}>
                          {item.content_code}
                        </code>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            padding: '0.15rem 0.5rem',
                            borderRadius: '6px',
                            background: stageBadge.bg,
                            color: stageBadge.color,
                            border: `1px solid ${stageBadge.border}`,
                          }}
                        >
                          SOP: {item.sop_stage}
                        </span>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            padding: '0.15rem 0.5rem',
                            borderRadius: '6px',
                            background: item.qc_passed_count === 6 ? '#DCFCE7' : '#FEF3C7',
                            color: item.qc_passed_count === 6 ? '#15803D' : '#B45309',
                          }}
                        >
                          ✓ QC: {item.qc_passed_count}/6 Poin Lulus
                        </span>
                        <span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>
                          { item.priority_category }
                        </span>
                      </div>

                      <div style={{ fontWeight: 800, fontSize: '0.94rem', color: '#081D35' }}>{item.title}</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '0.2rem' }}>
                        Penulis: <b style={{ color: '#081D35' }}>{item.author_name}</b> ({item.author_role}) · {item.island_name}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => handleTogglePublish(item)}
                      style={{
                        padding: '0.45rem 0.75rem',
                        borderRadius: '8px',
                        border: '1px solid #E2E8F0',
                        background: item.is_published ? '#FEF3C7' : '#DCFCE7',
                        color: item.is_published ? '#B45309' : '#15803D',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {item.is_published ? 'Tarik ke Review' : 'Tayangkan Publik'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEditContent(item)}
                      style={{
                        padding: '0.45rem 0.75rem',
                        borderRadius: '8px',
                        border: '1px solid #E2E8F0',
                        background: '#F8FAFC',
                        color: '#081D35',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                      }}
                    >
                      <Edit2 size={13} /> Edit &amp; Cek 6-QC
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteContent(item.id, item.title)}
                      style={{
                        padding: '0.45rem 0.75rem',
                        borderRadius: '8px',
                        border: '1px solid #FECDD3',
                        background: '#FEE2E2',
                        color: '#BE123C',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                      }}
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
          MODAL 1: BACA SELENGKAPNYA (NARASI LENGKAP, STORYBOARD & 6-POINT QC)
      ===================================================================== */}
      {selectedContentModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(8, 29, 53, 0.68)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '1rem',
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: '660px',
              width: '100%',
              background: '#FFFFFF',
              borderRadius: '20px',
              overflow: 'hidden',
              maxHeight: '90vh',
              overflowY: 'auto',
              color: '#081D35',
              boxShadow: '0 24px 60px rgba(8, 29, 53, 0.28)',
            }}
          >
            <div style={{ position: 'relative', height: '240px', background: '#081D35' }}>
              <img
                src={selectedContentModal.media_url || '/images/landmarks/belgica.jpg'}
                alt={selectedContentModal.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <button
                type="button"
                onClick={() => setSelectedContentModal(null)}
                style={{
                  position: 'absolute',
                  top: '0.85rem',
                  right: '0.85rem',
                  background: 'rgba(8, 29, 53, 0.8)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '999px',
                  width: '34px',
                  height: '34px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
                <span className="badge badge-amber">{selectedContentModal.content_code}</span>
                <span className="badge badge-blue">
                  {CONTENT_TYPE_LABELS[selectedContentModal.content_type] || selectedContentModal.content_type}
                </span>
                <span className="badge badge-emerald">
                  SOP: {selectedContentModal.sop_stage} ({selectedContentModal.qc_passed_count}/6 QC Lulus)
                </span>
              </div>

              <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.3rem', fontWeight: 900, color: '#081D35' }}>
                {selectedContentModal.title}
              </h3>

              <div style={{ fontSize: '0.78rem', color: '#475569', marginBottom: '1rem' }}>
                Oleh <b>{selectedContentModal.author_name}</b> ({selectedContentModal.author_role}) · Lokasi:{' '}
                <b>{selectedContentModal.island_name}</b>
                {selectedContentModal.latitude && selectedContentModal.longitude
                  ? ` · GPS: ${selectedContentModal.latitude}, ${selectedContentModal.longitude}`
                  : ''}
              </div>

              <div
                style={{
                  padding: '0.85rem 1rem',
                  background: '#F8FAFC',
                  borderLeft: '4px solid #F4B75E',
                  borderRadius: '8px',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  color: '#1E293B',
                  marginBottom: '1rem',
                }}
              >
                {selectedContentModal.summary}
              </div>

              <div
                style={{
                  fontSize: '0.88rem',
                  color: '#334155',
                  lineHeight: 1.7,
                  whiteSpace: 'pre-line',
                  marginBottom: '1.25rem',
                }}
              >
                {selectedContentModal.body_narrative}
              </div>

              {/* 6-Point Quality Checklist Verification Box */}
              <div
                style={{
                  padding: '1rem',
                  background: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  borderRadius: '12px',
                  fontSize: '0.76rem',
                }}
              >
                <div style={{ fontWeight: 800, color: '#15803D', marginBottom: '0.45rem' }}>
                  ✓ Bukti Verifikasi 6-Point Quality Checklist SOP BST:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.35rem', color: '#166534' }}>
                  <div>{selectedContentModal.qc_accuracy ? '✅' : '⬜'} 1. Akurasi Fakta Sejarah &amp; Data</div>
                  <div>{selectedContentModal.qc_language ? '✅' : '⬜'} 2. Kerapian Bahasa &amp; Struktur AIDA</div>
                  <div>{selectedContentModal.qc_visual ? '✅' : '⬜'} 3. Kualitas Visual &amp; Optimasi 3T</div>
                  <div>{selectedContentModal.qc_adat_ethics ? '✅' : '⬜'} 4. Etika Adat Tabea &amp; Hukum Sasi</div>
                  <div>{selectedContentModal.qc_source_validated ? '✅' : '⬜'} 5. Validasi Narasumber Lokal</div>
                  <div>{selectedContentModal.qc_consent_copyright ? '✅' : '⬜'} 6. Izin Publikasi &amp; Kredit Warga</div>
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
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(8, 29, 53, 0.68)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '1rem',
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: '640px',
              width: '100%',
              padding: '1.5rem',
              background: '#FFFFFF',
              borderRadius: '20px',
              maxHeight: '90vh',
              overflowY: 'auto',
              color: '#081D35',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <span className="badge badge-amber" style={{ fontSize: '0.68rem' }}>
                  CMS BANK KONTEN &amp; KARYA KOMUNITAS
                </span>
                <h3 style={{ margin: '0.2rem 0 0', fontSize: '1.2rem', fontWeight: 900, color: '#081D35' }}>
                  {editingContentId ? 'Edit Konten & Verifikasi 6-Point QC' : 'Unggah Artikel / Karya Warga Baru'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCmsModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveContent} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                  Judul Artikel / Karya Komunitas:
                </label>
                <input
                  type="text"
                  required
                  value={contentForm.title}
                  onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })}
                  placeholder="Contoh: Kisah Pengrajin Manisan Pala Dapur Mama Halimah"
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.84rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.65rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    Format Konten:
                  </label>
                  <select
                    value={contentForm.content_type}
                    onChange={(e) => setContentForm({ ...contentForm, content_type: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.8rem' }}
                  >
                    <option value="ARTICLE">ARTICLE (Artikel SEO)</option>
                    <option value="PHOTO_GEOTAGGED">PHOTO_GEOTAGGED</option>
                    <option value="VIDEO_REELS">VIDEO_REELS (9:16)</option>
                    <option value="COMMUNITY_WORK">COMMUNITY_WORK (Karya Warga)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    Kategori Prioritas:
                  </label>
                  <select
                    value={contentForm.priority_category}
                    onChange={(e) => setContentForm({ ...contentForm, priority_category: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.8rem' }}
                  >
                    <option value="DESTINASI">DESTINASI</option>
                    <option value="UMKM">UMKM</option>
                    <option value="RELIGI_KULTURAL">RELIGI_KULTURAL</option>
                    <option value="LAYANAN_PUBLIK">LAYANAN_PUBLIK</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    Pulau Lokasi:
                  </label>
                  <select
                    value={contentForm.island_name}
                    onChange={(e) => setContentForm({ ...contentForm, island_name: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.8rem' }}
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    Nama Penulis / Peserta Workshop:
                  </label>
                  <input
                    type="text"
                    required
                    value={contentForm.author_name}
                    onChange={(e) => setContentForm({ ...contentForm, author_name: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem 0.7rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    Peran / Komunitas:
                  </label>
                  <input
                    type="text"
                    required
                    value={contentForm.author_role}
                    onChange={(e) => setContentForm({ ...contentForm, author_role: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem 0.7rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.65rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    Pilih Aset Gambar Lokal (Offline-Ready 3T):
                  </label>
                  <select
                    value={contentForm.media_url || '/images/landmarks/belgica.jpg'}
                    onChange={(e) => setContentForm({ ...contentForm, media_url: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.8rem' }}
                  >
                    {LOCAL_LANDMARK_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    Tahap SOP 6-Tahap:
                  </label>
                  <select
                    value={contentForm.sop_stage}
                    onChange={(e) => setContentForm({ ...contentForm, sop_stage: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.8rem', fontWeight: 700 }}
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
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                  Ringkasan Konten / Hook Caption AIDA:
                </label>
                <textarea
                  rows={2}
                  required
                  value={contentForm.summary}
                  onChange={(e) => setContentForm({ ...contentForm, summary: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                  Isi Narasi Lengkap / Naskah Storyboard AIDA:
                </label>
                <textarea
                  rows={4}
                  required
                  value={contentForm.body_narrative}
                  onChange={(e) => setContentForm({ ...contentForm, body_narrative: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem' }}
                />
              </div>

              {/* 6-Point Quality Checklist SOP H6 */}
              <div
                style={{
                  padding: '0.9rem 1rem',
                  background: '#F8FAFC',
                  border: '1px solid #CBD5E1',
                  borderRadius: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.8rem', color: '#081D35' }}>
                    Verifikasi 6-Point Quality Checklist SOP H6:
                  </span>
                  <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
                    Skor: {formQcPassedCount}/6 Lulus
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.45rem', fontSize: '0.76rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={contentForm.qc_accuracy}
                      onChange={(e) => setContentForm({ ...contentForm, qc_accuracy: e.target.checked })}
                    />
                    1. Akurasi Fakta Sejarah &amp; Data
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={contentForm.qc_language}
                      onChange={(e) => setContentForm({ ...contentForm, qc_language: e.target.checked })}
                    />
                    2. Kerapian Bahasa &amp; Caption AIDA
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={contentForm.qc_visual}
                      onChange={(e) => setContentForm({ ...contentForm, qc_visual: e.target.checked })}
                    />
                    3. Kualitas Visual &amp; Optimasi 3T
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={contentForm.qc_adat_ethics}
                      onChange={(e) => setContentForm({ ...contentForm, qc_adat_ethics: e.target.checked })}
                    />
                    4. Etika Adat Tabea &amp; Hukum Sasi
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={contentForm.qc_source_validated}
                      onChange={(e) => setContentForm({ ...contentForm, qc_source_validated: e.target.checked })}
                    />
                    5. Validasi Narasumber / Tokoh
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={contentForm.qc_consent_copyright}
                      onChange={(e) => setContentForm({ ...contentForm, qc_consent_copyright: e.target.checked })}
                    />
                    6. Consent Form &amp; Kredit Warga
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={contentForm.is_published}
                    onChange={(e) => setContentForm({ ...contentForm, is_published: e.target.checked })}
                  />
                  Tayangkan Langsung di Portal Publik BST
                </label>

                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowCmsModal(false)}
                    style={{
                      padding: '0.55rem 1rem',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      background: '#FFFFFF',
                      color: '#475569',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '0.55rem 1.2rem',
                      borderRadius: '10px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #F4B75E 0%, #E0A24A 100%)',
                      color: '#081D35',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
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
