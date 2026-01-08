'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { MobileNav } from '@/components/MobileNav';
import { Dashboard } from '@/pages/Dashboard';
import { SheepManager } from '@/pages/SheepManager';
import { Investments } from '@/pages/Investments';
import { Marketplace } from '@/pages/Marketplace';
import { CCTV } from '@/pages/CCTV';
import { Qurban } from '@/pages/Qurban';
import { Settings } from '@/pages/Settings';
import { LandingPage } from '@/components/LandingPage';
import { Role, Language, User } from '@/types';
import { Sprout, Bell, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { isAuthenticated, user, logout, loading } = useAuth();
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [role, setRole] = useState<Role>(user?.role as Role || Role.OWNER);
  const [lang, setLang] = useState<Language>(Language.EN);

  useEffect(() => {
    // IP-based Language Detection
    const detectLanguage = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        if (data.country_code === 'ID') {
          setLang(Language.ID);
        } else {
          setLang(Language.EN);
        }
      } catch (error) {
        console.warn('Language detection failed, defaulting to EN', error);
      }
    };
    detectLanguage();
  }, []);

  useEffect(() => {
    if (user) {
      setRole(user.role as Role);
    }
  }, [user]);

  const handleRoleChange = (newRole: Role) => {
    setRole(newRole);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Show loading state
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 text-agri-600">
        <div className="flex flex-col items-center gap-2">
          <span className="text-xl font-bold">Ali Farm</span>
          <span className="text-sm">Loading Application...</span>
        </div>
      </div>
    );
  }

  // Show landing page if not authenticated
  if (!isAuthenticated) {
    return <LandingPage lang={lang} />;
  }

  if (!user) return null;

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard role={role} lang={lang} onNavigate={setCurrentTab} />;
      case 'sheep':
        return <SheepManager />;
      case 'investments':
        return <Investments user={user} />;
      case 'marketplace':
        return <Marketplace />;
      case 'cctv':
        return <CCTV role={role} />;
      case 'qurban':
        return <Qurban user={user} />;
      case 'settings':
        return <Settings onLogout={handleLogout} />;
      default:
        return <Dashboard role={role} lang={lang} onNavigate={setCurrentTab} />;
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 font-sans pb-24 md:pb-0">
      {/* Desktop Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setTab={setCurrentTab}
        role={role}
        lang={lang}
      />

      {/* Desktop TopBar */}
      <TopBar
        user={user}
        lang={lang}
        setLang={setLang}
        role={role}
        setRole={handleRoleChange}
      />

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white z-30 flex items-center justify-between px-4 border-b border-slate-100 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-agri-600 rounded-lg flex items-center justify-center text-white">
            <Sprout size={18} />
          </div>
          <span className="font-bold text-lg text-slate-800">Ali Farm</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-slate-400">
            <Search size={22} />
          </button>
          <button className="relative text-slate-500">
            <Bell size={22} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>
          <img src={user.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100'} alt="Profile" className="w-8 h-8 rounded-full border border-slate-200 object-cover" />
        </div>
      </div>

      {/* Main Content Area */}
      <main className="md:ml-64 pt-20 md:pt-20 px-4 md:px-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto animate-fade-in">
          {renderContent()}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav currentTab={currentTab} setTab={setCurrentTab} />
    </div>
  );
}
