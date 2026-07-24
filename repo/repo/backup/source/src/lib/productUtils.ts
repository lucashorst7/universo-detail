import type { ProductCardProduct } from '../types'
import type { SortOption, ProductFiltersValue } from '../components/ProductFilters'

export function getBrandName(product: ProductCardProduct): string {
  const b = product.brands
  if (!b) return ''
  if (Array.isArray(b)) return b[0]?.name ?? ''
  return (b as { name: string }).name ?? ''
}

export function applyFilters(products: ProductCardProduct[], filters: ProductFiltersValue): ProductCardProduct[] {
  let result = [...products]

  if (filters.minRating > 0) {
    result = result.filter((p) => (p.rating ?? 0) >= filters.minRating)
  }
  if (filters.is_new) {
    result = result.filter((p) => p.is_new)
  }

  switch (filters.sort) {
    case 'rating':
      result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
      break
    case 'name':
      result.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
      break
    case 'brand':
      result.sort((a, b) => getBrandName(a).localeCompare(getBrandName(b), 'pt-BR'))
      break
  }

  return result
}
