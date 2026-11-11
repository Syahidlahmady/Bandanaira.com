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
  if (!occ) return <span style={{ color: '#64748b', fontSize: '0.8rem' }}>- Belum Diisi -</span>
  const lower = occ.toLowerCase()
  if (lower.includes('pala')) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          background: 'rgba(16, 185, 129, 0.15)',
          color: '#34d399',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          padding: '0.2rem 0.6rem',
          borderRadius: '12px',
          fontSize: '0.75rem',
          fontWeight: 700,
          boxShadow: '0 0 10px rgba(16, 185, 129, 0.1)',
        }}
      >
        🌿 {occ}
      </span>
    )
  }
  if (lower.includes('nelayan') || lower.includes('laut') || lower.includes('ikan')) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          background: 'rgba(6, 182, 212, 0.15)',
          color: '#38bdf8',
          border: '1px solid rgba(6, 182, 212, 0.35)',
          padding: '0.2rem 0.6rem',
          borderRadius: '12px',
          fontSize: '0.75rem',
          fontWeight: 700,
          boxShadow: '0 0 10px rgba(6, 182, 212, 0.1)',
        }}
      >
        🐟 {occ}
      </span>
    )
  }
  if (lower.includes('cengkeh')) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          background: 'rgba(245, 158, 11, 0.15)',
          color: '#fbbf24',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          padding: '0.2rem 0.6rem',
          borderRadius: '12px',
          fontSize: '0.75rem',
          fontWeight: 700,
          boxShadow: '0 0 10px rgba(245, 158, 11, 0.1)',
        }}
      >
        🌾 {occ}
      </span>
    )
  }
  if (lower.includes('fuli') || lower.includes('pengolah') || lower.includes('rempah')) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          background: 'rgba(244, 63, 94, 0.15)',
          color: '#fb7185',
          border: '1px solid rgba(244, 63, 94, 0.35)',
          padding: '0.2rem 0.6rem',
          borderRadius: '12px',
          fontSize: '0.75rem',
          fontWeight: 700,
          boxShadow: '0 0 10px rgba(244, 63, 94, 0.1)',
        }}
      >
        🌺 {occ}
      </span>
    )
  }
  if (lower.includes('wisata') || lower.includes('pemandu') || lower.includes('turis')) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          background: 'rgba(168, 85, 247, 0.15)',
          color: '#c084fc',
          border: '1px solid rgba(168, 85, 247, 0.35)',
          padding: '0.2rem 0.6rem',
          borderRadius: '12px',
          fontSize: '0.75rem',
          fontWeight: 700,
          boxShadow: '0 0 10px rgba(168, 85, 247, 0.1)',
        }}
      >
        ⛵ {occ}
      </span>
    )
  }
  if (lower.includes('desa') || lower.includes('asn') || lower.includes('aparatur') || lower.includes('guru') || lower.includes('pendidik')) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          background: 'rgba(148, 163, 184, 0.15)',
          color: '#e2e8f0',
          border: '1px solid rgba(148, 163, 184, 0.35)',
          padding: '0.2rem 0.6rem',
          borderRadius: '12px',
          fontSize: '0.75rem',
          fontWeight: 700,
        }}
      >
        🏛️ {occ}
      </span>
    )
  }
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        background: 'rgba(255, 255, 255, 0.08)',
        color: '#cbd5e1',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        padding: '0.2rem 0.6rem',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: 500,
      }}
    >
      👤 {occ}
    </span>
  )
}
