
import React, { useState, useEffect } from 'react';
import { Sprout, TrendingUp, ShieldCheck, ArrowRight, CheckCircle, Smartphone, Globe, PiggyBank, Calendar, Heart, X, ShoppingBag, Trash2, MapPin, Phone, Building2, Banknote, QrCode, ChevronRight, MessageCircle, Loader2, Mail, Shield, Eye, BarChart, HandHeart, Plus, Truck, Gift, Clock, Copy } from 'lucide-react';
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

interface QurbanLogistics {
  mode: 'delivery' | 'disburse';
  date: string;
  deliveryAddress: string;
  notes: string;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin, lang }) => {
  const isId = lang === 'ID';
  const ADMIN_WA = "6281553335534";

  const [scrolled, setScrolled] = useState(false);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [customer, setCustomer] = useState<CustomerData>({ name: '', phone: '', address: '' });
  const [qurbanLogistics, setQurbanLogistics] = useState<QurbanLogistics>({ mode: 'disburse', date: '', deliveryAddress: '', notes: '' });
  const [orderId, setOrderId] = useState('');
  const [benefitIndex, setBenefitIndex] = useState(0);
  
  const PAYMENT_METHODS = [
    { id: 'transfer', name: 'Bank Transfer', description: 'BCA, Mandiri', icon: Building2 },
    { id: 'cod', name: 'COD (Bayar di Tempat)', description: isId ? 'Bayar saat barang sampai' : 'Pay on delivery', icon: Banknote },
  ];

  const BANK_ACCOUNTS = [
    { bank: 'BCA', number: '1234567890', owner: 'Ali Farm Indonesia' },
    { bank: 'Mandiri', number: '0987654321', owner: 'Ali Farm Indonesia' },
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

  // Auto-cycle benefits stack
  useEffect(() => {
    const interval = setInterval(() => {
      setBenefitIndex((prev) => (prev + 1) % 4);
    }, 4000);
    return () => clearInterval(interval);
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
  const hasQurban = cart.some(item => item.type === 'Qurban');

  const handleNextStep = () => {
    if (checkoutStep === 1) {
      if (!customer.name || !customer.phone || !customer.address) return alert('Lengkapi data diri!');
      if (hasQurban) {
        setQurbanLogistics(prev => ({ ...prev, deliveryAddress: customer.address }));
        setCheckoutStep(2); 
      }
      else setCheckoutStep(3);
    } else if (checkoutStep === 2) {
      if (qurbanLogistics.mode === 'delivery' && (!qurbanLogistics.date || !qurbanLogistics.deliveryAddress)) {
        return alert('Lengkapi tanggal dan alamat pengiriman qurban!');
      }
      setCheckoutStep(3);
    } else if (checkoutStep === 3) {
      setOrderId(`AF-${Math.floor(10000 + Math.random() * 90000)}`);
      setCheckoutStep(4);
    }
  };

  const handleFinalizeWhatsApp = () => {
    let qurbanDetail = "";
    if (hasQurban) {
      qurbanDetail = `\nLogistik Qurban: ${qurbanLogistics.mode === 'delivery' ? `Kirim ke: ${qurbanLogistics.deliveryAddress} pada ${qurbanLogistics.date}` : 'Titip salurkan oleh Ali Farm'}`;
    }
    
    const message = `Halo Admin Ali Farm, ID Pesanan: ${orderId}. 
Total: Rp ${cartTotal.toLocaleString()}. 
Pelanggan: ${customer.name}. 
No. HP: ${customer.phone}. ${qurbanDetail}
Metode: ${PAYMENT_METHODS.find(m => m.id === selectedPayment)?.name}`;

    window.open(`https://wa.me/${ADMIN_WA}?text=${encodeURIComponent(message)}`, '_blank');
    setIsCheckoutOpen(false);
    setCart([]);
    setCheckoutStep(1);
    setQurbanLogistics({ mode: 'disburse', date: '', deliveryAddress: '', notes: '' });
  };

  const investmentBenefits = [
    { icon: Shield, title: 'Keamanan Dana', desc: 'Sistem bagi hasil transparan dengan asuransi kematian ternak.', color: 'text-blue-600 bg-blue-50' },
    { icon: Eye, title: 'Pantauan Langsung', desc: 'Pantau pertumbuhan ternak Anda melalui live CCTV 24/7.', color: 'text-green-600 bg-green-50' },
    { icon: HandHeart, title: 'Syariah Compliance', desc: 'Akad kerjasama dijalankan sesuai prinsip syariah yang adil.', color: 'text-purple-600 bg-purple-50' },
    { icon: BarChart, title: 'Profit Optimal', desc: 'Manajemen profesional memastikan pertumbuhan yang sehat.', color: 'text-orange-600 bg-orange-50' },
  ];

  const qurbanPackages = [
    { id: 'Q-STD', name: 'Domba Standar (20-25kg)', price: 2500000 },
    { id: 'Q-MED', name: 'Domba Medium (26-30kg)', price: 3200000 },
    { id: 'Q-PRM', name: 'Domba Premium (31-40kg)', price: 4500000 },
  ];

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      {/* Navigation */}
      <nav className={`fixed w-full z-[100] transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md py-3 shadow-sm' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <div className="w-10 h-10 bg-agri-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-agri-100">
              <Sprout className="w-6 h-6" />
            </div>
            <span className={`text-xl font-bold ${scrolled ? 'text-slate-900' : 'text-white'}`}>Ali Farm</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a 
                key={link.href} 
                href={link.href} 
                onClick={(e) => scrollToSection(e, link.href)} 
                className={`text-sm font-semibold transition-colors ${scrolled ? 'text-slate-600 hover:text-agri-600' : 'text-white/90 hover:text-white'}`}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => setIsCartOpen(true)} className={`relative p-2 transition-transform hover:scale-110 ${scrolled ? 'text-slate-700' : 'text-white'}`}>
              <ShoppingBag size={22} />
              {cart.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold border-2 border-white">
                  {cart.length}
                </span>
              )}
            </button>
            <button onClick={onLogin} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all hover:shadow-lg ${scrolled ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-white text-slate-900 hover:bg-slate-50'}`}>
              {isId ? 'Masuk' : 'Login'}
            </button>
          </div>
        </div>
      </nav>

      <AIChat lang={Language.ID} />

      {/* Cart Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[200] flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
          <div className="relative w-full max-md:max-w-full max-w-md bg-white h-full shadow-2xl p-8 flex flex-col animate-slide-in-right">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900">Keranjang</h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X /></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4">
                  <ShoppingBag size={48} strokeWidth={1} />
                  <p className="font-medium">Keranjang Anda kosong</p>
                </div>
              ) : (
                cart.map((item, i) => (
                  <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center group">
                    <div>
                      <p className="font-bold text-slate-800">{item.name}</p>
                      <p className="text-agri-600 text-sm font-bold">Rp {item.price.toLocaleString()}</p>
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{item.type}</span>
                    </div>
                    <button onClick={() => removeFromCart(i)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                  </div>
                ))
              )}
            </div>
            {cart.length > 0 && (
              <div className="mt-8 pt-8 border-t border-slate-100">
                <div className="flex justify-between text-xl font-bold mb-6 text-slate-900">
                  <span>Total</span>
                  <span className="text-agri-600">Rp {cartTotal.toLocaleString()}</span>
                </div>
                <button 
                  onClick={() => {setIsCartOpen(false); setIsCheckoutOpen(true);}} 
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95"
                >
                  Checkout Pesanan
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsCheckoutOpen(false)}></div>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl relative p-8 md:p-10 overflow-hidden overflow-y-auto max-h-[90vh]">
            {checkoutStep === 4 ? (
              <div className="text-center py-6 animate-fade-in">
                <div className="w-20 h-20 bg-agri-100 text-agri-600 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle size={40} /></div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Pesanan Berhasil!</h2>
                <p className="text-slate-500 mb-8">ID Pesanan Anda telah dibuat. Silakan konfirmasi untuk proses pengiriman.</p>
                <div className="bg-slate-50 p-6 rounded-2xl mb-8 border border-slate-100">
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Order ID Reference</p>
                  <p className="text-3xl font-mono font-bold text-slate-800">{orderId}</p>
                </div>
                <button onClick={handleFinalizeWhatsApp} className="w-full py-4 bg-[#25D366] text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-green-100 hover:opacity-90 transition-all">
                  <MessageCircle size={24} /> Konfirmasi ke WhatsApp
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  {[1, 2, 3].map(step => (
                    <React.Fragment key={step}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${checkoutStep >= step ? 'bg-agri-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                        {step === 2 && !hasQurban ? 'Skip' : step}
                      </div>
                      {step < 3 && <div className={`flex-1 h-0.5 ${checkoutStep > step ? 'bg-agri-600' : 'bg-slate-100'}`}></div>}
                    </React.Fragment>
                  ))}
                </div>
                
                <h2 className="text-2xl font-bold text-slate-900">
                  {checkoutStep === 1 ? 'Data Diri' : checkoutStep === 2 ? 'Logistik Qurban' : 'Metode Pembayaran'}
                </h2>
                
                {checkoutStep === 1 && (
                  <div className="space-y-4">
                    <input className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-agri-500 transition-all" placeholder="Nama Lengkap" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} />
                    <input className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-agri-500 transition-all" placeholder="Nomor WhatsApp" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} />
                    <textarea className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-agri-500 transition-all h-24" placeholder="Alamat Profil" value={customer.address} onChange={e => setCustomer({...customer, address: e.target.value})} />
                  </div>
                )}

                {checkoutStep === 2 && (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-500 mb-4">Pilih bagaimana hewan qurban Anda akan dikelola:</p>
                    <div className="grid grid-cols-1 gap-3">
                      <button 
                        onClick={() => setQurbanLogistics({...qurbanLogistics, mode: 'disburse'})}
                        className={`p-5 rounded-2xl border-2 text-left transition-all flex items-start gap-4 ${qurbanLogistics.mode === 'disburse' ? 'border-agri-600 bg-agri-50' : 'border-slate-100'}`}
                      >
                        <div className={`p-2 rounded-lg ${qurbanLogistics.mode === 'disburse' ? 'bg-agri-600 text-white' : 'bg-slate-100 text-slate-400'}`}><Gift size={20} /></div>
                        <div>
                          <p className="font-bold text-slate-900">Disalurkan Ali Farm (Titip Qurban)</p>
                          <p className="text-xs text-slate-500 mt-1">Hewan akan dipelihara, disembelih, dan disalurkan ke yang membutuhkan oleh Ali Farm.</p>
                        </div>
                      </button>

                      <button 
                        onClick={() => setQurbanLogistics({...qurbanLogistics, mode: 'delivery'})}
                        className={`p-5 rounded-2xl border-2 text-left transition-all flex items-start gap-4 ${qurbanLogistics.mode === 'delivery' ? 'border-agri-600 bg-agri-50' : 'border-slate-100'}`}
                      >
                        <div className={`p-2 rounded-lg ${qurbanLogistics.mode === 'delivery' ? 'bg-agri-600 text-white' : 'bg-slate-100 text-slate-400'}`}><Truck size={20} /></div>
                        <div>
                          <p className="font-bold text-slate-900">Kirim ke Alamat Saya</p>
                          <p className="text-xs text-slate-500 mt-1">Hewan qurban dikirim hidup ke alamat Anda sesuai jadwal yang ditentukan.</p>
                        </div>
                      </button>
                    </div>

                    {qurbanLogistics.mode === 'delivery' && (
                      <div className="pt-4 space-y-4 animate-fade-in">
                        <div className="space-y-2">
                           <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Alamat Pengiriman Qurban</label>
                           <textarea 
                             className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-agri-500 min-h-[80px]" 
                             placeholder="Masukkan alamat pengiriman qurban jika berbeda dengan alamat profil"
                             value={qurbanLogistics.deliveryAddress}
                             onChange={e => setQurbanLogistics({...qurbanLogistics, deliveryAddress: e.target.value})}
                           />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Tanggal Pengiriman</label>
                          <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                              type="date" 
                              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-agri-500"
                              value={qurbanLogistics.date}
                              onChange={e => setQurbanLogistics({...qurbanLogistics, date: e.target.value})}
                            />
                          </div>
                          <p className="text-[10px] text-agri-600 font-medium">* Pengiriman tersedia H-3 sampai H-1 Idul Adha.</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {checkoutStep === 3 && (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      {PAYMENT_METHODS.map(m => (
                        <div key={m.id} onClick={() => setSelectedPayment(m.id)} className={`p-4 border-2 rounded-2xl cursor-pointer flex items-center gap-4 transition-all ${selectedPayment === m.id ? 'border-agri-600 bg-agri-50' : 'border-slate-100 hover:border-slate-200'}`}>
                          <div className={`p-2 rounded-lg ${selectedPayment === m.id ? 'bg-agri-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                            <m.icon size={20} />
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-slate-800">{m.name}</p>
                            <p className="text-xs text-slate-500">{m.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {selectedPayment === 'transfer' && (
                      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4 animate-fade-in">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest text-center">Rekening Pembayaran</h4>
                        <div className="space-y-3">
                          {BANK_ACCOUNTS.map((acc, i) => (
                            <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 flex justify-between items-center group hover:border-agri-200 transition-colors">
                              <div>
                                <p className="text-[10px] font-black text-agri-600 uppercase tracking-widest mb-1">{acc.bank}</p>
                                <p className="text-lg font-mono font-bold text-slate-800">{acc.number}</p>
                                <p className="text-xs text-slate-500 mt-1">a/n {acc.owner}</p>
                              </div>
                              <button onClick={() => { navigator.clipboard.writeText(acc.number); alert('Nomor rekening disalin!'); }} className="p-3 text-slate-300 hover:text-agri-600 hover:bg-agri-50 rounded-xl transition-all">
                                <Copy size={18} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setCheckoutStep(prev => prev - (prev === 3 && !hasQurban ? 2 : 1))} 
                    disabled={checkoutStep === 1} 
                    className="flex-1 py-4 border border-slate-200 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all disabled:opacity-0"
                  >
                    Kembali
                  </button>
                  <button onClick={handleNextStep} className="flex-1 py-4 bg-agri-600 text-white rounded-2xl font-bold shadow-lg shadow-agri-100 hover:bg-agri-700 transition-all">
                    {checkoutStep === 3 ? 'Selesaikan Pesanan' : 'Lanjut'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="min-h-screen relative flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-slate-950">
          <img 
            src="https://images.unsplash.com/photo-1484557985045-6f550bb38a96?auto=format&fit=crop&q=80&w=2000" 
            className="w-full h-full object-cover opacity-40 scale-105 animate-pulse-slow" 
            alt="Sheep Farm"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-transparent to-white"></div>
        </div>
        
        <div className="relative z-10 text-center text-white px-6 max-w-4xl">
          <div className="inline-flex items-center gap-2 bg-agri-600/20 backdrop-blur-md border border-agri-500/30 text-agri-400 px-4 py-2 rounded-full text-xs font-black uppercase tracking-[0.3em] mb-8 animate-fade-in">
            Digital Farming Revolution
          </div>
          <h1 className="text-5xl md:text-8xl font-black mb-8 leading-tight tracking-tight animate-fade-in-up">
            Masa Depan <br/> <span className="text-agri-500">Peternakan</span> Domba
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Investasi transparan, tabungan qurban syariah, dan pantauan langsung dari kandang modern Ali Farm.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <button onClick={(e) => scrollToSection(e, '#investments')} className="w-full sm:w-auto px-10 py-5 bg-agri-600 rounded-2xl font-bold text-lg shadow-2xl shadow-agri-900/40 hover:scale-105 hover:bg-agri-500 transition-all flex items-center justify-center gap-2">
              Mulai Investasi <ArrowRight size={20} />
            </button>
            <button onClick={(e) => scrollToSection(e, '#marketplace')} className="w-full sm:w-auto px-10 py-5 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all">
              Jelajahi Pasar
            </button>
          </div>
        </div>
      </section>

      {/* Investments Section */}
      {config.features.investment && (
        <section id="investments" className="py-32 bg-white relative">
          <div className="max-w-7xl mx-auto px-6 relative">
            <div className="text-center mb-16">
              <span className="text-agri-600 font-black uppercase tracking-widest text-xs">Profit Sharing</span>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mt-4 tracking-tight">Paket Investasi Ternak</h2>
              <p className="text-slate-500 mt-4 max-w-2xl mx-auto">Tumbuhkan aset Anda melalui ekosistem peternakan Ali Farm yang amanah dan profesional.</p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8 items-center justify-center max-w-4xl mx-auto">
              {/* Left Column: Investment Package Card */}
              <div className="flex flex-col items-center lg:items-end w-full">
                {MOCK_PACKAGES.slice(0, 1).map(pkg => (
                  <div key={pkg.id} className="group p-8 bg-white rounded-[2.5rem] border border-slate-100 hover:border-agri-200 shadow-2xl shadow-slate-200/20 hover:shadow-agri-100/30 transition-all duration-500 relative overflow-hidden w-full max-w-sm">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-agri-50 rounded-bl-[3.5rem] group-hover:bg-agri-100 transition-colors flex items-center justify-center pl-3 pb-3">
                      <TrendingUp className="text-agri-600" size={24} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{pkg.name}</h3>
                    <div className="flex items-baseline gap-2 mb-6">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mulai dari</span>
                      <p className="text-2xl font-black text-slate-900 tracking-tight">Rp {pkg.pricePerUnit.toLocaleString()}</p>
                    </div>
                    
                    <div className="space-y-3 mb-8">
                      <div className="flex items-center gap-3 text-slate-600 text-sm font-medium">
                        <div className="w-5 h-5 rounded-full bg-agri-50 flex items-center justify-center text-agri-600"><CheckCircle size={12} /></div>
                        ROI Estimasi {pkg.estimatedRoi}%
                      </div>
                      <div className="flex items-center gap-3 text-slate-600 text-sm font-medium">
                        <div className="w-5 h-5 rounded-full bg-agri-50 flex items-center justify-center text-agri-600"><CheckCircle size={12} /></div>
                        Durasi {pkg.durationMonths} Bulan
                      </div>
                      <div className="flex items-center gap-3 text-slate-600 text-sm font-medium">
                        <div className="w-5 h-5 rounded-full bg-agri-50 flex items-center justify-center text-agri-600"><CheckCircle size={12} /></div>
                        Pantauan CCTV 24/7
                      </div>
                    </div>
                    
                    <button onClick={() => addToCart({id: pkg.id, name: pkg.name, price: pkg.pricePerUnit, type: 'Investment'})} className="w-full py-4 bg-slate-900 text-white rounded-[1.5rem] font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-95 text-sm">
                      Ambil Paket Investasi
                    </button>
                  </div>
                ))}
              </div>

              {/* Right Column: Refined Stacked Animated Benefits */}
              <div className="relative w-full max-w-sm h-[260px] lg:h-[320px]">
                <div className="mb-4 lg:block hidden">
                  <h4 className="text-[10px] font-black text-agri-600 uppercase tracking-[0.2em] mb-1">Benefit Eksklusif</h4>
                  <p className="text-slate-400 text-[10px] font-bold">Mengapa memilih Ali Farm?</p>
                </div>
                
                <div className="relative w-full h-full">
                  {investmentBenefits.map((benefit, i) => {
                    const diff = (i - benefitIndex + 4) % 4;
                    const isActive = diff === 0;
                    const isNext = diff === 1;
                    const isNext2 = diff === 2;
                    
                    let styles = "opacity-0 scale-90 translate-y-10 z-0";
                    if (isActive) styles = "opacity-100 scale-100 translate-y-0 z-30 shadow-xl shadow-slate-100";
                    else if (isNext) styles = "opacity-70 scale-95 translate-y-4 z-20 shadow-md shadow-slate-100";
                    else if (isNext2) styles = "opacity-30 scale-90 translate-y-8 z-10";

                    return (
                      <div 
                        key={i} 
                        className={`absolute inset-0 transition-all duration-700 ease-in-out cursor-pointer ${styles}`}
                        onClick={() => setBenefitIndex(i)}
                      >
                        <div className="bg-white rounded-[2rem] border border-slate-100 p-6 h-full flex flex-col justify-center border-l-4 border-l-agri-500 shadow-sm shadow-slate-100">
                          <div className={`w-12 h-12 rounded-xl ${benefit.color} flex items-center justify-center mb-4 shadow-inner`}>
                            <benefit.icon size={24} />
                          </div>
                          <h4 className="text-lg font-black text-slate-900 mb-2 leading-tight">{benefit.title}</h4>
                          <p className="text-slate-500 text-xs font-medium leading-relaxed mb-4">{benefit.desc}</p>
                          
                          <div className="flex items-center gap-1.5 text-agri-600 font-black text-[10px] uppercase tracking-widest">
                             Selengkapnya <ArrowRight size={12} strokeWidth={3} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Refined Dots Indicator */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {investmentBenefits.map((_, i) => (
                    <button 
                      key={i} 
                      onClick={() => setBenefitIndex(i)}
                      className={`h-1 rounded-full transition-all duration-300 ${benefitIndex === i ? 'w-6 bg-agri-600' : 'w-1.5 bg-slate-200'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Qurban Section */}
      {config.features.qurban && (
        <section id="qurban" className="py-32 bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-agri-950/40 to-transparent"></div>
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-agri-600/30 text-agri-400 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6">
                  Ibadah Nyaman & Berkah
                </div>
                <h2 className="text-5xl font-bold mb-8 leading-tight">Tabung Qurban <br/> Syariah Ali Farm</h2>
                <p className="text-slate-400 text-lg mb-10 leading-relaxed">
                  Cicil qurban Anda setiap bulan mulai dari Rp 100.000. Dapatkan domba kualitas terbaik yang dirawat secara profesional hingga hari raya Idul Adha tiba.
                </p>
                
                <div className="grid sm:grid-cols-2 gap-6 mb-12">
                  <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                    <PiggyBank className="text-agri-400 mb-4" size={32} />
                    <h4 className="font-bold mb-2">Tabungan Fleksibel</h4>
                    <p className="text-sm text-slate-500">Setor kapan saja dengan nominal berapapun.</p>
                  </div>
                  <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                    <Heart className="text-agri-400 mb-4" size={32} />
                    <h4 className="font-bold mb-2">Amanah & Syariah</h4>
                    <p className="text-sm text-slate-500">Laporan perawatan rutin dan dokumentasi penyembelihan.</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => addToCart({id: 'QURBAN-PLAN', name: 'Setoran Awal Tabung Qurban', price: 100000, type: 'Qurban'})}
                  className="px-10 py-5 bg-white text-slate-900 rounded-2xl font-bold text-lg hover:bg-agri-50 transition-all flex items-center justify-center gap-3"
                >
                  Mulai Menabung Sekarang <ChevronRight size={20} />
                </button>
              </div>
              
              <div className="relative">
                <div className="absolute -inset-4 bg-agri-600/20 blur-3xl rounded-full"></div>
                <div className="relative bg-[#1e293b]/80 backdrop-blur-md border border-white/10 p-8 rounded-[3rem] shadow-2xl">
                  <h3 className="text-2xl font-bold mb-8 flex items-center gap-3 text-white">
                    <Calendar className="text-agri-400" /> Estimasi Paket Qurban 2025
                  </h3>
                  <div className="space-y-4">
                    {qurbanPackages.map((item, i) => (
                      <div 
                        key={item.id} 
                        className="group flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-agri-500/30 transition-all cursor-pointer"
                        onClick={() => addToCart({ id: item.id, name: item.name, price: item.price, type: 'Qurban' })}
                      >
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-200 group-hover:text-white transition-colors">{item.name}</span>
                          <span className="text-[10px] text-agri-400 font-black uppercase tracking-widest mt-1">Pilih Paket ini</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-black text-agri-400 text-lg">Rp {item.price.toLocaleString()}</span>
                          <div className="w-8 h-8 rounded-full bg-agri-600/20 flex items-center justify-center text-agri-400 group-hover:bg-agri-600 group-hover:text-white transition-all">
                            <Plus size={16} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 p-4 bg-agri-600/20 rounded-2xl border border-agri-600/30 text-center">
                    <p className="text-xs font-bold text-agri-300 uppercase tracking-[0.2em]">Harga mengikat untuk penabung aktif!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Marketplace Section */}
      {config.features.marketplace && (
        <section id="marketplace" className="py-32 bg-slate-50 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 relative">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <div>
                <span className="text-agri-600 font-black uppercase tracking-widest text-xs">Farm Shop</span>
                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mt-4">Pasar Ternak & Pakan</h2>
                <p className="text-slate-500 mt-4 max-w-xl">Beli kebutuhan peternakan, pakan berkualitas, hingga hewan ternak langsung dari sumbernya.</p>
              </div>
              <div className="flex gap-2">
                <button className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all">Lihat Semua Produk</button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {MOCK_PRODUCTS.map((product) => (
                <div key={product.id} className="group bg-white rounded-[2rem] border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500">
                  <div className="aspect-[4/5] relative overflow-hidden bg-slate-100">
                    <img 
                      src={product.imageUrl} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-[10px] font-black text-slate-800 uppercase tracking-widest shadow-sm">
                      {product.category}
                    </div>
                  </div>
                  <div className="p-6 text-center">
                    <h3 className="font-bold text-slate-900 text-lg mb-1 truncate">{product.name}</h3>
                    <p className="text-agri-600 font-black text-xl mb-6">Rp {product.price.toLocaleString()}</p>
                    <button 
                      onClick={() => addToCart({id: product.id, name: product.name, price: product.price, type: 'Product', image: product.imageUrl})}
                      className="w-full py-4 bg-slate-50 text-slate-900 rounded-2xl font-bold text-sm hover:bg-agri-600 hover:text-white transition-all flex items-center justify-center gap-2 group-hover:bg-agri-600 group-hover:text-white"
                    >
                      <ShoppingBag size={18} /> Tambah
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-20 p-12 bg-agri-600 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-agri-200">
              <div className="max-w-md text-center md:text-left">
                <h3 className="text-3xl font-bold mb-4">Butuh Layanan Custom?</h3>
                <p className="text-agri-100 font-medium">Layanan pengiriman hewan hidup, konsultasi pembuatan kandang, hingga pakan racikan khusus tersedia melalui admin kami.</p>
              </div>
              <button className="px-10 py-5 bg-white text-agri-600 rounded-2xl font-bold text-lg hover:shadow-xl transition-all flex items-center gap-3">
                <Smartphone /> Hubungi Ali Farm
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-24 bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-8">
                <div className="w-10 h-10 bg-agri-600 rounded-xl flex items-center justify-center text-white">
                  <Sprout className="w-6 h-6" />
                </div>
                <span className="text-2xl font-bold">Ali Farm</span>
              </div>
              <p className="text-slate-500 text-lg leading-relaxed max-w-sm mb-8">
                Platform peternakan domba cerdas yang menggabungkan teknologi digital dengan keberkahan sistem syariah.
              </p>
              <div className="flex gap-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-agri-600 hover:border-agri-600 transition-all cursor-pointer">
                    <Globe size={18} />
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-8">Navigasi</h4>
              <ul className="space-y-4 text-slate-400 font-medium">
                <li><a href="#" className="hover:text-white transition-colors">Tentang Kami</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pusat Bantuan</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Syarat & Ketentuan</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Kebijakan Privasi</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-8">Kontak</h4>
              <ul className="space-y-4 text-slate-400 font-medium">
                <li className="flex items-center gap-3"><MapPin size={18} className="text-agri-600" /> Jawa Timur, Indonesia</li>
                <li className="flex items-center gap-3"><Phone size={18} className="text-agri-600" /> +62 815-5333-5534</li>
                <li className="flex items-center gap-3"><Mail size={18} className="text-agri-600" /> halo@alifarm.com</li>
              </ul>
            </div>
          </div>
          
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-slate-600 text-sm font-medium">
            <p>© 2023 Ali Farm. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-agri-600" /> Terverifikasi & Amanah
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
