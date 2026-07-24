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
      <svg viewBox="0 0 120 40" role="img" aria-label="Mercado Livre" width="120" height="40">
        <ellipse cx="20" cy="20" rx="14" ry="14" fill="#FFE600" />
        <path d="M14 22c0-3 2-5 5-5s5 2 5 5" stroke="#2D3277" strokeWidth="2" fill="none" strokeLinecap="round" />
        <circle cx="17" cy="17" r="1.5" fill="#2D3277" />
        <text x="40" y="26" fontFamily="Arial, sans-serif" fontSize="16" fontWeight="700" fill="#2D3277">Mercado Livre</text>
      </svg>
    )
  }
  if (name === 'shopee') {
    return (
      <svg viewBox="0 0 100 40" role="img" aria-label="Shopee" width="100" height="40">
        <path d="M12 14c0-4 3-7 7-7s7 3 7 7" stroke="#EE4D2D" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M8 14h22l-1 18c0 1-1 2-2 2H11c-1 0-2-1-2-2L8 14z" fill="#EE4D2D" />
        <text x="34" y="26" fontFamily="Arial, sans-serif" fontSize="16" fontWeight="700" fill="#EE4D2D">Shopee</text>
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 100 40" role="img" aria-label="Amazon" width="100" height="40">
      <text x="2" y="22" fontFamily="Arial, sans-serif" fontSize="18" fontWeight="700" fill="#131921">amazon</text>
      <path d="M4 30 Q30 36 56 30" stroke="#FF9900" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M52 28 L57 30 L53 33" stroke="#FF9900" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
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
