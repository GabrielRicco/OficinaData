import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css'; // Conexão com o CSS moderno que criamos
import Botao from '../../components/Button'; // Reaproveitando nosso componente de botão!
import { buscarDashboard } from '../../services/relatorioService';
import { listarAgendamentos } from '../../services/agendamentoService';

function Dashboard() {
  const [metricas, setMetricas] = useState({
    faturamentoMensal: 'R$ 0,00',
    ticketMedio: '0.00',
    carrosAgendados: 0,
    osConcluidas: 0
  });
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const [ultimosAgendamentos, setUltimosAgendamentos] = useState([]);

  useEffect(() => {
    Promise.all([buscarDashboard(), listarAgendamentos({ size: 5 })])
      .then(([dashboard, pagina]) => {
        setMetricas({
          faturamentoMensal: Number(dashboard.receitaDia || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
          ticketMedio: dashboard.notaMedia,
          carrosAgendados: dashboard.osAbertas,
          osConcluidas: dashboard.pecasEmAlerta
        });
        setUltimosAgendamentos(pagina.content || []);
      })
      .catch((error) => setErro(error.message));
  }, []);

  const moeda = (valor) => Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="dashboard-container">
      
      {/* 1. CABEÇALHO */}
      <div className="dashboard-header">
        <div>
          <h2>📊 Painel de Controle Gerencial</h2>
          <p>Bem-vinda de volta, Caroline. Aqui está o resumo de hoje da OficinaData.</p>
        </div>
        <Botao 
          texto="📋 Ver Todas as O.S." 
          onClick={() => navigate('/agendamentos')} 
          tipo="azul" 
        />
      </div>

      {/* 2. GRID DE METRICAS (CARD DE INDICADORES) */}
      <div className="metrics-grid">
        <div className="metric-card">
          <p className="title">Receita (Dia)</p>
          <p className="number" style={{ color: '#16a34a' }}>{metricas.faturamentoMensal}</p>
        </div>

        <div className="metric-card">
          <p className="title">Nota Média</p>
          <p className="number">{metricas.ticketMedio}</p>
        </div>

        <div className="metric-card">
          <p className="title">Peças em alerta</p>
          <p className="number">{metricas.osConcluidas}</p>
        </div>

        <div className="metric-card">
          <p className="title">Veículos Pátio / Agendados</p>
          <p className="number" style={{ color: '#0284c7' }}>{metricas.carrosAgendados}</p>
        </div>
      </div>

      {/* 3. LISTA RECENTE DE ORDENS DE SERVIÇO */}
      <div className="dashboard-header" style={{ marginBottom: '16px', marginTop: '40px' }}>
        <div>
          <h3>⚡ Atividades Recentes</h3>
          <p>Últimas ordens de serviço movimentadas no sistema</p>
        </div>
      </div>

      <div className="tabela-card">
        {erro && <p className="form-error">{erro}</p>}
        <table className="tabela-oficina">
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Veículo</th>
              <th>Status</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            {ultimosAgendamentos.map((os) => (
              <tr key={os.id}>
                <td><strong>#{os.id}</strong></td>
                <td>{os.cliente}</td>
                <td>{os.veiculo}</td>
                <td>
                  <span className={`status-badge ${
                    os.status === 'Em andamento' ? 'andamento' : 
                    os.status === 'Concluído' ? 'concluido' : 'agendado'
                  }`}>
                    {os.status}
                  </span>
                </td>
                <td>{moeda(os.totalGeral)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default Dashboard;
