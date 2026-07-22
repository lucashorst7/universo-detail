-- ============================================================
-- POLÍTICAS RLS (Row Level Security)
-- ============================================================


-- admin_audit_logs
CREATE POLICY "Admins can read audit logs" ON public.admin_audit_logs
  FOR SELECT TO authenticated
  USING (is_admin());

-- admin_users
CREATE POLICY "admins_select_self" ON public.admin_users
  FOR SELECT TO authenticated
  USING ((auth.uid() = user_id));

-- affiliate_clicks
CREATE POLICY "admin_select_affiliate_clicks" ON public.affiliate_clicks
  FOR SELECT TO authenticated
  USING (is_admin());
CREATE POLICY "insert_valid_affiliate_clicks" ON public.affiliate_clicks
  FOR INSERT TO anon,authenticated
  WITH CHECK ((EXISTS ( SELECT 1\n   FROM affiliate_links al\n  WHERE ((al.id = affiliate_clicks.affiliate_link_id) AND (al.product_id = affiliate_clicks.product_id)))));

-- affiliate_links
CREATE POLICY "admins_delete_affiliate_links" ON public.affiliate_links
  FOR DELETE TO authenticated
  USING (is_admin());
CREATE POLICY "admins_insert_affiliate_links" ON public.affiliate_links
  FOR INSERT TO authenticated
  WITH CHECK (is_admin());
CREATE POLICY "admins_update_affiliate_links" ON public.affiliate_links
  FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
CREATE POLICY "anon_select_affiliate_links" ON public.affiliate_links
  FOR SELECT TO anon,authenticated
  USING (true);

-- banned_users
CREATE POLICY "admins_delete_banned" ON public.banned_users
  FOR DELETE TO authenticated
  USING (is_admin());
CREATE POLICY "admins_insert_banned" ON public.banned_users
  FOR INSERT TO authenticated
  WITH CHECK (is_admin());
CREATE POLICY "admins_select_banned" ON public.banned_users
  FOR SELECT TO authenticated
  USING (is_admin());
CREATE POLICY "users_select_own_ban" ON public.banned_users
  FOR SELECT TO authenticated
  USING ((user_id = auth.uid()));

-- brand_slug_history
CREATE POLICY "admins_read_brand_slug_history" ON public.brand_slug_history
  FOR SELECT TO authenticated
  USING (is_admin());

-- brands
CREATE POLICY "admins_delete_brands" ON public.brands
  FOR DELETE TO authenticated
  USING (is_admin());
CREATE POLICY "admins_insert_brands" ON public.brands
  FOR INSERT TO authenticated
  WITH CHECK (is_admin());
CREATE POLICY "admins_update_brands" ON public.brands
  FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
CREATE POLICY "anon_select_brands" ON public.brands
  FOR SELECT TO anon,authenticated
  USING (true);

-- categories
CREATE POLICY "admins_delete_categories" ON public.categories
  FOR DELETE TO authenticated
  USING (is_admin());
CREATE POLICY "admins_insert_categories" ON public.categories
  FOR INSERT TO authenticated
  WITH CHECK (is_admin());
CREATE POLICY "admins_update_categories" ON public.categories
  FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
CREATE POLICY "anon_select_categories" ON public.categories
  FOR SELECT TO anon,authenticated
  USING (true);

-- category_slug_history
CREATE POLICY "admins_read_category_slug_history" ON public.category_slug_history
  FOR SELECT TO authenticated
  USING (is_admin());

-- collection_items
CREATE POLICY "public_read_collection_items" ON public.collection_items
  FOR SELECT TO anon,authenticated
  USING (true);

-- collections
CREATE POLICY "public_read_collections" ON public.collections
  FOR SELECT TO anon,authenticated
  USING (true);

-- customer_reviews
CREATE POLICY "admins_delete_reviews" ON public.customer_reviews
  FOR DELETE TO authenticated
  USING (is_admin());
CREATE POLICY "admins_read_all_reviews" ON public.customer_reviews
  FOR SELECT TO authenticated
  USING (is_admin());
CREATE POLICY "admins_update_reviews" ON public.customer_reviews
  FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
CREATE POLICY "auth_insert_reviews" ON public.customer_reviews
  FOR INSERT TO authenticated
  WITH CHECK (((COALESCE(user_id, auth.uid()) = auth.uid()) AND (NOT (EXISTS ( SELECT 1\n   FROM banned_users\n  WHERE (banned_users.user_id = auth.uid()))))));
CREATE POLICY "public_read_active_reviews" ON public.customer_reviews
  FOR SELECT TO anon,authenticated
  USING ((is_deleted = false));
CREATE POLICY "users_select_own_reviews" ON public.customer_reviews
  FOR SELECT TO authenticated
  USING ((auth.uid() = user_id));

-- guide_products
CREATE POLICY "public_read_guide_products" ON public.guide_products
  FOR SELECT TO anon,authenticated
  USING (true);

-- guides
CREATE POLICY "public_read_guides" ON public.guides
  FOR SELECT TO anon,authenticated
  USING (true);

-- product_categories
CREATE POLICY "admins_delete_product_categories" ON public.product_categories
  FOR DELETE TO authenticated
  USING (is_admin());
CREATE POLICY "admins_insert_product_categories" ON public.product_categories
  FOR INSERT TO authenticated
  WITH CHECK (is_admin());
CREATE POLICY "admins_update_product_categories" ON public.product_categories
  FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
CREATE POLICY "anon_select_product_categories" ON public.product_categories
  FOR SELECT TO anon,authenticated
  USING (true);

-- product_slug_history
CREATE POLICY "admins_read_product_slug_history" ON public.product_slug_history
  FOR SELECT TO authenticated
  USING (is_admin());

-- products
CREATE POLICY "admins_delete_products" ON public.products
  FOR DELETE TO authenticated
  USING (is_admin());
CREATE POLICY "admins_insert_products" ON public.products
  FOR INSERT TO authenticated
  WITH CHECK (is_admin());
CREATE POLICY "admins_update_products" ON public.products
  FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
CREATE POLICY "public_select_published_products" ON public.products
  FOR SELECT TO anon,authenticated
  USING (((status = 'published'::product_status) AND ((publish_at IS NULL) OR (publish_at <= now()))));

-- runtime_error_logs
CREATE POLICY "admins_read_runtime_error_logs" ON public.runtime_error_logs
  FOR SELECT TO authenticated
  USING (is_admin());
CREATE POLICY "anon_insert_runtime_error_logs" ON public.runtime_error_logs
  FOR INSERT TO anon,authenticated
  WITH CHECK (((source IS NOT NULL) AND (message IS NOT NULL) AND ((actor_id IS NULL) OR (actor_id = auth.uid()))));
CREATE POLICY "auth_insert_runtime_error_logs" ON public.runtime_error_logs
  FOR INSERT TO authenticated
  WITH CHECK (((source IS NOT NULL) AND (message IS NOT NULL) AND ((actor_id IS NULL) OR (actor_id = auth.uid()))));

-- search_documents
CREATE POLICY "Public can read search documents" ON public.search_documents
  FOR SELECT TO anon,authenticated
  USING (((status = 'published'::text) AND ((publish_at IS NULL) OR (publish_at <= now()))));

-- search_insights
CREATE POLICY "admins_read_search_insights" ON public.search_insights
  FOR SELECT TO authenticated
  USING (is_admin());
CREATE POLICY "anon_insert_search_insights" ON public.search_insights
  FOR INSERT TO anon,authenticated
  WITH CHECK (((query_normalized IS NOT NULL) AND (result_count >= 0)));

-- spotlight
CREATE POLICY "public_read_spotlight" ON public.spotlight
  FOR SELECT TO anon,authenticated
  USING (true);

-- user_profiles
CREATE POLICY "admins_select_all_profiles" ON public.user_profiles
  FOR SELECT TO authenticated
  USING (is_admin());
CREATE POLICY "users_insert_own_profile" ON public.user_profiles
  FOR INSERT TO authenticated
  WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "users_select_own_profile" ON public.user_profiles
  FOR SELECT TO authenticated
  USING ((auth.uid() = user_id));
CREATE POLICY "users_update_own_profile" ON public.user_profiles
  FOR UPDATE TO authenticated
  USING ((auth.uid() = user_id))
  WITH CHECK ((auth.uid() = user_id));
