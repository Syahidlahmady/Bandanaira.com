import React, { useState, useEffect, useMemo } from 'react';
import {
  BANDA_HEALTH_FACILITIES,
  BANDA_EMERGENCY_CONTACTS,
  BANDA_FIRST_AID_GUIDES,
  calculateDistanceKm
} from '../data/healthFacilitiesData.ts';
import { getCurrentGPSPosition, GeoCoordinates } from '../services/native/geolocation.ts';
import { getNetworkStatus } from '../services/native/network.ts';
import {
  HeartPulse,
  PhoneCall,
  Navigation,
  Compass,
  MapPin,
  Clock,
  ShieldAlert,
  AlertTriangle,
  Waves,
  RefreshCw,
  CheckCircle2,
  Wifi,
  WifiOff,
  Crosshair,
  Search,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface FindHealthFacilitiesProps {
  onNavigateToGis?: (lat: number, lon: number) => void;
  onBackToDashboard?: () => void;
}

export const FindHealthFacilitiesView: React.FC<FindHealthFacilitiesProps> = ({
  onNavigateToGis,
  onBackToDashboard
}) => {
  // State koordinat GPS pengguna
  const [userCoords, setUserCoords] = useState<GeoCoordinates | null>(null);
  const [gpsLoading, setGpsLoading] = useState<boolean>(true);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // State koneksi jaringan
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // Filter & Pencarian
  const [selectedIsland, setSelectedIsland] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'facilities' | 'firstaid' | 'contacts'>('facilities');
  const [expandedGuideId, setExpandedGuideId] = useState<string | null>('fa-01');

  // Ambil posisi GPS saat komponen pertama kali dimuat
  const fetchLocation = async () => {
    setGpsLoading(true);
    setGpsError(null);
    try {
      const coords = await getCurrentGPSPosition();
      setUserCoords(coords);
    } catch (err) {
      setGpsError('Gagal mendeteksi lokasi GPS. Menggunakan koordinat pusat Pulau Neira.');
      setUserCoords({
        latitude: -4.5262,
        longitude: 129.9042,
        accuracy: 100
      });
    } finally {
      setGpsLoading(false);
    }
  };

  useEffect(() => {
    fetchLocation();
    getNetworkStatus().then((s) => setIsOnline(s.connected));
  }, []);

  // Hitung jarak dan urutkan faskes dari yang terdekat
  const sortedFacilities = useMemo(() => {
    return BANDA_HEALTH_FACILITIES.map((facility) => {
      let distanceKm: number | null = null;
      if (userCoords) {
        distanceKm = calculateDistanceKm(
          userCoords.latitude,
          userCoords.longitude,
          facility.latitude,
          facility.longitude
        );
      }
      return {
        ...facility,
        distanceKm
      };
    })
      .filter((facility) => {
        const matchIsland =
          selectedIsland === 'Semua' || facility.island.toLowerCase().includes(selectedIsland.toLowerCase());
        const matchSearch =
          facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          facility.village.toLowerCase().includes(searchQuery.toLowerCase()) ||
          facility.services.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchIsland && matchSearch;
      })
      .sort((a, b) => {
        if (a.distanceKm === null) return 0;
        if (b.distanceKm === null) return 0;
        return a.distanceKm - b.distanceKm;
      });
  }, [userCoords, selectedIsland, searchQuery]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 text-slate-800">
      {/* HEADER UTAMA BANDA BRAND IDENTITY */}
      <div className="bg-[#081D35] text-white pt-8 pb-10 px-4 sm:px-6 shadow-xl relative overflow-hidden">
        {/* Latar Belakang Grafis Bahari */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#F4B75E_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F4B75E]/20 text-[#F4B75E] border border-[#F4B75E]/40">
                  <ShieldAlert className="w-3.5 h-3.5 text-[#F4B75E]" />
                  Fitur Mandat Spesialis Keamanan & Faskes
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                    isOnline ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                  {isOnline ? 'Online Sync' : 'Offline Mode (Local Cache)'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
                <HeartPulse className="w-7 h-7 text-[#F4B75E]" />
                Fasilitas Kesehatan & Darurat Pulau
              </h1>
              <p className="text-sm text-slate-300 mt-1 max-w-2xl">
                Direktori terpadu RSUD, Puskesmas, Poskesdes, kontak Ambulans Laut, dan panduan P3K maritim di
                Kepulauan Banda.
              </p>
            </div>

            {onBackToDashboard && (
              <button
                onClick={onBackToDashboard}
                className="self-start sm:self-center px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-all border border-white/20 flex items-center gap-2"
              >
                ← Kembali ke Dasbor
              </button>
            )}
          </div>

          {/* BILAH STATUS GPS LOKAL */}
          <div className="mt-6 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2563eb]/30 border border-[#2563eb]/50 flex items-center justify-center shrink-0">
                <Crosshair className={`w-5 h-5 text-[#F4B75E] ${gpsLoading ? 'animate-spin' : ''}`} />
              </div>
              <div>
                <div className="text-xs text-slate-300 font-medium">Status GPS Perangkat Anda:</div>
                <div className="text-sm font-semibold text-white flex items-center gap-2">
                  {gpsLoading ? (
                    'Mencari sinyal satelit GPS Banda...'
                  ) : gpsError ? (
                    <span className="text-amber-300">⚠️ {gpsError}</span>
                  ) : userCoords ? (
                    <>
                      <span className="text-emerald-400">● Lokasi Terkunci</span> (
                      {userCoords.latitude.toFixed(4)}, {userCoords.longitude.toFixed(4)})
                    </>
                  ) : (
                    'Koordinat Default (Pulau Neira)'
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={fetchLocation}
              disabled={gpsLoading}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#2563eb] hover:bg-[#1d4ed8] text-white transition-all flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${gpsLoading ? 'animate-spin' : ''}`} />
              Perbarui GPS
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-4 relative z-20">
        {/* QUICK EMERGENCY HOTLINE BAR */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-lg border border-slate-200/80 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-red-600 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
              Kontak Kedaruratan Bahari 24 Jam
            </span>
            <span className="text-[11px] text-slate-500 font-medium">1-Klik Hubungi Langsung</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <a
              href="tel:081240002263"
              className="flex items-center justify-between p-3 rounded-xl bg-red-50 hover:bg-red-100/80 border border-red-200 text-red-900 transition-all group shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold">
                  <Waves className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold">Ambulans Laut Banda</div>
                  <div className="text-[11px] text-red-700">Evakuasi Antarpulau 24 Jam</div>
                </div>
              </div>
              <PhoneCall className="w-4 h-4 text-red-600 group-hover:scale-110 transition-transform" />
            </a>

            <a
              href="tel:091021000"
              className="flex items-center justify-between p-3 rounded-xl bg-blue-50 hover:bg-blue-100/80 border border-blue-200 text-blue-900 transition-all group shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-[#081D35] text-white flex items-center justify-center font-bold">
                  <HeartPulse className="w-5 h-5 text-[#F4B75E]" />
                </div>
                <div>
                  <div className="text-xs font-bold">UGD RSUD Banda</div>
                  <div className="text-[11px] text-blue-700">Dokter & Triase 24 Jam</div>
                </div>
              </div>
              <PhoneCall className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
            </a>

            <a
              href="tel:08114700727"
              className="flex items-center justify-between p-3 rounded-xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200 text-amber-900 transition-all group shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold">
                  <Navigation className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold">Pos SAR Banda</div>
                  <div className="text-[11px] text-amber-700">Penyelamatan Laut & Diver</div>
                </div>
              </div>
              <PhoneCall className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
            </a>
          </div>
        </div>

        {/* TAB NAVIGASI SUB-MODUL */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('facilities')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
              activeTab === 'facilities'
                ? 'bg-[#081D35] text-[#F4B75E] shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <MapPin className="w-4 h-4" />
            Daftar Faskes Terdekat ({sortedFacilities.length})
          </button>

          <button
            onClick={() => setActiveTab('firstaid')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
              activeTab === 'firstaid'
                ? 'bg-[#081D35] text-[#F4B75E] shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            Panduan P3K Bahari & Petani
          </button>

          <button
            onClick={() => setActiveTab('contacts')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
              activeTab === 'contacts'
                ? 'bg-[#081D35] text-[#F4B75E] shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <PhoneCall className="w-4 h-4" />
            Seluruh Kontak Penting Pulau
          </button>
        </div>

        {/* ============================================================ */}
        {/* TAB 1: DAFTAR FASILITAS KESEHATAN TERDEKAT                   */}
        {/* ============================================================ */}
        {activeTab === 'facilities' && (
          <div>
            {/* Filter Pulau & Pencarian */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mb-5">
              {/* Filter Tombol Pulau */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
                {['Semua', 'Neira', 'Banda Besar', 'Ai', 'Rhun', 'Hatta'].map((islandName) => (
                  <button
                    key={islandName}
                    onClick={() => setSelectedIsland(islandName)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedIsland === islandName
                        ? 'bg-[#2563eb] text-white shadow-sm'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {islandName === 'Semua' ? 'Semua Pulau' : islandName}
                  </button>
                ))}
              </div>

              {/* Input Pencarian */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari faskes, desa, poli..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg text-xs bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-slate-800 placeholder-slate-400 shadow-sm"
                />
              </div>
            </div>

            {/* List Faskes Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedFacilities.map((facility, index) => (
                <div
                  key={facility.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden"
                >
                  {/* Badge Jarak Radius dari GPS Pengguna */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#081D35] text-[#F4B75E]">
                          {facility.type}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">{facility.island}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 tracking-tight leading-snug">
                        {facility.name}
                      </h3>
                      <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        Desa {facility.village}
                      </div>
                    </div>

                    {facility.distanceKm !== null && (
                      <div
                        className={`text-right shrink-0 px-2.5 py-1 rounded-xl text-xs font-extrabold ${
                          index === 0
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        <div className="text-[10px] uppercase font-semibold text-slate-400">Jarak Radius</div>
                        {facility.distanceKm} km
                        {index === 0 && <span className="block text-[9px] text-emerald-600">● Terdekat</span>}
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 mb-4 line-clamp-2">{facility.description}</p>

                  {/* Fasilitas & Layanan */}
                  <div className="mb-4">
                    <div className="text-[11px] font-semibold text-slate-700 mb-1.5">Layanan Siaga:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {facility.services.slice(0, 4).map((srv, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-700"
                        >
                          {srv}
                        </span>
                      ))}
                      {facility.services.length > 4 && (
                        <span className="px-1.5 py-0.5 rounded-md text-[10px] text-slate-400">
                          +{facility.services.length - 4} lainnya
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Metadata Tambahan: Oksigen & Jam */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {facility.operatingHours}
                    </span>
                    {facility.oxygenAvailable && (
                      <span className="text-[11px] font-semibold text-blue-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-blue-600" />
                        Oksigen Tersedia
                      </span>
                    )}
                  </div>

                  {/* Tombol Aksi */}
                  <div className="flex items-center gap-2 pt-2">
                    <a
                      href={`tel:${facility.phone.replace(/[^0-9]/g, '')}`}
                      className="flex-1 py-2 rounded-xl text-xs font-bold bg-[#081D35] hover:bg-slate-800 text-white flex items-center justify-center gap-2 transition-all shadow-sm"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-[#F4B75E]" />
                      Hubungi Faskes
                    </a>

                    {onNavigateToGis && (
                      <button
                        onClick={() => onNavigateToGis(facility.latitude, facility.longitude)}
                        className="px-3 py-2 rounded-xl text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 flex items-center gap-1.5 transition-all"
                        title="Buka titik faskes di peta GIS"
                      >
                        <Compass className="w-3.5 h-3.5" />
                        Peta
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {sortedFacilities.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                <HeartPulse className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-700">Tidak ada fasilitas kesehatan ditemukan</h3>
                <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau filter pulau.</p>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: PANDUAN P3K BAHARI & KEPULAUAN (OFFLINE READY)         */}
        {/* ============================================================ */}
        {activeTab === 'firstaid' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs mb-4">
              <strong>Pemberitahuan Medis Darurat:</strong> Panduan ini dirancang khusus untuk pertolongan pertama di
              wilayah kepulauan terpencil sebelum korban tiba di faskes atau dievakuasi ambulans laut.
            </div>

            {BANDA_FIRST_AID_GUIDES.map((guide) => {
              const isExpanded = expandedGuideId === guide.id;
              return (
                <div
                  key={guide.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setExpandedGuideId(isExpanded ? null : guide.id)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50/80 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                        <ShieldAlert className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {guide.category}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 mt-0.5">{guide.title}</h3>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="px-4 sm:px-5 pb-5 pt-2 border-t border-slate-100 space-y-4 text-xs">
                      {/* Gejala */}
                      <div>
                        <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5 text-amber-700">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Gejala yang Kerap Terjadi:
                        </div>
                        <ul className="list-disc pl-5 space-y-1 text-slate-700">
                          {guide.symptoms.map((symp, i) => (
                            <li key={i}>{symp}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Langkah Penanganan */}
                      <div>
                        <div className="font-bold text-slate-900 mb-1.5 flex items-center gap-1.5 text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Langkah Pertolongan Pertama yang Benar:
                        </div>
                        <ol className="list-decimal pl-5 space-y-1.5 text-slate-800">
                          {guide.steps.map((step, i) => (
                            <li key={i} className="leading-relaxed">
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* Hal yang Dilarang */}
                      <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                        <div className="font-bold text-red-900 mb-1">Pantangan / Hal yang DILARANG:</div>
                        <ul className="list-disc pl-5 space-y-1 text-red-800">
                          {guide.doNotDo.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: SEMUA KONTAK PENTING KEPULAUAN BANDA                  */}
        {/* ============================================================ */}
        {activeTab === 'contacts' && (
          <div className="space-y-3">
            {BANDA_EMERGENCY_CONTACTS.map((contact) => (
              <div
                key={contact.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="text-xs font-semibold text-blue-600">{contact.category}</div>
                  <h3 className="text-base font-bold text-slate-900">{contact.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{contact.role}</p>
                </div>

                <a
                  href={`tel:${contact.phone.replace(/[^0-9]/g, '')}`}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-[#081D35] hover:bg-slate-800 text-white flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <PhoneCall className="w-4 h-4 text-[#F4B75E]" />
                  {contact.phone}
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
