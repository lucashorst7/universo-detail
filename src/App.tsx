import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import CategoryPage from './pages/CategoryPage'
import ProductPage from './pages/ProductPage'
import BrandPage from './pages/BrandPage'
import BrandsPage from './pages/BrandsPage'
import CollectionsPage from './pages/CollectionsPage'
import GuidesPage from './pages/GuidesPage'
import KitBuilderPage from './pages/KitBuilderPage'
import SearchPage from './pages/SearchPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import AdminLayout from './components/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts from './pages/admin/AdminProducts'
import AdminBrands from './pages/admin/AdminBrands'
import AdminCategories from './pages/admin/AdminCategories'
import AdminReviews from './pages/admin/AdminReviews'

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/categoria/:slug" element={<CategoryPage />} />
            <Route path="/produto/:slug" element={<ProductPage />} />
            <Route path="/marca/:slug" element={<BrandPage />} />
            <Route path="/marcas" element={<BrandsPage />} />
            <Route path="/colecoes" element={<CollectionsPage />} />
            <Route path="/colecoes/:slug" element={<CollectionsPage />} />
            <Route path="/guias" element={<GuidesPage />} />
            <Route path="/guias/:slug" element={<GuidesPage />} />
            <Route path="/kit-builder" element={<KitBuilderPage />} />
            <Route path="/busca" element={<SearchPage />} />
            <Route path="/sobre" element={<AboutPage />} />
            <Route path="/contato" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/cadastro" element={<RegisterPage />} />
            <Route path="/perfil" element={<ProfilePage />} />
            <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
            <Route path="/admin/produtos" element={<AdminLayout><AdminProducts /></AdminLayout>} />
            <Route path="/admin/marcas" element={<AdminLayout><AdminBrands /></AdminLayout>} />
            <Route path="/admin/categorias" element={<AdminLayout><AdminCategories /></AdminLayout>} />
            <Route path="/admin/reviews" element={<AdminLayout><AdminReviews /></AdminLayout>} />
            <Route path="/admin/guia-editorial" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
