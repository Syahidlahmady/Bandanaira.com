import React, { useState } from 'react'
import {
  ShieldCheck,
  QrCode,
  X,
  MapPin,
  Database,
} from 'lucide-react'

interface MarketplaceProduct {
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

interface VerifiedMarketplaceModalProps {
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
    verificationToken: 'BN_VERIFY_SIRUP_PALA_BANDA_NEIRA_2026',
    ipfsCid: 'QmNutmegSyrupBandaNeiraOrganicCert2026',
    icon: '🍹',
    description: 'Daging buah pala segar dimasak dengan gula tebu alami tanpa pemanis buatan. Minuman berkhasiat relaksasi dan kesehatan khas rempah Banda.',
    stockQty: 50,
  },
]

export const VerifiedMarketplaceModal: React.FC<VerifiedMarketplaceModalProps> = ({
  isOpen,
  onClose,
  onVerifyProduct,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')

  if (!isOpen) return null

  const filteredProducts = selectedCategory === 'ALL'
    ? VERIFIED_MARKETPLACE_PRODUCTS
    : VERIFIED_MARKETPLACE_PRODUCTS.filter((p) => p.category === selectedCategory)

  return (
    <div className="modal-backdrop">
      <div
        className="modal-content animate-fade-in"
        style={{
          maxWidth: '920px',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'linear-gradient(155deg, #081d35 0%, #0f2c59 100%)',
          padding: '2.25rem',
          border: '1px solid rgba(244, 183, 94, 0.4)',
          boxShadow: '0 28px 60px -15px rgba(4, 12, 24, 0.85), 0 0 32px rgba(244, 183, 94, 0.18)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', borderBottom: '1px solid rgba(244, 183, 94, 0.2)', paddingBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span className="badge badge-gold">
                <ShieldCheck size={13} /> MARKETPLACE TERDESENTRALISASI RESMI
              </span>
              <span className="badge badge-emerald">
                <Database size={12} /> IPFS &amp; SMART CONTRACT
              </span>
            </div>
            <h2 className="font-serif" style={{ fontSize: '2rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
              Katalog Produk UMKM Agro-Maritim <span style={{ color: '#f4b75e', fontStyle: 'italic' }}>Banda Neira</span>
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Produk rempah pala dan perikanan tangkap nelayan lokal terverifikasi keasliannya via blockchain.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              transition: 'all 0.2s',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: 'Semua Produk' },
            { id: 'REMPAH', label: '🌿 Rempah & Fuli' },
            { id: 'PERIKANAN', label: '🐟 Hasil Laut & Nelayan' },
            { id: 'OLAHAN', label: '🍹 Produk Olahan Pangan' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8rem',
                fontWeight: 700,
                border: selectedCategory === cat.id ? '2px solid #10b981' : '1px solid rgba(255, 255, 255, 0.12)',
                background: selectedCategory === cat.id ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                color: selectedCategory === cat.id ? '#34d399' : '#cbd5e1',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Product Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.25rem',
            marginBottom: '1.75rem',
          }}
        >
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              style={{
                background: 'rgba(15, 23, 42, 0.75)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.25s ease',
                position: 'relative',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '2.5rem', filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.4))' }}>
                    {p.icon}
                  </span>
                  <span
                    className={`badge ${
                      p.category === 'REMPAH'
                        ? 'badge-emerald'
                        : p.category === 'PERIKANAN'
                        ? 'badge-blue'
                        : 'badge-amber'
                    }`}
                  >
                    {p.category}
                  </span>
                </div>

                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 0.35rem' }}>
                  {p.name}
                </h4>

                <p style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.45, marginBottom: '0.85rem' }}>
                  {p.description}
                </p>

                <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255, 255, 255, 0.06)', marginBottom: '0.85rem' }}>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MapPin size={11} color="#38bdf8" /> {p.producer}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.15rem' }}>
                    {p.originVillage} &bull; Berat: <b style={{ color: '#cbd5e1' }}>{p.weight}</b>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#34d399', fontFamily: 'var(--font-mono)', marginTop: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    IPFS: {p.ipfsCid.slice(0, 20)}...
                  </div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Harga Asli Petani/Nelayan</span>
                    <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#38bdf8' }}>
                      Rp {p.priceRp.toLocaleString('id-ID')}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700 }}>
                    Stok: {p.stockQty} unit
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    onVerifyProduct(p.verificationToken)
                  }}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    fontSize: '0.825rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.45rem',
                  }}
                >
                  <QrCode size={15} /> Cek Bukti Asal-Usul (On-Chain)
                </button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            💡 Setiap transaksi di marketplace ini menghubungkan pembeli langsung dengan produsen di Banda Neira dan mencatat bukti keaslian di smart contract.
          </div>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ marginLeft: 'auto' }}
          >
            Tutup Marketplace
          </button>
        </div>
      </div>
    </div>
  )
}
