package br.edu.oficinadata.controller;

import br.edu.oficinadata.dto.ApiDtos.*;
import br.edu.oficinadata.service.OficinaService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/veiculos")
public class VeiculoController {
    private final OficinaService service;

    public VeiculoController(OficinaService service) {
        this.service = service;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ATENDENTE','GERENTE')")
    @Operation(summary = "Cadastrar veiculo vinculado a um cliente")
    public ResponseEntity<VeiculoResponse> criar(@RequestBody @Valid VeiculoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criarVeiculo(request));
    }

    @GetMapping("/{placa}")
    @PreAuthorize("hasAnyRole('ATENDENTE','GERENTE')")
    @Operation(summary = "Buscar veiculo pela placa com historico de agendamentos")
    public VeiculoResponse buscar(@PathVariable String placa) {
        return service.buscarVeiculoPorPlaca(placa);
    }
}
