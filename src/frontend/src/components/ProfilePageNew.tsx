import React, { useState, useEffect, useRef } from 'react';
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
  const [showProfileInfo, setShowProfileInfo] = useState(false);
  const [showEditNickname, setShowEditNickname] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('zh-CN');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  // 编辑表单状态
  const [editNickname, setEditNickname] = useState('');
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // 文件上传引用
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 获取用户信息
  useEffect(() => {
    if (isLoggedIn) {
      loadUserProfile();
    }
  }, [isLoggedIn]);

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

  // 处理头像 URL
  const getAvatarUrl = (avatar: string | null | undefined, nickname: string) => {
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
  };

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
    setShowLogoutConfirm(false);
    setShowSettings(false); // 关闭设置页面
    if (onLogout) {
      onLogout();
    }
  };

  const handleUpdateNickname = async () => {
    // 验证昵称
    if (!editNickname.trim()) {
      setEditError('昵称不能为空');
      return;
    }

    if (editNickname.trim().length > 20) {
      setEditError('昵称长度不能超过20个字符');
      return;
    }

    try {
      setEditLoading(true);
      setEditError('');

      // 调用更新接口
      await updateUserProfile({
        nickname: editNickname.trim()
      });

      // 重新加载用户信息
      await loadUserProfile();

      // 关闭编辑页面
      setShowEditNickname(false);
    } catch (error: any) {
      setEditError(error.message || '更新失败，请稍后重试');
    } finally {
      setEditLoading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      setEditError('请选择图片文件');
      return;
    }

    // 验证文件大小（5MB）
    if (file.size > 5 * 1024 * 1024) {
      setEditError('图片大小不能超过5MB');
      return;
    }

    try {
      setUploadingAvatar(true);
      setEditError('');

      console.log('开始上传头像...');

      // 上传图片
      const uploadResult = await uploadMedia(file);
      console.log('上传成功，返回结果:', uploadResult);
      console.log('头像 URL:', uploadResult.url);

      // 更新用户头像
      await updateUserProfile({
        avatar: uploadResult.url
      });
      console.log('头像更新成功');

      // 重新加载用户信息
      await loadUserProfile();
      console.log('用户信息重新加载完成');

      // 清空文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('上传头像失败:', error);
      setEditError(error.message || '上传失败，请稍后重试');
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <div className="min-h-full bg-gray-50 pb-6">
      {/* 个人信息区 */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 px-4 pt-6 pb-20">
        {isLoggedIn ? (
          // 状态1：已登录
          <>
            {/* 如果正在加载 或 数据尚未准备好，显示骨架屏（Loading占位） */}
            {loading || !userData ? (
              <div className="flex items-center gap-4 animate-pulse">
                <div className="w-16 h-16 rounded-full bg-white/20"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-6 w-24 bg-white/20 rounded"></div>
                  <div className="h-4 w-32 bg-white/20 rounded"></div>
                </div>
              </div>
            ) : (
              // 数据加载完成，显示真实用户信息
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white overflow-hidden">
                  <img
                    src={userData.avatar}
                    alt={userData.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // ... 原有的错误处理逻辑保持不变
                      const target = e.currentTarget;
                      target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=3b82f6&color=fff&size=128`;
                    }}
                  />
                </div>
                <div className="flex-1 text-white">
                  <h2 className="text-xl font-semibold mb-1">{userData.name}</h2>
                  <div className="flex items-center gap-2 text-blue-100 text-sm">
                    <Smartphone className="w-4 h-4" />
                    <span>{userData.phone}</span>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          // 状态2：未登录 (保持原样)
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
                终端用户
              </div>
              <div className="text-xs text-gray-500 mt-1">
                个人/家庭使用
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
      </div> */}

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
      {showSettings && !showProfileInfo && (
        <div className="fixed inset-0 bg-white z-50 flex justify-center">
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
              {/* 个人信息 - 仅登录后显示 */}
              {isLoggedIn && (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
                  <button
                    onClick={() => {
                      setEditError('');
                      setShowProfileInfo(true);
                    }}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors haptic-feedback"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">个人信息</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              )}

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
              {/* 退出确认对话框 */}
              <AnimatePresence>
                {showLogoutConfirm && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4"
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
          </div>
        </div>
      )}

      {/* 个人信息展示页面 */}
      {showProfileInfo && (
        <div className="fixed inset-0 bg-white z-[65] flex justify-center">
          <div className="w-full max-w-md h-full flex flex-col">
            {/* 头部 */}
            <div className="bg-white px-4 py-3 shadow-sm flex items-center gap-3">
              <button
                onClick={() => setShowProfileInfo(false)}
                className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors haptic-feedback"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              <h2 className="text-lg font-semibold text-gray-900">个人信息</h2>
            </div>

            {/* 内容 */}
            <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
              {/* 错误提示 */}
              {editError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm"
                >
                  {editError}
                </motion.div>
              )}

              {/* 信息列表 */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {/* 头像 */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors haptic-feedback disabled:opacity-50"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-sm text-gray-600 w-16">头像</span>
                    <div className="flex-1 flex items-center justify-end gap-3">
                      {uploadingAvatar ? (
                        <Loader className="w-5 h-5 animate-spin text-blue-600" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden">
                          <img
                            src={userData.avatar}
                            alt="头像"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error('头像加载失败:', userData.avatar);
                              const target = e.currentTarget;
                              // 如果加载失败，使用默认头像
                              if (userProfile?.nickname) {
                                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile.nickname)}&background=3b82f6&color=fff&size=128`;
                              }
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 ml-2" />
                </button>

                <div className="border-t border-gray-100" />

                {/* 昵称 */}
                <button
                  onClick={() => {
                    setEditNickname(userProfile?.nickname || '');
                    setEditError('');
                    setShowEditNickname(true);
                  }}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors haptic-feedback"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-sm text-gray-600 w-16">昵称</span>
                    <div className="flex-1 text-right">
                      <span className="text-sm text-gray-900">{userProfile?.nickname || ''}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 ml-2" />
                </button>

                <div className="border-t border-gray-100" />

                {/* 手机号（不可修改） */}
                <div className="w-full flex items-center justify-between p-4 bg-gray-50">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-sm text-gray-600 w-16">手机号</span>
                    <div className="flex-1 text-right">
                      <span className="text-sm text-gray-500">{userProfile?.phone || ''}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 隐藏的文件上传输入 */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
          />
        </div>
      )}

      {/* 编辑昵称页面 */}
      {showEditNickname && (
        <div className="fixed inset-0 bg-white z-[75] flex justify-center">
          <div className="w-full max-w-md h-full flex flex-col">
            {/* 头部 */}
            <div className="bg-white px-4 py-3 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowEditNickname(false)}
                  className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors haptic-feedback"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-700" />
                </button>
                <h2 className="text-lg font-semibold text-gray-900">修改昵称</h2>
              </div>
              <button
                onClick={handleUpdateNickname}
                disabled={editLoading}
                className="text-blue-600 font-medium text-sm hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed haptic-feedback"
              >
                {editLoading ? '保存中...' : '保存'}
              </button>
            </div>

            {/* 内容 */}
            <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
              {/* 错误提示 */}
              {editError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm"
                >
                  {editError}
                </motion.div>
              )}

              {/* 昵称输入 */}
              <div className="bg-white rounded-2xl shadow-sm p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  昵称
                </label>
                <input
                  type="text"
                  value={editNickname}
                  onChange={(e) => {
                    setEditNickname(e.target.value);
                    setEditError('');
                  }}
                  placeholder="请输入昵称"
                  maxLength={20}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                  autoFocus
                />
                <div className="mt-2 text-xs text-gray-500 text-right">
                  {editNickname.length}/20
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
