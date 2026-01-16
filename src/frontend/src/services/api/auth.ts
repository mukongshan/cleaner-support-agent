/**
 * 用户认证相关 API
 */

import { get, post, put } from './request';
import { setToken, setUserInfo } from './config';

/**
 * 登录参数
 */
export interface LoginParams {
  username: string;
  password: string;
  loginType: 'sms' | 'password';
}

/**
 * 注册参数（前端）
 */
export interface RegisterParams {
  username: string;
  password: string;
  confirmPassword: string;
}

/**
 * 注册请求参数（后端）
 */
interface RegisterBackendParams {
  phone: string;
  password: string;
  nickname?: string;
}

/**
 * 登录响应
 */
export interface LoginResponse {
  token: string;
  userId: string;
  nickname: string;
  avatar: string;
}

/**
 * 用户信息
 */
export interface UserProfile {
  userId: string;
  nickname: string;
  avatar: string;
  phone: string;
  memberTag: string;
}

/**
 * 用户登录
 */
export async function login(params: LoginParams): Promise<LoginResponse> {
  const response = await post<LoginResponse>('/users/login', params, { skipAuth: true });
  
  // 保存 Token 和用户信息
  if (response.data) {
    setToken(response.data.token);
    setUserInfo({
      userId: response.data.userId,
      nickname: response.data.nickname,
      avatar: response.data.avatar,
    });
  }
  
  return response.data;
}

/**
 * 用户注册
 */
export async function register(params: RegisterParams): Promise<LoginResponse> {
  // 转换为后端期望的格式
  const backendParams: RegisterBackendParams = {
    phone: params.username,
    password: params.password,
  };
  
  const response = await post<LoginResponse>('/users/register', backendParams, { skipAuth: true });
  
  // 注册成功后自动保存 Token 和用户信息
  if (response.data) {
    setToken(response.data.token);
    setUserInfo({
      userId: response.data.userId,
      nickname: response.data.nickname,
      avatar: response.data.avatar,
    });
  }
  
  return response.data;
}

/**
 * 获取用户信息
 */
export async function getUserProfile(): Promise<UserProfile> {
  const response = await get<UserProfile>('/users/profile');
  return response.data;
}

/**
 * 更新用户信息
 */
export async function updateUserProfile(params: {
  nickname?: string;
  avatar?: string;
}): Promise<void> {
  await put('/users/profile', params);
}
