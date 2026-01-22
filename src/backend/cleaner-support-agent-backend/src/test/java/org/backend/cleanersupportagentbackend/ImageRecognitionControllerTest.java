package org.backend.cleanersupportagentbackend;

import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * ImageRecognitionController 相关接口测试：
 * - POST /image-reco (上传图片并识别)
 * - GET  /image-reco/history (获取识别历史)
 * - POST /ai/chat/with-image (基于图片的AI对话)
 */
class ImageRecognitionControllerTest extends BaseControllerTest {

    @Test
    void uploadAndRecognize_shouldRequireAuth() throws Exception {
        // 创建一个模拟的图片文件
        MockMultipartFile imageFile = new MockMultipartFile(
                "image",
                "test.jpg",
                MediaType.IMAGE_JPEG_VALUE,
                "fake image content".getBytes()
        );

        MvcResult result = mockMvc.perform(multipart("/api/cleaner-support/v2/image-reco")
                        .file(imageFile))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        assertThat(json.get("code").asInt()).isEqualTo(401);
    }

    @Test
    void uploadAndRecognize_shouldRejectInvalidFormat() throws Exception {
        String bearer = loginAndGetBearerToken();

        // 创建一个不支持的文件格式
        MockMultipartFile invalidFile = new MockMultipartFile(
                "image",
                "test.txt",
                MediaType.TEXT_PLAIN_VALUE,
                "not an image".getBytes()
        );

        MvcResult result = mockMvc.perform(multipart("/api/cleaner-support/v2/image-reco")
                        .file(invalidFile)
                        .header("Authorization", bearer))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        // 应该返回400错误（格式不支持）
        assertThat(json.get("code").asInt()).isEqualTo(400);
    }

    @Test
    void getHistory_shouldRequireAuth() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/cleaner-support/v2/image-reco/history"))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        assertThat(json.get("code").asInt()).isEqualTo(401);
    }

    @Test
    void getHistory_shouldReturnEmptyListForNewUser() throws Exception {
        String bearer = loginAndGetBearerToken();

        MvcResult result = mockMvc.perform(get("/api/cleaner-support/v2/image-reco/history")
                        .header("Authorization", bearer))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        assertThat(json.get("code").asInt()).isEqualTo(200);
        assertThat(json.get("data").get("items").isArray()).isTrue();
        assertThat(json.get("data").get("total").asLong()).isEqualTo(0);
    }

    @Test
    void chatWithImage_shouldRequireAuth() throws Exception {
        String body = """
                {
                  "recognitionId": "IMG20240120001",
                  "query": "这个问题怎么解决？"
                }
                """;

        MvcResult result = mockMvc.perform(
                        org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/cleaner-support/v2/ai/chat/with-image")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(body))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        assertThat(json.get("code").asInt()).isEqualTo(401);
    }
}
