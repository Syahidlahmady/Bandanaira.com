import React, { FormEvent, useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react'
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
  onBackToHome?: () => void
  loading: boolean
  error: string | null
}

const trustItems = [
  { label: 'Enkripsi AES-256', iconType: 'encryption' as const },
  { label: 'Blockchain Koperasi', iconType: 'blockchain' as const },
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
        className="w-[19px] h-[19px] text-[#627085] shrink-0"
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
      className="w-[19px] h-[19px] text-[#627085] shrink-0"
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
        className="w-4 sm:w-5 h-4 sm:h-5 text-[#0f2c59] shrink-0"
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
        className="w-4 sm:w-5 h-4 sm:h-5 text-[#0f2c59] shrink-0"
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
      className="w-4 sm:w-5 h-4 sm:h-5 text-[#0f2c59] shrink-0"
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
   1. Left Panel: BandaServicesIntroSection (Desktop Split View Only)
============================================================================ */

export const BandaServicesIntroSection: React.FC<{
  onBackToHome?: () => void
}> = ({ onBackToHome }) => {
  return (
    <section
      aria-label="Layanan Kepulauan Banda"
      className="hidden lg:flex flex-col w-full lg:w-[46%] xl:w-[680px] min-h-screen items-start justify-between pt-10 lg:pt-12 pb-8 lg:pb-[42px] px-8 sm:px-12 lg:px-14 relative self-stretch bg-[#0f2c59] overflow-hidden shrink-0"
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
        className="inline-flex items-center gap-2.5 relative z-10 flex-[0_0_auto] cursor-pointer hover:opacity-90 transition-opacity"
      >
        <NutmegAndWavesSvg />
        <div className="relative w-fit font-normal text-white text-[25px] tracking-[-0.90px] leading-[normal] whitespace-nowrap">
          bandanaira.com
        </div>
      </header>

      <div className="flex flex-col items-start gap-6 py-12 lg:pt-[140px] lg:pb-0 px-0 relative z-10 self-stretch w-full flex-[0_0_auto]">
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
   2. Right Panel: AccountLoginSection (Unified Login with Mobile Optimization)
============================================================================ */

export const AccountLoginSection: React.FC<LoginSectionProps> = ({
  setUsername,
  setPassword,
  onLogin,
  onQuickLogin,
  onBackToHome,
  loading,
  error,
}) => {
  const [isSpecialAccess, setIsSpecialAccess] = useState(false)
  const [identifier, setIdentifier] = useState('8171010101900001')
  const [pin, setPin] = useState('123456')
  const [showPin, setShowPin] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const [detectedAccount, setDetectedAccount] = useState<{
    name: string
    roleTitle: string
    roleCode: string
    isFarmer?: boolean
  } | null>(() => {
    const initMatch = authService.findAccountByIdentifier('8171010101900001')
    return initMatch
      ? {
          name: initMatch.name,
          roleTitle: initMatch.roleTitle,
          roleCode: initMatch.roleCode,
          isFarmer: initMatch.roleCode === 'farmer',
        }
      : null
  })

  // Deteksi akun dinamis dari database (termasuk warga yang menjadi petani)
  useEffect(() => {
    let isCancelled = false
    const cleanId = identifier.trim()

    if (!cleanId) {
      setDetectedAccount(null)
      return
    }

    // 1. Cek instan dari cache / alias lokal
    const localMatch = authService.findAccountByIdentifier(cleanId)
    if (localMatch) {
      setDetectedAccount({
        name: localMatch.name,
        roleTitle: localMatch.roleTitle,
        roleCode: localMatch.roleCode,
        isFarmer: localMatch.roleCode === 'farmer',
      })
    }

    // 2. Debounce query ke API endpoint /api/v1/auth/identify-account
    const timer = setTimeout(async () => {
      try {
        const info = await authService.identifyAccount(cleanId)
        if (!isCancelled && info.found && info.name) {
          setDetectedAccount({
            name: info.name,
            roleTitle: info.role_title || 'Warga Terdaftar',
            roleCode: info.primary_role || 'resident',
            isFarmer: info.is_farmer,
          })
        } else if (!isCancelled && !localMatch) {
          setDetectedAccount(null)
        }
      } catch {
        // Abaikan error jaringan
      }
    }, 250)

    return () => {
      isCancelled = true
      clearTimeout(timer)
    }
  }, [identifier])

  const handleToggleMode = () => {
    const nextMode = !isSpecialAccess
    setIsSpecialAccess(nextMode)
    setValidationError(null)
    if (nextMode) {
      // Mode Akses Khusus
      setIdentifier('operator_homestay')
      setPin('Homestay123!')
    } else {
      // Mode NIK Warga
      setIdentifier('8171010101900001')
      setPin('123456')
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setValidationError(null)
    const cleanId = identifier.trim()
    const cleanPin = pin.trim()

    if (!isSpecialAccess) {
      // Strict NIK 16 digit validation
      if (!/^\d{16}$/.test(cleanId)) {
        setValidationError('NIK wajib berupa tepat 16 digit angka tertera di KTP.')
        return
      }
      // Strict PIN 6 digit validation
      if (!/^\d{6}$/.test(cleanPin)) {
        setValidationError('PIN pengaman warga wajib berupa 6 digit angka.')
        return
      }
    } else {
      if (!cleanId || !cleanPin) {
        setValidationError('Username / ID Akun dan kata sandi wajib diisi.')
        return
      }
    }

    setUsername(cleanId)
    setPassword(cleanPin)

    if (onQuickLogin) {
      onQuickLogin(cleanId, cleanPin)
    } else {
      onLogin(event)
    }
  }

  return (
    <main className="flex flex-col flex-1 w-full lg:max-w-[720px] min-h-screen justify-between pt-5 sm:pt-9 pb-8 px-4 sm:px-10 lg:px-[80px] xl:px-[100px] relative bg-white">
      {/* Desktop Top Back Button */}
      <div className="hidden lg:flex items-center justify-between w-full">
        <button
          type="button"
          onClick={onBackToHome}
          className="inline-flex h-10 items-center gap-1.5 font-medium text-[#0f2c59] text-[13px] hover:opacity-80 transition-opacity cursor-pointer"
          aria-label="Kembali ke Beranda"
        >
          <ArrowLeft size={16} />
          <span>Kembali ke Beranda</span>
        </button>

        <button
          type="button"
          onClick={handleToggleMode}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            isSpecialAccess
              ? 'bg-amber-100 text-amber-800 border border-amber-300'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
          }`}
        >
          <span>{isSpecialAccess ? '👤 Beralih ke Login NIK Warga' : '🏨 Akses Mitra Pariwisata'}</span>
        </button>
      </div>

      <div className="flex flex-col items-start gap-5 sm:gap-7 px-0 py-2 sm:py-6 relative self-stretch w-full flex-1">
        {/* Header Title */}
        <header className="flex flex-col items-start gap-1.5 sm:gap-2.5 relative self-stretch w-full">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isSpecialAccess ? 'bg-sky-500' : 'bg-amber-500'} animate-pulse`} />
              <p className={`font-semibold ${isSpecialAccess ? 'text-sky-600' : 'text-amber-600'} text-[10px] sm:text-[11px] tracking-[1.5px] uppercase`}>
                {isSpecialAccess ? 'PORTAL MITRA PARIWISATA' : 'PORTAL WARGA & EKOSISTEM BANDA'}
              </p>
            </div>

            {/* Mobile Mode Switch Button */}
            <button
              type="button"
              onClick={handleToggleMode}
              className="lg:hidden text-[11px] font-bold text-amber-700 underline"
            >
              {isSpecialAccess ? 'Mode Warga' : 'Mitra Wisata'}
            </button>
          </div>

          <h1 className="font-bold text-[#0f2c59] text-2xl sm:text-3xl lg:text-[34px] tracking-tight leading-tight">
            {isSpecialAccess ? 'Portal Mitra Pariwisata' : 'Selamat Datang Kembali'}
          </h1>
          <p className="font-normal text-[#627085] text-xs sm:text-sm leading-relaxed">
            {isSpecialAccess
              ? 'Login resmi pengelola homestay, akomodasi eco-stay, dan pemandu wisata dengan ID akun terdaftar.'
              : 'Masukkan 16 digit NIK terdaftar serta 6 digit PIN pengaman Anda. Akses peran diverifikasi otomatis.'}
          </p>
        </header>

        {(error || validationError) && (
          <div className="w-full flex items-center gap-2.5 rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
            <AlertCircle size={18} className="shrink-0" />
            <span>{validationError || error}</span>
          </div>
        )}

        <form
          className="flex flex-col items-start gap-4 sm:gap-5 relative self-stretch w-full"
          onSubmit={handleSubmit}
        >
          {/* NIK / Username Input */}
          <div className="flex flex-col items-start gap-1.5 relative self-stretch w-full">
            <label
              htmlFor="nik"
              className="font-semibold text-[#24364f] text-xs sm:text-[13px] leading-snug"
            >
              {isSpecialAccess ? 'ID Akun / Username Mitra' : 'Nomor Induk Kependudukan (NIK 16 Digit)'}
            </label>
            <div className="flex h-12 sm:h-[54px] items-center gap-3 px-3.5 sm:px-4 relative self-stretch w-full bg-slate-50 rounded-xl overflow-hidden border border-slate-200 focus-within:border-[#0f2c59] focus-within:ring-1 focus-within:ring-[#0f2c59] focus-within:bg-white transition-colors">
              <FieldIconSvg type="nik" />
              <input
                id="nik"
                name="nik"
                type="text"
                inputMode={isSpecialAccess ? 'text' : 'numeric'}
                maxLength={isSpecialAccess ? 50 : 16}
                autoComplete="username"
                value={identifier}
                onChange={(event) => {
                  setValidationError(null)
                  if (!isSpecialAccess) {
                    // Strict numeric filter max 16 digits
                    const digitsOnly = event.target.value.replace(/\D/g, '').slice(0, 16)
                    setIdentifier(digitsOnly)
                  } else {
                    setIdentifier(event.target.value)
                  }
                }}
                placeholder={isSpecialAccess ? 'ID Akun / Username Mitra' : '8171010101900001'}
                aria-describedby="nik-help"
                required
                className="flex-1 min-w-0 bg-transparent border-0 outline-none font-normal text-[#0f2c59] text-base sm:text-lg tracking-normal sm:tracking-[1.10px] placeholder:text-[#627085]"
              />
              {!isSpecialAccess && (
                <span className="text-[11px] font-mono text-slate-400 font-bold">
                  {identifier.length}/16
                </span>
              )}
            </div>
            {detectedAccount ? (
              <p
                id="nik-help"
                className="inline-flex items-center gap-1.5 font-medium text-emerald-700 text-xs leading-snug pt-0.5"
              >
                <CheckCircle2 size={15} className="shrink-0 text-emerald-600" />
                <span>
                  Akun: <strong>{detectedAccount.name}</strong> · Peran: <strong>{detectedAccount.roleTitle}</strong>
                </span>
              </p>
            ) : (
              <p
                id="nik-help"
                className="font-normal text-[#627085] text-[11px] sm:text-xs leading-tight"
              >
                {isSpecialAccess
                  ? 'Gunakan ID akun terdaftar bagi pengelola homestay atau pemandu wisata Banda.'
                  : 'Masukkan 16 digit angka NIK tertera di KTP warga kepulauan Banda.'}
              </p>
            )}
          </div>

          {/* PIN / Password Input */}
          <div className="flex flex-col items-start gap-1.5 relative self-stretch w-full">
            <div className="flex items-center justify-between w-full">
              <label
                htmlFor="pin"
                className="font-semibold text-[#24364f] text-xs sm:text-[13px] leading-snug"
              >
                {isSpecialAccess ? 'Kata Sandi (Password)' : 'PIN Pengaman Warga (6 Digit Angka)'}
              </label>
              <button
                type="button"
                onClick={() =>
                  alert(
                    'Untuk bantuan reset PIN akun warga desa, silakan hubungi operator kantor desa Banda Neira.'
                  )
                }
                className="font-medium text-[#0f2c59] hover:text-amber-600 text-xs transition-colors cursor-pointer"
              >
                Lupa PIN?
              </button>
            </div>
            <div className="flex h-12 sm:h-[54px] items-center gap-3 px-3.5 sm:px-4 relative self-stretch w-full bg-slate-50 rounded-xl overflow-hidden border border-slate-200 focus-within:border-[#0f2c59] focus-within:ring-1 focus-within:ring-[#0f2c59] focus-within:bg-white transition-colors">
              <FieldIconSvg type="pin" />
              <input
                id="pin"
                name="pin"
                type={showPin ? 'text' : 'password'}
                inputMode={isSpecialAccess ? 'text' : 'numeric'}
                maxLength={isSpecialAccess ? 64 : 6}
                autoComplete="current-password"
                value={pin}
                onChange={(event) => {
                  setValidationError(null)
                  if (!isSpecialAccess) {
                    // Strict numeric filter max 6 digits
                    const digitsOnly = event.target.value.replace(/\D/g, '').slice(0, 6)
                    setPin(digitsOnly)
                  } else {
                    setPin(event.target.value)
                  }
                }}
                placeholder={isSpecialAccess ? '••••••••' : '• • • • • •'}
                required
                className="flex-1 min-w-0 bg-transparent border-0 outline-none font-normal text-[#0f2c59] text-base sm:text-lg tracking-wider placeholder:text-[#627085]"
              />
              {!isSpecialAccess && (
                <span className="text-[11px] font-mono text-slate-400 font-bold">
                  {pin.length}/6
                </span>
              )}
              <button
                type="button"
                aria-label={showPin ? 'Sembunyikan' : 'Tampilkan'}
                aria-pressed={showPin}
                onClick={() => setShowPin((visible) => !visible)}
                className="w-11 h-11 -mr-2 flex items-center justify-center shrink-0 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <EyeToggleSvg visible={showPin} />
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="flex h-12 sm:h-[54px] items-center justify-center gap-2.5 px-5 relative self-stretch w-full bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white rounded-xl font-bold text-base sm:text-lg shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer disabled:opacity-60 mt-1"
          >
            <span>{loading ? 'Memverifikasi...' : isSpecialAccess ? 'Masuk Sebagai Mitra' : 'Masuk ke Portal Warga'}</span>
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 text-white shrink-0"
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

        <p className="w-full py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] sm:text-xs text-center text-[#627085] leading-relaxed">
          {isSpecialAccess
            ? 'Akses mitra pariwisata dilindungi audit log keamanan dan pembatasan peran berbasis RBAC.'
            : 'Akun kependudukan terintegrasi NIK diterbitkan secara resmi melalui Kantor Desa dengan PIN 6 digit.'}
        </p>

        {/* Trust Badges */}
        <div className="w-full pt-3 pb-1 border-t border-slate-100">
          <div className="grid grid-cols-3 gap-2 w-full">
            {trustItems.map((item) => (
              <div
                key={item.label}
                className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-slate-50/70 border border-slate-100 text-center"
              >
                <TrustBadgeIconSvg type={item.iconType} />
                <span className="font-medium text-[#475569] text-[10px] sm:text-[11px] leading-tight">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Legal & Info */}
      <footer className="flex flex-col items-center gap-2 pt-4 relative self-stretch w-full border-t border-slate-100">
        <nav
          aria-label="Tautan informasi"
          className="inline-flex items-center gap-5 relative text-xs"
        >
          {['Bantuan', 'Privasi', 'Ketentuan'].map((item) => (
            <button
              key={item}
              type="button"
              className="font-normal text-[#627085] hover:text-[#0f2c59] text-[11px] sm:text-xs transition-colors bg-transparent border-0 p-0 cursor-pointer"
            >
              {item}
            </button>
          ))}
        </nav>
        <p className="font-normal text-[#94a3b8] text-[10px] sm:text-[11px]">
          © 2026 bandanaira.com · Kepulauan Banda
        </p>
      </footer>
    </main>
  )
}

/* ============================================================================
   3. Main Container: Responsive Split Screen with Mobile Header Banner
============================================================================ */

export const LoginSection: React.FC<LoginSectionProps> = (props) => {
  return (
    <div className="flex min-h-screen w-full flex-col bg-[#081d35] lg:bg-white lg:flex-row">
      {/* Mobile Top Branded Header (Replaces bulky 520px desktop block on smartphone screens) */}
      <div className="lg:hidden relative w-full h-40 sm:h-48 bg-[#081d35] overflow-hidden shrink-0">
        <img
          className="absolute inset-0 w-full h-full object-cover opacity-60"
          alt="Pelabuhan Banda Neira dan Gunung Api"
          src={pelabuhanBandaNeiraDanGunungBandaApi}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-[#081d35]/95 via-[#081d35]/75 to-[#081d35]"
        />
        <div className="relative z-10 flex flex-col justify-between h-full p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={props.onBackToHome}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 text-white text-xs font-medium active:scale-95 transition-all cursor-pointer"
              aria-label="Kembali ke Beranda"
            >
              <ArrowLeft size={14} className="text-[#f4b75e]" />
              <span>Beranda</span>
            </button>

            <div className="inline-flex items-center gap-2">
              <NutmegAndWavesSvg />
              <span className="font-serif font-normal text-white text-base tracking-tight">
                bandanaira.com
              </span>
            </div>
          </div>

          <div className="space-y-0.5 pb-1">
            <div className="inline-flex items-center gap-1.5">
              <span className="w-3.5 h-0.5 bg-[#f4b75e]" />
              <span className="text-[10px] font-bold text-[#f4b75e] tracking-widest uppercase">
                PORTAL EKOSISTEM BANDA
              </span>
            </div>
            <h2 className="text-white font-serif font-bold text-lg sm:text-xl tracking-tight leading-tight">
              Satu Pintu Layanan Kepulauan
            </h2>
          </div>
        </div>
      </div>

      {/* Desktop Left Split Panel */}
      <BandaServicesIntroSection onBackToHome={props.onBackToHome} />

      {/* Form Container (Floats with rounded top corners on Mobile, flat on Desktop) */}
      <div className="flex-1 w-full flex flex-col bg-white -mt-4 lg:mt-0 rounded-t-3xl lg:rounded-none relative z-20 shadow-2xl lg:shadow-none overflow-hidden">
        <AccountLoginSection {...props} />
      </div>
    </div>
  )
}

export default LoginSection
