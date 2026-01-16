package org.backend.cleanersupportagentbackend.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.backend.cleanersupportagentbackend.util.TokenUtil;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * 认证拦截器，统一处理登录验证
 */
@Component
public class AuthInterceptor implements HandlerInterceptor {

    // 不需要登录的路径
    private static final String[] PUBLIC_PATHS = {
            "/api/cleaner-support/v2/users/login",
            "/api/cleaner-support/v2/users/register",
            "/api/cleaner-support/v2/media/files",  // 媒体文件列表和详情可以公开访问
            "/mcp/"  // MCP接口不需要登录
    };

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String requestPath = request.getRequestURI();
        
        // 检查是否为公开路径
        if (isPublicPath(requestPath)) {
            return true;
        }

        // 提取token并验证
        String authHeader = request.getHeader("Authorization");
        String userId = TokenUtil.extractUserIdFromHeader(authHeader);

        if (userId == null || userId.isBlank()) {
            // 未登录，设置响应
            response.setStatus(HttpServletResponse.SC_OK); // 保持200状态码，与ApiResponse保持一致
            response.setContentType("application/json;charset=UTF-8");
            try {
                response.getWriter().write("{\"code\":401,\"message\":\"请先登录\",\"data\":null}");
            } catch (Exception e) {
                // 忽略写入异常
            }
            return false;
        }

        // 将userId存入request attribute，供Controller使用
        request.setAttribute("userId", userId);
        return true;
    }

    /**
     * 判断是否为公开路径（不需要登录）
     */
    private boolean isPublicPath(String path) {
        for (String publicPath : PUBLIC_PATHS) {
            if (path.startsWith(publicPath)) {
                return true;
            }
        }
        return false;
    }
}
