package br.edu.oficinadata.controller;

import br.edu.oficinadata.dto.ApiDtos.TipoServicoResponse;
import br.edu.oficinadata.service.OficinaService;
import io.swagger.v3.oas.annotations.Operation;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tipos-servico")
public class TipoServicoController {
    private final OficinaService service;

    public TipoServicoController(OficinaService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ATENDENTE','GERENTE')")
    @Operation(summary = "Listar tipos de servico disponiveis")
    public List<TipoServicoResponse> listar() {
        return service.listarTiposServico();
    }
}
