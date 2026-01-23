/**
 * 媒体文件/知识文档相关 API
 */

import { get, uploadFile } from './request';
import { API_BASE_URL } from './config';

/**
 * 媒体文件类型
 */
export type MediaType = 'Article' | 'Video' | 'PDF' | 'Image' | 'Excel' | 'PPT';

/**
 * 媒体文件分类
 */
export type MediaCategory = 'maintenance' | 'sales' | 'company' | 'product' | 'training' | 'all';

/**
 * 媒体文件列表项
 * 注意：id 字段就是 fileId（业务ID），格式如 KB123456，不要与数据库主键混淆
 */
export interface MediaFile {
  id: string; // 业务ID（fileId），格式如 KB123456，用于API接口调用
  title: string;
  type: string;
  coverUrl?: string;
}

/**
 * 媒体文件详情
 */
export interface MediaFileDetail {
  id: string;
  mediaUrl?: string;
  previewUrl?: string;
  downloadUrl?: string;
  isViewable?: boolean;
}

/**
 * 文件访问信息
 */
export interface FileAccessInfo {
  fileId: string;
  title: string;
  isViewable: boolean;
  previewUrl?: string;
  downloadUrl?: string;
  repoToken?: string;
}

/**
 * 文件重定向信息（包含 URL 和 repoToken）
 */
export interface FileRedirectInfo {
  url: string;
  repoToken: string;
  title: string;
  isPreview: boolean;
}

/**
 * 上传响应
 */
export interface UploadResponse {
  url: string;
  fileType: 'image' | 'video';
}

/**
 * 搜索/获取媒体文件列表
 */
export async function getMediaFiles(params?: {
  category?: string;
  query?: string;
}): Promise<MediaFile[]> {
  console.log('[API] getMediaFiles 请求参数:', params);
  try {
    const response = await get<MediaFile[]>('/media/files', params);
    console.log('[API] getMediaFiles 响应:', {
      code: response.code,
      message: response.message,
      dataLength: response.data?.length || 0,
      data: response.data
    });
    return response.data || [];
  } catch (error) {
    console.error('[API] getMediaFiles 请求失败:', error);
    throw error;
  }
}

/**
 * 获取媒体文件详情
 */
export async function getMediaFileDetail(id: string): Promise<MediaFileDetail> {
  const response = await get<MediaFileDetail>(`/media/files/${id}`);
  return response.data;
}

/**
 * 获取文件访问信息
 */
export async function getFileAccessInfo(id: string): Promise<FileAccessInfo> {
  console.log('[API] getFileAccessInfo 请求参数:', { id });
  try {
    const response = await get<FileAccessInfo>(`/media/files/${id}/access`);
    console.log('[API] getFileAccessInfo 响应:', {
      code: response.code,
      message: response.message,
      data: response.data
    });
    return response.data;
  } catch (error) {
    console.error('[API] getFileAccessInfo 请求失败:', {
      error,
      id
    });
    throw error;
  }
}

/**
 * 预览文件（获取 URL 和 repoToken 后重定向）
 */
export async function previewFile(id: string): Promise<void> {
  try {
    console.log('[API] previewFile 请求参数:', { id });
    const response = await get<FileRedirectInfo>(`/media/files/${id}/preview`);
    console.log('[API] previewFile 响应:', {
      code: response.code,
      message: response.message,
      data: response.data
    });

    if (response.code === 200 && response.data) {
      const { url, repoToken } = response.data;
      // 在新窗口打开预览链接
      // 如果需要使用 repoToken 进行认证，可以在 URL 中添加参数或使用其他方式
      window.open(url, '_blank');
    } else {
      console.error('[API] previewFile 失败:', response.message);
      throw new Error(response.message || '预览失败');
    }
  } catch (error) {
    console.error('[API] previewFile 请求失败:', error);
    throw error;
  }
}

/**
 * 下载文件（获取 URL 和 repoToken 后重定向）
 */
export async function downloadFile(id: string): Promise<void> {
  try {
    console.log('[API] downloadFile 请求参数:', { id });
    const response = await get<FileRedirectInfo>(`/media/files/${id}/download`);
    console.log('[API] downloadFile 响应:', {
      code: response.code,
      message: response.message,
      data: response.data
    });

    if (response.code === 200 && response.data) {
      const { url, repoToken } = response.data;
      // 重定向到下载链接
      // 如果需要使用 repoToken 进行认证，可以在 URL 中添加参数或使用其他方式
      window.location.href = url;
    } else {
      console.error('[API] downloadFile 失败:', response.message);
      throw new Error(response.message || '下载失败');
    }
  } catch (error) {
    console.error('[API] downloadFile 请求失败:', error);
    throw error;
  }
}

/**
 * 上传图片/视频
 */
export async function uploadMedia(file: File): Promise<UploadResponse> {
  const response = await uploadFile('/media/upload', file);
  return response.data;
}
