export enum Role {
  OWNER = "OWNER",
  STAFF = "STAFF",
  INVESTOR = "INVESTOR",
  GUEST = "GUEST",
}

export enum SheepStatus {
  HEALTHY = "Healthy",
  SICK = "Sick",
  SOLD = "Sold",
  DECEASED = "Deceased",
  QUARANTINE = "Quarantine",
}

export enum Language {
  EN = "EN",
  ID = "ID",
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
  gender: "Male" | "Female";
  weightHistory: WeightRecord[];
  status: SheepStatus;
  cageId: string;
  imageUrl: string;
  notes?: string;
  purchasePrice?: number;
  marketValue?: number;
  // Parent references for hierarchy
  parentMaleId?: string;
  parentFemaleId?: string;
  birthType?: "Purchased" | "Born";
  // Virtual fields for hierarchy display
  children?: Sheep[];
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
  type: "Single" | "Batch" | "Cage";
}

export interface UserInvestment {
  id: string;
  packageId: string;
  units: number;
  purchaseDate: string;
  status: "Active" | "Completed";
  currentValue: number;
}

export interface MarketProduct {
  id: string;
  name: string;
  category: "Sheep" | "Feed" | "Medicine";
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
  status: "Active" | "Inactive";
  investments?: UserInvestment[];
  qurban?: QurbanSaving;
}

// ============================================
// INVESTOR MANAGEMENT TYPES
// ============================================

export type ContractStatus = "Draft" | "Active" | "Completed" | "Cancelled";
export type ExpenseCategory =
  | "Feed"
  | "Medicine"
  | "Vaccination"
  | "Labor"
  | "Transport"
  | "Maintenance"
  | "Other";
export type ContractSheepStatus =
  | "Active"
  | "Sold"
  | "Deceased"
  | "Transferred";
export type ReportStatus = "Draft" | "Published";

export interface InvestorContract {
  id: string;
  contractNumber: string;
  investorId: string;
  investorName?: string; // Virtual field
  investorEmail?: string; // Virtual field

  // Financial
  investmentAmount: number;
  profitSharingPercentage: number; // e.g., 70 means investor gets 70%

  // Duration
  startDate: string;
  durationMonths: number;
  endDate: string;

  // Status
  status: ContractStatus;

  // Settlement (when completed)
  totalRevenue?: number;
  totalExpenses?: number;
  netProfit?: number;
  investorProfit?: number;
  actualRoi?: number;
  settlementDate?: string;
  settlementNotes?: string;

  // Metadata
  createdAt: string;
  updatedAt: string;

  // Virtual fields
  sheepCount?: number;
  currentValue?: number;
}

export interface ContractSheep {
  id: string;
  contractId: string;
  sheepId: string;

  // Allocation
  allocationDate: string;
  purchasePrice: number;

  // Sale (when sold)
  saleDate?: string;
  salePrice?: number;

  status: ContractSheepStatus;
  notes?: string;

  // Virtual: sheep details
  sheep?: Sheep;
}

export interface ContractExpense {
  id: string;
  contractId: string;

  expenseDate: string;
  category: ExpenseCategory;
  description: string;
  amount: number;

  sheepId?: string;
  receiptUrl?: string;

  createdAt: string;

  // Virtual
  sheepTagId?: string;
}

export interface FinancialReport {
  id: string;
  contractId: string;

  reportPeriod: string; // YYYY-MM
  reportDate: string;

  // Values
  openingValue: number;
  closingValue: number;
  totalExpenses: number;
  totalRevenue: number;

  // Sheep summary
  sheepCount: number;
  sheepBorn: number;
  sheepSold: number;
  sheepDeceased: number;

  // Notes
  highlights?: string;
  notes?: string;

  status: ReportStatus;
  publishedAt?: string;

  createdAt: string;
  updatedAt: string;
}

export interface ContractSummary {
  totalSheep: number;
  totalPurchaseValue: number;
  totalCurrentValue: number;
  totalExpenses: number;
  totalRevenue: number;
  sheepBorn: number;
  sheepSold: number;
  sheepDeceased: number;
  estimatedProfit: number;
  estimatedInvestorProfit: number;
  estimatedRoi: number;
}
