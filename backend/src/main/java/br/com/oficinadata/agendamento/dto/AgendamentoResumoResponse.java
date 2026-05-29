package br.com.oficinadata.agendamento.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record AgendamentoResumoResponse(
        Integer id,
        String cliente,
        String veiculo,
        String placa,
        String status,
        BigDecimal valorTotal,
        OffsetDateTime dataAbertura
) {
}
