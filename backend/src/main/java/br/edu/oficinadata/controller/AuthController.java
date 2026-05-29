package br.edu.oficinadata.controller;

import br.edu.oficinadata.dto.ApiDtos.*;
import br.edu.oficinadata.security.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService auth;

    public AuthController(AuthService auth) {
        this.auth = auth;
    }

    @PostMapping("/login")
    @Operation(summary = "Autenticacao", description = "Valida email e senha e retorna JWT de acesso e refresh token.")
    public AuthResponse login(@RequestBody @Valid LoginRequest request) {
        return auth.login(request);
    }

    @PostMapping("/refresh")
    @Operation(summary = "Renovacao de token JWT", description = "Recebe um refresh token no header Authorization e emite novo par de tokens.")
    public AuthResponse refresh(@RequestHeader("Authorization") String authorization) {
        return auth.refresh(authorization);
    }
}
