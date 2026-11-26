export interface HealthFacility {
  id: string;
  name: string;
  type: 'RSUD' | 'Puskesmas' | 'Poskesdes' | 'Pos Medis Darurat';
  island: 'Pulau Neira' | 'Pulau Banda Besar' | 'Pulau Ai' | 'Pulau Rhun' | 'Pulau Hatta';
  village: string;
  latitude: number;
  longitude: number;
  phone: string;
  emergencyPhone?: string;
  operatingHours: string;
  services: string[];
  oxygenAvailable: boolean;
  boatAmbulanceAccess: boolean;
  description: string;
}

export interface FirstAidGuide {
  id: string;
  title: string;
  category: 'Bahari & Diving' | 'Pertanian & Vulkanik' | 'Umum & Trauma';
  symptoms: string[];
  steps: string[];
  doNotDo: string[];
}

/**
 * Direktori Fasilitas Kesehatan Resmi Kepulauan Banda (Tersimpan Lokal / Offline Ready)
 */
export const BANDA_HEALTH_FACILITIES: HealthFacility[] = [
  {
    id: 'faskes-01',
    name: 'RSUD Banda (Rumah Sakit Umum Daerah)',
    type: 'RSUD',
    island: 'Pulau Neira',
    village: 'Nusantara',
    latitude: -4.5262,
    longitude: 129.9042,
    phone: '0910-21000',
    emergencyPhone: '0812-4000-RSUD',
    operatingHours: '24 Jam (UGD Standby)',
    services: [
      'Unit Gawat Darurat (UGD 24 Jam)',
      'Dokter Spesialis & Umum',
      'Kamar Operasi Minor',
      'Rawat Inap & Isolasi',
      'Laboratorium Medis',
      'Depo Oksigen Medis Terpusat',
      'Apotek Siaga'
    ],
    oxygenAvailable: true,
    boatAmbulanceAccess: true,
    description: 'Pusat rujukan medis utama untuk seluruh gugusan Kepulauan Banda, dilengkapi dermaga pendaratan ambulans laut darurat.'
  },
  {
    id: 'faskes-02',
    name: 'Puskesmas Perawatan Banda Neira',
    type: 'Puskesmas',
    island: 'Pulau Neira',
    village: 'Dwiwarna',
    latitude: -4.5245,
    longitude: 129.9015,
    phone: '0910-21011',
    emergencyPhone: '0821-9988-PKM1',
    operatingHours: '08:00 - 15:00 (UGD 24 Jam)',
    services: [
      'Poli Rawat Jalan & Gigi',
      'Poli KIA (Kesehatan Ibu & Anak)',
      'Pertolongan Persalinan 24 Jam',
      'Vaksinasi & Imunisasi',
      'Tabung Oksigen Transport',
      'P3K Penyelam & Turis'
    ],
    oxygenAvailable: true,
    boatAmbulanceAccess: true,
    description: 'Pusat pelayanan primer terintegrasi di Pulau Neira, melayani rujukan pertama warga pulau.'
  },
  {
    id: 'faskes-03',
    name: 'Poskesdes Lonthoir (Banda Besar Barat)',
    type: 'Poskesdes',
    island: 'Pulau Banda Besar',
    village: 'Lonthoir',
    latitude: -4.5518,
    longitude: 129.8973,
    phone: '0813-5400-LNT',
    operatingHours: '08:00 - 16:00 (Panggilan Darurat Siaga)',
    services: [
      'Pemeriksaan Bidan Desa & KIA',
      'P3K Kecelakaan Petani Kebun Pala',
      'Penanganan Pertama Gigitan Hewan/Serangga',
      'Penyuluhan Gizi & Posyandu Balita'
    ],
    oxygenAvailable: false,
    boatAmbulanceAccess: true,
    description: 'Pos kesehatan desa yang melayani petani pala di perbukitan Lonthoir dan sekitarnya.'
  },
  {
    id: 'faskes-04',
    name: 'Poskesdes Selamon (Banda Besar Timur)',
    type: 'Poskesdes',
    island: 'Pulau Banda Besar',
    village: 'Selamon',
    latitude: -4.5672,
    longitude: 129.9511,
    phone: '0813-5400-SLM',
    operatingHours: '08:00 - 16:00 (On Call Darurat)',
    services: [
      'Pertolongan Medis Pertama Petani & Nelayan',
      'Pemeriksaan Tekanan Darah & Gula',
      'Rawat Luka Ringan & Jahit Sederhana',
      'Obat-Obatan Esensial Puskesmas'
    ],
    oxygenAvailable: false,
    boatAmbulanceAccess: true,
    description: 'Pos kesehatan garda depan di pesisir timur Pulau Banda Besar.'
  },
  {
    id: 'faskes-05',
    name: 'Poskesdes Waer (Banda Besar Selatan)',
    type: 'Poskesdes',
    island: 'Pulau Banda Besar',
    village: 'Waer',
    latitude: -4.5820,
    longitude: 129.9240,
    phone: '0813-5400-WAER',
    operatingHours: '08:00 - 16:00 (On Call)',
    services: [
      'Pelayanan Kesehatan Dasar',
      'Pemeriksaan Ibu Hamil',
      'Pemberian Vitamin & Obat Pertanian'
    ],
    oxygenAvailable: false,
    boatAmbulanceAccess: true,
    description: 'Melayani masyarakat pesisir selatan Pulau Banda Besar.'
  },
  {
    id: 'faskes-06',
    name: 'Pos Medis Darurat & P3K Pulau Ai',
    type: 'Pos Medis Darurat',
    island: 'Pulau Ai',
    village: 'Pulau Ai',
    latitude: -4.5190,
    longitude: 129.7750,
    phone: '0822-4800-AIPOS',
    emergencyPhone: '0812-4000-AMB-AI',
    operatingHours: '24 Jam Siaga Laut',
    services: [
      'Pertolongan Darurat Nelayan & Penyelam',
      'Tabung Oksigen Siaga',
      'Koordinasi Evakuasi Speedboat ke RSUD',
      'Obat Alergi & Antihistamin Sengatan Laut'
    ],
    oxygenAvailable: true,
    boatAmbulanceAccess: true,
    description: 'Pos garda terluar Pulau Ai dengan dermaga evakuasi cepat ke Pulau Neira.'
  },
  {
    id: 'faskes-07',
    name: 'Poskesdes Pulau Rhun',
    type: 'Poskesdes',
    island: 'Pulau Rhun',
    village: 'Pulau Rhun',
    latitude: -4.5560,
    longitude: 129.6920,
    phone: '0822-4800-RHUN',
    emergencyPhone: '0812-4000-AMB-RHUN',
    operatingHours: '24 Jam Siaga Nelayan',
    services: [
      'Penanganan Gawat Darurat Pertama',
      'Imobilisasi Patah Tulang Sederhana',
      'Pemberian Oksigen Darurat',
      'Koordinasi Radio Medik Darurat'
    ],
    oxygenAvailable: true,
    boatAmbulanceAccess: true,
    description: 'Pos kesehatan di pulau paling barat gugusan Banda (Pulau Rhun bersejarah).'
  },
  {
    id: 'faskes-08',
    name: 'Pos Medis & Radio Darurat Pulau Hatta',
    type: 'Pos Medis Darurat',
    island: 'Pulau Hatta',
    village: 'Kampung Lama / Baru',
    latitude: -4.5912,
    longitude: 130.0125,
    phone: '0822-4800-HATTA',
    emergencyPhone: '0812-4000-AMB-HATTA',
    operatingHours: '24 Jam Siaga Bahari',
    services: [
      'Pos Darurat Penyelam (Diving First Response)',
      'Tabung Oksigen Murni Pertolongan Pertama',
      'Perawatan Sengatan Karang Api & Ubur-ubur',
      'Radio Komunikasi Evakuasi SAR'
    ],
    oxygenAvailable: true,
    boatAmbulanceAccess: true,
    description: 'Pos medis di ujung timur Banda (Pulau Hatta) dengan spot penyelaman dalam (*wall dive*).'
  }
];

/**
 * Kontak Darurat & Ambulans Laut Kepulauan Banda
 */
export const BANDA_EMERGENCY_CONTACTS = [
  {
    id: 'sea-ambulance',
    name: 'Ambulans Laut Banda (Sea Ambulance)',
    phone: '0812-4000-BANDA',
    category: 'Evakuasi Cepat Antarpulau',
    role: 'Perahu cepat evakuasi medis darurat 24 jam dengan brankar & oksigen'
  },
  {
    id: 'sar-banda',
    name: 'Pos SAR & Basarnas Banda',
    phone: '0811-4700-SAR',
    category: 'Pencarian & Penyelamatan Laut',
    role: 'Penyelamatan kecelakaan kapal, perahu nelayan mati mesin, diver hilang'
  },
  {
    id: 'igd-rsud',
    name: 'UGD RSUD Banda (Emergency Room)',
    phone: '0910-21000',
    category: 'Rumah Sakit Rujukan',
    role: 'Dokter jaga triase darurat, resusitasi, dan kamar operasi minor'
  },
  {
    id: 'polairud-banda',
    name: 'Satpolairud Polres Maluku Tengah Banda',
    phone: '0813-4400-AIRUD',
    category: 'Patroli Keamanan Laut',
    role: 'Bantuan pengawalan laut dan kontak navigasi cuaca darurat'
  }
];

/**
 * Panduan Pertolongan Pertama (P3K) Khas Kepulauan Banda (Tersimpan Offline)
 */
export const BANDA_FIRST_AID_GUIDES: FirstAidGuide[] = [
  {
    id: 'fa-01',
    title: 'Sengatan Ubur-ubur Kotak / Bluebottle di Laut',
    category: 'Bahari & Diving',
    symptoms: [
      'Rasa terbakar hebat dan mendadak di kulit',
      'Garis merah melepuh seperti bekas cambukan tentakel',
      'Sesak napas, pusing, atau kram otot pada kasus berat'
    ],
    steps: [
      'Bawa korban segera keluar dari air laut dengan tenang.',
      'Siram area sengatan dengan air cuka dapur (asam asetat 4-6%) selama minimal 30 detik untuk menonaktifkan nematosista yang belum meledak.',
      'Jika cuka tidak ada, bilas lembut menggunakan air laut bersih (JANGAN air tawar).',
      'Lepaskan sisa tentakel menggunakan pinset atau sarung tangan pelindung.',
      'Rendam bagian yang tersengat dalam air hangat (suhu 42-45°C) selama 20–45 menit untuk meredakan nyeri.',
      'Segera hubungi Ambulans Laut jika timbul sesak napas atau lemas.'
    ],
    doNotDo: [
      'JANGAN bilas dengan air tawar, air kelapa, atau alkohol (memicu racun meledak).',
      'JANGAN menggosok area luka dengan pasir atau handuk.',
      'JANGAN mengikat tourniquet.'
    ]
  },
  {
    id: 'fa-02',
    title: 'Tertusuk Duri Babi (Sea Urchin) atau Ikan Beracun',
    category: 'Bahari & Diving',
    symptoms: [
      'Nyeri berdenyut hebat di telapak kaki atau tangan',
      'Tampak titik hitam/duri tertancap di bawah kulit',
      'Pembengkakan dan kemerahan di sekitar luka'
    ],
    steps: [
      'Segera istirahatkan korban dan jangan biarkan berjalan menekan kaki yang tertusuk.',
      'Rendam kaki/tangan dalam air panas (toleransi kulit 43-45°C) selama 30–60 menit. Racun protein ikan dan duri babi rusak oleh suhu panas.',
      'Cabut duri yang tampak jelas di permukaan menggunakan pinset steril.',
      'Cuci dengan sabun antiseptik dan air bersih setelah perendaman air panas.',
      'Bawa ke Puskesmas jika duri tertancap dekat sendi atau terjadi infeksi nanah.'
    ],
    doNotDo: [
      'JANGAN memukul-mukul atau menginjak-injak duri hingga hancur di dalam daging.',
      'JANGAN mengorek luka terlalu dalam dengan jarum kotor tanpa antiseptik.'
    ]
  },
  {
    id: 'fa-03',
    title: 'Gejala Penyakit Dekompresi (DCI) Penyelam',
    category: 'Bahari & Diving',
    symptoms: [
      'Nyeri sendi hebat (the bends) setelah penyelaman',
      'Mati rasa, kesemutan di ujung jari atau kaki',
      'Ruam merah gatal di kulit (marbling)',
      'Sesak napas, batuk, pusing berputar, atau hilang kesadaran'
    ],
    steps: [
      'Baringkan penyelam dalam posisi horizontal telentang.',
      'Berikan oksigen murni 100% menggunakan masker non-rebreather sesegera mungkin dari pos medis/dive center.',
      'Berikan air minum jika pasien sadar penuh (rehidrasi cairan tubuh).',
      'Jaga suhu tubuh penyelam agar tidak kedinginan (*hypothermia*).',
      'Hubungi Ambulans Laut dan siapkan transfer ke fasilitas ruang hiperbarik rujukan terdekat.'
    ],
    doNotDo: [
      'JANGAN membawa penyelam menyelam kembali ke dalam air laut (in-water recompression dilarang).',
      'JANGAN memberikan minuman berkafein atau beralkohol.'
    ]
  },
  {
    id: 'fa-04',
    title: 'Keletihan Panas (Heat Exhaustion) Petani Pala di Lereng',
    category: 'Pertanian & Vulkanik',
    symptoms: [
      'Keringat berlebihan, kulit pucat dan dingin',
      'Kram otot perut atau betis saat memetik pala',
      'Mual, sakit kepala, dan denyut nadi cepat'
    ],
    steps: [
      'Pindahkan petani ke tempat teduh di bawah pohon kenari rindang.',
      'Longgarkan pakaian dan ikat pinggang.',
      'Beri minum air mineral dingin dicampur sedikit garam/gula (oralit alami).',
      'Kompres leher, ketiak, dan dahi dengan kain basah.',
      'Istirahatkan minimal 1 jam hingga denyut nadi kembali normal.'
    ],
    doNotDo: [
      'JANGAN memaksa melanjutkan memanjat pohon pala saat pusing.',
      'JANGAN memberikan air es terlalu cepat dalam jumlah sangat banyak.'
    ]
  }
];

/**
 * Menghitung jarak lurus (Great Circle Distance) antara dua titik koordinat
 * menggunakan Haversine Formula dalam satuan Kilometer.
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius bumi dalam km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // Pembulatan 1 desimal
}
