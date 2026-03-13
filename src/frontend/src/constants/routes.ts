/**
 * 路由路径常量与 Tab 映射
 * 禁止在组件中手写路径字符串，统一从此文件引用。
 */

/** 路径常量 */
export const ROUTES = {
  /** 问答 */
  CHAT: '/chat',
  /** 知识库 */
  KNOWLEDGE: '/knowledge',
  /** 知识详情（暂不启用，待产品确认） */
  KNOWLEDGE_DETAIL: '/knowledge/:id',
  /** 工单列表 */
  TICKETS: '/tickets',
  /** 工单详情，使用 ROUTES.ticketDetail(id) 生成具体路径 */
  TICKET_DETAIL: '/tickets/:id',
  /** 个人中心 */
  PROFILE: '/profile',
  /** 登录 */
  LOGIN: '/login',
  /** 注册 */
  REGISTER: '/register',
} as const;

/** 生成工单详情路径 */
export function ticketDetailPath(id: string): string {
  return `/tickets/${encodeURIComponent(id)}`;
}

/** 底部 Tab 与 path 的对应（仅主 Tab，不含详情等子页） */
export const TAB_PATHS = ['/chat', '/knowledge', '/tickets', '/profile'] as const;
export type TabPath = (typeof TAB_PATHS)[number];

/** pathname 到 Tab 高亮键 */
export function pathnameToTab(pathname: string): TabPath | null {
  if (pathname === '/chat' || pathname.startsWith('/chat/')) return '/chat';
  if (pathname === '/knowledge' || pathname.startsWith('/knowledge/')) return '/knowledge';
  if (pathname === '/tickets' || pathname.startsWith('/tickets/')) return '/tickets';
  if (pathname === '/profile' || pathname.startsWith('/profile/')) return '/profile';
  return null;
}

/** 需登录才能访问的路径前缀（除登录/注册外） */
export const AUTH_REQUIRED_PATHS = [] as const;

export function isAuthRequiredPath(pathname: string): boolean {
  return AUTH_REQUIRED_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
}
