import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AccessDenied.css';

export function AccessDenied() {
  const navigate = useNavigate();

  return (
    <div className="access-denied-container">
      <div className="access-denied-card">
        <h1 className="access-denied-title">🔒 Acesso Negado</h1>
        <p className="access-denied-message">
          Você não tem permissão para acessar este recurso.
        </p>
        <p className="access-denied-subtitle">
          Contacte o administrador se acredita que isto é um erro.
        </p>
        <button 
          className="access-denied-button" 
          onClick={() => navigate('/agendamentos')}
        >
          Voltar para o Dashboard
        </button>
      </div>
    </div>
  );
}
