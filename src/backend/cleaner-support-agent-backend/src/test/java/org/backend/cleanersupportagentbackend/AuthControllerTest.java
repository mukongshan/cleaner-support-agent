package org.backend.cleanersupportagentbackend;

import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * AuthController 相关接口测试：
 * - POST /users/login
 * - GET  /users/profile
 * - PUT  /users/profile
 */
class AuthControllerTest extends BaseControllerTest {

    @Test
    void login_shouldReturnToken() throws Exception {
        String bearer = loginAndGetBearerToken();
        assertThat(bearer).startsWith("Bearer mock_token_");
    }

    @Test
    void profile_shouldBeUnauthorizedWithoutToken() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/cleaner-support/v2/users/profile"))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        assertThat(json.get("code").asInt()).isEqualTo(401);
    }

    @Test
    void profile_getAndUpdate_shouldWorkWithToken() throws Exception {
        String bearer = loginAndGetBearerToken();

        // GET profile
        MvcResult getResult = mockMvc.perform(get("/api/cleaner-support/v2/users/profile")
                        .header("Authorization", bearer))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode getJson = objectMapper.readTree(getResult.getResponse().getContentAsString());
        assertThat(getJson.get("code").asInt()).isEqualTo(200);
        assertThat(getJson.get("data").get("phone").asText()).isEqualTo("13800138000");

        // PUT profile
        String updateBody = """
                {
                  "nickname": "新昵称",
                  "avatar": "https://cdn.com/new_avatar.jpg"
                }
                """;
        MvcResult putResult = mockMvc.perform(put("/api/cleaner-support/v2/users/profile")
                        .header("Authorization", bearer)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateBody))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode putJson = objectMapper.readTree(putResult.getResponse().getContentAsString());
        assertThat(putJson.get("code").asInt()).isEqualTo(200);

        // GET profile again
        MvcResult getResult2 = mockMvc.perform(get("/api/cleaner-support/v2/users/profile")
                        .header("Authorization", bearer))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode getJson2 = objectMapper.readTree(getResult2.getResponse().getContentAsString());
        assertThat(getJson2.get("code").asInt()).isEqualTo(200);
        assertThat(getJson2.get("data").get("nickname").asText()).isEqualTo("新昵称");
        assertThat(getJson2.get("data").get("avatar").asText()).isEqualTo("https://cdn.com/new_avatar.jpg");
    }
}

