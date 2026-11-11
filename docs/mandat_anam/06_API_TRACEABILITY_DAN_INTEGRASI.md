# DOKUMEN SPESIFIKASI API KETERTELUSURAN DAN INTEGRASI
## Dokumentasi REST API Modul Traceability Ekosistem Digital Banda Neira
**Spesialis:** Khoirul Anam (*Blockchain & Traceability Specialist*)  
**Base URL:** `http://localhost:8005/api/v1/traceability`  
**Protokol:** HTTP/1.1 & HTTPS (JSON Content-Type)

---

## 1. Ikhtisar Arsitektur API & Matriks Otentikasi

Modul Traceability menyediakan RESTful API berkinerja tinggi yang dibangun di atas FastAPI. Akses dikelompokkan ke dalam dua kategori:
1. **Protected Endpoints (Membutuhkan Header `Authorization: Bearer <JWT>`):** Operasi pencatatan panen, agregasi batch, penambahan event pengolahan, dan transaksi anchoring ke blockchain.
2. **Public Endpoints (Zero-Authentication):** Pemindaian QR code dan verifikasi kriptografis on-chain oleh konsumen umum, wisatawan, dan mitra pembeli.

### Matriks Izin Peran (RBAC Matrix)

| Endpoint | Method | Peran yang Diizinkan | Keterangan |
|---|---|---|---|
| `/harvests` | `POST` | `admin`, `village_officer`, `farmer_group_admin`, `farmer` | Petani mencatat panennya sendiri; petugas mencatat panen warga. |
| `/harvests` | `GET` | Semua peran terotentikasi | Petani hanya melihat panennya; admin melihat seluruh desa. |
| `/batches` | `POST` | `admin`, `village_officer`, `farmer_group_admin` | Mengonsolidasikan satu atau beberapa panen menjadi batch. |
| `/batches` | `GET` | Semua peran terotentikasi | Melihat daftar batch komoditas aktif. |
| `/batches/{id}` | `GET` | Semua peran terotentikasi | Melihat detail batch beserta riwayat peristiwa dan hash. |
| `/batches/{id}/events` | `POST` | `admin`, `village_officer`, `farmer_group_admin` | Menambahkan event pengeringan, pengasapan, lab test, dll. |
| `/batches/{id}/anchor-blockchain` | `POST` | `admin`, `village_officer` | Mendaftarkan hash batch ke smart contract EVM. |
| `/batches/{id}/verify-blockchain` | `GET` | Semua peran terotentikasi | Menjalankan audit kriptografi on-chain real-time. |
| `/public/verify/{token}` | `GET` | **Publik (Tanpa Login)** | Konsumen memverifikasi paspor mutu produk. |
| `/public/qr/{token}.png` | `GET` | **Publik (Tanpa Login)** | Stream biner gambar PNG QR code untuk cetak kemasan. |

---

## 2. Rincian Endpoint Fungsional

### 2.1. Pendaftaran Panen atau Tangkapan Laut
`POST /api/v1/traceability/harvests`

**Headers:**
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body (Contoh Komoditas Rempah):**
```json
{
  "farmer_id": "902d1d40-f138-4c12-9c44-3d96923b7b25",
  "farm_id": "a11d1d40-f138-4c12-9c44-3d96923b7b99",
  "commodity_type": "pala",
  "harvest_date": "2026-11-10",
  "quantity_kg": 150.5,
  "quality_grade": "super_a",
  "moisture_content_pct": 9.2,
  "notes": "Panen raya lereng Lonthoir petik ranum"
}
```

**Request Body (Contoh Komoditas Perikanan):**
```json
{
  "farmer_id": "902d1d40-f138-4c12-9c44-3d96923b7b25",
  "farm_id": null,
  "commodity_type": "ikan_cakalang",
  "harvest_date": "2026-11-10",
  "quantity_kg": 280.0,
  "quality_grade": "sashimi_grade",
  "moisture_content_pct": null,
  "notes": "Pancing tonda Laut Banda WPP 714, palka es terkontrol 2°C"
}
```

**Response (201 Created):**
```json
{
  "id": "c4794e75-9993-41bb-a320-b4f2c00a4593",
  "farmer_id": "902d1d40-f138-4c12-9c44-3d96923b7b25",
  "commodity_type": "pala",
  "harvest_date": "2026-11-10",
  "quantity_kg": 150.5,
  "quality_grade": "super_a",
  "moisture_content_pct": 9.2,
  "notes": "Panen raya lereng Lonthoir petik ranum",
  "created_at": "2026-11-10T08:30:00Z"
}
```

---

### 2.2. Pembentukan Batch Komoditas
`POST /api/v1/traceability/batches`

Mengagregasi panen menjadi satu unit keterlacakan bernomor batch unik.

**Request Body:**
```json
{
  "batch_code": "BN-BTC-2026-001",
  "commodity_name": "Pala Banda Grade A Super",
  "total_weight_kg": 150.5,
  "origin_village": "Desa Lonthoir, Banda Besar",
  "harvest_ids": ["c4794e75-9993-41bb-a320-b4f2c00a4593"]
}
```

**Response (201 Created):**
```json
{
  "id": "e8321d40-f138-4c12-9c44-3d96923b7b12",
  "batch_code": "BN-BTC-2026-001",
  "commodity_name": "Pala Banda Grade A Super",
  "total_weight_kg": 150.5,
  "origin_village": "Desa Lonthoir, Banda Besar",
  "status": "draft",
  "verification_token": "BN_VERIFY_PALA_SUPER_2026_LONTHOIR",
  "public_qr_url": "/api/v1/traceability/public/qr/BN_VERIFY_PALA_SUPER_2026_LONTHOIR.png",
  "created_at": "2026-11-10T09:00:00Z"
}
```

---

### 2.3. Penambahan Peristiwa Rantai Pasok (CTE)
`POST /api/v1/traceability/batches/{batch_id}/events`

Menambahkan peristiwa seperti penjemuran, pengasapan Ikan Asar, atau pengujian laboratorium.

**Request Body:**
```json
{
  "event_type": "LAB_TESTED",
  "description": "Pengujian cemaran aflatoksin dan kadar minyak atsiri",
  "location": "Balai Riset Standardisasi Industri",
  "ipfs_cid": "QmPalaBandaSuperGradeALonthoir2026CertCid",
  "extra_metadata": {
    "aflatoxin_ppb": 0.4,
    "essential_oil_pct": 11.8,
    "status": "PASSED_EXPORT_STANDARD"
  }
}
```

**Response (200 OK):**
```json
{
  "id": "f9011d40-f138-4c12-9c44-3d96923b7b44",
  "batch_id": "e8321d40-f138-4c12-9c44-3d96923b7b12",
  "event_type": "LAB_TESTED",
  "description": "Pengujian cemaran aflatoksin dan kadar minyak atsiri",
  "location": "Balai Riset Standardisasi Industri",
  "event_hash": "0x7a8e234199c08a9f...",
  "ipfs_cid": "QmPalaBandaSuperGradeALonthoir2026CertCid",
  "timestamp": "2026-11-10T11:00:00Z"
}
```

---

### 2.4. Anchoring Batch ke Smart Contract
`POST /api/v1/traceability/batches/{batch_id}/anchor-blockchain`

Mendaftarkan hash kumulatif batch ke smart contract EVM.

**Response (200 OK):**
```json
{
  "status": "anchored",
  "batch_code": "BN-BTC-2026-001",
  "transaction_hash": "0x8fa4c379a29e843bb5c593259b662363118cf9d56417fae44682052f50b467ec",
  "block_number": 18492041,
  "gas_used": 82410,
  "smart_contract_address": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  "cumulative_hash": "0x3cf374fa078fe1a221f70dd2e54eb8671607efea74f14144415cfbb281862f9d",
  "anchored_at": "2026-11-10T11:15:00Z"
}
```

---

### 2.5. Verifikasi Publik Kriptografis (Zero-Auth)
`GET /api/v1/traceability/public/verify/{token}`

Digunakan oleh konsumen umum via scan QR code.

**Response (200 OK):**
```json
{
  "batch_code": "BN-BTC-2026-001",
  "commodity_name": "Pala Banda Grade A Super",
  "origin_village": "Desa Lonthoir, Banda Besar",
  "category": "SPICE",
  "status": "verified",
  "is_authentic": true,
  "producer_display": "Poktan Lonthoir Subur (Usman Alkatiri)",
  "blockchain_proof": {
    "network": "Ethereum Sepolia Testnet",
    "contract_address": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    "transaction_hash": "0x8fa4c379a29e843bb5c593259b662363118cf9d56417fae44682052f50b467ec",
    "block_number": 18492041,
    "on_chain_hash": "0x3cf374fa078fe1a221f70dd2e54eb8671607efea74f14144415cfbb281862f9d",
    "calculated_local_hash": "0x3cf374fa078fe1a221f70dd2e54eb8671607efea74f14144415cfbb281862f9d",
    "cryptographic_match": true
  },
  "ipfs_metadata_cid": "QmPalaBandaSuperGradeALonthoir2026CertCid",
  "events_timeline": [
    {
      "step": 1,
      "event_type": "INITIAL_REGISTRATION",
      "location": "Desa Lonthoir, Banda Besar",
      "description": "Registrasi awal batch panen raya pala",
      "timestamp": "2026-11-10T09:00:00Z"
    },
    {
      "step": 2,
      "event_type": "DRIED",
      "location": "Para-para Pengeringan Lonthoir",
      "description": "Penjemuran matahari alami 6 hari, kadar air 9.2%",
      "timestamp": "2026-11-10T10:00:00Z"
    },
    {
      "step": 3,
      "event_type": "LAB_TESTED",
      "location": "Balai Standardisasi Mutu",
      "description": "Uji Aflatoksin negatif & sertifikasi Indikasi Geografis",
      "timestamp": "2026-11-10T11:00:00Z"
    }
  ]
}
```

---

### 2.6. Endpoint Stream Citra PNG QR Code
`GET /api/v1/traceability/public/qr/{token}.png`

Menghasilkan file citra PNG QR code dinamis beresolusi tinggi dengan error correction level M. Siap disematkan pada tag `<img>` atau diunduh untuk dicetak pada label kemasan.

**Headers Respon:**
```http
Content-Type: image/png
Cache-Control: public, max-age=86400
Content-Disposition: inline; filename="QR_BN_VERIFY_PALA_SUPER_2026_LONTHOIR.png"
```

---

*Disahkan untuk integrasi antarmuka klien - Khoirul Anam.*
