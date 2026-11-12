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
} from 'lucide-react'
import {
  tourismService,
  AccommodationItem,
  BookingItem,
  HeritageCatalogItem,
} from '../services/tourism'

export interface TourismEcoStayWorkspaceProps {
  currentUser?: any
}

export const TourismEcoStayWorkspace: React.FC<TourismEcoStayWorkspaceProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'accommodations' | 'heritage' | 'lookup' | 'bookings'>('accommodations')

  // Accommodations State
  const [accommodations, setAccommodations] = useState<AccommodationItem[]>([])
  const [loadingAccs, setLoadingAccs] = useState<boolean>(true)
  const [islandFilter, setIslandFilter] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [filterRoOnly, setFilterRoOnly] = useState<boolean>(false)
  const [filterSolarOnly, setFilterSolarOnly] = useState<boolean>(false)

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
  }, [islandFilter, typeFilter, filterRoOnly, filterSolarOnly, heritageCategory])

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
    </div>
  )
}
