import React from 'react'
import { NutmegLogoIcon } from './LandingIcons'

export interface FooterLinkItem {
  label: string
  href?: string
  tab?: any
  action?: 'login' | 'register' | 'quicklogin'
}

export interface FooterLinkGroup {
  title: string
  links: FooterLinkItem[]
}

export const defaultFooterLinkGroups: FooterLinkGroup[] = [
  {
    title: 'Jelajahi Banda',
    links: [
      { label: 'Beranda', href: '#beranda' },
      { label: 'Peta', href: '#peta' },
      { label: 'Sejarah', href: '#sejarah' },
      { label: 'Wisata', href: '#wisata' },
    ],
  },
  {
    title: 'Layanan & Wisata',
    links: [
      { label: 'Penduduk & Fasilitas', href: '#penduduk-fasilitas' },
      { label: 'Layanan UMKM', href: '#layanan-umkm' },
      { label: 'Koperasi Hatta', tab: 'koperasi' },
      { label: 'Direktori Eco-Stay', tab: 'tourism' },
    ],
  },
  {
    title: 'Akses akun',
    links: [
      { label: 'Daftar Akun Baru', action: 'register' },
      { label: 'Masuk / Login', action: 'login' },
      { label: 'Penduduk', tab: 'letters' },
      { label: 'Mitra homestay', tab: 'tourism' },
      { label: 'Operator', action: 'quicklogin' },
    ],
  },
]

export interface LandingFooterSectionProps {
  onNavigate: (tab: any) => void
  onOpenLogin: () => void
  onOpenRegister?: () => void
  onOpenQuickLogin?: () => void
  setActiveNav?: (href: string) => void
  footerGroups?: FooterLinkGroup[]
}

export const LandingFooterSection: React.FC<LandingFooterSectionProps> = ({
  onNavigate,
  onOpenLogin,
  onOpenRegister,
  onOpenQuickLogin,
  setActiveNav,
  footerGroups = defaultFooterLinkGroups,
}) => {
  return (
    <footer className="flex flex-col items-start gap-12 pt-16 pb-7 px-6 sm:px-12 lg:px-20 relative self-stretch w-full flex-[0_0_auto] bg-[#081d35]">
      <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-[72px] relative self-stretch w-full flex-[0_0_auto]">
        <div className="flex flex-col max-w-[390px] items-start gap-5 relative">
          <a
            className="inline-flex items-center gap-2.5 relative flex-[0_0_auto]"
            href="#beranda"
            onClick={() => setActiveNav && setActiveNav('#beranda')}
            aria-label="bandanaira.com beranda"
          >
            <NutmegLogoIcon />
            <span className="relative w-fit font-normal text-white text-[23px] tracking-[-0.90px] leading-[normal]">
              bandanaira.com
            </span>
          </a>
          <p className="relative max-w-[330px] font-normal text-[#c1ced8] text-[13px] tracking-[0] leading-[23.4px]">
            Banda Smart Tourism &amp; Island Ecosystem. Menghubungkan
            perjalanan, warisan, dan kehidupan di Kepulauan Banda.
          </p>
          <address className="not-italic inline-flex items-center gap-2 relative flex-[0_0_auto]">
            <span className="text-[#f4b75e] text-xs" aria-hidden="true">
              ⌖
            </span>
            <span className="relative w-fit mt-[-0.50px] font-normal text-[#c1ced8] text-[11px] tracking-[0] leading-[normal] whitespace-nowrap">
              Kepulauan Banda, Maluku, Indonesia
            </span>
          </address>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 flex-1 w-full">
          {footerGroups.map((group) => (
            <nav
              className="flex flex-col items-start gap-[17px] relative flex-1 grow"
              key={group.title}
              aria-label={group.title}
            >
              <h2 className="relative w-fit mt-[-1.00px] font-semibold text-white text-[13px] tracking-[0] leading-[normal]">
                {group.title}
              </h2>
              {group.links.map((link) => {
                if (link.href) {
                  const targetHref = link.href
                  return (
                    <a
                      key={link.label}
                      href={targetHref}
                      onClick={() => setActiveNav && setActiveNav(targetHref)}
                      className="relative w-fit font-normal text-[#c1ced8] hover:text-[#f4b75e] transition-colors text-xs tracking-[0] leading-[normal]"
                    >
                      {link.label}
                    </a>
                  )
                }
                if (link.tab) {
                  const targetTab = link.tab
                  return (
                    <button
                      key={link.label}
                      type="button"
                      onClick={() => onNavigate(targetTab)}
                      className="relative w-fit font-normal text-[#c1ced8] hover:text-[#f4b75e] transition-colors text-xs tracking-[0] leading-[normal] text-left"
                    >
                      {link.label}
                    </button>
                  )
                }
                return (
                  <button
                    key={link.label}
                    type="button"
                    onClick={() =>
                      link.action === 'register' && onOpenRegister
                        ? onOpenRegister()
                        : link.action === 'quicklogin' && onOpenQuickLogin
                          ? onOpenQuickLogin()
                          : onOpenLogin()
                    }
                    className="relative w-fit font-normal text-[#c1ced8] hover:text-[#f4b75e] transition-colors text-xs tracking-[0] leading-[normal] text-left"
                  >
                    {link.label}
                  </button>
                )
              })}
            </nav>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-start gap-6 relative self-stretch w-full flex-[0_0_auto]">
        <div className="relative self-stretch w-full h-px bg-[#ffffff38]" />
        <div className="flex flex-wrap items-center justify-between gap-4 relative self-stretch w-full flex-[0_0_auto]">
          <p className="relative w-fit mt-[-1.00px] font-normal text-[#c1ced8] text-[10px] tracking-[0] leading-[normal] whitespace-nowrap">
            © 2026 bandanaira.com. Seluruh hak cipta dilindungi.
          </p>
          <p className="w-fit mt-[-1.00px] font-serif font-normal italic text-[#f4b75e] text-[17px] tracking-[0] relative leading-[normal]">
            Dari Banda, untuk dunia.
          </p>
          <nav
            className="inline-flex items-start gap-6 relative flex-[0_0_auto]"
            aria-label="Informasi legal"
          >
            <a
              className="relative w-fit mt-[-1.00px] font-normal text-[#c1ced8] hover:text-white text-[10px] tracking-[0] leading-[normal] whitespace-nowrap"
              href="#beranda"
            >
              Kebijakan privasi
            </a>
            <a
              className="relative w-fit mt-[-1.00px] font-normal text-[#c1ced8] hover:text-white text-[10px] tracking-[0] leading-[normal] whitespace-nowrap"
              href="#beranda"
            >
              Syarat penggunaan
            </a>
          </nav>
        </div>
      </div>
    </footer>
  )
}

export default LandingFooterSection
