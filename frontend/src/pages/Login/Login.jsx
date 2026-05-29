import { useState } from 'react';
import './Login.css'; // 👈 Aqui nós conectamos o arquivo de estilo!
import { login } from '../../services/authService';

function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const lidarComLogin = async (e) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      const response = await login(email, senha);
      window.location.href = response.usuario.perfil === 'Gerente' ? '/dashboard' : '/agendamentos';
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={lidarComLogin} className="login-card">
        <h2 className="login-title">🔧 Oficina Data 🔧</h2>
        
        <div className="form-group">
          <label className="form-label">E-mail corporativo:</label>
          <input 
            type="email" 
            placeholder="usuario@oficina.local" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-input"
            required
          />
        </div>

        <div className="form-group-last">
          <label className="form-label">Senha:</label>
          <input 
            type="password" 
            placeholder="••••••••" 
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="form-input"
            required
          />
        </div>

        {erro && <p className="login-error">{erro}</p>}

        <button type="submit" className="btn-submit">
          {carregando ? 'Entrando...' : 'Entrar no Sistema'}
        </button>
      </form>
    </div>
  );
}

export default Login;
