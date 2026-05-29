package br.edu.oficinadata.repository;

import br.edu.oficinadata.entity.ItemServico;
import java.math.BigDecimal;
import org.springframework.data.jpa.repository.*;

public interface ItemServicoRepository extends JpaRepository<ItemServico, Integer> {
    @EntityGraph(attributePaths = {"tipoServico", "funcionario"})
    java.util.List<ItemServico> findByAgendamentoIdOrderById(Integer agendamentoId);

    @Query(value = """
        select ts.id_tipo_servico as idTipoServico,
               ts.descricao as descricao,
               sum(isv.quantidade) as qtdExecucoes,
               round(sum(isv.total)::numeric, 2) as faturamento
        from oficina.item_servico isv
        join oficina.tipo_servico ts on isv.id_tipo_servico = ts.id_tipo_servico
        group by ts.id_tipo_servico, ts.descricao
        order by qtdExecucoes desc, faturamento desc
        limit 10
        """, nativeQuery = true)
    java.util.List<RankingServicoProjection> rankingServicos();

    @Query(value = """
        select f.id_funcionario as idFuncionario,
               f.nome as nome,
               count(distinct isv.id_agendamento) as qtdOs,
               round(sum(isv.total)::numeric, 2) as faturamento
        from oficina.funcionario f
        join oficina.item_servico isv on isv.id_funcionario = f.id_funcionario
        join oficina.agendamento ag on ag.id_agendamento = isv.id_agendamento
        where ag.status = 'Concluído'
        group by f.id_funcionario, f.nome
        order by faturamento desc
        """, nativeQuery = true)
    java.util.List<RankingFuncionarioProjection> rankingFuncionarios();

    interface RankingServicoProjection {
        Integer getIdTipoServico();
        String getDescricao();
        Long getQtdExecucoes();
        BigDecimal getFaturamento();
    }

    interface RankingFuncionarioProjection {
        Integer getIdFuncionario();
        String getNome();
        Long getQtdOs();
        BigDecimal getFaturamento();
    }
}
