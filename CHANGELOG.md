# Changelog (CHANGELOG.md)

All notable changes to the **Banda Digital Ecosystem** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]
### Added
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



