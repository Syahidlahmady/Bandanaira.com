import React from 'react'
import { NavTabType } from '../../landing/BandanairaBeranda'

export type DashboardNavTab = NavTabType | 'landing' | 'dashboard' | 'marketplace'

export type RoleKey =
  | 'admin'
  | 'village_officer'
  | 'farmer_group_admin'
  | 'farmer'
  | 'resident'
  | 'coop_manager'
  | 'homestay_operator'
  | 'smart_tourism_admin'
  | 'field_surveyor'
  | 'tourist'

export interface RoleDashboardProfile {
  key: RoleKey
  name: string
  shortBadge: string
  tagline: string
  kpis: [
    { title: string; value: string; trend: string; icon: React.ComponentType<any>; color: string },
    { title: string; value: string; trend: string; icon: React.ComponentType<any>; color: string },
    { title: string; value: string; trend: string; icon: React.ComponentType<any>; color: string },
    { title: string; value: string; trend: string; icon: React.ComponentType<any>; color: string }
  ]
  lineChart: {
    title: string
    series1Name: string
    series2Name: string
    series1Color: string
    series2Color: string
    data: Array<{ label: string; v1: number; v2: number }>
    endPoint1: string
    endPoint2: string
    yDomain: [number, number]
    yTicks: number[]
  }
  donutChart: {
    title: string
    subtitle: string
    centerLabel: string
    centerValue: string
    data: Array<{ name: string; percentage: string; value: number; color: string }>
  }
  workspace1: {
    title: string
    buttonText: string
    targetTab: DashboardNavTab
    items: Array<{ id: number; name: string; stat: string; percent: number }>
  }
  workspace2: {
    title: string
    targetTab: DashboardNavTab
    highlightText: string
    subtext: string
  }
  workspace3: {
    title: string
    subtitle: string
    mainValue: string
    trend: string
    badgeText: string
    buttonText: string
    targetTab: DashboardNavTab
    bars: Array<{ label: string; value: number }>
  }
  transparencyPoints: Array<{
    title: string
    desc: string
    icon: React.ComponentType<any>
    color: string
    bgColor: string
  }>
  exportFilenamePrefix: string
}

export interface RoleViewProps {
  currentUser?: any
  profile: RoleDashboardProfile
  onNavigate: (tab: DashboardNavTab) => void
  onOpenMarketplace: () => void
  onPublicVerify: (token: string) => void
  handleExportData: (format: 'csv' | 'json' | 'xlsx' | 'api') => void
  quickVerifyInput: string
  setQuickVerifyInput: (val: string) => void
  handleVerifySubmit: (e: React.FormEvent) => void
  showModuleLaunchpad: boolean
  setShowModuleLaunchpad: (val: boolean | ((prev: boolean) => boolean)) => void
  isOnline?: boolean
}
