import React from 'react'
import { BandanairaBeranda, NavTabType } from './landing/BandanairaBeranda'

export interface LandingPortalWorkspaceProps {
  onNavigate: (tab: NavTabType, slugOrParam?: string) => void
  onOpenLogin: () => void
  onOpenMarketplace: () => void
  onPublicVerify: (token: string) => void
  currentUser: any
  isOnline?: boolean
  onLogout?: () => void
  onOpenQuickLogin?: () => void
}

export const LandingPortalWorkspace: React.FC<LandingPortalWorkspaceProps> = ({
  onNavigate,
  onOpenLogin,
  onOpenMarketplace,
  onPublicVerify,
  currentUser,
  isOnline = true,
  onLogout,
  onOpenQuickLogin,
}) => {
  return (
    <BandanairaBeranda
      onNavigate={onNavigate}
      onOpenLogin={onOpenLogin}
      onOpenMarketplace={onOpenMarketplace}
      onPublicVerify={onPublicVerify}
      currentUser={currentUser}
      isOnline={isOnline}
      onLogout={onLogout}
      onOpenQuickLogin={onOpenQuickLogin}
    />
  )
}

export default LandingPortalWorkspace
