import { createFileRoute, useNavigate } from '@tanstack/react-router';
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { AppConfig, User, Role } from '../types';
import { Save, Globe, Database, Users, UserPlus, Edit2, Trash2, Loader2, BadgeCheck } from 'lucide-react';
import { Modal } from '../components/Modal';

export const Route = createFileRoute('/_auth/settings')({
    component: Settings,
})

type SettingsTab = 'GENERAL' | 'USERS';

function Settings() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<SettingsTab>('GENERAL');
    const [config, setConfig] = useState<AppConfig | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [userList, setUserList] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Modal State
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [isEditUser, setIsEditUser] = useState(false);
    const [userForm, setUserForm] = useState<Partial<User>>({});

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const configData = await db.getConfig();
        const userData = await db.getUser();
        const allUsers = await db.users.find();

        setConfig(configData);
        setUser(userData);
        setUserList(allUsers);
        setLoading(false);
    };

    const handleToggle = (key: keyof AppConfig['features']) => {
        if (!config) return;
        setConfig({
            ...config,
            features: { ...config.features, [key]: !config.features[key] }
        });
    };

    const handleSaveConfig = async () => {
        if (!config) return;
        setSaving(true);
        await db.updateConfig(config);
        setTimeout(() => {
            setSaving(false);
        }, 800);
    };

    // --- USER CRUD ---
    const openAddUser = () => {
        setIsEditUser(false);
        setUserForm({
            role: Role.INVESTOR,
            status: 'Active',
            avatarUrl: `https://i.pravatar.cc/150?u=${Math.random()}`
        });
        setIsUserModalOpen(true);
    };

    const openEditUser = (u: User) => {
        setIsEditUser(true);
        setUserForm(u);
        setIsUserModalOpen(true);
    };

    const handleUserSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userForm.name || !userForm.email) return;

        if (isEditUser && userForm.id) {
            await db.users.update(userForm.id, userForm);
        } else {
            await db.users.create(userForm as User);
        }

        setIsUserModalOpen(false);
        loadData();
    };

    const handleDeleteUser = async (id: string) => {
        if (id === user?.id) {
            alert("Cannot delete current logged-in user.");
            return;
        }
        if (confirm('Permanently delete this user?')) {
            await db.users.delete(id);
            loadData();
        }
    };

    if (loading || !config || !user) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-4">
                <Loader2 className="animate-spin" size={32} />
                <p>Loading settings...</p>
            </div>
        );
    }

    const ToggleSwitch = ({ active, onToggle }: { active: boolean; onToggle: () => void }) => (
        <button
            onClick={onToggle}
            className={`relative w-12 h-7 rounded-full transition-all ${active ? 'bg-agri-500' : 'bg-slate-200'}`}
        >
            <div className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full transition-all ${active ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
    );

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Settings</h1>
                    <p className="text-slate-500">Platform and user administration.</p>
                </div>

                <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
                    <button
                        onClick={() => setActiveTab('GENERAL')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'GENERAL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                    >
                        General
                    </button>
                    <button
                        onClick={() => setActiveTab('USERS')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'USERS' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                    >
                        User Management
                    </button>
                </div>
            </div>

            {activeTab === 'GENERAL' ? (
                <div className="space-y-6">
                    <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-4">
                            <Globe className="text-blue-500" />
                            <div>
                                <h3 className="font-bold">Landing Page Visibility</h3>
                                <p className="text-xs text-slate-500">Control what public visitors can see.</p>
                            </div>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {['investment', 'qurban', 'marketplace'].map((key) => (
                                <div key={key} className="p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-bold text-slate-800 capitalize">{key} Section</p>
                                        <p className="text-xs text-slate-500">Toggle display on public landing page.</p>
                                    </div>
                                    <ToggleSwitch active={(config.features as any)[key]} onToggle={() => handleToggle(key as any)} />
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <Database className="text-agri-600" />
                            <div>
                                <h3 className="font-bold">Infrastructure</h3>
                                <p className="text-xs text-slate-500 font-mono">Railway MongoDB Connected</p>
                            </div>
                        </div>
                        <button onClick={handleSaveConfig} disabled={saving} className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold text-sm flex items-center gap-2">
                            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                            {saving ? 'Saving...' : 'Save Configuration'}
                        </button>
                    </section>

                    <div className="pt-6 border-t border-slate-200">
                        <button onClick={() => navigate({ to: '/' })} className="text-red-500 font-bold text-sm hover:underline">
                            Sign Out
                        </button>
                    </div>
                </div>
            ) : (
                <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <div className="flex items-center gap-3">
                            <Users className="text-blue-600" />
                            <div>
                                <h3 className="font-bold text-slate-800">User Directory</h3>
                                <p className="text-xs text-slate-500">Account management and roles.</p>
                            </div>
                        </div>
                        <button onClick={openAddUser} className="bg-agri-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2">
                            <UserPlus size={16} /> New User
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                                <tr>
                                    <th className="px-6 py-4">Username / ID</th>
                                    <th className="px-6 py-4">User Info</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {userList.map((u) => (
                                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 font-bold">
                                                {u.id}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img src={u.avatarUrl} className="w-8 h-8 rounded-full object-cover border" />
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">{u.name}</p>
                                                    <p className="text-[10px] text-slate-500">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${u.role === Role.OWNER ? 'bg-green-50 text-green-700 border-green-100' :
                                                    u.role === Role.STAFF ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                        'bg-purple-50 text-purple-700 border-purple-100'
                                                }`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`flex items-center gap-1.5 text-[10px] font-bold ${u.status === 'Active' ? 'text-agri-600' : 'text-slate-400'}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${u.status === 'Active' ? 'bg-agri-600' : 'bg-slate-400'}`} />
                                                {u.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => openEditUser(u)} className="p-1.5 text-slate-400 hover:text-blue-600"><Edit2 size={16} /></button>
                                                <button onClick={() => handleDeleteUser(u.id)} className="p-1.5 text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {/* User Management Modal */}
            <Modal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} title={isEditUser ? 'Edit User' : 'Register New User'}>
                <form onSubmit={handleUserSubmit} className="space-y-4">
                    {!isEditUser && (
                        <div className="bg-agri-50 border border-agri-100 p-3 rounded-lg flex items-center gap-2 mb-2">
                            <BadgeCheck className="text-agri-600" size={18} />
                            <p className="text-[10px] text-agri-700 font-bold uppercase tracking-tight">System will generate AF-xxx ID automatically</p>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Full Name</label>
                        <input
                            required
                            className="w-full p-2.5 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-agri-500"
                            placeholder="Name"
                            value={userForm.name || ''}
                            onChange={e => setUserForm({ ...userForm, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Email</label>
                        <input
                            required
                            type="email"
                            className="w-full p-2.5 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-agri-500"
                            placeholder="email@example.com"
                            value={userForm.email || ''}
                            onChange={e => setUserForm({ ...userForm, email: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Role</label>
                            <select
                                className="w-full p-2.5 bg-slate-50 border rounded-xl outline-none"
                                value={userForm.role}
                                onChange={e => setUserForm({ ...userForm, role: e.target.value as Role })}
                            >
                                <option value={Role.INVESTOR}>Investor</option>
                                <option value={Role.STAFF}>Staff</option>
                                <option value={Role.OWNER}>Owner</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Status</label>
                            <select
                                className="w-full p-2.5 bg-slate-50 border rounded-xl outline-none"
                                value={userForm.status}
                                onChange={e => setUserForm({ ...userForm, status: e.target.value as any })}
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={() => setIsUserModalOpen(false)} className="flex-1 py-3 border rounded-xl font-bold text-slate-500">Cancel</button>
                        <button type="submit" className="flex-1 py-3 bg-agri-600 text-white rounded-xl font-bold shadow-lg shadow-agri-100">
                            {isEditUser ? 'Save Changes' : 'Create User'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
