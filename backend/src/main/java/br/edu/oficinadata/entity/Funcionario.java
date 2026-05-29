package br.edu.oficinadata.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "funcionario", schema = "oficina")
public class Funcionario {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_funcionario")
    public Integer id;
    public String nome;
    public String cargo;
    public BigDecimal salario;
    @Column(name = "data_admissao")
    public LocalDate dataAdmissao;
}
