import { ExternalLink } from 'lucide-react'
import type { Product } from '../types/database'
import './marketplace-links.css'

const MARKETPLACES = [
  { key: 'mercado_livre_url' as const, name: 'Mercado Livre', preposition: 'no', logo: 'mercadolivre' },
  { key: 'shopee_url' as const, name: 'Shopee', preposition: 'na', logo: 'shopee' },
  { key: 'amazon_url' as const, name: 'Amazon', preposition: 'na', logo: 'amazon' },
]

function MarketplaceLogo({ name }: { name: string }) {
  if (name === 'mercadolivre') {
    return (
      <svg viewBox="0 0 180 48" role="img" aria-label="Mercado Livre" width="180" height="48">
        <circle cx="24" cy="24" r="20" fill="#FFE600" />
        <path d="M14 26c2-3 5-4 8-3l4 1c3 1 6 0 8-3" stroke="#2D3277" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="18" cy="20" r="2" fill="#2D3277" />
        <circle cx="28" cy="20" r="2" fill="#2D3277" />
        <text x="52" y="30" fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontSize="18" fontWeight="700" fill="#2D3277" letterSpacing="-0.3">Mercado Livre</text>
      </svg>
    )
  }
  if (name === 'shopee') {
    return (
      <svg viewBox="0 0 140 48" role="img" aria-label="Shopee" width="140" height="48">
        <path d="M16 16c0-5 4-9 8-9s8 4 8 9" stroke="#EE4D2D" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M10 16h28l-1.5 22c-0.1 1.5-1.3 2.5-2.8 2.5H13.3c-1.5 0-2.7-1-2.8-2.5L10 16z" fill="#EE4D2D" />
        <path d="M18 26c0 2.5 2.7 4.5 6 4.5s6-2 6-4.5" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" />
        <text x="46" y="30" fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontSize="20" fontWeight="700" fill="#EE4D2D" letterSpacing="-0.3">Shopee</text>
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 150 48" role="img" aria-label="Amazon" width="150" height="48">
      <text x="4" y="26" fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontSize="22" fontWeight="700" fill="#131921" letterSpacing="-0.5">amazon</text>
      <path d="M8 34 Q40 42 74 34" stroke="#FF9900" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M68 31 L76 34 L70 38" stroke="#FF9900" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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
