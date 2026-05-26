import React, { useState } from 'react';
import './Login.css'; // 👈 Aqui nós conectamos o arquivo de estilo!

function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const lidarComLogin = (e) => {
    e.preventDefault();

    // Simulação das regras de perfil do seu banco de dados
    if (email === 'atendente@oficina.local') {
      alert('Login aceito! Perfil: Atendente. Redirecionando...');
      window.location.href = '/agendamentos';
    } else if (email === 'gerente@oficina.local') {
      alert('Login aceito! Perfil: Gerente. Redirecionando...');
      window.location.href = '/dashboard';
    } else {
      alert('Usuário não encontrado ou senha incorreta!');
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

        <button type="submit" className="btn-submit">
          Entrar no Sistema
        </button>
      </form>
    </div>
  );
}

export default Login;