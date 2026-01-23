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
 * @param file 图片文件
 * @param signal 可选的AbortSignal用于取消请求
 */
export async function uploadAndRecognizeImage(
  file: File,
  signal?: AbortSignal
): Promise<ImageRecognitionResponse> {
  const startTime = Date.now();
  const token = getToken();
  const url = `${API_BASE_URL}/image-reco`;

  console.log('[API] [图片识别] 开始上传图片', {
    url,
    fileName: file.name,
    fileSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
    fileType: file.type,
    hasToken: !!token,
    hasSignal: !!signal,
    signalAborted: signal?.aborted,
    timestamp: new Date().toISOString()
  });

  const formData = new FormData();
  formData.append('image', file);
  console.log('[API] [图片识别] FormData 已创建', {
    fileName: file.name,
    formDataKeys: Array.from(formData.keys())
  });

  try {
    console.log('[API] [图片识别] 发起 fetch 请求', {
      url,
      method: 'POST',
      hasSignal: !!signal
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
      signal, // 支持取消请求
    });

    const fetchDuration = Date.now() - startTime;
    console.log('[API] [图片识别] fetch 请求完成', {
      url,
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      duration: `${fetchDuration}ms`,
      headers: Object.fromEntries(response.headers.entries())
    });

    // 检查请求是否被取消
    if (signal?.aborted) {
      console.warn('[API] [图片识别] 请求已被取消', {
        url,
        duration: `${Date.now() - startTime}ms`
      });
      throw new Error('请求已取消');
    }

    // 检查HTTP状态码
    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error('[API] [图片识别] HTTP 错误', {
        url,
        status: response.status,
        statusText: response.statusText,
        errorText: errorText.substring(0, 200),
        duration: `${Date.now() - startTime}ms`
      });
      throw new Error(`HTTP错误: ${response.status} - ${errorText || '图片识别失败'}`);
    }

    console.log('[API] [图片识别] 开始解析响应 JSON', { url });
    const result = await response.json();
    const parseDuration = Date.now() - startTime;

    console.log('[API] [图片识别] 响应解析完成', {
      url,
      code: result.code,
      message: result.message,
      hasData: !!result.data,
      dataKeys: result.data ? Object.keys(result.data) : [],
      duration: `${parseDuration}ms`
    });

    if (result.code !== 200) {
      console.error('[API] [图片识别] 业务错误', {
        url,
        code: result.code,
        message: result.message,
        duration: `${Date.now() - startTime}ms`
      });
      throw new Error(result.message || '图片识别失败');
    }

    const totalDuration = Date.now() - startTime;
    console.log('[API] [图片识别] 上传和识别成功', {
      url,
      recognitionId: result.data?.recognitionId,
      imageUrl: result.data?.imageUrl,
      status: result.data?.status,
      description: result.data?.description?.substring(0, 50) + '...',
      totalDuration: `${totalDuration}ms`
    });

    return result.data;
  } catch (error: any) {
    const errorDuration = Date.now() - startTime;
    
    if (error.name === 'AbortError' || error.message === '请求已取消') {
      console.warn('[API] [图片识别] 请求被取消', {
        url,
        errorName: error.name,
        errorMessage: error.message,
        duration: `${errorDuration}ms`
      });
      throw error;
    }

    console.error('[API] [图片识别] 上传和识别失败', {
      url,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack?.substring(0, 500)
      },
      duration: `${errorDuration}ms`
    });
    
    throw error;
  }
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
