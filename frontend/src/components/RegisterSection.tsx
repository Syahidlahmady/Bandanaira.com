import React, { FormEvent, useState } from 'react'
import pelabuhanBandaNeiraDanGunungBandaApi from '../assets/image.webp'
import { authService } from '../services/auth'

export interface RegisterSectionProps {
  onBackToHome?: () => void
  onSwitchToLogin?: () => void
  onQuickLogin?: (username: string, password: string) => Promise<void> | void
  onNavigate?: (
    tab:
      | 'landing'
      | 'population'
      | 'letters'
      | 'farming'
      | 'traceability'
      | 'koperasi'
      | 'iot'
      | 'tourism'
      | 'gis'
      | 'audit'
      | 'smart_planner'
      | 'survei'
  ) => void
}

type RoleOption = {
  title: string
  description: string
  iconType: 'warga' | 'mitra' | 'wisatawan' | 'petani' | 'koperasi' | 'petugas'
  roleCode: string
  demoUsername: string
  demoPassword: string
  defaultNik: string
  targetTab:
    | 'population'
    | 'letters'
    | 'farming'
    | 'traceability'
    | 'koperasi'
    | 'iot'
    | 'tourism'
    | 'gis'
    | 'audit'
    | 'smart_planner'
    | 'survei'
}

type FieldConfig = {
  id: 'name' | 'nik' | 'whatsapp'
  label: string
  placeholder: string
  iconType: 'user' | 'nik' | 'whatsapp'
  type: string
  helper?: string
  inputMode?: 'text' | 'numeric' | 'tel'
  maxLength?: number
}

const roles: RoleOption[] = [
  {
    title: 'Warga Desa',
    description: 'Layanan warga',
    iconType: 'warga',
    roleCode: 'resident',
    demoUsername: 'warga',
    demoPassword: 'Warga123!',
    defaultNik: '8171010101900001',
    targetTab: 'letters',
  },
  {
    title: 'Mitra Usaha',
    description: 'Usaha & Eco-Stay',
    iconType: 'mitra',
    roleCode: 'homestay_operator',
    demoUsername: 'operator_homestay',
    demoPassword: 'Homestay123!',
    defaultNik: '8171010101900002',
    targetTab: 'tourism',
  },
  {
    title: 'Wisatawan',
    description: 'Jelajahi pulau',
    iconType: 'wisatawan',
    roleCode: 'smart_tourism_admin',
    demoUsername: 'admin_wisata',
    demoPassword: 'Wisata123!',
    defaultNik: '8171010101900003',
    targetTab: 'tourism',
  },
  {
    title: 'Petani Rempah',
    description: 'Kebun & panen pala',
    iconType: 'petani',
    roleCode: 'farmer',
    demoUsername: 'petani',
    demoPassword: 'Petani123!',
    defaultNik: '8171010101900004',
    targetTab: 'traceability',
  },
  {
    title: 'Kelompok Tani',
    description: 'Poktan & pemetaan',
    iconType: 'petani',
    roleCode: 'farmer_group_admin',
    demoUsername: 'ketua_kelompok',
    demoPassword: 'Ketua123!',
    defaultNik: '8171010101900005',
    targetTab: 'farming',
  },
  {
    title: 'Koperasi Hatta',
    description: 'Kasir & air RO',
    iconType: 'koperasi',
    roleCode: 'coop_manager',
    demoUsername: 'pengelola_koperasi',
    demoPassword: 'Koperasi123!',
    defaultNik: '8171010101900006',
    targetTab: 'koperasi',
  },
  {
    title: 'Petugas Desa',
    description: 'Pemerintahan desa',
    iconType: 'petugas',
    roleCode: 'village_officer',
    demoUsername: 'petugas',
    demoPassword: 'Petugas123!',
    defaultNik: '8171010101900007',
    targetTab: 'population',
  },
  {
    title: 'Surveyor & IoT',
    description: 'Survei & telemetri',
    iconType: 'wisatawan',
    roleCode: 'field_surveyor',
    demoUsername: 'surveyor',
    demoPassword: 'Surveyor123!',
    defaultNik: '8171010101900008',
    targetTab: 'survei',
  },
  {
    title: 'Administrator',
    description: 'Pengelola sistem',
    iconType: 'petugas',
    roleCode: 'admin',
    demoUsername: 'admin',
    demoPassword: 'Admin123!',
    defaultNik: '8171010101900009',
    targetTab: 'population',
  },
]

const trustItems = [
  { label: 'Enkripsi AES-256', iconType: 'encryption' as const },
  { label: 'Terhubung Blockchain Koperasi', iconType: 'blockchain' as const },
  { label: 'Pemdes Banda', iconType: 'pemdes' as const },
]

/* ============================================================================
   Inline SVG Icons matching desainsaatini/register-dekstop/ vectors
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

const RoleIconSvg = ({
  type,
  selected,
}: {
  type: RoleOption['iconType']
  selected: boolean
}) => {
  const strokeColor = selected ? '#0f2c59' : '#627085'
  if (type === 'warga') {
    return (
      <svg
        className="w-[19px] h-[19px]"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M3 8.5L10 3L17 8.5V16.5C17 17.05 16.55 17.5 16 17.5H4C3.45 17.5 3 17.05 3 16.5V8.5Z"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M7.5 17.5V11.5H12.5V17.5"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
  if (type === 'mitra' || type === 'koperasi') {
    return (
      <svg
        className="w-[19px] h-[19px]"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M3.5 7.5H16.5L15.5 16.5H4.5L3.5 7.5Z"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M7 7.5V5.5C7 4.12 8.12 3 9.5 3H10.5C11.88 3 13 4.12 13 5.5V7.5"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    )
  }
  if (type === 'petani') {
    return (
      <svg
        className="w-[19px] h-[19px]"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M10 17V9M10 9C10 5.5 13 3.5 16 3.5C16 6.5 14 9 10 9ZM10 11C10 8 7.5 6 4 6C4 9 6.5 11 10 11Z"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
  if (type === 'petugas') {
    return (
      <svg
        className="w-[19px] h-[19px]"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M10 2.5L4 5V9.5C4 13.5 6.55 17.2 10 18.3C13.45 17.2 16 13.5 16 9.5V5L10 2.5Z"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
  return (
    <svg
      className="w-[19px] h-[19px]"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle
        cx="10"
        cy="10"
        r="7.2"
        stroke={strokeColor}
        strokeWidth="1.5"
      />
      <polygon
        points="8.2,8.2 13.2,6.8 11.8,11.8 6.8,13.2"
        stroke={strokeColor}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const RadioIndicatorSvg = ({ selected }: { selected: boolean }) => (
  <svg
    className="w-3.5 h-3.5"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <circle
      cx="8"
      cy="8"
      r="6.5"
      stroke={selected ? '#0f2c59' : '#cbd5e1'}
      strokeWidth="1.5"
      fill={selected ? '#0f2c59' : 'none'}
    />
    {selected && <circle cx="8" cy="8" r="2.5" fill="#ffffff" />}
  </svg>
)

const FieldIconSvg = ({ type }: { type: 'user' | 'nik' | 'whatsapp' | 'pin' }) => {
  if (type === 'user') {
    return (
      <svg
        className="w-[19px] h-[19px] text-[#627085]"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="10" cy="6.8" r="3.2" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M4.2 16.5C4.2 13.6 6.8 11.5 10 11.5C13.2 11.5 15.8 13.6 15.8 16.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    )
  }
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
  if (type === 'whatsapp') {
    return (
      <svg
        className="w-[19px] h-[19px] text-[#627085]"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M15.8 13.2C14.8 13.2 13.85 13.05 13 12.75C12.7 12.65 12.35 12.72 12.12 12.95L10.7 14.37C8.45 13.22 6.75 11.52 5.6 9.27L7.02 7.85C7.25 7.62 7.32 7.27 7.22 6.97C6.92 6.12 6.77 5.17 6.77 4.17C6.77 3.62 6.32 3.17 5.77 3.17H3.8C3.25 3.17 2.8 3.62 2.8 4.17C2.8 11.24 8.53 16.97 15.6 16.97C16.15 16.97 16.6 16.52 16.6 15.97V14C16.6 13.45 16.35 13.2 15.8 13.2Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
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
   1. IslandLifeIntroSection (Left Panel from desainsaatini/register-dekstop)
============================================================================ */

export const IslandLifeIntroSection: React.FC<{
  onBackToHome?: () => void
}> = ({ onBackToHome }) => {
  return (
    <section
      className="flex flex-col w-full lg:w-[48%] xl:w-[720px] min-h-[520px] lg:min-h-[1024px] items-start justify-between pt-10 lg:pt-12 pb-8 lg:pb-[42px] px-7 sm:px-12 lg:px-14 relative self-stretch bg-[#0f2c59] overflow-hidden shrink-0"
      aria-labelledby="island-life-heading"
    >
      <img
        className="absolute w-full h-full top-0 left-0 object-cover"
        alt="Pelabuhan Banda Neira dan Gunung Banda Api"
        src={pelabuhanBandaNeiraDanGunungBandaApi}
      />
      <div
        className="absolute w-full h-full top-0 left-0 bg-[linear-gradient(0deg,rgba(15,44,89,0.44)_0%,rgba(15,44,89,0.13)_35%,rgba(15,44,89,0.8)_70%,rgba(15,44,89,0.98)_100%)]"
        aria-hidden="true"
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
          <div className="relative w-7 h-px bg-amber-600" aria-hidden="true" />
          <div className="relative w-fit mt-[-1.00px] font-normal text-white text-[11px] tracking-[2.00px] leading-[normal] whitespace-nowrap">
            KEPULAUAN BANDA · MALUKU
          </div>
        </div>
        <h1
          id="island-life-heading"
          className="relative self-stretch font-medium text-white text-[34px] sm:text-[42px] xl:text-[47px] tracking-[-1.90px] leading-[1.14] xl:leading-[52.6px]"
        >
          Lebih dekat dengan kehidupan pulau.
        </h1>
        <p className="relative self-stretch font-normal text-[#dbe5f0] text-base tracking-[0] leading-[27.2px]">
          Bergabung sebagai warga, mitra usaha, atau wisatawan. Satu akun untuk
          terhubung dengan layanan dan kehidupan Banda.
        </p>
        <p className="relative w-fit font-serif font-normal italic text-white text-[30px] sm:text-[34px] tracking-[0] leading-[normal]">
          Bertumbuh bersama Banda.
        </p>
      </div>

      <footer className="gap-5 flex flex-col items-start relative z-10 self-stretch w-full flex-[0_0_auto]">
        <div className="relative self-stretch w-full h-px bg-[#ffffff30]" />
        <div className="flex items-start gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
          <ShieldSecuritySvg />
          <p className="flex-1 mt-[-1.00px] text-[#dbe5f0] text-xs leading-[19.8px] relative font-normal tracking-[0]">
            Data kependudukan dilindungi standar keamanan enkripsi berlapis
            AES-256 &amp; HMAC.
          </p>
        </div>
      </footer>
    </section>
  )
}

/* ============================================================================
   2. AccountRegistrationSection (Right Panel from desainsaatini/register-dekstop)
============================================================================ */

export const AccountRegistrationSection: React.FC<RegisterSectionProps> = ({
  onBackToHome,
  onSwitchToLogin,
  onQuickLogin,
  onNavigate,
}) => {
  const [selectedRole, setSelectedRole] = useState<string>('Warga Desa')
  const [formValues, setFormValues] = useState({
    name: '',
    nik: '',
    whatsapp: '',
    pin: '',
  })
  const [showPin, setShowPin] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const fields: FieldConfig[] = [
    {
      id: 'name',
      label: 'Nama lengkap',
      placeholder: 'Nama sesuai KTP',
      iconType: 'user',
      type: 'text',
    },
    {
      id: 'nik',
      label: 'Nomor Induk Kependudukan (NIK)',
      placeholder: 'XXXX-XXXX-XXXX-XXXX',
      iconType: 'nik',
      type: 'text',
      inputMode: 'numeric',
      maxLength: 16,
      helper: '16 digit NIK sesuai KTP (digunakan untuk masuk tanpa perlu memilih peran lagi).',
    },
    {
      id: 'whatsapp',
      label: 'Nomor WhatsApp',
      placeholder: '08xx-xxxx-xxxx',
      iconType: 'whatsapp',
      type: 'tel',
      inputMode: 'tel',
      helper: 'Gunakan nomor aktif yang dapat dihubungi.',
    },
  ]

  const updateField = (id: string, value: string) => {
    setFormValues((current) => ({ ...current, [id]: value }))
  }

  const activeRoleObj =
    roles.find((r) => r.title === selectedRole) || roles[0]

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)

    const effectiveNik = formValues.nik.trim() || activeRoleObj.defaultNik
    const effectivePin = formValues.pin.trim() || '1234'
    const effectiveName =
      formValues.name.trim() || `${selectedRole} Banda Neira`

    // Simpan akun beserta peran yang dipilih saat pendaftaran
    authService.registerAccount({
      name: effectiveName,
      nik: effectiveNik,
      whatsapp: formValues.whatsapp.trim(),
      pin: effectivePin,
      roleTitle: activeRoleObj.title,
      roleCode: activeRoleObj.roleCode,
      demoUsername: activeRoleObj.demoUsername,
      demoPassword: activeRoleObj.demoPassword,
    })

    if (onQuickLogin) {
      setSubmitting(true)
      try {
        await onQuickLogin(effectiveNik, effectivePin)
        if (onNavigate) {
          onNavigate(activeRoleObj.targetTab)
        }
      } finally {
        setSubmitting(false)
      }
    }
  }

  return (
    <div className="flex flex-col flex-1 w-full lg:max-w-[720px] min-h-[1024px] items-start gap-[22px] px-6 sm:px-12 lg:px-[100px] py-[30px] relative bg-white">
      <button
        type="button"
        onClick={onBackToHome}
        className="inline-flex h-11 items-center relative bg-transparent border-0 p-0 hover:opacity-80 cursor-pointer"
        aria-label="Kembali ke Beranda"
      >
        <span className="relative w-fit font-medium text-[#0f2c59] text-[13px] tracking-[0] leading-[normal]">
          ← Kembali ke Beranda
        </span>
      </button>

      <header className="flex flex-col items-start gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
        <p className="relative w-fit mt-[-1.00px] font-semibold text-amber-600 text-[10px] tracking-[1.70px] leading-[normal] whitespace-nowrap">
          PORTAL WARGA &amp; EKOSISTEM BANDA
        </p>
        <h1 className="relative self-stretch font-semibold text-[#0f2c59] text-[30px] sm:text-[34px] tracking-[-1.10px] leading-[40.1px]">
          Mulai dengan akun Anda
        </h1>
        <p className="relative self-stretch font-normal text-[#627085] text-sm tracking-[0] leading-[22.4px]">
          Daftar untuk mengakses layanan sesuai peran Anda. Peran yang Anda
          pilih akan melekat otomatis pada akun saat login.
        </p>
      </header>

      <section
        className="flex flex-col items-start gap-2.5 relative self-stretch w-full flex-[0_0_auto]"
        aria-labelledby="role-heading"
      >
        <h2
          id="role-heading"
          className="w-fit mt-[-1.00px] font-semibold text-[#24364f] text-[13px] leading-[normal] relative tracking-[0]"
        >
          Saya mendaftar sebagai
        </h2>
        <div className="grid grid-cols-3 gap-2 relative self-stretch w-full flex-[0_0_auto]">
          {roles.map((role) => {
            const isSelected = selectedRole === role.title
            return (
              <button
                key={role.title}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelectedRole(role.title)}
                className={`flex flex-col items-center gap-[6px] px-2.5 py-3 relative flex-1 grow rounded-lg overflow-hidden transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#eff3f9] border-[1.5px] border-solid border-[#0f2c59] shadow-sm'
                    : 'bg-white border border-solid border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between relative self-stretch w-full flex-[0_0_auto]">
                  <RoleIconSvg type={role.iconType} selected={isSelected} />
                  <RadioIndicatorSvg selected={isSelected} />
                </div>
                <span className="relative w-fit font-semibold text-[#0f2c59] text-xs tracking-[0] leading-[normal] text-center">
                  {role.title}
                </span>
                <span className="relative w-fit font-normal text-[#627085] text-[10px] tracking-[0] leading-[normal] whitespace-nowrap">
                  {role.description}
                </span>
              </button>
            )
          })}
        </div>
        <p className="self-stretch text-[#627085] text-[11px] leading-[17.6px] relative font-normal tracking-[0]">
          Peran dipilih satu kali saat pendaftaran dan tersimpan otomatis pada
          NIK Anda.
        </p>
      </section>

      <form
        className="flex flex-col items-start gap-[18px] relative self-stretch w-full flex-[0_0_auto]"
        onSubmit={handleSubmit}
        noValidate
      >
        {fields.map((field) => (
          <div
            key={field.id}
            className="flex flex-col items-start gap-2 relative self-stretch w-full flex-[0_0_auto]"
          >
            <label
              htmlFor={field.id}
              className="relative self-stretch mt-[-1.00px] font-semibold text-[#24364f] text-[13px] tracking-[0] leading-[19.5px]"
            >
              {field.label}
            </label>
            <div className="flex h-[54px] items-center gap-3 px-4 py-0 relative self-stretch w-full bg-slate-50 rounded-lg overflow-hidden border border-solid border-slate-200 focus-within:border-[#0f2c59] focus-within:bg-white transition-colors">
              <FieldIconSvg type={field.iconType} />
              <input
                id={field.id}
                name={field.id}
                type={field.type}
                value={formValues[field.id]}
                onChange={(event) =>
                  updateField(
                    field.id,
                    field.id === 'nik'
                      ? event.target.value.replace(/\D/g, '')
                      : event.target.value
                  )
                }
                placeholder={field.placeholder}
                inputMode={field.inputMode}
                maxLength={field.maxLength}
                required
                className={`relative flex-1 min-w-0 bg-transparent border-0 outline-none placeholder:text-[#627085] font-normal text-[#0f2c59] ${
                  field.id === 'nik'
                    ? 'text-lg tracking-[1.10px]'
                    : 'text-sm tracking-[0]'
                } leading-[normal]`}
              />
            </div>
            {field.helper && (
              <p className="relative self-stretch font-normal text-[#627085] text-xs tracking-[0] leading-[19.2px]">
                {field.helper}
              </p>
            )}
          </div>
        ))}

        <div className="flex flex-col items-start gap-2 relative self-stretch w-full flex-[0_0_auto]">
          <label
            htmlFor="pin"
            className="relative self-stretch mt-[-1.00px] font-semibold text-[#24364f] text-[13px] tracking-[0] leading-[19.5px]"
          >
            Buat PIN Pengaman (4 Digit)
          </label>
          <div className="flex h-[54px] items-center gap-3 px-4 py-0 relative self-stretch w-full bg-slate-50 rounded-lg overflow-hidden border border-solid border-slate-200 focus-within:border-[#0f2c59] focus-within:bg-white transition-colors">
            <FieldIconSvg type="pin" />
            <input
              id="pin"
              name="pin"
              type={showPin ? 'text' : 'password'}
              value={formValues.pin}
              onChange={(event) =>
                updateField('pin', event.target.value.replace(/\D/g, ''))
              }
              placeholder="• • • •"
              inputMode="numeric"
              maxLength={4}
              pattern="[0-9]{4}"
              required
              className="relative flex-1 min-w-0 bg-transparent border-0 outline-none placeholder:text-[#627085] font-normal text-[#0f2c59] text-lg tracking-[1.10px] leading-[normal]"
            />
            <button
              type="button"
              onClick={() => setShowPin((visible) => !visible)}
              aria-label={showPin ? 'Sembunyikan PIN' : 'Tampilkan PIN'}
              className="relative w-[28px] h-[28px] flex items-center justify-center bg-transparent border-0 p-0 hover:opacity-80 cursor-pointer"
            >
              <EyeToggleSvg visible={showPin} />
            </button>
          </div>
          <p className="relative self-stretch font-normal text-[#627085] text-xs tracking-[0] leading-[19.2px]">
            Simpan PIN Anda dan jangan bagikan kepada siapa pun.
          </p>
        </div>

        <label className="flex items-start gap-2.5 px-0 py-1 relative self-stretch w-full flex-[0_0_auto] cursor-pointer">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(event) => setTermsAccepted(event.target.checked)}
            required
            className="relative mt-0.5 w-5 h-5 accent-[#0f2c59] cursor-pointer"
          />
          <span className="relative flex-1 mt-[-1.00px] font-normal text-[#627085] text-xs tracking-[0] leading-[20.4px]">
            Saya menyetujui{' '}
            <strong className="font-semibold text-[#0f2c59]">
              Syarat &amp; Ketentuan
            </strong>{' '}
            serta{' '}
            <strong className="font-semibold text-[#0f2c59]">
              Kebijakan Privasi
            </strong>{' '}
            bandanaira.com.
          </span>
        </label>

        <button
          type="submit"
          className="flex h-[54px] items-center justify-center gap-3 px-5 py-0 relative self-stretch w-full bg-amber-600 hover:bg-amber-700 rounded-lg overflow-hidden disabled:opacity-60 transition-colors cursor-pointer"
          disabled={!termsAccepted || submitting}
        >
          <span className="w-fit font-bold text-white text-[17px] sm:text-[19px] leading-[normal] relative tracking-[0]">
            {submitting
              ? 'Memproses Pendaftaran...'
              : `Daftar sebagai ${selectedRole}`}
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

        {submitted && (
          <div
            role="status"
            className="self-stretch rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-[#0f2c59] text-xs font-medium"
          >
            ✓ Pendaftaran sebagai <strong>{selectedRole}</strong> berhasil
            diproses! Mengarahkan Anda ke layanan ekosistem Banda...
          </div>
        )}
      </form>

      <p className="relative self-stretch h-11 flex items-center justify-center gap-1.5 font-normal text-center text-[13px] tracking-[0] leading-[22.1px]">
        <span className="text-[#627085]">Sudah punya akun? </span>
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-semibold text-[#0f2c59] hover:underline bg-transparent border-0 p-0 cursor-pointer"
        >
          Masuk sekarang
        </button>
      </p>

      <section className="gap-4 pt-[22px] pb-0 px-0 border-t border-solid border-slate-200 flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
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
      </section>

      <footer className="flex flex-col items-center gap-3 relative self-stretch w-full flex-[0_0_auto]">
        <nav
          className="inline-flex h-11 items-center gap-5 relative"
          aria-label="Tautan bantuan"
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
    </div>
  )
}

/* ============================================================================
   3. RegisterSection (Main Split-Screen Desktop & Mobile Container)
============================================================================ */

export const RegisterSection: React.FC<RegisterSectionProps> = (props) => {
  return (
    <main className="flex min-h-screen w-full flex-col bg-white lg:flex-row">
      <IslandLifeIntroSection onBackToHome={props.onBackToHome} />
      <AccountRegistrationSection {...props} />
    </main>
  )
}

export default RegisterSection
