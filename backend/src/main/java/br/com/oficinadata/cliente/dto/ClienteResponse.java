package br.com.oficinadata.cliente.dto;

public record ClienteResponse(
        Integer id,
        String tipo,
        String nome,
        String documento,
        String email,
        String telefone,
        VeiculoResponse veiculo
) {
}
