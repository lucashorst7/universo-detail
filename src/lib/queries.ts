import { supabase } from './supabase'
import type { Product, Category, Brand } from './supabase'

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order')
  if (error) throw error
  return data || []
}

export async function fetchBrands(): Promise<Brand[]> {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .order('name')
  if (error) throw error
  return data || []
}

export async function fetchFeaturedBrands(): Promise<Brand[]> {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .eq('is_featured', true)
    .order('name')
  if (error) throw error
  return data || []
}

export async function fetchFeaturedProducts(limit = 8): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_featured', true)
    .eq('status', 'published')
    .order('rating', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data || []
}

export async function fetchNewProducts(limit = 8): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_new', true)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data || []
}

export async function fetchProductsByCategory(categorySlug: string): Promise<Product[]> {
  const { data: category } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', categorySlug)
    .single()

  if (!category) return []

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category_id', category.id)
    .eq('status', 'published')
    .order('rating', { ascending: false })
  if (error) throw error
  return data || []
}

export async function fetchProductsByBrand(brandSlug: string): Promise<Product[]> {
  const { data: brand } = await supabase
    .from('brands')
    .select('id')
    .eq('slug', brandSlug)
    .single()

  if (!brand) return []

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('brand_id', brand.id)
    .eq('status', 'published')
    .order('rating', { ascending: false })
  if (error) throw error
  return data || []
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()
  if (error) return null
  return data
}

export async function fetchBrandBySlug(slug: string): Promise<Brand | null> {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error) return null
  return data
}

export async function fetchCategoryBySlug(slug: string): Promise<Category | null> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error) return null
  return data
}

export async function fetchProductReviews(productId: string) {
  const { data, error } = await supabase
    .from('customer_reviews')
    .select('*')
    .eq('product_id', productId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
  if (error) return []
  return data || []
}

export async function fetchProductAffiliateLinks(productId: string) {
  const { data, error } = await supabase
    .from('affiliate_links')
    .select('*')
    .eq('product_id', productId)
    .order('display_order')
  if (error) return []
  return data || []
}

export async function fetchSpotlight() {
  const { data, error } = await supabase
    .from('spotlight')
    .select('*, products(*)')
    .order('week_start', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) return null
  return data
}

export async function fetchCollections() {
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .order('display_order')
  if (error) return []
  return data || []
}

export async function fetchCollectionBySlug(slug: string) {
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error) return null
  return data
}

export async function fetchCollectionItems(collectionId: string) {
  const { data, error } = await supabase
    .from('collection_items')
    .select('*, products(*)')
    .eq('collection_id', collectionId)
    .order('display_order')
  if (error) return []
  return data || []
}

export async function fetchGuides() {
  const { data, error } = await supabase
    .from('guides')
    .select('*')
    .order('created_at')
  if (error) return []
  return data || []
}

export async function fetchGuideBySlug(slug: string) {
  const { data, error } = await supabase
    .from('guides')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error) return null
  return data
}

export async function fetchGuideProducts(guideId: string) {
  const { data, error } = await supabase
    .from('guide_products')
    .select('*, products(*)')
    .eq('guide_id', guideId)
    .order('display_order')
  if (error) return []
  return data || []
}

export async function searchProducts(query: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('search_documents')
    .select('entity_id')
    .ilike('search_text', `%${query}%`)
    .eq('entity_type', 'product')
    .limit(20)
  if (error || !data) return []

  const ids = data.map((d) => d.entity_id)
  if (ids.length === 0) return []

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .in('id', ids)
    .eq('status', 'published')
  return products || []
}

export function formatPrice(price: number | null, currency: string | null): string {
  if (price === null) return '—'
  const cur = currency || 'BRL'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: cur }).format(price)
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}
