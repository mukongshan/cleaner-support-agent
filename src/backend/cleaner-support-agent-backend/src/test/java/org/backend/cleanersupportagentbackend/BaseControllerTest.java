package org.backend.cleanersupportagentbackend;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * 控制层集成测试基类：
 * - 提供 MockMvc / ObjectMapper
 * - 提供登录并获取 Bearer token 的工具方法
 */
@SpringBootTest
@AutoConfigureMockMvc
public abstract class BaseControllerTest {

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;

    /**
     * 调用登录接口，返回带 Bearer 前缀的 token 字符串。
     */
    protected String loginAndGetBearerToken() throws Exception {
        String body = """
                {
                  "username": "13800138000",
                  "password": "pwd",
                  "loginType": "password"
                }
                """;

        MvcResult result = mockMvc.perform(post("/api/cleaner-support/v2/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andReturn();

        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        assertThat(json.get("code").asInt()).isEqualTo(200);
        String token = json.get("data").get("token").asText();
        assertThat(token).isNotBlank();
        return "Bearer " + token;
    }
}

