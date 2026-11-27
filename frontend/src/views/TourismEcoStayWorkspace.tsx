import React, { useState, useEffect } from 'react'
import { useLanguage } from '../context/LanguageContext'
import {
  Compass,
  Home,
  Landmark,
  Search,
  Droplets,
  Sun,
  Calendar,
  MessageCircle,
  Volume2,
  RefreshCw,
  CheckCircle2,
  X,
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Shield,
  Settings,
  Star,
  Award,
  Phone,
  UserCheck,
  Users,
  Lock,
  Zap,
  BookOpen,
  Eye,
  ExternalLink,
  Sparkles,
  ShieldCheck,
} from 'lucide-react'
import { CommunityLiteracyHub } from './CommunityLiteracyHub'
import { PokdarwisHistoryCms } from '../components/dashboard/PokdarwisHistoryCms'
import {
  tourismService,
  AccommodationItem,
  BookingItem,
  HeritageCatalogItem,
  TourGuideItem,
  AccommodationCreatePayload,
  TourGuideCreatePayload,
  TourismSubTab,
  getPreferredTourismSubTab,
  setPreferredTourismSubTab,
  CommunityContentItem,
} from '../services/tourism'
import { gisService, GeoJSONFeature } from '../services/gis'
import { getFeatureMedia } from './InteractiveMapWorkspace'

export interface TourismEcoStayWorkspaceProps {
  currentUser?: any
  onOpenQuickLogin?: () => void
  onNavigate?: (tab: any, param?: any) => void
}

export const TourismEcoStayWorkspace: React.FC<TourismEcoStayWorkspaceProps> = ({
  currentUser,
  onOpenQuickLogin,
  onNavigate,
}) => {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState<TourismSubTab>(() => getPreferredTourismSubTab())
  const [destIslandFilter, setDestIslandFilter] = useState<string>('')
  const [destCategoryFilter, setDestCategoryFilter] = useState<string>('')
  const [destSearchQuery, setDestSearchQuery] = useState<string>('')
  const [gisFeatures, setGisFeatures] = useState<GeoJSONFeature[]>([])
  const [loadingGis, setLoadingGis] = useState<boolean>(true)
  const [articles, setArticles] = useState<CommunityContentItem[]>([])

  // Role permissions
  const userRoleNames: string[] = currentUser
    ? (currentUser.roles || []).map((r: any) => (typeof r === 'string' ? r : r.name))
    : []
  const isSuperuser = Boolean(currentUser?.is_superuser)
  const isHomestayOperator = isSuperuser || userRoleNames.some((r) => ['admin', 'village_officer', 'operator_homestay', 'homestay_operator'].includes(r))
  const isSmartTourismAdmin = isSuperuser || userRoleNames.some((r) => ['admin', 'village_officer', 'smart_tourism_admin', 'admin_wisata'].includes(r))
  const isSmartTourismOnly = userRoleNames.some((r) => ['smart_tourism_admin', 'admin_wisata'].includes(r)) && !isSuperuser && !userRoleNames.some((r) => ['operator_homestay', 'homestay_operator'].includes(r))
  const canAccessCMS = isHomestayOperator || isSmartTourismAdmin
  const canAccessBookings = isHomestayOperator || isSmartTourismAdmin

  // Accommodations State
  const [accommodations, setAccommodations] = useState<AccommodationItem[]>([])
  const [loadingAccs, setLoadingAccs] = useState<boolean>(true)
  const [islandFilter, setIslandFilter] = useState<string>('')
  const [villageFilter, setVillageFilter] = useState<string>('')
  const [accSearch, setAccSearch] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [filterRoOnly, setFilterRoOnly] = useState<boolean>(false)
  const [filterSolarOnly, setFilterSolarOnly] = useState<boolean>(false)

  // Tour Guides State
  const [guides, setGuides] = useState<TourGuideItem[]>([])
  const [loadingGuides, setLoadingGuides] = useState<boolean>(false)
  const [guideIslandFilter, setGuideIslandFilter] = useState<string>('')
  const [guideSearch, setGuideSearch] = useState<string>('')

  // Bookings State
  const [bookingSearch, setBookingSearch] = useState<string>('')

  // CMS State
  const [cmsSubTab, setCmsSubTab] = useState<'accommodations' | 'guides' | 'community_contents' | 'history_articles'>('accommodations')
  const [cmsNotice, setCmsNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // CMS Accommodation Modal
  const [showAccModal, setShowAccModal] = useState<boolean>(false)
  const [editingAccId, setEditingAccId] = useState<string | null>(null)
  const [accForm, setAccForm] = useState<AccommodationCreatePayload>({
    name: '',
    type: 'HOMESTAY',
    island_name: 'Pulau Neira',
    address: 'Banda Neira, Maluku Tengah',
    price_per_night_rp: 350000,
    rooms_available: 4,
    has_clean_ro_water: true,
    has_solar_backup: true,
    eco_stay_badge: true,
    contact_whatsapp: '6281234567891',
    description: '',
    photo_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
  })

  // CMS Guide Modal
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false)
  const [editingGuideId, setEditingGuideId] = useState<string | null>(null)
  const [guideForm, setGuideForm] = useState<TourGuideCreatePayload>({
    resident_nik: '',
    name: '',
    license_number: 'HPI-BANDA-LOKAL',
    phone_whatsapp: '6281234567896',
    specialties: 'Sejarah Benteng VOC & Budaya Banda',
    languages: 'Indonesia, English',
    fee_per_day_rp: 350000,
    photo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
    bio: '',
    island_base: 'Pulau Neira',
    is_verified: true,
    is_active: true,
  })

  // Booking Modal State
  const [selectedAccForBooking, setSelectedAccForBooking] = useState<AccommodationItem | null>(null)
  const [guestName, setGuestName] = useState<string>('')
  const [guestPhone, setGuestPhone] = useState<string>('')
  const [checkInDate, setCheckInDate] = useState<string>(
    new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
  )
  const [checkOutDate, setCheckOutDate] = useState<string>(
    new Date(Date.now() + 86400000 * 6).toISOString().split('T')[0]
  )
  const [roomsCount, setRoomsCount] = useState<number>(1)
  const [bookingNotes, setBookingNotes] = useState<string>('')
  const [submittingBooking, setSubmittingBooking] = useState<boolean>(false)
  const [confirmedBooking, setConfirmedBooking] = useState<BookingItem | null>(null)
  const [bookingError, setBookingError] = useState<string | null>(null)

  // Heritage State
  const [heritageSites, setHeritageSites] = useState<HeritageCatalogItem[]>([])
  const [heritageCategory, setHeritageCategory] = useState<string>('')
  const [activeAudioSlug, setActiveAudioSlug] = useState<string | null>(null)

  // Booking Lookup State
  const [searchBookingCode, setSearchBookingCode] = useState<string>('')
  const [lookupResult, setLookupResult] = useState<BookingItem | null>(null)
  const [loadingLookup, setLoadingLookup] = useState<boolean>(false)
  const [lookupError, setLookupError] = useState<string | null>(null)

  // Host/Operator Bookings Management State
  const [bookings, setBookings] = useState<BookingItem[]>([])
  const [loadingBookings, setLoadingBookings] = useState<boolean>(false)

  const handleSelectSubTab = (tab: TourismSubTab) => {
    setActiveTab(tab)
    setPreferredTourismSubTab(tab)
    if (tab === 'guides') loadGuides()
    if (tab === 'bookings') loadBookings()
  }

  useEffect(() => {
    const handleSubTabChange = (evt: Event) => {
      const nextTab = (evt as CustomEvent<TourismSubTab>).detail
      if (nextTab) {
        setActiveTab(nextTab)
      }
    }
    window.addEventListener('banda:tourism-subtab', handleSubTabChange)
    return () => window.removeEventListener('banda:tourism-subtab', handleSubTabChange)
  }, [])

  const loadGisAndArticles = async () => {
    setLoadingGis(true)
    try {
      const [layersRes, artRes] = await Promise.all([
        gisService.getLayers({ layers: 'LAYER_HERITAGE,LAYER_TOURISM_4A' }).catch(() => ({ type: 'FeatureCollection' as const, features: [] })),
        tourismService.listCommunityContents({ content_type: 'ARTICLE' }).catch(() => []),
      ])
      setGisFeatures(layersRes.features || [])
      setArticles(artRes || [])
    } catch (err) {
      console.warn('Gagal memuat titik GIS spasial:', err)
    } finally {
      setLoadingGis(false)
    }
  }

  useEffect(() => {
    loadGisAndArticles()
    loadAccommodations()
    loadHeritage()
    loadGuides()
    if (canAccessBookings) {
      loadBookings()
    }
  }, [islandFilter, villageFilter, accSearch, typeFilter, filterRoOnly, filterSolarOnly, heritageCategory, guideIslandFilter, guideSearch, bookingSearch, canAccessBookings])

  const loadGuides = async () => {
    setLoadingGuides(true)
    try {
      const data = await tourismService.listTourGuides({
        island: guideIslandFilter || undefined,
        search: guideSearch || undefined,
      })
      setGuides(data)
    } catch {
      // ignore
    } finally {
      setLoadingGuides(false)
    }
  }

  const loadBookings = async () => {
    if (!canAccessBookings) return
    setLoadingBookings(true)
    try {
      const data = await tourismService.listBookings({
        search: bookingSearch || undefined,
      })
      setBookings(data)
    } catch {
      // ignore
    } finally {
      setLoadingBookings(false)
    }
  }

  const loadAccommodations = async () => {
    setLoadingAccs(true)
    try {
      const data = await tourismService.listAccommodations({
        island: islandFilter || undefined,
        village: villageFilter || undefined,
        search: accSearch || undefined,
        type: typeFilter || undefined,
        has_ro_water: filterRoOnly ? true : undefined,
        has_solar: filterSolarOnly ? true : undefined,
      })
      setAccommodations(data)
    } catch {
      // ignore
    } finally {
      setLoadingAccs(false)
    }
  }

  const loadHeritage = async () => {
    try {
      const data = await tourismService.listHeritage({
        category: heritageCategory || undefined,
      })
      setHeritageSites(data)
    } catch {
      // ignore
    }
  }

  const handleOpenBookingModal = (acc: AccommodationItem) => {
    setSelectedAccForBooking(acc)
    setConfirmedBooking(null)
    setBookingError(null)
  }

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAccForBooking) return

    setSubmittingBooking(true)
    setBookingError(null)

    try {
      const res = await tourismService.createBooking({
        accommodation_id: selectedAccForBooking.id,
        guest_name: guestName,
        guest_whatsapp: guestPhone,
        check_in: checkInDate,
        check_out: checkOutDate,
        rooms_count: roomsCount,
        notes: bookingNotes || undefined,
      })
      setConfirmedBooking(res)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setBookingError(err.message)
      } else {
        setBookingError('Gagal membuat pemesanan.')
      }
    } finally {
      setSubmittingBooking(false)
    }
  }

  const handleLookupBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchBookingCode.trim()) return

    setLoadingLookup(true)
    setLookupError(null)
    setLookupResult(null)

    try {
      const res = await tourismService.getBooking(searchBookingCode.trim())
      setLookupResult(res)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setLookupError(err.message)
      } else {
        setLookupError('Kode booking tidak ditemukan.')
      }
    } finally {
      setLoadingLookup(false)
    }
  }

  // --- CMS Accommodations Actions ---
  const handleOpenAddAccommodation = () => {
    setEditingAccId(null)
    setAccForm({
      name: '',
      type: 'HOMESTAY',
      island_name: 'Pulau Neira',
      address: 'Banda Neira, Maluku Tengah',
      price_per_night_rp: 350000,
      rooms_available: 4,
      has_clean_ro_water: true,
      has_solar_backup: true,
      eco_stay_badge: true,
      contact_whatsapp: '6281234567891',
      description: '',
      photo_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    })
    setShowAccModal(true)
  }

  const handleOpenEditAccommodation = (acc: AccommodationItem) => {
    setEditingAccId(acc.id)
    setAccForm({
      name: acc.name,
      type: acc.type,
      island_name: acc.island_name,
      address: acc.address,
      price_per_night_rp: acc.price_per_night_rp,
      rooms_available: acc.rooms_available,
      has_clean_ro_water: acc.has_clean_ro_water,
      has_solar_backup: acc.has_solar_backup,
      eco_stay_badge: acc.eco_stay_badge,
      contact_whatsapp: acc.contact_whatsapp,
      description: acc.description || '',
      photo_url: acc.photo_url || '',
    })
    setShowAccModal(true)
  }

  const handleSaveAccommodation = async (e: React.FormEvent) => {
    e.preventDefault()
    setCmsNotice(null)
    try {
      if (editingAccId) {
        await tourismService.updateAccommodation(editingAccId, accForm)
        setCmsNotice({ type: 'success', text: `Penginapan "${accForm.name}" berhasil diperbarui!` })
      } else {
        await tourismService.createAccommodation(accForm)
        setCmsNotice({ type: 'success', text: `Penginapan baru "${accForm.name}" berhasil ditambahkan ke katalog!` })
      }
      setShowAccModal(false)
      loadAccommodations()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan data penginapan.'
      setCmsNotice({ type: 'error', text: msg })
    }
  }

  const handleQuickUpdatePrice = async (accId: string, currentPrice: number) => {
    const promptVal = window.prompt('Masukkan tarif baru per malam (Rp):', currentPrice.toString())
    if (!promptVal) return
    const newPrice = parseFloat(promptVal)
    if (isNaN(newPrice) || newPrice <= 0) {
      alert('Format tarif tidak valid.')
      return
    }
    try {
      await tourismService.updateAccommodation(accId, { price_per_night_rp: newPrice })
      setCmsNotice({ type: 'success', text: 'Tarif kamar penginapan berhasil diperbarui.' })
      loadAccommodations()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal memperbarui tarif.')
    }
  }

  const handleToggleAccVerify = async (acc: AccommodationItem) => {
    try {
      await tourismService.updateAccommodation(acc.id, { is_verified: !acc.is_verified })
      setCmsNotice({
        type: 'success',
        text: `Status verifikasi "${acc.name}" diubah menjadi: ${!acc.is_verified ? 'Terverifikasi' : 'Belum Diverifikasi'}.`,
      })
      loadAccommodations()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal mengubah status verifikasi.')
    }
  }

  const handleDeleteAccommodation = async (accId: string, name: string) => {
    if (!window.confirm(`Yakin ingin menghapus listing penginapan "${name}" dari sistem?`)) return
    try {
      await tourismService.deleteAccommodation(accId)
      setCmsNotice({ type: 'success', text: `Penginapan "${name}" berhasil dihapus.` })
      loadAccommodations()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal menghapus penginapan.')
    }
  }

  // --- CMS Tour Guides Actions ---
  const handleOpenAddGuide = () => {
    setEditingGuideId(null)
    setGuideForm({
      resident_nik: '',
      name: '',
      license_number: 'HPI-BANDA-LOKAL',
      phone_whatsapp: '6281234567896',
      specialties: 'Sejarah Benteng VOC & Budaya Banda',
      languages: 'Indonesia, English',
      fee_per_day_rp: 350000,
      photo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
      bio: '',
      island_base: 'Pulau Neira',
      is_verified: true,
      is_active: true,
    })
    setShowGuideModal(true)
  }

  const handleOpenEditGuide = (guide: TourGuideItem) => {
    setEditingGuideId(guide.id)
    setGuideForm({
      resident_nik: guide.resident_nik || '',
      name: guide.name,
      license_number: guide.license_number,
      phone_whatsapp: guide.phone_whatsapp,
      specialties: guide.specialties,
      languages: guide.languages,
      fee_per_day_rp: guide.fee_per_day_rp,
      photo_url: guide.photo_url || '',
      bio: guide.bio || '',
      island_base: guide.island_base,
      is_verified: guide.is_verified,
      is_active: guide.is_active,
    })
    setShowGuideModal(true)
  }

  const handleSaveTourGuide = async (e: React.FormEvent) => {
    e.preventDefault()
    setCmsNotice(null)
    if (!/^\d{16}$/.test(guideForm.resident_nik.trim())) {
      setCmsNotice({ type: 'error', text: 'NIK pemandu wisata wajib terdiri dari tepat 16 digit angka terdaftar.' })
      return
    }
    try {
      if (editingGuideId) {
        await tourismService.updateTourGuide(editingGuideId, guideForm)
        setCmsNotice({ type: 'success', text: `Data pemandu "${guideForm.name}" berhasil diperbarui!` })
      } else {
        await tourismService.createTourGuide(guideForm)
        setCmsNotice({ type: 'success', text: `Pemandu wisata "${guideForm.name}" berhasil didaftarkan!` })
      }
      setShowGuideModal(false)
      loadGuides()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan data pemandu wisata.'
      setCmsNotice({ type: 'error', text: msg })
    }
  }

  const handleQuickUpdateGuideFee = async (guideId: string, currentFee: number) => {
    const promptVal = window.prompt('Masukkan tarif jasa pemandu baru per hari (Rp):', currentFee.toString())
    if (!promptVal) return
    const newFee = parseFloat(promptVal)
    if (isNaN(newFee) || newFee <= 0) {
      alert('Format tarif tidak valid.')
      return
    }
    try {
      await tourismService.updateTourGuide(guideId, { fee_per_day_rp: newFee })
      setCmsNotice({ type: 'success', text: 'Tarif jasa harian pemandu berhasil diperbarui.' })
      loadGuides()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal memperbarui tarif pemandu.')
    }
  }

  const handleToggleGuideVerify = async (guide: TourGuideItem) => {
    try {
      await tourismService.updateTourGuide(guide.id, { is_verified: !guide.is_verified })
      setCmsNotice({
        type: 'success',
        text: `Status sertifikasi "${guide.name}" diubah menjadi: ${!guide.is_verified ? 'Terverifikasi HPI' : 'Belum Diverifikasi'}.`,
      })
      loadGuides()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal mengubah status verifikasi pemandu.')
    }
  }

  const handleDeleteTourGuide = async (guideId: string, name: string) => {
    if (!window.confirm(`Yakin ingin menghapus data pemandu wisata "${name}"?`)) return
    try {
      await tourismService.deleteTourGuide(guideId)
      setCmsNotice({ type: 'success', text: `Pemandu wisata "${name}" berhasil dihapus.` })
      loadGuides()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal menghapus pemandu wisata.')
    }
  }

  // Dedicated simplified workspace for Pokdarwis / Admin Wisata (Fokus Khusus Draf Artikel Sejarah)
  if (isSmartTourismOnly) {
    return (
      <div className="workspace-container animate-fade-in" style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
              <span className="badge badge-amber" style={{ fontSize: '0.72rem', textTransform: 'uppercase' }}>
                Pokdarwis Banda Neira
              </span>
              <span className="badge badge-blue" style={{ fontSize: '0.72rem' }}>
                Penulis: {currentUser?.full_name || currentUser?.username}
              </span>
            </div>
            <h2 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 900, color: '#081D35', letterSpacing: '-0.02em' }}>
              Draf &amp; Manajemen Artikel Sejarah
            </h2>
            <p style={{ margin: '0.35rem 0 0', color: '#475569', fontSize: '0.875rem' }}>
              Tulis narasi sejarah otentik Banda Neira, kelola draf cerita, dan publikasikan langsung ke halaman pembaca /sejarah untuk penguatan SEO.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => onNavigate?.('sejarah')}
              className="btn btn-outline"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                padding: '0.55rem 0.95rem',
                borderRadius: '10px',
                border: '1px solid #CBD5E1',
                background: '#FFFFFF',
                color: '#081D35',
                cursor: 'pointer',
              }}
            >
              <Eye size={14} /> Buka Halaman Pembaca /sejarah
            </button>
            <button
              type="button"
              onClick={() => onNavigate?.('landing')}
              className="btn btn-outline"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                padding: '0.55rem 0.95rem',
                borderRadius: '10px',
                border: '1px solid #CBD5E1',
                background: '#FFFFFF',
                color: '#081D35',
                cursor: 'pointer',
              }}
            >
              <ExternalLink size={14} /> Beranda
            </button>
          </div>
        </div>

        <PokdarwisHistoryCms
          currentUser={currentUser}
          onPreviewArticle={(slug) => onNavigate?.('sejarah', slug)}
        />
      </div>
    )
  }

  return (
    <div className="workspace-container animate-fade-in">
      {/* 1. EDITORIAL HEADER & WELCOME HERO */}
      <div className="bg-gradient-to-br from-white via-[#FDFBF7] to-amber-50/40 rounded-3xl border border-stone-200/90 p-6 sm:p-8 shadow-xs mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-3xl">
            {/* Top Badges */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#081D35] text-[#F4B75E] shadow-2xs">
                <Sparkles size={12} className="text-amber-400" /> Warisan UNESCO Tentative
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-800 border border-amber-300/60">
                <Compass size={12} className="text-amber-700" /> Kepulauan Banda, Maluku Tengah
              </span>
              {!currentUser ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck size={12} className="text-emerald-600" /> Katalog Publik Terbuka
                </span>
              ) : canAccessCMS ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <ShieldCheck size={12} className="text-emerald-600" /> Pengelola: {currentUser.full_name || currentUser.username}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-200">
                  🧭 Anggota: {currentUser.full_name || currentUser.username}
                </span>
              )}
            </div>

            {/* Display Title */}
            <h1 className="font-serif font-black text-2xl sm:text-3xl lg:text-4xl text-[#081D35] tracking-tight leading-tight">
              Destinasi &amp; Penginapan Ramah Lingkungan
            </h1>

            {/* Editorial Lead Narrative */}
            <p className="text-sm sm:text-base text-stone-600 mt-2.5 leading-relaxed">
              Jelajahi keagungan benteng peninggalan rempah dunia abad ke-17, terumbu karang tropis pulau terluar, serta jaringan eco-stay warga Banda Neira berdaya mandiri dengan jaminan air minum RO dan suplai listrik surya.
            </p>

            {/* Visual Value Props / Features Ribbon (Editorial Badges) */}
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-stone-200/60 text-xs">
              <span className="inline-flex items-center gap-1.5 text-stone-700 font-semibold bg-white px-2.5 py-1 rounded-lg border border-stone-200/80 shadow-3xs">
                🏛️ 177 Cagar Budaya Maritim
              </span>
              <span className="inline-flex items-center gap-1.5 text-stone-700 font-semibold bg-white px-2.5 py-1 rounded-lg border border-stone-200/80 shadow-3xs">
                🏡 100% Bebas Komisi OTA (WhatsApp Warga)
              </span>
              <span className="inline-flex items-center gap-1.5 text-stone-700 font-semibold bg-white px-2.5 py-1 rounded-lg border border-stone-200/80 shadow-3xs">
                💧 Suplai Air Bersih RO Bebas Sampah Botol
              </span>
              <span className="inline-flex items-center gap-1.5 text-stone-700 font-semibold bg-white px-2.5 py-1 rounded-lg border border-stone-200/80 shadow-3xs">
                🧭 Pemandu Terakreditasi HPI
              </span>
            </div>
          </div>

          {/* Quick Actions on the Right */}
          <div className="grid grid-cols-2 sm:flex lg:flex-col gap-2 w-full sm:w-auto shrink-0 self-start lg:self-center">
            {canAccessCMS && (
              <button
                type="button"
                onClick={handleOpenAddAccommodation}
                className="col-span-2 sm:col-span-1 inline-flex items-center justify-center gap-2 px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs font-bold bg-[#081D35] text-[#F4B75E] hover:bg-slate-800 transition-all shadow-xs cursor-pointer"
              >
                <Plus size={15} />
                <span>Tambah Penginapan</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onNavigate?.('gis')}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs font-bold bg-white text-[#081D35] border border-stone-300 hover:bg-stone-50 transition-all shadow-3xs cursor-pointer"
            >
              <Compass size={14} className="text-amber-600" />
              <span>Peta Spasial (GIS)</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate?.('smart_planner')}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-all shadow-3xs cursor-pointer"
            >
              <Sparkles size={14} className="text-amber-600" />
              <span>Perencana (DSS)</span>
            </button>

            {!currentUser && (
              <button
                type="button"
                onClick={() => onOpenQuickLogin?.()}
                className="col-span-2 sm:col-span-1 inline-flex items-center justify-center gap-2 px-3.5 py-2 min-h-[44px] rounded-xl text-xs font-semibold text-stone-600 hover:text-[#081D35] hover:bg-white/80 transition cursor-pointer"
                title="Masuk sebagai pengelola penginapan, pemandu, atau admin"
              >
                <Lock size={12} className="text-stone-400" />
                <span>Masuk Akun Pengelola</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                loadAccommodations()
                loadGuides()
                loadHeritage()
                if (canAccessBookings) loadBookings()
              }}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-stone-500 hover:text-stone-800 transition"
              title="Muat ulang data"
            >
              <RefreshCw size={12} className={loadingAccs || loadingGuides ? 'animate-spin' : ''} />
              <span>Segarkan Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. SEGMENTED NAVIGATION TABS (21st Style) */}
      <div className="bg-white/95 backdrop-blur-md p-1.5 rounded-2xl border border-stone-200/90 shadow-xs flex flex-wrap items-center gap-1.5 mb-8">
        <button
          type="button"
          onClick={() => handleSelectSubTab('destinations')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'destinations'
              ? 'bg-[#081D35] text-[#F4B75E] shadow-sm'
              : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
          }`}
        >
          <MapPin size={15} />
          <span>Tempat Wisata</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'destinations' ? 'bg-amber-400/20 text-[#F4B75E]' : 'bg-stone-100 text-stone-600'}`}>
            {gisFeatures.length || 50}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectSubTab('accommodations')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'accommodations'
              ? 'bg-[#081D35] text-[#F4B75E] shadow-sm'
              : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
          }`}
        >
          <Home size={15} />
          <span>Eco-Stay &amp; Vila</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'accommodations' ? 'bg-amber-400/20 text-[#F4B75E]' : 'bg-stone-100 text-stone-600'}`}>
            {accommodations.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectSubTab('guides')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'guides'
              ? 'bg-[#081D35] text-[#F4B75E] shadow-sm'
              : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
          }`}
        >
          <Compass size={15} />
          <span>Pemandu Wisata HPI</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'guides' ? 'bg-amber-400/20 text-[#F4B75E]' : 'bg-stone-100 text-stone-600'}`}>
            {guides.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectSubTab('heritage')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'heritage'
              ? 'bg-[#081D35] text-[#F4B75E] shadow-sm'
              : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
          }`}
        >
          <Landmark size={15} />
          <span>177 Cagar Budaya &amp; Audio</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectSubTab('community_literacy')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'community_literacy'
              ? 'bg-[#081D35] text-[#F4B75E] shadow-sm'
              : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
          }`}
        >
          <BookOpen size={15} />
          <span>Pojok Literasi &amp; Sejarah</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectSubTab('lookup')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'lookup'
              ? 'bg-[#081D35] text-[#F4B75E] shadow-sm'
              : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
          }`}
        >
          <Search size={15} />
          <span>Cek Kode Reservasi</span>
        </button>

        {canAccessBookings && (
          <button
            type="button"
            onClick={() => handleSelectSubTab('bookings')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'bookings'
                ? 'bg-[#081D35] text-[#F4B75E] shadow-sm'
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            <Calendar size={15} />
            <span>Reservasi Masuk ({bookings.length})</span>
          </button>
        )}

        {canAccessCMS ? (
          <button
            type="button"
            onClick={() => handleSelectSubTab('cms')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2 transition-all cursor-pointer ml-auto ${
              activeTab === 'cms'
                ? 'bg-[#081D35] text-[#F4B75E] shadow-sm'
                : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-200'
            }`}
            title="Kelola harga hotel, penginapan baru, dan tarif pemandu wisata"
          >
            <Settings size={15} />
            <span>CMS Pusat &amp; Tarif</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              if (onOpenQuickLogin) onOpenQuickLogin()
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-medium inline-flex items-center gap-1.5 transition-all ml-auto text-stone-500 hover:text-stone-800 hover:bg-stone-50 cursor-pointer"
            title="Masuk akun untuk mengelola homestay atau tarif"
          >
            <Lock size={13} className="text-stone-400" />
            <span>Portal Mitra</span>
          </button>
        )}
      </div>

      {/* TAB 0: DESTINASI & CAGAR BUDAYA (DATA SPASIAL POSTGIS RIIL) */}
      {activeTab === 'destinations' && (() => {
        const filteredFeatures = gisFeatures.filter((feat) => {
          const name = feat.properties.name || ''
          const island = feat.properties.island_name || ''
          const layer = feat.properties.layer_type || ''
          const desc = feat.properties.description || ''

          if (destIslandFilter && island !== destIslandFilter) return false
          if (destCategoryFilter) {
            if (destCategoryFilter === 'HERITAGE' && layer !== 'LAYER_HERITAGE') return false
            if (destCategoryFilter === 'TOURISM' && layer !== 'LAYER_TOURISM_4A') return false
          }
          if (destSearchQuery) {
            const q = destSearchQuery.toLowerCase()
            if (!name.toLowerCase().includes(q) && !desc.toLowerCase().includes(q) && !island.toLowerCase().includes(q)) {
              return false
            }
          }
          return true
        })

        return (
          <div className="space-y-5">
            {/* Filter & Search Bar */}
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-[240px] max-w-md">
                <div className="relative w-full">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={destSearchQuery}
                    onChange={(e) => setDestSearchQuery(e.target.value)}
                    placeholder="Cari cagar budaya, benteng, spot selam..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:border-[#081D35] focus:ring-1 focus:ring-[#081D35] bg-stone-50/50"
                  />
                  {destSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setDestSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 mr-1">
                  Kategori:
                </span>
                {[
                  { label: 'Semua', val: '' },
                  { label: 'Cagar Budaya & Benteng', val: 'HERITAGE' },
                  { label: 'Bahari & Alam', val: 'TOURISM' },
                ].map((cat) => (
                  <button
                    type="button"
                    key={cat.val || 'all'}
                    onClick={() => setDestCategoryFilter(cat.val)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                      destCategoryFilter === cat.val
                        ? 'bg-[#081D35] text-[#F4B75E]'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Island Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 shrink-0">
                Pulau:
              </span>
              {['', 'Pulau Neira', 'Banda Api', 'Banda Besar', 'Pulau Hatta', 'Pulau Ai', 'Pulau Rhun'].map((isl) => (
                <button
                  type="button"
                  key={isl || 'all-island'}
                  onClick={() => setDestIslandFilter(isl)}
                  className={`px-3 py-1 rounded-full shrink-0 font-medium transition cursor-pointer ${
                    destIslandFilter === isl
                      ? 'bg-amber-500 text-[#081D35] font-bold shadow-xs'
                      : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  {isl || 'Semua Pulau'}
                </button>
              ))}
            </div>

            {/* Loading State */}
            {loadingGis ? (
              <div className="bg-white rounded-xl border border-stone-200 p-12 text-center text-stone-500">
                <RefreshCw size={24} className="animate-spin text-amber-500 mx-auto mb-3" />
                <p className="text-sm font-medium text-stone-700">Memuat destinasi wisata...</p>
              </div>
            ) : filteredFeatures.length === 0 ? (
              <div className="bg-white rounded-xl border border-stone-200 p-12 text-center text-stone-500">
                <Landmark size={32} className="text-stone-400 mx-auto mb-3" />
                <h3 className="text-base font-bold text-stone-800">Tidak ada destinasi yang cocok</h3>
                <p className="text-xs text-stone-500 mt-1">Coba ubah kata kunci pencarian atau filter pulau.</p>
                <button
                  type="button"
                  onClick={() => {
                    setDestIslandFilter('')
                    setDestCategoryFilter('')
                    setDestSearchQuery('')
                  }}
                  className="mt-4 px-4 py-2 rounded-lg bg-[#081D35] text-[#F4B75E] text-xs font-bold transition hover:bg-[#0c2a4d] cursor-pointer"
                >
                  Reset Filter
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFeatures.map((feat) => {
                  const media = getFeatureMedia(feat)
                  const isHeritage = feat.properties.layer_type === 'LAYER_HERITAGE'
                  const island = feat.properties.island_name || 'Kepulauan Banda'
                  const propsMeta = (feat.properties.properties_meta as any) || {}
                  const nameLower = (feat.properties.name || '').toLowerCase()

                  // Cari apakah ada narasi sejarah yang relevan di bank artikel
                  const relatedArticle = articles.find((art) => {
                    const artTitle = art.title.toLowerCase()
                    const artSlug = art.slug.toLowerCase()
                    return (
                      nameLower.includes(artTitle) ||
                      artTitle.includes(nameLower) ||
                      (nameLower.includes('belgica') && artSlug.includes('belgica')) ||
                      (nameLower.includes('rhun') && artSlug.includes('rhun')) ||
                      (nameLower.includes('hatta') && artSlug.includes('hatta')) ||
                      (nameLower.includes('pala') && artSlug.includes('pala'))
                    )
                  })

                  return (
                    <div
                      key={feat.properties.id || feat.properties.name}
                      className="bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col group"
                    >
                      {/* Image Banner */}
                      <div className="relative h-48 bg-stone-100 overflow-hidden">
                        <img
                          src={media.imageUrl}
                          alt={feat.properties.name}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-tight shadow-xs ${
                              isHeritage
                                ? 'bg-amber-500 text-[#081D35]'
                                : 'bg-sky-600 text-white'
                            }`}
                          >
                            {isHeritage ? 'Cagar Budaya' : 'Bahari & Selam'}
                          </span>
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-black/60 backdrop-blur-xs text-white">
                            {island}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-1.5">
                            <MapPin size={13} className="text-amber-600 shrink-0" />
                            <span className="font-medium truncate">{island}, Kepulauan Banda</span>
                          </div>

                          <h3 className="font-serif font-bold text-lg text-[#081D35] leading-snug group-hover:text-amber-700 transition-colors">
                            {feat.properties.name}
                          </h3>

                          <p className="mt-2 text-xs text-stone-600 line-clamp-3 leading-relaxed">
                            {feat.properties.description || 'Situs warisan otentik dan daya tarik alam unggulan Kepulauan Banda dengan nilai sejarah dan keanekaragaman bahari tinggi.'}
                          </p>

                          {/* Historical or Diving Specs */}
                          {(propsMeta.period || propsMeta.historical_period || propsMeta.depth_meters) && (
                            <div className="mt-3 flex items-center gap-2 flex-wrap text-[11px]">
                              {(propsMeta.period || propsMeta.historical_period) && (
                                <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-medium">
                                  Era: {propsMeta.period || propsMeta.historical_period}
                                </span>
                              )}
                              {propsMeta.depth_meters && (
                                <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 font-medium">
                                  Kedalaman: {propsMeta.depth_meters}m
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Actions: Map, History Story, WhatsApp Guide */}
                        <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => onNavigate?.('gis', `feature_id=${feat.properties.id}&name=${encodeURIComponent(feat.properties.name)}`)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-[#081D35] hover:text-[#F4B75E] text-stone-800 text-xs font-semibold transition cursor-pointer"
                            title="Lihat di peta"
                          >
                            <Compass size={13} />
                            <span>Lihat di Peta</span>
                          </button>

                          <div className="flex items-center gap-1.5">
                            {relatedArticle && (
                              <button
                                type="button"
                                onClick={() => onNavigate?.('sejarah', relatedArticle.slug)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold transition cursor-pointer"
                                title={`Baca kisah sejarah: ${relatedArticle.title}`}
                              >
                                <BookOpen size={12} />
                                <span>Kisah Sejarah</span>
                              </button>
                            )}

                            <a
                              href={`https://wa.me/6281234567891?text=${encodeURIComponent(`Halo Pemandu Banda Neira, saya ingin menanyakan informasi kunjungan ke destinasi ${feat.properties.name}.`)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition"
                              title="Tanya pemandu via WhatsApp"
                            >
                              <MessageCircle size={12} />
                              <span className="hidden sm:inline">Pemandu</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })()}

      {/* TAB 1: ACCOMMODATIONS (ECO-STAYS) */}
      {activeTab === 'accommodations' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-xs space-y-4">
            {/* Row 1: Wilayah / Island Pills & Eco Features */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 mr-1">
                  Wilayah:
                </span>
                {['', 'Pulau Neira', 'Banda Besar', 'Pulau Hatta', 'Pulau Ay'].map((isl) => (
                  <button
                    type="button"
                    key={isl || 'all'}
                    onClick={() => setIslandFilter(isl)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                      islandFilter === isl
                        ? 'bg-[#081D35] text-[#F4B75E] shadow-xs'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                    }`}
                  >
                    {isl || 'Semua Pulau'}
                  </button>
                ))}
              </div>

              {/* Eco Amenities Checkboxes */}
              <div className="flex items-center gap-3 flex-wrap">
                <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-700 cursor-pointer select-none bg-sky-50 px-3 py-1.5 rounded-full border border-sky-200/70 hover:bg-sky-100/70 transition">
                  <input
                    type="checkbox"
                    checked={filterRoOnly}
                    onChange={(e) => setFilterRoOnly(e.target.checked)}
                    className="rounded border-sky-400 text-sky-600 focus:ring-sky-500 cursor-pointer"
                  />
                  <Droplets size={13} className="text-sky-600" />
                  <span>Air Minum RO Gratis</span>
                </label>

                <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-700 cursor-pointer select-none bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200/70 hover:bg-amber-100/70 transition">
                  <input
                    type="checkbox"
                    checked={filterSolarOnly}
                    onChange={(e) => setFilterSolarOnly(e.target.checked)}
                    className="rounded border-amber-400 text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                  <Sun size={13} className="text-amber-600" />
                  <span>Listrik Surya PLTS</span>
                </label>
              </div>
            </div>

            {/* Row 2: Tipe, Desa & Search */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-stone-100">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 mr-1">
                  Tipe:
                </span>
                {[
                  { label: 'Semua Tipe', val: '' },
                  { label: 'Homestay', val: 'homestay' },
                  { label: 'Hotel & Vila', val: 'hotel' },
                  { label: 'Kabin Pantai', val: 'cabin' },
                  { label: 'Guesthouse', val: 'guesthouse' },
                ].map((tp) => (
                  <button
                    type="button"
                    key={tp.val || 'all-tp'}
                    onClick={() => setTypeFilter(tp.val)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                      typeFilter === tp.val
                        ? 'bg-[#081D35] text-[#F4B75E] font-bold'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border border-stone-200'
                    }`}
                  >
                    {tp.label}
                  </button>
                ))}
              </div>

              {/* Village Filter */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 mr-1">
                  Desa:
                </span>
                {['', 'Nassau', 'Dwiwarna', 'Rajawali', 'Lonthoir', 'Kampung Baru', 'Pulau Ay'].map((vil) => (
                  <button
                    type="button"
                    key={vil || 'all-vil'}
                    onClick={() => setVillageFilter(vil)}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                      villageFilter === vil
                        ? 'bg-blue-600 text-white'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border border-stone-200'
                    }`}
                  >
                    {vil ? `Desa ${vil}` : 'Semua'}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative flex-1 min-w-[220px] max-w-xs ml-auto">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Cari penginapan..."
                  value={accSearch}
                  onChange={(e) => setAccSearch(e.target.value)}
                  className="w-full pl-9 pr-8 py-1.5 text-xs rounded-xl border border-stone-300 focus:outline-none focus:border-[#081D35] focus:ring-1 focus:ring-[#081D35] bg-stone-50/50"
                />
                {accSearch && (
                  <button
                    type="button"
                    onClick={() => setAccSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Accommodation Cards Grid */}
          {loadingAccs ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-stone-500">
              <RefreshCw size={24} className="animate-spin text-amber-500 mx-auto mb-3" />
              <p className="text-sm font-medium text-stone-700">Memuat penginapan eco-stay Banda Neira...</p>
            </div>
          ) : accommodations.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-stone-500">
              <Home size={32} className="text-stone-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-stone-800">Tidak ada penginapan yang cocok</h3>
              <p className="text-xs text-stone-500 mt-1">Coba sesuaikan filter wilayah, tipe, atau kata kunci pencarian.</p>
              <button
                type="button"
                onClick={() => {
                  setIslandFilter('')
                  setVillageFilter('')
                  setTypeFilter('')
                  setAccSearch('')
                  setFilterRoOnly(false)
                  setFilterSolarOnly(false)
                }}
                className="mt-4 px-4 py-2 rounded-lg bg-[#081D35] text-[#F4B75E] text-xs font-bold transition hover:bg-[#0c2a4d] cursor-pointer"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {accommodations.map((acc) => (
                <div
                  key={acc.id}
                  className="group bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
                >
                  {/* Photo Banner with Badges */}
                  <div className="relative h-48 bg-stone-100 overflow-hidden">
                    <img
                      src={acc.photo_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'}
                      alt={acc.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#081D35] text-[#F4B75E] shadow-xs">
                        {acc.type}
                      </span>
                      {acc.eco_stay_badge && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-600 text-white shadow-xs">
                          🌱 Eco-Stay
                        </span>
                      )}
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-black/60 backdrop-blur-xs text-white">
                        {acc.rooms_available || 4} Kamar Siap
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-sky-700 font-semibold mb-1.5">
                        <MapPin size={13} className="shrink-0 text-amber-600" />
                        <span className="truncate">{acc.island_name} — {acc.address}</span>
                      </div>

                      <h3 className="font-serif font-bold text-lg text-[#081D35] group-hover:text-amber-700 transition-colors">
                        {acc.name}
                      </h3>

                      <p className="mt-2 text-xs text-stone-600 line-clamp-3 leading-relaxed">
                        {acc.description}
                      </p>

                      {/* Eco Amenities Badges */}
                      <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                        {acc.has_clean_ro_water && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-sky-50 text-sky-700 border border-sky-200">
                            <Droplets size={12} className="text-sky-600" /> Air RO Gratis
                          </span>
                        )}
                        {acc.has_solar_backup && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            <Sun size={12} className="text-amber-600" /> Cadangan PLTS
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price & Actions */}
                    <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] text-stone-500 block uppercase font-medium">Tarif Mulai</span>
                        <div className="text-base font-black text-[#081D35]">
                          Rp {acc.price_per_night_rp.toLocaleString('id-ID')}
                          <span className="text-[11px] text-stone-500 font-normal"> / malam</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onNavigate?.('gis', `name=${encodeURIComponent(acc.name)}`)}
                          className="p-2 rounded-xl bg-stone-100 hover:bg-[#081D35] hover:text-[#F4B75E] text-stone-700 text-xs transition cursor-pointer"
                          title="Lihat di peta"
                        >
                          <Compass size={15} />
                        </button>
                        <a
                          href={`https://wa.me/${acc.contact_whatsapp}?text=${encodeURIComponent(`Halo ${acc.name}, saya ingin reservasi kamar di penginapan Anda di Banda Neira.`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
                          title="Chat via WhatsApp"
                        >
                          <MessageCircle size={14} />
                          <span>WA</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => handleOpenBookingModal(acc)}
                          className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-[#081D35] hover:bg-[#0c2a4d] text-[#F4B75E] text-xs font-bold transition shadow-xs cursor-pointer"
                        >
                          <span>Pesan</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: 177 CAGAR BUDAYA & AUDIO GUIDE */}
      {activeTab === 'heritage' && (
        <div className="space-y-6">
          {/* Category Filter */}
          <div className="bg-white rounded-2xl border border-stone-200/90 p-4 shadow-xs flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 mr-2">
              Kategori Cagar Budaya:
            </span>
            {[
              { label: 'Semua Cagar Budaya', val: '' },
              { label: 'Benteng & Militer VOC', val: 'BENTENG' },
              { label: 'Rumah Tokoh Bangsa', val: 'RUMAH_SEJARAH' },
              { label: 'Situs Religi & Adat', val: 'CAGAR_BUDAYA' },
            ].map((cat) => (
              <button
                type="button"
                key={cat.val || 'all'}
                onClick={() => setHeritageCategory(cat.val)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                  heritageCategory === cat.val
                    ? 'bg-[#081D35] text-[#F4B75E] font-bold shadow-xs'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {heritageSites.map((h) => (
              <div
                key={h.slug}
                className="group bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
              >
                <div className="relative h-48 bg-stone-100 overflow-hidden">
                  <img
                    src={h.photo_url}
                    alt={h.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#081D35] text-[#F4B75E] shadow-xs">
                      {h.category}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-black/60 backdrop-blur-xs text-white">
                      {h.island}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-xs text-amber-800 font-semibold mb-1">
                      {h.island} • {t.cagarBudaya.periodLabel}: {h.historical_period}
                    </div>

                    <h3 className="font-serif font-bold text-lg text-[#081D35] group-hover:text-amber-700 transition-colors">
                      {h.title}
                    </h3>

                    <p className="mt-2 text-xs text-stone-600 line-clamp-3 leading-relaxed">
                      {h.narrative}
                    </p>
                  </div>

                  {/* Audio Guide Player Section */}
                  <div className="mt-5 p-3 bg-stone-50 rounded-xl border border-stone-200/80 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Volume2 size={16} className="text-amber-600 shrink-0" />
                      <span className="text-xs font-bold text-[#081D35]">
                        {activeAudioSlug === h.slug ? t.cagarBudaya.audioGuidePlaying : t.cagarBudaya.audioGuideLabel}
                      </span>
                    </div>

                    <audio
                      controls
                      src={h.audio_guide_url}
                      onPlay={() => setActiveAudioSlug(h.slug)}
                      onPause={() => setActiveAudioSlug(null)}
                      className="h-7 max-w-[160px]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: BOOKING LOOKUP */}
      {activeTab === 'lookup' && (
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <div className="card" style={{ padding: '1.75rem', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', marginBottom: '1.5rem', boxShadow: '0 4px 16px rgba(8, 29, 53, 0.05)' }}>
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.15rem', fontWeight: 800, color: '#081D35', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Search size={18} style={{ color: '#0284C7' }} /> Lacak Status Pemesanan Kamar
            </h3>
            <p style={{ margin: '0 0 1.25rem', color: '#475569', fontSize: '0.8rem' }}>
              Masukkan kode reservasi unik (format: <code style={{ background: '#F1F5F9', padding: '0.15rem 0.4rem', borderRadius: '4px', color: '#081D35' }}>BKG-YYYYMMDD-XXXX</code>) yang Anda dapatkan saat memesan penginapan.
            </p>

            <form onSubmit={handleLookupBooking} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={searchBookingCode}
                onChange={(e) => setSearchBookingCode(e.target.value)}
                placeholder="Contoh: BKG-20261111-A1B2..."
                style={{
                  flex: 1,
                  background: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '10px',
                  color: '#081D35',
                  padding: '0.65rem 0.85rem',
                  fontSize: '0.9rem',
                  fontFamily: 'monospace',
                }}
              />
              <button
                type="submit"
                disabled={loadingLookup}
                className="btn btn-primary"
                style={{ padding: '0.65rem 1.15rem', fontWeight: 800, background: '#081D35', color: '#F4B75E', border: 'none' }}
              >
                {loadingLookup ? <RefreshCw size={16} className="animate-spin" /> : 'Lacak'}
              </button>
            </form>

            {lookupError && (
              <div style={{ marginTop: '1rem', padding: '0.65rem 0.85rem', background: '#FEE2E2', border: '1px solid #FECDD3', borderRadius: '10px', color: '#BE123C', fontSize: '0.8rem' }}>
                {lookupError}
              </div>
            )}
          </div>

          {lookupResult && (
            <div className="card" style={{ padding: '1.5rem', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', boxShadow: '0 4px 16px rgba(8, 29, 53, 0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#0369A1', fontFamily: 'monospace', fontWeight: 800 }}>
                    KODE: {lookupResult.booking_code}
                  </span>
                  <h3 style={{ margin: '0.2rem 0 0', fontSize: '1.25rem', fontWeight: 900, color: '#081D35' }}>
                    {lookupResult.accommodation_name}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.15rem' }}>
                    Tamu: <b style={{ color: '#081D35' }}>{lookupResult.guest_name}</b> ({lookupResult.guest_whatsapp})
                  </div>
                </div>
                <span className="badge badge-emerald" style={{ fontSize: '0.72rem' }}>
                  {lookupResult.status}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ padding: '0.65rem 0.85rem', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Jadwal Menginap:</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#081D35', marginTop: '0.15rem' }}>
                    {lookupResult.check_in} s/d {lookupResult.check_out}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#0284C7', marginTop: '0.1rem' }}>
                    {lookupResult.total_nights} Malam • {lookupResult.rooms_count} Kamar
                  </div>
                </div>

                <div style={{ padding: '0.65rem 0.85rem', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Total Pembayaran:</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#081D35', marginTop: '0.15rem' }}>
                    Rp {lookupResult.total_price_rp.toLocaleString()}
                  </div>
                </div>
              </div>

              <a
                href={lookupResult.wa_link}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', background: 'linear-gradient(135deg, #F4B75E 0%, #E0A24A 100%)', color: '#081D35', textDecoration: 'none', fontWeight: 800, border: 'none', boxShadow: '0 4px 14px rgba(244, 183, 94, 0.35)' }}
              >
                <MessageCircle size={16} /> Hubungi Host Penginapan via WhatsApp
              </a>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: OPERATOR BOOKINGS MANAGEMENT */}
      {activeTab === 'bookings' && (
        !canAccessBookings ? (
          <div className="card animate-fade-in" style={{ padding: '3.5rem 1.5rem', textAlign: 'center', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', boxShadow: '0 4px 16px rgba(8, 29, 53, 0.05)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#FEE2E2', border: '1px solid #FECDD3', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <Lock size={32} color="#DC2626" />
            </div>
            <span className="badge badge-amber" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>
              PRIVASI DATA TAMU &bull; AKSES TERBATAS
            </span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#081D35', margin: '0.25rem 0 0.5rem' }}>
              Buku Reservasi Tamu Dilindungi
            </h3>
            <p style={{ color: '#475569', fontSize: '0.875rem', maxWidth: '560px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
              Nomor WhatsApp tamu, identitas pemesan, dan rincian transaksi menginap bersifat rahasia dan hanya dapat diakses oleh operator penginapan resmi atau petugas desa yang terautentikasi.
            </p>
            {onOpenQuickLogin && (
              <button
                type="button"
                onClick={onOpenQuickLogin}
                className="btn btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #F4B75E 0%, #E0A24A 100%)',
                  color: '#081D35',
                  border: 'none',
                  boxShadow: '0 4px 15px rgba(244, 183, 94, 0.4)',
                }}
              >
                <Zap size={16} /> Masuk Akun Operator Homestay
              </button>
            )}
          </div>
        ) : (
        <div className="animate-fade-in">
          {/* Barometer Metrics */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <div className="card" style={{ padding: '1.25rem', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', boxShadow: '0 2px 8px rgba(8, 29, 53, 0.04)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                Total Reservasi Masuk
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#081D35', marginTop: '0.25rem' }}>
                {bookings.length} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748B' }}>Pemesanan</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#15803D', marginTop: '0.35rem', fontWeight: 600 }}>
                ● Status Terverifikasi 100%
              </div>
            </div>

            <div className="card" style={{ padding: '1.25rem', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', boxShadow: '0 2px 8px rgba(8, 29, 53, 0.04)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                Estimasi Omset Homestay
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#081D35', marginTop: '0.25rem' }}>
                Rp {bookings.reduce((sum, b) => sum + b.total_price_rp, 0).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#0369A1', marginTop: '0.35rem', fontWeight: 600 }}>
                Ekonomi Komunitas Banda Neira
              </div>
            </div>

            <div className="card" style={{ padding: '1.25rem', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', boxShadow: '0 2px 8px rgba(8, 29, 53, 0.04)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                Total Malam Menginap
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#B45309', marginTop: '0.25rem' }}>
                {bookings.reduce((sum, b) => sum + (b.total_nights * b.rooms_count), 0)} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748B' }}>Room-Nights</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.35rem' }}>
                Kamar Ramah Lingkungan &amp; Air RO
              </div>
            </div>

            {currentUser?.village && (
              <div className="card" style={{ padding: '1.25rem', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '14px', boxShadow: '0 2px 8px rgba(8, 29, 53, 0.04)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>
                  Lingkup Wilayah Desa
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#14532D', marginTop: '0.25rem' }}>
                  Desa {currentUser.village}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#15803D', marginTop: '0.35rem', fontWeight: 600 }}>
                  Wajib Lapor Tamu 1x24 Jam Aktif
                </div>
              </div>
            )}
          </div>

          {/* Action Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#081D35', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Calendar size={18} color="#0284C7" /> Buku Tamu &amp; Riwayat Reservasi Eco-Stay
            </h3>
            <button
              type="button"
              onClick={loadBookings}
              disabled={loadingBookings}
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#081D35' }}
            >
              <RefreshCw size={13} className={loadingBookings ? 'animate-spin' : ''} />
              {loadingBookings ? 'Menyinkronkan...' : 'Perbarui Data'}
            </button>
          </div>

          {/* Search Bar Reservasi Tamu */}
          <div style={{ marginBottom: '1.15rem', display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: '420px' }}>
              <input
                type="text"
                placeholder="Cari nama tamu, kode booking, atau penginapan..."
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
                className="form-control"
                style={{ paddingLeft: '2.2rem', fontSize: '0.82rem', height: '36px', borderRadius: '10px' }}
              />
              <Search size={14} color="#94A3B8" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
            {bookingSearch && (
              <button
                type="button"
                onClick={() => setBookingSearch('')}
                className="btn btn-secondary btn-sm"
                style={{ height: '36px', fontSize: '0.75rem' }}
              >
                Reset
              </button>
            )}
          </div>

          {/* Bookings List */}
          {loadingBookings ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748B' }}>
              <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.75rem', color: '#F4B75E' }} />
              Memuat data reservasi...
            </div>
          ) : bookings.length === 0 ? (
            <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px' }}>
              <Home size={36} color="#64748b" style={{ margin: '0 auto 0.75rem' }} />
              <h4 style={{ margin: '0 0 0.35rem', color: '#081D35' }}>Belum Ada Reservasi Masuk</h4>
              <p style={{ margin: 0, fontSize: '0.825rem', color: '#64748B' }}>
                Pemesanan baru oleh wisatawan akan otomatis muncul pada buku tamu ini.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="card"
                  style={{
                    padding: '1.25rem',
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '16px',
                    boxShadow: '0 2px 8px rgba(8, 29, 53, 0.04)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: '#FEF3C7',
                        border: '1px solid #FDE68A',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.3rem',
                        flexShrink: 0,
                      }}
                    >
                      🏡
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.975rem', fontWeight: 800, color: '#081D35' }}>
                          {b.guest_name}
                        </span>
                        <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
                          <CheckCircle2 size={11} /> {b.status}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                          [{b.booking_code}]
                        </span>
                      </div>

                      <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#0369A1', marginTop: '0.2rem' }}>
                        {b.accommodation_name}
                      </div>

                      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.35rem', fontSize: '0.75rem', color: '#64748B', flexWrap: 'wrap' }}>
                        <span>📅 Check-in: <b style={{ color: '#081D35' }}>{b.check_in}</b></span>
                        <span>📅 Check-out: <b style={{ color: '#081D35' }}>{b.check_out}</b> ({b.total_nights} Malam)</span>
                        <span>🛏️ <b style={{ color: '#081D35' }}>{b.rooms_count} Kamar</b></span>
                        {b.notes && <span style={{ color: '#475569' }}>📝 Catatan: "{b.notes}"</span>}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Total Tagihan:</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#081D35' }}>
                        Rp {b.total_price_rp.toLocaleString()}
                      </div>
                    </div>

                    <a
                      href={`https://wa.me/${b.guest_whatsapp.replace(/\D/g, '')}?text=Halo%20${encodeURIComponent(b.guest_name)},%20kami%20dari%20pengelola%20${encodeURIComponent(b.accommodation_name)}%20Banda%20Neira%20mengenai%20booking%20${b.booking_code}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        background: 'linear-gradient(135deg, #F4B75E 0%, #E0A24A 100%)',
                        color: '#081D35',
                        padding: '0.5rem 0.95rem',
                        borderRadius: '10px',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        boxShadow: '0 4px 12px rgba(244, 183, 94, 0.35)',
                      }}
                      title="Hubungi tamu langsung lewat WhatsApp"
                    >
                      <MessageCircle size={14} /> Hubungi Tamu
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        )
      )}

      {/* TAB: TOUR GUIDES CATALOG */}
      {activeTab === 'guides' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-white rounded-2xl border border-stone-200/90 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 mr-1">
                Basis Pulau:
              </span>
              {['', 'Pulau Neira', 'Pulau Banda Besar', 'Pulau Hatta', 'Pulau Ay', 'Pulau Rhun'].map((isl) => (
                <button
                  type="button"
                  key={isl || 'all'}
                  onClick={() => setGuideIslandFilter(isl)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                    guideIslandFilter === isl
                      ? 'bg-[#081D35] text-[#F4B75E] font-bold shadow-xs'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                  }`}
                >
                  {isl || 'Semua Pulau'}
                </button>
              ))}
            </div>

            <div className="relative flex-1 min-w-[220px] max-w-xs ml-auto">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Cari pemandu / keahlian..."
                value={guideSearch}
                onChange={(e) => setGuideSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-1.5 text-xs rounded-xl border border-stone-300 focus:outline-none focus:border-[#081D35] focus:ring-1 focus:ring-[#081D35] bg-stone-50/50"
              />
              {guideSearch && (
                <button
                  type="button"
                  onClick={() => setGuideSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {loadingGuides ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-stone-500">
              <RefreshCw size={24} className="animate-spin text-amber-500 mx-auto mb-3" />
              <p className="text-sm font-medium text-stone-700">Memuat data pemandu wisata...</p>
            </div>
          ) : guides.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-stone-500">
              <Compass size={36} className="text-stone-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-stone-800">Belum Ada Pemandu Terdaftar</h3>
              <p className="text-xs text-stone-500 mt-1">Silakan pilih wilayah lain atau daftarkan pemandu lokal baru melalui panel CMS.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {guides.map((guide) => (
                <div
                  key={guide.id}
                  className="group bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
                >
                  <div className="relative h-48 bg-stone-100 overflow-hidden">
                    <img
                      src={guide.photo_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80'}
                      alt={guide.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                      {guide.is_verified ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-600 text-white shadow-xs">
                          <UserCheck size={12} /> HPI Terverifikasi
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500 text-[#081D35] shadow-xs">
                          Lisensi Lokal
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-3 right-3 bg-[#081D35]/85 backdrop-blur-xs px-2.5 py-1 rounded-lg text-xs font-bold text-white flex items-center gap-1">
                      <Star size={12} className="text-amber-400 fill-amber-400" />
                      <span>{guide.rating.toFixed(1)}</span>
                      <span className="text-stone-300 font-normal">({guide.trips_completed} tur)</span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="font-serif font-bold text-lg text-[#081D35] group-hover:text-amber-700 transition-colors">
                          {guide.name}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                          {guide.island_base}
                        </span>
                      </div>

                      <div className="text-[11px] text-stone-500 mb-2 flex items-center gap-1.5 flex-wrap">
                        <div className="flex items-center gap-1">
                          <Award size={12} className="text-sky-600" />
                          <span>No. Reg:</span>
                          <code className="text-[#081D35] bg-stone-100 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium">
                            {guide.license_number}
                          </code>
                        </div>
                        {guide.resident_nik && (
                          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            NIK: {guide.resident_nik.slice(0, 6)}••••{guide.resident_nik.slice(-4)}
                          </span>
                        )}
                      </div>

                      {guide.bio && (
                        <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-3">
                          {guide.bio}
                        </p>
                      )}

                      <div className="mb-2">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-0.5">
                          Keahlian Tur
                        </div>
                        <div className="text-xs font-semibold text-sky-800">
                          {guide.specialties}
                        </div>
                      </div>

                      <div className="mb-2">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">
                          Bahasa
                        </div>
                        <div className="flex gap-1.5 flex-wrap">
                          {guide.languages.split(',').map((lang) => (
                            <span key={lang.trim()} className="text-[10px] font-medium px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                              {lang.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] text-stone-500 block uppercase font-medium">Tarif Harian</span>
                        <div className="text-base font-black text-[#081D35]">
                          Rp {guide.fee_per_day_rp.toLocaleString('id-ID')}
                          <span className="text-[11px] text-stone-500 font-normal"> / hari</span>
                        </div>
                      </div>

                      <a
                        href={`https://wa.me/${guide.phone_whatsapp.replace(/\D/g, '')}?text=Halo%20Bung%20${encodeURIComponent(guide.name)},%20saya%20tertarik%20menggunakan%20jasa%20pemandu%20wisata%20Banda%20Neira%20untuk%20ekspedisi%20cagar%20budaya.`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
                      >
                        <Phone size={13} />
                        <span>Hubungi Guide</span>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: BANK KONTEN & LITERASI KOMUNITAS (MANDAT REYHAN ALBAR FAHRYAN) */}
      {activeTab === 'community_literacy' && (
        <CommunityLiteracyHub
          mode="public_hub"
          currentUser={currentUser}
          onOpenQuickLogin={onOpenQuickLogin}
        />
      )}

      {/* TAB: CMS PUSAT & PENGATURAN TARIF */}
      {activeTab === 'cms' && (
        !canAccessCMS ? (
          <div className="card animate-fade-in" style={{ padding: '3.5rem 1.5rem', textAlign: 'center', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', boxShadow: '0 4px 16px rgba(8, 29, 53, 0.05)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#FEE2E2', border: '1px solid #FECDD3', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <Lock size={32} color="#DC2626" />
            </div>
            <span className="badge badge-amber" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>
              KONTROL MASTER DATA &bull; ROLE-BASED ACCESS CONTROL
            </span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#081D35', margin: '0.25rem 0 0.5rem' }}>
              Panel CMS &amp; Pengaturan Tarif Khusus Petugas
            </h3>
            <p style={{ color: '#475569', fontSize: '0.875rem', maxWidth: '580px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
              Pengelolaan harga sewa kamar hotel/homestay, penambahan listing penginapan baru, validasi fasilitas Eco-Stay (RO Water &amp; PLTS), serta akreditasi pemandu wisata HPI Banda dilindungi oleh otorisasi backend dan hanya dapat diakses oleh Operator Homestay atau Smart Tourism Admin terdaftar.
            </p>
            {onOpenQuickLogin && (
              <button
                type="button"
                onClick={onOpenQuickLogin}
                className="btn btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #F4B75E 0%, #E0A24A 100%)',
                  color: '#081D35',
                  border: 'none',
                  boxShadow: '0 4px 15px rgba(244, 183, 94, 0.4)',
                }}
              >
                <Zap size={16} /> Masuk Akun Operator / Uji Peran Cepat
              </button>
            )}
          </div>
        ) : (
        <div>
          {/* CMS Notice */}
          {cmsNotice && (
            <div
              style={{
                marginBottom: '1.25rem',
                padding: '0.75rem 1rem',
                background: cmsNotice.type === 'success' ? '#DCFCE7' : '#FEE2E2',
                border: `1px solid ${cmsNotice.type === 'success' ? '#86EFAC' : '#FECDD3'}`,
                borderRadius: '10px',
                color: cmsNotice.type === 'success' ? '#166534' : '#991B1B',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>{cmsNotice.text}</span>
              <button
                type="button"
                onClick={() => setCmsNotice(null)}
                style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* CMS Admin Central Info Card */}
          <div
            className="card"
            style={{
              padding: '1.25rem',
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              marginBottom: '1.5rem',
              boxShadow: '0 2px 8px rgba(8, 29, 53, 0.04)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <Shield size={16} color="#0284C7" />
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0284C7', textTransform: 'uppercase' }}>
                  Panel Tata Kelola &amp; Kontrol Admin Pusat (Smart Tourism FTI)
                </span>
              </div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#081D35' }}>
                Pusat Master Data &amp; Regulasi Tarif Kepulauan Banda
              </h3>
              <p style={{ margin: '0.3rem 0 0', color: '#475569', fontSize: '0.8rem', maxWidth: '750px' }}>
                Operator homestay dapat mengatur tarif kamar masing-masing. Admin Pusat memvalidasi sertifikasi kelayakan Eco-Stay (RO Water &amp; PLTS) serta akreditasi pemandu wisata HPI Banda.
              </p>
            </div>

            {/* Sub-tab selection */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setCmsSubTab('accommodations')}
                style={{
                  padding: '0.55rem 0.95rem',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: cmsSubTab === 'accommodations' ? '#081D35' : '#F8FAFC',
                  color: cmsSubTab === 'accommodations' ? '#F4B75E' : '#64748B',
                  boxShadow: cmsSubTab === 'accommodations' ? '0 4px 12px rgba(8, 29, 53, 0.15)' : 'none',
                }}
              >
                <Home size={14} /> Penginapan &amp; Tarif ({accommodations.length})
              </button>
              <button
                type="button"
                onClick={() => setCmsSubTab('guides')}
                style={{
                  padding: '0.55rem 0.95rem',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: cmsSubTab === 'guides' ? '#081D35' : '#F8FAFC',
                  color: cmsSubTab === 'guides' ? '#F4B75E' : '#64748B',
                  boxShadow: cmsSubTab === 'guides' ? '0 4px 12px rgba(8, 29, 53, 0.15)' : 'none',
                }}
              >
                <Users size={14} /> Pemandu Wisata ({guides.length})
              </button>
              <button
                type="button"
                onClick={() => setCmsSubTab('community_contents')}
                style={{
                  padding: '0.55rem 0.95rem',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: cmsSubTab === 'community_contents' ? '#081D35' : '#F8FAFC',
                  color: cmsSubTab === 'community_contents' ? '#F4B75E' : '#64748B',
                  boxShadow: cmsSubTab === 'community_contents' ? '0 4px 12px rgba(8, 29, 53, 0.15)' : 'none',
                }}
              >
                <BookOpen size={14} /> Konten &amp; Karya Warga
              </button>
              <button
                type="button"
                onClick={() => setCmsSubTab('history_articles')}
                style={{
                  padding: '0.55rem 0.95rem',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: cmsSubTab === 'history_articles' ? '#081D35' : '#F8FAFC',
                  color: cmsSubTab === 'history_articles' ? '#F4B75E' : '#64748B',
                  boxShadow: cmsSubTab === 'history_articles' ? '0 4px 12px rgba(8, 29, 53, 0.15)' : 'none',
                }}
              >
                <Landmark size={14} /> Artikel Sejarah (Pokdarwis)
              </button>
            </div>
          </div>

          {/* SUB-PANEL 1: PENGINAPAN & TARIF */}
          {cmsSubTab === 'accommodations' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#081D35' }}>
                    Daftar Homestay, Hotel &amp; Vila Terdaftar
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    Kelola harga kamar per malam, fasilitas eco-stay, dan status verifikasi.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddAccommodation}
                  className="btn btn-primary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.55rem 1rem',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #F4B75E 0%, #E0A24A 100%)',
                    color: '#081D35',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(244, 183, 94, 0.35)',
                  }}
                >
                  <Plus size={15} /> Tambah Penginapan Baru
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {accommodations.map((acc) => (
                  <div
                    key={acc.id}
                    className="card"
                    style={{
                      padding: '1rem 1.25rem',
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '14px',
                      boxShadow: '0 2px 8px rgba(8, 29, 53, 0.04)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '1rem',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', minWidth: '280px' }}>
                      <img
                        src={acc.photo_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80'}
                        alt={acc.name}
                        style={{ width: '64px', height: '64px', borderRadius: '12px', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#081D35' }}>
                            {acc.name}
                          </span>
                          <span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>
                            {acc.type}
                          </span>
                          {acc.is_verified ? (
                            <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
                              ✓ Terverifikasi Admin
                            </span>
                          ) : (
                            <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>
                              ⏳ Menunggu Verifikasi
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.2rem', display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                          <span><MapPin size={11} style={{ display: 'inline', verticalAlign: 'middle' }} /> {acc.island_name}</span>
                          <span>•</span>
                          <span>{acc.rooms_available} Kamar Tersedia</span>
                          <span>•</span>
                          <span style={{ color: '#0369A1' }}>WA: {acc.contact_whatsapp}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.35rem' }}>
                          {acc.has_clean_ro_water && (
                            <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem', background: '#E0F2FE', color: '#0369A1', borderRadius: '4px', border: '1px solid #BAE6FD', fontWeight: 600 }}>
                              💧 Air Minum RO
                            </span>
                          )}
                          {acc.has_solar_backup && (
                            <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem', background: '#FEF3C7', color: '#B45309', borderRadius: '4px', border: '1px solid #FDE68A', fontWeight: 600 }}>
                              ☀️ PLTS Surya
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Tarif Per Malam:</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#081D35' }}>
                          Rp {acc.price_per_night_rp.toLocaleString()}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleQuickUpdatePrice(acc.id, acc.price_per_night_rp)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#0284C7',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            padding: 0,
                            marginTop: '0.2rem',
                          }}
                        >
                          ✏️ Ubah Tarif Cepat
                        </button>
                      </div>

                      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleAccVerify(acc)}
                          style={{
                            padding: '0.45rem 0.75rem',
                            borderRadius: '8px',
                            border: '1px solid #E2E8F0',
                            background: acc.is_verified ? '#FEF3C7' : '#DCFCE7',
                            color: acc.is_verified ? '#B45309' : '#15803D',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                          title="Ubah status verifikasi admin pusat"
                        >
                          {acc.is_verified ? 'Batalkan Verifikasi' : 'Setujui Verifikasi'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEditAccommodation(acc)}
                          style={{
                            padding: '0.45rem 0.75rem',
                            borderRadius: '8px',
                            border: '1px solid #E2E8F0',
                            background: '#F8FAFC',
                            color: '#081D35',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                          }}
                        >
                          <Edit2 size={13} /> Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteAccommodation(acc.id, acc.name)}
                          style={{
                            padding: '0.45rem 0.75rem',
                            borderRadius: '8px',
                            border: '1px solid #FECDD3',
                            background: '#FEE2E2',
                            color: '#BE123C',
                            fontSize: '0.75rem',
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
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUB-PANEL 2: PEMANDU WISATA & TARIF JASA */}
          {cmsSubTab === 'guides' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#081D35' }}>
                    Daftar Pemandu Wisata &amp; Sertifikasi HPI
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    Kelola tarif jasa pemandu per hari, lisensi, spesialisasi rute cagar budaya, dan kontak WhatsApp.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddGuide}
                  className="btn btn-primary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.55rem 1rem',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #F4B75E 0%, #E0A24A 100%)',
                    color: '#081D35',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(244, 183, 94, 0.35)',
                  }}
                >
                  <Plus size={15} /> Daftarkan Pemandu Baru
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {guides.map((guide) => (
                  <div
                    key={guide.id}
                    className="card"
                    style={{
                      padding: '1rem 1.25rem',
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '14px',
                      boxShadow: '0 2px 8px rgba(8, 29, 53, 0.04)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '1rem',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', minWidth: '280px' }}>
                      <img
                        src={guide.photo_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'}
                        alt={guide.name}
                        style={{ width: '64px', height: '64px', borderRadius: '12px', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#081D35' }}>
                            {guide.name}
                          </span>
                          <span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>
                            {guide.island_base}
                          </span>
                          {guide.is_verified ? (
                            <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
                              ✓ HPI Terverifikasi
                            </span>
                          ) : (
                            <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>
                              ⏳ Lisensi Belum Terverifikasi
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.2rem', display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                          <span>Lisensi: <code style={{ color: '#081D35', background: '#F1F5F9', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>{guide.license_number}</code></span>
                          {guide.resident_nik && (
                            <>
                              <span>•</span>
                              <span style={{ color: '#047857', fontWeight: 600 }}>NIK: {guide.resident_nik}</span>
                            </>
                          )}
                          <span>•</span>
                          <span style={{ color: '#0369A1' }}>WA: {guide.phone_whatsapp}</span>
                          <span>•</span>
                          <span>⭐ {guide.rating.toFixed(1)} ({guide.trips_completed} tur)</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#0284C7', marginTop: '0.25rem', fontWeight: 600 }}>
                          Spesialisasi: {guide.specialties} | Bahasa: {guide.languages}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Tarif Jasa Per Hari:</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#081D35' }}>
                          Rp {guide.fee_per_day_rp.toLocaleString()}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleQuickUpdateGuideFee(guide.id, guide.fee_per_day_rp)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#0284C7',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            padding: 0,
                            marginTop: '0.2rem',
                          }}
                        >
                          ✏️ Ubah Tarif Jasa
                        </button>
                      </div>

                      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleGuideVerify(guide)}
                          style={{
                            padding: '0.45rem 0.75rem',
                            borderRadius: '8px',
                            border: '1px solid #E2E8F0',
                            background: guide.is_verified ? '#FEF3C7' : '#DCFCE7',
                            color: guide.is_verified ? '#B45309' : '#15803D',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                          title="Ubah sertifikasi resmi HPI Banda"
                        >
                          {guide.is_verified ? 'Batalkan Sertifikasi' : 'Setujui HPI'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEditGuide(guide)}
                          style={{
                            padding: '0.45rem 0.75rem',
                            borderRadius: '8px',
                            border: '1px solid #E2E8F0',
                            background: '#F8FAFC',
                            color: '#081D35',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                          }}
                        >
                          <Edit2 size={13} /> Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteTourGuide(guide.id, guide.name)}
                          style={{
                            padding: '0.45rem 0.75rem',
                            borderRadius: '8px',
                            border: '1px solid #FECDD3',
                            background: '#FEE2E2',
                            color: '#BE123C',
                            fontSize: '0.75rem',
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
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUB-PANEL 3: CMS KONTEN & KARYA WARGA (MANDAT REYHAN ALBAR FAHRYAN) */}
          {cmsSubTab === 'community_contents' && (
            <CommunityLiteracyHub
              mode="cms_manager"
              currentUser={currentUser}
              onOpenQuickLogin={onOpenQuickLogin}
            />
          )}

          {/* SUB-PANEL 4: ARSIP ARTIKEL SEJARAH (MANDAT POKDARWIS & SEO) */}
          {cmsSubTab === 'history_articles' && (
            <PokdarwisHistoryCms
              currentUser={currentUser}
              onPreviewArticle={(slug) => {
                if (onNavigate) {
                  onNavigate('sejarah', slug)
                }
              }}
            />
          )}
        </div>
        )
      )}

      {/* MODAL: FORM BOOKING & GENERATOR WHATSAPP */}
      {selectedAccForBooking && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(8, 29, 53, 0.65)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            className="card animate-fade-in"
            style={{
              maxWidth: '520px',
              width: '100%',
              padding: '1.75rem',
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '20px',
              boxShadow: '0 20px 60px rgba(8, 29, 53, 0.2)',
              maxHeight: '90vh',
              overflowY: 'auto',
              color: '#081D35',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <span className="badge badge-amber" style={{ fontSize: '0.68rem', marginBottom: '0.35rem' }}>
                  RESERVASI PENGINAPAN ECO-STAY
                </span>
                <h3 style={{ margin: '0.15rem 0 0', fontSize: '1.25rem', fontWeight: 900, color: '#081D35' }}>
                  {selectedAccForBooking.name}
                </h3>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                  Tarif: <b style={{ color: '#081D35' }}>Rp {selectedAccForBooking.price_per_night_rp.toLocaleString()}</b> / malam
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAccForBooking(null)}
                style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Error Banner */}
            {bookingError && (
              <div style={{ marginBottom: '1rem', padding: '0.65rem 0.85rem', background: '#FEE2E2', border: '1px solid #FECDD3', borderRadius: '10px', color: '#BE123C', fontSize: '0.78rem' }}>
                {bookingError}
              </div>
            )}

            {/* If Confirmed: Show Success & WhatsApp Launch Button */}
            {confirmedBooking ? (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <CheckCircle2 size={48} color="#15803D" style={{ margin: '0 auto 0.75rem' }} />
                <h4 style={{ margin: '0 0 0.35rem', fontSize: '1.2rem', fontWeight: 900, color: '#081D35' }}>
                  Pemesanan Berhasil Dicatat!
                </h4>
                <div style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '1.25rem' }}>
                  Kode Reservasi: <b style={{ color: '#0369A1', fontFamily: 'monospace' }}>{confirmedBooking.booking_code}</b>
                </div>

                <div style={{ padding: '0.85rem', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '1.5rem', textAlign: 'left', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ color: '#64748B' }}>Tamu:</span>
                    <b style={{ color: '#081D35' }}>{confirmedBooking.guest_name}</b>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ color: '#64748B' }}>Durasi:</span>
                    <b style={{ color: '#0369A1' }}>{confirmedBooking.total_nights} Malam ({confirmedBooking.rooms_count} Kamar)</b>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E2E8F0', paddingTop: '0.35rem' }}>
                    <span style={{ color: '#64748B' }}>Total Tagihan:</span>
                    <b style={{ color: '#081D35', fontSize: '1rem' }}>Rp {confirmedBooking.total_price_rp.toLocaleString()}</b>
                  </div>
                </div>

                <a
                  href={confirmedBooking.wa_link}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.85rem',
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #F4B75E 0%, #E0A24A 100%)',
                    color: '#081D35',
                    border: 'none',
                    textDecoration: 'none',
                    boxShadow: '0 4px 14px rgba(244, 183, 94, 0.35)',
                  }}
                >
                  <MessageCircle size={18} /> Kirim Pesan Konfirmasi ke WhatsApp Host
                </a>
              </div>
            ) : (
              /* Booking Form */
              <form onSubmit={handleSubmitBooking} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#081D35', marginBottom: '0.35rem' }}>
                    Nama Lengkap Tamu:
                  </label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Contoh: Sarah Jenkins"
                    style={{
                      width: '100%',
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '10px',
                      color: '#081D35',
                      padding: '0.55rem 0.75rem',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#081D35', marginBottom: '0.35rem' }}>
                    Nomor WhatsApp Tamu (Aktif):
                  </label>
                  <input
                    type="text"
                    required
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="Contoh: 628123456789"
                    style={{
                      width: '100%',
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '10px',
                      color: '#081D35',
                      padding: '0.55rem 0.75rem',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#081D35', marginBottom: '0.35rem' }}>
                      Tanggal Check-In:
                    </label>
                    <input
                      type="date"
                      required
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      style={{
                        width: '100%',
                        background: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        borderRadius: '10px',
                        color: '#081D35',
                        padding: '0.5rem 0.65rem',
                        fontSize: '0.8rem',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#081D35', marginBottom: '0.35rem' }}>
                      Tanggal Check-Out:
                    </label>
                    <input
                      type="date"
                      required
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      style={{
                        width: '100%',
                        background: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        borderRadius: '10px',
                        color: '#081D35',
                        padding: '0.5rem 0.65rem',
                        fontSize: '0.8rem',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#081D35', marginBottom: '0.35rem' }}>
                    Jumlah Kamar:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedAccForBooking.rooms_available}
                    value={roomsCount}
                    onChange={(e) => setRoomsCount(parseInt(e.target.value) || 1)}
                    style={{
                      width: '100%',
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '10px',
                      color: '#081D35',
                      padding: '0.55rem 0.75rem',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#081D35', marginBottom: '0.35rem' }}>
                    Catatan Tambahan (Opsional):
                  </label>
                  <input
                    type="text"
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    placeholder="Contoh: Jemputan kapal speedboat di pelabuhan Neira"
                    style={{
                      width: '100%',
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '10px',
                      color: '#081D35',
                      padding: '0.55rem 0.75rem',
                      fontSize: '0.8rem',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingBooking}
                  className="btn btn-primary"
                  style={{
                    padding: '0.8rem',
                    fontSize: '0.875rem',
                    fontWeight: 800,
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #F4B75E 0%, #E0A24A 100%)',
                    color: '#081D35',
                    border: 'none',
                    boxShadow: '0 4px 14px rgba(244, 183, 94, 0.35)',
                    marginTop: '0.5rem',
                  }}
                >
                  {submittingBooking ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" /> Memproses Reservasi...
                    </>
                  ) : (
                    <>
                      <Calendar size={16} /> Buat Reservasi &amp; Tautkan ke WhatsApp
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT ACCOMMODATION */}
      {canAccessCMS && showAccModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(8, 29, 53, 0.65)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            className="card animate-fade-in"
            style={{
              maxWidth: '600px',
              width: '100%',
              padding: '1.75rem',
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '20px',
              boxShadow: '0 20px 60px rgba(8, 29, 53, 0.18)',
              maxHeight: '92vh',
              overflowY: 'auto',
              color: '#081D35',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <span className="badge badge-amber" style={{ fontSize: '0.68rem', marginBottom: '0.35rem' }}>
                  CMS PENGINAPAN &amp; TARIF
                </span>
                <h3 style={{ margin: '0.15rem 0 0', fontSize: '1.25rem', fontWeight: 900, color: '#081D35' }}>
                  {editingAccId ? 'Edit Listing Penginapan & Tarif' : 'Tambah Penginapan Baru'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAccModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveAccommodation} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#081D35', marginBottom: '0.35rem' }}>
                  Nama Penginapan:
                </label>
                <input
                  type="text"
                  required
                  value={accForm.name}
                  onChange={(e) => setAccForm({ ...accForm, name: e.target.value })}
                  placeholder="Contoh: The Nutmeg Tree Homestay"
                  style={{
                    width: '100%',
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '10px',
                    color: '#081D35',
                    padding: '0.55rem 0.75rem',
                    fontSize: '0.85rem',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#081D35', marginBottom: '0.35rem' }}>
                    Tipe Properti:
                  </label>
                  <select
                    value={accForm.type}
                    onChange={(e) => setAccForm({ ...accForm, type: e.target.value })}
                    style={{
                      width: '100%',
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '10px',
                      color: '#081D35',
                      padding: '0.55rem 0.75rem',
                      fontSize: '0.85rem',
                    }}
                  >
                    <option value="HOMESTAY">Homestay Lokal</option>
                    <option value="HOTEL">Hotel / Resort</option>
                    <option value="CABIN">Kabin Tepi Pantai</option>
                    <option value="GUESTHOUSE">Guesthouse Warisan</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#081D35', marginBottom: '0.35rem' }}>
                    Wilayah Pulau:
                  </label>
                  <select
                    value={accForm.island_name}
                    onChange={(e) => setAccForm({ ...accForm, island_name: e.target.value })}
                    style={{
                      width: '100%',
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '10px',
                      color: '#081D35',
                      padding: '0.55rem 0.75rem',
                      fontSize: '0.85rem',
                    }}
                  >
                    <option value="Pulau Neira">Pulau Neira</option>
                    <option value="Banda Besar">Banda Besar (Lonthoir)</option>
                    <option value="Pulau Hatta">Pulau Hatta (Rozengain)</option>
                    <option value="Pulau Ay">Pulau Ay</option>
                    <option value="Pulau Rhun">Pulau Rhun</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#081D35', marginBottom: '0.35rem' }}>
                    Tarif Kamar Per Malam (Rp):
                  </label>
                  <input
                    type="number"
                    required
                    min="50000"
                    step="10000"
                    value={accForm.price_per_night_rp}
                    onChange={(e) => setAccForm({ ...accForm, price_per_night_rp: parseFloat(e.target.value) || 0 })}
                    style={{
                      width: '100%',
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '10px',
                      color: '#081D35',
                      padding: '0.55rem 0.75rem',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#081D35', marginBottom: '0.35rem' }}>
                    Kamar Tersedia:
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={accForm.rooms_available}
                    onChange={(e) => setAccForm({ ...accForm, rooms_available: parseInt(e.target.value) || 1 })}
                    style={{
                      width: '100%',
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '10px',
                      color: '#081D35',
                      padding: '0.55rem 0.75rem',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#081D35', marginBottom: '0.35rem' }}>
                    Nomor WhatsApp Pengelola:
                  </label>
                  <input
                    type="text"
                    required
                    value={accForm.contact_whatsapp}
                    onChange={(e) => setAccForm({ ...accForm, contact_whatsapp: e.target.value })}
                    placeholder="628123456789"
                    style={{
                      width: '100%',
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '10px',
                      color: '#081D35',
                      padding: '0.55rem 0.75rem',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#081D35', marginBottom: '0.35rem' }}>
                    URL Foto Penginapan:
                  </label>
                  <input
                    type="text"
                    value={accForm.photo_url || ''}
                    onChange={(e) => setAccForm({ ...accForm, photo_url: e.target.value })}
                    placeholder="https://..."
                    style={{
                      width: '100%',
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '10px',
                      color: '#081D35',
                      padding: '0.55rem 0.75rem',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#081D35', marginBottom: '0.35rem' }}>
                  Alamat Lengkap:
                </label>
                <input
                  type="text"
                  required
                  value={accForm.address}
                  onChange={(e) => setAccForm({ ...accForm, address: e.target.value })}
                  placeholder="Jl. Pelabuhan No. 12, Nusantara, Banda Neira"
                  style={{
                    width: '100%',
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '10px',
                    color: '#081D35',
                    padding: '0.55rem 0.75rem',
                    fontSize: '0.85rem',
                  }}
                />
              </div>

              {/* Eco Features Checkboxes */}
              <div style={{ background: '#F8FAFC', padding: '0.75rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#081D35', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                  Fitur Mandat Smart Eco-Stay:
                </span>
                <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#081D35', cursor: 'pointer', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={accForm.has_clean_ro_water}
                      onChange={(e) => setAccForm({ ...accForm, has_clean_ro_water: e.target.checked })}
                    />
                    💧 Air Minum RO Mandiri
                  </label>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#081D35', cursor: 'pointer', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={accForm.has_solar_backup}
                      onChange={(e) => setAccForm({ ...accForm, has_solar_backup: e.target.checked })}
                    />
                    ☀️ Bauran Surya PLTS
                  </label>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#081D35', cursor: 'pointer', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={accForm.eco_stay_badge}
                      onChange={(e) => setAccForm({ ...accForm, eco_stay_badge: e.target.checked })}
                    />
                    🌿 Badge Eco-Stay
                  </label>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#081D35', marginBottom: '0.35rem' }}>
                  Deskripsi / Daya Tarik Homestay:
                </label>
                <textarea
                  rows={2}
                  value={accForm.description || ''}
                  onChange={(e) => setAccForm({ ...accForm, description: e.target.value })}
                  placeholder="Keterangan fasilitas, jarak ke benteng, dan view Gunung Api Banda..."
                  style={{
                    width: '100%',
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '10px',
                    color: '#081D35',
                    padding: '0.55rem 0.75rem',
                    fontSize: '0.85rem',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAccModal(false)}
                  style={{
                    padding: '0.65rem 1.1rem',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    background: '#FFFFFF',
                    color: '#64748B',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    padding: '0.65rem 1.25rem',
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #F4B75E 0%, #E0A24A 100%)',
                    color: '#081D35',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(244, 183, 94, 0.35)',
                  }}
                >
                  {editingAccId ? 'Perbarui Penginapan' : 'Simpan Listing Penginapan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT TOUR GUIDE */}
      {canAccessCMS && showGuideModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(8, 29, 53, 0.65)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            className="card animate-fade-in"
            style={{
              maxWidth: '600px',
              width: '100%',
              padding: '1.75rem',
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '20px',
              boxShadow: '0 20px 60px rgba(8, 29, 53, 0.18)',
              maxHeight: '92vh',
              overflowY: 'auto',
              color: '#081D35',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <span className="badge badge-blue" style={{ fontSize: '0.68rem', marginBottom: '0.35rem' }}>
                  CMS PEMANDU WISATA &amp; JASA
                </span>
                <h3 style={{ margin: '0.15rem 0 0', fontSize: '1.25rem', fontWeight: 900, color: '#081D35' }}>
                  {editingGuideId ? 'Edit Pemandu Wisata' : 'Daftarkan Pemandu Baru'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveTourGuide} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#081D35' }}>
                    16 Digit NIK Warga Terdaftar:
                  </label>
                  <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: guideForm.resident_nik.length === 16 ? '#059669' : '#DC2626', fontWeight: 700 }}>
                    {guideForm.resident_nik.length}/16 Digit
                  </span>
                </div>
                <input
                  type="text"
                  required
                  inputMode="numeric"
                  maxLength={16}
                  value={guideForm.resident_nik}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 16)
                    setGuideForm({ ...guideForm, resident_nik: digits })
                  }}
                  placeholder="Contoh: 8171010101900001"
                  style={{
                    width: '100%',
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '10px',
                    color: '#081D35',
                    padding: '0.55rem 0.75rem',
                    fontSize: '0.85rem',
                    letterSpacing: '1px',
                  }}
                />
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.7rem', color: '#64748B' }}>
                  Pemandu wisata wajib berstatus warga resmi terdaftar di database kependudukan Kepulauan Banda.
                </p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#081D35', marginBottom: '0.35rem' }}>
                  Nama Lengkap Pemandu:
                </label>
                <input
                  type="text"
                  required
                  value={guideForm.name}
                  onChange={(e) => setGuideForm({ ...guideForm, name: e.target.value })}
                  placeholder="Contoh: Muhammad Ali Baadilla"
                  style={{
                    width: '100%',
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '10px',
                    color: '#081D35',
                    padding: '0.55rem 0.75rem',
                    fontSize: '0.85rem',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#081D35', marginBottom: '0.35rem' }}>
                    Nomor Lisensi HPI / Lokal:
                  </label>
                  <input
                    type="text"
                    required
                    value={guideForm.license_number}
                    onChange={(e) => setGuideForm({ ...guideForm, license_number: e.target.value })}
                    placeholder="HPI-BANDA-001"
                    style={{
                      width: '100%',
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '10px',
                      color: '#081D35',
                      padding: '0.55rem 0.75rem',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#081D35', marginBottom: '0.35rem' }}>
                    Basis Wilayah / Pulau:
                  </label>
                  <select
                    value={guideForm.island_base}
                    onChange={(e) => setGuideForm({ ...guideForm, island_base: e.target.value })}
                    style={{
                      width: '100%',
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '10px',
                      color: '#081D35',
                      padding: '0.55rem 0.75rem',
                      fontSize: '0.85rem',
                    }}
                  >
                    <option value="Pulau Neira">Pulau Neira</option>
                    <option value="Pulau Banda Besar">Pulau Banda Besar</option>
                    <option value="Pulau Hatta">Pulau Hatta</option>
                    <option value="Pulau Ay">Pulau Ay</option>
                    <option value="Pulau Rhun">Pulau Rhun</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#081D35', marginBottom: '0.35rem' }}>
                    Tarif Jasa Per Hari (Rp):
                  </label>
                  <input
                    type="number"
                    required
                    min="50000"
                    step="25000"
                    value={guideForm.fee_per_day_rp}
                    onChange={(e) => setGuideForm({ ...guideForm, fee_per_day_rp: parseFloat(e.target.value) || 0 })}
                    style={{
                      width: '100%',
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '10px',
                      color: '#081D35',
                      padding: '0.55rem 0.75rem',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#081D35', marginBottom: '0.35rem' }}>
                    Nomor WhatsApp Pemandu:
                  </label>
                  <input
                    type="text"
                    required
                    value={guideForm.phone_whatsapp}
                    onChange={(e) => setGuideForm({ ...guideForm, phone_whatsapp: e.target.value })}
                    placeholder="628123456789"
                    style={{
                      width: '100%',
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '10px',
                      color: '#081D35',
                      padding: '0.55rem 0.75rem',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#081D35', marginBottom: '0.35rem' }}>
                    Keahlian / Spesialisasi:
                  </label>
                  <input
                    type="text"
                    required
                    value={guideForm.specialties}
                    onChange={(e) => setGuideForm({ ...guideForm, specialties: e.target.value })}
                    placeholder="Contoh: Sejarah Benteng VOC & Budaya Banda"
                    style={{
                      width: '100%',
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '10px',
                      color: '#081D35',
                      padding: '0.55rem 0.75rem',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#081D35', marginBottom: '0.35rem' }}>
                    Bahasa yang Dikuasai:
                  </label>
                  <input
                    type="text"
                    required
                    value={guideForm.languages}
                    onChange={(e) => setGuideForm({ ...guideForm, languages: e.target.value })}
                    placeholder="Indonesia, English, Dutch"
                    style={{
                      width: '100%',
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '10px',
                      color: '#081D35',
                      padding: '0.55rem 0.75rem',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#081D35', marginBottom: '0.35rem' }}>
                  URL Foto Profil:
                </label>
                <input
                  type="text"
                  value={guideForm.photo_url || ''}
                  onChange={(e) => setGuideForm({ ...guideForm, photo_url: e.target.value })}
                  placeholder="https://..."
                  style={{
                    width: '100%',
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '10px',
                    color: '#081D35',
                    padding: '0.55rem 0.75rem',
                    fontSize: '0.85rem',
                  }}
                />
              </div>

              <div style={{ background: '#F8FAFC', padding: '0.75rem', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', gap: '1.25rem' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#081D35', cursor: 'pointer', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={guideForm.is_verified}
                    onChange={(e) => setGuideForm({ ...guideForm, is_verified: e.target.checked })}
                  />
                  ✓ Lisensi Terverifikasi HPI Banda
                </label>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#081D35', cursor: 'pointer', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={guideForm.is_active}
                    onChange={(e) => setGuideForm({ ...guideForm, is_active: e.target.checked })}
                  />
                  🟢 Status Aktif (Siap Menerima Tur)
                </label>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#081D35', marginBottom: '0.35rem' }}>
                  Biografi / Pengalaman Pemandu:
                </label>
                <textarea
                  rows={2}
                  value={guideForm.bio || ''}
                  onChange={(e) => setGuideForm({ ...guideForm, bio: e.target.value })}
                  placeholder="Ceritakan latar belakang, sertifikasi diving/sejarah, dll..."
                  style={{
                    width: '100%',
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '10px',
                    color: '#081D35',
                    padding: '0.55rem 0.75rem',
                    fontSize: '0.85rem',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowGuideModal(false)}
                  style={{
                    padding: '0.65rem 1.1rem',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    background: '#FFFFFF',
                    color: '#64748B',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    padding: '0.65rem 1.25rem',
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #F4B75E 0%, #E0A24A 100%)',
                    color: '#081D35',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(244, 183, 94, 0.35)',
                  }}
                >
                  {editingGuideId ? 'Perbarui Pemandu' : 'Daftarkan Pemandu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}