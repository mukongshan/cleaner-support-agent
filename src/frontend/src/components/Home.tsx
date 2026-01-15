import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  WifiOff, 
  Battery, 
  Droplets, 
  MapPin, 
  AlertCircle,
  Play,
  Pause,
  Home as HomeIcon,
  Radio,
  Zap,
  MessageSquare,
  BookOpen,
  Camera,
  Search,
  ChevronRight
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { motion } from 'motion/react';

interface HomeProps {
  onOpenChat: (message?: string) => void;
  onOpenKnowledge: () => void;
}

type RobotStatus = 'cleaning' | 'charging' | 'standby' | 'error';

export function Home({ onOpenChat, onOpenKnowledge }: HomeProps) {
  const [robotStatus, setRobotStatus] = useState<RobotStatus>('standby');
  const [battery, setBattery] = useState(85);
  const [isOnline, setIsOnline] = useState(true);
  const [hasError, setHasError] = useState(false);

  // 模拟设备状态
  const deviceData = {
    name: '客厅的扫地僧 X10',
    wifiStrength: 4,
    cleanedArea: 45.8,
    cleanedTime: 38,
    estimatedRemaining: 45,
    cleanWaterLevel: 75,
    dirtyWaterLevel: 45,
    errorMessage: '悬空传感器异常'
  };

  const getStatusText = () => {
    switch (robotStatus) {
      case 'cleaning': return '清扫中';
      case 'charging': return '回充中';
      case 'standby': return '待机';
      case 'error': return '故障';
    }
  };

  const getStatusColor = () => {
    switch (robotStatus) {
      case 'cleaning': return 'text-green-600 bg-green-50 border-green-200';
      case 'charging': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'standby': return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  return (
    <div className="min-h-full bg-gradient-to-b from-blue-50 to-white">
      {/* 顶部状态栏 */}
      <div className="bg-white px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="font-semibold text-gray-900">{deviceData.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              {isOnline ? (
                <>
                  <Wifi className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-gray-600">在线</span>
                  <div className="flex gap-0.5 ml-1">
                    {[...Array(deviceData.wifiStrength)].map((_, i) => (
                      <div 
                        key={i} 
                        className="w-1 bg-green-500 rounded-sm"
                        style={{ height: `${(i + 1) * 3}px` }}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-400">离线</span>
                </>
              )}
            </div>
          </div>
          <div className={`px-3 py-1.5 rounded-full text-sm border ${getStatusColor()}`}>
            {getStatusText()}
          </div>
        </div>
      </div>

      {/* 核心场景入口区 - 三个场景 */}
      <div className="px-4 pt-4 pb-3">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">售后服务</h2>
        <div className="grid grid-cols-3 gap-3">
          {/* 场景一：我想去问 */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onOpenChat()}
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-all haptic-feedback"
          >
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <div className="font-semibold text-sm">我想去问</div>
                <div className="text-xs opacity-90 mt-0.5">AI智能问答</div>
              </div>
            </div>
          </motion.button>

          {/* 场景二：我想去查 */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onOpenKnowledge}
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-all haptic-feedback"
          >
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <div className="font-semibold text-sm">我想去查</div>
                <div className="text-xs opacity-90 mt-0.5">知识库中心</div>
              </div>
            </div>
          </motion.button>

          {/* 场景三：紧急上报 */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              // 触发紧急上报流程
              onOpenChat('紧急报障');
            }}
            className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-all haptic-feedback"
          >
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm animate-pulse">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <div className="font-semibold text-sm">紧急上报</div>
                <div className="text-xs opacity-90 mt-0.5">拍照报障</div>
              </div>
            </div>
          </motion.button>
        </div>

        {/* 快捷提问区 */}
        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="描述您的问题，如：机器人不充电..."
              className="w-full pl-10 pr-4 py-3 bg-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              onFocus={() => onOpenChat()}
            />
          </div>
        </div>
      </div>

      {/* 故障报警区 */}
      {hasError && (
        <div className="mx-4 mt-2 bg-red-50 border-2 border-red-300 rounded-xl p-4 slide-down">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-1">检测到设备异常</h3>
              <p className="text-sm text-red-700">{deviceData.errorMessage}</p>
            </div>
          </div>
          <button
            onClick={() => onOpenChat('悬空传感器异常')}
            className="w-full mt-3 bg-red-600 text-white py-2.5 rounded-lg font-medium haptic-feedback active:bg-red-700"
          >
            立即咨询 AI 医生
          </button>
        </div>
      )}

      {/* 机器视觉展示区 */}
      <div className="relative px-6 py-8">
        <div className="relative flex items-center justify-center">
          {/* 动态光圈效果 */}
          {robotStatus === 'cleaning' && (
            <>
              <div className="absolute w-64 h-64 rounded-full border-4 border-blue-400 opacity-30 pulse-ring" />
              <div className="absolute w-64 h-64 rounded-full border-4 border-blue-400 opacity-30 pulse-ring" style={{ animationDelay: '1s' }} />
            </>
          )}
          
          {robotStatus === 'charging' && (
            <div className="absolute w-64 h-64 rounded-full border-4 border-blue-300 breathe" />
          )}

          {robotStatus === 'error' && (
            <div className="absolute w-64 h-64 rounded-full border-4 border-red-400 opacity-50 animate-pulse" />
          )}

          {/* 机器人图片 */}
          <div className="relative w-56 h-56 rounded-full overflow-hidden shadow-lg bg-white">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1558317374-067fb5f30001?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb2JvdCUyMHZhY3V1bSUyMGNsZWFuZXJ8ZW58MXx8fHwxNzY4MTM2MzE4fDA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="清洁机器人"
              className="w-full h-full object-cover"
            />
            
            {/* 充电图标 */}
            {robotStatus === 'charging' && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 rounded-full p-4 shadow-lg animate-pulse">
                <Zap className="w-8 h-8 text-white fill-white" />
              </div>
            )}

            {/* 旋转光圈 */}
            {robotStatus === 'cleaning' && (
              <div className="absolute inset-0 border-4 border-transparent border-t-green-400 rounded-full rotate" />
            )}
          </div>
        </div>
      </div>

      {/* 关键参数指标 */}
      <div className="px-4 pb-6">
        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* 电量卡片 */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">电池电量</span>
              <Battery className="w-5 h-5 text-green-600" />
            </div>
            <div className="relative w-20 h-20 mx-auto">
              {/* 环形进度条 */}
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  stroke="#e5e7eb"
                  strokeWidth="6"
                  fill="none"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  stroke={battery > 20 ? '#10b981' : '#ef4444'}
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 34}`}
                  strokeDashoffset={`${2 * Math.PI * 34 * (1 - battery / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-semibold text-gray-900">{battery}%</span>
              </div>
            </div>
            <p className="text-xs text-center text-gray-500 mt-2">
              预计可清扫 {deviceData.estimatedRemaining}㎡
            </p>
          </div>

          {/* 清扫数据卡片 */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">今日清扫</span>
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <div className="space-y-2">
              <div>
                <div className="text-2xl font-semibold text-gray-900">{deviceData.cleanedArea}</div>
                <div className="text-xs text-gray-500">平方米</div>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                耗时 {deviceData.cleanedTime} 分钟
              </div>
            </div>
          </div>
        </div>

        {/* 水箱状态卡片 */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Droplets className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-600">水箱状态</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">清水箱</span>
                <span className="text-xs font-medium text-gray-700">{deviceData.cleanWaterLevel}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${deviceData.cleanWaterLevel}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">污水箱</span>
                <span className="text-xs font-medium text-gray-700">{deviceData.dirtyWaterLevel}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${
                    deviceData.dirtyWaterLevel > 80 ? 'bg-red-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${deviceData.dirtyWaterLevel}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 底部快捷操作 */}
      <div className="px-4 pb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="grid grid-cols-4 gap-3">
            <button
              onClick={() => setRobotStatus('cleaning')}
              className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-green-50 transition-colors haptic-feedback"
            >
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Play className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-xs text-gray-700">开始</span>
            </button>

            <button
              onClick={() => setRobotStatus('standby')}
              className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors haptic-feedback"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <Pause className="w-6 h-6 text-gray-600" />
              </div>
              <span className="text-xs text-gray-700">暂停</span>
            </button>

            <button
              onClick={() => setRobotStatus('charging')}
              className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-blue-50 transition-colors haptic-feedback"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <HomeIcon className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-xs text-gray-700">回充</span>
            </button>

            <button
              onClick={() => setHasError(!hasError)}
              className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-purple-50 transition-colors haptic-feedback"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Radio className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-xs text-gray-700">寻找</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}