import React, { useState, useRef, useEffect } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { Globe, ChevronDown, Check } from 'lucide-react'
import { Language } from '../../services/i18n/translations'

interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'navbar' | 'floating' | 'topbar' | 'mobile'
  className?: string
  showFullLabel?: boolean
}

interface LanguageOption {
  code: Language
  label: string
  shortLabel: string
  flag: string
  subLabel: string
}

const LANGUAGES: LanguageOption[] = [
  {
    code: 'id',
    label: 'Bahasa Indonesia',
    shortLabel: 'ID',
    flag: '🇮🇩',
    subLabel: 'Indonesia',
  },
  {
    code: 'en',
    label: 'English',
    shortLabel: 'EN',
    flag: '🇬🇧',
    subLabel: 'International',
  },
]

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'dropdown',
  className = '',
  showFullLabel = false,
}) => {
  const { language, setLanguage, t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const activeOption = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0]

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const handleSelect = (code: Language) => {
    setLanguage(code)
    setIsOpen(false)
  }

  // Mobile Drawer Menu Variant
  if (variant === 'mobile') {
    return (
      <div className={`py-2 px-1 border-t border-white/10 ${className}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Globe size={14} className="text-[#F4B75E]" />
            {t.common.selectLanguage}
          </span>
          <span className="text-[10px] text-amber-300/80 uppercase font-mono">
            {activeOption.shortLabel}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-white/5 rounded-xl border border-white/10">
          {LANGUAGES.map((opt) => {
            const isSelected = language === opt.code
            return (
              <button
                key={opt.code}
                type="button"
                onClick={() => setLanguage(opt.code)}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-[#F4B75E] text-[#081D35] shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{opt.flag}</span>
                <span>{opt.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // Topbar Compact Dropdown for Dashboard Header
  if (variant === 'topbar') {
    return (
      <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
            isOpen
              ? 'bg-[#081D35] text-[#F4B75E] border-[#F4B75E]/40 shadow-xs'
              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/80 shadow-2xs'
          }`}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          title={t.common.selectLanguage}
        >
          <span className="text-sm">{activeOption.flag}</span>
          <span className="font-semibold">{activeOption.shortLabel}</span>
          <ChevronDown
            size={13}
            className={`transition-transform duration-200 text-slate-400 ${
              isOpen ? 'rotate-180 text-[#F4B75E]' : ''
            }`}
          />
        </button>

        {isOpen && (
          <div
            className="absolute right-0 mt-1.5 w-48 rounded-xl bg-white border border-slate-200 shadow-2xl py-1 z-[100] animate-in fade-in slide-in-from-top-1 duration-150"
            role="listbox"
            aria-label="Pilih Bahasa"
          >
            <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {t.common.selectLanguage}
            </div>
            {LANGUAGES.map((opt) => {
              const isSelected = language === opt.code
              return (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => handleSelect(opt.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors text-left cursor-pointer ${
                    isSelected
                      ? 'bg-amber-50 text-[#081D35] font-bold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{opt.flag}</span>
                    <div className="flex flex-col">
                      <span className="leading-tight">{opt.label}</span>
                      <span className="text-[10px] text-slate-400 font-normal leading-tight">
                        {opt.subLabel}
                      </span>
                    </div>
                  </div>
                  {isSelected && <Check size={14} className="text-amber-600 shrink-0" />}
                </button>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // Floating Variant on Top-Right Corner of Landing Page (Resting state before scroll)
  if (variant === 'floating') {
    return (
      <div className={`fixed top-4 right-4 sm:top-6 sm:right-8 z-40 ${className}`} ref={dropdownRef}>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all backdrop-blur-md border shadow-lg cursor-pointer ${
              isOpen
                ? 'bg-[#081D35] text-[#F4B75E] border-[#F4B75E]/60 shadow-[0_0_15px_rgba(244,183,94,0.3)]'
                : 'bg-black/45 hover:bg-black/65 text-white border-white/20 hover:border-amber-400/50'
            }`}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            title={t.common.selectLanguage}
          >
            <Globe size={14} className="text-[#F4B75E]" />
            <span className="text-sm">{activeOption.flag}</span>
            <span className="tracking-wide">
              {showFullLabel ? activeOption.label : activeOption.shortLabel}
            </span>
            <ChevronDown
              size={13}
              className={`transition-transform duration-200 text-amber-200/80 ${
                isOpen ? 'rotate-180 text-[#F4B75E]' : ''
              }`}
            />
          </button>

          {isOpen && (
            <div
              className="absolute right-0 mt-2 w-52 rounded-2xl bg-[#081D35]/95 backdrop-blur-xl border border-white/20 shadow-2xl p-1.5 z-50 text-white animate-in fade-in slide-in-from-top-2 duration-150"
              role="listbox"
              aria-label="Pilih Bahasa"
            >
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#F4B75E]/80 border-b border-white/10 mb-1">
                {t.common.selectLanguage}
              </div>
              {LANGUAGES.map((opt) => {
                const isSelected = language === opt.code
                return (
                  <button
                    key={opt.code}
                    type="button"
                    onClick={() => handleSelect(opt.code)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all text-left cursor-pointer ${
                      isSelected
                        ? 'bg-[#F4B75E]/20 text-[#F4B75E] font-bold border border-[#F4B75E]/30'
                        : 'text-slate-200 hover:bg-white/10 hover:text-white'
                    }`}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{opt.flag}</span>
                      <div className="flex flex-col">
                        <span className="font-semibold leading-tight">{opt.label}</span>
                        <span className="text-[10px] text-slate-400 font-normal leading-tight">
                          {opt.subLabel}
                        </span>
                      </div>
                    </div>
                    {isSelected && <Check size={15} className="text-[#F4B75E] shrink-0" />}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Default Dropdown (Used in Navbar / Landing Header)
  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all backdrop-blur-md border shadow-xs cursor-pointer ${
          isOpen
            ? 'bg-[#081D35] text-[#F4B75E] border-[#F4B75E]/60 shadow-[0_0_12px_rgba(244,183,94,0.25)]'
            : 'bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-amber-300/40'
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        title={t.common.selectLanguage}
      >
        <Globe size={13} className="text-[#F4B75E]" />
        <span className="text-sm">{activeOption.flag}</span>
        <span className="font-semibold tracking-wide">
          {showFullLabel ? activeOption.label : activeOption.shortLabel}
        </span>
        <ChevronDown
          size={13}
          className={`transition-transform duration-200 text-amber-200/80 ${
            isOpen ? 'rotate-180 text-[#F4B75E]' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-52 rounded-2xl bg-[#081D35]/95 backdrop-blur-xl border border-white/20 shadow-[0_20px_45px_rgba(0,0,0,0.85)] p-1.5 z-[100] text-white animate-in fade-in slide-in-from-top-2 duration-150"
          role="listbox"
          aria-label="Pilih Bahasa / Select Language"
        >
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#F4B75E]/80 border-b border-white/10 mb-1">
            {t.common.selectLanguage}
          </div>
          {LANGUAGES.map((opt) => {
            const isSelected = language === opt.code
            return (
              <button
                key={opt.code}
                type="button"
                onClick={() => handleSelect(opt.code)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all text-left cursor-pointer ${
                  isSelected
                    ? 'bg-[#F4B75E]/20 text-[#F4B75E] font-bold border border-[#F4B75E]/30'
                    : 'text-slate-200 hover:bg-white/10 hover:text-white'
                }`}
                role="option"
                aria-selected={isSelected}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">{opt.flag}</span>
                  <div className="flex flex-col">
                    <span className="font-semibold leading-tight">{opt.label}</span>
                    <span className="text-[10px] text-slate-400 font-normal leading-tight">
                      {opt.subLabel}
                    </span>
                  </div>
                </div>
                {isSelected && <Check size={15} className="text-[#F4B75E] shrink-0" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default LanguageSwitcher
