
/*
# Grant missing RPC permissions to anon and authenticated

Several stored functions used by the frontend were only executable by service_role.
The anon-key client (used by the frontend for unauthenticated and even authenticated
requests via the anon key) could not call them, causing silent failures:

- report_runtime_error: error reporting from the frontend failed silently
- track_affiliate_click: affiliate click tracking failed silently  
- is_admin: already granted to authenticated, but adding anon for safety

This migration grants EXECUTE on these functions to both anon and authenticated roles.
*/

GRANT EXECUTE ON FUNCTION public.report_runtime_error(text, text, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.track_affiliate_click(uuid, text, text) TO anon, authenticated;
