import { Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { MobileNav } from "@/components/MobileNav";
import { Sprout, Bell, Search, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/_auth")({
  component: AuthLayout,
});

function AuthLayout() {
  const { user, loading, lang, setLang, role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !user) {
      navigate({ to: "/login" });
    }
  }, [loading, user, navigate]);

  // Loading state
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-agri-500 to-agri-700 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-agri-500/30">
            <Sprout size={32} />
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-xl font-bold text-slate-800">Ali Farm</span>
            <div className="flex items-center gap-2 text-slate-500">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm">Memuat aplikasi...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 font-sans pb-24 md:pb-0">
      {/* Desktop Sidebar */}
      <Sidebar role={role} lang={lang} />

      {/* Desktop TopBar */}
      <TopBar user={user} lang={lang} setLang={setLang} role={role} />

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl z-30 flex items-center justify-between px-4 border-b border-slate-100/50 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-gradient-to-br from-agri-500 to-agri-700 rounded-xl flex items-center justify-center text-white shadow-md shadow-agri-500/20">
            <Sprout size={18} />
          </div>
          <span className="font-bold text-lg text-slate-800">Ali Farm</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
            <Search size={18} />
          </button>
          <button className="relative w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
          </button>
          <img
            src={
              user.avatarUrl ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=16a34a&color=fff`
            }
            alt="Profile"
            className="w-9 h-9 rounded-xl border-2 border-white shadow-sm object-cover"
          />
        </div>
      </div>

      {/* Main Content Area */}
      <main className="md:ml-64 pt-20 md:pt-20 px-4 md:px-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto animate-fade-in">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
}
