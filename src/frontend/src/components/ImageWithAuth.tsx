import React, { useState, useEffect } from 'react';
import { getToken, API_BASE_URL } from '../services/api/config';
import { Loader2 } from 'lucide-react';

/**
 * 带认证的图片组件
 * 使用 fetch 获取图片（带认证头）并转换为 blob URL
 */
export function ImageWithAuth({ 
  src, 
  alt, 
  className, 
  style, 
  ...rest 
}: React.ImgHTMLAttributes<HTMLImageElement> & { src: string; alt: string }) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // 处理图片URL
    const getImageUrl = (imageUrl: string): string => {
      if (!imageUrl) return '';
      // 如果是完整 URL（以 http:// 或 https:// 开头），直接返回
      if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
      }
      // 如果路径已经包含 /api，直接使用服务器URL拼接
      if (imageUrl.startsWith('/api')) {
        const match = API_BASE_URL.match(/^(https?:\/\/[^\/]+)/);
        const serverUrl = match ? match[1] : window.location.origin;
        return `${serverUrl}${imageUrl}`;
      }
      // 如果是相对路径，拼接服务器基础URL
      const match = API_BASE_URL.match(/^(https?:\/\/[^\/]+)/);
      const serverUrl = match ? match[1] : window.location.origin;
      const path = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
      return `${serverUrl}${path}`;
    };

    const imageUrl = getImageUrl(src);
    
    // 如果URL已经是blob URL或data URL，直接使用
    if (imageUrl.startsWith('blob:') || imageUrl.startsWith('data:')) {
      setBlobUrl(imageUrl);
      setLoading(false);
      return;
    }

    // 使用 fetch 获取图片（带认证头）
    const token = getToken();
    setLoading(true);
    setError(false);

    fetch(imageUrl, {
      headers: token ? {
        'Authorization': `Bearer ${token}`
      } : {}
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.blob();
      })
      .then(blob => {
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
        setLoading(false);
      })
      .catch(err => {
        console.error('[ImageWithAuth] 图片加载失败:', imageUrl, err);
        setError(true);
        setLoading(false);
      });

    // 清理函数：组件卸载时释放 blob URL
    return () => {
      if (blobUrl && blobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [src]);

  if (loading) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 ${className || ''}`}
        style={style}
      >
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (error || !blobUrl) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 text-gray-400 ${className || ''}`}
        style={style}
      >
        <span className="text-xs">图片加载失败</span>
      </div>
    );
  }

  return (
    <img
      src={blobUrl}
      alt={alt}
      className={className}
      style={style}
      {...rest}
    />
  );
}
