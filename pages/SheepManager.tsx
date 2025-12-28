import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { SheepStatus, Sheep } from '../types';
import { Filter, Plus, ScanLine, Edit, Trash2, Search } from 'lucide-react';
import { Modal } from '../components/Modal';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const SheepManager: React.FC = () => {
  const [sheepList, setSheepList] = useState<Sheep[]>([]);
  const [filter, setFilter] = useState<SheepStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [selectedSheepId, setSelectedSheepId] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<Sheep>>({});

  useEffect(() => {
    loadSheep();
  }, []);

  const loadSheep = async () => {
    const data = await db.sheep.find();
    setSheepList(data);
    if (!selectedSheepId && data.length > 0) setSelectedSheepId(data[0].id);
  };

  const handleOpenAdd = () => {
    setEditMode(false);
    setFormData({
      status: SheepStatus.HEALTHY,
      gender: 'Male',
      weightHistory: [{ date: new Date().toISOString().split('T')[0], weight: 10 }],
      imageUrl: `https://picsum.photos/400/300?random=${Math.floor(Math.random()*100)}`
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sheep: Sheep) => {
    setEditMode(true);
    setFormData(sheep);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this sheep?')) {
      await db.sheep.delete(id);
      await loadSheep();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tagId || !formData.breed) return alert('Tag ID and Breed are required');

    if (editMode && formData.id) {
      await db.sheep.update(formData.id, formData);
    } else {
      await db.sheep.create(formData as Sheep);
    }
    
    setIsModalOpen(false);
    loadSheep();
  };

  const activeSheepData = sheepList.find(s => s.id === selectedSheepId);
  const filteredSheep = sheepList
    .filter(s => filter === 'ALL' || s.status === filter)
    .filter(s => s.tagId.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Sheep Inventory</h1>
          <p className="text-slate-500 text-sm">Managing {sheepList.length} units</p>
        </div>
        <button onClick={handleOpenAdd} className="bg-agri-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2">
          <Plus size={16}/> Add New
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
           <div className="p-4 border-b flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14}/>
                <input 
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm" 
                  placeholder="Search Tag..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
           </div>
           <div className="flex-1 overflow-auto">
             <table className="w-full text-sm text-left">
               <thead className="bg-slate-50 text-slate-500 sticky top-0">
                 <tr>
                    <th className="px-6 py-3">Tag ID</th>
                    <th className="px-6 py-4">Breed</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {filteredSheep.map(s => (
                    <tr key={s.id} onClick={() => setSelectedSheepId(s.id)} className={`cursor-pointer hover:bg-slate-50 ${selectedSheepId === s.id ? 'bg-agri-50/30' : ''}`}>
                      <td className="px-6 py-4 font-bold">{s.tagId}</td>
                      <td className="px-6 py-4">{s.breed}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${s.status === 'Healthy' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={(e) => { e.stopPropagation(); handleOpenEdit(s); }} className="p-1 hover:bg-blue-50 text-blue-600 rounded"><Edit size={14}/></button>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(s.id); }} className="p-1 hover:bg-red-50 text-red-600 rounded"><Trash2 size={14}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
               </tbody>
             </table>
           </div>
        </div>

        <div className="lg:col-span-1">
          {activeSheepData && (
             <div className="bg-white rounded-xl border p-6 space-y-4">
                <img src={activeSheepData.imageUrl} className="w-full h-40 object-cover rounded-xl" />
                <h3 className="text-xl font-bold">{activeSheepData.tagId}</h3>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={activeSheepData.weightHistory}>
                      <Line type="monotone" dataKey="weight" stroke="#22c55e" strokeWidth={2} dot={false} />
                      <Tooltip />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                   <div className="p-2 bg-slate-50 rounded">
                      <p className="text-slate-400">Breed</p>
                      <p className="font-bold">{activeSheepData.breed}</p>
                   </div>
                   <div className="p-2 bg-slate-50 rounded">
                      <p className="text-slate-400">Weight</p>
                      <p className="font-bold">{activeSheepData.weightHistory.slice(-1)[0].weight} kg</p>
                   </div>
                </div>
             </div>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editMode ? 'Edit Sheep' : 'Register Sheep'}>
         <form onSubmit={handleSubmit} className="space-y-4">
            <input required placeholder="Tag ID (Ex: AF-001)" className="w-full p-2 border rounded" value={formData.tagId || ''} onChange={e => setFormData({...formData, tagId: e.target.value})} />
            <select className="w-full p-2 border rounded" value={formData.breed} onChange={e => setFormData({...formData, breed: e.target.value})}>
               <option value="Merino">Merino</option>
               <option value="Dorper">Dorper</option>
               <option value="Garut">Garut</option>
            </select>
            <button type="submit" className="w-full py-3 bg-agri-600 text-white rounded font-bold">Save Sheep</button>
         </form>
      </Modal>
    </div>
  );
};