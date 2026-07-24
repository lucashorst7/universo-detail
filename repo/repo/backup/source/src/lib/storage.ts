import { supabase } from './supabase'
const BUCKET = 'product-images'

export async function uploadProductImage(file: File, productId: string): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = `products/${productId}/${Date.now()}.${ext}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true })
  if (error) throw error
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

export async function uploadBrandLogo(file: File, brandId: string): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = `brands/${brandId}/${Date.now()}.${ext}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true })
  if (error) throw error
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

export async function deleteStorageObject(url: string): Promise<void> {
  const marker = `/${BUCKET}/`
  const idx = url.indexOf(marker)
  if (idx === -1) return
  const path = url.slice(idx + marker.length)
  await supabase.storage.from(BUCKET).remove([path])
}
