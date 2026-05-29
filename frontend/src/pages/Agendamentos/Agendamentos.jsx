import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Agendamentos.css'; 
import Button from '../../components/Button'; // 👈 Correção do Erro 1 (Define o Botao)
import { listarAgendamentos } from '../../services/agendamentoService';
import setaVoltar from '../../assets/arrow-left.svg';

function Agendamentos() {
  const [ordensServico, setOrdensServico] = useState([]);
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    listarAgendamentos({ size: 12 })
      .then((pagina) => setOrdensServico(pagina.content || []))
      .catch((error) => setErro(error.message));
  }, []);

  const irParaNovoCadastro = () => {
    navigate('/clientes');
  };

  const voltarParaDashboard = () => {
    navigate('/dashboard');
  };

  // 👈 Correção do Erro 2: Garante que a função está com o nome exato "obterClasseStatus"
  const obterClasseStatus = (status) => {
    if (status === 'Em andamento') return 'badge andamento';
    if (status === 'Concluído') return 'badge concluído';
    return 'badge agendado';
  };

  const moeda = (valor) => Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="agendamentos-container">
      
      <div className="agendamentos-header">
        <div className="header-esquerda">
          <img
            src={setaVoltar}
            className="seta-voltar-dashboard"
            onClick={voltarParaDashboard}
            alt="Voltar para o dashboard"
            title="Voltar para o dashboard"
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') voltarParaDashboard();
            }}
          />

          <div className="header-titulo">
            <h2>📋 Ordens de Serviço Recentes</h2>
            <p>Gerenciamento e fluxo de veículos na oficina</p>
          </div>
        </div>
        
        <Button 
          texto="➕ Nova O.S. / Cliente" 
          onClick={irParaNovoCadastro} 
          tipo="azul" 
        />
      </div>

      <div className="tabela-card">
        {erro && <p className="form-error">{erro}</p>}
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
                <td><strong>#{os.id}</strong></td>
                <td>{os.cliente}</td>
                <td>{os.veiculo}</td>
                <td>
                  {/* Aqui usamos a função corrigida */}
                  <span className={obterClasseStatus(os.status)}>
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

export default Agendamentos;
