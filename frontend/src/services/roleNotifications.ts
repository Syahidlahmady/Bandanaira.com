import { RoleKey, DashboardNavTab } from '../views/dashboard/roles/types'

export interface RoleNotificationItem {
  id: string
  roleKey: RoleKey
  title: string
  description: string
  timestamp: string
  category: 'letter' | 'farm' | 'iot' | 'coop' | 'blockchain' | 'tourism' | 'system'
  categoryLabel: string
  read: boolean
  priority: 'high' | 'normal' | 'info'
  targetTab?: DashboardNavTab
  actionLabel?: string
}

export interface RoleNotificationFilterTab {
  key: string
  label: string
  matcher: (item: RoleNotificationItem) => boolean
}

export interface RoleNotificationProfile {
  roleKey: RoleKey
  roleName: string
  roleShortBadge: string
  roleSubtitle: string
  accentColor: string
  filterTabs: RoleNotificationFilterTab[]
}

export interface NotificationContext {
  adminPendingLettersCount?: number
  pendingFarmsCount?: number
  pendingSyncCount?: number
  isOnline?: boolean
  userName?: string
  village?: string
}

export const ROLE_NOTIFICATION_PROFILES: Record<RoleKey, RoleNotificationProfile> = {
  admin: {
    roleKey: 'admin',
    roleName: 'Administrator Sistem',
    roleShortBadge: 'Admin',
    roleSubtitle: 'Pengawasan lintas pilar, integritas konsorsium EVM & telemetri kepulauan',
    accentColor: '#0284C7',
    filterTabs: [
      { key: 'all', label: 'Semua', matcher: () => true },
      { key: 'unread', label: 'Belum Dibaca', matcher: (n) => !n.read },
      { key: 'governance', label: 'Tata Kelola', matcher: (n) => n.category === 'letter' || n.category === 'tourism' },
      { key: 'iot', label: 'Telemetri IoT', matcher: (n) => n.category === 'iot' || n.category === 'system' },
      { key: 'blockchain', label: 'Audit & EVM', matcher: (n) => n.category === 'blockchain' || n.category === 'coop' || n.category === 'farm' },
    ],
  },
  village_officer: {
    roleKey: 'village_officer',
    roleName: 'Petugas Pelayanan Kantor Desa',
    roleShortBadge: 'Petugas Desa',
    roleSubtitle: 'Pelayanan surat warga, verifikasi plot perkebunan & administrasi kependudukan',
    accentColor: '#2563EB',
    filterTabs: [
      { key: 'all', label: 'Semua', matcher: () => true },
      { key: 'unread', label: 'Belum Dibaca', matcher: (n) => !n.read },
      { key: 'letters', label: 'Surat Masuk', matcher: (n) => n.category === 'letter' },
      { key: 'farms', label: 'Validasi Lahan', matcher: (n) => n.category === 'farm' },
      { key: 'population', label: 'Kependudukan & Tamu', matcher: (n) => n.category === 'tourism' || n.category === 'system' || n.category === 'coop' },
    ],
  },
  farmer: {
    roleKey: 'farmer',
    roleName: 'Petani Rempah Pala',
    roleShortBadge: 'Petani Rempah',
    roleSubtitle: 'Pencatatan panen, jemur alami, status mutu & timbangan koperasi',
    accentColor: '#059669',
    filterTabs: [
      { key: 'all', label: 'Semua', matcher: () => true },
      { key: 'unread', label: 'Belum Dibaca', matcher: (n) => !n.read },
      { key: 'harvest', label: 'Panen & Mutu', matcher: (n) => n.category === 'farm' || n.category === 'blockchain' },
      { key: 'coop', label: 'Koperasi & Harga', matcher: (n) => n.category === 'coop' },
      { key: 'services', label: 'Layanan SKU', matcher: (n) => n.category === 'letter' || n.category === 'system' },
    ],
  },
  farmer_group_admin: {
    roleKey: 'farmer_group_admin',
    roleName: 'Ketua Kelompok Tani (Poktan)',
    roleShortBadge: 'Ketua Poktan',
    roleSubtitle: 'Konsolidasi panen anggota, agregasi batch rempah & sertifikasi GI',
    accentColor: '#047857',
    filterTabs: [
      { key: 'all', label: 'Semua', matcher: () => true },
      { key: 'unread', label: 'Belum Dibaca', matcher: (n) => !n.read },
      { key: 'farms', label: 'Lahan Anggota', matcher: (n) => n.category === 'farm' },
      { key: 'batch', label: 'Batch & Mutu', matcher: (n) => n.category === 'blockchain' },
      { key: 'letters', label: 'Administrasi Poktan', matcher: (n) => n.category === 'letter' || n.category === 'system' },
    ],
  },
  coop_manager: {
    roleKey: 'coop_manager',
    roleName: 'Pengelola Koperasi Hatta & Air RO',
    roleShortBadge: 'Koperasi Hatta',
    roleSubtitle: 'Kasir timbangan setoran rempah, bank sampah plastik & dispenser air RO',
    accentColor: '#B45309',
    filterTabs: [
      { key: 'all', label: 'Semua', matcher: () => true },
      { key: 'unread', label: 'Belum Dibaca', matcher: (n) => !n.read },
      { key: 'pos', label: 'Kasir & Timbangan', matcher: (n) => n.category === 'coop' },
      { key: 'water', label: 'Air RO & Sampah', matcher: (n) => n.category === 'iot' || n.category === 'system' },
      { key: 'market', label: 'Marketplace Rempah', matcher: (n) => n.category === 'blockchain' },
    ],
  },
  homestay_operator: {
    roleKey: 'homestay_operator',
    roleName: 'Mitra Usaha & Pengelola Eco-Stay',
    roleShortBadge: 'Mitra Eco-Stay',
    roleSubtitle: 'Pemesanan kamar eco-stay WhatsApp, registrasi tamu 1x24 jam & fasilitas air RO',
    accentColor: '#D97706',
    filterTabs: [
      { key: 'all', label: 'Semua', matcher: () => true },
      { key: 'unread', label: 'Belum Dibaca', matcher: (n) => !n.read },
      { key: 'booking', label: 'Reservasi Tamu', matcher: (n) => n.category === 'tourism' },
      { key: 'amenities', label: 'Air RO & Surya', matcher: (n) => n.category === 'iot' || n.category === 'system' },
      { key: 'catalog', label: 'Oleh-Oleh Tamu', matcher: (n) => n.category === 'coop' || n.category === 'blockchain' },
    ],
  },
  smart_tourism_admin: {
    roleKey: 'smart_tourism_admin',
    roleName: 'Pemandu Budaya & Pokdarwis',
    roleShortBadge: 'Smart Tourism',
    roleSubtitle: 'Kurasi narasi cagar budaya, audio guide dwibahasa & pemandu resmi HPI',
    accentColor: '#0284C7',
    filterTabs: [
      { key: 'all', label: 'Semua', matcher: () => true },
      { key: 'unread', label: 'Belum Dibaca', matcher: (n) => !n.read },
      { key: 'heritage', label: 'Artikel Sejarah', matcher: (n) => n.category === 'tourism' },
      { key: 'guides', label: 'Pemandu & Audio', matcher: (n) => n.category === 'system' || n.category === 'iot' },
      { key: 'events', label: 'Agenda Budaya', matcher: (n) => n.category === 'letter' || n.category === 'coop' },
    ],
  },
  field_surveyor: {
    roleKey: 'field_surveyor',
    roleName: 'Surveyor Lapangan & Operator IoT',
    roleShortBadge: 'Surveyor IoT',
    roleSubtitle: 'Akuisisi survei lapangan dinamis, pemetaan POI & telemetri sensor kepulauan',
    accentColor: '#0284C7',
    filterTabs: [
      { key: 'all', label: 'Semua', matcher: () => true },
      { key: 'unread', label: 'Belum Dibaca', matcher: (n) => !n.read },
      { key: 'iot', label: 'Telemetri IoT', matcher: (n) => n.category === 'iot' },
      { key: 'survey', label: 'Formulir Survei', matcher: (n) => n.category === 'system' },
      { key: 'gis', label: 'Peta Spasial POI', matcher: (n) => n.category === 'farm' || n.category === 'tourism' },
    ],
  },
  resident: {
    roleKey: 'resident',
    roleName: 'Warga Masyarakat Desa',
    roleShortBadge: 'Warga Desa',
    roleSubtitle: 'Permohonan surat mandiri, tabungan koperasi & kuota air bersih RO',
    accentColor: '#081D35',
    filterTabs: [
      { key: 'all', label: 'Semua', matcher: () => true },
      { key: 'unread', label: 'Belum Dibaca', matcher: (n) => !n.read },
      { key: 'letters', label: 'Surat Desa', matcher: (n) => n.category === 'letter' },
      { key: 'coop', label: 'Air RO & Tabungan', matcher: (n) => n.category === 'coop' || n.category === 'iot' },
      { key: 'privacy', label: 'Keamanan Data PDP', matcher: (n) => n.category === 'system' },
    ],
  },
  tourist: {
    roleKey: 'tourist',
    roleName: 'Wisatawan Nusantara & Mancanegara',
    roleShortBadge: 'Wisatawan',
    roleSubtitle: 'Panduan cagar budaya, audio guide GPS & cenderamata rempah QR',
    accentColor: '#F59E0B',
    filterTabs: [
      { key: 'all', label: 'Semua', matcher: () => true },
      { key: 'unread', label: 'Belum Dibaca', matcher: (n) => !n.read },
      { key: 'explore', label: 'Rute & Cagar', matcher: (n) => n.category === 'tourism' },
      { key: 'audio', label: 'Audio Guide GPS', matcher: (n) => n.category === 'system' || n.category === 'iot' },
      { key: 'spices', label: 'Rempah Asli QR', matcher: (n) => n.category === 'blockchain' || n.category === 'coop' },
    ],
  },
}

export function generateRoleNotifications(
  roleKey: RoleKey,
  ctx: NotificationContext = {}
): RoleNotificationItem[] {
  const items: RoleNotificationItem[] = []
  const {
    adminPendingLettersCount = 0,
    pendingFarmsCount = 0,
    pendingSyncCount = 0,
    isOnline = true,
  } = ctx

  switch (roleKey) {
    case 'admin':
      if (adminPendingLettersCount > 0) {
        items.push({
          id: 'admin-letters',
          roleKey: 'admin',
          title: `Permohonan Surat Masuk (${adminPendingLettersCount} Menunggu)`,
          description: `${adminPendingLettersCount} berkas permohonan surat warga memerlukan verifikasi dan tanda tangan sah.`,
          timestamp: '10 menit yang lalu',
          category: 'letter',
          categoryLabel: 'Tata Kelola',
          read: false,
          priority: 'high',
          targetTab: 'letters',
          actionLabel: 'Tinjau Berkas',
        })
      } else {
        items.push({
          id: 'admin-letters-ok',
          roleKey: 'admin',
          title: 'Pelayanan Surat Desa Tertib',
          description: 'Seluruh permohonan administrasi warga telah diverifikasi dan diterbitkan tanpa tunggakan.',
          timestamp: '1 jam yang lalu',
          category: 'letter',
          categoryLabel: 'Tata Kelola',
          read: true,
          priority: 'info',
          targetTab: 'letters',
          actionLabel: 'Buka Surat',
        })
      }

      if (pendingFarmsCount > 0) {
        items.push({
          id: 'admin-farms',
          roleKey: 'admin',
          title: `Verifikasi Lahan Pala (${pendingFarmsCount} Plot Baru)`,
          description: `${pendingFarmsCount} plot perkebunan pala diajukan Poktan untuk sinkronisasi kadastral PostGIS.`,
          timestamp: '25 menit yang lalu',
          category: 'farm',
          categoryLabel: 'Perkebunan',
          read: false,
          priority: 'high',
          targetTab: 'farming',
          actionLabel: 'Validasi Lahan',
        })
      }

      items.push({
        id: 'admin-tourism',
        roleKey: 'admin',
        title: 'Pengawasan Wisata & Tamu Kepulauan',
        description: 'Pemantauan akomodasi eco-stay, direktori pemandu berlisensi HPI, dan registrasi tamu desa.',
        timestamp: '35 menit yang lalu',
        category: 'tourism',
        categoryLabel: 'Pariwisata',
        read: false,
        priority: 'normal',
        targetTab: 'tourism',
        actionLabel: 'Master Wisata',
      })

      items.push({
        id: 'admin-iot',
        roleKey: 'admin',
        title: 'Telemetri IoT 4 Stasiun Normal',
        description: 'Stasiun Neira, Lonthoir, Ay, dan Rhun melaporkan kemurnian air RO 38 PPM & daya PLTS 100%.',
        timestamp: '40 menit yang lalu',
        category: 'iot',
        categoryLabel: 'Infrastruktur',
        read: true,
        priority: 'normal',
        targetTab: 'iot',
        actionLabel: 'Pantau IoT',
      })

      items.push({
        id: 'admin-coop',
        roleKey: 'admin',
        title: 'Sirkularitas Koperasi Hatta & Bank Sampah',
        description: 'Penyetoran sampah plastik terkonversi menjadi kuota air minum RO bersih di dispenser desa.',
        timestamp: '3 jam yang lalu',
        category: 'coop',
        categoryLabel: 'Koperasi',
        read: true,
        priority: 'normal',
        targetTab: 'koperasi',
        actionLabel: 'Buka Kasir',
      })

      items.push({
        id: 'admin-trace',
        roleKey: 'admin',
        title: 'Rantai Pasok Pala Terjangkar EVM',
        description: 'Batch rempah tervalidasi hash SHA-256 kanonikal tanpa data pribadi pada ledger konsorsium.',
        timestamp: '5 jam yang lalu',
        category: 'blockchain',
        categoryLabel: 'Konsorsium EVM',
        read: true,
        priority: 'info',
        targetTab: 'traceability',
        actionLabel: 'Cek Pasok',
      })
      break

    case 'village_officer':
      if (adminPendingLettersCount > 0) {
        items.push({
          id: 'officer-letters',
          roleKey: 'village_officer',
          title: `Permohonan Surat Warga (${adminPendingLettersCount} Berkas Masuk)`,
          description: `${adminPendingLettersCount} permohonan surat keterangan (SKU/Domisili) menunggu verifikasi aparatur.`,
          timestamp: '10 menit yang lalu',
          category: 'letter',
          categoryLabel: 'Surat Masuk',
          read: false,
          priority: 'high',
          targetTab: 'letters',
          actionLabel: 'Tinjau Berkas',
        })
      } else {
        items.push({
          id: 'officer-letters-ok',
          roleKey: 'village_officer',
          title: 'Pelayanan Surat Kantor Desa Tertib',
          description: 'Seluruh permohonan administrasi warga desa telah disetujui dan siap diterbitkan.',
          timestamp: '1 jam yang lalu',
          category: 'letter',
          categoryLabel: 'Surat Masuk',
          read: true,
          priority: 'info',
          targetTab: 'letters',
          actionLabel: 'Buka Surat',
        })
      }

      if (pendingFarmsCount > 0) {
        items.push({
          id: 'officer-farms',
          roleKey: 'village_officer',
          title: `Pengajuan Plot Perkebunan Poktan (${pendingFarmsCount} Menunggu Validasi)`,
          description: `${pendingFarmsCount} plot kebun rempah diajukan kelompok tani untuk pengesahan batas desa.`,
          timestamp: '30 menit yang lalu',
          category: 'farm',
          categoryLabel: 'Batas Lahan',
          read: false,
          priority: 'high',
          targetTab: 'farming',
          actionLabel: 'Validasi Lahan',
        })
      }

      items.push({
        id: 'officer-pop',
        roleKey: 'village_officer',
        title: 'Pemutakhiran Master Data Kependudukan NIK',
        description: 'Data penduduk tersimpan aman dengan enkripsi AES-256 dan kepatuhan UU PDP No. 27/2022.',
        timestamp: '2 jam yang lalu',
        category: 'letter',
        categoryLabel: 'Kependudukan',
        read: true,
        priority: 'info',
        targetTab: 'population',
        actionLabel: 'Cek Data Warga',
      })

      items.push({
        id: 'officer-tourism',
        roleKey: 'village_officer',
        title: 'Pengawasan Tamu Menginap 1x24 Jam di Desa',
        description: 'Buku registrasi tamu wisatawan di penginapan wilayah desa terpantau untuk ketertiban.',
        timestamp: '4 jam yang lalu',
        category: 'tourism',
        categoryLabel: 'Ketertiban Desa',
        read: true,
        priority: 'normal',
        targetTab: 'tourism',
        actionLabel: 'Daftar Tamu',
      })
      break

    case 'farmer':
      items.push({
        id: 'farmer-harvest',
        roleKey: 'farmer',
        title: 'Pencatatan Panen Musim Pala Biji & Fuli',
        description: 'Catat hasil panen pala basah atau fuli merah Anda untuk mendapatkan sertifikat batch mutu.',
        timestamp: '15 menit yang lalu',
        category: 'farm',
        categoryLabel: 'Panen Rempah',
        read: false,
        priority: 'high',
        targetTab: 'traceability',
        actionLabel: 'Catat Panen',
      })

      items.push({
        id: 'farmer-farm-valid',
        roleKey: 'farmer',
        title: 'Batas Plot Kebun Pala Tervalidasi Spasial',
        description: 'Plot kebun Anda terhubung ke kelompok tani Lonthoir dan tervalidasi kadastral pada peta GIS.',
        timestamp: '1 jam yang lalu',
        category: 'farm',
        categoryLabel: 'Plot Kebun',
        read: true,
        priority: 'normal',
        targetTab: 'farming',
        actionLabel: 'Lihat Kebun',
      })

      items.push({
        id: 'farmer-coop-price',
        roleKey: 'farmer',
        title: 'Harga Beli Komoditas Pala di Koperasi Hatta',
        description: 'Pala Grade A Rp115.000/kg & Fuli Merah Super Rp240.000/kg siap diterima di kasir timbangan.',
        timestamp: '2 jam yang lalu',
        category: 'coop',
        categoryLabel: 'Harga Koperasi',
        read: true,
        priority: 'normal',
        targetTab: 'koperasi',
        actionLabel: 'Cek Koperasi',
      })

      items.push({
        id: 'farmer-letter-sku',
        roleKey: 'farmer',
        title: 'Layanan Mandiri Surat Keterangan Usaha Tani',
        description: 'Ajukan surat pengantar atau keterangan usaha tani ke kantor desa untuk keperluan KUR bank.',
        timestamp: '3 jam yang lalu',
        category: 'letter',
        categoryLabel: 'Layanan SKU',
        read: true,
        priority: 'info',
        targetTab: 'letters',
        actionLabel: 'Ajukan Surat',
      })
      break

    case 'farmer_group_admin':
      items.push({
        id: 'poktan-farm-queue',
        roleKey: 'farmer_group_admin',
        title: pendingFarmsCount > 0 ? `Plot Kebun Anggota Menunggu (${pendingFarmsCount})` : 'Plot Kebun Anggota Tervalidasi',
        description: pendingFarmsCount > 0
          ? `${pendingFarmsCount} plot perkebunan pala anggota diajukan ke kantor desa untuk sinkronisasi kadastral.`
          : 'Seluruh plot kebun pala anggota kelompok tani terverifikasi pada peta spasial PostGIS.',
        timestamp: '20 menit yang lalu',
        category: 'farm',
        categoryLabel: 'Lahan Anggota',
        read: pendingFarmsCount > 0 ? false : true,
        priority: pendingFarmsCount > 0 ? 'high' : 'normal',
        targetTab: 'farming',
        actionLabel: 'Kelola Lahan',
      })

      items.push({
        id: 'poktan-batch-grading',
        roleKey: 'farmer_group_admin',
        title: 'Grading Mutu & Agregasi Batch Kelompok Tani',
        description: 'Kombinasikan catatan panen petani anggota menjadi batch rempah terverifikasi Indikasi Geografis.',
        timestamp: '1 jam yang lalu',
        category: 'blockchain',
        categoryLabel: 'Batch Mutu',
        read: true,
        priority: 'normal',
        targetTab: 'traceability',
        actionLabel: 'Batch Rempah',
      })

      items.push({
        id: 'poktan-gi-cert',
        roleKey: 'farmer_group_admin',
        title: 'Sertifikasi Indikasi Geografis (GI) Pala Banda',
        description: 'Sertifikat IDG-BN-2026-8101-PL terbit dengan tanda tangan digital resmi aparatur desa.',
        timestamp: '2 jam yang lalu',
        category: 'blockchain',
        categoryLabel: 'Sertifikat GI',
        read: true,
        priority: 'normal',
        targetTab: 'traceability',
        actionLabel: 'Lihat Sertifikat',
      })

      items.push({
        id: 'poktan-letters-rec',
        roleKey: 'farmer_group_admin',
        title: 'Administrasi Surat Rekomendasi Poktan',
        description: 'Permohonan surat pengantar sarana penjemuran higienis dapat diproses bersama aparatur desa.',
        timestamp: '4 jam yang lalu',
        category: 'letter',
        categoryLabel: 'Administrasi',
        read: true,
        priority: 'info',
        targetTab: 'letters',
        actionLabel: 'Buka Surat',
      })
      break

    case 'coop_manager':
      items.push({
        id: 'coop-pos-queue',
        roleKey: 'coop_manager',
        title: 'Kasir Timbangan & Setoran Komoditas Rempah',
        description: 'Layanan penimbangan setoran pala, fuli, cengkeh, dan hasil laut nelayan aktif siap transaksi.',
        timestamp: '10 menit yang lalu',
        category: 'coop',
        categoryLabel: 'Kasir & Timbangan',
        read: false,
        priority: 'high',
        targetTab: 'koperasi',
        actionLabel: 'Buka Kasir',
      })

      items.push({
        id: 'coop-plastic-bank',
        roleKey: 'coop_manager',
        title: 'Penukaran Sampah Botol Plastik (Bank Sampah)',
        description: 'Setoran botol plastik warga ditukar menjadi saldo tabungan atau kuota dispenser air minum RO.',
        timestamp: '35 menit yang lalu',
        category: 'coop',
        categoryLabel: 'Bank Sampah',
        read: false,
        priority: 'normal',
        targetTab: 'koperasi',
        actionLabel: 'Bank Sampah',
      })

      items.push({
        id: 'coop-ro-water-tank',
        roleKey: 'coop_manager',
        title: 'Kapasitas Tangki RO 5.000L & Kualitas TDS',
        description: 'Tangki air minum RO terisi 84% dengan TDS 38 PPM (Standar Air Minum Higienis Sangat Baik).',
        timestamp: '1 jam yang lalu',
        category: 'iot',
        categoryLabel: 'Dispenser RO',
        read: true,
        priority: 'normal',
        targetTab: 'iot',
        actionLabel: 'Pantau Tangki',
      })

      items.push({
        id: 'coop-marketplace-stock',
        roleKey: 'coop_manager',
        title: 'Manajemen Inventaris Marketplace Rempah',
        description: 'Pantau stok produk olahan manisan pala, sirup, dan kemasan siap kirim di etalase pasar.',
        timestamp: '3 jam yang lalu',
        category: 'blockchain',
        categoryLabel: 'Marketplace',
        read: true,
        priority: 'info',
        targetTab: 'marketplace',
        actionLabel: 'Cek Stok Toko',
      })
      break

    case 'homestay_operator':
      items.push({
        id: 'homestay-booking-wa',
        roleKey: 'homestay_operator',
        title: 'Pemesanan Kamar Eco-Stay WhatsApp Siap',
        description: 'Sistem pemesanan kamar terhubung langsung ke WhatsApp untuk konfirmasi ketersediaan tamu.',
        timestamp: '15 menit yang lalu',
        category: 'tourism',
        categoryLabel: 'Reservasi Tamu',
        read: false,
        priority: 'high',
        targetTab: 'tourism',
        actionLabel: 'Kelola Kamar',
      })

      items.push({
        id: 'homestay-guest-reporting',
        roleKey: 'homestay_operator',
        title: 'Registrasi Tamu Wajib Lapor 1x24 Jam ke Desa',
        description: 'Daftarkan identitas tamu yang baru check-in untuk kepatuhan ketertiban lingkungan desa.',
        timestamp: '30 menit yang lalu',
        category: 'tourism',
        categoryLabel: 'Lapor Tamu',
        read: false,
        priority: 'high',
        targetTab: 'tourism',
        actionLabel: 'Lapor Tamu',
      })

      items.push({
        id: 'homestay-amenities-check',
        roleKey: 'homestay_operator',
        title: 'Standar Fasilitas Air RO & Cadangan Surya',
        description: 'Status keberlanjutan eco-stay Anda terverifikasi dengan air minum RO dan cadangan solar panel.',
        timestamp: '1 jam yang lalu',
        category: 'iot',
        categoryLabel: 'Fasilitas RO',
        read: true,
        priority: 'normal',
        targetTab: 'tourism',
        actionLabel: 'Info Fasilitas',
      })

      items.push({
        id: 'homestay-spices-showcase',
        roleKey: 'homestay_operator',
        title: 'Katalog Cenderamata Rempah untuk Tamu',
        description: 'Rekomendasikan paket oleh-oleh pala bersertifikat blockchain kepada tamu yang menginap.',
        timestamp: '3 jam yang lalu',
        category: 'coop',
        categoryLabel: 'Oleh-Oleh',
        read: true,
        priority: 'info',
        targetTab: 'marketplace',
        actionLabel: 'Buka Katalog',
      })
      break

    case 'smart_tourism_admin':
      items.push({
        id: 'smart-curation-articles',
        roleKey: 'smart_tourism_admin',
        title: 'Kurasi Draf Artikel Sejarah & Cagar Budaya',
        description: 'Draf naskah sejarah Benteng Belgica & Istana Mini siap dikurasi sebelum publikasi di /sejarah.',
        timestamp: '20 menit yang lalu',
        category: 'tourism',
        categoryLabel: 'Artikel Sejarah',
        read: false,
        priority: 'high',
        targetTab: 'tourism',
        actionLabel: 'Buka CMS',
      })

      items.push({
        id: 'smart-audio-guide-update',
        roleKey: 'smart_tourism_admin',
        title: 'Audio Guide Benteng Belgica & Nassau Siap',
        description: 'Audio guide dwibahasa (ID/EN) dapat dipindai wisatawan via QR code titik cagar budaya.',
        timestamp: '1 jam yang lalu',
        category: 'system',
        categoryLabel: 'Audio Guide',
        read: true,
        priority: 'normal',
        targetTab: 'tourism',
        actionLabel: 'Audio Guide',
      })

      items.push({
        id: 'smart-guides-directory',
        roleKey: 'smart_tourism_admin',
        title: 'Direktori Pemandu Wisata Resmi HPI Aktif',
        description: 'Daftar pemandu berlisensi siap mendampingi kunjungan wisatawan menjelajahi pusaka Banda.',
        timestamp: '2 jam yang lalu',
        category: 'tourism',
        categoryLabel: 'Pemandu HPI',
        read: true,
        priority: 'normal',
        targetTab: 'tourism',
        actionLabel: 'Data Pemandu',
      })

      items.push({
        id: 'smart-heritage-calendar',
        roleKey: 'smart_tourism_admin',
        title: 'Kalender Event Budaya Buka Kampung Banda',
        description: 'Penyusunan jadwal atraksi belang adat dan tari cakalele untuk kunjungan wisatawan maritim.',
        timestamp: '4 jam yang lalu',
        category: 'letter',
        categoryLabel: 'Agenda Budaya',
        read: true,
        priority: 'info',
        targetTab: 'tourism',
        actionLabel: 'Kalender Event',
      })
      break

    case 'field_surveyor':
      items.push({
        id: 'surveyor-iot-telemetry',
        roleKey: 'field_surveyor',
        title: 'Telemetri 4 Stasiun Sensor IoT Kepulauan',
        description: 'Stasiun Neira, Lonthoir, Ay, dan Rhun melaporkan sensor TDS dan daya PLTS aktif terkalibrasi.',
        timestamp: '15 menit yang lalu',
        category: 'iot',
        categoryLabel: 'Telemetri IoT',
        read: false,
        priority: 'high',
        targetTab: 'iot',
        actionLabel: 'Pantau IoT',
      })

      items.push({
        id: 'surveyor-form-task',
        roleKey: 'field_surveyor',
        title: 'Penugasan Formulir Survei Lapangan Baru',
        description: 'Formulir akuisisi data NoSQL siap digunakan untuk pendataan kondisi infrastruktur pulau.',
        timestamp: '45 menit yang lalu',
        category: 'system',
        categoryLabel: 'Form Survei',
        read: false,
        priority: 'normal',
        targetTab: 'survei',
        actionLabel: 'Form Survei',
      })

      items.push({
        id: 'surveyor-poi-gis',
        roleKey: 'field_surveyor',
        title: 'Validasi Titik Koordinat Spasial PostGIS',
        description: 'Titik koordinat fasilitas umum dan zonasi pulau siap disinkronkan ke layer PostGIS 7-tingkat.',
        timestamp: '2 jam yang lalu',
        category: 'farm',
        categoryLabel: 'Peta Spasial',
        read: true,
        priority: 'info',
        targetTab: 'gis',
        actionLabel: 'Peta Spasial',
      })

      items.push({
        id: 'surveyor-sensor-calibration',
        roleKey: 'field_surveyor',
        title: 'Jadwal Pembersihan Probe Sensor Air RO',
        description: 'Pembersihan berkala probe sensor salinitas Pulau Ay direncanakan akhir pekan ini.',
        timestamp: '4 jam yang lalu',
        category: 'iot',
        categoryLabel: 'Kalibrasi Probe',
        read: true,
        priority: 'info',
        targetTab: 'iot',
        actionLabel: 'Cek Kalibrasi',
      })
      break

    case 'resident':
      items.push({
        id: 'resident-letter-req',
        roleKey: 'resident',
        title: 'Permohonan Surat Keterangan Desa Mandiri',
        description: 'Ajukan permohonan surat keterangan domisili, SKU, atau pengantar desa langsung dari ponsel.',
        timestamp: '15 menit yang lalu',
        category: 'letter',
        categoryLabel: 'Surat Mandiri',
        read: false,
        priority: 'high',
        targetTab: 'letters',
        actionLabel: 'Ajukan Surat',
      })

      items.push({
        id: 'resident-water-coop',
        roleKey: 'resident',
        title: 'Tabungan Koperasi & Kuota Air Minum Bersih RO',
        description: 'Cek saldo tabungan setoran sampah plastik dan kuota air minum RO di dispenser pintar desa.',
        timestamp: '1 jam yang lalu',
        category: 'coop',
        categoryLabel: 'Air Bersih RO',
        read: true,
        priority: 'normal',
        targetTab: 'koperasi',
        actionLabel: 'Cek Tabungan',
      })

      items.push({
        id: 'resident-letter-status',
        roleKey: 'resident',
        title: 'Status Permohonan Surat Terakhir Selesai',
        description: 'Surat Keterangan Domisili telah diverifikasi aparat desa dan siap diunduh secara resmi.',
        timestamp: '2 jam yang lalu',
        category: 'letter',
        categoryLabel: 'Riwayat Surat',
        read: true,
        priority: 'normal',
        targetTab: 'letters',
        actionLabel: 'Riwayat Surat',
      })

      items.push({
        id: 'resident-privacy-pdp',
        roleKey: 'resident',
        title: 'Perlindungan Privasi Data Kependudukan NIK',
        description: 'Identitas kependudukan Anda terenkripsi aman sesuai standar UU PDP No. 27/2022.',
        timestamp: '3 jam yang lalu',
        category: 'system',
        categoryLabel: 'Keamanan PDP',
        read: true,
        priority: 'info',
        targetTab: 'letters',
        actionLabel: 'Info Data PDP',
      })
      break

    case 'tourist':
      items.push({
        id: 'tourist-smart-itinerary',
        roleKey: 'tourist',
        title: 'Itinerary Cerdas Cagar Budaya Banda Neira',
        description: 'Jelajahi Benteng Belgica, Rumah Pengasingan Hatta, dan kebun pala pusaka tertua di dunia.',
        timestamp: '10 menit yang lalu',
        category: 'tourism',
        categoryLabel: 'Rencana Wisata',
        read: false,
        priority: 'high',
        targetTab: 'tourism',
        actionLabel: 'Rencana Wisata',
      })

      items.push({
        id: 'tourist-audio-gps',
        roleKey: 'tourist',
        title: 'Audio Guide Peninggalan Sejarah Dekat Anda',
        description: 'Pindai stiker QR pada situs cagar budaya untuk mendengarkan kisah peradaban rempah Banda.',
        timestamp: '40 menit yang lalu',
        category: 'system',
        categoryLabel: 'Audio Guide',
        read: false,
        priority: 'normal',
        targetTab: 'tourism',
        actionLabel: 'Dengar Audio',
      })

      items.push({
        id: 'tourist-spice-verify',
        roleKey: 'tourist',
        title: 'Verifikasi Keaslian Oleh-Oleh Rempah QR',
        description: 'Pastikan oleh-oleh pala dan fuli yang Anda beli memiliki sertifikat Indikasi Geografis resmi.',
        timestamp: '1 jam yang lalu',
        category: 'blockchain',
        categoryLabel: 'Rempah QR',
        read: true,
        priority: 'normal',
        targetTab: 'marketplace',
        actionLabel: 'Cek Rempah QR',
      })

      items.push({
        id: 'tourist-ethics-guideline',
        roleKey: 'tourist',
        title: 'Etika Kunjungan Situs Pusaka & Terumbu Karang',
        description: 'Hormati tradisi adat desa dan jaga kelestarian terumbu karang di spot selam Kepulauan Banda.',
        timestamp: '3 jam yang lalu',
        category: 'tourism',
        categoryLabel: 'Panduan Etika',
        read: true,
        priority: 'info',
        targetTab: 'tourism',
        actionLabel: 'Panduan Etika',
      })
      break

    default:
      break
  }

  // Integrasi status konektivitas offline & antrean sinkronisasi
  if (!isOnline) {
    items.unshift({
      id: `offline-${roleKey}`,
      roleKey,
      title: 'Mode Operasi Offline Aktif',
      description: 'Jaringan kepulauan terputus. Sistem beralih ke cache lokal PWA dan mutasi antrean tersimpan aman.',
      timestamp: 'Baru saja',
      category: 'system',
      categoryLabel: 'Jaringan Offline',
      read: false,
      priority: 'high',
      actionLabel: 'Info Jaringan',
    })
  } else if (pendingSyncCount > 0) {
    items.unshift({
      id: `sync-${roleKey}`,
      roleKey,
      title: `Sinkronisasi Data Lokal (${pendingSyncCount} Item)`,
      description: `${pendingSyncCount} transaksi offline siap disinkronkan ke server komando pusat.`,
      timestamp: 'Baru saja',
      category: 'system',
      categoryLabel: 'Antrean Sinkronisasi',
      read: false,
      priority: 'high',
      actionLabel: 'Sinkronkan',
    })
  }

  return items
}
