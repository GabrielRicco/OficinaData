package br.com.oficinadata.agendamento;

import br.com.oficinadata.agendamento.dto.AgendamentoResumoResponse;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/agendamentos")
public class AgendamentoController {
    private final AgendamentoService agendamentoService;

    public AgendamentoController(AgendamentoService agendamentoService) {
        this.agendamentoService = agendamentoService;
    }

    @GetMapping
    List<AgendamentoResumoResponse> listar(@RequestParam(defaultValue = "20") int limite) {
        return agendamentoService.listarRecentes(limite);
    }
}
