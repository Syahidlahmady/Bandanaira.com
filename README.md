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
- [AGENTS.md](file:///home/masann/Projects/banda%20neira/penduduk/AGENTS.md) — Aturan wajib dan alur kerja AI Coding Agent.
- [SRS.md](file:///home/masann/Projects/banda%20neira/penduduk/SRS.md) — Software Requirements Specification lengkap.
- [ARCHITECTURE.md](file:///home/masann/Projects/banda%20neira/penduduk/ARCHITECTURE.md) — Arsitektur teknis modular monolith.
- [DATABASE.md](file:///home/masann/Projects/banda%20neira/penduduk/DATABASE.md) — Desain skema database dan entitas relasional.
- [API.md](file:///home/masann/Projects/banda%20neira/penduduk/API.md) — Spesifikasi REST API dan format respon.
- [TASKS.md](file:///home/masann/Projects/banda%20neira/penduduk/TASKS.md) — Roadmap dan progres pengerjaan bertahap.

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

### 3. Akses Layanan
- **Frontend Web:** `http://localhost:5173`
- **Backend API:** `http://localhost:8000`
- **API Interactive Docs (Swagger):** `http://localhost:8000/docs`
- **Health Check Endpoint:** `http://localhost:8000/api/v1/health`
