import { supabase } from './supabase';
export async function resolveProductSlug(slug: string) { const { data, error } = await supabase.rpc('resolve_public_product_slug', { p_slug: slug }); return error ? null : data as string | null; }
export async function resolveBrandSlug(slug: string) { const { data, error } = await supabase.rpc('resolve_public_brand_slug', { p_slug: slug }); return error ? null : data as string | null; }
export async function resolveCategorySlug(slug: string) { const { data, error } = await supabase.rpc('resolve_public_category_slug', { p_slug: slug }); return error ? null : data as string | null; }
