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
      "id": "desa-pulau-ay",
      "properties": {
        "name": "Pulau Ay",
        "island": "Pulau Ay",
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
              129.896121,
              -4.512447
            ],
            [
              129.90714,
              -4.508372
            ],
            [
              129.907751,
              -4.510436
            ],
            [
              129.907826,
              -4.511474
            ],
            [
              129.907891,
              -4.512522
            ],
            [
              129.899855,
              -4.515923
            ],
            [
              129.899544,
              -4.515613
            ],
            [
              129.898943,
              -4.514875
            ],
            [
              129.898417,
              -4.514607
            ],
            [
              129.897612,
              -4.514436
            ],
            [
              129.896786,
              -4.513441
            ],
            [
              129.896121,
              -4.512447
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
              129.899812,
              -4.515987
            ],
            [
              129.907933,
              -4.512532
            ],
            [
              129.908867,
              -4.517324
            ],
            [
              129.908556,
              -4.518115
            ],
            [
              129.908502,
              -4.519271
            ],
            [
              129.907944,
              -4.519785
            ],
            [
              129.907612,
              -4.520565
            ],
            [
              129.907687,
              -4.52142
            ],
            [
              129.908094,
              -4.521634
            ],
            [
              129.908631,
              -4.52172
            ],
            [
              129.910015,
              -4.522255
            ],
            [
              129.909629,
              -4.523452
            ],
            [
              129.908127,
              -4.52295
            ],
            [
              129.907837,
              -4.523891
            ],
            [
              129.907987,
              -4.526191
            ],
            [
              129.907815,
              -4.527356
            ],
            [
              129.907236,
              -4.528223
            ],
            [
              129.906904,
              -4.529281
            ],
            [
              129.90649,
              -4.529666
            ],
            [
              129.905643,
              -4.530276
            ],
            [
              129.905262,
              -4.53056
            ],
            [
              129.904945,
              -4.530688
            ],
            [
              129.904929,
              -4.53087
            ],
            [
              129.904768,
              -4.530918
            ],
            [
              129.90465,
              -4.530784
            ],
            [
              129.904522,
              -4.530806
            ],
            [
              129.904608,
              -4.524372
            ],
            [
              129.90567,
              -4.524297
            ],
            [
              129.905573,
              -4.523656
            ],
            [
              129.906249,
              -4.523581
            ],
            [
              129.906013,
              -4.519292
            ],
            [
              129.903932,
              -4.519185
            ],
            [
              129.902258,
              -4.519035
            ],
            [
              129.901121,
              -4.518907
            ],
            [
              129.900863,
              -4.518821
            ],
            [
              129.901078,
              -4.517773
            ],
            [
              129.900284,
              -4.516768
            ],
            [
              129.899812,
              -4.515987
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "desa-rajawali",
      "properties": {
        "name": "Rajawali",
        "island": "Pulau Neira",
        "color": "#d946ef"
      },
      "geometry": {
        "type": "MultiPolygon",
        "coordinates": [
          [
            [
              [
                129.896775,
                -4.507131
              ],
              [
                129.902902,
                -4.504168
              ],
              [
                129.904693,
                -4.505174
              ],
              [
                129.905434,
                -4.50542
              ],
              [
                129.905841,
                -4.506201
              ],
              [
                129.906399,
                -4.506211
              ],
              [
                129.906861,
                -4.506939
              ],
              [
                129.907011,
                -4.507624
              ],
              [
                129.907086,
                -4.508084
              ],
              [
                129.907172,
                -4.508383
              ],
              [
                129.896239,
                -4.512372
              ],
              [
                129.896132,
                -4.511281
              ],
              [
                129.895939,
                -4.511142
              ],
              [
                129.896121,
                -4.510575
              ],
              [
                129.89611,
                -4.510051
              ],
              [
                129.895971,
                -4.509709
              ],
              [
                129.895917,
                -4.509249
              ],
              [
                129.895917,
                -4.5088
              ],
              [
                129.896389,
                -4.508201
              ],
              [
                129.896657,
                -4.507698
              ],
              [
                129.896775,
                -4.507131
              ]
            ]
          ],
          [
            [
              [
                129.906002,
                -4.519324
              ],
              [
                129.906249,
                -4.523634
              ],
              [
                129.905562,
                -4.523698
              ],
              [
                129.905659,
                -4.524265
              ],
              [
                129.904618,
                -4.524362
              ],
              [
                129.904618,
                -4.524918
              ],
              [
                129.904103,
                -4.524918
              ],
              [
                129.904082,
                -4.52387
              ],
              [
                129.902837,
                -4.52388
              ],
              [
                129.902687,
                -4.519121
              ],
              [
                129.906002,
                -4.519324
              ]
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
        "type": "MultiPolygon",
        "coordinates": [
          [
            [
              [
                129.892967,
                -4.50235
              ],
              [
                129.893594,
                -4.5025
              ],
              [
                129.894125,
                -4.502243
              ],
              [
                129.894683,
                -4.502339
              ],
              [
                129.894834,
                -4.50235
              ],
              [
                129.894994,
                -4.502457
              ],
              [
                129.895209,
                -4.502623
              ],
              [
                129.895386,
                -4.503008
              ],
              [
                129.895418,
                -4.503201
              ],
              [
                129.895467,
                -4.503457
              ],
              [
                129.895595,
                -4.5035
              ],
              [
                129.895826,
                -4.503586
              ],
              [
                129.896116,
                -4.503618
              ],
              [
                129.896287,
                -4.503655
              ],
              [
                129.896432,
                -4.503655
              ],
              [
                129.89655,
                -4.503655
              ],
              [
                129.896663,
                -4.503693
              ],
              [
                129.896792,
                -4.503826
              ],
              [
                129.896834,
                -4.503971
              ],
              [
                129.896899,
                -4.50404
              ],
              [
                129.896958,
                -4.504153
              ],
              [
                129.897054,
                -4.504238
              ],
              [
                129.89728,
                -4.504292
              ],
              [
                129.897537,
                -4.504292
              ],
              [
                129.897768,
                -4.504286
              ],
              [
                129.897929,
                -4.504227
              ],
              [
                129.898181,
                -4.504099
              ],
              [
                129.89846,
                -4.503971
              ],
              [
                129.898664,
                -4.503901
              ],
              [
                129.898959,
                -4.503816
              ],
              [
                129.899061,
                -4.503746
              ],
              [
                129.899372,
                -4.503612
              ],
              [
                129.899624,
                -4.503372
              ],
              [
                129.89978,
                -4.503217
              ],
              [
                129.899967,
                -4.503008
              ],
              [
                129.900101,
                -4.502944
              ],
              [
                129.900268,
                -4.502928
              ],
              [
                129.901206,
                -4.503313
              ],
              [
                129.901872,
                -4.503634
              ],
              [
                129.902966,
                -4.504104
              ],
              [
                129.896936,
                -4.507013
              ],
              [
                129.89648,
                -4.505703
              ],
              [
                129.8964,
                -4.505414
              ],
              [
                129.896142,
                -4.505318
              ],
              [
                129.895847,
                -4.504912
              ],
              [
                129.895547,
                -4.504687
              ],
              [
                129.895273,
                -4.50465
              ],
              [
                129.895166,
                -4.504377
              ],
              [
                129.89507,
                -4.504179
              ],
              [
                129.894882,
                -4.504013
              ],
              [
                129.894233,
                -4.504072
              ],
              [
                129.893546,
                -4.504393
              ],
              [
                129.893079,
                -4.504361
              ],
              [
                129.892259,
                -4.504136
              ],
              [
                129.892049,
                -4.503874
              ],
              [
                129.892033,
                -4.503462
              ],
              [
                129.892167,
                -4.503035
              ],
              [
                129.892613,
                -4.502692
              ],
              [
                129.892774,
                -4.502441
              ],
              [
                129.892967,
                -4.50235
              ]
            ]
          ],
          [
            [
              [
                129.90273,
                -4.519111
              ],
              [
                129.900874,
                -4.518853
              ],
              [
                129.900273,
                -4.520009
              ],
              [
                129.900123,
                -4.52064
              ],
              [
                129.900123,
                -4.52219
              ],
              [
                129.900445,
                -4.52419
              ],
              [
                129.901046,
                -4.523517
              ],
              [
                129.901421,
                -4.523078
              ],
              [
                129.902784,
                -4.523174
              ],
              [
                129.90273,
                -4.519111
              ]
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
              129.904039,
              -4.524939
            ],
            [
              129.904608,
              -4.524971
            ],
            [
              129.90449,
              -4.530971
            ],
            [
              129.904243,
              -4.53111
            ],
            [
              129.903374,
              -4.531196
            ],
            [
              129.90244,
              -4.530843
            ],
            [
              129.90155,
              -4.530201
            ],
            [
              129.90111,
              -4.53003
            ],
            [
              129.900692,
              -4.530009
            ],
            [
              129.900568,
              -4.530084
            ],
            [
              129.900627,
              -4.530239
            ],
            [
              129.900627,
              -4.530388
            ],
            [
              129.900498,
              -4.530378
            ],
            [
              129.900472,
              -4.530228
            ],
            [
              129.900531,
              -4.529715
            ],
            [
              129.900418,
              -4.529458
            ],
            [
              129.900477,
              -4.524276
            ],
            [
              129.9014,
              -4.523078
            ],
            [
              129.902794,
              -4.523217
            ],
            [
              129.902827,
              -4.523891
            ],
            [
              129.904093,
              -4.523902
            ],
            [
              129.904039,
              -4.524939
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
        "type": "MultiPolygon",
        "coordinates": [
          [
            [
              [
                129.900155,
                -4.520725
              ],
              [
                129.900101,
                -4.52234
              ],
              [
                129.900402,
                -4.52418
              ],
              [
                129.900423,
                -4.527142
              ],
              [
                129.900434,
                -4.528693
              ],
              [
                129.90038,
                -4.529602
              ],
              [
                129.899833,
                -4.52941
              ],
              [
                129.898975,
                -4.52942
              ],
              [
                129.898471,
                -4.529624
              ],
              [
                129.897569,
                -4.529827
              ],
              [
                129.897076,
                -4.529945
              ],
              [
                129.896969,
                -4.529827
              ],
              [
                129.897167,
                -4.529271
              ],
              [
                129.89677,
                -4.52895
              ],
              [
                129.896185,
                -4.52887
              ],
              [
                129.895536,
                -4.528618
              ],
              [
                129.89507,
                -4.528506
              ],
              [
                129.894946,
                -4.527896
              ],
              [
                129.894683,
                -4.527522
              ],
              [
                129.894721,
                -4.527201
              ],
              [
                129.895155,
                -4.526763
              ],
              [
                129.895354,
                -4.526522
              ],
              [
                129.8961,
                -4.526009
              ],
              [
                129.897183,
                -4.524442
              ],
              [
                129.897253,
                -4.523934
              ],
              [
                129.897972,
                -4.523089
              ],
              [
                129.898224,
                -4.522891
              ],
              [
                129.898272,
                -4.5228
              ],
              [
                129.898417,
                -4.522955
              ],
              [
                129.898894,
                -4.52242
              ],
              [
                129.899544,
                -4.521634
              ],
              [
                129.899704,
                -4.52119
              ],
              [
                129.899978,
                -4.520923
              ],
              [
                129.900155,
                -4.520463
              ],
              [
                129.900155,
                -4.520725
              ]
            ]
          ],
          [
            [
              [
                129.886143,
                -4.502864
              ],
              [
                129.886685,
                -4.502815
              ],
              [
                129.887044,
                -4.502933
              ],
              [
                129.887415,
                -4.50311
              ],
              [
                129.887828,
                -4.503099
              ],
              [
                129.887892,
                -4.503078
              ],
              [
                129.888101,
                -4.503174
              ],
              [
                129.888166,
                -4.503404
              ],
              [
                129.887983,
                -4.503479
              ],
              [
                129.887656,
                -4.503548
              ],
              [
                129.887238,
                -4.503687
              ],
              [
                129.886878,
                -4.503837
              ],
              [
                129.886406,
                -4.503869
              ],
              [
                129.886068,
                -4.503703
              ],
              [
                129.885789,
                -4.503457
              ],
              [
                129.885741,
                -4.503238
              ],
              [
                129.885864,
                -4.502987
              ],
              [
                129.886143,
                -4.502864
              ]
            ]
          ]
        ]
      }
    }
  ]
};
