import { useEffect, useState, useCallback } from 'react';
const KEY = 'pd:wishlist';
export function useWishlist() {
  const [items, setItems] = useState<string[]>([]);
  useEffect(() => { try { const r = localStorage.getItem(KEY); if (r) setItems(JSON.parse(r)); } catch {} }, []);
  const toggle = useCallback((id: string) => setItems(prev => { const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]; try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {} return next; }), []);
  const has = useCallback((id: string) => items.includes(id), [items]);
  return { items, toggle, has, count: items.length };
}
