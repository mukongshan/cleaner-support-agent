/**
 * API 配置文件
 */

// API 基础路径
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/cleaner-support/v2';

// Token 存储键名
export const TOKEN_KEY = 'auth_token';
export const USER_INFO_KEY = 'user_info';

/** 删除历史对话前是否弹出确认（localStorage 键） */
export const CONFIRM_BEFORE_DELETE_HISTORY_KEY = 'confirm_before_delete_history';

/** 获取「删除历史对话前确认」设置，默认 true（显示确认弹窗） */
export function getConfirmBeforeDeleteHistory(): boolean {
  const v = localStorage.getItem(CONFIRM_BEFORE_DELETE_HISTORY_KEY);
  if (v === null) return true;
  return v === 'true';
}

/** 设置「删除历史对话前确认」 */
export function setConfirmBeforeDeleteHistory(value: boolean): void {
  localStorage.setItem(CONFIRM_BEFORE_DELETE_HISTORY_KEY, String(value));
}

/**
 * 获取存储的 Token
 */
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * 设置 Token
 */
export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * 清除 Token
 */
export const clearToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_INFO_KEY);
};

/** 未登录时回调（由 App 注册，用于弹出登录框而非跳转） */
let onUnauthorized: (() => void) | null = null;

/**
 * 注册未授权回调（如弹出登录框）
 */
export function setOnUnauthorized(fn: () => void): void {
  onUnauthorized = fn;
}

/**
 * 未登录/登录过期时统一处理：清除本地登录态并跳转登录（或执行已注册的回调）
 */
export function handleUnauthorized(): void {
  clearToken();
  if (onUnauthorized) {
    onUnauthorized();
  } else {
    window.location.href = '/login';
  }
}

/**
 * 获取存储的用户信息
 */
export const getUserInfo = (): any => {
  const userInfo = localStorage.getItem(USER_INFO_KEY);
  return userInfo ? JSON.parse(userInfo) : null;
};

/**
 * 设置用户信息
 */
export const setUserInfo = (userInfo: any): void => {
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
};

/**
 * 通用响应结构
 */
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

/**
 * 请求配置
 */
export interface RequestConfig extends RequestInit {
  skipAuth?: boolean; // 是否跳过认证
}
