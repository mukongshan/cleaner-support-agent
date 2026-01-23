/**
 * HTTP 请求工具
 */

import { API_BASE_URL, getToken, clearToken, ApiResponse, RequestConfig } from './config';

/**
 * 统一请求方法
 */
export async function request<T = any>(
  url: string,
  config: RequestConfig = {}
): Promise<ApiResponse<T>> {
  const { skipAuth = false, ...fetchConfig } = config;

  // 构建完整 URL
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;

  // 设置请求头
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchConfig.headers,
  };

  // 添加认证 Token
  if (!skipAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    console.log('[API Request] 发起请求', {
      url: fullUrl,
      method: fetchConfig.method || 'GET',
      headers: Object.keys(headers),
      skipAuth
    });

    const response = await fetch(fullUrl, {
      ...fetchConfig,
      headers,
    });

    console.log('[API Request] 收到响应', {
      url: fullUrl,
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    // 解析响应
    const result: ApiResponse<T> = await response.json();

    console.log('[API Request] 响应数据', {
      url: fullUrl,
      code: result.code,
      message: result.message,
      hasData: !!result.data
    });

    // 处理未登录
    if (result.code === 401) {
      console.warn('[API Request] 未登录或登录已过期', { url: fullUrl });
      clearToken();
      // 可以在这里触发跳转到登录页
      window.location.href = '/login';
      throw new Error('未登录或登录已过期');
    }

    // 处理业务错误
    if (result.code !== 200) {
      console.error('[API Request] 业务错误', {
        url: fullUrl,
        code: result.code,
        message: result.message
      });
      throw new Error(result.message || '请求失败');
    }

    return result;
  } catch (error) {
    console.error('[API Request] 请求异常', {
      url: fullUrl,
      error,
      message: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
}

/**
 * GET 请求
 */
export function get<T = any>(url: string, params?: Record<string, any>, config?: RequestConfig): Promise<ApiResponse<T>> {
  // 构建查询字符串
  if (params) {
    // 过滤掉 null 和 undefined 值，避免在 URL 中出现 "null" 或 "undefined"
    const filteredParams: Record<string, string> = {};
    Object.keys(params).forEach(key => {
      const value = params[key];
      if (value !== null && value !== undefined) {
        filteredParams[key] = String(value);
      }
    });
    
    if (Object.keys(filteredParams).length > 0) {
      const queryString = new URLSearchParams(filteredParams).toString();
      url = `${url}?${queryString}`;
    }
  }

  return request<T>(url, {
    method: 'GET',
    ...config,
  });
}

/**
 * POST 请求
 */
export function post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
  return request<T>(url, {
    method: 'POST',
    body: JSON.stringify(data),
    ...config,
  });
}

/**
 * PUT 请求
 */
export function put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
  return request<T>(url, {
    method: 'PUT',
    body: JSON.stringify(data),
    ...config,
  });
}

/**
 * DELETE 请求
 */
export function del<T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
  return request<T>(url, {
    method: 'DELETE',
    ...config,
  });
}

/**
 * 上传文件
 */
export async function uploadFile(url: string, file: File, config?: RequestConfig): Promise<ApiResponse<any>> {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;

  const formData = new FormData();
  formData.append('file', file);

  const headers: HeadersInit = {
    ...config?.headers,
  };

  // 添加认证 Token
  if (!config?.skipAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(fullUrl, {
      method: 'POST',
      body: formData,
      headers,
      ...config,
    });

    const result = await response.json();

    if (result.code !== 200) {
      throw new Error(result.message || '上传失败');
    }

    return result;
  } catch (error) {
    console.error('File Upload Error:', error);
    throw error;
  }
}
