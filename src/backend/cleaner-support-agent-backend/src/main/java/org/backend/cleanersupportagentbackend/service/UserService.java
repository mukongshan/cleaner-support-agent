package org.backend.cleanersupportagentbackend.service;

import org.backend.cleanersupportagentbackend.dto.LoginRequest;
import org.backend.cleanersupportagentbackend.dto.LoginResponse;
import org.backend.cleanersupportagentbackend.dto.RegisterRequest;
import org.backend.cleanersupportagentbackend.dto.UpdateUserProfileRequest;
import org.backend.cleanersupportagentbackend.dto.UserProfileResponse;
import org.backend.cleanersupportagentbackend.entity.User;
import org.backend.cleanersupportagentbackend.repository.UserRepository;
import org.backend.cleanersupportagentbackend.util.IdGenerator;
import org.backend.cleanersupportagentbackend.util.TokenUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final TokenUtil tokenUtil;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, TokenUtil tokenUtil, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.tokenUtil = tokenUtil;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * 用户注册
     */
    @Transactional
    public LoginResponse register(RegisterRequest request) {
        // 检查手机号是否已存在
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new RuntimeException("该手机号已被注册");
        }
        
        // 验证密码不为空
        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            throw new RuntimeException("密码不能为空");
        }
        
        // 生成默认昵称（如果未提供）
        String nickname = request.getNickname();
        if (nickname == null || nickname.trim().isEmpty()) {
            // 从手机号后4位生成默认昵称
            String phone = request.getPhone();
            nickname = "用户" + (phone.length() >= 4 ? phone.substring(phone.length() - 4) : phone);
        }
        
        // 加密密码
        String encodedPassword = passwordEncoder.encode(request.getPassword());
        
        // 创建新用户
        User newUser = User.builder()
                .userId(IdGenerator.generateUserId())
                .phone(request.getPhone())
                .password(encodedPassword)
                .nickname(nickname)
                .memberTag("普通用户")
                .role("user")
                .build();
        userRepository.save(newUser);
        
        // 生成JWT token
        String token = tokenUtil.generateToken(newUser.getUserId());
        
        return LoginResponse.builder()
                .token(token)
                .userId(newUser.getUserId())
                .nickname(newUser.getNickname())
                .avatar(newUser.getAvatar())
                .build();
    }

    /**
     * 用户登录
     */
    @Transactional
    public LoginResponse login(LoginRequest request) {
        Optional<User> userOpt = userRepository.findByPhone(request.getUsername());
        
        if (userOpt.isEmpty()) {
            throw new RuntimeException("用户名或密码错误");
        }

        User user = userOpt.get();
        
        // 验证密码
        if (request.getPassword() == null || 
            !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("用户名或密码错误");
        }
        
        // 生成JWT token
        String token = tokenUtil.generateToken(user.getUserId());
        
        return LoginResponse.builder()
                .token(token)
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
