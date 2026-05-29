package br.com.oficinadata.cliente.dto;

public record VeiculoResponse(
        Integer id,
        String placa,
        String marca,
        String modelo,
        Integer ano
) {
}
