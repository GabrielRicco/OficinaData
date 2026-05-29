package br.edu.oficinadata.repository;

import br.edu.oficinadata.entity.Pagamento;
import java.math.BigDecimal;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PagamentoRepository extends JpaRepository<Pagamento, Integer> {
    java.util.List<Pagamento> findByAgendamentoIdOrderByDataPagamentoDesc(Integer agendamentoId);

    @Query(value = """
        select c.id_cliente as idCliente,
               c.nome as nome,
               case when c.cpf is not null then 'PF' else 'PJ' end as tipoCliente,
               round(sum(p.valor)::numeric, 2) as gastoTotal
        from oficina.cliente c
        join oficina.veiculo v on v.id_cliente = c.id_cliente
        join oficina.agendamento ag on ag.id_veiculo = v.id_veiculo
        join oficina.pagamento p on p.id_agendamento = ag.id_agendamento
        group by c.id_cliente, c.nome, tipoCliente
        order by gastoTotal desc
        limit 20
        """, nativeQuery = true)
    java.util.List<ClienteGastoProjection> topClientes();

    @Query(value = """
        select forma_pagamento as formaPagamento,
               count(*) as qtdTransacoes,
               round(sum(valor)::numeric, 2) as valorTotal,
               round((sum(valor) * 100.0 / (select sum(valor) from oficina.pagamento))::numeric, 2) as percValor
        from oficina.pagamento
        group by forma_pagamento
        order by valorTotal desc
        """, nativeQuery = true)
    java.util.List<FormaPagamentoProjection> formasPagamento();

    interface ClienteGastoProjection {
        Integer getIdCliente();
        String getNome();
        String getTipoCliente();
        BigDecimal getGastoTotal();
    }

    interface FormaPagamentoProjection {
        String getFormaPagamento();
        Long getQtdTransacoes();
        BigDecimal getValorTotal();
        BigDecimal getPercValor();
    }
}
