import type { SpecField } from '../lib/categorySpecs'
import './techspecs.css'

interface TechSpecsDisplayProps {
  fields: SpecField[]
  specs: Record<string, unknown> | null | undefined
  volumetries: string[] | null | undefined
  subtypeLabel?: string
  subtype?: string
}

function isNotEmpty(val: unknown): boolean {
  if (val === undefined || val === null || val === '') return false
  if (Array.isArray(val) && val.length === 0) return false
  return true
}

function formatValue(field: SpecField, val: unknown): React.ReactNode {
  if (field.type === 'multiselect' && Array.isArray(val)) {
    return (
      <div className="techspecs-multiselect-display">
        {(val as string[]).map(v => <span key={v} className="techspecs-multiselect-tag">{v}</span>)}
      </div>
    )
  }
  if (field.type === 'dilution' && Array.isArray(val)) {
    const rows = val as { situation: string; ratio: string }[]
    return (
      <div className="techspecs-dilution-display">
        {rows.filter(r => r.situation || r.ratio).map((r, i) => (
          <div key={i} className="techspecs-dilution-line">
            {r.situation && <span>{r.situation}: </span>}
            {r.ratio}
          </div>
        ))}
      </div>
    )
  }
  return String(val)
}

export function TechSpecsDisplay({ fields, specs, volumetries, subtypeLabel, subtype }: TechSpecsDisplayProps) {
  const visibleFields = fields.filter(f => isNotEmpty(specs?.[f.key]))
  const hasVolumetries = isNotEmpty(volumetries)
  const hasSubtype = isNotEmpty(subtype)

  if (visibleFields.length === 0 && !hasVolumetries && !hasSubtype) return null

  return (
    <section className="product-techspecs">
      <div className="techspecs-display">
        <div className="techspecs-display-head">
          <h2>Ficha Técnica</h2>
        </div>
        <div className="techspecs-display-body">
          {hasVolumetries && (
            <div className="techspecs-row">
              <span className="techspecs-row-label">Volumetrias / Apresentações</span>
              <span className="techspecs-row-value">
                <div className="techspecs-volumetry-display">
                  {(volumetries as string[]).map(v => <span key={v} className="techspecs-volumetry-chip">{v}</span>)}
                </div>
              </span>
            </div>
          )}
          {hasSubtype && subtypeLabel && (
            <div className="techspecs-row">
              <span className="techspecs-row-label">{subtypeLabel}</span>
              <span className="techspecs-row-value">{subtype}</span>
            </div>
          )}
          {visibleFields.map(field => {
            const val = specs![field.key]
            return (
              <div key={field.key} className="techspecs-row">
                <span className="techspecs-row-label">{field.label}</span>
                <span className="techspecs-row-value">{formatValue(field, val)}</span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
