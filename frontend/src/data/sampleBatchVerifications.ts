import { PublicBatchVerification } from '../services/traceability'

export const SAMPLE_BATCH_VERIFICATIONS: Record<string, PublicBatchVerification> = {
  'BN-BTC-2026-001': {
    batch_code: 'BN-BTC-2026-001',
    commodity: 'Pala Banda Kering Grade A Super (Myristica fragrans)',
    total_quantity_kg: 350.0,
    production_date: '2026-11-12',
    origin_village: 'Desa Lonthoir, Kepulauan Banda, Maluku Tengah',
    origin_farms: ['Kebun Percontohan Lonthoir', 'Perkebunan Pusaka Boiyauw'],
    status: 'packaged',
    blockchain_status: 'confirmed',
    verified_integrity: true,
    contract_address: '0x71C8407B88B2A91D9E71F4243a08b9C23D6980B8',
    transaction_hash: '0x9a3e8b1c4f7d2e0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a',
    block_number: 18942105,
    latest_db_hash: '0x4e7f8a9b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f',
    on_chain_hash: '0x4e7f8a9b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f',
    qr_code_base64: '',
    timeline: [
      {
        event_type: 'harvest_aggregated',
        event_timestamp: '2026-11-04T08:30:00Z',
        location: 'Sentra Pengumpulan Lonthoir, Banda Besar',
        description: 'Pemetikan buah pala masak pohon selektif (terbuka 1/3) dari 8 petani mitra Poktan Lonthoir Maju.',
        event_hash: '0xa1f8b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1',
      },
      {
        event_type: 'fermentation',
        event_timestamp: '2026-11-05T14:00:00Z',
        location: 'Stasiun Pengolahan Primer Lonthoir',
        description: 'Pemisahan fuli merah segar dari biji bercangkang hitam, aerasi terkontrol selama 24 jam.',
        event_hash: '0xb2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3',
      },
      {
        event_type: 'drying',
        event_timestamp: '2026-11-07T10:15:00Z',
        location: 'Para-para Pengeringan Surya Tradisional Lonthoir',
        description: 'Penjemuran alami dengan sirkulasi angin laut Banda selama 5 hari hingga cangkang berbunyi gemerincing (kadar air < 10%).',
        event_hash: '0xc3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4',
      },
      {
        event_type: 'sorting',
        event_timestamp: '2026-11-10T16:00:00Z',
        location: 'Gudang Mutu Koperasi Hatta Banda',
        description: 'Pengupasan cangkang keras dan sortasi mekanis/manual: Bebas jamur aflatoksin, kadar air teruji 8.2%, lolos kualifikasi Super ABCD Grade A.',
        event_hash: '0xd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5',
      },
      {
        event_type: 'packaging',
        event_timestamp: '2026-11-12T11:45:00Z',
        location: 'Pusat Kemasan Ekspor Banda Neira',
        description: 'Pengemasan vakum multi-layer 25kg dengan segel hologram Indikasi Geografis dan penjangkaran hash kriptografis ke EVM Smart Contract.',
        event_hash: '0x4e7f8a9b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f',
      },
    ],
  },
  'BN_VERIFY_PALA_SUPER_2026_LONTHOIR': {
    batch_code: 'BN-BTC-2026-001',
    commodity: 'Pala Banda Kering Grade A Super (Myristica fragrans)',
    total_quantity_kg: 350.0,
    production_date: '2026-11-12',
    origin_village: 'Desa Lonthoir, Kepulauan Banda, Maluku Tengah',
    origin_farms: ['Kebun Percontohan Lonthoir', 'Perkebunan Pusaka Boiyauw'],
    status: 'packaged',
    blockchain_status: 'confirmed',
    verified_integrity: true,
    contract_address: '0x71C8407B88B2A91D9E71F4243a08b9C23D6980B8',
    transaction_hash: '0x9a3e8b1c4f7d2e0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a',
    block_number: 18942105,
    latest_db_hash: '0x4e7f8a9b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f',
    on_chain_hash: '0x4e7f8a9b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f',
    qr_code_base64: '',
    timeline: [
      {
        event_type: 'harvest_aggregated',
        event_timestamp: '2026-11-04T08:30:00Z',
        location: 'Sentra Pengumpulan Lonthoir, Banda Besar',
        description: 'Pemetikan buah pala masak pohon selektif (terbuka 1/3) dari 8 petani mitra Poktan Lonthoir Maju.',
        event_hash: '0xa1f8b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1',
      },
      {
        event_type: 'fermentation',
        event_timestamp: '2026-11-05T14:00:00Z',
        location: 'Stasiun Pengolahan Primer Lonthoir',
        description: 'Pemisahan fuli merah segar dari biji bercangkang hitam, aerasi terkontrol selama 24 jam.',
        event_hash: '0xb2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3',
      },
      {
        event_type: 'drying',
        event_timestamp: '2026-11-07T10:15:00Z',
        location: 'Para-para Pengeringan Surya Tradisional Lonthoir',
        description: 'Penjemuran alami dengan sirkulasi angin laut Banda selama 5 hari hingga cangkang berbunyi gemerincing (kadar air < 10%).',
        event_hash: '0xc3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4',
      },
      {
        event_type: 'sorting',
        event_timestamp: '2026-11-10T16:00:00Z',
        location: 'Gudang Mutu Koperasi Hatta Banda',
        description: 'Pengupasan cangkang keras dan sortasi mekanis/manual: Bebas jamur aflatoksin, kadar air teruji 8.2%, lolos kualifikasi Super ABCD Grade A.',
        event_hash: '0xd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5',
      },
      {
        event_type: 'packaging',
        event_timestamp: '2026-11-12T11:45:00Z',
        location: 'Pusat Kemasan Ekspor Banda Neira',
        description: 'Pengemasan vakum multi-layer 25kg dengan segel hologram Indikasi Geografis dan penjangkaran hash kriptografis ke EVM Smart Contract.',
        event_hash: '0x4e7f8a9b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f',
      },
    ],
  },
  'BN-BTC-2026-002': {
    batch_code: 'BN-BTC-2026-002',
    commodity: 'Fuli Banda Super Merah (Mace Grade AAA)',
    total_quantity_kg: 120.0,
    production_date: '2026-11-15',
    origin_village: 'Desa Selamon, Banda Besar',
    origin_farms: ['Kebun Pala Pusaka Selamon'],
    status: 'packaged',
    blockchain_status: 'confirmed',
    verified_integrity: true,
    contract_address: '0x71C8407B88B2A91D9E71F4243a08b9C23D6980B8',
    transaction_hash: '0x8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d',
    block_number: 18942188,
    latest_db_hash: '0x3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b',
    on_chain_hash: '0x3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b',
    qr_code_base64: '',
    timeline: [
      {
        event_type: 'harvest_aggregated',
        event_timestamp: '2026-11-11T07:45:00Z',
        location: 'Kebun Rempah Selamon',
        description: 'Pemetikan fuli merah segar cerah dengan aroma harum khas pala vulkanik Kepulauan Banda.',
        event_hash: '0xe5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6',
      },
      {
        event_type: 'drying',
        event_timestamp: '2026-11-12T13:00:00Z',
        location: 'Pengering Surya Rumah Kaca Selamon',
        description: 'Penjemuran higienis tanpa terkena hujan, mempertahankan kilau merah keemasan alami.',
        event_hash: '0xf6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7',
      },
      {
        event_type: 'sorting',
        event_timestamp: '2026-11-14T15:30:00Z',
        location: 'Laboratorium Mutu Rempah Banda',
        description: 'Sortasi keutuhan bunga fuli (>95% utuh tanpa patahan), kadar minyak atsiri teruji 11.4%.',
        event_hash: '0xa7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8',
      },
      {
        event_type: 'packaging',
        event_timestamp: '2026-11-15T10:00:00Z',
        location: 'Pusat Distribusi Koperasi Hatta',
        description: 'Pengemasan kedap udara anti-lembab 5kg dengan stempel sertifikasi Indikasi Geografis.',
        event_hash: '0x3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b',
      },
    ],
  },
  'BN_VERIFY_FULI_MERAH_2026_BELGICA': {
    batch_code: 'BN-BTC-2026-002',
    commodity: 'Fuli Banda Super Merah (Mace Grade AAA)',
    total_quantity_kg: 120.0,
    production_date: '2026-11-15',
    origin_village: 'Desa Selamon, Banda Besar',
    origin_farms: ['Kebun Pala Pusaka Selamon'],
    status: 'packaged',
    blockchain_status: 'confirmed',
    verified_integrity: true,
    contract_address: '0x71C8407B88B2A91D9E71F4243a08b9C23D6980B8',
    transaction_hash: '0x8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d',
    block_number: 18942188,
    latest_db_hash: '0x3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b',
    on_chain_hash: '0x3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b',
    qr_code_base64: '',
    timeline: [
      {
        event_type: 'harvest_aggregated',
        event_timestamp: '2026-11-11T07:45:00Z',
        location: 'Kebun Rempah Selamon',
        description: 'Pemetikan fuli merah segar cerah dengan aroma harum khas pala vulkanik Kepulauan Banda.',
        event_hash: '0xe5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6',
      },
      {
        event_type: 'drying',
        event_timestamp: '2026-11-12T13:00:00Z',
        location: 'Pengering Surya Rumah Kaca Selamon',
        description: 'Penjemuran higienis tanpa terkena hujan, mempertahankan kilau merah keemasan alami.',
        event_hash: '0xf6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7',
      },
      {
        event_type: 'sorting',
        event_timestamp: '2026-11-14T15:30:00Z',
        location: 'Laboratorium Mutu Rempah Banda',
        description: 'Sortasi keutuhan bunga fuli (>95% utuh tanpa patahan), kadar minyak atsiri teruji 11.4%.',
        event_hash: '0xa7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8',
      },
      {
        event_type: 'packaging',
        event_timestamp: '2026-11-15T10:00:00Z',
        location: 'Pusat Distribusi Koperasi Hatta',
        description: 'Pengemasan kedap udara anti-lembab 5kg dengan stempel sertifikasi Indikasi Geografis.',
        event_hash: '0x3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b',
      },
    ],
  },
  'BN-BTC-2026-003': {
    batch_code: 'BN-BTC-2026-003',
    commodity: 'Pala Organik Pulau Ai Grade AA (Eco-Certified)',
    total_quantity_kg: 210.0,
    production_date: '2026-11-18',
    origin_village: 'Pulau Ai, Kepulauan Banda',
    origin_farms: ['Kebun Rakyat Organik Pulau Ai'],
    status: 'packaged',
    blockchain_status: 'confirmed',
    verified_integrity: true,
    contract_address: '0x71C8407B88B2A91D9E71F4243a08b9C23D6980B8',
    transaction_hash: '0x7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c',
    block_number: 18942234,
    latest_db_hash: '0x1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9f0e1d2c3b4a5f6e7d8c9b0a1f2e',
    on_chain_hash: '0x1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9f0e1d2c3b4a5f6e7d8c9b0a1f2e',
    qr_code_base64: '',
    timeline: [
      {
        event_type: 'harvest_aggregated',
        event_timestamp: '2026-11-13T09:00:00Z',
        location: 'Kebun Rempah Organik Pulau Ai',
        description: 'Panen agroforestri tanpa pestisida kimia di bawah kanopi pohon kenari purba.',
        event_hash: '0xb8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9',
      },
      {
        event_type: 'drying',
        event_timestamp: '2026-11-15T11:20:00Z',
        location: 'Sentra Surya Pulau Ai',
        description: 'Pengeringan tenaga surya hibrida dengan sensor IoT pemantau kelembapan udara.',
        event_hash: '0xc9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0',
      },
      {
        event_type: 'sorting',
        event_timestamp: '2026-11-17T14:10:00Z',
        location: 'Depo Sertifikasi Organik Banda',
        description: 'Uji residu pestisida 0.00% dan sertifikasi mutu rempah kepulauan ramah lingkungan.',
        event_hash: '0xd0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1',
      },
      {
        event_type: 'packaging',
        event_timestamp: '2026-11-18T16:00:00Z',
        location: 'Dermaga Ekspor Banda Neira',
        description: 'Pengemasan goni organik berlapis bio-foil ramah lingkungan dan penjangkaran on-chain.',
        event_hash: '0x1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9f0e1d2c3b4a5f6e7d8c9b0a1f2e',
      },
    ],
  },
}

export function getSampleBatchVerification(query: string): PublicBatchVerification | null {
  if (!query) return null
  const normalized = query.trim().toUpperCase()

  // Exact match
  if (SAMPLE_BATCH_VERIFICATIONS[normalized]) {
    return SAMPLE_BATCH_VERIFICATIONS[normalized]
  }

  // Substring match
  for (const [key, value] of Object.entries(SAMPLE_BATCH_VERIFICATIONS)) {
    if (key.toUpperCase().includes(normalized) || value.batch_code.toUpperCase().includes(normalized)) {
      return value
    }
  }

  // Fallback to first batch if query is a generic batch query
  if (normalized.includes('BATCH') || normalized.includes('BTC') || normalized.includes('PALA') || normalized.includes('FULI')) {
    return SAMPLE_BATCH_VERIFICATIONS['BN-BTC-2026-001']
  }

  return null
}
