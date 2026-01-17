import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { investorService } from "@/services/investor.service";
import { userService } from "@/services/user.service";
import { sheepService } from "@/services/sheep.service";
import {
  InvestorContract,
  ContractSheep,
  ContractExpense,
  ContractSummary,
  User,
  Sheep,
  Role,
  ExpenseCategory,
} from "@/types";
import {
  FileText,
  Plus,
  Users,
  Loader2,
  ChevronRight,
  Calendar,
  DollarSign,
  TrendingUp,
  Eye,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  PiggyBank,
  Receipt,
  ArrowLeft,
} from "lucide-react";
import { Modal } from "@/components/Modal";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/_auth/investor-contracts")({
  component: InvestorContractsPage,
});

function InvestorContractsPage() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [contracts, setContracts] = useState<InvestorContract[]>([]);
  const [investors, setInvestors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<InvestorContract | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    investorId: "",
    investmentAmount: "",
    profitSharingPercentage: "70",
    durationMonths: "12",
    startDate: new Date().toISOString().split("T")[0],
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [contractsData, usersData] = await Promise.all([
        investorService.findAllContracts(),
        userService.findAll(),
      ]);
      setContracts(contractsData);
      // Filter only investors
      setInvestors(usersData.filter((u) => u.role === Role.INVESTOR));
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);

    try {
      if (!formData.investorId) {
        setFormError("Pilih investor terlebih dahulu");
        setFormLoading(false);
        return;
      }

      await investorService.createContract(
        formData.investorId,
        parseFloat(formData.investmentAmount),
        parseFloat(formData.profitSharingPercentage),
        parseInt(formData.durationMonths),
        formData.startDate
      );

      setIsCreateModalOpen(false);
      setFormData({
        investorId: "",
        investmentAmount: "",
        profitSharingPercentage: "70",
        durationMonths: "12",
        startDate: new Date().toISOString().split("T")[0],
      });
      await loadData();
    } catch (error: any) {
      console.error("Error creating contract:", error);
      setFormError(error.message || "Gagal membuat kontrak");
    } finally {
      setFormLoading(false);
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
        <p>Memuat data kontrak...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Kelola Investor</h1>
          <p className="text-slate-500 text-sm">
            Buat dan kelola kontrak investasi dengan investor.
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn btn-primary"
        >
          <Plus size={18} />
          Kontrak Baru
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-elevated p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white">
              <FileText size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">
                {contracts.length}
              </p>
              <p className="text-xs text-slate-500">Total Kontrak</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-green-500 to-green-600 rounded-xl text-white">
              <CheckCircle size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">
                {contracts.filter((c) => c.status === "Active").length}
              </p>
              <p className="text-xs text-slate-500">Kontrak Aktif</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl text-white">
              <Users size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">
                {investors.length}
              </p>
              <p className="text-xs text-slate-500">Total Investor</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl text-white">
              <PiggyBank size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">
                Rp{" "}
                {(
                  contracts.reduce((sum, c) => sum + c.investmentAmount, 0) /
                  1000000
                ).toFixed(1)}
                Jt
              </p>
              <p className="text-xs text-slate-500">Total Investasi</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contracts Table */}
      <div className="card-elevated overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-800">Daftar Kontrak Investasi</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-bold tracking-widest">
              <tr>
                <th className="px-5 py-4">No. Kontrak</th>
                <th className="px-5 py-4">Investor</th>
                <th className="px-5 py-4">Investasi</th>
                <th className="px-5 py-4">Bagi Hasil</th>
                <th className="px-5 py-4">Durasi</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {contracts.map((contract) => (
                <tr
                  key={contract.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-5 py-4">
                    <span className="font-mono text-sm font-bold text-slate-700">
                      {contract.contractNumber}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div>
                      <p className="font-semibold text-slate-800">
                        {contract.investorName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {contract.investorEmail}
                      </p>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-bold text-slate-800">
                      Rp {contract.investmentAmount.toLocaleString("id-ID")}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-slate-600">
                      {contract.profitSharingPercentage}% Investor
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-sm">
                      <p className="text-slate-700">
                        {contract.durationMonths} Bulan
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(contract.startDate).toLocaleDateString(
                          "id-ID",
                          { day: "numeric", month: "short", year: "numeric" }
                        )}{" "}
                        -{" "}
                        {new Date(contract.endDate).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`badge ${getStatusColor(contract.status)}`}>
                      {contract.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() =>
                        navigate({
                          to: "/investor-contracts/$contractId",
                          params: { contractId: contract.id },
                        })
                      }
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {contracts.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-slate-400"
                  >
                    <FileText size={48} className="mx-auto mb-3 opacity-50" />
                    <p>Belum ada kontrak investasi</p>
                    <button
                      onClick={() => setIsCreateModalOpen(true)}
                      className="mt-3 text-agri-600 font-semibold hover:underline"
                    >
                      Buat kontrak pertama
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Contract Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Buat Kontrak Investasi Baru"
      >
        <form onSubmit={handleCreateContract} className="space-y-4">
          {formError && (
            <div className="bg-red-50 border border-red-100 p-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="text-red-500" size={18} />
              <p className="text-sm text-red-700 font-semibold">{formError}</p>
            </div>
          )}

          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
              Pilih Investor
            </label>
            <select
              className="input"
              value={formData.investorId}
              onChange={(e) =>
                setFormData({ ...formData, investorId: e.target.value })
              }
              required
            >
              <option value="">-- Pilih Investor --</option>
              {investors.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.name} ({inv.email})
                </option>
              ))}
            </select>
            {investors.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">
                Belum ada investor terdaftar. Tambah user dengan role Investor di
                Settings.
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
              Jumlah Investasi (Rp)
            </label>
            <input
              type="number"
              className="input"
              placeholder="Contoh: 50000000"
              value={formData.investmentAmount}
              onChange={(e) =>
                setFormData({ ...formData, investmentAmount: e.target.value })
              }
              required
              min="1000000"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
                Bagi Hasil Investor (%)
              </label>
              <input
                type="number"
                className="input"
                value={formData.profitSharingPercentage}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    profitSharingPercentage: e.target.value,
                  })
                }
                required
                min="1"
                max="100"
              />
              <p className="text-xs text-slate-400 mt-1">
                Owner mendapat {100 - parseInt(formData.profitSharingPercentage || "0")}%
              </p>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
                Durasi (Bulan)
              </label>
              <input
                type="number"
                className="input"
                value={formData.durationMonths}
                onChange={(e) =>
                  setFormData({ ...formData, durationMonths: e.target.value })
                }
                required
                min="1"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
              Tanggal Mulai
            </label>
            <input
              type="date"
              className="input"
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
              required
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
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
                "Buat Kontrak"
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
