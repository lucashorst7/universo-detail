import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import type { SpecField } from '../lib/categorySpecs'
import './techspecs.css'

interface TechSpecsFormProps {
  fields: SpecField[]
  values: Record<string, unknown>
  onChange: (key: string, value: unknown) => void
  subtype?: string
  hasSubtype: boolean
  subtypeLabel?: string
  subtypeOptions?: string[]
  onSubtypeChange: (subtype: string) => void
}

const PRESET_VOLUMETRIES = ['200 ml', '500 ml', '1 L', '1,5 L', '5 L', '20 L', '500 g', 'unidade', 'kit', 'Não se aplica']

export function TechSpecsForm({ fields, values, onChange, subtype, hasSubtype, subtypeLabel, subtypeOptions, onSubtypeChange }: TechSpecsFormProps) {
  const [customVolumetry, setCustomVolumetry] = useState('')

  function toggleMulti(key: string, option: string) {
    const current = (values[key] as string[]) ?? []
    if (current.includes(option)) {
      onChange(key, current.filter(v => v !== option))
    } else {
      onChange(key, [...current, option])
    }
  }

  function addVolumetry(option: string) {
    if (!option.trim()) return
    const current = (values['volumetries'] as string[]) ?? []
    if (!current.includes(option)) {
      onChange('volumetries', [...current, option])
    }
    setCustomVolumetry('')
  }

  function removeVolumetry(option: string) {
    const current = (values['volumetries'] as string[]) ?? []
    onChange('volumetries', current.filter(v => v !== option))
  }

  function addDilutionRow(key: string) {
    const current = (values[key] as { situation: string; ratio: string }[]) ?? []
    onChange(key, [...current, { situation: '', ratio: '' }])
  }

  function updateDilutionRow(key: string, idx: number, field: 'situation' | 'ratio', val: string) {
    const current = (values[key] as { situation: string; ratio: string }[]) ?? []
    const updated = [...current]
    updated[idx] = { ...updated[idx], [field]: val }
    onChange(key, updated)
  }

  function removeDilutionRow(key: string, idx: number) {
    const current = (values[key] as { situation: string; ratio: string }[]) ?? []
    onChange(key, current.filter((_, i) => i !== idx))
  }

  return (
    <div className="techspecs-form">
      {/* Volumetries - common to all products */}
      <div className="techspecs-section">
        <h4 className="techspecs-section-title">Volumetrias / Apresentações</h4>
        <div className="techspecs-volumetry-presets">
          {PRESET_VOLUMETRIES.map(v => (
            <button
              key={v}
              type="button"
              className="techspecs-chip-btn"
              onClick={() => addVolumetry(v)}
            >
              <Plus size={12} /> {v}
            </button>
          ))}
        </div>
        <div className="techspecs-volumetry-custom">
          <input
            type="text"
            value={customVolumetry}
            onChange={(e) => setCustomVolumetry(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addVolumetry(customVolumetry) } }}
            placeholder="Outra apresentação..."
          />
          <button type="button" className="btn btn-outline btn-sm" onClick={() => addVolumetry(customVolumetry)}>Adicionar</button>
        </div>
        {((values['volumetries'] as string[]) ?? []).length > 0 && (
          <div className="techspecs-chip-list">
            {(values['volumetries'] as string[]).map(v => (
              <span key={v} className="techspecs-chip">
                {v}
                <button type="button" onClick={() => removeVolumetry(v)}><X size={12} /></button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Subtype selector */}
      {hasSubtype && subtypeOptions && subtypeOptions.length > 0 && (
        <div className="techspecs-section">
          <div className="form-group">
            <label>{subtypeLabel ?? 'Tipo de produto'}</label>
            <select value={subtype ?? ''} onChange={(e) => onSubtypeChange(e.target.value)}>
              <option value="">Selecione...</option>
              {subtypeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Conditional fields */}
      {fields.length > 0 && (
        <div className="techspecs-section">
          <h4 className="techspecs-section-title">Ficha Técnica</h4>
          <div className="techspecs-fields">
            {fields.map(field => {
              const val = values[field.key]
              return (
                <div key={field.key} className="form-group">
                  <label>{field.label}</label>
                  {field.type === 'text' && (
                    <input
                      type="text"
                      value={(val as string) ?? ''}
                      onChange={(e) => onChange(field.key, e.target.value)}
                      placeholder={field.placeholder ?? ''}
                    />
                  )}
                  {field.type === 'longtext' && (
                    <textarea
                      value={(val as string) ?? ''}
                      onChange={(e) => onChange(field.key, e.target.value)}
                      placeholder={field.placeholder ?? ''}
                      rows={3}
                    />
                  )}
                  {field.type === 'number' && (
                    <input
                      type="text"
                      value={(val as string) ?? ''}
                      onChange={(e) => onChange(field.key, e.target.value)}
                      placeholder={field.placeholder ?? ''}
                    />
                  )}
                  {field.type === 'select' && field.options && (
                    <select value={(val as string) ?? ''} onChange={(e) => onChange(field.key, e.target.value)}>
                      <option value="">Não informado</option>
                      {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  )}
                  {field.type === 'boolean' && (
                    <select value={(val as string) ?? ''} onChange={(e) => onChange(field.key, e.target.value)}>
                      <option value="">Não informado</option>
                      <option value="Sim">Sim</option>
                      <option value="Não">Não</option>
                    </select>
                  )}
                  {field.type === 'multiselect' && field.options && (
                    <div className="techspecs-multiselect">
                      {field.options.map(opt => {
                        const selected = ((val as string[]) ?? []).includes(opt)
                        return (
                          <button
                            key={opt}
                            type="button"
                            className={`techspecs-chip-btn ${selected ? 'selected' : ''}`}
                            onClick={() => toggleMulti(field.key, opt)}
                          >
                            {opt}
                          </button>
                        )
                      })}
                    </div>
                  )}
                  {field.type === 'dilution' && (
                    <div className="techspecs-dilution">
                      {((val as { situation: string; ratio: string }[]) ?? []).map((row, idx) => (
                        <div key={idx} className="techspecs-dilution-row">
                          <input
                            type="text"
                            value={row.situation}
                            onChange={(e) => updateDilutionRow(field.key, idx, 'situation', e.target.value)}
                            placeholder="Situação (ex: Sujeira leve)"
                          />
                          <input
                            type="text"
                            value={row.ratio}
                            onChange={(e) => updateDilutionRow(field.key, idx, 'ratio', e.target.value)}
                            placeholder="Proporção (ex: 1:100)"
                          />
                          <button type="button" className="techspecs-dilution-remove" onClick={() => removeDilutionRow(field.key, idx)}>
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                      <button type="button" className="btn btn-outline btn-sm" onClick={() => addDilutionRow(field.key)}>
                        <Plus size={14} /> Adicionar diluição
                      </button>
                    </div>
                  )}
                  {field.help && <span className="techspecs-help">{field.help}</span>}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
