# Custom Font Assets

Folder ini disiapkan untuk file font komersial **Nexa Pro** dan **Intro Script**.

### Format File yang Didukung:
- `NexaPro-Regular.woff2` (atau `.woff`, `.otf`, `.ttf`)
- `NexaPro-Bold.woff2` (atau `.woff`, `.otf`, `.ttf`)
- `IntroScript-Regular.woff2` (atau `IntroScript.otf`, `IntroScript.ttf`)

Font yang ditaruh di sini otomatis terbaca oleh sistem aplikasi via `@font-face` di `src/styles/global.css`.
Jika file fisik belum ditaruh, sistem menggunakan fallback lokal (jika terpasang di OS) dan webfont geometris + script yang harmonis.
