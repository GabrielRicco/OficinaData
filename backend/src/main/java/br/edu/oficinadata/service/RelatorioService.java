package br.edu.oficinadata.service;

import br.edu.oficinadata.dto.ApiDtos.*;
import br.edu.oficinadata.repository.*;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RelatorioService {
    private final AgendamentoRepository agendamentos;
    private final ItemServicoRepository itensServico;
    private final PecaRepository pecas;
    private final AvaliacaoRepository avaliacoes;
    private final PagamentoRepository pagamentos;

    public RelatorioService(AgendamentoRepository agendamentos, ItemServicoRepository itensServico,
                            PecaRepository pecas, AvaliacaoRepository avaliacoes, PagamentoRepository pagamentos) {
        this.agendamentos = agendamentos;
        this.itensServico = itensServico;
        this.pecas = pecas;
        this.avaliacoes = avaliacoes;
        this.pagamentos = pagamentos;
    }

    @Transactional(readOnly = true)
    public List<ReceitaMensalResponse> receitaMensal() {
        return agendamentos.receitaMensal().stream()
                .map(p -> new ReceitaMensalResponse(p.getMes(), p.getQtdAgendamentos(), p.getReceitaTotal(), p.getTicketMedio()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<RankingServicoResponse> rankingServicos() {
        return itensServico.rankingServicos().stream()
                .map(p -> new RankingServicoResponse(p.getIdTipoServico(), p.getDescricao(), p.getQtdExecucoes(), p.getFaturamento()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<RankingFuncionarioResponse> rankingFuncionarios() {
        return itensServico.rankingFuncionarios().stream()
                .map(p -> new RankingFuncionarioResponse(p.getIdFuncionario(), p.getNome(), p.getQtdOs(), p.getFaturamento()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ClienteGastoResponse> topClientes() {
        return pagamentos.topClientes().stream()
                .map(p -> new ClienteGastoResponse(p.getIdCliente(), p.getNome(), p.getTipoCliente(), p.getGastoTotal()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<FormaPagamentoResponse> formasPagamento() {
        return pagamentos.formasPagamento().stream()
                .map(p -> new FormaPagamentoResponse(p.getFormaPagamento(), p.getQtdTransacoes(), p.getValorTotal(), p.getPercValor()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PecaEstoqueResponse> pecasAbaixoMinimo() {
        return pecas.abaixoEstoqueMinimo().stream()
                .map(p -> new PecaEstoqueResponse(p.getIdPeca(), p.getNome(), p.getQuantidadeEstoque(), p.getQuantidadeMinima(), p.getDeficit(), p.getFornecedor()))
                .toList();
    }

    @Transactional(readOnly = true)
    public DashboardResponse dashboard() {
        return new DashboardResponse(agendamentos.countOsAbertas(), agendamentos.receitaDia(), pecas.countAbaixoMinimo(), avaliacoes.notaMedia());
    }
}
