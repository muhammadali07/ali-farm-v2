import { createFileRoute } from '@tanstack/react-router';
import React, { useState } from 'react';
import { MOCK_PACKAGES } from '../constants';
import { User, InvestmentPackage } from '../types';
import { TrendingUp, CheckCircle, Info, ArrowRight, Loader2 } from 'lucide-react';
import { db } from '../services/db';
import { useAuth } from '../contexts/AuthContext';

export const Route = createFileRoute('/_auth/investments')({
    component: Investments,
})

function Investments() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'PACKAGES' | 'PORTFOLIO'>('PACKAGES');
    const [purchasing, setPurchasing] = useState<string | null>(null);

    if (!user) return <div>Loading...</div>;

    const handlePurchase = async (pkgId: string) => {
        setPurchasing(pkgId);
        // Simulate network delay
        await new Promise(r => setTimeout(r, 1500));
        await db.addInvestment(pkgId, 1);
        setPurchasing(null);
        setActiveTab('PORTFOLIO');
        // Force refresh would happen via parent state or context in real app
        window.location.reload(); // Simple refresh for MVP flow
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Investments</h1>
                    <p className="text-slate-500 text-sm">Grow your wealth with sustainable livestock farming.</p>
                </div>
                <div className="bg-slate-100 p-1 rounded-lg flex w-full sm:w-auto">
                    <button
                        onClick={() => setActiveTab('PACKAGES')}
                        className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'PACKAGES' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Available Packages
                    </button>
                    <button
                        onClick={() => setActiveTab('PORTFOLIO')}
                        className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'PORTFOLIO' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        My Portfolio
                    </button>
                </div>
            </div>

            {activeTab === 'PACKAGES' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {MOCK_PACKAGES.map((pkg) => (
                        <div key={pkg.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col hover:border-agri-200 transition-colors group">
                            <div className="mb-4 flex justify-between items-start">
                                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase">{pkg.type}</span>
                                <span className="text-slate-300 group-hover:text-agri-500 transition-colors">
                                    <TrendingUp size={20} />
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">{pkg.name}</h3>
                            <p className="text-slate-500 text-sm mb-6 flex-1">{pkg.description}</p>

                            <div className="space-y-4 mb-8 bg-slate-50 p-4 rounded-lg">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Est. ROI</span>
                                    <span className="font-bold text-green-600">+{pkg.estimatedRoi}%</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Duration</span>
                                    <span className="font-medium text-slate-900">{pkg.durationMonths} Months</span>
                                </div>
                                <div className="flex justify-between text-sm pt-2 border-t border-slate-200">
                                    <span className="text-slate-500">Unit Price</span>
                                    <span className="font-bold text-slate-800">Rp {pkg.pricePerUnit.toLocaleString()}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => handlePurchase(pkg.id)}
                                disabled={!!purchasing}
                                className="w-full bg-slate-900 text-white py-3 rounded-xl font-medium hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {purchasing === pkg.id ? <Loader2 className="animate-spin" size={20} /> : (
                                    <>Start Investment <ArrowRight size={16} /></>
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-agri-600 to-agri-700 rounded-xl p-6 text-white shadow-lg shadow-agri-200">
                            <p className="text-agri-100 text-sm font-medium">Total Invested</p>
                            <h3 className="text-3xl font-bold mt-2">Rp {user.investments?.reduce((a, b) => a + (MOCK_PACKAGES.find(p => p.id === b.packageId)?.pricePerUnit || 0), 0).toLocaleString()}</h3>
                        </div>
                        <div className="bg-white rounded-xl p-6 border border-slate-100">
                            <p className="text-slate-500 text-sm font-medium">Projected Returns</p>
                            <h3 className="text-2xl font-bold mt-2 text-slate-800">Rp {user.investments?.reduce((a, b) => a + b.currentValue, 0).toLocaleString()}</h3>
                            <span className="text-xs text-green-600 font-medium flex items-center mt-2 bg-green-50 w-fit px-2 py-1 rounded"><TrendingUp size={12} className="mr-1" /> Portfolio Healthy</span>
                        </div>
                    </div>

                    {/* Portfolio List */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-6 border-b border-slate-100">
                            <h3 className="font-bold text-slate-800">Active Contracts</h3>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {(!user.investments || user.investments.length === 0) && (
                                <div className="p-8 text-center text-slate-500">
                                    You have no active investments yet.
                                </div>
                            )}
                            {user.investments?.map(inv => {
                                const pkg = MOCK_PACKAGES.find(p => p.id === inv.packageId);
                                return (
                                    <div key={inv.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 flex-shrink-0">
                                                <CheckCircle size={24} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800">{pkg?.name}</h4>
                                                <p className="text-sm text-slate-500">Purchased on {inv.purchaseDate} • {inv.units} Unit(s)</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-8">
                                            <div>
                                                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Current Value</p>
                                                <p className="font-bold text-slate-800 text-lg">Rp {inv.currentValue.toLocaleString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">ACTIVE</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
