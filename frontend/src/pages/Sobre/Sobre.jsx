import React from 'react';
import PublicPage from '../../components/PublicPage';
import './Sobre.css';

const timeline = [
  { year: '2004', title: 'Fundação', desc: 'Abrimos as portas com 3 mecânicos e foco em manutenção preventiva.' },
  { year: '2010', title: 'Expansão', desc: 'Ampliamos o espaço para 12 boxes e incorporamos diagnóstico eletrônico.' },
  { year: '2018', title: 'Certificação', desc: 'Obtivemos certificação ISO 9001 em gestão de qualidade automotiva.' },
  { year: '2024', title: 'Sistema digital', desc: 'Lançamos o OficinaData — plataforma própria de gestão de OS, clientes e estoque.' },
];

const team = [
  { nome: 'Carlos Menezes', cargo: 'Diretor Técnico', exp: '22 anos de experiência' },
  { nome: 'Fernanda Lopes', cargo: 'Gerente de Operações', exp: 'Pós-graduada em Gestão Automotiva' },
  { nome: 'Rafael Souza', cargo: 'Chefe de Mecânica', exp: 'Especialista em motores turbo' },
  { nome: 'Beatriz Alves', cargo: 'Atendimento & TI', exp: 'Gestora do sistema OficinaData' },
];

const tech = [
  { label: 'PostgreSQL 17', desc: 'Banco de dados relacional com schema dedicado, domínios customizados e triggers de negócio.' },
  { label: 'Spring Boot 3', desc: 'API REST com autenticação JWT, controle de perfis (Atendente / Gerente) e Swagger UI.' },
  { label: 'React + Vite', desc: 'Frontend moderno com roteamento protegido e token em memória (sem localStorage).' },
  { label: '~22 mil registros', desc: '200 clientes, 500 veículos, 3.500 agendamentos, 7.000 serviços, 5.000 peças.' },
];

export default function Sobre() {
  return (
    <PublicPage>
      <div className="sobre-page">

        {/* Hero */}
        <div className="sobre-hero">
          <span className="sobre-badge">Sobre nós</span>
          <h1>20 anos cuidando<br />do seu veículo</h1>
          <p>Da bancada ao sistema digital — conheça a história da OficinaData.</p>
        </div>

        {/* Stats strip */}
        <div className="sobre-stats">
          {[
            { v: '200+', l: 'Clientes ativos' },
            { v: '50', l: 'Profissionais' },
            { v: '3.500+', l: 'OS realizadas' },
            { v: '2.200+', l: 'Avaliações 5★' },
            { v: '98%', l: 'Satisfação' },
            { v: '24h', l: 'Plantão' },
          ].map((s, i) => (
            <div key={i} className="sobre-stat">
              <span className="sobre-stat-val">{s.v}</span>
              <span className="sobre-stat-lbl">{s.l}</span>
            </div>
          ))}
        </div>

        <div className="sobre-grid">
          {/* Timeline */}
          <div className="sobre-section">
            <h2>Nossa trajetória</h2>
            <div className="timeline">
              {timeline.map((t, i) => (
                <div key={i} className="timeline-item">
                  <div className="timeline-year">{t.year}</div>
                  <div className="timeline-dot" />
                  <div className="timeline-content">
                    <h4>{t.title}</h4>
                    <p>{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team */}
          <div className="sobre-section">
            <h2>Equipe de gestão</h2>
            <div className="team-list">
              {team.map((m, i) => (
                <div key={i} className="team-card">
                  <div className="team-avatar">{m.nome.charAt(0)}</div>
                  <div>
                    <h4>{m.nome}</h4>
                    <span className="team-cargo">{m.cargo}</span>
                    <p>{m.exp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tech section */}
        <div className="sobre-tech">
          <div className="sobre-tech-header">
            <h2>Sistema OficinaData</h2>
            <p>Desenvolvido como projeto acadêmico de Banco de Dados II — toda a gestão da oficina em uma plataforma integrada.</p>
          </div>
          <div className="tech-grid">
            {tech.map((t, i) => (
              <div key={i} className="tech-card">
                <span className="tech-label">{t.label}</span>
                <p>{t.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </PublicPage>
  );
}
