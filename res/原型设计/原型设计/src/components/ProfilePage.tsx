import React, { useState } from 'react';
import { 
  User, 
  ChevronRight, 
  Smartphone, 
  Package,
  Calendar,
  Shield,
  TrendingUp,
  MapPin as MapPinIcon,
  FileText,
  Settings,
  Truck,
  BookOpen,
  Filter,
  BarChart3
} from 'lucide-react';
import { motion } from 'motion/react';

interface ConsumableItem {
  name: string;
  lifespan: number;
  remaining: number;
  icon: string;
}

interface CleaningLog {
  id: string;
  date: Date;
  area: number;
  duration: number;
  mapPreview: string;
}

export function ProfilePage() {
  const [selectedTab, setSelectedTab] = useState<'week' | 'month'>('week');

  const userData = {
    name: '张先生',
    phone: '138****8888',
    avatar: 'https://ui-avatars.com/api/?name=Zhang&background=3b82f6&color=fff&size=128'
  };

  const deviceInfo = {
    sn: 'SN202401150001',
    model: '扫地僧 X10 Pro',
    firmware: 'v2.3.5',
    activatedDate: '2024-01-15',
    warrantyDays: 345
  };

  const consumables: ConsumableItem[] = [
    { name: '主刷', lifespan: 100, remaining: 68, icon: '🌀' },
    { name: '边刷', lifespan: 100, remaining: 42, icon: '🔄' },
    { name: '滤网', lifespan: 100, remaining: 15, icon: '🔵' },
    { name: '拖布', lifespan: 100, remaining: 55, icon: '🧹' }
  ];

  const weeklyData = [
    { day: '周一', count: 2, area: 85 },
    { day: '周二', count: 1, area: 45 },
    { day: '周三', count: 2, area: 92 },
    { day: '周四', count: 1, area: 48 },
    { day: '周五', count: 3, area: 125 },
    { day: '周六', count: 2, area: 95 },
    { day: '周日', count: 1, area: 52 }
  ];

  const cleaningLogs: CleaningLog[] = [
    { id: '1', date: new Date(), area: 52, duration: 42, mapPreview: '🗺️' },
    { id: '2', date: new Date(Date.now() - 86400000), area: 95, duration: 78, mapPreview: '🗺️' },
    { id: '3', date: new Date(Date.now() - 172800000), area: 125, duration: 95, mapPreview: '🗺️' }
  ];

  const getConsumableColor = (remaining: number) => {
    if (remaining > 50) return 'bg-green-500';
    if (remaining > 20) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getConsumableTextColor = (remaining: number) => {
    if (remaining > 50) return 'text-green-600';
    if (remaining > 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  const maxArea = Math.max(...weeklyData.map(d => d.area));

  return (
    <div className="min-h-full bg-gray-50 pb-6">
      {/* 个人信息区 */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 px-4 pt-6 pb-20">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white overflow-hidden">
            <img src={userData.avatar} alt={userData.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 text-white">
            <h2 className="text-xl font-semibold mb-1">{userData.name}</h2>
            <div className="flex items-center gap-2 text-blue-100 text-sm">
              <Smartphone className="w-4 h-4" />
              <span>{userData.phone}</span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* 设备信息卡片 */}
      <div className="px-4 -mt-16 mb-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">设备档案</h3>
            <span className="text-xs text-gray-500">{deviceInfo.model}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500">序列号</div>
                <div className="text-sm font-medium text-gray-900">{deviceInfo.sn}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500">激活日期</div>
                <div className="text-sm font-medium text-gray-900">{deviceInfo.activatedDate}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500">固件版本</div>
                <div className="text-sm font-medium text-gray-900">{deviceInfo.firmware}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500">保修剩余</div>
                <div className="text-sm font-medium text-gray-900">{deviceInfo.warrantyDays} 天</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 耗材管理 */}
      <div className="px-4 mb-4">
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">耗材管理</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700">
              购买建议 →
            </button>
          </div>

          <div className="space-y-3">
            {consumables.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3"
              >
                <span className="text-2xl">{item.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{item.name}</span>
                    <span className={`text-sm font-semibold ${getConsumableTextColor(item.remaining)}`}>
                      {item.remaining}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.remaining}%` }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                      className={`h-full ${getConsumableColor(item.remaining)} ${
                        item.remaining < 20 ? 'animate-pulse' : ''
                      }`}
                    />
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* 清洁统计 */}
      <div className="px-4 mb-4">
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">清洁统计</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedTab('week')}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  selectedTab === 'week'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                本周
              </button>
              <button
                onClick={() => setSelectedTab('month')}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  selectedTab === 'month'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                本月
              </button>
            </div>
          </div>

          {/* 简易柱状图 */}
          <div className="mb-6">
            <div className="flex items-end justify-between h-32 gap-2">
              {weeklyData.map((data, index) => (
                <div key={data.day} className="flex-1 flex flex-col items-center gap-2">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(data.area / maxArea) * 100}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="w-full bg-blue-500 rounded-t-lg min-h-[20px] relative group"
                  >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      {data.area}㎡
                    </div>
                  </motion.div>
                  <span className="text-xs text-gray-500">{data.day.slice(1)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 统计摘要 */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">14</div>
              <div className="text-xs text-gray-500 mt-1">清扫次数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">542</div>
              <div className="text-xs text-gray-500 mt-1">覆盖面积(㎡)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">8.5</div>
              <div className="text-xs text-gray-500 mt-1">平均时长(h)</div>
            </div>
          </div>
        </div>
      </div>

      {/* 清洁日志 */}
      <div className="px-4 mb-4">
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">清洁日志</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700">
              查看全部 →
            </button>
          </div>

          <div className="space-y-3">
            {cleaningLogs.map((log, index) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer haptic-feedback"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                  {log.mapPreview}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 mb-1">
                    {log.date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{log.area}㎡</span>
                    <span>•</span>
                    <span>{log.duration}分钟</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* 服务管理 */}
      <div className="px-4">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors haptic-feedback">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                <Truck className="w-5 h-5 text-orange-600" />
              </div>
              <span className="text-sm font-medium text-gray-900">我的报修单</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          <div className="border-t border-gray-100" />

          <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors haptic-feedback">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <MapPinIcon className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-900">常用地址</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          <div className="border-t border-gray-100" />

          <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors haptic-feedback">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-900">知识库中心</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          <div className="border-t border-gray-100" />

          <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors haptic-feedback">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-gray-600" />
              </div>
              <span className="text-sm font-medium text-gray-900">设置</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
