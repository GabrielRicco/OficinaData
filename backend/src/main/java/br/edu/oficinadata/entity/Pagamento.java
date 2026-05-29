package br.edu.oficinadata.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "pagamento", schema = "oficina")
public class Pagamento {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pagamento")
    public Integer id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "id_agendamento")
    public Agendamento agendamento;
    @Column(name = "forma_pagamento")
    public String formaPagamento;
    public BigDecimal valor;
    public Integer parcelas;
    @Column(name = "data_pagamento", insertable = false, updatable = false)
    public OffsetDateTime dataPagamento;
}
