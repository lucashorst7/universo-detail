import { supabase } from './supabase'
import type { Product } from '../types'

export async function searchProducts(query: string): Promise<Product[]> {
  const { data, error } = await supabase.from('products').select('*, category:categories(*), brand:brands(*)').eq('status', 'published').is('parent_product_id', null).or(`name.ilike.%${query}%,description.ilike.%${query}%`).order('name').limit(20)
  if (error) throw error
  return (data ?? []) as Product[]
}
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase.from('products').select('*, category:categories(*), brand:brands(*)').eq('slug', slug).eq('status', 'published').maybeSingle()
  if (error) throw error
  return data as Product | null
}
export async function getProductVariants(parentId: string): Promise<Product[]> {
  const { data, error } = await supabase.from('products').select('*, category:categories(*), brand:brands(*)').eq('parent_product_id', parentId).eq('status', 'published').order('variant_label')
  if (error) throw error
  return (data ?? []) as Product[]
}
