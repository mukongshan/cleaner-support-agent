import React, { useState } from 'react';
import { 
  User, 
  ChevronRight, 
  Smartphone, 
  Package,
  Calendar,
  Shield,
  MapPin as MapPinIcon,
  FileText,
  Settings,
  Truck,
  BookOpen,
  Building,
  Users,
  Globe,
  Info,
  LogOut,
  ArrowLeft,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserRole } from '../App';
import { clearToken } from '../services/api';

interface ProfilePageProps {
  userRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onLogout?: () => void;
  isLoggedIn: boolean;
  onShowLogin?: () => void;
}

export function ProfilePage({ userRole, onRoleChange, onLogout, isLoggedIn, onShowLogin }: ProfilePageProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('zh-CN');

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

  const getRoleLabel = (role: UserRole) => {
    return role === 'dealer' ? '经销商' : '终端用户';
  };

  const handleLogout = () => {
    clearToken();
    setShowLogoutConfirm(false);
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <div className="min-h-full bg-gray-50 pb-6">
      {/* 个人信息区 */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 px-4 pt-6 pb-20">
        {isLoggedIn ? (
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
        ) : (
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <button
                onClick={onShowLogin}
                className="px-6 py-2 bg-white text-blue-600 rounded-xl font-medium hover:bg-blue-50 transition-colors haptic-feedback"
              >
                去登录
              </button>
              <p className="text-blue-100 text-sm mt-2">登录后享受完整服务</p>
            </div>
          </div>
        )}
      </div>

      {/* 用户角色选择卡片 */}
      <div className="px-4 -mt-16 mb-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-4"
        >
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 mb-1">用户身份</h3>
            <p className="text-xs text-gray-500">选择您的身份以获得对应服务</p>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onRoleChange('enduser')}
              className={`p-4 rounded-xl border-2 transition-all haptic-feedback ${
                userRole === 'enduser'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                userRole === 'enduser' ? 'bg-blue-500' : 'bg-gray-100'
              }`}>
                <Users className={`w-6 h-6 ${
                  userRole === 'enduser' ? 'text-white' : 'text-gray-600'
                }`} />
              </div>
              <div className={`text-sm font-medium ${
                userRole === 'enduser' ? 'text-blue-600' : 'text-gray-700'
              }`}>
                终端用户
              </div>
              <div className="text-xs text-gray-500 mt-1">
                个人/家庭使用
              </div>
            </button>

            <button
              onClick={() => onRoleChange('dealer')}
              className={`p-4 rounded-xl border-2 transition-all haptic-feedback ${
                userRole === 'dealer'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                userRole === 'dealer' ? 'bg-purple-500' : 'bg-gray-100'
              }`}>
                <Building className={`w-6 h-6 ${
                  userRole === 'dealer' ? 'text-white' : 'text-gray-600'
                }`} />
              </div>
              <div className={`text-sm font-medium ${
                userRole === 'dealer' ? 'text-purple-600' : 'text-gray-700'
              }`}>
                经销商
              </div>
              <div className="text-xs text-gray-500 mt-1">
                批发/代理商
              </div>
            </button>
          </div>

          <div className={`mt-3 p-3 rounded-lg ${
            userRole === 'dealer' ? 'bg-purple-50' : 'bg-blue-50'
          }`}>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                userRole === 'dealer' ? 'bg-purple-500' : 'bg-blue-500'
              }`} />
              <span className={`text-xs ${
                userRole === 'dealer' ? 'text-purple-700' : 'text-blue-700'
              }`}>
                当前身份：{getRoleLabel(userRole)}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 设备信息卡片 */}
      <div className="px-4 mb-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm p-4"
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

          <button 
            onClick={() => setShowSettings(true)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors haptic-feedback"
          >
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

      {/* 设置页面 */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed inset-0 bg-white z-50 flex justify-center"
          >
            <div className="w-full max-w-md h-full flex flex-col">
              {/* 设置页头部 */}
              <div className="bg-white px-4 py-3 shadow-sm flex items-center gap-3">
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors haptic-feedback"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-700" />
                </button>
                <h2 className="text-lg font-semibold text-gray-900">设置</h2>
              </div>

              {/* 设置内容 */}
              <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
                {/* 语言设置 */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
                  <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors haptic-feedback">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Globe className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-medium text-gray-900">语言设置</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {selectedLanguage === 'zh-CN' ? '简体中文' : 'English'}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* 关于 */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
                  <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors haptic-feedback">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                        <Info className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-medium text-gray-900">关于</div>
                        <div className="text-xs text-gray-500 mt-0.5">版本 1.0.0</div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* 退出账号 - 仅登录后显示 */}
                {isLoggedIn && (
                  <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <button 
                      onClick={() => setShowLogoutConfirm(true)}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors haptic-feedback"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                          <LogOut className="w-5 h-5 text-red-600" />
                        </div>
                        <span className="text-sm font-medium text-red-600">退出登录</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 退出确认对话框 */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4"
            onClick={() => setShowLogoutConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LogOut className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">确认退出？</h3>
                <p className="text-sm text-gray-600">
                  退出后需要重新登录才能使用服务
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors haptic-feedback"
                >
                  取消
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors haptic-feedback"
                >
                  确认退出
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
