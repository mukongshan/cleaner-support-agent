import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * 返回按钮行为：与浏览器后退一致；若历史栈上一页为站外则跳转上一级路径（约定不弹窗）。
 * @param parentPath 当前资源的上一级路径，如 /tickets 对于 /tickets/:id
 */
export function useBackOrFallback(parentPath: string): () => void {
  const navigate = useNavigate();
  return useCallback(() => {
    if (window.history.length <= 1) {
      navigate(parentPath);
      return;
    }
    navigate(-1);
  }, [navigate, parentPath]);
}
