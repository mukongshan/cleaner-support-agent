package org.backend.cleanersupportagentbackend.entity;

/**
 * 图片识别状态枚举
 */
public enum RecognitionStatus {
    pending,      // 待识别
    processing,   // 识别中
    completed,    // 识别完成
    failed        // 识别失败
}
