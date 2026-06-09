import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './PublicPage.css';
import { login } from '../services/authService';

const IconWrench = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

export default function PublicPage({ children }) {
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  const abrirModal = () => { setShowModal(true); setErro(''); };
  const fecharModal = () => { setShowModal(false); setErro(''); setEmail(''); setSenha(''); };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      const auth = await login(email, senha);
      navigate(auth.usuario.perfil === 'GERENTE' ? '/dashboard' : '/agendamentos');
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="pub-layout">
      <nav className="pub-nav">
        <Link to="/" className="pub-nav-logo">
          <IconWrench />
          OficinaData
        </Link>
        <ul className="pub-nav-links">
          <li><Link to="/servicos">Serviços</Link></li>
          <li><Link to="/agendamento">Agendamento</Link></li>
          <li><Link to="/sobre">Sobre</Link></li>
          <li><Link to="/contato">Contato</Link></li>
        </ul>
        <button className="pub-nav-cta" onClick={abrirModal}>Agendar agora</button>
      </nav>

      <main>{children}</main>

      {showModal && (
        <div className="pub-modal-overlay" onClick={(e) => e.target === e.currentTarget && fecharModal()}>
          <div className="pub-modal-card">
            <button className="pub-modal-close" onClick={fecharModal}>×</button>
            <div className="pub-modal-logo"><IconWrench />OficinaData</div>
            <p className="pub-modal-subtitle">Acesso ao sistema interno</p>
            <form onSubmit={handleLogin}>
              <label className="pub-modal-label">E-mail corporativo</label>
              <input className="pub-modal-input" type="email" placeholder="usuario@oficina.local"
                value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
              <label className="pub-modal-label">Senha</label>
              <input className="pub-modal-input" type="password" placeholder="••••••••"
                value={senha} onChange={(e) => setSenha(e.target.value)} required />
              {erro && <p className="pub-modal-error">{erro}</p>}
              <button className="pub-modal-submit" type="submit" disabled={carregando}>
                {carregando ? 'Entrando...' : 'Entrar no sistema'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
