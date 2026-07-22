import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-col">
          <div className="logo">
            <span className="logo-mark">P</span>
            <span className="logo-text">PapoDetailer</span>
          </div>
          <p className="footer-tagline">A enciclopédia colaborativa de produtos de estética automotiva.</p>
        </div>
        <div className="footer-col">
          <h4>Navegação</h4>
          <Link to="/colecoes">Coleções</Link>
          <Link to="/guias">Guias</Link>
          <Link to="/kit-builder">Montar Kit</Link>
          <Link to="/sobre">Sobre</Link>
        </div>
        <div className="footer-col">
          <h4>Conta</h4>
          <Link to="/login">Entrar</Link>
          <Link to="/cadastro">Criar conta</Link>
          <Link to="/perfil">Meu perfil</Link>
        </div>
        <div className="footer-col">
          <h4>Contato</h4>
          <Link to="/contato">Fale conosco</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} PapoDetailer. Todos os direitos reservados.</p>
      </div>
    </footer>
  )
}
