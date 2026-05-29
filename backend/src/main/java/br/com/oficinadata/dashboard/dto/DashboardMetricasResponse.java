package br.com.oficinadata.dashboard.dto;

import java.math.BigDecimal;

public record DashboardMetricasResponse(
        BigDecimal faturamentoMensal,
        BigDecimal ticketMedio,
        Long carrosAgendados,
        Long osConcluidas
) {
}
