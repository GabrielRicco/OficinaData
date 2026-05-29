import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Clientes.css'; // Conexão com o arquivo de estilos separados
import { cadastrarCliente, cadastrarVeiculo } from '../../services/clienteService';

function Clientes() {
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
      navigate('/agendamentos');
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="clientes-container">
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
    </div>
  );
}

export default Clientes;
