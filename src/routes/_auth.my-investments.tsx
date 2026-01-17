import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { investorService } from "@/services/investor.service";
import {
  InvestorContract,
  ContractSheep,
  ContractExpense,
  ContractSummary,
  Role,
  Sheep,
} from "@/types";
import {
  FileText,
  Loader2,
  DollarSign,
  TrendingUp,
  Calendar,
  Users,
  CheckCircle,
  AlertCircle,
  PiggyBank,
  Receipt,
  ChevronRight,
  Eye,
  GitBranch,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { SheepHierarchyChart } from "@/components/SheepHierarchyChart";

export const Route = createFileRoute("/_auth/my-investments")({
  component: MyInvestmentsPage,
});

function MyInvestmentsPage() {
  const navigate = useNavigate();
  const { role, user } = useAuth();
  const [contracts, setContracts] = useState<InvestorContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContract, setSelectedContract] = useState<InvestorContract | null>(null);
  const [contractSheep, setContractSheep] = useState<ContractSheep[]>([]);
  const [expenses, setExpenses] = useState<ContractExpense[]>([]);
  const [summary, setSummary] = useState<ContractSummary | null>(null);
  const [sheepHierarchy, setSheepHierarchy] = useState<Sheep[]>([]);
  const [activeTab, setActiveTab] = useState<"OVERVIEW" | "SHEEP" | "EXPENSES" | "HIERARCHY">("OVERVIEW");
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadContracts();
    }
  }, [user?.id]);

  const loadContracts = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await investorService.findContractsByInvestor(user.id);
      setContracts(data);
      if (data.length > 0) {
        await loadContractDetail(data[0]);
      }
    } catch (error) {
      console.error("Error loading contracts:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadContractDetail = async (contract: InvestorContract) => {
    setLoadingDetail(true);
    setSelectedContract(contract);
    try {
      const [sheepData, expensesData, summaryData, hierarchyData] = await Promise.all([
        investorService.getContractSheep(contract.id),
        investorService.getContractExpenses(contract.id),
        investorService.getContractSummary(contract.id),
        investorService.getSheepHierarchy(contract.id),
      ]);
      setContractSheep(sheepData);
      setExpenses(expensesData);
      setSummary(summaryData);
      setSheepHierarchy(hierarchyData);
    } catch (error) {
      console.error("Error loading contract detail:", error);
    } finally {
      setLoadingDetail(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "badge-success";
      case "Completed":
        return "badge-info";
      case "Cancelled":
        return "badge-danger";
      default:
        return "badge-neutral";
    }
  };

  if (role !== Role.INVESTOR) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-4">
        <AlertCircle size={48} />
        <p>Halaman ini hanya untuk Investor</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-4">
        <Loader2 className="animate-spin" size={32} />
        <p>Memuat data investasi...</p>
      </div>
    );
  }

  if (contracts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-4">
        <FileText size={48} className="opacity-50" />
        <p>Anda belum memiliki kontrak investasi</p>
        <p className="text-sm">Hubungi Owner untuk membuat kontrak investasi baru</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Investasi Saya</h1>
        <p className="text-slate-500 text-sm">
          Lihat kontrak investasi dan laporan keuangan Anda.
        </p>
      </div>

      {/* Contract Selector */}
      {contracts.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {contracts.map((contract) => (
            <button
              key={contract.id}
              onClick={() => loadContractDetail(contract)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                selectedContract?.id === contract.id
                  ? "bg-agri-600 text-white shadow-lg"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {contract.contractNumber}
            </button>
          ))}
        </div>
      )}

      {selectedContract && (
        <>
          {/* Contract Info Card */}
          <div className="card-elevated p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-slate-800">
                    {selectedContract.contractNumber}
                  </h2>
                  <span className={`badge ${getStatusColor(selectedContract.status)}`}>
                    {selectedContract.status}
                  </span>
                </div>
                <p className="text-slate-500 text-sm mt-1">
                  {new Date(selectedContract.startDate).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}{" "}
                  -{" "}
                  {new Date(selectedContract.endDate).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-slate-400 text-xs uppercase font-bold mb-1">
                  Modal Investasi
                </p>
                <p className="text-lg font-bold text-slate-800">
                  Rp {selectedContract.investmentAmount.toLocaleString("id-ID")}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-xs uppercase font-bold mb-1">
                  Bagi Hasil
                </p>
                <p className="text-lg font-bold text-slate-800">
                  {selectedContract.profitSharingPercentage}%
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-xs uppercase font-bold mb-1">
                  Durasi
                </p>
                <p className="text-lg font-bold text-slate-800">
                  {selectedContract.durationMonths} Bulan
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-xs uppercase font-bold mb-1">
                  Status
                </p>
                <p className={`text-lg font-bold ${
                  selectedContract.status === "Active" ? "text-green-600" : "text-blue-600"
                }`}>
                  {selectedContract.status === "Active" ? "Berjalan" : "Selesai"}
                </p>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          {loadingDetail ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-slate-400" size={32} />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="card-elevated p-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white">
                      <Users size={20} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-800">
                        {summary?.totalSheep || 0}
                      </p>
                      <p className="text-xs text-slate-500">Domba Aktif</p>
                    </div>
                  </div>
                </div>
                <div className="card-elevated p-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-green-500 to-green-600 rounded-xl text-white">
                      <TrendingUp size={20} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-800">
                        Rp {((summary?.totalCurrentValue || 0) / 1000000).toFixed(1)}Jt
                      </p>
                      <p className="text-xs text-slate-500">Nilai Saat Ini</p>
                    </div>
                  </div>
                </div>
                <div className="card-elevated p-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl text-white">
                      <PiggyBank size={20} />
                    </div>
                    <div>
                      <p className={`text-2xl font-bold ${
                        (summary?.estimatedInvestorProfit || 0) >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}>
                        Rp {((summary?.estimatedInvestorProfit || 0) / 1000000).toFixed(1)}Jt
                      </p>
                      <p className="text-xs text-slate-500">Est. Profit Anda</p>
                    </div>
                  </div>
                </div>
                <div className="card-elevated p-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl text-white">
                      <DollarSign size={20} />
                    </div>
                    <div>
                      <p className={`text-2xl font-bold ${
                        (summary?.estimatedRoi || 0) >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}>
                        {(summary?.estimatedRoi || 0).toFixed(1)}%
                      </p>
                      <p className="text-xs text-slate-500">Est. ROI</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
                {(["OVERVIEW", "SHEEP", "EXPENSES", "HIERARCHY"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                      activeTab === tab
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500"
                    }`}
                  >
                    {tab === "OVERVIEW"
                      ? "Ringkasan"
                      : tab === "SHEEP"
                      ? `Domba (${contractSheep.length})`
                      : tab === "EXPENSES"
                      ? `Pengeluaran`
                      : "Silsilah"}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {activeTab === "OVERVIEW" && (
                <div className="card-elevated p-6">
                  <h3 className="font-bold text-slate-800 mb-4">Ringkasan Keuangan</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Modal Investasi</span>
                      <span className="font-semibold text-slate-800">
                        Rp {selectedContract.investmentAmount.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Total Pembelian Domba</span>
                      <span className="font-semibold text-slate-800">
                        Rp {(summary?.totalPurchaseValue || 0).toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Nilai Saat Ini</span>
                      <span className="font-semibold text-green-600">
                        Rp {(summary?.totalCurrentValue || 0).toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Total Pengeluaran</span>
                      <span className="font-semibold text-red-600">
                        - Rp {(summary?.totalExpenses || 0).toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Pendapatan (Penjualan)</span>
                      <span className="font-semibold text-green-600">
                        + Rp {(summary?.totalRevenue || 0).toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Domba Lahir</span>
                      <span className="font-semibold text-slate-800">
                        {summary?.sheepBorn || 0} ekor
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Domba Terjual</span>
                      <span className="font-semibold text-slate-800">
                        {summary?.sheepSold || 0} ekor
                      </span>
                    </div>
                    <div className="flex justify-between py-3 bg-agri-50 rounded-lg px-3 mt-4">
                      <span className="font-bold text-agri-800">Estimasi Profit Anda ({selectedContract.profitSharingPercentage}%)</span>
                      <span className={`font-bold text-lg ${
                        (summary?.estimatedInvestorProfit || 0) >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}>
                        Rp {(summary?.estimatedInvestorProfit || 0).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "SHEEP" && (
                <div className="card-elevated overflow-hidden">
                  <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="font-bold text-slate-800">Daftar Domba dalam Kontrak</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                        <tr>
                          <th className="px-5 py-4">Tag ID</th>
                          <th className="px-5 py-4">Breed</th>
                          <th className="px-5 py-4">Gender</th>
                          <th className="px-5 py-4">Status</th>
                          <th className="px-5 py-4">Harga Beli</th>
                          <th className="px-5 py-4">Nilai Saat Ini</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {contractSheep.map((cs) => (
                          <tr key={cs.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-5 py-4">
                              <span className="font-mono font-bold text-slate-700">
                                {cs.sheep?.tagId}
                              </span>
                            </td>
                            <td className="px-5 py-4">{cs.sheep?.breed}</td>
                            <td className="px-5 py-4">{cs.sheep?.gender}</td>
                            <td className="px-5 py-4">
                              <span
                                className={`badge ${
                                  cs.status === "Active"
                                    ? "badge-success"
                                    : cs.status === "Sold"
                                    ? "badge-info"
                                    : "badge-danger"
                                }`}
                              >
                                {cs.status}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              Rp {cs.purchasePrice.toLocaleString("id-ID")}
                            </td>
                            <td className="px-5 py-4">
                              <span className="font-semibold text-green-600">
                                Rp{" "}
                                {(cs.sheep?.marketValue || cs.purchasePrice).toLocaleString("id-ID")}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {contractSheep.length === 0 && (
                          <tr>
                            <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                              Belum ada domba teralokasi
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === "EXPENSES" && (
                <div className="card-elevated overflow-hidden">
                  <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                    <div>
                      <h3 className="font-bold text-slate-800">Riwayat Pengeluaran</h3>
                      <p className="text-xs text-slate-500">
                        Total: Rp {(summary?.totalExpenses || 0).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                        <tr>
                          <th className="px-5 py-4">Tanggal</th>
                          <th className="px-5 py-4">Kategori</th>
                          <th className="px-5 py-4">Deskripsi</th>
                          <th className="px-5 py-4">Jumlah</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {expenses.map((exp) => (
                          <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-5 py-4">
                              {new Date(exp.expenseDate).toLocaleDateString("id-ID")}
                            </td>
                            <td className="px-5 py-4">
                              <span className="badge badge-neutral">
                                {exp.category}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-slate-700">{exp.description}</td>
                            <td className="px-5 py-4 font-semibold text-red-600">
                              - Rp {exp.amount.toLocaleString("id-ID")}
                            </td>
                          </tr>
                        ))}
                        {expenses.length === 0 && (
                          <tr>
                            <td colSpan={4} className="px-5 py-12 text-center text-slate-400">
                              Belum ada pengeluaran tercatat
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === "HIERARCHY" && (
                <div className="card-elevated p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl text-white">
                      <GitBranch size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">Silsilah Domba</h3>
                      <p className="text-xs text-slate-500">
                        Lihat hubungan induk dan keturunan domba dalam kontrak
                      </p>
                    </div>
                  </div>
                  {sheepHierarchy.length > 0 ? (
                    <SheepHierarchyChart sheep={sheepHierarchy} />
                  ) : (
                    <div className="text-center py-12 text-slate-400">
                      <GitBranch size={48} className="mx-auto mb-3 opacity-50" />
                      <p>Belum ada data silsilah domba</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Completed Contract Info */}
          {selectedContract.status === "Completed" && (
            <div className="card-elevated p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-gradient-to-br from-green-500 to-green-600 rounded-xl text-white">
                  <CheckCircle size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-green-800">Kontrak Selesai</h3>
                  <p className="text-xs text-green-600">
                    Diselesaikan pada{" "}
                    {selectedContract.settlementDate &&
                      new Date(selectedContract.settlementDate).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div>
                  <p className="text-green-600 text-xs uppercase font-bold mb-1">Total Revenue</p>
                  <p className="font-bold text-green-800">
                    Rp {(selectedContract.totalRevenue || 0).toLocaleString("id-ID")}
                  </p>
                </div>
                <div>
                  <p className="text-green-600 text-xs uppercase font-bold mb-1">Total Expenses</p>
                  <p className="font-bold text-green-800">
                    Rp {(selectedContract.totalExpenses || 0).toLocaleString("id-ID")}
                  </p>
                </div>
                <div>
                  <p className="text-green-600 text-xs uppercase font-bold mb-1">Profit Anda</p>
                  <p className="font-bold text-green-800 text-lg">
                    Rp {(selectedContract.investorProfit || 0).toLocaleString("id-ID")}
                  </p>
                </div>
                <div>
                  <p className="text-green-600 text-xs uppercase font-bold mb-1">ROI Aktual</p>
                  <p className="font-bold text-green-800 text-lg">
                    {(selectedContract.actualRoi || 0).toFixed(1)}%
                  </p>
                </div>
              </div>
              {selectedContract.settlementNotes && (
                <div className="mt-4 p-3 bg-white/50 rounded-lg">
                  <p className="text-xs text-green-600 font-bold uppercase mb-1">Catatan</p>
                  <p className="text-sm text-green-800">{selectedContract.settlementNotes}</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
