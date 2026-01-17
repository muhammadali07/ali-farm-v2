import React, { useState } from "react";
import {
  Sprout,
  Loader2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ChevronRight,
  ArrowLeft,
  AlertCircle,
  User,
  CheckCircle,
  UserPlus,
  LogIn,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Role } from "@/types";

interface LoginPageProps {
  onLoginSuccess: () => void;
  onBack: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onBack,
}) => {
  const { signIn, signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role>(Role.INVESTOR);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    if (isRegisterMode && !name) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isRegisterMode) {
        await signUp(email, password, name, selectedRole);
        setSuccess(
          "Akun berhasil dibuat! Silakan cek email untuk verifikasi, atau langsung login.",
        );
        // Reset form
        setName("");
        setPassword("");
        setIsRegisterMode(false);
      } else {
        await signIn(email, password);
        onLoginSuccess();
      }
    } catch (err: any) {
      console.error(isRegisterMode ? "Register error:" : "Login error:", err);

      if (err.message?.includes("Invalid login credentials")) {
        setError("Email atau password salah. Silakan coba lagi.");
      } else if (err.message?.includes("Email not confirmed")) {
        setError("Email belum diverifikasi. Silakan cek inbox Anda.");
      } else if (err.message?.includes("User already registered")) {
        setError("Email sudah terdaftar. Silakan login.");
      } else if (err.message?.includes("Password should be at least")) {
        setError("Password minimal 6 karakter.");
      } else if (err.message?.includes("Invalid email")) {
        setError("Format email tidak valid.");
      } else {
        setError(err.message || "Terjadi kesalahan. Silakan coba lagi.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const hasEmail = email.trim().length > 0;

  const roleOptions = [
    {
      value: Role.OWNER,
      label: "Owner",
      description: "Pemilik peternakan - akses penuh",
    },
    {
      value: Role.STAFF,
      label: "Staff",
      description: "Staf peternakan - kelola domba",
    },
    {
      value: Role.INVESTOR,
      label: "Investor",
      description: "Investor - pantau investasi",
    },
  ];

  return (
    <div className="min-h-screen w-full flex bg-white font-sans overflow-hidden">
      {/* Left Pane: Login Form */}
      <div className="w-full lg:w-[55%] flex flex-col justify-center px-8 md:px-16 lg:px-24 xl:px-32 relative bg-white">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="absolute top-8 left-8 md:left-16 flex items-center gap-2 text-slate-400 hover:text-agri-600 transition-colors font-medium text-sm group"
        >
          <ArrowLeft
            size={18}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span>Kembali ke Beranda</span>
        </button>

        <div className="max-w-md w-full mx-auto lg:mx-0">
          {/* Logo Section */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-agri-500 to-agri-700 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-agri-500/20 rotate-3">
              <Sprout size={28} />
            </div>
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              Ali<span className="text-agri-600">Farm</span>
            </span>
          </div>

          {/* Toggle Login/Register */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-8">
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(false);
                setError(null);
                setSuccess(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${
                !isRegisterMode
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <LogIn size={18} />
              Masuk
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(true);
                setError(null);
                setSuccess(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${
                isRegisterMode
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <UserPlus size={18} />
              Daftar
            </button>
          </div>

          {/* Welcome Text */}
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">
              {isRegisterMode ? "Buat Akun Baru" : "Selamat datang kembali"}
            </h1>
            <p className="text-slate-500 font-medium">
              {isRegisterMode
                ? "Daftar untuk mulai mengelola atau berinvestasi di peternakan."
                : "Masuk untuk mengelola aset peternakan Anda."}
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-2xl flex items-start gap-3 animate-fade-in">
              <CheckCircle
                className="text-green-500 flex-shrink-0 mt-0.5"
                size={20}
              />
              <div>
                <p className="text-sm font-semibold text-green-700">
                  {success}
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 animate-fade-in">
              <AlertCircle
                className="text-red-500 flex-shrink-0 mt-0.5"
                size={20}
              />
              <div>
                <p className="text-sm font-semibold text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field (Register only) */}
            {isRegisterMode && (
              <div className="space-y-2 animate-fade-in">
                <label className="text-sm font-bold text-slate-700 ml-1">
                  Nama Lengkap
                </label>
                <div className="relative group">
                  <User
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-agri-600 transition-colors"
                    size={20}
                  />
                  <input
                    type="text"
                    required={isRegisterMode}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-agri-500 focus:bg-white focus:ring-4 focus:ring-agri-50 transition-all placeholder:text-slate-400"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">
                Email
              </label>
              <div className="relative group">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-agri-600 transition-colors"
                  size={20}
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-agri-500 focus:bg-white focus:ring-4 focus:ring-agri-50 transition-all placeholder:text-slate-400"
                  placeholder="Masukkan email Anda"
                />
              </div>
            </div>

            {/* Password Field */}
            <div
              className={`space-y-2 transition-all duration-500 ${
                hasEmail || isRegisterMode
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 -translate-y-4 pointer-events-none absolute"
              }`}
            >
              <label className="text-sm font-bold text-slate-700 ml-1">
                Password
              </label>
              <div className="relative group">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-agri-600 transition-colors"
                  size={20}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  required={hasEmail || isRegisterMode}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-agri-500 focus:bg-white focus:ring-4 focus:ring-agri-50 transition-all placeholder:text-slate-400"
                  placeholder={
                    isRegisterMode
                      ? "Buat password (min. 6 karakter)"
                      : "Masukkan password Anda"
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-agri-600 transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {isRegisterMode && (
                <p className="text-xs text-slate-400 ml-1">
                  Minimal 6 karakter
                </p>
              )}
            </div>

            {/* Role Selection (Register only) */}
            {isRegisterMode && (
              <div className="space-y-3 animate-fade-in">
                <label className="text-sm font-bold text-slate-700 ml-1">
                  Daftar Sebagai
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {roleOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSelectedRole(option.value)}
                      className={`p-3 rounded-xl border-2 transition-all text-center ${
                        selectedRole === option.value
                          ? "border-agri-500 bg-agri-50 text-agri-700"
                          : "border-slate-200 hover:border-slate-300 text-slate-600"
                      }`}
                    >
                      <p className="font-bold text-sm">{option.label}</p>
                      <p className="text-[10px] mt-1 opacity-70">
                        {option.description.split(" - ")[1]}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Remember & Forgot (Login only) */}
            {!isRegisterMode && (hasEmail || isRegisterMode) && (
              <div className="flex items-center justify-between px-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-agri-600 focus:ring-agri-500 cursor-pointer"
                  />
                  <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors font-medium">
                    Ingat saya
                  </span>
                </label>
                <button
                  type="button"
                  className="text-sm font-bold text-agri-600 hover:text-agri-700 transition-colors"
                >
                  Lupa password?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || (!hasEmail && !isRegisterMode)}
              className={`w-full bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white font-bold py-4 rounded-2xl shadow-xl shadow-slate-900/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 group ${
                !hasEmail && !isRegisterMode
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  {isRegisterMode ? "Buat Akun" : "Masuk ke Dashboard"}
                  <ChevronRight
                    size={20}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </>
              )}
            </button>
          </form>

          {/* Footer Info */}
          <div className="mt-12 text-center">
            <p className="text-sm text-slate-400 font-medium leading-relaxed">
              {isRegisterMode ? (
                <>
                  Sudah punya akun?{" "}
                  <button
                    type="button"
                    onClick={() => setIsRegisterMode(false)}
                    className="font-bold text-agri-600 hover:underline"
                  >
                    Masuk di sini
                  </button>
                </>
              ) : (
                <>
                  Belum punya akun?{" "}
                  <button
                    type="button"
                    onClick={() => setIsRegisterMode(true)}
                    className="font-bold text-agri-600 hover:underline"
                  >
                    Daftar sekarang
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Right Pane: Premium Agricultural Visual */}
      <div className="hidden lg:block w-[45%] relative overflow-hidden bg-slate-900">
        <img
          src="https://images.unsplash.com/photo-1496733021827-6112ba9c7c05?auto=format&fit=crop&q=80&w=1200"
          alt="Modern Farm Landscape"
          className="w-full h-full object-cover opacity-60 scale-110"
        />

        {/* Overlay Content */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent flex flex-col justify-end p-20">
          <div className="max-w-lg mb-8">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-agri-500 to-agri-600 text-white text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full mb-6 shadow-lg shadow-agri-500/30">
              Official Ali Farm Platform
            </div>
            <h2 className="text-5xl font-extrabold text-white mb-6 leading-[1.15] tracking-tight">
              Transformasi Digital untuk Peternakan Lebih Baik.
            </h2>
            <p className="text-slate-300 text-lg leading-relaxed font-medium">
              Pantauan real-time, manajemen pakan otomatis, dan transparansi
              investasi dalam satu genggaman cerdas.
            </p>
          </div>

          <div className="flex items-center gap-6 text-white/40">
            <div className="flex -space-x-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white overflow-hidden"
                >
                  <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" />
                </div>
              ))}
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/60">
              Bergabung dengan 500+ Investor
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
