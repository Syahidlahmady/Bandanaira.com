import React, { useMemo, useState } from 'react'
import { ArrowUpRightIcon } from './LandingIcons'

export interface PublicSawDestination {
  id: string
  name: string
  island: string
  category: 'Bahari & Selam' | 'Sejarah & Benteng' | 'Alam & Rempah'
  costRp: number
  travelMinutes: number
  facilityScore: number
  attractionScore: number
  description: string
  highlights: string[]
  image: string
  guideWhatsapp: string
}

export const PUBLIC_SAW_DESTINATIONS: PublicSawDestination[] = [
  {
    id: 'saw-1',
    name: 'Taman Laut Lava Flow Banda Api',
    island: 'Banda Api',
    category: 'Bahari & Selam',
    costRp: 150000,
    travelMinutes: 15,
    facilityScore: 88,
    attractionScore: 98,
    description:
      'Koloni karang meja raksasa yang tumbuh di atas aliran lava letusan 1988 dengan visibilitas air hingga 30 meter.',
    highlights: ['Snorkeling & Scuba', 'Karang Vulkanik Unik', '15 Menit Perahu'],
    image:
      'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=900&q=85',
    guideWhatsapp: '6281234567891',
  },
  {
    id: 'saw-2',
    name: 'Benteng Belgica & Nassau (UNESCO Trail)',
    island: 'Pulau Neira',
    category: 'Sejarah & Benteng',
    costRp: 35000,
    travelMinutes: 8,
    facilityScore: 95,
    attractionScore: 96,
    description:
      'Benteng berarsitektur pentagon utuh abad ke-17 yang menghadap Teluk Banda dan puncak Gunung Banda Api.',
    highlights: ['Cagar Budaya Nasional', 'Audio Guide Sejarah', 'Spot Sunset Terbaik'],
    image:
      'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=900&q=85',
    guideWhatsapp: '6281234567892',
  },
  {
    id: 'saw-3',
    name: 'Pantai & Wall Diving Pulau Hatta',
    island: 'Pulau Hatta',
    category: 'Bahari & Selam',
    costRp: 250000,
    travelMinutes: 45,
    facilityScore: 86,
    attractionScore: 97,
    description:
      'Pulau tenang dengan pasir putih bersih, tebing karang bawah laut, kawanan lumba-lumba, dan homestay ramah lingkungan.',
    highlights: ['Pasir Putih Alami', 'Penyu & Lumba-lumba', 'Eco-Stay Tepi Pantai'],
    image:
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=85',
    guideWhatsapp: '6281234567893',
  },
  {
    id: 'saw-4',
    name: 'Rumah Pengasingan Bung Hatta & Sjahrir',
    island: 'Pulau Neira',
    category: 'Sejarah & Benteng',
    costRp: 25000,
    travelMinutes: 5,
    facilityScore: 94,
    attractionScore: 93,
    description:
      'Museum hidup tempat Mohammad Hatta dan Sutan Sjahrir merumuskan gagasan kemerdekaan Indonesia bersama warga Banda.',
    highlights: ['Museum Kemerdekaan', 'Koleksi Asli 1936', 'Pusat Kota Neira'],
    image:
      'https://images.unsplash.com/photo-1580655653885-65763b2597d0?auto=format&fit=crop&w=900&q=85',
    guideWhatsapp: '6281234567892',
  },
  {
    id: 'saw-5',
    name: 'Pendakian Kaldera Gunung Banda Api (656 mdpl)',
    island: 'Banda Api',
    category: 'Alam & Rempah',
    costRp: 200000,
    travelMinutes: 25,
    facilityScore: 78,
    attractionScore: 95,
    description:
      'Jalur pendakian menantang menuju bibir kawah gunung api aktif di tengah laut dengan lanskap kepulauan 360 derajat.',
    highlights: ['Trekking Sunrise', 'Kawah Vulkanik Aktif', 'Pemandu Resmi'],
    image:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=85',
    guideWhatsapp: '6281234567894',
  },
  {
    id: 'saw-6',
    name: 'Agrowisata Perkebunan Pala Pusaka Lonthoir',
    island: 'Banda Besar',
    category: 'Alam & Rempah',
    costRp: 75000,
    travelMinutes: 20,
    facilityScore: 89,
    attractionScore: 92,
    description:
      'Menyusuri hutan pohon kenari raksasa dan kebun pala berusia berabad-abad bersama petani Poktan Lonthoir.',
    highlights: ['Wisata Petik Pala', 'Sumur Pusaka & Benteng Hollandia', 'Kuliner Kenari'],
    image:
      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=900&q=85',
    guideWhatsapp: '6281234567895',
  },
  {
    id: 'saw-7',
    name: 'Eksplorasi Pulau Ai & Benteng Revenge',
    island: 'Pulau Ai',
    category: 'Bahari & Selam',
    costRp: 220000,
    travelMinutes: 40,
    facilityScore: 84,
    attractionScore: 94,
    description:
      'Perpaduan laguna biru turkois, desa tua bersejarah Benteng Revenge, dan spot berenang bersama hiu karang ramah.',
    highlights: ['Benteng Revenge VOC', 'Laguna Karang Sehat', 'Snorkeling Hiu Karang'],
    image:
      'https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?auto=format&fit=crop&w=900&q=85',
    guideWhatsapp: '6281234567896',
  },
  {
    id: 'saw-8',
    name: 'Pulau Rhun (Pertukaran Bersejarah Manhattan 1667)',
    island: 'Pulau Rhun',
    category: 'Sejarah & Benteng',
    costRp: 280000,
    travelMinutes: 60,
    facilityScore: 81,
    attractionScore: 96,
    description:
      'Pulau legendaris yang ditukar Inggris dengan pulau Manhattan New York dalam Traktat Breda 1667 karena pala.',
    highlights: ['Traktat Breda 1667', 'Desa Tradisional', 'Wisata Sejarah Unik'],
    image:
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=900&q=85',
    guideWhatsapp: '6281234567897',
  },
]

export interface TourismSawSectionProps {
  onNavigate: (tab: any) => void
}

export const TourismSawSection: React.FC<TourismSawSectionProps> = ({ onNavigate }) => {
  const [sawIslandFilter, setSawIslandFilter] = useState<string>('SEMUA')
  const [sawCategoryFilter, setSawCategoryFilter] = useState<string>('SEMUA')
  const [wCost, setWCost] = useState<number>(0.25)
  const [wDistance, setWDistance] = useState<number>(0.20)
  const [wFacility, setWFacility] = useState<number>(0.30)
  const [wAttraction, setWAttraction] = useState<number>(0.25)

  const sawRankedDestinations = useMemo(() => {
    const filtered = PUBLIC_SAW_DESTINATIONS.filter((d) => {
      const matchIsland = sawIslandFilter === 'SEMUA' || d.island === sawIslandFilter
      const matchCat = sawCategoryFilter === 'SEMUA' || d.category === sawCategoryFilter
      return matchIsland && matchCat
    })

    if (filtered.length === 0) return []

    const sumW = (wCost + wDistance + wFacility + wAttraction) || 1.0
    const normW1 = wCost / sumW
    const normW2 = wDistance / sumW
    const normW3 = wFacility / sumW
    const normW4 = wAttraction / sumW

    const minCost = Math.min(...filtered.map((d) => d.costRp))
    const minDistance = Math.min(...filtered.map((d) => d.travelMinutes))
    const maxFacility = Math.max(...filtered.map((d) => d.facilityScore))
    const maxAttraction = Math.max(...filtered.map((d) => d.attractionScore))

    const scored = filtered.map((d) => {
      const rCost = minCost / d.costRp
      const rDist = minDistance / d.travelMinutes
      const rFac = d.facilityScore / (maxFacility || 1)
      const rAttr = d.attractionScore / (maxAttraction || 1)

      const v = (normW1 * rCost) + (normW2 * rDist) + (normW3 * rFac) + (normW4 * rAttr)
      return {
        ...d,
        sawScore: Math.round(v * 100),
      }
    })

    return scored.sort((a, b) => b.sawScore - a.sawScore)
  }, [sawIslandFilter, sawCategoryFilter, wCost, wDistance, wFacility, wAttraction])

  return (
    <section
      id="wisata"
      aria-labelledby="marine-experiences-title"
      className="relative flex w-full flex-col items-start gap-10 self-stretch bg-[#f7f5f0] px-6 py-16 sm:px-12 lg:px-20 lg:py-24"
    >
      <header className="flex w-full flex-col items-start gap-8 md:flex-row md:items-end md:justify-between">
        <div className="relative flex w-full flex-col items-start gap-[18px] md:max-w-[760px]">
          <div className="relative inline-flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="relative h-px w-6 bg-amber-600"
            />
            <span className="relative w-fit whitespace-nowrap text-[11px] font-semibold leading-[normal] tracking-[1.80px] text-amber-600">
              DESTINASI &amp; SISTEM PENDUKUNG KEPUTUSAN WISATA (SAW)
            </span>
          </div>
          <h2
            id="marine-experiences-title"
            className="relative self-stretch text-[36px] font-medium leading-[42px] tracking-[-2.00px] text-[#0f2c59] md:text-[50px] md:leading-[56px]"
          >
            Destinasi Pilihan &amp;
            <br />
            Rekomendasi Cerdas Wisata
          </h2>
          <p className="text-[#63717d] text-base leading-relaxed">
            Temukan spot bahari, sejarah, dan alam terbaik di Kepulauan Banda. Sesuaikan preferensi bobot Anda
            untuk mendapatkan peringkat rekomendasi berbasis algoritma <b>Simple Additive Weighting (SAW)</b>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('smart_planner')}
            className="inline-flex h-[46px] shrink-0 items-center gap-3 overflow-hidden rounded-lg bg-amber-600 hover:bg-amber-500 text-white px-5 py-0 text-xs font-semibold transition-colors"
          >
            <span>Buka Smart Planner Penuh</span>
            <ArrowUpRightIcon className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* SAW Controls & Preferences Panel */}
      <div className="w-full bg-white rounded-2xl p-6 sm:p-8 border border-[#dce1df] shadow-sm flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#dce1df]">
          <div>
            <h3 className="text-base font-bold text-[#0f2c59]">
              Kalkulator Rekomendasi Cerdas SAW
            </h3>
            <p className="text-xs text-[#63717d] mt-0.5">
              Atur bobot kriteria sesuai gaya perjalanan Anda untuk mengurutkan destinasi secara objektif.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[#63717d] font-medium mr-1">Preset Cepat:</span>
            <button
              type="button"
              onClick={() => {
                setWCost(0.40)
                setWDistance(0.25)
                setWFacility(0.20)
                setWAttraction(0.15)
              }}
              className="px-3 py-1.5 rounded-md bg-[#f7f5f0] hover:bg-amber-100 hover:text-amber-900 text-[#0f2c59] font-medium transition-colors"
            >
             Hemat Budget
            </button>
            <button
              type="button"
              onClick={() => {
                setWCost(0.15)
                setWDistance(0.45)
                setWFacility(0.25)
                setWAttraction(0.15)
              }}
              className="px-3 py-1.5 rounded-md bg-[#f7f5f0] hover:bg-amber-100 hover:text-amber-900 text-[#0f2c59] font-medium transition-colors"
            >
              Dekat &amp; Akses Cepat
            </button>
            <button
              type="button"
              onClick={() => {
                setWCost(0.15)
                setWDistance(0.15)
                setWFacility(0.25)
                setWAttraction(0.45)
              }}
              className="px-3 py-1.5 rounded-md bg-[#f7f5f0] hover:bg-amber-100 hover:text-amber-900 text-[#0f2c59] font-medium transition-colors"
            >
              Daya Tarik Maksimal
            </button>
            <button
              type="button"
              onClick={() => {
                setWCost(0.25)
                setWDistance(0.20)
                setWFacility(0.30)
                setWAttraction(0.25)
              }}
              className="px-3 py-1.5 rounded-md bg-amber-600 text-white font-medium transition-colors"
            >
              Seimbang (Default)
            </button>
          </div>
        </div>

        {/* Sliders Bobot SAW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-[#f7f5f0]">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-[#0f2c59]">C1: Biaya / Tiket (Cost)</span>
              <span className="font-mono font-bold text-amber-700">{Math.round(wCost * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.60"
              step="0.05"
              value={wCost}
              onChange={(e) => setWCost(parseFloat(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
            <span className="text-[10px] text-[#63717d]">Semakin murah semakin diprioritaskan</span>
          </div>

          <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-[#f7f5f0]">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-[#0f2c59]">C2: Waktu Tempuh (Cost)</span>
              <span className="font-mono font-bold text-amber-700">{Math.round(wDistance * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.60"
              step="0.05"
              value={wDistance}
              onChange={(e) => setWDistance(parseFloat(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
            <span className="text-[10px] text-[#63717d]">Semakin cepat akses semakin disukai</span>
          </div>

          <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-[#f7f5f0]">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-[#0f2c59]">C3: Kelengkapan Fasilitas</span>
              <span className="font-mono font-bold text-amber-700">{Math.round(wFacility * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.60"
              step="0.05"
              value={wFacility}
              onChange={(e) => setWFacility(parseFloat(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
            <span className="text-[10px] text-[#63717d]">Kesiapan amenitas 4A &amp; toilet/dermaga</span>
          </div>

          <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-[#f7f5f0]">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-[#0f2c59]">C4: Daya Tarik &amp; Rating</span>
              <span className="font-mono font-bold text-amber-700">{Math.round(wAttraction * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.60"
              step="0.05"
              value={wAttraction}
              onChange={(e) => setWAttraction(parseFloat(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
            <span className="text-[10px] text-[#63717d]">Keunikan pemandangan &amp; reputasi dunia</span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#dce1df]">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-[#0f2c59] mr-2">Pulau:</span>
            {['SEMUA', 'Pulau Neira', 'Banda Api', 'Banda Besar', 'Pulau Hatta', 'Pulau Ai', 'Pulau Rhun'].map((isl) => (
              <button
                key={isl}
                type="button"
                onClick={() => setSawIslandFilter(isl)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  sawIslandFilter === isl
                    ? 'bg-[#0f2c59] text-white'
                    : 'bg-[#f7f5f0] text-[#63717d] hover:text-[#0f2c59]'
                }`}
              >
                {isl}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-[#0f2c59] mr-2">Kategori:</span>
            {['SEMUA', 'Bahari & Selam', 'Sejarah & Benteng', 'Alam & Rempah'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSawCategoryFilter(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  sawCategoryFilter === cat
                    ? 'bg-amber-600 text-white'
                    : 'bg-[#f7f5f0] text-[#63717d] hover:text-[#0f2c59]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SAW Ranked Destinations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
        {sawRankedDestinations.map((dest, idx) => (
          <article
            key={dest.id}
            className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-[#dce1df] shadow-sm hover:shadow-md transition-all relative"
          >
            {/* Gambar & Badges */}
            <div className="h-48 w-full relative overflow-hidden bg-slate-200">
              <img
                src={dest.image}
                alt={dest.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#081d35cc] via-transparent to-transparent" />
              
              {/* Ranking Badge SAW */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/90 backdrop-blur-sm text-white text-[11px] font-bold shadow">
                <span>#{idx + 1}</span>
                <span>Skor {dest.sawScore}</span>
              </div>

              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#081d35]/80 backdrop-blur-sm text-white text-[10px] font-medium">
                {dest.island}
              </div>

              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                <span className="font-semibold text-amber-300">
                  Rp {dest.costRp.toLocaleString('id-ID')}
                </span>
                <span className="text-[11px] opacity-90">
                  ~{dest.travelMinutes} Menit
                </span>
              </div>
            </div>

            {/* Konten Destinasi */}
            <div className="p-5 flex flex-col flex-1 justify-between gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold tracking-wider text-amber-600 uppercase">
                  {dest.category}
                </span>
                <h3 className="text-base font-bold text-[#0f2c59] leading-snug group-hover:text-amber-700 transition-colors">
                  {dest.name}
                </h3>
                <p className="text-xs text-[#63717d] line-clamp-3 leading-relaxed">
                  {dest.description}
                </p>

                {/* Highlights */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {dest.highlights.map((h) => (
                    <span
                      key={h}
                      className="text-[10px] px-2 py-0.5 rounded bg-[#f7f5f0] text-[#0f2c59] font-medium"
                    >
                      ✓ {h}
                    </span>
                  ))}
                </div>
              </div>

              {/* Score Breakdown & Action */}
              <div className="pt-3 border-t border-[#dce1df] flex flex-col gap-2.5">
                <div className="grid grid-cols-2 gap-2 text-[10px] text-[#63717d] bg-[#f7f5f0] p-2 rounded-lg">
                  <div>Fasilitas 4A: <b className="text-[#0f2c59]">{dest.facilityScore}/100</b></div>
                  <div>Daya Tarik: <b className="text-[#0f2c59]">{dest.attractionScore}/100</b></div>
                </div>

                <a
                  href={`https://wa.me/${dest.guideWhatsapp}?text=${encodeURIComponent(
                    `Halo Pemandu Banda, saya melihat destinasi ${dest.name} di bandanaira.com (Skor SAW #${idx + 1}). Mohon informasi paket tur dan jadwal keberangkatan.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  <span>Tanya Pemandu via WA</span>
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default TourismSawSection
