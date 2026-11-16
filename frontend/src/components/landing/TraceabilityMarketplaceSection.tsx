import React from 'react'
import { ArrowUpRightIcon } from './LandingIcons'

interface UmkmHighlightItem {
  title: string
  description: string
  iconType: 'spice' | 'marine' | 'craft'
}

const UMKM_HIGHLIGHTS: UmkmHighlightItem[] = [
  {
    title: 'Rempah & fuli pala',
    description: 'Biji pala dan fuli pilihan hasil panen petani rakyat dengan catatan asal batch.',
    iconType: 'spice',
  },
  {
    title: 'Ikan asar & hasil laut',
    description: 'Cakalang asap tempurung pala dan ikan segar tangkapan langsung nelayan Banda.',
    iconType: 'marine',
  },
  {
    title: 'Olahan kenari & sirup pala',
    description: 'Sirup buah pala segar dan kue kenari autentik racikan kelompok UMKM pulau.',
    iconType: 'craft',
  },
]

export interface TraceabilityMarketplaceSectionProps {
  onNavigate: (tab: any) => void
  onOpenMarketplace: () => void
  onPublicVerify: (token: string) => void
}

export const TraceabilityMarketplaceSection: React.FC<TraceabilityMarketplaceSectionProps> = ({
  onOpenMarketplace,
  onPublicVerify,
}) => {
  return (
    <section
      id="layanan-umkm"
      aria-labelledby="local-cuisine-heading"
      className="flex flex-col lg:flex-row items-start lg:items-center gap-12 lg:gap-20 px-6 sm:px-12 lg:px-20 py-16 relative self-stretch w-full flex-[0_0_auto] bg-[#f7f5f0]"
    >
      <header className="flex flex-col max-w-[430px] items-start gap-[18px] relative">
        <div className="inline-flex items-center gap-2.5 relative flex-[0_0_auto]">
          <div aria-hidden="true" className="relative w-6 h-px bg-amber-600" />
          <p className="mt-[-1.00px] font-semibold text-amber-600 text-[11px] tracking-[1.80px] whitespace-nowrap relative w-fit leading-[normal]">
            MARKETPLACE UMKM &amp; KOPERASI HATTA
          </p>
        </div>

        <h2
          id="local-cuisine-heading"
          className="relative self-stretch font-medium text-[#0f2c59] text-[28px] sm:text-[31px] tracking-[-1.00px] leading-[38.8px]"
        >
          Rempah dan hasil laut langsung dari warga.
        </h2>

        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={onOpenMarketplace}
            className="inline-flex h-[42px] items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg px-5 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-600"
          >
            <span>Buka Marketplace UMKM</span>
            <ArrowUpRightIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onPublicVerify('BN_VERIFY_PALA_SUPER_2026_LONTHOIR')}
            className="inline-flex h-[42px] items-center gap-2 border border-[#dce1df] bg-white hover:bg-amber-50 text-[#0f2c59] rounded-lg px-4 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0f2c59]"
          >
            <span>Cek QR Batch</span>
          </button>
        </div>
      </header>

      <ul className="grid grid-cols-1 sm:grid-cols-3 gap-[30px] relative flex-1 w-full">
        {UMKM_HIGHLIGHTS.map((item) => (
          <li
            key={item.title}
            className="flex flex-col items-start gap-3.5 relative flex-1 grow"
          >
            <div className="flex w-10 h-10 items-center justify-center rounded-lg bg-amber-600/10 text-amber-600">
              {item.iconType === 'spice' && (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M12 8v8" />
                </svg>
              )}
              {item.iconType === 'marine' && (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M2 12s3.5-5 10-5c4.5 0 7.5 3 10 5-2.5 2-5.5 5-10 5-6.5 0-10-5-10-5z" />
                  <circle cx="15" cy="11" r="1" />
                </svg>
              )}
              {item.iconType === 'craft' && (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              )}
            </div>
            <h3 className="relative self-stretch font-semibold text-[#0f2c59] text-[15px] tracking-[0] leading-[normal]">
              {item.title}
            </h3>
            <p className="relative self-stretch font-normal text-[#63717d] text-[13px] tracking-[0] leading-[21.4px]">
              {item.description}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default TraceabilityMarketplaceSection
