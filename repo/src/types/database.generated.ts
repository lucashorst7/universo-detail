import type { ProductStatus } from './database'

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
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
          mercado_livre_url: string | null
          shopee_url: string | null
          amazon_url: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          brand_id?: string | null
          category_id?: string | null
          short_description?: string | null
          description?: string | null
          specifications?: Record<string, string> | null
          usability?: string | null
          tips?: string | null
          image_url?: string | null
          gallery_images?: string[] | null
          rating?: number | null
          review_count?: number | null
          is_featured?: boolean | null
          is_new?: boolean | null
          tags?: string[] | null
          created_at?: string | null
          status?: ProductStatus
          publish_at?: string | null
          published_at?: string | null
          parent_product_id?: string | null
          variant_label?: string | null
          mercado_livre_url?: string | null
          shopee_url?: string | null
          amazon_url?: string | null
        }
        Update: Partial<Database['public']['Tables']['products']['Insert']>
      }
      brands: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          logo_url: string | null
          country: string | null
          is_featured: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          logo_url?: string | null
          country?: string | null
          is_featured?: boolean | null
        }
        Update: Partial<Database['public']['Tables']['brands']['Insert']>
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          icon: string | null
          cover_image: string | null
          display_order: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          icon?: string | null
          cover_image?: string | null
          display_order?: number | null
        }
        Update: Partial<Database['public']['Tables']['categories']['Insert']>
      }
      customer_reviews: {
        Row: {
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
        Insert: {
          id?: string
          product_id?: string | null
          author_name: string
          rating: number
          title?: string | null
          comment: string
          user_id?: string
          is_deleted?: boolean
        }
        Update: Partial<Database['public']['Tables']['customer_reviews']['Insert']>
      }
      admin_users: {
        Row: {
          id: string
          user_id: string
          created_at: string
        }
      }
    }
  }
}
