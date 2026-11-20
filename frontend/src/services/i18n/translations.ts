export type Language = 'id' | 'en'

export interface TranslationDictionary {
  navbar: {
    home: string
    spatialMap: string
    tourismSaw: string
    ecoStay: string
    cooperative: string
    citizenServices: string
    signIn: string
    register: string
    signOut: string
    dashboard: string
    myDashboard: string
    navHome: string
    navMap: string
    navDestinations: string
    navAccommodations: string
    navMarketplace: string
    navHistory: string
  }
  hero: {
    badge: string
    title1: string
    title2: string
    subtitle: string
    exploreBtn: string
    watchHeritageBtn: string
    centerTitle: string
    headlineLine1: string
    headlineLine2: string
    description: string
    ctaExplore: string
    ctaMap: string
  }
  gallery: {
    tagline: string
    title: string
  }
  mapSection: {
    tagline: string
    heading: string
    loading: string
    description: string
    openFullMap: string
  }
  tourismSaw: {
    tagline: string
    headingPrefix: string
    headingScript: string
    headingSuffix: string
    exploreAllBtn: string
    smartPlannerBtn: string
    prevDest: string
    nextDest: string
    bookWhatsapp: string
  }
  ecoStay: {
    tagline: string
    headingPrefix: string
    headingScript: string
    description: string
    viewMore: string
    prev: string
    next: string
    night: string
    cleanWater: string
    solarBackup: string
    verified: string
    bookWhatsapp: string
    filterAll: string
    filterNeira: string
    filterBesar: string
    filterHatta: string
  }
  stats: {
    historicalTourism: string
    natureTourism: string
    totalDestinations: string
    accommodations: string
  }
  traceability: {
    tagline: string
    headingPrefix: string
    headingScript: string
    headingSuffix: string
    description: string
    viewMore: string
    checkQrBatch: string
  }
  demographics: {
    inhabitedIslands: string
    archipelagoVillages: string
    totalPopulation: string
    integratedEcosystem: string
  }
  planYourVisit: {
    quoteAuthor: string
    quote: string
    exploreBtn: string
    openMapBtn: string
  }
  heritage: {
    sectionBadge: string
    heading: string
    subheading: string
    audioPlayerTitle: string
    audioPlaying: string
    audioSubtitleBadge: string
    stories: {
      pala: {
        title: string
        subtitle: string
        desc: string
      }
      belgica: {
        title: string
        subtitle: string
        desc: string
      }
      rhun: {
        title: string
        subtitle: string
        desc: string
      }
      hatta: {
        title: string
        subtitle: string
        desc: string
      }
    }
  }
  cagarBudaya: {
    tabTitle: string
    filterIsland: string
    periodLabel: string
    audioGuideLabel: string
    audioGuidePlaying: string
    narrativeSubtitleLabel: string
  }
  footer: {
    brandDesc: string
    location: string
    groupExplore: string
    groupServices: string
    groupAccess: string
    navResidents: string
    navSmes: string
    navCoop: string
    navStays: string
    registerNew: string
    signIn: string
    resident: string
    homestayPartner: string
    operator: string
    allRightsReserved: string
    taglineQuote: string
    privacyPolicy: string
    termsOfUse: string
  }
  chatbot: {
    triggerLabel: string
    headerTitle: string
    headerSubtitle: string
    closeChat: string
    welcomeMsg: string
    justNow: string
    matchPercent: string
    tariff: string
    viewPlace: string
    quickTopRec: string
    quickTopQuery: string
    quickMarine: string
    quickMarineQuery: string
    quickHeritage: string
    quickHeritageQuery: string
    quickBudget: string
    quickBudgetQuery: string
    inputPlaceholder: string
    sendBtn: string
  }
  gisMap: {
    searchPlaceholder: string
    allIslands: string
    neiraIsland: string
    greatBanda: string
    hattaIsland: string
    ayIsland: string
    rhunIsland: string
    recenterMap: string
    fullscreen: string
    exitFullscreen: string
    mapStyles: string
    baseMap: string
    standard: string
    standardSubtitle: string
    satellite: string
    satelliteSubtitle: string
    terrain: string
    terrainSubtitle: string
    placeAndStreetNames: string
    mapOverlays: string
    villageTerritories: string
    villagesCount: string
    densityHeatmap: string
    maritimeRoutes: string
    active: string
    off: string
    empty: string
    openLegend: string
    mapLegend: string
    selectAll: string
    clearAll: string
    layers: {
      tourism: string
      heritage: string
      accommodation: string
      smes: string
      publicSafety: string
      waterInfra: string
      energyWaste: string
    }
    densityLegendTitle: string
    densitySparse: string
    densityMedium: string
    densityDense: string
    densityHigh: string
    spatialProjection: string
    view360Panorama: string
    focusMap: string
    copyCoords: string
    coordsCopied: string
    waContact: string
    audioGuide: string
    aboutThisDestination: string
    operatingHours: string
    nationalHeritage: string
    waterQuality: string
    communalTank: string
    full: string
    stayRate: string
    perNight: string
    cleanWaterRO: string
    solarElectricity: string
    solarCapacity: string
    program: string
    commoditiesFocus: string
    assistedSMEsList: string
    registeredSMEs: string
    establishedYear: string
    workforce: string
    routeLength: string
    travelTime: string
    transportMode: string
    routePath: string
    closeDetails: string
    villageCard: {
      island: string
      population: string
      area: string
      density: string
      commodityPotential: string
      highlights: string
      officialStats: string
      recorded: string
      male: string
      female: string
      households: string
      mainOccupation: string
      activeSMEsRecorded: string
      focus: string
      close: string
    }
  }
  common: {
    language: string
    id: string
    en: string
    loading: string
    selectLanguage: string
  }
}

export const translations: Record<Language, TranslationDictionary> = {
  id: {
    navbar: {
      home: 'Beranda',
      spatialMap: 'Peta Spasial',
      tourismSaw: 'Wisata (SAW)',
      ecoStay: 'Eco-Stay',
      cooperative: 'Koperasi & UMKM',
      citizenServices: 'Layanan Warga',
      signIn: 'Masuk',
      register: 'Daftar',
      signOut: 'Keluar',
      dashboard: 'Dasbor Ekosistem',
      myDashboard: 'Dasbor Ekosistem Saya',
      navHome: 'Beranda',
      navMap: 'Peta',
      navDestinations: 'Destinasi',
      navAccommodations: 'Penginapan',
      navMarketplace: 'Marketplace',
      navHistory: 'Sejarah & Warga',
    },
    hero: {
      badge: 'Ekosistem Digital Kepulauan Banda Neira',
      title1: 'Jelajahi Sejarah Rempah,',
      title2: 'Cagar Budaya & Keaslian Alam',
      subtitle:
        'Satu pintu digital terpadu untuk penjelajahan pulau, panduan 177 cagar budaya, pemesanan eco-stay ramah lingkungan, dan ketelusuran pala Banda.',
      exploreBtn: 'Jelajahi Banda Sekarang',
      watchHeritageBtn: 'Telusuri Sejarah Rempah',
      centerTitle: 'Di jantung rempah dunia',
      headlineLine1: 'Di jantung rempah dunia,',
      headlineLine2: 'temukan Banda.',
      description:
        'Laut yang menyimpan keajaiban karang purba. Jejak benteng kolonial yang hidup. Satu pintu digital untuk menjelajah ekosistem pulau, pemetaan cagar budaya, dan kearifan masyarakat Banda.',
      ctaExplore: 'Mulai jelajahi Banda',
      ctaMap: 'Lihat peta interaktif',
    },
    gallery: {
      tagline: 'Jelajahi Keindahan',
      title: 'Banda Neira',
    },
    mapSection: {
      tagline: 'JELAJAHI DESTINASI DAN CAGAR BUDAYA UTAMA',
      heading: 'Visit Banda Neira',
      loading: 'Menyiapkan Peta Spasial Banda Neira...',
      description: 'Eksplorasi spasial cagar budaya, potensi bahari, penginapan warga, dan fasilitas pulau.',
      openFullMap: 'Buka Peta Layar Penuh',
    },
    tourismSaw: {
      tagline: 'SPOTLIGHT KURASI BANDA',
      headingPrefix: 'Jelajahi Permata',
      headingScript: 'Ikonik',
      headingSuffix: 'Banda Neira',
      exploreAllBtn: 'Jelajahi Semua Destinasi',
      smartPlannerBtn: 'Panduan Wisata Cerdas',
      prevDest: 'Destinasi Sebelumnya',
      nextDest: 'Destinasi Berikutnya',
      bookWhatsapp: 'Hubungi Pemandu',
    },
    ecoStay: {
      tagline: 'DIREKTORI PENGINAPAN & ECO-STAY',
      headingPrefix: 'Peraduan Nyaman di',
      headingScript: 'Pulau Rempah',
      description: 'Dikelola langsung oleh warga pulau dengan jaminan air minum RO dan cadangan listrik ramah lingkungan.',
      viewMore: 'Selengkapnya',
      prev: 'Geser ke kiri',
      next: 'Geser ke kanan',
      night: 'malam',
      cleanWater: 'Air Minum RO',
      solarBackup: 'Listrik Surya',
      verified: 'Terverifikasi',
      bookWhatsapp: 'Pesan via WhatsApp',
      filterAll: 'Semua Pulau',
      filterNeira: 'Pulau Neira',
      filterBesar: 'Banda Besar',
      filterHatta: 'Pulau Hatta',
    },
    stats: {
      historicalTourism: 'Wisata Sejarah',
      natureTourism: 'Wisata Alam',
      totalDestinations: 'Total Destinasi',
      accommodations: 'Penginapan',
    },
    traceability: {
      tagline: 'MARKETPLACE UMKM & REMPAH BANDA',
      headingPrefix: 'Hasil Bumi &',
      headingScript: 'Rempah Pilihan',
      headingSuffix: 'Warga Banda',
      description: 'Komoditas asli langsung dari petani kebun dan nelayan pulau dengan jaminan keaslian serta catatan asal panen.',
      viewMore: 'Selengkapnya',
      checkQrBatch: 'Cek QR Batch',
    },
    demographics: {
      inhabitedIslands: 'Pulau Berpenghuni',
      archipelagoVillages: 'Desa Kepulauan',
      totalPopulation: 'Total Penduduk',
      integratedEcosystem: 'Ekosistem Terpadu',
    },
    planYourVisit: {
      quoteAuthor: 'SUTAN SJAHRIR • BANDA NEIRA 1936',
      quote: '“Jangan mati sebelum ke Banda Neira!”',
      exploreBtn: 'Jelajahi Banda Sekarang',
      openMapBtn: 'Buka Peta Interaktif',
    },
    heritage: {
      sectionBadge: 'Narasi Warisan Sejarah Dunia',
      heading: 'Jejak Rempah & Kepulauan Bersejarah',
      subheading: 'Pala, benteng kolonial, dan perjuangan kemerdekaan yang pernah mengguncang diplomasi dunia.',
      audioPlayerTitle: 'Audio Guide Sejarah',
      audioPlaying: 'Sedang Memutar Audio...',
      audioSubtitleBadge: 'Subtitle Audio Guide',
      stories: {
        pala: {
          title: 'Pala yang Dicari Dunia',
          subtitle: 'Myristica fragrans — Komoditas yang Melampaui Nilai Emas',
          desc: 'Dahulu, buah pala hanya tumbuh subur di tanah vulkanik kepulauan Banda. Aromanya yang khas dan khasiatnya yang langka membuat armada samudra dari berbagai belahan bumi berlayar ribuan mil untuk mencarinya. Nilainya saat itu bahkan melampaui emas.',
        },
        belgica: {
          title: 'Benteng Belgica & Jalur Rempah',
          subtitle: 'Benteng Pentagon Karang Abad ke-17 di Puncak Bukit Neira',
          desc: 'Untuk mengamankan monopoli perdagangan pala, benteng segi lima yang kokoh dibangun di atas perbukitan Neira. Dari benteng inilah seluruh perairan selat dan kapal niaga yang melintas di Laut Banda diawasi secara ketat selama ratusan tahun.',
        },
        rhun: {
          title: 'Pulau Rhun & Barter Manhattan',
          subtitle: 'Perjanjian Breda 1667: Pertukaran Pulau Tersepi dengan Jantung Dunia',
          desc: 'Sebuah pulau karang kecil di barat Banda pernah menjadi episentrum sengketa antara Inggris dan Belanda. Demi menguasai pohon pala Pulau Rhun seutuhnya, Belanda rela menukarnya dengan koloni New Amsterdam di Amerika—wilayah yang kini dikenal sebagai Manhattan, New York.',
        },
        hatta: {
          title: 'Pengasingan Bung Hatta',
          subtitle: 'Merajut Gagasan Kemerdekaan Indonesia di Kaki Gunung Api',
          desc: 'Banda Neira juga menyimpan jejak perjuangan kemerdekaan. Di pulau yang tenang ini, Bung Hatta dan Sutan Sjahrir pernah diasingkan. Sambil mengajar anak-anak setempat, mereka terus menulis dan merajut gagasan tentang masa depan Republik Indonesia.',
        },
      },
    },
    cagarBudaya: {
      tabTitle: 'Cagar Budaya & Narasi Sejarah',
      filterIsland: 'Semua Pulau',
      periodLabel: 'Periode',
      audioGuideLabel: 'Audio Guide Sejarah',
      audioGuidePlaying: 'Sedang Memutar Narasi...',
      narrativeSubtitleLabel: 'Subtitle Narasi:',
    },
    footer: {
      brandDesc: 'Banda Smart Tourism & Island Ecosystem. Menghubungkan perjalanan, warisan, dan kehidupan di Kepulauan Banda.',
      location: 'Kepulauan Banda, Maluku, Indonesia',
      groupExplore: 'Jelajahi Banda',
      groupServices: 'Layanan & Wisata',
      groupAccess: 'Akses Akun',
      navResidents: 'Penduduk & Fasilitas',
      navSmes: 'Layanan UMKM',
      navCoop: 'Koperasi Hatta',
      navStays: 'Direktori Eco-Stay',
      registerNew: 'Daftar Akun Baru',
      signIn: 'Masuk / Login',
      resident: 'Layanan Warga',
      homestayPartner: 'Mitra Homestay',
      operator: 'Simulator Operator',
      allRightsReserved: 'Hak cipta dilindungi undang-undang.',
      taglineQuote: 'Dari Banda, untuk dunia.',
      privacyPolicy: 'Kebijakan privasi',
      termsOfUse: 'Syarat penggunaan',
    },
    chatbot: {
      triggerLabel: 'Tanya Rekomendasi Wisata',
      headerTitle: 'Pemandu Wisata Banda',
      headerSubtitle: 'Rekomendasi Cerdas Destinasi',
      closeChat: 'Tutup Chat',
      welcomeMsg: 'Halo! Saya Pemandu Cerdas Banda Neira. Ada yang bisa saya bantu untuk merencanakan liburan impian Anda di Kepulauan Banda?',
      justNow: 'Baru saja',
      matchPercent: 'Kecocokan',
      tariff: 'Tarif',
      viewPlace: 'Lihat Tempat',
      quickTopRec: 'Rekomendasi Utama',
      quickTopQuery: 'Berikan rekomendasi destinasi terbaik di Banda Neira',
      quickMarine: 'Wisata Bahari',
      quickMarineQuery: 'Saya ingin snorkeling dan melihat terumbu karang di laut',
      quickHeritage: 'Benteng Sejarah',
      quickHeritageQuery: 'Rekomendasikan benteng bersejarah dan cagar budaya',
      quickBudget: 'Ramah Anggaran',
      quickBudgetQuery: 'Destinasi yang ramah anggaran di bawah Rp 50.000',
      inputPlaceholder: 'Tanya wisata, budget, atau preferensi...',
      sendBtn: 'Kirim Pesan',
    },
    gisMap: {
      searchPlaceholder: 'Cari tempat...',
      allIslands: 'Semua Pulau',
      neiraIsland: 'Pulau Neira',
      greatBanda: 'Banda Besar',
      hattaIsland: 'Pulau Hatta',
      ayIsland: 'Pulau Ay',
      rhunIsland: 'Pulau Rhun',
      recenterMap: 'Pusatkan kembali ke Kepulauan Banda',
      fullscreen: 'Layar Penuh Peta (Fullscreen)',
      exitFullscreen: 'Keluar dari Layar Penuh (Esc)',
      mapStyles: 'Gaya Peta',
      baseMap: 'Peta Dasar',
      standard: 'Standar',
      standardSubtitle: 'Peta Jalan',
      satellite: 'Satelit',
      satelliteSubtitle: 'Citra Asli Satelit',
      terrain: 'Topografi',
      terrainSubtitle: 'Kontur & Relief Alam',
      placeAndStreetNames: 'Nama Tempat & Jalan',
      mapOverlays: 'Informasi Peta',
      villageTerritories: 'Wilayah Desa',
      villagesCount: '17 Desa',
      densityHeatmap: 'Heatmap Kepadatan',
      maritimeRoutes: 'Jalur Laut',
      active: 'Aktif',
      off: 'Mati',
      empty: 'Kosong',
      openLegend: 'Buka Legenda Atlas',
      mapLegend: 'Legenda Peta',
      selectAll: 'Pilih Semua',
      clearAll: 'Kosongkan',
      layers: {
        tourism: 'Wisata & Bahari',
        heritage: 'Cagar Budaya',
        accommodation: 'Penginapan',
        smes: 'Sentra UMKM',
        publicSafety: 'Fasilitas Umum',
        waterInfra: 'Air Bersih',
        energyWaste: 'Energi & Lingkungan',
      },
      densityLegendTitle: 'Kepadatan Penduduk (jiwa/km²)',
      densitySparse: 'Renggang',
      densityMedium: 'Sedang',
      densityDense: 'Padat',
      densityHigh: 'Tinggi',
      spatialProjection: 'Proyeksi Spasial',
      view360Panorama: 'Lihat Panorama 360°',
      focusMap: 'Fokuskan Peta',
      copyCoords: 'Salin Koordinat',
      coordsCopied: 'Tersalin!',
      waContact: 'Kontak WA',
      audioGuide: 'Audio Guide',
      aboutThisDestination: 'Tentang Destinasi Ini',
      operatingHours: 'Jam Operasional',
      nationalHeritage: 'Cagar Budaya Nasional',
      waterQuality: 'Kualitas Air (TDS)',
      communalTank: 'Tandon Komunal',
      full: 'Penuh',
      stayRate: 'Tarif Menginap',
      perNight: 'malam',
      cleanWaterRO: 'Air Bersih RO',
      solarElectricity: 'Listrik Surya',
      solarCapacity: 'Kapasitas PLTS',
      program: 'Program',
      commoditiesFocus: 'Komoditas / Fokus Produk',
      assistedSMEsList: 'Daftar Pelaku Usaha Binaan',
      registeredSMEs: 'UMKM Terdaftar',
      establishedYear: 'Berdiri',
      workforce: 'Tenaga Kerja',
      routeLength: 'Panjang Lintasan',
      travelTime: 'Waktu Tempuh',
      transportMode: 'Moda',
      routePath: 'Rute',
      closeDetails: 'Tutup',
      villageCard: {
        island: 'Pulau',
        population: 'Populasi',
        area: 'Luas Wilayah',
        density: 'Kepadatan Penduduk',
        commodityPotential: 'Komoditas / Potensi',
        highlights: 'Daya Tarik',
        officialStats: 'Statistik Resmi Desa (2026)',
        recorded: 'Tercatat',
        male: 'Laki-laki',
        female: 'Perempuan',
        households: 'Keluarga',
        mainOccupation: 'Profesi Utama',
        activeSMEsRecorded: 'Unit UMKM Binaan Aktif',
        focus: 'Fokuskan',
        close: 'Tutup Profil Desa',
      },
    },
    common: {
      language: 'Bahasa',
      id: 'Bahasa Indonesia',
      en: 'English',
      loading: 'Memuat...',
      selectLanguage: 'Pilih Bahasa',
    },
  },
  en: {
    navbar: {
      home: 'Home',
      spatialMap: 'Spatial Map',
      tourismSaw: 'Tourism (SAW)',
      ecoStay: 'Eco-Stay',
      cooperative: 'Co-op & SMEs',
      citizenServices: 'Public Services',
      signIn: 'Sign In',
      register: 'Register',
      signOut: 'Sign Out',
      dashboard: 'Ecosystem Dashboard',
      myDashboard: 'My Ecosystem Dashboard',
      navHome: 'Home',
      navMap: 'Map',
      navDestinations: 'Destinations',
      navAccommodations: 'Stays',
      navMarketplace: 'Marketplace',
      navHistory: 'History & People',
    },
    hero: {
      badge: 'Banda Neira Archipelagic Digital Ecosystem',
      title1: 'Discover The Spice History,',
      title2: 'Living Heritage & Pristine Nature',
      subtitle:
        'A unified digital portal for archipelagic exploration, 177 historical heritage sites, eco-stay accommodations, and verified Banda nutmeg traceability.',
      exploreBtn: 'Explore Banda Now',
      watchHeritageBtn: 'Trace Spice Route History',
      centerTitle: "In the heart of the world's spices",
      headlineLine1: "In the heart of the world's spices,",
      headlineLine2: 'discover Banda.',
      description:
        'A sea guarding ancient coral wonders. The living legacy of colonial citadels. A unified digital gateway for exploring the island ecosystem, cultural heritage mapping, and Banda community wisdom.',
      ctaExplore: 'Start exploring Banda',
      ctaMap: 'View interactive map',
    },
    gallery: {
      tagline: 'Discover The Splendor',
      title: 'Banda Neira',
    },
    mapSection: {
      tagline: 'DISCOVER TOP DESTINATIONS AND ATTRACTIONS',
      heading: 'Visit Banda Neira',
      loading: 'Preparing Banda Neira Spatial Map...',
      description: 'Spatial exploration of heritage sites, marine wonders, community lodgings, and island facilities.',
      openFullMap: 'Open Fullscreen Map',
    },
    tourismSaw: {
      tagline: 'CURATED BANDA SPOTLIGHT',
      headingPrefix: 'Explore the',
      headingScript: 'Iconic Gems',
      headingSuffix: 'of Banda Neira',
      exploreAllBtn: 'Explore All Destinations',
      smartPlannerBtn: 'Smart Tourism Guide',
      prevDest: 'Previous Destination',
      nextDest: 'Next Destination',
      bookWhatsapp: 'Contact Tour Guide',
    },
    ecoStay: {
      tagline: 'ACCOMMODATIONS & ECO-STAY DIRECTORY',
      headingPrefix: 'Peaceful Stays in the',
      headingScript: 'Spice Isles',
      description: 'Locally operated island homestays featuring purified RO drinking water and eco-friendly solar backup.',
      viewMore: 'View All',
      prev: 'Scroll Left',
      next: 'Scroll Right',
      night: 'night',
      cleanWater: 'Clean RO Water',
      solarBackup: 'Solar Power',
      verified: 'Verified',
      bookWhatsapp: 'Book via WhatsApp',
      filterAll: 'All Islands',
      filterNeira: 'Neira Island',
      filterBesar: 'Great Banda',
      filterHatta: 'Hatta Island',
    },
    stats: {
      historicalTourism: 'Historical Heritage',
      natureTourism: 'Nature Attractions',
      totalDestinations: 'Total Destinations',
      accommodations: 'Eco-Stays & Inns',
    },
    traceability: {
      tagline: 'BANDA SPICE & MSME MARKETPLACE',
      headingPrefix: 'Harvests &',
      headingScript: 'Finest Spices',
      headingSuffix: 'of Banda',
      description: 'Authentic commodities sourced directly from island farmers and fishermen with provenance and batch guarantees.',
      viewMore: 'View All',
      checkQrBatch: 'Verify Batch QR',
    },
    demographics: {
      inhabitedIslands: 'Inhabited Islands',
      archipelagoVillages: 'Island Villages',
      totalPopulation: 'Total Population',
      integratedEcosystem: 'Integrated Ecosystem',
    },
    planYourVisit: {
      quoteAuthor: 'SUTAN SJAHRIR • BANDA NEIRA 1936',
      quote: '“Do not die before you visit Banda Neira!”',
      exploreBtn: 'Explore Banda Now',
      openMapBtn: 'Open Interactive Map',
    },
    heritage: {
      sectionBadge: 'World Heritage Narrative',
      heading: 'The Footsteps of Spice & The Historic Isles',
      subheading: 'Nutmeg, colonial fortresses, and the struggle for freedom that shook global diplomacy.',
      audioPlayerTitle: 'Historical Audio Guide',
      audioPlaying: 'Playing Narrative Audio...',
      audioSubtitleBadge: 'Audio Guide Subtitles',
      stories: {
        pala: {
          title: 'The Nutmeg Sought by the World',
          subtitle: 'Myristica fragrans — A Commodity More Precious Than Gold',
          desc: 'In ancient times, the nutmeg tree grew exclusively in the volcanic soils of the Banda archipelago. Its distinct aroma and rare medicinal properties lured merchant fleets across vast oceans. In the 17th century, nutmeg was literally worth its weight in gold.',
        },
        belgica: {
          title: 'Fort Belgica & The Spice Route',
          subtitle: '17th Century Coral Pentagon Fortress Overlooking Neira Bay',
          desc: 'To secure the nutmeg monopoly, this imposing pentagonal stone fortress was erected on the hills of Neira. From these ramparts, the strait and every merchant galleon crossing the Banda Sea were closely surveilled for centuries.',
        },
        rhun: {
          title: 'Rhun Island & The Manhattan Exchange',
          subtitle: 'The 1667 Treaty of Breda: Trading a Remote Spice Atoll for Modern New York',
          desc: 'A tiny coral island in the western Banda cluster was once the epicentre of global naval rivalry between Britain and the Dutch. To gain total dominance over Rhun’s nutmeg orchards, the Dutch ceded New Amsterdam in North America—the island now known as Manhattan, New York.',
        },
        hatta: {
          title: 'The Exile of Bung Hatta',
          subtitle: 'Drafting Indonesian Independence in the Shadow of the Volcano',
          desc: 'Banda Neira also preserves the legacy of national liberation. On this serene island, founding fathers Mohammad Hatta and Sutan Sjahrir were exiled in 1936. While tutoring local children, they continuously wrote seminal essays shaping the future republic.',
        },
      },
    },
    cagarBudaya: {
      tabTitle: 'Heritage Sites & Historical Narratives',
      filterIsland: 'All Islands',
      periodLabel: 'Period',
      audioGuideLabel: 'Historical Audio Guide',
      audioGuidePlaying: 'Playing Narrative Audio...',
      narrativeSubtitleLabel: 'Narrative Subtitle:',
    },
    footer: {
      brandDesc: 'Banda Smart Tourism & Island Ecosystem. Connecting journeys, heritage, and local island community livelihood.',
      location: 'Banda Islands, Maluku, Indonesia',
      groupExplore: 'Explore Banda',
      groupServices: 'Services & Tourism',
      groupAccess: 'Account Access',
      navResidents: 'Residents & Amenities',
      navSmes: 'Local SMEs',
      navCoop: 'Hatta Cooperative',
      navStays: 'Eco-Stay Directory',
      registerNew: 'Register New Account',
      signIn: 'Sign In / Login',
      resident: 'Citizen Services',
      homestayPartner: 'Homestay Partner',
      operator: 'Operator Simulator',
      allRightsReserved: 'All rights reserved.',
      taglineQuote: 'From Banda, for the world.',
      privacyPolicy: 'Privacy Policy',
      termsOfUse: 'Terms of Use',
    },
    chatbot: {
      triggerLabel: 'Ask Travel Recommendations',
      headerTitle: 'Banda Island Guide',
      headerSubtitle: 'Smart Destination Advisor',
      closeChat: 'Close Chat',
      welcomeMsg: 'Hello! I am your Banda Neira Smart Guide. How can I assist you with your dream holiday across the Banda Islands?',
      justNow: 'Just now',
      matchPercent: 'Match',
      tariff: 'Fee',
      viewPlace: 'View Details',
      quickTopRec: 'Top Picks',
      quickTopQuery: 'Give me the top recommended destinations across Banda Neira',
      quickMarine: 'Marine Tourism',
      quickMarineQuery: 'I want to snorkel and see vibrant coral reefs in the sea',
      quickHeritage: 'Historic Forts',
      quickHeritageQuery: 'Recommend iconic colonial forts and cultural heritage',
      quickBudget: 'Budget-Friendly',
      quickBudgetQuery: 'Best affordable destinations under Rp 50,000',
      inputPlaceholder: 'Ask about spots, budget, or travel style...',
      sendBtn: 'Send Message',
    },
    gisMap: {
      searchPlaceholder: 'Search places, heritage...',
      allIslands: 'All Islands',
      neiraIsland: 'Neira Island',
      greatBanda: 'Great Banda',
      hattaIsland: 'Hatta Island',
      ayIsland: 'Ay Island',
      rhunIsland: 'Rhun Island',
      recenterMap: 'Re-center to Banda Archipelago',
      fullscreen: 'Fullscreen Map View',
      exitFullscreen: 'Exit Fullscreen (Esc)',
      mapStyles: 'Map Styles',
      baseMap: 'Base Map',
      standard: 'Standard',
      standardSubtitle: 'Street Map',
      satellite: 'Satellite',
      satelliteSubtitle: 'Authentic Satellite Imagery',
      terrain: 'Topography',
      terrainSubtitle: 'Natural Contours & Relief',
      placeAndStreetNames: 'Places & Street Names',
      mapOverlays: 'Map Overlays',
      villageTerritories: 'Village Territories',
      villagesCount: '17 Villages',
      densityHeatmap: 'Density Heatmap',
      maritimeRoutes: 'Sea Routes',
      active: 'Active',
      off: 'Off',
      empty: 'Empty',
      openLegend: 'Open Atlas Legend',
      mapLegend: 'Map Legend',
      selectAll: 'Select All',
      clearAll: 'Clear All',
      layers: {
        tourism: 'Marine & Tourism',
        heritage: 'Cultural Heritage',
        accommodation: 'Accommodations',
        smes: 'SME Centers',
        publicSafety: 'Public Facilities',
        waterInfra: 'Clean Water',
        energyWaste: 'Energy & Environment',
      },
      densityLegendTitle: 'Population Density (people/km²)',
      densitySparse: 'Sparse',
      densityMedium: 'Moderate',
      densityDense: 'Dense',
      densityHigh: 'High',
      spatialProjection: 'Spatial Projection',
      view360Panorama: 'View 360° Panorama',
      focusMap: 'Focus Map',
      copyCoords: 'Copy Coordinates',
      coordsCopied: 'Copied!',
      waContact: 'WA Contact',
      audioGuide: 'Audio Guide',
      aboutThisDestination: 'About This Destination',
      operatingHours: 'Operating Hours',
      nationalHeritage: 'National Cultural Heritage',
      waterQuality: 'Water Quality (TDS)',
      communalTank: 'Communal Tank',
      full: 'Full',
      stayRate: 'Stay Rate',
      perNight: 'night',
      cleanWaterRO: 'RO Drinking Water',
      solarElectricity: 'Solar Power',
      solarCapacity: 'Solar Capacity',
      program: 'Program',
      commoditiesFocus: 'Commodity / Product Focus',
      assistedSMEsList: 'Registered Local SMEs',
      registeredSMEs: 'Registered SMEs',
      establishedYear: 'Founded',
      workforce: 'Workforce',
      routeLength: 'Route Length',
      travelTime: 'Travel Time',
      transportMode: 'Mode',
      routePath: 'Route',
      closeDetails: 'Close',
      villageCard: {
        island: 'Island',
        population: 'Population',
        area: 'Total Area',
        density: 'Population Density',
        commodityPotential: 'Commodities & Potential',
        highlights: 'Key Attractions',
        officialStats: 'Official Village Statistics (2026)',
        recorded: 'Recorded',
        male: 'Male',
        female: 'Female',
        households: 'Households',
        mainOccupation: 'Main Occupation',
        activeSMEsRecorded: 'Active Registered SMEs',
        focus: 'Focus',
        close: 'Close Village Profile',
      },
    },
    common: {
      language: 'Language',
      id: 'Bahasa Indonesia',
      en: 'English',
      loading: 'Loading...',
      selectLanguage: 'Select Language',
    },
  },
}
