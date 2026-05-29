package br.edu.oficinadata.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "item_peca", schema = "oficina")
public class ItemPeca {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_item_peca")
    public Integer id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "id_agendamento")
    public Agendamento agendamento;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "id_peca")
    public Peca peca;
    public Integer quantidade;
    @Column(name = "preco_unitario")
    public BigDecimal precoUnitario;
    public BigDecimal desconto;
    @Column(insertable = false, updatable = false)
    public BigDecimal total;
}
