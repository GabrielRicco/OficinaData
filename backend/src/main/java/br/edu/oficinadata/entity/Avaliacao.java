package br.edu.oficinadata.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "avaliacao", schema = "oficina")
public class Avaliacao {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_avaliacao")
    public Integer id;
    @OneToOne(fetch = FetchType.LAZY) @JoinColumn(name = "id_agendamento")
    public Agendamento agendamento;
    public Integer nota;
    public String comentario;
    @Column(name = "data_avaliacao", insertable = false, updatable = false)
    public OffsetDateTime dataAvaliacao;
}
