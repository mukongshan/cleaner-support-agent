/**
 * 媒体文件/知识文档相关 API
 */

import { get, uploadFile } from './request';

/**
 * 媒体文件类型
 */
export type MediaType = 'Article' | 'Video' | 'PDF';

/**
 * 媒体文件分类
 */
export type MediaCategory = 'maintenance' | 'guide' | 'demo' | 'shop';

/**
 * 媒体文件列表项
 */
export interface MediaFile {
  id: string;
  title: string;
  summary: string;
  type: MediaType;
  coverUrl?: string;
  duration?: string; // 视频特有
}

/**
 * 媒体文件详情
 */
export interface MediaFileDetail {
  id: string;
  content: string;
  mediaUrl: string;
  relateProducts?: string[];
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
  category?: MediaCategory;
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
 * 上传图片/视频
 */
export async function uploadMedia(file: File): Promise<UploadResponse> {
  const response = await uploadFile('/media/upload', file);
  return response.data;
}
