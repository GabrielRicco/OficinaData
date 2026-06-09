package br.edu.oficinadata.repository;

import br.edu.oficinadata.entity.Agendamento;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

public interface AgendamentoRepository extends JpaRepository<Agendamento, Integer> {
    @Query(value = """
        select a.* from oficina.agendamento a
        where (:status is null or a.status = :status)
          and (:data is null or cast(a.data_abertura as date) = cast(:data as date))
        """,
        countQuery = """
        select count(*) from oficina.agendamento a
        where (:status is null or a.status = :status)
          and (:data is null or cast(a.data_abertura as date) = cast(:data as date))
        """,
        nativeQuery = true)
    Page<Agendamento> buscar(@Param("status") String status, @Param("data") LocalDate data, Pageable pageable);

    @Query(value = """
        select a.id_agendamento as id,
               c.nome as cliente,
               concat(v.marca, ' ', v.modelo) as veiculo,
               v.placa as placa,
               a.status as status,
               a.data_abertura as dataAbertura,
               a.data_conclusao as dataConclusao,
               a.total_geral as totalGeral
        from oficina.agendamento a
        join oficina.veiculo v on v.id_veiculo = a.id_veiculo
        join oficina.cliente c on c.id_cliente = v.id_cliente
        where (:status is null or a.status = :status)
          and (:data is null or cast(a.data_abertura as date) = cast(:data as date))
        order by a.data_abertura desc
        """,
        countQuery = """
        select count(*)
        from oficina.agendamento a
        join oficina.veiculo v on v.id_veiculo = a.id_veiculo
        join oficina.cliente c on c.id_cliente = v.id_cliente
        where (:status is null or a.status = :status)
          and (:data is null or cast(a.data_abertura as date) = cast(:data as date))
        """,
        nativeQuery = true)
    Page<AgendamentoResumoProjection> buscarResumos(@Param("status") String status, @Param("data") LocalDate data,
                                                    Pageable pageable);

    @Query(value = """
        select to_char(data_conclusao, 'YYYY-MM') as mes,
               count(*) as qtdAgendamentos,
               round(sum(total_geral)::numeric, 2) as receitaTotal,
               round(avg(total_geral)::numeric, 2) as ticketMedio
        from oficina.agendamento
        where status = 'Concluído'
          and data_conclusao is not null
          and data_conclusao >= current_date - interval '12 months'
        group by to_char(data_conclusao, 'YYYY-MM')
        order by mes desc
        """, nativeQuery = true)
    java.util.List<ReceitaMensalProjection> receitaMensal();

    @Query(value = "select count(*) from oficina.agendamento where status in ('Agendado', 'Em andamento')", nativeQuery = true)
    Long countOsAbertas();

    @Query(value = """
        select coalesce(round(sum(total_geral)::numeric, 2), 0)
        from oficina.agendamento
        where status = 'Concluído' and data_conclusao::date = current_date
        """, nativeQuery = true)
    BigDecimal receitaDia();

    interface ReceitaMensalProjection {
        String getMes();
        Long getQtdAgendamentos();
        BigDecimal getReceitaTotal();
        BigDecimal getTicketMedio();
    }

    interface AgendamentoResumoProjection {
        Integer getId();
        String getCliente();
        String getVeiculo();
        String getPlaca();
        String getStatus();
        Instant getDataAbertura();
        Instant getDataConclusao();
        BigDecimal getTotalGeral();
    }
}
