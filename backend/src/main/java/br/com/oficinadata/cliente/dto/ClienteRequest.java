package br.com.oficinadata.cliente.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ClienteRequest(
        @NotBlank String tipo,
        @NotBlank String nome,
        @NotBlank String documento,
        @NotBlank @Email String email,
        @NotBlank String telefone,
        @Valid @NotNull VeiculoRequest veiculo
) {
}
