package org.backend.cleanersupportagentbackend.controller.app;

import org.backend.cleanersupportagentbackend.annotation.CurrentUserId;
import org.backend.cleanersupportagentbackend.controller.ApiResponse;
import org.backend.cleanersupportagentbackend.dto.LoginRequest;
import org.backend.cleanersupportagentbackend.dto.LoginResponse;
import org.backend.cleanersupportagentbackend.dto.RegisterRequest;
import org.backend.cleanersupportagentbackend.dto.UpdateUserProfileRequest;
import org.backend.cleanersupportagentbackend.dto.UserProfileResponse;
import org.backend.cleanersupportagentbackend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cleaner-support/v2/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<LoginResponse>> register(@RequestBody RegisterRequest request) {
        try {
            LoginResponse response = userService.register(request);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error(400, e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@RequestBody LoginRequest request) {
        try {
            LoginResponse response = userService.login(request);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error(400, e.getMessage()));
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getProfile(@CurrentUserId String userId) {
        try {
            UserProfileResponse response = userService.getUserProfile(userId);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error(500, e.getMessage()));
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<Void>> updateProfile(
            @CurrentUserId String userId,
            @RequestBody UpdateUserProfileRequest request) {
        try {
            userService.updateUserProfile(userId, request);
            return ResponseEntity.ok(ApiResponse.success("用户信息更新成功", null));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error(500, e.getMessage()));
        }
    }
}
