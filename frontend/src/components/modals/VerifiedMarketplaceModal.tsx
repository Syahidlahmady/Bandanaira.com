import React, { useState, useEffect, useMemo } from 'react'
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronUp,
  Star,
  ShieldCheck,
  MessageCircle,
  Search,
  Heart,
  MapPin,
  Package,
  Sprout,
  Fish,
  Droplets,
  Coffee,
  Sun,
  Award,
  ExternalLink,
  Database,
  Sparkles,
  CheckCircle2,
  Check,
} from 'lucide-react'
import {
  MarketplaceProduct,
  marketplaceService,
} from '../../services/marketplace'

export interface VerifiedMarketplaceModalProps {
  isOpen: boolean
  onClose: () => void
  onVerifyProduct: (token: string) => void
  onNavigateToAdminWorkspace?: () => void
  onNavigateToFullPage?: () => void
}

// Fallback curated image map for Banda commodities
const FALLBACK_COMMODITY_IMAGES: Record<string, string> = {
  'prod-1': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80',
  'prod-2': 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=600&q=80',
  'prod-3': 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?auto=format&fit=crop&w=600&q=80',
  'prod-4': 'https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&w=600&q=80',
  'prod-5': 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
  'prod-6': 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=600&q=80',
  'prod-7': 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=600&q=80',
  'prod-8': 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80',
}

const CATEGORY_DEFAULT_IMAGES: Record<string, string> = {
  REMPAH: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80',
  PERIKANAN: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?auto=format&fit=crop&w=600&q=80',
  OLAHAN: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
  ORGANIK: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80',
}

export const VerifiedMarketplaceModal: React.FC<VerifiedMarketplaceModalProps> = ({
  isOpen,
  onClose,
  onVerifyProduct,
  onNavigateToAdminWorkspace,
  onNavigateToFullPage,
}) => {
  const [products, setProducts] = useState<MarketplaceProduct[]>([])
  
  // Filter States
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([])
  const [minPriceInput, setMinPriceInput] = useState<string>('')
  const [maxPriceInput, setMaxPriceInput] = useState<string>('')
  const [selectedVillages, setSelectedVillages] = useState<string[]>([])
  const [minRating, setMinRating] = useState<number | null>(null)
  const [selectedShipping, setSelectedShipping] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [sortBy, setSortBy] = useState<'rating' | 'price_asc' | 'price_desc' | 'sales' | 'stock'>('rating')

  // Wishlist state (stored in local storage)
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('banda_marketplace_wishlist')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Collapsible section state for sidebar
  const [categoryOpen, setCategoryOpen] = useState<boolean>(true)
  const [priceOpen, setPriceOpen] = useState<boolean>(true)
  const [villageOpen, setVillageOpen] = useState<boolean>(true)
  const [shippingOpen, setShippingOpen] = useState<boolean>(true)

  // Mobile filter drawer state
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false)

  // Load products
  useEffect(() => {
    if (isOpen) {
      setProducts(marketplaceService.getProducts().filter((p) => p.isPublished))
    }
  }, [isOpen])

  // Listen for admin changes
  useEffect(() => {
    const handleUpdate = () => {
      setProducts(marketplaceService.getProducts().filter((p) => p.isPublished))
    }
    window.addEventListener('banda_marketplace_updated', handleUpdate)
    return () => window.removeEventListener('banda_marketplace_updated', handleUpdate)
  }, [])

  // Wishlist toggle
  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const next = prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
      try {
        localStorage.setItem('banda_marketplace_wishlist', JSON.stringify(next))
      } catch {
        // ignore
      }
      return next
    })
  }

  // Clear all filters
  const handleClearAll = () => {
    setSelectedCategories([])
    setSelectedPriceRanges([])
    setMinPriceInput('')
    setMaxPriceInput('')
    setSelectedVillages([])
    setMinRating(null)
    setSelectedShipping([])
    setSearchQuery('')
    setSortBy('rating')
  }

  // Active filter count
  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedPriceRanges.length > 0 ||
    Boolean(minPriceInput) ||
    Boolean(maxPriceInput) ||
    selectedVillages.length > 0 ||
    minRating !== null ||
    selectedShipping.length > 0 ||
    Boolean(searchQuery.trim())

  // Categories list
  const CATEGORY_OPTIONS = [
    { id: 'REMPAH', label: 'Rempah Pala & Fuli' },
    { id: 'PERIKANAN', label: 'Hasil Laut Nelayan' },
    { id: 'OLAHAN', label: 'Olahan & Minyak Atsiri' },
    { id: 'ORGANIK', label: 'Sertifikasi Organik' },
  ]

  // Villages list
  const VILLAGE_OPTIONS = [
    { id: 'Lonthoir', label: 'Desa Lonthoir (Banda Besar)' },
    { id: 'Selamon', label: 'Desa Selamon (Banda Besar)' },
    { id: 'Boiyauw', label: 'Desa Boiyauw (Banda Besar)' },
    { id: 'Pulau Ai', label: 'Pulau Ai' },
    { id: 'Pulau Hatta', label: 'Pulau Hatta' },
    { id: 'Nusantara', label: 'Desa Nusantara (Banda Neira)' },
  ]

  // Shipping options
  const SHIPPING_OPTIONS = [
    { id: 'pelni', label: 'Kapal PELNI Reguler (KM Nggapulu)' },
    { id: 'sabuk', label: 'Perintis Sabuk Nusantara' },
    { id: 'udara', label: 'Kargo Udara SAM Air (Banda - Ambon)' },
    { id: 'kora', label: 'Kora-kora / Speedboat Antar-Pulau' },
  ]

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category filter
        if (selectedCategories.length > 0 && !selectedCategories.includes(p.category)) {
          return false
        }

        // Village filter
        if (selectedVillages.length > 0) {
          const match = selectedVillages.some((v) =>
            p.originVillage.toLowerCase().includes(v.toLowerCase())
          )
          if (!match) return false
        }

        // Rating filter
        if (minRating !== null && p.rating < minRating) {
          return false
        }

        // Predefined Price Ranges
        if (selectedPriceRanges.length > 0) {
          const matchesAnyRange = selectedPriceRanges.some((range) => {
            if (range === 'lt50') return p.priceRp < 50000
            if (range === '50_100') return p.priceRp >= 50000 && p.priceRp <= 100000
            if (range === '100_150') return p.priceRp >= 100000 && p.priceRp <= 150000
            if (range === 'gt150') return p.priceRp > 150000
            return true
          })
          if (!matchesAnyRange) return false
        }

        // Custom Min Price
        const minVal = parseFloat(minPriceInput)
        if (!isNaN(minVal) && minVal > 0 && p.priceRp < minVal) {
          return false
        }

        // Custom Max Price
        const maxVal = parseFloat(maxPriceInput)
        if (!isNaN(maxVal) && maxVal > 0 && p.priceRp > maxVal) {
          return false
        }

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase()
          const match =
            p.name.toLowerCase().includes(q) ||
            p.producer.toLowerCase().includes(q) ||
            p.batchCode.toLowerCase().includes(q) ||
            p.originVillage.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q)
          if (!match) return false
        }

        return true
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.priceRp - b.priceRp
        if (sortBy === 'price_desc') return b.priceRp - a.priceRp
        if (sortBy === 'sales') return (b.salesCount || 0) - (a.salesCount || 0)
        if (sortBy === 'stock') return b.stockQty - a.stockQty
        return b.rating - a.rating
      })
  }, [
    products,
    selectedCategories,
    selectedVillages,
    minRating,
    selectedPriceRanges,
    minPriceInput,
    maxPriceInput,
    searchQuery,
    sortBy,
  ])

  // Helper render commodity fallback icon
  const renderProductIcon = (iconName: MarketplaceProduct['iconName']) => {
    switch (iconName) {
      case 'sparkles':
        return <Sparkles size={28} className="text-[#F4B75E]" />
      case 'fish':
        return <Fish size={28} className="text-sky-500" />
      case 'droplet':
        return <Droplets size={28} className="text-cyan-500" />
      case 'coffee':
        return <Coffee size={28} className="text-amber-600" />
      case 'sun':
        return <Sun size={28} className="text-amber-500" />
      case 'award':
        return <Award size={28} className="text-emerald-500" />
      case 'leaf':
      default:
        return <Sprout size={28} className="text-emerald-500" />
    }
  }

  // Pre-formatted WhatsApp order inquiry
  const handleOrderWhatsApp = (product: MarketplaceProduct) => {
    const text = encodeURIComponent(
      `Halo Pengelola Koperasi Hatta & Sentra Komoditas Banda Neira,\n` +
      `Saya tertarik dan ingin memesan produk terverifikasi blockchain berikut:\n\n` +
      `• Nama Produk: *${product.name}*\n` +
      `• Harga Bersih: Rp ${product.priceRp.toLocaleString('id-ID')}\n` +
      `• Satuan/Bobot: ${product.weight}\n` +
      `• Kode Batch Kriptografi: ${product.batchCode}\n` +
      `• Produsen / Poktan: ${product.producer} (${product.originVillage})\n` +
      `• Token Verifikasi: ${product.verificationToken}\n` +
      `• IPFS CID: ${product.ipfsCid}\n\n` +
      `Mohon petunjuk rekening resmi Koperasi Hatta dan opsi pengiriman via Kapal Pelni / Kargo SAM Air Banda. Terima kasih!`
    )
    window.open(`https://wa.me/6281234567890?text=${text}`, '_blank')
  }

  // Helper active category title
  const activeCategoryTitle = useMemo(() => {
    if (selectedCategories.length === 1) {
      const match = CATEGORY_OPTIONS.find((c) => c.id === selectedCategories[0])
      return match ? match.label : selectedCategories[0]
    }
    if (selectedCategories.length > 1) {
      return `${selectedCategories.length} Kategori Dipilih`
    }
    return 'Semua Komoditas'
  }, [selectedCategories])

  if (!isOpen) return null

  // Reusable Filter Sidebar Content
  const renderFilterSidebar = () => (
    <div className="flex flex-col gap-5 text-xs text-slate-700 dark:text-slate-300">
      {/* 1. Header Filters & Clear All */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#1E3A5F]">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-[#081D35] dark:text-[#F4B75E]" />
          <span className="font-bold font-sans text-sm tracking-tight text-[#081D35] dark:text-white">
            Filters
          </span>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearAll}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline cursor-pointer"
          >
            Clear All
          </button>
        )}
      </div>

      {/* 2. Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-1.5 pb-2">
          {selectedCategories.map((cat) => {
            const label = CATEGORY_OPTIONS.find((c) => c.id === cat)?.label || cat
            return (
              <span
                key={cat}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-200/80 dark:bg-[#1E3A5F] text-slate-800 dark:text-slate-200 border border-slate-300/70 dark:border-slate-600"
              >
                <span>{label}</span>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedCategories((prev) => prev.filter((c) => c !== cat))
                  }
                  className="hover:text-rose-500 cursor-pointer"
                  aria-label={`Hapus filter ${label}`}
                >
                  <X size={11} />
                </button>
              </span>
            )
          })}

          {selectedVillages.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-200/80 dark:bg-[#1E3A5F] text-slate-800 dark:text-slate-200 border border-slate-300/70 dark:border-slate-600"
            >
              <span>Desa: {v}</span>
              <button
                type="button"
                onClick={() =>
                  setSelectedVillages((prev) => prev.filter((item) => item !== v))
                }
                className="hover:text-rose-500 cursor-pointer"
              >
                <X size={11} />
              </button>
            </span>
          ))}

          {selectedPriceRanges.map((pr) => {
            const label =
              pr === 'lt50'
                ? '< Rp 50rb'
                : pr === '50_100'
                ? 'Rp 50rb-100rb'
                : pr === '100_150'
                ? 'Rp 100rb-150rb'
                : '> Rp 150rb'
            return (
              <span
                key={pr}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-200/80 dark:bg-[#1E3A5F] text-slate-800 dark:text-slate-200 border border-slate-300/70 dark:border-slate-600"
              >
                <span>Harga: {label}</span>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedPriceRanges((prev) => prev.filter((item) => item !== pr))
                  }
                  className="hover:text-rose-500 cursor-pointer"
                >
                  <X size={11} />
                </button>
              </span>
            )
          })}

          {minRating !== null && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
              <span>Rating: &gt;={minRating}&#9733;</span>
              <button
                type="button"
                onClick={() => setMinRating(null)}
                className="hover:text-rose-500 cursor-pointer"
              >
                <X size={11} />
              </button>
            </span>
          )}

          {selectedShipping.map((s) => {
            const label = SHIPPING_OPTIONS.find((so) => so.id === s)?.label || s
            return (
              <span
                key={s}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-200/80 dark:bg-[#1E3A5F] text-slate-800 dark:text-slate-200 border border-slate-300/70 dark:border-slate-600"
              >
                <span className="truncate max-w-[120px]">{label}</span>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedShipping((prev) => prev.filter((item) => item !== s))
                  }
                  className="hover:text-rose-500 cursor-pointer"
                >
                  <X size={11} />
                </button>
              </span>
            )
          })}
        </div>
      )}

      {/* 3. Category Section */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setCategoryOpen(!categoryOpen)}
          className="flex items-center justify-between w-full text-left font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200 cursor-pointer"
        >
          <span>Category</span>
          {categoryOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {categoryOpen && (
          <div className="space-y-1.5 pt-1 pl-0.5">
            {CATEGORY_OPTIONS.map((cat) => {
              const isChecked = selectedCategories.includes(cat.id)
              return (
                <label
                  key={cat.id}
                  className="flex items-center gap-2.5 cursor-pointer text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                      isChecked
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-[#081D35]'
                    }`}
                  >
                    {isChecked && <Check size={11} strokeWidth={3} />}
                  </div>
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={isChecked}
                    onChange={() => {
                      setSelectedCategories((prev) =>
                        prev.includes(cat.id)
                          ? prev.filter((c) => c !== cat.id)
                          : [...prev, cat.id]
                      )
                    }}
                  />
                  <span className="text-xs">{cat.label}</span>
                </label>
              )
            })}
          </div>
        )}
      </div>

      {/* 4. Price Section */}
      <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-[#1E3A5F]">
        <button
          type="button"
          onClick={() => setPriceOpen(!priceOpen)}
          className="flex items-center justify-between w-full text-left font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200 cursor-pointer"
        >
          <span>Price</span>
          {priceOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {priceOpen && (
          <div className="space-y-2.5 pt-1">
            {/* Price Checkboxes */}
            <div className="space-y-1.5 pl-0.5">
              {[
                { id: 'lt50', label: '< Rp 50.000' },
                { id: '50_100', label: 'Rp 50.000 - Rp 100.000' },
                { id: '100_150', label: 'Rp 100.000 - Rp 150.000' },
                { id: 'gt150', label: 'Di atas Rp 150.000' },
              ].map((p) => {
                const isChecked = selectedPriceRanges.includes(p.id)
                return (
                  <label
                    key={p.id}
                    className="flex items-center gap-2.5 cursor-pointer text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                        isChecked
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-[#081D35]'
                      }`}
                    >
                      {isChecked && <Check size={11} strokeWidth={3} />}
                    </div>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={isChecked}
                      onChange={() => {
                        setSelectedPriceRanges((prev) =>
                          prev.includes(p.id)
                            ? prev.filter((item) => item !== p.id)
                            : [...prev, p.id]
                        )
                      }}
                    />
                    <span className="text-xs">{p.label}</span>
                  </label>
                )
              })}
            </div>

            {/* Min - Max Inputs (Reference Style) */}
            <div className="pt-1">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <input
                    type="number"
                    value={minPriceInput}
                    onChange={(e) => setMinPriceInput(e.target.value)}
                    placeholder="0"
                    className="w-full text-center px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#081D35] text-xs font-mono text-[#081D35] dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <span className="block text-[10px] text-center text-slate-400 mt-0.5">
                    Min
                  </span>
                </div>
                <span className="text-slate-400 pb-3">-</span>
                <div className="flex-1">
                  <input
                    type="number"
                    value={maxPriceInput}
                    onChange={(e) => setMaxPriceInput(e.target.value)}
                    placeholder="0"
                    className="w-full text-center px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#081D35] text-xs font-mono text-[#081D35] dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <span className="block text-[10px] text-center text-slate-400 mt-0.5">
                    Max
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. Origin Village Section */}
      <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-[#1E3A5F]">
        <button
          type="button"
          onClick={() => setVillageOpen(!villageOpen)}
          className="flex items-center justify-between w-full text-left font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200 cursor-pointer"
        >
          <span>Desa Sentra Asal</span>
          {villageOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {villageOpen && (
          <div className="space-y-1.5 pt-1 pl-0.5">
            {VILLAGE_OPTIONS.map((v) => {
              const isChecked = selectedVillages.includes(v.id)
              return (
                <label
                  key={v.id}
                  className="flex items-center gap-2.5 cursor-pointer text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                      isChecked
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-[#081D35]'
                    }`}
                  >
                    {isChecked && <Check size={11} strokeWidth={3} />}
                  </div>
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={isChecked}
                    onChange={() => {
                      setSelectedVillages((prev) =>
                        prev.includes(v.id)
                          ? prev.filter((item) => item !== v.id)
                          : [...prev, v.id]
                      )
                    }}
                  />
                  <span className="text-xs truncate">{v.label}</span>
                </label>
              )
            })}
          </div>
        )}
      </div>

      {/* 6. Rating Section (Horizontal Pills) */}
      <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-[#1E3A5F]">
        <span className="block font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
          Rating
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { val: 5, label: '5 ★' },
            { val: 4, label: '>4 ★' },
            { val: 3, label: '>3 ★' },
            { val: 2, label: '>2 ★' },
            { val: 1, label: '>1 ★' },
          ].map((r) => {
            const isSelected = minRating === r.val
            return (
              <button
                key={r.val}
                type="button"
                onClick={() => setMinRating(isSelected ? null : r.val)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-2xs font-bold'
                    : 'bg-white dark:bg-[#081D35] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-400'
                }`}
              >
                {r.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* 7. Shipping Options */}
      <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-[#1E3A5F]">
        <button
          type="button"
          onClick={() => setShippingOpen(!shippingOpen)}
          className="flex items-center justify-between w-full text-left font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200 cursor-pointer"
        >
          <span>Shipping Options</span>
          {shippingOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {shippingOpen && (
          <div className="space-y-1.5 pt-1 pl-0.5">
            {SHIPPING_OPTIONS.map((s) => {
              const isChecked = selectedShipping.includes(s.id)
              return (
                <label
                  key={s.id}
                  className="flex items-center gap-2.5 cursor-pointer text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                      isChecked
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-[#081D35]'
                    }`}
                  >
                    {isChecked && <Check size={11} strokeWidth={3} />}
                  </div>
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={isChecked}
                    onChange={() => {
                      setSelectedShipping((prev) =>
                        prev.includes(s.id)
                          ? prev.filter((item) => item !== s.id)
                          : [...prev, s.id]
                      )
                    }}
                  />
                  <span className="text-xs truncate">{s.label}</span>
                </label>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-900/40 backdrop-blur-xs overflow-hidden animate-fade-in">
      <div className="relative w-full max-w-7xl h-[94vh] flex flex-col bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden text-[#081D35]">
        
        {/* ===================================================================
            1. TOP MODAL HEADER (CERAH, LUMINOUS & AKSES HALAMAN PENUH)
        ==================================================================== */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 border-b border-amber-200/70 text-[#081D35] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-300 flex items-center justify-center text-[#D97706]">
              <ShieldCheck size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-[#D97706] tracking-wider uppercase font-mono">
                  Banda Digital Ecosystem
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-600/15 text-emerald-800 border border-emerald-300 font-bold">
                  <Database size={10} /> EVM On-Chain Traceability
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-bold font-serif text-[#081D35] tracking-tight leading-tight">
                Katalog Produk Terverifikasi <span className="text-[#D97706] italic">Banda Neira</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onNavigateToFullPage && (
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onNavigateToFullPage()
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 transition cursor-pointer"
                title="Buka Sebagai Halaman Utuh / Subhalaman Terpisah"
              >
                <ExternalLink size={13} />
                <span>Buka Halaman Utuh</span>
              </button>
            )}

            {onNavigateToAdminWorkspace && (
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onNavigateToAdminWorkspace()
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 transition cursor-pointer"
              >
                <span>Workspace Admin</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition cursor-pointer"
              aria-label="Tutup katalog"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* ===================================================================
            2. BODY CONTENT: SIDEBAR + MAIN PRODUCT GRID
        ==================================================================== */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* DESKTOP FILTER SIDEBAR (CERAH) */}
          <aside className="hidden md:flex w-64 lg:w-72 shrink-0 border-r border-slate-200 bg-slate-50/70 p-4 lg:p-5 overflow-y-auto custom-scrollbar">
            {renderFilterSidebar()}
          </aside>

          {/* MAIN PRODUCT AREA */}
          <main className="flex-1 flex flex-col overflow-y-auto bg-[#FBFBFA] custom-scrollbar">
            
            {/* Top Bar above Product Grid (matching reference image) */}
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              
              {/* Left: Products Heading & Count */}
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black font-sans text-slate-900 tracking-tight">
                    Products
                  </h2>
                  <span className="text-slate-400 font-bold">&bull;&bull;&bull;</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Showing <strong className="text-emerald-700 font-bold">{filteredProducts.length}</strong> Products for &ldquo;<span className="text-slate-900 font-semibold">{activeCategoryTitle}</span>&rdquo;
                </p>
              </div>

              {/* Right: Search Input, Mobile Filter Trigger & Sort Dropdown */}
              <div className="flex items-center gap-2.5 flex-wrap">
                
                {/* Search Bar */}
                <div className="relative min-w-[200px] flex-1 sm:flex-initial">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari komoditas..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-slate-50/80 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition shadow-2xs"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                {/* Mobile Filter Toggle */}
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="md:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 border border-slate-300 text-slate-800 cursor-pointer shadow-2xs"
                >
                  <SlidersHorizontal size={13} className="text-emerald-700" />
                  <span>Filters</span>
                  {hasActiveFilters && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  )}
                </button>

                {/* Sort Dropdown Pill */}
                <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-800 shadow-2xs">
                  <span className="text-slate-400 hidden lg:inline">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                  >
                    <option value="rating">&#9733; Ratings Tertinggi</option>
                    <option value="price_asc">Harga Terendah</option>
                    <option value="price_desc">Harga Tertinggi</option>
                    <option value="sales">Terlaris (Best Seller)</option>
                    <option value="stock">Stok Terbanyak</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Product Card Grid (Matching Reference Image) */}
            <div className="p-4 sm:p-5 lg:p-6">
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                  {filteredProducts.map((p) => {
                    const isFavorited = wishlist.includes(p.id)
                    const displayImage =
                      p.imageUrl ||
                      FALLBACK_COMMODITY_IMAGES[p.id] ||
                      CATEGORY_DEFAULT_IMAGES[p.category]

                    return (
                      <div
                        key={p.id}
                        className="bg-white dark:bg-[#0A223E] rounded-2xl border border-slate-200/90 dark:border-[#1E3A5F] shadow-2xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all flex flex-col justify-between overflow-hidden group"
                      >
                        {/* 1. Image Showcase Container (Soft Gray Rounded Box) */}
                        <div className="relative bg-slate-100 dark:bg-slate-800/60 rounded-xl m-2.5 h-44 sm:h-48 flex items-center justify-center overflow-hidden">
                          {displayImage ? (
                            <img
                              src={displayImage}
                              alt={p.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                              onError={(e) => {
                                // If image fails, hide and show icon
                                (e.target as HTMLElement).style.display = 'none'
                              }}
                            />
                          ) : (
                            <div className="p-6">{renderProductIcon(p.iconName)}</div>
                          )}

                          {/* Top-Left Category Tag */}
                          <div className="absolute top-2.5 left-2.5">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold font-mono tracking-wider bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 shadow-2xs backdrop-blur-xs border border-slate-200/50 dark:border-slate-700/50">
                              {p.category}
                            </span>
                          </div>

                          {/* Top-Right Wishlist Heart Button */}
                          <button
                            type="button"
                            onClick={() => toggleWishlist(p.id)}
                            className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 dark:bg-slate-900/90 shadow-2xs flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors backdrop-blur-xs cursor-pointer"
                            title={isFavorited ? 'Hapus dari Favorit' : 'Simpan ke Favorit'}
                          >
                            <Heart
                              size={14}
                              className={
                                isFavorited
                                  ? 'fill-rose-500 text-rose-500'
                                  : 'text-slate-400 hover:text-rose-500'
                              }
                            />
                          </button>
                        </div>

                        {/* 2. Product Details */}
                        <div className="px-3.5 pb-2 flex-1 flex flex-col justify-between">
                          <div>
                            {/* Product Name */}
                            <h3
                              className="font-bold text-sm text-[#081D35] dark:text-white leading-snug line-clamp-2 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors"
                              title={p.name}
                            >
                              {p.name}
                            </h3>

                            {/* Stars Rating & Review Count & Village */}
                            <div className="flex items-center gap-1.5 mt-1.5 text-xs">
                              <div className="flex items-center text-amber-400">
                                <Star size={12} className="fill-amber-400 text-amber-400" />
                                <span className="font-bold text-amber-600 dark:text-amber-400 ml-1 text-[11px]">
                                  {p.rating.toFixed(1)}
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-400 font-normal">
                                ({p.salesCount || 0} Terjual)
                              </span>
                            </div>

                            <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                              <MapPin size={10} className="text-[#F4B75E] shrink-0" />
                              <span className="truncate">{p.originVillage}</span>
                            </div>
                          </div>

                          {/* Price & Stock info */}
                          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-[#1E3A5F]/60">
                            <div className="flex items-baseline justify-between">
                              <div className="font-mono font-black text-base sm:text-lg text-[#081D35] dark:text-white tracking-tight">
                                Rp {p.priceRp.toLocaleString('id-ID')}
                              </div>
                              <span className="text-[10px] text-slate-400 font-medium">
                                /{p.weight}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                              <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                                <CheckCircle2 size={10} /> Stok: {p.stockQty} unit
                              </span>
                              <span className="truncate max-w-[100px] text-sky-600 dark:text-sky-400">
                                {p.batchCode}
                              </span>
                            </div>

                            {/* =========================================================
                                3. EKSKLUSIF DUA TOMBOL AKSI (MANDAT PENGGUNA):
                                1. VERIFIKASI PRODUK
                                2. HUBUNGI VIA WHATSAPP
                            ========================================================== */}
                            <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-slate-100 dark:border-[#1E3A5F]/70">
                              <button
                                type="button"
                                onClick={() => {
                                  onVerifyProduct(p.verificationToken || p.batchCode)
                                  onClose()
                                }}
                                className="w-full py-2 px-2 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-[#1E3A5F] hover:bg-slate-200 dark:hover:bg-[#254875] border border-slate-200 dark:border-[#1E3A5F] transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs group/verify"
                                title="Periksa Keabsahan Kriptografi On-Chain"
                              >
                                <ShieldCheck size={13} className="text-[#F4B75E] group-hover/verify:scale-110 transition-transform" />
                                <span className="truncate">Verifikasi</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOrderWhatsApp(p)}
                                className="w-full py-2 px-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs group/wa"
                                title="Pesan Langsung via WhatsApp Resmi Koperasi Hatta"
                              >
                                <MessageCircle size={13} className="group-hover/wa:scale-110 transition-transform" />
                                <span className="truncate">WhatsApp</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="p-12 text-center space-y-3 bg-white rounded-3xl border border-slate-200/90 max-w-md mx-auto my-12 shadow-xs">
                  <Package size={40} className="mx-auto text-slate-400" />
                  <h4 className="text-base font-bold text-slate-800">
                    Tidak ada produk yang cocok dengan filter
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Coba sesuaikan kata kunci pencarian atau klik tombol &ldquo;Clear All&rdquo; di bilah filter samping untuk menampilkan seluruh katalog.
                  </p>
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition cursor-pointer"
                  >
                    Reset Semua Filter
                  </button>
                </div>
              )}
            </div>
          </main>
        </div>

        {/* ===================================================================
            3. FOOTER MODAL (CERAH)
        ==================================================================== */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles size={13} className="text-[#D97706]" />
            <span>
              Komoditas Resmi <b>Koperasi Hatta Banda Neira</b> &bull; Pembayaran Aman &amp; Sertifikat EVM Terdesentralisasi
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-1.5 rounded-xl bg-[#081D35] hover:bg-[#0c2a4d] text-white font-bold transition text-xs text-center cursor-pointer shadow-2xs"
          >
            Tutup Katalog
          </button>
        </div>

        {/* ===================================================================
            4. MOBILE FILTER SLIDE-OVER DRAWER (CERAH)
        ==================================================================== */}
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-60 md:hidden flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
              onClick={() => setIsMobileFilterOpen(false)}
            />
            {/* Drawer */}
            <div className="relative w-4/5 max-w-xs h-full bg-white p-5 shadow-2xl flex flex-col justify-between overflow-y-auto z-10">
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                  <span className="font-bold text-sm text-slate-900">
                    Pilihan Filter
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>
                {renderFilterSidebar()}
              </div>
              <div className="pt-4 mt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition cursor-pointer"
                >
                  Terapkan ({filteredProducts.length} Produk)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default VerifiedMarketplaceModal
