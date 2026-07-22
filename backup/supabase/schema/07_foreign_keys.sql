-- ============================================================
-- CHAVES ESTRANGEIRAS (Foreign Keys)
-- ============================================================

ALTER TABLE public.affiliate_clicks ADD CONSTRAINT affiliate_clicks_affiliate_link_id_fkey FOREIGN KEY (affiliate_link_id) REFERENCES public.affiliate_links(id);
ALTER TABLE public.affiliate_clicks ADD CONSTRAINT affiliate_clicks_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);
ALTER TABLE public.affiliate_links ADD CONSTRAINT affiliate_links_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);
ALTER TABLE public.brand_slug_history ADD CONSTRAINT brand_slug_history_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id);
ALTER TABLE public.category_slug_history ADD CONSTRAINT category_slug_history_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);
ALTER TABLE public.collection_items ADD CONSTRAINT collection_items_collection_id_fkey FOREIGN KEY (collection_id) REFERENCES public.collections(id);
ALTER TABLE public.collection_items ADD CONSTRAINT collection_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);
ALTER TABLE public.customer_reviews ADD CONSTRAINT customer_reviews_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);
ALTER TABLE public.guide_products ADD CONSTRAINT guide_products_guide_id_fkey FOREIGN KEY (guide_id) REFERENCES public.guides(id);
ALTER TABLE public.guide_products ADD CONSTRAINT guide_products_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);
ALTER TABLE public.guides ADD CONSTRAINT guides_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);
ALTER TABLE public.product_categories ADD CONSTRAINT product_categories_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);
ALTER TABLE public.product_categories ADD CONSTRAINT product_categories_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);
ALTER TABLE public.product_slug_history ADD CONSTRAINT product_slug_history_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);
ALTER TABLE public.products ADD CONSTRAINT products_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id);
ALTER TABLE public.products ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);
ALTER TABLE public.products ADD CONSTRAINT products_parent_product_id_fkey FOREIGN KEY (parent_product_id) REFERENCES public.products(id);
ALTER TABLE public.spotlight ADD CONSTRAINT spotlight_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);
ALTER TABLE public.user_profiles ADD CONSTRAINT user_profiles_favorite_brand_id_fkey FOREIGN KEY (favorite_brand_id) REFERENCES public.brands(id);

-- ============================================================
-- CONSTRAINTS UNIQUE
-- ============================================================

ALTER TABLE public.admin_users ADD CONSTRAINT admin_users_user_id_key UNIQUE (user_id);
ALTER TABLE public.banned_users ADD CONSTRAINT banned_users_user_id_key UNIQUE (user_id);
ALTER TABLE public.brands ADD CONSTRAINT brands_slug_key UNIQUE (slug);
ALTER TABLE public.categories ADD CONSTRAINT categories_slug_key UNIQUE (slug);
ALTER TABLE public.collection_items ADD CONSTRAINT collection_items_collection_id_product_id_key UNIQUE (collection_id);
ALTER TABLE public.collections ADD CONSTRAINT collections_slug_key UNIQUE (slug);
ALTER TABLE public.guide_products ADD CONSTRAINT guide_products_guide_id_product_id_key UNIQUE (product_id);
ALTER TABLE public.guides ADD CONSTRAINT guides_slug_key UNIQUE (slug);
ALTER TABLE public.products ADD CONSTRAINT products_slug_key UNIQUE (slug);
ALTER TABLE public.runtime_error_logs ADD CONSTRAINT runtime_error_logs_incident_code_key UNIQUE (incident_code);
ALTER TABLE public.search_documents ADD CONSTRAINT search_documents_entity_unique UNIQUE (entity_type);
ALTER TABLE public.search_documents ADD CONSTRAINT search_documents_slug_unique UNIQUE (slug);
ALTER TABLE public.user_profiles ADD CONSTRAINT user_profiles_user_id_key UNIQUE (user_id);
