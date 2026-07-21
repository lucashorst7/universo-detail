import { supabase, isConfigured } from './supabase'
import type { Category, Brand, ProductWithRelations, CustomerReview } from '../types/database'

export async function fetchCategories(): Promise<Category[]> {
  if (!isConfigured) return []
  const { data, error } = await supabase.from('categories').select('*').order('name')
  if (error) { console.error('fetchCategories', error); return [] }
  return (data || []) as Category[]
}

export async function fetchBrands(): Promise<Brand[]> {
  if (!isConfigured) return []
  const { data, error } = await supabase.from('brands').select('*').order('name')
  if (error) { console.error('fetchBrands', error); return [] }
  return (data || []) as Brand[]
}

export async function fetchProducts(): Promise<ProductWithRelations[]> {
  if (!isConfigured) return []
  const { data, error } = await supabase
    .from('products')
    .select('*, brand:brand_id(*), category:category_id(*)')
    .eq('status', 'published')
    .is('parent_product_id', null)
    .order('created_at', { ascending: false })
  if (error) { console.error('fetchProducts', error); return [] }
  return (data || []) as ProductWithRelations[]
}

export async function fetchProductsByCategory(slug: string): Promise<ProductWithRelations[]> {
  if (!isConfigured) return []
  const { data: cat, error: catErr } = await supabase.from('categories').select('id').eq('slug', slug).maybeSingle()
  if (catErr || !cat) return []
  const { data, error } = await supabase
    .from('products')
    .select('*, brand:brand_id(*), category:category_id(*)')
    .eq('status', 'published')
    .eq('category_id', (cat as { id: string }).id)
    .is('parent_product_id', null)
    .order('created_at', { ascending: false })
  if (error) { console.error('fetchProductsByCategory', error); return [] }
  return (data || []) as ProductWithRelations[]
}

export async function fetchProductsByBrand(slug: string): Promise<ProductWithRelations[]> {
  if (!isConfigured) return []
  const { data: brand, error: brandErr } = await supabase.from('brands').select('id').eq('slug', slug).maybeSingle()
  if (brandErr || !brand) return []
  const { data, error } = await supabase
    .from('products')
    .select('*, brand:brand_id(*), category:category_id(*)')
    .eq('status', 'published')
    .eq('brand_id', (brand as { id: string }).id)
    .is('parent_product_id', null)
    .order('created_at', { ascending: false })
  if (error) { console.error('fetchProductsByBrand', error); return [] }
  return (data || []) as ProductWithRelations[]
}

export async function fetchProductBySlug(slug: string): Promise<ProductWithRelations | null> {
  if (!isConfigured) return null
  const { data, error } = await supabase
    .from('products')
    .select('*, brand:brand_id(*), category:category_id(*)')
    .eq('slug', slug)
    .eq('status', 'published')
    .is('parent_product_id', null)
    .maybeSingle()
  if (error) { console.error('fetchProductBySlug', error); return null }
  return data as ProductWithRelations | null
}

export async function fetchReviewsByProduct(productId: string): Promise<CustomerReview[]> {
  if (!isConfigured) return []
  const { data, error } = await supabase
    .from('customer_reviews')
    .select('*')
    .eq('product_id', productId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
  if (error) { console.error('fetchReviewsByProduct', error); return [] }
  return (data || []) as CustomerReview[]
}

export async function searchProducts(query: string): Promise<ProductWithRelations[]> {
  if (!isConfigured || !query.trim()) return []
  const { data, error } = await supabase
    .from('products')
    .select('*, brand:brand_id(*), category:category_id(*)')
    .eq('status', 'published')
    .is('parent_product_id', null)
    .ilike('name', `%${query}%`)
    .order('created_at', { ascending: false })
    .limit(20)
  if (error) { console.error('searchProducts', error); return [] }
  return (data || []) as ProductWithRelations[]
}

export async function fetchSiteCounts(): Promise<{ products: number; brands: number; users: number }> {
  if (!isConfigured) return { products: 0, brands: 0, users: 0 }
  try {
    const [p, b, u] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'published').is('parent_product_id', null),
      supabase.from('brands').select('*', { count: 'exact', head: true }),
      supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
    ])
    return { products: p.count ?? 0, brands: b.count ?? 0, users: u.count ?? 0 }
  } catch {
    return { products: 0, brands: 0, users: 0 }
  }
}

export type { Category, Brand, ProductWithRelations, CustomerReview }
