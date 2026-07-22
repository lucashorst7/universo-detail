-- ============================================================
-- TRIGGERS
-- ============================================================

CREATE TRIGGER audit_affiliate_links_changes AFTER INSERT OR DELETE OR UPDATE ON public.affiliate_links FOR EACH ROW EXECUTE FUNCTION capture_admin_audit_log();
CREATE TRIGGER audit_brands_changes AFTER INSERT OR DELETE OR UPDATE ON public.brands FOR EACH ROW EXECUTE FUNCTION capture_admin_audit_log();
CREATE TRIGGER preserve_brand_slug_history_trigger BEFORE INSERT OR UPDATE OF slug ON public.brands FOR EACH ROW EXECUTE FUNCTION preserve_brand_slug_history();
CREATE TRIGGER refresh_brand_search_documents AFTER UPDATE OF name ON public.brands FOR EACH ROW WHEN ((old.name IS DISTINCT FROM new.name)) EXECUTE FUNCTION refresh_search_documents_for_taxonomy();
CREATE TRIGGER audit_categories_changes AFTER INSERT OR DELETE OR UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION capture_admin_audit_log();
CREATE TRIGGER preserve_category_slug_history_trigger BEFORE INSERT OR UPDATE OF slug ON public.categories FOR EACH ROW EXECUTE FUNCTION preserve_category_slug_history();
CREATE TRIGGER refresh_category_search_documents AFTER UPDATE OF name ON public.categories FOR EACH ROW WHEN ((old.name IS DISTINCT FROM new.name)) EXECUTE FUNCTION refresh_search_documents_for_taxonomy();
CREATE TRIGGER audit_products_changes AFTER INSERT OR DELETE OR UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION capture_admin_audit_log();
CREATE TRIGGER set_product_published_at_trigger BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION set_product_published_at();
CREATE TRIGGER sync_product_search_document_trigger AFTER INSERT OR DELETE OR UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION sync_product_search_document();
CREATE TRIGGER trg_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
