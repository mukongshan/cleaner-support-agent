package org.backend.cleanersupportagentbackend.controller.app;

import org.backend.cleanersupportagentbackend.controller.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/cleaner-support/v1/devices")
public class DeviceController {

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<?>> getDeviceStatus(@RequestParam Map<String, String> query) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                .body(ApiResponse.notImplemented("获取设备实时状态"));
    }

    @PostMapping("/control")
    public ResponseEntity<ApiResponse<?>> controlDevice(@RequestBody Map<String, Object> body) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                .body(ApiResponse.notImplemented("发送设备控制指令"));
    }

    @GetMapping("/consumables")
    public ResponseEntity<ApiResponse<?>> getConsumables(@RequestParam Map<String, String> query) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                .body(ApiResponse.notImplemented("获取耗材状态"));
    }
}
