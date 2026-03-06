import React, { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { Home } from './components/Home';
import { ChatPage } from './components/ChatPageNew';
import { ProfilePage } from './components/ProfilePageNew';
import { KnowledgePage } from './components/KnowledgePage';
import { TicketsPage, Ticket } from './components/TicketsPage';
import { TicketDetailPage } from './components/TicketDetailPage';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { Home as HomeIcon, MessageSquare, User, BookOpen, ClipboardList } from 'lucide-react';
import { getToken, setOnUnauthorized } from './services/api';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

type TabType = 'home' | 'chat' | 'knowledge' | 'tickets' | 'profile' | 'ticket-detail';
export type UserRole = 'dealer' | 'enduser';

function AppContent() {
  const { t } = useLanguage();
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!getToken());
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('chat'); // 默认显示问答界面
  const [initialChatMessage, setInitialChatMessage] = useState<string>('');
  const [savedChatInput, setSavedChatInput] = useState<string>(''); // 保存用户输入的问题
  const [userRole, setUserRole] = useState<UserRole>('enduser'); // 默认终端用户
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // 记录哪些标签已被访问过（懒加载：首次访问才挂载，之后保持挂载不再销毁）
  const [mountedTabs, setMountedTabs] = useState<Set<TabType>>(new Set(['chat']));
  useEffect(() => {
    setMountedTabs(prev => prev.has(activeTab) ? prev : new Set([...prev, activeTab]));
  }, [activeTab]);

  // 未登录时 API 返回 401 则弹出登录框（统一反馈）
  useEffect(() => {
    setOnUnauthorized(() => setShowLogin(true));
  }, []);

  // 问答页需要登录：未登录时进入问答页自动弹出登录框，不能使用问答功能
  useEffect(() => {
    if (activeTab === 'chat' && !isLoggedIn) {
      setShowLogin(true);
    }
  }, [activeTab, isLoggedIn]);

  const handleOpenChat = (message?: string) => {
    if (message) {
      setInitialChatMessage(message);
    }
    setActiveTab('chat');
  };

  const handleOpenKnowledge = () => {
    setActiveTab('knowledge');
  };

  const handleCreateTicket = () => {
    setActiveTab('tickets');
  };

  const handleTicketClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setActiveTab('ticket-detail');
  };

  const handleBackFromDetail = () => {
    setActiveTab('tickets');
    setSelectedTicket(null);
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setShowLogin(false);
    // 登录成功后，如果有保存的问题，恢复并清空保存的问题
    if (savedChatInput) {
      setInitialChatMessage(savedChatInput);
      setSavedChatInput('');
      setActiveTab('chat'); // 切换到问答界面
    }
  };

  const handleRegisterSuccess = () => {
    setIsLoggedIn(true);
    setShowRegister(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveTab('chat');
  };

  const handleShowLogin = () => {
    setShowLogin(true);
    setShowRegister(false);
  };

  const handleShowRegister = () => {
    setShowRegister(true);
    setShowLogin(false);
  };

  const handleSwitchToRegister = () => {
    setShowLogin(false);
    setShowRegister(true);
  };

  const handleSwitchToLogin = () => {
    setShowRegister(false);
    setShowLogin(true);
  };

  return (
    <div className="h-screen flex flex-col max-w-md mx-auto relative overflow-hidden">
      <Toaster
        position="top-center"
        richColors={false}
        icons={{ success: null, error: null, warning: null, info: null, loading: null }}
        toastOptions={{
          unstyled: true,
          style: { zIndex: 99999 },
          classNames: {
            toast: 'rounded-xl shadow-lg px-4 py-3 border min-w-[280px] bg-gray-50 border-gray-200 text-gray-700',
            title: 'text-center',
            description: 'text-center',
            error: 'bg-red-50 border-red-500 text-red-700',
            success: 'bg-green-50 border-green-500 text-green-700',
            warning: 'bg-yellow-50 border-yellow-500 text-yellow-800',
            info: 'bg-gray-50 border-gray-200 text-gray-700',
          },
        }}
      />
      {/* 全局大气网格背景 */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundColor: '#F5F7FA',
          background: `
            radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.4) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(147, 197, 253, 0.4) 0%, transparent 50%),
            #F5F7FA
          `
        }}
      >
        {/* 模糊光球效果 */}
        <div
          className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)',
            filter: 'blur(100px)',
            transform: 'translate(-20%, -20%)'
          }}
        />
        <div
          className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(147, 197, 253, 0.4) 0%, transparent 70%)',
            filter: 'blur(100px)',
            transform: 'translate(20%, -20%)'
          }}
        />
      </div>

      {/* 主内容区：每个标签首次访问后保持挂载，切换时仅 CSS 隐藏 */}
      <div className="flex-1 relative z-10 overflow-hidden">

        {/* 问答 */}
        <div className={`absolute inset-0 ${activeTab === 'chat' ? '' : 'hidden'}`}>
          {mountedTabs.has('chat') && (
            <ChatPage
              initialMessage={initialChatMessage}
              onInitialMessageConsumed={() => setInitialChatMessage('')}
              onCreateTicket={handleCreateTicket}
              userRole={userRole}
              isLoggedIn={isLoggedIn}
              onShowLogin={handleShowLogin}
              onSaveInput={(input: string) => setSavedChatInput(input)}
            />
          )}
        </div>

        {/* 知识库 */}
        <div className={`absolute inset-0 ${activeTab === 'knowledge' ? '' : 'hidden'}`}>
          {mountedTabs.has('knowledge') && <KnowledgePage />}
        </div>

        {/* 工单列表 */}
        <div className={`absolute inset-0 ${activeTab === 'tickets' ? '' : 'hidden'}`}>
          {mountedTabs.has('tickets') && (
            <TicketsPage
              onTicketClick={handleTicketClick}
              onCreateTicket={handleCreateTicket}
              onGoToChat={() => setActiveTab('chat')}
              isLoggedIn={isLoggedIn}
              onShowLogin={handleShowLogin}
            />
          )}
        </div>

        {/* 工单详情（依赖 selectedTicket，每次进入时重新渲染保持数据新鲜） */}
        <div className={`absolute inset-0 ${activeTab === 'ticket-detail' && selectedTicket ? '' : 'hidden'}`}>
          {activeTab === 'ticket-detail' && selectedTicket && (
            <TicketDetailPage ticket={selectedTicket} onBack={handleBackFromDetail} />
          )}
        </div>

        {/* 个人中心 */}
        <div className={`absolute inset-0 ${activeTab === 'profile' ? '' : 'hidden'}`}>
          {mountedTabs.has('profile') && (
            <ProfilePage
              userRole={userRole}
              onRoleChange={setUserRole}
              onLogout={handleLogout}
              isLoggedIn={isLoggedIn}
              onShowLogin={handleShowLogin}
            />
          )}
        </div>

      </div>

      {/* 登录页面 */}
      {showLogin && (
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          onClose={() => setShowLogin(false)}
          onSwitchToRegister={handleSwitchToRegister}
        />
      )}

      {/* 注册页面 */}
      {showRegister && (
        <RegisterPage
          onRegisterSuccess={handleRegisterSuccess}
          onClose={() => setShowRegister(false)}
          onSwitchToLogin={handleSwitchToLogin}
        />
      )}

      {/* 底部导航栏 */}
      <nav
        className="safe-area-bottom relative z-10"
        style={{
          backdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(255, 255, 255, 0.1)'
        }}
      >
        <div className="flex justify-around items-center h-16">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${activeTab === 'chat' ? 'text-blue-600' : 'text-gray-500'
              }`}
          >
            <MessageSquare className={`w-6 h-6 mb-1 ${activeTab === 'chat' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-xs">{t('tab_chat')}</span>
          </button>

          <button
            onClick={() => setActiveTab('knowledge')}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${activeTab === 'knowledge' ? 'text-blue-600' : 'text-gray-500'
              }`}
          >
            <BookOpen className={`w-6 h-6 mb-1 ${activeTab === 'knowledge' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-xs">{t('tab_knowledge')}</span>
          </button>

          <button
            onClick={() => setActiveTab('tickets')}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${activeTab === 'tickets' ? 'text-blue-600' : 'text-gray-500'
              }`}
          >
            <ClipboardList className={`w-6 h-6 mb-1 ${activeTab === 'tickets' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-xs">{t('tab_ticket')}</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${activeTab === 'profile' ? 'text-blue-600' : 'text-gray-500'
              }`}
          >
            <User className={`w-6 h-6 mb-1 ${activeTab === 'profile' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-xs">{t('tab_profile')}</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}