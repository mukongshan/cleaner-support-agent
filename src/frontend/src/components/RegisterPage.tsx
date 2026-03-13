import React, { useState, useEffect } from 'react';
import {
    Eye,
    EyeOff,
    Loader,
    ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { register } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';

interface RegisterPageProps {
    onRegisterSuccess: () => void;
    onClose?: () => void;
    onSwitchToLogin?: () => void;
}

export function RegisterPage({ onRegisterSuccess, onClose, onSwitchToLogin }: RegisterPageProps) {
    const { t } = useLanguage();
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // 更新页面标题
    useEffect(() => {
        document.title = `${t('register')} - ${t('app_name')}`;
    }, [t]);

    const handleRegister = async () => {
        // 表单验证
        if (!phone.trim()) {
            toast.error(t('validation_phone_required'));
            return;
        }

        if (!/^1[3-9]\d{9}$/.test(phone)) {
            toast.error(t('validation_phone_invalid'));
            return;
        }

        if (!password.trim()) {
            toast.error(t('validation_password_required'));
            return;
        }

        if (password.length < 6) {
            toast.error(t('validation_password_min6'));
            return;
        }

        if (!confirmPassword.trim()) {
            toast.error(t('validation_confirm_password_required'));
            return;
        }

        if (password !== confirmPassword) {
            toast.error(t('validation_password_mismatch'));
            return;
        }

        try {
            setLoading(true);

            // 调用注册 API
            await register({
                username: phone,
                password: password,
                confirmPassword: confirmPassword
            });

            // 注册成功
            onRegisterSuccess();
        } catch (err: any) {
            toast.error(err.message || t('register_failed_default'));
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleRegister();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-gray-50/30 safe-area-top"
            style={{
                background: `
                    radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.4) 0%, transparent 50%),
                    radial-gradient(circle at 80% 20%, rgba(147, 197, 253, 0.4) 0%, transparent 50%),
                    #F5F7FA
                `
            }}
        >
            {/* 动态背景光晕 */}
            <div
                className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none"
                style={{
                    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)',
                    filter: 'blur(100px)',
                    transform: 'translate(-20%, -20%)',
                }}
            />
            <div
                className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full pointer-events-none"
                style={{
                    background: 'radial-gradient(circle, rgba(147, 197, 253, 0.4) 0%, transparent 70%)',
                    filter: 'blur(100px)',
                    transform: 'translate(20%, -20%)',
                }}
            />

            {/* 顶部固定导航栏 (与主界面类似) */}
            <div className="w-full px-4 py-4 relative z-20 flex items-center gap-3 shrink-0"
                style={{
                    backdropFilter: 'blur(12px)',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }}
            >
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-2 -ml-2 hover:bg-white/30 rounded-xl transition-colors haptic-feedback"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-700" />
                    </button>
                )}
                <h2 className="text-lg font-semibold text-gray-900">{t('register')}</h2>
            </div>

            {/* 中间内容区域 */}
            <div className="flex-1 overflow-y-auto flex px-4 pt-12 pb-[20vh] relative z-10 w-full justify-center">
                <motion.div 
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                    className="w-full max-w-md flex flex-col"
                >
                    {/* 表单内容 */}
                    <div className="px-4 py-4">
                        {/* 标题 */}
                        <div className="text-left mb-10">
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">注册智能清洁助手</h1>
                        </div>

                        {/* 手机号输入 */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('register_phone_label')}
                            </label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => {
                                    setPhone(e.target.value);
                                }}
                                onKeyPress={handleKeyPress}
                                placeholder={t('register_phone_placeholder')}
                                maxLength={11}
                                className="w-full px-4 py-3 bg-white hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm shadow-sm text-gray-800 placeholder:text-gray-400"
                            />
                        </div>

                        {/* 密码输入 */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('register_password_label')}
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                    }}
                                    onKeyPress={handleKeyPress}
                                    placeholder={t('register_password_placeholder')}
                                    className="w-full px-4 pr-12 py-3 bg-white hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm shadow-sm text-gray-800 placeholder:text-gray-400"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* 确认密码输入 */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('register_confirm_password_label')}
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value);
                                    }}
                                    onKeyPress={handleKeyPress}
                                    placeholder={t('register_confirm_password_placeholder')}
                                    className="w-full px-4 pr-12 py-3 bg-white hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm shadow-sm text-gray-800 placeholder:text-gray-400"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* 去登录提示 */}
                        <div className="mb-6 flex justify-end">
                            <button
                                onClick={onSwitchToLogin}
                                className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                            >
                                {t('register_has_account_login')}
                            </button>
                        </div>

                        {/* 注册按钮 */}
                        <div className="mt-8">
                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                onClick={handleRegister}
                                disabled={loading}
                                className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 shadow-md shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 haptic-feedback"
                            >
                                {loading ? (
                                    <>
                                        <Loader className="w-5 h-5 animate-spin" />
                                        <span>{t('registering')}</span>
                                    </>
                                ) : (
                                    <span>{t('register')}</span>
                                )}
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
