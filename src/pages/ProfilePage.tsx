import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { fetchBrands } from '../lib/queries'
import type { Brand, UserProfile } from '../lib/supabase'

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const navigate = useNavigate()

  const [displayName, setDisplayName] = useState('')
  const [currentCar, setCurrentCar] = useState('')
  const [favoriteShampoo, setFavoriteShampoo] = useState('')
  const [favoriteWax, setFavoriteWax] = useState('')
  const [favoriteTireDressing, setFavoriteTireDressing] = useState('')
  const [favoriteBrandId, setFavoriteBrandId] = useState<string>('')

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session?.user) { navigate('/login'); return }
      const userId = data.session.user.id
      const { data: prof } = await supabase.from('user_profiles').select('*').eq('user_id', userId).single()
      if (prof) {
        setProfile(prof as UserProfile)
        setDisplayName(prof.display_name || '')
        setCurrentCar(prof.current_car || '')
        setFavoriteShampoo(prof.favorite_shampoo || '')
        setFavoriteWax(prof.favorite_wax || '')
        setFavoriteTireDressing(prof.favorite_tire_dressing || '')
        setFavoriteBrandId(prof.favorite_brand_id || '')
      }
      fetchBrands().then(setBrands)
    }).finally(() => setLoading(false))
  }, [navigate])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return
    setSaving(true); setSaved(false)
    await supabase.from('user_profiles').update({
      display_name: displayName, current_car: currentCar || null, favorite_shampoo: favoriteShampoo || null,
      favorite_wax: favoriteWax || null, favorite_tire_dressing: favoriteTireDressing || null,
      favorite_brand_id: favoriteBrandId || null, updated_at: new Date().toISOString(),
    }).eq('id', profile.id)
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) return <div className="page-loading">Carregando...</div>

  return (
    <div className="container page">
      <div className="page-header"><div><h1>Meu Perfil</h1><p className="page-subtitle">Gerencie suas informações e preferências</p></div></div>
      <form className="profile-form" onSubmit={handleSave}>
        {saved && <div className="alert alert-success">Perfil atualizado com sucesso!</div>}
        <label className="form-label">Nome de exibição<input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="form-input" /></label>
        <label className="form-label">Carro atual<input type="text" value={currentCar} onChange={(e) => setCurrentCar(e.target.value)} placeholder="Ex: Honda Civic 2022" className="form-input" /></label>
        <label className="form-label">Shampoo favorito<input type="text" value={favoriteShampoo} onChange={(e) => setFavoriteShampoo(e.target.value)} className="form-input" /></label>
        <label className="form-label">Cera favorita<input type="text" value={favoriteWax} onChange={(e) => setFavoriteWax(e.target.value)} className="form-input" /></label>
        <label className="form-label">Tire dressing favorito<input type="text" value={favoriteTireDressing} onChange={(e) => setFavoriteTireDressing(e.target.value)} className="form-input" /></label>
        <label className="form-label">Marca favorita
          <select value={favoriteBrandId} onChange={(e) => setFavoriteBrandId(e.target.value)} className="form-input">
            <option value="">Selecione...</option>
            {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </label>
        <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Salvando...' : 'Salvar alterações'}</button>
      </form>
    </div>
  )
}
