import React, { useState } from 'react';
import PublicPage from '../../components/PublicPage';
import './Contato.css';

const IconPhone = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.38 2 2 0 0 1 3.62 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);

const IconMail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

const IconMapPin = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const IconClock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const horarios = [
  { dia: 'Segunda a Sexta', hora: '07:00 – 19:00' },
  { dia: 'Sábado', hora: '08:00 – 16:00' },
  { dia: 'Domingo', hora: 'Fechado' },
  { dia: 'Emergências', hora: '24h – (11) 98765-0000' },
];

export default function Contato() {
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', assunto: '', mensagem: '' });
  const [enviado, setEnviado] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    setEnviado(true);
  };

  return (
    <PublicPage>
      <div className="cont-page">

        <div className="cont-header">
          <span className="cont-badge">Contato</span>
          <h1>Fale com a nossa equipe</h1>
          <p>Tire dúvidas, solicite orçamentos ou agende uma visita. Respondemos em até 2 horas.</p>
        </div>

        <div className="cont-layout">
          {/* Coluna esquerda — informações */}
          <div className="cont-info">
            <div className="cont-info-card">
              <div className="cont-info-icon"><IconPhone /></div>
              <div>
                <h4>Telefone / WhatsApp</h4>
                <p>(11) 98765-0000</p>
                <p>(11) 3456-7890</p>
              </div>
            </div>

            <div className="cont-info-card">
              <div className="cont-info-icon"><IconMail /></div>
              <div>
                <h4>E-mail</h4>
                <p>contato@oficinadata.com.br</p>
                <p>orcamento@oficinadata.com.br</p>
              </div>
            </div>

            <div className="cont-info-card">
              <div className="cont-info-icon"><IconMapPin /></div>
              <div>
                <h4>Endereço</h4>
                <p>Av. das Indústrias, 1420</p>
                <p>Vila Prudente — São Paulo, SP</p>
              </div>
            </div>

            <div className="cont-hours">
              <div className="cont-hours-header">
                <IconClock />
                <h4>Horário de funcionamento</h4>
              </div>
              {horarios.map((h, i) => (
                <div key={i} className="cont-hours-row">
                  <span>{h.dia}</span>
                  <span className={h.dia === 'Domingo' ? 'cont-closed' : ''}>{h.hora}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Coluna direita — formulário */}
          <div className="cont-form-wrap">
            {enviado ? (
              <div className="cont-success">
                <div className="cont-success-icon">✓</div>
                <h3>Mensagem enviada!</h3>
                <p>Entraremos em contato em até 2 horas no horário comercial.</p>
                <button className="cont-reset-btn" onClick={() => { setEnviado(false); setForm({ nome: '', email: '', telefone: '', assunto: '', mensagem: '' }); }}>
                  Enviar outra mensagem
                </button>
              </div>
            ) : (
              <form className="cont-form" onSubmit={submit}>
                <h3>Envie uma mensagem</h3>

                <div className="cont-row">
                  <div className="cont-field">
                    <label>Nome completo</label>
                    <input name="nome" value={form.nome} onChange={handle} placeholder="Seu nome" required />
                  </div>
                  <div className="cont-field">
                    <label>Telefone</label>
                    <input name="telefone" value={form.telefone} onChange={handle} placeholder="(11) 99999-0000" />
                  </div>
                </div>

                <div className="cont-field">
                  <label>E-mail</label>
                  <input type="email" name="email" value={form.email} onChange={handle} placeholder="voce@email.com" required />
                </div>

                <div className="cont-field">
                  <label>Assunto</label>
                  <select name="assunto" value={form.assunto} onChange={handle} required>
                    <option value="">Selecione...</option>
                    <option>Orçamento de serviço</option>
                    <option>Agendamento de revisão</option>
                    <option>Dúvida sobre peças</option>
                    <option>Reclamação / Sugestão</option>
                    <option>Outro</option>
                  </select>
                </div>

                <div className="cont-field">
                  <label>Mensagem</label>
                  <textarea name="mensagem" value={form.mensagem} onChange={handle}
                    rows={5} placeholder="Descreva o problema ou solicitação..." required />
                </div>

                <button type="submit" className="cont-submit">Enviar mensagem</button>
              </form>
            )}
          </div>
        </div>

      </div>
    </PublicPage>
  );
}
