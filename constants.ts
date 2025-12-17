import { Role, Sheep, SheepStatus, Cage, InvestmentPackage, MarketProduct, User } from './types';

// Seed Data
export const MOCK_SHEEP: Sheep[] = [
  {
    id: '1',
    tagId: 'AF-001',
    breed: 'Merino',
    dob: '2023-01-15',
    gender: 'Male',
    status: SheepStatus.HEALTHY,
    cageId: 'CAGE-A',
    imageUrl: 'https://images.unsplash.com/photo-1484557985045-6f550bb38a96?auto=format&fit=crop&q=80&w=400',
    weightHistory: [
      { date: '2023-02-01', weight: 15 },
      { date: '2023-03-01', weight: 22 },
      { date: '2023-04-01', weight: 30 },
      { date: '2023-05-01', weight: 38 },
      { date: '2023-06-01', weight: 45 },
    ],
    marketValue: 2500000
  },
  {
    id: '2',
    tagId: 'AF-002',
    breed: 'Dorper',
    dob: '2023-02-10',
    gender: 'Female',
    status: SheepStatus.HEALTHY,
    cageId: 'CAGE-A',
    imageUrl: 'https://images.unsplash.com/photo-1511117833895-4b473c0b85d6?auto=format&fit=crop&q=80&w=400',
    weightHistory: [
      { date: '2023-03-01', weight: 12 },
      { date: '2023-04-01', weight: 18 },
      { date: '2023-05-01', weight: 25 },
      { date: '2023-06-01', weight: 32 },
    ],
    marketValue: 2200000
  },
  {
    id: '3',
    tagId: 'AF-003',
    breed: 'Garut',
    dob: '2023-03-05',
    gender: 'Male',
    status: SheepStatus.SICK,
    cageId: 'CAGE-B',
    imageUrl: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&q=80&w=400',
    weightHistory: [
      { date: '2023-04-01', weight: 14 },
      { date: '2023-05-01', weight: 19 },
      { date: '2023-06-01', weight: 21 }, // Slow growth due to sickness
    ],
    marketValue: 1800000,
    notes: 'Respiratory infection, under treatment.'
  },
  {
    id: '4',
    tagId: 'AF-004',
    breed: 'Suffolk',
    dob: '2022-11-20',
    gender: 'Female',
    status: SheepStatus.HEALTHY,
    cageId: 'CAGE-C',
    imageUrl: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&q=80&w=400',
    weightHistory: [
      { date: '2023-01-01', weight: 20 },
      { date: '2023-03-01', weight: 35 },
      { date: '2023-05-01', weight: 50 },
    ],
    marketValue: 3500000
  }
];

export const MOCK_CAGES: Cage[] = [
  { id: 'CAGE-A', name: 'Alpha Block', capacity: 20, occupied: 15, cctvUrl: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&q=80&w=800' },
  { id: 'CAGE-B', name: 'Beta Block (Quarantine)', capacity: 5, occupied: 1, cctvUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=800' },
  { id: 'CAGE-C', name: 'Charlie Block', capacity: 30, occupied: 28, cctvUrl: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&q=80&w=800' },
];

export const MOCK_PACKAGES: InvestmentPackage[] = [
  { 
    id: 'PKG-1', 
    name: 'Paket Breeding Exclusive', 
    description: 'Investasi breeding domba (1 Ekor) dengan sistem bagi hasil syariah. Termasuk perawatan, pakan, dan asuransi kematian.', 
    pricePerUnit: 4500000, 
    durationMonths: 36, // 3 Years (Standard breeding contract)
    estimatedRoi: 45, // approx 15% per year
    type: 'Single' 
  }
];

export const MOCK_PRODUCTS: MarketProduct[] = [
  { id: 'PROD-1', name: 'Premium Alfalfa Hay', category: 'Feed', price: 150000, stock: 50, description: 'High protein hay for rapid growth.', imageUrl: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&q=80&w=200' },
  { id: 'PROD-2', name: 'Mineral Block Lick', category: 'Feed', price: 45000, stock: 100, description: 'Essential minerals for sheep health.', imageUrl: 'https://plus.unsplash.com/premium_photo-1661962692059-55d5a4319814?auto=format&fit=crop&q=80&w=200' },
  { id: 'PROD-3', name: 'Merino Ram (Breeder)', category: 'Sheep', price: 4500000, stock: 2, description: 'Top quality genetics for breeding.', imageUrl: 'https://images.unsplash.com/photo-1511117833895-4b473c0b85d6?auto=format&fit=crop&q=80&w=200' },
];

export const CURRENT_USER: User = {
  id: 'USER-1',
  name: 'Ali Investor',
  role: Role.INVESTOR, // Default role for demo, changable
  avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100',
  investments: [
    { id: 'INV-1', packageId: 'PKG-1', units: 1, purchaseDate: '2023-01-20', status: 'Active', currentValue: 4600000 }
  ],
  qurban: {
    id: 'Q-1',
    targetAmount: 3500000,
    currentAmount: 1200000,
    startDate: '2023-08-01',
    targetDate: '2024-06-15'
  }
};

export const TRANSLATIONS = {
  EN: {
    dashboard: 'Dashboard',
    sheep: 'Sheep Management',
    investments: 'Investments',
    marketplace: 'Marketplace',
    cctv: 'Live CCTV',
    qurban: 'Tabung Qurban',
    logout: 'Logout',
    welcome: 'Welcome back',
    totalAssets: 'Total Assets',
    activeSheep: 'Active Sheep',
    healthAlerts: 'Health Alerts',
    profit: 'Net Profit',
    viewAll: 'View All',
    search: 'Search...',
    buyNow: 'Buy via WhatsApp',
    growthChart: 'Growth Chart',
    askAi: 'Ask Farm AI'
  },
  ID: {
    dashboard: 'Dasbor',
    sheep: 'Manajemen Domba',
    investments: 'Investasi',
    marketplace: 'Pasar',
    cctv: 'CCTV Langsung',
    qurban: 'Tabung Qurban',
    logout: 'Keluar',
    welcome: 'Selamat datang kembali',
    totalAssets: 'Total Aset',
    activeSheep: 'Domba Aktif',
    healthAlerts: 'Peringatan Kesehatan',
    profit: 'Laba Bersih',
    viewAll: 'Lihat Semua',
    search: 'Cari...',
    buyNow: 'Beli via WhatsApp',
    growthChart: 'Grafik Pertumbuhan',
    askAi: 'Tanya AI Farm'
  }
};