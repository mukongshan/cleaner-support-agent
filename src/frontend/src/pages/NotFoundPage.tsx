import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';
import { ROUTES } from '../constants/routes';

interface NotFoundPageProps {
  /** 自定义文案，如「工单不存在」 */
  message?: string;
}

export function NotFoundPage({ message }: NotFoundPageProps) {
  const navigate = useNavigate();
  return (
    <div className="h-full flex flex-col items-center justify-center px-6 bg-gray-50">
      <FileQuestion className="w-16 h-16 text-gray-400 mb-4" />
      <h2 className="text-lg font-semibold text-gray-800 mb-2">
        {message ?? '页面不存在'}
      </h2>
      <p className="text-sm text-gray-500 mb-6 text-center">
        您访问的地址无效或资源已被删除
      </p>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          type="button"
          onClick={() => navigate(ROUTES.CHAT)}
          className="w-full py-3 px-4 rounded-xl bg-blue-600 text-white font-medium"
        >
          返回首页
        </button>
        <button
          type="button"
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate(ROUTES.CHAT))}
          className="w-full py-3 px-4 rounded-xl border border-gray-300 text-gray-700 font-medium"
        >
          返回上一页
        </button>
      </div>
    </div>
  );
}
