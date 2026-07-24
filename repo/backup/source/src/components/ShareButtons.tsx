import { useState } from 'react';
import { Share2, MessageCircle, Send, Link2, Check } from 'lucide-react';
export function ShareButtons({ url, title }: { url: string; title: string; }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => { try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {} };
  const eu = encodeURIComponent(url); const et = encodeURIComponent(title);
  return <div className="flex items-center gap-2"><span className="text-sm text-gray-400"><Share2 size={16} className="inline mr-1" /> Compartilhar:</span><a href={`https://wa.me/?text=${et}%20${eu}`} target="_blank" rel="noopener" className="rounded-lg bg-ink-800 p-2 text-gray-400 transition hover:text-sage-400"><MessageCircle size={18} /></a><a href={`https://t.me/share/url?url=${eu}&text=${et}`} target="_blank" rel="noopener" className="rounded-lg bg-ink-800 p-2 text-gray-400 transition hover:text-blue-400"><Send size={18} /></a><button onClick={copy} className="rounded-lg bg-ink-800 p-2 text-gray-400 transition hover:text-gold-400">{copied ? <Check size={18} className="text-sage-400" /> : <Link2 size={18} />}</button></div>;
}
