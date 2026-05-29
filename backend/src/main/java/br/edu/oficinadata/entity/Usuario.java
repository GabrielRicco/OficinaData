package br.edu.oficinadata.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "usuario", schema = "oficina")
public class Usuario {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    public Integer id;
    public String nome;
    public String email;
    @Column(name = "senha_hash")
    public String senhaHash;
    public String perfil;
    public Boolean ativo;
    @Column(name = "data_criacao", insertable = false, updatable = false)
    public OffsetDateTime dataCriacao;
}
