import React from 'react';
import { LayoutDashboard, Users, ShoppingBag, Camera, PiggyBank, Sprout, Settings } from 'lucide-react';
import { Role, Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface SidebarProps {
  currentTab: string;
  setTab: (tab: string) => void;
  role: Role;
  lang: Language;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setTab, role, lang }) => {
  const t = TRANSLATIONS[lang];

  const menuItems = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard, roles: [Role.OWNER, Role.STAFF, Role.INVESTOR] },
    { id: 'sheep', label: t.sheep, icon: Sprout, roles: [Role.OWNER, Role.STAFF] },
    { id: 'investments', label: t.investments, icon: Users, roles: [Role.OWNER, Role.INVESTOR] },
    { id: 'marketplace', label: t.marketplace, icon: ShoppingBag, roles: [Role.OWNER, Role.STAFF, Role.INVESTOR, Role.GUEST] },
    { id: 'cctv', label: t.cctv, icon: Camera, roles: [Role.OWNER, Role.INVESTOR] },
    { id: 'qurban', label: t.qurban, icon: PiggyBank, roles: [Role.OWNER, Role.INVESTOR] },
    // Settings available for everyone now to access Logout/Profile
    { id: 'settings', label: 'Settings', icon: Settings, roles: [Role.OWNER, Role.STAFF, Role.INVESTOR, Role.GUEST] }, 
  ];

  return (
    <div className="hidden md:flex h-screen w-64 bg-white border-r border-slate-200 flex-col fixed left-0 top-0 z-10 shadow-sm">
      <div className="p-6 flex items-center space-x-3 border-b border-slate-100">
        <div className="w-8 h-8 bg-agri-600 rounded-lg flex items-center justify-center">
          <Sprout className="text-white w-5 h-5" />
        </div>
        <span className="text-xl font-bold text-slate-800 tracking-tight">Ali Farm</span>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          if (!item.roles.includes(role)) return null;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-agri-50 text-agri-700 font-medium shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer info or minimal section could go here, but redundant logout is removed */}
    </div>
  );
};