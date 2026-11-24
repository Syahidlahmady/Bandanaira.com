import React, { useMemo } from 'react'
import { ChevronUp, MapPin } from 'lucide-react'
import { NutmegLogoIcon } from './LandingIcons'
import { setPreferredTourismSubTab } from '../../services/tourism'
import { useLanguage } from '../../context/LanguageContext'

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
]

export interface LandingFooterSectionProps {
  onNavigate: (tab: any) => void
  onOpenLogin?: () => void
  onOpenQuickLogin?: () => void
  setActiveNav?: (href: string) => void
  footerGroups?: FooterLinkGroup[]
}

export const LandingFooterSection: React.FC<LandingFooterSectionProps> = ({
  onNavigate,
  onOpenLogin,
  onOpenQuickLogin,
  setActiveNav,
  footerGroups,
}) => {
  const { t } = useLanguage()

  const activeGroups = useMemo<FooterLinkGroup[]>(() => {
    if (footerGroups) return footerGroups
    return [
      {
        title: t.footer.groupExplore,
        links: [
          { label: t.navbar.home, href: '#beranda' },
          { label: t.navbar.navMap, href: '#peta' },
          { label: t.navbar.navHistory, href: '#sejarah' },
          { label: t.navbar.navDestinations, href: '#wisata' },
        ],
      },
      {
        title: t.footer.groupServices,
        links: [
          { label: t.footer.navResidents, href: '#penduduk-fasilitas' },
          { label: t.footer.navSmes, href: '#layanan-umkm' },
          { label: t.footer.navCoop, tab: 'koperasi' },
          { label: t.footer.navStays, tab: 'tourism' },
        ],
      },
    ]
  }, [footerGroups, t])

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    if (setActiveNav) {
      setActiveNav('#beranda')
    }
  }

  return (
    <footer className="flex flex-col items-start gap-10 sm:gap-12 pt-12 sm:pt-16 pb-28 sm:pb-32 lg:pb-10 px-4 sm:px-8 lg:px-16 relative self-stretch w-full flex-[0_0_auto] bg-[#081d35] border-t border-white/10">
      <div className="flex flex-col lg:flex-row items-start justify-between gap-10 lg:gap-16 relative self-stretch w-full flex-[0_0_auto]">
        {/* Brand Column */}
        <div className="flex flex-col max-w-[420px] items-start gap-4 sm:gap-5 relative w-full lg:w-auto">
          <div className="flex items-center justify-between w-full">
            <a
              className="inline-flex items-center gap-2.5 relative flex-[0_0_auto] cursor-pointer group"
              href="#beranda"
              onClick={() => setActiveNav && setActiveNav('#beranda')}
              aria-label="bandanaira.com beranda"
            >
              <NutmegLogoIcon />
              <span className="relative w-fit font-normal text-white text-xl sm:text-[23px] tracking-[-0.90px] leading-[normal] group-hover:text-[#f4b75e] transition-colors">
                bandanaira.com
              </span>
            </a>

            {/* Mobile Scroll-to-Top Pill */}
            <button
              type="button"
              onClick={handleScrollTop}
              className="inline-flex lg:hidden items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-slate-300 hover:text-white text-[11px] font-medium transition-colors cursor-pointer active:scale-95"
              aria-label="Kembali ke atas halaman"
            >
              <ChevronUp size={13} className="text-[#f4b75e]" />
              <span>Ke Atas</span>
            </button>
          </div>

          <p className="relative max-w-[340px] font-normal text-[#c1ced8] text-xs sm:text-[13px] tracking-[0] leading-relaxed">
            {t.footer.brandDesc}
          </p>

          <address className="not-italic inline-flex items-center gap-1.5 relative flex-[0_0_auto] text-slate-300">
            <MapPin size={14} className="text-[#f4b75e] shrink-0" />
            <span className="relative w-fit font-normal text-[#c1ced8] text-[11px] sm:text-xs tracking-[0] leading-normal">
              {t.footer.location}
            </span>
          </address>

          {/* Living Lab Badges */}
          <div className="flex items-center gap-3 pt-1">
            <img
              src="/images/branding/nirana-logo.webp"
              alt="NIRANA - Banda Neira Living Labs"
              className="h-11 w-11 sm:h-12 sm:w-12 object-contain rounded-lg bg-white/5 p-1 border border-white/10"
              loading="lazy"
              decoding="async"
            />
            <img
              src="/images/branding/bst-emblem.webp"
              alt="Banda Smart Tourism Emblem"
              className="h-10 w-10 sm:h-11 sm:w-11 object-contain rounded-lg bg-white/95 p-0.5 shadow-sm"
              loading="lazy"
              decoding="async"
            />
            <div className="flex flex-col text-[10px] sm:text-[11px] text-slate-400 leading-tight">
              <span className="font-semibold text-slate-200">Banda Living Lab</span>
              <span>UGM & Kemenparekraf</span>
            </div>
          </div>
        </div>

        {/* Link Groups Grid */}
        <div className="grid grid-cols-2 gap-6 sm:gap-10 flex-1 max-w-[500px] w-full">
          {activeGroups.map((group) => (
            <nav
              className="flex flex-col items-start gap-2.5 sm:gap-3.5 relative flex-1 grow"
              key={group.title}
              aria-label={group.title}
            >
              <h2 className="relative w-fit font-semibold text-xs sm:text-[13px] tracking-wide uppercase text-slate-200 pb-1 border-b border-[#f4b75e]/30 w-full">
                {group.title}
              </h2>
              <div className="flex flex-col items-start gap-1 sm:gap-2 w-full pt-1">
                {group.links.map((link) => {
                  if (link.href) {
                    const targetHref = link.href
                    return (
                      <a
                        key={link.label}
                        href={targetHref}
                        onClick={() => setActiveNav && setActiveNav(targetHref)}
                        className="relative w-full py-1.5 sm:py-0.5 inline-flex items-center font-normal text-[#c1ced8] hover:text-[#f4b75e] active:text-[#f4b75e] transition-colors text-xs sm:text-[13px] tracking-[0] leading-snug cursor-pointer active:scale-[0.98]"
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
                        onClick={() => {
                          if (targetTab === 'tourism') {
                            setPreferredTourismSubTab('accommodations')
                          }
                          onNavigate(targetTab)
                        }}
                        className="relative w-full py-1.5 sm:py-0.5 inline-flex items-center font-normal text-[#c1ced8] hover:text-[#f4b75e] active:text-[#f4b75e] transition-colors text-xs sm:text-[13px] tracking-[0] leading-snug text-left cursor-pointer active:scale-[0.98]"
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
                        link.action === 'quicklogin' && onOpenQuickLogin
                          ? onOpenQuickLogin()
                          : onOpenLogin?.()
                      }
                      className="relative w-full py-1.5 sm:py-0.5 inline-flex items-center font-normal text-[#c1ced8] hover:text-[#f4b75e] active:text-[#f4b75e] transition-colors text-xs sm:text-[13px] tracking-[0] leading-snug text-left cursor-pointer active:scale-[0.98]"
                    >
                      {link.label}
                    </button>
                  )
                })}
              </div>
            </nav>
          ))}
        </div>
      </div>

      {/* Bottom Divider & Legal Section */}
      <div className="flex flex-col items-start gap-4 sm:gap-6 relative self-stretch w-full flex-[0_0_auto] pt-2">
        <div className="relative self-stretch w-full h-px bg-white/10" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3.5 sm:gap-4 relative self-stretch w-full flex-[0_0_auto] text-center sm:text-left">
          <p className="relative w-fit font-normal text-slate-400 text-[11px] sm:text-xs tracking-[0] leading-normal order-2 sm:order-1">
            © 2026 bandanaira.com. {t.footer.allRightsReserved}
          </p>

          <p className="w-fit font-serif font-normal italic text-[#f4b75e] text-xs sm:text-[14px] tracking-[0] relative leading-normal order-1 sm:order-2">
            "{t.footer.taglineQuote}"
          </p>

          <div className="flex items-center gap-4 sm:gap-6 order-3">
            <nav
              className="inline-flex items-center gap-3 sm:gap-5 relative flex-[0_0_auto]"
              aria-label="Informasi legal"
            >
              <a
                className="relative py-1 font-normal text-slate-400 hover:text-white active:text-[#f4b75e] text-[11px] sm:text-xs tracking-[0] leading-normal whitespace-nowrap transition-colors"
                href="#beranda"
              >
                {t.footer.privacyPolicy}
              </a>
              <span className="text-slate-600 text-xs">·</span>
              <a
                className="relative py-1 font-normal text-slate-400 hover:text-white active:text-[#f4b75e] text-[11px] sm:text-xs tracking-[0] leading-normal whitespace-nowrap transition-colors"
                href="#beranda"
              >
                {t.footer.termsOfUse}
              </a>
            </nav>

            {/* Desktop Scroll-to-Top Button */}
            <button
              type="button"
              onClick={handleScrollTop}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-slate-300 hover:text-white text-[11px] font-medium transition-colors cursor-pointer active:scale-95 ml-2"
              title="Kembali ke atas"
            >
              <ChevronUp size={14} className="text-[#f4b75e]" />
              <span>Ke Atas</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default LandingFooterSection
