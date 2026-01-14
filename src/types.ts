export enum Role {
  OWNER = 'OWNER',
  STAFF = 'STAFF',
  INVESTOR = 'INVESTOR',
  GUEST = 'GUEST'
}

export enum SheepStatus {
  HEALTHY = 'Healthy',
  SICK = 'Sick',
  SOLD = 'Sold',
  DECEASED = 'Deceased',
  QUARANTINE = 'Quarantine'
}

export enum Language {
  EN = 'EN',
  ID = 'ID'
}

export interface AppConfig {
  features: {
    investment: boolean;
    qurban: boolean;
    marketplace: boolean;
  };
}

export interface WeightRecord {
  date: string;
  weight: number;
}

export interface Sheep {
  id: string;
  tagId: string;
  breed: string;
  dob: string;
  gender: 'Male' | 'Female';
  weightHistory: WeightRecord[];
  status: SheepStatus;
  cageId: string;
  imageUrl: string;
  notes?: string;
  purchasePrice?: number;
  marketValue?: number;
}

export interface Cage {
  id: string;
  name: string;
  capacity: number;
  occupied: number;
  cctvUrl?: string;
}

export interface InvestmentPackage {
  id: string;
  name: string;
  description: string;
  pricePerUnit: number;
  durationMonths: number;
  estimatedRoi: number;
  type: 'Single' | 'Batch' | 'Cage';
}

export interface UserInvestment {
  id: string;
  packageId: string;
  units: number;
  purchaseDate: string;
  status: 'Active' | 'Completed';
  currentValue: number;
}

export interface MarketProduct {
  id: string;
  name: string;
  category: 'Sheep' | 'Feed' | 'Medicine';
  price: number;
  stock: number;
  description: string;
  imageUrl: string;
}

export interface QurbanSaving {
  id: string;
  targetAmount: number;
  currentAmount: number;
  startDate: string;
  targetDate: string;
}

export interface User {
  id: string; // This will be the sequential AF-xxx ID
  name: string;
  email: string;
  role: Role;
  avatarUrl: string;
  status: 'Active' | 'Inactive';
  investments?: UserInvestment[];
  qurban?: QurbanSaving;
}