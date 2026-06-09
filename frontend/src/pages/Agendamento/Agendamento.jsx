import React, { useState } from 'react';
import PublicPage from '../../components/PublicPage';
import './Agendamento.css';

const SERVICOS = [
  { id: 'motor',      label: 'Motor & Transmissão',          tempo: '2–4h',  preco: 'a partir de R$ 120' },
  { id: 'alinha',     label: 'Alinhamento e Balanceamento',  tempo: '1h',    preco: 'a partir de R$ 80'  },
  { id: 'ar',         label: 'Ar-condicionado',              tempo: '1–2h',  preco: 'a partir de R$ 150' },
  { id: 'eletrica',   label: 'Elétrica Automotiva',          tempo: '1–3h',  preco: 'a partir de R$ 90'  },
  { id: 'suspensao',  label: 'Suspensão e Freios',           tempo: '2–3h',  preco: 'a partir de R$ 200' },
  { id: 'revisao',    label: 'Revisão Preventiva',           tempo: '3–5h',  preco: 'a partir de R$ 250' },
];

const HORARIOS = ['07:00', '08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

const STEPS = ['Serviço', 'Data & Hora', 'Veículo', 'Confirmação'];

function getProximosDias(n) {
  const dias = [];
  const hoje = new Date();
  let i = 1;
  while (dias.length < n) {
    const d = new Date(hoje);
    d.setDate(hoje.getDate() + i);
    if (d.getDay() !== 0) dias.push(d); // sem domingo
    i++;
  }
  return dias;
}

const fmtDia = (d) =>
  d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });

const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconCar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h13l4 4v4a2 2 0 0 1-2 2h-2"/>
    <circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>
  </svg>
);

export default function Agendamento() {
  const [step, setStep]       = useState(0);
  const [servico, setServico] = useState(null);
  const [dia, setDia]         = useState(null);
  const [horario, setHorario] = useState(null);
  const [veiculo, setVeiculo] = useState({ marca: '', modelo: '', ano: '', placa: '' });
  const [cliente, setCliente] = useState({ nome: '', telefone: '', email: '' });
  const [enviado, setEnviado] = useState(false);

  const dias = getProximosDias(10);

  const podeContinuar = () => {
    if (step === 0) return !!servico;
    if (step === 1) return !!dia && !!horario;
    if (step === 2) return veiculo.marca && veiculo.modelo && veiculo.placa && cliente.nome && cliente.telefone;
    return true;
  };

  const handleVeiculo = (e) => setVeiculo({ ...veiculo, [e.target.name]: e.target.value });
  const handleCliente = (e) => setCliente({ ...cliente, [e.target.name]: e.target.value });

  const confirmar = (e) => {
    e.preventDefault();
    setEnviado(true);
  };

  const servicoSel = SERVICOS.find(s => s.id === servico);

  if (enviado) {
    return (
      <PublicPage>
        <div className="ag-page">
          <div className="ag-success">
            <div className="ag-success-ring">
              <div className="ag-success-icon"><IconCheck /></div>
            </div>
            <h2>Agendamento confirmado!</h2>
            <p>Em breve você receberá uma confirmação por WhatsApp no número <strong>{cliente.telefone}</strong>.</p>

            <div className="ag-success-card">
              <div className="ag-success-row">
                <span>Serviço</span>
                <strong>{servicoSel?.label}</strong>
              </div>
              <div className="ag-success-row">
                <span>Data</span>
                <strong>{dia ? fmtDia(dia) : ''}</strong>
              </div>
              <div className="ag-success-row">
                <span>Horário</span>
                <strong>{horario}</strong>
              </div>
              <div className="ag-success-row">
                <span>Veículo</span>
                <strong>{veiculo.marca} {veiculo.modelo} — {veiculo.placa.toUpperCase()}</strong>
              </div>
            </div>

            <button className="ag-novo-btn" onClick={() => {
              setStep(0); setServico(null); setDia(null); setHorario(null);
              setVeiculo({ marca: '', modelo: '', ano: '', placa: '' });
              setCliente({ nome: '', telefone: '', email: '' });
              setEnviado(false);
            }}>
              Fazer novo agendamento
            </button>
          </div>
        </div>
      </PublicPage>
    );
  }

  return (
    <PublicPage>
      <div className="ag-page">

        {/* Header */}
        <div className="ag-header">
          <span className="ag-badge">Agendamento online</span>
          <h1>Agende seu serviço em<br />menos de 2 minutos</h1>
          <p>Escolha o serviço, data e horário — confirmamos pelo WhatsApp.</p>
        </div>

        {/* Stepper */}
        <div className="ag-stepper">
          {STEPS.map((s, i) => (
            <React.Fragment key={i}>
              <div className={`ag-step ${i < step ? 'done' : ''} ${i === step ? 'active' : ''}`}>
                <div className="ag-step-circle">
                  {i < step ? <IconCheck /> : <span>{i + 1}</span>}
                </div>
                <span className="ag-step-label">{s}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`ag-step-line ${i < step ? 'done' : ''}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* Content */}
        <div className="ag-content">

          {/* Step 0 — Serviço */}
          {step === 0 && (
            <div>
              <h3 className="ag-section-title">Qual serviço você precisa?</h3>
              <div className="ag-servicos-grid">
                {SERVICOS.map(s => (
                  <button
                    key={s.id}
                    className={`ag-servico-card ${servico === s.id ? 'selected' : ''}`}
                    onClick={() => setServico(s.id)}
                  >
                    <div className="ag-servico-top">
                      <span className="ag-servico-label">{s.label}</span>
                      {servico === s.id && <div className="ag-servico-check"><IconCheck /></div>}
                    </div>
                    <div className="ag-servico-meta">
                      <span>⏱ {s.tempo}</span>
                      <span>{s.preco}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1 — Data & Hora */}
          {step === 1 && (
            <div>
              <h3 className="ag-section-title">Escolha o dia e horário</h3>
              <div className="ag-datas">
                <div>
                  <p className="ag-sub">Próximos dias disponíveis</p>
                  <div className="ag-dias-grid">
                    {dias.map((d, i) => (
                      <button
                        key={i}
                        className={`ag-dia-btn ${dia && dia.toDateString() === d.toDateString() ? 'selected' : ''}`}
                        onClick={() => setDia(d)}
                      >
                        {fmtDia(d)}
                      </button>
                    ))}
                  </div>
                </div>
                {dia && (
                  <div>
                    <p className="ag-sub">Horários disponíveis</p>
                    <div className="ag-horarios-grid">
                      {HORARIOS.map(h => (
                        <button
                          key={h}
                          className={`ag-horario-btn ${horario === h ? 'selected' : ''}`}
                          onClick={() => setHorario(h)}
                        >
                          {h}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2 — Veículo */}
          {step === 2 && (
            <div className="ag-veiculo-wrap">
              <div className="ag-form-section">
                <div className="ag-form-section-header">
                  <IconCar />
                  <h4>Dados do veículo</h4>
                </div>
                <div className="ag-row">
                  <div className="ag-field">
                    <label>Marca</label>
                    <input name="marca" value={veiculo.marca} onChange={handleVeiculo} placeholder="Ex: Toyota" required />
                  </div>
                  <div className="ag-field">
                    <label>Modelo</label>
                    <input name="modelo" value={veiculo.modelo} onChange={handleVeiculo} placeholder="Ex: Corolla" required />
                  </div>
                </div>
                <div className="ag-row">
                  <div className="ag-field">
                    <label>Ano</label>
                    <input name="ano" value={veiculo.ano} onChange={handleVeiculo} placeholder="Ex: 2021" maxLength={4} />
                  </div>
                  <div className="ag-field">
                    <label>Placa</label>
                    <input name="placa" value={veiculo.placa} onChange={handleVeiculo} placeholder="ABC-1234" maxLength={8} required />
                  </div>
                </div>
              </div>

              <div className="ag-form-section">
                <div className="ag-form-section-header">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                  <h4>Seus dados</h4>
                </div>
                <div className="ag-field">
                  <label>Nome completo</label>
                  <input name="nome" value={cliente.nome} onChange={handleCliente} placeholder="Seu nome" required />
                </div>
                <div className="ag-row">
                  <div className="ag-field">
                    <label>WhatsApp</label>
                    <input name="telefone" value={cliente.telefone} onChange={handleCliente} placeholder="(11) 99999-0000" required />
                  </div>
                  <div className="ag-field">
                    <label>E-mail (opcional)</label>
                    <input name="email" type="email" value={cliente.email} onChange={handleCliente} placeholder="voce@email.com" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3 — Confirmação */}
          {step === 3 && (
            <form onSubmit={confirmar}>
              <h3 className="ag-section-title">Confirme seu agendamento</h3>
              <div className="ag-resumo">
                <div className="ag-resumo-item">
                  <span>Serviço</span>
                  <strong>{servicoSel?.label}</strong>
                </div>
                <div className="ag-resumo-item">
                  <span>Tempo estimado</span>
                  <strong>{servicoSel?.tempo}</strong>
                </div>
                <div className="ag-resumo-item">
                  <span>Data</span>
                  <strong>{dia ? fmtDia(dia) : ''}</strong>
                </div>
                <div className="ag-resumo-item">
                  <span>Horário</span>
                  <strong>{horario}</strong>
                </div>
                <div className="ag-resumo-item">
                  <span>Veículo</span>
                  <strong>{veiculo.marca} {veiculo.modelo} {veiculo.ano} — {veiculo.placa.toUpperCase()}</strong>
                </div>
                <div className="ag-resumo-item">
                  <span>Cliente</span>
                  <strong>{cliente.nome}</strong>
                </div>
                <div className="ag-resumo-item">
                  <span>WhatsApp</span>
                  <strong>{cliente.telefone}</strong>
                </div>
                <div className="ag-resumo-item ag-resumo-preco">
                  <span>Preço estimado</span>
                  <strong className="ag-preco-val">{servicoSel?.preco}</strong>
                </div>
              </div>
              <p className="ag-obs">O valor final será confirmado após diagnóstico. Você receberá uma mensagem no WhatsApp.</p>
              <button type="submit" className="ag-confirmar-btn">Confirmar agendamento</button>
            </form>
          )}
        </div>

        {/* Navigation */}
        <div className="ag-nav-btns">
          {step > 0 && (
            <button className="ag-back-btn" onClick={() => setStep(s => s - 1)}>← Voltar</button>
          )}
          {step < 3 && (
            <button
              className="ag-next-btn"
              onClick={() => setStep(s => s + 1)}
              disabled={!podeContinuar()}
            >
              Continuar →
            </button>
          )}
        </div>

      </div>
    </PublicPage>
  );
}
