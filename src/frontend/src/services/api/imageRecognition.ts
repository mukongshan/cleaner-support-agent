/**
 * 图片识别相关 API
 */

import { get, post } from './request';
import { API_BASE_URL, getToken } from './config';

/**
 * 图片识别响应
 */
export interface ImageRecognitionResponse {
  recognitionId: string;
  imageUrl: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
}

/**
 * 图片识别历史响应（分页）
 */
export interface ImageRecognitionHistoryResponse {
  total: number;
  page: number;
  size: number;
  items: ImageRecognitionResponse[];
}

/**
 * 基于图片的AI对话请求参数
 */
export interface ChatWithImageParams {
  recognitionId: string;
  query?: string;
  conversationId?: string;
}

/**
 * 上传图片并识别
 */
export async function uploadAndRecognizeImage(file: File): Promise<ImageRecognitionResponse> {
  const token = getToken();
  const url = `${API_BASE_URL}/image-reco`;

  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  const result = await response.json();

  if (result.code !== 200) {
    throw new Error(result.message || '图片识别失败');
  }

  return result.data;
}

/**
 * 获取图片识别历史
 */
export async function getImageRecognitionHistory(params?: {
  status?: string;
  page?: number;
  size?: number;
}): Promise<ImageRecognitionHistoryResponse> {
  const response = await get<ImageRecognitionHistoryResponse>('/image-reco/history', params);
  return response.data;
}

/**
 * 基于图片识别结果进行AI对话（流式）
 */
export function sendAIMessageWithImage(
  params: ChatWithImageParams,
  onMessage: (event: { event: 'message' | 'message_end'; answer?: string; conversation_id?: string; metadata?: any }) => void,
  onError?: (error: Error) => void,
  onComplete?: () => void
): () => void {
  const token = getToken();
  const url = `${API_BASE_URL}/ai/chat/with-image`;

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
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
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
          if (line.startsWith('data:')) {
            try {
              const jsonStr = line.slice(5).trim();
              if (jsonStr) {
                const data = JSON.parse(jsonStr);
                onMessage(data);
              }
            } catch (e) {
              console.error('解析 SSE 数据失败:', line, e);
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
