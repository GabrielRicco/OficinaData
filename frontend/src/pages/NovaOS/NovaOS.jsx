import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SystemLayout from '../../components/SystemLayout';
import { SkeletonTable } from '../../components/Skeleton';
import { useToast } from '../../components/Toast';
import { listarClientes, listarVeiculosDoCliente } from '../../services/clienteService';
import { abrirAgendamento } from '../../services/agendamentoService';
import './NovaOS.css';

const maskCPF = (n) => `${n.slice(0,3)}.${n.slice(3,6)}.${n.slice(6,9)}-${n.slice(9)}`;
const maskCNPJ = (n) => `${n.slice(0,2)}.${n.slice(2,5)}.${n.slice(5,8)}/${n.slice(8,12)}-${n.slice(12)}`;
const docCliente = (c) => (c.cpf ? maskCPF(c.cpf) : c.cnpj ? maskCNPJ(c.cnpj) : '—');

export default function NovaOS() {
  const navigate = useNavigate();
  const toast = useToast();

  const [busca, setBusca]       = useState('');
  const [clientes, setClientes] = useState([]);
  const [buscou, setBuscou]     = useState(false);
  const [buscando, setBuscando] = useState(false);

  const [clienteSel, setClienteSel] = useState(null);
  const [veiculos, setVeiculos]     = useState([]);
  const [carrVeic, setCarrVeic]     = useState(false);

  const [veiculoSel, setVeiculoSel] = useState(null);
  const [kmEntrada, setKmEntrada]   = useState('');
  const [salvando, setSalvando]     = useState(false);

  const kmValido = kmEntrada !== '' && Number(kmEntrada) >= 0 && Number.isInteger(Number(kmEntrada));
  const podeAbrir = !!veiculoSel && kmValido && !salvando;

  const buscar = async () => {
    if (!busca.trim()) {
      toast.warning('Informe um nome para buscar.');
      return;
    }
    setBuscando(true);
    try {
      const r = await listarClientes({ nome: busca.trim(), page: 0, size: 10 });
      setClientes(r.content || []);
      setBuscou(true);
    } catch (e) { toast.error(e.message); }
    finally { setBuscando(false); }
  };

  const selecionarCliente = async (c) => {
    setClienteSel(c);
    setVeiculoSel(null);
    setKmEntrada('');
    setCarrVeic(true);
    try {
      setVeiculos(await listarVeiculosDoCliente(c.id));
    } catch (e) { toast.error(e.message); setVeiculos([]); }
    finally { setCarrVeic(false); }
  };

  const trocarCliente = () => {
    setClienteSel(null);
    setVeiculos([]);
    setVeiculoSel(null);
    setKmEntrada('');
  };

  const abrir = async () => {
    if (!podeAbrir) return;
    setSalvando(true);
    try {
      const os = await abrirAgendamento({ veiculoId: veiculoSel.id, kmEntrada: Number(kmEntrada) });
      toast.success(`O.S. #${os.id} aberta para ${clienteSel.nome} (${veiculoSel.placa}).`);
      navigate('/agendamentos');
    } catch (e) { toast.error(e.message); }
    finally { setSalvando(false); }
  };

  return (
    <SystemLayout>
      <div className="sys-page-header">
        <div>
          <h1 className="sys-page-title">Nova Ordem de Serviço</h1>
          <p className="sys-page-sub">Selecione o cliente e o veículo para abrir a O.S.</p>
        </div>
        <button className="sys-btn-ghost" onClick={() => navigate('/agendamentos')}
          aria-label="Voltar para a lista de ordens de serviço">← Voltar</button>
      </div>

      {/* Etapa 1 — Cliente */}
      <div className="sys-card nos-card">
        <div className="nos-step-head">
          <span className="nos-step-num">1</span>
          <h2 className="nos-step-title">Cliente</h2>
        </div>

        {!clienteSel ? (
          <>
            <div className="nos-busca" role="search" aria-label="Buscar cliente">
              <input className="sys-input" placeholder="Buscar cliente por nome…"
                value={busca} onChange={(e) => setBusca(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && buscar()}
                aria-label="Nome do cliente" />
              <button className="sys-btn" onClick={buscar} disabled={buscando}
                aria-label="Buscar cliente">
                {buscando ? <><span className="sys-btn-spinner" aria-hidden="true" /> Buscando</> : 'Buscar'}
              </button>
            </div>

            {buscando ? (
              <SkeletonTable rows={3} cols={3} />
            ) : buscou && clientes.length === 0 ? (
              <div className="sys-empty">
                <div className="sys-empty-icon">🔍</div>
                <p className="sys-empty-title">Nenhum cliente encontrado</p>
                <p>Revise o nome ou cadastre o cliente na tela de Clientes.</p>
                <button className="sys-btn" style={{ marginTop: 12 }}
                  onClick={() => navigate('/clientes')}>Ir para Clientes</button>
              </div>
            ) : clientes.length > 0 && (
              <ul className="nos-lista" aria-label="Resultados da busca">
                {clientes.map((c) => (
                  <li key={c.id}>
                    <button className="nos-item" onClick={() => selecionarCliente(c)}
                      aria-label={`Selecionar cliente ${c.nome}`}>
                      <div className="nos-item-main">
                        <strong>{c.nome}</strong>
                        <span className={`sys-badge ${c.tipo === 'PF' ? 'pf' : 'pj'}`}>{c.tipo}</span>
                      </div>
                      <span className="nos-item-sub">{docCliente(c)} · {c.email}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <div className="nos-selecionado">
            <div>
              <strong>{clienteSel.nome}</strong>
              <span className={`sys-badge ${clienteSel.tipo === 'PF' ? 'pf' : 'pj'}`} style={{ marginLeft: 8 }}>
                {clienteSel.tipo}
              </span>
              <p className="nos-item-sub">{docCliente(clienteSel)} · {clienteSel.email}</p>
            </div>
            <button className="sys-btn-ghost" onClick={trocarCliente} aria-label="Trocar cliente">Trocar</button>
          </div>
        )}
      </div>

      {/* Etapa 2 — Veículo */}
      {clienteSel && (
        <div className="sys-card nos-card">
          <div className="nos-step-head">
            <span className="nos-step-num">2</span>
            <h2 className="nos-step-title">Veículo</h2>
          </div>

          {carrVeic ? (
            <SkeletonTable rows={2} cols={2} />
          ) : veiculos.length === 0 ? (
            <div className="sys-empty">
              <div className="sys-empty-icon">🚗</div>
              <p className="sys-empty-title">Cliente sem veículo cadastrado</p>
              <p>Cadastre um veículo para este cliente antes de abrir a O.S.</p>
              <button className="sys-btn" style={{ marginTop: 12 }}
                onClick={() => navigate('/clientes')}>Cadastrar veículo</button>
            </div>
          ) : (
            <div className="nos-veiculos" role="radiogroup" aria-label="Selecione o veículo">
              {veiculos.map((v) => (
                <button key={v.id} role="radio" aria-checked={veiculoSel?.id === v.id}
                  className={`nos-veiculo ${veiculoSel?.id === v.id ? 'selected' : ''}`}
                  onClick={() => setVeiculoSel(v)}>
                  <span className="nos-veiculo-placa">{v.placa}</span>
                  <span className="nos-veiculo-modelo">{v.marca} {v.modelo}</span>
                  <span className="nos-item-sub">Ano {v.ano || '—'}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Etapa 3 — Km de entrada */}
      {clienteSel && veiculoSel && (
        <div className="sys-card nos-card">
          <div className="nos-step-head">
            <span className="nos-step-num">3</span>
            <h2 className="nos-step-title">Quilometragem de entrada</h2>
          </div>
          <div className="nos-km">
            <div className="cli-field">
              <label htmlFor="km">KM atual do veículo <span aria-hidden="true">*</span></label>
              <input id="km" className={`sys-input ${kmEntrada !== '' && !kmValido ? 'is-invalid' : ''}`}
                type="number" min="0" step="1" placeholder="Ex: 85000"
                value={kmEntrada} onChange={(e) => setKmEntrada(e.target.value)}
                aria-required="true" aria-invalid={kmEntrada !== '' && !kmValido} />
              {kmEntrada !== '' && !kmValido && (
                <span className="sys-field-error" role="alert">Informe um número inteiro maior ou igual a zero.</span>
              )}
            </div>
          </div>

          <div className="cli-form-actions">
            <button className="sys-btn-ghost" onClick={() => navigate('/agendamentos')}>Cancelar</button>
            <button className="sys-btn" onClick={abrir} disabled={!podeAbrir}
              aria-label="Abrir ordem de serviço">
              {salvando ? <><span className="sys-btn-spinner" aria-hidden="true" /> Abrindo…</> : 'Abrir O.S.'}
            </button>
          </div>
        </div>
      )}
    </SystemLayout>
  );
}
