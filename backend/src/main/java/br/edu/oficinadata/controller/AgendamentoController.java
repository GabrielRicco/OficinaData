package br.edu.oficinadata.controller;

import br.edu.oficinadata.dto.ApiDtos.*;
import br.edu.oficinadata.service.OficinaService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import java.time.LocalDate;
import org.springframework.data.domain.*;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/agendamentos")
public class AgendamentoController {
    private final OficinaService service;

    public AgendamentoController(OficinaService service) {
        this.service = service;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ATENDENTE','GERENTE')")
    @Operation(summary = "Abrir nova ordem de servico")
    public ResponseEntity<AgendamentoResponse> abrir(@RequestBody @Valid AgendamentoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.abrirAgendamento(request));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ATENDENTE','GERENTE')")
    @Operation(summary = "Atualizar status da OS")
    public AgendamentoResponse status(@PathVariable Integer id, @RequestBody @Valid StatusRequest request) {
        return service.atualizarStatus(id, request);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ATENDENTE','GERENTE')")
    @Operation(summary = "Listar OS com filtro por status e data")
    public Page<AgendamentoResumo> listar(@RequestParam(required = false) String status,
                                          @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data,
                                          Pageable pageable) {
        return service.listarAgendamentos(status, data, pageable);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ATENDENTE','GERENTE')")
    @Operation(summary = "Detalhar OS com servicos, pecas, pagamentos e avaliacao")
    public AgendamentoDetalheResponse detalhar(@PathVariable Integer id) {
        return service.detalharAgendamento(id);
    }

    @PostMapping("/{id}/itens-servico")
    @PreAuthorize("hasAnyRole('ATENDENTE','GERENTE')")
    @Operation(summary = "Adicionar servico a uma OS em aberto")
    public AgendamentoResponse adicionarServico(@PathVariable Integer id, @RequestBody @Valid ItemServicoRequest request) {
        return service.adicionarServico(id, request);
    }

    @PostMapping("/{id}/itens-peca")
    @PreAuthorize("hasAnyRole('ATENDENTE','GERENTE')")
    @Operation(summary = "Adicionar peca consumida a uma OS")
    public AgendamentoResponse adicionarPeca(@PathVariable Integer id, @RequestBody @Valid ItemPecaRequest request) {
        return service.adicionarPeca(id, request);
    }

    @PostMapping("/{id}/pagamento")
    @PreAuthorize("hasAnyRole('ATENDENTE','GERENTE')")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Registrar pagamento de OS concluida")
    public void pagamento(@PathVariable Integer id, @RequestBody @Valid PagamentoRequest request) {
        service.registrarPagamento(id, request);
    }

    @PostMapping("/{id}/avaliacao")
    @PreAuthorize("hasAnyRole('ATENDENTE','GERENTE')")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Registrar avaliacao do cliente")
    public void avaliacao(@PathVariable Integer id, @RequestBody @Valid AvaliacaoRequest request) {
        service.registrarAvaliacao(id, request);
    }
}
