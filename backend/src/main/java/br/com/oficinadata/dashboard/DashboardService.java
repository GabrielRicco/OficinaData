package br.com.oficinadata.dashboard;

import br.com.oficinadata.agendamento.AgendamentoService;
import br.com.oficinadata.dashboard.dto.DashboardMetricasResponse;
import br.com.oficinadata.dashboard.dto.DashboardResponse;
import java.math.BigDecimal;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {
    private final JdbcTemplate jdbcTemplate;
    private final AgendamentoService agendamentoService;

    public DashboardService(JdbcTemplate jdbcTemplate, AgendamentoService agendamentoService) {
        this.jdbcTemplate = jdbcTemplate;
        this.agendamentoService = agendamentoService;
    }

    public DashboardResponse carregar() {
        DashboardMetricasResponse metricas = jdbcTemplate.queryForObject("""
                SELECT
                    COALESCE(SUM(CASE
                        WHEN status = 'Concluído'
                         AND data_conclusao >= date_trunc('month', CURRENT_DATE)
                        THEN total_geral ELSE 0 END), 0) AS faturamento_mensal,
                    COALESCE(AVG(CASE WHEN status = 'Concluído' THEN total_geral END), 0) AS ticket_medio,
                    COUNT(*) FILTER (WHERE status IN ('Agendado', 'Em andamento')) AS carros_agendados,
                    COUNT(*) FILTER (WHERE status = 'Concluído') AS os_concluidas
                FROM agendamento
                """, (rs, rowNum) -> new DashboardMetricasResponse(
                rs.getBigDecimal("faturamento_mensal"),
                rs.getBigDecimal("ticket_medio"),
                rs.getLong("carros_agendados"),
                rs.getLong("os_concluidas")
        ));

        return new DashboardResponse(metricas, agendamentoService.listarRecentes(5));
    }
}
