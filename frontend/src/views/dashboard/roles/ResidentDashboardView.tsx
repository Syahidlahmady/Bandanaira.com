import React, { useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  Droplets,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  Scale,
  ShieldCheck,
  X,
} from 'lucide-react'
import { authService } from '../../../services/auth'
import { RoleDashboardProfile, RoleViewProps } from './types'
import { BaseRoleDashboardView } from './BaseRoleDashboardView'

/**
 * Profil Data Konfigurasi: Warga Desa Kepulauan (resident)
 * Layanan Surat Mandiri, Kuota Air Bersih RO Harian, Tabungan Sampah & Transparansi Bansos
 */
export const residentProfile: RoleDashboardProfile = {
  key: 'resident',
  name: 'Warga Masyarakat Desa',
  shortBadge: 'Warga Banda',
  tagline: 'Layanan Surat Dinas Mandiri, Saldo Air Minum & Poin Bank Sampah',
  kpis: [
    { title: 'STATUS PERMOHONAN SURAT', value: '3 Pengajuan', trend: '▲ 2 Selesai, 1 Diproses', icon: Mail, color: '#2563EB' },
    { title: 'SALDO KUOTA AIR MINUM RO', value: '85 Liter', trend: '▲ Cukup untuk 1 pekan', icon: Droplets, color: '#0284C7' },
    { title: 'POIN LINGKUNGAN SAMPAH', value: '450 Poin', trend: '▲ Ditukar dari 45 kg botol', icon: Scale, color: '#059669' },
    { title: 'STATUS NIK KEPENDUDUKAN', value: 'Aktif Sah', trend: '▲ Terverifikasi Desa Neira', icon: ShieldCheck, color: '#0284C7' },
  ],
  lineChart: {
    title: 'RIWAYAT PENGAMBILAN AIR BERSIH RO (LITER/PEKAN)',
    series1Name: 'Jatah Air Minum RO Diambil',
    series2Name: 'Bonus Air dari Bank Sampah',
    series1Color: '#0284C7',
    series2Color: '#059669',
    data: [
      { label: 'Pekan 1', v1: 25, v2: 10 },
      { label: 'Pekan 2', v1: 30, v2: 15 },
      { label: 'Pekan 3', v1: 28, v2: 12 },
      { label: 'Pekan 4', v1: 35, v2: 20 },
      { label: 'Pekan 5', v1: 40, v2: 25 },
      { label: 'Pekan 6', v1: 45, v2: 30 },
    ],
    endPoint1: '45 Liter',
    endPoint2: '30 Liter',
    yDomain: [0, 50],
    yTicks: [0, 12.5, 25, 37.5, 50],
  },
  donutChart: {
    title: 'PENGGUNAAN KUOTA AIR RO KELUARGA',
    subtitle: 'Dispenser Otomatis Koperasi Hatta',
    centerLabel: 'Air Minum',
    centerValue: '68%',
    data: [
      { name: 'Kebutuhan Minum Sehari-hari', percentage: '68,00%', value: 68, color: '#0284C7' },
      { name: 'Memasak & Seduhan Rempah', percentage: '22,00%', value: 22, color: '#059669' },
      { name: 'Cadangan Darurat', percentage: '10,00%', value: 10, color: '#D97706' },
    ],
  },
  workspace1: {
    title: 'STATUS BERKAS SURAT SAYA',
    buttonText: 'Ajukan Surat Mandiri Baru',
    targetTab: 'letters',
    items: [
      { id: 1, name: 'Surat Keterangan Usaha (SKU KUR)', stat: 'Disetujui', percent: 100 },
      { id: 2, name: 'Surat Keterangan Domisili', stat: 'Sedang Diproses', percent: 65 },
      { id: 3, name: 'Permohonan Kuota Air Tambahan', stat: 'Disetujui', percent: 100 },
    ],
  },
  workspace2: {
    title: 'PETA DISPENSER AIR RO TERDEKAT',
    targetTab: 'gis',
    highlightText: 'Titik Terdekat: Pos Koperasi Neira (250m)',
    subtext: 'Buka 24 Jam dengan Kartu RFID',
  },
  workspace3: {
    title: 'TABUNGAN POIN BANK SAMPAH SAYA',
    subtitle: 'Penebusan Sembako & Kuota Air',
    mainValue: '450 Poin',
    trend: '▲ Setara Rp 45.000,- saldo belanja',
    badgeText: 'Eco-Hero',
    buttonText: 'Cek Saldo Koperasi',
    targetTab: 'koperasi',
    bars: [
      { label: 'Jan', value: 120 },
      { label: 'Feb', value: 180 },
      { label: 'Mar', value: 260 },
      { label: 'Apr', value: 350 },
      { label: 'Mei', value: 450 },
    ],
  },
  transparencyPoints: [
    { title: 'Layanan Surat Tanpa Pungli', desc: 'Seluruh penerbitan surat dinas resmi tidak dipungut biaya.', icon: CheckCircle2, color: '#059669', bgColor: 'bg-emerald-100' },
    { title: 'Hak Air Bersih Universal', desc: 'Setiap warga berhak atas air minum RO layak uji standar WHO.', icon: Droplets, color: '#0284C7', bgColor: 'bg-sky-100' },
    { title: 'Keamanan Data Pribadi NIK', desc: 'Nomor NIK dan berkas identitas Anda dienkripsi aman di server.', icon: ShieldCheck, color: '#2563EB', bgColor: 'bg-blue-100' },
    { title: 'Poin Daur Ulang Riil', desc: 'Poin dapat ditukarkan beras, minyak goreng, atau pulsa.', icon: Scale, color: '#D97706', bgColor: 'bg-amber-100' },
  ],
  exportFilenamePrefix: 'data_layanan_warga_bandanaira',
}

/**
 * Tampilan Dasbor Mandiri: Warga Desa Kepulauan (resident)
 */
export const ResidentDashboardView: React.FC<RoleViewProps> = (props) => {
  const profile = props.profile || residentProfile

  // Self-Service PIN Change States
  const [showChangePinModal, setShowChangePinModal] = useState(false)
  const [oldPin, setOldPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [showOldPin, setShowOldPin] = useState(false)
  const [showNewPin, setShowNewPin] = useState(false)
  const [changePinLoading, setChangePinLoading] = useState(false)
  const [changePinMsg, setChangePinMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  return (
    <BaseRoleDashboardView
      {...props}
      profile={profile}
      extraSideButtons={
        /* TOMBOL PINTAS KEAMANAN AKUN / GANTI PIN MANDIRI */
        <button
          type="button"
          onClick={() => {
            setShowChangePinModal(true)
            setChangePinMsg(null)
            setOldPin('')
            setNewPin('')
            setConfirmPin('')
          }}
          className="w-full min-h-[44px] py-2.5 px-3 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100/70 text-xs font-bold text-blue-900 flex items-center justify-center gap-2 transition shadow-2xs cursor-pointer"
        >
          <KeyRound size={15} className="text-blue-600 shrink-0" />
          <span>Keamanan Akun &amp; Ubah PIN</span>
        </button>
      }
      extraModals={
        /* =========================================================================
            MODAL UBAH PIN / KATA SANDI AKSES MANDIRI WARGA
        ========================================================================== */
        showChangePinModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-scale-in">
              {/* Header */}
              <div className="bg-[#081D35] text-white p-5 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-400/30 flex items-center justify-center">
                    <KeyRound size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold tracking-tight">Ubah PIN / Kata Sandi</h4>
                    <p className="text-[11px] text-slate-300">Keamanan Akun Layanan Mandiri Warga</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowChangePinModal(false)}
                  className="text-white/70 hover:text-white p-1 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form */}
              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  setChangePinMsg(null)

                  if (newPin !== confirmPin) {
                    setChangePinMsg({ type: 'error', text: 'Konfirmasi PIN baru tidak cocok.' })
                    return
                  }

                  if (newPin.length < 6) {
                    setChangePinMsg({ type: 'error', text: 'PIN baru minimal 6 karakter / digit angka.' })
                    return
                  }

                  try {
                    setChangePinLoading(true)
                    const res = await authService.changePassword(oldPin, newPin)
                    setChangePinMsg({ type: 'success', text: res.message || 'PIN berhasil diperbarui!' })
                    setTimeout(() => {
                      setShowChangePinModal(false)
                    }, 1800)
                  } catch (err: unknown) {
                    if (err instanceof Error) {
                      setChangePinMsg({ type: 'error', text: err.message })
                    } else {
                      setChangePinMsg({ type: 'error', text: 'Gagal memperbarui PIN' })
                    }
                  } finally {
                    setChangePinLoading(false)
                  }
                }}
                className="p-5 sm:p-6 space-y-4"
              >
                {changePinMsg && (
                  <div
                    className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                      changePinMsg.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {changePinMsg.type === 'success' ? (
                      <CheckCircle2 size={15} className="shrink-0 text-emerald-600" />
                    ) : (
                      <AlertCircle size={15} className="shrink-0 text-rose-600" />
                    )}
                    <span>{changePinMsg.text}</span>
                  </div>
                )}

                {/* PIN Lama */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">PIN / Kata Sandi Lama</label>
                  <div className="relative">
                    <input
                      type={showOldPin ? 'text' : 'password'}
                      value={oldPin}
                      onChange={(e) => setOldPin(e.target.value)}
                      required
                      className="w-full min-h-[44px] pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                      placeholder="Masukkan PIN lama Anda..."
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPin(!showOldPin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 min-h-[44px] flex items-center justify-center"
                    >
                      {showOldPin ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* PIN Baru */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">PIN / Kata Sandi Baru</label>
                  <div className="relative">
                    <input
                      type={showNewPin ? 'text' : 'password'}
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                      required
                      minLength={6}
                      className="w-full min-h-[44px] pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                      placeholder="Minimal 6 karakter / digit angka..."
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPin(!showNewPin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 min-h-[44px] flex items-center justify-center"
                    >
                      {showNewPin ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Konfirmasi PIN Baru */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Ulangi PIN Baru</label>
                  <input
                    type="password"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value)}
                    required
                    minLength={6}
                    className="w-full min-h-[44px] px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                    placeholder="Ketik ulang PIN baru..."
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowChangePinModal(false)}
                    className="min-h-[44px] px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={changePinLoading || !oldPin || !newPin || !confirmPin}
                    className="min-h-[44px] px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    {changePinLoading ? 'Menyimpan...' : 'Perbarui PIN'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }
    />
  )
}

export default ResidentDashboardView
