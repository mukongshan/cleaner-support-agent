package org.backend.cleanersupportagentbackend;

import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * TicketController 相关接口测试：
 * - POST /tickets
 * - GET  /tickets
 * - GET  /tickets/{ticketId}
 * - PUT  /tickets/{ticketId}
 */
class TicketControllerTest extends BaseControllerTest {

    @Test
    void tickets_crud_shouldWorkWithAuth() throws Exception {
        String bearer = loginAndGetBearerToken();

        // create ticket
        String createBody = """
                {
                  "title": "传感器持续报错",
                  "description": "已清理但无效，需报修",
                  "priority": "medium",
                  "relatedChatId": "conv_123",
                  "attachmentUrls": ["https://example.com/a.jpg"]
                }
                """;
        MvcResult createResult = mockMvc.perform(post("/api/cleaner-support/v2/tickets")
                        .header("Authorization", bearer)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createBody))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode createJson = objectMapper.readTree(createResult.getResponse().getContentAsString());
        assertThat(createJson.get("code").asInt()).isEqualTo(200);
        String ticketId = createJson.get("data").get("ticketId").asText();
        assertThat(ticketId).startsWith("WO");

        // list tickets
        MvcResult listResult = mockMvc.perform(get("/api/cleaner-support/v2/tickets")
                        .header("Authorization", bearer))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode listJson = objectMapper.readTree(listResult.getResponse().getContentAsString());
        assertThat(listJson.get("code").asInt()).isEqualTo(200);
        assertThat(listJson.get("data").isArray()).isTrue();

        // get ticket detail
        MvcResult detailResult = mockMvc.perform(get("/api/cleaner-support/v2/tickets/{id}", ticketId)
                        .header("Authorization", bearer))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode detailJson = objectMapper.readTree(detailResult.getResponse().getContentAsString());
        assertThat(detailJson.get("code").asInt()).isEqualTo(200);
        assertThat(detailJson.get("data").get("ticketId").asText()).isEqualTo(ticketId);

        // update ticket status
        String updateBody = """
                {
                  "status": "completed",
                  "comments": "问题已解决"
                }
                """;
        MvcResult updateResult = mockMvc.perform(put("/api/cleaner-support/v2/tickets/{id}", ticketId)
                        .header("Authorization", bearer)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateBody))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode updateJson = objectMapper.readTree(updateResult.getResponse().getContentAsString());
        assertThat(updateJson.get("code").asInt()).isEqualTo(200);

        // get ticket detail again, should reflect status change
        MvcResult detailResult2 = mockMvc.perform(get("/api/cleaner-support/v2/tickets/{id}", ticketId)
                        .header("Authorization", bearer))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode detailJson2 = objectMapper.readTree(detailResult2.getResponse().getContentAsString());
        assertThat(detailJson2.get("code").asInt()).isEqualTo(200);
        assertThat(detailJson2.get("data").get("status").asText()).isEqualTo("completed");
        assertThat(detailJson2.get("data").get("comments").asText()).isEqualTo("问题已解决");
    }
}

