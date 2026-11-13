import React, { useEffect, useMemo, useState } from 'react'
import { tourismService, AccommodationItem } from '../../services/tourism'
import { ArrowUpRightIcon } from './LandingIcons'

export const FALLBACK_ACCOMMODATIONS: AccommodationItem[] = [
  {
    id: 'acc-1',
    name: 'Cilu Bintang Estate Heritage Stay',
    type: 'BOUTIQUE ECO-HOTEL',
    island_name: 'Pulau Neira',
    address: 'Jl. Benteng Belgica, Desa Nusantara, Banda Neira',
    price_per_night_rp: 650000,
    rooms_available: 6,
    has_clean_ro_water: true,
    has_solar_backup: true,
    eco_stay_badge: true,
    contact_whatsapp: '6281234567801',
    description:
      'Penginapan bergaya kolonial Hindia dengan pemandangan langsung ke Benteng Belgica, dilengkapi suplai Air Bersih RO dan panel surya.',
    photo_url:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=85',
    is_verified: true,
    created_at: '2026-01-10T00:00:00Z',
  },
  {
    id: 'acc-2',
    name: 'The Nutmeg Tree Homestay Banda',
    type: 'HOMESTAY WARGA',
    island_name: 'Pulau Neira',
    address: 'Kampung Baru, Banda Neira',
    price_per_night_rp: 350000,
    rooms_available: 4,
    has_clean_ro_water: true,
    has_solar_backup: true,
    eco_stay_badge: true,
    contact_whatsapp: '6281234567802',
    description:
      'Homestay keluarga di bawah rindangnya pohon pala dan kenari, sarapan kuliner lokal kue kenari dan ikan asar segar.',
    photo_url:
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=900&q=85',
    is_verified: true,
    created_at: '2026-01-12T00:00:00Z',
  },
  {
    id: 'acc-3',
    name: 'Baba Lagoon Waterfront Eco-Lodge',
    type: 'ECO-LODGE',
    island_name: 'Pulau Neira',
    address: 'Tepi Teluk Tanah Rata, Banda Neira',
    price_per_night_rp: 520000,
    rooms_available: 5,
    has_clean_ro_water: true,
    has_solar_backup: true,
    eco_stay_badge: true,
    contact_whatsapp: '6281234567803',
    description:
      'Bungalow kayu di tepi perairan tenang menghadap Gunung Banda Api dengan dermaga pribadi untuk perahu snorkeling.',
    photo_url:
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=900&q=85',
    is_verified: true,
    created_at: '2026-01-15T00:00:00Z',
  },
  {
    id: 'acc-4',
    name: 'Hatta Coral Reef Bungalows',
    type: 'BEACH BUNGALOW',
    island_name: 'Pulau Hatta',
    address: 'Pesisir Barat Pulau Hatta, Kepulauan Banda',
    price_per_night_rp: 300000,
    rooms_available: 7,
    has_clean_ro_water: true,
    has_solar_backup: true,
    eco_stay_badge: true,
    contact_whatsapp: '6281234567804',
    description:
      'Bungalow tepi pantai berpasir putih hanya 10 langkah dari titik snorkeling drop-off terumbu karang Pulau Hatta.',
    photo_url:
      'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=900&q=85',
    is_verified: true,
    created_at: '2026-01-18T00:00:00Z',
  },
  {
    id: 'acc-5',
    name: 'Ai Island Spice Garden Cottage',
    type: 'HOMESTAY WARGA',
    island_name: 'Pulau Ai',
    address: 'Desa Ai, Dekat Benteng Revenge, Pulau Ai',
    price_per_night_rp: 280000,
    rooms_available: 4,
    has_clean_ro_water: true,
    has_solar_backup: false,
    eco_stay_badge: true,
    contact_whatsapp: '6281234567805',
    description:
      'Penginapan asri milik komunitas petani pala Pulau Ai dengan suasana kampung rempah yang tenang dan autentik.',
    photo_url:
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=900&q=85',
    is_verified: true,
    created_at: '2026-01-20T00:00:00Z',
  },
  {
    id: 'acc-6',
    name: 'Lonthoir Nutmeg Ridge Guest House',
    type: 'HOMESTAY WARGA',
    island_name: 'Banda Besar',
    address: 'Desa Lonthoir, Pulau Banda Besar',
    price_per_night_rp: 320000,
    rooms_available: 3,
    has_clean_ro_water: true,
    has_solar_backup: true,
    eco_stay_badge: true,
    contact_whatsapp: '6281234567806',
    description:
      'Singgah di tengah sentra perkebunan pala tertua Banda Besar dengan tur langsung pengeringan pala dan fuli bersama warga.',
    photo_url:
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=85',
    is_verified: true,
    created_at: '2026-01-22T00:00:00Z',
  },
]

export interface EcoStayCatalogSectionProps {
  onNavigate: (tab: any) => void
  onOpenLogin: () => void
  onOpenQuickLogin?: () => void
}

export const EcoStayCatalogSection: React.FC<EcoStayCatalogSectionProps> = ({
  onNavigate,
  onOpenLogin,
  onOpenQuickLogin,
}) => {
  const [accommodationsList, setAccommodationsList] = useState<AccommodationItem[]>(FALLBACK_ACCOMMODATIONS)
  const [stayIslandFilter, setStayIslandFilter] = useState<string>('SEMUA')
  const [stayRoFilter, setStayRoFilter] = useState<boolean>(false)
  const [staySolarFilter, setStaySolarFilter] = useState<boolean>(false)
  const [bookingModalAcc, setBookingModalAcc] = useState<AccommodationItem | null>(null)
  const [bookingGuestName, setBookingGuestName] = useState<string>('')
  const [bookingGuestPhone, setBookingGuestPhone] = useState<string>('')
  const [bookingCheckIn, setBookingCheckIn] = useState<string>(
    new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
  )
  const [bookingNights, setBookingNights] = useState<number>(2)
  const [bookingRooms, setBookingRooms] = useState<number>(1)

  useEffect(() => {
    let isMounted = true
    tourismService
      .listAccommodations()
      .then((data) => {
        if (isMounted && data && data.length > 0) {
          setAccommodationsList(data)
        }
      })
      .catch(() => {
        // Fallback to initial
      })
    return () => {
      isMounted = false
    }
  }, [])

  const filteredAccommodations = useMemo(() => {
    return accommodationsList.filter((acc) => {
      const matchIsland = stayIslandFilter === 'SEMUA' || acc.island_name === stayIslandFilter
      const matchRo = !stayRoFilter || acc.has_clean_ro_water
      const matchSolar = !staySolarFilter || acc.has_solar_backup
      return matchIsland && matchRo && matchSolar
    })
  }, [accommodationsList, stayIslandFilter, stayRoFilter, staySolarFilter])

  return (
    <section
      id="eco-stay"
      aria-labelledby="island-stays-heading"
      className="flex flex-col items-start gap-10 pt-4 pb-24 px-6 sm:px-12 lg:px-20 relative self-stretch w-full flex-[0_0_auto] bg-[#f7f5f0]"
    >
      <header className="flex w-full flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="flex flex-col items-start gap-3 max-w-[720px]">
          <div className="inline-flex items-center gap-2.5">
            <div aria-hidden="true" className="w-6 h-px bg-amber-600" />
            <span className="font-semibold text-amber-600 text-[11px] tracking-[1.80px] uppercase">
              DIREKTORI PENGINAPAN &amp; ECO-STAY
            </span>
          </div>
          <h2
            id="island-stays-heading"
            className="font-medium text-[#0f2c59] text-[36px] sm:text-[50px] tracking-[-2.00px] leading-[1.12]"
          >
            Singgah Lebih Dekat.
            <br />
            Penginapan Berkelanjutan Banda.
          </h2>
          <p className="text-[#63717d] text-base leading-relaxed">
            Daftar homestay warga, beach bungalow, dan eco-lodge ramah lingkungan yang dilengkapi pasokan
            <b> Air Bersih Reverse Osmosis (RO)</b> dan <b>Cadangan Listrik Tenaga Surya</b>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('tourism')}
            className="inline-flex h-[46px] items-center gap-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg px-5 py-0 text-xs font-semibold transition-colors"
          >
            <span>Semua Penginapan di Portal</span>
            <ArrowUpRightIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onOpenQuickLogin || onOpenLogin}
            className="inline-flex h-[46px] items-center gap-2 border border-[#dce1df] hover:bg-white text-[#0f2c59] rounded-lg px-4 py-0 text-xs font-medium transition-colors"
          >
            <span>Masuk Mitra Homestay</span>
          </button>
        </div>
      </header>

      {/* Filter Bar Penginapan */}
      <div className="w-full flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-white border border-[#dce1df] shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-[#0f2c59] mr-2">Pulau:</span>
          {['SEMUA', 'Pulau Neira', 'Pulau Hatta', 'Banda Besar', 'Pulau Ai'].map((isl) => (
            <button
              key={isl}
              type="button"
              onClick={() => setStayIslandFilter(isl)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                stayIslandFilter === isl
                  ? 'bg-[#0f2c59] text-white'
                  : 'bg-[#f7f5f0] text-[#63717d] hover:text-[#0f2c59]'
              }`}
            >
              {isl}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 text-xs font-medium text-[#0f2c59] cursor-pointer">
            <input
              type="checkbox"
              checked={stayRoFilter}
              onChange={(e) => setStayRoFilter(e.target.checked)}
              className="rounded accent-amber-600"
            />
            <span>Air Bersih RO Tersedia</span>
          </label>
          <label className="inline-flex items-center gap-2 text-xs font-medium text-[#0f2c59] cursor-pointer">
            <input
              type="checkbox"
              checked={staySolarFilter}
              onChange={(e) => setStaySolarFilter(e.target.checked)}
              className="rounded accent-amber-600"
            />
            <span>Listrik Tenaga Surya</span>
          </label>
        </div>
      </div>

      {/* Grid Katalog Penginapan */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {filteredAccommodations.map((acc) => (
          <article
            key={acc.id}
            className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-[#dce1df] shadow-sm hover:shadow-md transition-all"
          >
            <div className="h-56 w-full relative overflow-hidden bg-slate-200">
              <img
                src={acc.photo_url || 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=900&q=85'}
                alt={acc.name}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#081d35cc] via-transparent to-transparent" />
              
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-emerald-600/90 text-white text-[10px] font-bold shadow">
                ECO-STAY
              </div>
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#081d35]/80 text-white text-[10px] font-medium">
                {acc.island_name}
              </div>

              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                <div>
                  <span className="text-lg font-bold text-amber-300">
                    Rp {acc.price_per_night_rp.toLocaleString('id-ID')}
                  </span>
                  <span className="text-[11px] opacity-80"> / malam</span>
                </div>
                <span className="text-xs bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded text-white font-medium">
                  {acc.rooms_available} Kamar Tersedia
                </span>
              </div>
            </div>

            <div className="p-6 flex flex-col flex-1 justify-between gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-semibold text-amber-700 uppercase">
                  {acc.type}
                </span>
                <h3 className="text-lg font-bold text-[#0f2c59] leading-tight">
                  {acc.name}
                </h3>
                <p className="text-xs text-[#63717d] leading-relaxed line-clamp-2">
                  {acc.description}
                </p>
                <p className="text-[11px] text-slate-400 font-mono">
                  {acc.address}
                </p>

                {/* Badges Eco */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {acc.has_clean_ro_water && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200 font-medium">
                      Air Minum RO
                    </span>
                  )}
                  {acc.has_solar_backup && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-medium">
                      Listrik Surya
                    </span>
                  )}
                  {acc.is_verified && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                      ✓ Terverifikasi Desa
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-[#dce1df] flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setBookingModalAcc(acc)}
                  className="flex-1 py-2.5 px-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold text-center transition-colors"
                >
                  Pesan Kamar Sekarang
                </button>
                <a
                  href={`https://wa.me/${acc.contact_whatsapp}?text=${encodeURIComponent(
                    `Halo Pengelola ${acc.name}, saya menemukan homestay Anda di bandanaira.com. Apakah kamar tersedia untuk tanggal yang akan datang?`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 bg-[#0f2c59] hover:bg-[#1a4175] text-white rounded-lg text-xs font-semibold transition-colors"
                  title="Chat Langsung via WhatsApp"
                >
                  💬 WA
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Modal Booking Eco-Stay */}
      {bookingModalAcc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#dce1df] flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-amber-600 uppercase">Reservasi Penginapan</span>
                <h3 className="text-lg font-bold text-[#0f2c59]">{bookingModalAcc.name}</h3>
                <p className="text-xs text-[#63717d]">{bookingModalAcc.island_name} · Rp {bookingModalAcc.price_per_night_rp.toLocaleString('id-ID')} / malam</p>
              </div>
              <button
                type="button"
                onClick={() => setBookingModalAcc(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div>
                <label className="font-semibold text-[#0f2c59] block mb-1">Nama Tamu / Wisatawan</label>
                <input
                  type="text"
                  value={bookingGuestName}
                  onChange={(e) => setBookingGuestName(e.target.value)}
                  placeholder="Contoh: Rian Pratama"
                  className="w-full p-2.5 rounded-lg border border-[#dce1df] bg-[#f7f5f0] text-[#0f2c59]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#0f2c59] block mb-1">Nomor Kontak WhatsApp</label>
                <input
                  type="text"
                  value={bookingGuestPhone}
                  onChange={(e) => setBookingGuestPhone(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full p-2.5 rounded-lg border border-[#dce1df] bg-[#f7f5f0] text-[#0f2c59]"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div className="col-span-1">
                  <label className="font-semibold text-[#0f2c59] block mb-1">Check-In</label>
                  <input
                    type="date"
                    value={bookingCheckIn}
                    onChange={(e) => setBookingCheckIn(e.target.value)}
                    className="w-full p-2 rounded-lg border border-[#dce1df] bg-[#f7f5f0] text-[#0f2c59] text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#0f2c59] block mb-1">Malam</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={bookingNights}
                    onChange={(e) => setBookingNights(parseInt(e.target.value) || 1)}
                    className="w-full p-2 rounded-lg border border-[#dce1df] bg-[#f7f5f0] text-[#0f2c59] text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#0f2c59] block mb-1">Kamar</label>
                  <input
                    type="number"
                    min="1"
                    max={bookingModalAcc.rooms_available || 5}
                    value={bookingRooms}
                    onChange={(e) => setBookingRooms(parseInt(e.target.value) || 1)}
                    className="w-full p-2 rounded-lg border border-[#dce1df] bg-[#f7f5f0] text-[#0f2c59] text-xs"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 flex justify-between items-center">
                <span>Estimasi Total ({bookingNights} malam):</span>
                <span className="font-bold text-sm">
                  Rp {(bookingModalAcc.price_per_night_rp * bookingNights * bookingRooms).toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setBookingModalAcc(null)}
                className="flex-1 py-2.5 rounded-lg border border-[#dce1df] text-xs font-semibold text-[#63717d] hover:bg-slate-50"
              >
                Batal
              </button>
              <a
                href={`https://wa.me/${bookingModalAcc.contact_whatsapp}?text=${encodeURIComponent(
                  `Halo Pengelola ${bookingModalAcc.name},\nSaya ${bookingGuestName || 'Tamu'} (WA: ${bookingGuestPhone || '-'})\ningin memesan penginapan:\n- Check-In: ${bookingCheckIn}\n- Durasi: ${bookingNights} Malam\n- Estimasi Total: Rp ${(bookingModalAcc.price_per_night_rp * bookingNights * bookingRooms).toLocaleString('id-ID')}\n\nApakah ketersediaan kamar pada tanggal tersebut dapat dikonfirmasi? Terima kasih!`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setBookingModalAcc(null)}
                className="flex-1 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold text-center shadow"
              >
                Kirim Reservasi WhatsApp &rarr;
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default EcoStayCatalogSection
