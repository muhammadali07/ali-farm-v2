import React, { useState, useEffect } from 'react';
import { Sprout, TrendingUp, ShieldCheck, ArrowRight, CheckCircle, Smartphone, Play, Globe, PiggyBank, Calendar, Heart, Menu, X, Star, Leaf, Users, ShoppingBag, Trash2, MapPin, User, Phone, Truck, CreditCard, ChevronLeft, QrCode, Building2, Banknote, Copy, ChevronRight, HandHeart, Info, Clock, MessageCircle, Send, Calculator, BarChart3, FileText, Loader2 } from 'lucide-react';
import { MOCK_PRODUCTS, MOCK_PACKAGES, QURBAN_PACKAGES } from '../constants';
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
    { id: 'transfer', name: 'Bank Transfer', description: isId ? 'Transfer ke rekening BCA/Mandiri' : 'Transfer to BCA/Mandiri account', icon: Building2 },
    { id: 'cod', name: 'COD', description: isId ? 'Bayar ditempat saat barang sampai' : 'Pay on delivery', icon: Banknote },
  ];
  const [selectedPayment, setSelectedPayment] = useState(PAYMENT_METHODS[0].id);

  const BANK_ACCOUNTS = [
    { id: 'bca', name: 'Bank BCA', accountNumber: '8730456123', accountName: 'PT Ali Farm Indonesia', logo: '🏦' },
    { id: 'mandiri', name: 'Bank Mandiri', accountNumber: '1270008765432', accountName: 'PT Ali Farm Indonesia', logo: '🏛️' },
  ];
  const [selectedBank, setSelectedBank] = useState(BANK_ACCOUNTS[0].id);
  const [uniqueCode, setUniqueCode] = useState(0);

  // Generate unique code when checkout opens
  const generateUniqueCode = () => {
    const code = Math.floor(Math.random() * 900) + 100; // 100-999
    setUniqueCode(code);
  };

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
  const transferUniqueCode = selectedPayment === 'transfer' ? uniqueCode : 0;
  const finalTotal = cartTotal + shippingCost + qurbanFee + transferUniqueCode;
  const selectedBankData = BANK_ACCOUNTS.find(b => b.id === selectedBank);

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
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-agri-100 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-agri-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{isId ? 'Keranjang' : 'Cart'}</h2>
                  <p className="text-sm text-slate-500">{cart.length} {isId ? 'item' : 'items'}</p>
                </div>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="w-10 h-10 hover:bg-slate-100 rounded-xl flex items-center justify-center transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-500">{isId ? 'Keranjang kosong' : 'Cart is empty'}</p>
                </div>
              ) : (
                cart.map((item, i) => (
                  <div key={i} className="flex gap-4 p-4 bg-slate-50 rounded-2xl">
                    {item.image && (
                      <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover" />
                    )}
                    {!item.image && (
                      <div className={`w-20 h-20 rounded-xl flex items-center justify-center ${item.type === 'Qurban' ? 'bg-emerald-100' : item.type === 'Investment' ? 'bg-agri-100' : 'bg-orange-100'}`}>
                        {item.type === 'Qurban' && <Heart className="w-8 h-8 text-emerald-600" />}
                        {item.type === 'Investment' && <TrendingUp className="w-8 h-8 text-agri-600" />}
                        {item.type === 'Product' && <ShoppingBag className="w-8 h-8 text-orange-600" />}
                      </div>
                    )}
                    <div className="flex-1">
                      <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full mb-1 ${item.type === 'Qurban' ? 'bg-emerald-100 text-emerald-700' : item.type === 'Investment' ? 'bg-agri-100 text-agri-700' : 'bg-orange-100 text-orange-700'}`}>
                        {item.type === 'Qurban' ? 'TABUNG QURBAN' : item.type === 'Investment' ? 'INVESTASI' : 'PRODUK'}
                      </span>
                      <p className="font-bold text-slate-900 text-sm">{item.name}</p>
                      <p className="text-agri-600 font-bold">Rp {item.price.toLocaleString()}</p>
                    </div>
                    <button onClick={() => removeFromCart(i)} className="self-start p-2 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={18} className="text-red-400" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="p-6 border-t bg-slate-50">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-slate-600">{isId ? 'Subtotal' : 'Subtotal'}</span>
                  <span className="text-2xl font-bold text-slate-900">Rp {cartTotal.toLocaleString()}</span>
                </div>
                <button
                  onClick={() => {setIsCartOpen(false); setIsCheckoutOpen(true); setCheckoutStep(1); generateUniqueCode();}}
                  className="w-full py-4 bg-agri-600 text-white rounded-xl font-bold shadow-lg hover:bg-agri-700 transition-colors flex items-center justify-center gap-2"
                >
                  {isId ? 'Lanjut ke Checkout' : 'Proceed to Checkout'}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCheckoutOpen(false)}></div>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl relative overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-6 border-b bg-slate-50">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900">{isId ? 'Checkout' : 'Checkout'}</h2>
                <button onClick={() => setIsCheckoutOpen(false)} className="w-10 h-10 hover:bg-slate-200 rounded-xl flex items-center justify-center transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              {/* Step Indicator */}
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((step) => (
                  <React.Fragment key={step}>
                    <div className={`flex items-center gap-2 ${checkoutStep >= step ? 'text-agri-600' : 'text-slate-300'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${checkoutStep >= step ? 'bg-agri-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                        {checkoutStep > step ? <CheckCircle className="w-5 h-5" /> : step}
                      </div>
                      <span className="text-sm font-medium hidden sm:inline">
                        {step === 1 ? (isId ? 'Data' : 'Info') : step === 2 ? (isId ? 'Pembayaran' : 'Payment') : (isId ? 'Selesai' : 'Done')}
                      </span>
                    </div>
                    {step < 3 && <div className={`flex-1 h-1 rounded ${checkoutStep > step ? 'bg-agri-600' : 'bg-slate-200'}`}></div>}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {checkoutStep === 3 ? (
                <div className="py-4">
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">{isId ? 'Pesanan Berhasil Dibuat!' : 'Order Created Successfully!'}</h2>
                    <div className="inline-block bg-slate-100 px-4 py-2 rounded-xl">
                      <span className="text-xs text-slate-500 uppercase">Order ID: </span>
                      <span className="font-mono font-bold text-slate-900">{orderId}</span>
                    </div>
                  </div>

                  {selectedPayment === 'transfer' && selectedBankData ? (
                    <div className="max-w-md mx-auto space-y-4">
                      {/* Transfer Instructions */}
                      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
                        <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                          <Building2 className="w-5 h-5" />
                          {isId ? 'Transfer ke Rekening' : 'Transfer to Account'}
                        </h3>
                        <div className="bg-white rounded-xl p-4 space-y-3">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{selectedBankData.logo}</span>
                            <div>
                              <p className="font-bold text-slate-900">{selectedBankData.name}</p>
                              <p className="text-xs text-slate-500">a.n {selectedBankData.accountName}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
                            <span className="font-mono text-lg font-bold text-slate-900">{selectedBankData.accountNumber}</span>
                            <button
                              onClick={() => {navigator.clipboard.writeText(selectedBankData.accountNumber); alert('Nomor rekening disalin!')}}
                              className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                            >
                              <Copy className="w-4 h-4 text-slate-600" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Transfer Amount */}
                      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
                        <h3 className="font-bold text-emerald-900 mb-3">
                          {isId ? 'Jumlah Transfer' : 'Transfer Amount'}
                        </h3>
                        <div className="bg-white rounded-xl p-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-3xl font-bold text-emerald-600">Rp {finalTotal.toLocaleString()}</span>
                            <button
                              onClick={() => {navigator.clipboard.writeText(finalTotal.toString()); alert('Nominal disalin!')}}
                              className="p-2 hover:bg-emerald-100 rounded-lg transition-colors"
                            >
                              <Copy className="w-4 h-4 text-emerald-600" />
                            </button>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 p-2 rounded-lg">
                            <Info className="w-4 h-4" />
                            <span>{isId ? `Termasuk kode unik Rp ${uniqueCode}` : `Includes unique code Rp ${uniqueCode}`}</span>
                          </div>
                        </div>
                      </div>

                      {/* Warning */}
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                        <p className="text-sm text-yellow-800 flex items-start gap-2">
                          <Info className="w-4 h-4 mt-0.5 shrink-0" />
                          <span>
                            {isId
                              ? 'Transfer dengan nominal TEPAT agar pembayaran dapat diverifikasi otomatis.'
                              : 'Transfer the EXACT amount for automatic payment verification.'}
                          </span>
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-sm mx-auto">
                      <div className="bg-emerald-50 p-5 rounded-2xl text-center">
                        <p className="text-sm text-emerald-700 mb-2">{isId ? 'Total Pembayaran (COD)' : 'Total Payment (COD)'}</p>
                        <p className="text-3xl font-bold text-emerald-700">Rp {finalTotal.toLocaleString()}</p>
                        <p className="text-xs text-emerald-600 mt-2">{isId ? 'Bayar saat barang sampai' : 'Pay when items arrive'}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid md:grid-cols-5 gap-6">
                  {/* Form Section */}
                  <div className="md:col-span-3 space-y-6">
                    {checkoutStep === 1 ? (
                      <>
                        <div>
                          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-agri-600" />
                            {isId ? 'Data Pemesan' : 'Customer Info'}
                          </h3>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">{isId ? 'Nama Lengkap' : 'Full Name'}</label>
                              <input
                                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-agri-500 focus:border-agri-500 outline-none transition-all"
                                placeholder={isId ? 'Masukkan nama lengkap' : 'Enter full name'}
                                value={customer.name}
                                onChange={e => setCustomer({...customer, name: e.target.value})}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp</label>
                              <input
                                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-agri-500 focus:border-agri-500 outline-none transition-all"
                                placeholder="08xxxxxxxxxx"
                                value={customer.phone}
                                onChange={e => setCustomer({...customer, phone: e.target.value})}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">{isId ? 'Alamat' : 'Address'}</label>
                              <textarea
                                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-agri-500 focus:border-agri-500 outline-none transition-all resize-none"
                                rows={3}
                                placeholder={isId ? 'Masukkan alamat lengkap' : 'Enter full address'}
                                value={customer.address}
                                onChange={e => setCustomer({...customer, address: e.target.value})}
                              />
                            </div>
                          </div>
                        </div>

                        {isQurbanOrder && (
                          <div>
                            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                              <Calendar className="w-5 h-5 text-emerald-600" />
                              {isId ? 'Opsi Qurban' : 'Qurban Options'}
                            </h3>
                            <div className="space-y-3">
                              <div
                                onClick={() => setQurbanServiceType('SHIPPED')}
                                className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${qurbanServiceType === 'SHIPPED' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}
                              >
                                <div className="flex items-center gap-3">
                                  <Truck className={`w-6 h-6 ${qurbanServiceType === 'SHIPPED' ? 'text-emerald-600' : 'text-slate-400'}`} />
                                  <div className="flex-1">
                                    <p className="font-bold text-slate-900">{isId ? 'Dikirim ke Alamat' : 'Shipped to Address'}</p>
                                    <p className="text-sm text-slate-500">{isId ? 'Domba diantar hidup ke lokasi Anda' : 'Live sheep delivered to your location'}</p>
                                  </div>
                                  <span className="text-sm font-bold text-emerald-600">Rp 50.000</span>
                                </div>
                              </div>
                              <div
                                onClick={() => setQurbanServiceType('CUSTODY')}
                                className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${qurbanServiceType === 'CUSTODY' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}
                              >
                                <div className="flex items-center gap-3">
                                  <HandHeart className={`w-6 h-6 ${qurbanServiceType === 'CUSTODY' ? 'text-emerald-600' : 'text-slate-400'}`} />
                                  <div className="flex-1">
                                    <p className="font-bold text-slate-900">{isId ? 'Dititipkan & Disembelih' : 'Custody & Slaughter'}</p>
                                    <p className="text-sm text-slate-500">{isId ? 'Kami yang urus pemotongan & distribusi' : 'We handle slaughter & distribution'}</p>
                                  </div>
                                  <span className="text-sm font-bold text-emerald-600">Rp 50.000</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="space-y-6">
                        {/* Payment Method Selection */}
                        <div>
                          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-agri-600" />
                            {isId ? 'Metode Pembayaran' : 'Payment Method'}
                          </h3>
                          <div className="space-y-3">
                            {PAYMENT_METHODS.map(m => (
                              <div
                                key={m.id}
                                onClick={() => setSelectedPayment(m.id)}
                                className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedPayment === m.id ? 'border-agri-500 bg-agri-50' : 'border-slate-200 hover:border-slate-300'}`}
                              >
                                <div className="flex items-center gap-4">
                                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedPayment === m.id ? 'bg-agri-100' : 'bg-slate-100'}`}>
                                    <m.icon className={`w-6 h-6 ${selectedPayment === m.id ? 'text-agri-600' : 'text-slate-400'}`} />
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-bold text-slate-900">{m.name}</p>
                                    <p className="text-sm text-slate-500">{m.description}</p>
                                  </div>
                                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedPayment === m.id ? 'border-agri-600 bg-agri-600' : 'border-slate-300'}`}>
                                    {selectedPayment === m.id && <CheckCircle className="w-4 h-4 text-white" />}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Bank Account Selection - Only show when Transfer is selected */}
                        {selectedPayment === 'transfer' && (
                          <div>
                            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                              <Building2 className="w-5 h-5 text-agri-600" />
                              {isId ? 'Pilih Rekening Tujuan' : 'Select Bank Account'}
                            </h3>
                            <div className="space-y-3">
                              {BANK_ACCOUNTS.map(bank => (
                                <div
                                  key={bank.id}
                                  onClick={() => setSelectedBank(bank.id)}
                                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedBank === bank.id ? 'border-agri-500 bg-agri-50' : 'border-slate-200 hover:border-slate-300'}`}
                                >
                                  <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${selectedBank === bank.id ? 'bg-agri-100' : 'bg-slate-100'}`}>
                                      {bank.logo}
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-bold text-slate-900">{bank.name}</p>
                                      <p className="text-sm text-slate-500 font-mono">{bank.accountNumber}</p>
                                      <p className="text-xs text-slate-400">a.n {bank.accountName}</p>
                                    </div>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedBank === bank.id ? 'border-agri-600 bg-agri-600' : 'border-slate-300'}`}>
                                      {selectedBank === bank.id && <CheckCircle className="w-4 h-4 text-white" />}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Unique Transfer Code Info */}
                            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                              <div className="flex items-start gap-3">
                                <Info className="w-5 h-5 text-yellow-600 mt-0.5" />
                                <div>
                                  <p className="font-semibold text-yellow-800 text-sm">
                                    {isId ? 'Kode Unik Transfer' : 'Unique Transfer Code'}
                                  </p>
                                  <p className="text-yellow-700 text-sm mt-1">
                                    {isId
                                      ? `Transfer dengan nominal tepat Rp ${finalTotal.toLocaleString()} (termasuk kode unik Rp ${uniqueCode}) untuk mempercepat verifikasi pembayaran.`
                                      : `Transfer the exact amount of Rp ${finalTotal.toLocaleString()} (includes unique code Rp ${uniqueCode}) for faster payment verification.`}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Order Summary */}
                  <div className="md:col-span-2">
                    <div className="bg-slate-50 rounded-2xl p-5 sticky top-0">
                      <h3 className="font-bold text-slate-900 mb-4">{isId ? 'Ringkasan Pesanan' : 'Order Summary'}</h3>
                      <div className="space-y-3 mb-4 max-h-40 overflow-y-auto">
                        {cart.map((item, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-slate-600 truncate flex-1 mr-2">{item.name}</span>
                            <span className="font-medium text-slate-900">Rp {item.price.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-slate-200 pt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Subtotal</span>
                          <span className="font-medium">Rp {cartTotal.toLocaleString()}</span>
                        </div>
                        {shippingCost > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">{isId ? 'Pengiriman' : 'Shipping'}</span>
                            <span className="font-medium">Rp {shippingCost.toLocaleString()}</span>
                          </div>
                        )}
                        {qurbanFee > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">{isId ? 'Biaya Layanan' : 'Service Fee'}</span>
                            <span className="font-medium">Rp {qurbanFee.toLocaleString()}</span>
                          </div>
                        )}
                        {selectedPayment === 'transfer' && transferUniqueCode > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">{isId ? 'Kode Unik' : 'Unique Code'}</span>
                            <span className="font-medium text-yellow-600">Rp {transferUniqueCode.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between pt-2 border-t border-slate-200">
                          <span className="font-bold text-slate-900">Total</span>
                          <span className="font-bold text-lg text-agri-600">Rp {finalTotal.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t bg-white">
              {checkoutStep === 3 ? (
                <button onClick={handleFinalizeWhatsApp} className="w-full py-4 bg-green-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition-colors">
                  <Smartphone className="w-5 h-5" />
                  {isId ? 'Konfirmasi via WhatsApp' : 'Confirm via WhatsApp'}
                </button>
              ) : (
                <div className="flex gap-4">
                  <button
                    onClick={() => checkoutStep === 1 ? setIsCheckoutOpen(false) : setCheckoutStep(1)}
                    className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    {checkoutStep === 1 ? (isId ? 'Batal' : 'Cancel') : (isId ? 'Kembali' : 'Back')}
                  </button>
                  <button
                    onClick={handleNextStep}
                    className="flex-1 py-3 bg-agri-600 text-white rounded-xl font-bold hover:bg-agri-700 transition-colors flex items-center justify-center gap-2"
                  >
                    {checkoutStep === 2 ? (isId ? 'Buat Pesanan' : 'Place Order') : (isId ? 'Lanjut' : 'Continue')}
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
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
        <section id="investments" className="py-24 bg-gradient-to-b from-white to-slate-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left Content */}
              <div>
                <span className="inline-block px-4 py-2 bg-agri-100 text-agri-700 rounded-full text-sm font-semibold mb-6">
                  {isId ? 'Investasi Syariah' : 'Sharia Investment'}
                </span>
                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                  {isId ? 'Investasi Domba dengan Bagi Hasil Syariah' : 'Sheep Investment with Sharia Profit Sharing'}
                </h2>
                <p className="text-slate-500 text-lg mb-8 leading-relaxed">
                  {isId
                    ? 'Miliki domba breeding dengan sistem bagi hasil yang transparan. Pantau perkembangan investasi Anda secara real-time melalui CCTV 24/7.'
                    : 'Own breeding sheep with transparent profit sharing system. Monitor your investment progress in real-time via 24/7 CCTV.'}
                </p>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-agri-100 rounded-xl flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 text-agri-600" />
                    </div>
                    <span className="text-slate-700 font-medium">{isId ? 'Akad Syariah' : 'Sharia Contract'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-agri-100 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-agri-600" />
                    </div>
                    <span className="text-slate-700 font-medium">{isId ? 'ROI s/d 45%' : 'Up to 45% ROI'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-agri-100 rounded-xl flex items-center justify-center">
                      <Play className="w-5 h-5 text-agri-600" />
                    </div>
                    <span className="text-slate-700 font-medium">{isId ? 'CCTV 24/7' : '24/7 CCTV'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-agri-100 rounded-xl flex items-center justify-center">
                      <Heart className="w-5 h-5 text-agri-600" />
                    </div>
                    <span className="text-slate-700 font-medium">{isId ? 'Asuransi' : 'Insurance'}</span>
                  </div>
                </div>
              </div>

              {/* Right Card */}
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-agri-400 to-agri-600 rounded-[2rem] blur-2xl opacity-20"></div>
                <div className="relative bg-gradient-to-br from-agri-600 to-agri-700 text-white p-8 md:p-10 rounded-3xl shadow-2xl">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full">
                    {isId ? 'PAKET UNGGULAN' : 'FEATURED PACKAGE'}
                  </div>
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                    <Sprout className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{MOCK_PACKAGES[0].name}</h3>
                  <p className="text-white/80 mb-6">{MOCK_PACKAGES[0].description}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">Rp {MOCK_PACKAGES[0].pricePerUnit.toLocaleString()}</span>
                    <span className="text-white/70"> / {isId ? 'ekor' : 'unit'}</span>
                  </div>
                  <div className="space-y-3 mb-8 text-white/90">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-300" />
                      <span>{isId ? 'Durasi kontrak' : 'Contract duration'}: {MOCK_PACKAGES[0].durationMonths} {isId ? 'Bulan' : 'Months'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-300" />
                      <span>{isId ? 'Estimasi ROI' : 'Est. ROI'}: {MOCK_PACKAGES[0].estimatedRoi}%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-300" />
                      <span>{isId ? 'Perawatan & pakan termasuk' : 'Care & feed included'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-300" />
                      <span>{isId ? 'Asuransi kematian ternak' : 'Livestock death insurance'}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => addToCart({id: MOCK_PACKAGES[0].id, name: MOCK_PACKAGES[0].name, price: MOCK_PACKAGES[0].pricePerUnit, type: 'Investment'})}
                    className="w-full py-4 bg-white text-agri-700 rounded-xl font-bold hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                  >
                    <TrendingUp className="w-5 h-5" />
                    {isId ? 'Mulai Investasi Sekarang' : 'Start Investing Now'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Qurban Savings */}
      {config.features.qurban && (
        <section id="qurban" className="py-24 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-300 rounded-full blur-3xl"></div>
          </div>
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            {/* Header */}
            <div className="text-center text-white mb-16">
              <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur rounded-full text-sm font-semibold mb-6">
                <Heart className="w-4 h-4 inline mr-2" />
                {isId ? 'Tabungan Qurban' : 'Qurban Savings'}
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                {isId ? 'Pilih Domba Qurban Anda' : 'Choose Your Qurban Sheep'}
              </h2>
              <p className="text-emerald-100 text-lg max-w-2xl mx-auto">
                {isId
                  ? 'Mulai menabung dari sekarang dan dapatkan domba berkualitas saat Idul Adha. Pantau pertumbuhan domba via CCTV 24/7.'
                  : 'Start saving now and get quality sheep for Eid al-Adha. Monitor sheep growth via 24/7 CCTV.'}
              </p>
            </div>

            {/* Qurban Sheep Cards */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {QURBAN_PACKAGES.map((pkg, index) => (
                <div key={pkg.id} className={`relative bg-white rounded-3xl overflow-hidden shadow-2xl transition-all hover:scale-105 ${index === 1 ? 'md:-translate-y-4 ring-4 ring-yellow-400' : ''}`}>
                  {index === 1 && (
                    <div className="absolute top-4 right-4 z-10 px-3 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full">
                      {isId ? 'TERLARIS' : 'BEST SELLER'}
                    </div>
                  )}
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={pkg.image}
                      alt={pkg.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-slate-900">{pkg.name}</h3>
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-bold rounded-full">
                        {pkg.weight}
                      </span>
                    </div>
                    <p className="text-slate-500 text-sm mb-4">{pkg.description}</p>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-2xl font-bold text-emerald-600">Rp {pkg.price.toLocaleString()}</span>
                        <p className="text-xs text-slate-400">{isId ? 'atau cicil' : 'or installment'} Rp {Math.ceil(pkg.price / 12).toLocaleString()}/{isId ? 'bln' : 'mo'}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => addToCart({id: pkg.id, name: `${pkg.name} (${pkg.weight})`, price: pkg.price, type: 'Qurban', image: pkg.image})}
                      className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <ShoppingBag className="w-5 h-5" />
                      {isId ? 'Pilih & Tabung' : 'Select & Save'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-white/10 backdrop-blur p-5 rounded-2xl text-white text-center">
                <PiggyBank className="w-10 h-10 text-yellow-300 mx-auto mb-3" />
                <h4 className="font-bold text-lg mb-1">{isId ? 'Cicilan Fleksibel' : 'Flexible Installment'}</h4>
                <p className="text-emerald-200 text-sm">{isId ? 'Mulai Rp 100.000/bulan' : 'From Rp 100,000/month'}</p>
              </div>
              <div className="bg-white/10 backdrop-blur p-5 rounded-2xl text-white text-center">
                <ShieldCheck className="w-10 h-10 text-yellow-300 mx-auto mb-3" />
                <h4 className="font-bold text-lg mb-1">{isId ? 'Dijamin Syariah' : 'Sharia Guaranteed'}</h4>
                <p className="text-emerald-200 text-sm">{isId ? 'Akad jelas & transparan' : 'Clear & transparent'}</p>
              </div>
              <div className="bg-white/10 backdrop-blur p-5 rounded-2xl text-white text-center">
                <Calendar className="w-10 h-10 text-yellow-300 mx-auto mb-3" />
                <h4 className="font-bold text-lg mb-1">{isId ? 'Tepat Waktu' : 'On Time'}</h4>
                <p className="text-emerald-200 text-sm">{isId ? 'Siap saat Idul Adha' : 'Ready for Eid al-Adha'}</p>
              </div>
              <div className="bg-white/10 backdrop-blur p-5 rounded-2xl text-white text-center">
                <Truck className="w-10 h-10 text-yellow-300 mx-auto mb-3" />
                <h4 className="font-bold text-lg mb-1">{isId ? 'Gratis Antar' : 'Free Delivery'}</h4>
                <p className="text-emerald-200 text-sm">{isId ? 'Ke lokasi pemotongan' : 'To slaughter location'}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Marketplace */}
      {config.features.marketplace && (
        <section id="marketplace" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold mb-4">
                {isId ? 'Pasar Ali Farm' : 'Ali Farm Market'}
              </span>
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                {isId ? 'Produk Peternakan Terbaik' : 'Best Farming Products'}
              </h2>
              <p className="text-slate-500 max-w-2xl mx-auto">
                {isId ? 'Dapatkan pakan berkualitas, domba bibit unggulan, dan kebutuhan peternakan lainnya.' : 'Get quality feed, superior breeding sheep, and other farming needs.'}
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {MOCK_PRODUCTS.map((product) => (
                <div key={product.id} className="group bg-slate-50 rounded-3xl overflow-hidden hover:shadow-xl transition-all">
                  <div className="aspect-video bg-slate-200 overflow-hidden">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <span className="inline-block px-3 py-1 bg-slate-200 text-slate-600 rounded-full text-xs font-semibold mb-3">
                      {product.category}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{product.name}</h3>
                    <p className="text-slate-500 text-sm mb-4">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-agri-600">Rp {product.price.toLocaleString()}</span>
                      <button
                        onClick={() => addToCart({id: product.id, name: product.name, price: product.price, type: 'Product', image: product.imageUrl})}
                        className="px-4 py-2 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors"
                      >
                        + {isId ? 'Keranjang' : 'Cart'}
                      </button>
                    </div>
                  </div>
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