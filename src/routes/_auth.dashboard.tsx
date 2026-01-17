import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Role, SheepStatus, Sheep } from "@/types";
import { TRANSLATIONS } from "@/constants";
import { sheepService } from "@/services/sheep.service";
import {
  TrendingUp,
  Activity,
  ArrowRight,
  Wallet,
  Stethoscope,
  Coins,
  Loader2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/_auth/dashboard")({
  component: Dashboard,
});

// Enhanced StatCard Component
const StatCard = ({
  title,
  value,
  icon: Icon,
  gradient,
  trend,
  subtext,
}: {
  title: string;
  value: string | number;
  icon: any;
  gradient: string;
  trend?: string;
  subtext?: string;
}) => (
  <div className="card-elevated p-6 group">
    <div className="flex justify-between items-start mb-4">
      <div
        className={`p-3 rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg`}
      >
        <Icon className="w-6 h-6" />
      </div>
      {trend && (
        <span className="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full ring-1 ring-emerald-100">
          <TrendingUp className="w-3 h-3 mr-1" />
          {trend}
        </span>
      )}
    </div>
    <div>
      <h3 className="text-3xl font-bold text-slate-800 tracking-tight tabular-nums">
        {value}
      </h3>
      <p className="text-slate-500 text-sm font-medium mt-1">{title}</p>
      {subtext && (
        <p className="text-slate-400 text-xs mt-2 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-soft" />
          {subtext}
        </p>
      )}
    </div>
  </div>
);

function Dashboard() {
  const navigate = useNavigate();
  const { role, lang, user } = useAuth();
  const t = TRANSLATIONS[lang];

  const [sheep, setSheep] = useState<Sheep[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sheepData = await sheepService.findAll();
        setSheep(sheepData);
      } catch (error) {
        console.error("Error fetching sheep:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Memuat dashboard...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const healthyCount = sheep.filter(
    (s) => s.status === SheepStatus.HEALTHY,
  ).length;
  const sickCount = sheep.filter((s) => s.status === SheepStatus.SICK).length;
  const soldCount = sheep.filter((s) => s.status === SheepStatus.SOLD).length;
  const totalValue =
    user.investments?.reduce((acc, curr) => acc + curr.currentValue, 0) || 0;

  const pieData = [
    { name: "Sehat", value: healthyCount },
    { name: "Sakit", value: sickCount },
    { name: "Terjual", value: soldCount },
  ];
  const COLORS = ["#22c55e", "#ef4444", "#f59e0b"];

  const revenueData = [
    { name: "Jan", value: 1200 },
    { name: "Feb", value: 1900 },
    { name: "Mar", value: 1500 },
    { name: "Apr", value: 2400 },
    { name: "May", value: 3200 },
    { name: "Jun", value: totalValue > 0 ? 4500 : 3800 },
  ];

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            {t.dashboard}
          </h1>
          <p className="text-slate-500 mt-1">
            {t.welcome},{" "}
            <span className="font-semibold text-slate-700">{user.name}</span>
          </p>
        </div>
        <button
          onClick={() => navigate({ to: "/investments" })}
          className="btn btn-secondary"
        >
          + Investasi Baru
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {role === Role.INVESTOR ? (
          <>
            <StatCard
              title={t.totalAssets}
              value={`Rp ${totalValue.toLocaleString("id-ID")}`}
              icon={Wallet}
              gradient="from-agri-500 to-agri-600"
              trend="+12.5%"
              subtext="Diperbarui hari ini"
            />
            <StatCard
              title={t.activeSheep}
              value={`${user.investments?.reduce((acc, inv) => acc + inv.units, 0) || 0} Ekor`}
              icon={Activity}
              gradient="from-blue-500 to-blue-600"
              subtext="Di 3 kandang"
            />
            <StatCard
              title="Tabungan Qurban"
              value={`Rp ${(user.qurban?.currentAmount || 0).toLocaleString("id-ID")}`}
              icon={Coins}
              gradient="from-purple-500 to-purple-600"
              trend="+5%"
              subtext={`Target: Rp ${(user.qurban?.targetAmount || 0).toLocaleString("id-ID")}`}
            />
            <StatCard
              title="Est. Dividen"
              value="Rp 850.000"
              icon={TrendingUp}
              gradient="from-orange-500 to-orange-600"
              subtext="Pencairan 25 hari lagi"
            />
          </>
        ) : (
          <>
            <StatCard
              title="Total Domba"
              value={sheep.length}
              icon={Activity}
              gradient="from-blue-500 to-blue-600"
              trend="+4 minggu ini"
            />
            <StatCard
              title="Perlu Perhatian"
              value={sickCount}
              icon={Stethoscope}
              gradient="from-red-500 to-red-600"
              subtext={sickCount > 0 ? "Memerlukan tindakan" : "Semua sehat"}
            />
            <StatCard
              title="Pendapatan Bulanan"
              value="Rp 45,2 Jt"
              icon={Coins}
              gradient="from-agri-500 to-agri-600"
              trend="+8.2%"
            />
            <StatCard
              title="Terjual (YTD)"
              value={soldCount}
              icon={TrendingUp}
              gradient="from-amber-500 to-amber-600"
            />
          </>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Main Chart */}
        <div className="card-elevated p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 text-lg">
              {role === Role.INVESTOR
                ? "Pertumbuhan Nilai Aset"
                : "Pendapatan Farm"}
            </h3>
            <select className="bg-slate-100 border-none text-sm text-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-agri-500/20">
              <option>6 Bulan Terakhir</option>
              <option>Tahun Ini</option>
            </select>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `${value / 1000}k`}
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc", radius: 8 }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 40px -10px rgba(0,0,0,0.15)",
                    padding: "12px 16px",
                  }}
                />
                <Bar
                  dataKey="value"
                  fill="url(#colorGradient)"
                  radius={[8, 8, 0, 0]}
                  barSize={40}
                />
                <defs>
                  <linearGradient
                    id="colorGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#1d4ed8" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side Section */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="card-elevated p-6">
            <h3 className="font-bold text-slate-800 text-lg mb-4">
              Aksi Cepat
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate({ to: "/qurban" })}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-agri-500 to-agri-600 rounded-xl text-white shadow-lg shadow-agri-500/25">
                    <Wallet size={18} />
                  </div>
                  <span className="font-semibold text-slate-700">
                    Top Up Qurban
                  </span>
                </div>
                <ArrowRight
                  size={16}
                  className="text-slate-400 group-hover:text-agri-600 group-hover:translate-x-1 transition-all"
                />
              </button>

              <button
                onClick={() => navigate({ to: "/sheep" })}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white shadow-lg shadow-blue-500/25">
                    <Activity size={18} />
                  </div>
                  <span className="font-semibold text-slate-700">
                    Cek Ternak
                  </span>
                </div>
                <ArrowRight
                  size={16}
                  className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all"
                />
              </button>
            </div>
          </div>

          {/* Flock Status */}
          <div className="card-elevated p-6">
            <h3 className="font-bold text-slate-800 text-lg mb-4">
              Status Ternak
            </h3>
            <div className="h-48 flex justify-center items-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 40px -10px rgba(0,0,0,0.15)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold text-slate-800">
                  {sheep.length}
                </span>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  Total
                </span>
              </div>
            </div>
            <div className="flex justify-between px-2 mt-2">
              {pieData.map((entry, index) => (
                <div key={index} className="text-center">
                  <div
                    className="w-3 h-3 rounded-full mx-auto mb-1.5 ring-2 ring-white shadow-sm"
                    style={{ backgroundColor: COLORS[index] }}
                  />
                  <p className="text-xs text-slate-600 font-semibold">
                    {entry.name}
                  </p>
                  <p className="text-sm font-bold text-slate-800">
                    {entry.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
