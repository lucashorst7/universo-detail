import { useState, type FormEvent } from 'react'
import { Calculator, Droplet, FlaskConical, RotateCcw } from 'lucide-react'
import './calculator.css'

interface CalcResult {
  product: number
  water: number
  total: number
  ratioProduct: number
  ratioWater: number
  productPercent: number
  waterPercent: number
}

export function calculateDilution(
  productParts: number,
  waterParts: number,
  totalVolume: number
): CalcResult {
  const produtoExato = (totalVolume * productParts) / (productParts + waterParts)
  const produtoFinal = Math.ceil(produtoExato)
  const aguaFinal = totalVolume - produtoFinal
  const productPercent = (productParts / (productParts + waterParts)) * 100
  const waterPercent = (waterParts / (productParts + waterParts)) * 100
  return {
    product: produtoFinal,
    water: aguaFinal,
    total: totalVolume,
    ratioProduct: productParts,
    ratioWater: waterParts,
    productPercent,
    waterPercent,
  }
}

const QUICK_RATIOS = [5, 10, 20, 30, 50, 80, 100, 200, 300, 500, 1000]

function formatBR(value: number): string {
  return value.toLocaleString('pt-BR')
}

export function CalculatorPage() {
  const [productParts, setProductParts] = useState('1')
  const [waterParts, setWaterParts] = useState('')
  const [totalVolume, setTotalVolume] = useState('')
  const [result, setResult] = useState<CalcResult | null>(null)
  const [errors, setErrors] = useState<{ product?: string; water?: string; volume?: string }>({})

  function validate(): boolean {
    const errs: { product?: string; water?: string; volume?: string } = {}
    const p = Number(productParts)
    const a = Number(waterParts)
    const v = Number(totalVolume)

    if (productParts.trim() === '') errs.product = 'Informe a proporção de produto.'
    else if (Number.isNaN(p)) errs.product = 'Informe somente valores numéricos válidos.'
    else if (p <= 0) errs.product = 'Os valores devem ser maiores que zero.'

    if (waterParts.trim() === '') errs.water = 'Informe a proporção de água.'
    else if (Number.isNaN(a)) errs.water = 'Informe somente valores numéricos válidos.'
    else if (a <= 0) errs.water = 'Os valores devem ser maiores que zero.'

    if (totalVolume.trim() === '') errs.volume = 'Informe o volume total do recipiente.'
    else if (Number.isNaN(v)) errs.volume = 'Informe somente valores numéricos válidos.'
    else if (v <= 0) errs.volume = 'Os valores devem ser maiores que zero.'
    else if (v < 1) errs.volume = 'O volume deve ser de no mínimo 1 ml.'

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return
    const p = Number(productParts)
    const a = Number(waterParts)
    const v = Number(totalVolume)
    const calc = calculateDilution(p, a, v)
    if (Number.isNaN(calc.product) || !Number.isFinite(calc.product) || calc.water < 0) {
      setErrors({ volume: 'Não foi possível calcular com os valores informados.' })
      return
    }
    setResult(calc)
  }

  function handleClear() {
    setProductParts('1')
    setWaterParts('')
    setTotalVolume('')
    setResult(null)
    setErrors({})
  }

  function setQuickRatio(water: number) {
    setProductParts('1')
    setWaterParts(String(water))
    setResult(null)
    setErrors({})
  }

  return (
    <div className="container calc-page">
      <div className="calc-header">
        <h1 className="calc-title">
          <Calculator size={28} /> Calculadora de Diluição
        </h1>
        <p className="calc-desc">
          Calcule a quantidade correta de produto e água para preparar soluções de limpeza automotiva.
        </p>
      </div>

      <div className="calc-grid">
        <form className="calc-form" onSubmit={handleSubmit} noValidate>
          <div className="calc-section">
            <label className="calc-label">Proporção de diluição</label>
            <p className="calc-help">
              Na proporção 1:100, utiliza-se 1 parte de produto para 100 partes de água.
            </p>
            <div className="calc-ratio-row">
              <div className="calc-field">
                <label htmlFor="calc-product" className="calc-field-label">Produto</label>
                <input
                  id="calc-product"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  value={productParts}
                  onChange={(e) => setProductParts(e.target.value)}
                  aria-invalid={!!errors.product}
                  aria-describedby={errors.product ? 'calc-product-err' : undefined}
                />
                {errors.product && <span id="calc-product-err" className="calc-error">{errors.product}</span>}
              </div>
              <span className="calc-ratio-sep">:</span>
              <div className="calc-field">
                <label htmlFor="calc-water" className="calc-field-label">Água</label>
                <input
                  id="calc-water"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  value={waterParts}
                  onChange={(e) => setWaterParts(e.target.value)}
                  aria-invalid={!!errors.water}
                  aria-describedby={errors.water ? 'calc-water-err' : undefined}
                />
                {errors.water && <span id="calc-water-err" className="calc-error">{errors.water}</span>}
              </div>
            </div>
            <div className="calc-quick-ratios" role="group" aria-label="Proporções rápidas">
              {QUICK_RATIOS.map((r) => (
                <button
                  key={r}
                  type="button"
                  className="calc-quick-btn"
                  onClick={() => setQuickRatio(r)}
                >
                  1:{r}
                </button>
              ))}
            </div>
          </div>

          <div className="calc-section">
            <label htmlFor="calc-volume" className="calc-label">Volume total do recipiente</label>
            <p className="calc-help">Informe a capacidade total do recipiente ou o volume final da solução que deseja preparar.</p>
            <div className="calc-field calc-field-volume">
              <input
                id="calc-volume"
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                placeholder="Ex: 1000"
                value={totalVolume}
                onChange={(e) => setTotalVolume(e.target.value)}
                aria-invalid={!!errors.volume}
                aria-describedby={errors.volume ? 'calc-volume-err' : undefined}
              />
              <span className="calc-unit">ml</span>
              {errors.volume && <span id="calc-volume-err" className="calc-error">{errors.volume}</span>}
            </div>
          </div>

          <div className="calc-actions">
            <button type="submit" className="btn btn-primary calc-btn-calc">
              <Droplet size={16} /> Calcular diluição
            </button>
            <button type="button" className="btn btn-outline calc-btn-clear" onClick={handleClear}>
              <RotateCcw size={16} /> Limpar
            </button>
          </div>
        </form>

        <div className="calc-result-area" aria-live="polite" aria-atomic="true">
          {!result && (
            <div className="calc-empty">
              <FlaskConical size={48} />
              <p>Preencha a proporção e o volume total para calcular a quantidade de produto e água.</p>
            </div>
          )}
          {result && (
            <>
              <div className="calc-result-summary">
                <p className="calc-result-text">
                  Para preparar <strong>{formatBR(result.total)} ml</strong> na diluição{' '}
                  <strong>{result.ratioProduct}:{result.ratioWater}</strong>, utilize{' '}
                  <strong>{formatBR(result.product)} ml</strong> de produto e complete com{' '}
                  <strong>{formatBR(result.water)} ml</strong> de água.
                </p>
              </div>

              <div className="calc-graphic" role="img" aria-label={`Recipiente com ${formatBR(result.product)} ml de produto (${result.productPercent.toFixed(2)}%) e ${formatBR(result.water)} ml de água (${result.waterPercent.toFixed(2)}%)`}>
                <div className="calc-graphic-bar calc-graphic-product" style={{ height: `${result.productPercent}%` }}>
                  {result.productPercent >= 8 && (
                    <div className="calc-graphic-label">
                      <span>Produto</span>
                      <span>{formatBR(result.product)} ml</span>
                      <span>{result.productPercent.toFixed(2)}%</span>
                    </div>
                  )}
                </div>
                <div className="calc-graphic-bar calc-graphic-water" style={{ height: `${result.waterPercent}%` }}>
                  {result.waterPercent >= 8 && (
                    <div className="calc-graphic-label">
                      <span>Água</span>
                      <span>{formatBR(result.water)} ml</span>
                      <span>{result.waterPercent.toFixed(2)}%</span>
                    </div>
                  )}
                </div>
              </div>

              {(result.productPercent < 8 || result.waterPercent < 8) && (
                <div className="calc-graphic-legend">
                  <div className="calc-legend-item">
                    <span className="calc-legend-dot calc-legend-product" />
                    <span>Produto — {formatBR(result.product)} ml — {result.productPercent.toFixed(2)}%</span>
                  </div>
                  <div className="calc-legend-item">
                    <span className="calc-legend-dot calc-legend-water" />
                    <span>Água — {formatBR(result.water)} ml — {result.waterPercent.toFixed(2)}%</span>
                  </div>
                </div>
              )}

              <div className="calc-result-cards">
                <div className="calc-result-card calc-card-product">
                  <span className="calc-card-label">Produto</span>
                  <span className="calc-card-value">{formatBR(result.product)} ml</span>
                  <span className="calc-card-pct">{result.productPercent.toFixed(2)}%</span>
                </div>
                <div className="calc-result-card calc-card-water">
                  <span className="calc-card-label">Água</span>
                  <span className="calc-card-value">{formatBR(result.water)} ml</span>
                  <span className="calc-card-pct">{result.waterPercent.toFixed(2)}%</span>
                </div>
                <div className="calc-result-card calc-card-total">
                  <span className="calc-card-label">Volume total</span>
                  <span className="calc-card-value">{formatBR(result.total)} ml</span>
                  <span className="calc-card-pct">Proporção {result.ratioProduct}:{result.ratioWater}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
