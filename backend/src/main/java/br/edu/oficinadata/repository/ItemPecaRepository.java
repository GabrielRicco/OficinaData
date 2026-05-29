package br.edu.oficinadata.repository;

import br.edu.oficinadata.entity.ItemPeca;
import org.springframework.data.jpa.repository.*;

public interface ItemPecaRepository extends JpaRepository<ItemPeca, Integer> {
    @EntityGraph(attributePaths = "peca")
    java.util.List<ItemPeca> findByAgendamentoIdOrderById(Integer agendamentoId);
}
