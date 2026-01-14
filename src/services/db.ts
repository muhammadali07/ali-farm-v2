import { Sheep, User, Role, AppConfig, UserInvestment } from '../types';
import { MOCK_SHEEP, CURRENT_USER, MOCK_PACKAGES } from '../constants';

// --- Reusable Generic Collection Class ---
class Collection<T extends { id: string }> {
  private key: string;
  private prefix: string | null;

  constructor(key: string, prefix: string | null = null) {
    this.key = key;
    this.prefix = prefix;
  }

  private getAllSync(): T[] {
    const data = localStorage.getItem(this.key);
    return data ? JSON.parse(data) : [];
  }

  private saveAll(data: T[]) {
    localStorage.setItem(this.key, JSON.stringify(data));
  }

  // Generate Sequential ID if prefix is provided (e.g., AF-001)
  private generateNextId(all: T[]): string {
    if (!this.prefix) return Math.random().toString(36).substr(2, 9);
    
    const count = all.length + 1;
    const paddedNumber = count.toString().padStart(3, '0');
    return `${this.prefix}-${paddedNumber}`;
  }

  // Generic Create
  async create(item: Omit<T, 'id'>): Promise<T> {
    const all = this.getAllSync();
    const nextId = this.generateNextId(all);
    const newItem = { ...item, id: nextId } as T;
    
    this.saveAll([...all, newItem]);
    return newItem;
  }

  // Generic Read
  async find(query?: (item: T) => boolean): Promise<T[]> {
    const all = this.getAllSync();
    return query ? all.filter(query) : all;
  }

  async findOne(id: string): Promise<T | null> {
    const all = this.getAllSync();
    return all.find(i => i.id === id) || null;
  }

  // Generic Update
  async update(id: string, updates: Partial<T>): Promise<T | null> {
    const all = this.getAllSync();
    const index = all.findIndex(i => i.id === id);
    if (index === -1) return null;
    
    all[index] = { ...all[index], ...updates };
    this.saveAll(all);
    return all[index];
  }

  // Generic Delete
  async delete(id: string): Promise<boolean> {
    const all = this.getAllSync();
    const filtered = all.filter(i => i.id !== id);
    if (filtered.length === all.length) return false;
    
    this.saveAll(filtered);
    return true;
  }
}

const STORAGE_KEYS = {
  SHEEP: 'alifarm_sheep',
  USERS: 'alifarm_users',
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

// Initialize repositories
const sheepRepo = new Collection<Sheep>(STORAGE_KEYS.SHEEP);
const usersRepo = new Collection<User>(STORAGE_KEYS.USERS, 'AF'); // Users use sequential AF-xxx

export const db = {
  init: () => {
    if (!localStorage.getItem(STORAGE_KEYS.INIT)) {
      localStorage.setItem(STORAGE_KEYS.SHEEP, JSON.stringify(MOCK_SHEEP));
      
      // Default initial users
      const initialUsers: User[] = [
        { 
          id: 'AF-001', 
          name: 'Ali Owner', 
          email: 'admin@alifarm.com', 
          role: Role.OWNER, 
          status: 'Active', 
          avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100' 
        },
        { 
          id: 'AF-002', 
          name: 'Sodik Staff', 
          email: 'staff@alifarm.com', 
          role: Role.STAFF, 
          status: 'Active', 
          avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100' 
        }
      ];
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(initialUsers));
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(DEFAULT_CONFIG));
      localStorage.setItem(STORAGE_KEYS.INIT, 'true');
    }
  },

  getConfig: async (): Promise<AppConfig> => {
    const data = localStorage.getItem(STORAGE_KEYS.CONFIG);
    return data ? JSON.parse(data) : DEFAULT_CONFIG;
  },

  updateConfig: async (newConfig: AppConfig): Promise<void> => {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(newConfig));
  },

  // Repositories
  sheep: sheepRepo,
  users: usersRepo,

  // Domain specific helpers
  getUser: async (): Promise<User> => {
    const all = await usersRepo.find();
    return all[0] || { id: 'AF-001', name: 'Ali Owner', email: 'admin@alifarm.com', role: Role.OWNER, status: 'Active', avatarUrl: '' };
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
      currentValue: pkg.pricePerUnit * units
    };

    await usersRepo.update(user.id, {
      investments: [...(user.investments || []), newInvestment]
    });
  }
};

if (typeof window !== 'undefined') {
  db.init();
}