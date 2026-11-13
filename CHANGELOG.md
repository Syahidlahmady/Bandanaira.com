# Changelog (CHANGELOG.md)

All notable changes to the **Banda Digital Ecosystem** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]
### Added
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




