import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { investmentService } from "@/services/investment.service";
import { InvestmentPackage, UserInvestment } from "@/types";
import {
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/_auth/investments")({
  component: Investments,
});

function Investments() {
  const { user, supabaseUser, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<"PACKAGES" | "PORTFOLIO">(
    "PACKAGES",
  );
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [packages, setPackages] = useState<InvestmentPackage[]>([]);
  const [investments, setInvestments] = useState<UserInvestment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [supabaseUser]);

  const loadData = async () => {
    try {
      const pkgs = await investmentService.findAllPackages();
      setPackages(pkgs);

      if (supabaseUser) {
        const invs = await investmentService.findUserInvestments(
          supabaseUser.id,
        );
        setInvestments(invs);
      }
    } catch (error) {
      console.error("Error loading investments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (pkgId: string) => {
    if (!supabaseUser) return;

    setPurchasing(pkgId);
    try {
      await investmentService.createInvestment(supabaseUser.id, pkgId, 1);
      await loadData();
      await refreshUser();
      setActiveTab("PORTFOLIO");
    } catch (error) {
      console.error("Error purchasing:", error);
      alert("Gagal melakukan investasi");
    } finally {
      setPurchasing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Memuat data investasi...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const totalInvested = investments.reduce((a, b) => {
    const pkg = packages.find((p) => p.id === b.packageId);
    return a + (pkg?.pricePerUnit || 0) * b.units;
  }, 0);

  const totalValue = investments.reduce((a, b) => a + b.currentValue, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Investasi</h1>
          <p className="text-slate-500 text-sm">
            Kembangkan aset Anda dengan peternakan berkelanjutan.
          </p>
        </div>
        <div className="bg-slate-100 p-1 rounded-xl flex w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("PACKAGES")}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "PACKAGES"
                ? "bg-white shadow-sm text-slate-800"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Paket Tersedia
          </button>
          <button
            onClick={() => setActiveTab("PORTFOLIO")}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "PORTFOLIO"
                ? "bg-white shadow-sm text-slate-800"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Portfolio Saya
          </button>
        </div>
      </div>

      {activeTab === "PACKAGES" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg, index) => (
            <div
              key={pkg.id}
              className="card-elevated p-6 flex flex-col group animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="mb-4 flex justify-between items-start">
                <span className="badge badge-info">{pkg.type}</span>
                <span className="text-slate-300 group-hover:text-agri-500 transition-colors">
                  <TrendingUp size={20} />
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                {pkg.name}
              </h3>
              <p className="text-slate-500 text-sm mb-6 flex-1 line-clamp-3">
                {pkg.description}
              </p>

              <div className="space-y-3 mb-6 bg-slate-50 p-4 rounded-xl">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Est. ROI</span>
                  <span className="font-bold text-emerald-600">
                    +{pkg.estimatedRoi}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Durasi</span>
                  <span className="font-semibold text-slate-800">
                    {pkg.durationMonths} Bulan
                  </span>
                </div>
                <div className="flex justify-between text-sm pt-3 border-t border-slate-200">
                  <span className="text-slate-500">Harga/Unit</span>
                  <span className="font-bold text-slate-800">
                    Rp {pkg.pricePerUnit.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handlePurchase(pkg.id)}
                disabled={!!purchasing}
                className="btn btn-secondary w-full"
              >
                {purchasing === pkg.id ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    Mulai Investasi
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          ))}

          {packages.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-400">
              Belum ada paket investasi tersedia
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-agri-600 to-agri-700 rounded-2xl p-6 text-white shadow-xl shadow-agri-500/20">
              <p className="text-agri-100 text-sm font-medium">
                Total Investasi
              </p>
              <h3 className="text-3xl font-bold mt-2">
                Rp {totalInvested.toLocaleString("id-ID")}
              </h3>
            </div>
            <div className="card-elevated p-6">
              <p className="text-slate-500 text-sm font-medium">
                Nilai Saat Ini
              </p>
              <h3 className="text-2xl font-bold mt-2 text-slate-800">
                Rp {totalValue.toLocaleString("id-ID")}
              </h3>
              <span className="badge badge-success mt-3 inline-flex items-center gap-1">
                <Sparkles size={12} />
                Portfolio Sehat
              </span>
            </div>
            <div className="card-elevated p-6">
              <p className="text-slate-500 text-sm font-medium">
                Kontrak Aktif
              </p>
              <h3 className="text-2xl font-bold mt-2 text-slate-800">
                {investments.filter((i) => i.status === "Active").length}
              </h3>
              <p className="text-xs text-slate-400 mt-3">
                dari {investments.length} total kontrak
              </p>
            </div>
          </div>

          {/* Portfolio List */}
          <div className="card-elevated overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Kontrak Aktif</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {investments.length === 0 && (
                <div className="p-12 text-center text-slate-400">
                  Anda belum memiliki investasi aktif.
                </div>
              )}
              {investments.map((inv) => {
                const pkg = packages.find((p) => p.id === inv.packageId);
                return (
                  <div
                    key={inv.id}
                    className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/25 flex-shrink-0">
                        <CheckCircle size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">
                          {pkg?.name || "Paket Investasi"}
                        </h4>
                        <p className="text-sm text-slate-500">
                          Dibeli {inv.purchaseDate} • {inv.units} Unit
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                          Nilai Saat Ini
                        </p>
                        <p className="font-bold text-slate-800 text-lg">
                          Rp {inv.currentValue.toLocaleString("id-ID")}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`badge ${inv.status === "Active" ? "badge-success" : "badge-neutral"}`}
                        >
                          {inv.status === "Active" ? "AKTIF" : "SELESAI"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
