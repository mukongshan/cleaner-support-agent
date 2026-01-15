import React, { useState } from 'react';
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
  FileText
} from 'lucide-react';
import { motion } from 'motion/react';
import { Ticket, TicketStatus } from './TicketsPage';

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
  const [userFeedback, setUserFeedback] = useState<'like' | 'dislike' | null>(null);

  const getStatusInfo = (status: TicketStatus) => {
    const statusMap = {
      pending: {
        label: '待处理',
        color: 'text-yellow-600 bg-yellow-50',
        icon: Clock,
        borderColor: 'border-yellow-200'
      },
      processing: {
        label: '处理中',
        color: 'text-blue-600 bg-blue-50',
        icon: AlertCircle,
        borderColor: 'border-blue-200'
      },
      completed: {
        label: '已完成',
        color: 'text-green-600 bg-green-50',
        icon: CheckCircle,
        borderColor: 'border-green-200'
      },
      cancelled: {
        label: '已取消',
        color: 'text-gray-600 bg-gray-50',
        icon: XCircle,
        borderColor: 'border-gray-200'
      }
    };
    return statusMap[status];
  };

  const getPriorityInfo = (priority: string) => {
    const priorityMap = {
      high: { label: '高', color: 'text-red-600 bg-red-50' },
      medium: { label: '中', color: 'text-orange-600 bg-orange-50' },
      low: { label: '低', color: 'text-gray-600 bg-gray-50' }
    };
    return priorityMap[priority as keyof typeof priorityMap];
  };

  const statusInfo = getStatusInfo(ticket.status);
  const priorityInfo = getPriorityInfo(ticket.priority);
  const StatusIcon = statusInfo.icon;

  // 模拟消息记录
  const messages: Message[] = [
    {
      id: '1',
      sender: 'user',
      content: ticket.description,
      timestamp: ticket.createdAt
    },
    {
      id: '2',
      sender: 'system',
      content: `工单已创建，编号：${ticket.id}`,
      timestamp: new Date(ticket.createdAt.getTime() + 60000)
    },
    ...(ticket.assignedTo ? [{
      id: '3',
      sender: 'engineer' as const,
      content: `您好，我是${ticket.assignedTo}，已收到您的工单，正在处理中。`,
      timestamp: new Date(ticket.createdAt.getTime() + 1800000)
    }] : []),
    ...(ticket.status === 'completed' ? [{
      id: '4',
      sender: 'engineer' as const,
      content: '问题已解决，请确认是否满意。如有其他问题，请随时联系。',
      timestamp: ticket.updatedAt
    }] : [])
  ];

  const handleFeedback = (type: 'like' | 'dislike') => {
    setUserFeedback(type);
    // 这里可以添加API调用来保存反馈
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
        <h2 className="text-lg font-semibold text-gray-900 flex-1">工单详情</h2>
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
                <span>{ticket.type === 'report' ? '故障报修' : '问题咨询'}</span>
                {ticket.hasImage && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Camera className="w-3 h-3" />
                      <span>含图片</span>
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
              <span className="text-xs font-medium">优先级: {priorityInfo.label}</span>
            </div>
          </div>

          {/* 详细信息 */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>创建时间：{ticket.createdAt.toLocaleString('zh-CN')}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>更新时间：{ticket.updatedAt.toLocaleString('zh-CN')}</span>
            </div>
            {ticket.assignedTo && (
              <div className="flex items-center gap-2 text-gray-600">
                <UserIcon className="w-4 h-4 text-gray-400" />
                <span>负责工程师：{ticket.assignedTo}</span>
              </div>
            )}
            {ticket.status === 'processing' && ticket.estimatedTime && (
              <div className="flex items-center gap-2 text-blue-600 font-medium">
                <Clock className="w-4 h-4" />
                <span>预计完成时间：{ticket.estimatedTime}</span>
              </div>
            )}
          </div>
        </div>

        {/* 问题描述 */}
        <div className="bg-white mx-4 mt-3 rounded-xl p-4 shadow-sm">
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-400" />
            问题描述
          </h4>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
            {ticket.description}
          </p>
        </div>

        {/* 沟通记录 */}
        <div className="bg-white mx-4 mt-3 rounded-xl p-4 shadow-sm">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-gray-400" />
            沟通记录
          </h4>
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-xl p-3 ${
                    message.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : message.sender === 'engineer'
                      ? 'bg-gray-100 text-gray-900'
                      : 'bg-yellow-50 text-yellow-800'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {message.timestamp.toLocaleString('zh-CN')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 评价区域 */}
        {ticket.status === 'completed' && (
          <div className="bg-white mx-4 mt-3 mb-4 rounded-xl p-4 shadow-sm">
            <h4 className="font-semibold text-gray-900 mb-3">服务评价</h4>
            <div className="flex gap-3">
              <button
                onClick={() => handleFeedback('like')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all haptic-feedback ${
                  userFeedback === 'like'
                    ? 'bg-green-500 text-white shadow-md'
                    : 'bg-green-50 text-green-600 hover:bg-green-100'
                }`}
              >
                <ThumbsUp className={`w-5 h-5 ${userFeedback === 'like' ? 'fill-current' : ''}`} />
                <span className="font-medium">满意</span>
              </button>
              <button
                onClick={() => handleFeedback('dislike')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all haptic-feedback ${
                  userFeedback === 'dislike'
                    ? 'bg-red-500 text-white shadow-md'
                    : 'bg-red-50 text-red-600 hover:bg-red-100'
                }`}
              >
                <ThumbsDown className={`w-5 h-5 ${userFeedback === 'dislike' ? 'fill-current' : ''}`} />
                <span className="font-medium">不满意</span>
              </button>
            </div>
            {userFeedback && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                感谢您的反馈！
              </p>
            )}
          </div>
        )}

        {/* 快捷操作 */}
        {ticket.status === 'processing' && (
          <div className="bg-white mx-4 mt-3 mb-4 rounded-xl p-4 shadow-sm">
            <h4 className="font-semibold text-gray-900 mb-3">快捷操作</h4>
            <div className="flex gap-3">
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors haptic-feedback">
                <MessageSquare className="w-5 h-5" />
                <span className="font-medium">发送消息</span>
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors haptic-feedback">
                <Phone className="w-5 h-5" />
                <span className="font-medium">致电工程师</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
