import { useState, useEffect } from "react";
import {
  Bell,
  Search,
  Database,
  CloudCheck,
  Globe,
  ChevronDown,
} from "lucide-react";
import { User, Language, Role } from "@/types";

interface TopBarProps {
  user: User;
  lang: Language;
  setLang: (l: Language) => void;
  role: Role;
}

export const TopBar: React.FC<TopBarProps> = ({
  user,
  lang,
  setLang,
  role,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsSyncing(true);
      setTimeout(() => setIsSyncing(false), 2000);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hidden md:flex h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 items-center justify-between px-8 fixed top-0 left-64 right-0 z-10">
      {/* Search Bar */}
      <div
        className={`flex items-center flex-1 max-w-md rounded-xl px-4 py-2.5 transition-all duration-200 ${
          searchFocused
            ? "bg-white shadow-lg shadow-slate-200/50 ring-2 ring-agri-500/20"
            : "bg-slate-100/80 hover:bg-slate-100"
        }`}
      >
        <Search
          className={`w-5 h-5 transition-colors ${searchFocused ? "text-agri-500" : "text-slate-400"}`}
        />
        <input
          type="text"
          placeholder={
            lang === Language.EN
              ? "Search sheep, investments..."
              : "Cari domba, investasi..."
          }
          className="bg-transparent border-none focus:outline-none ml-3 w-full text-sm text-slate-700 placeholder:text-slate-400"
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        />
        <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-semibold text-slate-400 bg-slate-200/80 rounded">
          ⌘K
        </kbd>
      </div>

      <div className="flex items-center space-x-4">
        {/* DB Sync Indicator */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 ${
            isSyncing
              ? "bg-agri-50 border border-agri-200"
              : "bg-blue-50 border border-blue-100"
          }`}
        >
          {isSyncing ? (
            <Database size={14} className="text-agri-600 animate-pulse" />
          ) : (
            <CloudCheck size={14} className="text-blue-600" />
          )}
          <span
            className={`text-[10px] font-bold uppercase tracking-tight ${
              isSyncing ? "text-agri-600" : "text-blue-600"
            }`}
          >
            {isSyncing ? "Syncing..." : "Connected"}
          </span>
        </div>

        {/* Role Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100/80 rounded-full">
          <div
            className={`w-2 h-2 rounded-full ${
              role === Role.OWNER
                ? "bg-agri-500"
                : role === Role.STAFF
                  ? "bg-blue-500"
                  : role === Role.INVESTOR
                    ? "bg-purple-500"
                    : "bg-slate-400"
            }`}
          />
          <span className="text-xs font-semibold text-slate-600 capitalize">
            {role.toLowerCase()}
          </span>
        </div>

        {/* Language Toggle */}
        <button
          onClick={() =>
            setLang(lang === Language.EN ? Language.ID : Language.EN)
          }
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100/80 hover:bg-slate-200/80 transition-colors"
        >
          <Globe size={14} className="text-slate-500" />
          <span className="text-xs font-bold text-slate-600">{lang}</span>
        </button>

        {/* Notifications */}
        <button className="relative p-2.5 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 transition-colors group">
          <Bell className="w-5 h-5 text-slate-500 group-hover:text-slate-700 transition-colors" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-slate-200/50">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-800">{user.name}</p>
            <p className="text-xs text-slate-500">{user.id}</p>
          </div>
          <div className="relative group">
            <img
              src={
                user.avatarUrl ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=16a34a&color=fff`
              }
              alt="Profile"
              className="w-10 h-10 rounded-xl border-2 border-white shadow-md object-cover ring-2 ring-slate-100 group-hover:ring-agri-200 transition-all"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-agri-500 rounded-full ring-2 ring-white"></div>
          </div>
          <ChevronDown size={16} className="text-slate-400" />
        </div>
      </div>
    </div>
  );
};
