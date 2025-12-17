import React, { useState, useRef, useEffect } from 'react';
import { LayoutDashboard, Sprout, Users, ShoppingBag, Settings, Package, X } from 'lucide-react';

interface MobileNavProps {
  currentTab: string;
  setTab: (tab: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentTab, setTab }) => {
  const [isProductMenuOpen, setIsProductMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProductMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTabChange = (tab: string) => {
    setTab(tab);
    setIsProductMenuOpen(false);
  };

  const productItems = [
    { id: 'sheep', label: 'Sheep', icon: Sprout, color: 'text-green-600 bg-green-50' },
    { id: 'investments', label: 'Invest', icon: Users, color: 'text-blue-600 bg-blue-50' },
    { id: 'marketplace', label: 'Shop', icon: ShoppingBag, color: 'text-orange-600 bg-orange-50' },
  ];

  return (
    <>
      {/* Floating Product Menu */}
      {isProductMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden animate-fade-in" onClick={() => setIsProductMenuOpen(false)}></div>
      )}
      
      <div 
        ref={menuRef}
        className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 md:hidden transition-all duration-300 ${
          isProductMenuOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 flex gap-3 min-w-[280px]">
          {productItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className="flex-1 flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <div className={`p-3 rounded-full ${item.color} shadow-sm`}>
                <item.icon size={20} />
              </div>
              <span className="text-xs font-medium text-slate-700">{item.label}</span>
            </button>
          ))}
        </div>
        {/* Little arrow pointing down */}
        <div className="w-4 h-4 bg-white rotate-45 absolute -bottom-2 left-1/2 -translate-x-1/2 shadow-sm border-r border-b border-slate-100"></div>
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-8 py-3 pb-safe md:hidden z-50 flex justify-between items-center shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        
        {/* HOME */}
        <button
          onClick={() => handleTabChange('dashboard')}
          className={`flex flex-col items-center gap-1 transition-all duration-300 ${
            currentTab === 'dashboard' ? 'text-slate-900' : 'text-slate-400'
          }`}
        >
          <LayoutDashboard size={24} strokeWidth={currentTab === 'dashboard' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Home</span>
        </button>

        {/* PRODUCTS (Middle Action Button) */}
        <button
          onClick={() => setIsProductMenuOpen(!isProductMenuOpen)}
          className={`relative -top-6 bg-slate-900 text-white p-4 rounded-full shadow-lg shadow-slate-900/30 transition-transform duration-200 ${
            isProductMenuOpen ? 'scale-110 bg-agri-600 ring-4 ring-agri-100' : 'active:scale-95'
          }`}
        >
          {isProductMenuOpen ? <X size={24} /> : <Package size={24} />}
        </button>

        {/* SETTINGS */}
        <button
          onClick={() => handleTabChange('settings')}
          className={`flex flex-col items-center gap-1 transition-all duration-300 ${
            currentTab === 'settings' ? 'text-slate-900' : 'text-slate-400'
          }`}
        >
          <Settings size={24} strokeWidth={currentTab === 'settings' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Settings</span>
        </button>

      </div>
    </>
  );
};