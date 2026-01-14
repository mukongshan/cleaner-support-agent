import React, { useState } from 'react';
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
  Plus
} from 'lucide-react';
import { motion } from 'motion/react';

type TicketStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

interface Ticket {
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
  onCreateTicket?: () => void;
}

export function TicketsPage({ onCreateTicket }: TicketsPageProps) {
  const [selectedFilter, setSelectedFilter] = useState<'all' | TicketStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const tickets: Ticket[] = [
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

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* 顶部 */}
      <div className="bg-white px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">我的工单</h2>
          <button
            onClick={() => onCreateTicket?.()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors haptic-feedback shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>创建工单</span>
          </button>
        </div>
        
        {/* 搜索框 */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索工单编号或问题描述..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-blue-600">{statusCounts.all}</div>
            <div className="text-xs text-blue-700 mt-1">全部工单</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-yellow-600">{statusCounts.processing}</div>
            <div className="text-xs text-yellow-700 mt-1">处理中</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-green-600">{statusCounts.completed}</div>
            <div className="text-xs text-green-700 mt-1">已完成</div>
          </div>
        </div>

        {/* 过滤标签 */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm transition-all haptic-feedback ${
              selectedFilter === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            全部 ({statusCounts.all})
          </button>
          <button
            onClick={() => setSelectedFilter('pending')}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm transition-all haptic-feedback ${
              selectedFilter === 'pending'
                ? 'bg-yellow-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            待处理 ({statusCounts.pending})
          </button>
          <button
            onClick={() => setSelectedFilter('processing')}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm transition-all haptic-feedback ${
              selectedFilter === 'processing'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            处理中 ({statusCounts.processing})
          </button>
          <button
            onClick={() => setSelectedFilter('completed')}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm transition-all haptic-feedback ${
              selectedFilter === 'completed'
                ? 'bg-green-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            已完成 ({statusCounts.completed})
          </button>
        </div>
      </div>

      {/* 工单列表 */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {filteredTickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">暂无工单记录</h3>
            <p className="text-sm text-gray-500">
              {searchQuery ? '未找到匹配的工单' : '遇到问题时，AI助手会为您创建工单'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTickets.map((ticket, index) => {
              const statusInfo = getStatusInfo(ticket.status);
              const priorityInfo = getPriorityInfo(ticket.priority);
              const StatusIcon = statusInfo.icon;

              return (
                <motion.button
                  key={ticket.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`w-full bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all text-left border-l-4 ${statusInfo.borderColor} haptic-feedback`}
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
                        <span>{ticket.type === 'report' ? '故障报修' : '问题咨询'}</span>
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
                      <span className="text-xs font-medium">优先级: {priorityInfo.label}</span>
                    </div>
                  </div>

                  {/* 时间和工程师信息 */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{ticket.createdAt.toLocaleDateString('zh-CN')}</span>
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
                        <span>{ticket.updatedAt.toLocaleDateString('zh-CN')}</span>
                      </div>
                    )}
                  </div>

                  {/* 处理中的工单显示快捷操作 */}
                  {ticket.status === 'processing' && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                      <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs hover:bg-blue-100 transition-colors">
                        <MessageSquare className="w-3 h-3" />
                        <span>发送消息</span>
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-50 text-green-600 rounded-lg text-xs hover:bg-green-100 transition-colors">
                        <Phone className="w-3 h-3" />
                        <span>致电工程师</span>
                      </button>
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      {/* 底部提示 */}
      <div className="bg-white border-t border-gray-100 px-4 py-3 safe-area-bottom">
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <AlertCircle className="w-4 h-4" />
          <span>工单平均响应时间: 2小时内</span>
        </div>
      </div>
    </div>
  );
}
