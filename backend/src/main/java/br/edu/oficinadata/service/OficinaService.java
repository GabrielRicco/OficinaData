package br.edu.oficinadata.service;

import br.edu.oficinadata.dto.ApiDtos.*;
import br.edu.oficinadata.entity.*;
import br.edu.oficinadata.exception.ApiException;
import br.edu.oficinadata.repository.*;
import jakarta.persistence.EntityManager;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OficinaService {
    private final ClienteRepository clientes;
    private final VeiculoRepository veiculos;
    private final AgendamentoRepository agendamentos;
    private final TipoServicoRepository tiposServico;
    private final FuncionarioRepository funcionarios;
    private final PecaRepository pecas;
    private final ItemServicoRepository itensServico;
    private final ItemPecaRepository itensPeca;
    private final PagamentoRepository pagamentos;
    private final AvaliacaoRepository avaliacoes;
    private final EntityManager entityManager;

    public OficinaService(ClienteRepository clientes, VeiculoRepository veiculos, AgendamentoRepository agendamentos,
                          TipoServicoRepository tiposServico, FuncionarioRepository funcionarios, PecaRepository pecas,
                          ItemServicoRepository itensServico, ItemPecaRepository itensPeca,
                          PagamentoRepository pagamentos, AvaliacaoRepository avaliacoes, EntityManager entityManager) {
        this.clientes = clientes;
        this.veiculos = veiculos;
        this.agendamentos = agendamentos;
        this.tiposServico = tiposServico;
        this.funcionarios = funcionarios;
        this.pecas = pecas;
        this.itensServico = itensServico;
        this.itensPeca = itensPeca;
        this.pagamentos = pagamentos;
        this.avaliacoes = avaliacoes;
        this.entityManager = entityManager;
    }

    @Transactional
    public ClienteResponse criarCliente(ClienteRequest request) {
        validarDocumentoCliente(request.cpf(), request.cnpj());
        Cliente cliente = new Cliente();
        aplicarCliente(cliente, request);
        return toClienteResponse(clientes.save(cliente));
    }

    @Transactional(readOnly = true)
    public ClienteResponse buscarCliente(Integer id) {
        return toClienteResponse(clientes.findDetalhadoById(id).orElseThrow(() -> ApiException.notFound("Cliente nao encontrado")));
    }

    @Transactional(readOnly = true)
    public Page<ClienteResponse> listarClientes(String nome, String tipo, Pageable pageable) {
        return clientes.buscar(nome, normalizarTipo(tipo), pageable).map(this::toClienteResponse);
    }

    @Transactional
    public ClienteResponse atualizarCliente(Integer id, ClienteRequest request) {
        validarDocumentoCliente(request.cpf(), request.cnpj());
        Cliente cliente = clientes.findById(id).orElseThrow(() -> ApiException.notFound("Cliente nao encontrado"));
        aplicarCliente(cliente, request);
        return toClienteResponse(cliente);
    }

    @Transactional
    public VeiculoResponse criarVeiculo(VeiculoRequest request) {
        Veiculo veiculo = new Veiculo();
        veiculo.cliente = clientes.findById(request.clienteId()).orElseThrow(() -> ApiException.notFound("Cliente nao encontrado"));
        veiculo.placa = placaBanco(request.placa());
        veiculo.marca = request.marca();
        veiculo.modelo = request.modelo();
        veiculo.ano = request.ano();
        return toVeiculoResponse(veiculos.save(veiculo));
    }

    @Transactional(readOnly = true)
    public VeiculoResponse buscarVeiculoPorPlaca(String placa) {
        return toVeiculoResponse(veiculos.findByPlacaIgnoreCase(placaBanco(placa)).orElseThrow(() -> ApiException.notFound("Veiculo nao encontrado")));
    }

    @Transactional
    public AgendamentoResponse abrirAgendamento(AgendamentoRequest request) {
        Agendamento agendamento = new Agendamento();
        agendamento.veiculo = veiculos.findById(request.veiculoId()).orElseThrow(() -> ApiException.notFound("Veiculo nao encontrado"));
        agendamento.status = "Agendado";
        agendamento.kmEntrada = request.kmEntrada();
        Agendamento salvo = agendamentos.save(agendamento);
        agendamentos.flush();
        entityManager.clear();
        return toAgendamentoResponse(getAgendamento(salvo.id));
    }

    @Transactional
    public AgendamentoResponse atualizarStatus(Integer id, StatusRequest request) {
        Agendamento agendamento = getAgendamento(id);
        if (!List.of("Agendado", "Em andamento", "Concluído", "Cancelado", "No-show").contains(request.status())) {
            throw ApiException.unprocessable("Status invalido para OS");
        }
        agendamento.status = request.status();
        agendamento.kmSaida = request.kmSaida();
        if ("Concluído".equals(request.status()) && agendamento.dataConclusao == null) {
            agendamento.dataConclusao = OffsetDateTime.now();
        }
        return toAgendamentoResponse(agendamento);
    }

    @Transactional(readOnly = true)
    public Page<AgendamentoResumo> listarAgendamentos(String status, java.time.LocalDate data, Pageable pageable) {
        return agendamentos.buscarResumos(status, data, pageable).map(p ->
                new AgendamentoResumo(p.getId(), p.getCliente(), p.getVeiculo(), p.getPlaca(), p.getStatus(),
                        toOffsetDateTime(p.getDataAbertura()), toOffsetDateTime(p.getDataConclusao()), p.getTotalGeral()));
    }

    @Transactional(readOnly = true)
    public AgendamentoDetalheResponse detalharAgendamento(Integer id) {
        Agendamento agendamento = getAgendamento(id);
        List<ItemServicoResponse> servicos = itensServico.findByAgendamentoIdOrderById(id).stream()
                .map(this::toItemServicoResponse).toList();
        List<ItemPecaResponse> pecasOs = itensPeca.findByAgendamentoIdOrderById(id).stream()
                .map(this::toItemPecaResponse).toList();
        List<PagamentoResponse> pagamentosOs = pagamentos.findByAgendamentoIdOrderByDataPagamentoDesc(id).stream()
                .map(p -> new PagamentoResponse(p.id, p.formaPagamento, p.valor, p.parcelas, p.dataPagamento)).toList();
        AvaliacaoResponse avaliacao = avaliacoes.findByAgendamentoId(id).map(a ->
                new AvaliacaoResponse(a.id, a.nota, a.comentario, a.dataAvaliacao)).orElse(null);

        Veiculo v = agendamento.veiculo;
        return new AgendamentoDetalheResponse(agendamento.id, v.id, v.cliente.nome, v.marca + " " + v.modelo, v.placa,
                agendamento.status, agendamento.kmEntrada, agendamento.kmSaida, agendamento.dataAbertura,
                agendamento.dataConclusao, agendamento.totalServicos, agendamento.totalPecas, agendamento.totalGeral,
                servicos, pecasOs, pagamentosOs, avaliacao);
    }

    @Transactional
    public AgendamentoResponse adicionarServico(Integer agendamentoId, ItemServicoRequest request) {
        Agendamento agendamento = validarOsAberta(agendamentoId);
        TipoServico tipo = tiposServico.findById(request.tipoServicoId()).orElseThrow(() -> ApiException.notFound("Tipo de servico nao encontrado"));
        Funcionario funcionario = funcionarios.findById(request.funcionarioId()).orElseThrow(() -> ApiException.notFound("Funcionario nao encontrado"));
        ItemServico item = new ItemServico();
        item.agendamento = agendamento;
        item.tipoServico = tipo;
        item.funcionario = funcionario;
        item.quantidade = request.quantidade();
        item.precoUnitario = request.precoUnitario() == null ? tipo.precoBase : request.precoUnitario();
        item.desconto = request.desconto() == null ? BigDecimal.ZERO : request.desconto();
        itensServico.save(item);
        agendamentos.flush();
        entityManager.clear();
        return toAgendamentoResponse(getAgendamento(agendamentoId));
    }

    @Transactional
    public AgendamentoResponse adicionarPeca(Integer agendamentoId, ItemPecaRequest request) {
        Agendamento agendamento = validarOsAberta(agendamentoId);
        Peca peca = pecas.findById(request.pecaId()).orElseThrow(() -> ApiException.notFound("Peca nao encontrada"));
        if (peca.quantidadeEstoque < request.quantidade()) {
            throw ApiException.conflict("Estoque insuficiente para a peca informada");
        }
        peca.quantidadeEstoque -= request.quantidade();
        ItemPeca item = new ItemPeca();
        item.agendamento = agendamento;
        item.peca = peca;
        item.quantidade = request.quantidade();
        item.precoUnitario = request.precoUnitario() == null ? peca.precoUnitario : request.precoUnitario();
        item.desconto = request.desconto() == null ? BigDecimal.ZERO : request.desconto();
        itensPeca.save(item);
        agendamentos.flush();
        entityManager.clear();
        return toAgendamentoResponse(getAgendamento(agendamentoId));
    }

    @Transactional
    public void registrarPagamento(Integer agendamentoId, PagamentoRequest request) {
        Agendamento agendamento = getAgendamento(agendamentoId);
        Pagamento pagamento = new Pagamento();
        pagamento.agendamento = agendamento;
        pagamento.formaPagamento = request.formaPagamento();
        pagamento.valor = request.valor();
        pagamento.parcelas = request.parcelas();
        pagamentos.save(pagamento);
    }

    @Transactional
    public void registrarAvaliacao(Integer agendamentoId, AvaliacaoRequest request) {
        if (avaliacoes.existsByAgendamentoId(agendamentoId)) {
            throw ApiException.conflict("Esta OS ja possui avaliacao registrada");
        }
        Avaliacao avaliacao = new Avaliacao();
        avaliacao.agendamento = getAgendamento(agendamentoId);
        avaliacao.nota = request.nota();
        avaliacao.comentario = request.comentario();
        avaliacoes.save(avaliacao);
    }

    @Transactional
    public FuncionarioResponse criarFuncionario(FuncionarioRequest request) {
        Funcionario f = new Funcionario();
        f.nome = request.nome();
        f.cargo = request.cargo();
        f.salario = request.salario();
        f.dataAdmissao = request.dataAdmissao();
        Funcionario salvo = funcionarios.save(f);
        return new FuncionarioResponse(salvo.id, salvo.nome, salvo.cargo, salvo.salario, salvo.dataAdmissao);
    }

    @Transactional(readOnly = true)
    public List<FuncionarioResponse> listarFuncionarios() {
        return funcionarios.findAll(Sort.by("nome")).stream().map(this::toFuncionarioResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<TipoServicoResponse> listarTiposServico() {
        return tiposServico.findAll(Sort.by("descricao")).stream()
                .map(t -> new TipoServicoResponse(t.id, t.descricao, t.precoBase, t.tempoEstimadoMin)).toList();
    }

    @Transactional(readOnly = true)
    public Page<PecaResponse> listarPecas(String nome, String fornecedor, BigDecimal precoMin, BigDecimal precoMax, Pageable pageable) {
        return pecas.buscar(blankToNull(nome), blankToNull(fornecedor), precoMin, precoMax, pageable).map(this::toPecaResponse);
    }

    @Transactional(readOnly = true)
    public List<VeiculoResumo> listarVeiculosDoCliente(Integer clienteId) {
        if (!clientes.existsById(clienteId)) {
            throw ApiException.notFound("Cliente nao encontrado");
        }
        return veiculos.findByClienteIdOrderByMarcaAscModeloAsc(clienteId).stream()
                .map(v -> new VeiculoResumo(v.id, v.placa, v.marca, v.modelo, v.ano)).toList();
    }

    private Agendamento validarOsAberta(Integer id) {
        Agendamento agendamento = getAgendamento(id);
        if (!List.of("Agendado", "Em andamento").contains(agendamento.status)) {
            throw ApiException.unprocessable("Itens so podem ser adicionados a OS em aberto");
        }
        return agendamento;
    }

    private Agendamento getAgendamento(Integer id) {
        return agendamentos.findDetalhadoById(id).orElseThrow(() -> ApiException.notFound("Agendamento nao encontrado"));
    }

    private void aplicarCliente(Cliente cliente, ClienteRequest request) {
        cliente.nome = request.nome();
        cliente.email = request.email();
        cliente.telefone = request.telefone();
        cliente.cpf = request.cpf();
        cliente.cnpj = request.cnpj();
    }

    private void validarDocumentoCliente(String cpf, String cnpj) {
        if ((cpf == null || cpf.isBlank()) == (cnpj == null || cnpj.isBlank())) {
            throw ApiException.unprocessable("Informe CPF ou CNPJ, nunca ambos");
        }
    }

    private String placaBanco(String placa) {
        return placa == null ? null : placa.replace("-", "").replace(" ", "").toUpperCase();
    }

    private String normalizarTipo(String tipo) {
        if (tipo == null || tipo.isBlank()) return null;
        String t = tipo.toUpperCase();
        if (!t.equals("PF") && !t.equals("PJ")) throw ApiException.unprocessable("Tipo deve ser PF ou PJ");
        return t;
    }

    public ClienteResponse toClienteResponse(Cliente c) {
        String tipo = c.cpf != null ? "PF" : "PJ";
        List<VeiculoResumo> vs = c.veiculos == null ? List.of() : c.veiculos.stream()
                .map(v -> new VeiculoResumo(v.id, v.placa, v.marca, v.modelo, v.ano)).toList();
        return new ClienteResponse(c.id, c.nome, c.email, c.telefone, tipo, c.cpf, c.cnpj, c.dataCadastro, vs);
    }

    public VeiculoResponse toVeiculoResponse(Veiculo v) {
        List<AgendamentoResumo> historico = v.agendamentos == null ? List.of() : v.agendamentos.stream().map(this::toAgendamentoResumo).toList();
        return new VeiculoResponse(v.id, v.cliente.id, v.cliente.nome, v.placa, v.marca, v.modelo, v.ano, historico);
    }

    public AgendamentoResumo toAgendamentoResumo(Agendamento a) {
        Veiculo v = a.veiculo;
        return new AgendamentoResumo(a.id, v.cliente.nome, v.marca + " " + v.modelo, v.placa,
                a.status, a.dataAbertura, a.dataConclusao, a.totalGeral);
    }

    public AgendamentoResponse toAgendamentoResponse(Agendamento a) {
        Veiculo v = a.veiculo;
        return new AgendamentoResponse(a.id, v.id, v.cliente.nome, v.marca + " " + v.modelo, v.placa,
                a.status, a.kmEntrada, a.kmSaida, a.dataAbertura, a.dataConclusao,
                a.totalServicos, a.totalPecas, a.totalGeral);
    }

    private ItemServicoResponse toItemServicoResponse(ItemServico item) {
        return new ItemServicoResponse(item.id, item.tipoServico.id, item.tipoServico.descricao,
                item.funcionario.id, item.funcionario.nome, item.quantidade, item.precoUnitario,
                item.desconto, item.total);
    }

    private ItemPecaResponse toItemPecaResponse(ItemPeca item) {
        return new ItemPecaResponse(item.id, item.peca.id, item.peca.nome, item.quantidade,
                item.precoUnitario, item.desconto, item.total);
    }

    private FuncionarioResponse toFuncionarioResponse(Funcionario f) {
        return new FuncionarioResponse(f.id, f.nome, f.cargo, f.salario, f.dataAdmissao);
    }

    private PecaResponse toPecaResponse(Peca p) {
        return new PecaResponse(p.id, p.nome, p.fornecedor, p.precoUnitario, p.quantidadeEstoque, p.quantidadeMinima);
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }

    private OffsetDateTime toOffsetDateTime(java.time.Instant instant) {
        return instant == null ? null : instant.atOffset(java.time.ZoneOffset.UTC);
    }
}
