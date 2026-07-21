import type { ProductCardProduct } from '../types'
import type { FilterState } from '../components/ProductFilters'

export function brandNameOf(p: ProductCardProduct): string {
  if (!p.brands) return ''
  if (Array.isArray(p.brands)) return p.brands[0]?.name ?? ''
  return p.brands.name ?? ''
}

export function applyFilters(products: ProductCardProduct[], state: FilterState): ProductCardProduct[] {
  let list = products.filter((p) => Number(p.rating) >= state.minRating)
  if (state.onlyNew) list = list.filter((p) => p.is_new)
  const sorted = [...list]
  if (state.sort === 'rating') sorted.sort((a, b) => Number(b.rating) - Number(a.rating))
  else if (state.sort === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
  else if (state.sort === 'brand') sorted.sort((a, b) => brandNameOf(a).localeCompare(brandNameOf(b), 'pt-BR'))
  return sorted
}

export function formatBRL(value: number | null | undefined): string {
  if (value === null || value === undefined) return ''
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value))
}
