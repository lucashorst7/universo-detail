import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { fetchCategories } from '../lib/queries'
import type { Category } from '../lib/supabase'
import { getCategoryIcon } from './categoryIcons'
import { MagnifyingGlass, List, X, User } from '@phosphor-icons/react'

export default function Header() {
  const [categories, setCategories] = useState<Category[]>([])
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [user, setUser] = useState<{ email: string } | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => {})
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) setUser({ email: data.session.user.email || '' })
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) setUser({ email: session.user.email || '' })
      else setUser(null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/busca?q=${encodeURIComponent(searchQuery.trim())}`)
      setMenuOpen(false)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="logo">
          <span className="logo-mark">P</span>
          <span className="logo-text">PapoDetailer</span>
        </Link>

        <nav className="header-nav-desktop">
          <div className="nav-dropdown">
            <button className="nav-link nav-link-dropdown">Categorias</button>
            <div className="nav-dropdown-menu">
              {categories.map((c) => {
                const Icon = getCategoryIcon(c.icon)
                return (
                  <Link key={c.id} to={`/categoria/${c.slug}`} className="nav-dropdown-item">
                    <Icon size={18} weight="regular" className="cat-tray-icon" />
                    <span>{c.name}</span>
                  </Link>
                )
              })}
            </div>
          </div>
          <NavLink to="/marcas" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>Marcas</NavLink>
          <NavLink to="/colecoes" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>Coleções</NavLink>
          <NavLink to="/guias" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>Guias</NavLink>
          <NavLink to="/kit-builder" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>Montar Kit</NavLink>
          <NavLink to="/sobre" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>Sobre</NavLink>
        </nav>

        <form className="header-search-desktop" onSubmit={handleSearch}>
          <MagnifyingGlass size={16} />
          <input type="text" placeholder="Buscar produtos..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </form>

        <div className="header-actions">
          {user ? (
            <div className="header-user">
              <Link to="/perfil" className="nav-link">
                <User size={18} /><span>Perfil</span>
              </Link>
              <button onClick={handleLogout} className="btn-ghost">Sair</button>
            </div>
          ) : (
            <Link to="/login" className="btn-primary btn-sm">Entrar</Link>
          )}
          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <List size={24} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="mobile-menu">
          <form className="mobile-search" onSubmit={handleSearch}>
            <MagnifyingGlass size={16} />
            <input type="text" placeholder="Buscar produtos..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </form>
          <div className="mobile-nav-section">
            <h4>Categorias</h4>
            {categories.map((c) => {
              const Icon = getCategoryIcon(c.icon)
              return (
                <Link key={c.id} to={`/categoria/${c.slug}`} className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
                  <Icon size={18} weight="regular" className="cat-tray-icon" />
                  <span>{c.name}</span>
                </Link>
              )
            })}
          </div>
          <div className="mobile-nav-section">
            <Link to="/marcas" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Marcas</Link>
            <Link to="/colecoes" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Coleções</Link>
            <Link to="/guias" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Guias</Link>
            <Link to="/kit-builder" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Montar Kit</Link>
            <Link to="/sobre" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Sobre</Link>
          </div>
          <div className="mobile-nav-section">
            {user ? (
              <>
                <Link to="/perfil" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Perfil</Link>
                <button onClick={() => { handleLogout(); setMenuOpen(false) }} className="mobile-nav-link">Sair</button>
              </>
            ) : (
              <Link to="/login" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Entrar</Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
