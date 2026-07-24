/**
 * Shared product catalog types.
 *
 * `brands` is intentionally a union on ProductCardProduct because different
 * Supabase queries may return it either as a single object (join) or as an
 * array.
 */

export type ProductStatus = 'draft' | 'published' | 'archived'

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  cover_image: string | null
  display_order: number
  created_at: string
}

export interface Brand {
  id: string
  name: string
  slug: string
  description: string | null
  logo_url: string | null
  country: string | null
  is_featured: boolean
  created_at: string
}

export interface AffiliateLink {
  id: string
  product_id: string
  marketplace: string
  url: string
  price: number | null
  is_primary: boolean
}

export interface ProductVariant {
  id: string
  name: string
  slug: string
  image_url: string | null
  variant_label: string | null
  short_description: string | null
  affiliate_links: AffiliateLink[]
}

export interface Product {
  id: string
  name: string
  slug: string
  short_description: string | null
  description: string | null
  image_url: string | null
  gallery_images: string[]
  brand_id: string
  category_id: string
  status: ProductStatus
  rating: number
  review_count: number
  is_new: boolean
  is_featured: boolean
  specifications: Record<string, string> | null
  usability: string | null
  tips: string | null
  created_at: string
  parent_product_id: string | null
  variant_label: string | null
}

export interface ProductDetail extends Product {
  brand: Brand
  category: Category
  affiliate_links: AffiliateLink[]
  variants: ProductVariant[]
}

export interface ProductCardProduct {
  id: string
  name: string
  slug: string
  short_description: string | null
  image_url: string | null
  rating: number
  review_count: number
  is_new: boolean
  is_featured: boolean
  brands: { name: string } | { name: string }[]
  variant_label: string | null
}

export interface CustomerReview {
  id: string
  product_id: string
  author_name: string
  rating: number
  title: string | null
  comment: string | null
  created_at: string
}
