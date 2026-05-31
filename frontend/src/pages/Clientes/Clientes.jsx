import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Clientes.css'; // Conexão com o arquivo de estilos separados
import { cadastrarCliente, cadastrarVeiculo, listarClientes } from '../../services/clienteService';

function Clientes() {
  // Estado para controlar abas: 'novo' ou 'lista'
  const [abaSelecionada, setAbaSelecionada] = useState('novo');

  // Estado para controlar se é Pessoa Física (PF) ou Pessoa Jurídica (PJ)
  const [tipoCliente, setTipoCliente] = useState('PF');

  // Estados para os dados do Cliente
  const [nome, setNome] = useState('');
  const [documento, setDocumento] = useState(''); // Vai guardar CPF ou CNPJ
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [inscricaoEstadual, setInscricaoEstadual] = useState(''); // Apenas para PJ

  // Estados para os dados do primeiro Veículo vinculado
  const [placa, setPlaca] = useState('');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [ano, setAno] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);
  const navigate = useNavigate();

  // Estados para Lista de Clientes
  const [clientes, setClientes] = useState([]);
  const [buscaNome, setBuscaNome] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [carregandoLista, setCarregandoLista] = useState(false);
  const [erroLista, setErroLista] = useState('');

  // Função para carregar lista de clientes
  const carregarClientes = async (page = 0, nome = buscaNome, tipo = filtroTipo) => {
    setCarregandoLista(true);
    setErroLista('');
    try {
      const resultado = await listarClientes({
        nome: nome.trim(),
        tipo: tipo || undefined,
        page,
        size: 10
      });
      setClientes(resultado.content || []);
      setTotalPages(resultado.totalPages || 0);
      setPaginaAtual(page);
    } catch (error) {
      setErroLista(error.message || 'Erro ao carregar clientes');
    } finally {
      setCarregandoLista(false);
    }
  };

  // Efeito para carregar lista ao entrar na aba 'lista'
  useEffect(() => {
    if (abaSelecionada === 'lista') {
      carregarClientes(0, '', '');
    }
  }, [abaSelecionada]);

  // Handlers para busca e filtro
  const handleBuscar = () => {
    carregarClientes(0, buscaNome, filtroTipo);
  };

  const handleLimparFiltros = () => {
    setBuscaNome('');
    setFiltroTipo('');
    carregarClientes(0, '', '');
  };

  const proximaPagina = () => {
    if (paginaAtual < totalPages - 1) {
      carregarClientes(paginaAtual + 1, buscaNome, filtroTipo);
    }
  };

  const paginaAnterior = () => {
    if (paginaAtual > 0) {
      carregarClientes(paginaAtual - 1, buscaNome, filtroTipo);
    }
  };

  const lidarComCadastro = async (e) => {
    e.preventDefault();
    setErro('');
    setSalvando(true);

    const numerosDocumento = documento.replace(/\D/g, '');
    const clientePayload = {
      nome,
      email,
      telefone: telefone.replace(/\D/g, ''),
      cpf: tipoCliente === 'PF' ? numerosDocumento : null,
      cnpj: tipoCliente === 'PJ' ? numerosDocumento : null
    };

    try {
      const cliente = await cadastrarCliente(clientePayload);
      await cadastrarVeiculo({
        clienteId: cliente.id,
        placa: placa.replace(/[^a-zA-Z0-9]/g, '').toUpperCase(),
        marca,
        modelo,
        ano: Number(ano)
      });
      alert(`Cliente ${nome} e veículo de placa ${placa} cadastrados com sucesso!`);
      // Limpar formulário
      setNome('');
      setDocumento('');
      setEmail('');
      setTelefone('');
      setInscricaoEstadual('');
      setPlaca('');
      setMarca('');
      setModelo('');
      setAno('');
      // Ir para aba de lista
      setAbaSelecionada('lista');
      carregarClientes(0, '', '');
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="clientes-container">
      {/* NAVEGAÇÃO ENTRE ABAS */}
      <div className="clientes-tabs">
        <button 
          className={`tab-botao ${abaSelecionada === 'novo' ? 'ativo' : ''}`}
          onClick={() => setAbaSelecionada('novo')}
        >
          ➕ Novo Cadastro
        </button>
        <button 
          className={`tab-botao ${abaSelecionada === 'lista' ? 'ativo' : ''}`}
          onClick={() => setAbaSelecionada('lista')}
        >
          📋 Lista de Clientes
        </button>
      </div>

      {/* ABA 1: NOVO CADASTRO */}
      {abaSelecionada === 'novo' && (
      <div className="clientes-card">
        <h2 className="clientes-title">🚗 Novo Cadastro</h2>
        <p className="clientes-subtitle">Insira os dados do cliente e do veículo para liberar a Ordem de Serviço</p>

        {/* Abas de seleção dinâmica: Muda o comportamento do formulário */}
        <div className="tipo-cliente-selector">
          <button 
            type="button" 
            className={`aba-botao ${tipoCliente === 'PF' ? 'ativo' : ''}`}
            onClick={() => { setTipoCliente('PF'); setDocumento(''); }}
          >
            Pessoa Física (CPF)
          </button>
          <button 
            type="button" 
            className={`aba-botao ${tipoCliente === 'PJ' ? 'ativo' : ''}`}
            onClick={() => { setTipoCliente('PJ'); setDocumento(''); }}
          >
            Pessoa Jurídica (CNPJ)
          </button>
        </div>

        <form onSubmit={lidarComCadastro}>
          
          {/* SEÇÃO 1: DADOS DO CLIENTE */}
          <div className="secao-titulo">Informações do Cliente</div>
          <div className="form-grid">
            
            <div className="campo-grupo grid-full">
              <label>{tipoCliente === 'PF' ? 'Nome Completo:' : 'Razão Social / Nome da Empresa:'}</label>
              <input 
                type="text" 
                className="campo-input" 
                placeholder={tipoCliente === 'PF' ? "Ex: João da Silva" : "Ex: Oficina do Mecânico LTDA"} 
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required 
              />
            </div>

            <div className="campo-grupo">
              <label>{tipoCliente === 'PF' ? 'CPF:' : 'CNPJ:'}</label>
              <input 
                type="text" 
                className="campo-input" 
                placeholder={tipoCliente === 'PF' ? "000.000.000-00" : "00.000.000/0000-00"} 
                value={documento}
                onChange={(e) => setDocumento(e.target.value)}
                required 
              />
            </div>

            {/* Campo condicional: Só aparece se for Pessoa Jurídica (Regra do Banco!) */}
            {tipoCliente === 'PJ' && (
              <div className="campo-grupo">
                <label>Inscrição Estadual:</label>
                <input 
                  type="text" 
                  className="campo-input" 
                  placeholder="Isento ou Nº" 
                  value={inscricaoEstadual}
                  onChange={(e) => setInscricaoEstadual(e.target.value)}
                  required 
                />
              </div>
            )}

            <div className="campo-grupo">
              <label>E-mail:</label>
              <input 
                type="email" 
                className="campo-input" 
                placeholder="cliente@email.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>

            <div className="campo-grupo">
              <label>Telefone / WhatsApp:</label>
              <input 
                type="tel" 
                className="campo-input" 
                placeholder="(00) 00000-0000" 
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                required 
              />
            </div>

          </div>

          {/* SEÇÃO 2: DADOS DO VEÍCULO VINCULADO */}
          <div className="secao-titulo">Dados do Veículo</div>
          <div className="form-grid">
            
            <div className="campo-grupo">
              <label>Placa (Padrão Antigo ou Mercosul):</label>
              <input 
                type="text" 
                className="campo-input" 
                placeholder="ABC1D23 ou ABC-1234" 
                value={placa}
                onChange={(e) => setPlaca(e.target.value).toUpperCase()} // Sempre em letras maiúsculas
                required 
              />
            </div>

            <div className="campo-grupo">
              <label>Marca:</label>
              <input 
                type="text" 
                className="campo-input" 
                placeholder="Ex: Chevrolet, Toyota" 
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                required 
              />
            </div>

            <div className="campo-grupo">
              <label>Modelo:</label>
              <input 
                type="text" 
                className="campo-input" 
                placeholder="Ex: Onix, Corolla" 
                value={modelo}
                onChange={(e) => setModelo(e.target.value)}
                required 
              />
            </div>

            <div className="campo-grupo">
              <label>Ano de Fabricação:</label>
              <input 
                type="number" 
                className="campo-input" 
                placeholder="Ex: 2022" 
                value={ano}
                onChange={(e) => setAno(e.target.value)}
                required 
              />
            </div>

          </div>

          {/* BOTÕES DE SALVAMENTO */}
          <div className="acoes-container">
            {erro && <p className="form-error">{erro}</p>}
            <button 
              type="button" 
              className="btn-cancelar"
              onClick={() => navigate('/agendamentos')}
            >
              Cancelar
            </button>
            <button type="submit" className="btn-salvar" disabled={salvando}>
              {salvando ? 'Salvando...' : 'Salvar Cadastro'}
            </button>
          </div>

        </form>
      </div>
      )}

      {/* ABA 2: LISTA DE CLIENTES */}
      {abaSelecionada === 'lista' && (
      <div className="clientes-card">
        <h2 className="clientes-title">📋 Lista de Clientes</h2>
        <p className="clientes-subtitle">Gerencie e busque clientes cadastrados no sistema</p>

        {/* FILTROS E BUSCA */}
        <div className="filtros-container">
          <div className="campo-grupo">
            <label>Buscar por Nome:</label>
            <input 
              type="text" 
              className="campo-input" 
              placeholder="Digite o nome do cliente..." 
              value={buscaNome}
              onChange={(e) => setBuscaNome(e.target.value)}
            />
          </div>

          <div className="campo-grupo">
            <label>Filtrar por Tipo:</label>
            <select 
              className="campo-input" 
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
            >
              <option value="">Todos os Tipos</option>
              <option value="PF">Pessoa Física (CPF)</option>
              <option value="PJ">Pessoa Jurídica (CNPJ)</option>
            </select>
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

        {/* MENSAGENS DE ERRO */}
        {erroLista && <p className="form-error">{erroLista}</p>}

        {/* TABELA DE CLIENTES */}
        <div className="tabela-card">
          {carregandoLista ? (
            <p className="carregando">⏳ Carregando clientes...</p>
          ) : clientes.length === 0 ? (
            <p className="sem-dados">Nenhum cliente encontrado com os filtros aplicados.</p>
          ) : (
            <>
              <table className="tabela-oficina">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>Tipo</th>
                    <th>CPF/CNPJ</th>
                    <th>Email</th>
                    <th>Telefone</th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.map((cliente) => (
                    <tr key={cliente.id}>
                      <td><strong>#{cliente.id}</strong></td>
                      <td>{cliente.nome}</td>
                      <td>
                        <span className={`badge-tipo ${cliente.tipo === 'PF' ? 'pf' : 'pj'}`}>
                          {cliente.tipo === 'PF' ? 'PF' : 'PJ'}
                        </span>
                      </td>
                      <td>{cliente.cpf || cliente.cnpj || '-'}</td>
                      <td>{cliente.email}</td>
                      <td>{cliente.telefone}</td>
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

        {/* BOTÃO VOLTAR */}
        <div className="acoes-container">
          <button 
            type="button" 
            className="btn-cancelar"
            onClick={() => navigate('/agendamentos')}
          >
            ← Voltar para Agendamentos
          </button>
        </div>
      </div>
      )}
    </div>
  );
}

export default Clientes;
