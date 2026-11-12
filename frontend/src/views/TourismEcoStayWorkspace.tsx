import React, { useState, useEffect } from 'react'
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
} from 'lucide-react'
import {
  tourismService,
  AccommodationItem,
  BookingItem,
  HeritageCatalogItem,
  TourGuideItem,
  AccommodationCreatePayload,
  TourGuideCreatePayload,
} from '../services/tourism'

export interface TourismEcoStayWorkspaceProps {
  currentUser?: any
}

export const TourismEcoStayWorkspace: React.FC<TourismEcoStayWorkspaceProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'accommodations' | 'guides' | 'heritage' | 'lookup' | 'bookings' | 'cms'>('accommodations')

  // Accommodations State
  const [accommodations, setAccommodations] = useState<AccommodationItem[]>([])
  const [loadingAccs, setLoadingAccs] = useState<boolean>(true)
  const [islandFilter, setIslandFilter] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [filterRoOnly, setFilterRoOnly] = useState<boolean>(false)
  const [filterSolarOnly, setFilterSolarOnly] = useState<boolean>(false)

  // Tour Guides State
  const [guides, setGuides] = useState<TourGuideItem[]>([])
  const [loadingGuides, setLoadingGuides] = useState<boolean>(false)
  const [guideIslandFilter, setGuideIslandFilter] = useState<string>('')

  // CMS State
  const [cmsSubTab, setCmsSubTab] = useState<'accommodations' | 'guides'>('accommodations')
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

  useEffect(() => {
    loadAccommodations()
    loadHeritage()
    loadBookings()
    loadGuides()
  }, [islandFilter, typeFilter, filterRoOnly, filterSolarOnly, heritageCategory, guideIslandFilter])

  const loadGuides = async () => {
    setLoadingGuides(true)
    try {
      const data = await tourismService.listTourGuides({ island: guideIslandFilter || undefined })
      setGuides(data)
    } catch {
      // ignore
    } finally {
      setLoadingGuides(false)
    }
  }

  const loadBookings = async () => {
    setLoadingBookings(true)
    try {
      const data = await tourismService.listBookings()
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

  return (
    <div className="workspace-container animate-fade-in">
      {/* Workspace Header */}
      <div className="workspace-header" style={{ marginBottom: '1.75rem' }}>
        <div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
            <span className="badge badge-emerald" style={{ display: 'inline-flex', gap: '0.35rem' }}>
              <Compass size={12} /> Mandat Smart Tourism FTI &amp; Komunitas Lokal
            </span>
            {currentUser && (
              <span className="badge badge-blue" style={{ fontSize: '0.72rem' }}>
                👤 Operator: {currentUser.full_name || currentUser.username}
              </span>
            )}
          </div>
          <h2 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 900, color: '#f8fafc', letterSpacing: '-0.02em' }}>
            Smart Tourism, Eco-Stay &amp; Cagar Budaya
          </h2>
          <p style={{ margin: '0.35rem 0 0', color: '#94a3b8', fontSize: '0.875rem' }}>
            Katalog penginapan ramah lingkungan (air minum RO &amp; bauran surya), reservasi instan WhatsApp, serta panduan 177 cagar budaya &amp; audio guide.
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '0.4rem', background: 'rgba(15, 23, 42, 0.8)', padding: '0.35rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setActiveTab('accommodations')}
            style={{
              padding: '0.5rem 0.95rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s',
              background: activeTab === 'accommodations' ? 'linear-gradient(135deg, #10b981, #06b6d4)' : 'transparent',
              color: activeTab === 'accommodations' ? '#ffffff' : '#94a3b8',
            }}
          >
            <Home size={14} /> 🏡 Eco-Stay &amp; Vila
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('guides')
              loadGuides()
            }}
            style={{
              padding: '0.5rem 0.95rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s',
              background: activeTab === 'guides' ? 'linear-gradient(135deg, #0284c7, #06b6d4)' : 'transparent',
              color: activeTab === 'guides' ? '#ffffff' : '#94a3b8',
            }}
          >
            <Compass size={14} /> 🧭 Pemandu Wisata ({guides.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('heritage')}
            style={{
              padding: '0.5rem 0.95rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s',
              background: activeTab === 'heritage' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'transparent',
              color: activeTab === 'heritage' ? '#ffffff' : '#94a3b8',
            }}
          >
            <Landmark size={14} /> 🏛️ 177 Cagar Budaya &amp; Audio Guide
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('lookup')}
            style={{
              padding: '0.5rem 0.95rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s',
              background: activeTab === 'lookup' ? 'linear-gradient(135deg, #8b5cf6, #3b82f6)' : 'transparent',
              color: activeTab === 'lookup' ? '#ffffff' : '#94a3b8',
            }}
          >
            <Search size={14} /> 🔍 Cek Kode Reservasi
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('bookings')
              loadBookings()
            }}
            style={{
              padding: '0.5rem 0.95rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s',
              background: activeTab === 'bookings' ? 'linear-gradient(135deg, #06b6d4, #0284c7)' : 'transparent',
              color: activeTab === 'bookings' ? '#ffffff' : '#94a3b8',
            }}
          >
            <Calendar size={14} /> 📋 Reservasi Masuk ({bookings.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cms')}
            style={{
              padding: '0.5rem 0.95rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s',
              background: activeTab === 'cms' ? 'linear-gradient(135deg, #ec4899, #8b5cf6)' : 'rgba(236, 72, 153, 0.12)',
              color: activeTab === 'cms' ? '#ffffff' : '#f472b6',
              borderLeft: '1px solid rgba(236, 72, 153, 0.3)',
            }}
            title="Kelola harga hotel, penginapan baru, dan tarif pemandu wisata"
          >
            <Settings size={14} /> ⚙️ CMS Pusat &amp; Tarif
          </button>
        </div>
      </div>

      {/* TAB 1: ACCOMMODATIONS (ECO-STAYS) */}
      {activeTab === 'accommodations' && (
        <div>
          {/* Filter Bar */}
          <div className="card" style={{ padding: '1rem 1.25rem', background: 'var(--surface-color)', border: '1px solid var(--border-color)', marginBottom: '1.25rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase' }}>
              Wilayah:
            </span>
            {['', 'Pulau Neira', 'Banda Besar', 'Pulau Hatta', 'Pulau Ay'].map((isl) => (
              <button
                type="button"
                key={isl}
                onClick={() => setIslandFilter(isl)}
                style={{
                  fontSize: '0.75rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '20px',
                  border: islandFilter === isl ? '1px solid #10b981' : '1px solid var(--border-color)',
                  background: islandFilter === isl ? 'rgba(16, 185, 129, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                  color: islandFilter === isl ? '#10b981' : '#94a3b8',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                {isl || 'Semua'}
              </button>
            ))}

            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#06b6d4', textTransform: 'uppercase', marginLeft: '0.5rem' }}>
              Tipe:
            </span>
            {[
              { label: 'Semua', val: '' },
              { label: 'Homestay', val: 'homestay' },
              { label: 'Hotel', val: 'hotel' },
              { label: 'Kabin', val: 'cabin' },
              { label: 'Guesthouse', val: 'guesthouse' },
            ].map((tp) => (
              <button
                type="button"
                key={tp.val}
                onClick={() => setTypeFilter(tp.val)}
                style={{
                  fontSize: '0.75rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '20px',
                  border: typeFilter === tp.val ? '1px solid #06b6d4' : '1px solid var(--border-color)',
                  background: typeFilter === tp.val ? 'rgba(6, 182, 212, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                  color: typeFilter === tp.val ? '#06b6d4' : '#94a3b8',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                {tp.label}
              </button>
            ))}

            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <label style={{ fontSize: '0.75rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={filterRoOnly}
                  onChange={(e) => setFilterRoOnly(e.target.checked)}
                />
                <Droplets size={13} color="#06b6d4" /> Ada Air RO Bersih
              </label>

              <label style={{ fontSize: '0.75rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={filterSolarOnly}
                  onChange={(e) => setFilterSolarOnly(e.target.checked)}
                />
                <Sun size={13} color="#f59e0b" /> Ada Listrik Surya
              </label>
            </div>
          </div>

          {/* Accommodation Cards Grid */}
          {loadingAccs ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
              <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem' }} />
              Memuat penginapan eco-stay Banda Neira...
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {accommodations.map((acc) => (
                <div
                  key={acc.id}
                  className="card"
                  style={{
                    padding: 0,
                    overflow: 'hidden',
                    background: 'var(--surface-color)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {/* Photo Banner */}
                  <div style={{ height: '170px', position: 'relative', overflow: 'hidden', background: '#0f172a' }}>
                    <img
                      src={acc.photo_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'}
                      alt={acc.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                      <span className="badge badge-emerald" style={{ fontSize: '0.68rem', padding: '0.2rem 0.5rem' }}>
                        {acc.type}
                      </span>
                      {acc.eco_stay_badge && (
                        <span className="badge badge-amber" style={{ fontSize: '0.68rem', padding: '0.2rem 0.5rem' }}>
                          🌱 Eco-Stay
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div style={{ padding: '1.15rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: '#06b6d4', fontWeight: 700, marginBottom: '0.25rem' }}>
                      <MapPin size={12} /> {acc.island_name} — {acc.address}
                    </div>

                    <h3 style={{ margin: '0 0 0.45rem', fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>
                      {acc.name}
                    </h3>

                    <p style={{ margin: '0 0 0.85rem', color: '#94a3b8', fontSize: '0.78rem', lineHeight: 1.45, flex: 1 }}>
                      {acc.description}
                    </p>

                    {/* Eco Amenities Badges */}
                    <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                      {acc.has_clean_ro_water && (
                        <span style={{ fontSize: '0.7rem', color: '#38bdf8', background: 'rgba(6, 182, 212, 0.15)', padding: '0.2rem 0.45rem', borderRadius: '4px', border: '1px solid rgba(6, 182, 212, 0.3)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Droplets size={11} /> Air Minum RO Gratis
                        </span>
                      )}
                      {acc.has_solar_backup && (
                        <span style={{ fontSize: '0.7rem', color: '#fbbf24', background: 'rgba(245, 158, 11, 0.15)', padding: '0.2rem 0.45rem', borderRadius: '4px', border: '1px solid rgba(245, 158, 11, 0.3)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Sun size={11} /> Cadangan Surya
                        </span>
                      )}
                    </div>

                    {/* Price & Action */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '0.85rem' }}>
                      <div>
                        <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Mulai dari:</div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#10b981' }}>
                          Rp {acc.price_per_night_rp.toLocaleString()}
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500 }}> / malam</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenBookingModal(acc)}
                        className="btn btn-primary"
                        style={{ padding: '0.5rem 0.95rem', fontSize: '0.8rem', fontWeight: 800, background: 'linear-gradient(135deg, #10b981, #059669)' }}
                      >
                        <MessageCircle size={14} /> Pesan Kamar
                      </button>
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
        <div>
          {/* Category Filter */}
          <div className="card" style={{ padding: '0.85rem 1.15rem', background: 'var(--surface-color)', border: '1px solid var(--border-color)', marginBottom: '1.25rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f59e0b', alignSelf: 'center', marginRight: '0.25rem' }}>
              Kategori Cagar Budaya:
            </span>
            {['', 'BENTENG', 'RUMAH_SEJARAH', 'CAGAR_BUDAYA'].map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => setHeritageCategory(cat)}
                style={{
                  fontSize: '0.75rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '20px',
                  border: heritageCategory === cat ? '1px solid #f59e0b' : '1px solid var(--border-color)',
                  background: heritageCategory === cat ? 'rgba(245, 158, 11, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                  color: heritageCategory === cat ? '#fbbf24' : '#94a3b8',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                {cat || 'Semua Cagar Budaya'}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {heritageSites.map((h) => (
              <div
                key={h.slug}
                className="card"
                style={{
                  padding: 0,
                  overflow: 'hidden',
                  background: 'var(--surface-color)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ height: '170px', position: 'relative', overflow: 'hidden', background: '#0f172a' }}>
                  <img
                    src={h.photo_url}
                    alt={h.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
                    <span className="badge badge-amber" style={{ fontSize: '0.68rem', padding: '0.2rem 0.5rem' }}>
                      {h.category}
                    </span>
                  </div>
                </div>

                <div style={{ padding: '1.15rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: 700, marginBottom: '0.2rem' }}>
                    {h.island} • Periode: {h.historical_period}
                  </div>

                  <h3 style={{ margin: '0 0 0.45rem', fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>
                    {h.title}
                  </h3>

                  <p style={{ margin: '0 0 1rem', color: '#94a3b8', fontSize: '0.78rem', lineHeight: 1.5, flex: 1 }}>
                    {h.narrative}
                  </p>

                  {/* Audio Guide Player Section */}
                  <div style={{ padding: '0.75rem', background: 'rgba(15, 23, 42, 0.7)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(245, 158, 11, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <Volume2 size={16} color="#fbbf24" />
                      <span style={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 700 }}>
                        {activeAudioSlug === h.slug ? 'Sedang Memutar Audio...' : 'Audio Guide Sejarah'}
                      </span>
                    </div>

                    <audio
                      controls
                      src={h.audio_guide_url}
                      onPlay={() => setActiveAudioSlug(h.slug)}
                      onPause={() => setActiveAudioSlug(null)}
                      style={{ height: '30px', maxWidth: '170px' }}
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
          <div className="card" style={{ padding: '1.75rem', background: 'var(--surface-color)', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Search size={18} style={{ color: '#8b5cf6' }} /> Lacak Status Pemesanan Kamar
            </h3>
            <p style={{ margin: '0 0 1.25rem', color: '#94a3b8', fontSize: '0.8rem' }}>
              Masukkan kode reservasi unik (format: <code>BKG-YYYYMMDD-XXXX</code>) yang Anda dapatkan saat memesan penginapan.
            </p>

            <form onSubmit={handleLookupBooking} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={searchBookingCode}
                onChange={(e) => setSearchBookingCode(e.target.value)}
                placeholder="Contoh: BKG-20261111-A1B2..."
                style={{
                  flex: 1,
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  color: '#f8fafc',
                  padding: '0.65rem 0.85rem',
                  fontSize: '0.9rem',
                  fontFamily: 'monospace',
                }}
              />
              <button
                type="submit"
                disabled={loadingLookup}
                className="btn btn-primary"
                style={{ padding: '0.65rem 1.15rem', fontWeight: 800, background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' }}
              >
                {loadingLookup ? <RefreshCw size={16} className="animate-spin" /> : 'Lacak'}
              </button>
            </form>

            {lookupError && (
              <div style={{ marginTop: '1rem', padding: '0.65rem 0.85rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: 'var(--radius-md)', color: '#f87171', fontSize: '0.8rem' }}>
                {lookupError}
              </div>
            )}
          </div>

          {lookupResult && (
            <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(145deg, rgba(139, 92, 246, 0.1), rgba(6, 182, 212, 0.05))', border: '1px solid rgba(139, 92, 246, 0.4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#a78bfa', fontFamily: 'monospace', fontWeight: 800 }}>
                    KODE: {lookupResult.booking_code}
                  </span>
                  <h3 style={{ margin: '0.2rem 0 0', fontSize: '1.25rem', fontWeight: 900, color: '#f8fafc' }}>
                    {lookupResult.accommodation_name}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.15rem' }}>
                    Tamu: <b style={{ color: '#f8fafc' }}>{lookupResult.guest_name}</b> ({lookupResult.guest_whatsapp})
                  </div>
                </div>
                <span className="badge badge-emerald" style={{ fontSize: '0.72rem' }}>
                  {lookupResult.status}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ padding: '0.65rem 0.85rem', background: 'rgba(15, 23, 42, 0.6)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Jadwal Menginap:</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.15rem' }}>
                    {lookupResult.check_in} s/d {lookupResult.check_out}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#06b6d4', marginTop: '0.1rem' }}>
                    {lookupResult.total_nights} Malam • {lookupResult.rooms_count} Kamar
                  </div>
                </div>

                <div style={{ padding: '0.65rem 0.85rem', background: 'rgba(15, 23, 42, 0.6)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Total Pembayaran:</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#10b981', marginTop: '0.15rem' }}>
                    Rp {lookupResult.total_price_rp.toLocaleString()}
                  </div>
                </div>
              </div>

              <a
                href={lookupResult.wa_link}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', background: 'linear-gradient(135deg, #10b981, #059669)', textDecoration: 'none', fontWeight: 800 }}
              >
                <MessageCircle size={16} /> Hubungi Host Penginapan via WhatsApp
              </a>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: OPERATOR BOOKINGS MANAGEMENT */}
      {activeTab === 'bookings' && (
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
            <div className="card" style={{ padding: '1.25rem', background: 'var(--surface-color)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                Total Reservasi Masuk
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#06b6d4', marginTop: '0.25rem' }}>
                {bookings.length} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Pemesanan</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#10b981', marginTop: '0.35rem' }}>
                ● Status Terverifikasi 100%
              </div>
            </div>

            <div className="card" style={{ padding: '1.25rem', background: 'var(--surface-color)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                Estimasi Omset Homestay
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#10b981', marginTop: '0.25rem' }}>
                Rp {bookings.reduce((sum, b) => sum + b.total_price_rp, 0).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#38bdf8', marginTop: '0.35rem' }}>
                Ekonomi Komunitas Banda Neira
              </div>
            </div>

            <div className="card" style={{ padding: '1.25rem', background: 'var(--surface-color)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                Total Malam Menginap
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fbbf24', marginTop: '0.25rem' }}>
                {bookings.reduce((sum, b) => sum + (b.total_nights * b.rooms_count), 0)} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Room-Nights</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.35rem' }}>
                Kamar Ramah Lingkungan &amp; Air RO
              </div>
            </div>
          </div>

          {/* Action Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Calendar size={18} color="#06b6d4" /> Buku Tamu &amp; Riwayat Reservasi Eco-Stay
            </h3>
            <button
              type="button"
              onClick={loadBookings}
              disabled={loadingBookings}
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem' }}
            >
              <RefreshCw size={13} className={loadingBookings ? 'animate-spin' : ''} />
              {loadingBookings ? 'Menyinkronkan...' : 'Perbarui Data'}
            </button>
          </div>

          {/* Bookings List */}
          {loadingBookings ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#94a3b8' }}>
              <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.75rem' }} />
              Memuat data reservasi...
            </div>
          ) : bookings.length === 0 ? (
            <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center', background: 'var(--surface-color)', border: '1px solid var(--border-color)' }}>
              <Home size={36} color="#64748b" style={{ margin: '0 auto 0.75rem' }} />
              <h4 style={{ margin: '0 0 0.35rem', color: '#f8fafc' }}>Belum Ada Reservasi Masuk</h4>
              <p style={{ margin: 0, fontSize: '0.825rem', color: '#94a3b8' }}>
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
                    background: 'var(--surface-color)',
                    border: '1px solid var(--border-color)',
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
                        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(16, 185, 129, 0.2) 100%)',
                        border: '1px solid rgba(6, 182, 212, 0.4)',
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
                        <span style={{ fontSize: '0.975rem', fontWeight: 800, color: '#f8fafc' }}>
                          {b.guest_name}
                        </span>
                        <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
                          <CheckCircle2 size={11} /> {b.status}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                          [{b.booking_code}]
                        </span>
                      </div>

                      <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#06b6d4', marginTop: '0.2rem' }}>
                        {b.accommodation_name}
                      </div>

                      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.35rem', fontSize: '0.75rem', color: '#94a3b8', flexWrap: 'wrap' }}>
                        <span>📅 Check-in: <b>{b.check_in}</b></span>
                        <span>📅 Check-out: <b>{b.check_out}</b> ({b.total_nights} Malam)</span>
                        <span>🛏️ <b>{b.rooms_count} Kamar</b></span>
                        {b.notes && <span style={{ color: '#cbd5e1' }}>📝 Catatan: "{b.notes}"</span>}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Total Tagihan:</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#10b981' }}>
                        Rp {b.total_price_rp.toLocaleString()}
                      </div>
                    </div>

                    <a
                      href={`https://wa.me/${b.guest_whatsapp.replace(/\D/g, '')}?text=Halo%20${encodeURIComponent(b.guest_name)},%20kami%20dari%20pengelola%20${encodeURIComponent(b.accommodation_name)}%20Banda%20Neira%20mengenai%20booking%20${b.booking_code}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: '#ffffff',
                        padding: '0.5rem 0.95rem',
                        borderRadius: '10px',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
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
      )}

      {/* TAB: TOUR GUIDES CATALOG */}
      {activeTab === 'guides' && (
        <div>
          {/* Filter Bar */}
          <div className="card" style={{ padding: '1rem 1.25rem', background: 'var(--surface-color)', border: '1px solid var(--border-color)', marginBottom: '1.25rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase' }}>
              Basis Pulau Pemandu:
            </span>
            {['', 'Pulau Neira', 'Pulau Banda Besar', 'Pulau Hatta', 'Pulau Ay', 'Pulau Rhun'].map((isl) => (
              <button
                type="button"
                key={isl}
                onClick={() => setGuideIslandFilter(isl)}
                style={{
                  fontSize: '0.75rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '20px',
                  border: guideIslandFilter === isl ? '1px solid #0284c7' : '1px solid var(--border-color)',
                  background: guideIslandFilter === isl ? 'rgba(2, 132, 199, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                  color: guideIslandFilter === isl ? '#38bdf8' : '#94a3b8',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                {isl || 'Semua Pulau'}
              </button>
            ))}
          </div>

          {loadingGuides ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#94a3b8' }}>
              <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.75rem' }} />
              Memuat data pemandu wisata...
            </div>
          ) : guides.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem', background: 'var(--surface-color)', border: '1px solid var(--border-color)' }}>
              <Compass size={40} color="#64748b" style={{ margin: '0 auto 0.75rem' }} />
              <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.1rem' }}>Belum Ada Pemandu Terdaftar</h3>
              <p style={{ margin: '0.35rem 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>
                Silakan pilih wilayah lain atau daftarkan pemandu lokal baru melalui panel CMS.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {guides.map((guide) => (
                <div
                  key={guide.id}
                  className="card hover-glow"
                  style={{
                    background: 'var(--surface-color)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div style={{ position: 'relative', height: '190px', background: '#1e293b' }}>
                    <img
                      src={guide.photo_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80'}
                      alt={guide.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      loading="lazy"
                    />
                    <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {guide.is_verified ? (
                        <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', boxShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                          <UserCheck size={12} /> HPI Terverifikasi
                        </span>
                      ) : (
                        <span className="badge badge-amber" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          Lisensi Lokal
                        </span>
                      )}
                    </div>
                    <div style={{ position: 'absolute', bottom: '0.75rem', right: '0.75rem', background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(4px)', padding: '0.3rem 0.6rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Star size={12} color="#fbbf24" fill="#fbbf24" /> {guide.rating.toFixed(1)} ({guide.trips_completed} tur)
                    </div>
                  </div>

                  <div style={{ padding: '1.15rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                      <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#f8fafc' }}>
                        {guide.name}
                      </h3>
                      <span className="badge badge-blue" style={{ fontSize: '0.68rem' }}>
                        {guide.island_base}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Award size={12} color="#38bdf8" /> No. Registrasi: <code style={{ color: '#cbd5e1' }}>{guide.license_number}</code>
                    </div>

                    {guide.bio && (
                      <p style={{ margin: '0 0 0.75rem', fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {guide.bio}
                      </p>
                    )}

                    <div style={{ marginBottom: '0.6rem' }}>
                      <div style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', marginBottom: '0.25rem' }}>
                        Keahlian Tur:
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 600 }}>
                        {guide.specialties}
                      </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', marginBottom: '0.25rem' }}>
                        Bahasa:
                      </div>
                      <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                        {guide.languages.split(',').map((lang) => (
                          <span key={lang.trim()} style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', borderRadius: '6px' }}>
                            {lang.trim()}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div style={{ marginTop: 'auto', paddingTop: '0.85rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Tarif Jasa Pemandu:</div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#10b981' }}>
                          Rp {guide.fee_per_day_rp.toLocaleString()} <span style={{ fontSize: '0.7rem', fontWeight: 500, color: '#64748b' }}>/ hari</span>
                        </div>
                      </div>

                      <a
                        href={`https://wa.me/${guide.phone_whatsapp.replace(/\D/g, '')}?text=Halo%20Bung%20${encodeURIComponent(guide.name)},%20saya%20tertarik%20menggunakan%20jasa%20pemandu%20wisata%20Banda%20Neira%20untuk%20ekspedisi%20cagar%20budaya.`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
                          color: '#ffffff',
                          padding: '0.55rem 0.95rem',
                          borderRadius: '10px',
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          boxShadow: '0 2px 10px rgba(2, 132, 199, 0.3)',
                        }}
                      >
                        <Phone size={14} /> Hubungi Guide
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: CMS PUSAT & PENGATURAN TARIF */}
      {activeTab === 'cms' && (
        <div>
          {/* CMS Notice */}
          {cmsNotice && (
            <div
              style={{
                marginBottom: '1.25rem',
                padding: '0.75rem 1rem',
                background: cmsNotice.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                border: `1px solid ${cmsNotice.type === 'success' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                borderRadius: 'var(--radius-md)',
                color: cmsNotice.type === 'success' ? '#34d399' : '#f87171',
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
              background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.08), rgba(139, 92, 246, 0.08))',
              border: '1px solid rgba(236, 72, 153, 0.3)',
              borderRadius: 'var(--radius-lg)',
              marginBottom: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <Shield size={16} color="#ec4899" />
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f472b6', textTransform: 'uppercase' }}>
                  Panel Tata Kelola &amp; Kontrol Admin Pusat (Smart Tourism FTI)
                </span>
              </div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#f8fafc' }}>
                Pusat Master Data &amp; Regulasi Tarif Kepulauan Banda
              </h3>
              <p style={{ margin: '0.3rem 0 0', color: '#94a3b8', fontSize: '0.8rem', maxWidth: '750px' }}>
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
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: cmsSubTab === 'accommodations' ? 'linear-gradient(135deg, #10b981, #06b6d4)' : 'rgba(15, 23, 42, 0.8)',
                  color: cmsSubTab === 'accommodations' ? '#ffffff' : '#94a3b8',
                }}
              >
                <Home size={14} /> Penginapan &amp; Tarif ({accommodations.length})
              </button>
              <button
                type="button"
                onClick={() => setCmsSubTab('guides')}
                style={{
                  padding: '0.55rem 0.95rem',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: cmsSubTab === 'guides' ? 'linear-gradient(135deg, #0284c7, #8b5cf6)' : 'rgba(15, 23, 42, 0.8)',
                  color: cmsSubTab === 'guides' ? '#ffffff' : '#94a3b8',
                }}
              >
                <Users size={14} /> Pemandu Wisata ({guides.length})
              </button>
            </div>
          </div>

          {/* SUB-PANEL 1: PENGINAPAN & TARIF */}
          {cmsSubTab === 'accommodations' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#f8fafc' }}>
                    Daftar Homestay, Hotel &amp; Vila Terdaftar
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
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
                    background: 'linear-gradient(135deg, #10b981, #059669)',
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
                      background: 'var(--surface-color)',
                      border: '1px solid var(--border-color)',
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
                        style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#f8fafc' }}>
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
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem', display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                          <span><MapPin size={11} style={{ display: 'inline', verticalAlign: 'middle' }} /> {acc.island_name}</span>
                          <span>•</span>
                          <span>{acc.rooms_available} Kamar Tersedia</span>
                          <span>•</span>
                          <span style={{ color: '#06b6d4' }}>WA: {acc.contact_whatsapp}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.35rem' }}>
                          {acc.has_clean_ro_water && (
                            <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem', background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4', borderRadius: '4px' }}>
                              💧 Air Minum RO
                            </span>
                          )}
                          {acc.has_solar_backup && (
                            <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', borderRadius: '4px' }}>
                              ☀️ PLTS Surya
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Tarif Per Malam:</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#10b981' }}>
                          Rp {acc.price_per_night_rp.toLocaleString()}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleQuickUpdatePrice(acc.id, acc.price_per_night_rp)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#38bdf8',
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
                            border: '1px solid var(--border-color)',
                            background: acc.is_verified ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                            color: acc.is_verified ? '#f59e0b' : '#34d399',
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
                            border: '1px solid var(--border-color)',
                            background: 'rgba(56, 189, 248, 0.12)',
                            color: '#38bdf8',
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
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            background: 'rgba(239, 68, 68, 0.12)',
                            color: '#f87171',
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
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#f8fafc' }}>
                    Daftar Pemandu Wisata &amp; Sertifikasi HPI
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
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
                    background: 'linear-gradient(135deg, #0284c7, #8b5cf6)',
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
                      background: 'var(--surface-color)',
                      border: '1px solid var(--border-color)',
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
                        style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#f8fafc' }}>
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
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem', display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                          <span>Lisensi: <code style={{ color: '#cbd5e1' }}>{guide.license_number}</code></span>
                          <span>•</span>
                          <span style={{ color: '#06b6d4' }}>WA: {guide.phone_whatsapp}</span>
                          <span>•</span>
                          <span>⭐ {guide.rating.toFixed(1)} ({guide.trips_completed} tur)</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#38bdf8', marginTop: '0.25rem' }}>
                          Spesialisasi: {guide.specialties} | Bahasa: {guide.languages}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Tarif Jasa Per Hari:</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#10b981' }}>
                          Rp {guide.fee_per_day_rp.toLocaleString()}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleQuickUpdateGuideFee(guide.id, guide.fee_per_day_rp)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#38bdf8',
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
                            border: '1px solid var(--border-color)',
                            background: guide.is_verified ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                            color: guide.is_verified ? '#f59e0b' : '#34d399',
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
                            border: '1px solid var(--border-color)',
                            background: 'rgba(56, 189, 248, 0.12)',
                            color: '#38bdf8',
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
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            background: 'rgba(239, 68, 68, 0.12)',
                            color: '#f87171',
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
        </div>
      )}

      {/* MODAL: FORM BOOKING & GENERATOR WHATSAPP */}
      {selectedAccForBooking && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
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
              background: '#0d131f',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <span className="badge badge-emerald" style={{ fontSize: '0.68rem', marginBottom: '0.35rem' }}>
                  RESERVASI PENGINAPAN ECO-STAY
                </span>
                <h3 style={{ margin: '0.15rem 0 0', fontSize: '1.25rem', fontWeight: 900, color: '#f8fafc' }}>
                  {selectedAccForBooking.name}
                </h3>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  Tarif: <b>Rp {selectedAccForBooking.price_per_night_rp.toLocaleString()}</b> / malam
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAccForBooking(null)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Error Banner */}
            {bookingError && (
              <div style={{ marginBottom: '1rem', padding: '0.65rem 0.85rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: 'var(--radius-md)', color: '#f87171', fontSize: '0.78rem' }}>
                {bookingError}
              </div>
            )}

            {/* If Confirmed: Show Success & WhatsApp Launch Button */}
            {confirmedBooking ? (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <CheckCircle2 size={48} color="#10b981" style={{ margin: '0 auto 0.75rem' }} />
                <h4 style={{ margin: '0 0 0.35rem', fontSize: '1.2rem', fontWeight: 900, color: '#f8fafc' }}>
                  Pemesanan Berhasil Dicatat!
                </h4>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
                  Kode Reservasi: <b style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{confirmedBooking.booking_code}</b>
                </div>

                <div style={{ padding: '0.85rem', background: 'rgba(15, 23, 42, 0.7)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.3)', marginBottom: '1.5rem', textAlign: 'left', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ color: '#94a3b8' }}>Tamu:</span>
                    <b style={{ color: '#f8fafc' }}>{confirmedBooking.guest_name}</b>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ color: '#94a3b8' }}>Durasi:</span>
                    <b style={{ color: '#06b6d4' }}>{confirmedBooking.total_nights} Malam ({confirmedBooking.rooms_count} Kamar)</b>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '0.35rem' }}>
                    <span style={{ color: '#94a3b8' }}>Total Tagihan:</span>
                    <b style={{ color: '#10b981', fontSize: '1rem' }}>Rp {confirmedBooking.total_price_rp.toLocaleString()}</b>
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
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    textDecoration: 'none',
                    boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)',
                  }}
                >
                  <MessageCircle size={18} /> Kirim Pesan Konfirmasi ke WhatsApp Host
                </a>
              </div>
            ) : (
              /* Booking Form */
              <form onSubmit={handleSubmitBooking} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.35rem' }}>
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
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      color: '#f8fafc',
                      padding: '0.55rem 0.75rem',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.35rem' }}>
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
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      color: '#f8fafc',
                      padding: '0.55rem 0.75rem',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                      Tanggal Check-In:
                    </label>
                    <input
                      type="date"
                      required
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      style={{
                        width: '100%',
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        color: '#f8fafc',
                        padding: '0.5rem 0.65rem',
                        fontSize: '0.8rem',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                      Tanggal Check-Out:
                    </label>
                    <input
                      type="date"
                      required
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      style={{
                        width: '100%',
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        color: '#f8fafc',
                        padding: '0.5rem 0.65rem',
                        fontSize: '0.8rem',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.35rem' }}>
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
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      color: '#f8fafc',
                      padding: '0.55rem 0.75rem',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                    Catatan Tambahan (Opsional):
                  </label>
                  <input
                    type="text"
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    placeholder="Contoh: Jemputan kapal speedboat di pelabuhan Neira"
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

                <button
                  type="submit"
                  disabled={submittingBooking}
                  className="btn btn-primary"
                  style={{
                    padding: '0.8rem',
                    fontSize: '0.875rem',
                    fontWeight: 800,
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #10b981, #06b6d4)',
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
      {showAccModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
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
              background: '#0d131f',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              maxHeight: '92vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <span className="badge badge-emerald" style={{ fontSize: '0.68rem', marginBottom: '0.35rem' }}>
                  CMS PENGINAPAN &amp; TARIF
                </span>
                <h3 style={{ margin: '0.15rem 0 0', fontSize: '1.25rem', fontWeight: 900, color: '#f8fafc' }}>
                  {editingAccId ? 'Edit Listing Penginapan & Tarif' : 'Tambah Penginapan Baru'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAccModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveAccommodation} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.35rem' }}>
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
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    color: '#f8fafc',
                    padding: '0.55rem 0.75rem',
                    fontSize: '0.85rem',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                    Tipe Properti:
                  </label>
                  <select
                    value={accForm.type}
                    onChange={(e) => setAccForm({ ...accForm, type: e.target.value })}
                    style={{
                      width: '100%',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      color: '#f8fafc',
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
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                    Wilayah Pulau:
                  </label>
                  <select
                    value={accForm.island_name}
                    onChange={(e) => setAccForm({ ...accForm, island_name: e.target.value })}
                    style={{
                      width: '100%',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      color: '#f8fafc',
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
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.35rem' }}>
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
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      color: '#f8fafc',
                      padding: '0.55rem 0.75rem',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.35rem' }}>
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
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      color: '#f8fafc',
                      padding: '0.55rem 0.75rem',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.35rem' }}>
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
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      color: '#f8fafc',
                      padding: '0.55rem 0.75rem',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                    URL Foto Penginapan:
                  </label>
                  <input
                    type="text"
                    value={accForm.photo_url || ''}
                    onChange={(e) => setAccForm({ ...accForm, photo_url: e.target.value })}
                    placeholder="https://..."
                    style={{
                      width: '100%',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      color: '#f8fafc',
                      padding: '0.55rem 0.75rem',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.35rem' }}>
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
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    color: '#f8fafc',
                    padding: '0.55rem 0.75rem',
                    fontSize: '0.85rem',
                  }}
                />
              </div>

              {/* Eco Features Checkboxes */}
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10b981', display: 'block', marginBottom: '0.5rem' }}>
                  Fitur Mandat Smart Eco-Stay:
                </span>
                <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#cbd5e1', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={accForm.has_clean_ro_water}
                      onChange={(e) => setAccForm({ ...accForm, has_clean_ro_water: e.target.checked })}
                    />
                    💧 Air Minum RO Mandiri
                  </label>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#cbd5e1', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={accForm.has_solar_backup}
                      onChange={(e) => setAccForm({ ...accForm, has_solar_backup: e.target.checked })}
                    />
                    ☀️ Bauran Surya PLTS
                  </label>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#cbd5e1', cursor: 'pointer' }}>
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
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                  Deskripsi / Daya Tarik Homestay:
                </label>
                <textarea
                  rows={2}
                  value={accForm.description || ''}
                  onChange={(e) => setAccForm({ ...accForm, description: e.target.value })}
                  placeholder="Keterangan fasilitas, jarak ke benteng, dan view Gunung Api Banda..."
                  style={{
                    width: '100%',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    color: '#f8fafc',
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
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'transparent',
                    color: '#94a3b8',
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
                    background: 'linear-gradient(135deg, #10b981, #06b6d4)',
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
      {showGuideModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
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
              background: '#0d131f',
              border: '1px solid rgba(2, 132, 199, 0.4)',
              maxHeight: '92vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <span className="badge badge-blue" style={{ fontSize: '0.68rem', marginBottom: '0.35rem' }}>
                  CMS PEMANDU WISATA &amp; JASA
                </span>
                <h3 style={{ margin: '0.15rem 0 0', fontSize: '1.25rem', fontWeight: 900, color: '#f8fafc' }}>
                  {editingGuideId ? 'Edit Pemandu Wisata' : 'Daftarkan Pemandu Baru'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveTourGuide} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.35rem' }}>
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
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    color: '#f8fafc',
                    padding: '0.55rem 0.75rem',
                    fontSize: '0.85rem',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.35rem' }}>
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
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      color: '#f8fafc',
                      padding: '0.55rem 0.75rem',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                    Basis Wilayah / Pulau:
                  </label>
                  <select
                    value={guideForm.island_base}
                    onChange={(e) => setGuideForm({ ...guideForm, island_base: e.target.value })}
                    style={{
                      width: '100%',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      color: '#f8fafc',
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
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.35rem' }}>
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
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      color: '#f8fafc',
                      padding: '0.55rem 0.75rem',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.35rem' }}>
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
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      color: '#f8fafc',
                      padding: '0.55rem 0.75rem',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.35rem' }}>
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
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      color: '#f8fafc',
                      padding: '0.55rem 0.75rem',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.35rem' }}>
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
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      color: '#f8fafc',
                      padding: '0.55rem 0.75rem',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                  URL Foto Profil:
                </label>
                <input
                  type="text"
                  value={guideForm.photo_url || ''}
                  onChange={(e) => setGuideForm({ ...guideForm, photo_url: e.target.value })}
                  placeholder="https://..."
                  style={{
                    width: '100%',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    color: '#f8fafc',
                    padding: '0.55rem 0.75rem',
                    fontSize: '0.85rem',
                  }}
                />
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', gap: '1.25rem' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#cbd5e1', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={guideForm.is_verified}
                    onChange={(e) => setGuideForm({ ...guideForm, is_verified: e.target.checked })}
                  />
                  ✓ Lisensi Terverifikasi HPI Banda
                </label>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#cbd5e1', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={guideForm.is_active}
                    onChange={(e) => setGuideForm({ ...guideForm, is_active: e.target.checked })}
                  />
                  🟢 Status Aktif (Siap Menerima Tur)
                </label>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                  Biografi / Pengalaman Pemandu:
                </label>
                <textarea
                  rows={2}
                  value={guideForm.bio || ''}
                  onChange={(e) => setGuideForm({ ...guideForm, bio: e.target.value })}
                  placeholder="Ceritakan latar belakang, sertifikasi diving/sejarah, dll..."
                  style={{
                    width: '100%',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    color: '#f8fafc',
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
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'transparent',
                    color: '#94a3b8',
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
                    background: 'linear-gradient(135deg, #0284c7, #8b5cf6)',
                  }}
                >
                  {editingGuideId ? 'Perbarui Pemandu' : 'Daftarkan Pemandu Wisata'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
