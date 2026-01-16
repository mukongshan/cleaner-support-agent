package org.backend.cleanersupportagentbackend.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * Token工具类，统一管理token的解析和验证
 */
@Component
public class TokenUtil {

    @Value("${app.jwt.secret:cleaner-support-agent-secret-key-for-jwt-token-generation-2024}")
    private String jwtSecret;

    @Value("${app.jwt.expiration:604800}")
    private Long jwtExpiration;

    private SecretKey secretKey;
    private static TokenUtil instance;

    @PostConstruct
    public void init() {
        // 将字符串密钥转换为SecretKey
        // Keys.hmacShaKeyFor需要至少256位（32字节）的密钥
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        
        // 如果密钥长度不足32字节，使用SHA-256哈希扩展
        if (keyBytes.length < 32) {
            try {
                java.security.MessageDigest sha = java.security.MessageDigest.getInstance("SHA-256");
                keyBytes = sha.digest(keyBytes);
            } catch (Exception e) {
                throw new RuntimeException("无法生成JWT密钥", e);
            }
        }
        
        this.secretKey = Keys.hmacShaKeyFor(keyBytes);
        instance = this;
    }

    /**
     * 生成JWT token
     */
    public String generateToken(String userId) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration * 1000);

        return Jwts.builder()
                .subject(userId)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(secretKey)
                .compact();
    }

    /**
     * 从Authorization header中提取token
     */
    public static String extractToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        return authHeader.substring(7);
    }

    /**
     * 从token中解析userId
     */
    public String extractUserIdFromToken(String token) {
        if (token == null || token.isBlank()) {
            return null;
        }
        
        try {
            // 兼容旧的mock_token格式
            if (token.startsWith("mock_token_")) {
                return token.substring(12);
            }
            
            // 解析JWT token
            Claims claims = Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            
            return claims.getSubject();
        } catch (Exception e) {
            // Token无效或过期
            return null;
        }
    }

    /**
     * 从token中解析userId（静态方法，供向后兼容）
     */
    public static String extractUserIdFromTokenStatic(String token) {
        if (instance == null) {
            // 兼容旧的mock_token格式（在Spring容器初始化前）
            if (token != null && token.startsWith("mock_token_")) {
                return token.substring(12);
            }
            return null;
        }
        return instance.extractUserIdFromToken(token);
    }

    /**
     * 从Authorization header中直接提取userId（便捷方法）
     */
    public static String extractUserIdFromHeader(String authHeader) {
        String token = extractToken(authHeader);
        return extractUserIdFromTokenStatic(token);
    }

    /**
     * 验证token是否有效
     */
    public boolean isValidToken(String token) {
        String userId = extractUserIdFromToken(token);
        return userId != null && !userId.isBlank();
    }

    /**
     * 验证token是否有效（静态方法）
     */
    public static boolean isValidTokenStatic(String token) {
        if (instance == null) {
            // 兼容旧的mock_token格式
            return token != null && token.startsWith("mock_token_");
        }
        return instance.isValidToken(token);
    }
}
