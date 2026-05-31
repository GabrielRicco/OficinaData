import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listarPecas, listarPecasAbaixoMinimo } from '../../services/pecasService';
import { useAuth } from '../../hooks/useAuth';
import './Estoque.css';

const PAGE_SIZE = 20;

function Estoque() {
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  const [filtros, setFiltros] = useState({ nome: '', fornecedor: '', precoMin: '', precoMax: '' });
  const [filtrosAplicados, setFiltrosAplicados] = useState({});
  const [pagina, setPagina] = useState({ content: [], number: 0, totalPages: 0, totalElements: 0 });
  const [pageIndex, setPageIndex] = useState(0);
  const [pecasAlerta, setPecasAlerta] = useState([]);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const carregar = (filtrosUsados, page) => {
    setCarregando(true);
    setErro('');
    Promise.all([
      listarPecas({ ...filtrosUsados, page, size: PAGE_SIZE }),
      listarPecasAbaixoMinimo()
    ])
      .then(([respPagina, respAlerta]) => {
        setPagina(respPagina || { content: [], number: 0, totalPages: 0, totalElements: 0 });
        setPecasAlerta(respAlerta || []);
      })
      .catch((error) => setErro(error.message))
      .finally(() => setCarregando(false));
  };

  useEffect(() => {
    carregar({}, 0);
  }, []);

  const aplicarFiltros = (e) => {
    e.preventDefault();
    setPageIndex(0);
    setFiltrosAplicados(filtros);
    carregar(filtros, 0);
  };

  const limparFiltros = () => {
    const vazio = { nome: '', fornecedor: '', precoMin: '', precoMax: '' };
    setFiltros(vazio);
    setFiltrosAplicados({});
    setPageIndex(0);
    carregar({}, 0);
  };

  const irParaPagina = (novaPagina) => {
    setPageIndex(novaPagina);
    carregar(filtrosAplicados, novaPagina);
  };

  const moeda = (valor) =>
    Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const idsAlerta = new Set(pecasAlerta.map((p) => p.idPeca));
  const totalAlerta = pecasAlerta.length;
  const totalListado = pagina.totalElements ?? 0;

  return (
    <div className="estoque-container">
      <div className="estoque-header">
        <div>
          <h2>Estoque de Peças</h2>
          <p>Listagem completa de peças, com destaque para itens abaixo do estoque mínimo.</p>
        </div>
        <button
          type="button"
          className="btn-voltar"
          onClick={() => navigate(hasRole('GERENTE') ? '/dashboard' : '/agendamentos')}
        >
          Voltar
        </button>
      </div>

      <div className="estoque-summary">
        <div className={`estoque-summary-card ${totalAlerta > 0 ? 'alert' : 'ok'}`}>
          <p className="label">Peças em alerta</p>
          <p className="value">{totalAlerta}</p>
        </div>
        <div className="estoque-summary-card">
          <p className="label">Total cadastrado</p>
          <p className="value">{totalListado}</p>
        </div>
      </div>

      <form className="estoque-filtros" onSubmit={aplicarFiltros}>
        <div className="filtro-grupo">
          <label htmlFor="filtro-nome">Nome</label>
          <input
            id="filtro-nome"
            type="text"
            value={filtros.nome}
            onChange={(e) => setFiltros({ ...filtros, nome: e.target.value })}
            placeholder="Ex: Filtro de óleo"
          />
        </div>
        <div className="filtro-grupo">
          <label htmlFor="filtro-fornecedor">Fornecedor</label>
          <input
            id="filtro-fornecedor"
            type="text"
            value={filtros.fornecedor}
            onChange={(e) => setFiltros({ ...filtros, fornecedor: e.target.value })}
            placeholder="Ex: Bosch"
          />
        </div>
        <div className="filtro-grupo">
          <label htmlFor="filtro-preco-min">Preço mín. (R$)</label>
          <input
            id="filtro-preco-min"
            type="number"
            step="0.01"
            min="0"
            value={filtros.precoMin}
            onChange={(e) => setFiltros({ ...filtros, precoMin: e.target.value })}
            placeholder="0,00"
          />
        </div>
        <div className="filtro-grupo">
          <label htmlFor="filtro-preco-max">Preço máx. (R$)</label>
          <input
            id="filtro-preco-max"
            type="number"
            step="0.01"
            min="0"
            value={filtros.precoMax}
            onChange={(e) => setFiltros({ ...filtros, precoMax: e.target.value })}
            placeholder="9999,99"
          />
        </div>
        <div className="filtros-acoes">
          <button type="submit" className="btn-filtrar" disabled={carregando}>
            {carregando ? 'Buscando...' : 'Filtrar'}
          </button>
          <button type="button" className="btn-limpar" onClick={limparFiltros} disabled={carregando}>
            Limpar
          </button>
        </div>
      </form>

      {erro && <p className="form-error">{erro}</p>}

      <div className="estoque-tabela-card">
        <table className="estoque-tabela">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Fornecedor</th>
              <th>Preço unitário</th>
              <th>Estoque atual</th>
              <th>Estoque mínimo</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {pagina.content.length === 0 && !carregando && (
              <tr>
                <td colSpan={7} className="estoque-vazio">Nenhuma peça encontrada com os filtros aplicados.</td>
              </tr>
            )}
            {pagina.content.map((peca) => {
              const emAlerta = idsAlerta.has(peca.id) || peca.quantidadeEstoque < peca.quantidadeMinima;
              return (
                <tr key={peca.id} className={emAlerta ? 'row-alerta' : ''}>
                  <td><strong>#{peca.id}</strong></td>
                  <td>{peca.nome}</td>
                  <td>{peca.fornecedor}</td>
                  <td>{moeda(peca.precoUnitario)}</td>
                  <td>{peca.quantidadeEstoque}</td>
                  <td>{peca.quantidadeMinima}</td>
                  <td>
                    <span className={`estoque-badge ${emAlerta ? 'alerta' : 'ok'}`}>
                      {emAlerta ? 'Abaixo do mínimo' : 'OK'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {pagina.totalPages > 1 && (
        <div className="estoque-paginacao">
          <span className="pag-info">
            Página {pageIndex + 1} de {pagina.totalPages} · {totalListado} peças
          </span>
          <div className="pag-acoes">
            <button onClick={() => irParaPagina(pageIndex - 1)} disabled={pageIndex === 0 || carregando}>
              ← Anterior
            </button>
            <button
              onClick={() => irParaPagina(pageIndex + 1)}
              disabled={pageIndex >= pagina.totalPages - 1 || carregando}
            >
              Próxima →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Estoque;
