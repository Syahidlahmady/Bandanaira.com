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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#081D35] border border-slate-200 dark:border-[#1E3A5F] rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-[#1E3A5F] bg-slate-50/80 dark:bg-[#0F2C59]/40">
          <div className="space-y-1">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                data.is_verified
                  ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40'
                  : 'bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-300 border border-red-300/40'
              }`}
            >
              {data.is_verified ? (
                <>
                  <CheckCircle2 size={13} /> VERIFIKASI INTEGRITAS LOLOS
                </>
              ) : (
                <>
                  <AlertTriangle size={13} /> INTEGRITAS MERAGUKAN
                </>
              )}
            </span>
            <h3 className="text-base sm:text-lg font-black text-[#081D35] dark:text-[#F8FAFC]">
              Verifikasi On-Chain Smart Contract EVM
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Kode Batch:{' '}
              <b className="font-mono text-[#F4B75E]">{data.batch_code}</b>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white bg-slate-100 dark:bg-[#0F2C59] border border-slate-200 dark:border-[#1E3A5F] transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Banner Integritas */}
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
              data.is_verified
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-300'
                : 'bg-red-500/10 border-red-500/30 text-red-900 dark:text-red-300'
            }`}
          >
            {data.is_verified ? (
              <ShieldCheck size={24} className="text-emerald-500 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle size={24} className="text-red-500 shrink-0 mt-0.5" />
            )}
            <div>
              <b className="block text-sm font-bold text-[#081D35] dark:text-white mb-0.5">
                {data.is_verified ? 'Bukti Kriptografis Sah & Terverifikasi' : 'Hash Tidak Cocok'}
              </b>
              <p className="text-xs leading-relaxed opacity-90">{data.message}</p>
            </div>
          </div>

          {/* Perbandingan Hash */}
          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0F2C59]/30 border border-slate-100 dark:border-[#1E3A5F] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Database size={13} className="text-sky-500" /> Hash Basis Data Lokal (Canonical SHA-256)
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(data.latest_db_hash, 'db_hash')}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  {copiedKey === 'db_hash' ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                </button>
              </div>
              <code className="text-xs font-mono text-sky-600 dark:text-sky-300 break-all block">
                {data.latest_db_hash}
              </code>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0F2C59]/30 border border-slate-100 dark:border-[#1E3A5F] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Layers size={13} className="text-emerald-500" /> Hash Permanen di Smart Contract On-Chain
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(data.on_chain_hash || '', 'on_chain_hash')}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  {copiedKey === 'on_chain_hash' ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                </button>
              </div>
              <code className="text-xs font-mono text-emerald-600 dark:text-emerald-400 break-all block">
                {data.on_chain_hash || 'Belum dijangkarkan ke Smart Contract'}
              </code>
            </div>
          </div>

          {/* Grid Metadata Blok */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0F2C59]/20 border border-slate-100 dark:border-[#1E3A5F]">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Nomor Blok EVM</span>
              <span className="text-sm font-mono font-bold text-[#081D35] dark:text-white mt-0.5 block">
                #{data.block_number || 'N/A'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0F2C59]/20 border border-slate-100 dark:border-[#1E3A5F]">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Network Chain ID</span>
              <span className="text-sm font-mono font-bold text-[#081D35] dark:text-white mt-0.5 block">
                {data.network_chain_id} (EVM Maluku)
              </span>
            </div>
          </div>

          {/* Smart Contract & Tx Hash */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0F2C59]/30 border border-slate-100 dark:border-[#1E3A5F] space-y-2 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                Alamat Smart Contract (SpiceRegistry)
              </span>
              <code className="text-[11px] font-mono text-[#F4B75E] break-all block mt-0.5">
                {data.contract_address}
              </code>
            </div>
            {data.transaction_hash && (
              <div className="pt-2 border-t border-slate-200/50 dark:border-[#1E3A5F]/50">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Transaction Receipt Hash
                </span>
                <code className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 break-all block mt-0.5">
                  {data.transaction_hash}
                </code>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-[#1E3A5F] bg-slate-50/80 dark:bg-[#0F2C59]/40 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#081D35] dark:bg-white text-white dark:text-[#081D35] hover:opacity-90 transition cursor-pointer"
          >
            Tutup Hasil Verifikasi
          </button>
        </div>
      </div>
    </div>
  )
}
