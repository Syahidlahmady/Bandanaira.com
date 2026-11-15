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
  demographics?: {
    total_population?: number
    households?: number
    male?: number
    female?: number
    productive_age?: number
    top_occupations?: string
    umkm_count?: number
  }
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
    description: 'Negeri administratif di pesisir barat Neira dengan alur pelayaran tradisional menghadap Gunung Api. Berdasarkan data sensus resmi desa 2026, berpopulasi 834 jiwa (234 KK) dengan 49 nelayan, 41 wiraswasta, 27 petani/pekebun, serta 9 unit UMKM olahan pala, perikanan, dan kerajinan tangan.',
    population: '834 Jiwa (234 KK)',
    main_commodity: 'Perikanan Tangkap, Olahan Pala & Ikan',
    area_ha: '65 Hektar',
    highlights: 'Pesisir Selat Neira, Sentra Nelayan Cakalang, 9 Sentra UMKM Olahan',
    demographics: {
      total_population: 834,
      households: 234,
      male: 409,
      female: 425,
      productive_age: 417,
      top_occupations: 'Nelayan (49), Wiraswasta (41), Asongan (32), Petani (27), PNS (26)',
      umkm_count: 9,
    },
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
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "id": "desa-rajawali",
      "properties": {
        "name": "Rajawali",
        "island": "Pulau Neira",
        "color": "#d946ef"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              129.9045,
              -4.5135
            ],
            [
              129.9115,
              -4.5145
            ],
            [
              129.9125,
              -4.5215
            ],
            [
              129.9055,
              -4.5205
            ],
            [
              129.9045,
              -4.5135
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "desa-dwiwarna",
      "properties": {
        "name": "Dwiwarna",
        "island": "Pulau Neira",
        "color": "#a3e635"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              129.8965,
              -4.5175
            ],
            [
              129.9025,
              -4.5175
            ],
            [
              129.9025,
              -4.5235
            ],
            [
              129.8965,
              -4.5235
            ],
            [
              129.895,
              -4.5205
            ],
            [
              129.8965,
              -4.5175
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "desa-kampung-baru",
      "properties": {
        "name": "Kampung Baru",
        "island": "Pulau Neira",
        "color": "#ea580c"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              129.9065,
              -4.5215
            ],
            [
              129.9145,
              -4.5225
            ],
            [
              129.9135,
              -4.5295
            ],
            [
              129.906,
              -4.5285
            ],
            [
              129.9065,
              -4.5215
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "desa-nusantara",
      "properties": {
        "name": "Nusantara",
        "island": "Pulau Neira",
        "color": "#34d399"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              129.8995,
              -4.5205
            ],
            [
              129.9055,
              -4.5205
            ],
            [
              129.9065,
              -4.5275
            ],
            [
              129.9025,
              -4.5285
            ],
            [
              129.899,
              -4.5255
            ],
            [
              129.8995,
              -4.5205
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "desa-pulau-ay",
      "properties": {
        "name": "Pulau Ay",
        "island": "Pulau Neira",
        "color": "#ff6600"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              129.763598,
              -4.518357
            ],
            [
              129.763126,
              -4.521174
            ],
            [
              129.764328,
              -4.523192
            ],
            [
              129.766645,
              -4.526743
            ],
            [
              129.768276,
              -4.52978
            ],
            [
              129.769864,
              -4.533588
            ],
            [
              129.772396,
              -4.537395
            ],
            [
              129.774756,
              -4.53808
            ],
            [
              129.776902,
              -4.536368
            ],
            [
              129.779048,
              -4.534743
            ],
            [
              129.780893,
              -4.533074
            ],
            [
              129.782052,
              -4.530978
            ],
            [
              129.783125,
              -4.529267
            ],
            [
              129.78334,
              -4.527384
            ],
            [
              129.784327,
              -4.524732
            ],
            [
              129.784627,
              -4.523577
            ],
            [
              129.78364,
              -4.522978
            ],
            [
              129.782653,
              -4.521951
            ],
            [
              129.781923,
              -4.520753
            ],
            [
              129.780893,
              -4.519983
            ],
            [
              129.779327,
              -4.519392
            ],
            [
              129.776795,
              -4.518771
            ],
            [
              129.775422,
              -4.518301
            ],
            [
              129.774649,
              -4.517937
            ],
            [
              129.77201,
              -4.518194
            ],
            [
              129.770465,
              -4.517851
            ],
            [
              129.768212,
              -4.518236
            ],
            [
              129.766688,
              -4.517809
            ],
            [
              129.765487,
              -4.517531
            ],
            [
              129.765744,
              -4.516404
            ],
            [
              129.764714,
              -4.516547
            ],
            [
              129.763598,
              -4.518357
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "desa-lonthoir",
      "properties": {
        "name": "Lonthoir",
        "island": "Banda Besar",
        "color": "#86efac"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              129.892,
              -4.554
            ],
            [
              129.914,
              -4.555
            ],
            [
              129.912,
              -4.572
            ],
            [
              129.889,
              -4.568
            ],
            [
              129.892,
              -4.554
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "desa-gunung-api",
      "properties": {
        "name": "Gunung Api",
        "island": "Pulau Gunung Api",
        "color": "#10b981"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              129.8785,
              -4.5075
            ],
            [
              129.8895,
              -4.5125
            ],
            [
              129.8935,
              -4.5245
            ],
            [
              129.8885,
              -4.5345
            ],
            [
              129.8755,
              -4.5365
            ],
            [
              129.8685,
              -4.5275
            ],
            [
              129.8695,
              -4.5155
            ],
            [
              129.8785,
              -4.5075
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "desa-dender",
      "properties": {
        "name": "Dender",
        "island": "Banda Besar",
        "color": "#a855f7"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              129.948,
              -4.546
            ],
            [
              129.959,
              -4.536
            ],
            [
              129.953,
              -4.558
            ],
            [
              129.944,
              -4.568
            ],
            [
              129.948,
              -4.546
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "desa-lautang",
      "properties": {
        "name": "Lautang",
        "island": "Banda Besar",
        "color": "#22c55e"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              129.932,
              -4.553
            ],
            [
              129.948,
              -4.546
            ],
            [
              129.944,
              -4.568
            ],
            [
              129.929,
              -4.575
            ],
            [
              129.932,
              -4.553
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "desa-desa-pulau-hatta",
      "properties": {
        "name": "Desa Pulau Hatta",
        "island": "Pulau Hatta",
        "color": "#00ffbf"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              130.03448,
              -4.583826
            ],
            [
              130.035424,
              -4.57989
            ],
            [
              130.039115,
              -4.578592
            ],
            [
              130.041819,
              -4.579661
            ],
            [
              130.043063,
              -4.580731
            ],
            [
              130.044823,
              -4.582356
            ],
            [
              130.04581,
              -4.58334
            ],
            [
              130.047269,
              -4.583597
            ],
            [
              130.048728,
              -4.58411
            ],
            [
              130.049329,
              -4.584795
            ],
            [
              130.047441,
              -4.585265
            ],
            [
              130.047183,
              -4.586035
            ],
            [
              130.046883,
              -4.588816
            ],
            [
              130.045896,
              -4.591596
            ],
            [
              130.045509,
              -4.592709
            ],
            [
              130.046411,
              -4.593094
            ],
            [
              130.046968,
              -4.593949
            ],
            [
              130.046797,
              -4.595789
            ],
            [
              130.044694,
              -4.599125
            ],
            [
              130.043535,
              -4.602034
            ],
            [
              130.045338,
              -4.603959
            ],
            [
              130.046368,
              -4.606483
            ],
            [
              130.047183,
              -4.607809
            ],
            [
              130.045938,
              -4.608194
            ],
            [
              130.044951,
              -4.608493
            ],
            [
              130.042934,
              -4.606397
            ],
            [
              130.04066,
              -4.605499
            ],
            [
              130.038471,
              -4.604344
            ],
            [
              130.037098,
              -4.60413
            ],
            [
              130.036025,
              -4.60413
            ],
            [
              130.034351,
              -4.602975
            ],
            [
              130.033493,
              -4.602334
            ],
            [
              130.033493,
              -4.598669
            ],
            [
              130.03315,
              -4.597671
            ],
            [
              130.031862,
              -4.597329
            ],
            [
              130.031304,
              -4.595703
            ],
            [
              130.031476,
              -4.594206
            ],
            [
              130.031476,
              -4.592153
            ],
            [
              130.030618,
              -4.590998
            ],
            [
              130.030017,
              -4.588773
            ],
            [
              130.030017,
              -4.587789
            ],
            [
              130.030618,
              -4.586891
            ],
            [
              130.032763,
              -4.586007
            ],
            [
              130.03448,
              -4.583826
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "desa-combir-kasestoren",
      "properties": {
        "name": "Combir Kasestoren",
        "island": "Banda Besar",
        "color": "#eab308"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              129.974,
              -4.512
            ],
            [
              129.976,
              -4.498
            ],
            [
              129.97,
              -4.502
            ],
            [
              129.968,
              -4.531
            ],
            [
              129.974,
              -4.512
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "desa-desa-pulau-rhun",
      "properties": {
        "name": "Desa Pulau Rhun",
        "island": "Pulau Rhun",
        "color": "#db2424"
      },
      "geometry": {
        "type": "MultiPolygon",
        "coordinates": [
          [
            [
              [
                129.666781,
                -4.56111
              ],
              [
                129.669571,
                -4.563577
              ],
              [
                129.671416,
                -4.565516
              ],
              [
                129.677167,
                -4.564518
              ],
              [
                129.682403,
                -4.564518
              ],
              [
                129.684248,
                -4.563534
              ],
              [
                129.686437,
                -4.562507
              ],
              [
                129.687037,
                -4.561095
              ],
              [
                129.688711,
                -4.558486
              ],
              [
                129.691458,
                -4.556775
              ],
              [
                129.69223,
                -4.555534
              ],
              [
                129.693217,
                -4.554379
              ],
              [
                129.694633,
                -4.552026
              ],
              [
                129.694548,
                -4.549887
              ],
              [
                129.693646,
                -4.548903
              ],
              [
                129.693561,
                -4.547449
              ],
              [
                129.693475,
                -4.545224
              ],
              [
                129.694118,
                -4.544069
              ],
              [
                129.694118,
                -4.541545
              ],
              [
                129.693217,
                -4.541117
              ],
              [
                129.692316,
                -4.541417
              ],
              [
                129.690642,
                -4.542144
              ],
              [
                129.689784,
                -4.543299
              ],
              [
                129.689054,
                -4.544368
              ],
              [
                129.688239,
                -4.545481
              ],
              [
                129.68708,
                -4.545609
              ],
              [
                129.686136,
                -4.545951
              ],
              [
                129.685664,
                -4.546379
              ],
              [
                129.685149,
                -4.546764
              ],
              [
                129.684119,
                -4.54732
              ],
              [
                129.683561,
                -4.548219
              ],
              [
                129.682403,
                -4.549031
              ],
              [
                129.681416,
                -4.549288
              ],
              [
                129.680986,
                -4.550486
              ],
              [
                129.680343,
                -4.551384
              ],
              [
                129.680171,
                -4.55224
              ],
              [
                129.679484,
                -4.552753
              ],
              [
                129.679313,
                -4.553181
              ],
              [
                129.678884,
                -4.553694
              ],
              [
                129.678712,
                -4.554379
              ],
              [
                129.677896,
                -4.554636
              ],
              [
                129.676652,
                -4.555192
              ],
              [
                129.675922,
                -4.554978
              ],
              [
                129.675322,
                -4.555962
              ],
              [
                129.674978,
                -4.556432
              ],
              [
                129.67412,
                -4.556989
              ],
              [
                129.67339,
                -4.557416
              ],
              [
                129.673262,
                -4.558657
              ],
              [
                129.672446,
                -4.5587
              ],
              [
                129.671202,
                -4.558828
              ],
              [
                129.669871,
                -4.557759
              ],
              [
                129.669485,
                -4.55947
              ],
              [
                129.66867,
                -4.560069
              ],
              [
                129.666781,
                -4.56111
              ]
            ]
          ],
          [
            [
              [
                129.695599,
                -4.535991
              ],
              [
                129.69547,
                -4.536501
              ],
              [
                129.696608,
                -4.536354
              ],
              [
                129.69723,
                -4.536076
              ],
              [
                129.697659,
                -4.535378
              ],
              [
                129.697863,
                -4.534797
              ],
              [
                129.697841,
                -4.534422
              ],
              [
                129.697788,
                -4.534144
              ],
              [
                129.697884,
                -4.533952
              ],
              [
                129.697584,
                -4.533952
              ],
              [
                129.697262,
                -4.533952
              ],
              [
                129.696865,
                -4.534123
              ],
              [
                129.696769,
                -4.534465
              ],
              [
                129.696747,
                -4.534636
              ],
              [
                129.696543,
                -4.534871
              ],
              [
                129.696543,
                -4.535192
              ],
              [
                129.696414,
                -4.535481
              ],
              [
                129.696286,
                -4.535684
              ],
              [
                129.696178,
                -4.535877
              ],
              [
                129.696039,
                -4.535962
              ],
              [
                129.695599,
                -4.535991
              ]
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "desa-uring-tutra",
      "properties": {
        "name": "Uring Tutra",
        "island": "Banda Besar",
        "color": "#2dd4bf"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              129.879,
              -4.551
            ],
            [
              129.892,
              -4.554
            ],
            [
              129.889,
              -4.568
            ],
            [
              129.876,
              -4.563
            ],
            [
              129.879,
              -4.551
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "desa-pulau-keraka",
      "properties": {
        "name": "Pulau Keraka",
        "island": "Pulau Keraka",
        "color": "#06b6d4"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              129.8845,
              -4.501
            ],
            [
              129.8885,
              -4.5015
            ],
            [
              129.888,
              -4.5045
            ],
            [
              129.8835,
              -4.504
            ],
            [
              129.8845,
              -4.501
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "desa-tanah-rata",
      "properties": {
        "name": "Tanah Rata",
        "island": "Pulau Neira",
        "color": "#4338ca"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              129.899,
              -4.5255
            ],
            [
              129.906,
              -4.5285
            ],
            [
              129.9045,
              -4.5345
            ],
            [
              129.8975,
              -4.5325
            ],
            [
              129.899,
              -4.5255
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "desa-boiyauw",
      "properties": {
        "name": "Boiyauw",
        "island": "Banda Besar",
        "color": "#2563eb"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              129.914,
              -4.555
            ],
            [
              129.932,
              -4.553
            ],
            [
              129.929,
              -4.575
            ],
            [
              129.912,
              -4.572
            ],
            [
              129.914,
              -4.555
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "desa-merdeka",
      "properties": {
        "name": "Merdeka",
        "island": "Pulau Neira",
        "color": "#38bdf8"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              129.897,
              -4.5115
            ],
            [
              129.9045,
              -4.5115
            ],
            [
              129.9045,
              -4.5175
            ],
            [
              129.8965,
              -4.5175
            ],
            [
              129.897,
              -4.5115
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "desa-waer",
      "properties": {
        "name": "Waer",
        "island": "Banda Besar",
        "color": "#fb7185"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              129.969,
              -4.524
            ],
            [
              129.974,
              -4.512
            ],
            [
              129.968,
              -4.531
            ],
            [
              129.962,
              -4.544
            ],
            [
              129.969,
              -4.524
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "desa-selamon",
      "properties": {
        "name": "Selamon",
        "island": "Banda Besar",
        "color": "#9333ea"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              129.959,
              -4.536
            ],
            [
              129.969,
              -4.524
            ],
            [
              129.962,
              -4.544
            ],
            [
              129.953,
              -4.558
            ],
            [
              129.959,
              -4.536
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "desa-walling-spanciby",
      "properties": {
        "name": "Walling Spanciby",
        "island": "Banda Besar",
        "color": "#14b8a6"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              129.868,
              -4.548
            ],
            [
              129.879,
              -4.551
            ],
            [
              129.876,
              -4.563
            ],
            [
              129.865,
              -4.558
            ],
            [
              129.868,
              -4.548
            ]
          ]
        ]
      }
    }
  ]
}
