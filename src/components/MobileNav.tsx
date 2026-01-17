import { useState, useRef, useEffect } from "react";
import {
  LayoutDashboard,
  Sprout,
  Users,
  ShoppingBag,
  Settings,
  Package,
  X,
  PiggyBank,
  Camera,
} from "lucide-react";
import { Link } from "@tanstack/react-router";

export const MobileNav: React.FC = () => {
  const [isProductMenuOpen, setIsProductMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProductMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const productItems = [
    {
      id: "sheep",
      path: "/sheep",
      label: "Domba",
      icon: Sprout,
      gradient: "from-green-500 to-green-600",
    },
    {
      id: "investments",
      path: "/investments",
      label: "Investasi",
      icon: Users,
      gradient: "from-blue-500 to-blue-600",
    },
    {
      id: "marketplace",
      path: "/marketplace",
      label: "Toko",
      icon: ShoppingBag,
      gradient: "from-orange-500 to-orange-600",
    },
    {
      id: "qurban",
      path: "/qurban",
      label: "Qurban",
      icon: PiggyBank,
      gradient: "from-emerald-500 to-emerald-600",
    },
    {
      id: "cctv",
      path: "/cctv",
      label: "CCTV",
      icon: Camera,
      gradient: "from-purple-500 to-purple-600",
    },
  ];

  return (
    <>
      {/* Overlay */}
      {isProductMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm md:hidden animate-fade-in"
          onClick={() => setIsProductMenuOpen(false)}
        />
      )}

      {/* Floating Menu */}
      <div
        ref={menuRef}
        className={`fixed bottom-28 left-1/2 -translate-x-1/2 z-50 md:hidden transition-all duration-300 ${
          isProductMenuOpen
            ? "translate-y-0 opacity-100 scale-100"
            : "translate-y-10 opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-100/50 p-3 grid grid-cols-3 gap-2 min-w-[300px]">
          {productItems.map((item, index) => (
            <Link
              key={item.id}
              to={item.path}
              onClick={() => setIsProductMenuOpen(false)}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-slate-50 transition-all duration-200 active:scale-95"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div
                className={`p-3 rounded-xl bg-gradient-to-br ${item.gradient} text-white shadow-lg`}
              >
                <item.icon size={20} />
              </div>
              <span className="text-xs font-semibold text-slate-700">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
        {/* Arrow */}
        <div className="w-4 h-4 bg-white rotate-45 absolute -bottom-2 left-1/2 -translate-x-1/2 border-r border-b border-slate-100/50" />
      </div>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden z-50">
        {/* Glass background */}
        <div className="absolute inset-0 bg-white/90 backdrop-blur-xl border-t border-slate-200/50 shadow-[0_-4px_30px_rgba(0,0,0,0.08)]" />

        {/* Content */}
        <div className="relative px-8 py-3 pb-safe flex justify-between items-center">
          {/* Home */}
          <Link
            to="/dashboard"
            className="flex flex-col items-center gap-1 transition-all duration-200 min-w-[60px]"
            activeProps={{ className: "text-agri-600" }}
            inactiveProps={{ className: "text-slate-400" }}
          >
            {({ isActive }) => (
              <>
                <div
                  className={`p-2 rounded-xl transition-all ${isActive ? "bg-agri-50" : ""}`}
                >
                  <LayoutDashboard size={22} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span
                  className={`text-[10px] font-semibold ${isActive ? "text-agri-600" : "text-slate-500"}`}
                >
                  Home
                </span>
              </>
            )}
          </Link>

          {/* Center FAB */}
          <button
            onClick={() => setIsProductMenuOpen(!isProductMenuOpen)}
            className={`relative -top-5 p-4 rounded-2xl shadow-xl transition-all duration-300 ${
              isProductMenuOpen
                ? "bg-gradient-to-br from-agri-500 to-agri-600 scale-110 rotate-180 shadow-agri-500/40"
                : "bg-gradient-to-br from-slate-800 to-slate-900 shadow-slate-900/30 active:scale-95"
            }`}
          >
            {isProductMenuOpen ? (
              <X size={24} className="text-white" />
            ) : (
              <Package size={24} className="text-white" />
            )}
            {/* Pulse ring animation when closed */}
            {!isProductMenuOpen && (
              <span className="absolute inset-0 rounded-2xl bg-slate-900 animate-ping opacity-20" />
            )}
          </button>

          {/* Settings */}
          <Link
            to="/settings"
            className="flex flex-col items-center gap-1 transition-all duration-200 min-w-[60px]"
            activeProps={{ className: "text-agri-600" }}
            inactiveProps={{ className: "text-slate-400" }}
          >
            {({ isActive }) => (
              <>
                <div
                  className={`p-2 rounded-xl transition-all ${isActive ? "bg-agri-50" : ""}`}
                >
                  <Settings size={22} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span
                  className={`text-[10px] font-semibold ${isActive ? "text-agri-600" : "text-slate-500"}`}
                >
                  Settings
                </span>
              </>
            )}
          </Link>
        </div>
      </div>
    </>
  );
};
