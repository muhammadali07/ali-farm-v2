import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { configService } from "@/services/config.service";
import { userService } from "@/services/user.service";
import { authService } from "@/services/auth.service";
import { AppConfig, User, Role } from "@/types";
import {
  Save,
  Globe,
  Database,
  Users,
  UserPlus,
  Edit2,
  Trash2,
  Loader2,
  BadgeCheck,
  CheckCircle,
  AlertCircle,
  Key,
  Copy,
  RefreshCw,
} from "lucide-react";
import { Modal } from "@/components/Modal";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/_auth/settings")({
  component: Settings,
});

type SettingsTab = "GENERAL" | "USERS";

function Settings() {
  const { user: currentUser, role } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>("GENERAL");
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [userList, setUserList] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isEditUser, setIsEditUser] = useState(false);
  const [userForm, setUserForm] = useState<Partial<User>>({});
  const [userCreating, setUserCreating] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);
  const [userSuccess, setUserSuccess] = useState<string | null>(null);
  const [createdPassword, setCreatedPassword] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [configData, allUsers] = await Promise.all([
        configService.get(),
        userService.findAll(),
      ]);
      setConfig(configData);
      setUserList(allUsers);
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key: keyof AppConfig["features"]) => {
    if (!config) return;
    setConfig({
      ...config,
      features: { ...config.features, [key]: !config.features[key] },
    });
  };

  const handleSaveConfig = async () => {
    if (!config) return;
    setSaving(true);
    setSaveSuccess(false);
    try {
      await configService.update(config.features);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving config:", error);
    } finally {
      setSaving(false);
    }
  };

  const openAddUser = () => {
    setIsEditUser(false);
    setUserForm({
      role: Role.INVESTOR,
      status: "Active",
      avatarUrl: `https://i.pravatar.cc/150?u=${Math.random()}`,
    });
    setUserError(null);
    setUserSuccess(null);
    setCreatedPassword(null);
    setIsUserModalOpen(true);
  };

  const openEditUser = (u: User) => {
    setIsEditUser(true);
    setUserForm(u);
    setUserError(null);
    setUserSuccess(null);
    setCreatedPassword(null);
    setIsUserModalOpen(true);
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserCreating(true);
    setUserError(null);
    setUserSuccess(null);

    try {
      if (isEditUser) {
        // Update existing user profile
        if (userForm.id) {
          await userService.update(userForm.id, {
            name: userForm.name,
            role: userForm.role,
            status: userForm.status,
          });
          setUserSuccess("User berhasil diupdate!");
          await loadData();
          setTimeout(() => {
            setIsUserModalOpen(false);
          }, 1500);
        }
      } else {
        // Create new user with default password
        if (!userForm.email || !userForm.name) {
          setUserError("Email dan nama harus diisi.");
          setUserCreating(false);
          return;
        }

        const result = await authService.createUserByAdmin(
          userForm.email,
          userForm.name,
          userForm.role || Role.INVESTOR,
        );

        setCreatedPassword(result.defaultPassword);
        setUserSuccess(
          `User berhasil dibuat! Password default: ${result.defaultPassword}`,
        );
        await loadData();
      }
    } catch (error: any) {
      console.error("Error creating/updating user:", error);
      if (error.message?.includes("User already registered")) {
        setUserError("Email sudah terdaftar.");
      } else {
        setUserError(error.message || "Terjadi kesalahan.");
      }
    } finally {
      setUserCreating(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (id === currentUser?.id) {
      alert("Tidak dapat menghapus user yang sedang login.");
      return;
    }

    if (!confirm("Yakin ingin menonaktifkan user ini?")) return;

    try {
      await userService.update(id, { status: "Inactive" });
      await loadData();
    } catch (error) {
      console.error("Error deactivating user:", error);
      alert("Gagal menonaktifkan user.");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Disalin ke clipboard!");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-4">
        <Loader2 className="animate-spin" size={32} />
        <p>Memuat pengaturan...</p>
      </div>
    );
  }

  if (!config) return null;

  const ToggleSwitch = ({
    active,
    onToggle,
  }: {
    active: boolean;
    onToggle: () => void;
  }) => (
    <button
      onClick={onToggle}
      className={`relative w-12 h-7 rounded-full transition-all ${active ? "bg-agri-500" : "bg-slate-200"}`}
    >
      <div
        className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full shadow-sm transition-all ${active ? "translate-x-5" : "translate-x-0"}`}
      />
    </button>
  );

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Pengaturan</h1>
          <p className="text-slate-500">Administrasi platform dan pengguna.</p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab("GENERAL")}
            className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "GENERAL"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500"
            }`}
          >
            Umum
          </button>
          <button
            onClick={() => setActiveTab("USERS")}
            className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "USERS"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500"
            }`}
          >
            Manajemen User
          </button>
        </div>
      </div>

      {activeTab === "GENERAL" ? (
        <div className="space-y-6">
          {/* Feature Toggles */}
          <section className="card-elevated overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-4">
              <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white">
                <Globe size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">
                  Visibilitas Landing Page
                </h3>
                <p className="text-xs text-slate-500">
                  Kontrol apa yang bisa dilihat pengunjung publik. Perubahan
                  akan disimpan ke database.
                </p>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {(["investment", "qurban", "marketplace"] as const).map((key) => (
                <div
                  key={key}
                  className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800 capitalize">
                      {key === "investment"
                        ? "Investasi"
                        : key === "qurban"
                          ? "Tabungan Qurban"
                          : "Marketplace"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {key === "investment"
                        ? "Tampilkan fitur investasi domba di landing page."
                        : key === "qurban"
                          ? "Tampilkan fitur tabungan qurban di landing page."
                          : "Tampilkan produk marketplace di landing page."}
                    </p>
                  </div>
                  <ToggleSwitch
                    active={config.features[key]}
                    onToggle={() => handleToggle(key)}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Infrastructure & Save */}
          <section className="card-elevated p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-gradient-to-br from-agri-500 to-agri-600 rounded-xl text-white">
                  <Database size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Infrastruktur</h3>
                  <p className="text-xs text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded mt-1">
                    Supabase PostgreSQL Connected
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {saveSuccess && (
                  <span className="flex items-center gap-1.5 text-sm text-green-600 font-semibold animate-fade-in">
                    <CheckCircle size={16} />
                    Tersimpan!
                  </span>
                )}
                <button
                  onClick={handleSaveConfig}
                  disabled={saving}
                  className="btn btn-secondary"
                >
                  {saving ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <Save size={16} />
                  )}
                  {saving ? "Menyimpan..." : "Simpan Konfigurasi"}
                </button>
              </div>
            </div>
          </section>
        </div>
      ) : (
        <section className="card-elevated overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white">
                <Users size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Direktori User</h3>
                <p className="text-xs text-slate-500">
                  Manajemen akun dan role. Password default:{" "}
                  <code className="bg-slate-200 px-1 rounded">
                    alifarmjember
                  </code>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={loadData} className="btn btn-ghost text-sm">
                <RefreshCw size={16} />
              </button>
              {role === Role.OWNER && (
                <button
                  onClick={openAddUser}
                  className="btn btn-primary text-sm"
                >
                  <UserPlus size={16} /> User Baru
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Info User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {userList.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 font-bold">
                        {u.id.substring(0, 8)}...
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            u.avatarUrl ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=16a34a&color=fff`
                          }
                          className="w-9 h-9 rounded-xl object-cover border-2 border-white shadow-sm"
                          alt={u.name}
                        />
                        <div>
                          <p className="text-sm font-bold text-slate-800">
                            {u.name}
                          </p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`badge ${
                          u.role === Role.OWNER
                            ? "badge-success"
                            : u.role === Role.STAFF
                              ? "badge-info"
                              : "badge-neutral"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`flex items-center gap-1.5 text-xs font-semibold ${
                          u.status === "Active"
                            ? "text-agri-600"
                            : "text-slate-400"
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${
                            u.status === "Active"
                              ? "bg-agri-500"
                              : "bg-slate-400"
                          }`}
                        />
                        {u.status === "Active" ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {role === Role.OWNER && (
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => openEditUser(u)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          {u.id !== currentUser?.id && (
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {userList.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-slate-400"
                    >
                      Tidak ada user terdaftar
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* User Modal */}
      <Modal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        title={isEditUser ? "Edit User" : "Tambah User Baru"}
      >
        <form onSubmit={handleUserSubmit} className="space-y-4">
          {!isEditUser && (
            <div className="bg-agri-50 border border-agri-100 p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2">
                <Key className="text-agri-600" size={18} />
                <p className="text-sm text-agri-700 font-semibold">
                  Password Default
                </p>
              </div>
              <div className="flex items-center gap-2 bg-white rounded-lg p-2">
                <code className="flex-1 text-sm font-mono text-slate-700">
                  alifarmjember
                </code>
                <button
                  type="button"
                  onClick={() => copyToClipboard("alifarmjember")}
                  className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <Copy size={14} className="text-slate-500" />
                </button>
              </div>
              <p className="text-xs text-agri-600">
                User baru akan login dengan password ini. Sarankan untuk segera
                mengubah password setelah login pertama.
              </p>
            </div>
          )}

          {userError && (
            <div className="bg-red-50 border border-red-100 p-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="text-red-500" size={18} />
              <p className="text-sm text-red-700 font-semibold">{userError}</p>
            </div>
          )}

          {userSuccess && (
            <div className="bg-green-50 border border-green-100 p-3 rounded-xl flex items-center gap-2">
              <CheckCircle className="text-green-500" size={18} />
              <p className="text-sm text-green-700 font-semibold">
                {userSuccess}
              </p>
            </div>
          )}

          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
              Nama Lengkap
            </label>
            <input
              required
              className="input"
              placeholder="Nama lengkap user"
              value={userForm.name || ""}
              onChange={(e) =>
                setUserForm({ ...userForm, name: e.target.value })
              }
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
              Email
            </label>
            <input
              required
              type="email"
              className="input"
              placeholder="email@example.com"
              value={userForm.email || ""}
              onChange={(e) =>
                setUserForm({ ...userForm, email: e.target.value })
              }
              disabled={isEditUser}
            />
            {isEditUser && (
              <p className="text-xs text-slate-400 mt-1">
                Email tidak dapat diubah
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
                Role
              </label>
              <select
                className="input"
                value={userForm.role}
                onChange={(e) =>
                  setUserForm({ ...userForm, role: e.target.value as Role })
                }
              >
                <option value={Role.INVESTOR}>Investor</option>
                <option value={Role.STAFF}>Staff</option>
                <option value={Role.OWNER}>Owner</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
                Status
              </label>
              <select
                className="input"
                value={userForm.status}
                onChange={(e) =>
                  setUserForm({
                    ...userForm,
                    status: e.target.value as "Active" | "Inactive",
                  })
                }
              >
                <option value="Active">Aktif</option>
                <option value="Inactive">Nonaktif</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={() => setIsUserModalOpen(false)}
              className="btn btn-ghost flex-1"
            >
              {createdPassword ? "Tutup" : "Batal"}
            </button>
            {!createdPassword && (
              <button
                type="submit"
                className="btn btn-primary flex-1"
                disabled={userCreating}
              >
                {userCreating ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : isEditUser ? (
                  "Simpan"
                ) : (
                  "Buat User"
                )}
              </button>
            )}
          </div>
        </form>
      </Modal>
    </div>
  );
}
