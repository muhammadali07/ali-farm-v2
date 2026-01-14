import { createFileRoute } from '@tanstack/react-router';
import React from 'react';
import { User } from '../types';
import { PiggyBank, Target, Calendar, CreditCard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Route = createFileRoute('/_auth/qurban')({
    component: Qurban,
})

function Qurban() {
    const { user } = useAuth();

    if (!user) return <div>Loading...</div>;
    const saving = user.qurban;

    if (!saving) return <div className="p-10 text-center">No active Qurban savings plan.</div>;

    const progress = (saving.currentAmount / saving.targetAmount) * 100;

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Tabung Qurban 🕋</h1>
                <p className="text-slate-500">Save periodically for your Qurban worship.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Total Saved</p>
                        <h2 className="text-4xl font-bold text-agri-600 mt-1">Rp {saving.currentAmount.toLocaleString()}</h2>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-medium text-slate-500">Target Goal</p>
                        <h3 className="text-xl font-bold text-slate-800">Rp {saving.targetAmount.toLocaleString()}</h3>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="relative h-6 bg-slate-100 rounded-full overflow-hidden mb-2">
                    <div
                        className="absolute top-0 left-0 h-full bg-agri-500 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                <p className="text-right text-sm text-slate-500 font-medium mb-8">{progress.toFixed(1)}% Completed</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-50 p-4 rounded-xl flex items-center gap-4">
                        <div className="p-3 bg-white rounded-lg shadow-sm text-blue-500"><Calendar size={20} /></div>
                        <div>
                            <p className="text-xs text-slate-500">Target Date</p>
                            <p className="font-semibold text-slate-700">{saving.targetDate}</p>
                        </div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl flex items-center gap-4">
                        <div className="p-3 bg-white rounded-lg shadow-sm text-purple-500"><Target size={20} /></div>
                        <div>
                            <p className="text-xs text-slate-500">Remaining</p>
                            <p className="font-semibold text-slate-700">Rp {(saving.targetAmount - saving.currentAmount).toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl flex items-center gap-4">
                        <div className="p-3 bg-white rounded-lg shadow-sm text-orange-500"><PiggyBank size={20} /></div>
                        <div>
                            <p className="text-xs text-slate-500">Monthly Auto-save</p>
                            <p className="font-semibold text-slate-700">Rp 500.000</p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-100 flex justify-center">
                    <button className="flex items-center gap-2 bg-slate-800 text-white px-8 py-3 rounded-xl font-semibold hover:bg-slate-900 transition-transform hover:scale-105">
                        <CreditCard size={18} /> Add Deposit Now
                    </button>
                </div>
            </div>
        </div>
    );
}
