import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Search, ChevronDown, User, LayoutDashboard, LogOut, Menu, X, Droplet, Armchair, Shield, Eye, Sparkles, CircleDot, Wrench, SprayCan, Package, type LucideIcon } from 'lucide-react'
import { useAuth } from '../lib/auth'
import type { Category } from '../types/database'
import './header.css'

const iconMap: Record<string, LucideIcon> = {
  'drop': Droplet,
  'armchair': Armchair,
  'shield': Shield,
  'eye': Eye,
  'sparkle': Sparkles,
  'tire': CircleDot,
  'gear': Wrench,
  'spray-bottle': SprayCan,
  'droplet': Droplet,
  'sparkles': Sparkles,
  'spray-can': SprayCan,
  'package': Package,
}

export function Header({ categories }: { categories: Category[] }) {
  const [catOpen, setCatOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileCatsOpen, setMobileCatsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const catRef = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { session, isAdmin, signOut } = useAuth()

  useEffect(() => {
    setCatOpen(false)
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setCatOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  function scheduleClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setCatOpen(false), 200)
  }

  function cancelClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = null
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) navigate(`/produtos?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <header className="app-header">
      <div className="container header-inner">
        <Link to="/" className="header-logo">
          <img src="/13_universo_carro_luxo_header-removebg-preview%20copy%20copy.png" alt="Universo Detail" className="header-logo-img" />
          <span className="header-logo-text">Universo Detail</span>
        </Link>
        <nav className="header-nav">
          <Link to="/" className="nav-link">Início</Link>
          <div
            className="cat-dropdown"
            ref={catRef}
            onMouseEnter={() => { cancelClose(); setCatOpen(true) }}
            onMouseLeave={scheduleClose}
          >
            <button className={`cat-trigger ${catOpen ? 'open' : ''}`} onClick={() => setCatOpen((v) => !v)}>
              Categorias
              <ChevronDown size={16} className={`cat-chevron ${catOpen ? 'rot' : ''}`} />
            </button>
            {catOpen && (
              <div className="cat-tray">
                {categories.length === 0 ? (
                  <p className="cat-tray-empty">Nenhuma categoria disponível</p>
                ) : (
                  <div className="cat-tray-grid">
                    {categories.map((c) => {
                      const Icon = iconMap[c.icon ?? ''] ?? Package
                      return (
                        <Link key={c.id} to={`/categoria/${c.slug}`} className="cat-tray-item">
                          <span className="cat-tray-icon"><Icon size={16} /></span>
                          <span>{c.name}</span>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
          <Link to="/produtos" className="nav-link">Produtos</Link>
          <Link to="/marcas" className="nav-link">Marcas</Link>
        </nav>
        <form className="header-search" onSubmit={submitSearch}>
          <Search size={16} className="search-icon" />
          <input type="text" placeholder="Buscar produtos..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </form>
        {session ? (
          <div className="header-account">
            {isAdmin && (
              <Link to="/admin" className="account-btn account-btn-admin">
                <LayoutDashboard size={16} /><span>Admin</span>
              </Link>
            )}
            <button className="account-btn" onClick={() => signOut()}>
              <LogOut size={16} /><span>Sair</span>
            </button>
          </div>
        ) : (
          <Link to="/login" className="account-btn">
            <User size={16} /><span>Entrar</span>
          </Link>
        )}
        <button className="header-mobile-toggle" onClick={() => setMobileOpen((v) => !v)} aria-label="Menu">
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {mobileOpen && (
        <div className="mobile-drawer">
          <Link to="/" className="mobile-link">Início</Link>
          <button className="mobile-link mobile-link-btn" onClick={() => setMobileCatsOpen((v) => !v)}>
            Categorias <ChevronDown size={16} className={mobileCatsOpen ? 'rot' : ''} />
          </button>
          {mobileCatsOpen && (
            <div className="mobile-cats">
              {categories.map((c) => {
                const Icon = iconMap[c.icon ?? ''] ?? Package
                return (
                  <Link key={c.id} to={`/categoria/${c.slug}`} className="mobile-link mobile-link-sub">
                    <Icon size={16} className="cat-tray-icon" /> {c.name}
                  </Link>
                )
              })}
            </div>
          )}
          <Link to="/produtos" className="mobile-link">Produtos</Link>
          <Link to="/marcas" className="mobile-link">Marcas</Link>
          <form className="mobile-search" onSubmit={submitSearch}>
            <Search size={16} />
            <input type="text" placeholder="Buscar produtos..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </form>
          {session ? (
            <>
              {isAdmin && <Link to="/admin" className="mobile-link">Admin</Link>}
              <button className="mobile-link mobile-link-btn" onClick={() => signOut()}>Sair</button>
            </>
          ) : (
            <Link to="/login" className="mobile-link">Entrar</Link>
          )}
        </div>
      )}
    </header>
  )
}
