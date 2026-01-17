import { supabase } from '@/lib/supabase'
import type { InvestmentPackage as PackageRow, UserInvestment as InvestmentRow } from '@/lib/database.types'
import type { InvestmentPackage, UserInvestment } from '@/types'

function transformPackageRow(row: PackageRow): InvestmentPackage {
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    pricePerUnit: Number(row.price_per_unit),
    durationMonths: row.duration_months,
    estimatedRoi: Number(row.estimated_roi),
    type: row.type
  }
}

function transformInvestmentRow(row: InvestmentRow): UserInvestment {
  return {
    id: row.id,
    packageId: row.package_id,
    units: row.units,
    purchaseDate: row.purchase_date,
    status: row.status,
    currentValue: Number(row.current_value)
  }
}

export const investmentService = {
  // Investment Packages
  async findAllPackages(): Promise<InvestmentPackage[]> {
    const { data, error } = await supabase
      .from('investment_packages')
      .select('*')
      .eq('is_active', true)
      .order('price_per_unit', { ascending: true })

    if (error) throw error
    return (data || []).map(transformPackageRow)
  },

  async findPackageById(id: string): Promise<InvestmentPackage | null> {
    const { data, error } = await supabase
      .from('investment_packages')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return transformPackageRow(data)
  },

  async createPackage(pkg: InvestmentPackage): Promise<InvestmentPackage> {
    const { data, error } = await supabase
      .from('investment_packages')
      .insert({
        id: pkg.id,
        name: pkg.name,
        description: pkg.description,
        price_per_unit: pkg.pricePerUnit,
        duration_months: pkg.durationMonths,
        estimated_roi: pkg.estimatedRoi,
        type: pkg.type
      })
      .select()
      .single()

    if (error) throw error
    return transformPackageRow(data)
  },

  // User Investments
  async findUserInvestments(userId: string): Promise<UserInvestment[]> {
    const { data, error } = await supabase
      .from('user_investments')
      .select('*')
      .eq('user_id', userId)
      .order('purchase_date', { ascending: false })

    if (error) throw error
    return (data || []).map(transformInvestmentRow)
  },

  async findAllInvestments(): Promise<(UserInvestment & { userId: string })[]> {
    const { data, error } = await supabase
      .from('user_investments')
      .select('*')
      .order('purchase_date', { ascending: false })

    if (error) throw error
    return (data || []).map(row => ({
      ...transformInvestmentRow(row),
      userId: row.user_id
    }))
  },

  async createInvestment(userId: string, packageId: string, units: number = 1): Promise<UserInvestment> {
    // Get package details for initial value
    const pkg = await this.findPackageById(packageId)
    if (!pkg) throw new Error('Package not found')

    const currentValue = pkg.pricePerUnit * units

    const { data, error } = await supabase
      .from('user_investments')
      .insert({
        user_id: userId,
        package_id: packageId,
        units,
        current_value: currentValue
      })
      .select()
      .single()

    if (error) throw error
    return transformInvestmentRow(data)
  },

  async updateInvestmentValue(id: string, currentValue: number): Promise<UserInvestment> {
    const { data, error } = await supabase
      .from('user_investments')
      .update({ current_value: currentValue })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return transformInvestmentRow(data)
  },

  async completeInvestment(id: string): Promise<UserInvestment> {
    const { data, error } = await supabase
      .from('user_investments')
      .update({ status: 'Completed' })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return transformInvestmentRow(data)
  },

  // Calculate total portfolio value for a user
  async getPortfolioValue(userId: string): Promise<number> {
    const investments = await this.findUserInvestments(userId)
    return investments
      .filter(inv => inv.status === 'Active')
      .reduce((total, inv) => total + inv.currentValue, 0)
  }
}

export default investmentService
