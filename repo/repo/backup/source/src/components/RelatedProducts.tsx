import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { ProductCardProduct } from '../types';
import { ProductCard } from './ProductCard';
export function RelatedProducts({ categoryId, excludeId }: { categoryId: string; excludeId: string; }) {
  const [products, setProducts] = useState<ProductCardProduct[]>([]); const [loading, setLoading] = useState(true);
  useEffect(() => { (async () => { const { data } = await supabase.from('products').select(`id, name, slug, short_description, image_url, rating, review_count, is_new, is_featured, variant_label, category_id, brands:brand_id(name)`).eq('category_id', categoryId).eq('status', 'published').neq('id', excludeId).limit(4); setProducts((data || []) as unknown as ProductCardProduct[]); setLoading(false); })(); }, [categoryId, excludeId]);
  if (loading) return <div className="h-48 shimmer rounded-xl" />;
  if (!products.length) return null;
  return <div><h2 className="mb-4 text-xl font-bold text-white">Produtos relacionados</h2><div className="grid grid-cols-2 gap-4 sm:grid-cols-4">{products.map(p => <ProductCard key={p.id} product={p} />)}</div></div>;
}
