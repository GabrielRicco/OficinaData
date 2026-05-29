package br.edu.oficinadata.repository;

import br.edu.oficinadata.entity.Cliente;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

public interface ClienteRepository extends JpaRepository<Cliente, Integer> {
    @EntityGraph(attributePaths = "veiculos")
    @Query("select c from Cliente c where c.id = :id")
    java.util.Optional<Cliente> findDetalhadoById(@Param("id") Integer id);

    @Query("""
        select c from Cliente c
        where (:nome is null or lower(c.nome) like lower(concat('%', :nome, '%')))
          and (:tipo is null or (:tipo = 'PF' and c.cpf is not null) or (:tipo = 'PJ' and c.cnpj is not null))
        """)
    Page<Cliente> buscar(@Param("nome") String nome, @Param("tipo") String tipo, Pageable pageable);
}
