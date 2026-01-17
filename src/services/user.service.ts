import { supabase } from '@/lib/supabase'
import type { Profile } from '@/lib/database.types'
import type { User, Role, UserInvestment, QurbanSaving } from '@/types'
import { investmentService } from './investment.service'
import { qurbanService } from './qurban.service'

function transformProfileToUser(profile: Profile): Omit<User, 'investments' | 'qurban'> {
  return {
    id: profile.user_id,
    name: profile.name,
    email: profile.email,
    role: profile.role as Role,
    avatarUrl: profile.avatar_url || '',
    status: profile.status
  }
}

export const userService = {
  async findAll(): Promise<User[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) throw error

    // Transform profiles to users
    return (data || []).map(profile => ({
      ...transformProfileToUser(profile),
      investments: undefined,
      qurban: undefined
    }))
  },

  async findById(userId: string): Promise<User | null> {
    // userId is the AF-xxx format ID
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return {
      ...transformProfileToUser(data),
      investments: undefined,
      qurban: undefined
    }
  },

  async findByAuthId(authId: string): Promise<User | null> {
    // authId is the Supabase auth UUID
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return {
      ...transformProfileToUser(data),
      investments: undefined,
      qurban: undefined
    }
  },

  async findByAuthIdWithDetails(authId: string): Promise<User | null> {
    const profile = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authId)
      .single()

    if (profile.error) {
      if (profile.error.code === 'PGRST116') return null
      throw profile.error
    }

    // Get investments and qurban savings
    const [investments, qurban] = await Promise.all([
      investmentService.findUserInvestments(authId),
      qurbanService.findUserSaving(authId)
    ])

    return {
      ...transformProfileToUser(profile.data),
      investments: investments.length > 0 ? investments : undefined,
      qurban: qurban || undefined
    }
  },

  async update(authId: string, updates: Partial<User>): Promise<User> {
    const dbUpdates: Record<string, any> = {}

    if (updates.name !== undefined) dbUpdates.name = updates.name
    if (updates.role !== undefined) dbUpdates.role = updates.role
    if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl || null
    if (updates.status !== undefined) dbUpdates.status = updates.status

    const { data, error } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('id', authId)
      .select()
      .single()

    if (error) throw error
    return {
      ...transformProfileToUser(data),
      investments: undefined,
      qurban: undefined
    }
  },

  async updateRole(authId: string, role: Role): Promise<User> {
    return this.update(authId, { role })
  },

  async deactivate(authId: string): Promise<User> {
    return this.update(authId, { status: 'Inactive' })
  },

  async activate(authId: string): Promise<User> {
    return this.update(authId, { status: 'Active' })
  },

  // Get the auth UUID from a user_id (AF-xxx)
  async getAuthIdFromUserId(userId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (error) return null
    return data.id
  }
}

export default userService
