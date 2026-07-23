export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  cover_image: string | null
  display_order: number | null
  created_at: string
}

export interface Brand {
  id: string
  name: string
  slug: string
  description: string | null
  logo_url: string | null
  country: string | null
  is_featured: boolean | null
  created_at: string
}

export type ProductStatus = 'draft' | 'review' | 'published' | 'archived'

export interface Product {
  id: string
  name: string
  slug: string
  brand_id: string | null
  category_id: string | null
  short_description: string | null
  description: string | null
  specifications: Record<string, unknown>[] | null
  technical_specs: Record<string, unknown> | null
  volumetries: string[] | null
  usability: string | null
  tips: string | null
  image_url: string | null
  gallery_images: string[] | null
  rating: number | null
  review_count: number | null
  is_featured: boolean | null
  is_new: boolean | null
  tags: string[] | null
  created_at: string | null
  status: ProductStatus
  publish_at: string | null
  published_at: string | null
  parent_product_id: string | null
  variant_label: string | null
}

export interface ProductWithRelations extends Product {
  brand?: Brand | null
  category?: Category | null
}

export interface CustomerReview {
  id: string
  product_id: string | null
  author_name: string
  rating: number
  title: string | null
  comment: string
  created_at: string
  user_id: string
  is_deleted: boolean
  deleted_by: string | null
  deleted_at: string | null
}

export interface BannedUser {
  id: string
  user_id: string
  reason: string
  banned_by: string
  created_at: string
}

export interface UserProfile {
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

export interface AdminUser {
  id: string
  user_id: string
  email: string
  created_at: string
}
