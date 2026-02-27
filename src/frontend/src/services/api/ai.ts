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
    /** 带图用户消息的图片地址，历史记录中用于展示图片而非描述 */
    imageUrl?: string;
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

  console.log('🚀 sendAIMessage 函数开始执行');
  console.log('📍 请求URL:', url);
  console.log('🔑 Token:', token ? '存在' : '不存在');
  console.log('📦 请求参数:', params);

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
      console.log('📨 收到响应:', response.status, response.statusText);
      console.log('📄 响应头:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ HTTP 错误响应:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        console.error('❌ Response body 为 null');
        throw new Error('Response body is null');
      }

      console.log('✅ 开始读取流式数据');

      let buffer = ''; // 用于累积可能被分割的数据

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          // 处理缓冲区中剩余的数据
          if (buffer.trim()) {
            const lines = buffer.split('\n');
            for (const line of lines) {
              if (line.startsWith('data:')) {
                try {
                  const jsonStr = line.slice(5).trim();
                  if (jsonStr) {
                    const data = JSON.parse(jsonStr);
                    console.log('✅ 解析 SSE 数据成功（缓冲区）:', data);
                    onMessage(data);
                  }
                } catch (e) {
                  console.error('❌ 解析 SSE 数据失败（缓冲区）:', line.substring(0, 200), e);
                }
              }
            }
          }
          console.log('✅ 流式数据读取完成');
          onComplete?.();
          break;
        }

        // 解码数据并添加到缓冲区
        buffer += decoder.decode(value, { stream: true });
        console.log('📦 收到数据块，缓冲区大小:', buffer.length);
        
        // 按行分割处理（保留最后一行在缓冲区中，因为它可能不完整）
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          // 处理 SSE 数据行，支持 "data: " 和 "data:" 两种格式
          if (line.startsWith('data:')) {
            try {
              // 去掉 "data:" 前缀，同时去除可能的空格
              const jsonStr = line.slice(5).trim();
              if (jsonStr) {
                try {
                  const data = JSON.parse(jsonStr);
                  console.log('✅ 解析 SSE 数据成功:', data);
                  onMessage(data);
                } catch (parseError: any) {
                  // JSON解析失败，记录详细信息以便调试
                  console.error('❌ 解析 SSE JSON 失败:', {
                    error: parseError.message,
                    jsonStr: jsonStr.substring(0, 200),
                    jsonLength: jsonStr.length
                  });
                }
              }
            } catch (e) {
              console.error('❌ 处理 SSE data 行失败:', line.substring(0, 200), e);
            }
          }
        }
      }
    })
    .catch((error) => {
      console.error('❌ Fetch 错误:', error);
      console.error('错误名称:', error.name);
      console.error('错误消息:', error.message);
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
