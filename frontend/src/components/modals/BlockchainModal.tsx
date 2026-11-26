import React, { useState } from 'react'
import {
  CheckCircle2,
  AlertTriangle,
  X,
  ShieldCheck,
  Database,
  Layers,
  Copy,
  Check,
} from 'lucide-react'
import { BlockchainVerification } from '../../services/traceability'

interface BlockchainModalProps {
  data: BlockchainVerification | null
  onClose: () => void
}

export const BlockchainModal: React.FC<BlockchainModalProps> = ({ data, onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  if (!data) return null

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[92vh] sm:max-h-[88vh] flex flex-col bg-white dark:bg-[#081D35] border border-slate-200 dark:border-[#1E3A5F] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-start sm:items-center justify-between px-4 py-3.5 sm:px-6 sm:py-4 border-b border-slate-100 dark:border-[#1E3A5F] bg-slate-50/90 dark:bg-[#1E3A5F]/40 shrink-0">
          <div className="space-y-1 pr-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                data.is_verified
                  ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40'
                  : 'bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-300 border border-red-300/40'
              }`}
            >
              {data.is_verified ? (
                <>
                  <CheckCircle2 size={12} className="shrink-0" />
                  <span>VERIFIKASI INTEGRITAS LOLOS</span>
                </>
              ) : (
                <>
                  <AlertTriangle size={12} className="shrink-0" />
                  <span>INTEGRITAS MERAGUKAN</span>
                </>
              )}
            </span>
            <h3 className="text-sm sm:text-lg font-black text-[#081D35] dark:text-[#F8FAFC] leading-snug">
              Verifikasi On-Chain Smart Contract EVM
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
              Kode Batch:{' '}
              <b className="font-mono text-[#F4B75E]">{data.batch_code}</b>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white bg-slate-100 dark:bg-[#1E3A5F] border border-slate-200 dark:border-[#1E3A5F] transition active:scale-95 cursor-pointer shrink-0"
            aria-label="Tutup Jendela"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-3.5 sm:space-y-4 flex-1 overflow-y-auto overscroll-contain">
          {/* Banner Integritas */}
          <div
            className={`p-3.5 sm:p-4 rounded-2xl border flex items-start gap-3 ${
              data.is_verified
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-300'
                : 'bg-red-500/10 border-red-500/30 text-red-900 dark:text-red-300'
            }`}
          >
            {data.is_verified ? (
              <ShieldCheck size={22} className="text-emerald-500 shrink-0 mt-0.5 sm:size-[24px]" />
            ) : (
              <AlertTriangle size={22} className="text-red-500 shrink-0 mt-0.5 sm:size-[24px]" />
            )}
            <div>
              <b className="block text-xs sm:text-sm font-bold text-[#081D35] dark:text-white mb-0.5">
                {data.is_verified ? 'Bukti Kriptografis Sah & Terverifikasi' : 'Hash Tidak Cocok'}
              </b>
              <p className="text-[11px] sm:text-xs leading-relaxed opacity-90">{data.message}</p>
            </div>
          </div>

          {/* Perbandingan Hash */}
          <div className="space-y-3">
            <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-50 dark:bg-[#1E3A5F]/30 border border-slate-100 dark:border-[#1E3A5F] space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Database size={13} className="text-sky-500 shrink-0" /> Hash Basis Data Lokal (SHA-256)
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(data.latest_db_hash, 'db_hash')}
                  className="min-h-[36px] px-2.5 py-1 text-[11px] font-bold flex items-center gap-1 rounded-lg bg-white dark:bg-[#081D35] border border-slate-200 dark:border-[#1E3A5F] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1E3A5F] transition active:scale-95 cursor-pointer"
                  title="Salin Hash Database"
                >
                  {copiedKey === 'db_hash' ? (
                    <>
                      <Check size={12} className="text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400">Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span>Salin</span>
                    </>
                  )}
                </button>
              </div>
              <code className="text-[11px] sm:text-xs font-mono text-sky-600 dark:text-sky-300 break-all block p-2 rounded-xl bg-white dark:bg-[#081D35]/60 border border-slate-200/80 dark:border-[#1E3A5F]/60 select-all leading-relaxed">
                {data.latest_db_hash}
              </code>
            </div>

            <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-50 dark:bg-[#1E3A5F]/30 border border-slate-100 dark:border-[#1E3A5F] space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Layers size={13} className="text-emerald-500 shrink-0" /> Hash Permanen di Smart Contract On-Chain
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(data.on_chain_hash || '', 'on_chain_hash')}
                  className="min-h-[36px] px-2.5 py-1 text-[11px] font-bold flex items-center gap-1 rounded-lg bg-white dark:bg-[#081D35] border border-slate-200 dark:border-[#1E3A5F] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1E3A5F] transition active:scale-95 cursor-pointer"
                  title="Salin Hash On-Chain"
                >
                  {copiedKey === 'on_chain_hash' ? (
                    <>
                      <Check size={12} className="text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400">Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span>Salin</span>
                    </>
                  )}
                </button>
              </div>
              <code className="text-[11px] sm:text-xs font-mono text-emerald-600 dark:text-emerald-400 break-all block p-2 rounded-xl bg-white dark:bg-[#081D35]/60 border border-slate-200/80 dark:border-[#1E3A5F]/60 select-all leading-relaxed">
                {data.on_chain_hash || 'Belum dijangkarkan ke Smart Contract'}
              </code>
            </div>
          </div>

          {/* Grid Metadata Blok */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs">
            <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 dark:bg-[#1E3A5F]/20 border border-slate-100 dark:border-[#1E3A5F]">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Nomor Blok EVM</span>
              <span className="text-xs sm:text-sm font-mono font-bold text-[#081D35] dark:text-white mt-0.5 block truncate">
                #{data.block_number || 'N/A'}
              </span>
            </div>
            <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 dark:bg-[#1E3A5F]/20 border border-slate-100 dark:border-[#1E3A5F]">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Network Chain ID</span>
              <span className="text-xs sm:text-sm font-mono font-bold text-[#081D35] dark:text-white mt-0.5 block truncate">
                {data.network_chain_id} (EVM Maluku)
              </span>
            </div>
          </div>

          {/* Smart Contract & Tx Hash */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-50 dark:bg-[#1E3A5F]/30 border border-slate-100 dark:border-[#1E3A5F] space-y-2.5 text-xs">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Alamat Smart Contract (SpiceRegistry)
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(data.contract_address, 'contract_address')}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer p-1"
                  title="Salin Alamat Kontrak"
                >
                  {copiedKey === 'contract_address' ? (
                    <Check size={12} className="text-emerald-500" />
                  ) : (
                    <Copy size={12} />
                  )}
                </button>
              </div>
              <code className="text-[10px] sm:text-[11px] font-mono text-[#F4B75E] break-all block mt-0.5 p-1.5 rounded-lg bg-white/70 dark:bg-[#081D35]/50 border border-slate-200/50 dark:border-[#1E3A5F]/50 select-all">
                {data.contract_address}
              </code>
            </div>
            {data.transaction_hash && (
              <div className="pt-2 border-t border-slate-200/50 dark:border-[#1E3A5F]/50">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Transaction Receipt Hash
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(data.transaction_hash || '', 'tx_receipt')}
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer p-1"
                    title="Salin Hash Transaksi"
                  >
                    {copiedKey === 'tx_receipt' ? (
                      <Check size={12} className="text-emerald-500" />
                    ) : (
                      <Copy size={12} />
                    )}
                  </button>
                </div>
                <code className="text-[10px] sm:text-[11px] font-mono text-emerald-600 dark:text-emerald-400 break-all block mt-0.5 p-1.5 rounded-lg bg-white/70 dark:bg-[#081D35]/50 border border-slate-200/50 dark:border-[#1E3A5F]/50 select-all">
                  {data.transaction_hash}
                </code>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-t border-slate-100 dark:border-[#1E3A5F] bg-slate-50/90 dark:bg-[#1E3A5F]/40 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#081D35] hover:bg-[#0c2a4d] dark:bg-white dark:hover:bg-slate-100 text-white dark:text-[#081D35] transition shadow-xs active:scale-98 cursor-pointer flex items-center justify-center gap-2"
          >
            Tutup Hasil Verifikasi
          </button>
        </div>
      </div>
    </div>
  )
}
