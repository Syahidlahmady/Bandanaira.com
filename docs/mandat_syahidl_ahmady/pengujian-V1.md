# Laporan Audit Keamanan Sistem & Temuan Celah Kerentanan (V1)
**Banda Digital Ecosystem (Kepulauan Banda)**  
*Dokumen Resmi Hasil Pengujian Keamanan & Kepatuhan Sistem Tingkat Lanjut*

---

| Metadata Pengujian | Keterangan |
| :--- | :--- |
| **Tanggal Pengujian** | 26 November 2026 |
| **Versi Dokumen** | 1.0 (V1) |
| **Framework Pengujian** | Testing Agent (`.agents/skills/testing-agent`), OWASP WSTG v4.2, OWASP API Top 10 (2023) |
| **Dasar Hukum & Kepatuhan** | UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP) |
| **ID Sesi Run** | `20261126T162919Z-ff3ab810` (Tervalidasi & Tersegel Kriptografis) |
| **Lingkup Target (*Scope*)** | `banda-source` (Source Code), `banda-api` (`http://127.0.0.1:8005`), `banda-web` (`http://localhost:5175`) |
| **Status Akhir Pengujian** | **COMPLETED ASSESSMENT** (17 Workstream Checks, 13 Berkas Bukti Tersegel) |

---

## 1. Ringkasan Eksekutif (*Executive Summary*)

Audit keamanan ini dilakukan secara independen dan menyeluruh terhadap kode sumber (*source code*), konfigurasi backend FastAPI, antarmuka web React, serta modul kriptografi Banda Digital Ecosystem. Pengujian mencakup 10 area pengujian (*workstreams*) mulai dari verifikasi identitas lingkungan, batas kepercayaan kode, proteksi data PII warga, otentikasi & manajemen sesi, hingga kontrol akses tingkat objek API.

Berdasarkan hasil analisis statis, penelusuran aliran eksekusi (*data flow trace*), dan verifikasi kontrol hak akses, ditemukan **9 celah keamanan** dengan distribusi keparahan sebagai berikut:

```
┌────────────────────────────────────────────────────────┐
│  DISTRIBUSI KEPARAHAN TEMUAN KEAMANAN (TOTAL: 9)       │
├───────────────────┬────────┬───────────────────────────┤
│ Tingkat Keparahan │ Jumlah │ Persentase                │
├───────────────────┼────────┼───────────────────────────┤
│ CRITICAL (Kritis) │   1    │ 11.1%                     │
│ HIGH (Tinggi)     │   3    │ 33.3%                     │
│ MEDIUM (Sedang)   │   4    │ 44.4%                     │
│ LOW (Rendah)      │   1    │ 11.1%                     │
└───────────────────┴────────┴───────────────────────────┘
```

> [!CAUTION]
> **Temuan Kritis Utama (P0)**: Ditemukan celah *Authentication Bypass Backdoor* pada berkas `backend/app/core/permissions.py` melalui mekanisme header `offline-jwt-*` yang memungkinkan penyerang tanpa kata sandi mengambil alih akun Administrator Sistem (`admin`) secara penuh. Celah ini harus segera ditutup sebelum sistem diekspos ke jaringan publik.

---

## 2. Matriks Temuan Celah Keamanan (*Vulnerability Matrix*)

| ID | Judul Kerentanan | Kategori OWASP | Tingkat Keparahan | CVSS v3.1 | Target / Lokasi |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SEC-001** | *Authentication Bypass Backdoor* via Header `offline-jwt-*` | Broken Authentication | **CRITICAL** | **9.8** | `backend/app/core/permissions.py` |
| **SEC-002** | Operasi Transaksi Finansial & Keran Solenoid Koperasi Tanpa Otentikasi | Unauthenticated Access | **HIGH** | **8.6** | `backend/app/modules/koperasi/router.py` |
| **SEC-003** | *Broken Object Level Authorization* (BOLA) pada Permohonan Surat Warga | Broken Object Authorization | **HIGH** | **7.5** | `backend/app/modules/population/router.py` |
| **SEC-004** | Enumerasi Massal Kependudukan & Kebocoran PII via `/auth/identify-account` | PII Exposure / No Rate-Limit | **HIGH** | **7.3** | `backend/app/modules/auth/router.py` |
| **SEC-005** | Eksekusi Pipa ETL & Mutasi Database Tanpa Otentikasi | Unauthenticated Access | **MEDIUM** | **6.5** | `backend/app/modules/survei/router.py` |
| **SEC-006** | Ingest Telemetri Sensor IoT Tanpa Otentikasi Perangkat / Token HMAC | Broken Authentication | **MEDIUM** | **6.5** | `backend/app/modules/iot/router.py` |
| **SEC-007** | *Hardcoded Default Secret Key* & *Private Key* dalam Konfigurasi Sistem | Cryptographic Failure | **MEDIUM** | **5.9** | `backend/app/core/config.py` |
| **SEC-008** | Penyimpanan PII Warga dalam Bentuk Plaintext di Browser & Sebagian Basis Data | Sensitive Data Exposure | **MEDIUM** | **5.5** | `frontend/ResidentsWorkspace.tsx` & DB |
| **SEC-009** | Mekanisme Logout Stateles Tanpa *Server-Side Token Revocation* (Blacklist) | Insecure Session Management | **LOW** | **3.7** | `frontend/auth.ts` & `auth/router.py` |

---

## 3. Detail Analisis Celah Keamanan & Rekomendasi Remediasi

---

### SEC-001: Authentication Bypass Backdoor via `offline-jwt-*` Header
- **Keparahan**: **CRITICAL** (Skor CVSS v3.1: 9.8 / `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H`)
- **Kategori**: OWASP API2:2023 - *Broken Authentication*
- **Lokasi Berkas**: [`backend/app/core/permissions.py`](file:///home/hid/Projects/BTS-NEIRA/penduduk/backend/app/core/permissions.py#L43-L64)
- **Bukti Pengujian**: `evidence/sec-001-offline-jwt-bypass.txt`

#### Analisis Kerentanan
Di dalam fungsi dependensi otentikasi inti `get_current_user`, terdapat blok logika demo offline yang memproses token dengan awalan string `offline-jwt-`:

```python
# backend/app/core/permissions.py (Baris 43-64)
if token.startswith("offline-jwt-"):
    parts = token.split("-")
    role_hint = parts[2] if len(parts) > 2 else "admin"
    username_map = {
        "admin": "admin",
        "village_officer": "petugas",
        "farmer_group_admin": "ketua_kelompok",
        "farmer": "petani",
        "resident": "warga",
        ...
    }
    target_username = username_map.get(role_hint, "admin")
    stmt = select(User).where(User.username == target_username)
    result = await db.execute(stmt)
    dev_user = result.scalar_one_or_none()
    if dev_user and dev_user.is_active:
        return dev_user
```

#### Dampak Eksploitasi
Siapa pun di jaringan yang mengirimkan header HTTP berikut:
```http
Authorization: Bearer offline-jwt-admin-bypass
```
akan langsung diakui oleh sistem sebagai akun pengguna `admin` (Administrator Sistem) tanpa validasi tanda tangan kriptografi (*cryptographic signature*), tanpa memeriksa masa berlaku (*expiration*), dan tanpa memeriksa kata sandi. Penyerang dapat melakukan tindakan destruktif, mengubah peran pengguna lain, mengakses data PII seluruh warga, hingga memanipulasi rantai blok desa.

#### Rekomendasi Perbaikan
Hapus logika `offline-jwt-` dari pustaka otentikasi produksi, atau batasi secara ketat hanya pada *environment* pengujian unit lokal (`test`) dengan memeriksa flag `settings.ENVIRONMENT == "test"` dan `settings.DEBUG is True`.

---

### SEC-002: Operasi Bisnis Finansial & Keran Solenoid Koperasi Hatta Tanpa Otentikasi
- **Keparahan**: **HIGH** (Skor CVSS v3.1: 8.6 / `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:N`)
- **Kategori**: OWASP API1:2023 - *Broken Object Level Authorization* & *Broken Function Level Authorization*
- **Lokasi Berkas**: [`backend/app/modules/koperasi/router.py`](file:///home/hid/Projects/BTS-NEIRA/penduduk/backend/app/modules/koperasi/router.py#L56-L300)
- **Bukti Pengujian**: `evidence/sec-002-unauth-koperasi.txt`

#### Analisis Kerentanan
Pada router Koperasi Hatta & Bank Sampah, 4 endpoint sensitif tidak dilindungi dependensi otentikasi (`Depends(get_current_user)` atau `Depends(require_roles)`):
1. `POST /api/v1/koperasi/transaksi/setor-komoditas`: Menambah saldo rupiah tabungan koperasi warga.
2. `POST /api/v1/koperasi/transaksi/setor-sampah`: Menambah kuota air bersih atau saldo tabungan.
3. `POST /api/v1/koperasi/tebus-air`: Memotong kuota air warga dan menghasilkan sinyal fisik durasi pembukaan Solenoid Valve (`dispense_sec`).
4. `GET /api/v1/koperasi/warga/{nik}/profil`: Membocorkan ringkasan saldo, poin sampah, kuota air, dan 10 riwayat transaksi warga secara publik.

```python
# backend/app/modules/koperasi/router.py (Baris 56-65)
@router.post("/transaksi/setor-komoditas", ...)
async def setor_komoditas(
    payload: CommodityDepositInput,
    db: AsyncSession = Depends(get_db), # <-- TIDAK ADA OTENTIKASI!
):
```

#### Dampak Eksploitasi
- **Manipulasi Finansial**: Klien mana pun dapat mengirimkan setoran komoditas palsu (misal 500 kg pala) dan menggelembungkan saldo rekening koperasi tanpa verifikasi kasir.
- **Pencurian Air Bersih**: Penyerang dapat memasukkan NIK warga lain ke endpoint `/tebus-air`, menyedot kuota air bersih milik warga tersebut hingga habis, dan memicu keran solenoid fisik terbuka otomatis di stasiun BWRO.
- **Kebocoran Riwayat Finansial**: Siapa pun dapat mengintip kondisi finansial warga desa hanya dengan menebak/mengetahui NIK 16 digit.

#### Rekomendasi Perbaikan
Tambahkan kontrol peran resmi:
- Endpoint kasir (`setor-komoditas`, `setor-sampah`) harus memerlukan peran `ROLE_COOP_MANAGER` atau `ROLE_VILLAGE_OFFICER`.
- Endpoint `tebus-air` harus memvalidasi token autentikasi warga atau token kiosk resmi.
- Endpoint profil harus dibatasi hanya untuk pemilik akun atau pengurus koperasi.

---

### SEC-003: Broken Object Level Authorization (BOLA/IDOR) pada Permohonan Surat Warga
- **Keparahan**: **HIGH** (Skor CVSS v3.1: 7.5 / `CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:N`)
- **Kategori**: OWASP API1:2023 - *Broken Object Level Authorization*
- **Lokasi Berkas**: [`backend/app/modules/population/router.py`](file:///home/hid/Projects/BTS-NEIRA/penduduk/backend/app/modules/population/router.py#L510-L538)
- **Bukti Pengujian**: `evidence/sec-003-bola-admin-requests.txt`

#### Analisis Kerentanan
Pada fungsi `create_administrative_request`:

```python
# backend/app/modules/population/router.py (Baris 516-532)
resident = None
if request_in.resident_id:
    res_stmt = select(Resident).where(Resident.id == request_in.resident_id)
    resident = (await db.execute(res_stmt)).scalar_one_or_none()
    ...
else:
    # Match by full_name or fallback to first resident
    res_stmt = select(Resident).where(Resident.full_name == current_user.full_name)
    resident = (await db.execute(res_stmt)).scalar_one_or_none()
    if not resident:
        fallback_stmt = select(Resident).limit(1)
        resident = (await db.execute(fallback_stmt)).scalar_one_or_none()
```

#### Dampak Eksploitasi
1. Pengguna berstatus warga biasa (`Warga A`) dapat mengirimkan `resident_id` milik `Warga B` pada payload JSON. Sistem tidak memeriksa apakah `resident.nik == current_user.username`. Permohonan surat resmi desa akan tercatat atas nama `Warga B` secara tidak sah.
2. Jika `resident_id` dikosongkan dan nama pengguna tidak cocok, kode mengambil baris pertama warga secara acak (`select(Resident).limit(1)`), menyebabkan data warga lain terasosiasi secara keliru.

#### Rekomendasi Perbaikan
Kaitkan permohonan surat secara ketat dengan profil warga milik pengguna yang sedang login (`current_user`):
```python
if ROLE_ADMIN not in user_roles and ROLE_VILLAGE_OFFICER not in user_roles:
    # Warga hanya boleh membuat permohonan untuk dirinya sendiri
    if resident.nik != current_user.username:
        raise HTTPException(status_code=403, detail="Tidak berwenang membuat permohonan atas nama warga lain.")
```

---

### SEC-004: Enumerasi Kependudukan & Kebocoran PII via `/auth/identify-account`
- **Keparahan**: **HIGH** (Skor CVSS v3.1: 7.3 / `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N`)
- **Kategori**: Pelanggaran UU PDP Pasal 35 & 36 / OWASP API4:2023 - *Unrestricted Resource Consumption*
- **Lokasi Berkas**: [`backend/app/modules/auth/router.py`](file:///home/hid/Projects/BTS-NEIRA/penduduk/backend/app/modules/auth/router.py#L143-L242)
- **Bukti Pengujian**: `evidence/sec-004-identify-account-pii.txt`

#### Analisis Kerentanan
Endpoint `GET /api/v1/auth/identify-account` menerima parameter `identifier` (NIK 16 digit, username, atau email) secara publik tanpa proteksi otentikasi dan **tanpa rate limiting**:

```json
// Respon yang dikembalikan ke publik:
{
  "found": true,
  "name": "Ahmad Subagio",
  "masked_nik": "817101******0001",
  "village": "Lonthoir",
  "is_farmer": true,
  "farmer_group": "Kelompok Tani Pala Makmur",
  "roles": ["resident", "farmer"]
}
```

#### Dampak Eksploitasi
Penyerang dapat menjalankan skrip otomasi brute-force rentang NIK Maluku Tengah / Banda (misalnya kode wilayah `817101...`). Karena endpoint tidak memiliki batasan frekuensi (*rate limiting*), penyerang dapat menyusun basis data identitas lengkap warga desa, termasuk nama asli, desa domisili, kelompok tani, dan peran sistem.

#### Rekomendasi Perbaikan
1. Terapkan fungsi pembatas laju panggilan: `check_nik_rate_limit(client_ip)`.
2. Sensor nama lengkap pada tampilan pra-login publik (misal: `A**** S******`).
3. Informasi peran sistem (*system roles*) hanya boleh dikembalikan setelah pengguna berhasil memasukkan PIN/kata sandi yang sah.

---

### SEC-005: Eksekusi Pipa ETL & Mutasi Database Tanpa Otentikasi
- **Keparahan**: **MEDIUM** (Skor CVSS v3.1: 6.5 / `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:H/A:L`)
- **Kategori**: OWASP API5:2023 - *Broken Function Level Authorization*
- **Lokasi Berkas**: [`backend/app/modules/survei/router.py`](file:///home/hid/Projects/BTS-NEIRA/penduduk/backend/app/modules/survei/router.py#L188-L202)
- **Bukti Pengujian**: `evidence/sec-005-unauth-survei-etl.txt`

#### Analisis Kerentanan
Endpoint `POST /api/v1/survei/migrasi-etl` yang bertugas menjalankan proses ekstraksi, transformasi, dan pemuatan data spasial mentah ke tabel `spatial_features` di PostgreSQL/PostGIS dapat dipicu oleh klien anonim tanpa otentikasi.

#### Dampak Eksploitasi
Penyerang dapat memicu beban pemrosesan tinggi secara berulang-ulang (*resource exhaustion*) dan menyisipkan fitur spasial tidak terverifikasi ke dalam basis data GIS resmi desa.

#### Rekomendasi Perbaikan
Lindungi endpoint dengan hak akses petugas:
```python
dependencies=[Depends(require_roles(ROLE_ADMIN, ROLE_FIELD_SURVEYOR, ROLE_VILLAGE_OFFICER))]
```

---

### SEC-006: Ingest Telemetri Sensor IoT Tanpa Otentikasi Perangkat
- **Keparahan**: **MEDIUM** (Skor CVSS v3.1: 6.5 / `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:H/A:N`)
- **Kategori**: OWASP API2:2023 - *Broken Authentication*
- **Lokasi Berkas**: [`backend/app/modules/iot/router.py`](file:///home/hid/Projects/BTS-NEIRA/penduduk/backend/app/modules/iot/router.py#L84-L140)
- **Bukti Pengujian**: `evidence/sec-006-unauth-iot-ingest.txt`

#### Analisis Kerentanan
Endpoint `POST /api/v1/iot/telemetri` menerima pembacaan sensor mikrokontroler ESP32 (kadar TDS air RO, status keran, voltase solar panel) tanpa memeriksa token API stasiun, tanda tangan HMAC, ataupun mTLS.

#### Dampak Eksploitasi
Klien luar dapat mengirimkan data sensor palsu (*telemetry spoofing*), misalnya melaporkan bahwa kadar TDS air bersih mencapai 2.500 ppm (air asin berbahaya), sehingga memicu alarm darurat palsu (*false alert*) dan mengacaukan dasbor ketahanan pulau.

#### Rekomendasi Perbaikan
Terapkan otentikasi *Pre-Shared Key* (PSK) atau tanda tangan HMAC berbasis header `X-Station-Token` atau `X-IoT-Signature` yang dicocokkan dengan stasiun terdaftar di `DEFAULT_STATIONS`.

---

### SEC-007: Hardcoded Default Secret Key & Private Key dalam Konfigurasi
- **Keparahan**: **MEDIUM** (Skor CVSS v3.1: 5.9 / `CVSS:3.1/AV:L/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:N`)
- **Kategori**: OWASP Top 10 A02:2021 - *Cryptographic Failures*
- **Lokasi Berkas**: [`backend/app/core/config.py`](file:///home/hid/Projects/BTS-NEIRA/penduduk/backend/app/core/config.py#L19-L38) & [`.env.example`](file:///home/hid/Projects/BTS-NEIRA/penduduk/.env.example#L8-L42)
- **Bukti Pengujian**: `evidence/sec-007-hardcoded-config-secrets.txt`

#### Analisis Kerentanan
Konfigurasi `Settings` mendefinisikan string *fallback default*:
- `SECRET_KEY`: `"banda_neira_digital_secret_key_change_in_production_2026_secure"`
- `AES_SECRET_KEY`: `"banda_neira_aes_256_gcm_master_key_32bytes_sec!"`
- `BLOCKCHAIN_DEPLOYER_PRIVATE_KEY`: `"0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"`

#### Dampak Eksploitasi
Jika aplikasi dijalankan di lingkungan staging/produksi tanpa berkas `.env` yang terisi penuh, aplikasi akan berjalan tanpa peringatan menggunakan kunci default yang telah terekspos di repositori. Akibatnya, token JWT dapat dipalsukan dan ciphertext NIK dapat didekripsi oleh siapa pun yang membaca kode sumber.

#### Rekomendasi Perbaikan
Tambahkan validasi startup pada `backend/app/main.py`: Jika `ENVIRONMENT != "test"` dan kunci bernilai sama dengan nilai bawaan, aplikasi harus gagal *boot* secara aman (*fail-closed*).

---

### SEC-008: Penyimpanan PII Warga di LocalStorage & Sebagian Basis Data Plaintext
- **Keparahan**: **MEDIUM** (Skor CVSS v3.1: 5.5 / `CVSS:3.1/AV:L/AC:L/PR:L/UI:R/S:U/C:H/I:N/A:N`)
- **Kategori**: OWASP Top 10 A01:2021 - *Broken Access Control* / Kepatuhan UU PDP
- **Lokasi Berkas**: [`frontend/src/views/ResidentsWorkspace.tsx`](file:///home/hid/Projects/BTS-NEIRA/penduduk/frontend/src/views/ResidentsWorkspace.tsx#L377) & [`backend/app/modules/population/models.py`](file:///home/hid/Projects/BTS-NEIRA/penduduk/backend/app/modules/population/models.py#L14-L28)
- **Bukti Pengujian**: `evidence/sec-008-plaintext-pii-storage.txt`

#### Analisis Kerentanan
1. **Frontend**: Fitur draft otomatis menyimpan seluruh data pendaftaran warga (NIK, nama lengkap, tempat lahir, alamat, nomor telepon) ke `localStorage` browser dengan kunci `banda_draft_resident`. Pada perangkat publik/kiosk kantor desa yang digunakan bersama, data pribadi warga rentan terbaca oleh pengguna berikutnya.
2. **Backend**: Di tabel `residents`, kolom plaintext `nik` masih tersimpan berdampingan dengan `nik_encrypted`. Kolom data sensitif lain seperti `phone_number` dan `address` belum dienkripsi at-rest.

#### Rekomendasi Perbaikan
- Kosongkan draft `localStorage` setelah transaksi pendaftaran selesai atau gunakan sesi memori jangka pendek.
- Lanjutkan implementasi **Fase 2 Kemanan Berlapis**: Enkripsi kolom `phone_number` dan `address` menggunakan AES-256-GCM.

---

### SEC-009: Mekanisme Logout Stateles Tanpa Server-Side Token Revocation
- **Keparahan**: **LOW** (Skor CVSS v3.1: 3.7 / `CVSS:3.1/AV:N/AC:H/PR:L/UI:N/S:U/C:L/I:L/A:N`)
- **Kategori**: OWASP Top 10 A07:2021 - *Identification and Authentication Failures*
- **Lokasi Berkas**: [`frontend/src/services/auth.ts`](file:///home/hid/Projects/BTS-NEIRA/penduduk/frontend/src/services/auth.ts#L176-L180) & [`backend/app/modules/auth/router.py`](file:///home/hid/Projects/BTS-NEIRA/penduduk/backend/app/modules/auth/router.py)
- **Bukti Pengujian**: `evidence/sec-009-stateless-jwt-logout.txt`

#### Analisis Kerentanan
Ketika pengguna menekan tombol "Logout" pada aplikasi web, antarmuka hanya menghapus `access_token` dari `localStorage` browser. Backend tidak memiliki endpoint `POST /api/v1/auth/logout` dan tidak memiliki daftar blokir token (*token blacklist*).

#### Dampak Eksploitasi
Jika sebuah access token disadap sebelum pengguna logout, token tersebut masih dapat digunakan selama 60 menit hingga masa kedaluwarsa alaminya habis, meskipun pengguna merasa telah keluar dari sistem.

#### Rekomendasi Perbaikan
Sediakan endpoint `POST /api/v1/auth/logout` yang mencatat `jti` (JWT ID) ke dalam tabel/Redis cache *revocation list* yang diverifikasi pada `decode_token`.

---

## 4. Analisis Kepatuhan Regulasi & Kebijakan

### 4.1. Kepatuhan terhadap UU No. 27 Tahun 2022 (UU PDP)
- **Pasal 35 & 36**: Pengendali data pribadi wajib melindungi data pribadi dari pemrosesan yang tidak sah, kebocoran, dan akses tanpa izin.
  - *Status Kepatuhan*: **Belum Sepenuhnya Memenuhi (Non-Compliant)** karena keberadaan endpoint publik `/auth/identify-account` yang membocorkan nama dan afiliasi warga tanpa pembatasan laju panggilan (SEC-004), serta penyimpanan draft PII di `localStorage` (SEC-008).
- **Pasal 39**: Kewajiban menjaga kerahasiaan data pribadi dalam pemrosesan.
  - *Pencapaian Positif*: Sistem telah menerapkan AES-256-GCM dan HMAC-SHA256 Blind Index untuk NIK, serta menjaga prinsip **Zero PII on Blockchain** (Rule 4 & 5).

### 4.2. Kepatuhan terhadap OWASP API Security Top 10 (2023)
- **API1 (BOLA)**: Terjadi pada permohonan surat kependudukan (SEC-003).
- **API2 (Broken Authentication)**: Celah kritis pada bypass `offline-jwt` (SEC-001) dan operasi Koperasi Hatta (SEC-002).
- **API4 (Unrestricted Resource Consumption)**: Tidak adanya rate limiting pada endpoint deteksi NIK (SEC-004) dan ingest survei (SEC-005).

---

## 5. Rencana Aksi Remediasi Berdasarkan Prioritas (*Action Plan Roadmap*)

```mermaid
flowchart TD
    subgraph P0["Prioritas 0 (Segera / Hari Ini)"]
        A["Hapus Backdoor 'offline-jwt-*' di permissions.py (SEC-001)"]
        B["Pasang Depends(require_roles) pada Router Koperasi (SEC-002)"]
        C["Tutup BOLA pada create_administrative_request (SEC-003)"]
    end

    subgraph P1["Prioritas 1 (Fase Penguatan IAM)"]
        D["Pasang Rate Limiting & Masking di identify-account (SEC-004)"]
        E["Proteksi Endpoint Survei ETL & IoT Telemetri (SEC-005 & SEC-006)"]
        F["Validasi Startup untuk Mencegah Kunci Default di Produksi (SEC-007)"]
    end

    subgraph P2["Prioritas 2 (Fase Kriptografi Lanjutan)"]
        G["Fase 2 Enkripsi Kolom PII Database (Telepon, Alamat, KK) (SEC-008)"]
        H["Hapus PII Draft dari Browser LocalStorage (SEC-008)"]
        I["Implementasi Token Blacklist Revocation untuk Logout (SEC-009)"]
    end

    P0 --> P1 --> P2
```

### Prioritas 0 (Hari Ini - Mitigasi Celah Kritis & Tinggi)
1. **Perbaiki `backend/app/core/permissions.py`**:
   Hapus blok parsing `offline-jwt-` agar otentikasi wajib melalui validasi token JWT kriptografis.
2. **Kunci Endpoint Koperasi (`koperasi/router.py`)**:
   Pasang dependensi `Depends(require_roles(ROLE_COOP_MANAGER, ROLE_ADMIN))` untuk kasir timbangan dan bank sampah, serta autentikasi warga untuk penebusan air.
3. **Kunci Endpoint Permohonan (`population/router.py`)**:
   Validasi kepemilikan data sebelum membuat permohonan surat kependudukan.

### Prioritas 1 (Fase Penguatan IAM & Anti-Enumeration)
1. **Pasang `check_nik_rate_limit`** pada `GET /api/v1/auth/identify-account` dan samarkan nama lengkap.
2. **Tambahkan token PSK/HMAC** untuk mikrokontroler sensor ESP32 pada `POST /api/v1/iot/telemetri`.
3. **Tambahkan proteksi startup** di `backend/app/main.py` yang menolak booting jika menggunakan kunci rahasia default.

### Prioritas 2 (Fase Kriptografi Lanjutan Sesuai `rancangan_kemanan_berlapis.md`)
1. Lanjutkan implementasi **Fase 2 Keamanan Berlapis**: Enkripsi kolom Nomor KK, Telepon, dan Alamat warga menggunakan AES-256-GCM.
2. Tambahkan tabel server-side token blacklist untuk proses logout yang sempurna.

---

## 6. Pernyataan Penutup (*Closure & Attestation*)

Laporan audit ini dihasilkan melalui pengujian berbasis bukti (*evidence-based assessment*) menggunakan perkakas `testing-agent`. Seluruh berkas reproduksi telah diverifikasi integritasnya melalui hash SHA-256 dan diindeks pada berkas `evidence-index.json`.

Pelaksanaan pengujian ini membuktikan bahwa meskipun Banda Digital Ecosystem telah memiliki arsitektur pertahanan berlapis (*defense-in-depth*) dan fondasi kriptografi yang kuat, penutupan celah-celah di atas—khususnya otentikasi peran pada modul operasional dan penghapusan bypass pengembangan—merupakan prasyarat mutlak sebelum sistem ini dinyatakan siap operasional secara aman.
