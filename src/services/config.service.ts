import { supabase } from '@/lib/supabase'
import type { AppConfig as ConfigRow } from '@/lib/database.types'
import type { AppConfig } from '@/types'

function transformConfigRow(row: ConfigRow): AppConfig {
  return {
    features: {
      investment: row.feature_investment,
      qurban: row.feature_qurban,
      marketplace: row.feature_marketplace
    }
  }
}

export const configService = {
  async get(): Promise<AppConfig> {
    const { data, error } = await supabase
      .from('app_config')
      .select('*')
      .eq('id', 1)
      .single()

    if (error) {
      // Return default config if not found
      return {
        features: {
          investment: true,
          qurban: true,
          marketplace: true
        }
      }
    }
    return transformConfigRow(data)
  },

  async update(config: Partial<AppConfig['features']>): Promise<AppConfig> {
    const dbUpdates: Record<string, any> = {}

    if (config.investment !== undefined) dbUpdates.feature_investment = config.investment
    if (config.qurban !== undefined) dbUpdates.feature_qurban = config.qurban
    if (config.marketplace !== undefined) dbUpdates.feature_marketplace = config.marketplace

    const { data, error } = await supabase
      .from('app_config')
      .update(dbUpdates)
      .eq('id', 1)
      .select()
      .single()

    if (error) throw error
    return transformConfigRow(data)
  },

  async toggleFeature(feature: keyof AppConfig['features'], enabled: boolean): Promise<AppConfig> {
    return this.update({ [feature]: enabled })
  }
}

export default configService
