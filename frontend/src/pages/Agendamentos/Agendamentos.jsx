import { useEffect, useState } from 'react';
import './Agendamentos.css'; 
import Button from '../../components/Button'; // 👈 Correção do Erro 1 (Define o Botao)
import { listarAgendamentos } from '../../services/agendamentoService';

function Agendamentos() {
  const [ordensServico, setOrdensServico] = useState([]);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        const dados = await listarAgendamentos(20);
        setOrdensServico(dados);
      } catch (error) {
        setErro(error.message);
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, []);

  const irParaNovoCadastro = () => {
    window.location.href = '/clientes';
  };

  // 👈 Correção do Erro 2: Garante que a função está com o nome exato "obterClasseStatus"
  const obterClasseStatus = (status) => {
    if (status === 'Em andamento') return 'badge andamento';
    if (status === 'Concluído') return 'badge concluido';
    return 'badge agendado';
  };

  const formatarMoeda = (valor) => Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  return (
    <div className="agendamentos-container">
      
      <div className="agendamentos-header">
        <div className="header-titulo">
          <button
            type="button"
            className="btn-voltar-inicio"
            onClick={() => window.location.href = '/dashboard'}
            aria-label="Voltar para o dashboard"
            title="Voltar para o dashboard"
          >
            ←
          </button>
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
        {erro && <p className="form-error">{erro}</p>}
        {carregando && <p className="tabela-vazia">Carregando ordens de serviço...</p>}
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
                <td>{formatarMoeda(os.valorTotal)}</td>
              </tr>
            ))}
            {!carregando && ordensServico.length === 0 && (
              <tr>
                <td colSpan="5" className="tabela-vazia">Nenhuma ordem encontrada.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default Agendamentos;
