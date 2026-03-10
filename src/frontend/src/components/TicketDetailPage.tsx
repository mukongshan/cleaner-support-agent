import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  User as UserIcon,
  Calendar,
  MessageSquare,
  Phone,
  Camera,
  ThumbsUp,
  ThumbsDown,
  FileText,
  Send,
  Image as ImageIcon
} from 'lucide-react';
import { motion } from 'motion/react';
import { Ticket, TicketStatus } from './TicketsPage';
import { useLanguage } from '../contexts/LanguageContext';

interface TicketDetailPageProps {
  ticket: Ticket;
  onBack: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'engineer' | 'system';
  content: string;
  timestamp: Date;
}

export function TicketDetailPage({ ticket, onBack }: TicketDetailPageProps) {
  const { t, language } = useLanguage();
  const [userFeedback, setUserFeedback] = useState<'like' | 'dislike' | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const statusInfo = getStatusInfo(ticket.status);
  const priorityInfo = getPriorityInfo(ticket.priority);
  const StatusIcon = statusInfo.icon;

  // 初始化消息记录
  useEffect(() => {
    const initialMessages: Message[] = [
      {
        id: '1',
        sender: 'user',
        content: ticket.description,
        timestamp: ticket.createdAt
      },
      {
        id: '2',
        sender: 'system',
        content: `${t('ticket_created_prefix')}${ticket.id}`,
        timestamp: new Date(ticket.createdAt.getTime() + 60000)
      },
      ...(ticket.assignedTo ? [{
        id: '3',
        sender: 'engineer' as const,
        content: `${t('ticket_engineer_intro_prefix')}${ticket.assignedTo}${t('ticket_engineer_intro_suffix')}`,
        timestamp: new Date(ticket.createdAt.getTime() + 1800000)
      }] : []),
      ...(ticket.status === 'completed' ? [{
        id: '4',
        sender: 'engineer' as const,
        content: t('ticket_completed_message'),
        timestamp: ticket.updatedAt
      }] : [])
    ];
    setMessages(initialMessages);
  }, [ticket, t]);

  const handleFeedback = (type: 'like' | 'dislike') => {
    setUserFeedback(type);
    // 这里可以添加API调用来保存反馈
  };

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 发送消息
  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    // 模拟工程师回复
    setTimeout(() => {
      const engineerReply: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'engineer',
        content: t('ticket_engineer_auto_reply'),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, engineerReply]);
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* 顶部导航栏 */}
      <div className="bg-white px-4 py-3 shadow-sm flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors haptic-feedback"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h2 className="text-lg font-semibold text-gray-900 flex-1">{t('ticket_detail_title')}</h2>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto">
        {/* 工单基本信息卡片 */}
        <div className="bg-white mx-4 mt-4 rounded-xl p-4 shadow-sm border-l-4 border-blue-500">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-base mb-2">{ticket.title}</h3>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                <span className="font-mono">{ticket.id}</span>
                <span>•</span>
                <span>{ticket.type === 'report' ? t('ticket_type_report') : t('ticket_type_question')}</span>
                {ticket.hasImage && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Camera className="w-3 h-3" />
                      <span>{t('ticket_contains_image')}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 状态和优先级 */}
          <div className="flex items-center gap-2 mb-4">
            <div className={`flex items-center gap-1 px-3 py-1.5 rounded-lg ${statusInfo.color}`}>
              <StatusIcon className="w-4 h-4" />
              <span className="text-xs font-medium">{statusInfo.label}</span>
            </div>
            <div className={`px-3 py-1.5 rounded-lg ${priorityInfo.color}`}>
              <span className="text-xs font-medium">{t('ticket_priority_label')}: {priorityInfo.label}</span>
            </div>
          </div>

          {/* 详细信息 */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>{t('ticket_created_time')}：{ticket.createdAt.toLocaleString(language === 'en' ? 'en-US' : 'zh-CN')}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>{t('ticket_updated_time')}：{ticket.updatedAt.toLocaleString(language === 'en' ? 'en-US' : 'zh-CN')}</span>
            </div>
            {ticket.assignedTo && (
              <div className="flex items-center gap-2 text-gray-600">
                <UserIcon className="w-4 h-4 text-gray-400" />
                <span>{t('ticket_assigned_engineer')}：{ticket.assignedTo}</span>
              </div>
            )}
            {ticket.status === 'processing' && ticket.estimatedTime && (
              <div className="flex items-center gap-2 text-blue-600 font-medium">
                <Clock className="w-4 h-4" />
                <span>{t('ticket_estimated_completion')}：{ticket.estimatedTime}</span>
              </div>
            )}
          </div>
        </div>

        {/* 问题描述 */}
        <div className="bg-white mx-4 mt-3 rounded-xl p-4 shadow-sm">
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-400" />
            {t('ticket_problem_description')}
          </h4>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
            {ticket.description}
          </p>
        </div>

        {/* 沟通记录 */}
        <div className="bg-white mx-4 mt-3 rounded-xl shadow-sm">
          <div className="px-4 pt-4 pb-2">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-gray-400" />
              {t('ticket_communication_records')}
            </h4>
          </div>
          <div className="px-4 pb-4 space-y-3 max-h-96 overflow-y-auto">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-3 ${message.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-sm'
                      : message.sender === 'engineer'
                        ? 'bg-gray-100 text-gray-900 rounded-tl-sm'
                        : 'bg-yellow-50 text-yellow-800'
                    }`}
                >
                  {message.sender === 'engineer' && (
                    <div className="flex items-center gap-2 mb-1">
                      <UserIcon className="w-3 h-3" />
                      <span className="text-xs font-medium">{ticket.assignedTo || t('ticket_engineer_fallback')}</span>
                    </div>
                  )}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}
                  >
                    {message.timestamp.toLocaleTimeString(language === 'en' ? 'en-US' : 'zh-CN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* 评价区域 */}
        {ticket.status === 'completed' && (
          <div className="bg-white mx-4 mt-3 mb-4 rounded-xl p-4 shadow-sm">
            <h4 className="font-semibold text-gray-900 mb-3">{t('ticket_service_rating')}</h4>
            <div className="flex gap-3">
              <button
                onClick={() => handleFeedback('like')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all haptic-feedback ${userFeedback === 'like'
                    ? 'bg-green-500 text-white shadow-md'
                    : 'bg-green-50 text-green-600 hover:bg-green-100'
                  }`}
              >
                <ThumbsUp className={`w-5 h-5 ${userFeedback === 'like' ? 'fill-current' : ''}`} />
                <span className="font-medium">{t('ticket_satisfied')}</span>
              </button>
              <button
                onClick={() => handleFeedback('dislike')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all haptic-feedback ${userFeedback === 'dislike'
                    ? 'bg-red-500 text-white shadow-md'
                    : 'bg-red-50 text-red-600 hover:bg-red-100'
                  }`}
              >
                <ThumbsDown className={`w-5 h-5 ${userFeedback === 'dislike' ? 'fill-current' : ''}`} />
                <span className="font-medium">{t('ticket_unsatisfied')}</span>
              </button>
            </div>
            {userFeedback && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                {t('ticket_thanks_feedback')}
              </p>
            )}
          </div>
        )}

        <div className="h-4"></div>
      </div>

      {/* 消息输入区域 */}
      {ticket.status !== 'completed' && ticket.status !== 'cancelled' && (
        <div className="bg-white border-t border-gray-200 px-4 py-3 safe-area-bottom">
          <div className="flex items-end gap-2">
            <button
              className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors haptic-feedback flex-shrink-0"
            >
              <ImageIcon className="w-5 h-5 text-gray-600" />
            </button>

            <div className="flex-1 relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={t('ticket_input_placeholder')}
                className="w-full px-4 py-2.5 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {inputText.trim() ? (
              <button
                onClick={handleSendMessage}
                className="p-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors haptic-feedback flex-shrink-0"
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            ) : (
              <button className="p-2.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors haptic-feedback flex-shrink-0">
                <Phone className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
