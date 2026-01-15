package org.backend.cleanersupportagentbackend.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 用于自动注入当前登录用户的userId
 * 在Controller方法参数上使用，拦截器会将userId注入到request attribute中
 */
@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
public @interface CurrentUserId {
}
