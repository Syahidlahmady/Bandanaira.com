import React from 'react';
import { CheckCircle2, Clock, ShieldCheck, AlertCircle, WifiOff, RefreshCw } from 'lucide-react';

export type StatusVariant = 'verified' | 'pending' | 'confirmed' | 'danger' | 'offline' | 'synced' | 'default';

export interface BadgeStatusProps {
  status: StatusVariant | string;
  label?: string;
  className?: string;
  showIcon?: boolean;
}

export const BadgeStatus: React.FC<BadgeStatusProps> = ({
  status,
  label,
  className = '',
  showIcon = true,
}) => {
  const normalized = status.toLowerCase();

  let badgeClass = 'badge-secondary';
  let IconComponent = CheckCircle2;
  let defaultLabel = status;

  switch (normalized) {
    case 'verified':
    case 'terverifikasi':
    case 'aktif':
      badgeClass = 'badge-green';
      IconComponent = ShieldCheck;
      defaultLabel = label || 'Terverifikasi';
      break;

    case 'pending':
    case 'menunggu':
    case 'proses':
      badgeClass = 'badge-amber';
      IconComponent = Clock;
      defaultLabel = label || 'Menunggu';
      break;

    case 'confirmed':
    case 'sukses':
    case 'selesai':
      badgeClass = 'badge-blue';
      IconComponent = CheckCircle2;
      defaultLabel = label || 'Terkonfirmasi';
      break;

    case 'danger':
    case 'gagal':
    case 'ditolak':
    case 'batal':
      badgeClass = 'badge-red';
      IconComponent = AlertCircle;
      defaultLabel = label || 'Ditolak';
      break;

    case 'offline':
    case 'lokal':
      badgeClass = 'badge-secondary';
      IconComponent = WifiOff;
      defaultLabel = label || 'Offline';
      break;

    case 'synced':
    case 'tersinkron':
      badgeClass = 'badge-cyan';
      IconComponent = RefreshCw;
      defaultLabel = label || 'Tersinkron';
      break;

    default:
      badgeClass = 'badge-secondary';
      defaultLabel = label || status;
      break;
  }

  return (
    <span className={`badge ${badgeClass} ${className}`}>
      {showIcon && <IconComponent className="w-3.5 h-3.5 shrink-0" />}
      <span>{label || defaultLabel}</span>
    </span>
  );
};

export default BadgeStatus;
