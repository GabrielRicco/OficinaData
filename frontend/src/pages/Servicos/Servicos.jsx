import React from 'react';
import PublicPage from '../../components/PublicPage';
import './Servicos.css';

const services = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="8" width="18" height="12" rx="2"/><path d="M7 8V6M12 8V5M17 8V6"/><path d="M3 14h18"/><path d="M1 11h2M21 11h2"/>
      </svg>
    ),
    title: 'Motor & Transmissão',
    desc: 'Diagnóstico eletrônico completo com leitura de falhas, revisão de correia dentada, troca de óleo, fluidos e filtros. Manutenção preventiva e corretiva de câmbio automático e manual.',
    price: 'A partir de R$ 120',
    tag: 'Mais procurado',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/>
      </svg>
    ),
    title: 'Alinhamento e Balanceamento',
    desc: 'Equipamento 3D de última geração para alinhamento de direção e balanceamento de rodas. Reduz desgaste irregular de pneus e melhora estabilidade em alta velocidade.',
    price: 'A partir de R$ 80',
    tag: null,
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="2" x2="12" y2="22"/><path d="m20 7-8 5-8-5M20 17l-8-5-8 5"/><path d="m2 12 3-1.5M19 10.5l3-1.5M2 12l3 1.5M19 13.5l3 1.5"/>
      </svg>
    ),
    title: 'Ar-condicionado',
    desc: 'Recarga com gás R134a e R1234yf, higienização do evaporador, troca de filtro de cabine e verificação de vazamentos. Manutenção preventiva antes do verão.',
    price: 'A partir de R$ 150',
    tag: null,
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
    title: 'Elétrica Automotiva',
    desc: 'Diagnóstico e reparo de alternador, motor de partida, bateria, fusíveis e fiação. Instalação de alarmes, som automotivo e acessórios elétricos com garantia.',
    price: 'A partir de R$ 90',
    tag: null,
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: 'Suspensão e Freios',
    desc: 'Troca de pastilhas, discos e tambores. Revisão de amortecedores, molas, buchas e terminais de direção. Teste de frenagem em dinamômetro.',
    price: 'A partir de R$ 200',
    tag: 'Segurança',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
      </svg>
    ),
    title: 'Revisão Preventiva',
    desc: 'Revisão completa de 20 itens: fluidos, filtros, correia, freios, pneus, iluminação e diagnóstico eletrônico. Relatório digital entregue ao cliente ao final.',
    price: 'A partir de R$ 250',
    tag: 'Recomendado',
  },
];

export default function Servicos() {
  return (
    <PublicPage>
      <div className="srv-page">
        <div className="srv-header">
          <span className="srv-badge">Nossos Serviços</span>
          <h1>Tudo que seu veículo precisa<br />em um só lugar</h1>
          <p>Mais de 3.500 ordens de serviço realizadas. Equipe de 50 profissionais certificados.</p>
        </div>

        <div className="srv-grid">
          {services.map((s, i) => (
            <div key={i} className="srv-card">
              <div className="srv-card-icon">{s.icon}</div>
              <div className="srv-card-body">
                <div className="srv-card-top">
                  <h3>{s.title}</h3>
                  {s.tag && <span className="srv-tag">{s.tag}</span>}
                </div>
                <p>{s.desc}</p>
                <span className="srv-price">{s.price}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="srv-cta-bar">
          <div>
            <h2>Precisa de um orçamento?</h2>
            <p>Atendemos das 7h às 19h, de segunda a sábado. Plantão 24h para emergências.</p>
          </div>
          <a href="/contato" className="srv-cta-btn">Solicitar orçamento →</a>
        </div>
      </div>
    </PublicPage>
  );
}
