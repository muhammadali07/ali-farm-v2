import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  PiggyBank,
  Target,
  Calendar,
  CreditCard,
  Loader2,
  Plus,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { qurbanService } from "@/services/qurban.service";
import { Modal } from "@/components/Modal";

export const Route = createFileRoute("/_auth/qurban")({
  component: Qurban,
});

function Qurban() {
  const { user, supabaseUser, refreshUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!user) return null;

  const saving = user.qurban;

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saving || !depositAmount) return;

    setSubmitting(true);
    try {
      await qurbanService.addToSaving(saving.id, parseInt(depositAmount));
      await refreshUser();
      setIsModalOpen(false);
      setDepositAmount("");
    } catch (error) {
      console.error("Error adding deposit:", error);
      alert("Gagal menambah deposit");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateSaving = async () => {
    if (!supabaseUser) return;

    setSubmitting(true);
    try {
      // Create new qurban saving with default target
      const targetDate = new Date();
      targetDate.setMonth(targetDate.getMonth() + 6);

      await qurbanService.createSaving(
        supabaseUser.id,
        3500000, // Default target for Domba Super
        targetDate.toISOString().split("T")[0],
      );
      await refreshUser();
    } catch (error) {
      console.error("Error creating saving:", error);
      alert("Gagal membuat tabungan");
    } finally {
      setSubmitting(false);
    }
  };

  if (!saving) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="card-elevated p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-emerald-500/25">
            <PiggyBank size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">
            Mulai Tabung Qurban
          </h2>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            Siapkan ibadah qurban Anda dengan menabung secara berkala. Kami akan
            membantu Anda mencapai target.
          </p>
          <button
            onClick={handleCreateSaving}
            disabled={submitting}
            className="btn btn-primary"
          >
            {submitting ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <Plus size={18} />
                Buat Tabungan Qurban
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  const progress = (saving.currentAmount / saving.targetAmount) * 100;
  const remaining = saving.targetAmount - saving.currentAmount;

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          Tabung Qurban
        </h1>
        <p className="text-slate-500">Menabung untuk ibadah qurban Anda.</p>
      </div>

      {/* Main Card */}
      <div className="card-elevated p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
          <div>
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
              Total Tabungan
            </p>
            <h2 className="text-4xl font-bold text-gradient-agri mt-1">
              Rp {saving.currentAmount.toLocaleString("id-ID")}
            </h2>
          </div>
          <div className="text-left md:text-right">
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
              Target
            </p>
            <h3 className="text-xl font-bold text-slate-800">
              Rp {saving.targetAmount.toLocaleString("id-ID")}
            </h3>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative h-6 bg-slate-100 rounded-full overflow-hidden mb-3">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-agri-500 to-agri-600 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-white drop-shadow">
              {progress.toFixed(1)}%
            </span>
          </div>
        </div>
        <p className="text-right text-sm text-slate-500 font-medium mb-8">
          {progress >= 100
            ? "Target tercapai!"
            : `${progress.toFixed(1)}% dari target`}
        </p>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-50 p-4 rounded-xl flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white shadow-lg shadow-blue-500/25">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">
                Target Tanggal
              </p>
              <p className="font-bold text-slate-700">{saving.targetDate}</p>
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl text-white shadow-lg shadow-purple-500/25">
              <Target size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Sisa Target</p>
              <p className="font-bold text-slate-700">
                Rp {remaining > 0 ? remaining.toLocaleString("id-ID") : 0}
              </p>
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl text-white shadow-lg shadow-orange-500/25">
              <PiggyBank size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Auto-save</p>
              <p className="font-bold text-slate-700">Rp 500.000/bln</p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-8 pt-8 border-t border-slate-100 flex justify-center">
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-secondary"
          >
            <CreditCard size={18} />
            Tambah Deposit
          </button>
        </div>
      </div>

      {/* Deposit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tambah Deposit"
        size="sm"
      >
        <form onSubmit={handleDeposit} className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
              Jumlah Deposit
            </label>
            <input
              type="number"
              className="input"
              placeholder="Contoh: 500000"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              required
              min="10000"
            />
            <p className="text-xs text-slate-400 mt-1.5">Minimal Rp 10.000</p>
          </div>

          {/* Quick Amount Buttons */}
          <div className="flex gap-2">
            {[100000, 250000, 500000, 1000000].map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => setDepositAmount(amount.toString())}
                className="flex-1 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                {amount >= 1000000
                  ? `${amount / 1000000}jt`
                  : `${amount / 1000}rb`}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary w-full"
          >
            {submitting ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              "Konfirmasi Deposit"
            )}
          </button>
        </form>
      </Modal>
    </div>
  );
}
