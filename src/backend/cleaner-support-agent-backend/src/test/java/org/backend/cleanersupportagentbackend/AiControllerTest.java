package org.backend.cleanersupportagentbackend;

import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * AiController 相关接口测试：
 * - POST /ai/chat (SSE)
 * - GET  /ai/conversations
 * - GET  /ai/conversations/{conversationId}
 */
class AiControllerTest extends BaseControllerTest {

    @Test
    void conversations_shouldRequireAuth() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/cleaner-support/v2/ai/conversations"))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        assertThat(json.get("code").asInt()).isEqualTo(401);
    }

    @Test
    void chat_shouldReturnEventStream() throws Exception {
        String bearer = loginAndGetBearerToken();
        String body = """
                {
                  "query": "主刷卷入地毯了怎么办？"
                }
                """;

        // 这里只验证 content-type，因为 SSE 内容是模拟文本，且不同实现可能略有差异
        mockMvc.perform(post("/api/cleaner-support/v2/ai/chat")
                        .header("Authorization", bearer)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_EVENT_STREAM));
    }

    @Test
    void conversations_listAndDetail_shouldWorkAfterChat() throws Exception {
        String bearer = loginAndGetBearerToken();

        // create one chat -> should create conversation + messages
        String chatBody = """
                {
                  "query": "如何清理主刷？"
                }
                """;
        mockMvc.perform(post("/api/cleaner-support/v2/ai/chat")
                        .header("Authorization", bearer)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(chatBody))
                .andExpect(status().isOk());

        // list conversations
        MvcResult listResult = mockMvc.perform(get("/api/cleaner-support/v2/ai/conversations")
                        .header("Authorization", bearer))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode listJson = objectMapper.readTree(listResult.getResponse().getContentAsString());
        assertThat(listJson.get("code").asInt()).isEqualTo(200);
        assertThat(listJson.get("data").isArray()).isTrue();
        assertThat(listJson.get("data").size()).isGreaterThanOrEqualTo(1);

        String conversationId = listJson.get("data").get(0).get("id").asText();
        assertThat(conversationId).startsWith("conv_");

        // get conversation detail
        MvcResult detailResult = mockMvc.perform(get("/api/cleaner-support/v2/ai/conversations/{id}", conversationId)
                        .header("Authorization", bearer))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode detailJson = objectMapper.readTree(detailResult.getResponse().getContentAsString());
        assertThat(detailJson.get("code").asInt()).isEqualTo(200);
        assertThat(detailJson.get("data").get("id").asText()).isEqualTo(conversationId);
        assertThat(detailJson.get("data").get("messages").isArray()).isTrue();
        assertThat(detailJson.get("data").get("messages").size()).isGreaterThanOrEqualTo(2);
    }
}

