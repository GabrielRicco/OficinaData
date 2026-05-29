package br.com.oficinadata.cliente.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record VeiculoRequest(
        @NotBlank String placa,
        @NotBlank String marca,
        @NotBlank String modelo,
        @NotNull @Min(1900) @Max(2100) Integer ano
) {
}
