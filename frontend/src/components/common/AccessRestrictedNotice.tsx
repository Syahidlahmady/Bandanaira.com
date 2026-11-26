import React from 'react'
import { ShieldAlert, ArrowLeft, Users } from 'lucide-react'

export interface AccessRestrictedNoticeProps {
  workspaceTitle?: string
  roleTitle: string
  currentRole?: string
  onBackToDashboard: () => void
  onOpenQuickSwitch?: () => void
}

export const AccessRestrictedNotice: React.FC<AccessRestrictedNoticeProps> = ({
  workspaceTitle,
  roleTitle,
  currentRole = 'Pengguna Terdaftar',
  onBackToDashboard,
  onOpenQuickSwitch,
}) => {
  return (
    <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-2xl border border-amber-200/80 shadow-md text-center">
      <div className="w-16 h-16 mx-auto mb-4 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 border border-amber-200/60 shadow-xs">
        <ShieldAlert size={32} />
      </div>
      <h3 className="text-xl font-bold font-serif text-[#081d35] mb-2">
        Akses {workspaceTitle ? `"${workspaceTitle}"` : 'Ruang Kerja'} Dibatasi
      </h3>
      <p className="text-sm text-slate-600 mb-6 leading-relaxed">
        Ruang kerja ini memuat tata kelola khusus dan ditujukan untuk peran{' '}
        <span className="font-semibold text-[#081d35] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
          {roleTitle}
        </span>
        . Peran akun aktif Anda saat ini:{' '}
        <span className="font-semibold text-slate-800">{currentRole}</span>.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onBackToDashboard}
          className="px-5 py-2.5 bg-[#081D35] text-white font-bold rounded-xl hover:bg-[#0c2a4d] transition-all text-xs flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <ArrowLeft size={14} className="text-[#F4B75E]" />
          <span>Kembali ke Ringkasan Dasbor</span>
        </button>

        {onOpenQuickSwitch && (
          <button
            type="button"
            onClick={onOpenQuickSwitch}
            className="px-5 py-2.5 bg-amber-50 text-amber-900 border border-amber-300 font-semibold rounded-xl hover:bg-amber-100 transition-all text-xs flex items-center gap-2"
          >
            <Users size={14} />
            <span>Ganti Akun Demo / Simulator</span>
          </button>
        )}
      </div>
    </div>
  )
}
