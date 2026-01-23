import React, { useState, useEffect, useCallback } from 'react';
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
  X,
  Edit,
  Camera,
  Loader,
  Check,
  AlignVerticalJustifyStart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserRole } from '../App';
import { clearToken, getUserProfile, updateUserProfile, UserProfile, uploadMedia, API_BASE_URL } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSelectionPage } from './LanguageSelectionPage';
import { SettingsModal } from './profile/SettingsModal';
import { ProfileInfoModal } from './profile/ProfileInfoModal';

interface ProfilePageProps {
  userRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onLogout?: () => void;
  isLoggedIn: boolean;
  onShowLogin?: () => void;
}

export function ProfilePage({ userRole, onRoleChange, onLogout, isLoggedIn, onShowLogin }: ProfilePageProps) {
  const { language, t } = useLanguage();
  const [showSettings, setShowSettings] = useState(false);
  const [showProfileInfo, setShowProfileInfo] = useState(false);
  const [showLanguageSelection, setShowLanguageSelection] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  // 个人信息状态（使用模拟数据初始化）
  const [personalInfo, setPersonalInfo] = useState({
    nickname: 'kksama',
    phone: '18198607791',
    avatar: ''
  });


  // 手机号掩码函数 - 使用正则表达式
  const maskPhoneNumber = (phone: string): string => {
    if (!phone) return '';
    // 使用正则表达式：(\d{3})\d{4}(\d{4}) 匹配11位手机号，替换中间4位为****
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
  };

  // 处理头像 URL
  const getAvatarUrl = useCallback((avatar: string | null | undefined, nickname: string) => {
    console.log('getAvatarUrl 输入:', { avatar, nickname });

    if (!avatar || avatar.trim() === '') {
      const defaultUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(nickname)}&background=3b82f6&color=fff&size=128`;
      console.log('返回默认头像:', defaultUrl);
      return defaultUrl;
    }

    // 如果是完整 URL（以 http:// 或 https:// 开头），直接返回
    if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
      console.log('返回完整 URL:', avatar);
      return avatar;
    }

    // 如果是相对路径，拼接基础 URL
    // 获取服务器基础 URL（不包含 /api 路径）
    const match = API_BASE_URL.match(/^(https?:\/\/[^\/]+)/);
    const serverUrl = match ? match[1] : window.location.origin;

    // 确保路径以 / 开头
    const path = avatar.startsWith('/') ? avatar : `/${avatar}`;
    const fullUrl = `${serverUrl}${path}`;

    console.log('拼接完整 URL:', {
      avatar,
      serverUrl,
      path,
      fullUrl,
      API_BASE_URL
    });

    return fullUrl;
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const profile = await getUserProfile();
      setUserProfile(profile);
    } catch (error: any) {
      console.error('获取用户信息失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取用户信息
  useEffect(() => {
    if (isLoggedIn) {
      loadUserProfile();
    } else {
      // 未登录时使用模拟数据
      setPersonalInfo({
        nickname: 'kksama',
        phone: '18198607791',
        avatar: ''
      });
    }
  }, [isLoggedIn]);

  // 当 userProfile 更新时，同步到 personalInfo
  useEffect(() => {
    if (userProfile) {
      setPersonalInfo({
        nickname: userProfile.nickname || 'kksama',
        phone: userProfile.phone || '18198607791',
        avatar: getAvatarUrl(userProfile.avatar, userProfile.nickname || 'kksama')
      });
    }
  }, [userProfile, getAvatarUrl]);

  const userData = userProfile ? {
    name: userProfile.nickname,
    phone: userProfile.phone,
    avatar: getAvatarUrl(userProfile.avatar, userProfile.nickname)
  } : {
    name: '用户',
    phone: '',
    avatar: ''
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
    setShowSettings(false); // 关闭设置页面
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <div className="min-h-full pb-6 bg-transparent">
      {/* 个人信息区 */}
      <div
        className="px-4 pt-6 pb-20 relative z-10"
        style={{
          backdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(255, 255, 255, 0.1)'
        }}
      >
        {isLoggedIn ? (
          // 状态1：已登录
          <>
            {/* 如果正在加载 或 数据尚未准备好，显示骨架屏（Loading占位） */}
            {loading ? (
              <div className="flex items-center gap-4 animate-pulse">
                <div className="w-16 h-16 rounded-full bg-gray-200"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-6 w-24 bg-gray-200 rounded"></div>
                  <div className="h-4 w-32 bg-gray-200 rounded"></div>
                </div>
              </div>
            ) : (
              // 显示用户信息
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white overflow-hidden shadow-md">
                  <img
                    src={personalInfo.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(personalInfo.nickname)}&background=3b82f6&color=fff&size=128`}
                    alt={personalInfo.nickname}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(personalInfo.nickname)}&background=3b82f6&color=fff&size=128`;
                    }}
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-1 text-gray-900">{personalInfo.nickname}</h2>
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <Smartphone className="w-4 h-4" />
                    <span>{maskPhoneNumber(personalInfo.phone)}</span>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          // 状态2：未登录
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="w-8 h-8 text-gray-500" />
            </div>
            <div className="flex-1">
              <button
                onClick={onShowLogin}
                className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors haptic-feedback"
              >
                {t('login_required')}
              </button>
              <p className="text-gray-600 text-sm mt-2">{t('login_desc')}</p>
            </div>
          </div>
        )}
      </div>

      {/* 用户角色选择卡片 */}
      <div className="px-4 -mt-16 mb-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-4"
          style={{
            backdropFilter: 'blur(8px)',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        >
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 mb-1">{t('user_role')}</h3>
            <p className="text-xs text-gray-500">{t('user_role_desc')}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onRoleChange('enduser')}
              className={`p-4 rounded-xl border-2 transition-all haptic-feedback ${userRole === 'enduser'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
            >
              <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${userRole === 'enduser' ? 'bg-blue-500' : 'bg-gray-100'
                }`}>
                <Users className={`w-6 h-6 ${userRole === 'enduser' ? 'text-white' : 'text-gray-600'
                  }`} />
              </div>
              <div className={`text-sm font-medium ${userRole === 'enduser' ? 'text-blue-600' : 'text-gray-700'
                }`}>
                {t('enduser')}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {t('enduser_desc')}
              </div>
            </button>

            <button
              onClick={() => onRoleChange('dealer')}
              className={`p-4 rounded-xl border-2 transition-all haptic-feedback ${userRole === 'dealer'
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
            >
              <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${userRole === 'dealer' ? 'bg-purple-500' : 'bg-gray-100'
                }`}>
                <Building className={`w-6 h-6 ${userRole === 'dealer' ? 'text-white' : 'text-gray-600'
                  }`} />
              </div>
              <div className={`text-sm font-medium ${userRole === 'dealer' ? 'text-purple-600' : 'text-gray-700'
                }`}>
                经销商
              </div>
              <div className="text-xs text-gray-500 mt-1">
                批发/代理商
              </div>
            </button>
          </div>

          <div className={`mt-3 p-3 rounded-lg ${userRole === 'dealer' ? 'bg-purple-50' : 'bg-blue-50'
            }`}>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${userRole === 'dealer' ? 'bg-purple-500' : 'bg-blue-500'
                }`} />
              <span className={`text-xs ${userRole === 'dealer' ? 'text-purple-700' : 'text-blue-700'
                }`}>
                当前身份：{getRoleLabel(userRole)}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 设备信息卡片
      <div className="px-4 mb-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-4"
          style={{
            backdropFilter: 'blur(8px)',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}
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
      </div> */}

      {/* 服务管理 */}
      <div className="px-4">
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            backdropFilter: 'blur(8px)',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}
        >

          <button
            onClick={() => setShowSettings(true)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors haptic-feedback"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-gray-600" />
              </div>
              <span className="text-sm font-medium text-gray-900">{t('settings')}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Layer 1: Profile Main Page */}
      {/* (Already rendered above) */}

      {/* Layer 2: Settings Modal (Z-Index 50) - 保持挂载，不因子页面打开而卸载 */}
      <AnimatePresence>
        {showSettings && (
          <SettingsModal
            key="settings-modal"
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
            isLoggedIn={isLoggedIn}
            onProfileInfoClick={() => setShowProfileInfo(true)}
            onLanguageClick={() => setShowLanguageSelection(true)}
            onLogoutClick={handleLogout}
          />
        )}
      </AnimatePresence>

      {/* Layer 3: Sub-Modals (Z-Index 60) - 堆叠在设置页面上方 */}
      <AnimatePresence>
        {showProfileInfo && (
          <ProfileInfoModal
            isOpen={showProfileInfo}
            onBack={() => setShowProfileInfo(false)}
            personalInfo={personalInfo}
            isLoggedIn={isLoggedIn}
            userProfile={userProfile}
            onPersonalInfoUpdate={setPersonalInfo}
            onUserProfileReload={loadUserProfile}
            getAvatarUrl={getAvatarUrl}
            maskPhoneNumber={maskPhoneNumber}
          />
        )}
        {showLanguageSelection && (
          <LanguageSelectionPage onBack={() => setShowLanguageSelection(false)} />
        )}
      </AnimatePresence>


    </div>
  );
}
