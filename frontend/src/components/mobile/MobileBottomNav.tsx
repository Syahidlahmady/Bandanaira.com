import React from 'react';
import {
  LayoutDashboard,
  Users,
  Coins,
  MapPin,
  HeartPulse
} from 'lucide-react';
import { TabId } from '../../App.tsx';

interface MobileBottomNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange
}) => {
  const navItems: Array<{
    id: TabId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }> = [
    {
      id: 'dashboard',
      label: 'Dasbor',
      icon: LayoutDashboard
    },
    {
      id: 'population',
      label: 'Warga NIK',
      icon: Users
    },
    {
      id: 'koperasi',
      label: 'Koperasi',
      icon: Coins
    },
    {
      id: 'gis',
      label: 'Peta GIS',
      icon: MapPin
    },
    {
      id: 'faskes',
      label: 'Faskes',
      icon: HeartPulse,
      badge: 'SOS'
    }
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#081D35] border-t border-slate-700/80 shadow-[0_-4px_20px_rgba(0,0,0,0.3)] pb-[env(safe-area-inset-bottom)]"
      aria-label="Navigasi Bawah Mobile"
    >
      <div className="grid grid-cols-5 h-16 max-w-md mx-auto items-center px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center h-full w-full py-1 relative transition-all active:scale-95 ${
                isActive ? 'text-[#F4B75E]' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'
                  }`}
                />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-3.5 px-1 py-0.2 rounded-full text-[9px] font-extrabold bg-red-600 text-white animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] mt-1 font-medium tracking-tight ${
                  isActive ? 'font-bold text-[#F4B75E]' : 'text-slate-400'
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#F4B75E]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
