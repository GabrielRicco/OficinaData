package br.edu.oficinadata.repository;

import br.edu.oficinadata.entity.Funcionario;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FuncionarioRepository extends JpaRepository<Funcionario, Integer> {}
