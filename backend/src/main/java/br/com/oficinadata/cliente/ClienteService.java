package br.com.oficinadata.cliente;

import br.com.oficinadata.cliente.dto.ClienteRequest;
import br.com.oficinadata.cliente.dto.ClienteResponse;
import br.com.oficinadata.cliente.dto.VeiculoRequest;
import br.com.oficinadata.cliente.dto.VeiculoResponse;
import br.com.oficinadata.common.RegraNegocioException;
import java.util.Locale;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ClienteService {
    private final JdbcTemplate jdbcTemplate;

    public ClienteService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Transactional
    public ClienteResponse cadastrar(ClienteRequest request) {
        String tipo = request.tipo().trim().toUpperCase(Locale.ROOT);
        String documento = somenteDigitos(request.documento());
        String telefone = somenteDigitos(request.telefone());
        validarCliente(tipo, documento, telefone);

        String cpf = "PF".equals(tipo) ? documento : null;
        String cnpj = "PJ".equals(tipo) ? documento : null;

        Integer clienteId = jdbcTemplate.queryForObject("""
                INSERT INTO cliente (nome, email, telefone, cpf, cnpj)
                VALUES (?, ?, ?, ?, ?)
                RETURNING id_cliente
                """, Integer.class, request.nome().trim(), request.email().trim(), telefone, cpf, cnpj);

        VeiculoResponse veiculo = cadastrarVeiculo(clienteId, request.veiculo());

        return new ClienteResponse(
                clienteId,
                tipo,
                request.nome().trim(),
                documento,
                request.email().trim(),
                telefone,
                veiculo
        );
    }

    private VeiculoResponse cadastrarVeiculo(Integer clienteId, VeiculoRequest veiculo) {
        String placa = veiculo.placa()
                .replace("-", "")
                .replace(" ", "")
                .toUpperCase(Locale.ROOT);

        Integer veiculoId = jdbcTemplate.queryForObject("""
                INSERT INTO veiculo (id_cliente, placa, marca, modelo, ano)
                VALUES (?, ?, ?, ?, ?)
                RETURNING id_veiculo
                """, Integer.class, clienteId, placa, veiculo.marca().trim(), veiculo.modelo().trim(), veiculo.ano());

        return new VeiculoResponse(veiculoId, placa, veiculo.marca().trim(), veiculo.modelo().trim(), veiculo.ano());
    }

    private void validarCliente(String tipo, String documento, String telefone) {
        if (!"PF".equals(tipo) && !"PJ".equals(tipo)) {
            throw new RegraNegocioException("Tipo de cliente deve ser PF ou PJ.");
        }
        if ("PF".equals(tipo) && documento.length() != 11) {
            throw new RegraNegocioException("CPF deve ter 11 dígitos.");
        }
        if ("PJ".equals(tipo) && documento.length() != 14) {
            throw new RegraNegocioException("CNPJ deve ter 14 dígitos.");
        }
        if (telefone.length() < 10 || telefone.length() > 11) {
            throw new RegraNegocioException("Telefone deve ter 10 ou 11 dígitos.");
        }
    }

    private String somenteDigitos(String valor) {
        return valor == null ? "" : valor.replaceAll("\\D", "");
    }
}
