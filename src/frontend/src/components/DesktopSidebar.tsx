import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  MessageSquare,
  BookOpen,
  ClipboardList,
  User,
  Plus,
  ChevronLeft,
  ChevronRight,
  Bot,
} from 'lucide-react';
import { ROUTES, pathnameToTab } from '../constants/routes';
import { getConversations, Conversation } from '../services/api';
import { getToken } from '../services/api/config';
import { useLanguage } from '../contexts/LanguageContext';

interface DesktopSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  /** 当前激活的会话 ID（由父组件传入，用于高亮历史列表项） */
  activeConvId?: string;
}

export function DesktopSidebar({ collapsed, onToggle, activeConvId }: DesktopSidebarProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = pathnameToTab(location.pathname);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  // 展开动画结束后再显示文字，避免动画中文字被挤压
  const [showText, setShowText] = useState(!collapsed);
  useEffect(() => {
    if (collapsed) {
      setShowText(false);
    } else {
      const timer = setTimeout(() => setShowText(true), 250);
      return () => clearTimeout(timer);
    }
  }, [collapsed]);

  // 获取历史对话列表
  const fetchConversations = async () => {
    if (!getToken()) return;
    setLoading(true);
    try {
      const list = await getConversations();
      setConversations(list);
    } catch {
      // 静默失败
    } finally {
      setLoading(false);
    }
  };

  // 首次挂载时及路由变化到 /chat 时刷新
  useEffect(() => {
    fetchConversations();
  }, [location.pathname]);

  const handleNewChat = () => {
    navigate(ROUTES.CHAT, { state: { newChat: Date.now() } });
  };

  const handleConvClick = (convId: string, convTitle: string) => {
    navigate(ROUTES.CHAT, { state: { convId, convTitle } });
  };

  const navItems = [
    { path: ROUTES.KNOWLEDGE, icon: BookOpen, label: t('tab_knowledge') },
    { path: ROUTES.TICKETS, icon: ClipboardList, label: t('tab_ticket') },
    { path: ROUTES.PROFILE, icon: User, label: t('tab_profile') },
  ];

  return (
    <aside
      className="flex flex-col h-screen bg-white border-r border-gray-200 flex-shrink-0 overflow-hidden"
      style={{ width: collapsed ? '64px' : '240px', transition: 'width 0.25s ease' }}
    >
      {/* 顶部：App 名称 / Logo */}
      <div
        className="flex items-center gap-2 px-3 py-4 border-b border-gray-100"
        style={{ minHeight: '60px' }}
      >
        <div className="flex-shrink-0 w-8 h-8 bg-black rounded-lg flex items-center justify-center">
          {collapsed ? (
            <span className="text-base leading-none">🧹</span>
          ) : (
            <Bot className="w-4 h-4 text-white" />
          )}
        </div>
        {showText && (
          <span
            className="text-sm font-semibold text-gray-900 truncate"
            style={{ letterSpacing: '0.03em' }}
          >
            {t('app_name')}
          </span>
        )}
      </div>

      {/* 折叠切换按钮 */}
      <div className="px-2 pt-3 pb-1">
        <button
          type="button"
          onClick={onToggle}
          className="rounded-lg px-2 py-2 text-sm transition-colors"
          style={{ display: 'flex', width: '100%', minHeight: '36px', alignItems: 'center', gap: '8px', justifyContent: collapsed ? 'center' : 'flex-start', color: '#6b7280', backgroundColor: 'transparent' }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          title={collapsed ? '展开侧边栏' : '收起侧边栏'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 flex-shrink-0" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 flex-shrink-0" />
              {showText && <span>收起</span>}
            </>
          )}
        </button>
      </div>

      {/* 新建会话按钮 */}
      <div className="px-2 pt-1 pb-2">
        <button
          type="button"
          onClick={handleNewChat}
          className="rounded-lg px-2 py-2 text-sm font-medium transition-colors"
          style={{ display: 'flex', width: '100%', minHeight: '36px', alignItems: 'center', gap: '8px', justifyContent: collapsed ? 'center' : 'flex-start', backgroundColor: '#000000', color: '#ffffff' }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#374151')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#000000')}
          title={t('new_chat') || '新建会话'}
        >
          <Plus className="w-4 h-4 flex-shrink-0" />
          {showText && <span>{t('new_chat') || '新建会话'}</span>}
        </button>
      </div>

      {/* 历史对话列表（中间，可滚动） */}
      <div className="flex-1 overflow-y-auto px-2 py-1">
        {showText && (
          <p
            className="text-xs font-medium text-gray-400 px-2 py-1 mb-1"
            style={{ letterSpacing: '0.08em', textTransform: 'uppercase' }}
          >
            {t('history') || '历史对话'}
          </p>
        )}

        {loading && !conversations.length && (
          <div className="flex justify-center py-4">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          </div>
        )}

        {conversations.map((conv) => {
          const isActive = activeConvId === conv.id;
          return (
            <button
              key={conv.id}
              type="button"
              onClick={() => handleConvClick(conv.id, conv.title)}
              className="rounded-lg px-2 py-2 text-left text-sm transition-colors mb-0.5"
              style={{ display: 'flex', width: '100%', minHeight: '36px', alignItems: 'center', gap: '8px', justifyContent: collapsed ? 'center' : 'flex-start', backgroundColor: isActive ? '#e5e7eb' : 'transparent', color: isActive ? '#111827' : '#374151' }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = '#f3f4f6'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
              title={conv.title}
            >
              <MessageSquare className="w-4 h-4 flex-shrink-0 text-gray-400" />
              {showText && (
                <span className="truncate flex-1">{conv.title}</span>
              )}
            </button>
          );
        })}

        {!loading && conversations.length === 0 && showText && (
          <p className="text-xs text-gray-400 text-center py-4">
            {t('no_history')}
          </p>
        )}
      </div>

      {/* 底部分隔线 */}
      <div className="border-t border-gray-100" />

      {/* 底部导航（知识库/工单/个人中心） */}
      <nav className="px-2 py-2">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = activeTab === path;
          return (
            <button
              key={path}
              type="button"
              onClick={() => navigate(path)}
              className="rounded-lg px-2 py-2 text-sm transition-colors mb-0.5"
              style={{ display: 'flex', width: '100%', minHeight: '36px', alignItems: 'center', gap: '8px', justifyContent: collapsed ? 'center' : 'flex-start', backgroundColor: isActive ? '#f3f4f6' : 'transparent', color: isActive ? '#111827' : '#4b5563', fontWeight: isActive ? 500 : 400 }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = '#f3f4f6'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
              title={label}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-gray-900' : 'text-gray-400'}`} />
              {showText && <span>{label}</span>}
            </button>
          );
        })}
      </nav>

    </aside>
  );
}
