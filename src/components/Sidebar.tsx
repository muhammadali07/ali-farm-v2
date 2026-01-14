import React from 'react';
import { LayoutDashboard, Users, ShoppingBag, Camera, PiggyBank, Sprout, Settings } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { Role, Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface SidebarProps {
  role: Role;
  lang: Language;
}

export const Sidebar: React.FC<SidebarProps> = ({ role, lang }) => {
  const t = TRANSLATIONS[lang];

  const menuItems = [
    { id: 'dashboard', path: '/dashboard', label: t.dashboard, icon: LayoutDashboard, roles: [Role.OWNER, Role.STAFF, Role.INVESTOR] },
    { id: 'sheep', path: '/sheep', label: t.sheep, icon: Sprout, roles: [Role.OWNER, Role.STAFF] },
    { id: 'investments', path: '/investments', label: t.investments, icon: Users, roles: [Role.OWNER, Role.INVESTOR] },
    { id: 'marketplace', path: '/marketplace', label: t.marketplace, icon: ShoppingBag, roles: [Role.OWNER, Role.STAFF, Role.INVESTOR, Role.GUEST] },
    { id: 'cctv', path: '/cctv', label: t.cctv, icon: Camera, roles: [Role.OWNER, Role.INVESTOR] },
    { id: 'qurban', path: '/qurban', label: t.qurban, icon: PiggyBank, roles: [Role.OWNER, Role.INVESTOR] },
    { id: 'settings', path: '/settings', label: 'Settings', icon: Settings, roles: [Role.OWNER, Role.STAFF, Role.INVESTOR, Role.GUEST] },
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
          return (
            <Link
              key={item.id}
              to={item.path}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200"
              activeProps={{
                className: 'bg-agri-50 text-agri-700 font-medium shadow-sm',
              }}
              inactiveProps={{
                className: 'text-slate-500 hover:bg-slate-50 hover:text-slate-900',
              }}
            >
              {({ isActive }) => (
                <>
                  <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  <span>{item.label}</span>
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer info or minimal section could go here */}
    </div>
  );
};