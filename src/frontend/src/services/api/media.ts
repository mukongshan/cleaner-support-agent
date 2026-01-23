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
 * 预览文件（重定向）
 */
export function previewFile(id: string): void {
  window.open(`${API_BASE_URL}/media/files/${id}/preview`, '_blank');
}

/**
 * 下载文件（重定向）
 */
export function downloadFile(id: string): void {
  window.location.href = `${API_BASE_URL}/media/files/${id}/download`;
}

/**
 * 上传图片/视频
 */
export async function uploadMedia(file: File): Promise<UploadResponse> {
  const response = await uploadFile('/media/upload', file);
  return response.data;
}
