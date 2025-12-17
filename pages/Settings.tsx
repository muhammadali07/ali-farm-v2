import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { AppConfig, User, Role } from '../types';
import { Save, Globe, Check, LogOut, UserX, Shield, CreditCard, ChevronRight, AlertTriangle } from 'lucide-react';
import { Modal } from '../components/Modal';

interface SettingsProps {
  onLogout: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onLogout }) => {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const configData = await db.getConfig();
      const userData = await db.getUser();
      setConfig(configData);
      setUser(userData);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleToggle = (key: keyof AppConfig['features']) => {
    if (!config) return;
    setConfig({
      ...config,
      features: {
        ...config.features,
        [key]: !config.features[key]
      }
    });
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    await db.updateConfig(config);
    setTimeout(() => setSaving(false), 800);
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
        onLogout();
    }
  };

  const confirmDeactivate = () => {
    alert('Account deactivation request sent to Administrator.');
    setIsDeactivateModalOpen(false);
  };

  if (loading || !config || !user) return <div className="p-8 flex justify-center"><div className="animate-spin w-6 h-6 border-2 border-agri-600 rounded-full border-t-transparent"></div></div>;

  // Modern Toggle Component
  const ToggleSwitch = ({ active, onToggle }: { active: boolean; onToggle: () => void }) => (
    <button 
      onClick={onToggle}
      className={`relative w-12 h-7 rounded-full transition-all duration-300 ease-in-out focus:outline-none ${
        active 
          ? 'bg-agri-500 shadow-[0_2px_8px_rgba(34,197,94,0.4)]' 
          : 'bg-slate-200 hover:bg-slate-300 inner-shadow'
      }`}
    >
      <span 
        className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full shadow-md transition-all duration-300 ease-out flex items-center justify-center ${
          active ? 'translate-x-5 rotate-0' : 'translate-x-0 rotate-180'
        }`}
      >
        {active && <Check size={12} className="text-agri-600" strokeWidth={3} />}
      </span>
    </button>
  );

  return (
    <div className="space-y-8 max-w-2xl animate-fade-in pb-24 md:pb-10">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Settings</h1>
        <p className="text-slate-500 mt-1">Manage account and application preferences.</p>
      </div>

      {/* --- LANDING PAGE VISIBILITY SECTION (Top Section) --- */}
      <section className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider ml-1">Landing Page Visibility</h2>
                {user.role !== Role.OWNER && <span className="text-[10px] font-bold bg-amber-50 text-amber-600 px-2 py-0.5 rounded border border-amber-100">ADMIN MODE VIEW</span>}
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                        <Globe size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800">Public Sections</h3>
                        <p className="text-xs text-slate-500">Toggle sections visible to visitors</p>
                    </div>
                </div>

                <div className="divide-y divide-slate-100">
                    <div className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div>
                        <h4 className="font-semibold text-slate-800 text-sm">Investment Section</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Show packages on homepage</p>
                    </div>
                    <ToggleSwitch active={config.features.investment} onToggle={() => handleToggle('investment')} />
                    </div>

                    <div className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div>
                        <h4 className="font-semibold text-slate-800 text-sm">Qurban Section</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Show qurban savings</p>
                    </div>
                    <ToggleSwitch active={config.features.qurban} onToggle={() => handleToggle('qurban')} />
                    </div>

                    <div className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div>
                        <h4 className="font-semibold text-slate-800 text-sm">Marketplace Section</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Show shop preview</p>
                    </div>
                    <ToggleSwitch active={config.features.marketplace} onToggle={() => handleToggle('marketplace')} />
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-2">
                <button 
                    onClick={handleSave}
                    disabled={saving}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 text-sm ${
                        saving 
                        ? 'bg-slate-400 cursor-not-allowed' 
                        : 'bg-slate-900 hover:bg-slate-800'
                    }`}
                >
                    <Save size={18} className={saving ? 'animate-spin' : ''} /> 
                    {saving ? 'Saving...' : 'Save Configuration'}
                </button>
            </div>
      </section>

      {/* --- ACCOUNT SECTION (Bottom Section) --- */}
      <section className="space-y-4">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider ml-1">Account & Security</h2>
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 flex items-center gap-4 border-b border-slate-100">
                  <img src={user.avatarUrl} alt={user.name} className="w-16 h-16 rounded-full object-cover border-2 border-slate-100 shadow-sm" />
                  <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-800">{user.name}</h3>
                      <p className="text-sm text-slate-500">{user.role}</p>
                  </div>
                  <button className="text-agri-600 text-sm font-medium hover:underline">Edit Profile</button>
              </div>

              <div className="divide-y divide-slate-100">
                  <button className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left">
                      <div className="flex items-center gap-3 text-slate-700">
                          <Shield size={20} className="text-slate-400" />
                          <span>Change Password</span>
                      </div>
                      <ChevronRight size={18} className="text-slate-300" />
                  </button>
                  <button className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left">
                      <div className="flex items-center gap-3 text-slate-700">
                          <CreditCard size={20} className="text-slate-400" />
                          <span>Payment Methods</span>
                      </div>
                      <ChevronRight size={18} className="text-slate-300" />
                  </button>
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                  onClick={handleLogout}
                  className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-center gap-2 text-slate-700 font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all active:scale-95"
              >
                  <LogOut size={18} /> Log Out
              </button>
              <button 
                   onClick={() => setIsDeactivateModalOpen(true)}
                   className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-center gap-2 text-slate-500 font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all active:scale-95"
              >
                  <UserX size={18} /> Deactivate Account
              </button>
          </div>
      </section>

      {/* Deactivate Account Confirmation Modal */}
      <Modal 
        isOpen={isDeactivateModalOpen} 
        onClose={() => setIsDeactivateModalOpen(false)} 
        title="Deactivate Account"
      >
        <div className="space-y-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Are you absolutely sure?</h3>
            <p className="text-slate-500 mt-2 text-sm leading-relaxed">
              Deactivating your account will disable your access to the Ali Farm dashboard, live CCTV, and investment tracking. This action cannot be undone immediately.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
             <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">What happens next:</h4>
             <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4">
                <li>Your active investment contracts will remain valid but inaccessible via app.</li>
                <li>Your Qurban savings will be paused.</li>
                <li>A support ticket will be created for final settlement.</li>
             </ul>
          </div>

          <div className="flex gap-3">
             <button 
               onClick={() => setIsDeactivateModalOpen(false)}
               className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all"
             >
               Cancel
             </button>
             <button 
               onClick={confirmDeactivate}
               className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-lg shadow-red-100 transition-all active:scale-95"
             >
               Yes, Deactivate
             </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};