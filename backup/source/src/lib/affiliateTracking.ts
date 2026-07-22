import { supabase } from './supabase';
export async function trackAffiliateClick(affiliateLinkId: string, pagePath: string, referrerDomain?: string) { try { await supabase.rpc('track_affiliate_click', { p_affiliate_link_id: affiliateLinkId, p_page_path: pagePath, p_referrer_domain: referrerDomain || null }); } catch {} }
