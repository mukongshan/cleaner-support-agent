package org.backend.cleanersupportagentbackend.util;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

/**
 * ID生成工具类
 */
public class IdGenerator {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd");

    /**
     * 生成用户ID：U + 时间戳后6位 + 随机4位
     */
    public static String generateUserId() {
        String timestamp = String.valueOf(System.currentTimeMillis());
        String suffix = timestamp.substring(timestamp.length() - 6);
        String random = UUID.randomUUID().toString().substring(0, 4).replace("-", "");
        return "U" + suffix + random.toUpperCase();
    }

    /**
     * 生成会话ID：conv_ + UUID前8位
     */
    public static String generateConversationId() {
        return "conv_" + UUID.randomUUID().toString().replace("-", "").substring(0, 8);
    }

    /**
     * 生成工单ID：WO + 日期 + 序号（3位）
     */
    public static String generateTicketId() {
        String date = LocalDateTime.now().format(DATE_FORMATTER);
        String sequence = String.format("%03d", (int)(Math.random() * 1000));
        return "WO" + date + sequence;
    }

    /**
     * 生成文件ID：KB + UUID前6位
     */
    public static String generateFileId() {
        return "KB" + UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase();
    }

    /**
     * 生成图片识别ID：IMG + 日期(8位) + 序号(3位)
     */
    public static String generateRecognitionId() {
        String date = LocalDateTime.now().format(DATE_FORMATTER);
        String sequence = String.format("%03d", (int)(Math.random() * 1000));
        return "IMG" + date + sequence;
    }
}
