import { supabase } from '@/lib/supabase'
import type { MarketProduct as ProductRow } from '@/lib/database.types'
import type { MarketProduct } from '@/types'

function transformProductRow(row: ProductRow): MarketProduct {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: Number(row.price),
    stock: row.stock,
    description: row.description || '',
    imageUrl: row.image_url || ''
  }
}

export const marketplaceService = {
  async findAll(): Promise<MarketProduct[]> {
    const { data, error } = await supabase
      .from('market_products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []).map(transformProductRow)
  },

  async findByCategory(category: 'Sheep' | 'Feed' | 'Medicine'): Promise<MarketProduct[]> {
    const { data, error } = await supabase
      .from('market_products')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []).map(transformProductRow)
  },

  async findById(id: string): Promise<MarketProduct | null> {
    const { data, error } = await supabase
      .from('market_products')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return transformProductRow(data)
  },

  async create(product: MarketProduct): Promise<MarketProduct> {
    const { data, error } = await supabase
      .from('market_products')
      .insert({
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        stock: product.stock,
        description: product.description,
        image_url: product.imageUrl
      })
      .select()
      .single()

    if (error) throw error
    return transformProductRow(data)
  },

  async update(id: string, updates: Partial<MarketProduct>): Promise<MarketProduct> {
    const dbUpdates: Record<string, any> = {}

    if (updates.name !== undefined) dbUpdates.name = updates.name
    if (updates.category !== undefined) dbUpdates.category = updates.category
    if (updates.price !== undefined) dbUpdates.price = updates.price
    if (updates.stock !== undefined) dbUpdates.stock = updates.stock
    if (updates.description !== undefined) dbUpdates.description = updates.description
    if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl

    const { data, error } = await supabase
      .from('market_products')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return transformProductRow(data)
  },

  async updateStock(id: string, stock: number): Promise<MarketProduct> {
    return this.update(id, { stock })
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('market_products')
      .update({ is_active: false })
      .eq('id', id)

    if (error) throw error
    return true
  }
}

export default marketplaceService
