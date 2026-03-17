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

// 浮动标签输入框组件（与登录页共享同一设计）
interface FloatFieldProps {
    label: string;
    value: string;
    type?: string;
    maxLength?: number;
    onKeyDown?: (e: React.KeyboardEvent) => void;
    onChange: (v: string) => void;
    suffix?: React.ReactNode;
}

function FloatField({ label, value, type = 'text', maxLength, onKeyDown, onChange, suffix }: FloatFieldProps) {
    const [focused, setFocused] = useState(false);
    const lifted = focused || value.length > 0;

    return (
        <div style={{ position: 'relative', paddingTop: '22px', marginBottom: '3.2vh' }}>
            {/* 浮动标签 */}
            <label
                style={{
                    position: 'absolute',
                    left: 0,
                    top: lifted ? '0px' : '22px',
                    fontSize: lifted ? '10px' : '15px',
                    fontWeight: lifted ? 700 : 400,
                    color: focused ? '#1a1a1a' : '#999999',
                    letterSpacing: lifted ? '0.12em' : '0',
                    textTransform: lifted ? 'uppercase' : 'none',
                    pointerEvents: 'none',
                    transition: 'top 0.22s ease, font-size 0.22s ease, color 0.22s ease, letter-spacing 0.22s ease',
                    lineHeight: 1,
                }}
            >
                {label}
            </label>

            {/* 输入框 */}
            <input
                type={type}
                value={value}
                maxLength={maxLength}
                onKeyDown={onKeyDown}
                onChange={e => onChange(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                style={{
                    display: 'block',
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    paddingBottom: '10px',
                    paddingRight: suffix ? '28px' : '0',
                    fontSize: '15px',
                    color: '#1a1a1a',
                    caretColor: '#1a1a1a',
                    boxSizing: 'border-box',
                }}
            />

            {/* 右侧附加元素 */}
            {suffix && (
                <div style={{
                    position: 'absolute',
                    right: 0,
                    bottom: '10px',
                    lineHeight: 1,
                }}>
                    {suffix}
                </div>
            )}

            {/* 静态底线 */}
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '1px',
                backgroundColor: '#d0d0d0',
            }} />

            {/* 动态扩展线 — 从中心向两侧展开 */}
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: focused ? '0%' : '50%',
                right: focused ? '0%' : '50%',
                height: '2px',
                backgroundColor: '#1a1a1a',
                transition: 'left 0.28s cubic-bezier(0.4,0,0.2,1), right 0.28s cubic-bezier(0.4,0,0.2,1)',
            }} />
        </div>
    );
}

export function RegisterPage({ onRegisterSuccess, onClose, onSwitchToLogin }: RegisterPageProps) {
    const { t } = useLanguage();
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        document.title = `${t('register')} - ${t('app_name')}`;
    }, [t]);

    const handleRegister = async () => {
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
            await register({ username: phone, password: password, confirmPassword: confirmPassword });
            onRegisterSuccess();
        } catch (err: any) {
            toast.error(err.message || t('register_failed_default'));
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleRegister();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex flex-col"
            style={{ backgroundColor: '#ffffff' }}
        >
            {/* 顶部导航栏 */}
            <div
                className="shrink-0 flex items-center"
                style={{
                    backgroundColor: '#ffffff',
                    paddingTop: 'calc(env(safe-area-inset-top, 0px) + 14px)',
                    paddingBottom: '14px',
                    paddingLeft: '2.5%',
                    paddingRight: '3%',
                }}
            >
                {onClose && (
                    <button
                        onClick={onClose}
                        className="transition-opacity hover:opacity-40"
                        style={{ color: '#1a1a1a', marginRight: '20px' }}
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                )}
                <span
                    style={{
                        color: '#1a1a1a',
                        fontSize: '18px',
                        fontWeight: 1000,
                        letterSpacing: '0.08em',
                    }}
                >
                    智能清洁助手
                </span>
            </div>

            {/* 主体内容 */}
            <div
                className="flex-1 overflow-y-auto flex flex-col"
                style={{
                    paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 40px)',
                }}
            >
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                    style={{
                        width: 'min(85%, 760px)',
                        margin: '0 auto',
                        paddingTop: '4vh',
                        paddingLeft: '7%',
                        paddingRight: '7%',
                        paddingBottom: '5vh',
                        marginBottom: '4vh',
                    }}
                >
                    {/* 页面标题 */}
                    <h1
                        style={{
                            fontSize: '35px',
                            fontWeight: 150,
                            color: '#1a1a1a',
                            letterSpacing: '0.08em',
                            lineHeight: 1.2,
                            textAlign: 'center',
                            marginBottom: '4vh',
                            textShadow: '0 1px 0 rgba(0,0,0,0.08), 1px 1px 0 rgba(0,0,0,0.04)',
                            WebkitTextStroke: '0.3px rgba(0,0,0,0.15)',
                        }}
                    >
                        注册
                    </h1>

                    {/* 手机号 */}
                    <FloatField
                        label="手机号码"
                        value={phone}
                        type="tel"
                        maxLength={11}
                        onKeyDown={handleKeyDown}
                        onChange={setPhone}
                    />

                    {/* 密码 */}
                    <FloatField
                        label="密码"
                        value={password}
                        type={showPassword ? 'text' : 'password'}
                        onKeyDown={handleKeyDown}
                        onChange={setPassword}
                        suffix={
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    color: '#aaaaaa',
                                    background: 'none',
                                    border: 'none',
                                    padding: 0,
                                    cursor: 'pointer',
                                    lineHeight: 1,
                                }}
                            >
                                {showPassword ? <EyeOff size={20} strokeWidth={1} /> : <Eye size={20} strokeWidth={1} />}
                            </button>
                        }
                    />

                    {/* 确认密码 */}
                    <FloatField
                        label="确认密码"
                        value={confirmPassword}
                        type={showConfirmPassword ? 'text' : 'password'}
                        onKeyDown={handleKeyDown}
                        onChange={setConfirmPassword}
                        suffix={
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                style={{
                                    color: '#aaaaaa',
                                    background: 'none',
                                    border: 'none',
                                    padding: 0,
                                    cursor: 'pointer',
                                    lineHeight: 1,
                                }}
                            >
                                {showConfirmPassword ? <EyeOff size={20} strokeWidth={1} /> : <Eye size={20} strokeWidth={1} />}
                            </button>
                        }
                    />

                    {/* 按钮组 */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '12px',
                        marginTop: '1vh',
                    }}>
                        {/* 注册按钮 */}
                        <motion.button
                            whileTap={{ scale: 0.99 }}
                            onClick={handleRegister}
                            disabled={loading}
                            className="disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                width: '50%',
                                height: '48px',
                                backgroundColor: '#000000',
                                color: '#ffffff',
                                border: 'none',
                                fontSize: '14px',
                                fontWeight: 700,
                                letterSpacing: '0.18em',
                                textTransform: 'uppercase',
                                cursor: 'pointer',
                                transition: 'background-color 0.18s ease',
                            }}
                            onMouseEnter={e => { if (!loading) (e.currentTarget.style.backgroundColor = '#505050'); }}
                            onMouseLeave={e => { if (!loading) (e.currentTarget.style.backgroundColor = '#000000'); }}
                        >
                            {loading ? (
                                <>
                                    <Loader size={14} className="animate-spin" />
                                    <span>注册中</span>
                                </>
                            ) : (
                                <span>注册</span>
                            )}
                        </motion.button>

                        {/* 返回登录按钮 */}
                        <button
                            onClick={onSwitchToLogin}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '50%',
                                height: '48px',
                                backgroundColor: 'transparent',
                                color: '#1a1a1a',
                                border: '1px solid #1a1a1a',
                                fontSize: '14px',
                                fontWeight: 700,
                                letterSpacing: '0.18em',
                                textTransform: 'uppercase',
                                cursor: 'pointer',
                                transition: 'opacity 0.18s ease',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.opacity = '0.55'; }}
                            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                        >
                            已有账号
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
