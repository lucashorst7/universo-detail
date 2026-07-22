import { AlertTriangle, RefreshCw } from 'lucide-react';
export function ErrorState({ title = 'Algo deu errado', message = 'Tente novamente em instantes.', onRetry }: { title?: string; message?: string; onRetry?: () => void; }) {
  return <div className="flex flex-col items-center justify-center gap-4 py-20 text-center"><div className="rounded-2xl bg-red-950/30 p-4"><AlertTriangle className="h-8 w-8 text-red-400" /></div><h3 className="text-xl font-bold text-white">{title}</h3><p className="max-w-md text-sm text-gray-400">{message}</p>{onRetry && <button onClick={onRetry} className="mt-2 inline-flex items-center gap-2 rounded-lg bg-gold-500 px-4 py-2 text-sm font-semibold text-ink-950 transition hover:bg-gold-400"><RefreshCw className="h-4 w-4" /> Tentar novamente</button>}</div>;
}
