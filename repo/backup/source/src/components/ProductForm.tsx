import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Modal } from './AdminUI'
import { fetchCategories, fetchBrands, adminUpsertProduct } from '../lib/queries'
import type { Brand, Category, Product, ProductStatus, ProductWithRelations } from '../types/database'
const STATUSES: ProductStatus[] = ['draft','review','published','archived']
export function ProductForm({ open, product, onClose, onSaved }: { open: boolean; product: ProductWithRelations | null; onClose: () => void; onSaved: () => void }) {
  const [brands, setBrands] = useState<Brand[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState<Partial<Product>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    if (open) {
      fetchBrands().then(setBrands).catch(() => {})
      fetchCategories().then(setCategories).catch(() => {})
      setForm(product ? { ...product } : { status: 'draft', is_featured: false, is_new: false })
      setError(null)
    }
  }, [open, product])
  const set = <K extends keyof Product>(k: K, v: Product[K]) => setForm(f => ({ ...f, [k]: v }))
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError(null)
    try { await adminUpsertProduct(form); onSaved(); onClose() }
    catch (err) { setError(err instanceof Error ? err.message : 'Erro ao salvar') }
    finally { setSaving(false) }
  }
  return (
    <Modal open={open} onClose={onClose} title={product ? 'Editar produto' : 'Novo produto'} wide>
      <form className="admin-form" onSubmit={submit}>
        <div className="admin-form-row">
          <div className="admin-field"><label>Nome *</label><input value={form.name ?? ''} onChange={e => set('name', e.target.value)} required /></div>
          <div className="admin-field"><label>Slug *</label><input value={form.slug ?? ''} onChange={e => set('slug', e.target.value)} required /></div>
        </div>
        <div className="admin-form-row">
          <div className="admin-field"><label>Marca</label><select value={form.brand_id ?? ''} onChange={e => set('brand_id', e.target.value || null)}><option value="">—</option>{brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
          <div className="admin-field"><label>Categoria</label><select value={form.category_id ?? ''} onChange={e => set('category_id', e.target.value || null)}><option value="">—</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        </div>
        <div className="admin-field"><label>Descrição curta</label><input value={form.short_description ?? ''} onChange={e => set('short_description', e.target.value)} /></div>
        <div className="admin-field"><label>Descrição completa</label><textarea value={form.description ?? ''} onChange={e => set('description', e.target.value)} rows={4} /></div>
        <div className="admin-form-row">
          <div className="admin-field"><label>URL da imagem</label><input value={form.image_url ?? ''} onChange={e => set('image_url', e.target.value)} placeholder="https://..." /></div>
          <div className="admin-field"><label>Status</label><select value={form.status ?? 'draft'} onChange={e => set('status', e.target.value as ProductStatus)}>{STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
        </div>
        <div className="admin-form-row">
          <div className="admin-field"><label>Como usar</label><input value={form.usability ?? ''} onChange={e => set('usability', e.target.value)} /></div>
          <div className="admin-field"><label>Dicas</label><input value={form.tips ?? ''} onChange={e => set('tips', e.target.value)} /></div>
        </div>
        <div className="admin-form-row">
          <div className="admin-field"><label>Tags (vírgula)</label><input value={(form.tags ?? []).join(', ')} onChange={e => set('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))} /></div>
          <div className="admin-field"><label>Galera (URLs, vírgula)</label><input value={(form.gallery_images ?? []).join(', ')} onChange={e => set('gallery_images', e.target.value.split(',').map(t => t.trim()).filter(Boolean))} /></div>
        </div>
        <div className="admin-form-row">
          <label className="admin-field" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><input type="checkbox" checked={form.is_featured ?? false} onChange={e => set('is_featured', e.target.checked)} /><span>Destaque</span></label>
          <label className="admin-field" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><input type="checkbox" checked={form.is_new ?? false} onChange={e => set('is_new', e.target.checked)} /><span>Novidade</span></label>
        </div>
        {error && <p className="rf-error">{error}</p>}
        <div className="admin-form-actions">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>{saving ? <Loader2 className="spin" size={16} /> : 'Salvar'}</button>
        </div>
      </form>
    </Modal>
  )
}
