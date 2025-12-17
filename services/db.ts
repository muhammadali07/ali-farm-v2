import { Sheep, UserInvestment, User, Role, SheepStatus, QurbanSaving, AppConfig } from '../types';
import { MOCK_SHEEP, CURRENT_USER, MOCK_PACKAGES } from '../constants';

// This service simulates a backend database using LocalStorage
// enabling full CRUD flows without a running Node.js server.

const STORAGE_KEYS = {
  SHEEP: 'alifarm_sheep',
  USER: 'alifarm_user',
  CONFIG: 'alifarm_config',
  INIT: 'alifarm_init'
};

const DEFAULT_CONFIG: AppConfig = {
  features: {
    investment: true,
    qurban: true,
    marketplace: true
  }
};

export const db = {
  init: () => {
    if (!localStorage.getItem(STORAGE_KEYS.INIT)) {
      localStorage.setItem(STORAGE_KEYS.SHEEP, JSON.stringify(MOCK_SHEEP));
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(CURRENT_USER));
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(DEFAULT_CONFIG));
      localStorage.setItem(STORAGE_KEYS.INIT, 'true');
    }
    // Ensure config exists for existing users
    if (!localStorage.getItem(STORAGE_KEYS.CONFIG)) {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(DEFAULT_CONFIG));
    }
  },

  // --- CONFIG ---
  getConfig: async (): Promise<AppConfig> => {
    const data = localStorage.getItem(STORAGE_KEYS.CONFIG);
    return data ? JSON.parse(data) : DEFAULT_CONFIG;
  },

  updateConfig: async (newConfig: AppConfig): Promise<void> => {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(newConfig));
  },

  // --- SHEEP CRUD ---
  getSheep: async (): Promise<Sheep[]> => {
    const data = localStorage.getItem(STORAGE_KEYS.SHEEP);
    return data ? JSON.parse(data) : [];
  },

  addSheep: async (sheep: Sheep): Promise<void> => {
    const current = await db.getSheep();
    const newSheep = { ...sheep, id: Math.random().toString(36).substr(2, 9) };
    localStorage.setItem(STORAGE_KEYS.SHEEP, JSON.stringify([...current, newSheep]));
  },

  updateSheep: async (updatedSheep: Sheep): Promise<void> => {
    const current = await db.getSheep();
    const index = current.findIndex(s => s.id === updatedSheep.id);
    if (index !== -1) {
      current[index] = updatedSheep;
      localStorage.setItem(STORAGE_KEYS.SHEEP, JSON.stringify(current));
    }
  },

  deleteSheep: async (id: string): Promise<void> => {
    const current = await db.getSheep();
    const filtered = current.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.SHEEP, JSON.stringify(filtered));
  },

  // --- USER / INVESTMENTS ---
  getUser: async (): Promise<User> => {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : CURRENT_USER;
  },

  addInvestment: async (packageId: string, units: number): Promise<void> => {
    const user = await db.getUser();
    const pkg = MOCK_PACKAGES.find(p => p.id === packageId);
    if (!pkg) return;

    const newInvestment: UserInvestment = {
      id: Math.random().toString(36).substr(2, 9),
      packageId,
      units,
      purchaseDate: new Date().toISOString().split('T')[0],
      status: 'Active',
      currentValue: pkg.pricePerUnit * units // Initial value
    };

    const updatedUser = {
      ...user,
      investments: [...(user.investments || []), newInvestment]
    };
    
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
  },
  
  updateQurban: async (amount: number): Promise<void> => {
     const user = await db.getUser();
     if(user.qurban) {
        const updatedUser = {
            ...user,
            qurban: {
                ...user.qurban,
                currentAmount: user.qurban.currentAmount + amount
            }
        };
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
     }
  }
};

// Initialize on load
if (typeof window !== 'undefined') {
  db.init();
}