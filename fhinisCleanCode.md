# Rencana Arsitektur & Pohon Struktur Komponen Modular Frontend (fhinisCleanCode.md)

Dokumen ini berisi cetak biru (blueprint) restrukturisasi modular pada direktori `frontend/src/` sesuai panduan pada `CleanCode.md` dan aturan **AGENTS.md** (**RULE 1**, **RULE 2**, **RULE 3**, **RULE 6**), tanpa merusak 13 workspaces maupun fungsionalitas logika bisnis, API services, dan IndexedDB offline yang sudah berjalan.

---

## 1. Pohon Struktur File `frontend/src/` Baru

```
frontend/src/
├── styles/                                    # [BARU] Pusat Design System & Token Warna
│   ├── tokens.css                             # Variabel CSS :root (Warna Warm Linen, Navy, Emas Pala, Shadows, Radius)
│   └── global.css                             # Aturan global, typography Google Fonts, animations, reset & utility classes
│
├── components/
│   ├── common/                                # [DIPERLUAS] Elemen UI Dasar Reusable
│   │   ├── BandaUnifiedNavbar.tsx             # Navbar terpadu beranda & navigasi umum
│   │   ├── BandaUnifiedFooter.tsx             # Footer komprehensif ekosistem
│   │   ├── HeaderNav.tsx                      # Navigasi header internal operasional (dipindahkan ke common/)
│   │   ├── Footer.tsx                         # Wrapper footer standar mandiri yang bersih
│   │   ├── Button.tsx                         # [BARU] Tombol standar reusable (primary, secondary, outline, danger, ghost)
│   │   ├── Card.tsx                           # [BARU] Wadah kartu standar (Card, CardHeader, CardBody, CardFooter)
│   │   ├── BadgeStatus.tsx                    # [BARU] Badge status standar (Verified, Pending, Confirmed, Offline, Synced)
│   │   └── InputForm.tsx                      # [BARU] Kontrol input teks, select, textarea, dan form label standar
│   │
│   ├── landing/                               # [BARU] Pemecahan Modular Landing Page (Clean Architecture)
│   │   ├── HeroSection.tsx                    # Banner utama Banda Neira, floating dock, search bar & quick metrics
│   │   ├── PanoramaIslandSection.tsx          # 4 Kartu panorama kepulauan & narasi slow-travel
│   │   ├── PetaInteractiveSection.tsx         # Section eksplorasi spasial & GIS layer switcher
│   │   ├── HeritageSpiceSection.tsx           # Sejarah pala, fuli, cagar budaya VOC & audio guide
│   │   ├── TourismSawSection.tsx              # Kalkulator DSS SAW Engine (rekomendasi cerdas bobot kriteria wisata)
│   │   ├── EcoStayCatalogSection.tsx          # Direktori homestay eco-stay, filter air RO & surya, booking WhatsApp
│   │   ├── EcosystemFeaturesSection.tsx       # 7 Pilar ekosistem BST-NIRANA & layanan desa
│   │   ├── TraceabilityMarketplaceSection.tsx # Katalog produk UMKM rempah, batch blockchain & QR verification
│   │   ├── SustainableTravelSection.tsx       # Prinsip konservasi alam, terumbu karang & kearifan lokal
│   │   └── PlanYourVisitSection.tsx           # Gerbang akses, petunjuk transportasi laut, dan CTA login/register
│   │
│   ├── modals/                                # [BARU] Pengelompokan Seluruh Dialog / Modal Terisolasi
│   │   ├── QuickLoginModal.tsx                # Simulator uji 9 peran pengguna
│   │   ├── VerifiedMarketplaceModal.tsx       # Modal belanja & verifikasi produk terdaftar
│   │   ├── PublicVerifyModal.tsx              # Modal pemindai QR & validasi sertifikat blockchain
│   │   ├── BlockchainModal.tsx                # Modal transparansi hash audit rantai pasok
│   │   ├── OfflineQueueModal.tsx              # Modal sinkronisasi antrean IndexedDB offline
│   │   └── index.ts                           # Re-export barrel file untuk kemudahan impor
│   │
│   ├── FarmMap.tsx                            # Komponen peta perkebunan
│   ├── OccupationBadge.tsx                    # Badge profesi kependudukan
│   ├── LoginSection.tsx                       # Split-screen halaman login
│   └── RegisterSection.tsx                    # Split-screen halaman registrasi
│
├── views/
│   ├── LandingPortalWorkspace.tsx             # Komponen orkestrasi bersih (hanya memanggil sections dari components/landing/)
│   ├── landing/
│   │   └── BandanairaBeranda.tsx              # Direfaktor menjadi komposer ramping yang menyusun komponen landing/
│   └── dashboard/
│       ├── DashboardLayout.tsx                # Shell dashboard dengan sidebar samping
│       └── UserEcosystemDashboard.tsx         # Bento grid dashboard personal berdasar peran
```

---

## 2. Rincian Elemen yang Diekstrak dari `LandingPortalWorkspace.tsx` / `BandanairaBeranda.tsx`

Halaman utama yang saat ini berukuran **2.256 baris** akan dibedah menjadi 10 komponen section modular yang berdiri sendiri:
1. **`HeroSection.tsx`**: Header sambutan hero, pencarian universal, dan navigasi cepat.
2. **`PanoramaIslandSection.tsx`**: Kartu fotografi dan pengantar 4 pulau utama Banda.
3. **`PetaInteractiveSection.tsx`**: Integrasi pratinjau peta desktop vector Figma & peta interaktif Leaflet.
4. **`HeritageSpiceSection.tsx`**: Narasi sejarah pala & cagar budaya.
5. **`TourismSawSection.tsx`**: Widget kalkulator SAW Multi-Kriteria dengan ranking otomatis $V_i$.
6. **`EcoStayCatalogSection.tsx`**: Daftar penginapan berfilter RO/Solar beserta modal pemesanan WhatsApp.
7. **`EcosystemFeaturesSection.tsx`**: 7 pilar layanan kependudukan, koperasi, telemetri, dan tata kelola.
8. **`TraceabilityMarketplaceSection.tsx`**: Showcase produk rempah dan gerbang verifikasi blockchain.
9. **`SustainableTravelSection.tsx`**: Panduan etika konservasi maritim Banda.
10. **`PlanYourVisitSection.tsx`**: Panduan perjalanan, FAQ ringkas, dan gerbang masuk portal.

Setelah pemecahan ini, `LandingPortalWorkspace.tsx` dan `BandanairaBeranda.tsx` hanya akan bertindak sebagai **View Composer** yang bersih (bebas dari ratusan baris inline JSX yang menumpuk).

---

## 3. Rincian Modul Komponen Reusable (`frontend/src/components/common/`)

1. **`Button.tsx`**:
   - Varian: `primary` (Emas Pala `#F4B75E`), `secondary` (Putih `#FFFFFF` border `#CBD5E1`), `outline` (Aksen pala transparan), `danger` (Merah `#EF4444`), `ghost` (Transparan).
   - Ukuran: `sm`, `md`, `lg`.
   - Dukungan state: `loading` (spinner animasi), `disabled`, icon slot kiri/kanan.

2. **`Card.tsx`**:
   - Elemen: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardBody`, `CardFooter`.
   - Varian tema: standard elevated white card dengan aksen border atas emas pala halus dan shadow bento.

3. **`BadgeStatus.tsx`**:
   - Standardisasi status badge lintas workspace:
     - `verified` (Hijau emerald)
     - `pending` (Kuning amber)
     - `confirmed` (Biru laut)
     - `danger` / `rejected` (Merah mace coral)
     - `offline` (Abu-abu slate)
     - `synced` (Cyan)

4. **`InputForm.tsx`**:
   - Komponen input form kontrol terstandarisasi: `FormInput`, `FormSelect`, `FormTextarea`, `FormLabel`, `FormError`.
   - Mendukung tema putih bersih dengan border `#CBD5E1` dan focus ring emas pala `#F4B75E`.

5. **`HeaderNav.tsx` & `Footer.tsx`**:
   - Pindahkan `HeaderNav.tsx` ke dalam `components/common/` dengan backward-compatibility re-export.
   - Buat komponen `Footer.tsx` mandiri yang bersih.

---

## 4. Rincian Migrasi Modal (`frontend/src/components/modals/`)

Seluruh modal dialog dikelompokkan ke dalam direktori khusus:
- `QuickLoginModal.tsx`
- `VerifiedMarketplaceModal.tsx`
- `PublicVerifyModal.tsx`
- `BlockchainModal.tsx`
- `OfflineQueueModal.tsx`
- `index.ts` (Barrel file re-export)
- Pada direktori `components/` lama, disediakan re-export shim agar berkas-berkas lain yang masih mengimpor dari path lama tidak mengalami error.

---

## 5. Rincian Refactoring Style (`frontend/src/styles/`)

- **`tokens.css`**: Menyimpan seluruh variabel `:root` (warna `#F7F5F0`, `#FFFFFF`, `#081D35`, `#F4B75E`, `#059669`, tipografi, font family, border radius, dan box shadows).
- **`global.css`**: Menyimpan styling global, keyframes animasi, aturan reset, utility classes, table, dan modal overlay.
- `index.css` utama cukup mengimpor `tokens.css` dan `global.css`.

---

## 6. Jaminan Keamanan & Kompatibilitas (Zero Regression)

- **Logika Bisnis & Backend**: Tidak ada perubahan pada direktori `backend/`, `blockchain/`, `migrations/`, maupun `services/`.
- **Offline & Storage**: Tetap mempertahankan integritas IndexedDB di `offline/` dan sync queue.
- **Verifikasi Bertahap**: Sebelum dan setelah implementasi, eksekusi `npm run build` (`tsc && vite build`) untuk menjamin **0 TypeScript errors**.
