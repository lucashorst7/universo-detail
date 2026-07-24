import { Link } from 'react-router-dom';
import { GitCompare, X } from 'lucide-react';
import { useCompare } from '../lib/compare';
export function CompareBar() {
  const { count, clear, max } = useCompare();
  if (count === 0) return null;
  return <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-ink-700 bg-ink-900/95 backdrop-blur"><div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3"><div className="flex items-center gap-2 text-sm text-gray-300"><GitCompare className="h-5 w-5 text-gold-400" /><span>{count} de {max} produtos selecionados</span></div><div className="flex items-center gap-3"><button onClick={clear} className="text-sm text-gray-500 hover:text-white"><X size={16} className="inline" /> Limpar</button><Link to="/comparar" className="rounded-lg bg-gold-500 px-4 py-2 text-sm font-semibold text-ink-950 transition hover:bg-gold-400">Comparar agora</Link></div></div></div>;
}
