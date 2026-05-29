package br.edu.oficinadata.repository;

import br.edu.oficinadata.entity.Veiculo;
import org.springframework.data.jpa.repository.*;

public interface VeiculoRepository extends JpaRepository<Veiculo, Integer> {
    @EntityGraph(attributePaths = {"cliente", "agendamentos"})
    java.util.Optional<Veiculo> findByPlacaIgnoreCase(String placa);

    java.util.List<Veiculo> findByClienteIdOrderByMarcaAscModeloAsc(Integer clienteId);
}
