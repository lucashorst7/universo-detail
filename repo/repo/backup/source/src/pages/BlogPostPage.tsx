import { useParams, Link } from 'react-router-dom'

export default function BlogPostPage() {
  const { slug } = useParams()
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="font-display text-4xl font-bold text-secondary-900">Post {slug}</h1>
      <p className="mt-4 text-neutral-500">Conteúdo completo em breve.</p>
      <Link to="/blog" className="mt-6 inline-block text-primary-600">Voltar para o blog</Link>
    </div>
  )
}
