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
      'Informasi kuota air reverse osmosis untuk kebutuhan rumah tangga dan kehidupan sehari-hari.',
    action: 'Lihat layanan air',
    actionTab: 'koperasi',
    iconType: 'water',
  },
  {
    title: 'Energi surya',
    description:
      'Kenali layanan dan informasi energi surya sebagai bagian dari ekosistem pulau.',
    action: 'Informasi energi',
    actionTab: 'iot',
    iconType: 'solar',
  },
  {
    title: 'Administrasi NIK',
    description:
      'Akses informasi administrasi kependudukan dan kebutuhan data NIK melalui portal warga.',
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
      className="flex flex-col items-start gap-9 px-6 sm:px-12 lg:px-20 py-20 relative self-stretch w-full flex-[0_0_auto] bg-[#0f2c59]"
    >
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 relative self-stretch w-full flex-[0_0_auto]">
        <div className="max-w-[690px] flex flex-col items-start gap-[18px] relative">
          <div className="inline-flex items-center gap-2.5 relative flex-[0_0_auto]">
            <span
              aria-hidden="true"
              className="w-6 relative h-px bg-[#f4b75e]"
            />
            <span className="mt-[-1.00px] font-semibold text-[#f4b75e] text-[11px] tracking-[1.80px] whitespace-nowrap relative w-fit leading-[normal]">
              PENDUDUK &amp; FASILITAS
            </span>
          </div>
          <h2
            id="resident-services-heading"
            className="font-medium text-white text-[38px] sm:text-[52px] tracking-[-2.00px] leading-[1.12] sm:leading-[58.2px] relative self-stretch"
          >
            Pulau yang indah,
            <br />
            kehidupan yang terlayani.
          </h2>
        </div>

        <div className="flex flex-col max-w-[390px] items-start gap-5 relative">
          <p className="mt-[-1.00px] text-[#c1ced8] text-base leading-7 relative self-stretch font-normal tracking-[0]">
            Ruang digital untuk kebutuhan warga. Akses informasi layanan pulau
            melalui akun penduduk.
          </p>
          <button
            type="button"
            onClick={() => (currentUser ? onNavigate('population') : onOpenLogin())}
            className="bg-amber-600 hover:bg-amber-500 transition-colors inline-flex h-[54px] items-center gap-4 px-6 py-0 relative rounded-lg overflow-hidden border border-solid border-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f4b75e]"
          >
            <span className="font-semibold text-white text-sm tracking-[0] relative w-fit leading-[normal]">
              Masuk portal penduduk
            </span>
            <ArrowUpRightIcon className="w-[18px] h-[18px] text-white" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative self-stretch w-full flex-[0_0_auto]">
        {services.map((service) => (
          <article
            key={service.title}
            className="flex flex-col items-start justify-between gap-[21px] p-[30px] relative flex-1 self-stretch grow bg-[#ffffff12] rounded-2xl overflow-hidden border border-solid border-[#ffffff38]"
          >
            <div className="flex flex-col items-start gap-[21px] w-full">
              <div className="flex w-12 h-12 items-center justify-center relative bg-[#f4b75e14] rounded-[10px] text-[#f4b75e]">
                {service.iconType === 'water' && (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                  </svg>
                )}
                {service.iconType === 'solar' && (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
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
              <h3 className="relative self-stretch font-medium text-white text-[22px] tracking-[0] leading-[normal]">
                {service.title}
              </h3>
              <p className="relative self-stretch font-normal text-[#c1ced8] text-sm tracking-[0] leading-[24.5px]">
                {service.description}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigate(service.actionTab)}
              className="flex items-center justify-between pt-3 pb-0 px-0 relative self-stretch w-full flex-[0_0_auto] text-[#f4b75e] hover:text-white transition-colors"
            >
              <span className="relative w-fit mt-[-1.00px] font-semibold text-xs tracking-[0] leading-[normal]">
                {service.action}
              </span>
              <ArrowUpRightIcon className="w-[17px] h-[17px]" />
            </button>
          </article>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 self-stretch w-full relative flex-[0_0_auto]">
        <p className="relative w-fit mt-[-0.50px] font-normal text-[#c1ced8] text-xs tracking-[0] leading-[normal]">
          Akses sesuai peran: penduduk, mitra homestay, dan operator.
        </p>
        <div
          id="portal-penduduk"
          className="inline-flex items-center gap-2 relative flex-[0_0_auto]"
        >
          <span aria-hidden="true" className="text-[#f4b75e] text-xs">
          </span>
          <p className="relative w-fit mt-[-1.00px] font-normal text-[#c1ced8] text-[11px] tracking-[0] leading-[normal] whitespace-nowrap">
            Layanan personal melalui akun Anda
          </p>
        </div>
      </div>
    </section>
  )
}

export default EcosystemFeaturesSection
