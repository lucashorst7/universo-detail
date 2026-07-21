import { Link } from 'react-router-dom'
import './footer.css'

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-col">
          <h4>Universo Detail</h4>
          <p className="footer-desc">A biblioteca de produtos para estética automotiva. Encontre os melhores produtos, marcas e categorias para o cuidado do seu veículo.</p>
        </div>
        <div className="footer-col">
          <h4>Navegação</h4>
          <Link to="/">Início</Link>
          <Link to="/produtos">Produtos</Link>
          <Link to="/marcas">Marcas</Link>
        </div>
        <div className="footer-col">
          <h4>Categorias</h4>
          <Link to="/produtos">Ver todas</Link>
        </div>
        <div className="footer-col">
          <h4>Contato</h4>
          <p className="footer-desc">contato@universodetail.com.br</p>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} Universo Detail. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
