import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Para operações administrativas
export const createAdminClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Tipos TypeScript
export interface Product {
  id: string
  name: string
  description?: string
  observations?: string
  price: number
  category_id?: string
  is_daily_product: boolean
  is_special_order: boolean
  photo1_url?: string
  photo2_url?: string
  photo3_url?: string
  youtube_embed_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
  categories?: Category
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  product_id?: string
  product_name: string
  product_price: number
  customer_name: string
  customer_whatsapp: string
  delivery_address: string
  payment_method: string
  delivery_date?: string
  extra_observations?: string
  status: string
  webhook_sent: boolean
  created_at: string
  updated_at: string
}

export interface Review {
  id: string
  customer_name: string
  rating: number
  comment: string
  photo_url?: string
  is_approved: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface SystemSetting {
  id: string
  key: string
  value?: string
  description?: string
  created_at: string
  updated_at: string
}

export interface NewsletterSubscriber {
  id: string
  name: string
  whatsapp: string
  is_active: boolean
  created_at: string
  updated_at: string
}