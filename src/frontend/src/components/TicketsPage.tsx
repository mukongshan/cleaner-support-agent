import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  ChevronRight,
  Search,
  Filter,
  MessageSquare,
  Phone,
  MapPin,
  Calendar,
  User as UserIcon,
  FileText,
  Camera,
  ThumbsUp,
  ThumbsDown,
  Plus,
  X,
  Sparkles,
  Check,
  Bot,
  Loader2,
  ClipboardList
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  getTickets,
  createTicket,
  TicketListItem,
  TicketStatus as APITicketStatus,
  TicketPriority,
  uploadMedia
} from '../services/api';
import { TicketForm, TicketFormData } from './TicketForm';
import { useLanguage } from '../contexts/LanguageContext';

export type TicketStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: string;
  estimatedTime?: string;
  type: 'question' | 'report';
  hasImage?: boolean;
}

interface TicketsPageProps {
  onTicketClick?: (ticket: Ticket) => void;
  onCreateTicket?: () => void;
  onGoToChat?: () => void;
  isLoggedIn?: boolean;
  onShowLogin?: () => void;
}

export function TicketsPage({ onTicketClick, onCreateTicket, onGoToChat, isLoggedIn = false, onShowLogin }: TicketsPageProps) {
  const { t, language } = useLanguage();
  const [selectedFilter, setSelectedFilter] = useState<'all' | TicketStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [ticketFeedbacks, setTicketFeedbacks] = useState<Record<string, 'like' | 'dislike' | null>>({});
  const [showCreatePrompt, setShowCreatePrompt] = useState(false);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketFormData, setTicketFormData] = useState<TicketFormData>({
    problemType: 'maintenance',
    priority: 'medium',
    problemSummary: '',
    deviceModel: 'CR-X3000',
    deviceSN: 'SN202401120001',
    additionalNotes: '',
    images: []
  });

  // 真实数据状态
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 加载工单列表（仅在登录时）
  useEffect(() => {
    if (isLoggedIn) {
      loadTickets();
    }
  }, [selectedFilter, isLoggedIn]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError(null);

      const filterStatus: APITicketStatus | undefined =
        selectedFilter === 'all' ? undefined : selectedFilter as APITicketStatus;

      const apiTickets = await getTickets(filterStatus);

      // 转换 API 数据为组件需要的格式
      const convertedTickets: Ticket[] = apiTickets.map(item => ({
        id: item.ticketId,
        title: item.title,
        description: '', // 列表接口不返回描述
        status: item.status,
        priority: item.priority,
        type: 'report' as const,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.createdAt),
        assignedTo: item.engineerName,
        estimatedTime: item.estimatedTime,
        hasImage: false
      }));

      setTickets(convertedTickets);
    } catch (err: any) {
      console.error('加载工单失败:', err);
      setError(err.message || '加载工单失败');
      // 使用空数组而不是模拟数据
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  // 原来的模拟数据现在作为备用（开发时使用）
  const mockTickets: Ticket[] = [
    {
      id: 'WO20240112001',
      title: '悬空传感器异常',
      description: '机器人在清扫过程中突然停止，显示悬空传感器异常错误',
      status: 'processing',
      priority: 'high',
      type: 'report',
      createdAt: new Date('2024-01-12T10:30:00'),
      updatedAt: new Date('2024-01-12T11:15:00'),
      assignedTo: '李工程师',
      estimatedTime: '今天 14:00',
      hasImage: true
    },
    {
      id: 'WO20240111005',
      title: '边刷不转动',
      description: '右侧边刷无法正常旋转，怀疑电机故障',
      status: 'completed',
      priority: 'medium',
      type: 'question',
      createdAt: new Date('2024-01-11T15:20:00'),
      updatedAt: new Date('2024-01-11T18:45:00'),
      assignedTo: '王工程师'
    },
    {
      id: 'WO20240110012',
      title: '充电座无法识别',
      description: '机器人无法自动返回充电座，手动放置也无法充电',
      status: 'completed',
      priority: 'high',
      type: 'report',
      createdAt: new Date('2024-01-10T09:15:00'),
      updatedAt: new Date('2024-01-10T16:30:00'),
      assignedTo: '张工程师',
      hasImage: true
    },
    {
      id: 'WO20240109008',
      title: '如何更换滤网',
      description: '想了解滤网的更换步骤和注意事项',
      status: 'completed',
      priority: 'low',
      type: 'question',
      createdAt: new Date('2024-01-09T14:40:00'),
      updatedAt: new Date('2024-01-09T15:10:00')
    },
    {
      id: 'WO20240108003',
      title: '清扫路径规划异常',
      description: '机器人清扫时会重复清扫同一区域，路径规划不合理',
      status: 'cancelled',
      priority: 'medium',
      type: 'question',
      createdAt: new Date('2024-01-08T11:20:00'),
      updatedAt: new Date('2024-01-08T12:00:00')
    }
  ];

  const getStatusInfo = (status: TicketStatus) => {
    const statusMap = {
      pending: {
        label: t('pending'),
        color: 'text-yellow-600 bg-yellow-50',
        icon: Clock,
        borderColor: 'border-yellow-200'
      },
      processing: {
        label: t('processing'),
        color: 'text-blue-600 bg-blue-50',
        icon: AlertCircle,
        borderColor: 'border-blue-200'
      },
      completed: {
        label: t('completed'),
        color: 'text-green-600 bg-green-50',
        icon: CheckCircle,
        borderColor: 'border-green-200'
      },
      cancelled: {
        label: t('cancelled'),
        color: 'text-gray-600 bg-gray-50',
        icon: XCircle,
        borderColor: 'border-gray-200'
      }
    };
    return statusMap[status];
  };

  const getPriorityInfo = (priority: string) => {
    const priorityMap = {
      high: { label: t('priority_high'), color: 'text-red-600 bg-red-50' },
      medium: { label: t('priority_medium'), color: 'text-orange-600 bg-orange-50' },
      low: { label: t('priority_low'), color: 'text-gray-600 bg-gray-50' }
    };
    return priorityMap[priority as keyof typeof priorityMap];
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesFilter = selectedFilter === 'all' || ticket.status === selectedFilter;
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const statusCounts = {
    all: tickets.length,
    pending: tickets.filter(t => t.status === 'pending').length,
    processing: tickets.filter(t => t.status === 'processing').length,
    completed: tickets.filter(t => t.status === 'completed').length,
    cancelled: tickets.filter(t => t.status === 'cancelled').length
  };

  const getProblemTypeLabel = (type: string) => {
    const typeMap: { [key: string]: string } = {
      malfunction: t('ticket_type_malfunction'),
      maintenance: t('ticket_type_maintenance'),
      consultation: t('ticket_type_consultation'),
      parts: t('ticket_type_parts')
    };
    return typeMap[type] || t('all');
  };

  const getPriorityLabel = (priority: 'low' | 'medium' | 'high') => {
    const priorityMap = {
      low: t('priority_low'),
      medium: t('priority_medium'),
      high: t('priority_high')
    };
    return priorityMap[priority];
  };

  const handleCreateTicketClick = () => {
    // 检查登录状态
    if (!isLoggedIn) {
      if (onShowLogin) {
        onShowLogin();
      }
      return;
    }
    setShowCreatePrompt(true);
  };

  const handleGoToChat = () => {
    setShowCreatePrompt(false);
    if (onGoToChat) {
      onGoToChat();
    }
  };

  const handleContinueCreate = () => {
    setShowCreatePrompt(false);
    setShowTicketForm(true);
  };

  const handleSubmitTicket = async () => {
    try {
      setSubmitting(true);
      setError(null);

      // 上传图片
      const uploadedUrls: string[] = [];
      for (const imageUrl of ticketFormData.images) {
        // 如果是本地文件路径，需要上传
        // 这里假设 images 数组已经包含了上传后的 URL
        uploadedUrls.push(imageUrl);
      }

      // 创建工单
      const result = await createTicket({
        title: ticketFormData.problemSummary || t('ticket_create_default_title'),
        description: `${t('ticket_problem_type_label')}: ${ticketFormData.problemType}\n${t('ticket_device_model_label')}: ${ticketFormData.deviceModel}\n${t('ticket_device_sn_label')}: ${ticketFormData.deviceSN}\n\n${ticketFormData.additionalNotes}`,
        priority: ticketFormData.priority as TicketPriority,
        attachmentUrls: uploadedUrls.length > 0 ? uploadedUrls : undefined
      });

      console.log('工单创建成功:', result);

      // 重置表单
      setTicketFormData({
        problemType: 'maintenance',
        priority: 'medium',
        problemSummary: '',
        deviceModel: 'CR-X3000',
        deviceSN: 'SN202401120001',
        additionalNotes: '',
        images: []
      });

      setShowTicketForm(false);

      // 重新加载工单列表
      await loadTickets();

      if (onCreateTicket) {
        onCreateTicket();
      }
    } catch (err: any) {
      console.error('创建工单失败:', err);
      setError(err.message || t('ticket_create_failed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-transparent">
      {/* 未登录提示 */}
      {!isLoggedIn ? (
        <>
          {/* 顶部标题 */}
          <div
            className="px-4 py-4 relative z-10"
            style={{
              backdropFilter: 'blur(12px)',
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }}
          >
            <h2 className="text-lg font-semibold text-gray-900">{t('my_tickets')}</h2>
          </div>

          {/* 未登录提示内容 */}
          <div className="flex-1 flex flex-col items-center justify-center px-4">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-6">
              <ClipboardList className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-gray-600 text-sm mb-6">{t('ticket_not_login_hint')}</p>
            {onShowLogin && (
              <button
                onClick={onShowLogin}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors haptic-feedback"
              >
                {t('login_required')}
              </button>
            )}
          </div>
        </>
      ) : (
        <>
          {/* 顶部 */}
          <div
            className="px-4 py-4 relative z-10"
            style={{
              backdropFilter: 'blur(12px)',
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">{t('my_tickets')}</h2>
              <button
                onClick={handleCreateTicketClick}
                className="p-2 text-gray-900 hover:bg-gray-100 rounded-lg transition-colors haptic-feedback"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* 搜索框 */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search_ticket_placeholder')}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* 统计卡片 */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-blue-600">{statusCounts.all}</div>
                <div className="text-xs text-blue-700 mt-1">{t('all_tickets')}</div>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-yellow-600">{statusCounts.processing}</div>
                <div className="text-xs text-yellow-700 mt-1">{t('processing')}</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-green-600">{statusCounts.completed}</div>
                <div className="text-xs text-green-700 mt-1">{t('completed')}</div>
              </div>
            </div>

            {/* 过滤标签 */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm transition-all haptic-feedback ${selectedFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600'
                  }`}
              >
                {t('all')} ({statusCounts.all})
              </button>
              <button
                onClick={() => setSelectedFilter('pending')}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm transition-all haptic-feedback ${selectedFilter === 'pending'
                  ? 'bg-yellow-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600'
                  }`}
              >
                {t('pending')} ({statusCounts.pending})
              </button>
              <button
                onClick={() => setSelectedFilter('processing')}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm transition-all haptic-feedback ${selectedFilter === 'processing'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600'
                  }`}
              >
                {t('processing')} ({statusCounts.processing})
              </button>
              <button
                onClick={() => setSelectedFilter('completed')}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm transition-all haptic-feedback ${selectedFilter === 'completed'
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600'
                  }`}
              >
                {t('completed')} ({statusCounts.completed})
              </button>
            </div>
          </div>

          {/* 工单列表 */}
          <div className="flex-1 overflow-y-auto px-4 py-4 relative z-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-8">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                <p className="text-sm text-gray-500">{t('loading')}</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-8">
                <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="w-12 h-12 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('error')}</h3>
                <p className="text-sm text-gray-500 mb-4">{error}</p>
                <button
                  onClick={loadTickets}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  {t('retry')}
                </button>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-8">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('ticket_no_records')}</h3>
                <p className="text-sm text-gray-500">
                  {searchQuery ? t('ticket_no_match') : t('ticket_no_records_desc')}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTickets.map((ticket, index) => {
                  const statusInfo = getStatusInfo(ticket.status);
                  const priorityInfo = getPriorityInfo(ticket.priority);
                  const StatusIcon = statusInfo.icon;

                  const handleCardClick = (e: React.MouseEvent) => {
                    e.stopPropagation();
                    if (onTicketClick) {
                      onTicketClick(ticket);
                    }
                  };

                  const handleFeedbackClick = (e: React.MouseEvent, type: 'like' | 'dislike') => {
                    e.stopPropagation();
                    setTicketFeedbacks(prev => ({
                      ...prev,
                      [ticket.id]: prev[ticket.id] === type ? null : type
                    }));
                  };

                  const currentFeedback = ticketFeedbacks[ticket.id] || null;

                  return (
                    <motion.div
                      key={ticket.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`w-full rounded-xl p-4 transition-all border-l-4 ${statusInfo.borderColor}`}
                      style={{
                        backdropFilter: 'blur(8px)',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      <button
                        onClick={handleCardClick}
                        className="w-full text-left haptic-feedback"
                      >
                        {/* 头部 */}
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900 text-sm">{ticket.title}</h3>
                              {ticket.hasImage && (
                                <Camera className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span className="font-mono">{ticket.id}</span>
                              <span>•</span>
                              <span>{ticket.type === 'report' ? t('ticket_type_report') : t('ticket_type_question')}</span>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                        </div>

                        {/* 描述 */}
                        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                          {ticket.description}
                        </p>

                        {/* 状态和优先级 */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${statusInfo.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            <span className="text-xs font-medium">{statusInfo.label}</span>
                          </div>
                          <div className={`px-2 py-1 rounded-lg ${priorityInfo.color}`}>
                            <span className="text-xs font-medium">{t('ticket_priority_label')}: {priorityInfo.label}</span>
                          </div>
                        </div>

                        {/* 时间和工程师信息 */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{ticket.createdAt.toLocaleDateString(language === 'en' ? 'en-US' : 'zh-CN')}</span>
                            </div>
                            {ticket.assignedTo && (
                              <div className="flex items-center gap-1">
                                <UserIcon className="w-3 h-3" />
                                <span>{ticket.assignedTo}</span>
                              </div>
                            )}
                          </div>

                          {/* 处理中的工单显示预计时间 */}
                          {ticket.status === 'processing' && ticket.estimatedTime && (
                            <div className="flex items-center gap-1 text-xs text-blue-600 font-medium">
                              <Clock className="w-3 h-3" />
                              <span>{ticket.estimatedTime}</span>
                            </div>
                          )}

                          {/* 已完成的工单显示完成时间 */}
                          {ticket.status === 'completed' && (
                            <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                              <CheckCircle className="w-3 h-3" />
                              <span>{ticket.updatedAt.toLocaleDateString(language === 'en' ? 'en-US' : 'zh-CN')}</span>
                            </div>
                          )}
                        </div>

                      </button>

                      {/* 评价按钮 - 已完成和已取消的工单显示 */}
                      {(ticket.status === 'completed' || ticket.status === 'cancelled') && (
                        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                          <button
                            onClick={(e) => handleFeedbackClick(e, 'like')}
                            className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs transition-colors haptic-feedback ${currentFeedback === 'like'
                              ? 'bg-green-500 text-white'
                              : 'bg-green-50 text-green-600 hover:bg-green-100'
                              }`}
                          >
                            <ThumbsUp className={`w-3 h-3 ${currentFeedback === 'like' ? 'fill-current' : ''}`} />
                            <span>{t('ticket_satisfied')}</span>
                          </button>
                          <button
                            onClick={(e) => handleFeedbackClick(e, 'dislike')}
                            className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs transition-colors haptic-feedback ${currentFeedback === 'dislike'
                              ? 'bg-red-500 text-white'
                              : 'bg-red-50 text-red-600 hover:bg-red-100'
                              }`}
                          >
                            <ThumbsDown className={`w-3 h-3 ${currentFeedback === 'dislike' ? 'fill-current' : ''}`} />
                            <span>{t('ticket_unsatisfied')}</span>
                          </button>
                        </div>
                      )}

                      {/* 处理中的工单显示快捷操作 */}
                      {ticket.status === 'processing' && (
                        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onTicketClick) onTicketClick(ticket);
                            }}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs hover:bg-blue-100 transition-colors haptic-feedback"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>{t('ticket_send_message')}</span>
                          </button>
                          <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-50 text-green-600 rounded-lg text-xs hover:bg-green-100 transition-colors haptic-feedback">
                            <Phone className="w-3 h-3" />
                            <span>{t('ticket_call_engineer')}</span>
                          </button>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 底部提示
      <div 
        className="px-4 py-3 safe-area-bottom"
        style={{
          backdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(255, 255, 255, 0.1)'
        }}
      >
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <AlertCircle className="w-4 h-4" />
          <span>工单平均响应时间: 2小时内</span>
        </div>
      </div> */}

          {/* 创建工单提示对话框 */}
          <AnimatePresence>
            {showCreatePrompt && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-end justify-center z-50"
                onClick={() => setShowCreatePrompt(false)}
              >
                <motion.div
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', damping: 25 }}
                  className="bg-white w-full max-w-md rounded-t-3xl overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">{t('ticket_create_title')}</h3>
                    <button
                      onClick={() => setShowCreatePrompt(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  <div className="px-6 py-6">
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 mb-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Bot className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-2">{t('ticket_consult_ai_first_title')}</h4>
                          <p className="text-sm text-gray-600 mb-3">
                            {t('ticket_consult_ai_first_desc')}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <button
                        onClick={handleGoToChat}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors haptic-feedback"
                      >
                        <MessageSquare className="w-5 h-5" />
                        <span>{t('ticket_go_ai')}</span>
                      </button>
                      <button
                        onClick={handleContinueCreate}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors haptic-feedback"
                      >
                        <Plus className="w-5 h-5" />
                        <span>{t('ticket_continue_create')}</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 创建工单表单 - 使用统一的 TicketForm 组件 */}
          <AnimatePresence>
            {showTicketForm && (
              <TicketForm
                formData={ticketFormData}
                onFormDataChange={setTicketFormData}
                onSubmit={handleSubmitTicket}
                onCancel={() => setShowTicketForm(false)}
                submitting={submitting}
                error={error}
              />
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
