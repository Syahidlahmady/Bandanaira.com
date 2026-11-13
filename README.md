# Banda Digital Ecosystem

Platform digital terintegrasi untuk mendukung digitalisasi pelayanan masyarakat, pendataan petani rempah, pemetaan perkebunan, dan transparansi rantai pasok produk rempah di Desa Banda Neira, Maluku.

---

## 🏛️ Subsistem Utama
1. **Population Identity & Administration:** Manajemen identitas digital internal warga desa dan pencatatan layanan desa.
2. **Spice Farmer Mapping:** Pemetaan petani, kelompok tani, dan koordinat kebun rempah berbasis PostGIS & Leaflet.
3. **Blockchain-Based Spice Traceability:** Pelacakan rantai pasok rempah (panen, pengolahan, pengemasan) dengan bukti integritas hash di smart contract blockchain dan verifikasi QR Code publik.

---

## 🛠️ Tech Stack
- **Backend:** Python 3.12+, FastAPI, SQLAlchemy, Alembic, Pydantic v2
- **Frontend:** React 18, Vite, TypeScript, React Router, TanStack Query, Leaflet
- **Database:** PostgreSQL 16 + PostGIS 3.4
- **Blockchain:** Solidity, Local EVM Testnet, Web3.py
- **Infrastruktur:** Docker & Docker Compose

---

## 📖 Dokumentasi Teknis
- [ECOSYSTEM_KNOWLEDGE_BASE.md](file:///home/hid/Projects/BTS-NEIRA/penduduk/ECOSYSTEM_KNOWLEDGE_BASE.md) — **Master Knowledge Base & AI Context (Baca ini pertama kali bagi agen AI).**
- [AGENTS.md](file:///home/hid/Projects/BTS-NEIRA/penduduk/AGENTS.md) — Aturan wajib dan alur kerja AI Coding Agent.
- [SRS.md](file:///home/hid/Projects/BTS-NEIRA/penduduk/SRS.md) — Software Requirements Specification lengkap.
- [ARCHITECTURE.md](file:///home/hid/Projects/BTS-NEIRA/penduduk/ARCHITECTURE.md) — Arsitektur teknis modular monolith.
- [DATABASE.md](file:///home/hid/Projects/BTS-NEIRA/penduduk/DATABASE.md) — Desain skema database dan entitas relasional.
- [API.md](file:///home/hid/Projects/BTS-NEIRA/penduduk/API.md) — Spesifikasi REST API dan format respon.
- [TASKS.md](file:///home/hid/Projects/BTS-NEIRA/penduduk/TASKS.md) — Roadmap dan progres pengerjaan bertahap.
- [USER_GUIDE.md](file:///home/hid/Projects/BTS-NEIRA/penduduk/docs/USER_GUIDE.md) — Panduan operasional dan pengguna lengkap.

---

## 🚀 Memulai Proyek (Local Development)

### 1. Salin Environment Variables
```bash
cp .env.example .env
```

### 2. Jalankan via Docker Compose
```bash
docker compose -f infrastructure/docker/docker-compose.yml up -d --build
```

### 3. Jalankan Database Migrations & Seed Data Demonstrasi
```bash
poetry run alembic -c backend/alembic.ini upgrade head
poetry run python backend/scripts/demo_seed.py
```

### 4. Akses Layanan
- **Frontend Web:** `http://localhost:5174` (atau `http://localhost:5173`)
- **Backend API:** `http://localhost:8005` (atau `http://localhost:8000`)
- **API Interactive Docs (Swagger):** `http://localhost:8005/docs`
- **Health Check Endpoint:** `http://localhost:8005/api/v1/health`
