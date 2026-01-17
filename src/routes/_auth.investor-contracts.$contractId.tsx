import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { investorService } from "@/services/investor.service";
import { sheepService } from "@/services/sheep.service";
import {
  InvestorContract,
  ContractSheep,
  ContractExpense,
  ContractSummary,
  Sheep,
  Role,
  ExpenseCategory,
} from "@/types";
import {
  ArrowLeft,
  Loader2,
  Plus,
  Trash2,
  DollarSign,
  TrendingUp,
  Calendar,
  Users,
  CheckCircle,
  AlertCircle,
  Receipt,
  FileText,
  PiggyBank,
  Send,
} from "lucide-react";
import { Modal } from "@/components/Modal";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/_auth/investor-contracts/$contractId")({
  component: ContractDetailPage,
});

function ContractDetailPage() {
  const navigate = useNavigate();
  const { contractId } = Route.useParams();
  const { role } = useAuth();

  const [contract, setContract] = useState<InvestorContract | null>(null);
  const [contractSheep, setContractSheep] = useState<ContractSheep[]>([]);
  const [expenses, setExpenses] = useState<ContractExpense[]>([]);
  const [summary, setSummary] = useState<ContractSummary | null>(null);
  const [availableSheep, setAvailableSheep] = useState<Sheep[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isAddSheepModalOpen, setIsAddSheepModalOpen] = useState(false);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);

  // Form states
  const [selectedSheepId, setSelectedSheepId] = useState("");
  const [sheepPurchasePrice, setSheepPurchasePrice] = useState("");
  const [expenseForm, setExpenseForm] = useState({
    category: "Feed" as ExpenseCategory,
    description: "",
    amount: "",
    expenseDate: new Date().toISOString().split("T")[0],
  });
  const [completeForm, setCompleteForm] = useState({
    notes: "",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"SHEEP" | "EXPENSES" | "REPORTS">(
    "SHEEP"
  );

  useEffect(() => {
    loadData();
  }, [contractId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [contractData, sheepData, expensesData, allSheep] =
        await Promise.all([
          investorService.findContractById(contractId),
          investorService.getContractSheep(contractId),
          investorService.getContractExpenses(contractId),
          sheepService.findAll(),
        ]);

      setContract(contractData);
      setContractSheep(sheepData);
      setExpenses(expensesData);

      // Filter sheep that are not already allocated
      const allocatedSheepIds = sheepData.map((cs) => cs.sheepId);
      setAvailableSheep(
        allSheep.filter(
          (s) => !allocatedSheepIds.includes(s.id) && s.status === "Healthy"
        )
      );

      if (contractData) {
        const summaryData = await investorService.getContractSummary(contractId);
        setSummary(summaryData);
      }
    } catch (error) {
      console.error("Error loading contract:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSheep = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    try {
      await investorService.allocateSheep(
        contractId,
        selectedSheepId,
        parseFloat(sheepPurchasePrice)
      );
      setIsAddSheepModalOpen(false);
      setSelectedSheepId("");
      setSheepPurchasePrice("");
      await loadData();
    } catch (error: any) {
      setFormError(error.message || "Gagal menambahkan domba");
    } finally {
      setFormLoading(false);
    }
  };

  const handleRemoveSheep = async (sheepId: string) => {
    if (!confirm("Yakin ingin menghapus domba ini dari kontrak?")) return;

    try {
      await investorService.deallocateSheep(contractId, sheepId);
      await loadData();
    } catch (error) {
      console.error("Error removing sheep:", error);
      alert("Gagal menghapus domba");
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    try {
      await investorService.addExpense(
        contractId,
        expenseForm.category,
        expenseForm.description,
        parseFloat(expenseForm.amount),
        expenseForm.expenseDate
      );
      setIsAddExpenseModalOpen(false);
      setExpenseForm({
        category: "Feed",
        description: "",
        amount: "",
        expenseDate: new Date().toISOString().split("T")[0],
      });
      await loadData();
    } catch (error: any) {
      setFormError(error.message || "Gagal menambahkan pengeluaran");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm("Yakin ingin menghapus pengeluaran ini?")) return;

    try {
      await investorService.deleteExpense(id);
      await loadData();
    } catch (error) {
      console.error("Error deleting expense:", error);
      alert("Gagal menghapus pengeluaran");
    }
  };

  const handleCompleteContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary) return;

    setFormLoading(true);
    try {
      await investorService.completeContract(
        contractId,
        summary.totalRevenue,
        summary.totalExpenses,
        completeForm.notes
      );
      setIsCompleteModalOpen(false);
      await loadData();
    } catch (error: any) {
      console.error("Error completing contract:", error);
      alert(error.message || "Gagal menyelesaikan kontrak");
    } finally {
      setFormLoading(false);
    }
  };

  const getCategoryLabel = (category: ExpenseCategory) => {
    const labels: Record<ExpenseCategory, string> = {
      Feed: "Pakan",
      Medicine: "Obat",
      Vaccination: "Vaksinasi",
      Labor: "Tenaga Kerja",
      Transport: "Transportasi",
      Maintenance: "Perawatan",
      Other: "Lainnya",
    };
    return labels[category];
  };

  if (role !== Role.OWNER) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-4">
        <AlertCircle size={48} />
        <p>Halaman ini hanya untuk Owner</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-4">
        <Loader2 className="animate-spin" size={32} />
        <p>Memuat detail kontrak...</p>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-4">
        <AlertCircle size={48} />
        <p>Kontrak tidak ditemukan</p>
        <button
          onClick={() => navigate({ to: "/investor-contracts" })}
          className="btn btn-ghost"
        >
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate({ to: "/investor-contracts" })}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-800">
                {contract.contractNumber}
              </h1>
              <span
                className={`badge ${
                  contract.status === "Active"
                    ? "badge-success"
                    : contract.status === "Completed"
                    ? "badge-info"
                    : "badge-neutral"
                }`}
              >
                {contract.status}
              </span>
            </div>
            <p className="text-slate-500 text-sm">
              Investor: {contract.investorName} ({contract.investorEmail})
            </p>
          </div>
        </div>
        {contract.status === "Active" && (
          <button
            onClick={() => setIsCompleteModalOpen(true)}
            className="btn btn-secondary"
          >
            <CheckCircle size={18} />
            Selesaikan Kontrak
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-elevated p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white">
              <DollarSign size={20} />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-800">
                Rp {contract.investmentAmount.toLocaleString("id-ID")}
              </p>
              <p className="text-xs text-slate-500">Total Investasi</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-green-500 to-green-600 rounded-xl text-white">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-800">
                Rp {(summary?.totalCurrentValue || 0).toLocaleString("id-ID")}
              </p>
              <p className="text-xs text-slate-500">Nilai Saat Ini</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl text-white">
              <Users size={20} />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-800">
                {summary?.totalSheep || 0} Ekor
              </p>
              <p className="text-xs text-slate-500">Domba Aktif</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl text-white">
              <PiggyBank size={20} />
            </div>
            <div>
              <p
                className={`text-lg font-bold ${
                  (summary?.estimatedRoi || 0) >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {(summary?.estimatedRoi || 0).toFixed(1)}%
              </p>
              <p className="text-xs text-slate-500">Est. ROI</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contract Info */}
      <div className="card-elevated p-5">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div>
            <p className="text-slate-400 text-xs uppercase font-bold mb-1">
              Bagi Hasil
            </p>
            <p className="font-semibold text-slate-800">
              {contract.profitSharingPercentage}% Investor /{" "}
              {100 - contract.profitSharingPercentage}% Owner
            </p>
          </div>
          <div>
            <p className="text-slate-400 text-xs uppercase font-bold mb-1">
              Durasi
            </p>
            <p className="font-semibold text-slate-800">
              {contract.durationMonths} Bulan
            </p>
          </div>
          <div>
            <p className="text-slate-400 text-xs uppercase font-bold mb-1">
              Tanggal Mulai
            </p>
            <p className="font-semibold text-slate-800">
              {new Date(contract.startDate).toLocaleDateString("id-ID")}
            </p>
          </div>
          <div>
            <p className="text-slate-400 text-xs uppercase font-bold mb-1">
              Tanggal Berakhir
            </p>
            <p className="font-semibold text-slate-800">
              {new Date(contract.endDate).toLocaleDateString("id-ID")}
            </p>
          </div>
          <div>
            <p className="text-slate-400 text-xs uppercase font-bold mb-1">
              Est. Profit Investor
            </p>
            <p className="font-semibold text-green-600">
              Rp {(summary?.estimatedInvestorProfit || 0).toLocaleString("id-ID")}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
        {(["SHEEP", "EXPENSES", "REPORTS"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500"
            }`}
          >
            {tab === "SHEEP"
              ? `Domba (${contractSheep.length})`
              : tab === "EXPENSES"
              ? `Pengeluaran (${expenses.length})`
              : "Laporan"}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "SHEEP" && (
        <div className="card-elevated overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Domba Teralokasi</h3>
            {contract.status === "Active" && (
              <button
                onClick={() => setIsAddSheepModalOpen(true)}
                className="btn btn-primary text-sm"
              >
                <Plus size={16} /> Tambah Domba
              </button>
            )}
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
                  <th className="px-5 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contractSheep.map((cs) => (
                  <tr
                    key={cs.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
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
                        {(
                          cs.sheep?.marketValue || cs.purchasePrice
                        ).toLocaleString("id-ID")}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {contract.status === "Active" && cs.status === "Active" && (
                        <button
                          onClick={() => handleRemoveSheep(cs.sheepId)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {contractSheep.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-12 text-center text-slate-400"
                    >
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
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-800">Riwayat Pengeluaran</h3>
              <p className="text-xs text-slate-500">
                Total: Rp {(summary?.totalExpenses || 0).toLocaleString("id-ID")}
              </p>
            </div>
            {contract.status === "Active" && (
              <button
                onClick={() => setIsAddExpenseModalOpen(true)}
                className="btn btn-primary text-sm"
              >
                <Plus size={16} /> Catat Pengeluaran
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                <tr>
                  <th className="px-5 py-4">Tanggal</th>
                  <th className="px-5 py-4">Kategori</th>
                  <th className="px-5 py-4">Deskripsi</th>
                  <th className="px-5 py-4">Jumlah</th>
                  <th className="px-5 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.map((exp) => (
                  <tr
                    key={exp.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      {new Date(exp.expenseDate).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-5 py-4">
                      <span className="badge badge-neutral">
                        {getCategoryLabel(exp.category)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-700">{exp.description}</td>
                    <td className="px-5 py-4 font-semibold text-red-600">
                      - Rp {exp.amount.toLocaleString("id-ID")}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {contract.status === "Active" && (
                        <button
                          onClick={() => handleDeleteExpense(exp.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {expenses.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-12 text-center text-slate-400"
                    >
                      Belum ada pengeluaran tercatat
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "REPORTS" && (
        <div className="card-elevated p-8 text-center">
          <FileText size={48} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-500">
            Fitur laporan keuangan akan segera hadir
          </p>
        </div>
      )}

      {/* Add Sheep Modal */}
      <Modal
        isOpen={isAddSheepModalOpen}
        onClose={() => setIsAddSheepModalOpen(false)}
        title="Tambah Domba ke Kontrak"
      >
        <form onSubmit={handleAddSheep} className="space-y-4">
          {formError && (
            <div className="bg-red-50 border border-red-100 p-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="text-red-500" size={18} />
              <p className="text-sm text-red-700 font-semibold">{formError}</p>
            </div>
          )}

          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
              Pilih Domba
            </label>
            <select
              className="input"
              value={selectedSheepId}
              onChange={(e) => {
                setSelectedSheepId(e.target.value);
                const sheep = availableSheep.find((s) => s.id === e.target.value);
                if (sheep?.marketValue) {
                  setSheepPurchasePrice(sheep.marketValue.toString());
                }
              }}
              required
            >
              <option value="">-- Pilih Domba --</option>
              {availableSheep.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.tagId} - {s.breed} ({s.gender}) - Rp{" "}
                  {(s.marketValue || 0).toLocaleString("id-ID")}
                </option>
              ))}
            </select>
            {availableSheep.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">
                Tidak ada domba tersedia untuk dialokasikan
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
              Harga Pembelian (Rp)
            </label>
            <input
              type="number"
              className="input"
              placeholder="Harga beli domba"
              value={sheepPurchasePrice}
              onChange={(e) => setSheepPurchasePrice(e.target.value)}
              required
              min="0"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={() => setIsAddSheepModalOpen(false)}
              className="btn btn-ghost flex-1"
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={formLoading}
            >
              {formLoading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                "Tambahkan"
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Expense Modal */}
      <Modal
        isOpen={isAddExpenseModalOpen}
        onClose={() => setIsAddExpenseModalOpen(false)}
        title="Catat Pengeluaran"
      >
        <form onSubmit={handleAddExpense} className="space-y-4">
          {formError && (
            <div className="bg-red-50 border border-red-100 p-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="text-red-500" size={18} />
              <p className="text-sm text-red-700 font-semibold">{formError}</p>
            </div>
          )}

          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
              Kategori
            </label>
            <select
              className="input"
              value={expenseForm.category}
              onChange={(e) =>
                setExpenseForm({
                  ...expenseForm,
                  category: e.target.value as ExpenseCategory,
                })
              }
              required
            >
              <option value="Feed">Pakan</option>
              <option value="Medicine">Obat</option>
              <option value="Vaccination">Vaksinasi</option>
              <option value="Labor">Tenaga Kerja</option>
              <option value="Transport">Transportasi</option>
              <option value="Maintenance">Perawatan</option>
              <option value="Other">Lainnya</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
              Deskripsi
            </label>
            <input
              type="text"
              className="input"
              placeholder="Keterangan pengeluaran"
              value={expenseForm.description}
              onChange={(e) =>
                setExpenseForm({ ...expenseForm, description: e.target.value })
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
                Jumlah (Rp)
              </label>
              <input
                type="number"
                className="input"
                placeholder="Jumlah pengeluaran"
                value={expenseForm.amount}
                onChange={(e) =>
                  setExpenseForm({ ...expenseForm, amount: e.target.value })
                }
                required
                min="0"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
                Tanggal
              </label>
              <input
                type="date"
                className="input"
                value={expenseForm.expenseDate}
                onChange={(e) =>
                  setExpenseForm({ ...expenseForm, expenseDate: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={() => setIsAddExpenseModalOpen(false)}
              className="btn btn-ghost flex-1"
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={formLoading}
            >
              {formLoading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                "Simpan"
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Complete Contract Modal */}
      <Modal
        isOpen={isCompleteModalOpen}
        onClose={() => setIsCompleteModalOpen(false)}
        title="Selesaikan Kontrak"
      >
        <form onSubmit={handleCompleteContract} className="space-y-4">
          <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl">
            <p className="text-sm text-amber-800 font-semibold mb-2">
              Ringkasan Penyelesaian:
            </p>
            <div className="space-y-1 text-sm text-amber-700">
              <p>
                Total Revenue: Rp{" "}
                {(summary?.totalRevenue || 0).toLocaleString("id-ID")}
              </p>
              <p>
                Total Expenses: Rp{" "}
                {(summary?.totalExpenses || 0).toLocaleString("id-ID")}
              </p>
              <p>
                Nilai Aset Tersisa: Rp{" "}
                {(summary?.totalCurrentValue || 0).toLocaleString("id-ID")}
              </p>
              <p className="font-bold pt-2 border-t border-amber-200">
                Est. Profit Investor: Rp{" "}
                {(summary?.estimatedInvestorProfit || 0).toLocaleString("id-ID")}
              </p>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
              Catatan Penyelesaian
            </label>
            <textarea
              className="input min-h-[100px]"
              placeholder="Catatan tambahan tentang penyelesaian kontrak..."
              value={completeForm.notes}
              onChange={(e) =>
                setCompleteForm({ ...completeForm, notes: e.target.value })
              }
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={() => setIsCompleteModalOpen(false)}
              className="btn btn-ghost flex-1"
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={formLoading}
            >
              {formLoading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                "Selesaikan Kontrak"
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
