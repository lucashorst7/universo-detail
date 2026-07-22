import { useState } from 'react'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSent(true)
    setName('')
    setEmail('')
    setMessage('')
    setTimeout(() => setSent(false), 5000)
  }

  return (
    <div className="container page">
      <div className="page-header">
        <div>
          <h1>Contato</h1>
          <p className="page-subtitle">Tem dúvidas, sugestões ou quer colaborar? Fale conosco.</p>
        </div>
      </div>

      {sent && <div className="alert alert-success">Mensagem enviada! Entraremos em contato em breve.</div>}

      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="form-label">
          Nome
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="form-input" />
        </label>
        <label className="form-label">
          E-mail
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="form-input" />
        </label>
        <label className="form-label">
          Mensagem
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} required rows={5} className="form-input" />
        </label>
        <button type="submit" className="btn-primary">Enviar</button>
      </form>
    </div>
  )
}
