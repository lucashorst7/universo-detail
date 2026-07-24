import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Droplet, Armchair, Sparkles, Eye, Shield, Shirt, Wrench, SprayCan, ArrowRight } from 'lucide-react'
import { supabase } from '../lib/supabase'

// New 8-category taxonomy — order matches the owner's spec, icons per category.
const categoryIcons = [
  { name: 'Shampoo e Limpeza Externa', slug: 'shampoo-e-limpeza-externa', icon: Droplet },
  { name: 'Limpeza Interna', slug: 'limpeza-interna', icon: Armchair },
  { name: 'Ceras e Selantes', slug: 'ceras-e-selantes', icon: Sparkles },
  { name: 'Limpeza de Vidros', slug: 'limpeza-de-vidros', icon: Eye },
  { name: 'Polimento e Vitrificadores', slug: 'polimento-e-vitrificadores', icon: Shield },
  { name: 'Flanelas e Toalhas', slug: 'flanelas-e-toalhas', icon: Shirt },
  { name: 'Acessórios e Ferramentas', slug: 'acessorios-e-ferramentas', icon: Wrench },
  { name: 'Aromatizantes', slug: 'aromatizantes', icon: SprayCan },
]

// Verified-working Pexels MP4 URLs (HTTP 200). Primary = car washed with soap
// & sponge (closest to snow foam); fallback = automated car wash with foam.
const HERO_VIDEO_SOURCES = [
  'https://videos.pexels.com/video-files/4863282/4863282-hd_1920_1080_30fps.mp4',
  'https://videos.pexels.com/video-files/17712334/17712334-hd_1920_1080_30fps.mp4',
]

export default function Home() {
  const [productCount, setProductCount] = useState(0)
  const [brandCount, setBrandCount] = useState(0)
  const [userCount, setUserCount] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'published').is('parent_product_id', null).then(({ count }) => setProductCount(count ?? 0))
    supabase.from('brands').select('*', { count: 'exact', head: true }).then(({ count }) => setBrandCount(count ?? 0))
    supabase.rpc('get_user_count').then(({ data }) => setUserCount((data as number) ?? 0))
  }, [])

  // Browsers sometimes stall on autoplay; nudge play() on mount + visibility.
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const tryPlay = () => { const p = v.play(); if (p && typeof p.catch === 'function') p.catch(() => {}) }
    tryPlay()
    document.addEventListener('visibilitychange', tryPlay)
    return () => document.removeEventListener('visibilitychange', tryPlay)
  }, [])

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-secondary-950">
        {/* Background video — car being washed with soap/foam, subtle/translucent */}
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover opacity-35"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
        >
          {HERO_VIDEO_SOURCES.map((src) => <source key={src} src={src} type="video/mp4" />)}
        </video>

        {/* Dark overlays for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-secondary-950/80 via-secondary-950/70 to-secondary-950/90" />
        <div className="absolute inset-0 bg-secondary-950/40" />

        {/* Subtle top divider with decorative element */}
        <div className="relative border-b border-primary-500/10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center py-4 gap-4">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary-500/30" />
              <div className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-primary-500/40" />
                <span className="h-1.5 w-1.5 rounded-full bg-primary-500/60" />
                <span className="h-1 w-1 rounded-full bg-primary-500/40" />
              </div>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary-500/30" />
            </div>
          </div>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-[78vh] flex-col items-center justify-center py-20 text-center lg:py-24">
            <div className="animate-hero-fade w-full max-w-3xl">
              <p className="font-sans text-xs font-medium tracking-[0.25em] text-primary-400 uppercase mb-6">
                Biblioteca Brasileira de Estética Automotiva
              </p>
              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-white leading-tight">
                Papo<span className="text-primary-400">Detail</span>
              </h1>
              <p className="mt-5 font-heading text-2xl text-primary-300/90 italic">De hobbista para Hobbista</p>
              <p className="mt-3 text-sm text-neutral-300 tracking-wide">Portal 100% independente, sem conteúdo patrocinado</p>

              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <Link to="/produtos" className="group inline-flex items-center gap-2 bg-primary-500 text-secondary-950 font-medium px-6 py-3 rounded-lg hover:bg-primary-400 transition-colors">
                  Explorar Produtos
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link to="/categorias" className="inline-flex items-center gap-2 border border-primary-500/40 text-primary-300 font-medium px-6 py-3 rounded-lg hover:bg-primary-500/10 transition-colors">
                  Ver Categorias
                </Link>
              </div>

              <div className="mt-14 grid grid-cols-3 gap-6 max-w-lg mx-auto">
                <div><p className="font-display text-3xl text-primary-400">{productCount}</p><p className="text-[11px] font-medium tracking-widest text-neutral-300 uppercase mt-1">produtos cadastrados</p></div>
                <div><p className="font-display text-3xl text-primary-400">{brandCount}</p><p className="text-[11px] font-medium tracking-widest text-neutral-300 uppercase mt-1">marcas cadastradas</p></div>
                <div><p className="font-display text-3xl text-primary-400">{userCount}</p><p className="text-[11px] font-medium tracking-widest text-neutral-300 uppercase mt-1">usuários cadastrados</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="bg-neutral-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="font-sans text-xs font-medium tracking-[0.3em] text-primary-500 uppercase">Explore por</p>
            <h2 className="font-display text-4xl text-secondary-950 mt-2">Categorias</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {categoryIcons.map((cat) => { const Icon = cat.icon; return (
              <Link key={cat.slug} to={`/categoria/${cat.slug}`} className="group bg-white rounded-xl p-6 border border-neutral-200 hover:border-primary-300 hover:shadow-lg transition-all duration-300">
                <div className="rounded-lg bg-secondary-950 group-hover:bg-primary-500 p-3 w-fit transition-colors"><Icon className="h-6 w-6 text-primary-400 group-hover:text-secondary-950" /></div>
                <h3 className="mt-4 font-sans font-semibold text-secondary-950">{cat.name}</h3>
              </Link>
            )})}
          </div>
        </div>
      </section>
    </>
  )
}
