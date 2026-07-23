import { AlertTriangle } from 'lucide-react'
interface Props { open: boolean; title?: string; message?: string; onConfirm: () => void; onCancel: () => void }

export default function DeleteConfirmModal({ open, title = 'Confirmar exclusão', message = 'Esta ação não pode ser desfeita.', onConfirm, onCancel }: Props) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-secondary-900 border border-secondary-700 rounded-2xl p-6 max-w-md w-full">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-error-500/10 p-3"><AlertTriangle className="h-6 w-6 text-error-500" /></div>
          <div className="flex-1"><h3 className="font-heading text-xl text-white">{title}</h3><p className="text-sm text-neutral-400 mt-1">{message}</p></div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-300 hover:text-white border border-secondary-700">Cancelar</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-lg text-sm font-medium bg-error-500 text-white hover:bg-error-700">Excluir</button>
        </div>
      </div>
    </div>
  )
}
