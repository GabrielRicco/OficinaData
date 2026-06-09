import React, { useEffect, useState } from 'react';
import SystemLayout from '../../components/SystemLayout';
import { SkeletonTable } from '../../components/Skeleton';
import { useToast } from '../../components/Toast';
import { listarPecas, listarPecasAbaixoMinimo } from '../../services/pecasService';
import './Estoque.css';

const PAGE_SIZE = 20;
const moeda = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function Estoque() {
  const toast = useToast();
  const [filtros, setFiltros]   = useState({ nome: '', fornecedor: '', precoMin: '', precoMax: '' });
  const [filtrosApl, setFApls]  = useState({});
  const [pagina, setPagina]     = useState({ content: [], number: 0, totalPages: 0, totalElements: 0 });
  const [pageIdx, setPageIdx]   = useState(0);
  const [alertas, setAlertas]   = useState([]);
  const [carregando, setCarr]   = useState(true);

  const carregar = (f, p) => {
    setCarr(true);
    Promise.all([listarPecas({ ...f, page: p, size: PAGE_SIZE }), listarPecasAbaixoMinimo()])
      .then(([pag, al]) => {
        setPagina(pag || { content: [], number: 0, totalPages: 0, totalElements: 0 });
        setAlertas(al || []);
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setCarr(false));
  };

  useEffect(() => { carregar({}, 0); }, []);

  const aplicar = (e) => {
    e.preventDefault();
    setPageIdx(0); setFApls(filtros); carregar(filtros, 0);
  };

  const limpar = () => {
    const v = { nome: '', fornecedor: '', precoMin: '', precoMax: '' };
    setFiltros(v); setFApls({}); setPageIdx(0); carregar({}, 0);
  };

  const irPagina = (p) => { setPageIdx(p); carregar(filtrosApl, p); };

  const idsAlerta   = new Set(alertas.map((a) => a.idPeca));
  const totalAlerta = alertas.length;

  return (
    <SystemLayout>
      <div className="sys-page-header">
        <div>
          <h1 className="sys-page-title">Estoque de Peças</h1>
          <p className="sys-page-sub">Itens abaixo do mínimo ficam destacados em alerta.</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="est-summary" role="list" aria-label="Resumo do estoque">
        <div className={`est-summary-card ${totalAlerta > 0 ? 'alert' : ''}`} role="listitem">
          <p className="est-summary-label">Peças em alerta</p>
          <p className="est-summary-value" style={{ color: totalAlerta > 0 ? 'var(--warning)' : 'var(--success)' }}>
            {carregando ? '—' : totalAlerta}
          </p>
          {totalAlerta > 0 && <p className="est-summary-hint">Estoque abaixo do mínimo</p>}
        </div>
        <div className="est-summary-card" role="listitem">
          <p className="est-summary-label">Total cadastrado</p>
          <p className="est-summary-value">{carregando ? '—' : (pagina.totalElements ?? 0)}</p>
        </div>
      </div>

      {/* Filters */}
      <form className="sys-filters" onSubmit={aplicar} role="search" aria-label="Filtros de estoque">
        <div className="sys-filter-group">
          <label htmlFor="est-nome">Nome</label>
          <input id="est-nome" className="sys-input" placeholder="Ex: Filtro de óleo"
            value={filtros.nome} onChange={(e) => setFiltros({ ...filtros, nome: e.target.value })} />
        </div>
        <div className="sys-filter-group">
          <label htmlFor="est-fornecedor">Fornecedor</label>
          <input id="est-fornecedor" className="sys-input" placeholder="Ex: Bosch"
            value={filtros.fornecedor} onChange={(e) => setFiltros({ ...filtros, fornecedor: e.target.value })} />
        </div>
        <div className="sys-filter-group est-price-field">
          <label htmlFor="est-pmin">Preço mín.</label>
          <input id="est-pmin" className="sys-input" type="number" step="0.01" min="0" placeholder="0,00"
            value={filtros.precoMin} onChange={(e) => setFiltros({ ...filtros, precoMin: e.target.value })} />
        </div>
        <div className="sys-filter-group est-price-field">
          <label htmlFor="est-pmax">Preço máx.</label>
          <input id="est-pmax" className="sys-input" type="number" step="0.01" min="0" placeholder="9999,99"
            value={filtros.precoMax} onChange={(e) => setFiltros({ ...filtros, precoMax: e.target.value })} />
        </div>
        <div style={{ display: 'flex', gap: 8, alignSelf: 'flex-end' }}>
          <button type="submit" className="sys-btn" disabled={carregando}
            aria-label="Aplicar filtros de estoque">
            {carregando ? <><span className="sys-btn-spinner" aria-hidden="true" /> Buscando</> : 'Filtrar'}
          </button>
          <button type="button" className="sys-btn-ghost" onClick={limpar} disabled={carregando}
            aria-label="Limpar filtros">Limpar</button>
        </div>
      </form>

      {/* Table */}
      <div className="sys-table-wrap" role="region" aria-label="Estoque de peças" aria-live="polite" aria-busy={carregando}>
        {carregando ? (
          <SkeletonTable rows={10} cols={7} />
        ) : pagina.content.length === 0 ? (
          <div className="sys-empty">
            <div className="sys-empty-icon">🔧</div>
            <p className="sys-empty-title">Nenhuma peça encontrada</p>
            <p>Tente ajustar os filtros de busca.</p>
          </div>
        ) : (
          <>
            <table className="sys-table" aria-label="Lista de peças em estoque">
              <thead>
                <tr>
                  <th scope="col">ID</th><th scope="col">Nome</th><th scope="col">Fornecedor</th>
                  <th scope="col">Preço Unit.</th><th scope="col">Estoque</th>
                  <th scope="col">Mínimo</th><th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {pagina.content.map((p) => {
                  const alerta = idsAlerta.has(p.id) || p.quantidadeEstoque < p.quantidadeMinima;
                  return (
                    <tr key={p.id} className={alerta ? 'est-row-alerta' : ''}
                      aria-label={alerta ? `${p.nome} — abaixo do estoque mínimo` : undefined}>
                      <td><strong>#{p.id}</strong></td>
                      <td>{p.nome}</td>
                      <td>{p.fornecedor}</td>
                      <td>{moeda(p.precoUnitario)}</td>
                      <td className={alerta ? 'est-qty-alerta' : ''}>{p.quantidadeEstoque}</td>
                      <td>{p.quantidadeMinima}</td>
                      <td>
                        <span className={`sys-badge ${alerta ? 'cancelado' : 'concluido'}`}
                          aria-label={alerta ? 'Abaixo do mínimo' : 'Estoque OK'}>
                          {alerta ? 'Abaixo do mínimo' : 'OK'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {pagina.totalPages > 1 && (
              <div className="sys-pagination" role="navigation" aria-label="Paginação do estoque">
                <button className="sys-btn-ghost" onClick={() => irPagina(pageIdx - 1)}
                  disabled={pageIdx === 0 || carregando} aria-label="Página anterior">← Anterior</button>
                <span aria-live="polite">Página {pageIdx + 1} de {pagina.totalPages} · {pagina.totalElements} peças</span>
                <button className="sys-btn-ghost" onClick={() => irPagina(pageIdx + 1)}
                  disabled={pageIdx >= pagina.totalPages - 1 || carregando} aria-label="Próxima página">Próxima →</button>
              </div>
            )}
          </>
        )}
      </div>
    </SystemLayout>
  );
}
