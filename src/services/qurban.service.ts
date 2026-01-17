import { supabase } from '@/lib/supabase'
import type { QurbanSaving as SavingRow, QurbanPackage as PackageRow } from '@/lib/database.types'
import type { QurbanSaving } from '@/types'

interface QurbanPackage {
  id: string
  name: string
  weightRange: string
  price: number
  description: string
  imageUrl: string
}

function transformSavingRow(row: SavingRow): QurbanSaving {
  return {
    id: row.id,
    targetAmount: Number(row.target_amount),
    currentAmount: Number(row.current_amount),
    startDate: row.start_date,
    targetDate: row.target_date
  }
}

function transformPackageRow(row: PackageRow): QurbanPackage {
  return {
    id: row.id,
    name: row.name,
    weightRange: row.weight_range,
    price: Number(row.price),
    description: row.description || '',
    imageUrl: row.image_url || ''
  }
}

export const qurbanService = {
  // Qurban Packages (for landing page)
  async findAllPackages(): Promise<QurbanPackage[]> {
    const { data, error } = await supabase
      .from('qurban_packages')
      .select('*')
      .eq('is_active', true)
      .order('price', { ascending: true })

    if (error) throw error
    return (data || []).map(transformPackageRow)
  },

  // User Qurban Savings
  async findUserSaving(userId: string): Promise<QurbanSaving | null> {
    const { data, error } = await supabase
      .from('qurban_savings')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return transformSavingRow(data)
  },

  async createSaving(userId: string, targetAmount: number, targetDate: string): Promise<QurbanSaving> {
    const { data, error } = await supabase
      .from('qurban_savings')
      .insert({
        user_id: userId,
        target_amount: targetAmount,
        current_amount: 0,
        target_date: targetDate
      })
      .select()
      .single()

    if (error) throw error
    return transformSavingRow(data)
  },

  async updateSaving(id: string, updates: Partial<QurbanSaving>): Promise<QurbanSaving> {
    const dbUpdates: Record<string, any> = {}

    if (updates.targetAmount !== undefined) dbUpdates.target_amount = updates.targetAmount
    if (updates.currentAmount !== undefined) dbUpdates.current_amount = updates.currentAmount
    if (updates.targetDate !== undefined) dbUpdates.target_date = updates.targetDate

    const { data, error } = await supabase
      .from('qurban_savings')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return transformSavingRow(data)
  },

  async addToSaving(id: string, amount: number): Promise<QurbanSaving> {
    // Get current amount first
    const { data: current, error: fetchError } = await supabase
      .from('qurban_savings')
      .select('current_amount')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError

    const newAmount = Number(current.current_amount) + amount

    const { data, error } = await supabase
      .from('qurban_savings')
      .update({ current_amount: newAmount })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return transformSavingRow(data)
  },

  async deleteSaving(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('qurban_savings')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  }
}

export default qurbanService
