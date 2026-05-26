import React, { useState } from 'react';
import './Dashboard.css'; // Conexão com o CSS moderno que criamos
import Botao from '../../components/Button'; // Reaproveitando nosso componente de botão!

function Dashboard() {
  // Simulando os dados consolidados vindos das suas consultas SQL do PostgreSQL
  const [metricas] = useState({
    faturamentoMensal: 'R$ 18.450,00',
    ticketMedio: 'R$ 580,00',
    carrosAgendados: 12,
    osConcluidas: 45
  });

  // Lista rápida das últimas movimentações para o gerente acompanhar
  const [ultimosAgendamentos] = useState([
    { id: '#104', cliente: 'Oficina do Mecânico LTDA', veiculo: 'VW Delivery', status: 'Em andamento', valor: 'R$ 850,00' },
    { id: '#103', cliente: 'Carlos Alberto', veiculo: 'Chevrolet Onix', status: 'Concluído', valor: 'R$ 320,00' },
    { id: '#102', cliente: 'Mariana Costa', veiculo: 'Hyundai HB20', status: 'Agendado', valor: 'R$ 150,00' }
  ]);

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
          <p className="number" style={{ color: '#16a34a' }}>{metricas.faturamentoMensal}</p>
        </div>

        <div className="metric-card">
          <p className="title">Ticket Médio</p>
          <p className="number">{metricas.ticketMedio}</p>
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
                <td><strong>{os.id}</strong></td>
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
                <td>{os.valor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default Dashboard;