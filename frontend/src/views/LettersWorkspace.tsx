import React, { useState } from 'react'
import {
  Mail,
  Check,
  X,
  Printer,
  FileText,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import { AdministrativeRequestItem } from '../services/population'
import { getOccupationBadge } from '../components/OccupationBadge'

interface LettersWorkspaceProps {
  adminRequests: AdministrativeRequestItem[]
  requestFilterStatus: string
  setRequestFilterStatus: (st: string) => void
  updatingRequestId: string | null
  handleUpdateRequestStatus: (id: string, status: 'approved' | 'rejected') => void
  letterActionMsg: { type: 'success' | 'error'; text: string } | null
}

export const LettersWorkspace: React.FC<LettersWorkspaceProps> = ({
  adminRequests,
  requestFilterStatus,
  setRequestFilterStatus,
  updatingRequestId,
  handleUpdateRequestStatus,
  letterActionMsg,
}) => {
  const [printLetter, setPrintLetter] = useState<AdministrativeRequestItem | null>(null)

  const handlePrint = (req: AdministrativeRequestItem) => {
    setPrintLetter(req)
  }

  const triggerBrowserPrint = () => {
    window.print()
  }

  return (
    <section className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs animate-fade-in text-[#081D35] mb-8">
      {/* Header Bar Sesuai Gaya Redesain */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E2E8F0] mb-6">
        <div className="flex items-center gap-4">
          <div className="size-13 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 shadow-sm">
            <Mail size={24} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#2563EB] uppercase tracking-wider block">
              PELAYANAN ADMINISTRASI DESA
            </span>
            <h2 className="text-xl sm:text-2xl font-black font-serif text-[#081D35] tracking-tight mt-0.5">
              Kotak Masuk Pelayanan Surat Warga (Inbox Desa)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verifikasi dan terbitkan surat keterangan usaha (Petani Pala, Nelayan, Fuli, Homestay &amp; Wisata) dan surat domisili/lapor tamu desa.
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { st: '', label: 'Semua' },
            { st: 'submitted', label: 'Menunggu' },
            { st: 'approved', label: 'Disetujui' },
            { st: 'rejected', label: 'Ditolak' },
          ].map(({ st, label }) => {
            const count = st === '' ? adminRequests.length : adminRequests.filter((r) => r.status === st).length
            const active = requestFilterStatus === st
            return (
              <button
                key={st}
                type="button"
                onClick={() => setRequestFilterStatus(st)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition flex items-center gap-2 ${
                  active
                    ? 'bg-[#2563EB] text-white font-bold shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    active ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {letterActionMsg && (
        <div
          className={`p-3.5 rounded-xl mb-5 flex items-center gap-2.5 text-xs font-semibold animate-fade-in ${
            letterActionMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {letterActionMsg.type === 'success' ? (
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          ) : (
            <X size={16} className="text-rose-600 shrink-0" />
          )}
          <span>{letterActionMsg.text}</span>
        </div>
      )}

      {/* Requests Table */}
      <div className="overflow-x-auto rounded-xl border border-[#E2E8F0]">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-[#E2E8F0] text-slate-500 uppercase font-bold text-[10px] tracking-wider">
            <tr>
              <th className="py-3 px-4">Warga Pemohon</th>
              <th className="py-3 px-4">Profesi</th>
              <th className="py-3 px-4">Jenis Surat yang Diminta</th>
              <th className="py-3 px-4">Keperluan / Catatan</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-center">Tindakan Perangkat Desa</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {adminRequests
              .filter((req) => !requestFilterStatus || req.status === requestFilterStatus)
              .map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-[#081D35] block text-sm">
                      {req.resident_name || 'Warga Terdaftar'}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {req.resident_nik || '-'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">{getOccupationBadge(req.resident_occupation)}</td>
                  <td className="py-3.5 px-4 font-semibold text-[#081D35]">
                    <div className="flex items-center gap-1.5 text-[#2563EB]">
                      <FileText size={15} />
                      <span>{req.request_type}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 text-xs max-w-xs leading-relaxed">
                    {req.notes || '-'}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        req.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : req.status === 'submitted'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {req.status === 'approved' ? (
                        <>
                          <CheckCircle2 size={12} /> Disetujui
                        </>
                      ) : req.status === 'submitted' ? (
                        <>
                          <Clock size={12} /> Menunggu
                        </>
                      ) : (
                        <>
                          <X size={12} /> Ditolak
                        </>
                      )}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {req.status === 'submitted' ? (
                      <div className="inline-flex gap-2">
                        <button
                          type="button"
                          disabled={updatingRequestId === req.id}
                          onClick={() => handleUpdateRequestStatus(req.id, 'approved')}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1 shadow-2xs cursor-pointer"
                        >
                          <Check size={13} /> {updatingRequestId === req.id ? '...' : 'Setujui'}
                        </button>
                        <button
                          type="button"
                          disabled={updatingRequestId === req.id}
                          onClick={() => handleUpdateRequestStatus(req.id, 'rejected')}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition flex items-center gap-1 shadow-2xs cursor-pointer"
                        >
                          <X size={13} /> {updatingRequestId === req.id ? '...' : 'Tolak'}
                        </button>
                      </div>
                    ) : req.status === 'approved' ? (
                      <button
                        type="button"
                        onClick={() => handlePrint(req)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#2563EB] hover:bg-blue-700 text-white transition inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
                      >
                        <Printer size={13} /> Cetak Surat
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Ditolak</span>
                    )}
                  </td>
                </tr>
              ))}
            {adminRequests.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 px-4 text-slate-400">
                  <div className="text-3xl mb-2">📬</div>
                  <p className="font-bold text-[#081D35] text-base">Belum ada permohonan surat masuk</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Warga dapat mengajukan permohonan SKU atau surat domisili secara mandiri melalui Portal Warga.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL CETAK SURAT RESMI DESA (Official Paper Output) */}
      {printLetter && (
        <div
          className="modal-backdrop fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setPrintLetter(null)}
        >
          <div
            className="modal-content animate-fade-in w-full max-w-2xl bg-white text-slate-900 rounded-2xl p-8 shadow-2xl relative"
            style={{ fontFamily: 'serif' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Action Bar (Not printed) */}
            <div className="flex items-center justify-between pb-3 mb-6 border-b border-slate-200 no-print font-sans">
              <span className="text-xs font-bold text-slate-500">
                Pratinjau Format Surat Resmi Kantor Desa Banda Neira
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={triggerBrowserPrint}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#2563EB] hover:bg-blue-700 text-white transition flex items-center gap-1 cursor-pointer"
                >
                  <Printer size={13} /> Cetak / PDF
                </button>
                <button
                  type="button"
                  onClick={() => setPrintLetter(null)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>

            {/* KOP SURAT DESA RESMI */}
            <div className="text-center border-b-2 border-slate-900 pb-3 mb-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-700">
                PEMERINTAH KABUPATEN MALUKU TENGAH
              </h3>
              <h4 className="text-xs uppercase font-bold text-slate-700">
                KECAMATAN KEPULAUAN BANDA
              </h4>
              <h2 className="text-base font-black uppercase text-slate-900 mt-0.5">
                KANTOR KEPALA DESA BANDA NEIRA
              </h2>
              <p className="text-[11px] italic text-slate-600 mt-0.5">
                Jalan Nusantara No. 01, Banda Neira, Kepulauan Banda, Maluku Tengah 97593
              </p>
            </div>

            {/* JUDUL SURAT */}
            <div className="text-center mb-5">
              <h3 className="text-sm font-bold uppercase underline tracking-wide text-slate-900">
                {printLetter.request_type}
              </h3>
              <p className="text-xs text-slate-600 font-sans mt-0.5">
                Nomor: 503/{printLetter.id.substring(0, 5).toUpperCase()}/KD-BN/{new Date().getFullYear()}
              </p>
            </div>

            {/* ISI SURAT */}
            <div className="text-xs leading-relaxed text-slate-800 space-y-3">
              <p className="indent-6">
                Yang bertanda tangan di bawah ini, Kepala Desa Banda Neira, Kecamatan Kepulauan Banda, Kabupaten Maluku Tengah, dengan ini menerangkan bahwa:
              </p>

              <table className="w-full ml-4 text-xs">
                <tbody>
                  <tr>
                    <td className="w-36 py-1 text-slate-600">Nama Lengkap</td>
                    <td className="py-1">: <b className="text-slate-900">{printLetter.resident_name || 'Ahmad Baadilla'}</b></td>
                  </tr>
                  <tr>
                    <td className="py-1 text-slate-600">NIK</td>
                    <td className="py-1 font-mono">: {printLetter.resident_nik || '-'}</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-slate-600">Mata Pencaharian</td>
                    <td className="py-1">: {printLetter.resident_occupation || 'Petani Rempah Pala'}</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-slate-600">Alamat / Domisili</td>
                    <td className="py-1">: Desa Banda Neira, Kec. Kepulauan Banda, Kab. Maluku Tengah</td>
                  </tr>
                </tbody>
              </table>

              <p className="indent-6">
                Adalah benar yang bersangkutan merupakan warga penduduk yang berdomisili sah di wilayah Desa Banda Neira dan benar menjalankan kegiatan usaha/mata pencaharian sebagaimana tercatat di atas.
              </p>

              <p className="indent-6">
                Surat keterangan ini diberikan atas permohonan yang bersangkutan untuk keperluan: <b>{printLetter.notes || 'Pengajuan Persyaratan Administrasi & Modal Usaha'}</b>.
              </p>

              <p className="indent-6">
                Demikian surat keterangan ini kami buat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya.
              </p>
            </div>

            {/* TANDA TANGAN & STEMPEL */}
            <div className="flex justify-end mt-8 text-center text-xs">
              <div className="min-w-48">
                <p>Banda Neira, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p className="font-bold mt-1 mb-14">KEPALA DESA BANDA NEIRA,</p>
                <p className="font-bold underline">M. SYAFI'I BAADILLA</p>
                <p className="text-[10px] text-slate-500">NIP. 19780512 200501 1 004</p>
              </div>
            </div>

            {/* FOOTER VERIFIKASI KEASLIAN DIGITAL */}
            <div className="mt-6 pt-3 border-t border-dashed border-slate-300 flex items-center justify-between text-[10px] text-slate-500 font-sans">
              <div>
                <span>🛡️ Terdaftar di <b>Ekosistem Digital Banda Neira</b></span><br />
                <span>ID Dokumen: {printLetter.id}</span>
              </div>
              <span className="text-emerald-700 font-bold">✓ Keabsahan Dokumen Terverifikasi</span>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
export default LettersWorkspace
