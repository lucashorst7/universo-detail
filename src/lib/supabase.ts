import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

export type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  cover_image: string | null
  display_order: number
  created_at: string
}

export type Brand = {
  id: string
  name: string
  slug: string
  description: string | null
  logo_url: string | null
  country: string | null
  is_featured: boolean
  created_at: string
}

export type Product = {
  id: string
  name: string
  slug: string
  brand_id: string | null
  category_id: string | null
  short_description: string | null
  description: string | null
  specifications: Record<string, string> | null
  usability: string | null
  tips: string | null
  image_url: string | null
  gallery_images: string[] | null
  rating: number
  review_count: number
  is_featured: boolean
  is_new: boolean
  tags: string[]
  created_at: string
  status: string
  publish_at: string | null
  published_at: string | null
  parent_product_id: string | null
  variant_label: string | null
}

export type AffiliateLink = {
  id: string
  product_id: string
  marketplace: string
  url: string
  price: number | null
  currency: string | null
  is_primary: boolean
  display_order: number
}

export type CustomerReview = {
  id: string
  product_id: string
  author_name: string
  rating: number
  title: string
  comment: string
  created_at: string
  user_id: string | null
  is_deleted: boolean
}

export type Collection = {
  id: string
  slug: string
  title: string
  description: string | null
  cover_image: string | null
  display_order: number
  is_featured: boolean
  created_at: string
}

export type CollectionItem = {
  id: string
  collection_id: string
  product_id: string
  display_order: number
  note: string | null
  products?: Product | null
}

export type Guide = {
  id: string
  slug: string
  title: string
  description: string | null
  cover_image: string | null
  category_id: string | null
  created_at: string
}

export type GuideProduct = {
  id: string
  guide_id: string
  product_id: string
  match_label: string | null
  display_order: number
  products?: Product | null
}

export type Spotlight = {
  id: string
  product_id: string
  week_start: string
  editorial_text: string | null
  created_at: string
}

export type UserProfile = {
  id: string
  user_id: string
  display_name: string
  avatar_url: string | null
  created_at: string
  updated_at: string
  current_car: string | null
  favorite_shampoo: string | null
  favorite_wax: string | null
  favorite_tire_dressing: string | null
  favorite_brand_id: string | null
  email_verified: boolean
}

export type ProductWithBrand = Product & {
  brands?: Pick<Brand, 'name' | 'slug'> | null
}

export type ProductWithCategory = Product & {
  categories?: Pick<Category, 'name' | 'slug' | 'icon'> | null
  brands?: Pick<Brand, 'name' | 'slug'> | null
}
