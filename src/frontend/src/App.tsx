import React, { useState, useEffect } from 'react';
import { Home } from './components/Home';
import { ChatPage } from './components/ChatPageNew';
import { ProfilePage } from './components/ProfilePageNew';
import { KnowledgePage } from './components/KnowledgePage';
import { TicketsPage, Ticket } from './components/TicketsPage';
import { TicketDetailPage } from './components/TicketDetailPage';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { Home as HomeIcon, MessageSquare, User, BookOpen, ClipboardList } from 'lucide-react';
import { getToken } from './services/api';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

type TabType = 'home' | 'chat' | 'knowledge' | 'tickets' | 'profile' | 'ticket-detail';
export type UserRole = 'dealer' | 'enduser';

function AppContent() {
  const { t } = useLanguage();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('chat'); // 默认显示问答界面
  const [initialChatMessage, setInitialChatMessage] = useState<string>('');
  const [userRole, setUserRole] = useState<UserRole>('enduser'); // 默认终端用户
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // 检查登录状态
  useEffect(() => {
    const token = getToken();
    setIsLoggedIn(!!token);
  }, []);

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
      
      {/* 主内容区 */}
      <div className="flex-1 overflow-y-auto relative z-10">
        {activeTab === 'chat' && (
          <ChatPage 
            initialMessage={initialChatMessage}
            onCreateTicket={handleCreateTicket}
            userRole={userRole}
          />
        )}
        {activeTab === 'knowledge' && (
          <KnowledgePage />
        )}
        {activeTab === 'tickets' && (
          <TicketsPage 
            onTicketClick={handleTicketClick}
            onCreateTicket={handleCreateTicket}
            onGoToChat={() => setActiveTab('chat')}
          />
        )}
        {activeTab === 'ticket-detail' && selectedTicket && (
          <TicketDetailPage ticket={selectedTicket} onBack={handleBackFromDetail} />
        )}
        {activeTab === 'profile' && (
          <ProfilePage 
            userRole={userRole}
            onRoleChange={setUserRole}
            onLogout={handleLogout}
            isLoggedIn={isLoggedIn}
            onShowLogin={handleShowLogin}
          />
        )}
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
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              activeTab === 'chat' ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            <MessageSquare className={`w-6 h-6 mb-1 ${activeTab === 'chat' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-xs">{t('tab_chat')}</span>
          </button>

          <button
            onClick={() => setActiveTab('knowledge')}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              activeTab === 'knowledge' ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            <BookOpen className={`w-6 h-6 mb-1 ${activeTab === 'knowledge' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-xs">{t('tab_knowledge')}</span>
          </button>

          <button
            onClick={() => setActiveTab('tickets')}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              activeTab === 'tickets' ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            <ClipboardList className={`w-6 h-6 mb-1 ${activeTab === 'tickets' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-xs">{t('tab_ticket')}</span>
          </button>
          
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              activeTab === 'profile' ? 'text-blue-600' : 'text-gray-500'
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