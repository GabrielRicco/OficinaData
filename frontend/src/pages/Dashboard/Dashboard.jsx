import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SystemLayout from '../../components/SystemLayout';
import { SkeletonCards, SkeletonTable } from '../../components/Skeleton';
import { useToast } from '../../components/Toast';
import { buscarDashboard } from '../../services/relatorioService';
import { listarAgendamentos } from '../../services/agendamentoService';
import { useAuth } from '../../hooks/useAuth';
import './Dashboard.css';

const statusClass = (s) => {
  if (s === 'Em andamento') return 'andamento';
  if (s === 'Concluído')    return 'concluido';
  if (s === 'Cancelado')    return 'cancelado';
  if (s === 'No-show')      return 'noshow';
  return 'agendado';
};

const moeda = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [metricas, setMetricas] = useState(null);
  const [atividades, setAtividades] = useState([]);
  const [carregando, setCarr] = useState(true);

  useEffect(() => {
    Promise.all([buscarDashboard(), listarAgendamentos({ size: 5 })])
      .then(([dash, pagina]) => {
        setMetricas(dash);
        setAtividades(pagina.content || []);
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setCarr(false));
  }, []);

  const hora = new Date().getHours();
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';

  const cards = metricas ? [
    { label: 'Receita do Dia',  value: moeda(metricas.receitaDia),                     colorClass: 'dash-green', onClick: null },
    { label: 'OS Abertas',      value: metricas.osAbertas,                              colorClass: 'dash-blue',  onClick: () => navigate('/agendamentos') },
    { label: 'Peças em Alerta', value: metricas.pecasEmAlerta,                          colorClass: 'dash-yellow',onClick: () => navigate('/estoque') },
    { label: 'Nota Média',      value: Number(metricas.notaMedia || 0).toFixed(2) + ' ★', colorClass: '',         onClick: null },
  ] : [];

  return (
    <SystemLayout>
      <div className="sys-page-header">
        <div>
          <h1 className="sys-page-title">{saudacao}, {user?.nome?.split(' ')[0]}.</h1>
          <p className="sys-page-sub">Resumo de hoje — OficinaData.</p>
        </div>
        <button className="sys-btn" onClick={() => navigate('/agendamentos')}
          aria-label="Ver todas as ordens de serviço">
          Ver todas as O.S.
        </button>
      </div>

      {carregando ? (
        <SkeletonCards count={4} />
      ) : (
        <div className="dash-metrics" role="list" aria-label="Indicadores do dia">
          {cards.map((c, i) => (
            <div
              key={i}
              role={c.onClick ? 'button' : 'listitem'}
              tabIndex={c.onClick ? 0 : undefined}
              aria-label={c.onClick ? `${c.label}: ${c.value}. Clique para ver detalhes` : undefined}
              className={`dash-metric-card ${c.onClick ? 'clickable' : ''}`}
              onClick={c.onClick || undefined}
              onKeyDown={c.onClick ? (e) => (e.key === 'Enter' || e.key === ' ') && c.onClick() : undefined}
            >
              <p className="dash-metric-label">{c.label}</p>
              <p className={`dash-metric-value ${c.colorClass}`}>{c.value}</p>
              {c.onClick && <span className="dash-metric-hint">Ver detalhes →</span>}
            </div>
          ))}
        </div>
      )}

      <div className="dash-section-header">
        <div>
          <h2 className="dash-section-title">Atividades Recentes</h2>
          <p className="sys-page-sub">Últimas ordens de serviço movimentadas</p>
        </div>
      </div>

      <div className="sys-table-wrap" role="region" aria-label="Atividades recentes" aria-live="polite">
        {carregando ? (
          <SkeletonTable rows={5} cols={5} />
        ) : atividades.length === 0 ? (
          <div className="sys-empty">
            <div className="sys-empty-icon">📋</div>
            <p className="sys-empty-title">Nenhuma atividade recente</p>
            <p>As ordens de serviço movimentadas aparecerão aqui.</p>
          </div>
        ) : (
          <table className="sys-table">
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Cliente</th>
                <th scope="col">Veículo</th>
                <th scope="col">Status</th>
                <th scope="col">Valor</th>
              </tr>
            </thead>
            <tbody>
              {atividades.map((os) => (
                <tr key={os.id}>
                  <td><strong>#{os.id}</strong></td>
                  <td>{os.cliente}</td>
                  <td>{os.veiculo}</td>
                  <td><span className={`sys-badge ${statusClass(os.status)}`}>{os.status}</span></td>
                  <td>{moeda(os.totalGeral)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </SystemLayout>
  );
}
