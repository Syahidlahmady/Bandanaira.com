import React from 'react'
import { User } from '../services/auth'
import { CheckCircle2, Clock, Send, FileText, UserCheck } from 'lucide-react'

interface CitizenPortalWorkspaceProps {
  currentUser: User | null
  letters: Array<{ id: number; type: string; purpose: string; date: string; status: 'menunggu' | 'disetujui' }>
  showLetterForm: boolean
  setShowLetterForm: (b: boolean) => void
  letterTypeInput: string
  setLetterTypeInput: (s: string) => void
  letterPurposeInput: string
  setLetterPurposeInput: (s: string) => void
  handleSubmitLetter: (e: React.FormEvent) => void
  letterSuccessNotice: string | null
}

export const CitizenPortalWorkspace: React.FC<CitizenPortalWorkspaceProps> = ({
  currentUser,
  letters,
  showLetterForm,
  setShowLetterForm,
  letterTypeInput,
  setLetterTypeInput,
  letterPurposeInput,
  setLetterPurposeInput,
  handleSubmitLetter,
  letterSuccessNotice,
}) => {
  return (
    <section className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs animate-fade-in text-[#081D35] mb-8">
      {/* Header Bar Sesuai Gaya Redesain */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E2E8F0] mb-6">
        <div className="flex items-center gap-4">
          <div className="size-13 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 shadow-sm">
            <UserCheck size={24} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#2563EB] uppercase tracking-wider block">
              PORTAL MANDIRI WARGA
            </span>
            <h2 className="text-xl sm:text-2xl font-black font-serif text-[#081D35] tracking-tight mt-0.5">
              Pelayanan Administrasi Warga Mandiri
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Akses layanan pengajuan surat kependudukan, SKU rempah, dan verifikasi identitas resmi kantor desa.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Profile Card */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="size-8 rounded-full bg-[#081D35] text-[#F4B75E] flex items-center justify-center font-bold text-xs">
                {(currentUser?.full_name || 'W').slice(0, 2).toUpperCase()}
              </div>
              <h3 className="text-sm font-bold text-[#081D35]">
                Profil Kependudukan Terverifikasi
              </h3>
            </div>
            <div className="space-y-2.5 text-xs text-slate-600">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Nama Lengkap
                </span>
                <b className="text-sm text-[#081D35]">{currentUser?.full_name || 'Ahmad Baadilla'}</b>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Email / ID Akun
                </span>
                <span className="font-mono text-slate-700">{currentUser?.email || 'warga@bandanaira.id'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Hak Akses Sistem
                </span>
                <span className="text-slate-800 font-semibold">Warga Masyarakat Desa (Resident RBAC)</span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-200 flex items-center gap-1.5 text-xs font-bold text-emerald-700">
            <CheckCircle2 size={14} className="text-emerald-600" />
            <span>Identitas Sah Terdaftar di Kantor Desa</span>
          </div>
        </div>

        {/* Action Card */}
        <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="size-8 rounded-full bg-[#2563EB] text-white flex items-center justify-center">
                <FileText size={16} />
              </div>
              <h3 className="text-sm font-bold text-[#081D35]">
                Pengajuan Surat Mandiri
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              Ajukan permohonan surat keterangan usaha &amp; domisili secara digital tanpa perlu antre fisik di kantor desa.
            </p>
            <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
              <li>Surat Keterangan Usaha Petani Rempah (SKU)</li>
              <li>Surat Keterangan Usaha Nelayan Tradisional</li>
              <li>Surat Keterangan Domisili Tempat Tinggal</li>
            </ul>
          </div>
          <button
            type="button"
            onClick={() => setShowLetterForm(!showLetterForm)}
            className="mt-4 w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-[#2563EB] hover:bg-blue-700 text-white transition flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
          >
            {showLetterForm ? '✕ Tutup Formulir' : '➕ Ajukan Permohonan Surat Baru'}
          </button>
        </div>
      </div>

      {/* Form Pengajuan Surat Interaktif */}
      {showLetterForm && (
        <div className="mt-6 p-6 rounded-2xl bg-slate-50 border border-[#CBD5E1] shadow-xs animate-fade-in">
          <h4 className="text-sm font-bold text-[#081D35] mb-4 flex items-center gap-2">
            <FileText size={16} className="text-[#2563EB]" />
            Formulir Pengajuan Surat Mandiri
          </h4>
          <form onSubmit={handleSubmitLetter} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Surat yang Dibutuhkan</label>
              <select
                value={letterTypeInput}
                onChange={(e) => setLetterTypeInput(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#CBD5E1] bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              >
                <option value="Surat Keterangan Usaha Petani Rempah Pala & Cengkeh (SKU)">Surat Keterangan Usaha Petani Rempah Pala &amp; Cengkeh (SKU)</option>
                <option value="Surat Keterangan Usaha Nelayan Tradisional Banda (SKU-N)">Surat Keterangan Usaha Nelayan Tradisional Banda (SKU-N)</option>
                <option value="Surat Keterangan Usaha Pengolah / Pedagang Fuli Merah">Surat Keterangan Usaha Pengolah / Pedagang Fuli Merah</option>
                <option value="Surat Keterangan Domisili Tempat Tinggal">Surat Keterangan Domisili Tempat Tinggal</option>
                <option value="Surat Pengantar Pembuatan KTP / Kartu Keluarga">Surat Pengantar Pembuatan KTP / Kartu Keluarga</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Keperluan / Catatan Tambahan</label>
              <input
                type="text"
                value={letterPurposeInput}
                onChange={(e) => setLetterPurposeInput(e.target.value)}
                placeholder="Contoh: Untuk persyaratan pengajuan KUR Pertanian di Bank Mandiri Banda..."
                required
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#CBD5E1] bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#2563EB] hover:bg-blue-700 text-white transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Send size={14} /> Kirim Permohonan ke Kantor Desa
              </button>
              <button
                type="button"
                onClick={() => setShowLetterForm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 hover:bg-slate-300 text-slate-700 transition cursor-pointer"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {letterSuccessNotice && (
        <div className="mt-5 p-3.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-2 text-xs font-semibold animate-fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{letterSuccessNotice}</span>
        </div>
      )}

      {/* Daftar Riwayat Permohonan Surat */}
      <div className="mt-8">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Riwayat Pengajuan Surat Anda ({letters.length})
        </h4>
        <div className="space-y-3">
          {letters.map((letItem) => (
            <div
              key={letItem.id}
              className="p-4 rounded-xl border border-[#E2E8F0] bg-slate-50/50 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <b className="text-sm font-bold text-[#081D35] block">{letItem.type}</b>
                <span className="text-xs text-slate-500">
                  Keperluan: {letItem.purpose} • Tanggal: {letItem.date}
                </span>
              </div>
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold shrink-0 ${
                  letItem.status === 'disetujui'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}
              >
                {letItem.status === 'disetujui' ? (
                  <>
                    <CheckCircle2 size={12} /> Disetujui (Siap Cetak)
                  </>
                ) : (
                  <>
                    <Clock size={12} /> Sedang Ditinjau Petugas
                  </>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
export default CitizenPortalWorkspace
