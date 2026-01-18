import React, { useState } from 'react';
import {
  ArrowLeft,
  Search,
  Book,
  Wrench,
  Video,
  ShoppingCart,
  ChevronRight,
  Play,
  FileText,
  Clock,
  Star,
  Download
} from 'lucide-react';
import { motion } from 'motion/react';

interface KnowledgePageProps {
  initialCategory?: string;
  onClose: () => void;
}

interface KnowledgeItem {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'article' | 'video' | 'pdf';
  duration?: string;
  rating?: number;
  views?: number;
  icon?: string;
}

export function KnowledgePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', name: '全部', icon: Book, color: 'blue' },
    { id: 'guide', name: '操作指南', icon: Book, color: 'blue' },
    { id: 'maintenance', name: '维护保养', icon: Wrench, color: 'green' },
    { id: 'demo', name: '产品演示', icon: Video, color: 'purple' }
  ];

  const knowledgeData: KnowledgeItem[] = [
    {
      id: '1',
      title: '首次使用设置指南',
      description: '详细介绍机器人的首次开箱、连接Wi-Fi和初始化设置流程',
      category: 'guide',
      type: 'article',
      views: 1280,
      rating: 4.8,
      icon: '📱'
    },
    {
      id: '2',
      title: '日常清洁与维护',
      description: '学习如何正确清洁主刷、边刷、滤网等关键部件',
      category: 'maintenance',
      type: 'video',
      duration: '8:32',
      views: 2150,
      rating: 4.9,
      icon: '🧹'
    },
    {
      id: '3',
      title: '主刷拆卸与清理教程',
      description: '分步骤演示主刷的拆卸、清洁和安装过程',
      category: 'maintenance',
      type: 'video',
      duration: '5:20',
      views: 1850,
      rating: 4.7,
      icon: '🔧'
    },
    {
      id: '4',
      title: '边刷更换操作指南',
      description: '快速更换边刷的简易教程，适合所有用户',
      category: 'maintenance',
      type: 'article',
      views: 980,
      rating: 4.6,
      icon: '🔄'
    },
    {
      id: '5',
      title: '全屋清扫功能演示',
      description: '观看机器人如何智能规划路径，完成全屋清扫任务',
      category: 'demo',
      type: 'video',
      duration: '12:45',
      views: 3200,
      rating: 5.0,
      icon: '🏠'
    },
    {
      id: '6',
      title: '地图绘制与编辑',
      description: '了解如何使用APP编辑清扫地图，设置虚拟墙和禁区',
      category: 'demo',
      type: 'video',
      duration: '10:15',
      views: 2680,
      rating: 4.8,
      icon: '🗺️'
    },
    {
      id: '7',
      title: '定时清扫设置教程',
      description: '设置每日或每周的自动清扫计划',
      category: 'guide',
      type: 'article',
      views: 1520,
      rating: 4.5,
      icon: '⏰'
    },
    {
      id: '8',
      title: '原装HEPA滤网',
      description: '官方认证滤网，99.97%过滤效率，建议3-6个月更换',
      category: 'shop',
      type: 'article',
      views: 890,
      icon: '🔵'
    },
    {
      id: '9',
      title: '边刷套装（4只装）',
      description: '原厂边刷，耐用性强，适配扫地僧X10全系列',
      category: 'shop',
      type: 'article',
      views: 1230,
      icon: '⭐'
    },
    {
      id: '10',
      title: '产品使用手册 PDF',
      description: '完整的产品说明书，包含所有功能介绍和故障排查',
      category: 'guide',
      type: 'pdf',
      views: 2340,
      icon: '📄'
    },
    {
      id: '11',
      title: '故障诊断与排查',
      description: '常见故障代码解释和自助排查步骤',
      category: 'guide',
      type: 'article',
      views: 3100,
      rating: 4.9,
      icon: '🔍'
    },
    {
      id: '12',
      title: '传感器清洁保养',
      description: '保持传感器清洁，确保机器人正常工作',
      category: 'maintenance',
      type: 'video',
      duration: '4:50',
      views: 1420,
      rating: 4.7,
      icon: '📡'
    }
  ];

  const filteredData = knowledgeData.filter(item => {
    // 过滤掉商城分类的内容
    if (item.category === 'shop') return false;

    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'pdf':
        return <FileText className="w-4 h-4" />;
      default:
        return <Book className="w-4 h-4" />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* 顶部搜索栏 */}
      <div className="bg-white px-4 py-4 shadow-sm">
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
      <div className="bg-white px-4 py-3 border-b border-gray-100 overflow-x-auto">
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
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {filteredData.length === 0 ? (
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
            {filteredData.map((item, index) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="w-full bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all text-left haptic-feedback"
              >
                <div className="flex gap-3">
                  {/* 图标 */}
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center text-2xl">
                    {item.icon}
                  </div>

                  {/* 内容 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 text-sm">{item.title}</h3>
                      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                    </div>

                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {item.description}
                    </p>

                    {/* 元信息 */}
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        {getTypeIcon(item.type)}
                        <span>
                          {item.type === 'video' ? '视频' : item.type === 'pdf' ? 'PDF' : '图文'}
                        </span>
                      </div>

                      {item.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{item.duration}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* 底部提示
      <div className="bg-white border-t border-gray-100 px-4 py-3 safe-area-bottom">
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <Download className="w-4 h-4" />
          <span>所有资料支持离线下载和收藏</span>
        </div>
      </div> */}
    </div>
  );
}