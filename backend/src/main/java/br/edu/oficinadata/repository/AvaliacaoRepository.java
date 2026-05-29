package br.edu.oficinadata.repository;

import br.edu.oficinadata.entity.Avaliacao;
import java.math.BigDecimal;
import org.springframework.data.jpa.repository.*;

public interface AvaliacaoRepository extends JpaRepository<Avaliacao, Integer> {
    boolean existsByAgendamentoId(Integer agendamentoId);

    java.util.Optional<Avaliacao> findByAgendamentoId(Integer agendamentoId);

    @Query(value = "select coalesce(round(avg(nota)::numeric, 2), 0) from oficina.avaliacao", nativeQuery = true)
    BigDecimal notaMedia();
}
