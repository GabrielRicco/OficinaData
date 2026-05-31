import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/NotFound.css';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="not-found-container">
      <div className="not-found-card">
        <h1 className="not-found-title">404</h1>
        <p className="not-found-message">
          Página não encontrada
        </p>
        <p className="not-found-subtitle">
          A página que você está procurando não existe ou foi movida.
        </p>
        <button 
          className="not-found-button" 
          onClick={() => navigate('/agendamentos')}
        >
          Voltar para o Dashboard
        </button>
      </div>
    </div>
  );
}
