import React, { useState, useEffect } from 'react';
import { Sprout, TrendingUp, ShieldCheck, ArrowRight, CheckCircle, Smartphone, Play, Globe, PiggyBank, Calendar, Heart, Menu, X, Star, Leaf, Users, ShoppingBag, Trash2, MapPin, User, Phone, Truck, CreditCard, ChevronLeft, QrCode, Building2, Banknote, Copy, ChevronRight, HandHeart, Info, Clock, MessageCircle, Send, Calculator, BarChart3, FileText, Loader2 } from 'lucide-react';
import { MOCK_PRODUCTS, MOCK_PACKAGES } from '../constants';
import { db } from '../services/db';
import { AppConfig } from '../types';

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
  
  // App Configuration State
  const [config, setConfig] = useState<AppConfig | null>(null);

  // Cart & Checkout State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  
  // Chat Widget State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');

  // Investment Section State
  const [activeBenefitIndex, setActiveBenefitIndex] = useState(0);

  // Checkout Steps State
  const [checkoutStep, setCheckoutStep] = useState(1); // 1: Shipping, 2: Payment, 3: Success
  const [customer, setCustomer] = useState<CustomerData>({ name: '', phone: '', address: '' });
  const [orderId, setOrderId] = useState('');
  
  // Qurban Logic
  const [qurbanServiceType, setQurbanServiceType] = useState<'SHIPPED' | 'CUSTODY'>('SHIPPED');
  const [deliveryDate, setDeliveryDate] = useState('');
  
  // Couriers
  const COURIERS = [
    { id: 'jne', name: 'JNE Reguler', price: 12000, est: '2-3 Hari' },
    { id: 'jnt', name: 'J&T Express', price: 15000, est: '1-3 Hari' },
    { id: 'sicepat', name: 'SiCepat HALU', price: 10000, est: '2-4 Hari' },
  ];
  
  // Update TaxiFarm with Discount
  const TAXI_FARM = { id: 'taxifarm', name: 'TaxiFarm', price: 50000, originalPrice: 100000, est: 'Sesuai Jadwal' };

  const [selectedCourier, setSelectedCourier] = useState(COURIERS[0]);

  // Payment Methods
  const PAYMENT_METHODS = [
    { id: 'qris', name: 'QRIS', description: isId ? 'Scan QR untuk pembayaran instan' : 'Scan QR for instant payment', icon: QrCode },
    { id: 'transfer', name: 'Bank Transfer', description: 'BCA, Mandiri', icon: Building2 },
    { id: 'cod', name: 'COD', description: isId ? 'Bayar ditempat saat barang sampai' : 'Pay on delivery', icon: Banknote },
  ];
  const [selectedPayment, setSelectedPayment] = useState(PAYMENT_METHODS[0].id);

  const BENEFITS = [
    { id: 1, text: isId ? 'Gratis Perawatan & Pakan' : 'Free Care & Feed', icon: CheckCircle, desc: isId ? 'Kami menanggung biaya pakan dan perawatan harian sepenuhnya.' : 'We cover daily feed and care costs completely.' },
    { id: 2, text: isId ? 'Asuransi Kematian Ternak' : 'Livestock Death Insurance', icon: ShieldCheck, desc: isId ? 'Garansi ganti rugi unit baru jika domba mati.' : 'New unit replacement guarantee if sheep dies.' },
    { id: 3, text: isId ? 'Laporan Berkala via App' : 'Regular App Reports', icon: Smartphone, desc: isId ? 'Pantau perkembangan bobot dan kondisi via dashboard.' : 'Monitor weight and condition via dashboard.' },
    { id: 4, text: isId ? 'Sertifikat Kepemilikan' : 'Ownership Certificate', icon: FileText, desc: isId ? 'Bukti legal kepemilikan aset yang sah dan transparan.' : 'Legal proof of valid and transparent asset ownership.' },
    { id: 5, text: isId ? 'Bagi Hasil Transparan' : 'Transparent Sharing', icon: PiggyBank, desc: isId ? 'Sistem bagi hasil syariah saat panen (profit sharing).' : 'Sharia profit sharing system at harvest.' },
    { id: 6, text: isId ? 'Buyback Guarantee' : 'Buyback Guarantee', icon: Banknote, desc: isId ? 'Jaminan pasar. Kami membeli hasil panen Anda.' : 'Market guarantee. We buy your harvest.' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch Config
  useEffect(() => {
    const fetchConfig = async () => {
        const data = await db.getConfig();
        setConfig(data);
    };
    fetchConfig();
  }, []);

  // Benefit Rotation Effect
  useEffect(() => {
    const interval = setInterval(() => {
        setActiveBenefitIndex((prev) => (prev + 1) % BENEFITS.length);
    }, 4000); // Slower rotation for stack readability
    return () => clearInterval(interval);
  }, []);

  if (!config) return (
     <div className="h-screen w-full flex items-center justify-center bg-slate-900">
        <Loader2 className="text-agri-500 animate-spin" size={32} />
     </div>
  );

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      const offset = 80; // Header height + padding
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    ...(config.features.investment ? [{ href: "#investments", label: isId ? 'Investasi' : 'Investments' }] : []),
    ...(config.features.qurban ? [{ href: "#qurban", label: isId ? 'Tabung Qurban' : 'Qurban Savings' }] : []),
    ...(config.features.marketplace ? [{ href: "#marketplace", label: isId ? 'Pasar' : 'Marketplace' }] : []),
    { href: "#how-it-works", label: isId ? 'Cara Kerja' : 'How it Works' },
  ];

  // --- Cart Logic ---
  const addToCart = (item: CartItem) => {
    setCart([...cart, item]);
    setIsCartOpen(true);
  };

  const removeFromCart = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const isQurbanOrder = cart.some(item => item.type === 'Qurban');
  const isInvestmentOrder = cart.some(item => item.type === 'Investment');
  const cartTotal = cart.reduce((acc, item) => acc + item.price, 0);
  
  // Calculate Fees based on Qurban Service Type
  const qurbanFee = (isQurbanOrder && qurbanServiceType === 'CUSTODY') ? 50000 : 0;
  
  // Determine Shipping Cost
  let currentShippingCost = 0;
  if (isQurbanOrder) {
      if (qurbanServiceType === 'SHIPPED') {
          currentShippingCost = TAXI_FARM.price;
      } else {
          currentShippingCost = 0;
      }
  } else if (isInvestmentOrder) {
      currentShippingCost = 0; // No shipping for investments
  } else {
      currentShippingCost = selectedCourier.price;
  }
  
  // If cart has mixed items, logic might need adjustment, but assuming single flow for MVP
  const finalTotal = cartTotal + currentShippingCost + qurbanFee;

  // --- Checkout Logic ---
  const openCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
    setCheckoutStep(1);
    // Reset defaults
    setQurbanServiceType('SHIPPED'); 
    setDeliveryDate('');
    if (!isQurbanOrder) setSelectedCourier(COURIERS[0]);
  };

  const handleNextStep = () => {
    if (checkoutStep === 1) {
      if (!customer.name || !customer.phone || !customer.address) {
        alert(isId ? 'Mohon lengkapi semua data' : 'Please complete all fields');
        return;
      }
      if (isQurbanOrder && qurbanServiceType === 'SHIPPED' && !deliveryDate) {
          alert(isId ? 'Mohon pilih tanggal pengiriman' : 'Please select delivery date');
          return;
      }
      setCheckoutStep(2);
    } else if (checkoutStep === 2) {
      // Generate Order ID
      const newOrderId = `AF-${Math.floor(10000 + Math.random() * 90000)}`;
      setOrderId(newOrderId);
      setCheckoutStep(3);
    }
  };

  const handleFinalizeWhatsApp = () => {
    const itemList = cart.map((item, idx) => `${idx + 1}. ${item.name} (${item.type}) - Rp ${item.price.toLocaleString()}`).join('\n');
    const paymentMethodName = PAYMENT_METHODS.find(p => p.id === selectedPayment)?.name || selectedPayment;
    
    let details = '';
    let shippingInfo = '';

    if (isQurbanOrder) {
        details = `\nLayanan Qurban: ${qurbanServiceType === 'CUSTODY' ? 'Titip & Disalurkan' : 'Dikirim ke Rumah'}`;
        
        if (qurbanServiceType === 'CUSTODY') {
            details += `\nBiaya Pakan: Rp ${qurbanFee.toLocaleString()}`;
            shippingInfo = 'Tanpa Pengiriman (Disalurkan)';
        } else {
            // Shipped Qurban
            details += `\nTanggal Pengiriman: ${deliveryDate}`;
            shippingInfo = `Ekspedisi: ${TAXI_FARM.name} (Rp ${TAXI_FARM.price.toLocaleString()})`;
        }
    } else if (isInvestmentOrder) {
        shippingInfo = 'Digital Contract (No Shipping)';
    } else {
        shippingInfo = `Ongkir (${selectedCourier.name}): Rp ${currentShippingCost.toLocaleString()}`;
    }

    const message = isId 
      ? `Halo Admin Ali Farm, Saya telah melakukan checkout.\n\n*ID PESANAN: ${orderId}*\n\nDetail Pesanan:\n${itemList}${details}\n\nSubtotal: Rp ${cartTotal.toLocaleString()}\n${shippingInfo}\n*Total Bayar: Rp ${finalTotal.toLocaleString()}*\n\nMetode Pembayaran: ${paymentMethodName}\n\nData Pelanggan:\nNama: ${customer.name}\nNo HP: ${customer.phone}\nAlamat: ${customer.address}\n\nMohon konfirmasi pesanan saya.`
      : `Hello Ali Farm Admin, I have checked out.\n\n*ORDER ID: ${orderId}*\n\nOrder Details:\n${itemList}${details}\n\nSubtotal: Rp ${cartTotal.toLocaleString()}\n${shippingInfo}\n*Total: Rp ${finalTotal.toLocaleString()}*\n\nPayment Method: ${paymentMethodName}\n\nCustomer Details:\nName: ${customer.name}\nPhone: ${customer.phone}\nAddress: ${customer.address}\n\nPlease confirm my order.`;
    
    window.open(`https://wa.me/${ADMIN_WA}?text=${encodeURIComponent(message)}`, '_blank');
    
    // Reset flow
    setIsCheckoutOpen(false);
    setCart([]);
    setCustomer({ name: '', phone: '', address: '' });
    setCheckoutStep(1);
  };

  const handleSendConsultation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const text = isId 
      ? `Halo Admin Ali Farm, saya ingin berkonsultasi:\n\n${chatMessage}`
      : `Hello Admin Ali Farm, I would like to consult regarding:\n\n${chatMessage}`;
    
    window.open(`https://wa.me/${ADMIN_WA}?text=${encodeURIComponent(text)}`, '_blank');
    setChatMessage('');
    setIsChatOpen(false);
  };

  const QURBAN_PACKAGES = [
    {
      id: 1,
      name: 'Tipe A (Standard)',
      weight: '23-25 kg',
      price: 2500000,
      monthly: 250000,
      desc: isId ? 'Cocok untuk qurban perorangan ekonomis.' : 'Suitable for economical individual qurban.',
      color: 'from-blue-500 to-cyan-400'
    },
    {
      id: 2,
      name: 'Tipe B (Premium)',
      weight: '28-32 kg',
      price: 3500000,
      monthly: 350000,
      desc: isId ? 'Pilihan paling populer dengan kualitas daging prima.' : 'Most popular choice with premium meat quality.',
      color: 'from-agri-600 to-emerald-400',
      recommended: true
    },
    {
      id: 3,
      name: 'Tipe C (Super)',
      weight: '> 35 kg',
      price: 4500000,
      monthly: 450000,
      desc: isId ? 'Domba jantan tanduk besar, gagah dan istimewa.' : 'Large horned ram, majestic and special.',
      color: 'from-orange-500 to-amber-400'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans overflow-x-hidden selection:bg-agri-500 selection:text-white">
      {/* Navigation */}
      <nav 
        className={`fixed w-full z-[100] transition-all duration-300 pointer-events-auto ${
          scrolled 
            ? 'bg-white/95 backdrop-blur-xl border-b border-slate-200/50 py-3 shadow-sm' 
            : 'bg-transparent py-4 md:py-6 border-b border-white/10'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer group z-50" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${scrolled ? 'bg-agri-600 text-white' : 'bg-white text-agri-600'}`}>
              <Sprout className="w-6 h-6 transform group-hover:rotate-12 transition-transform" />
            </div>
            <span className={`text-xl font-bold tracking-tight ${scrolled ? 'text-slate-900' : 'text-white'}`}>Ali Farm</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a 
                key={link.href} 
                href={link.href}
                onClick={(e) => scrollToSection(e, link.href)}
                className={`text-sm font-medium transition-colors hover:text-agri-500 cursor-pointer ${scrolled ? 'text-slate-600' : 'text-white/90 hover:text-white'}`}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
             {/* Cart Trigger (Desktop) */}
             <button 
               onClick={() => setIsCartOpen(true)}
               className={`relative p-2 rounded-full transition-all ${scrolled ? 'text-slate-700 hover:bg-slate-100' : 'text-white hover:bg-white/10'}`}
             >
                <ShoppingBag size={22} />
                {cart.length > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full font-bold">
                    {cart.length}
                  </span>
                )}
             </button>

            <button 
              onClick={onLogin}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                scrolled 
                  ? 'bg-slate-900 text-white hover:bg-slate-800' 
                  : 'bg-white text-agri-900 hover:bg-agri-50'
              }`}
            >
              {isId ? 'Masuk' : 'Login'}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            <button 
               onClick={() => setIsCartOpen(true)}
               className={`relative p-2 rounded-full ${scrolled ? 'text-slate-700' : 'text-white'}`}
             >
                <ShoppingBag size={22} />
                {cart.length > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full font-bold">
                    {cart.length}
                  </span>
                )}
             </button>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-lg cursor-pointer ${scrolled ? 'text-slate-900' : 'text-white'}`}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-100 shadow-xl p-4 flex flex-col space-y-4 animate-fade-in-up">
             {navLinks.map((link) => (
              <a 
                key={link.href} 
                href={link.href}
                onClick={(e) => scrollToSection(e, link.href)}
                className="text-slate-600 font-medium py-2 block"
              >
                {link.label}
              </a>
            ))}
            <button 
              onClick={onLogin}
              className="w-full bg-agri-600 text-white py-3 rounded-xl font-bold"
            >
               {isId ? 'Masuk / Daftar' : 'Login / Register'}
            </button>
          </div>
        )}
      </nav>

      {/* Floating Cart Button */}
      {!isCartOpen && cart.length > 0 && (
         <button 
           onClick={() => setIsCartOpen(true)}
           className="fixed bottom-6 left-6 z-40 bg-slate-900 text-white p-4 rounded-full shadow-xl shadow-slate-400/50 hover:scale-110 transition-transform animate-bounce-slow"
         >
           <ShoppingBag size={24} />
           <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 border-2 border-slate-900 rounded-full flex items-center justify-center text-xs font-bold">
             {cart.length}
           </span>
         </button>
      )}

      {/* Floating Chat Widget - MODERNIZED */}
      <div className="fixed bottom-6 right-6 z-[90]">
         {!isChatOpen && (
            <button 
              onClick={() => setIsChatOpen(true)}
              className="group flex items-center gap-3 bg-white/95 backdrop-blur-md text-slate-800 pl-2 pr-6 py-2 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/50 hover:shadow-[0_8px_30px_rgb(34,197,94,0.2)] hover:-translate-y-1 transition-all duration-300 animate-fade-in-up"
            >
               <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-agri-500 to-emerald-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-agri-500/30 group-hover:scale-110 transition-transform duration-300">
                      {/* Inner glowing icon effect */}
                      <MessageCircle size={24} fill="white" className="text-white/20 absolute" />
                      <MessageCircle size={24} className="relative z-10" />
                  </div>
                  {/* Status Indicator */}
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  </span>
               </div>
               <div className="flex flex-col items-start text-left">
                  <span className="text-[10px] font-bold text-agri-600 uppercase tracking-wider">{isId ? 'Online 24/7' : 'Support Online'}</span>
                  <span className="text-sm font-bold text-slate-800 leading-tight">{isId ? 'Konsultasi Gratis' : 'Free Consultation'}</span>
               </div>
            </button>
         )}

         {isChatOpen && (
            <div className="bg-white rounded-2xl shadow-2xl w-80 sm:w-96 border border-slate-100 overflow-hidden animate-scale-up origin-bottom-right">
               {/* Chat Header */}
               <div className="bg-gradient-to-r from-agri-600 to-emerald-600 p-4 flex justify-between items-center text-white">
                  <div className="flex items-center gap-3">
                     <div className="relative">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                           <User size={20} />
                        </div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-green-600 rounded-full"></div>
                     </div>
                     <div>
                        <h4 className="font-bold text-sm">Admin Ali Farm</h4>
                        <p className="text-xs text-green-100 opacity-90">{isId ? 'Online Sekarang' : 'Online Now'}</p>
                     </div>
                  </div>
                  <button onClick={() => setIsChatOpen(false)} className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors">
                     <X size={20} />
                  </button>
               </div>
               
               {/* Chat Body */}
               <div className="p-4 bg-slate-50 h-64 overflow-y-auto flex flex-col gap-4">
                  <div className="bg-white p-3 rounded-tr-xl rounded-bl-xl rounded-br-xl shadow-sm border border-slate-100 text-sm text-slate-700 self-start max-w-[85%]">
                     {isId 
                       ? 'Halo! 👋 Selamat datang di Ali Farm. Ada yang bisa kami bantu mengenai investasi atau qurban?' 
                       : 'Hello! 👋 Welcome to Ali Farm. How can we help you with investment or Qurban?'}
                  </div>
                  <div className="text-xs text-slate-400 text-center my-2 font-medium">
                     {isId ? 'Mulai percakapan via WhatsApp' : 'Start conversation via WhatsApp'}
                  </div>
               </div>

               {/* Chat Input */}
               <form onSubmit={handleSendConsultation} className="p-3 bg-white border-t border-slate-100 flex gap-2">
                  <input 
                     type="text"
                     value={chatMessage}
                     onChange={(e) => setChatMessage(e.target.value)}
                     placeholder={isId ? "Tulis pesan Anda..." : "Type your message..."}
                     className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all placeholder:text-slate-400"
                  />
                  <button 
                     type="submit"
                     disabled={!chatMessage.trim()}
                     className="p-2.5 bg-agri-600 text-white rounded-xl hover:bg-agri-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-agri-200"
                  >
                     <Send size={18} />
                  </button>
               </form>
            </div>
         )}
      </div>

      {/* CART MODAL (Right Side Sheet) */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[200] flex justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-fade-in-up">
             <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
               <div className="flex items-center gap-2">
                 <ShoppingBag className="text-agri-600" />
                 <h2 className="font-bold text-lg text-slate-800">{isId ? 'Keranjang Belanja' : 'Your Cart'}</h2>
                 <span className="bg-agri-100 text-agri-700 text-xs font-bold px-2 py-0.5 rounded-full">{cart.length}</span>
               </div>
               <button onClick={() => setIsCartOpen(false)} className="text-slate-400 hover:text-slate-700">
                 <X size={24} />
               </button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                    <ShoppingBag size={64} className="opacity-20" />
                    <p>{isId ? 'Keranjang Anda kosong' : 'Your cart is empty'}</p>
                    <button onClick={() => setIsCartOpen(false)} className="text-agri-600 font-semibold hover:underline">
                      {isId ? 'Mulai Belanja' : 'Start Shopping'}
                    </button>
                  </div>
                ) : (
                  cart.map((item, idx) => (
                    <div key={idx} className="flex gap-4 p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                       <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                          {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <ShoppingBag size={24} className="text-slate-400"/>}
                       </div>
                       <div className="flex-1">
                          <h4 className="font-bold text-slate-800 line-clamp-1">{item.name}</h4>
                          <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded">{item.type}</span>
                          <p className="text-agri-600 font-bold mt-1">Rp {item.price.toLocaleString()}</p>
                       </div>
                       <button onClick={() => removeFromCart(idx)} className="text-red-400 hover:text-red-600 self-start p-1">
                          <Trash2 size={18} />
                       </button>
                    </div>
                  ))
                )}
             </div>

             {cart.length > 0 && (
               <div className="p-6 border-t border-slate-100 bg-slate-50">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-slate-500 font-medium">{isId ? 'Total Harga' : 'Total Price'}</span>
                    <span className="text-2xl font-bold text-slate-900">Rp {cartTotal.toLocaleString()}</span>
                  </div>
                  <button 
                    onClick={openCheckout}
                    className="w-full py-3.5 bg-agri-600 text-white rounded-xl font-bold hover:bg-agri-700 transition-all shadow-lg shadow-agri-200"
                  >
                    {isId ? 'Lanjut ke Pembayaran' : 'Proceed to Checkout'}
                  </button>
               </div>
             )}
          </div>
        </div>
      )}

      {/* MULTI-STEP CHECKOUT MODAL */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCheckoutOpen(false)}></div>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl relative animate-scale-up overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-auto md:max-h-[90vh]">
             
             {/* LEFT SIDE: Order Summary (Visible on Steps 1 & 2) */}
             {(checkoutStep === 1 || checkoutStep === 2) && (
               <div className="hidden md:block w-1/3 bg-slate-50 p-6 border-r border-slate-200 overflow-y-auto">
                 <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                   <ShoppingBag size={20} /> {isId ? 'Ringkasan Pesanan' : 'Order Summary'}
                 </h3>
                 <div className="space-y-4 mb-6">
                   {cart.map((item, idx) => (
                     <div key={idx} className="flex gap-3">
                       <div className="w-12 h-12 bg-white rounded border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <ShoppingBag size={16} className="text-slate-400"/>}
                       </div>
                       <div>
                         <p className="text-sm font-medium text-slate-800 line-clamp-2">{item.name}</p>
                         <p className="text-xs text-slate-500">1 x Rp {item.price.toLocaleString()}</p>
                       </div>
                     </div>
                   ))}
                 </div>
                 
                 <div className="border-t border-slate-200 pt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Subtotal Produk</span>
                      <span className="font-medium">Rp {cartTotal.toLocaleString()}</span>
                    </div>
                    {isQurbanOrder ? (
                        qurbanServiceType === 'CUSTODY' ? (
                            <div className="flex justify-between text-orange-600">
                                <span className="font-medium">Biaya Pakan</span>
                                <span className="font-bold">Rp {qurbanFee.toLocaleString()}</span>
                            </div>
                        ) : (
                            <div className="flex justify-between">
                                <span className="text-slate-600">Ongkir ({TAXI_FARM.name})</span>
                                <span className="font-medium">Rp {TAXI_FARM.price.toLocaleString()}</span>
                            </div>
                        )
                    ) : (
                       <div className="flex justify-between">
                          <span className="text-slate-600">Ongkos Kirim ({isInvestmentOrder ? 'Digital' : selectedCourier.name})</span>
                          <span className="font-medium">Rp {currentShippingCost.toLocaleString()}</span>
                       </div>
                    )}
                    
                    <div className="flex justify-between pt-2 border-t border-slate-200 text-lg font-bold text-agri-700">
                      <span>Total Bayar</span>
                      <span>Rp {finalTotal.toLocaleString()}</span>
                    </div>
                 </div>
               </div>
             )}

             {/* RIGHT SIDE: Steps Logic */}
             <div className={`${checkoutStep === 3 ? 'w-full' : 'w-full md:w-2/3'} flex flex-col h-full`}>
               {/* Modal Header */}
               <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                 <h3 className="font-bold text-lg text-slate-800">
                    {checkoutStep === 1 && (isId ? 'Informasi Pengiriman' : 'Shipping Information')}
                    {checkoutStep === 2 && (isId ? 'Metode Pembayaran' : 'Payment Method')}
                    {checkoutStep === 3 && (isId ? 'Pesanan Berhasil' : 'Order Success')}
                 </h3>
                 {checkoutStep < 3 && (
                   <button onClick={() => setIsCheckoutOpen(false)} className="text-slate-400 hover:text-slate-600">
                     <X size={20} />
                   </button>
                 )}
               </div>

               {/* Content Area */}
               <div className="flex-1 overflow-y-auto p-6">
                 {/* Mobile Order Summary Toggle */}
                 <div className="md:hidden mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-center font-bold text-slate-800">
                       <span className="flex items-center gap-2"><ShoppingBag size={18}/> Total ({cart.length} items)</span>
                       <span>Rp {finalTotal.toLocaleString()}</span>
                    </div>
                 </div>

                 {/* STEP 1: Shipping Info */}
                 {checkoutStep === 1 && (
                   <div className="space-y-6 animate-fade-in">
                      {/* Qurban Service Option */}
                      {isQurbanOrder && (
                          <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-700 mb-3">{isId ? 'Pilih Layanan Qurban' : 'Select Qurban Service'}</label>
                            <div className="grid grid-cols-2 gap-4">
                              <button 
                                 onClick={() => setQurbanServiceType('SHIPPED')}
                                 className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${qurbanServiceType === 'SHIPPED' ? 'border-agri-600 bg-agri-50 text-agri-700' : 'border-slate-200 hover:border-slate-300'}`}
                              >
                                <Truck size={24} />
                                <span className="font-bold text-sm text-center">{isId ? 'Kirim ke Rumah' : 'Ship to Home'}</span>
                              </button>
                              <button 
                                 onClick={() => setQurbanServiceType('CUSTODY')}
                                 className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${qurbanServiceType === 'CUSTODY' ? 'border-agri-600 bg-agri-50 text-agri-700' : 'border-slate-200 hover:border-slate-300'}`}
                              >
                                <HandHeart size={24} />
                                <span className="font-bold text-sm text-center">{isId ? 'Titip & Disalurkan' : 'Custody & Donate'}</span>
                              </button>
                            </div>
                            {qurbanServiceType === 'CUSTODY' && (
                              <div className="mt-3 p-3 bg-blue-50 text-blue-700 text-sm rounded-lg flex items-start gap-2 border border-blue-100">
                                 <Info size={16} className="mt-0.5 shrink-0" />
                                 <span>{isId ? 'Biaya perawatan dan pakan ' : 'Care and feed fee of '} <strong>Rp 50.000</strong> {isId ? 'ditambahkan. Hewan akan disembelih dan disalurkan oleh Ali Farm.' : 'added. Animal will be managed by Ali Farm.'}</span>
                              </div>
                            )}
                          </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">{isId ? 'Nama Lengkap' : 'Full Name'}</label>
                          <input 
                            type="text" 
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-agri-500 outline-none"
                            placeholder="John Doe"
                            value={customer.name}
                            onChange={(e) => setCustomer({...customer, name: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">{isId ? 'No. WhatsApp' : 'WhatsApp Number'}</label>
                          <input 
                            type="tel" 
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-agri-500 outline-none"
                            placeholder="0812..."
                            value={customer.phone}
                            onChange={(e) => setCustomer({...customer, phone: e.target.value})}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">{isId ? 'Alamat Lengkap' : 'Full Address'}</label>
                        <textarea 
                           className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-agri-500 outline-none"
                           rows={3}
                           placeholder={isId ? "Jalan, No Rumah, Kecamatan, Kota..." : "Street, House No, District, City..."}
                           value={customer.address}
                           onChange={(e) => setCustomer({...customer, address: e.target.value})}
                        ></textarea>
                      </div>

                      {/* Qurban Logistics: Show TaxiFarm & Date Selection */}
                      {(isQurbanOrder && qurbanServiceType === 'SHIPPED') ? (
                          <div className="animate-fade-in">
                               <label className="block text-sm font-medium text-slate-700 mb-3">{isId ? 'Tanggal Pengiriman' : 'Delivery Date'}</label>
                               <div className="relative mb-4">
                                   <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                                   <input
                                      type="date"
                                      required
                                      className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-agri-500 outline-none"
                                      value={deliveryDate}
                                      onChange={(e) => setDeliveryDate(e.target.value)}
                                   />
                               </div>

                               <div className="p-4 rounded-xl border-2 border-agri-500 bg-agri-50 flex justify-between items-center">
                                     <div className="flex items-center gap-4">
                                        <div className="p-2 rounded-lg bg-white text-agri-600 shadow-sm">
                                           <Truck size={24} />
                                        </div>
                                        <div>
                                           <div className="flex items-center gap-2">
                                              <p className="font-bold text-slate-900">{TAXI_FARM.name}</p>
                                              <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{isId ? 'Diskon 50%' : '50% OFF'}</span>
                                           </div>
                                           <p className="text-xs text-slate-500">{isId ? 'Kurir Internal Ali Farm' : 'Ali Farm Internal Courier'}</p>
                                        </div>
                                     </div>
                                     <div className="text-right">
                                         <p className="text-xs text-slate-400 line-through">Rp {TAXI_FARM.originalPrice.toLocaleString()}</p>
                                         <p className="font-bold text-slate-800">Rp {TAXI_FARM.price.toLocaleString()}</p>
                                     </div>
                               </div>
                               <div className="mt-2 flex items-center gap-2 text-xs text-agri-700 font-medium">
                                   <CheckCircle size={12}/> {isId ? 'Otomatis terpilih untuk layanan Qurban.' : 'Automatically selected for Qurban service.'}
                               </div>
                          </div>
                      ) : (!isQurbanOrder && !isInvestmentOrder) && (
                          /* Normal Courier Selection for non-Qurban items */
                          <div>
                             <label className="block text-sm font-medium text-slate-700 mb-3">{isId ? 'Pilih Kurir' : 'Select Courier'}</label>
                             <div className="space-y-3">
                               {COURIERS.map((c) => (
                                 <div 
                                   key={c.id} 
                                   onClick={() => setSelectedCourier(c)}
                                   className={`p-4 rounded-xl border-2 cursor-pointer flex justify-between items-center transition-all ${
                                     selectedCourier.id === c.id 
                                     ? 'border-agri-500 bg-agri-50' 
                                     : 'border-slate-100 hover:border-slate-200'
                                   }`}
                                 >
                                    <div className="flex items-center gap-4">
                                       <div className={`p-2 rounded-lg ${selectedCourier.id === c.id ? 'bg-white text-agri-600' : 'bg-slate-100 text-slate-500'}`}>
                                          <Truck size={20} />
                                       </div>
                                       <div>
                                          <p className={`font-bold ${selectedCourier.id === c.id ? 'text-slate-900' : 'text-slate-700'}`}>{c.name}</p>
                                          <p className="text-xs text-slate-500">Estimasi {c.est}</p>
                                       </div>
                                    </div>
                                    <span className="font-bold text-slate-800">Rp {c.price.toLocaleString()}</span>
                                 </div>
                               ))}
                             </div>
                          </div>
                      )}
                      
                      {isInvestmentOrder && !isQurbanOrder && (
                          <div className="p-4 rounded-xl border-2 border-agri-500 bg-agri-50 flex items-center gap-4">
                              <div className="p-2 rounded-lg bg-white text-agri-600 shadow-sm">
                                  <ShieldCheck size={24} />
                              </div>
                              <div>
                                  <p className="font-bold text-slate-900">{isId ? 'Kontrak Digital' : 'Digital Contract'}</p>
                                  <p className="text-xs text-slate-500">{isId ? 'Dikirim via Email & WhatsApp' : 'Sent via Email & WhatsApp'}</p>
                              </div>
                          </div>
                      )}
                   </div>
                 )}

                 {/* STEP 2: Payment Method */}
                 {checkoutStep === 2 && (
                   <div className="space-y-6 animate-fade-in">
                      {/* Selected payment logic */}
                      {selectedPayment === 'qris' && (
                        <div className="bg-agri-50 border border-agri-200 rounded-xl p-6 text-center mb-6">
                           <div className="bg-white p-4 rounded-xl inline-block shadow-sm mb-4">
                              <QrCode size={150} className="text-slate-900"/>
                           </div>
                           <p className="font-bold text-slate-800 mb-1">Scan QRIS</p>
                           <p className="text-sm text-slate-500">Scan menggunakan GoPay, OVO, Dana, atau Mobile Banking</p>
                        </div>
                      )}

                      {selectedPayment === 'transfer' && (
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4 mb-6">
                            <div className="flex items-center gap-4 bg-white p-3 rounded-lg border border-slate-100">
                               <div className="w-12 h-8 bg-blue-900 rounded flex items-center justify-center text-white text-[10px] font-bold">BCA</div>
                               <div>
                                 <p className="text-sm font-bold text-slate-800">123-456-7890</p>
                                 <p className="text-xs text-slate-500">a.n Ali Farm Indonesia</p>
                               </div>
                               <button className="ml-auto text-slate-400 w-8 h-8 flex items-center justify-center hover:text-agri-600 hover:bg-slate-50 rounded-full">
                                  <Copy size={16} />
                               </button>
                            </div>
                            <div className="flex items-center gap-4 bg-white p-3 rounded-lg border border-slate-100">
                               <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-[10px] font-bold">MANDIRI</div>
                               <div>
                                 <p className="text-sm font-bold text-slate-800">123-000-987-654</p>
                                 <p className="text-xs text-slate-500">a.n PT Ali Farm</p>
                               </div>
                               <button className="ml-auto text-slate-400 w-8 h-8 flex items-center justify-center hover:text-agri-600 hover:bg-slate-50 rounded-full">
                                  <Copy size={16} />
                               </button>
                            </div>
                            <div className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                              <Info size={12}/> Silahkan transfer sesuai nominal total ke salah satu rekening di atas.
                            </div>
                          </div>
                      )}

                      <div className="space-y-3">
                         {PAYMENT_METHODS.map((pm) => (
                            <div 
                              key={pm.id}
                              onClick={() => setSelectedPayment(pm.id)}
                              className={`p-4 rounded-xl border-2 cursor-pointer flex items-center gap-4 transition-all ${
                                selectedPayment === pm.id
                                ? 'border-agri-500 bg-white shadow-md'
                                : 'border-slate-100 hover:border-slate-200'
                              }`}
                            >
                               <div className={`p-3 rounded-full ${selectedPayment === pm.id ? 'bg-agri-100 text-agri-600' : 'bg-slate-100 text-slate-500'}`}>
                                  <pm.icon size={20} />
                               </div>
                               <div className="flex-1">
                                  <p className="font-bold text-slate-800">{pm.name}</p>
                                  <p className="text-xs text-slate-500">{pm.description}</p>
                               </div>
                               {selectedPayment === pm.id && <CheckCircle className="text-agri-600" size={20} />}
                            </div>
                         ))}
                      </div>
                   </div>
                 )}

                 {/* STEP 3: Success */}
                 {checkoutStep === 3 && (
                   <div className="flex flex-col items-center justify-center h-full py-10 animate-scale-up text-center">
                      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600 shadow-xl shadow-green-100">
                         <ShieldCheck size={48} strokeWidth={2.5} />
                      </div>
                      <h2 className="text-3xl font-bold text-slate-900 mb-2">{isId ? 'Terima Kasih!' : 'Thank You!'}</h2>
                      <p className="text-slate-500 max-w-md mx-auto mb-8">
                        {isId 
                        ? 'Pesanan Anda telah kami terima. Konfirmasi dan resi pengiriman akan dikirimkan melalui WhatsApp ke nomor Anda.' 
                        : 'Your order has been received. Confirmation and shipping receipt will be sent via WhatsApp to your number.'}
                      </p>
                      
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 w-full max-w-xs mb-8">
                         <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-2">{isId ? 'ID PESANAN' : 'ORDER ID'}</p>
                         <p className="text-3xl font-mono font-bold text-slate-800 tracking-wider">{orderId}</p>
                      </div>

                      <button 
                        onClick={handleFinalizeWhatsApp}
                        className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-green-200 hover:scale-105 transition-all flex items-center gap-2"
                      >
                         <Smartphone size={20} /> {isId ? 'Konfirmasi ke Admin' : 'Confirm to Admin'}
                      </button>
                   </div>
                 )}
               </div>

               {/* Footer Buttons (Hidden on Step 3) */}
               {checkoutStep < 3 && (
                 <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center gap-4">
                    {checkoutStep === 1 ? (
                      <button onClick={() => setIsCheckoutOpen(false)} className="px-6 py-3 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-white transition-colors">
                        {isId ? 'Batal' : 'Cancel'}
                      </button>
                    ) : (
                      <button onClick={() => setCheckoutStep(1)} className="px-6 py-3 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-white transition-colors flex items-center gap-2">
                        <ChevronLeft size={18}/> {isId ? 'Kembali' : 'Back'}
                      </button>
                    )}
                    
                    <button 
                      onClick={handleNextStep}
                      className="flex-1 px-6 py-3 bg-agri-600 text-white rounded-xl font-bold hover:bg-agri-700 shadow-lg shadow-agri-200 transition-all flex items-center justify-center gap-2"
                    >
                      {checkoutStep === 1 ? (isId ? 'Lanjut Pembayaran' : 'Proceed to Payment') : (isId ? 'Konfirmasi Pesanan' : 'Confirm Order')} <ArrowRight size={18} />
                    </button>
                 </div>
               )}
             </div>
          </div>
        </div>
      )}

      {/* Modern Hero Section */}
      <section className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
        {/* Cinematic Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-slate-900/90 z-10" />
          <img
            src="https://images.unsplash.com/photo-1511117833895-4b473c0b85d6?auto=format&fit=crop&q=80&w=2000"
            alt="Farm Background"
            className="w-full h-full object-cover animate-scale-slow transform scale-105"
          />
        </div>

        <div className="relative z-20 container mx-auto px-4 pt-32 md:pt-20 text-center">
           <div className="animate-fade-in-up space-y-8 max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full text-white/90 text-sm font-medium mx-auto hover:bg-white/20 transition-colors cursor-pointer">
                 <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                 </span>
                 {isId ? 'Batch Investasi #14 Dibuka' : 'Investment Batch #14 Open Now'} <ArrowRight size={14} />
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white tracking-tight leading-[1.1] md:leading-[1.1]">
                {isId ? 'Investasi Ternak' : 'Smart Livestock'}
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-emerald-400 to-teal-400">
                  {isId ? 'Era Digital' : 'Digital Era'}
                </span>
              </h1>

              <p className="text-base md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed px-4">
                {isId 
                  ? 'Platform investasi domba modern dengan transparansi CCTV 24/7 dan bagi hasil yang syariah. Mulai bangun aset masa depan Anda hari ini.'
                  : 'Modern sheep investment platform with 24/7 CCTV transparency and sharia-compliant profit sharing. Start building your future assets today.'
                }
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 px-4">
                 <button onClick={(e) => scrollToSection(e, '#investments')} className="w-full sm:w-auto px-8 py-4 bg-agri-600 hover:bg-agri-500 text-white rounded-full font-bold transition-all hover:scale-105 shadow-[0_0_40px_-10px_rgba(34,197,94,0.6)] flex items-center justify-center gap-2 cursor-pointer">
                    {isId ? 'Mulai Sekarang' : 'Start Now'} <ArrowRight size={20} />
                 </button>
              </div>
           </div>

           {/* Floating Glass Stats */}
           <div className="mt-16 md:mt-20 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-5xl mx-auto animate-fade-in-up px-2" style={{animationDelay: '0.2s'}}>
              {[
                { label: isId ? 'Total Domba' : 'Total Sheep', val: '1,250+', icon: Leaf },
                { label: isId ? 'Investor' : 'Investors', val: '500+', icon: Users },
                { label: 'ROI (2023)', val: '18-25%', icon: TrendingUp },
                { label: isId ? 'Pengalaman' : 'Experience', val: '8 Years', icon: Star },
              ].map((stat, idx) => (
                <div key={idx} className="bg-white/5 backdrop-blur-md border border-white/10 p-3 md:p-4 rounded-2xl text-left hover:bg-white/10 transition-colors group">
                   <div className="flex items-center justify-between mb-2">
                      <stat.icon className="text-green-400 group-hover:scale-110 transition-transform" size={20} />
                   </div>
                   <p className="text-xl md:text-2xl font-bold text-white">{stat.val}</p>
                   <p className="text-[10px] md:text-xs text-slate-400 uppercase tracking-wider font-medium">{stat.label}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Trusted By - Clean Strip */}
      <section className="py-12 bg-white border-b border-slate-100">
         <div className="container mx-auto px-4 text-center">
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-8">
              {isId ? 'Dipercaya oleh Partner Terbaik' : 'Trusted by Top Partners'}
            </p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
               <span className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2"><Globe className="text-blue-600" /> AgriAsia</span>
               <span className="text-xl md:text-2xl font-bold text-slate-800">Farm<span className="text-green-600">Daily</span></span>
               <span className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2"><ShieldCheck className="text-green-600"/> ShariaVest</span>
               <span className="text-xl md:text-2xl font-bold text-slate-800">Invest<span className="font-light">Now</span></span>
            </div>
         </div>
      </section>

       {/* NEW SECTION: Investment Packages - Single Focus Layout with Dynamic Benefits Stack */}
       {config.features.investment && (
         <section id="investments" className="py-24 bg-white scroll-mt-20">
           <div className="container mx-auto px-4">
              <div className="text-center max-w-3xl mx-auto mb-16">
                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-sm font-medium border border-blue-200 mb-6">
                     <TrendingUp size={14} /> {isId ? 'Peluang Investasi' : 'Investment Opportunities'}
                 </div>
                 <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
                   {isId ? 'Tumbuh Bersama Kami' : 'Grow With Us'}
                 </h2>
                 <p className="text-lg text-slate-500">
                   {isId ? 'Pilih paket kemitraan yang sesuai dengan profil risiko dan tujuan finansial Anda.' : 'Choose a partnership package that fits your risk profile and financial goals.'}
                 </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
                 
                 {/* Left: The Card (Focus) */}
                 <div className="w-full flex justify-center lg:justify-end lg:pr-10">
                     {MOCK_PACKAGES.slice(0, 1).map((pkg) => (
                        <div key={pkg.id} className="w-full max-w-md bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-2xl shadow-blue-100 hover:shadow-blue-200 transition-all duration-300 relative overflow-hidden group">
                           {/* Card Decorative Elements */}
                           <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-60"></div>
                           <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-100 to-transparent rounded-bl-[100px] -mr-8 -mt-8"></div>
                           
                           <div className="relative z-10 mb-8">
                              <span className="inline-block px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold tracking-wider uppercase mb-5">{pkg.type}</span>
                              <h3 className="text-3xl font-bold text-slate-900 mb-2 leading-tight">{pkg.name}</h3>
                              <div className="flex items-baseline gap-1 mb-2">
                                 <span className="text-sm text-slate-500 font-medium">Rp</span>
                                 <span className="text-4xl font-bold text-slate-900 tracking-tight">{pkg.pricePerUnit.toLocaleString()}</span>
                              </div>
                              <span className="text-sm text-slate-400">per {isId ? 'ekor / paket' : 'head / package'}</span>
                           </div>

                           <div className="space-y-4 mb-8 flex-1 relative z-10">
                              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                 <div className="flex items-center gap-3 text-slate-600">
                                    <div className="p-2 bg-white rounded-lg shadow-sm text-blue-500"><Calendar size={20}/></div>
                                    <span className="font-medium">{isId ? 'Durasi Kontrak' : 'Contract Duration'}</span>
                                 </div>
                                 <span className="font-bold text-slate-900">{pkg.durationMonths} {isId ? 'Bulan' : 'Months'}</span>
                              </div>
                              <div className="flex items-center justify-between p-4 bg-green-50 rounded-2xl border border-green-100">
                                 <div className="flex items-center gap-3 text-slate-600">
                                    <div className="p-2 bg-white rounded-lg shadow-sm text-green-500"><TrendingUp size={20}/></div>
                                    <span className="font-medium">{isId ? 'Sistem Profit' : 'Profit System'}</span>
                                 </div>
                                 <span className="font-bold text-green-700">{isId ? 'Bagi Hasil' : 'Profit Sharing'}</span>
                              </div>
                           </div>
                           
                           <p className="text-slate-500 text-sm leading-relaxed mb-8 relative z-10">
                             {isId 
                               ? 'Investasi breeding domba dengan transparansi penuh. Kami yang merawat, Anda yang menikmati hasilnya.' 
                               : 'Sheep breeding investment with full transparency. We care for them, you enjoy the results.'}
                           </p>

                           <button 
                              onClick={() => addToCart({ id: pkg.id, name: `Investasi ${pkg.name}`, price: pkg.pricePerUnit, type: 'Investment' })}
                              className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 relative z-10 shadow-lg group-hover:translate-y-[-2px]"
                           >
                              {isId ? 'Ambil Paket Ini' : 'Take This Package'} <ArrowRight size={18} />
                           </button>
                           
                           <div className="mt-6 text-center">
                              <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
                                 <Clock size={12} /> {isId ? 'Slot terbatas untuk Batch #14' : 'Limited slots for Batch #14'}
                              </p>
                           </div>
                        </div>
                     ))}
                 </div>

                 {/* Right: Detailed Info & Benefits (Dynamic Stack) */}
                 <div className="w-full flex flex-col justify-center space-y-8">
                    <div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                           <Star className="text-yellow-500 fill-yellow-500" /> 
                           {isId ? 'Keuntungan Eksklusif' : 'Exclusive Benefits'}
                        </h3>
                        <p className="text-slate-500 leading-relaxed mb-6">
                           {isId 
                             ? 'Dapatkan passive income dari sektor riil peternakan tanpa repot. Kami mengelola seluruh proses dari hulu ke hilir dengan standar profesional.' 
                             : 'Earn passive income from the real livestock sector without the hassle. We manage the entire process professionally.'}
                        </p>
                    </div>

                    {/* Dynamic Stacked Benefits */}
                    <div className="relative h-64 w-full"> 
                      {BENEFITS.map((benefit, i) => {
                         const position = (i - activeBenefitIndex + BENEFITS.length) % BENEFITS.length;
                         
                         let stackClass = "opacity-0 scale-90 translate-y-8 z-0 pointer-events-none"; // Default hidden
                         
                         if (position === 0) {
                             stackClass = "opacity-100 scale-100 translate-y-0 z-30 shadow-xl border-agri-200 bg-white";
                         } else if (position === 1) {
                             stackClass = "opacity-60 scale-95 translate-y-3 z-20 shadow-lg bg-slate-50 border-slate-200";
                         } else if (position === 2) {
                             stackClass = "opacity-30 scale-90 translate-y-6 z-10 shadow-sm bg-slate-100 border-slate-200";
                         } else if (position > 2) {
                             // Keep them slightly visible/hidden but correctly ordered in DOM for transition
                             stackClass = "opacity-0 scale-90 translate-y-8 z-0 pointer-events-none";
                         }

                         return (
                           <div 
                             key={benefit.id}
                             onClick={() => setActiveBenefitIndex((prev) => (prev + 1) % BENEFITS.length)}
                             className={`absolute inset-0 rounded-2xl border p-6 flex flex-col justify-center transition-all duration-700 ease-in-out cursor-pointer ${stackClass}`}
                           >
                              <div className="flex items-start gap-4">
                                   <div className={`p-3 rounded-xl transition-colors ${position === 0 ? 'bg-agri-100 text-agri-600' : 'bg-slate-200 text-slate-500'}`}>
                                      <benefit.icon size={28} />
                                   </div>
                                   <div className="flex-1">
                                      <h4 className={`font-bold text-lg mb-2 transition-colors ${position === 0 ? 'text-slate-900' : 'text-slate-700'}`}>{benefit.text}</h4>
                                      <p className="text-sm text-slate-500 leading-relaxed">{benefit.desc}</p>
                                   </div>
                              </div>
                           </div>
                         )
                      })}
                    </div>
                    
                    {/* Indicators */}
                    <div className="flex justify-center gap-2 mt-2">
                       {BENEFITS.map((_, i) => (
                         <button 
                           key={i} 
                           onClick={() => setActiveBenefitIndex(i)}
                           className={`h-1.5 rounded-full transition-all duration-300 ${i === activeBenefitIndex ? 'w-8 bg-agri-500' : 'w-2 bg-slate-200 hover:bg-slate-300'}`} 
                         />
                       ))}
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100 mt-2">
                       <div className="flex items-start gap-4">
                          <div className="p-3 bg-white rounded-xl shadow-sm text-blue-600">
                             <Calculator size={24} />
                          </div>
                          <div>
                             <h4 className="font-bold text-slate-900 mb-1">{isId ? 'Simulasi Keuntungan' : 'Profit Simulation'}</h4>
                             <p className="text-sm text-slate-600 mb-3">
                                {isId ? 'Estimasi bagi hasil setelah 3 tahun (3x Panen):' : 'Estimated profit share after 3 years (3 Harvests):'}
                             </p>
                             <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-green-600">+ Rp 2.025.000</span>
                                <span className="text-xs text-slate-400 font-medium">({isId ? 'Estimasi 45%' : 'Est. 45%'})</span>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>

              </div>
           </div>
         </section>
       )}

      {/* How It Works - Bento Grid */}
      <section id="how-it-works" className="py-24 bg-slate-50 scroll-mt-20">
         <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
               <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
                 {isId ? 'Mudah & Transparan' : 'Simple & Transparent'}
               </h2>
               <p className="text-lg text-slate-500">
                 {isId ? 'Teknologi kami memudahkan Anda memantau aset dari mana saja.' : 'Our technology makes it easy to monitor assets from anywhere.'}
               </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
               <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
                     <Smartphone size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{isId ? '1. Pilih Paket' : '1. Select Package'}</h3>
                  <p className="text-slate-500 leading-relaxed">
                    {isId ? 'Pilih paket investasi yang sesuai dengan budget dan target finansial Anda.' : 'Choose an investment package that fits your budget and financial goals.'}
                  </p>
               </div>
               
               <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 md:scale-105 z-10 relative ring-4 ring-slate-50">
                  <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-6 text-green-600">
                     <Play size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{isId ? '2. Pantau Live' : '2. Monitor Live'}</h3>
                  <p className="text-slate-500 leading-relaxed">
                    {isId ? 'Akses CCTV 24/7 dan laporan kesehatan rutin melalui dashboard investor.' : 'Access 24/7 CCTV and routine health reports via the investor dashboard.'}
                  </p>
               </div>

               <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mb-6 text-orange-600">
                     <TrendingUp size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{isId ? '3. Bagi Hasil' : '3. Profit Sharing'}</h3>
                  <p className="text-slate-500 leading-relaxed">
                    {isId ? 'Terima bagi hasil penjualan domba saat panen langsung ke rekening Anda.' : 'Receive profit sharing from sheep sales directly to your account at harvest.'}
                  </p>
               </div>
            </div>
         </div>
      </section>

      {/* Revamped Qurban Section (No Login Required) */}
      {config.features.qurban && (
        <section id="qurban" className="py-24 bg-slate-900 text-white overflow-hidden relative scroll-mt-20">
           {/* Background Decoration */}
           <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-agri-600/30 to-blue-600/30 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
           <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-orange-500/20 to-amber-500/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4" />
           
           <div className="container mx-auto px-4 relative z-10">
              <div className="text-center max-w-3xl mx-auto mb-16">
                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-sm font-medium border border-orange-500/30 mb-6">
                     <Heart size={14} /> {isId ? 'Program Ibadah' : 'Worship Program'}
                 </div>
                 <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
                     Tabungan Qurban <br/>
                     <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-200">
                        {isId ? 'Mudah & Amanah' : 'Easy & Trusted'}
                     </span>
                 </h2>
                 <p className="text-lg text-slate-400">
                     {isId 
                       ? 'Siapkan hewan Qurban terbaik Anda mulai hari ini. Pilih paket, masukkan keranjang, dan konfirmasi via WhatsApp. Tanpa perlu login.'
                       : 'Prepare your best Qurban animal starting today. Choose a package, add to cart, and confirm via WhatsApp. No login required.'}
                 </p>
              </div>

              {/* Qurban Pricing Cards */}
              <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                 {QURBAN_PACKAGES.map((pkg) => (
                   <div key={pkg.id} className={`relative bg-slate-800 rounded-3xl p-8 border hover:transform hover:-translate-y-2 transition-all duration-300 flex flex-col ${pkg.recommended ? 'border-agri-500 shadow-2xl shadow-agri-900/50 scale-105 z-10' : 'border-slate-700 shadow-xl'}`}>
                      {pkg.recommended && (
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-agri-500 to-green-400 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                          {isId ? 'Paling Laris' : 'Best Seller'}
                        </div>
                      )}
                      
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${pkg.color} flex items-center justify-center text-white mb-6 shadow-lg`}>
                         <Star size={24} fill="currentColor" className="text-white/80" />
                      </div>

                      <h3 className="text-2xl font-bold text-white mb-6">{pkg.name}</h3>

                      <div className="space-y-4 mb-8 flex-1">
                         <div className="flex items-center gap-3 text-slate-300">
                            <div className="p-1 rounded-full bg-white/10"><CheckCircle size={14} /></div>
                            <span>Bobot: <strong>{pkg.weight}</strong></span>
                         </div>
                         <div className="flex items-center gap-3 text-slate-300">
                            <div className="p-1 rounded-full bg-white/10"><Calendar size={14} /></div>
                            <span>Tabungan: Rp {pkg.monthly.toLocaleString()}/bln</span>
                         </div>
                         <div className="flex items-start gap-3 text-slate-300">
                            <div className="p-1 rounded-full bg-white/10 mt-1"><Info size={14} /></div>
                            <span className="text-sm leading-relaxed text-slate-400">{pkg.desc}</span>
                         </div>
                      </div>

                      <div className="mt-auto pt-6 border-t border-white/10 flex justify-between items-center">
                          <div>
                              <span className="text-sm text-slate-400 line-through decoration-red-500 decoration-2">Rp {(pkg.price * 1.1).toLocaleString()}</span>
                              <div className="text-2xl font-bold text-white tracking-tight">Rp {pkg.price.toLocaleString()}</div>
                          </div>
                          <button 
                             onClick={() => addToCart({ id: `Q-${pkg.id}`, name: `Qurban ${pkg.name}`, price: pkg.price, type: 'Qurban' })}
                             className="w-12 h-12 rounded-full bg-cyan-500 hover:bg-cyan-400 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30 transition-all hover:scale-110 active:scale-95"
                          >
                              <ShoppingBag size={24} />
                          </button>
                      </div>
                   </div>
                 ))}
              </div>

              <div className="mt-12 text-center">
                 <p className="text-slate-500 text-sm flex items-center justify-center gap-2">
                    <ShieldCheck size={16} /> 
                    {isId ? 'Transaksi aman & syariah. Hewan dipelihara profesional hingga Idul Adha.' : 'Safe & sharia transaction. Animals raised professionally until Eid al-Adha.'}
                 </p>
              </div>
           </div>
        </section>
      )}

      {/* Marketplace Preview */}
      {config.features.marketplace && (
        <section id="marketplace" className="py-24 bg-white scroll-mt-20">
           <div className="container mx-auto px-4">
              <div className="flex justify-between items-end mb-12">
                 <div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">{isId ? 'Marketplace' : 'Marketplace'}</h2>
                    <p className="text-slate-500">{isId ? 'Bibit & Pakan Kualitas Terbaik' : 'Best Quality Breeds & Feed'}</p>
                 </div>
                 <button onClick={onLogin} className="hidden sm:flex items-center gap-2 text-agri-600 font-semibold hover:text-agri-700 cursor-pointer">
                    {isId ? 'Lihat Semua' : 'View All'} <ArrowRight size={18} />
                 </button>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                 {MOCK_PRODUCTS.slice(0, 3).map((product) => (
                    <div key={product.id} className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer" onClick={() => addToCart({ id: product.id, name: product.name, price: product.price, type: 'Product', image: product.imageUrl })}>
                       <div className="h-64 overflow-hidden relative bg-slate-100">
                          <img 
                             src={product.imageUrl} 
                             alt={product.name} 
                             className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                          />
                          <div className="absolute top-4 left-4">
                             <span className="bg-white/90 backdrop-blur text-slate-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                {product.category}
                             </span>
                          </div>
                       </div>
                       <div className="p-6 flex flex-col h-full">
                          <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-agri-600 transition-colors">{product.name}</h3>
                          <p className="text-slate-500 text-sm mb-4 line-clamp-2">{product.description}</p>
                          
                          <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                             <div>
                                  <div className="text-xs text-slate-400 line-through decoration-red-400">Rp {(product.price * 1.15).toLocaleString()}</div>
                                  <div className="text-lg font-bold text-slate-900">Rp {product.price.toLocaleString()}</div>
                             </div>
                             <button 
                               onClick={(e) => {
                                   e.stopPropagation();
                                   addToCart({ id: product.id, name: product.name, price: product.price, type: 'Product', image: product.imageUrl })
                               }}
                               className="w-10 h-10 rounded-full bg-cyan-500 hover:bg-cyan-600 text-white flex items-center justify-center shadow-md hover:shadow-cyan-200 hover:scale-110 transition-all active:scale-95"
                             >
                                <ShoppingBag size={20} />
                             </button>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
              
              <button onClick={onLogin} className="sm:hidden w-full mt-8 py-3 border border-slate-200 rounded-xl font-semibold text-slate-700 cursor-pointer">
                 {isId ? 'Lihat Semua Produk' : 'View All Products'}
              </button>
           </div>
        </section>
      )}

      {/* Footer */}
      <footer id="about" className="bg-slate-50 border-t border-slate-200 py-12 scroll-mt-20">
         <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
               <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-agri-600 rounded-lg flex items-center justify-center text-white">
                     <Sprout size={18} />
                  </div>
                  <span className="text-xl font-bold text-slate-900">Ali Farm</span>
               </div>
               <div className="flex gap-8 text-sm font-medium text-slate-500">
                  <a href="#" className="hover:text-agri-600 transition-colors">{isId ? 'Kebijakan Privasi' : 'Privacy Policy'}</a>
                  <a href="#" className="hover:text-agri-600 transition-colors">{isId ? 'Syarat & Ketentuan' : 'Terms of Service'}</a>
                  <a href="#" className="hover:text-agri-600 transition-colors">{isId ? 'Bantuan' : 'Help Center'}</a>
               </div>
               <p className="text-sm text-slate-400">© 2024 Ali Farm. Jember, Indonesia.</p>
            </div>
         </div>
      </footer>
    </div>
  );
};