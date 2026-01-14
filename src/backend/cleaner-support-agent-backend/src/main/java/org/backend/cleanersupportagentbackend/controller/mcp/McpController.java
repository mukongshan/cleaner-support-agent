package org.backend.cleanersupportagentbackend.controller.mcp;

import org.backend.cleanersupportagentbackend.controller.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * 面向 Dify AI 助手的 MCP 协议占位控制器。
 */
@RestController
@RequestMapping("/mcp")
public class McpController {

    @PostMapping("/get_user_info")
    public ResponseEntity<ApiResponse<?>> getUserInfo(@RequestBody(required = false) Map<String, Object> body) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                .body(ApiResponse.notImplemented("get_user_info"));
    }

    @PostMapping("/get_robot_hardware_profile")
    public ResponseEntity<ApiResponse<?>> getRobotHardwareProfile(@RequestBody Map<String, Object> body) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                .body(ApiResponse.notImplemented("get_robot_hardware_profile"));
    }

    @PostMapping("/get_robot_realtime_telemetry")
    public ResponseEntity<ApiResponse<?>> getRobotRealtimeTelemetry(@RequestBody Map<String, Object> body) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                .body(ApiResponse.notImplemented("get_robot_realtime_telemetry"));
    }
}
