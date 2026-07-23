import { useEffect, useState, useMemo } from 'react'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { supabase, isConfigured } from '../../lib/supabase'
import { Spinner, EmptyState } from '../../components/Feedback'
import { Modal, ConfirmDialog, Toast } from '../../components/AdminUI'
import { TechSpecsForm } from '../../components/TechSpecsForm'
import { getCategorySpec, getFieldsForCategoryAndSubtype } from '../../lib/categorySpecs'
import type { Product, Brand, Category } from '../../types/database'

export function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [form, setForm] = useState({ name: '', slug: '', description: '', brand_id: '', category_id: '', status: 'draft', image_url: '' })
  const [techSpecs, setTechSpecs] = useState<Record<string, unknown>>({})
  const [volumetries, setVolumetries] = useState<string[]>([])
  const [subtype, setSubtype] = useState('')

  async function load() {
    if (!isConfigured) { setLoading(false); return }
    const [p, b, c] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('brands').select('*').order('name'),
      supabase.from('categories').select('*').order('name'),
    ])
    setProducts((p.data || []) as Product[])
    setBrands((b.data || []) as Brand[])
    setCategories((c.data || []) as Category[])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openCreate() {
    setEditing(null)
    setForm({ name: '', slug: '', description: '', brand_id: '', category_id: '', status: 'draft', image_url: '' })
    setTechSpecs({})
    setVolumetries([])
    setSubtype('')
    setModalOpen(true)
  }

  function openEdit(p: Product) {
    setEditing(p)
    setForm({ name: p.name, slug: p.slug, description: p.description ?? '', brand_id: p.brand_id ?? '', category_id: p.category_id ?? '', status: p.status, image_url: p.image_url ?? '' })
    setTechSpecs((p.technical_specs as Record<string, unknown>) ?? {})
    setVolumetries(p.volumetries ?? [])
    setSubtype((p.technical_specs as Record<string, unknown>)?.product_subtype as string ?? '')
    setModalOpen(true)
  }

  const selectedCategorySlug = useMemo(() => categories.find(c => c.id === form.category_id)?.slug ?? '', [categories, form.category_id])
  const categorySpec = useMemo(() => selectedCategorySlug ? getCategorySpec(selectedCategorySlug) : null, [selectedCategorySlug])
  const productType = (techSpecs.product_type as string) ?? undefined
  const visibleFields = useMemo(() => {
    if (!categorySpec) return []
    return getFieldsForCategoryAndSubtype(selectedCategorySlug, subtype, productType)
  }, [categorySpec, selectedCategorySlug, subtype, productType])

  function handleTechSpecChange(key: string, value: unknown) {
    if (key === 'volumetries') { setVolumetries(value as string[]); return }
    setTechSpecs(prev => {
      const updated = { ...prev }
      if (value === '' || value === null || (Array.isArray(value) && value.length === 0)) { delete updated[key] } else { updated[key] = value }
      return updated
    })
  }

  function handleSubtypeChange(newSubtype: string) {
    setSubtype(newSubtype)
    setTechSpecs(prev => ({ ...prev, product_subtype: newSubtype }))
  }

  function handleCategoryChange(catId: string) {
    setForm(f => ({ ...f, category_id: catId }))
    setSubtype('')
    setTechSpecs({})
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const finalTechSpecs: Record<string, unknown> = { ...techSpecs }
    if (categorySpec?.hasSubtype && subtype) { finalTechSpecs.product_subtype = subtype }
    const payload = {
      name: form.name,
      slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-'),
      description: form.description || null,
      brand_id: form.brand_id || null,
      category_id: form.category_id || null,
      status: form.status as 'draft' | 'published',
      image_url: form.image_url || null,
      technical_specs: finalTechSpecs,
      volumetries: volumetries.length > 0 ? volumetries : null,
    }
    if (editing) {
      const { error } = await supabase.from('products').update(payload).eq('id', editing.id)
      if (error) { setToast({ msg: error.message, type: 'error' }); return }
      setToast({ msg: 'Produto atualizado!', type: 'success' })
    } else {
      const { error } = await supabase.from('products').insert(payload)
      if (error) { setToast({ msg: error.message, type: 'error' }); return }
      setToast({ msg: 'Produto criado!', type: 'success' })
    }
    setModalOpen(false)
    load()
  }

  async function handleDelete() {
    if (!deleteId) return
    const { error } = await supabase.from('products').delete().eq('id', deleteId)
    if (error) { setToast({ msg: error.message, type: 'error' }); return }
    setToast({ msg: 'Produto excluído!', type: 'success' })
    load()
  }

  if (loading) return <Spinner label="Carregando produtos..." />

  return (
    <div>
      <div className="admin-page-head"><h1>Produtos</h1><p>Gerencie os produtos do catálogo</p></div>
      <div className="admin-toolbar"><button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Novo produto</button></div>
      {products.length === 0 ? (
        <EmptyState title="Nenhum produto" message="Clique em 'Novo produto' para começar." />
      ) : (
        <table className="admin-table">
          <thead><tr><th>Nome</th><th>Slug</th><th>Status</th><th>Ações</th></tr></thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td><td>{p.slug}</td>
                <td><span className={`badge ${p.status === 'published' ? 'badge-gold' : 'badge-default'}`}>{p.status}</span></td>
                <td><div className="row-actions">
                  <button className="btn btn-outline" onClick={() => openEdit(p)}><Edit2 size={14} /></button>
                  <button className="btn btn-danger" onClick={() => setDeleteId(p.id)}><Trash2 size={14} /></button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar produto' : 'Novo produto'} wide>
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="form-group"><label>Nome</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          <div className="form-group"><label>Slug</label><input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-gerado se vazio" /></div>
          <div className="form-group"><label>Descrição</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="form-group"><label>Marca</label><select value={form.brand_id} onChange={(e) => setForm({ ...form, brand_id: e.target.value })}><option value="">Selecione...</option>{brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
          <div className="form-group"><label>Categoria</label><select value={form.category_id} onChange={(e) => handleCategoryChange(e.target.value)}><option value="">Selecione...</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          {form.category_id && categorySpec && (
            <TechSpecsForm fields={visibleFields} values={{ ...techSpecs, volumetries }} onChange={handleTechSpecChange} subtype={subtype} hasSubtype={categorySpec.hasSubtype} subtypeLabel={categorySpec.subtypeLabel} subtypeOptions={categorySpec.subtypeOptions} onSubtypeChange={handleSubtypeChange} />
          )}
          <div className="form-group"><label>Status</label><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="draft">Rascunho</option><option value="published">Publicado</option></select></div>
          <div className="form-group"><label>URL da imagem</label><input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} /></div>
          <button type="submit" className="btn btn-primary">{editing ? 'Salvar' : 'Criar'}</button>
        </form>
      </Modal>
      <ConfirmDialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Excluir produto" message="Tem certeza que deseja excluir este produto?" />
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
