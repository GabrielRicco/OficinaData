package br.com.oficinadata.auth.dto;

public record LoginResponse(
        String token,
        String tipo,
        UsuarioResponse usuario
) {
}
