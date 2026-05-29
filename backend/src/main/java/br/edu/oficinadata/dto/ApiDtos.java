package br.edu.oficinadata.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

public final class ApiDtos {
    private ApiDtos() {}

    public record LoginRequest(@Email @NotBlank String email, @NotBlank String senha) {}
    public record AuthResponse(String token, String refreshToken, String tipo, long expiresInSeconds, UsuarioResponse usuario) {}
    public record UsuarioResponse(Integer id, String nome, String email, String perfil) {}

    public record ClienteRequest(
            @NotBlank String nome,
            @Email @NotBlank String email,
            @Pattern(regexp = "\\d{10,11}") String telefone,
            @Pattern(regexp = "\\d{11}") String cpf,
            @Pattern(regexp = "\\d{14}") String cnpj) {}

    public record ClienteResponse(Integer id, String nome, String email, String telefone, String tipo, String cpf, String cnpj,
                                  OffsetDateTime dataCadastro, List<VeiculoResumo> veiculos) {}
    public record VeiculoResumo(Integer id, String placa, String marca, String modelo, Integer ano) {}

    public record VeiculoRequest(@NotNull Integer clienteId, @NotBlank String placa, @NotBlank String marca,
                                 @NotBlank String modelo, @Min(1900) Integer ano) {}
    public record VeiculoResponse(Integer id, Integer clienteId, String clienteNome, String placa, String marca, String modelo,
                                  Integer ano, List<AgendamentoResumo> historico) {}

    public record AgendamentoRequest(@NotNull Integer veiculoId, @NotNull @Min(0) Integer kmEntrada) {}
    public record StatusRequest(@NotBlank String status, @Min(0) Integer kmSaida) {}
    public record AgendamentoResumo(Integer id, String cliente, String veiculo, String placa, String status,
                                    OffsetDateTime dataAbertura, OffsetDateTime dataConclusao, BigDecimal totalGeral) {}
    public record AgendamentoResponse(Integer id, Integer veiculoId, String cliente, String veiculo, String placa, String status,
                                      Integer kmEntrada, Integer kmSaida, OffsetDateTime dataAbertura, OffsetDateTime dataConclusao,
                                      BigDecimal totalServicos, BigDecimal totalPecas, BigDecimal totalGeral) {}
    public record AgendamentoDetalheResponse(Integer id, Integer veiculoId, String cliente, String veiculo, String placa, String status,
                                             Integer kmEntrada, Integer kmSaida, OffsetDateTime dataAbertura, OffsetDateTime dataConclusao,
                                             BigDecimal totalServicos, BigDecimal totalPecas, BigDecimal totalGeral,
                                             List<ItemServicoResponse> servicos, List<ItemPecaResponse> pecas,
                                             List<PagamentoResponse> pagamentos, AvaliacaoResponse avaliacao) {}

    public record ItemServicoRequest(@NotNull Integer tipoServicoId, @NotNull Integer funcionarioId,
                                     @NotNull @Min(1) Integer quantidade, @DecimalMin("0.00") BigDecimal precoUnitario,
                                     @DecimalMin("0.00") @DecimalMax("100.00") BigDecimal desconto) {}
    public record ItemPecaRequest(@NotNull Integer pecaId, @NotNull @Min(1) Integer quantidade,
                                  @DecimalMin("0.00") BigDecimal precoUnitario,
                                  @DecimalMin("0.00") @DecimalMax("100.00") BigDecimal desconto) {}
    public record PagamentoRequest(@NotBlank String formaPagamento, @NotNull @DecimalMin("0.01") BigDecimal valor,
                                   @NotNull @Min(1) Integer parcelas) {}
    public record AvaliacaoRequest(@NotNull @Min(1) @Max(5) Integer nota, String comentario) {}
    public record ItemServicoResponse(Integer id, Integer tipoServicoId, String descricao, Integer funcionarioId,
                                      String funcionario, Integer quantidade, BigDecimal precoUnitario,
                                      BigDecimal desconto, BigDecimal total) {}
    public record ItemPecaResponse(Integer id, Integer pecaId, String nome, Integer quantidade,
                                   BigDecimal precoUnitario, BigDecimal desconto, BigDecimal total) {}
    public record PagamentoResponse(Integer id, String formaPagamento, BigDecimal valor, Integer parcelas,
                                    OffsetDateTime dataPagamento) {}
    public record AvaliacaoResponse(Integer id, Integer nota, String comentario, OffsetDateTime dataAvaliacao) {}

    public record ReceitaMensalResponse(String mes, Long qtdAgendamentos, BigDecimal receitaTotal, BigDecimal ticketMedio) {}
    public record RankingServicoResponse(Integer idTipoServico, String descricao, Long qtdExecucoes, BigDecimal faturamento) {}
    public record RankingFuncionarioResponse(Integer idFuncionario, String nome, Long qtdOs, BigDecimal faturamento) {}
    public record ClienteGastoResponse(Integer idCliente, String nome, String tipoCliente, BigDecimal gastoTotal) {}
    public record FormaPagamentoResponse(String formaPagamento, Long qtdTransacoes, BigDecimal valorTotal, BigDecimal percValor) {}
    public record PecaEstoqueResponse(Integer idPeca, String nome, Integer quantidadeEstoque, Integer quantidadeMinima,
                                      Integer deficit, String fornecedor) {}
    public record DashboardResponse(Long osAbertas, BigDecimal receitaDia, Long pecasEmAlerta, BigDecimal notaMedia) {}
    public record FuncionarioRequest(@NotBlank String nome, @NotBlank String cargo, @NotNull @DecimalMin("0.01") BigDecimal salario,
                                     @NotNull LocalDate dataAdmissao) {}
    public record FuncionarioResponse(Integer id, String nome, String cargo, BigDecimal salario, LocalDate dataAdmissao) {}
    public record TipoServicoResponse(Integer id, String descricao, BigDecimal precoBase, Integer tempoEstimadoMin) {}
    public record PecaResponse(Integer id, String nome, String fornecedor, BigDecimal precoUnitario,
                               Integer quantidadeEstoque, Integer quantidadeMinima) {}
}
