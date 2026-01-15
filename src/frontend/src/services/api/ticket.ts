/**
 * 工单管理相关 API
 */

import { get, post, put } from './request';

/**
 * 工单状态
 */
export type TicketStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

/**
 * 工单优先级
 */
export type TicketPriority = 'low' | 'medium' | 'high';

/**
 * 创建工单参数
 */
export interface CreateTicketParams {
  title: string;
  description: string;
  priority: TicketPriority;
  relatedChatId?: string;
  attachmentUrls?: string[];
}

/**
 * 创建工单响应
 */
export interface CreateTicketResponse {
  ticketId: string;
  status: TicketStatus;
}

/**
 * 工单列表项
 */
export interface TicketListItem {
  ticketId: string;
  title: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  engineerName?: string;
  estimatedTime?: string;
}

/**
 * 工单详情
 */
export interface TicketDetail {
  ticketId: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  updatedAt: string;
  engineerName?: string;
  estimatedTime?: string;
  attachments?: string[];
}

/**
 * 更新工单参数
 */
export interface UpdateTicketParams {
  status?: TicketStatus;
  comments?: string;
}

/**
 * 创建服务工单
 */
export async function createTicket(params: CreateTicketParams): Promise<CreateTicketResponse> {
  const response = await post<CreateTicketResponse>('/tickets', params);
  return response.data;
}

/**
 * 获取工单列表
 */
export async function getTickets(status?: TicketStatus): Promise<TicketListItem[]> {
  const params = status ? { status } : undefined;
  const response = await get<TicketListItem[]>('/tickets', params);
  return response.data;
}

/**
 * 获取工单详情
 */
export async function getTicketDetail(ticketId: string): Promise<TicketDetail> {
  const response = await get<TicketDetail>(`/tickets/${ticketId}`);
  return response.data;
}

/**
 * 更新工单状态
 */
export async function updateTicket(ticketId: string, params: UpdateTicketParams): Promise<void> {
  await put(`/tickets/${ticketId}`, params);
}
