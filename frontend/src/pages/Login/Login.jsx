import React from 'react';
import PublicPage from '../../components/PublicPage';
import './Login.css';

const IconCar = () => (
  <svg viewBox="0 0 80 50" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="18" width="70" height="22" rx="5" />
    <path d="M15 18 L25 5 H55 L65 18" />
    <circle cx="20" cy="42" r="6" />
    <circle cx="60" cy="42" r="6" />
    <line x1="5" y1="26" x2="75" y2="26" />
  </svg>
);

const IconEngine = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="8" width="18" height="12" rx="2" />
    <path d="M7 8V6M12 8V5M17 8V6" />
    <path d="M3 14h18" />
    <path d="M1 11h2M21 11h2" />
  </svg>
);

const IconWheels = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="3" />
    <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
  </svg>
);

const IconSnowflake = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="2" x2="12" y2="22" />
    <path d="m20 7-8 5-8-5M20 17l-8-5-8 5" />
    <path d="m2 12 3-1.5M19 10.5l3-1.5M2 12l3 1.5M19 13.5l3 1.5" />
  </svg>
);

const IconBolt = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

export default function Login() {
  return (
    <PublicPage>
      <section className="hero">
        <div className="hero-left">
          <h1>Sua oficina de<br />confiança há 20 anos</h1>
          <p>Diagnóstico rápido, peças originais e equipe especializada para manter seu carro sempre em dia.</p>
          <a href="/servicos" className="hero-btn">Ver serviços →</a>
        </div>
        <div className="hero-right">
          <IconCar />
        </div>
      </section>

      <section className="services" id="servicos">
        <div className="service-card">
          <IconEngine />
          <h3>Motor &amp; transmissão</h3>
          <p>Revisão completa e diagnóstico eletrônico</p>
        </div>
        <div className="service-card">
          <IconWheels />
          <h3>Alinhamento e balanceamento</h3>
          <p>Equipamento de última geração</p>
        </div>
        <div className="service-card">
          <IconSnowflake />
          <h3>Ar-condicionado</h3>
          <p>Recarga e manutenção preventiva</p>
        </div>
        <div className="service-card">
          <IconBolt />
          <h3>Elétrica automotiva</h3>
          <p>Instalações e reparos elétricos</p>
        </div>
      </section>

      <div className="bottom-row" id="sobre">
        <div className="stats">
          <div className="stat-item">
            <span className="stat-value">3.800+</span>
            <span className="stat-label">Clientes<br />atendidos</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">12</span>
            <span className="stat-label">Mecânicos<br />especializados</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">98%</span>
            <span className="stat-label">Satisfação<br />dos clientes</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">24h</span>
            <span className="stat-label">Plantão de<br />emergência</span>
          </div>
        </div>
        <div className="whatsapp-card" id="contato">
          <h3>Agende sua revisão</h3>
          <p>Atendimento rápido e sem filas</p>
          <a href="/contato" className="whatsapp-btn">Falar no WhatsApp</a>
        </div>
      </div>
    </PublicPage>
  );
}
