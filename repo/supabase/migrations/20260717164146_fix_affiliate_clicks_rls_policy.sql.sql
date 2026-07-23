/*
# Fix affiliate_clicks INSERT policy — replace WITH CHECK (true)

## Problem
The `anon_insert_affiliate_clicks` policy was created with `WITH CHECK (true)`,
which bypasses RLS entirely for INSERT. Any anon/authenticated caller could
insert arbitrary rows with fake affiliate_link_ids or product_ids.

## Fix
Replace with a policy that validates the affiliate_link_id exists in
affiliate_links AND the product_id matches the one on that affiliate link.
This matches what track_affiliate_click() already does internally, but now
RLS enforces it independently — even if a caller bypasses the function
and inserts directly via the REST API.
*/

DROP POLICY IF EXISTS "anon_insert_affiliate_clicks" ON affiliate_clicks;

CREATE POLICY "insert_valid_affiliate_clicks" ON affiliate_clicks FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.affiliate_links al
      WHERE al.id = affiliate_clicks.affiliate_link_id
        AND al.product_id = affiliate_clicks.product_id
    )
  );
