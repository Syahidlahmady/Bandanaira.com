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

