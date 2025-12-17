import React, { useEffect, useState } from 'react';
import { Role, User, Language, SheepStatus, Sheep } from '../types';
import { TRANSLATIONS } from '../constants';
import { db } from '../services/db';
import { TrendingUp, AlertTriangle, Coins, Activity, ArrowRight, Wallet, Stethoscope } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DashboardProps {
  role: Role;
  lang: Language;
  onNavigate: (tab: string) => void;
}

const StatCard = ({ title, value, icon: Icon, color, trend, subtext }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
      {trend && (
        <span className="inline-flex items-center text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
          <TrendingUp className="w-3 h-3 mr-1" />
          {trend}
        </span>
      )}
    </div>
    <div>
      <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{value}</h3>
      <p className="text-slate-500 text-sm font-medium mt-1">{title}</p>
      {subtext && <p className="text-slate-400 text-xs mt-2">{subtext}</p>}
    </div>
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ role, lang, onNavigate }) => {
  const t = TRANSLATIONS[lang];
  const [user, setUser] = useState<User | null>(null);
  const [sheep, setSheep] = useState<Sheep[]>([]);
  
  useEffect(() => {
    const fetchData = async () => {
      const u = await db.getUser();
      const s = await db.getSheep();
      setUser(u);
      setSheep(s);
    };
    fetchData();
  }, [role]); // Re-fetch if role switches (in simulation)

  if (!user) return <div className="p-10 text-center text-slate-500">Loading Dashboard...</div>;

  const healthyCount = sheep.filter(s => s.status === SheepStatus.HEALTHY).length;
  const sickCount = sheep.filter(s => s.status === SheepStatus.SICK).length;
  const soldCount = sheep.filter(s => s.status === SheepStatus.SOLD).length;
  const totalValue = user.investments?.reduce((acc, curr) => acc + curr.currentValue, 0) || 0;

  const pieData = [
    { name: 'Healthy', value: healthyCount },
    { name: 'Sick', value: sickCount },
    { name: 'Sold', value: soldCount },
  ];
  const COLORS = ['#22c55e', '#ef4444', '#f59e0b'];

  const revenueData = [
    { name: 'Jan', value: 1200 },
    { name: 'Feb', value: 1900 },
    { name: 'Mar', value: 1500 },
    { name: 'Apr', value: 2400 },
    { name: 'May', value: 3200 },
    { name: 'Jun', value: totalValue > 0 ? 4500 : 3800 }, // Dynamic simulation
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{t.dashboard}</h1>
          <p className="text-slate-500 mt-1">{t.welcome}, <span className="font-semibold text-slate-700">{user.name}</span> 👋</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
            <button 
              onClick={() => onNavigate('investments')}
              className="w-full md:w-auto px-4 py-3 md:py-2 bg-slate-900 text-white rounded-xl md:rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200 flex justify-center"
            >
              + New Investment
            </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {role === Role.INVESTOR ? (
          <>
             <StatCard 
              title={t.totalAssets}
              value={`Rp ${totalValue.toLocaleString()}`}
              icon={Wallet}
              color="bg-agri-500"
              trend="+12.5%"
              subtext="Updated today"
            />
            <StatCard 
              title={t.activeSheep}
              value={`${user.investments?.reduce((acc, inv) => acc + inv.units, 0) || 0} Heads`}
              icon={Activity}
              color="bg-blue-500"
              subtext="Across 3 cages"
            />
             <StatCard 
              title="Qurban Savings"
              value={`Rp ${user.qurban?.currentAmount.toLocaleString()}`}
              icon={Coins}
              color="bg-purple-500"
              trend="+5%"
              subtext={`Target: Rp ${user.qurban?.targetAmount.toLocaleString()}`}
            />
             <StatCard 
              title="Est. Dividend"
              value="Rp 850.000"
              icon={TrendingUp}
              color="bg-orange-500"
              subtext="Payout in 25 days"
            />
          </>
        ) : (
          <>
            <StatCard 
              title="Total Sheep"
              value={sheep.length}
              icon={Activity}
              color="bg-blue-500"
              trend="+4 this week"
            />
            <StatCard 
              title="Health Alerts"
              value={sickCount}
              icon={Stethoscope}
              color="bg-red-500"
              subtext={sickCount > 0 ? "Requires attention" : "All good"}
            />
            <StatCard 
              title="Monthly Revenue"
              value="Rp 45.2M"
              icon={Coins}
              color="bg-agri-500"
              trend="+8.2%"
            />
            <StatCard 
              title="Sold (YTD)"
              value={soldCount}
              icon={TrendingUp}
              color="bg-orange-400"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Main Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
             <h3 className="font-bold text-slate-800 text-lg">{role === Role.INVESTOR ? 'Asset Value Growth' : 'Farm Revenue'}</h3>
             <select className="bg-slate-50 border-none text-sm text-slate-500 rounded-lg p-2 focus:ring-0">
               <option>Last 6 Months</option>
               <option>This Year</option>
             </select>
          </div>
          <div className="h-72">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} tickFormatter={(value) => `${value/1000}k`} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* Side Chart / Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 text-lg mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={() => onNavigate('marketplace')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg text-agri-600 shadow-sm"><Wallet size={18}/></div>
                  <span className="font-medium text-slate-700">Top Up Qurban</span>
                </div>
                <ArrowRight size={16} className="text-slate-400 group-hover:text-slate-600"/>
              </button>
              
              <button 
                 onClick={() => onNavigate('sheep')}
                 className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg text-blue-600 shadow-sm"><Activity size={18}/></div>
                  <span className="font-medium text-slate-700">Check Livestock</span>
                </div>
                <ArrowRight size={16} className="text-slate-400 group-hover:text-slate-600"/>
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex-1">
            <h3 className="font-bold text-slate-800 text-lg mb-4">Flock Status</h3>
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
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                 </PieChart>
               </ResponsiveContainer>
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold text-slate-800">{sheep.length}</span>
                  <span className="text-xs text-slate-400 uppercase">Total</span>
               </div>
            </div>
            <div className="flex justify-between px-2">
               {pieData.map((entry, index) => (
                 <div key={index} className="text-center">
                    <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{backgroundColor: COLORS[index]}}></div>
                    <p className="text-xs text-slate-500 font-medium">{entry.name}</p>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};