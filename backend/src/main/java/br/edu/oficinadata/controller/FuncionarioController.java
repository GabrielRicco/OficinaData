package br.edu.oficinadata.controller;

import br.edu.oficinadata.dto.ApiDtos.FuncionarioRequest;
import br.edu.oficinadata.dto.ApiDtos.FuncionarioResponse;
import br.edu.oficinadata.service.OficinaService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/funcionarios")
public class FuncionarioController {
    private final OficinaService service;

    public FuncionarioController(OficinaService service) {
        this.service = service;
    }

    @PostMapping
    @PreAuthorize("hasRole('GERENTE')")
    @Operation(summary = "Cadastrar funcionario; acesso exclusivo de gerente")
    public ResponseEntity<FuncionarioResponse> criar(@RequestBody @Valid FuncionarioRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criarFuncionario(request));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ATENDENTE','GERENTE')")
    @Operation(summary = "Listar funcionarios para selecao operacional")
    public List<FuncionarioResponse> listar() {
        return service.listarFuncionarios();
    }
}
