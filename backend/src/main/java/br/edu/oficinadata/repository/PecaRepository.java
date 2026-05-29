package br.edu.oficinadata.repository;

import br.edu.oficinadata.entity.Peca;
import java.math.BigDecimal;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

public interface PecaRepository extends JpaRepository<Peca, Integer> {
    @Query("""
        select p from Peca p
        where (:nome is null or lower(p.nome) like lower(concat('%', :nome, '%')))
          and (:fornecedor is null or lower(p.fornecedor) like lower(concat('%', :fornecedor, '%')))
          and (:precoMin is null or p.precoUnitario >= :precoMin)
          and (:precoMax is null or p.precoUnitario <= :precoMax)
        """)
    Page<Peca> buscar(@Param("nome") String nome, @Param("fornecedor") String fornecedor,
                      @Param("precoMin") BigDecimal precoMin, @Param("precoMax") BigDecimal precoMax,
                      Pageable pageable);

    @Query(value = """
        select id_peca as idPeca, nome, quantidade_estoque as quantidadeEstoque,
               quantidade_minima as quantidadeMinima,
               (quantidade_minima - quantidade_estoque) as deficit, fornecedor
        from oficina.peca
        where quantidade_estoque < quantidade_minima
        order by deficit desc
        """, nativeQuery = true)
    java.util.List<PecaEstoqueProjection> abaixoEstoqueMinimo();

    @Query(value = "select count(*) from oficina.peca where quantidade_estoque < quantidade_minima", nativeQuery = true)
    Long countAbaixoMinimo();

    interface PecaEstoqueProjection {
        Integer getIdPeca();
        String getNome();
        Integer getQuantidadeEstoque();
        Integer getQuantidadeMinima();
        Integer getDeficit();
        String getFornecedor();
    }
}
