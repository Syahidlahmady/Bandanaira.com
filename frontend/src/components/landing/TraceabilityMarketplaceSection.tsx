import React, { useMemo, useState } from 'react'
import { VERIFIED_MARKETPLACE_PRODUCTS } from '../modals/VerifiedMarketplaceModal'
import { ArrowUpRightIcon } from './LandingIcons'

export interface TraceabilityMarketplaceSectionProps {
  onNavigate: (tab: any) => void
  onOpenMarketplace: () => void
  onPublicVerify: (token: string) => void
}

export const TraceabilityMarketplaceSection: React.FC<TraceabilityMarketplaceSectionProps> = ({
  onNavigate,
  onOpenMarketplace,
  onPublicVerify,
}) => {
  const [marketCategory, setMarketCategory] = useState<'ALL' | 'REMPAH' | 'PERIKANAN' | 'OLAHAN'>('ALL')
  const [marketSearch, setMarketSearch] = useState<string>('')

  const filteredProducts = useMemo(() => {
    return VERIFIED_MARKETPLACE_PRODUCTS.filter((p) => {
      const matchCat = marketCategory === 'ALL' || p.category === marketCategory
      const matchSearch =
        marketSearch.trim() === '' ||
        p.name.toLowerCase().includes(marketSearch.toLowerCase()) ||
        p.description.toLowerCase().includes(marketSearch.toLowerCase()) ||
        p.producer.toLowerCase().includes(marketSearch.toLowerCase()) ||
        p.originVillage.toLowerCase().includes(marketSearch.toLowerCase())
      return matchCat && matchSearch
    })
  }, [marketCategory, marketSearch])

  return (
    <section
      id="layanan-umkm"
      aria-labelledby="local-cuisine-heading"
      className="flex flex-col items-start gap-10 px-6 sm:px-12 lg:px-20 py-24 relative self-stretch w-full flex-[0_0_auto] bg-[#f7f5f0]"
    >
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 relative self-stretch w-full flex-[0_0_auto]">
        <div className="max-w-[730px] flex flex-col items-start gap-[18px] relative">
          <div className="inline-flex items-center gap-2.5 relative flex-[0_0_auto]">
            <span
              aria-hidden="true"
              className="relative w-6 h-px bg-amber-600"
            />
            <p className="mt-[-1.00px] font-semibold text-amber-600 text-[11px] tracking-[1.80px] whitespace-nowrap relative w-fit leading-[normal] uppercase">
              MARKETPLACE UMKM · KOPERASI HATTA &amp; BLOCKCHAIN
            </p>
          </div>
          <h2
            id="local-cuisine-heading"
            className="relative self-stretch font-medium text-[#0f2c59] text-[36px] sm:text-[50px] tracking-[-2.00px] leading-[1.12]"
          >
            Rempah &amp; Hasil Laut Banda,
            <br />
            Terverifikasi Langsung dari Petani.
          </h2>
          <p className="text-[#63717d] text-base leading-relaxed">
            Dukung perekonomian warga kepulauan. Setiap produk rempah pala, fuli, ikan asar, dan olahan kenari
            dilengkapi sertifikat keaslian kriptografis Indikasi Geografis (IG) yang tercatat di Blockchain.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onOpenMarketplace}
            className="inline-flex h-[46px] items-center gap-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg px-5 py-0 text-xs font-semibold transition-colors"
          >
            <span>Buka Modal Marketplace</span>
            <ArrowUpRightIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onNavigate('koperasi')}
            className="inline-flex h-[46px] items-center gap-2 border border-[#dce1df] hover:bg-white text-[#0f2c59] rounded-lg px-4 py-0 text-xs font-medium transition-colors"
          >
            <span>Kasir Koperasi Hatta</span>
          </button>
        </div>
      </header>

      {/* Filter & Search Bar Marketplace */}
      <div className="w-full flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-xl bg-white border border-[#dce1df] shadow-sm">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'ALL', label: 'Semua Produk' },
            { id: 'REMPAH', label: '🌿 Rempah & Fuli' },
            { id: 'PERIKANAN', label: '🐟 Hasil Laut' },
            { id: 'OLAHAN', label: '🍹 Minuman & Kudapan' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setMarketCategory(cat.id as any)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                marketCategory === cat.id
                  ? 'bg-[#0f2c59] text-white shadow-sm'
                  : 'bg-[#f7f5f0] text-[#63717d] hover:text-[#0f2c59]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px]">
          <input
            type="search"
            value={marketSearch}
            onChange={(e) => setMarketSearch(e.target.value)}
            placeholder="Cari pala, tuna, fuli, sirup..."
            className="w-full h-10 pl-9 pr-3 text-xs bg-[#f7f5f0] border border-[#dce1df] rounded-lg text-[#0f2c59] placeholder-[#63717d] focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
          <span className="absolute left-3 top-2.5 text-[#63717d] text-xs">🔍</span>
        </div>
      </div>

      {/* Grid Marketplace Products */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative self-stretch w-full flex-[0_0_auto]">
        {filteredProducts.map((prod) => (
          <article
            key={prod.id}
            className="group flex flex-col items-start justify-between bg-white rounded-2xl overflow-hidden shadow-sm border border-[#dce1df] hover:shadow-md transition-all p-6 gap-5"
          >
            <div className="flex flex-col gap-3.5 w-full">
              {/* Header Card: Icon & Category */}
              <div className="flex items-center justify-between w-full">
                <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-2xl">
                  {prod.icon}
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold tracking-wider text-amber-700 uppercase bg-amber-100/80 px-2 py-0.5 rounded">
                    {prod.category}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                    Stok: {prod.stockQty} unit
                  </span>
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="font-bold text-[#0f2c59] text-lg leading-snug group-hover:text-amber-700 transition-colors">
                  {prod.name}
                </h3>
                <p className="text-xs text-[#63717d] mt-1 line-clamp-2 leading-relaxed">
                  {prod.description}
                </p>
              </div>

              {/* Origin & Traceability Specs */}
              <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-[#f7f5f0] text-[11px] text-[#4a5568]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Produsen:</span>
                  <span className="font-semibold text-[#0f2c59] text-right truncate max-w-[180px]">
                    {prod.producer}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Asal Desa:</span>
                  <span className="font-medium text-[#0f2c59]">{prod.originVillage}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-[#dce1df]/80 font-mono text-[10px]">
                  <span className="text-slate-400">Batch Code:</span>
                  <span className="text-amber-800 font-bold">{prod.batchCode}</span>
                </div>
              </div>
            </div>

            {/* Price & Action Buttons */}
            <div className="flex flex-col gap-3 w-full pt-3 border-t border-[#dce1df]">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Harga Langsung Petani:</span>
                  <span className="text-xl font-bold text-[#0f2c59]">
                    Rp {prod.priceRp.toLocaleString('id-ID')}
                  </span>
                </div>
                <span className="text-xs font-semibold text-[#63717d] bg-slate-100 px-2 py-1 rounded">
                  {prod.weight}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onPublicVerify(prod.verificationToken)}
                  className="py-2.5 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  title="Verifikasi Hash Blockchain & IPFS"
                >
                  <span>Cek QR Chain</span>
                </button>

                <a
                  href={`https://wa.me/6281234567890?text=${encodeURIComponent(
                    `Halo Pengelola UMKM & Koperasi Hatta,\nSaya ingin memesan produk:\n- Nama: ${prod.name}\n- Kode Batch: ${prod.batchCode}\n- Harga: Rp ${prod.priceRp.toLocaleString('id-ID')}\n- Produsen: ${prod.producer} (${prod.originVillage})\n\nMohon info ketersediaan stok dan ongkir pengiriman. Terima kasih!`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold text-center transition-colors flex items-center justify-center gap-1"
                >
                  <span>Pesan WA</span>
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Marketplace Footer Guarantee */}
      <footer className="flex flex-col sm:flex-row items-center justify-between gap-4 self-stretch w-full p-5 rounded-2xl bg-[#0f2c59] text-white">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🌱</span>
          <div>
            <h4 className="text-sm font-bold text-white">
              Garansi Indikasi Geografis &amp; Rantai Pasok Berkelanjutan
            </h4>
            <p className="text-xs text-[#c1ced8]">
              Setiap pembelian langsung mengalirkan 100% pendapatan adil kepada petani dan nelayan lokal Banda Neira.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenMarketplace}
          className="inline-flex h-10 shrink-0 items-center gap-2 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-[#081d35] font-bold text-xs transition-colors"
        >
          <span>Buka Katalog Lengkap</span>
          <ArrowUpRightIcon className="w-3.5 h-3.5" />
        </button>
      </footer>
    </section>
  )
}

export default TraceabilityMarketplaceSection
