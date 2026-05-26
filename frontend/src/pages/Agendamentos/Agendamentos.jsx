import React, { useState } from 'react';
import './Agendamentos.css'; 
import Button from '../../components/Button'; // 👈 Correção do Erro 1 (Define o Botao)

function Agendamentos() {
  // Dados simulados das OS
  const [ordensServico, setOrdensServico] = useState([
    { id: '#1', cliente: 'Cliente PF 1', veiculo: 'Toyota Corolla', status: 'Em andamento', valor: 'R$ 350,00' },
    { id: '#2', cliente: 'Empresa 1', veiculo: 'Ford Ka', status: 'Concluído', valor: 'R$ 1.200,00' },
    { id: '#3', cliente: 'Cliente PF 15', veiculo: 'Honda Civic', status: 'Agendado', valor: 'R$ 180,00' }
  ]);

  const irParaNovoCadastro = () => {
    window.location.href = '/clientes';
  };

  // 👈 Correção do Erro 2: Garante que a função está com o nome exato "obterClasseStatus"
  const obterClasseStatus = (status) => {
    if (status === 'Em andamento') return 'badge andamento';
    if (status === 'Concluído') return 'badge concluído';
    return 'badge agendado';
  };

  return (
    <div className="agendamentos-container">
      
      <div className="agendamentos-header">
        <div className="header-titulo">
          <h2>📋 Ordens de Serviço Recentes</h2>
          <p>Gerenciamento e fluxo de veículos na oficina</p>
        </div>
        
        <Button 
          texto="➕ Nova O.S. / Cliente" 
          onClick={irParaNovoCadastro} 
          tipo="azul" 
        />
      </div>

      <div className="tabela-card">
        <table className="tabela-os">
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Veículo</th>
              <th>Status</th>
              <th>Valor Total</th>
            </tr>
          </thead>
          <tbody>
            {ordensServico.map((os) => (
              <tr key={os.id}>
                <td><strong>{os.id}</strong></td>
                <td>{os.cliente}</td>
                <td>{os.veiculo}</td>
                <td>
                  {/* Aqui usamos a função corrigida */}
                  <span className={obterClasseStatus(os.status)}>
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

export default Agendamentos;