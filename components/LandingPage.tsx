import React, { useState, useEffect } from 'react';
import { Sprout, TrendingUp, ShieldCheck, ArrowRight, CheckCircle, Smartphone, Play, Globe, PiggyBank, Calendar, Heart, Menu, X, Star, Leaf, Users, ShoppingBag, Trash2, MapPin, User, Phone, Truck, CreditCard, ChevronLeft, QrCode, Building2, Banknote, Copy, ChevronRight, HandHeart, Info, Clock, MessageCircle, Send, Calculator, BarChart3, FileText, Loader2 } from 'lucide-react';
import { MOCK_PRODUCTS, MOCK_PACKAGES } from '../constants';
import { db } from '../services/db';
import { AppConfig } from '../types';
import { AIChat } from './AIChat';
import { Language } from '../types';

interface LandingPageProps {
  onLogin: () => void;
  lang: string;
}

interface CartItem {
  id: string | number;
  name: string;
  price: number;
  type: 'Qurban' | 'Product' | 'Investment';
  image?: string;
}

interface CustomerData {
  name: string;
  phone: string;
  address: string;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin, lang }) => {
  const isId = lang === 'ID';
  const ADMIN_WA = "6281553335534";

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [customer, setCustomer] = useState<CustomerData>({ name: '', phone: '', address: '' });
  const [orderId, setOrderId] = useState('');
  const [qurbanServiceType, setQurbanServiceType] = useState<'SHIPPED' | 'CUSTODY'>('SHIPPED');
  const [deliveryDate, setDeliveryDate] = useState('');
  
  const COURIERS = [
    { id: 'jne', name: 'JNE Reguler', price: 12000, est: '2-3 Hari' },
    { id: 'jnt', name: 'J&T Express', price: 15000, est: '1-3 Hari' },
    { id: 'sicepat', name: 'SiCepat HALU', price: 10000, est: '2-4 Hari' },
  ];
  
  const TAXI_FARM = { id: 'taxifarm', name: 'TaxiFarm', price: 50000, originalPrice: 100000, est: 'Sesuai Jadwal' };
  const [selectedCourier, setSelectedCourier] = useState(COURIERS[0]);

  const PAYMENT_METHODS = [
    { id: 'qris', name: 'QRIS', description: isId ? 'Scan QR untuk pembayaran instan' : 'Scan QR for instant payment', icon: QrCode },
    { id: 'transfer', name: 'Bank Transfer', description: 'BCA, Mandiri', icon: Building2 },
    { id: 'cod', name: 'COD', description: isId ? 'Bayar ditempat saat barang sampai' : 'Pay on delivery', icon: Banknote },
  ];
  const [selectedPayment, setSelectedPayment] = useState(PAYMENT_METHODS[0].id);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchConfig = async () => {
        const data = await db.getConfig();
        setConfig(data);
    };
    fetchConfig();
  }, []);

  if (!config) return (
     <div className="h-screen w-full flex items-center justify-center bg-slate-900">
        <Loader2 className="text-agri-500 animate-spin" size={32} />
     </div>
  );

  const scrollToSection = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      window.scrollTo({ top: element.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    ...(config.features.investment ? [{ href: "#investments", label: isId ? 'Investasi' : 'Investments' }] : []),
    ...(config.features.qurban ? [{ href: "#qurban", label: isId ? 'Tabung Qurban' : 'Qurban Savings' }] : []),
    ...(config.features.marketplace ? [{ href: "#marketplace", label: isId ? 'Pasar' : 'Marketplace' }] : []),
  ];

  const addToCart = (item: CartItem) => {
    setCart([...cart, item]);
    setIsCartOpen(true);
  };

  const removeFromCart = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.price, 0);
  const isQurbanOrder = cart.some(item => item.type === 'Qurban');
  const isInvestmentOrder = cart.some(item => item.type === 'Investment');
  const qurbanFee = (isQurbanOrder && qurbanServiceType === 'CUSTODY') ? 50000 : 0;
  const shippingCost = isQurbanOrder ? (qurbanServiceType === 'SHIPPED' ? TAXI_FARM.price : 0) : (isInvestmentOrder ? 0 : selectedCourier.price);
  const finalTotal = cartTotal + shippingCost + qurbanFee;

  const handleNextStep = () => {
    if (checkoutStep === 1) {
      if (!customer.name || !customer.phone || !customer.address) return alert('Lengkapi data!');
      setCheckoutStep(2);
    } else if (checkoutStep === 2) {
      setOrderId(`AF-${Math.floor(10000 + Math.random() * 90000)}`);
      setCheckoutStep(3);
    }
  };

  const handleFinalizeWhatsApp = () => {
    const message = `Halo Admin Ali Farm, ID Pesanan: ${orderId}. Total: Rp ${finalTotal.toLocaleString()}.`;
    window.open(`https://wa.me/${ADMIN_WA}?text=${encodeURIComponent(message)}`, '_blank');
    setIsCheckoutOpen(false);
    setCart([]);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans overflow-x-hidden">
      <nav className={`fixed w-full z-[100] transition-all duration-300 ${scrolled ? 'bg-white py-3 shadow-md' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <div className="w-10 h-10 bg-agri-600 rounded-xl flex items-center justify-center text-white">
              <Sprout className="w-6 h-6" />
            </div>
            <span className={`text-xl font-bold ${scrolled ? 'text-slate-900' : 'text-white'}`}>Ali Farm</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} onClick={(e) => scrollToSection(e, link.href)} className={`text-sm font-medium ${scrolled ? 'text-slate-600' : 'text-white/90'}`}>
                {link.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsCartOpen(true)} className={`relative p-2 ${scrolled ? 'text-slate-700' : 'text-white'}`}>
              <ShoppingBag size={22} />
              {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{cart.length}</span>}
            </button>
            <button onClick={onLogin} className={`px-6 py-2 rounded-full text-sm font-bold ${scrolled ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
              {isId ? 'Masuk' : 'Login'}
            </button>
          </div>
        </div>
      </nav>

      <AIChat lang={lang as any} />

      {/* Cart Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[200] flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Keranjang Belanja</h2>
              <button onClick={() => setIsCartOpen(false)}><X /></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4">
              {cart.map((item, i) => (
                <div key={i} className="p-4 border border-slate-100 rounded-xl flex justify-between items-center">
                  <div>
                    <p className="font-bold">{item.name}</p>
                    <p className="text-agri-600 text-sm font-bold">Rp {item.price.toLocaleString()}</p>
                  </div>
                  <button onClick={() => removeFromCart(i)} className="text-red-400"><Trash2 size={18} /></button>
                </div>
              ))}
            </div>
            {cart.length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <div className="flex justify-between text-xl font-bold mb-4"><span>Total</span><span>Rp {cartTotal.toLocaleString()}</span></div>
                <button onClick={() => {setIsCartOpen(false); setIsCheckoutOpen(true);}} className="w-full py-4 bg-agri-600 text-white rounded-xl font-bold shadow-lg">Checkout Now</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCheckoutOpen(false)}></div>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative p-8">
            {checkoutStep === 3 ? (
              <div className="text-center py-10">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle size={40} /></div>
                <h2 className="text-2xl font-bold mb-2">Pesanan Berhasil!</h2>
                <div className="bg-slate-50 p-4 rounded-xl my-6">
                  <p className="text-xs text-slate-400 uppercase font-bold">Order ID</p>
                  <p className="text-2xl font-mono font-bold">{orderId}</p>
                </div>
                <button onClick={handleFinalizeWhatsApp} className="w-full py-3 bg-green-600 text-white rounded-xl font-bold flex items-center justify-center gap-2">
                  <Smartphone /> Konfirmasi via WhatsApp
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">{checkoutStep === 1 ? 'Data Pengiriman' : 'Metode Pembayaran'}</h2>
                {checkoutStep === 1 ? (
                  <div className="space-y-4">
                    <input className="w-full p-3 border rounded-xl" placeholder="Nama Lengkap" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} />
                    <input className="w-full p-3 border rounded-xl" placeholder="WhatsApp" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} />
                    <textarea className="w-full p-3 border rounded-xl" placeholder="Alamat" value={customer.address} onChange={e => setCustomer({...customer, address: e.target.value})} />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {PAYMENT_METHODS.map(m => (
                      <div key={m.id} onClick={() => setSelectedPayment(m.id)} className={`p-4 border-2 rounded-xl cursor-pointer flex items-center gap-4 ${selectedPayment === m.id ? 'border-agri-600 bg-agri-50' : 'border-slate-100'}`}>
                        <m.icon className={selectedPayment === m.id ? 'text-agri-600' : 'text-slate-400'} />
                        <span className="font-bold">{m.name}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-4">
                  <button onClick={() => setIsCheckoutOpen(false)} className="flex-1 py-3 border rounded-xl font-bold">Batal</button>
                  <button onClick={handleNextStep} className="flex-1 py-3 bg-agri-600 text-white rounded-xl font-bold">Lanjut</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="h-screen relative flex items-center justify-center">
        <div className="absolute inset-0 bg-slate-900">
          <img src="https://images.unsplash.com/photo-1511117833895-4b473c0b85d6?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover opacity-40" />
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">Investasi Ternak Digital</h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10">Masa depan peternakan transparan dengan bagi hasil syariah dan pantauan CCTV 24/7.</p>
          <button onClick={(e) => scrollToSection(e, '#investments')} className="px-10 py-4 bg-agri-600 rounded-full font-bold text-lg shadow-xl hover:scale-105 transition-all">Mulai Sekarang</button>
        </div>
      </section>

      {/* Investments */}
      {config.features.investment && (
        <section id="investments" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-16">Paket Investasi</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {MOCK_PACKAGES.map(pkg => (
                <div key={pkg.id} className="p-8 bg-slate-50 rounded-3xl border border-slate-100 hover:shadow-xl transition-all">
                  <h3 className="text-xl font-bold mb-2">{pkg.name}</h3>
                  <p className="text-3xl font-bold text-slate-900 mb-6">Rp {pkg.pricePerUnit.toLocaleString()}</p>
                  <button onClick={() => addToCart({id: pkg.id, name: pkg.name, price: pkg.pricePerUnit, type: 'Investment'})} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold">Investasi</button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <footer className="py-12 bg-slate-50 border-t text-center text-slate-400">
        <p>© 2024 Ali Farm. Smart Sheep Farming & Investment Platform.</p>
      </footer>
    </div>
  );
};