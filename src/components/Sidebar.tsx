import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Camera,
  PiggyBank,
  Sprout,
  Settings,
  LogOut,
  FileText,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Role, Language } from "@/types";
import { TRANSLATIONS } from "@/constants";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarProps {
  role: Role;
  lang: Language;
}

export const Sidebar: React.FC<SidebarProps> = ({ role, lang }) => {
  const t = TRANSLATIONS[lang];
  const { signOut, user } = useAuth();

  const menuItems = [
    {
      id: "dashboard",
      path: "/dashboard",
      label: t.dashboard,
      icon: LayoutDashboard,
      roles: [Role.OWNER, Role.STAFF, Role.INVESTOR],
    },
    {
      id: "sheep",
      path: "/sheep",
      label: t.sheep,
      icon: Sprout,
      roles: [Role.OWNER, Role.STAFF],
    },
    {
      id: "investments",
      path: "/investments",
      label: t.investments,
      icon: Users,
      roles: [Role.OWNER, Role.INVESTOR],
    },
    {
      id: "marketplace",
      path: "/marketplace",
      label: t.marketplace,
      icon: ShoppingBag,
      roles: [Role.OWNER, Role.STAFF, Role.INVESTOR, Role.GUEST],
    },
    {
      id: "cctv",
      path: "/cctv",
      label: t.cctv,
      icon: Camera,
      roles: [Role.OWNER, Role.INVESTOR],
    },
    {
      id: "qurban",
      path: "/qurban",
      label: t.qurban,
      icon: PiggyBank,
      roles: [Role.OWNER, Role.INVESTOR],
    },
    {
      id: "investor-contracts",
      path: "/investor-contracts",
      label: "Kelola Investor",
      icon: FileText,
      roles: [Role.OWNER],
    },
    {
      id: "my-investments",
      path: "/my-investments",
      label: "Investasi Saya",
      icon: FileText,
      roles: [Role.INVESTOR],
    },
    {
      id: "settings",
      path: "/settings",
      label: "Settings",
      icon: Settings,
      roles: [Role.OWNER, Role.STAFF, Role.INVESTOR, Role.GUEST],
    },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <div className="hidden md:flex h-screen w-64 bg-white/80 backdrop-blur-xl border-r border-slate-200/50 flex-col fixed left-0 top-0 z-10">
      {/* Logo */}
      <div className="p-6 flex items-center space-x-3 border-b border-slate-100/50">
        <div className="w-10 h-10 bg-gradient-to-br from-agri-500 to-agri-700 rounded-xl flex items-center justify-center shadow-lg shadow-agri-500/20">
          <Sprout className="text-white w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Ali Farm
          </span>
          <span className="text-[10px] text-slate-400 font-medium -mt-0.5">
            Smart Livestock Platform
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-4 mb-2">
          Menu
        </div>
        {menuItems.map((item, index) => {
          if (!item.roles.includes(role)) return null;
          return (
            <Link
              key={item.id}
              to={item.path}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group"
              activeProps={{
                className:
                  "bg-gradient-to-r from-agri-50 to-agri-100/50 text-agri-700 font-semibold shadow-sm border border-agri-100/50",
              }}
              inactiveProps={{
                className:
                  "text-slate-500 hover:bg-slate-50/80 hover:text-slate-900",
              }}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-br from-agri-500 to-agri-600 text-white shadow-md shadow-agri-500/25"
                        : "bg-slate-100/80 text-slate-500 group-hover:bg-slate-200/80 group-hover:text-slate-700"
                    }`}
                  >
                    <item.icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className="flex-1">{item.label}</span>
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-agri-500 animate-pulse" />
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-slate-100/50">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 mb-3">
          <img
            src={
              user?.avatarUrl ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=16a34a&color=fff`
            }
            alt="Profile"
            className="w-10 h-10 rounded-xl border-2 border-white shadow-sm object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {user?.role || "Guest"}
            </p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200 text-sm font-medium"
        >
          <LogOut size={16} />
          <span>Keluar</span>
        </button>
      </div>
    </div>
  );
};
