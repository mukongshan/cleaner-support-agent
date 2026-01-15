package org.backend.cleanersupportagentbackend.util;

/**
 * Token工具类，统一管理token的解析和验证
 */
public class TokenUtil {

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
     * TODO: 实现真实的JWT token解析
     */
    public static String extractUserIdFromToken(String token) {
        if (token == null || token.isBlank()) {
            return null;
        }
        
        // 临时方案：mock_token_U12345 -> U12345
        if (token.startsWith("mock_token_")) {
            return token.substring(12);
        }
        
        // TODO: 解析真实JWT token
        // 示例：
        // Jwts.parser()
        //     .setSigningKey(secretKey)
        //     .parseClaimsJws(token)
        //     .getBody()
        //     .getSubject();
        
        return null;
    }

    /**
     * 从Authorization header中直接提取userId（便捷方法）
     */
    public static String extractUserIdFromHeader(String authHeader) {
        String token = extractToken(authHeader);
        return extractUserIdFromToken(token);
    }

    /**
     * 验证token是否有效
     */
    public static boolean isValidToken(String token) {
        String userId = extractUserIdFromToken(token);
        return userId != null && !userId.isBlank();
    }
}
