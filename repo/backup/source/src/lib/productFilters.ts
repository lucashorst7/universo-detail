import type { ProductCardProduct } from '../types'
import type { SortOption } from '../components/ProductFilters'

function getBrandName(p: ProductCardProduct): string {
  if (!p.brands) return ''
  if (Array.isArray(p.brands)) return p.brands[0]?.name ?? ''
  return p.brands.name ?? ''
}

export function applyFilters(
  products: ProductCardProduct[],
  sort: SortOption,
  minRating: number,
  onlyNew: boolean
): ProductCardProduct[] {
  let result = [...products]
  if (minRating > 0) result = result.filter((p) => p.rating >= minRating)
  if (onlyNew) result = result.filter((p) => p.is_new)
  if (sort === 'rating') result.sort((a, b) => b.rating - a.rating)
  else if (sort === 'name') result.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
  else if (sort === 'brand') result.sort((a, b) => getBrandName(a).localeCompare(getBrandName(b), 'pt-BR'))
  return result
}
