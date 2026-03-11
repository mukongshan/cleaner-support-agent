import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getToken } from '../services/api';
import { ROUTES } from '../constants/routes';
import { isAuthRequiredPath } from '../constants/routes';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * 需登录页面包装：未登录时跳转 /login?redirect=当前完整 URL。
 * 登录成功后由登录页根据 redirect 参数跳回（由丙在 LoginPage 中实现）。
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const token = getToken();
  const fullPath = location.pathname + location.search;

  if (!token && isAuthRequiredPath(location.pathname)) {
    const redirect = encodeURIComponent(fullPath);
    return <Navigate to={`${ROUTES.LOGIN}?redirect=${redirect}`} replace />;
  }
  return <>{children}</>;
}
