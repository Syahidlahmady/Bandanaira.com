# Development Backlog & Progress (TASKS.md)

Project status and step-by-step development tracker for **Banda Digital Ecosystem**.

---

## Roadmap Overview

- [x] **Phase 0: Project Inception & Requirements Discovery**
- [x] **Phase 1: Project Foundation & Skeleton Setup**
- [x] **Phase 2: Authentication & Authorization (RBAC)**
- [x] **Phase 3: Population Management Module**
- [x] **Phase 4: Farmer & Farm Mapping Module (PostGIS + Leaflet)**
- [x] **Phase 5: Harvest & Traceability Subsystem**
- [x] **Phase 6: Blockchain Integration & Verification Layer**
- [x] **Phase 7: Offline Support & PWA (IndexedDB Sync Queue)**
- [x] **Phase 8: End-to-End Testing & Field Demonstration Readiness**
- [x] **Phase 9: UI/UX Modernization & Modular Design System**
- [x] **Phase 10: Security Hardening & Banda Neira Resident Livelihood Tracking**
- [x] **Phase 15: Radical Neo-Obsidian Cyber-Emerald & Bento Grid System Overhaul ("Rombak Total Style & Gaya")**
- [x] **Phase 16: Multi-Commodity Traceability, Smart Contract EVM, Verified Marketplace & DSR Scopus Documentation (Mandat Khoirul Anam)**
- [x] **Phase 17: Decision Support System (DSS SAW Engine Dual-Mode) & Smart Tourism Planner (Mandat Hidayah / SRS)**
- [x] **Phase 18: Koperasi Hatta, Bank Sampah Plastik, & Dispenser Air Bersih RO (Mandat Prof. Purwo & KKN-PPM UGM)**
- [x] **Phase 19: IoT Telemetry & Island Resiliency Command Dashboard (Water TDS & Tank Level, Solar/Diesel Sensor Simulator)**
- [x] **Phase 20: Smart Tourism Accommodations, Eco-Stay Catalog & WhatsApp Direct Booking**
- [x] **Phase 21: 7-Layer Spatial GIS Peta Interaktif (Leaflet Multi-Layer GeoJSON Switcher)**
- [x] **Phase 22: Cryptographic NIK Hardening (AES-256-GCM + Blind Index HMAC-SHA256 OWASP Top 10)**
- [x] **Phase 23: Dynamic Field Surveys & Hybrid Database ETL Pipeline (Mandat Syafa Nailah Mufidah & Fauzan Arisanto / SRS 6.1, 9.1 & BAB XI)**
- [x] **Phase 24: Single-Door Island Ecosystem Landing Page Portal (Satu Pintu BST-NIRANA)**
- [x] **Phase 25: PWA Offline Map Caching & Field Resilience (IndexedDB GeoJSON 7-Layer Storage)**
- [x] **Phase 26: Actor Segregation & Dedicated Operational Roles (Koperasi, Homestay, Smart Tourism, Survei)**
- [x] **Phase 27: Multi-Actor Quick Login Simulator & Homestay Operator Booking Management**
- [x] **Phase 28: Central Admin Governance & Tourism Master Data CMS (Accommodations Tariff Control, Tour Guides Directory & Licensing)**
- [x] **Phase 29: Strict RBAC Security Enforcement on Smart Tourism CMS, Tour Guides & Guest Bookings Privacy**
- [x] **Phase 30: Editorial Slow-Travel Landing Page & Dual-Mode UI System (Desain Beranda Banda Neira & Tailwind CSS Setup)**
- [x] **Phase 31: Unified Navbar & Footer, Figma Desktop Map Vector Integration, and 21st.dev User Bento Dashboard (Transformasi Landing Page 2)**
- [x] **Phase 32: Spatial Studio Map Editor & 4A Geocoding Integration (Editor Titik Peta PostGIS & Google Maps/OSM)**
- [x] **Phase 33: GIS Map Aesthetic Unification & Editorial Tone Harmonization (Clean Google Maps Style & Slop Removal)**
- [x] **Phase 34: Penghapusan Tuntas Desain Lama (Pembersihan desainlama.png), Redesain Global Warm Linen Banda Neira, dan Harmonisasi Workspace**
- [x] **Phase 35: Modularisasi Komponen Frontend & Penerapan Clean Code Blueprint (fhinisCleanCode.md)**
- [x] **Phase 36: Landing Page Performance Optimization, Fit-To-Screen Hero, & Lenis Smooth Scrolling**
- [x] **Phase 37: GIS Map Cartographic Location Pins & In-Map Atlas Legend Overhaul**
- [x] **Phase 38: Client-Side URL Routing, Deep-Linking, Session Restoration & Refresh Persistence**

---

## Detailed Task Checklist

### Phase 1: Project Foundation & Skeleton Setup
- [x] 1.1 Documentation decomposition (`AGENTS.md`, `SRS.md`, `ARCHITECTURE.md`, `DATABASE.md`, `API.md`, `TASKS.md`, `CHANGELOG.md`, `.env.example`, `README.md`).
- [x] 1.2 Multi-container environment via `docker-compose.yml` (PostgreSQL 16 with PostGIS 3.4, Backend FastAPI, Frontend React).
- [x] 1.3 Backend structure initialization (Python 3.12+, FastAPI, SQLAlchemy async/sync, Pydantic v2, Alembic).
- [x] 1.4 Frontend structure initialization (Vite, React 18, TypeScript, React Router, TanStack Query).
- [x] 1.5 Database configuration and automated connection health check (`/api/v1/health`).
- [x] 1.6 Basic automated tests (FastAPI TestClient / pytest for health check).

### Phase 2: Authentication & Authorization (RBAC)
- [x] 2.1 Database schema for `users`, `roles`, and `user_roles` with Alembic migration `001_initial_users_and_roles`.
- [x] 2.2 Password hashing (bcrypt) and JWT token service (`access_token`, `refresh_token`).
- [x] 2.3 Login endpoint (`/api/v1/auth/login`), profile endpoint (`/api/v1/auth/me`), and token refresh (`/api/v1/auth/refresh`).
- [x] 2.4 FastAPI dependency injection for role-based permissions (`admin`, `village_officer`, `farmer_group_admin`, `farmer`, `smart_tourism_admin`).
- [x] 2.5 Seed script for default roles and admin account.
- [x] 2.6 Frontend Auth service and login interface.

### Phase 3: Population Management
- [x] 3.1 `residents`, `administrative_requests`, and `audit_logs` schema with Alembic migration `002_population_and_audit_tables`.
- [x] 3.2 CRUD endpoints for resident records with Pydantic schemas (`/api/v1/population/residents`).
- [x] 3.3 Verification workflow (`pending` -> `verified` / `rejected`).
- [x] 3.4 Audit log generation on resident mutations (`CREATE_RESIDENT`, `UPDATE_RESIDENT`, `VERIFY_RESIDENT`).
- [x] 3.5 Demographic summary statistics endpoint (`/api/v1/population/statistics`).
- [x] 3.6 Frontend resident management interface and statistics cards.

### Phase 4: Farmer & Farm Mapping (PostGIS)
- [x] 4.1 Schema for `farmers`, `farmer_groups`, and `farms` with PostGIS geometry/coordinate support and Alembic migration `003_farmers_and_farms_tables`.
- [x] 4.2 Farmer registration API (`/api/v1/farmers`) and group management (`/api/v1/farmers/groups`).
- [x] 4.3 Farm plot registration API (`/api/v1/farms`) and GeoJSON FeatureCollection endpoint (`/api/v1/farms/geojson/all`).
- [x] 4.4 Frontend interactive map using Leaflet, OpenStreetMap tiles, and commodity status indicators.

### Phase 5: Harvest & Traceability Subsystem
- [x] 5.1 `harvests`, `product_batches`, `batch_harvests`, and `batch_events` schema with migration `004_harvest_and_traceability_tables`.
- [x] 5.2 Harvest entry endpoint and batch creation endpoint.
- [x] 5.3 Batch event logging with deterministic canonical SHA-256 event hashing.
- [x] 5.4 Unique QR Code generation with public verification token.
- [x] 5.5 Public QR verification endpoint and frontend responsive product timeline page.

### Phase 6: Blockchain Integration
- [x] 6.1 Solidity smart contract (`SpiceRegistry.sol`) for batch hash anchoring and verification.
- [x] 6.2 Local EVM development environment integration.
- [x] 6.3 Web3 client service in FastAPI to submit batch hashes and read transaction receipts.
- [x] 6.4 Transaction status handling: `Pending`, `Submitted`, `Confirmed`, `Failed`.
- [x] 6.5 Hash integrity verification logic comparing DB hash against on-chain hash.

### Phase 7: Offline PWA & Sync Queue
- [x] 7.1 Progressive Web App manifest and Service Worker caching (`manifest.json`, `sw.js`).
- [x] 7.2 IndexedDB storage client for offline harvest, resident, and farm entries (`frontend/src/offline/db.ts`).
- [x] 7.3 Background sync queue manager with reconnection listener & retry handling (`frontend/src/offline/syncManager.ts`).
- [x] 7.4 UI indicators: `Online`, `Offline`, `Antrean Offline (N pending)`, `Sinkronkan Sekarang`, dan Modal Inspeksi Antrean.

### Phase 8: Testing & Acceptance
- [x] 8.1 Comprehensive backend test suite (unit + integration - 31 passing tests).
- [x] 8.2 Frontend TypeScript verification and production build (`npm run build`).
- [x] 8.3 Demonstration data seed script with synthetic Banda Neira profiles (`backend/scripts/demo_seed.py`).
- [x] 8.4 User Guide and operator manual for village officers and community (`docs/USER_GUIDE.md`).

### Phase 9: UI/UX Modernization & Modular Design System
- [x] 9.1 Modern responsive CSS design system with CSS custom properties (`frontend/src/index.css`), badge variations, stat boxes, responsive tables, and segmented controls.
- [x] 9.2 Modularization of monolithic `App.tsx` into reusable components (`HeaderNav.tsx`, `LoginSection.tsx`, `BlockchainModal.tsx`, `OfflineQueueModal.tsx`, `PublicVerifyModal.tsx`).
- [x] 9.3 1-click interactive demo persona switcher for testing all 5 roles (`admin`, `village_officer`, `farmer_group_admin`, `farmer`, `resident`).
- [x] 9.4 Lucide React icon integration with ambient declarations and production bundling validation.

### Phase 10: Security Hardening & Banda Neira Resident Livelihood Tracking
- [x] 10.1 Real authentication login gate: Form Login Resmi with password verification, Bcrypt/JWT security notices, show/hide toggle, and companion quick-credential assistant for all 5 roles.
- [x] 10.2 Resident livelihood tracking backend: Extended `GET /api/v1/population/residents` to support search by occupation (`Resident.occupation.ilike(search_fmt)`) and direct filtering with `occupation` query parameter.
- [x] 10.3 Population frontend livelihood UI: Added Banda Neira occupation selector dropdown, Sebaran Mata Pencaharian stats chips, quick-filter chips with badge icons (Pala, Nelayan, Cengkeh, Fuli, etc.), search bar integration, and table livelihood badges.
- [x] 10.4 Citizen self-service portal: Expanded administrative letter requests to support SKU Petani Rempah Pala & Cengkeh, SKU Nelayan Tradisional Banda, and SKU Pengolah Fuli Merah.
- [x] 10.5 Automated tests and TypeScript verification: 32 backend tests passing (including occupation search/filter tests) and `npm run build` 0 errors.
- [x] 10.6 Integrated Village Office Letter Request Workflow: Added backend `GET /population/requests` and `PATCH /population/requests/{id}/status` endpoints with audit logging, frontend "Kotak Masuk Permohonan Surat Warga (Inbox Desa)" with instant Setujui/Tolak actions, automated test coverage, and offline sync queue integration.
- [x] 10.7 Field-Ready UI Workspace Separation: Resolved cluttered/mixed-up UI for field use in Banda Neira by cleanly separating Perangkat Desa workflows into 4 focused tabs (👥 Warga & Profesi, 📬 Pelayanan Surat Warga with badge count, 🗺️ Peta Kebun & Poktan, 📦 Panen & Mutu Rempah), streamlining Petani Rempah to only their harvest log and farm map, and isolating Warga Mandiri to their letter portal. Verified with 32/32 pytest and clean TypeScript production build.
- [x] 10.8 Farm Plot Land Approval & Role-Based GIS Management: Implemented policy where regular farmers (`farmer`) have view-only access to maps and plots, farmer groups (`farmer_group_admin`) submit new plots with `pending` verification status, and village officers (`village_officer`, `admin`) approve/verify proposed plots via `PATCH /api/v1/farms/{id}/verification` with audit logging. Updated FarmMap pins and popup badges with verification indicators. Verified with 33 passing backend tests and clean frontend production build.

### Phase 11: Field Performance & System Optimization
- [x] 11.1 Frontend Workspace Modularization: Extracted monolithic sections from `App.tsx` (reduced from 3,024 lines to 1,256 lines) into dedicated view modules (`ResidentsWorkspace.tsx`, `LettersWorkspace.tsx`, `FarmsGisWorkspace.tsx`, `HarvestGradingWorkspace.tsx`, `CitizenPortalWorkspace.tsx`, and `OccupationBadge.tsx`).
- [x] 11.2 Village Office CSV Export: Added 1-click CSV data export for Residents, Farm Plots, and Harvest Records for monthly administrative reporting to Kantor Camat Banda.
- [x] 11.3 Official Village Printable Letterhead: Implemented official letter print view (Kop Surat Pemerintah Kabupaten Maluku Tengah - Kantor Kepala Desa Banda Neira) for approved letters with print/PDF export.
- [x] 11.4 Auto-Save Drafts for Remote Field Entry: Added automatic localStorage draft persistence for resident, farm, and harvest forms to prevent data loss in field conditions.
- [x] 11.5 Offline Map Tile Cache: Service Worker dedicated cache bucket (`banda-map-tiles-v1`) with cache-first and opaque-response handling for Leaflet OpenStreetMap tiles, allowing GIS map usage in remote mountain/off-grid plantations.
- [x] 11.6 PostGIS Spatial Polygon Boundary Validation & Overlap Prevention: Implemented spherical geodesy area calculation, polygon geometry validation, automated boundary overlap detection (rejecting overlapping farm plots with 409 Conflict), real-time `POST /api/v1/farms/validate-boundary` validation endpoint, Leaflet visual polygon rendering in `FarmMap.tsx`, and interactive "Uji Tumpang Tindih (PostGIS)" testing in `FarmsGisWorkspace.tsx`. Verified with 34 passing backend tests and clean frontend production build.
- [x] 11.7 PWA Install Prompt & Service Worker Update Notifications: Created `usePWA` hook (`frontend/src/offline/usePWA.ts`) supporting `beforeinstallprompt` capture, standalone detection, and background SW update discovery; added `SKIP_WAITING` message listener in `frontend/public/sw.js`; integrated real-time "📲 Pasang di HP" install button, "Aplikasi Terpasang" status badge, background update banner with 1-click update activation, and comprehensive installation modal guide for Android & iOS users in `HeaderNav.tsx`. Verified with 34 passing backend tests and clean frontend production build.

### Phase 12: Centralized Audit Trail, Executive Ecosystem Analytics & Annual Village Recap
- [x] 12.1 Centralized Audit Log & Ecosystem Summary Router: Implemented `GET /api/v1/audit/logs` with pagination and flexible entity/action filtering, and `GET /api/v1/audit/ecosystem-summary` calculating live aggregates across population, farmland, harvests, blockchain batches, and letter services. Protected by RBAC (`admin`, `village_officer`, `farmer_group_admin`).
- [x] 12.2 Automated Test Coverage: Added `backend/tests/test_audit.py` verifying RBAC access controls, entity/action filtering, unauthenticated rejection, and aggregate summary metrics calculation (37/37 passing tests).
- [x] 12.3 Frontend Ecosystem Audit & Executive Recap Workspace: Created `frontend/src/views/AuditTrailWorkspace.tsx` featuring 5 executive KPI summary cards, live audit trail log stream with action badges and JSON diff modal viewer, 1-click CSV audit log export, and official printable "Laporan Rekapitulasi Resmi Ekosistem Digital" with Kabupaten Maluku Tengah letterhead and Kepala Desa signature block.
- [x] 12.4 Frontend Service & Tab Integration: Created `frontend/src/services/audit.ts` and integrated the 5th tab `🏛️ Rekap & Audit` in `frontend/src/App.tsx`. Verified with clean TypeScript production build.

### Phase 13: Complete Ultra-Modern UI/UX Overhaul & Glassmorphic Design System
- [x] 13.1 Glassmorphic & Modern Design Tokens (`frontend/src/index.css`): Integrated Google Fonts *Plus Jakarta Sans* & *JetBrains Mono*, atmospheric radial mesh gradients on body, multi-layered elevation shadows (`--shadow-sm` through `--shadow-2xl`), frosted glassmorphic cards with `backdrop-filter: blur(16px)`, modern floating segmented tab controls (`.tab-nav`, `.tab-btn`), modern KPI stat cards (`.stat-grid`, `.stat-card`), and responsive data tables (`.data-table`).
- [x] 13.2 Modernized Header & Navigation (`HeaderNav.tsx`): Redesigned with glowing island brand badge, live network indicator with pulsing dot (`🟢 Sinyal Terhubung` / `🔴 Mode Kebun Offline`), interactive queue counter badge, glowing PWA install button with modal guide, user session card with avatar initials and role tags, and modern modal guide.
- [x] 13.3 Modernized Auth & Persona Switcher (`LoginSection.tsx`): Built glassmorphic hero header with island gradient, modern floating login card with input icons and password reveal toggle, interactive role switcher cards with hover animations and badges, and public QR verification scanner card.
- [x] 13.4 Modernized Population Workspace (`ResidentsWorkspace.tsx`): Upgraded header with demographic tags, 4 modern metric stat cards with colored accents, collapsible registration form with `.form-control`, interactive livelihood chips with icon badges, search bar with `.btn-primary`, and `.data-table` with verification badges.
- [x] 13.5 Modernized Letter Management Workspace (`LettersWorkspace.tsx`): Upgraded mailbox header with badge counter, segmented filter pills, `.data-table` with status badges, and official printable modal with letterhead and PDF export.
- [x] 13.6 Modernized GIS & Farmland Workspace (`FarmsGisWorkspace.tsx`): Upgraded spatial header, 4 PostGIS stat cards, alert banners, modern Poktan and Village Office forms with PostGIS test button, segmented filter buttons, and `.data-table` with approval/rejection actions.
- [x] 13.7 Modernized Harvest & Traceability Workspace (`HarvestGradingWorkspace.tsx`): Upgraded harvest logging and QR batch creation forms, `.data-table` harvest history, elevated batch cards with blockchain status badges, on-chain verification buttons, SHA-256 hash timeline, and quick event append form.
- [x] 13.8 Modernized Citizen Self-Service Portal (`CitizenPortalWorkspace.tsx`): Built profile card, service desk card, interactive request form with `.form-control`, and request history cards with status badges.
- [x] 13.9 Modernized App Shell & Public Section (`App.tsx`): Updated public QR search card, system infrastructure health grid, and added official digital ecosystem footer.
- [x] 13.10 Verification & Quality Assurance: Verified 0 TypeScript errors (`npm run build` exits 0) and 37/37 passing backend tests (`pytest backend/tests/ -v`).

### Phase 14: Traceability QR Code Reliability & Packaging Label Management
- [x] 14.1 Fixed Double Data URI Prefix Bug: Resolved corrupted `data:image/png;base64,data:image/png;base64,...` URI formatting in `PublicVerifyModal.tsx` that caused QR codes to fail rendering. Added safe base64 prefix detection and direct "Unduh QR" link.
- [x] 14.2 Direct PNG Image Endpoint: Added `GET /api/v1/public/verify/image/{token}` in FastAPI backend (`backend/app/modules/qr/router.py`) providing high-performance direct PNG streaming for fast browser loading and packaging stickers without memory decoding overhead.
- [x] 14.3 Harvest Workspace QR Accessibility: Unlocked "Daftar Batch & Label QR Resmi" in `HarvestGradingWorkspace.tsx` so all agricultural stakeholders (village officers, farmer group leaders, and regular farmers) can view product batches and their packaging QR codes.
- [x] 14.4 Packaging Label QR Preview Modal: Implemented dedicated high-resolution modal with large 220x220 QR image, official Banda Neira Geographic Indication header, batch metadata, direct "Unduh PNG" download button, "Cetak Stiker" (`window.print()`) button, and public certificate verification shortcut.
- [x] 14.5 Harvest Table Quick QR Action: Added "Label QR & Aksi" column in the harvest records table linking individual harvest entries to their packaging batch label.
- [x] 14.6 Verification & Quality Assurance: Verified 0 TypeScript compilation errors (`npm run build` exits 0) and 37/37 passing backend tests (`pytest backend/tests/ -v`).
### Phase 15: Radical Neo-Obsidian Cyber-Emerald & Bento Grid System Overhaul ("Rombak Total Style & Gaya")
- [x] 15.1 Neo-Obsidian Cyber-Emerald Design Tokens (`frontend/src/index.css`): Complete ground-up rewrite introducing deep space obsidian canvas (`#080c14`), 24px micro-mesh spatial grid, emerald (`#10b981`), electric cyan (`#06b6d4`), and golden nutmeg amber (`#f59e0b`) luminous accents, dark glassmorphic cards (`.app-card`) with subtle gradient borders, glow hover effects, cyber data tables with glow hovers, and neon badges.
- [x] 15.2 Island Telemetry Cyber-HUD Header (`HeaderNav.tsx`): Re-engineered top navigation into a futuristic island telemetry capsule with glowing neon emblem, geographical coordinates (`4°31′S 129°54′E`), pulsating real-time connectivity beacon, PWA installation pill, and operator session HUD.
- [x] 15.3 Cyber-Gateway & Holographic Persona Passes (`LoginSection.tsx`): Built terminal authentication view with Bcrypt & JWT telemetry chips, dark obsidian glass form, and interactive Holographic Role Passes with individual neon accents (Emerald for Petani, Sky Cyan for Warga, Amber for Petugas, Violet for Poktan, Fuchsia for Admin).
- [x] 15.4 Bento Modular Workspaces Polish: Eliminated all clashing hardcoded light backgrounds across all 6 workspaces (`ResidentsWorkspace`, `LettersWorkspace`, `FarmsGisWorkspace`, `HarvestGradingWorkspace`, `CitizenPortalWorkspace`, `AuditTrailWorkspace`), converting metrics to Bento grids with glowing accents.
- [x] 15.5 Dark Holographic Modals: Transformed `PublicVerifyModal.tsx`, `BlockchainModal.tsx`, and `OfflineQueueModal.tsx` into dark glass inspection consoles with glowing timeline nodes and high-contrast QR display boxes for seamless camera scanning.
- [x] 15.6 Production Build & Test Suite Verification: 0 TypeScript compilation errors (`npm run build` exits 0) and 37/37 passing backend tests (`pytest backend/tests/ -v`).

### Phase 16: Multi-Commodity Traceability, Smart Contract EVM, Verified Marketplace & DSR Scopus Documentation (Mandat Khoirul Anam)
- [x] 16.1 Multi-Commodity Smart Contract (`blockchain/contracts/BandaTraceabilityRegistry.sol` & ABI): Solidity 0.8.20 contract supporting `CommodityCategory { SPICE, MARINE }`, RBAC (`onlyProducer`, `onlyInspector`, `onlyBatchOwnerOrAuthorized`), zero-PII compliance, chained event logging, and on-chain verification function `verifyBatchHash`. Standard ABI generated in `blockchain/contracts/BandaTraceabilityRegistryABI.json`.
- [x] 16.2 Testnet Cryptographic Simulation Engine (`backend/scripts/run_blockchain_testnet_simulation.py`): Executed 10 sequential on-chain transactions spanning Pala Banda Grade A (`BN-BTC-2026-001`), Ikan Asar Cakalang Tradisional (`BN-BTC-2026-003`), Yellowfin Tuna Sashimi (`BN-BTC-2026-004`), custody transfer to MSME Syafa Mart, happy path verification (MATCH), and tamper attack simulation (REJECTED/TAMPER DETECTED). Receipts stored in `docs/mandat_anam/testnet_simulation_receipts.json`.
- [x] 16.3 Decentralized Verified Marketplace Showcase (`frontend/src/components/VerifiedMarketplaceModal.tsx`): Built rich marketplace modal showcasing 5 authentic Banda products with category filtering (Rempah, Perikanan, Olahan), weight/stock info, producer origin, IPFS CIDs, and 1-click on-chain proof verification opening `PublicVerifyModal`.
- [x] 16.4 App & Navigation Integration: Integrated "🛍️ Marketplace Rempah & Ikan" triggers into `HeaderNav.tsx` and public search section of `LoginSection.tsx`, connected state in `frontend/src/App.tsx`.
- [x] 16.5 Comprehensive Mandate Documentation Suite (`docs/mandat_anam/`):
  - [x] `01_DOKUMEN_REQUIREMENTS_DAN_PEMETAAN_RANTAI_PASOK.md` (Multi-commodity supply chain mapping, CTEs/KDEs, actors).
  - [x] `02_DOKUMEN_ARSITEKTUR_TRACEABILITY.md` (Hybrid On-Chain/Off-Chain, PostGIS, IPFS, sequence diagrams).
  - [x] `03_DESAIN_DAN_SOURCE_CODE_SMART_CONTRACT.md` (Smart contract architecture, RBAC, full Solidity source code).
  - [x] `04_DOKUMENTASI_DEPLOYMENT_TESTNET.md` (Hardhat/Sepolia/Amoy deployment, gas cost analysis).
  - [x] `05_LAPORAN_UNIT_TEST_DAN_UJI_TRANSAKSI.md` (10-transaction test report & tamper detection audit).
  - [x] `06_API_TRACEABILITY_DAN_INTEGRASI.md` (REST API endpoints specification, payloads, responses).
  - [x] `07_DASHBOARD_MONITORING_TRACEABILITY.md` (Monitoring interface, batch workflow, timeline drawer).
  - [x] `08_FITUR_VERIFIKASI_QR_DAN_KODE_BATCH.md` (Public QR verification, direct PNG stream, token resolution).
  - [x] `09_CHECKLIST_KEAMANAN_SMART_CONTRACT.md` (SWC vulnerability checklist, CEI pattern, Zero-PII compliance).
  - [x] `10_PANDUAN_PENGGUNA_ADMIN_DAN_UMKM.md` (User manual for village admins, Poktan, fishermen, and MSMEs).
  - [x] `11_DRAFT_ARTIKEL_ILMIAH_DSR_SCOPUS.md` (Full academic research paper draft following Design Science Research 6-stage framework).
  - [x] `12_LAPORAN_HANDOVER_FASTTRACK_14_HARI.md` (Executive handover report, milestone scorecard, asset inventory).
  - [x] `13_DATA_DICTIONARY_DAN_MODEL_DATA.md` (PostgreSQL tables, Pydantic schemas, IPFS JSON metadata).
  - [x] `14_LOG_INTEGRASI_LINTAS_MODUL.md` (Cross-module coordination with Hidayah, Fauzan, Syafa, Syahid, Restiadi).
- [x] 16.6 Full Verification & Quality Assurance: Verified 0 TypeScript compilation errors (`npm run build` exits 0) and 37/37 passing backend tests (`pytest backend/tests/ -v`).

### Phase 17: Decision Support System (DSS SAW Engine Dual-Mode) & Smart Tourism Planner (Mandat Hidayah / SRS)
- [x] 17.1 Pure-Python SAW Mathematical Engine (`backend/app/modules/dss/engine.py`): Implemented matrix normalization ($r_{ij}$) for both Benefit and Cost criteria with automatic zero-division safety, weight normalization ($\sum W_j = 1.0$), and descending preference score ranking ($V_i$).
- [x] 17.2 Pydantic Data Contracts & Schemas (`backend/app/modules/dss/schemas.py`): Defined `SAWCriterion`, `SAWAlternativeInput`, `SAWCalculationRequest`, `SAWAlternativeResult`, `TourismPreferences`, and `CrisisPriorityWeights`.
- [x] 17.3 Authentic Banda Neira Dataset (`backend/app/modules/dss/sample_data.py`): Pre-seeded real-world tourism alternatives (Delfika Homestay, The Nutmeg Tree, Maulana Hotel, Mutiara Guesthouse, Hatta Reef Cabin, Ai Spice Homestay) and village crisis zones (RT 03 Lonthoir, RT 01 Selamon, RT 02 Neira, RT 01 Pulau Hatta, RT 02 Pulau Ai).
- [x] 17.4 FastAPI Endpoints (`backend/app/modules/dss/router.py` & `main.py`): Implemented `/api/v1/dss/hitung-saw` (generic SAW), `/api/v1/dss/rekomendasi-wisata` (Mode 1), `/api/v1/dss/prioritas-krisis` (Mode 2), `/api/v1/dss/wisata/alternatives`, and `/api/v1/dss/krisis/alternatives`.
- [x] 17.5 Automated Test Suite Coverage (`backend/tests/test_dss.py`): 5 comprehensive tests verifying mathematical precision, manual vector calculation, Mode 1 tourism ranking, Mode 2 crisis ranking, and alternatives listing (42/42 passing pytest suite).
- [x] 17.6 Interactive Frontend Workspace (`frontend/src/views/SmartPlannerWorkspace.tsx`): Built dual-mode interactive workspace in Neo-Obsidian Cyber-Emerald Bento styling with real-time weight sliders, island filters, top recommendation highlight card with direct WhatsApp booking action, and detailed ranked alternatives data table.
- [x] 17.7 UI Navigation & Public Guest Integration: Added `🧭 Perencana Cerdas (DSS)` tab in `frontend/src/App.tsx` and quick launch button in `LoginSection.tsx`. Verified clean TypeScript production build (`npm run build` exits 0).

### Phase 18: Koperasi Hatta, Bank Sampah Plastik, & Dispenser Air Bersih RO (Mandat Prof. Purwo & KKN-PPM UGM)
- [x] 18.1 Database Models & Migration (`backend/app/modules/koperasi/models.py` & `backend/migrations/versions/006_koperasi_and_water_tables.py`): Defined `coop_accounts` (Saldo Rp, kuota air liter, poin bank sampah, total komoditas & plastik) and `coop_transactions` (buku besar transaksi dengan SHA-256 receipt hash deterministik). Registered models in `migrations/env.py`.
- [x] 18.2 Pricing & Circular Conversion Engine (`backend/app/modules/koperasi/pricing.py`): Established standards for commodities (Pala Super Rp 75k, Fuli Rp 95k, Cengkeh Rp 60k, Cakalang Rp 25k, Tuna Rp 45k) and plastic recycling ratio (Mandat Prof. Purwo: 1 kg botol plastik = 10 Liter air bersih RO + 10 Poin).
- [x] 18.3 Pydantic Contracts & Validation Schemas (`backend/app/modules/koperasi/schemas.py`): Strict 16-digit NIK validation, commodity deposit inputs, waste deposit inputs, water redemption inputs, and profile/recap response models.
- [x] 18.4 FastAPI Endpoints (`backend/app/modules/koperasi/router.py` & `main.py`): Implemented `/api/v1/koperasi/transaksi/setor-komoditas`, `/api/v1/koperasi/transaksi/setor-sampah`, `/api/v1/koperasi/tebus-air`, `/api/v1/koperasi/warga/{nik}/profil`, `/api/v1/koperasi/transaksi` (ledger), and `/api/v1/koperasi/rekapitulasi`.
- [x] 18.5 Automated Test Suite (`backend/tests/test_koperasi.py`): 6 comprehensive tests passing 100% (balance deposit, water quota conversion, plastic waste recycling, solenoid valve water redemption, quota exhaustion guard, and invalid NIK rejection). Total backend test suite: 48/48 passing.
- [x] 18.6 Frontend Service & UI Workspace (`frontend/src/services/koperasi.ts` & `frontend/src/views/KoperasiKasirWorkspace.tsx`): Built interactive POS cashier workspace featuring NIK citizen lookup, sample persona buttons, commodity scale calculator with Rp/Water allocation switcher, Prof. Purwo plastic waste converter, ESP32 solenoid valve water dispenser simulator with animated countdown, and SHA-256 ledger table.
- [x] 18.7 App Navigation Integration: Added `⚖️ Koperasi & Bank Sampah` tab to `frontend/src/App.tsx` and public guest shortcut to `LoginSection.tsx`. Verified 0 TypeScript compilation errors (`npm run build` exits 0).

### Phase 19: IoT Telemetry & Island Resiliency Command Dashboard (Mandat Prof. Purwo & Khoirul Anam)
- [x] 19.1 Database Model & Alembic Migration (`backend/app/modules/iot/models.py` & `backend/migrations/versions/007_iot_telemetry_tables.py`): Defined `iot_telemetry_logs` schema tracking water metrics (raw water TDS, filtered RO TDS, communal tank level %, daily dispensed volume, valve status) and energy metrics (active power source, solar voltage/current/watts, battery SoC %). Applied migration `007_iot_telemetry` to PostgreSQL.
- [x] 19.2 Sensor Thresholds & Alert Evaluator (`backend/app/modules/iot/router.py`): Built rule-based island alert engine detecting membrane punctures (TDS > 250 ppm -> CRITICAL), drinking water guideline violations (TDS > 100 ppm -> WARNING), and communal water tank shortages (< 20% -> CRITICAL).
- [x] 19.3 Ingestion & Dashboard Endpoints (`backend/app/modules/iot/router.py` & `main.py`): Implemented `POST /api/v1/iot/telemetri` (packet ingestion), `GET /api/v1/iot/telemetri/terkini` (real-time station statuses), `GET /api/v1/iot/telemetri/riwayat` (time-series log stream), `GET /api/v1/iot/resiliency-summary` (island resilience scores & diesel fuel savings), and `POST /api/v1/iot/simulate-pulse`.
- [x] 19.4 Standalone ESP32 Hardware Simulator Script (`backend/scripts/simulate_iot_telemetry.py`): Built CLI simulation script streaming continuous or batched realistic telemetry packets across all 4 island stations.
- [x] 19.5 Automated Test Suite (`backend/tests/test_iot.py`): 5 comprehensive tests passing 100% (normal telemetry ingestion, critical TDS membrane leak alert, critical tank level alert, latest station statuses, and pulse simulation with resiliency recap). Total backend test suite: 53/53 passing.
- [x] 19.6 Interactive Command Workspace (`frontend/src/views/IslandTelemetryWorkspace.tsx`): Built futuristic Cyber-HUD command center featuring Island Readiness Barometer (Optimal/Waspada/Kritis), WHO drinking water purity standards, solar vs diesel energy mix, real-time 4-station gauges, and live sensor pulse trigger.
- [x] 19.7 UI Navigation & Public Guest Integration: Added `📡 Telemetri IoT & Resiliensi` tab in `frontend/src/App.tsx` and quick launch shortcut in `LoginSection.tsx`. Verified 0 TypeScript compilation errors (`npm run build` exits 0).

### Phase 20: Smart Tourism Accommodations (Eco-Stay), WhatsApp Direct Booking, & 177 Cagar Budaya Catalog (Mandat FTI & Pariwisata)
- [x] 20.1 Database Models & Migration (`backend/app/modules/tourism/models.py` & `backend/migrations/versions/008_tourism_accommodations_and_bookings.py`): Defined `accommodations` (name, island, type, price/night, RO water available, solar energy mix, WhatsApp host contact, amenities) and `bookings` (unique `BKG-YYYYMMDD-XXXX` code, guest name & phone, check-in/out, status, total price, deterministic WhatsApp direct link). Applied migration `008_tourism_accommodations` to PostgreSQL.
- [x] 20.2 Curated Heritage Catalog & Audio Guides (`backend/app/modules/tourism/heritage_data.py`): Documented 7 authentic historical heritage sites in Banda Neira (Benteng Belgica, Benteng Nassau, Rumah Pengasingan Bung Hatta, Rumah Sutan Sjahrir, Istana Mini VOC, Klenteng Sun Tian Kong, Gereja Tua Banda) with architectural eras, narratives, and streaming audio guide links.
- [x] 20.3 Pydantic Contracts & Validation Schemas (`backend/app/modules/tourism/schemas.py`): Accommodation filters, booking creation input with date logic validation (check-out > check-in), booking response with pre-filled WhatsApp direct click-to-chat links, and heritage catalog models.
- [x] 20.4 FastAPI Endpoints (`backend/app/modules/tourism/router.py` & `main.py`): Implemented `GET /api/v1/tourism/accommodations` (with island, type, RO, and solar filtering), `POST /api/v1/tourism/bookings` (automated pricing, code generator, and WhatsApp click-to-chat URL creation), `GET /api/v1/tourism/bookings/{booking_code}`, and `GET /api/v1/tourism/heritage`.
- [x] 20.5 Automated Test Suite (`backend/tests/test_tourism.py`): 5 comprehensive tests passing 100% (auto-seeding accommodations, multi-criteria filtering, booking happy path with WhatsApp link generation, invalid dates rejection, and heritage catalog listing). Total backend test suite: 58/58 passing.
- [x] 20.6 Frontend Service & UI Workspace (`frontend/src/services/tourism.ts` & `frontend/src/views/TourismEcoStayWorkspace.tsx`): Built interactive tourism workspace with island/type filter pills, eco-amenity tags (RO water & solar energy badges), instant booking modal with automated nights & pricing calculation, click-to-WhatsApp direct confirmation card, booking lookup tab, and 177 Cagar Budaya audio guide player cards.
- [x] 20.7 App Navigation Integration: Added `🏖️ Smart Tourism & Eco-Stay` tab in `frontend/src/App.tsx` and quick access button in `LoginSection.tsx`. Verified 0 TypeScript compilation errors (`npm run build` exits 0).

### Phase 21: 7-Layer Spatial GIS Peta Interaktif (Mandat Fauzan Arisanto & SRS 10.1)
- [x] 21.1 7-Layer GeoJSON Data Specifications & Endpoints (`backend/app/modules/gis/`):
  - Layer 1: `LAYER_TOURISM_4A` (Bahari, diving spots, pantai, kuliner khas)
  - Layer 2: `LAYER_HERITAGE` (Benteng VOC, rumah pengasingan tokoh bangsa, cagar budaya)
  - Layer 3: `LAYER_ACCOMMODATION` (Eco-stays, hotel, homestay dengan status RO & solar)
  - Layer 4: `LAYER_KOPERASI_UMKM` (Pusat Koperasi Hatta, bank sampah, 30 petak kebun pala)
  - Layer 5: `LAYER_PUBLIC_SAFETY` (Dermaga pelabuhan, puskesmas, titik evakuasi tsunami/gempa)
  - Layer 6: `LAYER_WATER_INFRA` (Sumur payau, tandon komunal, instalasi RO/SWRO dengan link IoT TDS)
  - Layer 7: `LAYER_ENERGY_WASTE` (PLTD diesel, PLTS surya, bank sampah plastik)
  - GeoJSON standard RFC 7946 multi-layer API: `GET /api/v1/gis/layers`, `GET /api/v1/peta/geojson`, `GET /api/v1/gis/meta`, dan `GET /api/v1/gis/cagar-budaya/{slug}`.
- [x] 21.2 Automated GIS Test Suite (`backend/tests/test_gis.py`): 6 comprehensive tests passing 100% (auto-seeding 28 authentic spatial features, multi-layer & island filtering, metadata 7-layer summary, heritage audio guide slug retrieval, alias SRS 11 parity, and RBAC feature creation). Total backend test suite: 64/64 passing.
- [x] 21.3 Interactive GIS Map Workspace (`frontend/src/views/InteractiveMapWorkspace.tsx`):
  - Leaflet interactive canvas centered on Banda Neira (`-4.524, 129.904`).
  - Layer switcher with 7 toggle pills, category tabs (Pariwisata vs Resiliensi), and counter badges.
  - Custom themed SVG marker pins with distinct colors and glowing radar pulses for each layer.
  - Interactive popup modals & inspection sidebar with direct actions (WhatsApp booking, audio guide, live TDS gauge, and recycling stats).
  - Integrated into `App.tsx` and guest shortcuts in `LoginSection.tsx`. Verified clean build (`npm run build` exits 0).

### Phase 22: Cryptographic NIK Hardening & OWASP Top 10 Security (Mandat Syahid Ahmad Lahmady)
- [x] 22.1 Two-Tier Field-Level Encryption & Database Migration (`backend/app/core/crypto_nik.py` & `backend/migrations/versions/010_nik_cryptographic_hardening.py`):
  - Implemented AES-256-GCM authenticated encryption (`encrypt_nik` & `decrypt_nik`) with random 12-byte IV for semantic security at rest.
  - Implemented HMAC-SHA256 Blind Indexing (`compute_nik_blind_index`) with secret server-side pepper for $O(1)$ indexed exact-match search without exposing plaintext NIKs.
  - Added `nik_encrypted` (Text) and `nik_blind_index` (VARCHAR 64 indexed) columns to `residents` table.
- [x] 22.2 Rate-Limiting & Anti-Enumeration Protection (OWASP Top 10 A07 & NFR-02):
  - In-memory sliding window rate limiter (`check_nik_rate_limit`) blocking IP addresses exceeding 20 queries/minute on sensitive NIK search endpoints with HTTP 429.
  - Implemented secure citizen lookup endpoints: `POST /api/v1/warga/cari-nik` (SRS 11 parity) and `POST /api/v1/security/cari-nik` returning masked NIK (`817101******0001`), blind index, and integrated Koperasi Hatta balance/water quota.
  - Implemented system-wide security audit report endpoint: `GET /api/v1/audit-keamanan` and `GET /api/v1/security/audit-report` detailing AES, HMAC, rate-limiting, and zero-PII blockchain compliance.
- [x] 22.3 Automated Security Test Suite (`backend/tests/test_security_nik.py`):
  - 8 comprehensive tests passing 100% (AES-256 semantic random IV, tamper rejection, deterministic HMAC blind index, NIK masking, blind index search happy path, 404 masked error detail, 429 anti-enumeration rate limiting, and audit-keamanan report). Total backend test suite: 72/72 passing.
- [x] 22.4 Frontend Security Audit Bento Card (`frontend/src/services/security.ts` & `frontend/src/views/AuditTrailWorkspace.tsx`):
  - Surfaced live 4-pillar cryptographic security audit card in the centralized audit trail workspace.
  - Interactive Live Crypto Sandbox playground allowing administrators to input sample NIKs and verify roundtrip AES-256 encryption, HMAC blind index hash, and recovery latency (< 5 ms). Verified clean build (`npm run build` exits 0).

### Phase 23: Dynamic Field Surveys & Hybrid Database ETL Pipeline (Mandat Syafa Nailah Mufidah & Fauzan Arisanto / SRS 6.1, 9.1 & BAB XI)
- [x] 23.1 Database Model & Alembic Migration (`backend/app/modules/survei/models.py` & `backend/migrations/versions/011_raw_surveys_table.py`):
  - Defined `raw_surveys` table for flexible NoSQL/staging survey storage (`survey_code`, `collector_name`, `problem_domain`, `island_name`, `village_name`, `rt_rw`, `latitude`, `longitude`, `title`, `urgency_level`, `flexible_attributes` JSONB, `photo_evidence_url`, `notes`, `etl_status`, `migrated_feature_id`).
  - Applied migration `011_raw_surveys_table` to PostgreSQL.
- [x] 23.2 Intelligent ETL Pipeline Engine (`backend/app/modules/survei/etl_pipeline.py`):
  - Domain mapping engine converting problem domains (`AIR_DAN_SAMPAH`, `ENERGI`, `EKONOMI`, `WISATA`, `BUDAYA`) into 7-Layer PostGIS spatial features (`LAYER_WATER_INFRA`, `LAYER_ENERGY_WASTE`, `LAYER_KOPERASI_UMKM`, `LAYER_TOURISM_4A`, `LAYER_HERITAGE`, `LAYER_ACCOMMODATION`).
  - Coordinate validation within Banda Neira Bounding Box (Lat [-4.65, -4.45], Lng [129.80, 130.05]).
  - Automated promotion to `spatial_features` with RFC 7946 GeoJSON output, setting `etl_status = "MIGRATED_TO_POSTGRES"`.
- [x] 23.3 FastAPI Endpoints & SRS BAB XI Parity (`backend/app/modules/survei/router.py` & `main.py`):
  - Implemented `POST /api/v1/survei/mentah` (FR-01, BAB XI).
  - Implemented `GET /api/v1/survei/mentah` (filtering by domain, status, island, urgency).
  - Implemented `POST /api/v1/survei/migrasi-etl` (FR-02, BAB XI).
  - Implemented `GET /api/v1/survei/stats` & `POST /api/v1/survei/seed-sample`.
  - Added SRS 11 endpoint aliases: `GET /api/v1/penginapan` and `POST /api/v1/pemesanan` (+ WhatsApp direct booking link generator).
- [x] 23.4 Automated Test Suite Coverage (`backend/tests/test_survei_etl.py`):
  - 6 comprehensive tests passing 100% (happy path submission, bounding box coordinate rejection, authentic survey seeding, ETL pipeline transformation to PostGIS GeoJSON, stats summary, and SRS 11 penginapan/pemesanan aliases).
  - Full pytest suite: **78/78 tests passing 100%**.
- [x] 23.5 Frontend Dynamic Survey Form & ETL Manager Workspace (`frontend/src/services/survei.ts` & `frontend/src/views/SurveyEtlWorkspace.tsx`):
  - Built interactive NoSQL survey form with dynamic key-value field builder and domain presets (TDS sumur payau, timbulan botol plastik, pemadaman PLTS diesel, kebun pala organik, spot selam).
  - Built visual ETL Migration Manager panel with real-time statistics barometer (Total, Pending, Migrated, Transformation Ratio), domain/status filters, and 1-click batch migration into PostGIS 7-layer map.
  - Connected into `frontend/src/App.tsx` (Tab 11: `📋 Survei & ETL Hybrid`) and `LoginSection.tsx` guest shortcuts. Verified clean build (`npm run build` exits 0 in 4.21s).
- [x] 23.6 Production Docker Orchestration (`docker-compose.yml`):
  - Root `docker-compose.yml` orchestrating PostgreSQL 16 + PostGIS 3.4, MongoDB 7.0, FastAPI Python backend, and React Vite frontend.

### Phase 24: Single-Door Island Ecosystem Landing Page Portal (Satu Pintu BST-NIRANA)
- [x] 24.1 Unified Landing Page Workspace (`frontend/src/views/LandingPortalWorkspace.tsx`):
  - Built comprehensive, futuristic "Satu Pintu" portal serving as the single gateway for the entire Banda Digital Ecosystem.
  - Hero banner with ecosystem identity, universal search bar (auto-routing batch tokens, 16-digit NIK, GIS queries, or homestays), and key architectural metrics (7 Layers, 39 Points, SHA-256 Blockchain, AES-256-GCM NIK, 78 Tests Passed).
  - 4-Zone Bento Grid Navigation Hub:
    - Pintu 1: Smart Tourism & Budaya Banda (7-Layer GIS, Eco-Stay WA Booking, DSS SAW Mode 1, 177 Cagar Budaya, Marketplace Rempah & Ikan).
    - Pintu 2: Layanan Warga & Koperasi Hatta (Kiosk Desa, Kuota Air RO, Bank Sampah Sirkular 10L, Surat Desa Otomatis).
    - Pintu 3: IoT Telemetry & Resiliensi Pulau (TDS Air Minum WHO, PLTS Surya vs Diesel, Solenoid Valve, DSS Krisis Desa Mode 2).
    - Pintu 4: Riset, Survei & Tata Kelola (Survei NoSQL, Pipa ETL PostGIS, Ketertelusuran Rantai Pasok, Audit OWASP Top 10).
- [x] 24.2 Global Navigation & Brand Integration (`frontend/src/components/HeaderNav.tsx` & `frontend/src/App.tsx`):
  - Added clickable brand identity and dedicated "🏠 Satu Pintu" button across the entire navbar and all role-based tabs (Admin, Officer, Farmer Group Admin, Farmer, and Guest).
  - Set `landing` as default starting view, providing seamless entry points to all features with 1-click return to home.
  - Verified clean TypeScript build (`npm run build` exits 0 in 4.45s) and full test coverage.
- [x] 24.3 Immersive Banda Neira Ocean & Island Panorama Scenery (Smart Tourism Attraction):
  - Upgraded `frontend/src/views/LandingPortalWorkspace.tsx` background with authentic tropical ocean, deep Banda Sea palung, and volcanic island scenery to maximize smart tourism appeal.
  - Interactive Scenic Panorama Selector with 4 selectable atmospheres:
    1. 🌊 *Lautan Banda & Palung Kedalaman 7.440m* (Coral reef biodiversity, wall dive).
    2. 🌋 *Gunung Api Banda & Teluk Neira* (656 mdpl volcanic peak, lava flow snorkeling).
    3. 🏝️ *Pulau Hatta & Pantai Pasir Putih* (Pristine shore, turtle and hammerhead migration).
    4. 🏰 *Benteng Belgica & Kota Tua Neira* (17th-century pentagonal fortress UNESCO tentative).
  - Live marine sensing & telemetry barometer pill (Water temp 28.4°C, 28m crystal visibility, 100% solar energy, Gunung Api Level I Normal).
  - Dedicated "Pesona Unggulan Kepulauan Banda Neira" Smart Tourism Spotlight Showcase with 4 interactive cards, high-definition photography, GPS coordinates, and direct links to 7-Layer PostGIS GIS and eco-stay booking.
  - Quick Search chips for 1-click exploration (`Snorkeling Lava Flow`, `Diving Pulau Hatta`, `Benteng Belgica`, `Homestay`, `BATCH-PALA-001`, `Air RO`).
  - Verified with `npm run build` (built in 4.30s, exit code 0) and backend pytest (78/78 passed 100%).
- [x] 24.4 Single Unified Header Navigation & Full Ecosystem UI Theme Harmonization:
  - Eliminated duplicate headers on the landing page: conditionally secluded `HeaderNav` to non-landing dashboard tabs and integrated all brand identity, live connectivity status, marketplace shortcut, and user authentication/logout controls directly into the top of the scenic landing header banner.
  - Ensured edge-to-edge full-screen scenic hero banner with authentic landscape photography and zero conflicting milky white gradient overlays.
  - Harmonized color system to Neo-Obsidian & Cyber-Emerald design tokens (`#080c14`, `#10b981`, `#06b6d4`, `#f59e0b`, `#8b5cf6`), clean typography, glassmorphism, and responsive layout.
  - Added comprehensive Ecosystem Footer with four-quadrant navigation links, island coordinates, cryptographic system statuses, and copyright.
  - Verified with `npm run build` (built in 4.39s, exit code 0) and backend pytest suite (78/78 tests passed, 100%).
- [x] Phase 25: PWA Offline Map Caching & Field Resilience (IndexedDB GeoJSON 7-Layer Storage):
  - Added `getCachedRecord<T>` and `deleteCachedData` in `frontend/src/offline/db.ts` for full cache lifecycle management.
  - Upgraded `frontend/src/services/gis.ts` with automatic network-to-cache fallback, silent cache synchronization, 1-click batch download (`cacheAllGISOffline`), status inspection (`getOfflineGISStatus`), and cache clearing (`clearOfflineGISCache`).
  - Added real-time connectivity event listeners (`online` / `offline`) and interactive PWA Offline Resilience HUD Bar in `frontend/src/views/InteractiveMapWorkspace.tsx`.
  - Verified clean TypeScript build (`npm run build` exits 0 in 4.29s) and full test coverage (78/78 passed 100%).

### Phase 26: Actor Segregation & Dedicated Operational Roles (Koperasi, Homestay, Smart Tourism, Survei)
- [x] 26.1 Backend RBAC Roles & Seeding (`backend/app/core/permissions.py` & `backend/app/modules/auth/seed.py`):
  - Added formal role constants: `ROLE_RESIDENT = "resident"`, `ROLE_COOP_MANAGER = "coop_manager"`, `ROLE_HOMESTAY_OPERATOR = "homestay_operator"`, `ROLE_SMART_TOURISM_ADMIN = "smart_tourism_admin"`, and `ROLE_FIELD_SURVEYOR = "field_surveyor"`.
  - Seeded dedicated demo users into PostgreSQL database:
    - `pengelola_koperasi` (`Koperasi123!`, role `coop_manager`): Faisal Latarisa (Pengelola Koperasi Hatta)
    - `operator_homestay` (`Homestay123!`, role `homestay_operator`): Rahmat Delfika (Pengelola Delfika Eco-Stay)
    - `admin_wisata` (`Wisata123!`, role `smart_tourism_admin`): Dewi Nusantara (Pengelola Smart Tourism & Pemandu Budaya)
    - `surveyor` (`Surveyor123!`, role `field_surveyor`): Fauzan Arisanto (Surveyor Lapangan & IoT Operator)
- [x] 26.2 Frontend One-Click Digital Passes & Role Badges (`frontend/src/components/LoginSection.tsx` & `frontend/src/components/HeaderNav.tsx`):
  - Added 4 dedicated demo login cards with tailored icons, color themes, and credential badges.
  - Formatted Indonesian role badges in `HeaderNav.tsx` for all actor types.
- [x] 26.3 Role-Segregated Workspace Navigation & Tab Routing (`frontend/src/App.tsx`):
  - Eliminated monolithic tab clutter by personalizing navigation bars per actor:
    - **Pengelola Koperasi (`coop_manager`)**: Lands on `koperasi` (Kasir Komoditas, Bank Sampah, Koin Air RO) + `traceability` (Penerimaan Lot Rempah) + `iot` (Level Tangki Air & TDS).
    - **Operator Homestay (`homestay_operator`)**: Lands on `tourism` (Katalog Penginapan & WhatsApp Booking) + `gis` (Peta Akomodasi) + `smart_planner` (Panduan Wisatawan DSS).
    - **Admin Wisata & Budaya (`smart_tourism_admin`)**: Lands on `tourism` (177 Cagar Budaya, Audio Guide) + `gis` (7-Layer Spatial Map) + `smart_planner` (SAW Mode 1 DSS).
    - **Surveyor Lapangan (`field_surveyor`)**: Lands on `survei` (Form Survei NoSQL, Pipa Migrasi ETL PostGIS) + `iot` (Telemetri 4 Stasiun) + `gis` (Validasi Titik Lapangan) + `smart_planner` (SAW Mode 2 Krisis Desa).
    - **Petugas Desa (`village_officer`)**: Focused on Civil & Governance (`population`, `letters`, `farming`, `audit`).
    - **Super Admin (`admin`)**: Master oversight with all 11 tabs accessible.
- [x] 26.4 Automated Testing & Verification:
  - Added parametrized test `test_login_segmented_roles` in `backend/tests/test_auth.py` verifying JWT token issuance and role validation for all 4 new actors.
  - Verified full test suite passes: **14/14 auth tests, 82/82 total backend tests pass 100%**.
  - Verified clean TypeScript build (`npm --prefix frontend run build` exits 0 in 4.06s).

### Phase 27: Multi-Actor Quick Login Simulator & Homestay Operator Booking Management
- [x] 27.1 Universal Multi-Actor Quick Login Component (`frontend/src/components/QuickLoginModal.tsx`):
  - Created interactive simulator modal displaying all 9 ecosystem actor cards with Indonesian roles, credentials, descriptions, destination tabs, and 1-click login action.
  - Category filters: Semua (9), 🏛️ Desa, ⚖️ Koperasi & Tani, 🏖️ Wisata, 📋 Survei.
  - Active actor indicator with green pulse ring and dedicated `🌐 Mode Tamu` button to test public/unauthenticated access.
- [x] 27.2 Global Floating Quick Test Dock (`frontend/src/App.tsx`):
  - Fixed floating glassmorphic trigger pill at the bottom-right corner (`⚡ Quick Login (Uji Peran)` / `⚡ Peran: @username`) available on every single view and tab.
  - Integrated `⚡ Uji Peran` button directly into the top header and hero action area of `LandingPortalWorkspace.tsx`.
  - Integrated `⚡ Ganti Peran Cepat` button directly into the session HUD bar of `HeaderNav.tsx`.
- [x] 27.3 Backend Tourism Bookings Management Endpoint (`backend/app/modules/tourism/router.py`):
  - Implemented `GET /api/v1/tourism/bookings` and SRS BAB XI alias `GET /api/v1/pemesanan` with optional `accommodation_id` filtering.
  - Added automated test `test_list_bookings_for_operator` in `backend/tests/test_tourism.py` (all 6 tourism tests pass 100%).
- [x] 27.4 Frontend Host / Homestay Bookings Workspace (`frontend/src/views/TourismEcoStayWorkspace.tsx`):
  - Added 4th Tab: **"📋 Reservasi Masuk"** with real-time barometer (Total Reservasi, Estimasi Omset Homestay, Total Malam Menginap).
  - Cards listing guest details, check-in/out dates, room count, total bill, notes, and 1-click direct WhatsApp chat link to the guest (`💬 Hubungi Tamu`).
  - Added operator session badge showing active user name.
- [x] 27.5 Verification & Automated Tests:
  - Automated tests passing: **6/6 tourism tests, 14/14 auth tests, 83/83 total backend tests (100%)**.
  - TypeScript frontend build verified: `npm --prefix frontend run build` exits with code 0 in 4.38s.

### Phase 28: Central Admin Governance & Tourism Master Data CMS (Accommodations Tariff Control, Tour Guides Directory & Licensing)
- [x] 28.1 Database Schema & Migration (`tour_guides` & Accommodations Admin Controls):
  - Created `TourGuide` model in `backend/app/modules/tourism/models.py` with fields: `id` (UUID PK), `name`, `license_number` (unique), `phone_whatsapp`, `specialties`, `languages`, `fee_per_day_rp`, `photo_url`, `bio`, `island_base`, `rating`, `trips_completed`, `is_verified`, `is_active`.
  - Created and executed Alembic migration `backend/migrations/versions/012_tour_guides_table.py` with indices on `island_base` and `is_verified`.
- [x] 28.2 Backend CMS Endpoints & Auto-Seeding (`backend/app/modules/tourism/router.py` & `schemas.py`):
  - Created `AccommodationUpdateInput`, `TourGuideCreateInput`, `TourGuideUpdateInput`, and `TourGuideItemResponse` Pydantic schemas.
  - Implemented `PUT /api/v1/tourism/accommodations/{id}` and `DELETE /api/v1/tourism/accommodations/{id}`.
  - Implemented `GET /api/v1/tourism/guides`, `POST /api/v1/tourism/guides`, `PUT /api/v1/tourism/guides/{id}`, and `DELETE /api/v1/tourism/guides/{id}`.
  - Seeded initial certified Banda tour guides (La Ode Ruslan, Nyong Baadilla, Siti Hatta).
- [x] 28.3 Automated Backend Tests (`backend/tests/test_tourism.py`):
  - Implemented `test_cms_accommodations_crud`: verified hotel creation, tariff adjustment to Rp 500k, and deletion.
  - Implemented `test_cms_tour_guides_crud`: verified seed retrieval, guide registration, admin verification toggle, and deletion.
  - Test suite result: **8/8 tests passing (100%)** in 29.97s.
- [x] 28.4 Frontend Tourism Service (`frontend/src/services/tourism.ts`):
  - Added TypeScript interfaces: `TourGuideItem`, `AccommodationCreatePayload`, `AccommodationUpdatePayload`, `TourGuideCreatePayload`, `TourGuideUpdatePayload`.
  - Implemented API methods: `createAccommodation`, `updateAccommodation`, `deleteAccommodation`, `listTourGuides`, `createTourGuide`, `updateTourGuide`, `deleteTourGuide`.
- [x] 28.5 Dual-Panel CMS & Tour Guides Catalog Frontend (`frontend/src/views/TourismEcoStayWorkspace.tsx`):
  - Added Tab **"🧭 Pemandu Wisata"**: catalog cards with photo, verification badge, rating, trips count, specialties, languages, daily fee, and 1-click WhatsApp booking.
  - Added Tab **"⚙️ CMS Pusat & Tarif"**: dual-panel workspace with sub-tabs for:
    - **Kelola Penginapan & Tarif**: listing cards with 1-click quick price update (`✏️ Ubah Tarif Cepat`), admin verification toggle (`Setujui/Batalkan Verifikasi`), edit modal, and delete action.
    - **Kelola Pemandu Wisata & Jasa**: listing cards with 1-click quick fee update (`✏️ Ubah Tarif Jasa`), HPI certification toggle, edit modal, and delete action.
  - Interactive Add/Edit Modals with form validation for new hotels/homestays and licensed tour guides.
- [x] 28.6 Verification & Build:
  - TypeScript compilation and Vite production build verified: `npm --prefix frontend run build` exited with code 0 in 4.40s.
  - Backend test suite: `PYTHONPATH=. pytest backend/tests/test_tourism.py` passed 8/8 (100%).

### Phase 29: Strict RBAC Security Enforcement on Smart Tourism CMS, Tour Guides & Guest Bookings Privacy
- [x] 29.1 Backend RBAC Dependencies on Tourism Endpoints (`backend/app/modules/tourism/router.py`):
  - Enforced `HOMESTAY_CMS_ROLES` (`admin`, `village_officer`, `homestay_operator`, `operator_homestay`) on `POST`, `PUT`, and `DELETE /api/v1/tourism/accommodations`.
  - Enforced `GUIDE_CMS_ROLES` (`admin`, `village_officer`, `smart_tourism_admin`) on `POST`, `PUT`, and `DELETE /api/v1/tourism/guides`.
  - Enforced `BOOKINGS_VIEW_ROLES` (`admin`, `village_officer`, `homestay_operator`, `operator_homestay`, `smart_tourism_admin`) on `GET /api/v1/tourism/bookings` and alias `GET /api/v1/pemesanan` to protect guest PII (WhatsApp numbers and booking notes).
- [x] 29.2 Authenticated JWT Headers in Frontend Tourism Service (`frontend/src/services/tourism.ts`):
  - Added `getAuthHeaders()` reading `access_token` from `localStorage` and injecting `Authorization: Bearer <token>` on protected booking list and CMS mutation requests, with descriptive Indonesian 401/403 error messages.
- [x] 29.3 Role-Gated Frontend Tabs & Modals (`frontend/src/views/TourismEcoStayWorkspace.tsx`):
  - Added role permission checks (`canViewBookings`, `canAccessCMS`, `canManageHotels`, `canManageGuides`).
  - Hid or badged restricted tabs (`📋 Reservasi Masuk` & `⚙️ CMS Pusat & Tarif`) with lock indicators for public guests, plus protective RBAC access-denied gate cards with 1-click Quick Login launcher.
  - Restricted CMS sub-tabs so `homestay_operator` manages hotels/homestays while `smart_tourism_admin` manages HPI tour guides, and `admin`/`village_officer` oversee both.
- [x] 29.4 Automated Security & RBAC Tests (`backend/tests/test_tourism.py`):
  - Updated CRUD and booking list tests with role-specific JWT tokens (`admin`, `operator_homestay`, `admin_wisata`).
  - Added `test_unauthorized_guest_access_blocked` verifying 401 Unauthorized across all 8 protected endpoints for unauthenticated callers.
  - Added `test_forbidden_role_access_blocked` verifying 403 Forbidden when an unauthorized role (`petani`) attempts to view bookings or mutate accommodations/guides.
  - Verified **10/10 passing tests in `test_tourism.py` (85/85 total backend tests)** and clean TypeScript production build (`npm --prefix frontend run build` exits 0 in 2.77s).

### Phase 30: Editorial Slow-Travel Landing Page & Dual-Mode UI System (Desain Beranda Banda Neira & Tailwind CSS Setup)
- [x] 30.1 Tailwind CSS & PostCSS Tooling Installation (`frontend/package.json`, `frontend/tailwind.config.js`, `frontend/postcss.config.js`):
  - Installed `tailwindcss@^3.4.17`, `postcss@^8.4.49`, and `autoprefixer@^10.4.20`.
  - Configured custom Banda Neira color tokens (`teal #173f43`, `teal-dark #102f33`, `coral #e9a66f`, `sand #b46b3c`, `cream #f7f5f0`, `sage #dce8df`, `earth #f2e8dc`).
  - Added editorial typography font family definitions (`Cormorant Garamond` serif and `Plus Jakarta Sans`).
- [x] 30.2 CSS Harmonization & Google Fonts (`frontend/src/index.css`):
  - Injected Google Fonts `@import` for *Cormorant Garamond* and *Plus Jakarta Sans* at line 1 ahead of all statements.
  - Added `@tailwind base; @tailwind components; @tailwind utilities;` without conflicting with existing custom styles (`.app-card`, `.btn-primary`).
- [x] 30.3 Responsive Editorial Landing View Component (`frontend/src/views/landing/BandanairaBeranda.tsx`):
  - Implemented 12 comprehensive sections based on user's Figma export in `desainsaatini`:
    1. **Top Announcement & System Bar**: Online/offline PWA badge, coordinates, and Quick Login launcher.
    2. **BandaHeroSection**: Cinematic backdrop, headline "Temukan jalan menuju keajaiban", quick keyword search input, and direct CTAs.
    3. **IslandIntroductionSection**: Story of 7 Banda islands with 7-island badge.
    4. **InteractiveIslandMapSection**: Clickable island canvas (Neira, Gunung Api, Hatta, Lonthoir, Ay & Rhun) with dynamic detail cards and 1-click links to 7-Layer PostGIS map.
    5. **SpiceHeritageSection**: Nutmeg & clove heritage, real-time batch verification input, and link to on-chain passport.
    6. **MarineExperiencesSection**: Highlight cards for diving, snorkeling, and trekking with link to DSS SAW Smart Planner.
    7. **IslandStaysSection**: Eco-stay catalog preview and direct WhatsApp booking info.
    8. **ResidentServicesSection**: 6 island cards (Pemandu HPI, Koperasi & Air RO, Surat Desa, IoT Surya, DSS SAW, Survei ETL).
    9. **LocalCuisineSection**: Banda nutmeg jam, yellow fish soup, and kenari sambal with link to Marketplace.
    10. **SustainableTravelSection**: Sustainable travel guidelines (Support local, protect reefs, respect culture).
    11. **PlanYourVisitSection**: Interactive gateway launcher for all 11 modules with role status.
    12. **FooterSection**: Complete ecosystem links, coordinates, and Maluku Tengah local government branding.
- [x] 30.4 Seamless Dual-Mode Integration in Landing Portal (`frontend/src/views/LandingPortalWorkspace.tsx`):
  - Added `viewMode` toggle state (`'editorial' | 'command'`), defaulting to `'editorial'` (BandanairaBeranda).
  - Provided 1-click toggle buttons (`🎛️ Mode Dasbor Ekosistem` and `🌊 Desain Wisata Banda`) allowing users and village officials to switch fluidly between the warm editorial travel experience and the dark Neo-Obsidian command center.
- [x] 30.5 Production Build Verification:
  - TypeScript compilation and Vite production build verified: `npm --prefix frontend run build` exited with code 0 in 3.64s.
- [x] 30.6 Penyelarasan Navbar Figma & Integrasi Gambar Latar Belakang (`frontend/src/views/landing/BandanairaBeranda.tsx` & `frontend/src/assets/image.webp`):
  - Menyesuaikan desain navbar secara presisi sesuai `desainsaatini/BandaHeroSection.tsx` (floating glassmorphic `rounded-2xl` header dengan logo pala `bandanaira.com`, 6 item navigasi `Beranda`, `Peta`, `Sejarah`, `Wisata`, `Penduduk & Fasilitas`, `Layanan UMKM` lengkap dengan indikator garis bawah `#f4b75e`, serta tombol `Masuk / Login` berbingkai `#f4b75e` dan latar `#d9770626`).
  - Mengintegrasikan aset gambar latar belakang `frontend/src/assets/image.webp` pada bagian hero (`BandaHeroSection`) dan banner senja (`ResidentServicesSection`).
  - Menyelaraskan seluruh 11 bagian halaman dengan struktur komponen `desainsaatini/*.tsx` dan memverifikasi hasil build produksi (`npm --prefix frontend run build` keluar dengan kode 0, menghasilkan bundel `dist/assets/image-BEYOPXJR.webp`).
- [x] 30.7 Harmonisasi Desain UI/UX Sistem Menyeluruh berbasis `21st-cli-use` (`21st.dev`) & Identitas Banda Neira:
  - Mengaktifkan skill `21st-cli-use` (`npx @21st-dev/cli`) yang tersinkronisasi dengan akun `syahidai1720` untuk mengambil referensi arsitektur komponen **Elevate Navbar** (`id: 26786`), **Bento Card** (`id: 10457`), dan tema **Ocean Breeze** (`id: fdff1c09-bbd4-444c-8f0d-b00528372d83`).
  - Memperbarui token desain global pada `frontend/tailwind.config.js` dan `frontend/src/index.css` ke palet **Banda Deep Ocean Navy & Spice Gold** (`#081d35`, `#0f2c59`, `#f4b75e`, `#d97706`, `#f7f5f0`) sehingga seluruh 11 ruang kerja (`.app-card`, `.stat-card`, `.tab-nav`, `.tab-btn`, `.btn-primary`, `.data-table`, `.form-control`, `.modal-content`) tampil konsisten.
  - Merombak `HeaderNav.tsx` (navbar global seluruh ruang kerja) agar menggunakan gaya *floating glassmorphic* `bandanaira.com` dengan latar `image.webp`, 6 tautan navigasi berindikator garis bawah emas `#f4b75e`, serta bar status sinyal & sesi pengguna.
  - Memperbarui `LoginSection.tsx`, `QuickLoginModal.tsx`, `VerifiedMarketplaceModal.tsx`, `PublicVerifyModal.tsx`, `LandingPortalWorkspace.tsx`, dan `App.tsx` dengan latar `image.webp`, tipografi serif *Cormorant Garamond*, dan kartu Bento emas-samudra.
- [x] 30.8 Implementasi Halaman Pendaftaran Akun (`RegisterSection.tsx`) Sesuai Desain `desainsaatini/register-dekstop`:
  - Membangun `frontend/src/components/RegisterSection.tsx` yang menggabungkan `IslandLifeIntroSection` (panel kiri `#0f2c59` dengan latar `image.webp`, logo `bandanaira.com`, headline *"Lebih dekat dengan kehidupan pulau."*, kutipan serif miring *"Bertumbuh bersama Banda."*, dan catatan enkripsi AES-256 & HMAC) serta `AccountRegistrationSection` (panel kanan putih dengan pemilih peran 3 kartu `Warga Desa`, `Mitra Usaha`, `Wisatawan`, input `Nama lengkap`, `NIK 16 digit`, `Nomor WhatsApp`, `Buat PIN Pengaman 4 Digit` dengan tombol sembunyikan/tampilkan PIN, persetujuan syarat & ketentuan, tombol `Daftar sebagai {selectedRole}`, tautan `Sudah punya akun? Masuk sekarang`, dan 3 lencana kepercayaan `Enkripsi AES-256`, `Terhubung Blockchain Koperasi`, `Pemdes Banda`).
  - Menghubungkan halaman pendaftaran (`activeTab === 'register'`) ke `App.tsx`, `BandanairaBeranda.tsx`, `LandingPortalWorkspace.tsx`, `HeaderNav.tsx`, dan `LoginSection.tsx`.
- [x] 30.9 Implementasi Halaman Login Sesuai `desainsaatini/login-desktop` dengan Preservasi Seluruh 9 Peran Aktor (`LoginSection.tsx`):
  - Membangun antarmuka login layar-terpisah desktop & responsif mobile yang menggabungkan `BandaServicesIntroSection` (panel kiri `#0f2c59` dengan latar belakang `image.webp`, logo pala `bandanaira.com`, tag `KEPULAUAN BANDA · MALUKU`, headline *"Satu Pintu Layanan Kepulauan Banda"*, kutipan serif *"Bertumbuh bersama Banda."*, dan catatan keamanan AES-256 & HMAC) serta `AccountLoginSection` (panel kanan putih).
  - Mengimplementasikan tab ganda autentikasi:
    1. **Tab Warga Desa (Cepat via NIK)**: Form input NIK 16 digit, PIN Pengaman 4 digit dengan toggle lihat/sembunyikan PIN, tautan bantuan PIN, tombol cepat isi NIK contoh (`@warga`), dan tombol aksi login instan.
    2. **Tab Mitra, Operator & Wisatawan**: Form ID / Username dan Password dengan toggle lihat/sembunyikan kata sandi.
  - Mempertahankan dan menyematkan seluruh **9 Persona Holografis Akses Cepat** dengan visual badge bergradien neira-gold untuk seluruh peran ekosistem:
    1. `petugas` - Petugas Kantor Desa (Pemerintahan & Kependudukan)
    2. `pengelola_koperasi` - Pengelola Koperasi Hatta (Simpan Pinjam, Tabungan & Air Bersih)
    3. `operator_homestay` - Pengelola Eco-Stay & Wisata (Katalog Homestay & Reservasi)
    4. `admin_wisata` - Pemandu Smart Tourism & 177 Cagar Budaya (HPI & Destinasi)
    5. `surveyor` - Surveyor Lapangan & IoT (Telemetry Sensor Tanah & Pompa Air)
    6. `ketua_kelompok` - Ketua Kelompok Tani (Pala & Cengkeh Lonthoir)
    7. `petani` - Petani Rempah Pala (Panen & Mutu Rempah Banda)
    8. `warga` - Warga Masyarakat Desa (Layanan Mandiri & Permohonan Surat)
    9. `admin` - Administrator Sistem (Superuser & Pengaturan Ekosistem)
  - Menyertakan radar pencarian dan verifikasi publik batch rempah pala (`PublicVerifyModal`), 3 lencana kepercayaan (`Enkripsi AES-256`, `Terhubung Blockchain Koperasi`, `Pemdes Banda`), dan navigasi footer ke pendaftaran (`Daftar sekarang`) serta bantuan Pemdes.
  - Memverifikasi build produksi frontend (`npm --prefix frontend run build`) lolos 100% tanpa error TypeScript/Vite dalam 4.32s.
- [x] 30.11 Redirect Dashboard Otomatis Sesuai Role, Navigasi Dashboard Khusus Role, & Integrasi 4 Modul Publik di Landing Page Utama (`BandanairaBeranda.tsx`, `HeaderNav.tsx`, `App.tsx`, `RegisterSection.tsx`):
  - **Redirect Dashboard Instan Pasca Register & Login**:
    - Menghubungkan fungsi pembantu `getRoleDefaultTab(user)` di `App.tsx` ke alur `handleLogin`, `handleQuickLogin`, dan navigasi pasca-daftar di `RegisterSection.tsx`.
    - Pengguna yang masuk langsung diarahkan ke workspace spesifik perannya:
      - `resident` (Warga Desa) -> `'letters'` (`CitizenPortalWorkspace` portal mandiri surat & dokumen).
      - `homestay_operator` (Mitra Usaha) & `smart_tourism_admin` (Wisatawan/Pemandu) -> `'tourism'` (`TourismEcoStayWorkspace`).
      - `farmer` (Petani Rempah) -> `'traceability'` (`HarvestGradingWorkspace`).
      - `farmer_group_admin` (Kelompok Tani) -> `'farming'` (`FarmsGisWorkspace`).
      - `coop_manager` (Koperasi Hatta) -> `'koperasi'` (`KoperasiKasirWorkspace`).
      - `village_officer` & `admin` -> `'population'` (`ResidentsWorkspace` data warga & permohonan surat).
      - `field_surveyor` (Surveyor & IoT) -> `'survei'` (`SurveyEtlWorkspace`).
  - **Navigasi Dashboard Khusus Peran Pengguna (`HeaderNav.tsx` & `App.tsx`)**:
    - Mengganti tautan navbar dashboard dengan `getRoleNavigationItems(user)` sehingga antarmuka internal hanya menampilkan menu-menu workspace yang diizinkan untuk peran yang sedang aktif (tidak ada layar kasir koperasi atau telemetri server yang mengacaukan dashboard warga biasa).
    - Membatasi visibilitas Telemetri Infrastruktur Kepulauan (`activeTab === 'iot'`) khusus untuk peran Administrator.
  - **Integrasi 4 Modul Publik Interaktif Langsung di Landing Page Utama (`BandanairaBeranda.tsx`)**:
    1. **Peta Eksplorasi Spasial (`#peta`)**: Menambahkan pemilih mode pratinjau cepat dengan kartu detail informasi lokasi (pulau, koordinat, sejarah) dan mode **Peta GIS 7-Layer Leaflet** langsung di halaman.
    2. **Kalkulator & Rekomendasi Cerdas Wisata SAW (`#wisata`)**: Kalkulator multikriteria **Simple Additive Weighting** live dengan 4 slider bobot (Biaya C1, Waktu Tempuh C2, Fasilitas C3, Daya Tarik C4), 4 preset cepat ("Hemat Budget", "Akses Cepat", "Fasilitas", "Seimbang"), filter pulau dan kategori, kartu destinasi terurut skor $V_i$, rincian amenitas 4A, dan tombol tanya pemandu via WhatsApp.
    3. **Direktori Penginapan & Eco-Stay (`#eco-stay`)**: Menampilkan katalog 6 penginapan terverifikasi dengan filter pulau, filter Air Bersih RO, filter Listrik Surya, harga per malam, kamar tersedia, serta modal formulir reservasi yang terhubung otomatis ke WhatsApp pengelola.
    4. **Marketplace Produk UMKM & Rempah Terverifikasi Blockchain (`#layanan-umkm`)**: Katalog produk rempah pala, fuli, ikan asar cakalang, tuna sirip kuning, dan sirup pala dengan filter kategori, pencarian, kode batch rantai pasok, tombol verifikasi sertifikat QR Blockchain (`onPublicVerify`), serta pemesanan langsung via WhatsApp.
  - Memverifikasi build frontend produksi (`npm --prefix frontend run build`) sukses 100% tanpa error TypeScript maupun Vite bundling (exit code 0 dalam 4.58s).

### Phase 31: Unified Navbar & Footer, Figma Desktop Map Vector Integration, and 21st.dev User Bento Dashboard (Transformasi Landing Page 2)
- [x] 31.1 Integrasi Komponen Navigasi & Footer Terpadu Ekosistem Banda Neira (`BandaUnifiedNavbar.tsx` & `BandaUnifiedFooter.tsx`):
  - Membangun `frontend/src/components/common/BandaUnifiedNavbar.tsx` dengan palet warna navy `#081D35` & emas pala `#F4B75E`, logo rempah `bandanaira.com`, navigasi satu pintu (Beranda, Peta Kepulauan, Wisata & Penginapan, Belanja Rempah, DSS & Cagar Budaya), tombol Masuk / Daftar, dan pill status akun aktif + tombol Cepat Ganti Akun / Keluar.
  - Membangun `frontend/src/components/common/BandaUnifiedFooter.tsx` dengan filosofi *"Bertumbuh bersama Banda."*, tautan 4 pilar ekosistem (Jelajah Pulau, Ekonomi & Rempah, Ekosistem Desa, Kontak & Pos Komando), badge sertifikasi posko dan status operasional real-time.
  - Memasang `BandaUnifiedFooter` secara seragam di seluruh workspace aplikasi dan bagian bawah antarmuka pengguna di `App.tsx`.
- [x] 31.2 Integrasi Kode Desain Peta Desktop Figma ke Sistem Map (`JelajahPetaDesktopView.tsx`):
  - Mengadaptasi 100% struktur vektor SVG pulau (Neira, Banda Besar, Banda Api, Hatta, Ai, Pisang/Syahrir, Run, Batu Kapal), selat, jalur speedboat antar pulau, dan terumbu karang dari `frontend/src/desainsaatini/maps-dekstop/index.tsx`.
  - Mengintegrasikan fitur pencarian lokasi real-time, filter pulau (Semua, Neira, Banda Besar, Banda Api, Hatta, Ai, Pisang, Run), toggle lapisan layer (Wisata 4A, Sejarah & Budaya, Fasilitas Pulau), dan floating card rincian tempat terpilih.
  - Menghubungkan komponen peta vektor baru ini ke section `#peta` di `BandanairaBeranda.tsx` serta switcher mode (`🗺️ Peta Vektor Figma` vs `🛰️ 7-Layer Leaflet PostGIS`) di `InteractiveMapWorkspace.tsx`.
- [x] 31.3 Transformasi Landing Page 2 Menjadi Dashboard Pengguna Terpadu Berbasis 21st.dev Bento Grid (`UserEcosystemDashboard.tsx`):
  - Mengubah Landing Page 2 menjadi `frontend/src/views/dashboard/UserEcosystemDashboard.tsx` yang secara dinamis menyesuaikan data dan kartu aksi cepat berdasarkan peran pengguna yang login (`resident`, `farmer`, `farmer_group_admin`, `coop_manager`, `homestay_operator`, `smart_tourism_admin`, `field_surveyor`, `village_officer`, `admin`).
  - Mengimplementasikan kartu Bento Grid modern (elevated cards, gradient neira-gold `#F4B75E`, border halus, dan micro-interactions) terinspirasi oleh komponen 21st.dev.
  - Menampilkan sambutan personal berdasar role, ringkasan metrik riil (status surat, kuota air RO Koperasi, batch panen pala, rekomendasi SAW, dan 7 Pilar Ekosistem Digital Banda Neira).
- [x] 31.4 Integrasi Alur Redirect Dashboard di `App.tsx`:
  - Menambahkan tab `'dashboard'` ke state `activeTab` dan mengarahkan fungsi `getRoleDefaultTab(user)` langsung ke `'dashboard'` setelah login berhasil.
  - Menambahkan menu `📊 Dasbor` pada seluruh panel tab navigasi role aktor dan `HeaderNav.tsx`.
- [x] 31.6 Penyatuan Single Canonical Landing Page & Migrasi Seluruh Ruang Kerja Khusus Operasional ke Dalam Dashboard Ber-Sidebar (`DashboardLayout.tsx` & `App.tsx`):
  - Memastikan **Hanya Ada 1 Landing Page Utama** di seluruh sistem (`BandanairaBeranda.tsx` yang dibungkus `LandingPortalWorkspace.tsx`), menghapus seluruh potensi kebingungan landing page ganda.
  - Membangun `frontend/src/views/dashboard/DashboardLayout.tsx` yang menyediakan **Sidebar Navigasi di Samping Kiri** bergaya Banda Neira Deep Navy `#081D35` & `#F4B75E` dengan toggle collapse/expand dan drawer responsif di mobile.
  - Memindahkan seluruh ruang kerja operasional (`population`, `letters`, `farming`, `traceability`, `koperasi`, `tourism`, `gis`, `smart_planner`, `iot`, `survei`, `audit`) langsung ke dalam konten Dashboard di sebelah sidebar, terintegrasi dan difilter dinamis sesuai hak akses peran pengguna (`resident`, `farmer`, `farmer_group_admin`, `coop_manager`, `homestay_operator`, `smart_tourism_admin`, `field_surveyor`, `village_officer`, `admin`).
  - Menghapus tuntas seluruh deretan tab horizontal mengambang (`tab-nav`) yang menumpuk di atas konten, sehingga setelah login user murni berinteraksi melalui Dasbor ber-Sidebar.
  - Memverifikasi build frontend produksi (`npm --prefix frontend run build`) sukses tanpa error (exit code 0 dalam 6.21s).

### Phase 32: Spatial Studio Map Editor & 4A Geocoding Integration (Editor Titik Peta PostGIS & Google Maps/OSM)
- [x] 32.1 Docker & Environment Harmonization:
  - Docker Compose running with 4 containers (`banda_backend` 8005, `banda_db` 5435, `banda_frontend` 5175, `banda_mongodb` 27018).
  - PostGIS database migrated to `HEAD` (12 Alembic revisions applied) and seeded with 66 spatial points across 7 layers.
- [x] 32.2 Backend Multi-Provider Geocoding & Bounding-Box Geofencing (`backend/app/modules/gis/geocoding.py`):
  - Added multi-provider geocoder supporting Google Places API (with API Key fallback), OSM Nominatim, and curated offline local gazetteer for the Banda Neira archipelago.
  - Strict geofence bounding box check (`-4.65` to `-4.45` lat, `129.70` to `130.10` lng) preventing out-of-bounds coordinate contamination.
- [x] 32.3 Backend RBAC CRUD Endpoints for Spatial Features (`backend/app/modules/gis/router.py`):
  - `GET /api/v1/gis/cari-eksternal`: External geocoding search endpoint for location autocomplete.
  - `PUT /api/v1/gis/features/{feature_id}`: Update spatial feature attributes, coordinates, and 4A metadata (role: `admin`, `village_officer`).
  - `DELETE /api/v1/gis/features/{feature_id}`: Delete spatial point from PostGIS (role: `admin`, `village_officer`).
  - Automated tests passing in `tests/test_gis.py` (8 passed in 27s).
- [x] 32.4 Frontend Spatial Studio & Interactive Map Editor (`InteractiveMapWorkspace.tsx` & `gis.ts`):
  - Leaflet set as primary default map view across `BandanairaBeranda.tsx` and `InteractiveMapWorkspace.tsx`.
  - Added Mode Studio Editor button for authorized staff (`admin`, `village_officer`).
  - Tab 1: External Search pulling coordinates, addresses, and suggested layers from Google Maps / OSM Nominatim.
  - Tab 2: Precision Click-to-Pin and draggable Leaflet marker synchronizing latitude and longitude inputs in real-time.
  - Form fields tailored for 4A Tourism dimensions (Attraction Subtype & Highlights, Accessibility Boat Access & Travel Time, Amenities Entry Fee & Facilities, Ancillary Contact WhatsApp & Local Guide Checkbox).
  - Direct Edit and Delete actions in the inspection drawer for existing PostGIS points.
  - Build verified (`npm --prefix frontend run build` 0 errors, exit code 0).

### Phase 33: GIS Map Aesthetic Unification & Editorial Tone Harmonization (Clean Google Maps Style & Slop Removal)
- [x] 33.1 AI Slop & Academic Name-Dropping Removal:
  - Removed "Mandat Fauzan Arisanto & SRS 10.1 (PostGIS & Leaflet)", "5 Lokasi Unggulan, 7 situs Kurasi Inti, 4 stasiun IoT aktif, 50 kWp Micro-grid", and jargon like ESP32 live TDS from UI and layer labels.
  - Simplified and standardized layer names in backend `curated_layers.py` and frontend (`Wisata & Bahari`, `Cagar Budaya`, `Penginapan`, `Sentra UMKM`, `Fasilitas Umum`, `Air Bersih`, `Energi & Lingkungan`).
  - Removed bottom bento cards to achieve a clean Google Maps layout.
- [x] 33.2 Color Palette Harmonization with Banda Neira Editorial Slow-Travel:
  - Eliminated the pitch-black / slate-900 cyberpunk terminal box (`rgba(15, 23, 42, ...)`, `#0a0f1d`) that clashed with the landing page's warm cream/limestone background (`#f7f5f0`).
  - Re-themed map card wrapper, search bar, island filter chips, category pills, studio editor, and inspection drawer to crisp white surfaces (`#ffffff`), warm borders (`#cbd5e1`, `#e2e8f0`), deep ocean navy typography (`#0f2c59`), and slate subtexts (`#64748b`).
  - Changed Leaflet map canvas loading background from `#0a0f1d` to `#e0f2fe` (soft ocean water tone).
  - Verified with Impeccable mechanical detector (0 violations) and complete production build.

### Phase 34: Penghapusan Tuntas Desain Lama (Pembersihan `desainlama.png`), Redesain Global Warm Linen Banda Neira, dan Harmonisasi Workspace
- [x] 34.1 Analisis Tuntas Artefak Desain Lama (`frontend/public/desainlama/desainlama.png`):
  - Mengidentifikasi elemen desain lama yang masih tertinggal: `HeaderNav` gelap usang dengan tab bar mengambang hitam, kartu penginapan gelap `#0B1120`, tombol hijau neon `#10b981`, dan variabel global CSS yang memaksa tema dark cyberpunk.
- [x] 34.2 Penyelarasan Fondasi CSS Global (`frontend/src/index.css`):
  - Menyelaraskan seluruh variabel token `:root` ke tema editorial Banda Neira (Warm Linen `#F7F5F0`, background kartu putih bersih `#FFFFFF`, teks navy `#081D35`, teks sekunder `#475569`, border halus `#E2E8F0`, dan aksen emas pala `#F4B75E`).
  - Memperbarui styling kelas global `.app-card`, `.card`, `.stat-card`, `.table-responsive`, `.data-table`, `.form-control`, `.form-select`, `.modal-content`, `.tab-nav`, dan tombol `.btn-primary` sehingga seluruh workspace operasional (`ResidentsWorkspace`, `LettersWorkspace`, `FarmsGisWorkspace`, `HarvestGradingWorkspace`, `KoperasiKasirWorkspace`, `SmartPlannerWorkspace`, `IslandTelemetryWorkspace`, `SurveyEtlWorkspace`, `AuditTrailWorkspace`, `CitizenPortalWorkspace`) langsung seragam, modern, dan elegan.
- [x] 34.3 Perombakan Total Modal Marketplace (`frontend/src/components/VerifiedMarketplaceModal.tsx`):
  - Merombak total modal belanja produk UMKM & rempah dari tema hitam neon ke elevated card putih bersih `#FFFFFF` berlatar warm linen `#F7F5F0`, border emas pala `#F4B75E`, lencana verifikasi blockchain IPFS, tombol hubungi via WhatsApp, dan modal verifikasi QR.
- [x] 34.4 Redesain Komprehensif Workspace Wisata & Penginapan (`frontend/src/views/TourismEcoStayWorkspace.tsx`):
  - Mengganti seluruh inline styling gelap (`#0B1120`, `#0f172a`, hijau neon `#10b981`, teks `#f8fafc`) dengan palet Banda Neira (`#FFFFFF`, `#081D35`, `#475569`, `#F4B75E`).
  - Menyelaraskan header, filter bar wilayah dan tipe, kartu katalog penginapan eco-stay, tab 177 cagar budaya & audio guide player, pelacak reservasi, buku tamu operasional, katalog pemandu wisata, serta panel CMS tarif dan modal penambahan data.
- [x] 34.5 Pembersihan Tuntas Navigasi Lama di `App.tsx`:
  - Menghapus rendering `HeaderNav` lama dan bilah tab mengambang `Guest Public Exploration` bagi tamu non-login. Tamu kini secara mulus hanya menikmati 1 Landing Page Satu Pintu (`BandanairaBeranda`) atau masuk via Login/Register.
  - Memverifikasi build frontend produksi (`npm --prefix frontend run build`) lolos exit code 0 tanpa error TypeScript maupun CSS.

### Phase 35: Modularisasi Komponen Frontend & Penerapan Clean Code Blueprint (`fhinisCleanCode.md`)
- [x] 35.1 Restrukturisasi Fondasi Desain & Style (`frontend/src/styles/`):
  - Memisahkan token `:root` desain editorial Warm Linen & Deep Navy ke `styles/tokens.css`.
  - Memisahkan typography, keyframes animasi, form controls, bento cards, data table, dan modal backdrops ke `styles/global.css`.
  - Mengonfigurasi `frontend/src/index.css` sebagai entry point impor yang bersih bebas warning PostCSS.
- [x] 35.2 Standardisasi Komponen UI Reusable (`frontend/src/components/common/`):
  - Membuat `Button.tsx` (varian primary emas pala, secondary, outline, danger, success, ghost; size sm/md/lg; status loading & disabled).
  - Membuat `Card.tsx` (Card, CardHeader, CardTitle, CardDescription, CardBody, CardFooter).
  - Membuat `BadgeStatus.tsx` (varian verified, pending, confirmed, danger, offline, synced).
  - Membuat `InputForm.tsx` (FormInput, FormSelect, FormTextarea, FormLabel, FormError).
  - Memindahkan `HeaderNav.tsx` dan `Footer.tsx` ke dalam `components/common/` dengan backward-compatibility shim di root `components/`.
- [x] 35.3 Pengelompokan & Reorganisasi Seluruh Modal Dialog (`frontend/src/components/modals/`):
  - Mengisolasi 5 modal dialog: `QuickLoginModal.tsx`, `VerifiedMarketplaceModal.tsx`, `PublicVerifyModal.tsx`, `BlockchainModal.tsx`, `OfflineQueueModal.tsx`.
  - Menyediakan barrel export `modals/index.ts`.
  - Menyediakan file shim re-export di `components/` untuk menjamin zero regression pada kode legacy.
- [x] 35.4 Dekomposisi 10 Section Modular Landing Page (`frontend/src/components/landing/`):
  - Membedah monolit `BandanairaBeranda.tsx` (2.224 baris) menjadi 10 komponen section mandiri: `HeroSection.tsx`, `PanoramaIslandSection.tsx`, `PetaInteractiveSection.tsx`, `HeritageSpiceSection.tsx`, `TourismSawSection.tsx`, `EcoStayCatalogSection.tsx`, `EcosystemFeaturesSection.tsx`, `TraceabilityMarketplaceSection.tsx`, `SustainableTravelSection.tsx`, `PlanYourVisitSection.tsx`, dan `LandingFooterSection.tsx`.
  - Menyediakan ikon SVG terpadu di `LandingIcons.tsx` dan barrel export `landing/index.ts`.
  - Merefaktor `BandanairaBeranda.tsx` menjadi View Composer ramping (~120 baris) dengan keterbacaan tinggi.
- [x] 35.5 Verifikasi Build dan Integritas Fungsionalitas:
  - Memverifikasi build frontend (`npm --prefix frontend run build`) lolos exit code 0 tanpa error TypeScript atau bundle warning (`✓ built in 5.93s`).

### Phase 37: GIS Map Cartographic Location Pins & In-Map Atlas Legend Overhaul
- [x] 37.1 Eliminasi Elemen Pulse Marker & Transisi ke Cartographic Location Pins:
  - Mengganti seluruh marker lingkaran pulsing animasi (`pulse-ring` / `●`) pada `InteractiveMapWorkspace.tsx` menjadi SVG cartographic teardrop location pin presisi tinggi.
  - Mengonfigurasi `iconAnchor: [width/2, height]` (ujung jarum pin bawah) agar tepat menunjuk koordinat geografis lintang dan bujur WGS 84 tanpa pergeseran visual saat zoom peta.
  - Mengintegrasikan kode warna kategori unik pada setiap pin (Daya Tarik Wisata, Cagar Budaya, Eco-Stay, Koperasi UMKM, Fasilitas Umum, Air Bersih RO, Energi & Lingkungan).
  - Memperbarui pin marker draf Admin Spatial Studio menjadi grabable red teardrop pin dengan tooltip navigasi.
- [x] 37.2 Atlas-Style In-Map Floating Legend (`InteractiveMapWorkspace.tsx` & `FarmMap.tsx`):
  - Memindahkan legenda eksternal dari footer bawah peta ke dalam kanvas peta sebagai Floating Atlas Legend Card di sudut kiri bawah peta (`z-index: 1000`).
  - Mengadopsi estetika atlas kartografi: panel frosted-glass (`rgba(255, 255, 255, 0.96)`), header uppercase `LEGENDA PETA`, miniatur pin SVG pencocok warna, nama layer, counter jumlah objek aktif real-time, dan indikator proyeksi spatial `WGS 84 · RFC 7946`.
  - Menyediakan tombol collapse/expand interaktif (`ChevronDown`/`ChevronUp`) dan menambahkan `data-lenis-prevent` agar scroll daftar legenda terisolasi sempurna dari Lenis smooth scroll halaman.
  - Memperbarui `FarmMap.tsx` dengan pin komoditas Pala (P) dan Cengkih (C) berbingkai status verifikasi serta kotak legenda atlas mini terpadu.
- [x] 37.3 Kepatuhan Impeccable Design & Zero Emoji Policy:
  - Menghapus seluruh karakter emoji pada markup dan tooltip status peta, menggantikannya dengan ikon Lucide (`X`, `ChevronDown`, `ChevronUp`) dan tipografi deskriptif bersih.
  - Memverifikasi build frontend lolos (`✓ built in 6.73s`) dan lolos pemeriksaan `impeccable detect` (0 issues).

### Phase 38: Client-Side URL Routing, Deep-Linking, Session Restoration & Refresh Persistence
- [x] 38.1 Pemetaan Rute URL Bersih (Bidirectional URL Routing) untuk 14 Workspace:
  - Mendefinisikan kamus rute `TAB_ROUTES` dan pencocokan balik `ROUTE_TO_TAB` di `App.tsx` yang memetakan seluruh workspace dan aliasnya (`/`, `/dashboard`, `/population`, `/letters`, `/farming`, `/traceability`, `/koperasi`, `/iot`, `/tourism`, `/gis`, `/audit`, `/smart_planner`, `/survei`, `/register`, `/login`, `/peta`, `/wisata`, `/surat`, dll.).
- [x] 38.2 Sinkronisasi Otomatis Riwayat Peramban (History API & popstate Listener):
  - Membungkus navigasi `setActiveTab` dengan sinkronisasi `window.history.pushState` / `replaceState` dan penyimpanan lokal `banda_active_tab`.
  - Mengimplementasikan pendengar event `popstate` agar tombol Back/Forward peramban berfungsi mulus antar-ruang kerja.
- [x] 38.3 Inisialisasi State Sinkron & Eliminasi "Kick to Landing Page" saat Refresh:
  - Menginisialisasi `currentUser` secara sinkron dari profil cache lokal `authService.getCachedProfile()` saat token valid terdeteksi, mencegah *flash* unauthenticated state.
  - Menginisialisasi `activeTab` secara langsung dari `window.location.pathname` (dan cadangan `banda_active_tab`), memastikan pengguna tetap berada di halaman yang sedang diakses saat me-refresh halaman (F5 / reload).
- [x] 38.4 Fallback Navigasi Service Worker Offline (SPA Navigation):
  - Memperbarui `sw.js` dengan penanganan request bernavigasi (`mode === 'navigate'`) agar fallback ke `/index.html` dari cache ketika jaringan terputus atau saat pengguna me-refresh halaman di pulau 3T.
- [x] 38.5 Verifikasi Build dan Pengujian Regresi Penuh:
  - Build frontend Vite + TypeScript lolos 100% tanpa galat (`✓ built in 9.56s`).
  - Seluruh 89 tes backend pytest lolos 100% (`89 passed in 232.12s`).










