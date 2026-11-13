import React, { useState } from 'react'

export interface JelajahPetaDesktopViewProps {
  onNavigateTab?: (tab: string) => void
  onSelectPlace?: (placeName: string) => void
  onClose?: () => void
}

export const JelajahPetaDesktopView: React.FC<JelajahPetaDesktopViewProps> = ({
  onNavigateTab,
  onClose,
}) => {
  const [selectedIsland, setSelectedIsland] = useState<string>('Semua Pulau')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [layerWisata, setLayerWisata] = useState<boolean>(true)
  const [layerHomestay, setLayerHomestay] = useState<boolean>(true)
  const [layerKebun, setLayerKebun] = useState<boolean>(true)
  const [layerDermaga, setLayerDermaga] = useState<boolean>(true)
  const [showDetailCard, setShowDetailCard] = useState<boolean>(true)
  const [activePlace, setActivePlace] = useState<{
    name: string
    sub: string
    category: string
    badge: string
    desc: string
    coords: string
    image: string
    status: string
    hours: string
    facilities: string[]
  }>({
    name: 'Benteng Belgica',
    sub: 'Benteng Pentagon Abad ke-17 · Cagar Budaya UNESCO',
    category: 'Wisata Budaya & Sejarah',
    badge: '177 Cagar Budaya',
    desc: 'Benteng segi lima peninggalan VOC di atas bukit Pulau Neira, menghadap ke Teluk Banda dan Gunung Banda Api. Salah satu benteng terutuh di Asia Tenggara.',
    coords: '4°31′24″ LS 129°54′18″ BT',
    image: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=800&q=85',
    status: 'Buka Sekarang',
    hours: '08:00 – 18:00 WIT',
    facilities: ['Pemandu HPI', 'Spot Sunset 360°', 'Audio Guide', 'Toilet & Mushola'],
  })

  const islands = [
    'Semua Pulau',
    'Banda Neira',
    'Lonthoir',
    'Pulau Hatta',
    'Pulau Ai',
    'Pulau Run',
  ]

  return (
    <div className="relative w-full min-h-[760px] bg-[#A9E2E4] rounded-2xl overflow-hidden border border-[#96d4d6] shadow-xl text-[#0F2C59] select-none font-sans">
      {/* Background Decorative Sea Atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#A9E2E4] via-[#b3e7e9] to-[#99dcdc] pointer-events-none" />

      {/* TOP HEADER CONTROLS BAR (Figma: Jelajah Peta Desktop Header) */}
      <header className="relative z-20 flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-white/95 backdrop-blur-md border-b border-[#DFE8EA] shadow-sm">
        {/* Brand & Search Box */}
        <div className="flex items-center gap-3 flex-1 min-w-[280px] max-w-[620px]">
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-600 text-white font-bold text-xs shadow-sm">
              BN
            </div>
            <span className="font-bold text-[#0F2C59] text-sm tracking-tight hidden sm:inline">
              BST-NIRANA | Jelajah Peta
            </span>
          </div>

          <div className="h-6 w-px bg-[#DFE8EA] hidden sm:block" />

          {/* Search Input Box */}
          <div className="flex items-center gap-2 flex-1 px-3 py-1.5 rounded-xl border border-[#DFE8EA] bg-[#F8FAFC] text-xs">
            <svg
              className="w-4 h-4 text-[#647888] shrink-0"
              viewBox="0 0 18 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            >
              <circle cx="8" cy="8" r="6" />
              <path d="M12.5 12.5L16 16" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari benteng VOC, spot diving, homestay..."
              className="w-full bg-transparent outline-none text-[#0F2C59] placeholder-[#647888] text-xs"
            />
            <span className="px-1.5 py-0.5 rounded border border-[#DFE8EA] bg-white text-[10px] font-mono text-[#647888] hidden sm:inline">
              ⌘ K
            </span>
          </div>
        </div>

        {/* Right Header Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setActivePlace({
                name: 'Banda Neira (Pusat Pulau)',
                sub: 'Pelabuhan Utama & Balai Desa Nusantara',
                category: 'Fasilitas & Dermaga',
                badge: 'Pusat Layanan',
                desc: 'Pusat aktivitas masyarakat kepulauan Banda dengan dermaga cepat feri, pasar rempah, dan dispenser air bersih RO Koperasi.',
                coords: '4°31′32″ LS 129°54′08″ BT',
                image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=85',
                status: 'Aktif 24 Jam',
                hours: 'Pelayanan Setiap Hari',
                facilities: ['Dermaga Feri', 'Pos Air RO', 'Puskesmas Banda', 'Koperasi Hatta'],
              })
              setShowDetailCard(true)
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#DFE8EA] bg-white hover:bg-[#F8FAFC] text-xs font-semibold text-[#0F2C59] transition-colors"
          >
            <svg className="w-3.5 h-3.5 text-[#0F2C59]" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="9" cy="9" r="7" />
              <circle cx="9" cy="9" r="2" />
            </svg>
            <span>Lokasi Saya</span>
          </button>

          {onNavigateTab && (
            <button
              type="button"
              onClick={() => onNavigateTab('gis')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0F2C59] hover:bg-[#1a4175] text-white text-xs font-semibold transition-colors shadow-sm"
            >
              <span>Mode 7-Layer GIS</span>
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 4l6-2 6 2v8l-6 2-6-2V4z" />
              </svg>
            </button>
          )}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-sm font-bold"
              title="Tutup Peta"
            >
              ✕
            </button>
          )}
        </div>
      </header>

      {/* SUB-HEADER: ISLAND FILTER PILLS */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 px-5 py-2.5 bg-[#A9E2E4]/80 backdrop-blur-sm border-b border-[#96d4d6]">
        <div className="flex flex-wrap items-center gap-1.5">
          {islands.map((isl) => (
            <button
              key={isl}
              type="button"
              onClick={() => setSelectedIsland(isl)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all shadow-sm ${
                selectedIsland === isl
                  ? 'bg-[#0F2C59] text-white'
                  : 'bg-white/90 text-[#0F2C59] hover:bg-white'
              }`}
            >
              {selectedIsland === isl && '✓ '}
              {isl}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#0F2C59] bg-white/70 px-2.5 py-1 rounded-full border border-white/60">
          <span>📍</span>
          <span>Banda, Maluku · Indonesia</span>
        </div>
      </div>

      {/* MAIN SPATIAL CANVAS AREA */}
      <div className="relative w-full h-[660px] overflow-hidden">
        {/* Geographic Coordinates Overlay */}
        <div className="absolute left-6 top-4 z-10 pointer-events-none">
          <p className="text-[11px] font-bold text-[#0F2C59] tracking-wider uppercase">
            KEPULAUAN BANDA / MALUKU
          </p>
          <p className="text-[10px] text-[#408C9C] font-mono mt-0.5">
            4°31′ LS 129°54′ BT · Waktu Indonesia Timur (WIT)
          </p>
        </div>

        {/* VECTOR ISLANDS CANVAS (Figma Island Shapes & Reef Paths) */}
        <div className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden">
          <svg
            className="w-full h-full max-w-[1200px] max-h-[640px]"
            viewBox="0 0 1160 640"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Bathymetry & Oceanic Contour Lines */}
            <ellipse cx="580" cy="320" rx="460" ry="240" stroke="#87c7c9" strokeWidth="1.2" strokeDasharray="6 6" />
            <ellipse cx="580" cy="320" rx="340" ry="180" stroke="#77baba" strokeWidth="1" />
            <ellipse cx="580" cy="320" rx="200" ry="110" stroke="#68aeae" strokeWidth="1" strokeDasharray="4 4" />

            {/* SPEEDBOAT ROUTES (Cyan Dashed Lines from Figma) */}
            <path
              d="M380 230 Q 520 280 640 260 T 820 420"
              stroke="#2563eb"
              strokeWidth="2"
              strokeDasharray="6 4"
              opacity="0.75"
            />
            <path
              d="M620 270 Q 720 310 940 380"
              stroke="#0891b2"
              strokeWidth="2"
              strokeDasharray="5 5"
              opacity="0.8"
            />
            <path
              d="M380 230 Q 300 290 180 340"
              stroke="#0891b2"
              strokeWidth="2"
              strokeDasharray="5 5"
              opacity="0.8"
            />

            {/* ========================================================
                1. PULAU BANDA API (Volcano Cone & Crater)
            ======================================================== */}
            <g
              className="cursor-pointer group"
              onClick={() => {
                setActivePlace({
                  name: 'Gunung Banda Api (Kaldera Aktif)',
                  sub: 'Puncak Kaldera 656 mdpl & Koloni Lava Flow',
                  category: 'Wisata Bahari 4A & Diving',
                  badge: 'Spot Selam Dunia',
                  desc: 'Gunung api laut aktif dengan titik pendakian sunrise dan terumbu karang meja terbaik yang pulih di atas aliran lahar letusan 1988.',
                  coords: '4°31′30″ LS 129°52′48″ BT',
                  image: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=800&q=85',
                  status: 'Siaga Normal (Level I)',
                  hours: 'Pendakian 04:00 - 11:00 WIT',
                  facilities: ['Pemandu Trekking', 'Spot Snorkeling Lava Flow', 'Sewa Perahu', 'Pos Pantau PVMBG'],
                })
                setShowDetailCard(true)
              }}
            >
              {/* Reef shallow buffer */}
              <path
                d="M320 220C320 180 360 160 410 180C460 200 480 240 470 280C460 320 420 340 370 330C320 320 320 260 320 220Z"
                fill="#C4EFEB"
                opacity="0.7"
              />
              {/* Island Landmass */}
              <path
                d="M330 225C330 190 365 175 410 190C450 205 465 240 455 275C445 310 415 325 375 320C335 310 330 260 330 225Z"
                fill="#DCE5C5"
                stroke="#77C9C5"
                strokeWidth="2"
              />
              {/* Volcano Crater Rings */}
              <circle cx="395" cy="245" r="28" stroke="#ffffff" strokeWidth="2" strokeDasharray="4 2" />
              <circle cx="395" cy="245" r="12" fill="#d97706" opacity="0.3" stroke="#b45309" strokeWidth="1.5" />
              <text x="355" y="295" fill="#0F2C59" fontSize="11" fontWeight="700" letterSpacing="1">
                BANDA API
              </text>
            </g>

            {/* ========================================================
                2. PULAU BANDA NEIRA (Capital, Port & Belgica)
            ======================================================== */}
            <g
              className="cursor-pointer group"
              onClick={() => {
                setActivePlace({
                  name: 'Benteng Belgica',
                  sub: 'Benteng Pentagon Abad ke-17 · Cagar Budaya UNESCO',
                  category: 'Wisata Budaya & Sejarah',
                  badge: '177 Cagar Budaya',
                  desc: 'Benteng segi lima peninggalan VOC di atas bukit Pulau Neira, menghadap ke Teluk Banda dan Gunung Banda Api. Salah satu benteng terutuh di Asia Tenggara.',
                  coords: '4°31′24″ LS 129°54′18″ BT',
                  image: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=800&q=85',
                  status: 'Buka Sekarang',
                  hours: '08:00 – 18:00 WIT',
                  facilities: ['Pemandu HPI', 'Spot Sunset 360°', 'Audio Guide', 'Toilet & Mushola'],
                })
                setShowDetailCard(true)
              }}
            >
              {/* Island Reef & Landmass */}
              <path
                d="M510 190C535 155 575 165 595 210C615 255 605 310 575 330C545 350 515 315 505 270C495 225 500 200 510 190Z"
                fill="#C4EFEB"
                opacity="0.7"
              />
              <path
                d="M515 195C540 165 570 175 585 215C600 255 595 305 570 320C545 335 520 305 510 265C500 225 505 205 515 195Z"
                fill="#DCE5C5"
                stroke="#77C9C5"
                strokeWidth="2"
              />
              <text x="515" y="270" fill="#0F2C59" fontSize="11" fontWeight="700" letterSpacing="1">
                BANDA NEIRA
              </text>
            </g>

            {/* ========================================================
                3. PULAU BANDA BESAR / LONTHOIR (Sprawling Nutmeg Ridge)
            ======================================================== */}
            <g
              className="cursor-pointer group"
              onClick={() => {
                setActivePlace({
                  name: 'Perkebunan Pala Pusaka Lonthoir',
                  sub: 'Sentra Pala Tertua & Koperasi Hatta Banda Besar',
                  category: 'Kebun Pala & Koperasi Hatta',
                  badge: 'IG Rempah Pala Banda',
                  desc: 'Hamparan perkebunan pohon kenari raksasa dan pohon pala berumur ratusan tahun dengan sertifikasi Blockchain Indikasi Geografis.',
                  coords: '4°33′12″ LS 129°53′40″ BT',
                  image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=85',
                  status: 'Koperasi Buka',
                  hours: '08:00 - 17:00 WIT',
                  facilities: ['Agrowisata Petik Pala', 'Unit Air RO Koperasi', 'Sentra Jemur Fuli', 'Dermaga Lonthoir'],
                })
                setShowDetailCard(true)
              }}
            >
              {/* Crescent Long Island Shape */}
              <path
                d="M440 370C530 330 680 320 830 350C880 360 900 400 850 420C730 450 560 450 450 420C415 410 410 390 440 370Z"
                fill="#C4EFEB"
                opacity="0.7"
              />
              <path
                d="M445 375C535 335 675 325 820 355C870 365 890 395 845 415C730 440 565 440 455 415C425 405 420 390 445 375Z"
                fill="#DCE5C5"
                stroke="#77C9C5"
                strokeWidth="2"
              />
              <text x="590" y="395" fill="#0F2C59" fontSize="12" fontWeight="700" letterSpacing="1">
                BANDA BESAR (LONTHOIR)
              </text>
            </g>

            {/* ========================================================
                4. PULAU HATTA (East Coral Drop-Off)
            ======================================================== */}
            <g
              className="cursor-pointer group"
              onClick={() => {
                setActivePlace({
                  name: 'Pulau Hatta Coral Reef',
                  sub: 'Pasir Putih, Habitat Penyu & Wall Diving',
                  category: 'Wisata Bahari 4A & Diving',
                  badge: 'Air Bersih RO',
                  desc: 'Pulau di timur Banda dengan dinding karang laut dalam (wall diving), perairan sebening kaca, dan deretan eco-stay mandiri energi surya.',
                  coords: '4°35′20″ LS 130°02′15″ BT',
                  image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=85',
                  status: 'Eco-Stay Tersedia',
                  hours: 'Perahu Reguler 08:30 WIT',
                  facilities: ['Spot Penyu Hijau', 'Diving Wall Drop-Off', 'Homestay Ramah Lingkungan', 'Air Minum RO'],
                })
                setShowDetailCard(true)
              }}
            >
              <ellipse cx="980" cy="420" rx="42" ry="55" fill="#C4EFEB" opacity="0.7" />
              <ellipse cx="980" cy="420" rx="36" ry="48" fill="#DCE5C5" stroke="#77C9C5" strokeWidth="2" />
              <text x="945" y="490" fill="#0F2C59" fontSize="10" fontWeight="700">
                PULAU HATTA
              </text>
            </g>

            {/* ========================================================
                5. PULAU AI & PULAU RUN (West Spices Islands)
            ======================================================== */}
            <g
              className="cursor-pointer group"
              onClick={() => {
                setActivePlace({
                  name: 'Pulau Ai & Benteng Revenge',
                  sub: 'Laguna Turkois, Terumbu Karang & Hiu Karang',
                  category: 'Wisata Budaya & Sejarah',
                  badge: 'Laguna Karang',
                  desc: 'Pulau penghasil rempah berkualitas tinggi dengan benteng VOC Revenge 1616 dan laguna terumbu karang yang tenang.',
                  coords: '4°31′05″ LS 129°46′20″ BT',
                  image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=85',
                  status: 'Wisata Buka',
                  hours: 'Perahu dari Neira 30 Menit',
                  facilities: ['Benteng Revenge', 'Snorkeling Laguna', 'Kebun Pala Warga', 'Homestay Lokal'],
                })
                setShowDetailCard(true)
              }}
            >
              <ellipse cx="180" cy="340" rx="35" ry="45" fill="#C4EFEB" opacity="0.7" />
              <ellipse cx="180" cy="340" rx="30" ry="38" fill="#DCE5C5" stroke="#77C9C5" strokeWidth="2" />
              <text x="155" y="400" fill="#0F2C59" fontSize="10" fontWeight="700">
                PULAU AI
              </text>
            </g>

            <g
              className="cursor-pointer group"
              onClick={() => {
                setActivePlace({
                  name: 'Pulau Run (Manhattan Exchange)',
                  sub: 'Sejarah Perjanjian Breda 1667 & Terumbu Alami',
                  category: 'Wisata Budaya & Sejarah',
                  badge: 'Sejarah Dunia',
                  desc: 'Pulau kecil bernilai sejarah besar yang ditukar Belanda dengan Pulau Manhattan (New York) demi memonopoli rempah pala.',
                  coords: '4°33′20″ LS 129°41′10″ BT',
                  image: 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?auto=format&fit=crop&w=800&q=85',
                  status: 'Wisata Buka',
                  hours: 'Perahu Khusus 1 Jam',
                  facilities: ['Monumen Sejarah Breda', 'Karang Alami', 'Perikanan Tradisional'],
                })
                setShowDetailCard(true)
              }}
            >
              <ellipse cx="90" cy="390" rx="30" ry="35" fill="#C4EFEB" opacity="0.7" />
              <ellipse cx="90" cy="390" rx="24" ry="28" fill="#DCE5C5" stroke="#77C9C5" strokeWidth="2" />
              <text x="65" y="440" fill="#0F2C59" fontSize="10" fontWeight="700">
                PULAU RUN
              </text>
            </g>

            {/* INTERACTIVE MARKERS (Pins with Badges) */}
            {layerWisata && (
              <g
                className="cursor-pointer"
                onClick={() => {
                  setActivePlace({
                    name: 'Benteng Belgica',
                    sub: 'Benteng Pentagon Abad ke-17 · Cagar Budaya UNESCO',
                    category: 'Wisata Budaya & Sejarah',
                    badge: '177 Cagar Budaya',
                    desc: 'Benteng segi lima peninggalan VOC di atas bukit Pulau Neira, menghadap ke Teluk Banda dan Gunung Banda Api.',
                    coords: '4°31′24″ LS 129°54′18″ BT',
                    image: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=800&q=85',
                    status: 'Buka Sekarang',
                    hours: '08:00 – 18:00 WIT',
                    facilities: ['Pemandu HPI', 'Spot Sunset 360°', 'Audio Guide', 'Toilet & Mushola'],
                  })
                  setShowDetailCard(true)
                }}
              >
                <circle cx="545" cy="225" r="14" fill="#0F2C59" stroke="#ffffff" strokeWidth="2" />
                <circle cx="545" cy="225" r="5" fill="#f4b75e" />
                <rect x="565" y="215" width="105" height="22" rx="4" fill="#0F2C59" />
                <text x="572" y="230" fill="#ffffff" fontSize="10" fontWeight="600">
                  Benteng Belgica
                </text>
              </g>
            )}

            {layerWisata && (
              <g
                className="cursor-pointer"
                onClick={() => {
                  setActivePlace({
                    name: 'Lava Flow Spot Diving',
                    sub: 'Terumbu Karang Meja Vulkanik Letusan 1988',
                    category: 'Wisata Bahari 4A & Diving',
                    badge: 'Spot Selam Utama',
                    desc: 'Titik selam bawah laut di pesisir utara Gunung Banda Api dengan hamparan karang meja yang sangat lebat dan visibilitas 25-30 meter.',
                    coords: '4°30′50″ LS 129°53′10″ BT',
                    image: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=800&q=85',
                    status: 'Kondisi Laut Tenang',
                    hours: 'Snorkeling Terbaik 08:00 - 15:00 WIT',
                    facilities: ['Sewa Alat Snorkeling', 'Pemandu Laut', 'Perahu Antar Jemput'],
                  })
                  setShowDetailCard(true)
                }}
              >
                <circle cx="430" cy="190" r="14" fill="#0891b2" stroke="#ffffff" strokeWidth="2" />
                <circle cx="430" cy="190" r="5" fill="#ffffff" />
                <rect x="350" y="160" width="80" height="22" rx="4" fill="#0891b2" />
                <text x="358" y="175" fill="#ffffff" fontSize="10" fontWeight="600">
                  Lava Flow
                </text>
              </g>
            )}

            {layerHomestay && (
              <g
                className="cursor-pointer"
                onClick={() => {
                  setActivePlace({
                    name: 'Cilu Bintang Heritage Estate',
                    sub: 'Boutique Eco-Stay Menghadap Benteng Belgica',
                    category: 'Penginapan Eco-Stay',
                    badge: 'Air RO + Panel Surya',
                    desc: 'Penginapan bernuansa kolonial dengan pemandangan langsung ke Benteng Belgica, dilengkapi suplai air minum RO dan cadangan listrik surya.',
                    coords: '4°31′28″ LS 129°54′12″ BT',
                    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=85',
                    status: 'Tersedia 4 Kamar',
                    hours: 'Check-in 14:00 WIT',
                    facilities: ['Air Bersih RO', 'Listrik Tenaga Surya', 'Sarapan Kuliner Rempah', 'WiFi Cepat'],
                  })
                  setShowDetailCard(true)
                }}
              >
                <circle cx="560" cy="275" r="14" fill="#5964BF" stroke="#ffffff" strokeWidth="2" />
                <circle cx="560" cy="275" r="5" fill="#ffffff" />
                <rect x="580" y="265" width="115" height="22" rx="4" fill="#5964BF" />
                <text x="588" y="280" fill="#ffffff" fontSize="10" fontWeight="600">
                  Cilu Bintang Stay
                </text>
              </g>
            )}

            {layerKebun && (
              <g
                className="cursor-pointer"
                onClick={() => {
                  setActivePlace({
                    name: 'Kebun Rempah Pala Lonthoir',
                    sub: 'Pohon Pusaka & Rantai Pasok Terverifikasi Blockchain',
                    category: 'Kebun Pala & Koperasi Hatta',
                    badge: 'Indikasi Geografis',
                    desc: 'Pusat perkebunan pala pusaka di lereng pulau Banda Besar dengan pohon pala berusia ratusan tahun yang dipanen secara lestari.',
                    coords: '4°33′30″ LS 129°54′00″ BT',
                    image: 'https://images.unsplash.com/photo-1602523961358-f9f03dd557db?auto=format&fit=crop&w=800&q=85',
                    status: 'Musim Petik Ranum',
                    hours: '07:00 - 16:00 WIT',
                    facilities: ['Sentra Kupas Fuli', 'Penyuluhan Tani', 'Koperasi Hatta Unit 3'],
                  })
                  setShowDetailCard(true)
                }}
              >
                <circle cx="660" cy="380" r="14" fill="#059669" stroke="#ffffff" strokeWidth="2" />
                <circle cx="660" cy="380" r="5" fill="#ffffff" />
                <rect x="680" y="370" width="105" height="22" rx="4" fill="#059669" />
                <text x="688" y="385" fill="#ffffff" fontSize="10" fontWeight="600">
                  Kebun Lonthoir
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* FLOATING CARD DETAIL TEMPAT (Sesuai Desain Figma lines 1368-1420) */}
        {showDetailCard && activePlace && (
          <aside className="absolute left-6 top-16 z-30 w-[350px] sm:w-[370px] bg-white rounded-2xl shadow-2xl border border-white/80 overflow-hidden animate-fade-in flex flex-col">
            <div className="relative w-full h-44 overflow-hidden bg-slate-900">
              <img
                src={activePlace.image}
                alt={activePlace.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F2C59]/90 via-transparent to-transparent" />
              
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowDetailCard(false)}
                  className="w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                <span className="px-2.5 py-1 rounded-md bg-[#0F2C59]/80 backdrop-blur text-[10px] font-bold text-amber-300">
                  {activePlace.badge}
                </span>
                <span className="text-[11px] font-medium bg-emerald-600/90 px-2 py-0.5 rounded">
                  {activePlace.status}
                </span>
              </div>
            </div>

            <div className="p-4 flex flex-col gap-3">
              <div>
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                  {activePlace.category}
                </span>
                <h3 className="text-lg font-bold text-[#0F2C59] leading-tight">
                  {activePlace.name}
                </h3>
                <p className="text-xs text-[#647888] font-medium mt-0.5">
                  {activePlace.sub}
                </p>
              </div>

              <p className="text-xs text-[#475569] leading-relaxed">
                {activePlace.desc}
              </p>

              <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#DFE8EA] flex flex-col gap-1 text-[11px] text-[#647888]">
                <div className="flex justify-between">
                  <span>Koordinat Spasial:</span>
                  <span className="font-mono text-[#0F2C59] font-semibold">{activePlace.coords}</span>
                </div>
                <div className="flex justify-between">
                  <span>Waktu Operasional:</span>
                  <span className="text-[#0F2C59] font-medium">{activePlace.hours}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {activePlace.facilities.map((fac) => (
                  <span
                    key={fac}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 font-medium"
                  >
                    ✓ {fac}
                  </span>
                ))}
              </div>

              <div className="pt-2 border-t border-[#DFE8EA] flex items-center gap-2">
                {onNavigateTab && (
                  <button
                    type="button"
                    onClick={() => onNavigateTab('gis')}
                    className="flex-1 py-2 px-3 rounded-lg bg-[#0F2C59] hover:bg-[#1a4175] text-white text-xs font-semibold text-center transition-colors"
                  >
                    Buka Rute di GIS &rarr;
                  </button>
                )}
                <a
                  href={`https://wa.me/6281234567891?text=${encodeURIComponent(
                    `Halo Pemandu Banda, saya melihat lokasi ${activePlace.name} di Jelajah Peta BST-NIRANA. Mohon info akses dan pemandu wisata.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                >
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </aside>
        )}

        {/* BOTTOM RIGHT: FLOATING MAP LAYERS CONTROLLER (Figma lines 1150-1360) */}
        <aside className="absolute right-5 bottom-4 z-20 w-[270px] sm:w-[290px] bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-[#DFE8EA] p-4 flex flex-col gap-2.5">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#DFE8EA]">
            <span className="text-xs font-bold text-[#0F2C59] uppercase tracking-wide">
              Lapisan Peta (Layers)
            </span>
            <span className="text-[10px] text-[#647888]">4 Aktif</span>
          </div>

          <label className="flex items-center justify-between gap-2 text-xs text-[#0F2C59] cursor-pointer hover:bg-slate-50 p-1 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-[#0F2C59] text-white flex items-center justify-center text-[10px]">
                ≈
              </span>
              <span className="font-semibold text-[11px]">Wisata Bahari &amp; Diving</span>
            </div>
            <input
              type="checkbox"
              checked={layerWisata}
              onChange={(e) => setLayerWisata(e.target.checked)}
              className="accent-[#0F2C59]"
            />
          </label>

          <label className="flex items-center justify-between gap-2 text-xs text-[#0F2C59] cursor-pointer hover:bg-slate-50 p-1 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-[#5964BF] text-white flex items-center justify-center text-[10px]">
                🏠
              </span>
              <span className="font-semibold text-[11px]">Penginapan Eco-Stay (RO)</span>
            </div>
            <input
              type="checkbox"
              checked={layerHomestay}
              onChange={(e) => setLayerHomestay(e.target.checked)}
              className="accent-[#5964BF]"
            />
          </label>

          <label className="flex items-center justify-between gap-2 text-xs text-[#0F2C59] cursor-pointer hover:bg-slate-50 p-1 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-[#059669] text-white flex items-center justify-center text-[10px]">
                🌿
              </span>
              <span className="font-semibold text-[11px]">Kebun Pala &amp; Koperasi</span>
            </div>
            <input
              type="checkbox"
              checked={layerKebun}
              onChange={(e) => setLayerKebun(e.target.checked)}
              className="accent-[#059669]"
            />
          </label>

          <label className="flex items-center justify-between gap-2 text-xs text-[#0F2C59] cursor-pointer hover:bg-slate-50 p-1 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-[#DF7865] text-white flex items-center justify-center text-[10px]">
                ⚓
              </span>
              <span className="font-semibold text-[11px]">Dermaga &amp; Rute Laut</span>
            </div>
            <input
              type="checkbox"
              checked={layerDermaga}
              onChange={(e) => setLayerDermaga(e.target.checked)}
              className="accent-[#DF7865]"
            />
          </label>

          <div className="pt-1.5 border-t border-[#DFE8EA] flex items-center justify-between text-[10px] text-[#647888]">
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-[#0891b2] inline-block" />
              Rute Speedboat
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
              Arus Selat
            </span>
          </div>
        </aside>
      </div>
    </div>
  )
}
