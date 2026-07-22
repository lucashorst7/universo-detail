import { Link } from 'react-router-dom'
import { NavLink } from 'react-router-dom'
import { Package, Tag, UsersThree, Star, Scroll, House } from '@phosphor-icons/react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <Link to="/" className="logo">
            <span className="logo-mark">P</span>
            <span className="logo-text">PapoDetailer</span>
          </Link>
          <span className="admin-badge">Admin</span>
        </div>
        <nav className="admin-nav">
          <NavLink to="/admin" end className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}>
            <House size={18} weight="regular" />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/admin/produtos" className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}>
            <Package size={18} weight="regular" />
            <span>Produtos</span>
          </NavLink>
          <NavLink to="/admin/marcas" className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}>
            <Tag size={18} weight="regular" />
            <span>Marcas</span>
          </NavLink>
          <NavLink to="/admin/categorias" className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}>
            <UsersThree size={18} weight="regular" />
            <span>Categorias</span>
          </NavLink>
          <NavLink to="/admin/reviews" className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}>
            <Star size={18} weight="regular" />
            <span>Reviews</span>
          </NavLink>
          <NavLink to="/admin/guia-editorial" className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}>
            <Scroll size={18} weight="regular" />
            <span>Editorial</span>
          </NavLink>
        </nav>
      </aside>
      <main className="admin-main">
        {children}
      </main>
    </div>
  )
}
