import { Fragment, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { generateSlug } from '../lib/slug'
import { uploadProductImage, uploadBrandLogo, deleteStorageObject } from '../lib/storage'
import type { Category, Brand, Product, Guide, Collection, BlogPost, ProductStatus } from '../types'
import DeleteConfirmModal from '../components/DeleteConfirmModal'

type Tab = 'products' | 'categories' | 'brands' | 'guides' | 'collections' | 'blog' | 'comments' | 'banned' | 'audit'
const tabs: { key: Tab; label: string }[] = [
  { key: 'products', label: 'Produtos' }, { key: 'categories', label: 'Categorias' }, { key: 'brands', label: 'Marcas' },
  { key: 'guides', label: 'Guias' }, { key: 'collections', label: 'Coleções' }, { key: 'blog', label: 'Blog' },
  { key: 'comments', label: 'Comentários' }, { key: 'banned', label: 'Banidos' }, { key: 'audit', label: 'Auditoria' },
]

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [loginError, setLoginError] = useState('')
  const [tab, setTab] = useState<Tab>('products')
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setAuthed(!!data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => setAuthed(!!session))
    return () => sub.subscription.unsubscribe()
  }, [])
  const login = async (e: React.FormEvent) => { e.preventDefault(); setLoginError(''); const { error } = await supabase.auth.signInWithPassword({ email, password }); if (error) setLoginError(error.message) }
  const logout = async () => { await supabase.auth.signOut() }

  if (!authed) {
    return (
      <div className="bg-secondary-950 min-h-screen flex items-center justify-center py-16">
        <div className="w-full max-w-md px-4">
          <form onSubmit={login} className="bg-secondary-900 border border-secondary-800 rounded-2xl p-6 space-y-4">
            <h1 className="font-heading text-2xl text-white text-center">Admin</h1>
            {loginError && <p className="text-sm text-error-500 bg-error-500/10 rounded-lg p-3">{loginError}</p>}
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" required className="w-full bg-secondary-950 border border-secondary-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary-400" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" required className="w-full bg-secondary-950 border border-secondary-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary-400" />
            <button type="submit" className="w-full bg-primary-500 text-secondary-950 font-medium py-2.5 rounded-lg text-sm hover:bg-primary-400">Entrar</button>
          </form>
        </div>
      </div>
    )
  }
  return (
    <div className="bg-neutral-50 min-h-screen py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8"><h1 className="font-display text-4xl text-secondary-950">Painel Admin</h1><button onClick={logout} className="text-sm text-neutral-500 hover:text-error-500">Sair</button></div>
        <div className="flex flex-wrap gap-2 mb-8">{tabs.map((t) => <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.key ? 'bg-secondary-950 text-primary-400' : 'bg-white border border-neutral-200 text-neutral-600 hover:border-primary-300'}`}>{t.label}</button>)}</div>
        {tab === 'products' && <ProductsList />}
        {tab === 'categories' && <CategoriesList />}
        {tab === 'brands' && <BrandsList />}
        {tab === 'guides' && <GuidesList />}
        {tab === 'collections' && <CollectionsList />}
        {tab === 'blog' && <BlogList />}
        {tab === 'comments' && <CommentsList />}
        {tab === 'banned' && <BannedList />}
        {tab === 'audit' && <AuditList />}
      </div>
    </div>
  )
}

function ProductsList() {
  const [items, setItems] = useState<Product[]>([]); const [categories, setCategories] = useState<Category[]>([]); const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true); const [editing, setEditing] = useState<Product | null>(null); const [creating, setCreating] = useState(false); const [toDelete, setToDelete] = useState<Product | null>(null)
  const load = async () => {
    setLoading(true)
    const [{ data: prods }, { data: cats }, { data: brs }] = await Promise.all([
      supabase.from('products').select('*, category:categories(*), brand:brands(*)').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name'), supabase.from('brands').select('*').order('name'),
    ])
    setItems((prods ?? []) as Product[]); setCategories((cats ?? []) as Category[]); setBrands((brs ?? []) as Brand[]); setLoading(false)
  }
  useEffect(() => { load() }, [])
  const confirmDelete = async () => { if (!toDelete) return; if (toDelete.image_url) { try { await deleteStorageObject(toDelete.image_url) } catch { /* ignore */ } } await supabase.from('products').delete().eq('id', toDelete.id); setToDelete(null); load() }
  return (
    <div>
      <div className="flex items-center justify-between mb-4"><h2 className="font-heading text-2xl text-secondary-950">Produtos</h2><button onClick={() => setCreating(true)} className="bg-primary-500 text-secondary-950 font-medium px-4 py-2 rounded-lg text-sm hover:bg-primary-400">Novo produto</button></div>
      {loading ? <div className="flex justify-center"><div className="h-8 w-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" /></div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((p) => (
            <Fragment key={p.id}>
              <div className="bg-white rounded-xl border border-neutral-200 p-4 flex gap-3">
                <div className="h-16 w-16 rounded-lg bg-neutral-100 overflow-hidden flex-shrink-0">{p.image_url ? <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" /> : null}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-primary-500 uppercase tracking-wider">{p.brand?.name}</p>
                  <h3 className="font-sans text-sm font-medium text-secondary-950 truncate">{p.name}</h3>
                  <p className="text-xs text-neutral-400">{p.category?.name}</p>
                  <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded ${p.status === 'published' ? 'bg-success-500/10 text-success-700' : 'bg-neutral-200 text-neutral-600'}`}>{p.status === 'published' ? 'Publicado' : 'Rascunho'}</span>
                  <div className="mt-2 flex gap-2"><button onClick={() => setEditing(p)} className="text-xs text-primary-600 hover:underline">Editar</button><button onClick={() => setToDelete(p)} className="text-xs text-error-500 hover:underline">Excluir</button></div>
                </div>
              </div>
            </Fragment>
          ))}
        </div>
      )}
      {(editing || creating) && <ProductForm product={editing} categories={categories} brands={brands} onClose={() => { setEditing(null); setCreating(false) }} onSaved={() => { setEditing(null); setCreating(false); load() }} />}
      <DeleteConfirmModal open={!!toDelete} message={`Excluir "${toDelete?.name}"?`} onConfirm={confirmDelete} onCancel={() => setToDelete(null)} />
    </div>
  )
}

function ProductForm({ product, categories, brands, onClose, onSaved }: { product: Product | null; categories: Category[]; brands: Brand[]; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(product?.name ?? ''); const [description, setDescription] = useState(product?.description ?? '')
  const [status, setStatus] = useState<ProductStatus>(product?.status ?? 'draft'); const [categoryId, setCategoryId] = useState(product?.category_id ?? categories[0]?.id ?? '')
  const [brandId, setBrandId] = useState(product?.brand_id ?? brands[0]?.id ?? ''); const [affiliateUrl, setAffiliateUrl] = useState(product?.affiliate_url ?? '')
  const [variantLabel, setVariantLabel] = useState(product?.variant_label ?? ''); const [parentId, setParentId] = useState(product?.parent_product_id ?? '')
  const [imageFile, setImageFile] = useState<File | null>(null); const imageUrl = product?.image_url ?? ''; const [saving, setSaving] = useState(false)
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); const slug = generateSlug(name)
    const payload: Record<string, unknown> = { name, slug, description: description || null, status, category_id: categoryId, brand_id: brandId, affiliate_url: affiliateUrl || null, variant_label: variantLabel || null, parent_product_id: parentId || null }
    let id = product?.id
    if (product) { await supabase.from('products').update(payload).eq('id', product.id) } else { const { data } = await supabase.from('products').insert(payload).select('id').single(); id = data?.id }
    if (imageFile && id) { try { const url = await uploadProductImage(imageFile, id); await supabase.from('products').update({ image_url: url }).eq('id', id) } catch { /* ignore */ } }
    setSaving(false); onSaved()
  }
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full my-8" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-heading text-2xl text-secondary-950 mb-4">{product ? 'Editar' : 'Novo'} Produto</h3>
        <form onSubmit={submit} className="space-y-4">
          <div><label className="block text-xs uppercase tracking-widest text-neutral-500 mb-1">Nome</label><input value={name} onChange={(e) => setName(e.target.value)} required className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-400" /></div>
          <div><label className="block text-xs uppercase tracking-widest text-neutral-500 mb-1">Descrição</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-400" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs uppercase tracking-widest text-neutral-500 mb-1">Categoria</label><select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-400">{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            <div><label className="block text-xs uppercase tracking-widest text-neutral-500 mb-1">Marca</label><select value={brandId} onChange={(e) => setBrandId(e.target.value)} className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-400">{brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs uppercase tracking-widest text-neutral-500 mb-1">Status</label><select value={status} onChange={(e) => setStatus(e.target.value as ProductStatus)} className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-400"><option value="draft">Rascunho</option><option value="published">Publicado</option></select></div>
            <div><label className="block text-xs uppercase tracking-widest text-neutral-500 mb-1">Variante (rótulo)</label><input value={variantLabel} onChange={(e) => setVariantLabel(e.target.value)} className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-400" /></div>
          </div>
          <div><label className="block text-xs uppercase tracking-widest text-neutral-500 mb-1">URL de afiliado</label><input value={affiliateUrl} onChange={(e) => setAffiliateUrl(e.target.value)} className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-400" /></div>
          <div><label className="block text-xs uppercase tracking-widest text-neutral-500 mb-1">Produto pai (ID, opcional)</label><input value={parentId} onChange={(e) => setParentId(e.target.value)} className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-400" /></div>
          <div><label className="block text-xs uppercase tracking-widest text-neutral-500 mb-1">Imagem</label>{imageUrl && <img src={imageUrl} alt="" className="h-20 w-20 object-cover rounded-lg mb-2" />}<input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} className="text-sm" /></div>
          <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-neutral-600 border border-neutral-300">Cancelar</button><button type="submit" disabled={saving} className="px-4 py-2 rounded-lg text-sm bg-primary-500 text-secondary-950 font-medium hover:bg-primary-400 disabled:opacity-50">{saving ? 'Salvando...' : 'Salvar'}</button></div>
        </form>
      </div>
    </div>
  )
}

function CategoriesList() {
  const [items, setItems] = useState<Category[]>([]); const [loading, setLoading] = useState(true); const [name, setName] = useState(''); const [description, setDescription] = useState('')
  const load = async () => { setLoading(true); const { data } = await supabase.from('categories').select('*').order('display_order', { ascending: true }); setItems((data ?? []) as Category[]); setLoading(false) }
  useEffect(() => { load() }, [])
  const add = async (e: React.FormEvent) => { e.preventDefault(); if (!name.trim()) return; await supabase.from('categories').insert({ name, slug: generateSlug(name), description: description || null }); setName(''); setDescription(''); load() }
  const remove = async (id: string) => { await supabase.from('categories').delete().eq('id', id); load() }
  return (
    <div>
      <h2 className="font-heading text-2xl text-secondary-950 mb-4">Categorias</h2>
      <form onSubmit={add} className="bg-white rounded-xl border border-neutral-200 p-4 mb-6 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-40"><label className="block text-xs uppercase tracking-widest text-neutral-500 mb-1">Nome</label><input value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-400" /></div>
        <div className="flex-1 min-w-40"><label className="block text-xs uppercase tracking-widest text-neutral-500 mb-1">Descrição</label><input value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-400" /></div>
        <button type="submit" className="bg-primary-500 text-secondary-950 font-medium px-4 py-2 rounded-lg text-sm hover:bg-primary-400">Adicionar</button>
      </form>
      {loading ? <p className="text-neutral-500 text-sm">Carregando...</p> : <ul className="space-y-2">{items.map((c) => <li key={c.id} className="bg-white rounded-lg border border-neutral-200 p-3 flex items-center justify-between"><div><p className="font-sans font-medium text-secondary-950">{c.name}</p><p className="text-xs text-neutral-400">{c.slug}</p></div><button onClick={() => remove(c.id)} className="text-xs text-error-500 hover:underline">Excluir</button></li>)}</ul>}
    </div>
  )
}

function BrandsList() {
  const [items, setItems] = useState<Brand[]>([]); const [loading, setLoading] = useState(true)
  const [name, setName] = useState(''); const [country, setCountry] = useState(''); const [description, setDescription] = useState(''); const [logoFile, setLogoFile] = useState<File | null>(null)
  const load = async () => { setLoading(true); const { data } = await supabase.from('brands').select('*').order('name'); setItems((data ?? []) as Brand[]); setLoading(false) }
  useEffect(() => { load() }, [])
  const add = async (e: React.FormEvent) => {
    e.preventDefault(); if (!name.trim()) return
    const { data } = await supabase.from('brands').insert({ name, slug: generateSlug(name), country: country || null, description: description || null }).select('id').single()
    if (data && logoFile) { try { const url = await uploadBrandLogo(logoFile, data.id); await supabase.from('brands').update({ logo_url: url }).eq('id', data.id) } catch { /* ignore */ } }
    setName(''); setCountry(''); setDescription(''); setLogoFile(null); load()
  }
  const remove = async (b: Brand) => { if (b.logo_url) { try { await deleteStorageObject(b.logo_url) } catch { /* ignore */ } } await supabase.from('brands').delete().eq('id', b.id); load() }
  return (
    <div>
      <h2 className="font-heading text-2xl text-secondary-950 mb-4">Marcas</h2>
      <form onSubmit={add} className="bg-white rounded-xl border border-neutral-200 p-4 mb-6 space-y-3">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-40"><label className="block text-xs uppercase tracking-widest text-neutral-500 mb-1">Nome</label><input value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-400" /></div>
          <div className="flex-1 min-w-40"><label className="block text-xs uppercase tracking-widest text-neutral-500 mb-1">País</label><input value={country} onChange={(e) => setCountry(e.target.value)} className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-400" /></div>
        </div>
        <div><label className="block text-xs uppercase tracking-widest text-neutral-500 mb-1">Descrição</label><input value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-400" /></div>
        <div><label className="block text-xs uppercase tracking-widest text-neutral-500 mb-1">Logo</label><input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)} className="text-sm" /></div>
        <button type="submit" className="bg-primary-500 text-secondary-950 font-medium px-4 py-2 rounded-lg text-sm hover:bg-primary-400">Adicionar</button>
      </form>
      {loading ? <p className="text-neutral-500 text-sm">Carregando...</p> : <ul className="space-y-2">{items.map((b) => <li key={b.id} className="bg-white rounded-lg border border-neutral-200 p-3 flex items-center justify-between"><div className="flex items-center gap-3">{b.logo_url && <img src={b.logo_url} alt={b.name} className="h-10 w-10 object-contain" />}<div><p className="font-sans font-medium text-secondary-950">{b.name}</p><p className="text-xs text-neutral-400">{b.country ?? '—'} · {b.slug}</p></div></div><button onClick={() => remove(b)} className="text-xs text-error-500 hover:underline">Excluir</button></li>)}</ul>}
    </div>
  )
}

function GuidesList() {
  const [items, setItems] = useState<Guide[]>([]); const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState(''); const [excerpt, setExcerpt] = useState(''); const [content, setContent] = useState('')
  const load = async () => { setLoading(true); const { data } = await supabase.from('guides').select('*').order('created_at', { ascending: false }); setItems((data ?? []) as Guide[]); setLoading(false) }
  useEffect(() => { load() }, [])
  const add = async (e: React.FormEvent) => { e.preventDefault(); if (!title.trim()) return; await supabase.from('guides').insert({ title, slug: generateSlug(title), excerpt: excerpt || null, content }); setTitle(''); setExcerpt(''); setContent(''); load() }
  const remove = async (id: string) => { await supabase.from('guides').delete().eq('id', id); load() }
  return (
    <div>
      <h2 className="font-heading text-2xl text-secondary-950 mb-4">Guias</h2>
      <form onSubmit={add} className="bg-white rounded-xl border border-neutral-200 p-4 mb-6 space-y-3">
        <div><label className="block text-xs uppercase tracking-widest text-neutral-500 mb-1">Título</label><input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-400" /></div>
        <div><label className="block text-xs uppercase tracking-widest text-neutral-500 mb-1">Resumo</label><input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-400" /></div>
        <div><label className="block text-xs uppercase tracking-widest text-neutral-500 mb-1">Conteúdo</label><textarea value={content} onChange={(e) => setContent(e.target.value)} rows={5} className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-400" /></div>
        <button type="submit" className="bg-primary-500 text-secondary-950 font-medium px-4 py-2 rounded-lg text-sm hover:bg-primary-400">Adicionar</button>
      </form>
      {loading ? <p className="text-neutral-500 text-sm">Carregando...</p> : <ul className="space-y-2">{items.map((g) => <li key={g.id} className="bg-white rounded-lg border border-neutral-200 p-3 flex items-center justify-between"><p className="font-sans font-medium text-secondary-950">{g.title}</p><button onClick={() => remove(g.id)} className="text-xs text-error-500 hover:underline">Excluir</button></li>)}</ul>}
    </div>
  )
}

function CollectionsList() {
  const [items, setItems] = useState<Collection[]>([]); const [loading, setLoading] = useState(true)
  const [name, setName] = useState(''); const [description, setDescription] = useState('')
  const load = async () => { setLoading(true); const { data } = await supabase.from('collections').select('*').order('created_at', { ascending: false }); setItems((data ?? []) as Collection[]); setLoading(false) }
  useEffect(() => { load() }, [])
  const add = async (e: React.FormEvent) => { e.preventDefault(); if (!name.trim()) return; await supabase.from('collections').insert({ name, slug: generateSlug(name), description: description || null, product_ids: [] }); setName(''); setDescription(''); load() }
  const remove = async (id: string) => { await supabase.from('collections').delete().eq('id', id); load() }
  return (
    <div>
      <h2 className="font-heading text-2xl text-secondary-950 mb-4">Coleções</h2>
      <form onSubmit={add} className="bg-white rounded-xl border border-neutral-200 p-4 mb-6 space-y-3">
        <div><label className="block text-xs uppercase tracking-widest text-neutral-500 mb-1">Nome</label><input value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-400" /></div>
        <div><label className="block text-xs uppercase tracking-widest text-neutral-500 mb-1">Descrição</label><input value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-400" /></div>
        <button type="submit" className="bg-primary-500 text-secondary-950 font-medium px-4 py-2 rounded-lg text-sm hover:bg-primary-400">Adicionar</button>
      </form>
      {loading ? <p className="text-neutral-500 text-sm">Carregando...</p> : <ul className="space-y-2">{items.map((c) => <li key={c.id} className="bg-white rounded-lg border border-neutral-200 p-3 flex items-center justify-between"><div><p className="font-sans font-medium text-secondary-950">{c.name}</p><p className="text-xs text-neutral-400">{c.product_ids?.length ?? 0} produtos</p></div><button onClick={() => remove(c.id)} className="text-xs text-error-500 hover:underline">Excluir</button></li>)}</ul>}
    </div>
  )
}

function BlogList() {
  const [items, setItems] = useState<BlogPost[]>([]); const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState(''); const [author, setAuthor] = useState(''); const [excerpt, setExcerpt] = useState(''); const [content, setContent] = useState('')
  const load = async () => { setLoading(true); const { data } = await supabase.from('blog_posts').select('*').order('published_at', { ascending: false }); setItems((data ?? []) as BlogPost[]); setLoading(false) }
  useEffect(() => { load() }, [])
  const add = async (e: React.FormEvent) => { e.preventDefault(); if (!title.trim()) return; await supabase.from('blog_posts').insert({ title, slug: generateSlug(title), author: author || null, excerpt: excerpt || null, content, published_at: new Date().toISOString() }); setTitle(''); setAuthor(''); setExcerpt(''); setContent(''); load() }
  const remove = async (id: string) => { await supabase.from('blog_posts').delete().eq('id', id); load() }
  return (
    <div>
      <h2 className="font-heading text-2xl text-secondary-950 mb-4">Blog</h2>
      <form onSubmit={add} className="bg-white rounded-xl border border-neutral-200 p-4 mb-6 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-xs uppercase tracking-widest text-neutral-500 mb-1">Título</label><input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-400" /></div>
          <div><label className="block text-xs uppercase tracking-widest text-neutral-500 mb-1">Autor</label><input value={author} onChange={(e) => setAuthor(e.target.value)} className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-400" /></div>
        </div>
        <div><label className="block text-xs uppercase tracking-widest text-neutral-500 mb-1">Resumo</label><input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-400" /></div>
        <div><label className="block text-xs uppercase tracking-widest text-neutral-500 mb-1">Conteúdo</label><textarea value={content} onChange={(e) => setContent(e.target.value)} rows={5} className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-400" /></div>
        <button type="submit" className="bg-primary-500 text-secondary-950 font-medium px-4 py-2 rounded-lg text-sm hover:bg-primary-400">Adicionar</button>
      </form>
      {loading ? <p className="text-neutral-500 text-sm">Carregando...</p> : <ul className="space-y-2">{items.map((p) => <li key={p.id} className="bg-white rounded-lg border border-neutral-200 p-3 flex items-center justify-between"><div><p className="font-sans font-medium text-secondary-950">{p.title}</p><p className="text-xs text-neutral-400">{p.author ?? '—'}</p></div><button onClick={() => remove(p.id)} className="text-xs text-error-500 hover:underline">Excluir</button></li>)}</ul>}
    </div>
  )
}

interface AdminComment { id: string; product_id: string; user_name: string; content: string; created_at: string }
function CommentsList() {
  const [items, setItems] = useState<AdminComment[]>([]); const [loading, setLoading] = useState(true)
  const load = async () => { setLoading(true); const { data } = await supabase.from('comments').select('*').order('created_at', { ascending: false }); setItems((data ?? []) as AdminComment[]); setLoading(false) }
  useEffect(() => { load() }, [])
  const remove = async (id: string) => { await supabase.from('comments').delete().eq('id', id); load() }
  return (
    <div>
      <h2 className="font-heading text-2xl text-secondary-950 mb-4">Comentários</h2>
      {loading ? <p className="text-neutral-500 text-sm">Carregando...</p> : items.length === 0 ? <p className="text-neutral-500 text-sm">Nenhum comentário.</p> : <ul className="space-y-2">{items.map((c) => <li key={c.id} className="bg-white rounded-lg border border-neutral-200 p-3 flex items-start justify-between"><div><p className="font-sans font-medium text-secondary-950">{c.user_name}</p><p className="text-sm text-neutral-600 mt-1">{c.content}</p></div><button onClick={() => remove(c.id)} className="text-xs text-error-500 hover:underline">Excluir</button></li>)}</ul>}
    </div>
  )
}

interface BannedEmail { id: string; email: string; created_at: string }
function BannedList() {
  const [items, setItems] = useState<BannedEmail[]>([]); const [loading, setLoading] = useState(true); const [email, setEmail] = useState('')
  const load = async () => { setLoading(true); const { data } = await supabase.from('banned_emails').select('*').order('created_at', { ascending: false }); setItems((data ?? []) as BannedEmail[]); setLoading(false) }
  useEffect(() => { load() }, [])
  const add = async (e: React.FormEvent) => { e.preventDefault(); if (!email.trim()) return; await supabase.from('banned_emails').insert({ email }); setEmail(''); load() }
  const remove = async (id: string) => { await supabase.from('banned_emails').delete().eq('id', id); load() }
  return (
    <div>
      <h2 className="font-heading text-2xl text-secondary-950 mb-4">E-mails Banidos</h2>
      <form onSubmit={add} className="bg-white rounded-xl border border-neutral-200 p-4 mb-6 flex gap-3">
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e-mail" className="flex-1 border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-400" />
        <button type="submit" className="bg-primary-500 text-secondary-950 font-medium px-4 py-2 rounded-lg text-sm hover:bg-primary-400">Banir</button>
      </form>
      {loading ? <p className="text-neutral-500 text-sm">Carregando...</p> : items.length === 0 ? <p className="text-neutral-500 text-sm">Nenhum e-mail banido.</p> : <ul className="space-y-2">{items.map((b) => <li key={b.id} className="bg-white rounded-lg border border-neutral-200 p-3 flex items-center justify-between"><p className="font-sans text-sm text-secondary-950">{b.email}</p><button onClick={() => remove(b.id)} className="text-xs text-error-500 hover:underline">Desbanir</button></li>)}</ul>}
    </div>
  )
}

interface AuditEntry { id: string; action: string; entity_type: string; entity_id: string; user_email: string; created_at: string }
function AuditList() {
  const [items, setItems] = useState<AuditEntry[]>([]); const [loading, setLoading] = useState(true)
  useEffect(() => { supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(50).then(({ data }) => { setItems((data ?? []) as AuditEntry[]); setLoading(false) }) }, [])
  return (
    <div>
      <h2 className="font-heading text-2xl text-secondary-950 mb-4">Auditoria</h2>
      {loading ? <p className="text-neutral-500 text-sm">Carregando...</p> : items.length === 0 ? <p className="text-neutral-500 text-sm">Nenhum registro.</p> : <ul className="space-y-2">{items.map((a) => <li key={a.id} className="bg-white rounded-lg border border-neutral-200 p-3 text-sm"><p className="text-secondary-950"><span className="font-medium">{a.action}</span> · {a.entity_type} · {a.entity_id}</p><p className="text-xs text-neutral-400">{a.user_email} · {new Date(a.created_at).toLocaleString('pt-BR')}</p></li>)}</ul>}
    </div>
  )
}
