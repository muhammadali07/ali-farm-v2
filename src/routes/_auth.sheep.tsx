import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { sheepService } from "@/services/sheep.service";
import { cageService } from "@/services/cage.service";
import { SheepStatus, Sheep, Cage } from "@/types";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Loader2,
  Calendar,
  Weight,
  MapPin,
} from "lucide-react";
import { Modal } from "@/components/Modal";
import { LineChart, Line, Tooltip, ResponsiveContainer, XAxis } from "recharts";

export const Route = createFileRoute("/_auth/sheep")({
  component: SheepManager,
});

function SheepManager() {
  const [sheepList, setSheepList] = useState<Sheep[]>([]);
  const [cages, setCages] = useState<Cage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSheepId, setSelectedSheepId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<Sheep>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [sheepData, cageData] = await Promise.all([
        sheepService.findAll(),
        cageService.findAll(),
      ]);
      setSheepList(sheepData);
      setCages(cageData);
      if (!selectedSheepId && sheepData.length > 0) {
        setSelectedSheepId(sheepData[0].id);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = async () => {
    setEditMode(false);
    const nextTagId = await sheepService.getNextTagId();
    setFormData({
      tagId: nextTagId,
      status: SheepStatus.HEALTHY,
      gender: "Male",
      breed: "Merino",
      dob: new Date().toISOString().split("T")[0],
      cageId: cages[0]?.id || "",
      imageUrl: `https://images.unsplash.com/photo-1484557985045-edf25e08da73?w=400`,
      weightHistory: [],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sheep: Sheep) => {
    setEditMode(true);
    setFormData(sheep);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Hapus data domba ini?")) {
      try {
        await sheepService.delete(id);
        await loadData();
        if (selectedSheepId === id) {
          setSelectedSheepId(null);
        }
      } catch (error) {
        console.error("Error deleting sheep:", error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tagId || !formData.breed) {
      alert("Tag ID dan Breed wajib diisi");
      return;
    }

    setSubmitting(true);
    try {
      if (editMode && formData.id) {
        await sheepService.update(formData.id, formData);
      } else {
        await sheepService.create(
          formData as Omit<Sheep, "id" | "weightHistory">,
        );
      }
      setIsModalOpen(false);
      await loadData();
    } catch (error) {
      console.error("Error saving sheep:", error);
      alert("Gagal menyimpan data");
    } finally {
      setSubmitting(false);
    }
  };

  const activeSheepData = sheepList.find((s) => s.id === selectedSheepId);
  const filteredSheep = sheepList.filter(
    (s) =>
      s.tagId.toLowerCase().includes(search.toLowerCase()) ||
      s.breed.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Memuat data domba...</span>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: SheepStatus) => {
    const styles = {
      [SheepStatus.HEALTHY]: "badge-success",
      [SheepStatus.SICK]: "badge-danger",
      [SheepStatus.SOLD]: "badge-warning",
      [SheepStatus.DECEASED]: "badge-neutral",
      [SheepStatus.QUARANTINE]: "badge-info",
    };
    return styles[status] || "badge-neutral";
  };

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manajemen Domba</h1>
          <p className="text-slate-500 text-sm">
            Mengelola {sheepList.length} ekor domba
          </p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-primary">
          <Plus size={18} /> Tambah Baru
        </button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Table */}
        <div className="lg:col-span-2 card-elevated flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center gap-4">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                className="input pl-10"
                placeholder="Cari Tag ID atau Breed..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 overflow-auto scrollbar-thin">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 sticky top-0">
                <tr>
                  <th className="px-6 py-4 font-semibold">Tag ID</th>
                  <th className="px-6 py-4 font-semibold">Breed</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSheep.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => setSelectedSheepId(s.id)}
                    className={`cursor-pointer transition-colors ${
                      selectedSheepId === s.id
                        ? "bg-agri-50/50 border-l-2 border-l-agri-500"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-800">
                        {s.tagId}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{s.breed}</td>
                    <td className="px-6 py-4">
                      <span className={`badge ${getStatusBadge(s.status)}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEdit(s);
                          }}
                          className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(s.id);
                          }}
                          className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredSheep.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-12 text-center text-slate-400"
                    >
                      Tidak ada data domba
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-1">
          {activeSheepData ? (
            <div className="card-elevated p-6 space-y-5 sticky top-4">
              <img
                src={
                  activeSheepData.imageUrl ||
                  "https://images.unsplash.com/photo-1484557985045-edf25e08da73?w=400"
                }
                className="w-full h-44 object-cover rounded-xl"
                alt="Sheep"
              />
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-800">
                    {activeSheepData.tagId}
                  </h3>
                  <span
                    className={`badge ${getStatusBadge(activeSheepData.status)}`}
                  >
                    {activeSheepData.status}
                  </span>
                </div>
                <p className="text-slate-500 text-sm mt-1">
                  {activeSheepData.breed}
                </p>
              </div>

              {/* Weight Chart */}
              {activeSheepData.weightHistory.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Riwayat Berat
                  </p>
                  <div className="h-28 bg-slate-50 rounded-xl p-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={activeSheepData.weightHistory}>
                        <XAxis dataKey="date" tick={false} axisLine={false} />
                        <Line
                          type="monotone"
                          dataKey="weight"
                          stroke="#22c55e"
                          strokeWidth={2.5}
                          dot={{ fill: "#22c55e", strokeWidth: 0, r: 3 }}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: "8px",
                            border: "none",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                          }}
                          formatter={(value: number) => [
                            `${value} kg`,
                            "Berat",
                          ]}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <Weight size={14} />
                    <p className="text-xs font-medium">Berat</p>
                  </div>
                  <p className="font-bold text-slate-800">
                    {activeSheepData.weightHistory.length > 0
                      ? `${activeSheepData.weightHistory.slice(-1)[0].weight} kg`
                      : "-"}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <Calendar size={14} />
                    <p className="text-xs font-medium">Lahir</p>
                  </div>
                  <p className="font-bold text-slate-800">
                    {activeSheepData.dob}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl col-span-2">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <MapPin size={14} />
                    <p className="text-xs font-medium">Kandang</p>
                  </div>
                  <p className="font-bold text-slate-800">
                    {activeSheepData.cageId || "-"}
                  </p>
                </div>
              </div>

              {activeSheepData.notes && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                  <p className="text-xs font-semibold text-amber-600 mb-1">
                    Catatan
                  </p>
                  <p className="text-sm text-amber-800">
                    {activeSheepData.notes}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="card-elevated p-12 text-center">
              <p className="text-slate-400">Pilih domba untuk melihat detail</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editMode ? "Edit Domba" : "Tambah Domba Baru"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
              Tag ID
            </label>
            <input
              required
              placeholder="Contoh: AF-001"
              className="input"
              value={formData.tagId || ""}
              onChange={(e) =>
                setFormData({ ...formData, tagId: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
                Breed
              </label>
              <select
                className="input"
                value={formData.breed || ""}
                onChange={(e) =>
                  setFormData({ ...formData, breed: e.target.value })
                }
              >
                <option value="Merino">Merino</option>
                <option value="Dorper">Dorper</option>
                <option value="Garut">Garut</option>
                <option value="Suffolk">Suffolk</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
                Gender
              </label>
              <select
                className="input"
                value={formData.gender || "Male"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    gender: e.target.value as "Male" | "Female",
                  })
                }
              >
                <option value="Male">Jantan</option>
                <option value="Female">Betina</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
                Tanggal Lahir
              </label>
              <input
                type="date"
                className="input"
                value={formData.dob || ""}
                onChange={(e) =>
                  setFormData({ ...formData, dob: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
                Kandang
              </label>
              <select
                className="input"
                value={formData.cageId || ""}
                onChange={(e) =>
                  setFormData({ ...formData, cageId: e.target.value })
                }
              >
                {cages.map((cage) => (
                  <option key={cage.id} value={cage.id}>
                    {cage.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
              Status
            </label>
            <select
              className="input"
              value={formData.status || SheepStatus.HEALTHY}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as SheepStatus,
                })
              }
            >
              <option value={SheepStatus.HEALTHY}>Sehat</option>
              <option value={SheepStatus.SICK}>Sakit</option>
              <option value={SheepStatus.QUARANTINE}>Karantina</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
              Catatan (Opsional)
            </label>
            <textarea
              className="input min-h-[80px]"
              placeholder="Catatan tambahan..."
              value={formData.notes || ""}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary w-full"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Simpan"
            )}
          </button>
        </form>
      </Modal>
    </div>
  );
}
