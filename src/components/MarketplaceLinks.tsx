import { ExternalLink } from 'lucide-react'
import type { Product } from '../types/database'
import './marketplace-links.css'

const MARKETPLACES = [
  { key: 'mercado_livre_url' as const, name: 'Mercado Livre', preposition: 'no', logo: 'mercadolivre' },
  { key: 'shopee_url' as const, name: 'Shopee', preposition: 'na', logo: 'shopee' },
  { key: 'amazon_url' as const, name: 'Amazon', preposition: 'na', logo: 'amazon' },
]

const LOGO_URLS: Record<string, string> = {
  mercadolivre: 'https://upload.wikimedia.org/wikipedia/commons/d/d4/MercadoLibre_logo.PNG',
  shopee: 'https://upload.wikimedia.org/wikipedia/commons/f/fe/Shopee.svg',
  amazon: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
}

const LOGO_LABELS: Record<string, string> = {
  mercadolivre: 'Mercado Livre',
  shopee: 'Shopee',
  amazon: 'Amazon',
}

function MarketplaceLogo({ name }: { name: string }) {
  return (
    <img
      src={LOGO_URLS[name]}
      alt={LOGO_LABELS[name] ?? name}
      className="marketplace-logo-img"
    />
  )
}

export function MarketplaceLinks({ product }: { product: Product }) {
  const links = MARKETPLACES.filter((m) => {
    const url = product[m.key]
    return url && url.trim().length > 0
  })

  if (links.length === 0) return null

  return (
    <section className="marketplace-section" aria-label="Onde encontrar este produto">
      <h2 className="marketplace-title">Onde encontrar este produto</h2>
      <p className="marketplace-subtitle">Compare as opções disponíveis nos principais marketplaces:</p>
      <div className={`marketplace-grid marketplace-count-${links.length}`}>
        {links.map((m) => {
          const url = product[m.key]!.trim()
          return (
            <a
              key={m.key}
              href={url}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="marketplace-card"
              aria-label={`Consultar ${product.name} ${m.preposition} ${m.name}`}
            >
              <div className="marketplace-card-logo">
                <MarketplaceLogo name={m.logo} />
              </div>
              <span className="marketplace-card-name">{m.name}</span>
              <span className="marketplace-card-cta">
                Consultar ofertas <ExternalLink size={13} />
              </span>
            </a>
          )
        })}
      </div>
      <p className="marketplace-disclaimer">Alguns links podem ser de afiliados, sem custo adicional para você.</p>
    </section>
  )
}
