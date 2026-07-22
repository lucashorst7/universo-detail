export default function AboutPage() {
  return (
    <div className="bg-neutral-50 min-h-screen py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <p className="font-sans text-xs font-medium tracking-[0.3em] text-primary-500 uppercase">Conheça</p>
        <h1 className="font-display text-5xl text-secondary-950 mt-2 mb-8">Sobre</h1>
        <div className="prose prose-neutral max-w-none">
          <p className="text-neutral-700 leading-relaxed mb-4">O PapoDetail é a Biblioteca Brasileira de Estética Automotiva.</p>
          <p className="text-neutral-700 leading-relaxed mb-4">De hobbista para Hobbista. Portal 100% independente, sem conteúdo patrocinado.</p>
          <p className="text-neutral-700 leading-relaxed">Reunimos produtos das principais marcas do mercado para que você encontre, compare e escolha o que melhor atende às necessidades do seu veículo.</p>
        </div>
      </div>
    </div>
  )
}
