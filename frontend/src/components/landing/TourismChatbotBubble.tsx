import React, { useState, useRef, useEffect } from 'react'
import { PUBLIC_SAW_DESTINATIONS, PublicSawDestination } from './TourismSawSection'
import { setPreferredTourismSubTab } from '../../services/tourism'
import { useLanguage } from '../../context/LanguageContext'

export interface ChatMessage {
  id: string
  sender: 'bot' | 'user'
  text: string
  timestamp: string
  recommendations?: Array<{
    destination: PublicSawDestination
    scorePercent: number
    reason: string
  }>
}

export interface TourismChatbotBubbleProps {
  onNavigate: (tab: any) => void
}

/**
 * SAW (Simple Additive Weighting) Recommendation Engine
 * Normalizes Benefit (Attraction, Facility) and Cost (CostRp, TravelMinutes)
 */
function runSawRecommendation(
  query: string,
  categoryFilter?: 'Bahari & Selam' | 'Sejarah & Benteng' | 'Alam & Rempah' | 'ALL',
  budgetLimit?: number,
  isEnglish?: boolean
) {
  let candidates = [...PUBLIC_SAW_DESTINATIONS]

  if (categoryFilter && categoryFilter !== 'ALL') {
    candidates = candidates.filter((d) => d.category === categoryFilter)
  }

  if (budgetLimit) {
    const budgetFiltered = candidates.filter((d) => d.costRp <= budgetLimit)
    if (budgetFiltered.length > 0) {
      candidates = budgetFiltered
    }
  }

  // Determine dynamic weights based on user intent
  let weights = {
    attraction: 0.4,
    facility: 0.3,
    cost: 0.15,
    time: 0.15,
  }

  const q = query.toLowerCase()
  if (q.includes('budget') || q.includes('murah') || q.includes('biaya') || q.includes('hemat') || q.includes('harga') || q.includes('cheap') || q.includes('cost')) {
    weights = { attraction: 0.25, facility: 0.15, cost: 0.45, time: 0.15 }
  } else if (q.includes('waktu') || q.includes('cepat') || q.includes('dekat') || q.includes('singkat') || q.includes('time') || q.includes('fast') || q.includes('near')) {
    weights = { attraction: 0.25, facility: 0.15, cost: 0.15, time: 0.45 }
  } else if (q.includes('fasilitas') || q.includes('lengkap') || q.includes('nyaman') || q.includes('facility') || q.includes('amenities')) {
    weights = { attraction: 0.3, facility: 0.45, cost: 0.15, time: 0.1 }
  }

  const maxAttraction = Math.max(...candidates.map((d) => d.attractionScore)) || 1
  const maxFacility = Math.max(...candidates.map((d) => d.facilityScore)) || 1
  const minCost = Math.min(...candidates.map((d) => d.costRp)) || 1
  const minTime = Math.min(...candidates.map((d) => d.travelMinutes)) || 1

  const scored = candidates.map((d) => {
    // Benefit criteria (higher is better)
    const normAttraction = d.attractionScore / maxAttraction
    const normFacility = d.facilityScore / maxFacility
    // Cost criteria (lower is better)
    const normCost = minCost / (d.costRp || 1)
    const normTime = minTime / (d.travelMinutes || 1)

    const finalScore =
      weights.attraction * normAttraction +
      weights.facility * normFacility +
      weights.cost * normCost +
      weights.time * normTime

    let reason = isEnglish
      ? 'Top-tier combination of natural appeal and convenient accessibility.'
      : 'Kombinasi nilai daya tarik dan aksesibilitas tertinggi.'
    if (d.category === 'Bahari & Selam') {
      reason = isEnglish
        ? 'Superb coral reef biodiversity and crystal-clear marine waters.'
        : 'Keanekaragaman terumbu karang dan kejernihan air laut terbaik.'
    } else if (d.category === 'Sejarah & Benteng') {
      reason = isEnglish
        ? 'Deep historic cultural heritage value and well-preserved facilities.'
        : 'Nilai sejarah cagar budaya tinggi dan fasilitas terawat baik.'
    } else if (d.category === 'Alam & Rempah') {
      reason = isEnglish
        ? 'Authentic nature exploration with breathtaking volcanic archipelago vistas.'
        : 'Petualangan alam otentik dengan lanskap kepulauan spektakuler.'
    }

    return {
      destination: d,
      scorePercent: Math.round(finalScore * 100),
      reason,
    }
  })

  return scored.sort((a, b) => b.scorePercent - a.scorePercent).slice(0, 3)
}

export const TourismChatbotBubble: React.FC<TourismChatbotBubbleProps> = ({ onNavigate }) => {
  const { t, isEnglish } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [inputText, setInputText] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: t.chatbot.welcomeMsg,
      timestamp: t.chatbot.justNow,
    },
  ])

  // Update initial welcome message when language changes if user has not interacted
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'welcome-1') {
        return [
          {
            id: 'welcome-1',
            sender: 'bot',
            text: t.chatbot.welcomeMsg,
            timestamp: t.chatbot.justNow,
          },
        ]
      }
      return prev
    })
  }, [t.chatbot.welcomeMsg, t.chatbot.justNow])

  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [isOpen, messages])

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim()
    if (!text) return

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: t.chatbot.justNow,
    }

    setMessages((prev) => [...prev, userMsg])
    if (!textToSend) setInputText('')

    // Process intelligence
    setTimeout(() => {
      const q = text.toLowerCase()
      let categoryFilter: 'Bahari & Selam' | 'Sejarah & Benteng' | 'Alam & Rempah' | 'ALL' = 'ALL'
      let budgetLimit: number | undefined = undefined

      if (
        q.includes('bahari') ||
        q.includes('selam') ||
        q.includes('snorkeling') ||
        q.includes('diving') ||
        q.includes('pantai') ||
        q.includes('penyu') ||
        q.includes('laut') ||
        q.includes('marine') ||
        q.includes('beach') ||
        q.includes('coral') ||
        q.includes('sea')
      ) {
        categoryFilter = 'Bahari & Selam'
      } else if (
        q.includes('sejarah') ||
        q.includes('benteng') ||
        q.includes('museum') ||
        q.includes('hatta') ||
        q.includes('sjahrir') ||
        q.includes('rhun') ||
        q.includes('belgica') ||
        q.includes('fort') ||
        q.includes('history') ||
        q.includes('heritage')
      ) {
        categoryFilter = 'Sejarah & Benteng'
      } else if (
        q.includes('gunung') ||
        q.includes('trekking') ||
        q.includes('pala') ||
        q.includes('kebun') ||
        q.includes('alam') ||
        q.includes('lonthoir') ||
        q.includes('kawah') ||
        q.includes('mountain') ||
        q.includes('volcano') ||
        q.includes('nature') ||
        q.includes('spice')
      ) {
        categoryFilter = 'Alam & Rempah'
      }

      if (q.includes('50') || q.includes('50.000') || q.includes('50rb') || q.includes('murah') || q.includes('hemat') || q.includes('budget') || q.includes('cheap')) {
        budgetLimit = 50000
      }

      const results = runSawRecommendation(text, categoryFilter, budgetLimit, isEnglish)

      let replyText = isEnglish
        ? `Based on your preference ${categoryFilter !== 'ALL' ? `for ${categoryFilter}` : 'selections'}, here are the top matching destination recommendations:`
        : `Berdasarkan preferensi ${categoryFilter !== 'ALL' ? `kategori ${categoryFilter}` : 'pilihan Anda'}, berikut adalah rekomendasi destinasi dengan tingkat kecocokan tertinggi:`
      if (budgetLimit) {
        replyText = isEnglish
          ? 'Here are the most affordable and budget-friendly destinations with optimal attractions and facilities:'
          : 'Berikut destinasi paling hemat dan ramah anggaran dengan fasilitas serta daya tarik optimal:'
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: replyText,
        timestamp: t.chatbot.justNow,
        recommendations: results,
      }

      setMessages((prev) => [...prev, botMsg])
    }, 500)
  }

  const handleQuickOption = (_label: string, query: string) => {
    handleSendMessage(query)
  }

  const handleViewDestination = (dest: PublicSawDestination) => {
    setPreferredTourismSubTab(dest.category === 'Sejarah & Benteng' ? 'heritage' : 'destinations')
    onNavigate('tourism')
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Floating Chatbot Bubble Trigger */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-3 bg-[#0f2c59] hover:bg-[#183d75] text-white p-3.5 sm:px-5 sm:py-3.5 rounded-full shadow-[0_10px_30px_rgba(15,44,89,0.35)] border border-white/20 transition-all duration-300 hover:scale-105 focus:outline-none"
          aria-label={t.chatbot.triggerLabel}
        >
          {/* Compass / Chat Icon */}
          <div className="relative flex items-center justify-center">
            <svg className="w-6 h-6 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
          </div>

          {/* Label (Visible on desktop) */}
          <span className="hidden sm:inline font-sans text-xs font-semibold tracking-wide text-white">
            {t.chatbot.triggerLabel}
          </span>
        </button>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div
          data-lenis-prevent
          className="w-[92vw] sm:w-[400px] h-[550px] max-h-[82vh] bg-white rounded-3xl shadow-[0_20px_60px_rgba(15,44,89,0.25)] border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-300 select-none"
        >
          {/* Chat Window Header */}
          <div className="bg-[#0f2c59] text-white px-5 py-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                </svg>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0f2c59]" />
              </div>

              <div>
                <h3 className="font-sans font-bold text-sm text-white leading-tight">
                  {t.chatbot.headerTitle}
                </h3>
                <p className="font-sans text-[11px] text-amber-300/90 leading-tight">
                  {t.chatbot.headerSubtitle}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label={t.chatbot.closeChat}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/70 scrollbar-thin">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-[13px] leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#0f2c59] text-white rounded-tr-sm shadow-sm'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-sm shadow-sm'
                  }`}
                >
                  <p>{msg.text}</p>

                  {/* Recommendation Cards if Available */}
                  {msg.recommendations && msg.recommendations.length > 0 && (
                    <div className="mt-3 space-y-2.5">
                      {msg.recommendations.map(({ destination, scorePercent, reason }) => (
                        <div
                          key={destination.id}
                          className="bg-slate-50 border border-slate-200/90 rounded-xl p-2.5 flex flex-col gap-2 hover:border-amber-400/80 transition-colors"
                        >
                          <div className="flex gap-2.5 items-center">
                            <img
                              src={destination.image}
                              alt={destination.name}
                              className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1 mb-0.5">
                                <span className="font-mono text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                                  {t.chatbot.matchPercent} {scorePercent}%
                                </span>
                                <span className="text-[10px] text-slate-500 font-sans truncate">
                                  {destination.island}
                                </span>
                              </div>
                              <h4 className="font-sans font-bold text-xs text-slate-900 truncate">
                                {destination.name}
                              </h4>
                              <p className="text-[10px] text-slate-600 line-clamp-1 mt-0.5">
                                {reason}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/70 text-[10px] text-slate-500">
                            <span>
                              {t.chatbot.tariff}: Rp {destination.costRp.toLocaleString('id-ID')}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleViewDestination(destination)}
                              className="font-semibold text-amber-700 hover:text-amber-900 inline-flex items-center gap-0.5"
                            >
                              <span>{t.chatbot.viewPlace}</span>
                              <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="9 18 15 12 9 6" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Option Chips */}
          <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => handleQuickOption(t.chatbot.quickTopRec, t.chatbot.quickTopQuery)}
              className="text-[11px] whitespace-nowrap bg-slate-100 hover:bg-amber-100 hover:text-amber-900 text-slate-700 px-3 py-1.5 rounded-full border border-slate-200 transition-colors"
            >
              {t.chatbot.quickTopRec}
            </button>
            <button
              type="button"
              onClick={() => handleQuickOption(t.chatbot.quickMarine, t.chatbot.quickMarineQuery)}
              className="text-[11px] whitespace-nowrap bg-slate-100 hover:bg-amber-100 hover:text-amber-900 text-slate-700 px-3 py-1.5 rounded-full border border-slate-200 transition-colors"
            >
              {t.chatbot.quickMarine}
            </button>
            <button
              type="button"
              onClick={() => handleQuickOption(t.chatbot.quickHeritage, t.chatbot.quickHeritageQuery)}
              className="text-[11px] whitespace-nowrap bg-slate-100 hover:bg-amber-100 hover:text-amber-900 text-slate-700 px-3 py-1.5 rounded-full border border-slate-200 transition-colors"
            >
              {t.chatbot.quickHeritage}
            </button>
            <button
              type="button"
              onClick={() => handleQuickOption(t.chatbot.quickBudget, t.chatbot.quickBudgetQuery)}
              className="text-[11px] whitespace-nowrap bg-slate-100 hover:bg-amber-100 hover:text-amber-900 text-slate-700 px-3 py-1.5 rounded-full border border-slate-200 transition-colors"
            >
              {t.chatbot.quickBudget}
            </button>
          </div>

          {/* Chat Input Field */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSendMessage()
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t.chatbot.inputPlaceholder}
              className="flex-1 bg-slate-100 border border-slate-200 rounded-full px-4 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0f2c59]"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="w-8 h-8 rounded-full bg-[#0f2c59] hover:bg-[#183d75] disabled:opacity-40 text-white flex items-center justify-center transition-colors flex-shrink-0"
              aria-label={t.chatbot.sendBtn}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export default TourismChatbotBubble
