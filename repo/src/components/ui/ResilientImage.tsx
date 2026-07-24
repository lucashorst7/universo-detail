import { useState } from 'react';
interface Props { src: string | null | undefined; alt: string; className?: string; fallbackClassName?: string; }
export function ResilientImage({ src, alt, className = '', fallbackClassName = '' }: Props) {
  const [error, setError] = useState(false);
  if (!src || error) return <div className={`flex items-center justify-center bg-ink-800 ${className} ${fallbackClassName}`}><svg className="h-1/3 w-1/3 text-ink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>;
  return <img src={src} alt={alt} className={className} onError={() => setError(true)} loading="lazy" />;
}
