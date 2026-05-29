package br.edu.oficinadata.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "item_servico", schema = "oficina")
public class ItemServico {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_item_servico")
    public Integer id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "id_agendamento")
    public Agendamento agendamento;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "id_tipo_servico")
    public TipoServico tipoServico;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "id_funcionario")
    public Funcionario funcionario;
    public Integer quantidade;
    @Column(name = "preco_unitario")
    public BigDecimal precoUnitario;
    public BigDecimal desconto;
    @Column(insertable = false, updatable = false)
    public BigDecimal total;
}
