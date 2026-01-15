package org.backend.cleanersupportagentbackend;

import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * MediaController 相关接口测试：
 * - GET  /media/files
 * - GET  /media/files/{id}
 * - POST /media/upload
 */
class MediaControllerTest extends BaseControllerTest {

    @Test
    void listFiles_shouldBePublic() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/cleaner-support/v2/media/files"))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        assertThat(json.get("code").asInt()).isEqualTo(200);
        assertThat(json.get("data").isArray()).isTrue();
    }

    @Test
    void fileDetail_shouldReturnErrorForUnknownId() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/cleaner-support/v2/media/files/{id}", "KB_NOT_EXISTS"))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        // 当前实现会抛 RuntimeException("文件不存在")，被 Controller 转成 code=500
        assertThat(json.get("code").asInt()).isEqualTo(500);
    }

    @Test
    void upload_shouldRequireAuth_andWorkWithAuth() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "a.jpg",
                "image/jpeg",
                "fake-image-content".getBytes()
        );

        // without auth -> interceptor returns code 401 with HTTP 200
        MvcResult unauth = mockMvc.perform(multipart("/api/cleaner-support/v2/media/upload").file(file))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode unauthJson = objectMapper.readTree(unauth.getResponse().getContentAsString());
        assertThat(unauthJson.get("code").asInt()).isEqualTo(401);

        // with auth -> success
        String bearer = loginAndGetBearerToken();
        MvcResult ok = mockMvc.perform(multipart("/api/cleaner-support/v2/media/upload")
                        .file(file)
                        .header("Authorization", bearer))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode okJson = objectMapper.readTree(ok.getResponse().getContentAsString());
        assertThat(okJson.get("code").asInt()).isEqualTo(200);
        assertThat(okJson.get("data").get("fileType").asText()).isEqualTo("image");
        assertThat(okJson.get("data").get("url").asText()).contains("/api/cleaner-support/v2/media/files/");
    }
}

