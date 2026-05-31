import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Agendamentos.css'; 
import Button from '../../components/Button';
import { listarAgendamentos, detalharAgendamento, atualizarStatus } from '../../services/agendamentoService';
import setaVoltar from '../../assets/arrow-left.svg';

function Agendamentos() {
  // Estados da Lista
  const [ordensServico, setOrdensServico] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [carregandoLista, setCarregandoLista] = useState(false);
  
  // Estados de Filtros
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroData, setFiltroData] = useState('');
  
  // Estados do Modal de Detalhes
  const [detalheAberto, setDetalheAberto] = useState(false);
  const [osDetalhe, setOsDetalhe] = useState(null);
  const [carregandoDetalhe, setCarregandoDetalhe] = useState(false);
  const [novoStatus, setNovoStatus] = useState('');
  const [atualizandoStatus, setAtualizandoStatus] = useState(false);
  
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  // Função para carregar lista de OS
  const carregarOrdensSevico = async (page = 0, status = filtroStatus, data = filtroData) => {
    setCarregandoLista(true);
    setErro('');
    try {
      const resultado = await listarAgendamentos({
        status: status || undefined,
        data: data || undefined,
        page,
        size: 10
      });
      setOrdensServico(resultado.content || []);
      setTotalPages(resultado.totalPages || 0);
      setPaginaAtual(page);
    } catch (error) {
      setErro(error.message || 'Erro ao carregar ordens de serviço');
    } finally {
      setCarregandoLista(false);
    }
  };

  // Efeito para carregar lista inicial
  useEffect(() => {
    carregarOrdensSevico(0, '', '');
  }, []);

  // Função para buscar detalhes de uma OS
  const abrirDetalhe = async (osId) => {
    setCarregandoDetalhe(true);
    setErro('');
    try {
      const detalhe = await detalharAgendamento(osId);
      setOsDetalhe(detalhe);
      setNovoStatus(detalhe.status);
      setDetalheAberto(true);
    } catch (error) {
      setErro(error.message || 'Erro ao carregar detalhes');
    } finally {
      setCarregandoDetalhe(false);
    }
  };

  // Função para fechar modal
  const fecharDetalhe = () => {
    setDetalheAberto(false);
    setOsDetalhe(null);
    setNovoStatus('');
  };

  // Função para atualizar status
  const handleAtualizarStatus = async () => {
    if (novoStatus === osDetalhe.status) {
      alert('Selecione um status diferente do atual');
      return;
    }
    
    setAtualizandoStatus(true);
    setErro('');
    try {
      await atualizarStatus(osDetalhe.id, { status: novoStatus });
      alert('Status atualizado com sucesso!');
      fecharDetalhe();
      carregarOrdensSevico(paginaAtual, filtroStatus, filtroData);
    } catch (error) {
      setErro(error.message || 'Erro ao atualizar status');
    } finally {
      setAtualizandoStatus(false);
    }
  };

  // Função para buscar com filtros
  const handleBuscar = () => {
    carregarOrdensSevico(0, filtroStatus, filtroData);
  };

  // Função para limpar filtros
  const handleLimparFiltros = () => {
    setFiltroStatus('');
    setFiltroData('');
    carregarOrdensSevico(0, '', '');
  };

  // Paginação
  const proximaPagina = () => {
    if (paginaAtual < totalPages - 1) {
      carregarOrdensSevico(paginaAtual + 1, filtroStatus, filtroData);
    }
  };

  const paginaAnterior = () => {
    if (paginaAtual > 0) {
      carregarOrdensSevico(paginaAtual - 1, filtroStatus, filtroData);
    }
  };

  const moeda = (valor) => Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const obterClasseStatus = (status) => {
    if (status === 'Em andamento') return 'badge andamento';
    if (status === 'Concluído') return 'badge concluído';
    return 'badge agendado';
  };

  return (
    <div className="agendamentos-container">
      
      <div className="agendamentos-header">
        <div className="header-esquerda">
          <img
            src={setaVoltar}
            className="seta-voltar-dashboard"
            onClick={() => navigate('/dashboard')}
            alt="Voltar para o dashboard"
            title="Voltar para o dashboard"
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') navigate('/dashboard');
            }}
          />

          <div className="header-titulo">
            <h2>📋 Ordens de Serviço</h2>
            <p>Gerenciamento completo de OS: filtrar, visualizar detalhes e atualizar status</p>
          </div>
        </div>
        
        <Button 
          texto="➕ Nova O.S. / Cliente" 
          onClick={() => navigate('/clientes')} 
          tipo="azul" 
        />
      </div>

      {/* FILTROS E BUSCA */}
      <div className="filtros-container">
        <div className="campo-grupo">
          <label>Filtrar por Status:</label>
          <select 
            className="campo-input" 
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
          >
            <option value="">Todos os Status</option>
            <option value="Agendado">Agendado</option>
            <option value="Em andamento">Em Andamento</option>
            <option value="Concluído">Concluído</option>
          </select>
        </div>

        <div className="campo-grupo">
          <label>Filtrar por Data:</label>
          <input 
            type="date" 
            className="campo-input" 
            value={filtroData}
            onChange={(e) => setFiltroData(e.target.value)}
          />
        </div>

        <div className="acoes-filtros">
          <button 
            className="btn-buscar"
            onClick={handleBuscar}
            disabled={carregandoLista}
          >
            🔍 Buscar
          </button>
          <button 
            className="btn-limpar"
            onClick={handleLimparFiltros}
            disabled={carregandoLista}
          >
            🔄 Limpar
          </button>
        </div>
      </div>

      {/* MENSAGEM DE ERRO */}
      {erro && <p className="form-error">{erro}</p>}

      {/* TABELA DE OS */}
      <div className="tabela-card">
        {carregandoLista ? (
          <p className="carregando">⏳ Carregando ordens de serviço...</p>
        ) : ordensServico.length === 0 ? (
          <p className="sem-dados">Nenhuma ordem de serviço encontrada com os filtros aplicados.</p>
        ) : (
          <>
            <table className="tabela-os">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Veículo</th>
                  <th>Status</th>
                  <th>Data</th>
                  <th>Valor Total</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {ordensServico.map((os) => (
                  <tr key={os.id}>
                    <td><strong>#{os.id}</strong></td>
                    <td>{os.cliente}</td>
                    <td>{os.veiculo}</td>
                    <td>
                      <span className={obterClasseStatus(os.status)}>
                        {os.status}
                      </span>
                    </td>
                    <td>{os.dataAbertura ? new Date(os.dataAbertura).toLocaleDateString('pt-BR') : '-'}</td>
                    <td>{moeda(os.totalGeral)}</td>
                    <td>
                      <button 
                        className="btn-detalhe"
                        onClick={() => abrirDetalhe(os.id)}
                        title="Ver detalhes"
                      >
                        👁️ Detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* PAGINAÇÃO */}
            <div className="paginacao-container">
              <button 
                className="btn-paginacao"
                onClick={paginaAnterior}
                disabled={paginaAtual === 0 || carregandoLista}
              >
                ◀ Anterior
              </button>
              <span className="info-paginacao">
                Página {paginaAtual + 1} de {totalPages || 1}
              </span>
              <button 
                className="btn-paginacao"
                onClick={proximaPagina}
                disabled={paginaAtual >= totalPages - 1 || carregandoLista}
              >
                Próxima ▶
              </button>
            </div>
          </>
        )}
      </div>

      {/* MODAL DE DETALHES */}
      {detalheAberto && osDetalhe && (
        <div className="modal-overlay" onClick={fecharDetalhe}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📋 Detalhes da O.S. #{osDetalhe.id}</h2>
              <button className="btn-fechar" onClick={fecharDetalhe}>✕</button>
            </div>

            {carregandoDetalhe ? (
              <p className="carregando">⏳ Carregando...</p>
            ) : (
              <div className="modal-body">
                
                {/* SEÇÃO 1: INFORMAÇÕES BÁSICAS */}
                <div className="detalhe-secao">
                  <h3>Informações Gerais</h3>
                  <div className="detalhe-grid">
                    <div className="detalhe-item">
                      <label>Cliente:</label>
                      <p>{osDetalhe.cliente}</p>
                    </div>
                    <div className="detalhe-item">
                      <label>Veículo:</label>
                      <p>{osDetalhe.veiculo} ({osDetalhe.placa})</p>
                    </div>
                    <div className="detalhe-item">
                      <label>Status Atual:</label>
                      <p>
                        <span className={obterClasseStatus(osDetalhe.status)}>
                          {osDetalhe.status}
                        </span>
                      </p>
                    </div>
                    <div className="detalhe-item">
                      <label>Abertura:</label>
                      <p>{osDetalhe.dataAbertura ? new Date(osDetalhe.dataAbertura).toLocaleDateString('pt-BR') : '-'}</p>
                    </div>
                    <div className="detalhe-item">
                      <label>KM Entrada:</label>
                      <p>{osDetalhe.kmEntrada || '-'}</p>
                    </div>
                    <div className="detalhe-item">
                      <label>KM Saída:</label>
                      <p>{osDetalhe.kmSaida || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* SEÇÃO 2: SERVIÇOS */}
                <div className="detalhe-secao">
                  <h3>Serviços</h3>
                  {osDetalhe.servicos && osDetalhe.servicos.length > 0 ? (
                    <table className="tabela-itens">
                      <thead>
                        <tr>
                          <th>Descrição</th>
                          <th>Funcionário</th>
                          <th>Qtd</th>
                          <th>Preço Unit.</th>
                          <th>Desconto</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {osDetalhe.servicos.map((s) => (
                          <tr key={s.id}>
                            <td>{s.descricao}</td>
                            <td>{s.funcionarioId || '-'}</td>
                            <td>{s.quantidade}</td>
                            <td>{moeda(s.precoUnitario)}</td>
                            <td>{s.desconto}%</td>
                            <td>{moeda(s.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="sem-dados">Nenhum serviço adicionado</p>
                  )}
                </div>

                {/* SEÇÃO 3: PEÇAS */}
                <div className="detalhe-secao">
                  <h3>Peças Utilizadas</h3>
                  {osDetalhe.pecas && osDetalhe.pecas.length > 0 ? (
                    <table className="tabela-itens">
                      <thead>
                        <tr>
                          <th>Nome</th>
                          <th>Qtd</th>
                          <th>Preço Unit.</th>
                          <th>Desconto</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {osDetalhe.pecas.map((p) => (
                          <tr key={p.id}>
                            <td>{p.nome}</td>
                            <td>{p.quantidade}</td>
                            <td>{moeda(p.precoUnitario)}</td>
                            <td>{p.desconto}%</td>
                            <td>{moeda(p.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="sem-dados">Nenhuma peça adicionada</p>
                  )}
                </div>

                {/* SEÇÃO 4: RESUMO FINANCEIRO */}
                <div className="detalhe-secao">
                  <h3>Resumo Financeiro</h3>
                  <div className="resumo-financeiro">
                    <div className="resumo-linha">
                      <span>Total Serviços:</span>
                      <strong>{moeda(osDetalhe.totalServicos)}</strong>
                    </div>
                    <div className="resumo-linha">
                      <span>Total Peças:</span>
                      <strong>{moeda(osDetalhe.totalPecas)}</strong>
                    </div>
                    <div className="resumo-linha" style={{ borderTop: '2px solid #ddd', paddingTop: '10px', marginTop: '10px' }}>
                      <span>Total Geral:</span>
                      <strong style={{ fontSize: '18px', color: '#1a73e8' }}>{moeda(osDetalhe.totalGeral)}</strong>
                    </div>
                  </div>
                </div>

                {/* SEÇÃO 5: PAGAMENTOS */}
                {osDetalhe.pagamentos && osDetalhe.pagamentos.length > 0 && (
                  <div className="detalhe-secao">
                    <h3>Pagamentos Registrados</h3>
                    <table className="tabela-itens">
                      <thead>
                        <tr>
                          <th>Forma</th>
                          <th>Valor</th>
                          <th>Parcelas</th>
                          <th>Data</th>
                        </tr>
                      </thead>
                      <tbody>
                        {osDetalhe.pagamentos.map((p) => (
                          <tr key={p.id}>
                            <td>{p.formaPagamento}</td>
                            <td>{moeda(p.valor)}</td>
                            <td>{p.parcelas}</td>
                            <td>{new Date(p.dataPagamento).toLocaleDateString('pt-BR')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* SEÇÃO 6: AVALIAÇÃO */}
                {osDetalhe.avaliacao && (
                  <div className="detalhe-secao">
                    <h3>Avaliação do Cliente</h3>
                    <div className="detalhe-grid">
                      <div className="detalhe-item">
                        <label>Nota:</label>
                        <p>⭐ {osDetalhe.avaliacao.nota}/5</p>
                      </div>
                      <div className="detalhe-item">
                        <label>Comentário:</label>
                        <p>{osDetalhe.avaliacao.comentario || 'Sem comentário'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* SEÇÃO 7: ATUALIZAR STATUS */}
                {osDetalhe.status !== 'Concluído' && (
                  <div className="detalhe-secao">
                    <h3>Atualizar Status</h3>
                    <div className="campo-grupo">
                      <label>Novo Status:</label>
                      <select 
                        className="campo-input" 
                        value={novoStatus}
                        onChange={(e) => setNovoStatus(e.target.value)}
                      >
                        <option value="Agendado">Agendado</option>
                        <option value="Em andamento">Em Andamento</option>
                        <option value="Concluído">Concluído</option>
                      </select>
                    </div>
                    {erro && <p className="form-error">{erro}</p>}
                    <button 
                      className="btn-atualizar-status"
                      onClick={handleAtualizarStatus}
                      disabled={atualizandoStatus || novoStatus === osDetalhe.status}
                    >
                      {atualizandoStatus ? '⏳ Atualizando...' : '✓ Atualizar Status'}
                    </button>
                  </div>
                )}

              </div>
            )}

            <div className="modal-footer">
              <button className="btn-cancelar" onClick={fecharDetalhe}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Agendamentos;
