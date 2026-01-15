package org.backend.cleanersupportagentbackend.service;

import org.backend.cleanersupportagentbackend.dto.LoginRequest;
import org.backend.cleanersupportagentbackend.dto.LoginResponse;
import org.backend.cleanersupportagentbackend.dto.UpdateUserProfileRequest;
import org.backend.cleanersupportagentbackend.dto.UserProfileResponse;
import org.backend.cleanersupportagentbackend.entity.User;
import org.backend.cleanersupportagentbackend.repository.UserRepository;
import org.backend.cleanersupportagentbackend.util.IdGenerator;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * 用户登录
     * TODO: 实现密码加密验证和JWT token生成
     */
    @Transactional
    public LoginResponse login(LoginRequest request) {
        Optional<User> userOpt = userRepository.findByPhone(request.getUsername());
        
        if (userOpt.isEmpty()) {
            // 如果用户不存在，创建新用户（简化处理，实际应该先注册）
            User newUser = User.builder()
                    .userId(IdGenerator.generateUserId())
                    .phone(request.getUsername())
                    .password(request.getPassword()) // TODO: 加密存储
                    .nickname("用户" + request.getUsername().substring(7))
                    .memberTag("普通用户")
                    .role("user")
                    .build();
            userRepository.save(newUser);
            return LoginResponse.builder()
                    .token("mock_token_" + newUser.getUserId()) // TODO: 生成真实JWT
                    .userId(newUser.getUserId())
                    .nickname(newUser.getNickname())
                    .avatar(newUser.getAvatar())
                    .build();
        }

        User user = userOpt.get();
        // TODO: 验证密码
        return LoginResponse.builder()
                .token("mock_token_" + user.getUserId()) // TODO: 生成真实JWT
                .userId(user.getUserId())
                .nickname(user.getNickname())
                .avatar(user.getAvatar())
                .build();
    }

    /**
     * 获取用户信息
     */
    public UserProfileResponse getUserProfile(String userId) {
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        return UserProfileResponse.builder()
                .userId(user.getUserId())
                .nickname(user.getNickname())
                .avatar(user.getAvatar())
                .phone(user.getPhone())
                .memberTag(user.getMemberTag())
                .build();
    }

    /**
     * 更新用户信息
     */
    @Transactional
    public void updateUserProfile(String userId, UpdateUserProfileRequest request) {
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        if (request.getNickname() != null) {
            user.setNickname(request.getNickname());
        }
        if (request.getAvatar() != null) {
            user.setAvatar(request.getAvatar());
        }
        
        userRepository.save(user);
    }

    /**
     * 根据userId获取User实体
     */
    public User getUserByUserId(String userId) {
        return userRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
    }
}
