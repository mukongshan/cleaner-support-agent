import React, { useState } from 'react';
import {
    Eye,
    EyeOff,
    Loader,
    ArrowLeft
} from 'lucide-react';
import { motion } from 'motion/react';
import { login } from '../services/api';

interface LoginPageProps {
    onLoginSuccess: () => void;
    onClose?: () => void;
}

export function LoginPage({ onLoginSuccess, onClose }: LoginPageProps) {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        // 表单验证
        if (!phone.trim()) {
            setError('请输入手机号');
            return;
        }

        if (!/^1[3-9]\d{9}$/.test(phone)) {
            setError('请输入正确的手机号');
            return;
        }

        if (!password.trim()) {
            setError('请输入密码');
            return;
        }

        if (password.length < 6) {
            setError('密码长度不能少于6位');
            return;
        }

        try {
            setLoading(true);
            setError('');

            // 调用登录 API
            await login({
                username: phone,
                password: password,
                loginType: 'password'
            });

            // 登录成功
            onLoginSuccess();
        } catch (err: any) {
            setError(err.message || '登录失败，请检查手机号和密码');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleLogin();
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
                    <h2 className="text-lg font-semibold text-gray-900">登录</h2>
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
                                请输入手机号
                            </label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => {
                                    setPhone(e.target.value);
                                    setError('');
                                }}
                                onKeyPress={handleKeyPress}
                                placeholder="手机号"
                                maxLength={11}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                            />
                        </div>

                        {/* 密码输入 */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                请输入密码
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
                                    placeholder="密码"
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

                        {/* 登录按钮 */}
                        <button
                            onClick={handleLogin}
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 haptic-feedback"
                        >
                            {loading ? (
                                <>
                                    <Loader className="w-5 h-5 animate-spin" />
                                    <span>登录中...</span>
                                </>
                            ) : (
                                <span>登录</span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
