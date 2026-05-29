package br.edu.oficinadata.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "agendamento", schema = "oficina")
public class Agendamento {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_agendamento")
    public Integer id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_veiculo")
    public Veiculo veiculo;
    @Column(name = "data_abertura", insertable = false, updatable = false)
    public OffsetDateTime dataAbertura;
    @Column(name = "data_conclusao")
    public OffsetDateTime dataConclusao;
    public String status;
    @Column(name = "km_entrada")
    public Integer kmEntrada;
    @Column(name = "km_saida")
    public Integer kmSaida;
    @Column(name = "total_servicos", insertable = false, updatable = false)
    public BigDecimal totalServicos;
    @Column(name = "total_pecas", insertable = false, updatable = false)
    public BigDecimal totalPecas;
    @Column(name = "total_geral", insertable = false, updatable = false)
    public BigDecimal totalGeral;
}
