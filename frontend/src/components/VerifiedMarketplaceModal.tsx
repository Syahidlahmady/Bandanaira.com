import React, { useState } from 'react'
import {
  ShieldCheck,
  QrCode,
  X,
  MapPin,
  Database,
  MessageCircle,
  Sparkles,
} from 'lucide-react'

export interface MarketplaceProduct {
  id: string
  name: string
  category: 'REMPAH' | 'PERIKANAN' | 'OLAHAN'
  priceRp: number
  weight: string
  producer: string
  originVillage: string
  batchCode: string
  verificationToken: string
  ipfsCid: string
  icon: string
  description: string
  stockQty: number
}

export interface VerifiedMarketplaceModalProps {
  isOpen: boolean
  onClose: () => void
  onVerifyProduct: (token: string) => void
}

export const VERIFIED_MARKETPLACE_PRODUCTS: MarketplaceProduct[] = [
  {
    id: 'prod-1',
    name: 'Pala Banda Grade A Super (Biji Kupas)',
    category: 'REMPAH',
    priceRp: 75000,
    weight: '250 gram',
    producer: 'Poktan Lonthoir Subur (Usman Alkatiri)',
    originVillage: 'Desa Lonthoir, Banda Besar',
    batchCode: 'BN-BTC-2026-001',
    verificationToken: 'BN_VERIFY_PALA_SUPER_2026_LONTHOIR',
    ipfsCid: 'QmPalaBandaSuperGradeALonthoir2026CertCid',
    icon: '🌿',
    description: 'Biji pala petik ranum kebun lereng vulkanik Banda, dijemur surya alami 6 hari dengan kadar air <10%. Terverifikasi Indikasi Geografis.',
    stockQty: 45,
  },
  {
    id: 'prod-2',
    name: 'Fuli Merah Murni Banda (Bunga Pala Ekspor)',
    category: 'REMPAH',
    priceRp: 95000,
    weight: '100 gram',
    producer: 'Marni Kelirey (Sentra Olahan Fuli)',
    originVillage: 'Desa Lonthoir Tengah',
    batchCode: 'BN-BTC-2026-002',
    verificationToken: 'BN_VERIFY_FULI_MERAH_2026_BELGICA',
    ipfsCid: 'QmFuliMerahBandaBelgicaPremiumGradeCert',
    icon: '🌺',
    description: 'Bunga pala merah cerah utuh tanpa pengawet. Aroma khas wangi pala murni untuk bahan masakan gourmet dan farmasi.',
    stockQty: 28,
  },
  {
    id: 'prod-3',
    name: 'Ikan Asar Cakalang Tradisional Banda',
    category: 'PERIKANAN',
    priceRp: 45000,
    weight: '500 gram (1 Ekor Utuh)',
    producer: 'La Ode Karim & Jafar Rumra (Nelayan Pesisir)',
    originVillage: 'Kampung Nelayan Nusantara, Banda Neira',
    batchCode: 'BN-BTC-2026-003',
    verificationToken: 'BN_VERIFY_IKAN_ASAR_CAKALANG_2026_BANDA',
    ipfsCid: 'QmCakalangAsarTraditionalBandaFishingCert2026',
    icon: '🐟',
    description: 'Tangkapan segar Laut Banda Zona 4 diasap lambat 12 jam menggunakan arang tempurung pala dan kayu kenari aromatik khas Banda. Bebas formalin.',
    stockQty: 32,
  },
  {
    id: 'prod-4',
    name: 'Tuna Sirip Kuning Segar (Yellowfin Sashimi Grade)',
    category: 'PERIKANAN',
    priceRp: 85000,
    weight: '1.000 gram (Fillet Beku)',
    producer: 'Kelompok Nelayan Banda Perkasa',
    originVillage: 'Pesisir Selamon, Laut Banda',
    batchCode: 'BN-BTC-2026-004',
    verificationToken: 'BN_VERIFY_TUNA_SIRIP_KUNING_2026_BANDA',
    ipfsCid: 'QmYellowfinTunaGradeSashimiBandaSeaCert2026',
    icon: '🎣',
    description: 'Tuna sirip kuning segar hasil pancing ramah lingkungan (handline). Rantai dingin terkontrol 0-2°C langsung dari perahu pendaratan.',
    stockQty: 18,
  },
  {
    id: 'prod-5',
    name: 'Sirup Buah Pala Murni Asli Banda Neira',
    category: 'OLAHAN',
    priceRp: 35000,
    weight: '350 ml (Botol Kaca)',
    producer: 'Fatimah Patty (UMKM Selai & Sirup Banda)',
    originVillage: 'Jl. Cengkeh, Banda Neira',
    batchCode: 'BN-BTC-2026-005',
    verificationToken: 'BN_VERIFY_SIRUP_PALA_MURNI_2026_BANDA',
    ipfsCid: 'QmSirupPalaMurniTradisiBandaNeiraCert2026',
    icon: '🍹',
    description: 'Ekstrak daging buah pala segar kaya antioksidan dengan gula tebu alami. Minuman khas penyegar dahaga pulau dengan rasa eksotis.',
    stockQty: 50,
  },
  {
    id: 'prod-6',
    name: 'Minyak Atsiri Pala Banda (Pure Essential Oil)',
    category: 'OLAHAN',
    priceRp: 120000,
    weight: '20 ml (Dropper Bottle)',
    producer: 'Koperasi Hatta Sentra Atsiri',
    originVillage: 'Pulau Hatta, Kepulauan Banda',
    batchCode: 'BN-BTC-2026-006',
    verificationToken: 'BN_VERIFY_MINYAK_ATSIRI_PALA_2026_HATTA',
    ipfsCid: 'QmMinyakAtsiriPalaDistilasiUapBandaHattaCert',
    icon: '💧',
    description: 'Minyak atsiri hasil suling uap biji pala pilihan lereng Hatta dengan kadar myristicin tinggi. Digunakan untuk aromaterapi dan pereda nyeri sendi.',
    stockQty: 22,
  },
]

export const VerifiedMarketplaceModal: React.FC<VerifiedMarketplaceModalProps> = ({
  isOpen,
  onClose,
  onVerifyProduct,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')

  if (!isOpen) return null

  const filteredProducts =
    selectedCategory === 'ALL'
      ? VERIFIED_MARKETPLACE_PRODUCTS
      : VERIFIED_MARKETPLACE_PRODUCTS.filter((p) => p.category === selectedCategory)

  const handleOrderWhatsApp = (product: MarketplaceProduct) => {
    const text = encodeURIComponent(
      `Halo Koperasi & UMKM Banda Neira, saya ingin memesan:\n` +
      `*${product.name}*\n` +
      `• Harga: Rp ${product.priceRp.toLocaleString('id-ID')}\n` +
      `• Berat: ${product.weight}\n` +
      `• Kode Batch Blockchain: ${product.batchCode}\n` +
      `• Produsen: ${product.producer} (${product.originVillage})\n\n` +
      `Mohon informasi ketersediaan stok dan konfirmasi pengiriman. Terima kasih!`
    )
    window.open(`https://wa.me/6281234567890?text=${text}`, '_blank')
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 bg-[#081D35]/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-[#F7F5F0] rounded-3xl border border-[#F4B75E]/30 shadow-2xl overflow-hidden text-[#081D35]">
        {/* Header Modal */}
        <div className="flex items-start justify-between p-6 sm:p-8 bg-gradient-to-r from-[#081D35] to-[#0F2C59] text-white border-b border-[#F4B75E]/20">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#F4B75E]/20 text-[#F4B75E] border border-[#F4B75E]/40">
                <ShieldCheck size={14} />
                Marketplace Resmi Terverifikasi Blockchain
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <Database size={13} />
                IPFS &amp; Smart Contract EVM
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white">
              Katalog Produk UMKM Agro-Maritim <span className="text-[#F4B75E] italic">Banda Neira</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
              Seluruh komoditas rempah pala, minyak atsiri, dan perikanan tangkap nelayan lokal di bawah ini telah terverifikasi keaslian asal kebunnya melalui bukti kriptografi ledger terdistribusi.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition shrink-0 ml-4"
            aria-label="Tutup"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filter Bar Kategori */}
        <div className="px-6 sm:px-8 py-4 bg-white border-b border-[#E2E8F0] flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { id: 'ALL', label: 'Semua Produk' },
              { id: 'REMPAH', label: '🌿 Rempah & Fuli' },
              { id: 'PERIKANAN', label: '🐟 Hasil Laut & Nelayan' },
              { id: 'OLAHAN', label: '🍹 Produk Olahan Pangan' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#081D35] text-[#F4B75E] shadow-sm'
                    : 'bg-[#F8FAFC] text-[#475569] border border-[#CBD5E1] hover:bg-[#F1F5F9]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <span className="text-xs text-[#64748B] font-medium">
            Menampilkan <b>{filteredProducts.length}</b> komoditas unggulan
          </span>
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 custom-scrollbar">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="flex flex-col justify-between p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm hover:shadow-md hover:border-[#F4B75E] transition-all group"
            >
              <div>
                {/* Top Badge & Icon */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-3xl p-2 rounded-xl bg-[#F7F5F0] border border-[#E2E8F0] group-hover:scale-105 transition-transform">
                    {p.icon}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    p.category === 'REMPAH'
                      ? 'bg-amber-50 text-amber-900 border-amber-200'
                      : p.category === 'PERIKANAN'
                      ? 'bg-sky-50 text-sky-800 border-sky-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}>
                    {p.category}
                  </span>
                </div>

                {/* Nama & Deskripsi */}
                <h4 className="font-bold text-base text-[#081D35] leading-snug group-hover:text-[#D97706] transition-colors">
                  {p.name}
                </h4>
                <p className="text-xs text-[#475569] mt-1.5 line-clamp-3 leading-relaxed">
                  {p.description}
                </p>

                {/* Info Produsen & Lokasi */}
                <div className="mt-3 p-2.5 rounded-xl bg-[#F8FAFC] border border-[#F1F5F9] text-[11px] space-y-1">
                  <div className="flex items-center gap-1.5 text-[#081D35] font-semibold">
                    <MapPin size={12} className="text-[#D97706] shrink-0" />
                    <span className="truncate">{p.producer}</span>
                  </div>
                  <div className="text-[#64748B] pl-4">
                    {p.originVillage} &bull; Berat: <b className="text-[#081D35]">{p.weight}</b>
                  </div>
                  <div className="text-[10px] text-emerald-700 font-mono pl-4 truncate">
                    Batch: {p.batchCode}
                  </div>
                </div>
              </div>

              {/* Harga & Tombol Aksi */}
              <div className="mt-4 pt-3 border-t border-[#F1F5F9] flex flex-col gap-2">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] text-[#64748B] uppercase tracking-wider block font-medium">Harga Bersih</span>
                    <span className="text-lg font-extrabold text-[#081D35] font-serif">
                      Rp {p.priceRp.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Stok: {p.stockQty} unit
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      onVerifyProduct(p.verificationToken)
                      onClose()
                    }}
                    className="py-2 px-2.5 rounded-xl text-[11px] font-semibold text-[#081D35] bg-[#F7F5F0] border border-[#CBD5E1] hover:bg-[#E2E8F0] transition flex items-center justify-center gap-1.5"
                    title="Cek Bukti Keaslian Blockchain"
                  >
                    <QrCode size={13} className="text-[#D97706]" />
                    <span>Verifikasi QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOrderWhatsApp(p)}
                    className="py-2 px-2.5 rounded-xl text-[11px] font-bold text-[#081D35] bg-[#F4B75E] hover:bg-[#E0A24A] shadow-xs transition flex items-center justify-center gap-1.5"
                    title="Pesan Langsung via WhatsApp"
                  >
                    <MessageCircle size={13} />
                    <span>Pesan WA</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Modal Info */}
        <div className="p-4 sm:p-5 bg-white border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748B]">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-[#F4B75E] shrink-0" />
            <span>
              Didukung oleh <b>Koperasi Hatta Banda</b> &amp; <b>Sistem Smart Contract EVM</b>
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#081D35] text-white hover:bg-[#0F2C59] transition font-semibold text-xs self-stretch sm:self-auto text-center"
          >
            Tutup Katalog
          </button>
        </div>
      </div>
    </div>
  )
}

export default VerifiedMarketplaceModal