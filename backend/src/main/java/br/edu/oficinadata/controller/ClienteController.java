package br.edu.oficinadata.controller;

import br.edu.oficinadata.dto.ApiDtos.*;
import br.edu.oficinadata.service.OficinaService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/clientes")
public class ClienteController {
    private final OficinaService service;

    public ClienteController(OficinaService service) {
        this.service = service;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ATENDENTE','GERENTE')")
    @Operation(summary = "Cadastrar novo cliente PF ou PJ")
    public ResponseEntity<ClienteResponse> criar(@RequestBody @Valid ClienteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criarCliente(request));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ATENDENTE','GERENTE')")
    @Operation(summary = "Buscar cliente por ID com seus veiculos")
    public ClienteResponse buscar(@PathVariable Integer id) {
        return service.buscarCliente(id);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ATENDENTE','GERENTE')")
    @Operation(summary = "Listar clientes com filtro por nome e tipo de pessoa")
    public Page<ClienteResponse> listar(@RequestParam(required = false) String nome,
                                        @RequestParam(required = false) String tipo,
                                        Pageable pageable) {
        return service.listarClientes(nome, tipo, pageable);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ATENDENTE','GERENTE')")
    @Operation(summary = "Atualizar dados cadastrais do cliente")
    public ClienteResponse atualizar(@PathVariable Integer id, @RequestBody @Valid ClienteRequest request) {
        return service.atualizarCliente(id, request);
    }

    @GetMapping("/{id}/veiculos")
    @PreAuthorize("hasAnyRole('ATENDENTE','GERENTE')")
    @Operation(summary = "Listar veiculos vinculados a um cliente")
    public List<VeiculoResumo> veiculos(@PathVariable Integer id) {
        return service.listarVeiculosDoCliente(id);
    }
}
