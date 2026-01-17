export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          name: string
          email: string
          role: 'OWNER' | 'STAFF' | 'INVESTOR' | 'GUEST'
          avatar_url: string | null
          status: 'Active' | 'Inactive'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          user_id?: string
          name: string
          email: string
          role?: 'OWNER' | 'STAFF' | 'INVESTOR' | 'GUEST'
          avatar_url?: string | null
          status?: 'Active' | 'Inactive'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          email?: string
          role?: 'OWNER' | 'STAFF' | 'INVESTOR' | 'GUEST'
          avatar_url?: string | null
          status?: 'Active' | 'Inactive'
          updated_at?: string
        }
      }
      cages: {
        Row: {
          id: string
          name: string
          capacity: number
          occupied: number
          cctv_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          capacity?: number
          occupied?: number
          cctv_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          capacity?: number
          occupied?: number
          cctv_url?: string | null
          updated_at?: string
        }
      }
      sheep: {
        Row: {
          id: string
          tag_id: string
          breed: string
          dob: string
          gender: 'Male' | 'Female'
          status: 'Healthy' | 'Sick' | 'Sold' | 'Deceased' | 'Quarantine'
          cage_id: string | null
          image_url: string | null
          notes: string | null
          purchase_price: number | null
          market_value: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tag_id: string
          breed: string
          dob: string
          gender: 'Male' | 'Female'
          status?: 'Healthy' | 'Sick' | 'Sold' | 'Deceased' | 'Quarantine'
          cage_id?: string | null
          image_url?: string | null
          notes?: string | null
          purchase_price?: number | null
          market_value?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          tag_id?: string
          breed?: string
          dob?: string
          gender?: 'Male' | 'Female'
          status?: 'Healthy' | 'Sick' | 'Sold' | 'Deceased' | 'Quarantine'
          cage_id?: string | null
          image_url?: string | null
          notes?: string | null
          purchase_price?: number | null
          market_value?: number | null
          updated_at?: string
        }
      }
      weight_records: {
        Row: {
          id: string
          sheep_id: string
          date: string
          weight: number
          created_at: string
        }
        Insert: {
          id?: string
          sheep_id: string
          date: string
          weight: number
          created_at?: string
        }
        Update: {
          sheep_id?: string
          date?: string
          weight?: number
        }
      }
      investment_packages: {
        Row: {
          id: string
          name: string
          description: string | null
          price_per_unit: number
          duration_months: number
          estimated_roi: number
          type: 'Single' | 'Batch' | 'Cage'
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          description?: string | null
          price_per_unit: number
          duration_months: number
          estimated_roi: number
          type: 'Single' | 'Batch' | 'Cage'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          description?: string | null
          price_per_unit?: number
          duration_months?: number
          estimated_roi?: number
          type?: 'Single' | 'Batch' | 'Cage'
          is_active?: boolean
          updated_at?: string
        }
      }
      user_investments: {
        Row: {
          id: string
          user_id: string
          package_id: string
          units: number
          purchase_date: string
          status: 'Active' | 'Completed'
          current_value: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          package_id: string
          units?: number
          purchase_date?: string
          status?: 'Active' | 'Completed'
          current_value: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          package_id?: string
          units?: number
          purchase_date?: string
          status?: 'Active' | 'Completed'
          current_value?: number
          updated_at?: string
        }
      }
      qurban_savings: {
        Row: {
          id: string
          user_id: string
          target_amount: number
          current_amount: number
          start_date: string
          target_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          target_amount: number
          current_amount?: number
          start_date?: string
          target_date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          target_amount?: number
          current_amount?: number
          start_date?: string
          target_date?: string
          updated_at?: string
        }
      }
      qurban_packages: {
        Row: {
          id: string
          name: string
          weight_range: string
          price: number
          description: string | null
          image_url: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id: string
          name: string
          weight_range: string
          price: number
          description?: string | null
          image_url?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          name?: string
          weight_range?: string
          price?: number
          description?: string | null
          image_url?: string | null
          is_active?: boolean
        }
      }
      market_products: {
        Row: {
          id: string
          name: string
          category: 'Sheep' | 'Feed' | 'Medicine'
          price: number
          stock: number
          description: string | null
          image_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          category: 'Sheep' | 'Feed' | 'Medicine'
          price: number
          stock?: number
          description?: string | null
          image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          category?: 'Sheep' | 'Feed' | 'Medicine'
          price?: number
          stock?: number
          description?: string | null
          image_url?: string | null
          is_active?: boolean
          updated_at?: string
        }
      }
      app_config: {
        Row: {
          id: number
          feature_investment: boolean
          feature_qurban: boolean
          feature_marketplace: boolean
          updated_at: string
        }
        Insert: {
          id?: number
          feature_investment?: boolean
          feature_qurban?: boolean
          feature_marketplace?: boolean
          updated_at?: string
        }
        Update: {
          feature_investment?: boolean
          feature_qurban?: boolean
          feature_marketplace?: boolean
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_id: string
          customer_name: string
          customer_phone: string
          customer_address: string
          items: Json
          subtotal: number
          shipping_cost: number
          service_fee: number
          unique_code: number
          total: number
          payment_method: string
          bank_account: string | null
          status: 'pending' | 'paid' | 'processing' | 'shipped' | 'completed' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          customer_name: string
          customer_phone: string
          customer_address: string
          items: Json
          subtotal: number
          shipping_cost?: number
          service_fee?: number
          unique_code?: number
          total: number
          payment_method: string
          bank_account?: string | null
          status?: 'pending' | 'paid' | 'processing' | 'shipped' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          customer_name?: string
          customer_phone?: string
          customer_address?: string
          items?: Json
          subtotal?: number
          shipping_cost?: number
          service_fee?: number
          unique_code?: number
          total?: number
          payment_method?: string
          bank_account?: string | null
          status?: 'pending' | 'paid' | 'processing' | 'shipped' | 'completed' | 'cancelled'
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper types for easier use
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Cage = Database['public']['Tables']['cages']['Row']
export type SheepRow = Database['public']['Tables']['sheep']['Row']
export type WeightRecord = Database['public']['Tables']['weight_records']['Row']
export type InvestmentPackage = Database['public']['Tables']['investment_packages']['Row']
export type UserInvestment = Database['public']['Tables']['user_investments']['Row']
export type QurbanSaving = Database['public']['Tables']['qurban_savings']['Row']
export type QurbanPackage = Database['public']['Tables']['qurban_packages']['Row']
export type MarketProduct = Database['public']['Tables']['market_products']['Row']
export type AppConfig = Database['public']['Tables']['app_config']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
