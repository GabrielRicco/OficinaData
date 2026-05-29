import { useEffect, useState } from 'react';
import './Dashboard.css'; // Conexão com o CSS moderno que criamos
import Botao from '../../components/Button'; // Reaproveitando nosso componente de botão!
import { carregarDashboard } from '../../services/agendamentoService';

function Dashboard() {
  const [metricas, setMetricas] = useState({
    faturamentoMensal: 0,
    ticketMedio: 0,
    carrosAgendados: 0,
    osConcluidas: 0
  });

  const [ultimosAgendamentos, setUltimosAgendamentos] = useState([]);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        const dados = await carregarDashboard();
        setMetricas(dados.metricas);
        setUltimosAgendamentos(dados.ultimosAgendamentos);
      } catch (error) {
        setErro(error.message);
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, []);

  const formatarMoeda = (valor) => Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

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
          onClick={() => window.location.href = '/agendamentos'} 
          tipo="azul" 
        />
      </div>

      {/* 2. GRID DE METRICAS (CARD DE INDICADORES) */}
      <div className="metrics-grid">
        <div className="metric-card">
          <p className="title">Faturamento (Mês)</p>
          <p className="number" style={{ color: '#16a34a' }}>{formatarMoeda(metricas.faturamentoMensal)}</p>
        </div>

        <div className="metric-card">
          <p className="title">Ticket Médio</p>
          <p className="number">{formatarMoeda(metricas.ticketMedio)}</p>
        </div>

        <div className="metric-card">
          <p className="title">Ordens Concluídas</p>
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
        {carregando && <p className="tabela-vazia">Carregando dashboard...</p>}
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
                <td>{formatarMoeda(os.valorTotal)}</td>
              </tr>
            ))}
            {!carregando && ultimosAgendamentos.length === 0 && (
              <tr>
                <td colSpan="5" className="tabela-vazia">Nenhuma atividade recente encontrada.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default Dashboard;
