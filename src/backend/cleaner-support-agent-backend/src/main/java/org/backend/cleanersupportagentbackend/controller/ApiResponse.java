package org.backend.cleanersupportagentbackend.controller;

/**
 * 简单的通用响应包装，便于在控制层先占位接口。
 */
public record ApiResponse<T>(int code, String message, T data) {

    public static <T> ApiResponse<T> notImplemented(String feature) {
        String msg = feature == null || feature.isBlank()
                ? "功能未实现"
                : feature + " 功能未实现";
        return new ApiResponse<>(501, msg, null);
    }
}
