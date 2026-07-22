import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, FolderTree, Star, LogOut } from 'lucide-react'
import { Package, Tag, UsersThree } from '@phosphor-icons/react'
import { useAuth } from '../lib/auth'
import './admin.css'

import type { ComponentType, SVGProps } from 'react'
type IconType = ComponentType<SVGProps<SVGSVGElement> & { size?: number | string; weight?: string }>

export function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { signOut } = useAuth()

  const links: { to: string; label: string; icon: IconType; end?: boolean }[] = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard as IconType, end: true },
    { to: '/admin/produtos', label: 'Produtos', icon: Package as IconType },
    { to: '/admin/marcas', label: 'Marcas', icon: Tag as IconType },
    { to: '/admin/categorias', label: 'Categorias', icon: FolderTree as IconType },
    { to: '/admin/avaliacoes', label: 'Avaliações', icon: Star as IconType },
    { to: '/admin/membros', label: 'Membros', icon: UsersThree as IconType },
  ]

  function isActive(to: string, end?: boolean) {
    return end ? location.pathname === to : location.pathname.startsWith(to)
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-head">
          <Link to="/admin" className="admin-logo">Universo Detail</Link>
          <span className="admin-sub">Painel administrativo</span>
        </div>
        <nav className="admin-nav">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className={`admin-nav-link ${isActive(l.to, l.end) ? 'active' : ''}`}>
              <l.icon size={18} /><span>{l.label}</span>
            </Link>
          ))}
        </nav>
        <div className="admin-sidebar-foot">
          <Link to="/" className="admin-nav-link"><LogOut size={18} /><span>Ver site</span></Link>
          <button className="admin-nav-link" onClick={async () => { await signOut(); navigate('/login') }}>
            <LogOut size={18} /><span>Sair</span>
          </button>
        </div>
      </aside>
      <main className="admin-main"><Outlet /></main>
    </div>
  )
}
