import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Book,
  Wrench,
  Video,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  Presentation,
  Eye,
  Download,
  X,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import { getMediaFiles, getFileAccessInfo, previewFile, downloadFile, MediaFile, FileAccessInfo } from '../services/api/media';
import { Dialog, DialogContent } from './ui/dialog';
import { Button } from './ui/button';

export function KnowledgePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [fileAccessInfo, setFileAccessInfo] = useState<FileAccessInfo | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [loadingAccessInfo, setLoadingAccessInfo] = useState(false);

  // 分类配置（前端分类 -> 后端分类映射）
  const categories = [
    { id: 'all', name: '全部', icon: Book, color: 'blue', backendCategory: undefined },
    { id: 'sales', name: '销售资料', icon: Book, color: 'blue', backendCategory: 'sales' },
    { id: 'maintenance', name: '维护保养', icon: Wrench, color: 'green', backendCategory: 'maintenance' },
    { id: 'product', name: '产品资料', icon: Video, color: 'purple', backendCategory: 'product' },
    { id: 'company', name: '公司介绍', icon: Book, color: 'orange', backendCategory: 'company' },
    { id: 'training', name: '培训资料', icon: Video, color: 'purple', backendCategory: 'training' }
  ];

  // 加载文件列表
  const loadFiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const category = categories.find(c => c.id === selectedCategory)?.backendCategory;
      const query = searchQuery.trim() || undefined;
      
      const data = await getMediaFiles({
        category: category,
        query: query
      });
      setFiles(data);
    } catch (err: any) {
      setError(err.message || '加载文件列表失败');
      console.error('加载文件列表失败:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery]);

  // 初始加载和分类/搜索变化时重新加载
  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  // 处理文件点击
  const handleFileClick = async (file: MediaFile) => {
    setSelectedFile(file);
    setShowDetailDialog(true);
    setLoadingAccessInfo(true);
    setFileAccessInfo(null);
    
    try {
      const accessInfo = await getFileAccessInfo(file.id);
      setFileAccessInfo(accessInfo);
    } catch (err: any) {
      console.error('获取文件访问信息失败:', err);
    } finally {
      setLoadingAccessInfo(false);
    }
  };

  // 处理预览
  const handlePreview = (fileId: string) => {
    previewFile(fileId);
  };

  // 处理下载
  const handleDownload = (fileId: string) => {
    downloadFile(fileId);
  };

  const getCategoryColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-50 text-blue-600',
      green: 'bg-green-50 text-green-600',
      purple: 'bg-purple-50 text-purple-600',
      orange: 'bg-orange-50 text-orange-600'
    };
    return colors[color] || colors.blue;
  };

  const getTypeIcon = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'VIDEO':
        return <Video className="w-4 h-4" />;
      case 'PDF':
        return <FileText className="w-4 h-4" />;
      case 'IMAGE':
        return <ImageIcon className="w-4 h-4" />;
      case 'EXCEL':
        return <FileSpreadsheet className="w-4 h-4" />;
      case 'PPT':
        return <Presentation className="w-4 h-4" />;
      default:
        return <Book className="w-4 h-4" />;
    }
  };

  const getTypeName = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'VIDEO':
        return '视频';
      case 'PDF':
        return 'PDF';
      case 'IMAGE':
        return '图片';
      case 'EXCEL':
        return 'Excel';
      case 'PPT':
        return 'PPT';
      case 'ARTICLE':
        return '文章';
      default:
        return '文档';
    }
  };

  return (
    <div className="h-full flex flex-col bg-transparent">
      {/* 顶部搜索栏 */}
      <div 
        className="px-4 py-4 relative z-10"
        style={{
          backdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(255, 255, 255, 0.1)'
        }}
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-3">知识库中心</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索教程、视频、文档..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>

      {/* 分类标签 */}
      <div 
        className="px-4 py-3 overflow-x-auto relative z-10"
        style={{
          backdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(255, 255, 255, 0.1)'
        }}
      >
        <div className="flex gap-2 min-w-max">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all haptic-feedback whitespace-nowrap ${
                  isActive
                    ? `${getCategoryColor(category.color)} shadow-sm`
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{category.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 内容列表 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 relative z-0">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <p className="text-sm text-gray-500">加载中...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <X className="w-12 h-12 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">加载失败</h3>
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <Button onClick={loadFiles} variant="outline" size="sm">
              重试
            </Button>
          </div>
        ) : files.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">未找到相关内容</h3>
            <p className="text-sm text-gray-500">
              试试其他关键词或浏览不同分类
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {files.map((file, index) => (
              <motion.button
                key={file.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleFileClick(file)}
                className="w-full rounded-xl p-4 text-left haptic-feedback"
                style={{
                  backdropFilter: 'blur(8px)',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                }}
              >
                <div className="flex gap-3">
                  {/* 图标 */}
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center">
                    {getTypeIcon(file.type)}
                  </div>

                  {/* 内容 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{file.title}</h3>
                      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                    </div>

                    {/* 元信息 */}
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                      <div className="flex items-center gap-1">
                        {getTypeIcon(file.type)}
                        <span>{getTypeName(file.type)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* 文件详情弹窗 */}
      {selectedFile && (
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="max-w-md">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{selectedFile.title}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  {getTypeIcon(selectedFile.type)}
                  <span>{getTypeName(selectedFile.type)}</span>
                </div>
              </div>

              {loadingAccessInfo ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                  <span className="ml-2 text-sm text-gray-500">加载中...</span>
                </div>
              ) : fileAccessInfo ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    {fileAccessInfo.isViewable && (
                      <Button
                        onClick={() => {
                          handlePreview(selectedFile.id);
                          setShowDetailDialog(false);
                        }}
                        className="flex-1"
                        variant="default"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        预览
                      </Button>
                    )}
                    <Button
                      onClick={() => {
                        handleDownload(selectedFile.id);
                        setShowDetailDialog(false);
                      }}
                      className="flex-1"
                      variant="outline"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      下载
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-sm text-gray-500">
                  无法获取文件访问信息
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
