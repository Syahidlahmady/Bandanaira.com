import React from 'react'

export const BANDA_OCCUPATIONS = [
  'Petani Rempah Pala',
  'Nelayan Tangkap Tradisional',
  'Petani Cengkeh',
  'Pengolah & Pengering Fuli Merah',
  'Pedagang Rempah & Hasil Laut',
  'Pemandu Wisata Sejarah & Bahari',
  'Aparatur Desa / ASN',
  'Pendidik / Guru Sekolah',
  'Ibu Rumah Tangga',
  'Wiraswasta / Lainnya',
]

export const getOccupationBadge = (occ?: string): React.ReactNode => {
  if (!occ) return <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>- Belum Diisi -</span>
  const lower = occ.toLowerCase()
  if (lower.includes('pala')) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '0.2rem 0.55rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600' }}>
        🌿 {occ}
      </span>
    )
  }
  if (lower.includes('nelayan') || lower.includes('laut') || lower.includes('ikan')) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '0.2rem 0.55rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600' }}>
        🐟 {occ}
      </span>
    )
  }
  if (lower.includes('cengkeh')) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '0.2rem 0.55rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600' }}>
        🌾 {occ}
      </span>
    )
  }
  if (lower.includes('fuli') || lower.includes('pengolah') || lower.includes('rempah')) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#fff1f2', color: '#be123c', border: '1px solid #fecdd3', padding: '0.2rem 0.55rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600' }}>
        🌺 {occ}
      </span>
    )
  }
  if (lower.includes('wisata') || lower.includes('pemandu') || lower.includes('turis')) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#f5f3ff', color: '#6d28d9', border: '1px solid #ddd6fe', padding: '0.2rem 0.55rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600' }}>
        ⛵ {occ}
      </span>
    )
  }
  if (lower.includes('desa') || lower.includes('asn') || lower.includes('aparatur') || lower.includes('guru') || lower.includes('pendidik')) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '0.2rem 0.55rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600' }}>
        🏛️ {occ}
      </span>
    )
  }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', padding: '0.2rem 0.55rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '500' }}>
      👤 {occ}
    </span>
  )
}
