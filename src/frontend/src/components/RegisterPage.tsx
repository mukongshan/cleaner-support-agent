import React, { useState } from 'react';
import {
    Eye,
    EyeOff,
    Loader,
    ArrowLeft
} from 'lucide-react';
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
    const [error, setError] = useState('');

    const handleRegister = async () => {
        // 表单验证
        if (!phone.trim()) {
            setError(t('validation_phone_required'));
            return;
        }

        if (!/^1[3-9]\d{9}$/.test(phone)) {
            setError(t('validation_phone_invalid'));
            return;
        }

        if (!password.trim()) {
            setError(t('validation_password_required'));
            return;
        }

        if (password.length < 6) {
            setError(t('validation_password_min6'));
            return;
        }

        if (!confirmPassword.trim()) {
            setError(t('validation_confirm_password_required'));
            return;
        }

        if (password !== confirmPassword) {
            setError(t('validation_password_mismatch'));
            return;
        }

        try {
            setLoading(true);
            setError('');

            // 调用注册 API
            await register({
                username: phone,
                password: password,
                confirmPassword: confirmPassword
            });

            // 注册成功
            onRegisterSuccess();
        } catch (err: any) {
            setError(err.message || t('register_failed_default'));
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
        <div className="fixed inset-0 bg-gray-50 z-50 flex justify-center">
            <div className="w-full max-w-md flex flex-col">
                {/* 头部 */}
                <div className="bg-white px-4 py-3 shadow-sm flex items-center gap-3">
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors haptic-feedback"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-700" />
                        </button>
                    )}
                    <h2 className="text-lg font-semibold text-gray-900">{t('register')}</h2>
                </div>

                {/* 表单内容 */}
                <div className="flex-1 overflow-y-auto">
                    <div className="px-6 py-8">
                        {/* 错误提示 */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm"
                            >
                                {error}
                            </motion.div>
                        )}

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
                                    setError('');
                                }}
                                onKeyPress={handleKeyPress}
                                placeholder={t('register_phone_placeholder')}
                                maxLength={11}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
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
                                        setError('');
                                    }}
                                    onKeyPress={handleKeyPress}
                                    placeholder={t('register_password_placeholder')}
                                    className="w-full px-4 pr-12 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
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
                                        setError('');
                                    }}
                                    onKeyPress={handleKeyPress}
                                    placeholder={t('register_confirm_password_placeholder')}
                                    className="w-full px-4 pr-12 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
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
                        <button
                            onClick={handleRegister}
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 haptic-feedback"
                        >
                            {loading ? (
                                <>
                                    <Loader className="w-5 h-5 animate-spin" />
                                    <span>{t('registering')}</span>
                                </>
                            ) : (
                                <span>{t('register')}</span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
