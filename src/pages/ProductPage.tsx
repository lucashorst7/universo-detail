import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getProductVariants } from '../lib/search'
import type { Product } from '../types'
import TechnicalSpecsCard from '../components/TechnicalSpecsCard'
import Comments from '../components/Comments'
import { ExternalLink, Package, ChevronDown } from 'lucide-react'

export default function ProductPage() {
  const { slug } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [variants, setVariants] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeImage, setActiveImage] = useState<string | undefined>(undefined)
  const [selectedVariant, setSelectedVariant] = useState<string | undefined>(undefined)

  useEffect(() => {
    async function load() {
      if (!slug) return
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from('products')
        .select(`*, brand:brands(id, name, slug, logo_url), category:categories(id, name, slug, icon)`)
        .eq('slug', slug)
        .maybeSingle()
      if (error) { setError(error.message); setLoading(false); return }
      if (!data) { setError('Produto não encontrado'); setLoading(false); return }
      const p = data as Product
      setProduct(p)
      setActiveImage(p.image_url)
      if (!p.parent_product_id) {
        const v = await getProductVariants(p.id)
        setVariants(v)
      }
      setLoading(false)
    }
    load()
  }, [slug])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-3 border-neutral-200 border-t-primary-500" />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="font-display text-3xl font-bold text-secondary-900">{error ?? 'Produto não encontrado'}</h1>
        <Link to="/descobrir" className="mt-6 inline-block text-primary-600 hover:text-primary-700">Voltar para descobrir</Link>
      </div>
    )
  }

  const gallery = [product.image_url, ...(product.gallery_images ?? [])].filter(Boolean) as string[]

  return (
    <div className="bg-neutral-50">
      <div className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3 text-sm sm:px-6 lg:px-8">
          <nav className="flex flex-wrap items-center gap-2 text-neutral-500">
            <Link to="/" className="hover:text-primary-600">Início</Link>
            <span>/</span>
            {product.category && (
              <>
                <Link to={`/categoria/${product.category.slug}`} className="hover:text-primary-600">{product.category.name}</Link>
                <span>/</span>
              </>
            )}
            <span className="text-secondary-900">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div>
            <div className="relative aspect-square overflow-hidden rounded-2xl border border-neutral-200 bg-white">
              {activeImage ? (
                <img src={activeImage} alt={product.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Package className="h-24 w-24 text-neutral-300" />
                </div>
              )}
            </div>
            {gallery.length > 1 && (
              <div className="mt-4 flex gap-2 overflow-x-auto">
                {gallery.map((img, i) => (
                  <button key={i} onClick={() => setActiveImage(img)} className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${activeImage === img ? 'border-primary-500' : 'border-neutral-200 hover:border-primary-300'}`}>
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            {product.brand && (
              <Link to={`/marca/${product.brand.slug}`} className="text-sm font-medium uppercase tracking-wider text-primary-600 hover:text-primary-700">{product.brand.name}</Link>
            )}
            <h1 className="mt-2 font-display text-3xl font-bold text-secondary-900 sm:text-4xl">{product.name}</h1>
            {product.short_description && <p className="mt-3 text-lg text-neutral-600">{product.short_description}</p>}

            {variants.length > 0 && (
              <div className="mt-6">
                <label className="text-sm font-medium text-secondary-900">Variantes:</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button onClick={() => setSelectedVariant(undefined)} className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${!selectedVariant ? 'border-primary-500 bg-primary-500 text-white' : 'border-neutral-300 text-neutral-700 hover:border-primary-300'}`}>Padrão</button>
                  {variants.map(v => (
                    <button key={v.id} onClick={() => { setSelectedVariant(v.id); if (v.image_url) setActiveImage(v.image_url) }} className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${selectedVariant === v.id ? 'border-primary-500 bg-primary-500 text-white' : 'border-neutral-300 text-neutral-700 hover:border-primary-300'}`}>{v.variant_label}</button>
                  ))}
                </div>
              </div>
            )}

            {product.description && (
              <div className="mt-6">
                <h2 className="font-heading text-xl font-semibold text-secondary-900">Descrição</h2>
                <p className="mt-2 whitespace-pre-line text-neutral-700">{product.description}</p>
              </div>
            )}

            {product.usability && (
              <div className="mt-6">
                <h2 className="font-heading text-xl font-semibold text-secondary-900">Como usar</h2>
                <p className="mt-2 whitespace-pre-line text-neutral-700">{product.usability}</p>
              </div>
            )}

            {product.tips && (
              <div className="mt-6 rounded-xl border border-primary-200 bg-primary-50 p-4">
                <h3 className="font-heading text-base font-semibold text-primary-800">Dicas do especialista</h3>
                <p className="mt-1 whitespace-pre-line text-sm text-primary-900">{product.tips}</p>
              </div>
            )}

            {product.affiliate_url && (
              <a href={product.affiliate_url} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-600">
                Ver na loja <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <TechnicalSpecsCard specs={product.specifications} />
          </div>
          <div>
            <div className="rounded-2xl border border-neutral-200 bg-white p-5">
              <h3 className="font-heading text-lg font-semibold text-secondary-900">Detalhes</h3>
              <dl className="mt-3 space-y-2 text-sm">
                {product.category && (
                  <div className="flex justify-between"><dt className="text-neutral-500">Categoria</dt><dd className="text-secondary-900">{product.category.name}</dd></div>
                )}
                {product.brand && (
                  <div className="flex justify-between"><dt className="text-neutral-500">Marca</dt><dd className="text-secondary-900">{product.brand.name}</dd></div>
                )}
                {product.tags && product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-2">
                    {product.tags.map(t => <span key={t} className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">{t}</span>)}
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>

        <details className="mt-12 group">
          <summary className="flex cursor-pointer items-center justify-between font-heading text-xl font-semibold text-secondary-900">
            Produtos relacionados
            <ChevronDown className="h-5 w-5 transition-transform group-open:rotate-180" />
          </summary>
          <p className="mt-3 text-sm text-neutral-500">Em breve.</p>
        </details>

        <Comments productId={product.id} />
      </div>
    </div>
  )
}
