import { useEffect, useState, useCallback } from 'react';
const KEY = 'pd:compare'; const MAX = 3;
export function useCompare() {
  const [items, setItems] = useState<string[]>([]);
  useEffect(() => { try { const r = localStorage.getItem(KEY); if (r) setItems(JSON.parse(r)); } catch {} }, []);
  const toggle = useCallback((id: string) => setItems(prev => { let next: string[]; if (prev.includes(id)) { next = prev.filter(x => x !== id); } else { if (prev.length >= MAX) return prev; next = [...prev, id]; } try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {} return next; }), []);
  const has = useCallback((id: string) => items.includes(id), [items]);
  const clear = useCallback(() => { setItems([]); try { localStorage.removeItem(KEY); } catch {} }, []);
  return { items, toggle, has, clear, count: items.length, max: MAX };
}
