# Panduan Alur Kerja CI/CD Build Android APK (GitHub Actions)

Berkas alur kerja `build-android-apk.yml` disiapkan untuk melakukan kompilasi otomatis berkas `app-debug.apk` menggunakan runner Ubuntu + Java 17 + Android SDK di GitHub Actions.

### Cara Mengaktifkan di Repositori GitHub:
1. Buka repositori Anda di browser: `https://github.com/Syahidlahmady/Bandanaira.com`.
2. Klik tombol **Add file** -> **Create new file**.
3. Ketikkan nama berkas: `.github/workflows/build-android-apk.yml`.
4. Salin isi berkas dari `ci/workflows/build-android-apk.yml` lalu klik **Commit changes**.
5. GitHub Actions akan otomatis memulai job *Compile Android Debug APK* dan menghasilkan berkas `app-debug.apk` di tab **Actions / Artifacts** yang dapat langsung diunduh ke ponsel.

*(Catatan Teknis: Pemindahan ke folder `ci/workflows/` ini dilakukan karena GitHub secara default membatasi Personal Access Token lokal tanpa cakupan scope `workflow` untuk membuat direktori `.github/workflows/` via git push CLI).*
