import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  ChevronRight,
  Loader,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useLanguage } from '../../contexts/LanguageContext';
import { UserProfile, updateUserProfile, uploadMedia, API_BASE_URL } from '../../services/api';

interface ProfileInfoModalProps {
  isOpen: boolean;
  onBack: () => void;
  personalInfo: {
    nickname: string;
    phone: string;
    avatar: string;
  };
  isLoggedIn: boolean;
  userProfile: UserProfile | null;
  onPersonalInfoUpdate: (info: { nickname: string; phone: string; avatar: string }) => void;
  onUserProfileReload: () => Promise<void>;
  getAvatarUrl: (avatar: string | null | undefined, nickname: string) => string;
  maskPhoneNumber: (phone: string) => string;
}

export function ProfileInfoModal({
  isOpen,
  onBack,
  personalInfo,
  isLoggedIn,
  userProfile,
  onPersonalInfoUpdate,
  onUserProfileReload,
  getAvatarUrl,
  maskPhoneNumber
}: ProfileInfoModalProps) {
  const { t } = useLanguage();
  const [showEditNickname, setShowEditNickname] = useState(false);
  const [editNickname, setEditNickname] = useState('');
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 注意：不在这里返回 null，让父组件的 AnimatePresence 处理显示/隐藏
  // if (!isOpen) return null; // 已移除，由 AnimatePresence 控制

  const handleUpdateNickname = async () => {
    // 验证昵称
    if (!editNickname.trim()) {
      setEditError(t('profile_nickname_required'));
      return;
    }

    if (editNickname.trim().length > 20) {
      setEditError(t('profile_nickname_too_long'));
      return;
    }

    try {
      setEditLoading(true);
      setEditError('');

      // 立即更新本地状态
      onPersonalInfoUpdate({ ...personalInfo, nickname: editNickname.trim() });

      // 如果已登录，则更新到服务器
      if (isLoggedIn) {
        await updateUserProfile({
          nickname: editNickname.trim()
        });
        await onUserProfileReload();
      }

      // 关闭编辑页面
      setShowEditNickname(false);
    } catch (error: any) {
      setEditError(error.message || t('profile_update_failed'));
      // 如果更新失败，恢复之前的昵称
      onPersonalInfoUpdate({
        ...personalInfo,
        nickname: userProfile?.nickname || 'kksama'
      });
    } finally {
      setEditLoading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      setEditError(t('profile_select_image_file'));
      return;
    }

    // 验证文件大小（5MB）
    if (file.size > 5 * 1024 * 1024) {
      setEditError(t('profile_image_size_limit'));
      return;
    }

    try {
      setUploadingAvatar(true);
      setEditError('');

      // 立即更新本地状态，使用 FileReader 或 URL.createObjectURL 显示预览
      const imageUrl = URL.createObjectURL(file);
      onPersonalInfoUpdate({ ...personalInfo, avatar: imageUrl });

      // 如果已登录，则上传到服务器
      if (isLoggedIn) {
        console.log('开始上传头像...');
        const uploadResult = await uploadMedia(file);
        console.log('上传成功，返回结果:', uploadResult);

        // 更新用户头像
        await updateUserProfile({
          avatar: uploadResult.url
        });
        console.log('头像更新成功');

        // 更新本地状态为服务器返回的 URL
        onPersonalInfoUpdate({ ...personalInfo, avatar: uploadResult.url });

        // 重新加载用户信息
        await onUserProfileReload();
      }

      // 清空文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('上传头像失败:', error);
      setEditError(error.message || t('profile_upload_failed'));
      // 如果上传失败，恢复之前的头像
      if (userProfile) {
        onPersonalInfoUpdate({
          ...personalInfo,
          avatar: getAvatarUrl(userProfile.avatar, userProfile.nickname)
        });
      }
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'white',
          zIndex: 60,
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '28rem',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* 头部 */}
          <div className="bg-white px-4 py-3 shadow-sm flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors haptic-feedback"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900">{t('profile_info')}</h2>
          </div>

          {/* 内容 */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              backgroundColor: '#f9fafb',
              padding: '1rem'
            }}
          >
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
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                backdropFilter: 'blur(8px)',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
              }}
            >
              {/* 头像 */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem'
                }}
                className="hover:bg-gray-50 transition-colors haptic-feedback disabled:opacity-50"
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    flex: 1
                  }}
                >
                  <span className="text-sm text-gray-600 w-16">{t('avatar')}</span>
                  <div
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: '0.75rem'
                    }}
                  >
                    {uploadingAvatar ? (
                      <Loader className="w-5 h-5 animate-spin text-blue-600" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden">
                        <img
                          src={personalInfo.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(personalInfo.nickname)}&background=3b82f6&color=fff&size=128`}
                          alt={t('image_avatar_alt')}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(personalInfo.nickname)}&background=3b82f6&color=fff&size=128`;
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
                  setEditNickname(personalInfo.nickname);
                  setEditError('');
                  setShowEditNickname(true);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem'
                }}
                className="hover:bg-gray-50 transition-colors haptic-feedback"
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    flex: 1
                  }}
                >
                  <span className="text-sm text-gray-600 w-16">{t('nickname')}</span>
                  <div style={{ flex: 1, textAlign: 'right' }}>
                    <span className="text-sm text-gray-900">{personalInfo.nickname}</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 ml-2" />
              </button>

              <div className="border-t border-gray-100" />

              {/* 手机号（不可修改） */}
              <button
                onClick={() => toast.warning(t('phone_number_cannot_change'), { duration: 2000 })}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem',
                  backgroundColor: '#f9fafb'
                }}
                className="hover:bg-gray-100 transition-colors haptic-feedback"
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    flex: 1
                  }}
                >
                  <span className="text-sm text-gray-600 w-16">{t('phone_number')}</span>
                  <div style={{ flex: 1, textAlign: 'right' }}>
                    <span className="text-sm text-gray-500">{maskPhoneNumber(personalInfo.phone)}</span>
                  </div>
                </div>
              </button>
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
      </motion.div>

      {/* 编辑昵称对话框 */}
      <AnimatePresence>
        {showEditNickname && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 70,
              padding: '1rem'
            }}
            onClick={() => setShowEditNickname(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{t('edit_nickname')}</h3>
                <button
                  onClick={() => setShowEditNickname(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <input
                type="text"
                value={editNickname}
                onChange={(e) => {
                  setEditNickname(e.target.value);
                  setEditError('');
                }}
                placeholder={t('nickname')}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
                maxLength={20}
                autoFocus
              />

              {editError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  {editError}
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => setShowEditNickname(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors haptic-feedback"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleUpdateNickname}
                  disabled={editLoading}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors haptic-feedback disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editLoading ? t('saving') : t('save')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
