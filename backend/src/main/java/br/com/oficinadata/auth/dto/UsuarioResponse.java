package br.com.oficinadata.auth.dto;

public record UsuarioResponse(
        Integer id,
        String nome,
        String email,
        String perfil
) {
}
