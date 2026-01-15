/**
 * AI 智能问答相关 API
 */

import { get, post } from './request';
import { API_BASE_URL, getToken } from './config';

/**
 * AI 对话请求参数
 */
export interface AIChatParams {
  query: string;
  conversationId?: string;
  deviceInfo?: {
    model: string;
    errorCode?: string;
  };
}

/**
 * AI 对话响应（流式）
 */
export interface AIChatStreamEvent {
  event: 'message' | 'message_end';
  answer?: string;
  conversation_id?: string;
  metadata?: {
    retriever_resources?: any[];
  };
}

/**
 * 会话信息
 */
export interface Conversation {
  id: string;
  title: string;
  messageCount: number;
  updatedAt: string;
}

/**
 * 会话详情
 */
export interface ConversationDetail {
  id: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
}

/**
 * 发送 AI 对话消息（流式）
 * 使用 EventSource 或 fetch stream 处理 SSE
 */
export function sendAIMessage(
  params: AIChatParams,
  onMessage: (event: AIChatStreamEvent) => void,
  onError?: (error: Error) => void,
  onComplete?: () => void
): () => void {
  const token = getToken();
  const url = `${API_BASE_URL}/ai/chat`;

  // 使用 fetch 处理 SSE 流式响应
  const controller = new AbortController();
  
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(params),
    signal: controller.signal,
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Response body is null');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          onComplete?.();
          break;
        }

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              onMessage(data);
            } catch (e) {
              console.error('Failed to parse SSE data:', e);
            }
          }
        }
      }
    })
    .catch((error) => {
      if (error.name !== 'AbortError') {
        onError?.(error);
      }
    });

  // 返回取消函数
  return () => controller.abort();
}

/**
 * 获取历史会话列表
 */
export async function getConversations(): Promise<Conversation[]> {
  const response = await get<Conversation[]>('/ai/conversations');
  return response.data;
}

/**
 * 获取会话详情
 */
export async function getConversationDetail(conversationId: string): Promise<ConversationDetail> {
  const response = await get<ConversationDetail>(`/ai/conversations/${conversationId}`);
  return response.data;
}
