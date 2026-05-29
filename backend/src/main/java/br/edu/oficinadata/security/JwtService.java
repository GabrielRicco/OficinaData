package br.edu.oficinadata.security;

import br.edu.oficinadata.entity.Usuario;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
    private final SecretKey key;
    private final String issuer;
    private final long expirationMinutes;
    private final long refreshExpirationMinutes;

    public JwtService(@Value("${app.jwt.secret}") String secret,
                      @Value("${app.jwt.issuer}") String issuer,
                      @Value("${app.jwt.expiration-minutes}") long expirationMinutes,
                      @Value("${app.jwt.refresh-expiration-minutes}") long refreshExpirationMinutes) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.issuer = issuer;
        this.expirationMinutes = expirationMinutes;
        this.refreshExpirationMinutes = refreshExpirationMinutes;
    }

    public String accessToken(Usuario usuario) {
        return token(usuario, expirationMinutes, "access");
    }

    public String refreshToken(Usuario usuario) {
        return token(usuario, refreshExpirationMinutes, "refresh");
    }

    public Jws<Claims> parse(String token) {
        return Jwts.parser().verifyWith(key).requireIssuer(issuer).build().parseSignedClaims(token);
    }

    public long expiresInSeconds() {
        return expirationMinutes * 60;
    }

    private String token(Usuario usuario, long minutes, String type) {
        Instant now = Instant.now();
        return Jwts.builder()
                .issuer(issuer)
                .subject(usuario.email)
                .claim("uid", usuario.id)
                .claim("nome", usuario.nome)
                .claim("perfil", usuario.perfil)
                .claim("typ", type)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(minutes * 60)))
                .signWith(key)
                .compact();
    }
}
