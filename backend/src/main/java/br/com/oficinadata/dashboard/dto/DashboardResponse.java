package br.com.oficinadata.dashboard.dto;

import br.com.oficinadata.agendamento.dto.AgendamentoResumoResponse;
import java.util.List;

public record DashboardResponse(
        DashboardMetricasResponse metricas,
        List<AgendamentoResumoResponse> ultimosAgendamentos
) {
}
