package org.backend.cleanersupportagentbackend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

/**
 * Web配置类，注册拦截器和参数解析器
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final AuthInterceptor authInterceptor;
    private final CurrentUserIdArgumentResolver currentUserIdArgumentResolver;

    @Autowired
    public WebConfig(AuthInterceptor authInterceptor,
                     CurrentUserIdArgumentResolver currentUserIdArgumentResolver) {
        this.authInterceptor = authInterceptor;
        this.currentUserIdArgumentResolver = currentUserIdArgumentResolver;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(authInterceptor)
                .addPathPatterns("/api/**")  // 拦截所有/api开头的路径
                .excludePathPatterns(
                        "/api/cleaner-support/v2/users/login",     // 登录接口
                        "/api/cleaner-support/v2/users/register",  // 注册接口
                        "/api/cleaner-support/v2/media/files",     // 媒体文件列表（公开）
                        "/api/cleaner-support/v2/media/files/**"    // 媒体文件详情（公开）
                        // 注意：/api/cleaner-support/v2/media/upload 需要登录验证
                );
    }

    @Override
    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
        resolvers.add(currentUserIdArgumentResolver);
    }
}
