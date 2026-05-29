package br.edu.oficinadata.repository;

import br.edu.oficinadata.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
    java.util.Optional<Usuario> findByEmailIgnoreCaseAndAtivoTrue(String email);
}
