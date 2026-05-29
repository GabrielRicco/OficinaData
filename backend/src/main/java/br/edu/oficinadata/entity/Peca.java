package br.edu.oficinadata.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "peca", schema = "oficina")
public class Peca {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_peca")
    public Integer id;
    public String nome;
    public String fornecedor;
    @Column(name = "preco_unitario")
    public BigDecimal precoUnitario;
    @Column(name = "quantidade_estoque")
    public Integer quantidadeEstoque;
    @Column(name = "quantidade_minima")
    public Integer quantidadeMinima;
}
