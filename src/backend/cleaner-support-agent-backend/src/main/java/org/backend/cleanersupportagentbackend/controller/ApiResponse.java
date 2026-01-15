package org.backend.cleanersupportagentbackend.controller;

/**
 * 通用响应包装类
 */
public record ApiResponse<T>(int code, String message, T data) {

    // 成功响应
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(200, "操作成功", data);
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(200, message, data);
    }

    // 错误响应
    public static <T> ApiResponse<T> error(int code, String message) {
        return new ApiResponse<>(code, message, null);
    }

    public static <T> ApiResponse<T> badRequest(String message) {
        return new ApiResponse<>(400, message, null);
    }

    public static <T> ApiResponse<T> unauthorized(String message) {
        return new ApiResponse<>(401, message != null ? message : "未授权", null);
    }

    public static <T> ApiResponse<T> notFound(String message) {
        return new ApiResponse<>(404, message != null ? message : "资源不存在", null);
    }

    public static <T> ApiResponse<T> internalError(String message) {
        return new ApiResponse<>(500, message != null ? message : "服务器内部错误", null);
    }

    // 未实现
    public static <T> ApiResponse<T> notImplemented(String feature) {
        String msg = feature == null || feature.isBlank()
                ? "功能未实现"
                : feature + " 功能未实现";
        return new ApiResponse<>(501, msg, null);
    }
}
