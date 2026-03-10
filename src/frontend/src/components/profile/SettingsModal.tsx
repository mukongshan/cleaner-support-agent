import React, { useState, useEffect } from 'react';
import {
  User,
  ChevronRight,
  Globe,
  Info,
  LogOut,
  ArrowLeft,
  Trash2,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getConfirmBeforeDeleteHistory, setConfirmBeforeDeleteHistory } from '../../services/api/config';
import { Switch } from '../ui/switch';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
  onProfileInfoClick: () => void;
  onLanguageClick: () => void;
  onLogoutClick: () => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  isLoggedIn,
  onProfileInfoClick,
  onLanguageClick,
  onLogoutClick
}: SettingsModalProps) {
  const { language, t } = useLanguage();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showGeneralPage, setShowGeneralPage] = useState(false);
  const [confirmBeforeDeleteHistory, setConfirmBeforeDeleteHistoryState] = useState(true);

  useEffect(() => {
    setConfirmBeforeDeleteHistoryState(getConfirmBeforeDeleteHistory());
  }, [isOpen, showGeneralPage]);

  // 整行点击时的切换逻辑
  const handleRowClick = () => {
    const newValue = !confirmBeforeDeleteHistory;
    setConfirmBeforeDeleteHistoryState(newValue);
    setConfirmBeforeDeleteHistory(newValue);
  };

  const handleBackFromGeneral = () => {
    setShowGeneralPage(false);
  };

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{
        type: 'spring',
        damping: 25,
        stiffness: 200,
        mass: 0.8
      }}
      style={{
        backgroundColor: 'white',
        width: '100%',
        height: '100%',
        maxWidth: '28rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50,
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0
      }}
    >
      {/* 设置页头部 */}
      <div className="bg-white px-4 py-3 shadow-sm flex items-center gap-3">
        <button
          onClick={showGeneralPage ? handleBackFromGeneral : onClose}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors haptic-feedback"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h2 className="text-lg font-semibold text-gray-900">
          {showGeneralPage ? t('settings_general') : t('settings')}
        </h2>
      </div>

      {/* 设置内容 */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          backgroundColor: '#f9fafb',
          padding: '1rem'
        }}
      >
        {showGeneralPage ? (
          /* 通用页 */
          <div className="rounded-2xl overflow-hidden"
            style={{
              backdropFilter: 'blur(8px)',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            }}
          >
            {/* 点击整行切换 */}
            <div
              onClick={handleRowClick}
              className="hover:bg-gray-50 transition-colors cursor-pointer haptic-feedback"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem'
              }}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5 text-orange-600" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-900">{t('settings_confirm_before_delete_history')}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {t('settings_confirm_before_delete_history_desc')}
                  </div>
                </div>
              </div>

              {/* Radix UI Switch：左灰关 / 右蓝开，样式由组件内部 data-state 驱动 */}
              <div
                className="shrink-0 ml-3"
                onClick={(e) => e.stopPropagation()}
              >
                <Switch
                  checked={confirmBeforeDeleteHistory}
                  onCheckedChange={(checked) => {
                    setConfirmBeforeDeleteHistoryState(checked);
                    setConfirmBeforeDeleteHistory(checked);
                  }}
                />
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* ----- 以下个人信息、语言设置等代码保持完全不变 ----- */}
            {/* 个人信息 - 仅登录后显示 */}
            {isLoggedIn && (
              <div
                className="rounded-2xl overflow-hidden mb-4"
                style={{
                  backdropFilter: 'blur(8px)',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                }}
              >
                <button
                  onClick={onProfileInfoClick}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem'
                  }}
                  className="hover:bg-gray-50 transition-colors haptic-feedback"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{t('profile_info')}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            )}

            {/* 语言设置 */}
            <div
              className="rounded-2xl overflow-hidden mb-4"
              style={{
                backdropFilter: 'blur(8px)',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
              }}
            >
              <button
                onClick={onLanguageClick}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem'
                }}
                className="hover:bg-gray-50 transition-colors haptic-feedback"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Globe className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-900">{t('language_setting')}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {language === 'zh' ? t('chinese') : t('english')}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* 通用 */}
            <div
              className="rounded-2xl overflow-hidden mb-4"
              style={{
                backdropFilter: 'blur(8px)',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
              }}
            >
              <button
                onClick={() => setShowGeneralPage(true)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem'
                }}
                className="hover:bg-gray-50 transition-colors haptic-feedback"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Settings className="w-5 h-5 text-gray-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{t('settings_general')}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* 关于 */}
            <div
              className="rounded-2xl overflow-hidden mb-4"
              style={{
                backdropFilter: 'blur(8px)',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
              }}
            >
              <button
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem'
                }}
                className="hover:bg-gray-50 transition-colors haptic-feedback"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                    <Info className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-900">{t('about')}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{t('version')}</div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* 退出账号 - 仅登录后显示 */}
            {isLoggedIn && (
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  backdropFilter: 'blur(8px)',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                }}
              >
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem'
                  }}
                  className="hover:bg-gray-50 transition-colors haptic-feedback"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                      <LogOut className="w-5 h-5 text-red-600" />
                    </div>
                    <span className="text-sm font-medium text-red-600">{t('logout')}</span>
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
                  onClick={() => setShowLogoutConfirm(false)}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="rounded-2xl p-6 max-w-sm w-full"
                    style={{
                      backdropFilter: 'blur(8px)',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <LogOut className="w-8 h-8 text-red-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('logout_confirm')}</h3>
                      <p className="text-sm text-gray-600">
                        {t('logout_confirm_desc')}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button
                        onClick={() => setShowLogoutConfirm(false)}
                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors haptic-feedback"
                      >
                        {t('cancel')}
                      </button>
                      <button
                        onClick={() => {
                          setShowLogoutConfirm(false);
                          onLogoutClick();
                        }}
                        className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors haptic-feedback"
                      >
                        {t('confirm_logout')}
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </motion.div>
  );
}