package br.edu.oficinadata.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "tipo_servico", schema = "oficina")
public class TipoServico {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tipo_servico")
    public Integer id;
    public String descricao;
    @Column(name = "preco_base")
    public BigDecimal precoBase;
    @Column(name = "tempo_estimado_min")
    public Integer tempoEstimadoMin;
}
