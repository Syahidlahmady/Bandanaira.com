import React, { useState } from 'react'
import { ArrowUpRightIcon } from './LandingIcons'

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
    categoryLabel: 'MINUMAN SEGAR',
    priceRp: 35000,
    unit: 'botol (600ml)',
    originDesa: 'Desa Nusantara',
    islandName: 'Pulau Neira',
    batchCode: 'BN-SIRUP-NEIRA-09',
    producerName: 'UMKM Ibu Pala Berkarya',
    photoUrl:
      'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'prod-4',
    name: 'Ikan Asar Cakalang Asap Tempurung Pala',
    category: 'HASIL LAUT',
    categoryLabel: 'HASIL LAUT TRADISIONAL',
    priceRp: 65000,
    unit: 'ekor',
    originDesa: 'Kampung Lama',
    islandName: 'Pulau Hatta',
    batchCode: 'BN-CAKALANG-HATTA-12',
    producerName: 'Koperasi Nelayan Bahari Hatta',
    photoUrl:
      'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'prod-5',
    name: 'Halwa Kenari & Manisan Buah Pala',
    category: 'OLAHAN REMPAH',
    categoryLabel: 'KULINER KHAS',
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
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'REMPAH' | 'OLAHAN' | 'LAUT'>('ALL')

  const filterOptions = [
    { key: 'ALL', label: 'Semua Produk' },
    { key: 'REMPAH', label: 'Rempah Pala & Fuli' },
    { key: 'OLAHAN', label: 'Olahan & Kuliner' },
    { key: 'LAUT', label: 'Hasil Laut Nelayan' },
  ] as const

  const filteredProducts = FEATURED_MARKETPLACE_PRODUCTS.filter((item) => {
    if (selectedFilter === 'ALL') return true
    if (selectedFilter === 'REMPAH') return item.category === 'REMPAH PUSAKA' || item.category === 'HERBAL & MINYAK'
    if (selectedFilter === 'OLAHAN') return item.category === 'OLAHAN REMPAH'
    if (selectedFilter === 'LAUT') return item.category === 'HASIL LAUT'
    return true
  })

  return (
    <section
      id="layanan-umkm"
      aria-labelledby="local-cuisine-heading"
      className="relative w-full py-20 px-6 sm:px-12 lg:px-20 bg-[#f7f5f0] text-slate-900 border-t border-slate-200/80"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Row: Title on Left, Action Pill on Right (Ala indonesia.travel) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="w-5 h-px bg-amber-600" />
              <p className="font-sans text-[11px] font-bold tracking-[0.2em] text-amber-600 uppercase">
                MARKETPLACE UMKM &amp; REMPAH BANDA
              </p>
            </div>

            <h2
              id="local-cuisine-heading"
              className="font-sans font-bold text-3xl sm:text-4xl lg:text-[42px] leading-tight tracking-tight text-[#0f2c59]"
            >
              Hasil Bumi &amp;{' '}
              <span className="font-script text-amber-600 font-normal text-4xl sm:text-5xl lg:text-[50px] inline-block tracking-normal ml-1">
                Rempah Pilihan
              </span>{' '}
              Warga Banda
            </h2>
            <p className="font-sans text-sm sm:text-base text-slate-600 max-w-xl mt-2 leading-relaxed">
              Komoditas asli langsung dari petani kebun dan nelayan pulau dengan jaminan keaslian serta catatan asal panen.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onOpenMarketplace}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0f2c59] text-white hover:bg-[#183d75] text-xs font-semibold tracking-wide transition-all duration-200 shadow-sm group"
            >
              <span>Buka Marketplace UMKM</span>
              <ArrowUpRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>

            <button
              type="button"
              onClick={() => onPublicVerify('BN_VERIFY_PALA_SUPER_2026_LONTHOIR')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-slate-300 bg-white hover:bg-amber-50 text-slate-700 text-xs font-semibold tracking-wide transition-all duration-200"
            >
              <svg className="w-3.5 h-3.5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M7 7h.01M7 17h.01M17 7h.01M17 17h.01M7 12h10M12 7v10" />
              </svg>
              <span>Cek QR Batch</span>
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {filterOptions.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setSelectedFilter(opt.key)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                selectedFilter === opt.key
                  ? 'bg-[#0f2c59] text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Catalog Showcase Cards (Poster Style with Terracotta Badge) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredProducts.map((prod) => {
            const formattedPrice = new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              maximumFractionDigits: 0,
            }).format(prod.priceRp)

            return (
              <div
                key={prod.id}
                className="group relative flex flex-col rounded-[2rem] overflow-hidden bg-slate-900 aspect-[3/4] shadow-md hover:shadow-2xl transition-all duration-300 select-none"
              >
                {/* Product Photo */}
                <img
                  src={prod.photoUrl}
                  alt={prod.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                />

                {/* Scrim Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a1626]/95 via-[#0a1626]/40 to-black/20" />

                {/* Top Badges */}
                <div className="relative z-10 p-5 flex items-start justify-between w-full">
                  {/* Terracotta/Orange Badge */}
                  <span className="inline-block bg-[#e0672e] text-white text-[10px] font-bold tracking-wider px-3 py-1 rounded shadow-sm uppercase font-sans">
                    {prod.categoryLabel}
                  </span>

                  {/* Blockchain Traceability Badge */}
                  <button
                    type="button"
                    onClick={() => onPublicVerify(prod.batchCode)}
                    className="inline-flex items-center gap-1 bg-sky-950/80 hover:bg-sky-900 border border-sky-400/30 text-sky-300 text-[10px] font-mono px-2.5 py-1 rounded-full backdrop-blur-sm shadow-sm transition-colors"
                  >
                    <svg className="w-3 h-3 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <span>Batch Panen</span>
                  </button>
                </div>

                {/* Bottom Information */}
                <div className="relative z-10 mt-auto p-6 flex flex-col justify-end text-white">
                  <h3 className="font-sans font-bold text-lg sm:text-xl text-white leading-snug group-hover:text-amber-300 transition-colors mb-2">
                    {prod.name}
                  </h3>

                  {/* Price info */}
                  <div className="flex items-center gap-2 mb-2 font-mono text-sm text-amber-300 font-bold">
                    <span>{formattedPrice}</span>
                    <span className="text-xs font-normal text-slate-300 font-sans">/ {prod.unit}</span>
                  </div>

                  {/* Origin Desa & Island */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-300 mb-3 font-sans">
                    <svg className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                      <circle cx="12" cy="10" r="2.5" />
                    </svg>
                    <span className="truncate">{prod.originDesa}, {prod.islandName}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-white/15 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-sans truncate max-w-[150px]">
                      {prod.producerName}
                    </span>

                    <button
                      type="button"
                      onClick={onOpenMarketplace}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-amber-300 hover:text-white transition-colors"
                    >
                      <span>Lihat Produk</span>
                      <ArrowUpRightIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default TraceabilityMarketplaceSection
