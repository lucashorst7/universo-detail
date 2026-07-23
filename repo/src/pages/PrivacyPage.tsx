export default function PrivacyPage() {
  return (
    <div className="bg-neutral-50 min-h-screen py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-5xl text-secondary-950 mb-8">Privacidade</h1>
        <div className="prose prose-neutral max-w-none">
          <p className="text-neutral-700 leading-relaxed mb-4">Respeitamos sua privacidade. Não compartilhamos seus dados com terceiros sem consentimento.</p>
          <p className="text-neutral-700 leading-relaxed">Utilizamos localStorage para armazenar sua lista de desejos e comparações localmente no seu navegador.</p>
        </div>
      </div>
    </div>
  )
}
