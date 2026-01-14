import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { TopBar } from '../components/TopBar';
import { MobileNav } from '../components/MobileNav';
import { Role, Language, User } from '../types';
import { db } from '../services/db';
import { Sprout, Bell, Search } from 'lucide-react';
import { AuthProvider } from '../contexts/AuthContext';

export const Route = createFileRoute('/_auth')({
    component: AuthLayout
})

function AuthLayout() {
    const [role, setRole] = useState<Role>(Role.OWNER);
    const [lang, setLang] = useState<Language>(Language.EN);
    const [activeUser, setActiveUser] = useState<User | null>(null);

    useEffect(() => {
        // 1. Initial data load
        const initData = async () => {
            // Logic to check if user is logged in
            // For now, we simulate db.getUser and assume success if here.
            // Ideally this should be in loader, but we keep useEffect for migration.
            const user = await db.getUser();
            setActiveUser(user);
        };
        initData();

        // 2. IP-based Language Detection
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
        // Only separate language detection if not preferred already?
        // detectLanguage(); // Disabled to avoid flashing or limit API calls in dev
    }, []);

    const handleRoleChange = (newRole: Role) => {
        setRole(newRole);
        if (activeUser) {
            setActiveUser({ ...activeUser, role: newRole });
        }
    };

    // If loading user
    if (!activeUser) return (
        <div className="h-screen flex items-center justify-center bg-slate-50 text-agri-600">
            <div className="flex flex-col items-center gap-2">
                <span className="text-xl font-bold">Ali Farm</span>
                <span className="text-sm">Loading Application...</span>
            </div>
        </div>
    );

    return (
        <div className="bg-slate-50 min-h-screen text-slate-900 font-sans pb-24 md:pb-0">
            {/* Desktop Sidebar */}
            <Sidebar
                role={role}
                lang={lang}
            />

            {/* Desktop TopBar */}
            <TopBar
                user={activeUser}
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
                    <img src={activeUser.avatarUrl} alt="Profile" className="w-8 h-8 rounded-full border border-slate-200 object-cover" />
                </div>
            </div>

            {/* Main Content Area */}
            <main className="md:ml-64 pt-20 md:pt-20 px-4 md:px-8 transition-all duration-300">
                <div className="max-w-7xl mx-auto animate-fade-in">
                    <AuthProvider value={{ user: activeUser, role, lang }}>
                    <Outlet />
                </AuthProvider>
                </div>
            </main>

            {/* Mobile Bottom Navigation */}
            <MobileNav />

        </div>
    );
}
