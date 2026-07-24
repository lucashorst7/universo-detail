import type { SpecField } from '../lib/categorySpecs'
interface Props { fields: SpecField[]; specs: Record<string, unknown> | null | undefined }

export default function TechnicalSpecsCard({ fields, specs }: Props) {
  if (!fields.length) return null
  return (
    <div className="bg-secondary-900 rounded-xl overflow-hidden border border-secondary-800">
      <div className="bg-secondary-950 border-b border-primary-500/20 px-5 py-3"><h3 className="font-heading text-lg text-primary-400">Ficha Técnica</h3></div>
      <dl className="divide-y divide-secondary-800">
        {fields.map((field) => { const val = specs?.[field.key]; if (val === undefined || val === null || val === '') return null; return (<div key={field.key} className="flex items-center justify-between px-5 py-3"><dt className="text-sm text-neutral-400">{field.label}</dt><dd className="text-sm font-medium text-white">{field.type === 'boolean' ? (val ? 'Sim' : 'Não') : String(val)}{field.unit ? ` ${field.unit}` : ''}</dd></div>) })}
      </dl>
    </div>
  )
}
