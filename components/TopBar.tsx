import React, { useState, useEffect } from 'react';
import { Bell, Search, Database, CloudCheck } from 'lucide-react';
import { User, Language, Role } from '../types';

interface TopBarProps {
  user: User;
  lang: Language;
  setLang: (l: Language) => void;
  role: Role;
  setRole: (r: Role) => void;
}

export const TopBar: React.FC<TopBarProps> = ({ user, lang, setLang, role, setRole }) => {
  const [isSyncing, setIsSyncing] = useState(false);

  // Simulate periodic sync activity to provide "interaction" feedback
  useEffect(() => {
    const interval = setInterval(() => {
      setIsSyncing(true);
      setTimeout(() => setIsSyncing(false), 2000);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hidden md:flex h-16 bg-white border-b border-slate-200 items-center justify-between px-8 fixed top-0 left-64 right-0 z-10">
      <div className="flex items-center flex-1 max-w-md bg-slate-100 rounded-lg px-3 py-2">
        <Search className="text-slate-400 w-5 h-5" />
        <input
          type="text"
          placeholder={lang === Language.EN ? "Search sheep, investments..." : "Cari domba, investasi..."}
          className="bg-transparent border-none focus:outline-none ml-2 w-full text-sm text-slate-700"
        />
      </div>

      <div className="flex items-center space-x-6">
        {/* DB Sync Indicator */}
        <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-100 rounded-full">
           {isSyncing ? (
             <Database size={14} className="text-agri-500 animate-pulse" />
           ) : (
             <CloudCheck size={14} className="text-blue-500" />
           )}
           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
             {isSyncing ? 'Syncing...' : 'Connected'}
           </span>
        </div>

        {/* Role Switcher */}
        <select 
          value={role} 
          onChange={(e) => setRole(e.target.value as Role)}
          className="text-xs bg-slate-100 border border-slate-200 rounded px-2 py-1 text-slate-600 focus:ring-0 cursor-pointer"
        >
          <option value={Role.OWNER}>Owner View</option>
          <option value={Role.STAFF}>Staff View</option>
          <option value={Role.INVESTOR}>Investor View</option>
        </select>

        <button 
          onClick={() => setLang(lang === Language.EN ? Language.ID : Language.EN)}
          className="text-sm font-medium text-slate-600 hover:text-agri-600 w-8"
        >
          {lang}
        </button>

        <button className="relative text-slate-500 hover:text-slate-700 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>

        <div className="flex items-center space-x-3 pl-6 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-800">{user.name}</p>
            <p className="text-xs text-slate-500 capitalize">{role.toLowerCase()}</p>
          </div>
          <img src={user.avatarUrl} alt="Profile" className="w-9 h-9 rounded-full border border-slate-200 object-cover" />
        </div>
      </div>
    </div>
  );
};