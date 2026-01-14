import { createFileRoute } from '@tanstack/react-router';
import React, { useState } from 'react';
import { MOCK_PRODUCTS } from '../constants';
import { MarketProduct } from '../types';
import { ShoppingCart, Tag } from 'lucide-react';

export const Route = createFileRoute('/_auth/marketplace')({
    component: Marketplace,
})

function Marketplace() {
    const [category, setCategory] = useState<'ALL' | 'Sheep' | 'Feed'>('ALL');

    const filteredProducts = category === 'ALL'
        ? MOCK_PRODUCTS
        : MOCK_PRODUCTS.filter(p => p.category === category);

    const handleBuy = (product: MarketProduct) => {
        const message = `Hello Ali Farm! I am interested in buying: ${product.name} (ID: ${product.id}). Price: Rp ${product.price.toLocaleString()}. Is it available?`;
        const url = `https://wa.me/6281234567890?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Farm Marketplace</h1>
                    <p className="text-slate-500 text-sm">Buy quality livestock, feed, and supplies directly.</p>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    {['ALL', 'Sheep', 'Feed'].map(c => (
                        <button
                            key={c}
                            onClick={() => setCategory(c as any)}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${category === c ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {c}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                    <div key={product.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden group hover:shadow-md transition-shadow">
                        <div className="aspect-square bg-slate-100 relative overflow-hidden">
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-semibold text-slate-700 shadow-sm">
                                {product.category}
                            </div>
                        </div>
                        <div className="p-4">
                            <h3 className="font-semibold text-slate-800 mb-1 truncate">{product.name}</h3>
                            <p className="text-sm text-slate-500 line-clamp-2 mb-4 h-10">{product.description}</p>

                            <div className="flex items-center justify-between mt-auto">
                                <span className="text-agri-700 font-bold">Rp {product.price.toLocaleString()}</span>
                                <span className="text-xs text-slate-400">{product.stock} in stock</span>
                            </div>

                            <button
                                onClick={() => handleBuy(product)}
                                className="w-full mt-4 bg-agri-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-agri-700 flex items-center justify-center gap-2"
                            >
                                <ShoppingCart size={16} /> Buy via WhatsApp
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
