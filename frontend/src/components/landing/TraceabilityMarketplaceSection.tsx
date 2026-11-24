import React, { useState, useRef, useEffect } from 'react'
import { ArrowUpRightIcon } from './LandingIcons'
import { useLanguage } from '../../context/LanguageContext'
import {
  MapPin,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  QrCode,
  Tag,
  Store,
} from 'lucide-react'

export interface MarketplaceProductItem {
  id: string
  name: string
  category: 'REMPAH PUSAKA' | 'OLAHAN REMPAH' | 'HASIL LAUT' | 'HERBAL & MINYAK'
  categoryLabel: string
  priceRp: number
  unit: string
  originDesa: string
  islandName: string
  batchCode: string
  producerName: string
  photoUrl: string
}

export const FEATURED_MARKETPLACE_PRODUCTS: MarketplaceProductItem[] = [
  {
    id: 'prod-1',
    name: 'Biji Pala Lonthoir Organik Grade A',
    category: 'REMPAH PUSAKA',
    categoryLabel: 'PALA SUPER GRADE A',
    priceRp: 125000,
    unit: 'kg',
    originDesa: 'Desa Adat Lonthoir',
    islandName: 'Banda Besar',
    batchCode: 'BN-PALA-LONTHOIR-01',
    producerName: 'Kelompok Tani Pala Pusaka',
    photoUrl:
      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'prod-2',
    name: 'Fuli Pala Merah Kering Utuh',
    category: 'REMPAH PUSAKA',
    categoryLabel: 'FULI MERAH MURNI',
    priceRp: 240000,
    unit: '500g',
    originDesa: 'Desa Selamon',
    islandName: 'Banda Besar',
    batchCode: 'BN-FULI-SELAMON-03',
    producerName: 'Koperasi Kebun Selamon',
    photoUrl:
      'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'prod-3',
    name: 'Sirup Sari Buah Pala Segar Neira',
    category: 'OLAHAN REMPAH',
    categoryLabel: 'MINUMAN KHAS BANDA',
    priceRp: 35000,
    unit: 'botol (600ml)',
    originDesa: 'Desa Nusantara',
    islandName: 'Pulau Neira',
    batchCode: 'BN-SIRUP-NEIRA-02',
    producerName: 'UMKM Ibu Pala Berkarya',
    photoUrl:
      'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'prod-4',
    name: 'Ikan Asar Cakalang Asap Tempurung Pala',
    category: 'HASIL LAUT',
    categoryLabel: 'KULINER KHAS LAUT',
    priceRp: 65000,
    unit: 'ekor',
    originDesa: 'Kampung Lama',
    islandName: 'Pulau Hatta',
    batchCode: 'BN-ASAR-HATTA-01',
    producerName: 'Kelompok Nelayan Karang Hatta',
    photoUrl:
      'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'prod-5',
    name: 'Halwa Kenari & Manisan Buah Pala',
    category: 'OLAHAN REMPAH',
    categoryLabel: 'KUDAPAN TRADISIONAL',
    priceRp: 45000,
    unit: 'toples (300g)',
    originDesa: 'Kampung Baru',
    islandName: 'Pulau Neira',
    batchCode: 'BN-HALWA-NEIRA-04',
    producerName: 'Dapur Warisan Bunda',
    photoUrl:
      'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'prod-6',
    name: 'Minyak Atsiri Biji Pala Murni (Essential Oil)',
    category: 'HERBAL & MINYAK',
    categoryLabel: 'MINYAK ATSIRI ALAMI',
    priceRp: 95000,
    unit: 'botol (30ml)',
    originDesa: 'Desa Pesisir Ai',
    islandName: 'Pulau Ai',
    batchCode: 'BN-ATSIRI-AI-02',
    producerName: 'Penyulingan Atsiri Rempah Ai',
    photoUrl:
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80',
  },
]

export interface TraceabilityMarketplaceSectionProps {
  onNavigate: (tab: any) => void
  onOpenMarketplace: () => void
  onPublicVerify: (token: string) => void
}

export const TraceabilityMarketplaceSection: React.FC<TraceabilityMarketplaceSectionProps> = ({
  onOpenMarketplace,
  onPublicVerify,
}) => {
  const { t } = useLanguage()
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'REMPAH' | 'OLAHAN' | 'LAUT'>('ALL')
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const filterOptions = [
    { key: 'ALL', label: 'Semua Produk', count: FEATURED_MARKETPLACE_PRODUCTS.length },
    { key: 'REMPAH', label: 'Rempah Pala & Fuli', count: 3 },
    { key: 'OLAHAN', label: 'Olahan & Kuliner', count: 2 },
    { key: 'LAUT', label: 'Hasil Laut Nelayan', count: 1 },
  ] as const

  const filteredProducts = FEATURED_MARKETPLACE_PRODUCTS.filter((item) => {
    if (selectedFilter === 'ALL') return true
    if (selectedFilter === 'REMPAH') return item.category === 'REMPAH PUSAKA' || item.category === 'HERBAL & MINYAK'
    if (selectedFilter === 'OLAHAN') return item.category === 'OLAHAN REMPAH'
    if (selectedFilter === 'LAUT') return item.category === 'HASIL LAUT'
    return true
  })

  const checkScrollButtons = () => {
    const el = scrollContainerRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 20)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 20)
  }

  useEffect(() => {
    const el = scrollContainerRef.current
    if (!el) return
    checkScrollButtons()
    el.addEventListener('scroll', checkScrollButtons)
    window.addEventListener('resize', checkScrollButtons)
    return () => {
      el.removeEventListener('scroll', checkScrollButtons)
      window.removeEventListener('resize', checkScrollButtons)
    }
  }, [filteredProducts])

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current
    if (!el) return
    const card = el.querySelector('div')
    const scrollAmount = card ? (card.clientWidth + 20) * (direction === 'left' ? -1 : 1) : 320 * (direction === 'left' ? -1 : 1)
    el.scrollBy({ left: scrollAmount, behavior: 'smooth' })
  }

  return (
    <section
      id="layanan-umkm"
      aria-labelledby="local-cuisine-heading"
      className="relative w-full py-12 sm:py-16 lg:py-20 px-4 sm:px-8 lg:px-16 bg-[#f7f5f0] text-slate-900 border-t border-slate-200/80 scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Row: Judul di Kiri, Aksi & Panah Navigasi di Kanan */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6 mb-5 sm:mb-8">
          <div>
            <div className="inline-flex items-center gap-2 mb-2 sm:mb-3">
              <span className="w-5 h-px bg-amber-600" />
              <p className="font-sans text-[11px] font-bold tracking-[0.2em] text-amber-600 uppercase">
                {t.traceability.tagline}
              </p>
            </div>

            <h2
              id="local-cuisine-heading"
              className="font-sans font-bold text-2xl sm:text-4xl lg:text-[42px] leading-tight tracking-tight text-[#0f2c59]"
            >
              {t.traceability.headingPrefix}{' '}
              <span className="font-script text-amber-600 font-normal text-3xl sm:text-5xl lg:text-[50px] inline-block tracking-normal ml-1">
                {t.traceability.headingScript}
              </span>{' '}
              {t.traceability.headingSuffix}
            </h2>
            <p className="font-sans text-xs sm:text-base text-slate-600 max-w-xl mt-1.5 sm:mt-2 leading-relaxed">
              {t.traceability.description}
            </p>
          </div>

          {/* Baris Kontrol Aksi & Panah Carousel: Tertata Rapi di Mobile */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t border-slate-200/60 sm:border-0">
            {/* Baris Panah & Verifikasi QR di Mobile */}
            <div className="flex items-center justify-between sm:justify-start gap-2">
              {/* Tombol Panah Paginasi Berdimensi 44x44px */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => scroll('left')}
                  disabled={!canScrollLeft}
                  aria-label={t.ecoStay.prev}
                  className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all duration-200 ${
                    canScrollLeft
                      ? 'border-slate-300 text-slate-800 hover:border-[#0f2c59] hover:bg-[#0f2c59] hover:text-white cursor-pointer shadow-xs active:scale-90'
                      : 'border-slate-200 text-slate-300 cursor-not-allowed opacity-40'
                  }`}
                >
                  <ChevronLeft size={18} />
                </button>

                <button
                  type="button"
                  onClick={() => scroll('right')}
                  disabled={!canScrollRight}
                  aria-label={t.ecoStay.next}
                  className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all duration-200 ${
                    canScrollRight
                      ? 'border-slate-300 text-slate-800 hover:border-[#0f2c59] hover:bg-[#0f2c59] hover:text-white cursor-pointer shadow-xs active:scale-90'
                      : 'border-slate-200 text-slate-300 cursor-not-allowed opacity-40'
                  }`}
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              {/* Tombol Cek Keaslian Batch QR */}
              <button
                type="button"
                onClick={() => onPublicVerify('BN_VERIFY_PALA_SUPER_2026_LONTHOIR')}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-full border border-slate-300 bg-white hover:bg-amber-50 text-slate-700 text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer shadow-2xs active:scale-95"
              >
                <QrCode size={15} className="text-amber-600" />
                <span>{t.traceability.checkQrBatch}</span>
              </button>
            </div>

            {/* Tombol Utama Buka Marketplace */}
            <button
              type="button"
              id="btn-marketplace-selengkapnya"
              data-scroll-anchor="btn-marketplace-selengkapnya"
              onClick={onOpenMarketplace}
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-[#0f2c59] text-white hover:bg-[#183d75] text-xs font-semibold tracking-wide transition-all duration-200 shadow-xs group cursor-pointer active:scale-95"
            >
              <Store size={15} />
              <span>{t.traceability.viewMore}</span>
              <ArrowUpRightIcon className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>
        </div>

        {/* Filter Kategori Pil (Bisa Digeser Horisontal di Mobile Tanpa Bar) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-5 sm:mb-6 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          {filterOptions.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => {
                setSelectedFilter(opt.key)
                scrollContainerRef.current?.scrollTo({ left: 0, behavior: 'smooth' })
              }}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer active:scale-95 shrink-0 ${
                selectedFilter === opt.key
                  ? 'bg-[#0f2c59] text-white shadow-sm font-bold'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              <span>{opt.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedFilter === opt.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {opt.count}
              </span>
            </button>
          ))}
        </div>

        {/* Carousel Kartu Produk UMKM */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto pb-6 scroll-smooth snap-x snap-mandatory scrollbar-none -mx-4 px-4 sm:-mx-8 sm:px-8 lg:-mx-16 lg:px-16"
        >
          {filteredProducts.map((prod) => {
            const formattedPrice = new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              maximumFractionDigits: 0,
            }).format(prod.priceRp)

            return (
              <div
                key={prod.id}
                className="group relative shrink-0 w-[80vw] max-w-[330px] sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)] min-w-[250px] snap-center sm:snap-start flex flex-col rounded-2xl sm:rounded-[2rem] overflow-hidden bg-slate-900 aspect-[3/4] shadow-md hover:shadow-2xl transition-all duration-300 select-none"
              >
                {/* Foto Produk */}
                <img
                  src={prod.photoUrl}
                  alt={prod.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                />

                {/* Scrim Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a1626]/95 via-[#0a1626]/50 to-black/25" />

                {/* Badge Melayang Atas: Kategori & Terverifikasi Blockchain */}
                <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10 pointer-events-none">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-950/70 backdrop-blur-md border border-white/20 text-[10px] sm:text-[11px] font-semibold text-white">
                    <Tag size={11} className="text-amber-400" />
                    <span className="truncate max-w-[130px]">{prod.categoryLabel}</span>
                  </span>

                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/30 backdrop-blur-md border border-emerald-400/50 text-[10px] sm:text-[11px] font-bold text-emerald-300">
                    <ShieldCheck size={11} />
                    <span>Terverifikasi</span>
                  </span>
                </div>

                {/* Lapisan Informasi Bawah */}
                <div className="relative z-10 mt-auto p-4 sm:p-5 flex flex-col justify-end text-white">
                  <h3 className="font-sans font-bold text-base sm:text-lg text-white leading-snug group-hover:text-amber-300 transition-colors mb-1 line-clamp-1">
                    {prod.name}
                  </h3>

                  {/* Informasi Harga */}
                  <div className="flex items-center gap-2 mb-1.5 font-mono text-sm text-amber-300 font-bold">
                    <span>{formattedPrice}</span>
                    <span className="text-[11px] font-normal text-slate-300 font-sans">/ {prod.unit}</span>
                  </div>

                  {/* Asal Desa & Pulau */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-300 mb-2 font-sans">
                    <MapPin size={12} className="text-amber-400 shrink-0" />
                    <span className="truncate">{prod.originDesa}, {prod.islandName}</span>
                  </div>

                  {/* Info Produsen & Kode Batch */}
                  <div className="flex items-center justify-between gap-1 text-[11px] text-slate-400 font-sans mb-2.5">
                    <span className="truncate max-w-[160px]">{prod.producerName}</span>
                    <span className="font-mono text-[10px] text-amber-400/80 bg-white/10 px-1.5 py-0.5 rounded">
                      {prod.batchCode.split('-').slice(-2).join('-')}
                    </span>
                  </div>

                  {/* Tombol Cek Asli & Lihat Produk */}
                  <div className="pt-2.5 border-t border-white/15 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => onPublicVerify(prod.batchCode)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-300 hover:text-amber-300 transition-colors cursor-pointer"
                    >
                      <QrCode size={12} className="text-amber-400" />
                      <span>Cek Asli</span>
                    </button>

                    <button
                      type="button"
                      onClick={onOpenMarketplace}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-[#081d35] font-bold text-xs shadow-sm transition-all active:scale-95 cursor-pointer"
                    >
                      <span>Lihat Produk</span>
                      <ArrowUpRightIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Kartu Akhir Carousel: Buka Marketplace Lengkap */}
          <div className="group relative shrink-0 w-[80vw] max-w-[330px] sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)] min-w-[250px] snap-center sm:snap-start flex flex-col justify-between rounded-2xl sm:rounded-[2rem] bg-gradient-to-br from-[#0f2c59] to-[#081d35] p-5 sm:p-7 text-white aspect-[3/4] shadow-md border border-white/10 hover:border-amber-400/40 transition-all select-none">
            <div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center mb-4 sm:mb-6">
                <ArrowUpRightIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="font-sans text-[10px] sm:text-[11px] font-bold tracking-[0.2em] text-[#f4b75e] uppercase block mb-1.5 sm:mb-2">
                KATALOG LENGKAP
              </span>
              <h3 className="font-sans font-bold text-xl sm:text-2xl text-white leading-tight mb-2 sm:mb-3">
                Rempah &amp; Hasil Bumi Pilihan
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 sm:line-clamp-none">
                Telusuri seluruh hasil panen biji pala organik, fuli merah kering, minyak atsiri, hingga olahan kuliner langsung dari petani pulau.
              </p>
            </div>

            <button
              type="button"
              id="btn-marketplace-carousel-selengkapnya"
              data-scroll-anchor="btn-marketplace-carousel-selengkapnya"
              onClick={onOpenMarketplace}
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-5 rounded-full bg-amber-600 hover:bg-amber-500 active:scale-95 text-white font-sans text-xs font-semibold tracking-wide transition-all shadow-md group cursor-pointer"
            >
              <span>Buka Marketplace UMKM</span>
              <ArrowUpRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TraceabilityMarketplaceSection
