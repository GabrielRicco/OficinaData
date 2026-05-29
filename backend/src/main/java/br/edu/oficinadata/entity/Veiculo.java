package br.edu.oficinadata.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "veiculo", schema = "oficina")
public class Veiculo {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_veiculo")
    public Integer id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_cliente")
    public Cliente cliente;
    public String placa;
    public String marca;
    public String modelo;
    public Integer ano;
    @Column(name = "data_cadastro", insertable = false, updatable = false)
    public OffsetDateTime dataCadastro;
    @OneToMany(mappedBy = "veiculo")
    public List<Agendamento> agendamentos = new ArrayList<>();
}
