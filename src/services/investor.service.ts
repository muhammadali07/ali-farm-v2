import { supabase } from "@/lib/supabase";
import type {
  InvestorContract,
  ContractSheep,
  ContractExpense,
  FinancialReport,
  ContractSummary,
  ContractStatus,
  ExpenseCategory,
  Sheep,
} from "@/types";

// ============================================
// INVESTOR CONTRACT SERVICE
// ============================================

export const investorService = {
  // ============================================
  // CONTRACTS
  // ============================================

  async findAllContracts(): Promise<InvestorContract[]> {
    const { data, error } = await supabase
      .from("investor_contracts")
      .select(
        `
        *,
        profiles:investor_id (name, email)
      `
      )
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (data || []).map((row: any) => ({
      id: row.id,
      contractNumber: row.contract_number,
      investorId: row.investor_id,
      investorName: row.profiles?.name,
      investorEmail: row.profiles?.email,
      investmentAmount: Number(row.investment_amount),
      profitSharingPercentage: Number(row.profit_sharing_percentage),
      startDate: row.start_date,
      durationMonths: row.duration_months,
      endDate: row.end_date,
      status: row.status as ContractStatus,
      totalRevenue: row.total_revenue ? Number(row.total_revenue) : undefined,
      totalExpenses: row.total_expenses ? Number(row.total_expenses) : undefined,
      netProfit: row.net_profit ? Number(row.net_profit) : undefined,
      investorProfit: row.investor_profit ? Number(row.investor_profit) : undefined,
      actualRoi: row.actual_roi ? Number(row.actual_roi) : undefined,
      settlementDate: row.settlement_date,
      settlementNotes: row.settlement_notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  },

  async findContractsByInvestor(investorId: string): Promise<InvestorContract[]> {
    const { data, error } = await supabase
      .from("investor_contracts")
      .select("*")
      .eq("investor_id", investorId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (data || []).map((row: any) => ({
      id: row.id,
      contractNumber: row.contract_number,
      investorId: row.investor_id,
      investmentAmount: Number(row.investment_amount),
      profitSharingPercentage: Number(row.profit_sharing_percentage),
      startDate: row.start_date,
      durationMonths: row.duration_months,
      endDate: row.end_date,
      status: row.status as ContractStatus,
      totalRevenue: row.total_revenue ? Number(row.total_revenue) : undefined,
      totalExpenses: row.total_expenses ? Number(row.total_expenses) : undefined,
      netProfit: row.net_profit ? Number(row.net_profit) : undefined,
      investorProfit: row.investor_profit ? Number(row.investor_profit) : undefined,
      actualRoi: row.actual_roi ? Number(row.actual_roi) : undefined,
      settlementDate: row.settlement_date,
      settlementNotes: row.settlement_notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  },

  async findContractById(id: string): Promise<InvestorContract | null> {
    const { data, error } = await supabase
      .from("investor_contracts")
      .select(
        `
        *,
        profiles:investor_id (name, email)
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }

    return {
      id: data.id,
      contractNumber: data.contract_number,
      investorId: data.investor_id,
      investorName: data.profiles?.name,
      investorEmail: data.profiles?.email,
      investmentAmount: Number(data.investment_amount),
      profitSharingPercentage: Number(data.profit_sharing_percentage),
      startDate: data.start_date,
      durationMonths: data.duration_months,
      endDate: data.end_date,
      status: data.status as ContractStatus,
      totalRevenue: data.total_revenue ? Number(data.total_revenue) : undefined,
      totalExpenses: data.total_expenses ? Number(data.total_expenses) : undefined,
      netProfit: data.net_profit ? Number(data.net_profit) : undefined,
      investorProfit: data.investor_profit ? Number(data.investor_profit) : undefined,
      actualRoi: data.actual_roi ? Number(data.actual_roi) : undefined,
      settlementDate: data.settlement_date,
      settlementNotes: data.settlement_notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  async generateContractNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const { data, error } = await supabase
      .from("investor_contracts")
      .select("contract_number")
      .like("contract_number", `INV-${year}-%`)
      .order("contract_number", { ascending: false })
      .limit(1);

    if (error) throw error;

    let nextNum = 1;
    if (data && data.length > 0) {
      const lastNum = parseInt(data[0].contract_number.split("-")[2], 10);
      nextNum = lastNum + 1;
    }

    return `INV-${year}-${String(nextNum).padStart(3, "0")}`;
  },

  async createContract(
    investorId: string,
    investmentAmount: number,
    profitSharingPercentage: number,
    durationMonths: number,
    startDate?: string
  ): Promise<InvestorContract> {
    const contractNumber = await this.generateContractNumber();

    const { data, error } = await supabase
      .from("investor_contracts")
      .insert({
        contract_number: contractNumber,
        investor_id: investorId,
        investment_amount: investmentAmount,
        profit_sharing_percentage: profitSharingPercentage,
        duration_months: durationMonths,
        start_date: startDate || new Date().toISOString().split("T")[0],
        status: "Active",
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      contractNumber: data.contract_number,
      investorId: data.investor_id,
      investmentAmount: Number(data.investment_amount),
      profitSharingPercentage: Number(data.profit_sharing_percentage),
      startDate: data.start_date,
      durationMonths: data.duration_months,
      endDate: data.end_date,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  async updateContractStatus(
    id: string,
    status: ContractStatus
  ): Promise<void> {
    const { error } = await supabase
      .from("investor_contracts")
      .update({ status })
      .eq("id", id);

    if (error) throw error;
  },

  async completeContract(
    id: string,
    totalRevenue: number,
    totalExpenses: number,
    notes?: string
  ): Promise<InvestorContract> {
    const contract = await this.findContractById(id);
    if (!contract) throw new Error("Contract not found");

    const netProfit = totalRevenue - totalExpenses - contract.investmentAmount;
    const investorProfit = netProfit * (contract.profitSharingPercentage / 100);
    const actualRoi = (netProfit / contract.investmentAmount) * 100;

    const { data, error } = await supabase
      .from("investor_contracts")
      .update({
        status: "Completed",
        total_revenue: totalRevenue,
        total_expenses: totalExpenses,
        net_profit: netProfit,
        investor_profit: investorProfit,
        actual_roi: actualRoi,
        settlement_date: new Date().toISOString().split("T")[0],
        settlement_notes: notes,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      contractNumber: data.contract_number,
      investorId: data.investor_id,
      investmentAmount: Number(data.investment_amount),
      profitSharingPercentage: Number(data.profit_sharing_percentage),
      startDate: data.start_date,
      durationMonths: data.duration_months,
      endDate: data.end_date,
      status: data.status,
      totalRevenue: Number(data.total_revenue),
      totalExpenses: Number(data.total_expenses),
      netProfit: Number(data.net_profit),
      investorProfit: Number(data.investor_profit),
      actualRoi: Number(data.actual_roi),
      settlementDate: data.settlement_date,
      settlementNotes: data.settlement_notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  // ============================================
  // CONTRACT SHEEP
  // ============================================

  async getContractSheep(contractId: string): Promise<ContractSheep[]> {
    const { data, error } = await supabase
      .from("contract_sheep")
      .select(
        `
        *,
        sheep:sheep_id (
          id, tag_id, breed, dob, gender, status, cage_id,
          image_url, notes, purchase_price, market_value,
          parent_male_id, parent_female_id, birth_type
        )
      `
      )
      .eq("contract_id", contractId)
      .order("allocation_date", { ascending: false });

    if (error) throw error;

    return (data || []).map((row: any) => ({
      id: row.id,
      contractId: row.contract_id,
      sheepId: row.sheep_id,
      allocationDate: row.allocation_date,
      purchasePrice: Number(row.purchase_price),
      saleDate: row.sale_date,
      salePrice: row.sale_price ? Number(row.sale_price) : undefined,
      status: row.status,
      notes: row.notes,
      sheep: row.sheep
        ? {
            id: row.sheep.id,
            tagId: row.sheep.tag_id,
            breed: row.sheep.breed,
            dob: row.sheep.dob,
            gender: row.sheep.gender,
            status: row.sheep.status,
            cageId: row.sheep.cage_id,
            imageUrl: row.sheep.image_url,
            notes: row.sheep.notes,
            purchasePrice: row.sheep.purchase_price
              ? Number(row.sheep.purchase_price)
              : undefined,
            marketValue: row.sheep.market_value
              ? Number(row.sheep.market_value)
              : undefined,
            parentMaleId: row.sheep.parent_male_id,
            parentFemaleId: row.sheep.parent_female_id,
            birthType: row.sheep.birth_type,
            weightHistory: [],
          }
        : undefined,
    }));
  },

  async allocateSheep(
    contractId: string,
    sheepId: string,
    purchasePrice: number
  ): Promise<ContractSheep> {
    const { data, error } = await supabase
      .from("contract_sheep")
      .insert({
        contract_id: contractId,
        sheep_id: sheepId,
        purchase_price: purchasePrice,
        allocation_date: new Date().toISOString().split("T")[0],
        status: "Active",
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      contractId: data.contract_id,
      sheepId: data.sheep_id,
      allocationDate: data.allocation_date,
      purchasePrice: Number(data.purchase_price),
      status: data.status,
    };
  },

  async deallocateSheep(contractId: string, sheepId: string): Promise<void> {
    const { error } = await supabase
      .from("contract_sheep")
      .delete()
      .eq("contract_id", contractId)
      .eq("sheep_id", sheepId);

    if (error) throw error;
  },

  async markSheepSold(
    contractId: string,
    sheepId: string,
    salePrice: number,
    saleDate?: string
  ): Promise<void> {
    const { error } = await supabase
      .from("contract_sheep")
      .update({
        status: "Sold",
        sale_price: salePrice,
        sale_date: saleDate || new Date().toISOString().split("T")[0],
      })
      .eq("contract_id", contractId)
      .eq("sheep_id", sheepId);

    if (error) throw error;
  },

  // ============================================
  // EXPENSES
  // ============================================

  async getContractExpenses(contractId: string): Promise<ContractExpense[]> {
    const { data, error } = await supabase
      .from("contract_expenses")
      .select(
        `
        *,
        sheep:sheep_id (tag_id)
      `
      )
      .eq("contract_id", contractId)
      .order("expense_date", { ascending: false });

    if (error) throw error;

    return (data || []).map((row: any) => ({
      id: row.id,
      contractId: row.contract_id,
      expenseDate: row.expense_date,
      category: row.category as ExpenseCategory,
      description: row.description,
      amount: Number(row.amount),
      sheepId: row.sheep_id,
      receiptUrl: row.receipt_url,
      createdAt: row.created_at,
      sheepTagId: row.sheep?.tag_id,
    }));
  },

  async addExpense(
    contractId: string,
    category: ExpenseCategory,
    description: string,
    amount: number,
    expenseDate?: string,
    sheepId?: string,
    receiptUrl?: string
  ): Promise<ContractExpense> {
    const { data, error } = await supabase
      .from("contract_expenses")
      .insert({
        contract_id: contractId,
        category,
        description,
        amount,
        expense_date: expenseDate || new Date().toISOString().split("T")[0],
        sheep_id: sheepId,
        receipt_url: receiptUrl,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      contractId: data.contract_id,
      expenseDate: data.expense_date,
      category: data.category,
      description: data.description,
      amount: Number(data.amount),
      sheepId: data.sheep_id,
      receiptUrl: data.receipt_url,
      createdAt: data.created_at,
    };
  },

  async deleteExpense(id: string): Promise<void> {
    const { error } = await supabase
      .from("contract_expenses")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  // ============================================
  // FINANCIAL REPORTS
  // ============================================

  async getContractReports(contractId: string): Promise<FinancialReport[]> {
    const { data, error } = await supabase
      .from("financial_reports")
      .select("*")
      .eq("contract_id", contractId)
      .order("report_period", { ascending: false });

    if (error) throw error;

    return (data || []).map((row: any) => ({
      id: row.id,
      contractId: row.contract_id,
      reportPeriod: row.report_period,
      reportDate: row.report_date,
      openingValue: Number(row.opening_value),
      closingValue: Number(row.closing_value),
      totalExpenses: Number(row.total_expenses),
      totalRevenue: Number(row.total_revenue),
      sheepCount: row.sheep_count,
      sheepBorn: row.sheep_born,
      sheepSold: row.sheep_sold,
      sheepDeceased: row.sheep_deceased,
      highlights: row.highlights,
      notes: row.notes,
      status: row.status,
      publishedAt: row.published_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  },

  async createReport(
    contractId: string,
    reportPeriod: string,
    data: Partial<FinancialReport>
  ): Promise<FinancialReport> {
    const { data: result, error } = await supabase
      .from("financial_reports")
      .insert({
        contract_id: contractId,
        report_period: reportPeriod,
        report_date: new Date().toISOString().split("T")[0],
        opening_value: data.openingValue || 0,
        closing_value: data.closingValue || 0,
        total_expenses: data.totalExpenses || 0,
        total_revenue: data.totalRevenue || 0,
        sheep_count: data.sheepCount || 0,
        sheep_born: data.sheepBorn || 0,
        sheep_sold: data.sheepSold || 0,
        sheep_deceased: data.sheepDeceased || 0,
        highlights: data.highlights,
        notes: data.notes,
        status: "Draft",
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: result.id,
      contractId: result.contract_id,
      reportPeriod: result.report_period,
      reportDate: result.report_date,
      openingValue: Number(result.opening_value),
      closingValue: Number(result.closing_value),
      totalExpenses: Number(result.total_expenses),
      totalRevenue: Number(result.total_revenue),
      sheepCount: result.sheep_count,
      sheepBorn: result.sheep_born,
      sheepSold: result.sheep_sold,
      sheepDeceased: result.sheep_deceased,
      highlights: result.highlights,
      notes: result.notes,
      status: result.status,
      publishedAt: result.published_at,
      createdAt: result.created_at,
      updatedAt: result.updated_at,
    };
  },

  async publishReport(id: string): Promise<void> {
    const { error } = await supabase
      .from("financial_reports")
      .update({
        status: "Published",
        published_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;
  },

  // ============================================
  // CONTRACT SUMMARY
  // ============================================

  async getContractSummary(contractId: string): Promise<ContractSummary> {
    const [contract, sheep, expenses] = await Promise.all([
      this.findContractById(contractId),
      this.getContractSheep(contractId),
      this.getContractExpenses(contractId),
    ]);

    if (!contract) throw new Error("Contract not found");

    const activeSheep = sheep.filter((s) => s.status === "Active");
    const soldSheep = sheep.filter((s) => s.status === "Sold");
    const deceasedSheep = sheep.filter((s) => s.status === "Deceased");
    const bornSheep = sheep.filter((s) => s.sheep?.birthType === "Born");

    const totalPurchaseValue = sheep.reduce((sum, s) => sum + s.purchasePrice, 0);
    const totalCurrentValue = activeSheep.reduce(
      (sum, s) => sum + (s.sheep?.marketValue || s.purchasePrice),
      0
    );
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalRevenue = soldSheep.reduce((sum, s) => sum + (s.salePrice || 0), 0);

    const estimatedProfit =
      totalCurrentValue + totalRevenue - totalPurchaseValue - totalExpenses;
    const estimatedInvestorProfit =
      estimatedProfit * (contract.profitSharingPercentage / 100);
    const estimatedRoi = (estimatedProfit / contract.investmentAmount) * 100;

    return {
      totalSheep: activeSheep.length,
      totalPurchaseValue,
      totalCurrentValue,
      totalExpenses,
      totalRevenue,
      sheepBorn: bornSheep.length,
      sheepSold: soldSheep.length,
      sheepDeceased: deceasedSheep.length,
      estimatedProfit,
      estimatedInvestorProfit,
      estimatedRoi,
    };
  },

  // ============================================
  // SHEEP HIERARCHY
  // ============================================

  async getSheepWithChildren(sheepId: string): Promise<Sheep | null> {
    // Get the main sheep
    const { data: sheepData, error: sheepError } = await supabase
      .from("sheep")
      .select("*")
      .eq("id", sheepId)
      .single();

    if (sheepError) {
      if (sheepError.code === "PGRST116") return null;
      throw sheepError;
    }

    // Get children (sheep where this sheep is a parent)
    const { data: childrenData, error: childrenError } = await supabase
      .from("sheep")
      .select("*")
      .or(`parent_male_id.eq.${sheepId},parent_female_id.eq.${sheepId}`);

    if (childrenError) throw childrenError;

    const sheep: Sheep = {
      id: sheepData.id,
      tagId: sheepData.tag_id,
      breed: sheepData.breed,
      dob: sheepData.dob,
      gender: sheepData.gender,
      status: sheepData.status,
      cageId: sheepData.cage_id,
      imageUrl: sheepData.image_url,
      notes: sheepData.notes,
      purchasePrice: sheepData.purchase_price
        ? Number(sheepData.purchase_price)
        : undefined,
      marketValue: sheepData.market_value
        ? Number(sheepData.market_value)
        : undefined,
      parentMaleId: sheepData.parent_male_id,
      parentFemaleId: sheepData.parent_female_id,
      birthType: sheepData.birth_type,
      weightHistory: [],
      children: (childrenData || []).map((child: any) => ({
        id: child.id,
        tagId: child.tag_id,
        breed: child.breed,
        dob: child.dob,
        gender: child.gender,
        status: child.status,
        cageId: child.cage_id,
        imageUrl: child.image_url,
        notes: child.notes,
        purchasePrice: child.purchase_price
          ? Number(child.purchase_price)
          : undefined,
        marketValue: child.market_value
          ? Number(child.market_value)
          : undefined,
        parentMaleId: child.parent_male_id,
        parentFemaleId: child.parent_female_id,
        birthType: child.birth_type,
        weightHistory: [],
      })),
    };

    return sheep;
  },

  async getSheepHierarchy(contractId: string): Promise<Sheep[]> {
    const contractSheep = await this.getContractSheep(contractId);

    // Get all parent sheep (those without parents or with birth_type = 'Purchased')
    const parentSheepIds = contractSheep
      .filter((cs) => cs.sheep?.birthType === "Purchased" || !cs.sheep?.parentMaleId)
      .map((cs) => cs.sheepId);

    const hierarchyPromises = parentSheepIds.map((id) =>
      this.getSheepWithChildren(id)
    );
    const hierarchy = await Promise.all(hierarchyPromises);

    return hierarchy.filter((s) => s !== null) as Sheep[];
  },
};

export default investorService;
