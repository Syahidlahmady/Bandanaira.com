import React, { useState, useEffect } from 'react'
import {
  ShoppingBag,
  Plus,
  Search,
  CheckCircle2,
  TrendingUp,
  Package,
  MapPin,
  MessageCircle,
  Download,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  X,
  Save,
  Sprout,
  Fish,
  Droplets,
  Coffee,
  Award,
  ShieldCheck,
  Clock,
  ExternalLink,
  Sparkles,
  AlertTriangle,
  DollarSign,
  Users,
  Copy,
  Check,
  BarChart3,
  RefreshCw,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  MarketplaceProduct,
  OrderInquiry,
  marketplaceService,
} from '../services/marketplace'

interface MarketplaceAdminWorkspaceProps {
  onOpenPublicCatalog?: () => void
  onPublicVerify?: (token: string) => void
}

export const MarketplaceAdminWorkspace: React.FC<MarketplaceAdminWorkspaceProps> = ({
  onOpenPublicCatalog,
  onPublicVerify,
}) => {
  const [products, setProducts] = useState<MarketplaceProduct[]>([])
  const [orders, setOrders] = useState<OrderInquiry[]>([])
  const [stats, setStats] = useState(marketplaceService.getStats())
  const [activeTab, setActiveTab] = useState<'catalog' | 'orders' | 'analytics'>('catalog')

  // Filter & Pencarian
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'DRAFT' | 'LOW_STOCK'>('ALL')
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL')

  // Salin Hash feedback
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  // Form Modal Tambah / Edit
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<MarketplaceProduct | null>(null)
  const [formData, setFormData] = useState<Partial<MarketplaceProduct>>({
    name: '',
    category: 'REMPAH',
    priceRp: 75000,
    weight: '250 gram',
    producer: '',
    originVillage: 'Desa Lonthoir, Banda Besar',
    batchCode: '',
    description: '',
    stockQty: 30,
    iconName: 'leaf',
    isPublished: true,
  })

  // Toast Notifikasi
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Muat data
  const reloadData = () => {
    setProducts(marketplaceService.getProducts())
    setOrders(marketplaceService.getOrders())
    setStats(marketplaceService.getStats())
  }

  useEffect(() => {
    reloadData()
    const handleUpdate = () => reloadData()
    window.addEventListener('banda_marketplace_updated', handleUpdate)
    window.addEventListener('banda_marketplace_orders_updated', handleUpdate)
    return () => {
      window.removeEventListener('banda_marketplace_updated', handleUpdate)
      window.removeEventListener('banda_marketplace_orders_updated', handleUpdate)
    }
  }, [])

  // Buka modal tambah
  const handleOpenAddModal = () => {
    setEditingProduct(null)
    const nextSeq = products.length + 1
    const padSeq = nextSeq < 10 ? `00${nextSeq}` : nextSeq < 100 ? `0${nextSeq}` : `${nextSeq}`
    setFormData({
      name: '',
      category: 'REMPAH',
      priceRp: 75000,
      weight: '250 gram',
      producer: '',
      originVillage: 'Desa Lonthoir, Banda Besar',
      batchCode: `BN-BTC-2026-${padSeq}`,
      verificationToken: `BN_VERIFY_KOMODITAS_2026_${Date.now()}`,
      ipfsCid: `QmBandaRempahCert${Date.now()}`,
      description: '',
      stockQty: 30,
      iconName: 'leaf',
      isPublished: true,
    })
    setIsFormModalOpen(true)
  }

  // Buka modal edit
  const handleOpenEditModal = (p: MarketplaceProduct) => {
    setEditingProduct(p)
    setFormData({ ...p })
    setIsFormModalOpen(true)
  }

  // Simpan Form
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name?.trim()) {
      alert('Nama produk komoditas wajib diisi.')
      return
    }

    marketplaceService.upsertProduct({
      ...formData,
      id: editingProduct ? editingProduct.id : undefined,
      name: formData.name.trim(),
    } as any)

    setIsFormModalOpen(false)
    reloadData()
    showToast(
      editingProduct
        ? `Komoditas "${formData.name}" berhasil diperbarui.`
        : `Komoditas baru "${formData.name}" berhasil ditambahkan ke katalog.`
    )
  }

  // Quick Restock (+ / - unit)
  const handleQuickRestock = (p: MarketplaceProduct, delta: number) => {
    const nextStock = Math.max(0, p.stockQty + delta)
    marketplaceService.upsertProduct({
      ...p,
      stockQty: nextStock,
    })
    reloadData()
    showToast(`Stok "${p.name}" kini ${nextStock} unit (${delta > 0 ? `+${delta}` : delta}).`)
  }

  // Hapus Produk
  const handleDeleteProduct = (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus komoditas "${name}" dari marketplace?`)) {
      marketplaceService.deleteProduct(id)
      reloadData()
      showToast(`Komoditas "${name}" telah dihapus.`)
    }
  }

  // Toggle Publikasi
  const handleTogglePublish = (p: MarketplaceProduct) => {
    marketplaceService.togglePublish(p.id)
    reloadData()
    showToast(
      p.isPublished
        ? `"${p.name}" dialihkan menjadi Draf (tersembunyi dari pembeli).`
        : `"${p.name}" berhasil dipublikasikan ke katalog pembeli.`
    )
  }

  // Update Status Pesanan
  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderInquiry['status']) => {
    marketplaceService.updateOrderStatus(orderId, newStatus)
    reloadData()
    showToast(`Status pesanan #${orderId} diperbarui menjadi ${newStatus}.`)
  }

  // Salin Kode Batch
  const handleCopyCode = (text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    navigator.clipboard.writeText(text)
    setCopiedCode(text)
    setTimeout(() => setCopiedCode(null), 2000)
    showToast(`Kode ${text} disalin ke clipboard.`)
  }

  // Ekspor Data CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Nama Produk', 'Kategori', 'Harga Rp', 'Bobot', 'Produsen', 'Desa Asal', 'Stok', 'Status', 'Kode Batch']
    const rows = products.map((p) => [
      p.id,
      `"${p.name.replace(/"/g, '""')}"`,
      p.category,
      p.priceRp,
      `"${p.weight}"`,
      `"${p.producer.replace(/"/g, '""')}"`,
      `"${p.originVillage.replace(/"/g, '""')}"`,
      p.stockQty,
      p.isPublished ? 'PUBLISHED' : 'DRAFT',
      `"${p.batchCode}"`,
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `Katalog_Marketplace_Banda_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast('Berkas CSV katalog berhasil diunduh.')
  }

  // Filter produk
  const filteredProducts = products.filter((p) => {
    const matchCategory = categoryFilter === 'ALL' || p.category === categoryFilter
    const matchSearch =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.producer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.batchCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.originVillage.toLowerCase().includes(searchQuery.toLowerCase())
    const matchStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && p.isPublished) ||
      (statusFilter === 'DRAFT' && !p.isPublished) ||
      (statusFilter === 'LOW_STOCK' && p.stockQty <= 20)
    return matchCategory && matchSearch && matchStatus
  })

  // Filter pesanan
  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter === 'ALL') return true
    return o.status === orderStatusFilter
  })

  // Identifikasi komoditas dengan stok menipis
  const lowStockProducts = products.filter((p) => p.stockQty <= 20)

  // Data Analitik
  const categoryChartData = [
    { name: 'Rempah Pala & Fuli', revenue: 112500000, volumeKg: 1420 },
    { name: 'Hasil Laut Nelayan', revenue: 44500000, volumeKg: 850 },
    { name: 'Olahan & Atsiri', revenue: 27500000, volumeKg: 340 },
  ]

  const destinationShareData = [
    { name: 'Ekspor Mancanegara (Eropa & Asia)', value: 45, color: '#F4B75E' },
    { name: 'Domestik Jawa, Bali & Makassar', value: 35, color: '#0284C7' },
    { name: 'Lokal Maluku & Wisatawan Neira', value: 20, color: '#10B981' },
  ]

  const villageProvenanceData = [
    { village: 'Desa Lonthoir (Banda Besar)', commodity: 'Pala & Fuli Grade A', sharePct: 42, activeFarms: 14 },
    { village: 'Desa Selamon (Banda Besar)', commodity: 'Fuli Super & Ikan Asar', sharePct: 24, activeFarms: 8 },
    { village: 'Desa Pulau Ai', commodity: 'Pala Organik Agroforestri', sharePct: 18, activeFarms: 6 },
    { village: 'Desa Boiyauw & Nusantara', commodity: 'Atsiri, Olahan Sirup & Manisan', sharePct: 16, activeFarms: 6 },
  ]

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 text-white p-2.5 rounded-xl shadow-xl border border-slate-800 text-xs backdrop-blur-md">
          {label && <p className="font-bold text-[#F4B75E] mb-1">{label}</p>}
          {payload.map((entry: any, index: number) => (
            <div key={`tooltip-${index}`} className="flex items-center gap-2 my-0.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
              <span className="text-slate-300">{entry.name}:</span>
              <span className="font-bold text-white">{entry.value}</span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  const renderIconBadge = (iconName: MarketplaceProduct['iconName']) => {
    switch (iconName) {
      case 'sparkles':
        return <Sparkles size={16} className="text-amber-600" />
      case 'fish':
        return <Fish size={16} className="text-sky-600" />
      case 'droplet':
        return <Droplets size={16} className="text-indigo-600" />
      case 'coffee':
        return <Coffee size={16} className="text-amber-700" />
      case 'sun':
        return <Sparkles size={16} className="text-amber-600" />
      case 'award':
        return <Award size={16} className="text-emerald-600" />
      case 'leaf':
      default:
        return <Sprout size={16} className="text-emerald-600" />
    }
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in font-sans">
      
      {/* TOAST ALERT */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-[#081D35] text-white border border-[#F4B75E]/40 shadow-2xl flex items-center gap-3 animate-fade-in">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* =========================================================================
          1. HEADER BANNER: BANDA DIGITAL COMMODITY MARKETPLACE & SUPPLY CHAIN
      ========================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-radial from-emerald-100/40 via-amber-50/20 to-transparent rounded-full pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#081D35] text-[#F4B75E] flex items-center justify-center shrink-0 shadow-md border border-[#F4B75E]/30">
              <ShoppingBag size={28} className="stroke-[2.2]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/70 flex items-center gap-1.5">
                  <ShieldCheck size={12} className="text-emerald-700" />
                  Koperasi Serba Usaha Hatta &bull; Perdagangan Komoditas
                </span>
                <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Indikasi Geografis &bull; Smart Contract EVM On-Chain Proof
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#081D35] tracking-tight">
                Tata Kelola Marketplace &amp; Rantai Pasok Rempah Banda
              </h1>
              <p className="text-sm text-slate-600 max-w-2xl mt-1 leading-relaxed">
                Pusat manajemen komoditas unggulan petani &amp; nelayan binaan Koperasi Hatta. Kelola ketersediaan stok, harga acuan desa, verifikasi kode batch blockchain, serta rekapitulasi pesanan pembeli ekspor dan domestik.
              </p>

              <div className="inline-flex items-center gap-2 mt-3 px-3 py-1 bg-emerald-50 border border-emerald-200/80 rounded-lg text-xs font-semibold text-emerald-900">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>Terverifikasi Indikasi Geografis Resmi</span>
                <span className="text-slate-400 font-normal">|</span>
                <span className="text-slate-600 font-medium">Banda Neira (4°31'S 129°54'E)</span>
              </div>
            </div>
          </div>

          {/* Action Header Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {onOpenPublicCatalog && (
              <button
                type="button"
                onClick={onOpenPublicCatalog}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200/90 shadow-2xs transition-colors cursor-pointer"
              >
                <ExternalLink size={15} />
                <span>Lihat Katalog Publik</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200/90 shadow-2xs transition-colors cursor-pointer"
              title="Unduh seluruh katalog ke file CSV"
            >
              <Download size={15} className="text-emerald-600" />
              <span>Ekspor CSV</span>
              <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {products.length}
              </span>
            </button>

            <button
              type="button"
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#081D35] hover:bg-[#0c2a4d] text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm transition-all hover:shadow hover:-translate-y-0.5 cursor-pointer"
            >
              <Plus size={16} className="text-[#F4B75E]" />
              <span>Tambah Komoditas Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. TOP BENTO KPI: 5 BAROMETER TATA KELOLA PERDAGANGAN REMPAH
      ========================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* KPI 1: TOTAL OMZET */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-emerald-500/60 transition-all group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500">Omzet Komoditas</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-700 group-hover:scale-110 transition-transform">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-[#081D35] mb-1">
            Rp {stats.totalRevenueRp.toLocaleString('id-ID')}
          </div>
          <div className="text-xs text-slate-500 mb-2">
            Target Kuartal: Rp 200Jt (92.3%)
          </div>
          <div className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
            <TrendingUp size={11} /> +14.2% MoM
          </div>
        </div>

        {/* KPI 2: KATALOG KOMODITAS */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-amber-500/60 transition-all group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500">Katalog Aktif</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-700 group-hover:scale-110 transition-transform">
              <Package size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-[#081D35] mb-1">
            {stats.activeProductsCount} Komoditas
          </div>
          <div className="text-xs text-slate-500 mb-2">
            8 Ekspor &bull; 10 Domestik
          </div>
          <div className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">
            <CheckCircle2 size={11} /> 100% On-Chain Terdaftar
          </div>
        </div>

        {/* KPI 3: PESANAN & INQUIRY */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-sky-500/60 transition-all group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500">Inquiry Pesanan</span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-700 group-hover:scale-110 transition-transform">
              <Clock size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-[#081D35] mb-1">
            {stats.totalOrdersCount} Transaksi
          </div>
          <div className="text-xs text-slate-500 mb-2">
            {stats.fulfilledRatioPct}% Terpenuhi Logistik
          </div>
          <div className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md">
            <Sparkles size={11} /> 2 Butuh Konfirmasi
          </div>
        </div>

        {/* KPI 4: SMART CONTRACT INTEGRITY */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-indigo-500/60 transition-all group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500">Integritas On-Chain</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-700 group-hover:scale-110 transition-transform">
              <ShieldCheck size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-[#081D35] mb-1">
            100% Sah EVM
          </div>
          <div className="text-xs text-slate-500 mb-2 truncate">
            SpiceRegistry Konsorsium
          </div>
          <div className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
            <ShieldCheck size={11} /> Zero Hash Tampering
          </div>
        </div>

        {/* KPI 5: MITRA PRODUSEN DESA */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-purple-500/60 transition-all group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500">Mitra Produsen</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-700 group-hover:scale-110 transition-transform">
              <Users size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-[#081D35] mb-1">
            {stats.activeFarmersCount} Poktan &amp; KUB
          </div>
          <div className="text-xs text-slate-500 mb-2">
            6 Desa Pesisir Binaan
          </div>
          <div className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
            <TrendingUp size={11} /> 78.5% Royalti Petani
          </div>
        </div>
      </div>

      {/* =========================================================================
          OPERATIONAL ALERT BAR (KEY ALERTS - KPI DASHBOARD DESIGN)
      ========================================================================== */}
      {lowStockProducts.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-800 flex items-center justify-center shrink-0">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-amber-900">
                Peringatan Ambang Batas Stok: {lowStockProducts.length} Komoditas Menipis (&le; 20 unit)
              </h4>
              <p className="text-xs text-amber-800/80 mt-0.5">
                {lowStockProducts.map((p) => p.name).slice(0, 2).join(', ')}
                {lowStockProducts.length > 2 && ` dan ${lowStockProducts.length - 2} lainnya`} memerlukan pasokan tambahan dari kelompok tani binaan.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setActiveTab('catalog')
              setStatusFilter(statusFilter === 'LOW_STOCK' ? 'ALL' : 'LOW_STOCK')
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-700 hover:bg-amber-800 text-white transition-all shadow-xs cursor-pointer shrink-0"
          >
            {statusFilter === 'LOW_STOCK' ? 'Tampilkan Semua Stok' : 'Saring Stok Menipis'}
          </button>
        </div>
      )}

      {/* =========================================================================
          3. TAB SEGMENT NAVIGATION (CONSISTENT WITH OTHER WORKSPACES)
      ========================================================================== */}
      <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80 overflow-x-auto w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('catalog')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'catalog'
              ? 'bg-[#081D35] text-[#F4B75E] shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Package size={16} />
          <span>Katalog &amp; Inventaris ({products.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-[#081D35] text-[#F4B75E] shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Clock size={16} />
          <span>Buku Besar Pesanan ({orders.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'analytics'
              ? 'bg-[#081D35] text-[#F4B75E] shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <BarChart3 size={16} />
          <span>Analitik Pasar &amp; Distribusi</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: MANAJEMEN KATALOG PRODUK (CRUD & INVENTARIS)
      ========================================================================== */}
      {activeTab === 'catalog' && (
        <div className="space-y-4 animate-fade-in">
          {/* Quick Category Chips & Filter Bar */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { key: 'ALL', label: 'Semua Kategori', count: products.length },
                { key: 'REMPAH', label: 'Rempah & Fuli', count: products.filter(p => p.category === 'REMPAH').length },
                { key: 'PERIKANAN', label: 'Hasil Laut', count: products.filter(p => p.category === 'PERIKANAN').length },
                { key: 'OLAHAN', label: 'Olahan Pangan', count: products.filter(p => p.category === 'OLAHAN').length },
                { key: 'ORGANIK', label: 'Organik', count: products.filter(p => p.category === 'ORGANIK').length },
              ].map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setCategoryFilter(c.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    categoryFilter === c.key
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                  }`}
                >
                  <span>{c.label}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-black/10">
                    {c.count}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari komoditas, desa, batch..."
                  className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-[#081D35] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#081D35]/20 focus:border-[#081D35]"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none"
              >
                <option value="ALL">Semua Status</option>
                <option value="ACTIVE">Aktif Publik</option>
                <option value="DRAFT">Draf Internal</option>
                <option value="LOW_STOCK">Stok Kritis (&le; 20)</option>
              </select>
            </div>
          </div>

          {/* Tabel Katalog Komoditas */}
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4">Komoditas &amp; Varian</th>
                    <th className="py-3.5 px-4">Kategori</th>
                    <th className="py-3.5 px-4">Produsen / Desa</th>
                    <th className="py-3.5 px-4">Harga Bersih</th>
                    <th className="py-3.5 px-4">Kemasan</th>
                    <th className="py-3.5 px-4">Stok Gudang</th>
                    <th className="py-3.5 px-4">Status &amp; On-Chain</th>
                    <th className="py-3.5 px-4 text-right">Aksi &amp; Kelola</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200/60">
                              {renderIconBadge(p.iconName)}
                            </div>
                            <div>
                              <span className="font-bold text-[#081D35] block text-xs sm:text-sm">
                                {p.name}
                              </span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="font-mono text-[10px] text-slate-500">
                                  {p.batchCode}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => handleCopyCode(p.batchCode, e)}
                                  className="text-slate-400 hover:text-[#081D35] transition"
                                  title="Salin Kode Batch"
                                >
                                  {copiedCode === p.batchCode ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/80">
                            {p.category}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            <span className="font-semibold text-slate-700 block truncate max-w-[180px]">
                              {p.producer}
                            </span>
                            <span className="text-[10px] text-slate-500 truncate block max-w-[180px]">
                              {p.originVillage}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono font-bold text-[#081D35] tabular-nums">
                          <div>Rp {p.priceRp.toLocaleString('id-ID')}</div>
                          <div className="text-[10px] font-normal text-emerald-700">
                            Est. Royalti Rp {Math.round(p.priceRp * 0.785).toLocaleString('id-ID')}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-slate-600">
                          {p.weight}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className={`inline-flex items-center gap-1 font-mono font-bold text-[11px] px-2 py-0.5 rounded-full border ${
                                p.stockQty > 25
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : p.stockQty > 10
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : 'bg-red-50 text-red-700 border-red-200'
                              }`}>
                                {p.stockQty} unit
                              </span>

                              {/* Quick inline restock helper */}
                              <button
                                type="button"
                                onClick={() => handleQuickRestock(p, 10)}
                                className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 border border-slate-200/80 transition"
                                title="Tambah 10 unit stok cepat"
                              >
                                +10
                              </button>
                            </div>

                            {/* Mini visual stock bar */}
                            <div className="w-20 bg-slate-100 h-1 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  p.stockQty > 25 ? 'bg-emerald-500' : p.stockQty > 10 ? 'bg-amber-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${Math.min(100, (p.stockQty / 50) * 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              p.isPublished
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}>
                              {p.isPublished ? 'Aktif' : 'Draf'}
                            </span>
                            {onPublicVerify && (
                              <button
                                type="button"
                                onClick={() => onPublicVerify(p.verificationToken || p.batchCode)}
                                className="text-[10px] font-mono text-sky-700 hover:underline flex items-center gap-0.5 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200"
                                title="Buka Sertifikat Keaslian Blockchain"
                              >
                                <ShieldCheck size={11} />
                                <span>EVM</span>
                              </button>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleTogglePublish(p)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                              title={p.isPublished ? 'Sembunyikan dari Publik' : 'Tampilkan ke Publik'}
                            >
                              {p.isPublished ? <Eye size={15} /> : <EyeOff size={15} />}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(p)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition"
                              title="Sunting Data Komoditas"
                            >
                              <Edit3 size={15} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(p.id, p.name)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                              title="Hapus Komoditas"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        Tidak ada data komoditas yang sesuai filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: BUKU BESAR PESANAN & INQUIRY PEMBELI (LOGISTIK EKSPEDISI)
      ========================================================================== */}
      {activeTab === 'orders' && (
        <div className="space-y-4 animate-fade-in">
          {/* Filter Bar Pesanan */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { key: 'ALL', label: 'Semua Pesanan' },
                { key: 'PENDING', label: 'Menunggu Konfirmasi' },
                { key: 'PROCESSING', label: 'Diproses Gudang' },
                { key: 'SHIPPED', label: 'Dalam Kapal Pelni' },
                { key: 'COMPLETED', label: 'Selesai Terkirim' },
              ].map((st) => (
                <button
                  key={st.key}
                  type="button"
                  onClick={() => setOrderStatusFilter(st.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    orderStatusFilter === st.key
                      ? 'bg-[#081D35] text-[#F4B75E] shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            <span className="text-xs text-slate-500 font-mono">
              Total <b>{filteredOrders.length}</b> transaksi inquiry aktif
            </span>
          </div>

          {/* List Kartu Pesanan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOrders.map((o) => {
              const cleanPhone = o.customerPhone.replace(/[^0-9]/g, '')
              const waMessage = encodeURIComponent(
                `Halo ${o.customerName}, Koperasi Hatta mengonfirmasi pemesanan komoditas Anda #${o.id}: ${o.quantity} unit ${o.productName} tujuan ${o.destinationCity}. Mohon konfirmasi jadwal pengiriman kapal terdekat.`
              )

              return (
                <div
                  key={o.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3.5 flex flex-col justify-between hover:border-slate-300 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-slate-400 uppercase">
                            ID: {o.id}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(o.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-[#081D35] mt-0.5">
                          {o.customerName}
                        </h4>
                        <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin size={11} className="text-amber-600" /> {o.destinationCity}
                        </span>
                      </div>

                      <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full uppercase border ${
                        o.status === 'COMPLETED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : o.status === 'SHIPPED'
                          ? 'bg-sky-50 text-sky-700 border-sky-200'
                          : o.status === 'PROCESSING'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {o.status}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-slate-800">{o.productName}</span>
                        <span className="font-mono font-bold text-[#081D35]">{o.quantity} unit</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-200/60 pt-1 font-mono">
                        <span className="text-slate-500 text-[11px]">Nilai Transaksi:</span>
                        <span className="font-bold text-[#081D35]">Rp {o.totalPriceRp.toLocaleString('id-ID')}</span>
                      </div>
                      {o.notes && (
                        <p className="text-[11px] text-slate-500 italic pt-0.5">
                          Catatan: "{o.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Kontrol Status & WhatsApp Direct */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    <a
                      href={`https://wa.me/${cleanPhone}?text=${waMessage}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:underline"
                    >
                      <MessageCircle size={14} className="text-emerald-600" />
                      <span>WhatsApp ({o.customerPhone})</span>
                    </a>

                    <div className="flex items-center gap-1.5">
                      <select
                        value={o.status}
                        onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value as any)}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 shadow-2xs focus:outline-none"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="PROCESSING">Processing</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: ANALITIK PASAR & DISTRIBUSI REMPAH (RECHARTS & KPI PROVENANCE)
      ========================================================================== */}
      {activeTab === 'analytics' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Summary Row Analytics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Volume Terdistribusi</span>
              <div className="text-2xl font-black text-[#081D35] mt-1 font-mono">2.610 Kg</div>
              <span className="text-[10px] text-emerald-700 font-semibold">+18% Kuartal Ini</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Rata-Rata Nilai Order</span>
              <div className="text-2xl font-black text-[#081D35] mt-1 font-mono">Rp 1.299.000</div>
              <span className="text-[10px] text-slate-500">Per Transaksi Inquiry</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Waktu Logistik Kapal</span>
              <div className="text-2xl font-black text-[#081D35] mt-1 font-mono">3.2 Hari</div>
              <span className="text-[10px] text-sky-700">Dermaga Banda ke Jawa</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Rasio Royalti Petani</span>
              <div className="text-2xl font-black text-emerald-700 mt-1 font-mono">78.5%</div>
              <span className="text-[10px] text-slate-500">Bagi Hasil Koperasi Fair Trade</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Bar Chart: Omzet per Kategori */}
            <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-[#081D35]">
                    Volume Penjualan Bersih per Kategori Komoditas
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Data transaksi agregat Koperasi Hatta Banda &bull; Kuartal Berjalan 2026
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                  2.610 Kg Terdistribusi
                </span>
              </div>

              <div className="h-64 sm:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => `Rp${v / 1000000}Jt`} />
                    <Tooltip content={customTooltip} />
                    <Bar dataKey="revenue" name="Omzet Penjualan (Rp)" fill="#059669" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Donut Chart: Pangsa Pasar Pengiriman */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-extrabold text-[#081D35]">
                  Pangsa Tujuan Distribusi
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Komparasi pasar ekspor vs domestik
                </p>
              </div>

              <div className="h-56 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={destinationShareData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={5}
                    >
                      {destinationShareData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={customTooltip} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                {destinationShareData.map((d, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-600">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                      {d.name}
                    </span>
                    <span className="font-mono font-bold text-[#081D35]">{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tabel Distribusi Desa Asal (Provenance Table) */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-[#081D35]">
                  Sebaran Pasokan Komoditas Berbasis Desa Kepulauan (Geographic Provenance)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Rekapitulasi kontribusi poktan binaan Koperasi Hatta di 6 desa sentra produksi
                </p>
              </div>
              <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                <ShieldCheck size={14} /> Terverifikasi IG
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Desa Sentra Asal</th>
                    <th className="py-3 px-4">Komoditas Utama</th>
                    <th className="py-3 px-4">Poktan / KUB Aktif</th>
                    <th className="py-3 px-4">Pangsa Volume</th>
                    <th className="py-3 px-4 text-right">Status On-Chain</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {villageProvenanceData.map((v, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-bold text-[#081D35] flex items-center gap-2">
                        <MapPin size={13} className="text-amber-600" />
                        <span>{v.village}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{v.commodity}</td>
                      <td className="py-3 px-4 font-mono text-slate-700">{v.activeFarms} Kelompok Tani</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${v.sharePct}%` }} />
                          </div>
                          <span className="font-mono font-bold text-[11px] text-[#081D35]">{v.sharePct}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          VALID CERT
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          4. MODAL FORM TAMBAH / SUNTING KOMODITAS
      ========================================================================== */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
            
            {/* Header Modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
              <div>
                <h3 className="text-base sm:text-lg font-black text-[#081D35]">
                  {editingProduct ? 'Sunting Data Komoditas Marketplace' : 'Tambah Komoditas Baru ke Marketplace'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Standar Indikasi Geografis &bull; Koperasi Hatta Banda Neira
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Nama Komoditas &amp; Varian *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Pala Banda Grade A Super (Biji Kupas)"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-[#081D35] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#081D35]/20 focus:border-[#081D35]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Kategori Komoditas
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#081D35]/20"
                  >
                    <option value="REMPAH">Rempah &amp; Fuli</option>
                    <option value="PERIKANAN">Hasil Laut Nelayan</option>
                    <option value="OLAHAN">Olahan Pangan &amp; Herbal</option>
                    <option value="ORGANIK">Organik Bersertifikat</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Harga Bersih Koperasi (Rp) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1000}
                    value={formData.priceRp || 0}
                    onChange={(e) => setFormData({ ...formData, priceRp: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-xs font-mono font-bold rounded-xl border border-slate-200 bg-slate-50 text-[#081D35] focus:outline-none focus:ring-2 focus:ring-[#081D35]/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Bobot Kemasan *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.weight || ''}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    placeholder="Contoh: 250 gram / 1 kg"
                    className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-slate-200 bg-slate-50 text-[#081D35] focus:outline-none focus:ring-2 focus:ring-[#081D35]/20"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Stok Gudang (Unit) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.stockQty || 0}
                    onChange={(e) => setFormData({ ...formData, stockQty: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-xs font-mono font-bold rounded-xl border border-slate-200 bg-slate-50 text-[#081D35] focus:outline-none focus:ring-2 focus:ring-[#081D35]/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Produsen / Kelompok Tani *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.producer || ''}
                    onChange={(e) => setFormData({ ...formData, producer: e.target.value })}
                    placeholder="Contoh: Poktan Lonthoir Subur"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-[#081D35] focus:outline-none focus:ring-2 focus:ring-[#081D35]/20"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Desa Sentra Asal
                  </label>
                  <select
                    value={formData.originVillage}
                    onChange={(e) => setFormData({ ...formData, originVillage: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#081D35]/20"
                  >
                    <option value="Desa Lonthoir, Banda Besar">Desa Lonthoir, Banda Besar</option>
                    <option value="Desa Selamon, Banda Besar">Desa Selamon, Banda Besar</option>
                    <option value="Desa Boiyauw, Banda Besar">Desa Boiyauw, Banda Besar</option>
                    <option value="Pulau Ai, Kepulauan Banda">Pulau Ai, Kepulauan Banda</option>
                    <option value="Pulau Hatta, Kepulauan Banda">Pulau Hatta, Kepulauan Banda</option>
                    <option value="Kampung Nelayan Nusantara, Banda Neira">Kampung Nelayan Nusantara, Banda Neira</option>
                    <option value="Desa Pulau Rhun">Desa Pulau Rhun</option>
                    <option value="Desa Dender, Banda Besar">Desa Dender, Banda Besar</option>
                    <option value="Desa Waer, Banda Besar">Desa Waer, Banda Besar</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Kode Batch Blockchain
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={formData.batchCode || ''}
                      onChange={(e) => setFormData({ ...formData, batchCode: e.target.value })}
                      placeholder="Contoh: BN-BTC-2026-001"
                      className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-slate-200 bg-slate-50 text-[#081D35] focus:outline-none focus:ring-2 focus:ring-[#081D35]/20"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, batchCode: `BN-BTC-2026-${Math.floor(100 + Math.random() * 900)}` })}
                      className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:text-emerald-700 hover:bg-slate-200 transition border border-slate-200/60"
                      title="Generate Acak Kode Batch"
                    >
                      <RefreshCw size={13} />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Ikon Tampilan Komoditas
                  </label>
                  <select
                    value={formData.iconName}
                    onChange={(e) => setFormData({ ...formData, iconName: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#081D35]/20"
                  >
                    <option value="leaf">Sprout (Rempah / Pala)</option>
                    <option value="sparkles">Sparkles (Fuli Super)</option>
                    <option value="fish">Fish (Hasil Laut)</option>
                    <option value="droplet">Droplets (Sirup / Olahan)</option>
                    <option value="coffee">Coffee (Minyak Atsiri)</option>
                    <option value="award">Award (Organik)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Deskripsi Singkat &amp; Standar Mutu
                </label>
                <textarea
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Keterangan kadar air, aroma, metode pengeringan, atau keunggulan komoditas..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-[#081D35] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#081D35]/20 leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isPublishedCheck"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-[#081D35]"
                />
                <label htmlFor="isPublishedCheck" className="text-xs font-semibold text-slate-700">
                  Publikasikan langsung ke Katalog Marketplace Pembeli
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold rounded-xl bg-[#081D35] hover:bg-[#0c2a4d] text-[#F4B75E] flex items-center gap-1.5 shadow-sm transition"
                >
                  <Save size={14} />
                  <span>Simpan Komoditas</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default MarketplaceAdminWorkspace
