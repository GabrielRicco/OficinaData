package br.edu.oficinadata.controller;

import br.edu.oficinadata.dto.ApiDtos.PecaEstoqueResponse;
import br.edu.oficinadata.dto.ApiDtos.PecaResponse;
import br.edu.oficinadata.service.OficinaService;
import br.edu.oficinadata.service.RelatorioService;
import io.swagger.v3.oas.annotations.Operation;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.data.domain.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pecas")
public class PecaController {
    private final RelatorioService relatorios;
    private final OficinaService oficina;

    public PecaController(RelatorioService relatorios, OficinaService oficina) {
        this.relatorios = relatorios;
        this.oficina = oficina;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ATENDENTE','GERENTE')")
    @Operation(summary = "Listar pecas com filtros por nome, fornecedor e faixa de preco")
    public Page<PecaResponse> listar(@RequestParam(required = false) String nome,
                                     @RequestParam(required = false) String fornecedor,
                                     @RequestParam(required = false) BigDecimal precoMin,
                                     @RequestParam(required = false) BigDecimal precoMax,
                                     Pageable pageable) {
        return oficina.listarPecas(nome, fornecedor, precoMin, precoMax, pageable);
    }

    @GetMapping("/abaixo-estoque-minimo")
    @PreAuthorize("hasAnyRole('ATENDENTE','GERENTE')")
    @Operation(summary = "Pecas com estoque abaixo do minimo")
    public List<PecaEstoqueResponse> abaixoEstoqueMinimo() {
        return relatorios.pecasAbaixoMinimo();
    }
}
