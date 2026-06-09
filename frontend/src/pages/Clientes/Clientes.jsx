import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import SystemLayout from '../../components/SystemLayout';
import { SkeletonTable } from '../../components/Skeleton';
import { useToast } from '../../components/Toast';
import { cadastrarCliente, cadastrarVeiculo, listarClientes } from '../../services/clienteService';
import './Clientes.css';

/* ── Masks ────────────────────────────────────── */
const maskCPF = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0,3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`;
  return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`;
};
const maskCNPJ = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 14);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0,2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5)}`;
  if (d.length <= 12) return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8)}`;
  return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8,12)}-${d.slice(12)}`;
};
const maskTel = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length === 0) return '';
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 7) return `(${d.slice(0,2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
};
const maskPlaca = (v) => v.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 7);

/* ── CPF/CNPJ validation ──────────────────────── */
function validarCPF(cpf) {
  const n = cpf.replace(/\D/g,'');
  if (n.length !== 11 || /^(\d)\1+$/.test(n)) return false;
  let s = 0; for (let i=0;i<9;i++) s += +n[i]*(10-i);
  let r = (s*10)%11; if (r===10||r===11) r=0; if (r!==+n[9]) return false;
  s = 0; for (let i=0;i<10;i++) s += +n[i]*(11-i);
  r = (s*10)%11; if (r===10||r===11) r=0; return r===+n[10];
}
function validarCNPJ(cnpj) {
  const n = cnpj.replace(/\D/g,'');
  if (n.length!==14 || /^(\d)\1+$/.test(n)) return false;
  const calc = (len) => { let s=0,p=len-7; for(let i=0;i<len;i++){s+=+n[i]*p--;if(p<2)p=9;} return s%11<2?0:11-s%11; };
  return calc(12)===+n[12] && calc(13)===+n[13];
}

const EMPTY = { nome:'', doc:'', email:'', tel:'', ie:'', placa:'', marca:'', modelo:'', ano:'' };

export default function Clientes() {
  const navigate = useNavigate();
  const toast = useToast();
  const [aba, setAba]         = useState('novo');
  const [tipo, setTipo]       = useState('PF');
  const [form, setForm]       = useState(EMPTY);
  const [erros, setErros]     = useState({});
  const [tocados, setTocados] = useState({});
  const [salvando, setSalv]   = useState(false);

  const [clientes, setCli]    = useState([]);
  const [busca, setBusca]     = useState('');
  const [filtroTipo, setFTip] = useState('');
  const [pagina, setPag]      = useState(0);
  const [totalPag, setTotPag] = useState(0);
  const [carregando, setCarr] = useState(false);

  /* ── Validation ─────────────────────────────── */
  const validar = useCallback((f = form, t = tipo) => {
    const e = {};
    if (!f.nome.trim()) e.nome = 'Nome é obrigatório.';
    if (!f.doc.trim()) {
      e.doc = `${t === 'PF' ? 'CPF' : 'CNPJ'} é obrigatório.`;
    } else if (t === 'PF' && !validarCPF(f.doc)) {
      e.doc = 'CPF inválido.';
    } else if (t === 'PJ' && !validarCNPJ(f.doc)) {
      e.doc = 'CNPJ inválido.';
    }
    if (!f.email.trim()) e.email = 'E-mail é obrigatório.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = 'E-mail inválido.';
    if (!f.tel.trim()) e.tel = 'Telefone é obrigatório.';
    if (t === 'PJ' && !f.ie.trim()) e.ie = 'Inscrição Estadual é obrigatória.';
    if (!f.placa.trim()) e.placa = 'Placa é obrigatória.';
    else if (f.placa.length < 7) e.placa = 'Placa deve ter 7 caracteres.';
    if (!f.marca.trim()) e.marca = 'Marca é obrigatória.';
    if (!f.modelo.trim()) e.modelo = 'Modelo é obrigatório.';
    if (!f.ano.trim()) e.ano = 'Ano é obrigatório.';
    else if (f.ano < 1960 || f.ano > new Date().getFullYear() + 1) e.ano = 'Ano inválido.';
    return e;
  }, [form, tipo]);

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (tocados[field]) {
      const e = validar({ ...form, [field]: value }, tipo);
      setErros((prev) => ({ ...prev, [field]: e[field] }));
    }
  };

  const blur = (field) => {
    setTocados((prev) => ({ ...prev, [field]: true }));
    const e = validar(form, tipo);
    setErros((prev) => ({ ...prev, [field]: e[field] }));
  };

  const inputClass = (field) => {
    if (!tocados[field]) return 'sys-input';
    return `sys-input ${erros[field] ? 'is-invalid' : 'is-valid'}`;
  };

  /* ── Load list ──────────────────────────────── */
  const carregarClientes = async (p = 0, n = busca, t = filtroTipo) => {
    setCarr(true);
    try {
      const r = await listarClientes({ nome: n.trim(), tipo: t || undefined, page: p, size: 10 });
      setCli(r.content || []); setTotPag(r.totalPages || 0); setPag(p);
    } catch (e) { toast.error(e.message); }
    finally { setCarr(false); }
  };

  useEffect(() => { if (aba === 'lista') carregarClientes(0, '', ''); }, [aba]);

  /* ── Submit ─────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const allTouched = Object.keys(EMPTY).reduce((a, k) => ({ ...a, [k]: true }), {});
    setTocados(allTouched);
    const e2 = validar();
    setErros(e2);
    if (Object.keys(e2).length > 0) {
      toast.warning('Corrija os campos em destaque antes de continuar.');
      return;
    }
    setSalv(true);
    try {
      const nums = form.doc.replace(/\D/g, '');
      const cli = await cadastrarCliente({
        nome: form.nome, email: form.email,
        telefone: form.tel.replace(/\D/g, ''),
        cpf:  tipo === 'PF' ? nums : null,
        cnpj: tipo === 'PJ' ? nums : null,
      });
      await cadastrarVeiculo({
        clienteId: cli.id,
        placa: form.placa.toUpperCase(),
        marca: form.marca, modelo: form.modelo, ano: Number(form.ano),
      });
      toast.success(`${form.nome} e veículo ${form.placa} cadastrados com sucesso!`);
      setForm(EMPTY); setErros({}); setTocados({});
      setAba('lista');
      carregarClientes(0, '', '');
    } catch (e) { toast.error(e.message); }
    finally { setSalv(false); }
  };

  return (
    <SystemLayout>
      <div className="sys-page-header">
        <div>
          <h1 className="sys-page-title">Clientes</h1>
          <p className="sys-page-sub">Cadastro e listagem de clientes PF e PJ</p>
        </div>
      </div>

      {/* Abas */}
      <div className="cli-tabs" role="tablist" aria-label="Seções de clientes">
        {[['novo','+ Novo Cadastro'],['lista','Lista de Clientes']].map(([v, label]) => (
          <button key={v} role="tab" aria-selected={aba === v} aria-controls={`tabpanel-${v}`}
            className={`cli-tab ${aba === v ? 'active' : ''}`}
            onClick={() => setAba(v)}>{label}</button>
        ))}
      </div>

      {/* ABA: NOVO */}
      {aba === 'novo' && (
        <div id="tabpanel-novo" role="tabpanel" aria-label="Novo cadastro" className="sys-card">
          <h2 className="cli-form-title">Novo Cadastro</h2>
          <p className="sys-page-sub" style={{ marginBottom: 24 }}>
            Preencha os dados do cliente e do veículo para liberar a O.S.
          </p>

          <div className="cli-tipo-toggle" role="group" aria-label="Tipo de pessoa">
            {[['PF','Pessoa Física (CPF)'],['PJ','Pessoa Jurídica (CNPJ)']].map(([v, label]) => (
              <button key={v} type="button" aria-pressed={tipo === v}
                className={`cli-tipo-btn ${tipo === v ? 'active' : ''}`}
                onClick={() => { setTipo(v); set('doc', ''); setErros({}); setTocados({}); }}>
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="cli-section-label">Informações do Cliente</div>
            <div className="cli-form-grid">
              <div className="cli-field full">
                <label htmlFor="f-nome">{tipo === 'PF' ? 'Nome Completo' : 'Razão Social'} <span aria-hidden="true">*</span></label>
                <input id="f-nome" className={inputClass('nome')}
                  placeholder={tipo === 'PF' ? 'Ex: João da Silva' : 'Ex: Oficina LTDA'}
                  value={form.nome} onChange={(e) => set('nome', e.target.value)}
                  onBlur={() => blur('nome')} aria-required="true"
                  aria-invalid={!!erros.nome} aria-describedby={erros.nome ? 'err-nome' : undefined} />
                {tocados.nome && erros.nome && <span id="err-nome" className="sys-field-error" role="alert">{erros.nome}</span>}
              </div>

              <div className="cli-field">
                <label htmlFor="f-doc">{tipo === 'PF' ? 'CPF' : 'CNPJ'} <span aria-hidden="true">*</span></label>
                <input id="f-doc" className={inputClass('doc')} inputMode="numeric"
                  placeholder={tipo === 'PF' ? '000.000.000-00' : '00.000.000/0000-00'}
                  value={form.doc} onChange={(e) => set('doc', tipo === 'PF' ? maskCPF(e.target.value) : maskCNPJ(e.target.value))}
                  onBlur={() => blur('doc')} aria-required="true"
                  aria-invalid={!!erros.doc} aria-describedby={erros.doc ? 'err-doc' : undefined} />
                {tocados.doc && erros.doc && <span id="err-doc" className="sys-field-error" role="alert">{erros.doc}</span>}
              </div>

              {tipo === 'PJ' && (
                <div className="cli-field">
                  <label htmlFor="f-ie">Inscrição Estadual <span aria-hidden="true">*</span></label>
                  <input id="f-ie" className={inputClass('ie')} placeholder="Isento ou Nº"
                    value={form.ie} onChange={(e) => set('ie', e.target.value)}
                    onBlur={() => blur('ie')} aria-required="true"
                    aria-invalid={!!erros.ie} aria-describedby={erros.ie ? 'err-ie' : undefined} />
                  {tocados.ie && erros.ie && <span id="err-ie" className="sys-field-error" role="alert">{erros.ie}</span>}
                </div>
              )}

              <div className="cli-field">
                <label htmlFor="f-email">E-mail <span aria-hidden="true">*</span></label>
                <input id="f-email" className={inputClass('email')} type="email" placeholder="cliente@email.com"
                  value={form.email} onChange={(e) => set('email', e.target.value)}
                  onBlur={() => blur('email')} aria-required="true"
                  aria-invalid={!!erros.email} aria-describedby={erros.email ? 'err-email' : undefined} />
                {tocados.email && erros.email && <span id="err-email" className="sys-field-error" role="alert">{erros.email}</span>}
              </div>

              <div className="cli-field">
                <label htmlFor="f-tel">Telefone / WhatsApp <span aria-hidden="true">*</span></label>
                <input id="f-tel" className={inputClass('tel')} inputMode="numeric" placeholder="(00) 00000-0000"
                  value={form.tel} onChange={(e) => set('tel', maskTel(e.target.value))}
                  onBlur={() => blur('tel')} aria-required="true"
                  aria-invalid={!!erros.tel} aria-describedby={erros.tel ? 'err-tel' : undefined} />
                {tocados.tel && erros.tel && <span id="err-tel" className="sys-field-error" role="alert">{erros.tel}</span>}
              </div>
            </div>

            <div className="cli-section-label">Dados do Veículo</div>
            <div className="cli-form-grid">
              <div className="cli-field">
                <label htmlFor="f-placa">Placa <span aria-hidden="true">*</span></label>
                <input id="f-placa" className={inputClass('placa')} placeholder="ABC1D23 ou ABC1234"
                  value={form.placa} onChange={(e) => set('placa', maskPlaca(e.target.value))}
                  onBlur={() => blur('placa')} aria-required="true"
                  aria-invalid={!!erros.placa} aria-describedby={erros.placa ? 'err-placa' : undefined} />
                {tocados.placa && erros.placa && <span id="err-placa" className="sys-field-error" role="alert">{erros.placa}</span>}
              </div>
              <div className="cli-field">
                <label htmlFor="f-marca">Marca <span aria-hidden="true">*</span></label>
                <input id="f-marca" className={inputClass('marca')} placeholder="Ex: Chevrolet, Toyota"
                  value={form.marca} onChange={(e) => set('marca', e.target.value)}
                  onBlur={() => blur('marca')} aria-required="true"
                  aria-invalid={!!erros.marca} aria-describedby={erros.marca ? 'err-marca' : undefined} />
                {tocados.marca && erros.marca && <span id="err-marca" className="sys-field-error" role="alert">{erros.marca}</span>}
              </div>
              <div className="cli-field">
                <label htmlFor="f-modelo">Modelo <span aria-hidden="true">*</span></label>
                <input id="f-modelo" className={inputClass('modelo')} placeholder="Ex: Onix, Corolla"
                  value={form.modelo} onChange={(e) => set('modelo', e.target.value)}
                  onBlur={() => blur('modelo')} aria-required="true"
                  aria-invalid={!!erros.modelo} aria-describedby={erros.modelo ? 'err-modelo' : undefined} />
                {tocados.modelo && erros.modelo && <span id="err-modelo" className="sys-field-error" role="alert">{erros.modelo}</span>}
              </div>
              <div className="cli-field">
                <label htmlFor="f-ano">Ano de Fabricação <span aria-hidden="true">*</span></label>
                <input id="f-ano" className={inputClass('ano')} type="number" placeholder="Ex: 2022"
                  value={form.ano} onChange={(e) => set('ano', e.target.value)}
                  onBlur={() => blur('ano')} aria-required="true"
                  aria-invalid={!!erros.ano} aria-describedby={erros.ano ? 'err-ano' : undefined} />
                {tocados.ano && erros.ano && <span id="err-ano" className="sys-field-error" role="alert">{erros.ano}</span>}
              </div>
            </div>

            <div className="cli-form-actions">
              <button type="button" className="sys-btn-ghost" onClick={() => navigate('/agendamentos')}>Cancelar</button>
              <button type="submit" className="sys-btn" disabled={salvando}
                aria-label="Salvar cadastro de cliente e veículo">
                {salvando ? <><span className="sys-btn-spinner" aria-hidden="true" /> Salvando…</> : 'Salvar Cadastro'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ABA: LISTA */}
      {aba === 'lista' && (
        <div id="tabpanel-lista" role="tabpanel" aria-label="Lista de clientes">
          <div className="sys-filters" role="search" aria-label="Filtros de clientes">
            <div className="sys-filter-group">
              <label htmlFor="busca-nome">Buscar por Nome</label>
              <input id="busca-nome" className="sys-input" placeholder="Nome do cliente…"
                value={busca} onChange={(e) => setBusca(e.target.value)} />
            </div>
            <div className="sys-filter-group">
              <label htmlFor="filtro-tipo">Tipo</label>
              <select id="filtro-tipo" className="sys-select" value={filtroTipo}
                onChange={(e) => setFTip(e.target.value)} aria-label="Filtrar por tipo de cliente">
                <option value="">Todos</option>
                <option value="PF">Pessoa Física</option>
                <option value="PJ">Pessoa Jurídica</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 8, alignSelf: 'flex-end' }}>
              <button className="sys-btn" onClick={() => carregarClientes(0, busca, filtroTipo)}
                disabled={carregando} aria-label="Buscar clientes">
                {carregando ? <><span className="sys-btn-spinner" aria-hidden="true" /> Buscando</> : 'Buscar'}
              </button>
              <button className="sys-btn-ghost" aria-label="Limpar filtros"
                onClick={() => { setBusca(''); setFTip(''); carregarClientes(0, '', ''); }}>
                Limpar
              </button>
            </div>
          </div>

          <div className="sys-table-wrap" role="region" aria-label="Lista de clientes" aria-live="polite" aria-busy={carregando}>
            {carregando ? (
              <SkeletonTable rows={8} cols={6} />
            ) : clientes.length === 0 ? (
              <div className="sys-empty">
                <div className="sys-empty-icon">👥</div>
                <p className="sys-empty-title">Nenhum cliente encontrado</p>
                <p>Tente ajustar a busca ou cadastre um novo cliente.</p>
              </div>
            ) : (
              <>
                <table className="sys-table" aria-label="Clientes cadastrados">
                  <thead>
                    <tr>
                      <th scope="col">ID</th><th scope="col">Nome</th><th scope="col">Tipo</th>
                      <th scope="col">CPF / CNPJ</th><th scope="col">E-mail</th><th scope="col">Telefone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientes.map((c) => (
                      <tr key={c.id}>
                        <td><strong>#{c.id}</strong></td>
                        <td>{c.nome}</td>
                        <td><span className={`sys-badge ${c.tipo === 'PF' ? 'pf' : 'pj'}`}>{c.tipo}</span></td>
                        <td>{c.cpf ? maskCPF(c.cpf) : c.cnpj ? maskCNPJ(c.cnpj) : '—'}</td>
                        <td>{c.email}</td>
                        <td>{c.telefone ? maskTel(c.telefone) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="sys-pagination" role="navigation" aria-label="Paginação de clientes">
                  <button className="sys-btn-ghost" aria-label="Página anterior"
                    onClick={() => carregarClientes(pagina - 1, busca, filtroTipo)}
                    disabled={pagina === 0 || carregando}>← Anterior</button>
                  <span aria-live="polite">Página {pagina + 1} de {totalPag || 1}</span>
                  <button className="sys-btn-ghost" aria-label="Próxima página"
                    onClick={() => carregarClientes(pagina + 1, busca, filtroTipo)}
                    disabled={pagina >= totalPag - 1 || carregando}>Próxima →</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </SystemLayout>
  );
}
