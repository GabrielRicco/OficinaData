import React, { useEffect, useState } from 'react';
import { SkeletonTable } from './Skeleton';
import { useToast } from './Toast';
import {
  detalharAgendamento, atualizarStatus,
  adicionarServico, adicionarPeca, registrarPagamento, registrarAvaliacao
} from '../services/agendamentoService';
import { listarTiposServico, listarFuncionarios } from '../services/catalogoService';
import { listarPecas } from '../services/pecasService';
import './OsDetalheModal.css';

const moeda = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const statusClass = (s) => {
  if (s === 'Em andamento') return 'andamento';
  if (s === 'Concluído')    return 'concluido';
  if (s === 'Cancelado')    return 'cancelado';
  if (s === 'No-show')      return 'noshow';
  return 'agendado';
};

const STATUS_OPTIONS = ['Agendado', 'Em andamento', 'Concluído', 'Cancelado', 'No-show'];
const FORMAS_PAGAMENTO = ['Dinheiro', 'PIX', 'Cartão de Crédito', 'Cartão de Débito', 'Boleto'];

const SERV_VAZIO = { tipoServicoId: '', funcionarioId: '', quantidade: '1', precoUnitario: '', desconto: '' };
const PECA_VAZIO = { pecaId: '', quantidade: '1', precoUnitario: '', desconto: '' };
const PAG_VAZIO  = { formaPagamento: 'Dinheiro', valor: '', parcelas: '1' };
const AVAL_VAZIO = { nota: '5', comentario: '' };

const numOrUndef = (v) => (v === '' ? undefined : Number(v));

export default function OsDetalheModal({ osId, onClose, onChanged }) {
  const toast = useToast();

  const [os, setOs]                 = useState(null);
  const [carregando, setCarregando] = useState(true);

  const [tipos, setTipos] = useState([]);
  const [funcs, setFuncs] = useState([]);
  const [pecas, setPecas] = useState([]);

  const [painel, setPainel]     = useState(null);   // 'servico' | 'peca' | 'pagamento' | 'avaliacao'
  const [salvando, setSalvando] = useState(false);

  const [novoSt, setNovoSt]         = useState('');
  const [salvandoSt, setSalvandoSt] = useState(false);

  const [fServ, setFServ] = useState(SERV_VAZIO);
  const [fPeca, setFPeca] = useState(PECA_VAZIO);
  const [fPag, setFPag]   = useState(PAG_VAZIO);
  const [fAval, setFAval] = useState(AVAL_VAZIO);

  const carregar = async (primeira = false) => {
    if (primeira) setCarregando(true);
    try {
      const d = await detalharAgendamento(osId);
      setOs(d);
      setNovoSt(d.status);
    } catch (e) { toast.error(e.message); onClose(); }
    finally { if (primeira) setCarregando(false); }
  };

  useEffect(() => {
    if (osId != null) carregar(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [osId]);

  const aposAcao = async (msg) => {
    toast.success(msg);
    setPainel(null);
    await carregar();
    onChanged?.();
  };

  const abrirPainel = async (nome) => {
    setPainel(painel === nome ? null : nome);
    try {
      if (nome === 'servico' && (tipos.length === 0 || funcs.length === 0)) {
        const [t, f] = await Promise.all([listarTiposServico(), listarFuncionarios()]);
        setTipos(t); setFuncs(f);
      }
      if (nome === 'peca' && pecas.length === 0) {
        const r = await listarPecas({ size: 100 });
        setPecas(r.content || []);
      }
    } catch (e) { toast.error(e.message); }
  };

  const osAberta    = os && ['Agendado', 'Em andamento'].includes(os.status);
  const podePagar   = os && ['Em andamento', 'Concluído'].includes(os.status);
  const podeAvaliar = os && os.status === 'Concluído' && !os.avaliacao;
  const pecaSel     = pecas.find((p) => p.id === Number(fPeca.pecaId));

  const salvarStatus = async () => {
    if (novoSt === os.status) { toast.warning('Selecione um status diferente do atual.'); return; }
    setSalvandoSt(true);
    try {
      await atualizarStatus(os.id, { status: novoSt });
      toast.success(`Status atualizado para "${novoSt}".`);
      await carregar();
      onChanged?.();
    } catch (e) { toast.error(e.message); }
    finally { setSalvandoSt(false); }
  };

  const submitServico = async () => {
    if (!fServ.tipoServicoId || !fServ.funcionarioId) { toast.warning('Selecione o tipo de serviço e o funcionário.'); return; }
    if (Number(fServ.quantidade) < 1) { toast.warning('Quantidade deve ser ao menos 1.'); return; }
    setSalvando(true);
    try {
      await adicionarServico(os.id, {
        tipoServicoId: Number(fServ.tipoServicoId),
        funcionarioId: Number(fServ.funcionarioId),
        quantidade: Number(fServ.quantidade),
        precoUnitario: numOrUndef(fServ.precoUnitario),
        desconto: numOrUndef(fServ.desconto),
      });
      setFServ(SERV_VAZIO);
      await aposAcao('Serviço adicionado à O.S.');
    } catch (e) { toast.error(e.message); }
    finally { setSalvando(false); }
  };

  const submitPeca = async () => {
    if (!fPeca.pecaId) { toast.warning('Selecione a peça.'); return; }
    const qtd = Number(fPeca.quantidade);
    if (qtd < 1) { toast.warning('Quantidade deve ser ao menos 1.'); return; }
    if (pecaSel && qtd > pecaSel.quantidadeEstoque) { toast.warning(`Estoque insuficiente (disponível: ${pecaSel.quantidadeEstoque}).`); return; }
    setSalvando(true);
    try {
      await adicionarPeca(os.id, {
        pecaId: Number(fPeca.pecaId),
        quantidade: qtd,
        precoUnitario: numOrUndef(fPeca.precoUnitario),
        desconto: numOrUndef(fPeca.desconto),
      });
      setFPeca(PECA_VAZIO);
      await aposAcao('Peça adicionada à O.S.');
    } catch (e) { toast.error(e.message); }
    finally { setSalvando(false); }
  };

  const submitPagamento = async () => {
    if (Number(fPag.valor) <= 0) { toast.warning('Informe um valor maior que zero.'); return; }
    if (Number(fPag.parcelas) < 1) { toast.warning('Parcelas deve ser ao menos 1.'); return; }
    setSalvando(true);
    try {
      await registrarPagamento(os.id, {
        formaPagamento: fPag.formaPagamento,
        valor: Number(fPag.valor),
        parcelas: Number(fPag.parcelas),
      });
      setFPag(PAG_VAZIO);
      await aposAcao('Pagamento registrado.');
    } catch (e) { toast.error(e.message); }
    finally { setSalvando(false); }
  };

  const submitAvaliacao = async () => {
    const nota = Number(fAval.nota);
    if (nota < 1 || nota > 5) { toast.warning('A nota deve ser de 1 a 5.'); return; }
    setSalvando(true);
    try {
      await registrarAvaliacao(os.id, { nota, comentario: fAval.comentario || undefined });
      setFAval(AVAL_VAZIO);
      await aposAcao('Avaliação registrada.');
    } catch (e) { toast.error(e.message); }
    finally { setSalvando(false); }
  };

  return (
    <div className="sys-modal-overlay" role="dialog" aria-modal="true"
      aria-label={os ? `Detalhes da O.S. #${os.id}` : 'Carregando detalhes'}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sys-modal">
        <div className="sys-modal-header">
          <h2>{os ? `O.S. #${os.id}` : 'Carregando...'}</h2>
          <button className="sys-modal-close" onClick={onClose} aria-label="Fechar modal">×</button>
        </div>

        {carregando || !os ? (
          <div className="sys-modal-body"><SkeletonTable rows={4} cols={4} /></div>
        ) : (
          <div className="sys-modal-body">
            {/* Informações gerais */}
            <div className="sys-section">
              <h3>Informações Gerais</h3>
              <div className="sys-detail-grid">
                {[
                  ['Cliente', os.cliente],
                  ['Veículo', `${os.veiculo} (${os.placa})`],
                  ['Status', <span className={`sys-badge ${statusClass(os.status)}`}>{os.status}</span>],
                  ['Abertura', os.dataAbertura ? new Date(os.dataAbertura).toLocaleDateString('pt-BR') : '—'],
                  ['KM Entrada', os.kmEntrada ?? '—'],
                  ['KM Saída', os.kmSaida ?? '—'],
                ].map(([lbl, val], i) => (
                  <div key={i} className="sys-detail-item"><label>{lbl}</label><p>{val}</p></div>
                ))}
              </div>
            </div>

            {/* Serviços */}
            <div className="sys-section">
              <div className="osd-section-head">
                <h3>Serviços</h3>
                {osAberta && (
                  <button className="sys-btn" onClick={() => abrirPainel('servico')}
                    aria-expanded={painel === 'servico'}>
                    {painel === 'servico' ? 'Cancelar' : '+ Adicionar serviço'}
                  </button>
                )}
              </div>

              {painel === 'servico' && (
                <div className="osd-form" role="group" aria-label="Adicionar serviço">
                  <div className="osd-form-grid">
                    <label className="osd-field">Tipo de serviço *
                      <select className="sys-select" value={fServ.tipoServicoId}
                        onChange={(e) => setFServ({ ...fServ, tipoServicoId: e.target.value })}>
                        <option value="">Selecione…</option>
                        {tipos.map((t) => <option key={t.id} value={t.id}>{t.descricao} — {moeda(t.precoBase)}</option>)}
                      </select>
                    </label>
                    <label className="osd-field">Funcionário *
                      <select className="sys-select" value={fServ.funcionarioId}
                        onChange={(e) => setFServ({ ...fServ, funcionarioId: e.target.value })}>
                        <option value="">Selecione…</option>
                        {funcs.map((f) => <option key={f.id} value={f.id}>{f.nome} ({f.cargo})</option>)}
                      </select>
                    </label>
                    <label className="osd-field">Quantidade *
                      <input className="sys-input" type="number" min="1" value={fServ.quantidade}
                        onChange={(e) => setFServ({ ...fServ, quantidade: e.target.value })} />
                    </label>
                    <label className="osd-field">Preço unit. (opcional)
                      <input className="sys-input" type="number" min="0" step="0.01" placeholder="usa preço base"
                        value={fServ.precoUnitario} onChange={(e) => setFServ({ ...fServ, precoUnitario: e.target.value })} />
                    </label>
                    <label className="osd-field">Desconto % (opcional)
                      <input className="sys-input" type="number" min="0" max="100" step="0.01" placeholder="0"
                        value={fServ.desconto} onChange={(e) => setFServ({ ...fServ, desconto: e.target.value })} />
                    </label>
                  </div>
                  <div className="osd-form-actions">
                    <button className="sys-btn" onClick={submitServico} disabled={salvando}>
                      {salvando ? <><span className="sys-btn-spinner" aria-hidden="true" /> Adicionando…</> : 'Adicionar serviço'}
                    </button>
                  </div>
                </div>
              )}

              {os.servicos?.length > 0 ? (
                <table className="sys-table" aria-label="Serviços da O.S.">
                  <thead><tr><th>Descrição</th><th>Funcionário</th><th>Qtd</th><th>Unit.</th><th>Desc.</th><th>Total</th></tr></thead>
                  <tbody>{os.servicos.map((s) => (
                    <tr key={s.id}>
                      <td>{s.descricao}</td><td>{s.funcionario}</td><td>{s.quantidade}</td>
                      <td>{moeda(s.precoUnitario)}</td><td>{s.desconto}%</td><td>{moeda(s.total)}</td>
                    </tr>
                  ))}</tbody>
                </table>
              ) : <p className="osd-vazio">Nenhum serviço lançado.</p>}
            </div>

            {/* Peças */}
            <div className="sys-section">
              <div className="osd-section-head">
                <h3>Peças Utilizadas</h3>
                {osAberta && (
                  <button className="sys-btn" onClick={() => abrirPainel('peca')}
                    aria-expanded={painel === 'peca'}>
                    {painel === 'peca' ? 'Cancelar' : '+ Adicionar peça'}
                  </button>
                )}
              </div>

              {painel === 'peca' && (
                <div className="osd-form" role="group" aria-label="Adicionar peça">
                  <div className="osd-form-grid">
                    <label className="osd-field osd-field-wide">Peça *
                      <select className="sys-select" value={fPeca.pecaId}
                        onChange={(e) => setFPeca({ ...fPeca, pecaId: e.target.value })}>
                        <option value="">Selecione…</option>
                        {pecas.map((p) => (
                          <option key={p.id} value={p.id} disabled={p.quantidadeEstoque <= 0}>
                            {p.nome} — {moeda(p.precoUnitario)} (estoque: {p.quantidadeEstoque})
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="osd-field">Quantidade *
                      <input className="sys-input" type="number" min="1"
                        max={pecaSel ? pecaSel.quantidadeEstoque : undefined}
                        value={fPeca.quantidade} onChange={(e) => setFPeca({ ...fPeca, quantidade: e.target.value })} />
                    </label>
                    <label className="osd-field">Preço unit. (opcional)
                      <input className="sys-input" type="number" min="0" step="0.01" placeholder="usa preço da peça"
                        value={fPeca.precoUnitario} onChange={(e) => setFPeca({ ...fPeca, precoUnitario: e.target.value })} />
                    </label>
                    <label className="osd-field">Desconto % (opcional)
                      <input className="sys-input" type="number" min="0" max="100" step="0.01" placeholder="0"
                        value={fPeca.desconto} onChange={(e) => setFPeca({ ...fPeca, desconto: e.target.value })} />
                    </label>
                  </div>
                  <div className="osd-form-actions">
                    <button className="sys-btn" onClick={submitPeca} disabled={salvando}>
                      {salvando ? <><span className="sys-btn-spinner" aria-hidden="true" /> Adicionando…</> : 'Adicionar peça'}
                    </button>
                  </div>
                </div>
              )}

              {os.pecas?.length > 0 ? (
                <table className="sys-table" aria-label="Peças da O.S.">
                  <thead><tr><th>Nome</th><th>Qtd</th><th>Unit.</th><th>Desc.</th><th>Total</th></tr></thead>
                  <tbody>{os.pecas.map((p) => (
                    <tr key={p.id}>
                      <td>{p.nome}</td><td>{p.quantidade}</td>
                      <td>{moeda(p.precoUnitario)}</td><td>{p.desconto}%</td><td>{moeda(p.total)}</td>
                    </tr>
                  ))}</tbody>
                </table>
              ) : <p className="osd-vazio">Nenhuma peça lançada.</p>}
            </div>

            {/* Resumo financeiro */}
            <div className="sys-section">
              <h3>Resumo Financeiro</h3>
              <div className="sys-resumo">
                <div className="sys-resumo-linha"><span>Serviços</span><strong>{moeda(os.totalServicos)}</strong></div>
                <div className="sys-resumo-linha"><span>Peças</span><strong>{moeda(os.totalPecas)}</strong></div>
                <div className="sys-resumo-linha sys-resumo-total"><span>Total Geral</span><strong>{moeda(os.totalGeral)}</strong></div>
              </div>
            </div>

            {/* Pagamentos */}
            <div className="sys-section">
              <div className="osd-section-head">
                <h3>Pagamentos</h3>
                {podePagar && (
                  <button className="sys-btn" onClick={() => abrirPainel('pagamento')}
                    aria-expanded={painel === 'pagamento'}>
                    {painel === 'pagamento' ? 'Cancelar' : '+ Registrar pagamento'}
                  </button>
                )}
              </div>

              {painel === 'pagamento' && (
                <div className="osd-form" role="group" aria-label="Registrar pagamento">
                  <div className="osd-form-grid">
                    <label className="osd-field">Forma *
                      <select className="sys-select" value={fPag.formaPagamento}
                        onChange={(e) => setFPag({ ...fPag, formaPagamento: e.target.value })}>
                        {FORMAS_PAGAMENTO.map((f) => <option key={f}>{f}</option>)}
                      </select>
                    </label>
                    <label className="osd-field">Valor *
                      <input className="sys-input" type="number" min="0.01" step="0.01" placeholder={moeda(os.totalGeral)}
                        value={fPag.valor} onChange={(e) => setFPag({ ...fPag, valor: e.target.value })} />
                    </label>
                    <label className="osd-field">Parcelas *
                      <input className="sys-input" type="number" min="1" value={fPag.parcelas}
                        onChange={(e) => setFPag({ ...fPag, parcelas: e.target.value })} />
                    </label>
                  </div>
                  <div className="osd-form-actions">
                    <button className="sys-btn" onClick={submitPagamento} disabled={salvando}>
                      {salvando ? <><span className="sys-btn-spinner" aria-hidden="true" /> Registrando…</> : 'Registrar pagamento'}
                    </button>
                  </div>
                </div>
              )}

              {os.pagamentos?.length > 0 ? (
                <table className="sys-table" aria-label="Pagamentos da O.S.">
                  <thead><tr><th>Forma</th><th>Valor</th><th>Parcelas</th><th>Data</th></tr></thead>
                  <tbody>{os.pagamentos.map((p) => (
                    <tr key={p.id}>
                      <td>{p.formaPagamento}</td><td>{moeda(p.valor)}</td><td>{p.parcelas}</td>
                      <td>{p.dataPagamento ? new Date(p.dataPagamento).toLocaleDateString('pt-BR') : '—'}</td>
                    </tr>
                  ))}</tbody>
                </table>
              ) : <p className="osd-vazio">Nenhum pagamento registrado.</p>}
            </div>

            {/* Avaliação */}
            <div className="sys-section">
              <div className="osd-section-head">
                <h3>Avaliação</h3>
                {podeAvaliar && (
                  <button className="sys-btn" onClick={() => abrirPainel('avaliacao')}
                    aria-expanded={painel === 'avaliacao'}>
                    {painel === 'avaliacao' ? 'Cancelar' : '+ Registrar avaliação'}
                  </button>
                )}
              </div>

              {painel === 'avaliacao' && (
                <div className="osd-form" role="group" aria-label="Registrar avaliação">
                  <div className="osd-form-grid">
                    <label className="osd-field">Nota (1 a 5) *
                      <select className="sys-select" value={fAval.nota}
                        onChange={(e) => setFAval({ ...fAval, nota: e.target.value })}>
                        {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{'★'.repeat(n)} ({n})</option>)}
                      </select>
                    </label>
                    <label className="osd-field osd-field-wide">Comentário (opcional)
                      <input className="sys-input" type="text" placeholder="Comentário do cliente"
                        value={fAval.comentario} onChange={(e) => setFAval({ ...fAval, comentario: e.target.value })} />
                    </label>
                  </div>
                  <div className="osd-form-actions">
                    <button className="sys-btn" onClick={submitAvaliacao} disabled={salvando}>
                      {salvando ? <><span className="sys-btn-spinner" aria-hidden="true" /> Registrando…</> : 'Registrar avaliação'}
                    </button>
                  </div>
                </div>
              )}

              {os.avaliacao ? (
                <div className="sys-detail-grid">
                  <div className="sys-detail-item"><label>Nota</label><p>{'★'.repeat(os.avaliacao.nota)} {os.avaliacao.nota}/5</p></div>
                  <div className="sys-detail-item"><label>Comentário</label><p>{os.avaliacao.comentario || 'Sem comentário'}</p></div>
                </div>
              ) : <p className="osd-vazio">Sem avaliação{podeAvaliar ? '' : ' (disponível após conclusão)'}.</p>}
            </div>

            {/* Atualizar status */}
            {os.status !== 'Concluído' && (
              <div className="sys-section">
                <h3>Atualizar Status</h3>
                <div className="osd-status-row">
                  <select className="sys-select" value={novoSt}
                    onChange={(e) => setNovoSt(e.target.value)} aria-label="Selecionar novo status">
                    {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                  <button className="sys-btn" onClick={salvarStatus} disabled={salvandoSt || novoSt === os.status}>
                    {salvandoSt ? <><span className="sys-btn-spinner" aria-hidden="true" /> Salvando</> : 'Confirmar'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="sys-modal-footer">
          <button className="sys-btn-ghost" onClick={onClose} aria-label="Fechar detalhes">Fechar</button>
        </div>
      </div>
    </div>
  );
}
