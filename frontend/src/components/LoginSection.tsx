import React, { FormEvent, useState } from 'react'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import pelabuhanBandaNeiraDanGunungBandaApi from '../assets/image.webp'
import { authService } from '../services/auth'

export interface LoginSectionProps {
  username: string
  setUsername: (u: string) => void
  password: string
  setPassword: (p: string) => void
  onLogin: (e: React.FormEvent) => void
  onQuickLogin?: (u: string, p: string) => void
  onVerifySampleBatch?: (token: string) => void
  onPublicVerify?: (token: string) => void
  onOpenMarketplace?: () => void
  onOpenPlanner?: () => void
  onOpenKoperasi?: () => void
  onOpenTelemetry?: () => void
  onOpenTourism?: () => void
  onOpenGIS?: () => void
  onOpenSurvei?: () => void
  onOpenRegister?: () => void
  onBackToHome?: () => void
  loading: boolean
  error: string | null
}

const trustItems = [
  { label: 'Enkripsi AES-256', iconType: 'encryption' as const },
  { label: 'Terhubung Blockchain Koperasi', iconType: 'blockchain' as const },
  { label: 'Pemdes Banda', iconType: 'pemdes' as const },
]

/* ============================================================================
   Inline SVG Helpers matching desainsaatini/login-desktop
============================================================================ */

const NutmegAndWavesSvg = () => (
  <svg
    className="relative w-[19.16px] h-[23.94px] shrink-0"
    viewBox="0 0 20 25"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M10 1.8C6.2 5.6 3.8 9.9 3.8 13.7C3.8 17.12 6.58 19.9 10 19.9C13.42 19.9 16.2 17.12 16.2 13.7C16.2 9.9 13.8 5.6 10 1.8Z"
      stroke="#F4B75E"
      strokeWidth="1.6"
      fill="rgba(244, 183, 94, 0.18)"
    />
    <path
      d="M10 7C8.4 9.4 7.6 11.5 7.6 13.4C7.6 14.98 8.67 16.25 10 16.25C11.33 16.25 12.4 14.98 12.4 13.4C12.4 11.5 11.6 9.4 10 7Z"
      fill="#F4B75E"
    />
    <path
      d="M1.8 22.4C4.2 21 6.8 21 10 22.4C13.2 23.8 15.8 23.8 18.2 22.4"
      stroke="#F4B75E"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
)

const ShieldSecuritySvg = () => (
  <svg
    className="w-[18px] h-[18px] shrink-0 text-[#f4b75e]"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M10 2.2L3.8 4.9V9.6C3.8 13.85 6.44 17.78 10 18.9C13.56 17.78 16.2 13.85 16.2 9.6V4.9L10 2.2Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7.5 10.2L9.2 11.9L12.8 8.3"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const FieldIconSvg = ({ type }: { type: 'nik' | 'pin' }) => {
  if (type === 'nik') {
    return (
      <svg
        className="w-[19px] h-[19px] text-[#627085]"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect
          x="2.5"
          y="4.5"
          width="15"
          height="11"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <circle cx="6.8" cy="9.5" r="1.6" stroke="currentColor" strokeWidth="1.3" />
        <path
          d="M10.5 8.2H14.8M10.5 11.2H13.5"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    )
  }
  return (
    <svg
      className="w-[19px] h-[19px] text-[#627085]"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect
        x="4.2"
        y="9"
        width="11.6"
        height="8"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M6.8 9V6.5C6.8 4.73 8.23 3.3 10 3.3C11.77 3.3 13.2 4.73 13.2 6.5V9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

const EyeToggleSvg = ({ visible }: { visible: boolean }) => (
  <svg
    className="w-[18px] h-[18px] text-[#627085]"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M2.2 10C3.8 6.4 6.6 4.5 10 4.5C13.4 4.5 16.2 6.4 17.8 10C16.2 13.6 13.4 15.5 10 15.5C6.6 15.5 3.8 13.6 2.2 10Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <circle cx="10" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.5" />
    {visible && (
      <path
        d="M3.5 16.5L16.5 3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    )}
  </svg>
)

const TrustBadgeIconSvg = ({
  type,
}: {
  type: 'encryption' | 'blockchain' | 'pemdes'
}) => {
  if (type === 'encryption') {
    return (
      <svg
        className="w-5 h-5 text-[#0f2c59]"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M10 2.5L4 5V9.5C4 13.5 6.55 17.2 10 18.3C13.45 17.2 16 13.5 16 9.5V5L10 2.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M7.6 10L9.3 11.7L12.6 8.4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
  if (type === 'blockchain') {
    return (
      <svg
        className="w-5 h-5 text-[#0f2c59]"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <polygon
          points="10,2.5 16.5,6.2 16.5,13.8 10,17.5 3.5,13.8 3.5,6.2"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M3.5 6.2L10 10L16.5 6.2M10 10V17.5"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
  return (
    <svg
      className="w-5 h-5 text-[#0f2c59]"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M3 8L10 3.5L17 8H3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M5 8V15M8.3 8V15M11.7 8V15M15 8V15M2.5 16.5H17.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

/* ============================================================================
   1. Left Panel: BandaServicesIntroSection (desainsaatini/login-desktop)
============================================================================ */

export const BandaServicesIntroSection: React.FC<{
  onBackToHome?: () => void
}> = ({ onBackToHome }) => {
  return (
    <section
      aria-label="Layanan Kepulauan Banda"
      className="flex flex-col w-full lg:w-[48%] xl:w-[720px] min-h-[520px] lg:min-h-[1024px] items-start justify-between pt-10 lg:pt-12 pb-8 lg:pb-[42px] px-7 sm:px-12 lg:px-14 relative self-stretch bg-[#0f2c59] overflow-hidden shrink-0"
    >
      <img
        className="absolute w-full h-full top-0 left-0 object-cover"
        alt="Pelabuhan Banda Neira dengan Gunung Banda Api"
        src={pelabuhanBandaNeiraDanGunungBandaApi}
      />
      <div
        aria-hidden="true"
        className="absolute w-full h-full top-0 left-0 bg-[linear-gradient(0deg,rgba(15,44,89,0.44)_0%,rgba(15,44,89,0.13)_35%,rgba(15,44,89,0.8)_70%,rgba(15,44,89,0.98)_100%)]"
      />

      <header
        onClick={onBackToHome}
        className="inline-flex items-center gap-2.5 relative z-10 flex-[0_0_auto] cursor-pointer"
      >
        <NutmegAndWavesSvg />
        <div className="relative w-fit font-normal text-white text-[25px] tracking-[-0.90px] leading-[normal] whitespace-nowrap">
          bandanaira.com
        </div>
      </header>

      <div className="flex flex-col items-start gap-6 py-12 lg:pt-[180px] lg:pb-0 px-0 relative z-10 self-stretch w-full flex-[0_0_auto]">
        <div className="inline-flex items-center gap-2.5 relative flex-[0_0_auto]">
          <div aria-hidden="true" className="relative w-7 h-px bg-amber-600" />
          <p className="relative w-fit mt-[-1.00px] font-normal text-white text-[11px] tracking-[2.00px] leading-[normal] whitespace-nowrap">
            KEPULAUAN BANDA · MALUKU
          </p>
        </div>
        <h1 className="relative self-stretch font-medium text-white text-[34px] sm:text-[42px] xl:text-[47px] tracking-[-1.90px] leading-[1.14] xl:leading-[52.6px]">
          Satu Pintu Layanan Kepulauan Banda
        </h1>
        <p className="relative self-stretch font-normal text-[#dbe5f0] text-base tracking-[0] leading-[27.2px]">
          Akses mudah untuk warga memeriksa saldo koperasi &amp; kuota air,
          kemudahan mitra mengelola homestay, serta layanan wisata cerdas Banda
          Neira.
        </p>
        <p className="relative w-fit font-serif font-normal italic text-white text-[30px] sm:text-[34px] tracking-[0] leading-[normal]">
          Bertumbuh bersama Banda.
        </p>
      </div>

      <footer className="gap-5 flex flex-col items-start relative z-10 self-stretch w-full flex-[0_0_auto]">
        <div
          aria-hidden="true"
          className="relative self-stretch w-full h-px bg-[#ffffff30]"
        />
        <div className="flex items-start gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
          <ShieldSecuritySvg />
          <p className="relative flex-1 mt-[-1.00px] font-normal text-[#dbe5f0] text-xs tracking-[0] leading-[19.8px]">
            Data kependudukan dilindungi standar keamanan enkripsi berlapis
            AES-256 &amp; HMAC.
          </p>
        </div>
      </footer>
    </section>
  )
}

/* ============================================================================
   2. Right Panel: AccountLoginSection (Unified Login Without Role Selection)
============================================================================ */

export const AccountLoginSection: React.FC<LoginSectionProps> = ({
  setUsername,
  setPassword,
  onLogin,
  onQuickLogin,
  onOpenRegister,
  onBackToHome,
  loading,
  error,
}) => {
  const [identifier, setIdentifier] = useState('8171010101900001')
  const [pin, setPin] = useState('1234')
  const [showPin, setShowPin] = useState(false)

  const detectedAccount = identifier.trim()
    ? authService.findAccountByIdentifier(identifier)
    : undefined

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const cleanId = identifier.trim()
    const cleanPin = pin.trim() || '1234'
    setUsername(cleanId)
    setPassword(cleanPin)

    if (onQuickLogin) {
      onQuickLogin(cleanId, cleanPin)
    } else {
      onLogin(event)
    }
  }

  return (
    <main className="flex flex-col flex-1 w-full lg:max-w-[720px] min-h-[1024px] items-start justify-between pt-9 pb-8 px-6 sm:px-12 lg:px-[100px] relative bg-white">
      <button
        type="button"
        onClick={onBackToHome}
        className="inline-flex h-11 items-center relative font-medium text-[#0f2c59] text-[13px] tracking-[0] leading-[normal] bg-transparent border-0 p-0 hover:opacity-80 cursor-pointer"
        aria-label="Kembali ke Beranda"
      >
        <span aria-hidden="true" className="mr-1">
          ←
        </span>
        <span>Kembali ke Beranda</span>
      </button>

      <div className="flex flex-col items-start gap-7 px-0 py-[30px] relative self-stretch w-full flex-[0_0_auto]">
        <header className="flex flex-col items-start gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
          <p className="relative w-fit mt-[-1.00px] font-semibold text-amber-600 text-[10px] tracking-[1.70px] leading-[normal] whitespace-nowrap">
            PORTAL WARGA &amp; EKOSISTEM BANDA
          </p>
          <h1 className="relative self-stretch font-semibold text-[#0f2c59] text-[30px] sm:text-[34px] tracking-[-1.10px] leading-[40.1px]">
            Selamat Datang Kembali
          </h1>
          <p className="relative self-stretch font-normal text-[#627085] text-sm tracking-[0] leading-[22.4px]">
            Masukkan NIK atau ID akun beserta PIN pengaman Anda. Peran layanan
            otomatis menyesuaikan akun yang telah Anda daftarkan.
          </p>
        </header>

        {error && (
          <div className="w-full flex items-center gap-2.5 rounded-lg border border-rose-300 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
            <AlertCircle size={17} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form
          className="flex flex-col items-start gap-[22px] relative self-stretch w-full flex-[0_0_auto]"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col items-start gap-2 relative self-stretch w-full flex-[0_0_auto]">
            <label
              htmlFor="nik"
              className="relative self-stretch mt-[-1.00px] font-semibold text-[#24364f] text-[13px] tracking-[0] leading-[19.5px]"
            >
              16 Digit Nomor Induk Kependudukan (NIK) / ID Akun
            </label>
            <div className="flex h-[54px] items-center gap-3 px-4 py-0 relative self-stretch w-full bg-slate-50 rounded-lg overflow-hidden border border-solid border-slate-200 focus-within:border-[#0f2c59] focus-within:ring-1 focus-within:ring-[#0f2c59] focus-within:bg-white transition-colors">
              <FieldIconSvg type="nik" />
              <input
                id="nik"
                name="nik"
                type="text"
                autoComplete="username"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                placeholder="XXXX-XXXX-XXXX-XXXX"
                aria-describedby="nik-help"
                required
                className="relative flex-1 min-w-0 bg-transparent border-0 outline-none font-normal text-[#0f2c59] text-lg tracking-[1.10px] leading-[normal] placeholder:text-[#627085]"
              />
            </div>
            {detectedAccount ? (
              <p
                id="nik-help"
                className="inline-flex items-center gap-1.5 font-medium text-emerald-700 text-xs tracking-[0] leading-[19.2px]"
              >
                <CheckCircle2 size={14} className="shrink-0" />
                <span>
                  Akun dikenali: <strong>{detectedAccount.name}</strong> · Peran
                  terdaftar: <strong>{detectedAccount.roleTitle}</strong>
                </span>
              </p>
            ) : (
              <p
                id="nik-help"
                className="font-normal text-[#627085] text-xs tracking-[0] leading-[19.2px] relative self-stretch"
              >
                Cukup masukkan 16 digit NIK yang tertera di KTP atau ID akun
                yang Anda daftarkan.
              </p>
            )}
          </div>

          <div className="flex flex-col items-start gap-2 relative self-stretch w-full flex-[0_0_auto]">
            <label
              htmlFor="pin"
              className="relative self-stretch mt-[-1.00px] font-semibold text-[#24364f] text-[13px] tracking-[0] leading-[19.5px]"
            >
              PIN Pengaman (4 Digit)
            </label>
            <div className="flex h-[54px] items-center gap-3 px-4 py-0 relative self-stretch w-full bg-slate-50 rounded-lg overflow-hidden border border-solid border-slate-200 focus-within:border-[#0f2c59] focus-within:ring-1 focus-within:ring-[#0f2c59] focus-within:bg-white transition-colors">
              <FieldIconSvg type="pin" />
              <input
                id="pin"
                name="pin"
                type={showPin ? 'text' : 'password'}
                autoComplete="current-password"
                value={pin}
                onChange={(event) => setPin(event.target.value)}
                placeholder="• • • •"
                required
                className="relative flex-1 min-w-0 bg-transparent border-0 outline-none font-normal text-[#0f2c59] text-lg tracking-[1.10px] leading-[normal] placeholder:text-[#627085]"
              />
              <button
                type="button"
                aria-label={showPin ? 'Sembunyikan PIN' : 'Tampilkan PIN'}
                aria-pressed={showPin}
                onClick={() => setShowPin((visible) => !visible)}
                className="relative w-[28px] h-[28px] flex items-center justify-center shrink-0 bg-transparent border-0 p-0 hover:opacity-80 cursor-pointer"
              >
                <EyeToggleSvg visible={showPin} />
              </button>
            </div>
          </div>

          <div className="flex h-11 items-center justify-end w-full relative self-stretch">
            <button
              type="button"
              onClick={() =>
                alert(
                  'Untuk bantuan reset PIN akun warga desa, silakan hubungi operator kantor desa Banda Neira.'
                )
              }
              className="relative w-fit font-medium text-[#0f2c59] text-xs tracking-[0] leading-[normal] hover:underline bg-transparent border-0 p-0 cursor-pointer"
            >
              Lupa PIN? Hubungi pemdes
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex h-[54px] items-center justify-center gap-3 px-5 py-0 relative self-stretch w-full bg-amber-600 rounded-lg overflow-hidden hover:bg-amber-700 active:bg-amber-800 transition-colors cursor-pointer disabled:opacity-60"
          >
            <span className="w-fit font-bold text-white text-[17px] sm:text-[19px] leading-[normal] relative tracking-[0]">
              {loading ? 'Memverifikasi...' : 'Masuk ke Portal Warga'}
            </span>
            <svg
              className="w-[18px] h-[18px] text-white"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M3.75 9H14.25M14.25 9L9.75 4.5M14.25 9L9.75 13.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </form>

        <p className="relative self-stretch h-11 flex items-center justify-center gap-1.5 font-normal text-[13px] text-center tracking-[0] leading-[22.1px]">
          <span className="text-[#627085]">Belum punya akun? </span>
          <button
            type="button"
            onClick={onOpenRegister}
            className="font-semibold text-[#0f2c59] hover:underline bg-transparent border-0 p-0 cursor-pointer"
          >
            Daftar sekarang
          </button>
        </p>

        <div className="gap-4 pt-[22px] pb-0 px-0 border-t border-solid border-slate-200 flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
          <div className="items-start gap-4 self-stretch w-full flex-[0_0_auto] flex relative">
            {trustItems.map((item) => (
              <div
                key={item.label}
                className="flex-col items-center gap-2 flex-1 grow flex relative"
              >
                <TrustBadgeIconSvg type={item.iconType} />
                <div className="self-stretch font-normal text-[#627085] text-[11px] text-center leading-[16.5px] relative tracking-[0]">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="flex flex-col items-center gap-3 relative self-stretch w-full flex-[0_0_auto]">
        <nav
          aria-label="Tautan informasi"
          className="inline-flex h-11 items-center gap-5 relative"
        >
          {['Bantuan', 'Privasi', 'Ketentuan'].map((item) => (
            <button
              key={item}
              type="button"
              className="relative w-fit font-normal text-[#627085] hover:text-[#0f2c59] text-[11px] tracking-[0] leading-[normal] whitespace-nowrap bg-transparent border-0 p-0 cursor-pointer"
            >
              {item}
            </button>
          ))}
        </nav>
        <p className="relative w-fit font-normal text-[#627085] text-[10px] tracking-[0] leading-[normal] whitespace-nowrap">
          © 2026 bandanaira.com · Kepulauan Banda
        </p>
      </footer>
    </main>
  )
}

/* ============================================================================
   3. Main Container: LoginDesktop Split-Screen Component
============================================================================ */

export const LoginSection: React.FC<LoginSectionProps> = (props) => {
  return (
    <div className="flex min-h-screen w-full flex-col bg-white lg:flex-row">
      <BandaServicesIntroSection onBackToHome={props.onBackToHome} />
      <AccountLoginSection {...props} />
    </div>
  )
}

export default LoginSection
