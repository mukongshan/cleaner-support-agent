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
 */
export interface MediaFile {
  id: string;
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
  const response = await get<MediaFile[]>('/media/files', params);
  return response.data;
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
  const response = await get<FileAccessInfo>(`/media/files/${id}/access`);
  return response.data;
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
