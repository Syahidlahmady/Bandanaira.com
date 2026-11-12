export interface AccommodationItem {
  id: string
  name: string
  type: string
  island_name: string
  address: string
  price_per_night_rp: number
  rooms_available: number
  has_clean_ro_water: boolean
  has_solar_backup: boolean
  eco_stay_badge: boolean
  contact_whatsapp: string
  description: string
  photo_url?: string | null
  is_verified: boolean
  created_at: string
}

export interface BookingCreateInput {
  accommodation_id: string
  guest_name: string
  guest_whatsapp: string
  guest_email?: string
  check_in: string
  check_out: string
  rooms_count: number
  notes?: string
}

export interface BookingItem {
  id: string
  booking_code: string
  accommodation_id: string
  accommodation_name: string
  guest_name: string
  guest_whatsapp: string
  check_in: string
  check_out: string
  total_nights: number
  rooms_count: number
  total_price_rp: number
  status: string
  wa_link: string
  notes?: string | null
  created_at: string
}

export interface HeritageCatalogItem {
  slug: string
  title: string
  category: string
  island: string
  historical_period: string
  narrative: string
  audio_guide_url: string
  coordinates: [number, number]
  photo_url: string
}

const getApiBase = () => {
  return typeof window !== 'undefined'
    ? `http://${window.location.hostname}:8005/api/v1`
    : 'http://localhost:8005/api/v1'
}

export const tourismService = {
  async listAccommodations(params?: {
    island?: string
    type?: string
    max_price?: number
    has_ro_water?: boolean
    has_solar?: boolean
  }): Promise<AccommodationItem[]> {
    const q = new URLSearchParams()
    if (params?.island) q.append('island', params.island)
    if (params?.type) q.append('type', params.type)
    if (params?.max_price) q.append('max_price', params.max_price.toString())
    if (params?.has_ro_water !== undefined) q.append('has_ro_water', String(params.has_ro_water))
    if (params?.has_solar !== undefined) q.append('has_solar', String(params.has_solar))

    const res = await fetch(`${getApiBase()}/tourism/accommodations?${q.toString()}`)
    if (!res.ok) throw new Error(`Gagal memuat katalog penginapan: ${res.statusText}`)
    return res.json()
  },

  async createBooking(payload: BookingCreateInput): Promise<BookingItem> {
    const res = await fetch(`${getApiBase()}/tourism/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }))
      throw new Error(err.detail || 'Gagal membuat reservasi penginapan.')
    }
    return res.json()
  },

  async getBooking(bookingCode: string): Promise<BookingItem> {
    const res = await fetch(`${getApiBase()}/tourism/bookings/${bookingCode}`)
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }))
      throw new Error(err.detail || 'Kode reservasi tidak ditemukan.')
    }
    return res.json()
  },

  async listHeritage(params?: { category?: string; island?: string }): Promise<HeritageCatalogItem[]> {
    const q = new URLSearchParams()
    if (params?.category) q.append('category', params.category)
    if (params?.island) q.append('island', params.island)

    const res = await fetch(`${getApiBase()}/tourism/heritage-catalog?${q.toString()}`)
    if (!res.ok) throw new Error('Gagal memuat katalog cagar budaya.')
    return res.json()
  },

  async listBookings(accommodationId?: string): Promise<BookingItem[]> {
    const q = new URLSearchParams()
    if (accommodationId) q.append('accommodation_id', accommodationId)

    const res = await fetch(`${getApiBase()}/tourism/bookings?${q.toString()}`)
    if (!res.ok) throw new Error('Gagal memuat riwayat reservasi.')
    return res.json()
  },
}

