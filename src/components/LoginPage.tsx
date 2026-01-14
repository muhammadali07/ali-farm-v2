
import React, { useState } from 'react';
import { Sprout, Loader2, User, Lock, Eye, EyeOff, ChevronRight, ArrowLeft } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: () => void;
  onBack: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onBack }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess();
    }, 1200);
  };

  const hasUsername = username.trim().length > 0;

  return (
    <div className="min-h-screen w-full flex bg-white font-sans overflow-hidden">
      {/* Left Pane: Login Form */}
      <div className="w-full lg:w-[55%] flex flex-col justify-center px-8 md:px-16 lg:px-24 xl:px-32 relative bg-white">
        {/* Back Button */}
        <button 
          onClick={onBack}
          className="absolute top-8 left-8 md:left-16 flex items-center gap-2 text-slate-400 hover:text-agri-600 transition-colors font-medium text-sm group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span>Kembali ke Beranda</span>
        </button>

        <div className="max-w-md w-full mx-auto lg:mx-0">
          {/* Logo Section */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-agri-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-agri-100 rotate-3">
              <Sprout size={28} />
            </div>
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              Ali<span className="text-agri-600">Farm</span>
            </span>
          </div>

          {/* Welcome Text */}
          <div className="mb-10">
            <h1 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">Selamat datang kembali</h1>
            <p className="text-slate-500 font-medium">Masuk untuk mengelola aset peternakan Anda.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Username / ID Pegawai</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-agri-600 transition-colors" size={20} />
                <input 
                  type="text" 
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-agri-500 focus:bg-white focus:ring-4 focus:ring-agri-50 transition-all placeholder:text-slate-400"
                  placeholder="Contoh: AF-001 atau username"
                />
              </div>
            </div>

            {/* Progressive Disclosure Section: Password & Actions appear when username is entered */}
            <div className={`space-y-6 transition-all duration-700 ease-out transform ${hasUsername ? 'opacity-100 translate-y-0 visible scale-100' : 'opacity-0 -translate-y-4 invisible scale-95 pointer-events-none absolute w-full'}`}>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-agri-600 transition-colors" size={20} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required={hasUsername}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-agri-500 focus:bg-white focus:ring-4 focus:ring-agri-50 transition-all placeholder:text-slate-400"
                    placeholder="Masukkan password Anda"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-agri-600 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between px-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-agri-600 focus:ring-agri-500 cursor-pointer"
                  />
                  <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors font-medium">Ingat saya</span>
                </label>
                <button type="button" className="text-sm font-bold text-agri-600 hover:text-agri-700 transition-colors">
                  Lupa password?
                </button>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl shadow-xl shadow-slate-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 group"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    Masuk ke Dashboard
                    <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer Info */}
          <div className="mt-16 text-center">
            <p className="text-sm text-slate-400 font-medium leading-relaxed">
              Butuh akses akun? Silakan hubungi <br/> 
              <button type="button" className="font-bold text-agri-600 hover:underline">Administrator Peternakan</button>
            </p>
          </div>
        </div>
      </div>

      {/* Right Pane: Premium Agricultural Visual */}
      <div className="hidden lg:block w-[45%] relative overflow-hidden bg-slate-900">
        <img 
          src="https://images.unsplash.com/photo-1496733021827-6112ba9c7c05?auto=format&fit=crop&q=80&w=1200" 
          alt="Modern Farm Landscape"
          className="w-full h-full object-cover opacity-60 scale-110 animate-pulse-slow"
          style={{ animationDuration: '8s' }}
        />
        
        {/* Overlay Content */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent flex flex-col justify-end p-20">
          <div className="max-w-lg mb-8">
            <div className="inline-flex items-center gap-2 bg-agri-600 text-white text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full mb-6">
              Official Ali Farm Platform
            </div>
            <h2 className="text-5xl font-extrabold text-white mb-6 leading-[1.15] tracking-tight">
              Transformasi Digital untuk Peternakan Lebih Baik.
            </h2>
            <p className="text-slate-300 text-lg leading-relaxed font-medium">
              Pantauan real-time, manajemen pakan otomatis, dan transparansi investasi dalam satu genggaman cerdas.
            </p>
          </div>
          
          <div className="flex items-center gap-6 text-white/40">
             <div className="flex -space-x-3">
                {[1,2,3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" />
                  </div>
                ))}
             </div>
             <p className="text-xs font-bold uppercase tracking-widest text-white/60">Bergabung dengan 500+ Investor</p>
          </div>
        </div>
      </div>
    </div>
  );
};
