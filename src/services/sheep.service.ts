import { supabase } from '@/lib/supabase'
import type { SheepRow, WeightRecord } from '@/lib/database.types'
import type { Sheep, SheepStatus } from '@/types'

// Transform database row to app type
function transformSheepRow(row: SheepRow & { weight_records?: WeightRecord[] }): Sheep {
  return {
    id: row.id,
    tagId: row.tag_id,
    breed: row.breed,
    dob: row.dob,
    gender: row.gender,
    status: row.status as SheepStatus,
    cageId: row.cage_id || '',
    imageUrl: row.image_url || '',
    notes: row.notes || undefined,
    purchasePrice: row.purchase_price ? Number(row.purchase_price) : undefined,
    marketValue: row.market_value ? Number(row.market_value) : undefined,
    weightHistory: (row.weight_records || []).map(wr => ({
      date: wr.date,
      weight: Number(wr.weight)
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }
}

export const sheepService = {
  async findAll(): Promise<Sheep[]> {
    const { data, error } = await supabase
      .from('sheep')
      .select(`
        *,
        weight_records (*)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []).map(transformSheepRow)
  },

  async findById(id: string): Promise<Sheep | null> {
    const { data, error } = await supabase
      .from('sheep')
      .select(`
        *,
        weight_records (*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }
    return transformSheepRow(data)
  },

  async findByTagId(tagId: string): Promise<Sheep | null> {
    const { data, error } = await supabase
      .from('sheep')
      .select(`
        *,
        weight_records (*)
      `)
      .eq('tag_id', tagId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return transformSheepRow(data)
  },

  async create(sheep: Omit<Sheep, 'id' | 'weightHistory'>): Promise<Sheep> {
    const { data, error } = await supabase
      .from('sheep')
      .insert({
        tag_id: sheep.tagId,
        breed: sheep.breed,
        dob: sheep.dob,
        gender: sheep.gender,
        status: sheep.status,
        cage_id: sheep.cageId || null,
        image_url: sheep.imageUrl || null,
        notes: sheep.notes || null,
        purchase_price: sheep.purchasePrice || null,
        market_value: sheep.marketValue || null
      })
      .select()
      .single()

    if (error) throw error
    return transformSheepRow({ ...data, weight_records: [] })
  },

  async update(id: string, updates: Partial<Sheep>): Promise<Sheep> {
    const dbUpdates: Record<string, any> = {}

    if (updates.tagId !== undefined) dbUpdates.tag_id = updates.tagId
    if (updates.breed !== undefined) dbUpdates.breed = updates.breed
    if (updates.dob !== undefined) dbUpdates.dob = updates.dob
    if (updates.gender !== undefined) dbUpdates.gender = updates.gender
    if (updates.status !== undefined) dbUpdates.status = updates.status
    if (updates.cageId !== undefined) dbUpdates.cage_id = updates.cageId || null
    if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl || null
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes || null
    if (updates.purchasePrice !== undefined) dbUpdates.purchase_price = updates.purchasePrice
    if (updates.marketValue !== undefined) dbUpdates.market_value = updates.marketValue

    const { data, error } = await supabase
      .from('sheep')
      .update(dbUpdates)
      .eq('id', id)
      .select(`
        *,
        weight_records (*)
      `)
      .single()

    if (error) throw error
    return transformSheepRow(data)
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('sheep')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  },

  async addWeightRecord(sheepId: string, weight: number, date: string): Promise<WeightRecord> {
    const { data, error } = await supabase
      .from('weight_records')
      .insert({
        sheep_id: sheepId,
        weight,
        date
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getWeightHistory(sheepId: string): Promise<WeightRecord[]> {
    const { data, error } = await supabase
      .from('weight_records')
      .select('*')
      .eq('sheep_id', sheepId)
      .order('date', { ascending: true })

    if (error) throw error
    return data || []
  },

  // Generate next tag ID
  async getNextTagId(): Promise<string> {
    const { data } = await supabase
      .from('sheep')
      .select('tag_id')
      .order('tag_id', { ascending: false })
      .limit(1)

    if (!data || data.length === 0) {
      return 'AF-001'
    }

    const lastTag = data[0].tag_id
    const num = parseInt(lastTag.replace('AF-', ''), 10)
    return `AF-${String(num + 1).padStart(3, '0')}`
  }
}

export default sheepService
