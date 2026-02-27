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
  const blobUrlRef = React.useRef<string | null>(null);

  useEffect(() => {
    // 如果 src 为空，不加载
    if (!src || src.trim() === '') {
      console.log('[ImageWithAuth] src 为空，跳过加载', { src });
      setLoading(false);
      setError(false);
      setBlobUrl(null);
      return;
    }

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
    console.log('[ImageWithAuth] 开始加载图片', { src, imageUrl });
    
    // 如果处理后的 URL 为空，不加载
    if (!imageUrl || imageUrl.trim() === '') {
      console.warn('[ImageWithAuth] 处理后的 imageUrl 为空，跳过加载', { src, imageUrl });
      setLoading(false);
      setError(true);
      return;
    }
    
    // 如果URL已经是blob URL或data URL，直接使用
    if (imageUrl.startsWith('blob:') || imageUrl.startsWith('data:')) {
      setBlobUrl(imageUrl);
      setLoading(false);
      return;
    }

    // 使用 fetch 获取图片（带认证头）- 组件挂载时立即开始加载
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
        console.log('[ImageWithAuth] 图片加载成功', { imageUrl, blobSize: blob.size });
        blobUrlRef.current = url;
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
      if (blobUrlRef.current && blobUrlRef.current.startsWith('blob:')) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
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
