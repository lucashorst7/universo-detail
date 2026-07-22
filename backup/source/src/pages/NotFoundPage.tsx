import { Link } from 'react-router-dom'
export default function NotFoundPage() {
  return (
    <div className="bg-secondary-950 min-h-screen flex items-center justify-center py-16">
      <div className="text-center px-4">
        <p className="font-display text-8xl text-primary-400">404</p>
        <h1 className="font-display text-3xl text-white mt-4">Página não encontrada</h1>
        <p className="mt-4 text-neutral-400">A página que você procura não existe.</p>
        <Link to="/" className="mt-8 inline-block bg-primary-500 text-secondary-950 font-medium px-6 py-3 rounded-lg hover:bg-primary-400 transition-colors">Voltar ao início</Link>
      </div>
    </div>
  )
}
