import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
import { useLanguage } from '../contexts/LanguageContext';

export function KnowledgePage() {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [fileAccessInfo, setFileAccessInfo] = useState<FileAccessInfo | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [loadingAccessInfo, setLoadingAccessInfo] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialMount = useRef(true);

  // 分类配置（前端分类 -> 后端分类映射）
  const categories = useMemo(() => ([
    { id: 'all', name: t('knowledge_category_all'), icon: Book, color: 'blue', backendCategory: undefined },
    { id: 'sales', name: t('knowledge_category_sales'), icon: Book, color: 'blue', backendCategory: 'sales' },
    { id: 'maintenance', name: t('knowledge_category_maintenance'), icon: Wrench, color: 'green', backendCategory: 'maintenance' },
    { id: 'product', name: t('knowledge_category_product'), icon: Video, color: 'purple', backendCategory: 'product' },
    { id: 'company', name: t('knowledge_category_company'), icon: Book, color: 'orange', backendCategory: 'company' },
    { id: 'training', name: t('knowledge_category_training'), icon: Video, color: 'purple', backendCategory: 'training' }
  ]), [t]);

  // 搜索防抖处理（初始加载时不防抖）
  useEffect(() => {
    // 初始加载时立即设置，不使用防抖
    if (isInitialMount.current) {
      setDebouncedSearchQuery(searchQuery);
      isInitialMount.current = false;
      return;
    }

    // 后续搜索时使用防抖
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // 加载文件列表
  const loadFiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const category = categories.find(c => c.id === selectedCategory)?.backendCategory ?? null;
      const query = debouncedSearchQuery.trim() || null;

      console.log('[KnowledgePage] 开始加载文件列表', {
        selectedCategory,
        category,
        query,
        debouncedSearchQuery
      });

      const data = await getMediaFiles({
        category: category,
        query: query
      });

      console.log('[KnowledgePage] 文件列表加载成功', {
        count: data?.length || 0,
        files: data
      });

      // 先更新列表数据
      setFiles(data || []);

      // 使用 setTimeout 确保 DOM 更新后再结束加载状态，避免闪烁
      setTimeout(() => {
        setLoading(false);
      }, 0);
    } catch (err: any) {
      const errorMessage = err.message || t('knowledge_load_failed');
      console.error('[KnowledgePage] 加载文件列表失败:', {
        error: err,
        message: errorMessage,
        stack: err.stack
      });
      setError(errorMessage);
      // 错误时也要先更新状态再结束加载
      setTimeout(() => {
        setLoading(false);
      }, 0);
    }
  }, [selectedCategory, debouncedSearchQuery, categories]);

  // 初始加载和分类/搜索变化时重新加载
  useEffect(() => {
    console.log('[KnowledgePage] useEffect 触发，准备加载文件', {
      selectedCategory,
      debouncedSearchQuery,
      loading
    });
    loadFiles();
  }, [loadFiles]);

  // 组件挂载和状态变化时记录
  useEffect(() => {
    console.log('[KnowledgePage] 组件状态更新', {
      selectedCategory,
      searchQuery,
      debouncedSearchQuery,
      filesCount: files.length,
      loading,
      error,
      hasFiles: files.length > 0
    });
  }, [selectedCategory, searchQuery, debouncedSearchQuery, files.length, loading, error]);

  // 处理文件点击 - 直接预览或下载
  const handleFileClick = async (file: MediaFile) => {
    console.log('[KnowledgePage] 文件被点击', {
      file,
      fileId: file.id
    });

    const fileId = file.id;

    try {
      // 先获取文件访问信息，判断是否可预览
      console.log('[KnowledgePage] 开始获取文件访问信息', { fileId });
      const accessInfo = await getFileAccessInfo(fileId);
      console.log('[KnowledgePage] 文件访问信息获取成功', { accessInfo });

      // 根据是否可预览来决定是预览还是下载
      if (accessInfo.isViewable && accessInfo.previewUrl) {
        // 可预览，直接打开预览
        console.log('[KnowledgePage] 文件可预览，打开预览页');
        await previewFile(fileId);
      } else {
        // 不可预览，直接下载
        console.log('[KnowledgePage] 文件不可预览，开始下载');
        await downloadFile(fileId);
      }
    } catch (err: any) {
      console.error('[KnowledgePage] 处理文件失败:', {
        error: err,
        message: err.message,
        fileId: file.id
      });
      alert(err?.message || t('knowledge_open_failed'));
    }
  };

  // 处理文件详情查看（用于长按或其他操作）
  const handleFileDetail = async (file: MediaFile) => {
    console.log('[KnowledgePage] 查看文件详情', {
      file,
      fileId: file.id
    });

    setSelectedFile(file);
    setShowDetailDialog(true);
    setLoadingAccessInfo(true);
    setFileAccessInfo(null);

    try {
      const fileId = file.id;
      console.log('[KnowledgePage] 开始获取文件访问信息', { fileId });

      const accessInfo = await getFileAccessInfo(fileId);
      console.log('[KnowledgePage] 文件访问信息获取成功', { accessInfo });

      setFileAccessInfo(accessInfo);
    } catch (err: any) {
      console.error('[KnowledgePage] 获取文件访问信息失败:', {
        error: err,
        message: err.message,
        fileId: file.id
      });
    } finally {
      setLoadingAccessInfo(false);
    }
  };

  // 处理预览
  const handlePreview = async (fileId: string) => {
    try {
      await previewFile(fileId);
    } catch (error: any) {
      console.error('[KnowledgePage] 预览失败:', error);
      alert(error?.message || t('knowledge_preview_failed'));
    }
  };

  // 处理下载
  const handleDownload = async (fileId: string) => {
    try {
      await downloadFile(fileId);
    } catch (error: any) {
      console.error('[KnowledgePage] 下载失败:', error);
      alert(error?.message || t('knowledge_download_failed'));
    }
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
        return t('file_type_video');
      case 'PDF':
        return t('file_type_pdf');
      case 'IMAGE':
        return t('file_type_image');
      case 'EXCEL':
        return t('file_type_excel');
      case 'PPT':
        return t('file_type_ppt');
      case 'ARTICLE':
        return t('file_type_article');
      default:
        return t('file_type_doc');
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
        <h2 className="text-lg font-semibold text-gray-900 mb-3">{t('knowledge_center_title')}</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('knowledge_search_placeholder')}
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
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all haptic-feedback whitespace-nowrap ${isActive
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
            <p className="text-sm text-gray-500">{t('loading')}</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <X className="w-12 h-12 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('error')}</h3>
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <Button onClick={loadFiles} variant="outline" size="sm">
              {t('retry')}
            </Button>
          </div>
        ) : files.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('knowledge_not_found_title')}</h3>
            <p className="text-sm text-gray-500">
              {t('knowledge_not_found_desc')}
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
                onContextMenu={(e) => {
                  e.preventDefault();
                  handleFileDetail(file);
                }}
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
                      {file.id && (
                        <span className="text-gray-400">• {file.id}</span>
                      )}
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
                  {/* 显示文件ID */}
                  {selectedFile.id && (
                    <div className="text-xs text-gray-500">
                      {t('knowledge_file_id')}: {selectedFile.id}
                    </div>
                  )}
                  <div className="flex gap-2">
                    {fileAccessInfo.isViewable && (
                      <Button
                        onClick={async () => {
                          // 使用 id（即 fileId，业务ID）
                          const fileId = selectedFile.id;
                          setShowDetailDialog(false);
                          // 调用预览接口获取 URL 和 repoToken，然后重定向
                          await handlePreview(fileId);
                        }}
                        className="flex-1"
                        variant="default"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        {t('view')}
                      </Button>
                    )}
                    <Button
                      onClick={async () => {
                        // 使用 id（即 fileId，业务ID）
                        const fileId = selectedFile.id;
                        setShowDetailDialog(false);
                        // 调用下载接口获取 URL 和 repoToken，然后重定向
                        await handleDownload(fileId);
                      }}
                      className="flex-1"
                      variant="outline"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {t('download')}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-sm text-gray-500">
                  {t('knowledge_access_info_unavailable')}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
