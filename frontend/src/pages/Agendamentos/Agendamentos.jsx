import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SystemLayout from '../../components/SystemLayout';
import { SkeletonTable } from '../../components/Skeleton';
import { useToast } from '../../components/Toast';
import { listarAgendamentos, detalharAgendamento, atualizarStatus } from '../../services/agendamentoService';

const moeda = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const statusClass = (s) => {
  if (s === 'Em andamento') return 'andamento';
  if (s === 'Concluído')    return 'concluido';
  if (s === 'Cancelado')    return 'cancelado';
  if (s === 'No-show')      return 'noshow';
  return 'agendado';
};

const STATUS_OPTIONS = ['Agendado', 'Em andamento', 'Concluído', 'Cancelado', 'No-show'];

export default function Agendamentos() {
  const navigate = useNavigate();
  const toast = useToast();

  const [os, setOs]           = useState([]);
  const [pagina, setPagina]   = useState(0);
  const [total, setTotal]     = useState(0);
  const [carregando, setCarr] = useState(true);
  const [filtroSt, setFSt]    = useState('');
  const [filtroDt, setFDt]    = useState('');

  const [modalAberto, setModal]   = useState(false);
  const [osDetalhe, setOsDet]     = useState(null);
  const [carrDet, setCarrDet]     = useState(false);
  const [novoSt, setNovoSt]       = useState('');
  const [salvando, setSalv]       = useState(false);

  const carregar = async (p = 0, st = filtroSt, dt = filtroDt) => {
    setCarr(true);
    try {
      const r = await listarAgendamentos({ status: st || undefined, data: dt || undefined, page: p, size: 10 });
      setOs(r.content || []); setTotal(r.totalPages || 0); setPagina(p);
    } catch (e) { toast.error(e.message); }
    finally { setCarr(false); }
  };

  useEffect(() => { carregar(0, '', ''); }, []);

  const abrirDetalhe = async (id) => {
    setCarrDet(true); setModal(true); setOsDet(null);
    try {
      const d = await detalharAgendamento(id);
      setOsDet(d); setNovoSt(d.status);
    } catch (e) { toast.error(e.message); setModal(false); }
    finally { setCarrDet(false); }
  };

  const fechar = () => { setModal(false); setOsDet(null); setNovoSt(''); };

  const salvarStatus = async () => {
    if (novoSt === osDetalhe.status) {
      toast.warning('Selecione um status diferente do atual.');
      return;
    }
    setSalv(true);
    try {
      await atualizarStatus(osDetalhe.id, { status: novoSt });
      toast.success(`Status da O.S. #${osDetalhe.id} atualizado para "${novoSt}".`);
      fechar();
      carregar(pagina, filtroSt, filtroDt);
    } catch (e) { toast.error(e.message); }
    finally { setSalv(false); }
  };

  return (
    <SystemLayout>
      <div className="sys-page-header">
        <div>
          <h1 className="sys-page-title">Ordens de Serviço</h1>
          <p className="sys-page-sub">Filtrar, visualizar detalhes e atualizar status</p>
        </div>
        <button className="sys-btn" onClick={() => navigate('/clientes')}
          aria-label="Criar nova ordem de serviço">
          + Nova O.S. / Cliente
        </button>
      </div>

      {/* Filtros */}
      <div className="sys-filters" role="search" aria-label="Filtros de ordens de serviço">
        <div className="sys-filter-group">
          <label htmlFor="filtro-status">Status</label>
          <select id="filtro-status" className="sys-select" value={filtroSt}
            onChange={(e) => setFSt(e.target.value)} aria-label="Filtrar por status">
            <option value="">Todos os Status</option>
            {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="sys-filter-group">
          <label htmlFor="filtro-data">Data</label>
          <input id="filtro-data" className="sys-input" type="date" value={filtroDt}
            onChange={(e) => setFDt(e.target.value)} aria-label="Filtrar por data" />
        </div>
        <div style={{ display: 'flex', gap: 8, alignSelf: 'flex-end' }}>
          <button className="sys-btn" onClick={() => carregar(0, filtroSt, filtroDt)}
            disabled={carregando} aria-label="Aplicar filtros">
            {carregando ? <><span className="sys-btn-spinner" aria-hidden="true" /> Buscando</> : 'Buscar'}
          </button>
          <button className="sys-btn-ghost" aria-label="Limpar filtros"
            onClick={() => { setFSt(''); setFDt(''); carregar(0, '', ''); }}>
            Limpar
          </button>
        </div>
      </div>

      {/* Tabela */}
      <div className="sys-table-wrap" role="region" aria-label="Lista de ordens de serviço" aria-live="polite" aria-busy={carregando}>
        {carregando ? (
          <SkeletonTable rows={8} cols={7} />
        ) : os.length === 0 ? (
          <div className="sys-empty">
            <div className="sys-empty-icon">📋</div>
            <p className="sys-empty-title">Nenhuma O.S. encontrada</p>
            <p>Tente ajustar os filtros ou criar uma nova ordem de serviço.</p>
          </div>
        ) : (
          <>
            <table className="sys-table" aria-label="Ordens de serviço">
              <thead>
                <tr>
                  <th scope="col">ID</th><th scope="col">Cliente</th>
                  <th scope="col">Veículo</th><th scope="col">Status</th>
                  <th scope="col">Data</th><th scope="col">Valor Total</th>
                  <th scope="col">Ação</th>
                </tr>
              </thead>
              <tbody>
                {os.map((o) => (
                  <tr key={o.id}>
                    <td><strong>#{o.id}</strong></td>
                    <td>{o.cliente}</td>
                    <td>{o.veiculo}</td>
                    <td><span className={`sys-badge ${statusClass(o.status)}`}>{o.status}</span></td>
                    <td>{o.dataAbertura ? new Date(o.dataAbertura).toLocaleDateString('pt-BR') : '—'}</td>
                    <td>{moeda(o.totalGeral)}</td>
                    <td>
                      <button className="sys-btn" style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                        onClick={() => abrirDetalhe(o.id)}
                        aria-label={`Ver detalhes da O.S. #${o.id}`}>
                        Detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="sys-pagination" role="navigation" aria-label="Paginação">
              <button className="sys-btn-ghost" onClick={() => carregar(pagina - 1, filtroSt, filtroDt)}
                disabled={pagina === 0 || carregando} aria-label="Página anterior">← Anterior</button>
              <span aria-live="polite">Página {pagina + 1} de {total || 1}</span>
              <button className="sys-btn-ghost" onClick={() => carregar(pagina + 1, filtroSt, filtroDt)}
                disabled={pagina >= total - 1 || carregando} aria-label="Próxima página">Próxima →</button>
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {modalAberto && (
        <div className="sys-modal-overlay" role="dialog" aria-modal="true"
          aria-label={osDetalhe ? `Detalhes da O.S. #${osDetalhe.id}` : 'Carregando detalhes'}
          onClick={(e) => e.target === e.currentTarget && fechar()}>
          <div className="sys-modal">
            <div className="sys-modal-header">
              <h2>{osDetalhe ? `O.S. #${osDetalhe.id}` : 'Carregando...'}</h2>
              <button className="sys-modal-close" onClick={fechar} aria-label="Fechar modal">×</button>
            </div>

            {carrDet || !osDetalhe ? (
              <div className="sys-modal-body"><SkeletonTable rows={4} cols={4} /></div>
            ) : (
              <div className="sys-modal-body">
                <div className="sys-section">
                  <h3>Informações Gerais</h3>
                  <div className="sys-detail-grid">
                    {[
                      ['Cliente', osDetalhe.cliente],
                      ['Veículo', `${osDetalhe.veiculo} (${osDetalhe.placa})`],
                      ['Status', <span className={`sys-badge ${statusClass(osDetalhe.status)}`}>{osDetalhe.status}</span>],
                      ['Abertura', osDetalhe.dataAbertura ? new Date(osDetalhe.dataAbertura).toLocaleDateString('pt-BR') : '—'],
                      ['KM Entrada', osDetalhe.kmEntrada || '—'],
                      ['KM Saída', osDetalhe.kmSaida || '—'],
                    ].map(([lbl, val], i) => (
                      <div key={i} className="sys-detail-item">
                        <label>{lbl}</label><p>{val}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {osDetalhe.servicos?.length > 0 && (
                  <div className="sys-section">
                    <h3>Serviços</h3>
                    <table className="sys-table" aria-label="Serviços da O.S.">
                      <thead><tr><th>Descrição</th><th>Qtd</th><th>Unit.</th><th>Desc.</th><th>Total</th></tr></thead>
                      <tbody>{osDetalhe.servicos.map((s) => (
                        <tr key={s.id}>
                          <td>{s.descricao}</td><td>{s.quantidade}</td>
                          <td>{moeda(s.precoUnitario)}</td><td>{s.desconto}%</td><td>{moeda(s.total)}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                )}

                {osDetalhe.pecas?.length > 0 && (
                  <div className="sys-section">
                    <h3>Peças Utilizadas</h3>
                    <table className="sys-table" aria-label="Peças da O.S.">
                      <thead><tr><th>Nome</th><th>Qtd</th><th>Unit.</th><th>Desc.</th><th>Total</th></tr></thead>
                      <tbody>{osDetalhe.pecas.map((p) => (
                        <tr key={p.id}>
                          <td>{p.nome}</td><td>{p.quantidade}</td>
                          <td>{moeda(p.precoUnitario)}</td><td>{p.desconto}%</td><td>{moeda(p.total)}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                )}

                <div className="sys-section">
                  <h3>Resumo Financeiro</h3>
                  <div className="sys-resumo">
                    <div className="sys-resumo-linha"><span>Serviços</span><strong>{moeda(osDetalhe.totalServicos)}</strong></div>
                    <div className="sys-resumo-linha"><span>Peças</span><strong>{moeda(osDetalhe.totalPecas)}</strong></div>
                    <div className="sys-resumo-linha sys-resumo-total"><span>Total Geral</span><strong>{moeda(osDetalhe.totalGeral)}</strong></div>
                  </div>
                </div>

                {osDetalhe.pagamentos?.length > 0 && (
                  <div className="sys-section">
                    <h3>Pagamentos</h3>
                    <table className="sys-table" aria-label="Pagamentos da O.S.">
                      <thead><tr><th>Forma</th><th>Valor</th><th>Parcelas</th><th>Data</th></tr></thead>
                      <tbody>{osDetalhe.pagamentos.map((p) => (
                        <tr key={p.id}>
                          <td>{p.formaPagamento}</td><td>{moeda(p.valor)}</td>
                          <td>{p.parcelas}</td><td>{new Date(p.dataPagamento).toLocaleDateString('pt-BR')}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                )}

                {osDetalhe.avaliacao && (
                  <div className="sys-section">
                    <h3>Avaliação</h3>
                    <div className="sys-detail-grid">
                      <div className="sys-detail-item"><label>Nota</label><p>★ {osDetalhe.avaliacao.nota}/5</p></div>
                      <div className="sys-detail-item"><label>Comentário</label><p>{osDetalhe.avaliacao.comentario || 'Sem comentário'}</p></div>
                    </div>
                  </div>
                )}

                {osDetalhe.status !== 'Concluído' && (
                  <div className="sys-section">
                    <h3>Atualizar Status</h3>
                    <div className="ag-status-row">
                      <label htmlFor="select-status" className="sys-field-label">Novo status</label>
                      <div className="ag-status-controls">
                        <select id="select-status" className="sys-select" value={novoSt}
                          onChange={(e) => setNovoSt(e.target.value)} aria-label="Selecionar novo status">
                          {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                        </select>
                        <button className="sys-btn" onClick={salvarStatus}
                          disabled={salvando || novoSt === osDetalhe.status}
                          aria-label={`Confirmar atualização de status para ${novoSt}`}>
                          {salvando ? <><span className="sys-btn-spinner" aria-hidden="true" /> Salvando</> : 'Confirmar'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="sys-modal-footer">
              <button className="sys-btn-ghost" onClick={fechar} aria-label="Fechar detalhes">Fechar</button>
            </div>
          </div>
        </div>
      )}
    </SystemLayout>
  );
}
