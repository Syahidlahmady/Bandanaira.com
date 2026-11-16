import React from 'react'
import { ArrowUpRightIcon } from './LandingIcons'

export interface ResidentServiceItem {
  title: string
  description: string
  action: string
  actionTab: any
  iconType: 'water' | 'solar' | 'id'
}

export const defaultResidentServices: ResidentServiceItem[] = [
  {
    title: 'Air bersih RO',
    description:
      'Kuota air Reverse Osmosis harian untuk kebutuhan rumah tangga kepulauan.',
    action: 'Lihat layanan air',
    actionTab: 'koperasi',
    iconType: 'water',
  },
  {
    title: 'Energi surya',
    description:
      'Pemantauan layanan listrik surya desa untuk ketahanan fasilitas umum pulau.',
    action: 'Informasi energi',
    actionTab: 'iot',
    iconType: 'solar',
  },
  {
    title: 'Administrasi NIK',
    description:
      'Akses surat domisili, usaha, dan data kependudukan melalui portal warga.',
    action: 'Layanan kependudukan',
    actionTab: 'letters',
    iconType: 'id',
  },
]

export interface EcosystemFeaturesSectionProps {
  onNavigate: (tab: any) => void
  onOpenLogin: () => void
  currentUser: any
  services?: ResidentServiceItem[]
}

export const EcosystemFeaturesSection: React.FC<EcosystemFeaturesSectionProps> = ({
  onNavigate,
  onOpenLogin,
  currentUser,
  services = defaultResidentServices,
}) => {
  return (
    <section
      id="penduduk-fasilitas"
      aria-labelledby="resident-services-heading"
      className="flex flex-col lg:flex-row items-start lg:items-center gap-12 lg:gap-20 px-6 sm:px-12 lg:px-20 py-16 relative self-stretch w-full flex-[0_0_auto] bg-[#0f2c59]"
    >
      <header className="flex flex-col max-w-[430px] items-start gap-[18px] relative">
        <div className="inline-flex items-center gap-2.5 relative flex-[0_0_auto]">
          <div aria-hidden="true" className="relative w-6 h-px bg-[#f4b75e]" />
          <p className="mt-[-1.00px] font-semibold text-[#f4b75e] text-[11px] tracking-[1.80px] whitespace-nowrap relative w-fit leading-[normal]">
            PENDUDUK &amp; FASILITAS
          </p>
        </div>

        <h2
          id="resident-services-heading"
          className="relative self-stretch font-medium text-white text-[28px] sm:text-[31px] tracking-[-1.00px] leading-[38.8px]"
        >
          Pulau yang indah, kehidupan yang terlayani.
        </h2>

        <button
          type="button"
          onClick={() => (currentUser ? onNavigate('dashboard') : onOpenLogin())}
          className="inline-flex h-[42px] items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg px-5 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f4b75e]"
        >
          <span>Masuk portal penduduk</span>
          <ArrowUpRightIcon className="w-4 h-4" />
        </button>
      </header>

      <ul className="grid grid-cols-1 sm:grid-cols-3 gap-[30px] relative flex-1 w-full">
        {services.map((service) => (
          <li
            key={service.title}
            className="flex flex-col items-start gap-3.5 relative flex-1 grow"
          >
            <div className="flex w-10 h-10 items-center justify-center rounded-lg bg-[#f4b75e]/15 text-[#f4b75e]">
              {service.iconType === 'water' && (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                </svg>
              )}
              {service.iconType === 'solar' && (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                </svg>
              )}
              {service.iconType === 'id' && (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <circle cx="9" cy="10" r="2" />
                  <line x1="15" y1="8" x2="17" y2="8" />
                  <line x1="15" y1="12" x2="17" y2="12" />
                  <line x1="7" y1="16" x2="17" y2="16" />
                </svg>
              )}
            </div>
            <h3 className="relative self-stretch font-semibold text-white text-[15px] tracking-[0] leading-[normal]">
              {service.title}
            </h3>
            <p className="relative self-stretch font-normal text-[#c1ced8] text-[13px] tracking-[0] leading-[21.4px]">
              {service.description}
            </p>
            <button
              type="button"
              onClick={() => onNavigate(service.actionTab)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#f4b75e] hover:text-white transition-colors"
            >
              <span>{service.action}</span>
              <ArrowUpRightIcon className="w-3.5 h-3.5" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default EcosystemFeaturesSection
