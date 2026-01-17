import { supabase } from '@/lib/supabase'
import type { Cage as CageRow } from '@/lib/database.types'
import type { Cage } from '@/types'

function transformCageRow(row: CageRow): Cage {
  return {
    id: row.id,
    name: row.name,
    capacity: row.capacity,
    occupied: row.occupied,
    cctvUrl: row.cctv_url || undefined
  }
}

export const cageService = {
  async findAll(): Promise<Cage[]> {
    const { data, error } = await supabase
      .from('cages')
      .select('*')
      .order('id', { ascending: true })

    if (error) throw error
    return (data || []).map(transformCageRow)
  },

  async findById(id: string): Promise<Cage | null> {
    const { data, error } = await supabase
      .from('cages')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return transformCageRow(data)
  },

  async create(cage: Omit<Cage, 'occupied'>): Promise<Cage> {
    const { data, error } = await supabase
      .from('cages')
      .insert({
        id: cage.id,
        name: cage.name,
        capacity: cage.capacity,
        occupied: 0,
        cctv_url: cage.cctvUrl || null
      })
      .select()
      .single()

    if (error) throw error
    return transformCageRow(data)
  },

  async update(id: string, updates: Partial<Cage>): Promise<Cage> {
    const dbUpdates: Record<string, any> = {}

    if (updates.name !== undefined) dbUpdates.name = updates.name
    if (updates.capacity !== undefined) dbUpdates.capacity = updates.capacity
    if (updates.occupied !== undefined) dbUpdates.occupied = updates.occupied
    if (updates.cctvUrl !== undefined) dbUpdates.cctv_url = updates.cctvUrl || null

    const { data, error } = await supabase
      .from('cages')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return transformCageRow(data)
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('cages')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  },

  async updateOccupancy(id: string, occupied: number): Promise<Cage> {
    return this.update(id, { occupied })
  }
}

export default cageService
