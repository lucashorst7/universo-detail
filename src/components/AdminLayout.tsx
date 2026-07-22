import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, Tag, FolderTree, Star, Users, LogOut } from 'lucide-react'
import { useAuth } from '../lib/auth'
import './admin.css'

export function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { signOut } = useAuth()

  const links = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/produtos', label: 'Produtos', icon: Package },
    { to: '/admin/marcas', label: 'Marcas', icon: Tag },
    { to: '/admin/categorias', label: 'Categorias', icon: FolderTree },
    { to: '/admin/avaliacoes', label: 'Avaliações', icon: Star },
    { to: '/admin/membros', label: 'Membros', icon: Users },
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
