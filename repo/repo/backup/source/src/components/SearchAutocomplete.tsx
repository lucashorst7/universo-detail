import { useState, useEffect, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { suggestCatalogSearch } from '../lib/search';
import type { SearchSuggestion } from '../types';

export function SearchAutocomplete({ className = '', placeholder = 'Buscar produtos, marcas...' }: { className?: string; placeholder?: string; }) {
  const [query, setQuery] = useState(''); const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [open, setOpen] = useState(false); const [loading, setLoading] = useState(false); const [activeIndex, setActiveIndex] = useState(-1);
  const navigate = useNavigate(); const containerRef = useRef<HTMLDivElement>(null); const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) { setSuggestions([]); setOpen(false); return; }
    debounceRef.current = setTimeout(async () => { setLoading(true); try { const r = await suggestCatalogSearch(query); setSuggestions(r); setOpen(r.length > 0); } catch { setSuggestions([]); } finally { setLoading(false); } }, 250);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);
  useEffect(() => { const h = (e: MouseEvent) => { if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false); }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h); }, []);
  const submit = (q: string) => { const t = q.trim(); if (!t) return; setOpen(false); setActiveIndex(-1); navigate(`/busca?q=${encodeURIComponent(t)}`); };
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); submit(activeIndex >= 0 ? suggestions[activeIndex].suggestion : query); };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || !suggestions.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(i => (i + 1) % suggestions.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex(i => (i <= 0 ? suggestions.length - 1 : i - 1)); }
    else if (e.key === 'Escape') { setOpen(false); setActiveIndex(-1); }
    else if (e.key === 'Enter' && activeIndex >= 0) { e.preventDefault(); submit(suggestions[activeIndex].suggestion); }
  };
  return (
    <div ref={containerRef} className={`relative w-full max-w-xl ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input type="text" value={query} onChange={e => { setQuery(e.target.value); setActiveIndex(-1); }} onKeyDown={handleKeyDown} onFocus={() => suggestions.length > 0 && setOpen(true)} placeholder={placeholder} className="w-full rounded-lg border border-ink-700 bg-ink-800 py-2.5 pl-10 pr-10 text-sm text-white outline-none transition focus:border-gold-500" autoComplete="off" />
        {loading && <Loader2 size={18} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-500" />}
      </form>
      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-2 w-full overflow-hidden rounded-lg border border-ink-700 bg-ink-900 shadow-xl">
          {suggestions.map((s, i) => <li key={`${s.suggestion}-${i}`}><button type="button" onMouseEnter={() => setActiveIndex(i)} onClick={() => { setQuery(s.suggestion); submit(s.suggestion); }} className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition ${i === activeIndex ? 'bg-ink-800 text-gold-300' : 'text-gray-300 hover:bg-ink-800'}`}><Search size={14} className="text-gray-500" /><span className="truncate">{s.suggestion}</span>{s.frequency > 1 && <span className="ml-auto text-xs text-gray-600">{s.frequency}x</span>}</button></li>)}
        </ul>
      )}
    </div>
  );
}
