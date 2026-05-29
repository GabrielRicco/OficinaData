package br.com.oficinadata.agendamento;

import br.com.oficinadata.agendamento.dto.AgendamentoResumoResponse;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class AgendamentoService {
    private final JdbcTemplate jdbcTemplate;

    public AgendamentoService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<AgendamentoResumoResponse> listarRecentes(int limite) {
        int limiteSeguro = Math.max(1, Math.min(limite, 100));
        String sql = """
                SELECT
                    a.id_agendamento,
                    c.nome AS cliente,
                    CONCAT(v.marca, ' ', v.modelo) AS veiculo,
                    v.placa,
                    a.status,
                    a.total_geral,
                    a.data_abertura
                FROM agendamento a
                JOIN veiculo v ON v.id_veiculo = a.id_veiculo
                JOIN cliente c ON c.id_cliente = v.id_cliente
                ORDER BY a.data_abertura DESC, a.id_agendamento DESC
                LIMIT ?
                """;

        return jdbcTemplate.query(sql, this::mapResumo, limiteSeguro);
    }

    private AgendamentoResumoResponse mapResumo(ResultSet rs, int rowNum) throws SQLException {
        return new AgendamentoResumoResponse(
                rs.getInt("id_agendamento"),
                rs.getString("cliente"),
                rs.getString("veiculo"),
                rs.getString("placa"),
                rs.getString("status"),
                rs.getBigDecimal("total_geral"),
                rs.getObject("data_abertura", java.time.OffsetDateTime.class)
        );
    }
}
