/**
 * Data Geospasial Poligon Batas Administrasi Desa/Negeri
 * Gugus Inti Kepulauan Banda (Pulau Neira, Pulau Banda Besar, Pulau Gunung Api, Pulau Keraka)
 * Standar GeoJSON RFC 7946 (WGS 84 - EPSG:4326)
 */

export interface VillageInfo {
  name: string
  island: string
  color: string
  description: string
  population?: string
  main_commodity?: string
  area_ha?: string
  highlights?: string
}

export const VILLAGE_DETAILS: Record<string, VillageInfo> = {
  Nusantara: {
    name: 'Nusantara',
    island: 'Pulau Neira',
    color: '#34d399', // Mint Green
    description: 'Pusat aktivitas dan pemerintahan desa, pelabuhan utama PELNI, dan kawasan cagar budaya Benteng Belgica & Nassau.',
    population: '2.450 Jiwa',
    main_commodity: 'Pariwisata Bahari & Jasa Perdagangan',
    area_ha: '84 Hektar',
    highlights: 'Benteng Belgica, Mini Palace VOC, Pelabuhan Neira',
  },
  Dwiwarna: {
    name: 'Dwiwarna',
    island: 'Pulau Neira',
    color: '#a3e635', // Lime
    description: 'Pusat perkantoran pemerintahan kecamatan, sentra pendidikan, dan kompleks rumah pengasingan Bung Hatta & Sutan Sjahrir.',
    population: '2.180 Jiwa',
    main_commodity: 'Pendidikan & Perdagangan Rempah',
    area_ha: '72 Hektar',
    highlights: 'Rumah Budaya Banda Neira, Rumah Pengasingan Bung Hatta',
  },
  Merdeka: {
    name: 'Merdeka',
    island: 'Pulau Neira',
    color: '#38bdf8', // Cyan
    description: 'Pesisir barat laut Neira dengan panorama langsung menghadap Gunung Api dan alur pelayaran kapal tradisional.',
    population: '1.420 Jiwa',
    main_commodity: 'Perikanan Tangkap & Homestay',
    area_ha: '65 Hektar',
    highlights: 'Pesisir Selat Neira-Gunung Api, Sentra Nelayan Cakalang',
  },
  Rajawali: {
    name: 'Rajawali',
    island: 'Pulau Neira',
    color: '#d946ef', // Magenta
    description: 'Kawasan perbukitan hijau di timur Neira yang memadukan kebun pala warga dengan pemandangan Teluk Banda.',
    population: '1.150 Jiwa',
    main_commodity: 'Pala & Cengkeh Rakyat',
    area_ha: '78 Hektar',
    highlights: 'Perkebunan Pala Neira Timur, Spot Sunrise Teluk',
  },
  'Tanah Rata': {
    name: 'Tanah Rata',
    island: 'Pulau Neira',
    color: '#4338ca', // Indigo / Dark Purple
    description: 'Sisi selatan Pulau Neira yang menghadap langsung ke Selat Lontor dan Gunung Api, sentra pendaratan perahu nelayan.',
    population: '1.340 Jiwa',
    main_commodity: 'Hasil Laut & Olahan Ikan Asar',
    area_ha: '58 Hektar',
    highlights: 'Pendaratan Ketinting, Sentra Pengasapan Ikan',
  },
  'Kampung Baru': {
    name: 'Kampung Baru',
    island: 'Pulau Neira',
    color: '#ea580c', // Orange
    description: 'Kawasan timur Neira yang menjadi lokasi Bandara Banda Neira dan sentra pemukiman modern kepulauan.',
    population: '1.890 Jiwa',
    main_commodity: 'Transportasi Udara & Logistik',
    area_ha: '92 Hektar',
    highlights: 'Bandar Udara Banda Neira, Sentra Kerajinan Kenari',
  },
  'Gunung Api': {
    name: 'Gunung Api',
    island: 'Pulau Gunung Api',
    color: '#10b981', // Emerald
    description: 'Gunung api aktif setinggi 640 mdpl yang dikelilingi hutan lindung vulkanik, batuan lava 1988, dan terumbu karang Lava Flow kelas dunia.',
    population: '310 Jiwa (Pesisir Selatan)',
    main_commodity: 'Ekowisata Vulkanik & Diving Snorkeling',
    area_ha: '730 Hektar',
    highlights: 'Kawah Vulkanik Aktif, Lava Flow Reef, Trekking Jalur Utara',
  },
  'Pulau Keraka': {
    name: 'Pulau Keraka',
    island: 'Pulau Keraka',
    color: '#06b6d4', // Teal/Cyan
    description: 'Pulau karang kecil tak berpenghuni di utara selat Neira yang berfungsi sebagai mercusuar navigasi dan suaka burung kepodang.',
    population: 'Tak Berpenghuni',
    main_commodity: 'Zona Konservasi Laut & Navigasi Maritim',
    area_ha: '14 Hektar',
    highlights: 'Mercusuar Selat Utara, Spot Snorkeling Karang Meja',
  },
  Lonthoir: {
    name: 'Lonthoir',
    island: 'Banda Besar',
    color: '#86efac', // Soft Green
    description: 'Desa bersejarah pusat perkebunan pala tertua di dunia, Benteng Hollandia, sumur keramat Lonthoir, dan panorama lanskap teluk.',
    population: '2.620 Jiwa',
    main_commodity: 'Pala Lonthoir Grade AAA & Minyak Fuli',
    area_ha: '340 Hektar',
    highlights: 'Benteng Hollandia, Perkebunan Pala Tua, Pantai Pasir Enam',
  },
  Boiyauw: {
    name: 'Boiyauw',
    island: 'Banda Besar',
    color: '#2563eb', // Royal Blue
    description: 'Wilayah perbukitan subur di selatan Banda Besar dengan kanopi pohon kenari raksasa penaung tanaman pala organik.',
    population: '1.780 Jiwa',
    main_commodity: 'Pala Organik & Biji Kenari Hutan',
    area_ha: '290 Hektar',
    highlights: 'Hutan Kenari Raksasa, Sumber Mata Air Perbukitan',
  },
  'Combir Kasestoren': {
    name: 'Combir Kasestoren',
    island: 'Banda Besar',
    color: '#eab308', // Amber / Yellow
    description: 'Ujung tanjung timur laut Banda Besar yang menjaga pintu masuk timur perairan Banda dengan tradisi bahari kental.',
    population: '1.240 Jiwa',
    main_commodity: 'Perikanan Tradisional & Pala',
    area_ha: '210 Hektar',
    highlights: 'Tanjung Timur Banda Besar, Perahu Belang Tradisional',
  },
  Dender: {
    name: 'Dender',
    island: 'Banda Besar',
    color: '#a855f7', // Purple
    description: 'Pemukiman pesisir tenang di lereng tengah Banda Besar dengan kebun cengkeh dan dermaga perahu nelayan antarpulau.',
    population: '1.120 Jiwa',
    main_commodity: 'Cengkeh Petik & Rumput Laut',
    area_ha: '195 Hektar',
    highlights: 'Dermaga Kayu Dender, Sentra Pengeringan Cengkeh',
  },
  Lautang: {
    name: 'Lautang',
    island: 'Banda Besar',
    color: '#22c55e', // Green
    description: 'Kawasan pesisir pantai selatan Banda Besar yang menghadap laut lepas Banda, kaya potensi perikanan pelagis laut dalam.',
    population: '980 Jiwa',
    main_commodity: 'Tuna Sirip Kuning & Ikan Cakalang',
    area_ha: '175 Hektar',
    highlights: 'Sentra Pemancingan Tuna, Pantai Tebing Karang',
  },
  Selamon: {
    name: 'Selamon',
    island: 'Banda Besar',
    color: '#9333ea', // Deep Violet
    description: 'Desa adat bersejarah di timur laut Banda Besar dengan tradisi perahu Belang adat, tarian cakalele, dan kebun pala pusaka.',
    population: '2.050 Jiwa',
    main_commodity: 'Pala Warisan Adat & Wisata Budaya',
    area_ha: '310 Hektar',
    highlights: 'Rumah Adat Belang Selamon, Pohon Pala Keramat',
  },
  'Uring Tutra': {
    name: 'Uring Tutra',
    island: 'Banda Besar',
    color: '#2dd4bf', // Teal
    description: 'Lembah sejuk di barat daya Lonthoir dengan sistem irigasi mata air alami untuk perkebunan pala dan tanaman pangan.',
    population: '1.050 Jiwa',
    main_commodity: 'Pala & Tanaman Hortikultura Kebun',
    area_ha: '160 Hektar',
    highlights: 'Mata Air Alami Lembah Uring, Perkebunan Buah Lokal',
  },
  Waer: {
    name: 'Waer',
    island: 'Banda Besar',
    color: '#fb7185', // Rose Pink
    description: 'Pesisir timur Banda Besar yang terkenal dengan sumber air tawar alami di bibir pantai dan terumbu karang dangkal.',
    population: '1.380 Jiwa',
    main_commodity: 'Pala, Cengkeh, & Perikanan Pesisir',
    area_ha: '185 Hektar',
    highlights: 'Mata Air Tawar Pantai Waer, Snorkeling Terumbu Tepi',
  },
  'Walling Spanciby': {
    name: 'Walling Spanciby',
    island: 'Banda Besar',
    color: '#14b8a6', // Emerald / Cyan
    description: 'Tanjung barat daya Banda Besar dengan tebing karst megah yang menghadap langsung ke arah Pulau Ay dan Pulau Rhun.',
    population: '890 Jiwa',
    main_commodity: 'Kopra, Pala, & Garam Tradisional',
    area_ha: '220 Hektar',
    highlights: 'Tanjung Walling, Titik Pantau Jalur Barat Neira-Ay',
  },
}

export const BANDA_VILLAGES_GEOJSON: any = {
  type: 'FeatureCollection',
  features: [
    // ------------------------------------------------------------------------
    // 1. PULAU NEIRA (6 DESA)
    // ------------------------------------------------------------------------
    {
      type: 'Feature',
      id: 'desa-nusantara',
      properties: {
        name: 'Nusantara',
        island: 'Pulau Neira',
        color: '#34d399',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [129.8995, -4.5205],
            [129.9055, -4.5205],
            [129.9065, -4.5275],
            [129.9025, -4.5285],
            [129.8990, -4.5255],
            [129.8995, -4.5205],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      id: 'desa-dwiwarna',
      properties: {
        name: 'Dwiwarna',
        island: 'Pulau Neira',
        color: '#a3e635',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [129.8965, -4.5175],
            [129.9025, -4.5175],
            [129.9025, -4.5235],
            [129.8965, -4.5235],
            [129.8950, -4.5205],
            [129.8965, -4.5175],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      id: 'desa-merdeka',
      properties: {
        name: 'Merdeka',
        island: 'Pulau Neira',
        color: '#38bdf8',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [129.8970, -4.5115],
            [129.9045, -4.5115],
            [129.9045, -4.5175],
            [129.8965, -4.5175],
            [129.8970, -4.5115],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      id: 'desa-rajawali',
      properties: {
        name: 'Rajawali',
        island: 'Pulau Neira',
        color: '#d946ef',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [129.9045, -4.5135],
            [129.9115, -4.5145],
            [129.9125, -4.5215],
            [129.9055, -4.5205],
            [129.9045, -4.5135],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      id: 'desa-kampung-baru',
      properties: {
        name: 'Kampung Baru',
        island: 'Pulau Neira',
        color: '#ea580c',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [129.9065, -4.5215],
            [129.9145, -4.5225],
            [129.9135, -4.5295],
            [129.9060, -4.5285],
            [129.9065, -4.5215],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      id: 'desa-tanah-rata',
      properties: {
        name: 'Tanah Rata',
        island: 'Pulau Neira',
        color: '#4338ca',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [129.8990, -4.5255],
            [129.9060, -4.5285],
            [129.9045, -4.5345],
            [129.8975, -4.5325],
            [129.8990, -4.5255],
          ],
        ],
      },
    },

    // ------------------------------------------------------------------------
    // 2. PULAU GUNUNG API & PULAU KERAKA
    // ------------------------------------------------------------------------
    {
      type: 'Feature',
      id: 'desa-gunung-api',
      properties: {
        name: 'Gunung Api',
        island: 'Pulau Gunung Api',
        color: '#10b981',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [129.8785, -4.5075],
            [129.8895, -4.5125],
            [129.8935, -4.5245],
            [129.8885, -4.5345],
            [129.8755, -4.5365],
            [129.8685, -4.5275],
            [129.8695, -4.5155],
            [129.8785, -4.5075],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      id: 'desa-pulau-keraka',
      properties: {
        name: 'Pulau Keraka',
        island: 'Pulau Keraka',
        color: '#06b6d4',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [129.8845, -4.5010],
            [129.8885, -4.5015],
            [129.8880, -4.5045],
            [129.8835, -4.5040],
            [129.8845, -4.5010],
          ],
        ],
      },
    },

    // ------------------------------------------------------------------------
    // 3. PULAU BANDA BESAR / LONTHOIR (9 DESA)
    // ------------------------------------------------------------------------
    {
      type: 'Feature',
      id: 'desa-walling-spanciby',
      properties: {
        name: 'Walling Spanciby',
        island: 'Banda Besar',
        color: '#14b8a6',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [129.8680, -4.5480],
            [129.8790, -4.5510],
            [129.8760, -4.5630],
            [129.8650, -4.5580],
            [129.8680, -4.5480],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      id: 'desa-uring-tutra',
      properties: {
        name: 'Uring Tutra',
        island: 'Banda Besar',
        color: '#2dd4bf',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [129.8790, -4.5510],
            [129.8920, -4.5540],
            [129.8890, -4.5680],
            [129.8760, -4.5630],
            [129.8790, -4.5510],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      id: 'desa-lonthoir',
      properties: {
        name: 'Lonthoir',
        island: 'Banda Besar',
        color: '#86efac',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [129.8920, -4.5540],
            [129.9140, -4.5550],
            [129.9120, -4.5720],
            [129.8890, -4.5680],
            [129.8920, -4.5540],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      id: 'desa-boiyauw',
      properties: {
        name: 'Boiyauw',
        island: 'Banda Besar',
        color: '#2563eb',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [129.9140, -4.5550],
            [129.9320, -4.5530],
            [129.9290, -4.5750],
            [129.9120, -4.5720],
            [129.9140, -4.5550],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      id: 'desa-lautang',
      properties: {
        name: 'Lautang',
        island: 'Banda Besar',
        color: '#22c55e',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [129.9320, -4.5530],
            [129.9480, -4.5460],
            [129.9440, -4.5680],
            [129.9290, -4.5750],
            [129.9320, -4.5530],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      id: 'desa-dender',
      properties: {
        name: 'Dender',
        island: 'Banda Besar',
        color: '#a855f7',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [129.9480, -4.5460],
            [129.9590, -4.5360],
            [129.9530, -4.5580],
            [129.9440, -4.5680],
            [129.9480, -4.5460],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      id: 'desa-selamon',
      properties: {
        name: 'Selamon',
        island: 'Banda Besar',
        color: '#9333ea',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [129.9590, -4.5360],
            [129.9690, -4.5240],
            [129.9620, -4.5440],
            [129.9530, -4.5580],
            [129.9590, -4.5360],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      id: 'desa-waer',
      properties: {
        name: 'Waer',
        island: 'Banda Besar',
        color: '#fb7185',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [129.9690, -4.5240],
            [129.9740, -4.5120],
            [129.9680, -4.5310],
            [129.9620, -4.5440],
            [129.9690, -4.5240],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      id: 'desa-combir-kasestoren',
      properties: {
        name: 'Combir Kasestoren',
        island: 'Banda Besar',
        color: '#eab308',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [129.9740, -4.5120],
            [129.9760, -4.4980],
            [129.9700, -4.5020],
            [129.9680, -4.5310],
            [129.9740, -4.5120],
          ],
        ],
      },
    },
  ],
}
