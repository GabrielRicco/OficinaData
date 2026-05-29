package br.edu.oficinadata.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "cliente", schema = "oficina")
public class Cliente {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cliente")
    public Integer id;
    public String nome;
    public String email;
    public String telefone;
    public String cpf;
    public String cnpj;
    @Column(name = "data_cadastro", insertable = false, updatable = false)
    public OffsetDateTime dataCadastro;
    @OneToMany(mappedBy = "cliente")
    public List<Veiculo> veiculos = new ArrayList<>();
}
