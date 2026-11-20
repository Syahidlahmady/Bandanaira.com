# Changelog (CHANGELOG.md)

All notable changes to the **Banda Digital Ecosystem** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]
### Added
- **Translasi Menyeluruh Peta Interaktif Spasial GIS (Phase 54 — Branch `subtitle`)**:
  - **Kamus Dwibahasa Peta Spasial (`gisMap` di `translations.ts`)**:
    - Mendefinisikan terjemahan lengkap untuk pencarian peta (`searchPlaceholder`), pemilih pulau (`allIslands`, `neiraIsland`, `greatBanda`, `hattaIsland`, `ayIsland`, `rhunIsland`), tombol kontrol (`recenterMap`, `fullscreen`, `exitFullscreen`), gaya peta & peta dasar (`mapStyles`, `baseMap`, `standard`, `satellite`, `terrain`), overlay spasial (`placeAndStreetNames`, `mapOverlays`, `villageTerritories`, `villagesCount`, `densityHeatmap`, `maritimeRoutes`), serta status (`active`, `off`, `empty`).
    - Mendefinisikan legenda kartografi (`mapLegend`, `selectAll`, `clearAll`, `spatialProjection`, `densityLegendTitle`, 4 tingkat kepadatan `densitySparse`, `densityMedium`, `densityDense`, `densityHigh`).
    - Mendefinisikan 7 kategori layer spasial: Wisata & Bahari, Cagar Budaya, Penginapan, Sentra UMKM, Fasilitas Umum, Air Bersih, Energi & Lingkungan.
    - Mendefinisikan rincian drawer objek (POI inspection drawer): aksi fokus peta, panorama 360°, salin koordinat, kontak WA, audio guide, rincian rute maritim, kualitas air TDS, tandon komunal, tarif eco-stay, air bersih RO, listrik surya, kapasitas PLTS, dan daftar UMKM binaan.
    - Mendefinisikan kartu profil desa (`villageCard`): pulau, populasi, luas wilayah, kepadatan penduduk, komoditas, daya tarik, statistik resmi 2026, komposisi gender & keluarga, profesi utama, dan unit UMKM binaan aktif.
  - **Penyelarasan Dinamis Komponen Peta (`InteractiveMapWorkspace.tsx`)**:
    - Mengintegrasikan hook `useLanguage()` reaktif ke kanvas peta Leaflet interaktif, sehingga saat bahasa diubah antara ID dan EN, seluruh chip filter pulau, search bar, tooltip tombol, menu layers, legenda peta, drawer inspeksi POI, dan kartu profil desa langsung berganti bahasa secara seketika tanpa perlu memuat ulang halaman.
  - **Verifikasi Mutu & Kestabilan**:
    - Build produksi frontend Vite `tsc && vite build` lolos 100% (2.044 modul ditransformasikan, exit code 0).
    - 8 pengujian backend `pytest tests/test_gis.py` lulus 100%.

- **Penyelarasan Translasi Menyeluruh Landing Page & Solusi Dropdown Melayang (Phase 54 — Branch `subtitle`)**:
  - **Translasi Menyeluruh Seluruh Seksi Landing Page (`frontend/src/services/i18n/translations.ts`)**:
    - Memperluas kamus terjemahan dwibahasa (`id` dan `en`) mencakup 100% komponen di landing page: `navbar`, `hero`, `gallery`, `mapSection`, `tourismSaw`, `ecoStay`, `stats`, `traceability`, `demographics`, `planYourVisit`, `heritage`, `cagarBudaya`, `footer`, dan `chatbot`.
    - Mengintegrasikan translasi ke `Banda3DPhotoGallery.tsx`, `PetaInteractiveSection.tsx`, `TourismSawSection.tsx`, `EcoStayCatalogSection.tsx`, `EcosystemFeaturesSection.tsx`, `TraceabilityMarketplaceSection.tsx`, `SustainableTravelSection.tsx`, `PlanYourVisitSection.tsx`, `LandingFooterSection.tsx`, dan `TourismChatbotBubble.tsx`.
  - **Perbaikan Dropdown Bahasa & Tampilan Navbar Sinematik (`HeroSection.tsx` & `LanguageSwitcher.tsx`)**:
    - **Solusi Dropdown Melayang Bebas**: Menghilangkan batas `overflow-hidden` pada elemen `<header>` di `HeroSection.tsx` menjadi `overflow-visible`, serta menambahkan z-index tinggi (`z-[100]`) dan bayangan kontras pada popover menu dropdown bahasa agar mengambang bebas di atas navbar tanpa tertutup atau terpotong garis bawah navbar.
    - **Penyelesaian Benturan Tombol Login**: Menghilangkan container floating terpisah di luar navbar yang sebelumnya bertubrukan koordinat dengan tombol login; menata tombol aksi di dalam navbar terpadu secara harmonis: `[ Daftar ]` `[ Masuk ]` `[ garis pembatas w-px ]` `[ Dropdown Pilihan Bahasa ]`.
    - **Pemulihan Perilaku Navbar Awal**: Mengembalikan visibilitas navbar agar tidak langsung muncul di awal (`opacity-0`), melainkan bertransisi mulus (`opacity-100`) hanya setelah pengguna menggulir melewati intro video (`scrollProgress >= 0.85`).
  - **Asisten Rekomendasi Wisata Cerdas Dwibahasa (`TourismChatbotBubble.tsx`)**:
    - Mengintegrasikan pesan sambutan, status pencocokan kriteria SAW, tarif estimasi, chip filter cepat (Bahari, Sejarah, Anggaran), dan alasan kurasi dalam Bahasa Indonesia dan English secara dinamis.
  - **Verifikasi Mutu & Kestabilan**:
    - Build produksi frontend Vite `tsc && vite build` lolos 100% tanpa error (2.044 modul ditransformasikan, exit code 0).
    - 10 pengujian backend `pytest tests/test_tourism.py` lulus 100%.

- **Multilingual Language Switcher (ID/EN) & Dual-Language Heritage Audio Subtitles (Phase 54 — Branch `subtitle`)**:
  - **Kamus Dwibahasa Komprehensif (`frontend/src/services/i18n/translations.ts`)**: Menyusun kamus terjemahan dwibahasa terstruktur (`Language = 'id' | 'en'`) untuk navigasi bar (`BandaUnifiedNavbar`), hero section, narasi sejarah 4 babak rempah (`STORIES`: Pala, Belgica, Rhun, Bung Hatta), serta katalog cagar budaya dan audio guide.
  - **State Management & Hook Reaktif (`frontend/src/context/LanguageContext.tsx`)**: Menyediakan `LanguageProvider` dan `useLanguage()` dengan persistensi ke `localStorage` (`banda_language`), sinkronisasi otomatis ke `document.documentElement.lang`, fungsi `toggleLanguage()`, boolean `isEnglish`, dan objek kamus aktif `t`.
  - **Komponen Switcher Dropdown Elegan (`frontend/src/components/common/LanguageSwitcher.tsx`)**: Menerapkan selector dropdown dwibahasa `🇮🇩 Bahasa Indonesia` dan `🇬🇧 English` lengkap dengan chevron panah rotasi, indikator centang aktif, latar navy gelap emas pala `#081D35` / `#F4B75E`, backdrop blur, dan *click-outside listener*.
  - **Penempatan di Landing Page Depan & Hero Section (`HeroSection.tsx`)**: Menampilkan **Floating Language Dropdown** di pojok kanan atas halaman depan landing page (`fixed top-4 right-4 sm:top-6 sm:right-8 z-40`) agar langsung tampak jelas bagi pengunjung internasional saat pertama kali mendarat di website (resting state). Selain itu, dropdown bahasa juga terpasang di fixed top navbar saat di-scroll, drawer navigasi mobile, dan floating topbar dashboard (`DashboardLayout.tsx`).
  - **Sinkronisasi Judul & Konten Beranda Dwibahasa**: Menyelaraskan teks judul tengah hero, display headline, deskripsi, tautan navigasi, tombol CTA jelajah, serta tombol login/daftar di `HeroSection.tsx` secara dinamis sesuai pilihan bahasa yang dipilih.
  - **Narasi & Subtitle Sejarah Dinamis (`HeritageSpiceSection.tsx`)**: Menghubungkan 4 babak linimasa sejarah dengan data dwibahasa dinamis (`activeStories`), menampilkan subtitle periode sejarah di bawah judul dengan tipografi mono emas pala, serta mendukung heading dwibahasa (`Tales from the Heart of Spice` vs `Cerita dari Jantung Rempah`).
  - **Penyelarasan Workspace Cagar Budaya (`TourismEcoStayWorkspace.tsx`)**: Menghubungkan label status audio guide dan periode sejarah dengan kamus aktif (`t.cagarBudaya.audioGuidePlaying` / `audioGuideLabel`).
  - **Verifikasi Mutu & Kestabilan**: Memverifikasi `tsc && vite build` lolos 100% (2.044 modul ditransformasikan, exit code 0) dan 90 pengujian backend `pytest` lulus 100%.

- **Territorial Jurisdiction Scoping & Official GIS Village Boundary Enforcement (Phase 46)**:
  - **Database Migration & Scoping Model**: Membuat migrasi Alembic `013_user_farm_village_scope.py` yang menambahkan kolom `village` (VARCHAR/String) dengan indeks pencarian pada tabel `users` dan `farms`. Memperbarui model SQLAlchemy `User` dan `Farm`, serta skema Pydantic `User`, `FarmCreate`, `FarmResponse`, `FarmStatisticsResponse`, `FarmBoundaryValidationRequest`, dan `FarmBoundaryValidationResponse`.
  - **Auto-Seed Demo Actors & Scoping**: Mengonfigurasi penetapan desa autentik pada `backend/scripts/demo_seed.py` (`petugas` -> Lonthoir, `petugas_nusantara` -> Nusantara, `ketua_kelompok` -> Lonthoir, `petani` -> Lonthoir, `warga` -> Lonthoir, `admin` -> Lintas Desa).
  - **Spatial Boundary Validation & RBAC Enforcement**: Mengimplementasikan `check_farm_within_village_boundary` dan `load_village_boundary_from_file` di `backend/app/modules/farms/spatial.py` untuk menguji titik centroid dan poligon kebun terhadap 17 batas administratif resmi desa di Kepulauan Banda. Menolak pendaftaran kebun di luar batas wilayah (HTTP 422). Membatasi daftar kelompok tani, petani, kebun, GeoJSON, statistik, dan hak verifikasi kebun khusus untuk wilayah desa masing-masing aktor non-admin.
  - **Penghapusan Aktor Login Wisatawan & Pembukaan Eksplorasi Publik**: Menghapus opsi login dan registrasi aktor wisatawan (`tourist`), menegaskan bahwa wisatawan tidak memerlukan akun untuk mengakses platform. Seluruh fitur pariwisata (katalog penginapan eco-stay, pemutar audio guide 177 cagar budaya, pembuat tautan pemesanan WhatsApp, mesin rekomendasi wisata SAW, serta peta GIS 7-layer) terbuka bebas untuk publik secara langsung.
  - **Pencegahan Persetujuan Lahan Melanggar Batas & Penyimpanan Poligon Offline**:
    - **Validasi Ketat Yurisdiksi Persetujuan Desa**: Menolak verifikasi kebun (`verify_farm`) di backend (HTTP 422) jika poligon/titik koordinat kebun melewati batas wilayah resmi desa. Menambahkan deteksi otomatis desa pada `find_village_for_point` dan perlakuan khusus gugus Pulau Neira pada `load_village_boundary_from_file`. Di frontend `FarmsGisWorkspace.tsx`, menambahkan badge peringatan `⛔ Melewati Batas Desa` dan me-nonaktifkan tombol `✓ Setujui` Kepala Desa jika melanggar yurisdiksi desa.
    - **Penyimpanan Batas Poligon Mode Offline**: Memperbaiki `App.tsx` agar pada mode offline (`!navigator.onLine` dan fallback `catch` fetch error), poligon lahan kebun (`polygon_boundary_geojson`) selalu diikutsertakan ke dalam antrean offline `syncManager.enqueue`, disimpan ke IndexedDB `offlineDB.cacheData`, dan dimasukkan ke `farmGeoJSON.features` sehingga kanvas peta Leaflet langsung menampilkan poligon visual lahan kebun secara utuh tanpa hanya berupa titik saja.
  - **Frontend UI & Visualisasi Peta**: Menampilkan poligon batas desa resmi (garis putus-putus amber/emas) di `frontend/src/components/FarmMap.tsx` beserta lencana yurisdiksi desa. Menampilkan banner yurisdiksi teritorial di `frontend/src/views/FarmsGisWorkspace.tsx`, memfilter dropdown petani dan kelompok tani sesuai desa aktif, serta memvalidasi kesesuaian batas kebun dengan desa. Memperbarui `frontend/src/App.tsx` dan `frontend/src/components/modals/QuickLoginModal.tsx` dengan akun `petugas_nusantara` dan lencana desa.
  - **Pengujian & Verifikasi**: Pengujian otomatis backend `pytest tests/test_farmers_and_farms.py tests/test_blockchain.py` lulus 100% (10 passed), dan build produksi frontend `npm run build` sukses tanpa error (exit code `0`).
- **Perbaikan Sinkronisasi & Upload Mode Offline PWA IndexedDB Sync Queue (Phase 43)**:
  - Memperkuat `frontend/src/offline/syncManager.ts` agar me-retry item `failed`/`syncing`, otomatis menyegarkan JWT via `authService.ensureValidToken` saat `401`, menormalisasi endpoint `/farmers/farms` -> `/farms`, melengkapi UUID `farmer_id`/`farm_id` yang hilang (`healQueuedPayload`), menangani konflik `409 Conflict` secara otomatis, serta menserialisasikan detail error 422 FastAPI ke string yang aman dirender (`serializeErrorMessage`).
  - Memperbaiki endpoint `farm_create` offline dan penyegaran daftar antrean pada `handleManualSync()` di `frontend/src/App.tsx`, serta pengamanan tampilan pesan error & aktivasi tombol kirim di `frontend/src/components/modals/OfflineQueueModal.tsx`.
  - Menambahkan `authService.fetchWithAuth` (`frontend/src/services/auth.ts`) serta `requestWithAuth` di `frontend/src/services/population.ts` dan `frontend/src/services/traceability.ts`, serta memperbarui fallback offline `/api/` pada `frontend/public/sw.js` (`banda-digital-v5`) agar mengembalikan status `503`.
- **Pemetaan Lahan Satelit Interaktif Poktan, Auto-Seed Petani & Perbaikan Sesi `401` (Phase 42 — commit `96f2056`)**:
  - Memperbarui `frontend/src/components/FarmMap.tsx` dengan viewport terkunci `BANDA_ARCHIPELAGO_BOUNDS`, tombol lompat pulau, switcher basemap (`Satelit` + toggle `Label Lokasi`, `Standar`, `Topografi`), mode layar penuh (`toggleFullscreen`), alat gambar poligon non-teknis (`+ Klik Peta Tambah Sudut Lahan`, `Hanya Geser Titik Batas`, preset `Kotak Cepat` `2.500 m²`/`5.000 m²`/`10.000 m²`, titik sudut geser/hapus klik kanan, kalkulasi luas geodesik `computeSphericalAreaSqm`), serta fokus dari tabel (`focusFarmId`).
  - Menyederhanakan formulir pemetaan 3-langkah di `frontend/src/views/FarmsGisWorkspace.tsx` (`polygon_boundary_geojson`, GPS perangkat, validasi tumpang tindih PostGIS, aksi `Lihat di Peta`) dan menambahkan form inline **`+ Tambah Petani Baru`** (`handleCreateFarmerMember`) langsung di pilihan `Petani Pemilik Lahan`.
  - Memperbaiki error `401 Unauthorized` dan kekosongan daftar petani melalui `ensureValidToken` (`frontend/src/services/auth.ts`), `requestWithAuth` (`frontend/src/services/farmers.ts`), auto-seed akun demo pada `POST /api/v1/auth/login` (`backend/app/modules/auth/router.py`), serta `ensure_default_farmers_seeded` pada endpoint baca petani/poktan (`backend/app/modules/farmers/router.py`) termasuk sinkronisasi otomatis warga berprofesi `Petani`/`Pekebun`.
- **Penyederhanaan Landing Page Bergaya `PanoramaIslandSection`, Penyelarasan Sub-Tab Pariwisata & Kalkulator Chatbot DSS (Phase 41 — commit `4b3e5a5`)**:
  - Menyederhanakan `TourismSawSection.tsx`, `EcoStayCatalogSection.tsx`, `EcosystemFeaturesSection.tsx`, dan `TraceabilityMarketplaceSection.tsx` mengikuti tata letak 2 kolom bersih `PanoramaIslandSection.tsx` tanpa foto/kartu berat, seraya menjaga seluruh anchor navigasi (`#wisata`, `#eco-stay`, `#penduduk-fasilitas`, `#layanan-umkm`) dan ekspor kompatibilitas.
  - Menambahkan helper `TourismSubTab`, `setPreferredTourismSubTab`, dan `getPreferredTourismSubTab` di `frontend/src/services/tourism.ts` serta tab **`🏝️ Tempat Wisata & Destinasi`** (`PUBLIC_SAW_DESTINATIONS` dengan filter pulau & kategori) di `TourismEcoStayWorkspace.tsx`.
  - Menyelaraskan tombol CTA landing page: `Telusuri sejarah Banda` (`HeritageSpiceSection.tsx`) dan `Lihat cagar budaya` (`TourismSawSection.tsx`) menuju `'heritage'`; `Jelajahi Destinasi` (`TourismSawSection.tsx`) dan `Jelajahi Banda sekarang` (`PlanYourVisitSection.tsx`) menuju `'destinations'`; `Lihat Eco-Stay & Vila` (`EcoStayCatalogSection.tsx`) dan tautan footer bertarget `'tourism'` (`LandingFooterSection.tsx`) menuju `'accommodations'`.
  - Mengimplementasikan panel interaktif **Asisten Kalkulator Chatbot DSS** dwi-mode (`tourism` dan `crisis`) pada `SmartPlannerWorkspace.tsx` (`parseWorkspaceTourismPrompt`, `parseWorkspaceCrisisPrompt`, `normalizeWeightMap`) yang terhubung ke `dssService`.
- **Penyimpanan Dataset Spasial Autentik, Seeder Geospasial 54 Objek & Dokumentasi Peta Interaktif (Phase 39)**:
  - Menyimpan dan mengekspor seluruh 37 objek spasial autentik PostGIS yang baru dibuat (termasuk rute maritim *Jalur Penyeberangan Speedboat Neira - Pulau Ay* dengan 26 waypoint LineString, RSUD Banda, Hutan Kelle, Blood Stone, pantai barat Pulau Ay, embung komunal, dll.) ke berkas seeder permanen `backend/app/seeds/gis_spatial_features.json`.
  - Menggabungkan dataset dengan 17 objek infrastruktur pulau lainnya (termasuk spot selam Pulau Hatta, stasiun desalinasi SWRO tenaga surya, microgrid PLTS 50 kWp, dan sentra koperasi) sehingga total mencapai 54 objek spasial terverifikasi di seluruh 6 gugus pulau.
  - Membangun skrip seeder mandiri `backend/scripts/seed_spatial_features.py` yang mendukung mekanisme *upsert* aman tanpa duplikasi.
  - Mengintegrasikan seeder spasial ke dalam `backend/scripts/demo_seed.py` (Tahap 8) sehingga rekan tim pengembang dapat menjalankan inisialisasi basis data secara instan (`docker exec banda_backend python -m backend.scripts.demo_seed` atau `python -m backend.scripts.seed_spatial_features`).
  - Memperbarui `backend/app/modules/gis/router.py` dan `curated_layers.py` agar otomatis menyertakan geometri rute `geometry_geojson` saat *auto-seed on startup*.
  - Menulis dokumentasi komprehensif `docs/GIS_DATA_DAN_PETA.md` yang merinci 7 layer spasial, 54 objek, spesifikasi API GeoJSON, cara penggunaan studio batas desa non-teknis, serta panduan operasional tim.
  - Memverifikasi kelulusan 100% dari 89 pengujian otomatis pytest backend.
- **Client-Side URL Routing, Deep-Linking, Session Restoration & Refresh Persistence (Phase 38)**:
  - Memperbaiki isu navigasi di mana pengguna yang mengakses halaman lain dan melakukan *page refresh* (F5) terlempar kembali ke halaman Beranda/Landing Page.
  - Mengimplementasikan kamus rute dwiarah `TAB_ROUTES` dan `ROUTE_TO_TAB` di `App.tsx` yang memetakan seluruh 14 workspace (`/`, `/dashboard`, `/population`, `/letters`, `/farming`, `/traceability`, `/koperasi`, `/iot`, `/tourism`, `/gis`, `/audit`, `/smart_planner`, `/survei`, `/register`) beserta alias rute (`/peta`, `/wisata`, `/surat`, `/kebun`, `/panen`, `/telemetri`, `/login`, dll.).
  - Mengintegrasikan HTML5 History API (`window.history.pushState` & `replaceState`) dan event listener `popstate` agar transisi antar-halaman langsung tercermin pada address bar peramban dan mendukung navigasi Back/Forward secara native.
  - Memperbaiki inisialisasi sesi `currentUser` di `App.tsx` secara sinkron dari cache profil lokal `authService.getCachedProfile()` saat token valid tersedia di `localStorage`, mengeliminasi *flash* tampilan unauthenticated dan mencegah *fallback* tidak diinginkan ke Landing Page saat refresh.
  - Menambahkan persistensi tab aktif di `localStorage` (`banda_active_tab`) dan inisialisasi tab cerdas `getInitialTab()` yang memprioritaskan URL pathname terkini.
  - Memperbarui `sw.js` (Service Worker) dengan fallback navigasi SPA (`mode === 'navigate'`) agar request halaman tetap merespon `/index.html` dari cache saat offline atau sinyal pulau 3T terputus.
  - Memperbaiki 2 pengujian backend: memastikan `audio_url` selalu disertakan pada endpoint cagar budaya `cagar-budaya/{slug}` dan mengecualikan string gambar base64 pada audit privasi tes `test_traceability.py`. Seluruh 89 tes backend kini lulus 100%.
- **Penghapusan Tuntas Desain Lama (Pembersihan `desainlama.png`), Redesain Global Warm Linen Banda Neira, dan Harmonisasi Workspace (Phase 32)**:
  - Menganalisis artefak `frontend/public/desainlama/desainlama.png` dan mengidentifikasi residu antarmuka lama: bar navigasi gelap dengan tab melayang, kartu penginapan bertema hitam `#0B1120`, serta tombol hijau neon `#10b981`.
  - Merombak `frontend/src/index.css`: Memutakhirkan seluruh variabel token CSS `:root` ke Warm Linen `#F7F5F0`, background kartu `#FFFFFF`, teks navy `#081D35`, teks sekunder `#475569`, border `#E2E8F0`, dan aksen emas pala `#F4B75E`. Menyelaraskan seluruh kelas global (`.app-card`, `.card`, `.stat-card`, `.table-responsive`, `.data-table`, `.form-control`, `.form-select`, `.modal-content`, `.tab-nav`, `.btn-primary`) sehingga seluruh workspace operasional (`ResidentsWorkspace`, `LettersWorkspace`, `FarmsGisWorkspace`, `HarvestGradingWorkspace`, `KoperasiKasirWorkspace`, `SmartPlannerWorkspace`, `IslandTelemetryWorkspace`, `SurveyEtlWorkspace`, `AuditTrailWorkspace`, `CitizenPortalWorkspace`) serempak bertransformasi menjadi terang, bersih, dan konsisten.
  - Merombak total `VerifiedMarketplaceModal.tsx` dengan elevated cards putih `#FFFFFF`, border emas pala `#F4B75E`, lencana verifikasi blockchain IPFS, tombol hubungi via WhatsApp, dan pemindai QR yang selaras dengan tema beranda.
  - Merombak total `TourismEcoStayWorkspace.tsx`: Mengganti seluruh inline styling gelap dan tombol hijau neon dengan palet Banda Neira (Warm linen, elevated cards putih, filter bar terstruktur, audio guide box, pelacak reservasi, buku tamu, direktori pemandu, dan modal CMS).
  - Menghapus rendering `HeaderNav` usang dan tab navigasi melayang `Guest Public Exploration` di `App.tsx`, menjamin tamu non-login hanya melihat Landing Page Satu Pintu (`BandanairaBeranda`) dan login langsung diarahkan ke Dashboard ber-Sidebar.
- **Unified Navbar & Footer, Figma Desktop Map Vector Integration, and 21st.dev User Bento Dashboard (Phase 31)**:
  - Created and integrated `BandaUnifiedNavbar.tsx` and `BandaUnifiedFooter.tsx` across public and internal surfaces, ensuring cohesive branding (`#081D35` navy, `#0F2C59`, `#F4B75E` spice-gold accent, and *"Bertumbuh bersama Banda."* motto).
  - Ported the full Figma desktop map design from `frontend/src/desainsaatini/maps-dekstop/index.tsx` into `JelajahPetaDesktopView.tsx` with high-detail SVG vectors for all Banda islands (Neira, Banda Besar, Banda Api, Hatta, Ai, Pisang, Run), speedboat routes, layer toggles, island filters, search input, and interactive place detail modal.
  - Transformed Landing Page 2 into `UserEcosystemDashboard.tsx` utilizing a 21st.dev-inspired Bento Grid layout that dynamically tailors metrics, rapid action cards, and ecosystem summaries to the logged-in user's role.
  - Implemented the 21st.dev Management Dashboard (`desainsaatini/dashboard-desktop/dasboard.tsx`) in `UserEcosystemDashboard.tsx`, harmonizing its design with the Banda Neira warm palette: Header with user avatar and role badge, search bar & notifications, 4 KPI stats cards with dynamic hints, an interactive Recharts AreaChart for task/harvest throughput, an active initiatives progress board, and a real-time ecosystem activity feed.
  - Unified the entire application to **Single Canonical Landing Page** (`BandanairaBeranda.tsx`), eliminating duplicate landing pages.
  - Implemented `DashboardLayout.tsx` providing a persistent, responsive, collapsible left sidebar (`#081D35` navy with `#F4B75E` gold accents) that embeds all role-authorized operational workspaces directly inside the dashboard upon login without jumping or cluttered horizontal tab bars.
  - Updated `App.tsx` and role navigation (`HeaderNav.tsx`) so authenticated users land on `dashboard` upon login and can access their role-specific modules with a single click.
- **Editorial Slow-Travel Landing Page & Dual-Mode UI System (Phase 30)**:
  - Installed Tailwind CSS, PostCSS, and Autoprefixer with Banda Neira color tokens (`#173f43` teal, `#e9a66f` coral, `#b46b3c` sand, `#f7f5f0` cream) and Google Fonts (*Cormorant Garamond* & *Plus Jakarta Sans*).
  - Implemented `BandanairaBeranda.tsx` in `frontend/src/views/landing/` featuring interactive sections (Hero with search bar, Island Introduction, 7-Layer PostGIS Spatial Map with live Leaflet switcher, Spice Heritage, SAW Smart Tourism Recommender with live ranking sliders, Eco-Stays Directory with direct WhatsApp booking modal, Resident Services, Verified Blockchain Marketplace with QR verification & WhatsApp ordering, Sustainable Travel, and Plan Your Visit Gateways).
  - Aligned the hero floating glassmorphic navbar with `desainsaatini/BandaHeroSection.tsx` (`bandanaira.com` logo, 6 navigation items with `#f4b75e` active underline, and `Masuk / Login` CTA) and integrated `frontend/src/assets/image.webp` as the hero and dusk banner backdrop.
  - Implemented instant role-based dashboard redirection upon login and registration (`getRoleDefaultTab(user)`), dynamically adapting dashboard navigation menus (`HeaderNav.tsx`) to show only workspaces authorized for the logged-in user's role without clutter.
  - Unified the entire application UI/UX using the `21st-cli-use` skill (`21st.dev` catalog: *Elevate Navbar*, *Bento Card*, and *Ocean Breeze* theme) combined with the Banda Neira Deep Ocean Navy (`#081d35`, `#0f2c59`) and Spice Gold (`#f4b75e`, `#d97706`) design system across `index.css`, `HeaderNav.tsx`, `LoginSection.tsx`, `QuickLoginModal.tsx`, `VerifiedMarketplaceModal.tsx`, `PublicVerifyModal.tsx`, `LandingPortalWorkspace.tsx`, and `App.tsx`.
  - Implemented the split-screen account registration page (`frontend/src/components/RegisterSection.tsx`) matching `desainsaatini/register-dekstop/` (`IslandLifeIntroSection` & `AccountRegistrationSection`), where users select their role once at registration across all 9 project roles (`Warga Desa`, `Mitra Usaha`, `Wisatawan`, `Petani Rempah`, `Kelompok Tani`, `Koperasi Hatta`, `Petugas Desa`, `Surveyor & IoT`, `Administrator`) and bind it to their NIK & 4-digit PIN.
  - Implemented the split-screen login page (`frontend/src/components/LoginSection.tsx`) matching `desainsaatini/login-desktop/` (`BandaServicesIntroSection` & `AccountLoginSection`) without role selection on login; roles are automatically resolved from the user's registered NIK / account ID via `authService`.
  - Unified the public landing page in `LandingPortalWorkspace.tsx` to render `BandanairaBeranda.tsx` as the single canonical landing page, removing the duplicate command-mode landing page and mode-switcher buttons.
- Standardized documentation structure:
  - `AGENTS.md`: Mandatory instructions and workflow rules for AI coding agents.
  - `SRS.md`: Complete Software Requirements Specification.
  - `ARCHITECTURE.md`: High-level system architecture and component structure.
  - `DATABASE.md`: Relational schema design and PostGIS entity documentation.
  - `API.md`: REST API contracts, response envelopes, and endpoint list.
  - `TASKS.md`: Project roadmap and step-by-step development tracker.
  - `.env.example`: Template for environment configuration.
  - `README.md`: Project overview and getting started guide.
- Dedicated Village Letter Inbox tab (`📬 Pelayanan Surat Warga`) with pending counter badge, status filters, and instant approval/rejection actions.
- Persona-specific workspace separation for field operators:
  - Perangkat Desa: 4 distinct workspaces (Warga & Profesi, Pelayanan Surat Warga, Peta Kebun & Poktan, Panen & Mutu Rempah).
  - Petani Rempah: Clean 2-tab view focused on harvest logging and farm geospatial plots with offline cache.
  - Warga Desa: Isolated self-service portal for SKU & residency certificate requests.
- Farm Plot Land Approval & Role-Based GIS Management:
  - Enforced read-only map & farm view for `farmer` (petani rempah).
  - Enabled `farmer_group_admin` (kelompok tani) to register farm plots in `pending` verification status.
  - Added `PATCH /api/v1/farms/{id}/verification` for `village_officer` and `admin` to verify or reject submitted plots.
  - Interactive Leaflet map pins and badges reflecting verification status (`✓ Terverifikasi`, `⏳ Menunggu Persetujuan`, `✕ Ditolak`).
- Field Performance & System Optimization:
  - Frontend Workspace Modularization: Refactored monolithic `App.tsx` (reduced from 3,024 to 1,256 lines) into isolated workspace views (`ResidentsWorkspace`, `LettersWorkspace`, `FarmsGisWorkspace`, `HarvestGradingWorkspace`, `CitizenPortalWorkspace`).
  - Village Office CSV Data Export: Integrated 1-click export to CSV for residents, farm plots, and harvest records for monthly reporting to Kecamatan Banda.
  - Official Village Letterhead Printable Format: Added official letter template with Kabupaten Maluku Tengah letterhead, Kepala Desa signature block, and digital verification seal.
  - Field Entry Auto-Save Drafts: Added automatic localStorage form persistence to prevent data loss in remote field operations.
  - Offline Map Tile Caching: Implemented dedicated Service Worker cache bucket (`banda-map-tiles-v1`) with cache-first and opaque response handling for OpenStreetMap tiles, enabling offline GIS mapping in remote mountain areas.
  - Spatial Polygon Validation & Overlap Prevention: Implemented spherical geodesic area calculation, closed ring validation, and automated polygon overlap detection rejecting conflicting farm boundaries with 409 Conflict, complete with real-time `POST /api/v1/farms/validate-boundary` API and Leaflet visual polygon layer.
  - PWA Install Prompt & Service Worker Update Notifications: Created `usePWA` hook (`frontend/src/offline/usePWA.ts`) supporting `beforeinstallprompt` capture, standalone detection, and background SW update discovery; added `SKIP_WAITING` message listener in `frontend/public/sw.js`; integrated real-time "📲 Pasang di HP" install button, "Aplikasi Terpasang" status badge, background update banner with 1-click update activation, and comprehensive installation modal guide for Android & iOS users in `HeaderNav.tsx`.
- Centralized Audit Trail & Executive Ecosystem Analytics:
  - Backend Audit Router: Added `GET /api/v1/audit/logs` with flexible entity/action filtering and `GET /api/v1/audit/ecosystem-summary` with live multi-pillar aggregation (population, land, harvests, blockchain batches, letters, and recent audit trail).
  - Frontend Audit Trail Workspace: Built `AuditTrailWorkspace.tsx` with 5 executive KPI cards, searchable/filterable audit log stream with JSON diff modal, 1-click CSV export, and official printable "Laporan Rekapitulasi Tahunan Ekosistem Digital Desa Banda Neira" for Kecamatan Banda.
  - Comprehensive Automated Tests: 37/37 passing pytest tests and clean TypeScript build.
- Complete Ultra-Modern UI/UX & Glassmorphic Overhaul:
  - Design System Tokens: Added typography *Plus Jakarta Sans* & *JetBrains Mono*, mesh radial gradients, elevation shadows, frosted glassmorphism (`backdrop-filter: blur(16px)`), modern floating segmented navigation tabs, stat cards with color accents, and responsive data tables in `frontend/src/index.css`.
  - Upgraded Components: Refactored `HeaderNav.tsx`, `LoginSection.tsx`, `ResidentsWorkspace.tsx`, `LettersWorkspace.tsx`, `FarmsGisWorkspace.tsx`, `HarvestGradingWorkspace.tsx`, `CitizenPortalWorkspace.tsx`, and `App.tsx` to fully leverage the new design tokens, form controls, and responsive styling.
  - Verification: 0 TypeScript compilation errors (`vite v6.4.5 built in 4.86s`) and 37/37 passing backend tests.
- Traceability QR Code Reliability & Packaging Label Management:
  - Fixed Double Data URI Prefix Bug: Resolved corrupted `data:image/png;base64,data:image/png;base64,...` in `PublicVerifyModal.tsx`.
  - Direct PNG Image Endpoint: Added `GET /api/v1/public/verify/image/{token}` in FastAPI backend (`backend/app/modules/qr/router.py`) for direct PNG streaming and fast rendering.
  - Harvest Workspace QR Accessibility: Unlocked "Daftar Batch & Label QR Resmi" in `HarvestGradingWorkspace.tsx` so all agricultural stakeholders (village officers, farmer group leaders, and regular farmers) can view product batches and their packaging QR codes.
  - Packaging Label QR Preview Modal: Implemented dedicated high-resolution modal with large 220x220 QR image, official Banda Neira Geographic Indication header, batch metadata, direct "Unduh PNG" download button, "Cetak Stiker" (`window.print()`) button, and public certificate verification shortcut.
  - Harvest Table Quick QR Action: Added "Label QR & Aksi" column in the harvest records table linking individual harvest entries to their packaging batch label.
  - Verification: 0 TypeScript compilation errors and 37/37 passing backend tests.
- Strict RBAC Security Enforcement on Smart Tourism CMS, Tour Guides & Guest Bookings Privacy (Phase 29):
  - Enforced backend role dependencies (`HOMESTAY_CMS_ROLES`, `GUIDE_CMS_ROLES`, `BOOKINGS_VIEW_ROLES`) in `backend/app/modules/tourism/router.py` protecting guest reservation PII and master data mutations.
  - Added Bearer JWT header injection in `frontend/src/services/tourism.ts` and role-based UI access gates (`canViewBookings`, `canAccessCMS`, `canManageHotels`, `canManageGuides`) in `frontend/src/views/TourismEcoStayWorkspace.tsx`.
  - Added `test_unauthorized_guest_access_blocked` (401) and `test_forbidden_role_access_blocked` (403) in `backend/tests/test_tourism.py` (10/10 tourism tests passing, 0 TypeScript build errors).




