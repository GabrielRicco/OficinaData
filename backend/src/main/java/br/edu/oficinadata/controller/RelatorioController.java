package br.edu.oficinadata.controller;

import br.edu.oficinadata.dto.ApiDtos.*;
import br.edu.oficinadata.service.RelatorioService;
import io.swagger.v3.oas.annotations.Operation;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/relatorios")
@PreAuthorize("hasRole('GERENTE')")
public class RelatorioController {
    private final RelatorioService service;

    public RelatorioController(RelatorioService service) {
        this.service = service;
    }

    @GetMapping("/receita-mensal")
    @Operation(summary = "Receita mensal dos ultimos 12 meses")
    public List<ReceitaMensalResponse> receitaMensal() {
        return service.receitaMensal();
    }

    @GetMapping("/ranking-servicos")
    @Operation(summary = "Top 10 servicos por quantidade e faturamento")
    public List<RankingServicoResponse> rankingServicos() {
        return service.rankingServicos();
    }

    @GetMapping("/ranking-funcionarios")
    @Operation(summary = "Ranking de funcionarios por faturamento")
    public List<RankingFuncionarioResponse> rankingFuncionarios() {
        return service.rankingFuncionarios();
    }

    @GetMapping("/top-clientes")
    @Operation(summary = "Top 20 clientes por gasto acumulado")
    public List<ClienteGastoResponse> topClientes() {
        return service.topClientes();
    }

    @GetMapping("/formas-pagamento")
    @Operation(summary = "Distribuicao percentual das formas de pagamento")
    public List<FormaPagamentoResponse> formasPagamento() {
        return service.formasPagamento();
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Indicadores do dashboard gerencial")
    public DashboardResponse dashboard() {
        return service.dashboard();
    }
}
