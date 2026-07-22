export type ProductStatus = 'draft' | 'published'
export interface Category { id: string; name: string; slug: string; description?: string | null; icon_name?: string | null; icon?: string | null; display_order?: number | null }
export interface Brand { id: string; name: string; slug: string; country?: string | null; description?: string | null; logo_url?: string | null }
export interface ProductVariant { id: string; name: string; variant_label: string }
export interface Product {
  id: string; name: string; slug: string; description?: string | null; status: ProductStatus;
  category_id: string; brand_id: string; image_url?: string | null; affiliate_url?: string | null;
  specs?: Record<string, unknown> | null; category?: Category | null; brand?: Brand | null;
  parent_product_id?: string | null; variant_label?: string | null; created_at: string; updated_at?: string | null;
}
export interface Comment { id: string; product_id: string; user_name: string; content: string; rating: number; created_at: string }
export interface Guide { id: string; title: string; slug: string; content: string; excerpt?: string | null; category?: string | null; created_at: string; updated_at?: string | null }
export interface Collection { id: string; name: string; slug: string; description?: string | null; product_ids: string[]; created_at: string }
export interface BlogPost { id: string; title: string; slug: string; content: string; excerpt?: string | null; cover_image_url?: string | null; author?: string | null; published_at: string }
export interface AuditLogEntry { id: string; action: string; entity_type: string; entity_id: string; user_email: string; created_at: string }
