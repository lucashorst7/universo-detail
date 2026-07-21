import { useEffect, useState } from 'react'
import { createBrowserRouter, RouterProvider, Outlet, Link } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/auth'
import { fetchCategories } from './lib/queries'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { Spinner } from './components/Feedback'
import { AdminLayout } from './components/AdminLayout'
import type { Category } from './types/database'

import { HomePage } from './pages/HomePage'
import { ProductsPage } from './pages/ProductsPage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { CategoryPage } from './pages/CategoryPage'
import { BrandPage } from './pages/BrandPage'
import { BrandsPage } from './pages/BrandsPage'
import { LoginPage } from './pages/LoginPage'
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage'
import { AdminProductsPage } from './pages/admin/AdminProductsPage'
import { AdminBrandsPage } from './pages/admin/AdminBrandsPage'
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage'
import { AdminReviewsPage } from './pages/admin/AdminReviewsPage'
import { AdminMembersPage } from './pages/admin/AdminMembersPage'

function Layout() {
  const [categories, setCategories] = useState<Category[]>([])
  const { loading } = useAuth()

  useEffect(() => { fetchCategories().then(setCategories) }, [])

  if (loading) return <Spinner label="Carregando..." />

  return (
    <div className="app-shell">
      <Header categories={categories} />
      <main className="app-main"><Outlet /></main>
      <Footer />
    </div>
  )
}

function ProtectedAdmin() {
  const { session, isAdmin, loading } = useAuth()
  if (loading) return <Spinner label="Carregando..." />
  if (!session) return <LoginPage />
  if (!isAdmin) {
    return (
      <div className="container" style={{ padding: '60px 24px', textAlign: 'center' }}>
        <h2>Acesso restrito</h2>
        <p style={{ color: 'var(--color-text-2)', marginTop: 8 }}>Você não tem permissão para acessar esta área.</p>
        <Link to="/" className="btn btn-outline" style={{ marginTop: 16 }}>Voltar ao início</Link>
      </div>
    )
  }
  return <AdminLayout />
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/produtos', element: <ProductsPage /> },
      { path: '/produto/:slug', element: <ProductDetailPage /> },
      { path: '/categoria/:slug', element: <CategoryPage /> },
      { path: '/marca/:slug', element: <BrandPage /> },
      { path: '/marcas', element: <BrandsPage /> },
      { path: '/login', element: <LoginPage /> },
      {
        element: <ProtectedAdmin />,
        children: [
          { path: '/admin', element: <AdminDashboardPage /> },
          { path: '/admin/produtos', element: <AdminProductsPage /> },
          { path: '/admin/marcas', element: <AdminBrandsPage /> },
          { path: '/admin/categorias', element: <AdminCategoriesPage /> },
          { path: '/admin/avaliacoes', element: <AdminReviewsPage /> },
          { path: '/admin/membros', element: <AdminMembersPage /> },
        ],
      },
      { path: '*', element: <ProductsPage /> },
    ],
  },
])

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}
