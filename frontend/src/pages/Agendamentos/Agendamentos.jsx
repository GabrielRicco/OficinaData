import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SystemLayout from '../../components/SystemLayout';
import { SkeletonTable } from '../../components/Skeleton';
import { useToast } from '../../components/Toast';
import OsDetalheModal from '../../components/OsDetalheModal';
import { listarAgendamentos } from '../../services/agendamentoService';

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

  const [osIdAberta, setOsIdAberta] = useState(null);

  const carregar = async (p = 0, st = filtroSt, dt = filtroDt) => {
    setCarr(true);
    try {
      const r = await listarAgendamentos({ status: st || undefined, data: dt || undefined, page: p, size: 10 });
      setOs(r.content || []); setTotal(r.totalPages || 0); setPagina(p);
    } catch (e) { toast.error(e.message); }
    finally { setCarr(false); }
  };

  useEffect(() => { carregar(0, '', ''); }, []);

  return (
    <SystemLayout>
      <div className="sys-page-header">
        <div>
          <h1 className="sys-page-title">Ordens de Serviço</h1>
          <p className="sys-page-sub">Filtrar, visualizar detalhes e atualizar status</p>
        </div>
        <button className="sys-btn" onClick={() => navigate('/agendamentos/nova')}
          aria-label="Criar nova ordem de serviço">
          + Nova O.S.
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
                        onClick={() => setOsIdAberta(o.id)}
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

      {osIdAberta != null && (
        <OsDetalheModal
          osId={osIdAberta}
          onClose={() => setOsIdAberta(null)}
          onChanged={() => carregar(pagina, filtroSt, filtroDt)}
        />
      )}
    </SystemLayout>
  );
}
