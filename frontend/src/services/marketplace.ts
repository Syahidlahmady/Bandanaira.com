export interface MarketplaceProduct {
  id: string
  name: string
  category: 'REMPAH' | 'PERIKANAN' | 'OLAHAN' | 'ORGANIK'
  priceRp: number
  weight: string
  producer: string
  originVillage: string
  batchCode: string
  verificationToken: string
  ipfsCid: string
  iconName: 'leaf' | 'sparkles' | 'fish' | 'droplet' | 'coffee' | 'package' | 'award' | 'sun'
  imageUrl?: string
  description: string
  stockQty: number
  isPublished: boolean
  rating: number
  salesCount: number
}

export interface OrderInquiry {
  id: string
  customerName: string
  customerPhone: string
  destinationCity: string
  productId: string
  productName: string
  quantity: number
  totalPriceRp: number
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'COMPLETED'
  createdAt: string
  notes?: string
}

export interface MarketplaceStats {
  totalRevenueRp: number
  activeProductsCount: number
  totalOrdersCount: number
  fulfilledRatioPct: number
  activeFarmersCount: number
}

export const INITIAL_MARKETPLACE_PRODUCTS: MarketplaceProduct[] = [
  {
    id: 'prod-1',
    name: 'Pala Banda Grade A Super (Biji Kupas Utuh)',
    category: 'REMPAH',
    priceRp: 75000,
    weight: '250 gram',
    producer: 'Poktan Lonthoir Subur (Usman Alkatiri)',
    originVillage: 'Desa Lonthoir, Banda Besar',
    batchCode: 'BN-BTC-2026-001',
    verificationToken: 'BN_VERIFY_PALA_SUPER_2026_LONTHOIR',
    ipfsCid: 'QmPalaBandaSuperGradeALonthoir2026CertCid',
    iconName: 'leaf',
    imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80',
    description: 'Biji pala petik ranum kebun lereng vulkanik Banda, dijemur surya alami 6 hari dengan kadar air <10%. Terverifikasi Indikasi Geografis.',
    stockQty: 45,
    isPublished: true,
    rating: 4.9,
    salesCount: 88,
  },
  {
    id: 'prod-2',
    name: 'Fuli Merah Murni Banda (Bunga Pala Ekspor)',
    category: 'REMPAH',
    priceRp: 95000,
    weight: '100 gram',
    producer: 'Marni Kelirey (Sentra Olahan Fuli Selamon)',
    originVillage: 'Desa Selamon, Banda Besar',
    batchCode: 'BN-BTC-2026-002',
    verificationToken: 'BN_VERIFY_FULI_MERAH_2026_BELGICA',
    ipfsCid: 'QmFuliMerahBandaBelgicaPremiumGradeCert',
    iconName: 'sparkles',
    imageUrl: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=600&q=80',
    description: 'Bunga pala merah cerah utuh tanpa pengawet. Aroma khas wangi pala murni untuk bahan masakan gourmet dan farmasi aromaterapi.',
    stockQty: 28,
    isPublished: true,
    rating: 5.0,
    salesCount: 64,
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
    iconName: 'fish',
    imageUrl: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?auto=format&fit=crop&w=600&q=80',
    description: 'Tangkapan segar Laut Banda Zona 4 diasap lambat 12 jam menggunakan arang tempurung pala dan kayu kenari aromatik khas Banda. Bebas formalin.',
    stockQty: 32,
    isPublished: true,
    rating: 4.8,
    salesCount: 112,
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
    iconName: 'fish',
    imageUrl: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&w=600&q=80',
    description: 'Tuna sirip kuning segar hasil pancing ulur ramah lingkungan (handline). Rantai dingin terkontrol 0-2°C langsung dari kapal pendaratan.',
    stockQty: 18,
    isPublished: true,
    rating: 4.9,
    salesCount: 42,
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
    iconName: 'droplet',
    imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
    description: 'Ekstrak daging buah pala segar kaya antioksidan dengan gula tebu alami. Minuman khas penyegar dahaga pulau dengan cita rasa eksotis.',
    stockQty: 50,
    isPublished: true,
    rating: 4.7,
    salesCount: 95,
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
    iconName: 'coffee',
    imageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=600&q=80',
    description: 'Minyak atsiri hasil suling uap biji pala pilihan lereng Hatta dengan kadar myristicin tinggi. Digunakan untuk aromaterapi dan relaksasi alami.',
    stockQty: 22,
    isPublished: true,
    rating: 5.0,
    salesCount: 38,
  },
  {
    id: 'prod-7',
    name: 'Manisan Basah & Kering Daging Buah Pala',
    category: 'OLAHAN',
    priceRp: 40000,
    weight: '300 gram',
    producer: 'Kelompok Ibu Tani Pusaka Boiyauw',
    originVillage: 'Desa Boiyauw, Banda Besar',
    batchCode: 'BN-BTC-2026-007',
    verificationToken: 'BN_VERIFY_MANISAN_PALA_2026_BOIYAUW',
    ipfsCid: 'QmManisanPalaBoiyauwBandaPusakaTradisi2026',
    iconName: 'sun',
    imageUrl: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=600&q=80',
    description: 'Olahan daging buah pala manis pedas hangat khas resep leluhur Banda Neira. Camilan sehat bebas bahan pewarna kimia.',
    stockQty: 35,
    isPublished: true,
    rating: 4.8,
    salesCount: 76,
  },
  {
    id: 'prod-8',
    name: 'Biji Pala Organik Bersertifikasi Pulau Ai',
    category: 'ORGANIK',
    priceRp: 140000,
    weight: '500 gram (Vacuum Sealed)',
    producer: 'Poktan Mandiri Organik Ai',
    originVillage: 'Pulau Ai, Kepulauan Banda',
    batchCode: 'BN-BTC-2026-003',
    verificationToken: 'BN_VERIFY_PALA_ORGANIK_PULAU_AI',
    ipfsCid: 'QmPalaOrganikPulauAiEcoCertEVM2026',
    iconName: 'award',
    imageUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80',
    description: 'Pala organik dari sistem agroforestri tradisional tanpa pupuk sintesis. Lolos sertifikasi mutu ekspor organik Uni Eropa dan Jepang.',
    stockQty: 15,
    isPublished: true,
    rating: 5.0,
    salesCount: 52,
  },
]

export const INITIAL_ORDER_INQUIRIES: OrderInquiry[] = [
  {
    id: 'inq-101',
    customerName: 'Hendrik van Dijk',
    customerPhone: '+31 6 12345678',
    destinationCity: 'Rotterdam, Belanda (Ekspor)',
    productId: 'prod-1',
    productName: 'Pala Banda Grade A Super (Biji Kupas Utuh)',
    quantity: 40,
    totalPriceRp: 3000000,
    status: 'PROCESSING',
    createdAt: '2026-11-20T10:30:00Z',
    notes: 'Permintaan batch sertifikat Indikasi Geografis & Phytosanitary resmi.',
  },
  {
    id: 'inq-102',
    customerName: 'PT Rempah Nusantara Abadi',
    customerPhone: '+62 811 2345 6789',
    destinationCity: 'Surabaya, Jawa Timur',
    productId: 'prod-2',
    productName: 'Fuli Merah Murni Banda (Bunga Pala Ekspor)',
    quantity: 15,
    totalPriceRp: 1425000,
    status: 'SHIPPED',
    createdAt: '2026-11-19T14:15:00Z',
    notes: 'Pengiriman via Kapal Pelni KM Nggapulu Pelabuhan Banda Neira.',
  },
  {
    id: 'inq-103',
    customerName: 'Siti Rahmawati',
    customerPhone: '+62 821 9876 5432',
    destinationCity: 'Ambon, Maluku',
    productId: 'prod-5',
    productName: 'Sirup Buah Pala Murni Asli Banda Neira',
    quantity: 8,
    totalPriceRp: 280000,
    status: 'COMPLETED',
    createdAt: '2026-11-18T09:00:00Z',
    notes: 'Oleh-oleh khas untuk delegasi Festival Budaya Banda Neira.',
  },
  {
    id: 'inq-104',
    customerName: 'Aromatherapy Studio Kyoto',
    customerPhone: '+81 90 8765 4321',
    destinationCity: 'Kyoto, Jepang (Ekspor)',
    productId: 'prod-6',
    productName: 'Minyak Atsiri Pala Banda (Pure Essential Oil)',
    quantity: 10,
    totalPriceRp: 1200000,
    status: 'PENDING',
    createdAt: '2026-11-22T16:45:00Z',
    notes: 'Memerlukan hasil uji GC-MS lab Koperasi Hatta.',
  },
]

const STORAGE_KEY_PRODUCTS = 'banda_marketplace_products_v1'
const STORAGE_KEY_ORDERS = 'banda_marketplace_orders_v1'

export const marketplaceService = {
  getProducts(): MarketplaceProduct[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_PRODUCTS)
      if (data) {
        const parsed = JSON.parse(data)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item: MarketplaceProduct) => {
            if (!item.imageUrl) {
              const initial = INITIAL_MARKETPLACE_PRODUCTS.find((p) => p.id === item.id)
              if (initial?.imageUrl) {
                return { ...item, imageUrl: initial.imageUrl }
              }
            }
            return item
          })
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_MARKETPLACE_PRODUCTS
  },

  saveProducts(products: MarketplaceProduct[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products))
      window.dispatchEvent(new Event('banda_marketplace_updated'))
    } catch (err) {
      console.warn('Gagal menyimpan produk marketplace ke localStorage', err)
    }
  },

  upsertProduct(product: Partial<MarketplaceProduct> & { name: string }): MarketplaceProduct {
    const list = this.getProducts()
    let saved: MarketplaceProduct

    if (product.id) {
      const idx = list.findIndex((p) => p.id === product.id)
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...product } as MarketplaceProduct
        saved = list[idx]
      } else {
        saved = {
          ...product,
          id: product.id,
          category: product.category || 'REMPAH',
          priceRp: product.priceRp || 50000,
          weight: product.weight || '250 gram',
          producer: product.producer || 'Petani Mandiri Banda',
          originVillage: product.originVillage || 'Desa Lonthoir, Banda Besar',
          batchCode: product.batchCode || `BN-BTC-2026-00${list.length + 1}`,
          verificationToken: product.verificationToken || `BN_VERIFY_KOMODITAS_2026_${Date.now()}`,
          ipfsCid: product.ipfsCid || `QmBandaRempahKomoditas${Date.now()}`,
          iconName: product.iconName || 'leaf',
          description: product.description || 'Komoditas asli kepulauan Banda Neira.',
          stockQty: product.stockQty || 20,
          isPublished: product.isPublished !== undefined ? product.isPublished : true,
          rating: product.rating || 5.0,
          salesCount: product.salesCount || 0,
        }
        list.push(saved)
      }
    } else {
      const newId = `prod-${Date.now()}`
      saved = {
        id: newId,
        name: product.name,
        category: product.category || 'REMPAH',
        priceRp: product.priceRp || 50000,
        weight: product.weight || '250 gram',
        producer: product.producer || 'Petani Mandiri Banda',
        originVillage: product.originVillage || 'Desa Lonthoir, Banda Besar',
        batchCode: product.batchCode || `BN-BTC-2026-00${list.length + 1}`,
        verificationToken: product.verificationToken || `BN_VERIFY_KOMODITAS_2026_${Date.now()}`,
        ipfsCid: product.ipfsCid || `QmBandaRempahKomoditas${Date.now()}`,
        iconName: product.iconName || 'leaf',
        description: product.description || 'Komoditas asli kepulauan Banda Neira.',
        stockQty: product.stockQty || 20,
        isPublished: product.isPublished !== undefined ? product.isPublished : true,
        rating: product.rating || 5.0,
        salesCount: product.salesCount || 0,
      }
      list.unshift(saved)
    }

    this.saveProducts(list)
    return saved
  },

  deleteProduct(id: string): void {
    const list = this.getProducts().filter((p) => p.id !== id)
    this.saveProducts(list)
  },

  togglePublish(id: string): void {
    const list = this.getProducts().map((p) => {
      if (p.id === id) {
        return { ...p, isPublished: !p.isPublished }
      }
      return p
    })
    this.saveProducts(list)
  },

  getOrders(): OrderInquiry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_ORDERS)
      if (data) {
        const parsed = JSON.parse(data)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch {
      // fallback
    }
    return INITIAL_ORDER_INQUIRIES
  },

  saveOrders(orders: OrderInquiry[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders))
      window.dispatchEvent(new Event('banda_marketplace_orders_updated'))
    } catch (err) {
      console.warn('Gagal menyimpan pesanan ke localStorage', err)
    }
  },

  updateOrderStatus(orderId: string, status: OrderInquiry['status']): void {
    const list = this.getOrders().map((o) => {
      if (o.id === orderId) {
        return { ...o, status }
      }
      return o
    })
    this.saveOrders(list)
  },

  getStats(): MarketplaceStats {
    const products = this.getProducts()
    const orders = this.getOrders()

    const totalRevenue = orders
      .filter((o) => o.status === 'COMPLETED' || o.status === 'SHIPPED')
      .reduce((sum, o) => sum + o.totalPriceRp, 184500000)

    return {
      totalRevenueRp: totalRevenue,
      activeProductsCount: products.filter((p) => p.isPublished).length,
      totalOrdersCount: 142 + orders.length,
      fulfilledRatioPct: 98.6,
      activeFarmersCount: 34,
    }
  },
}
