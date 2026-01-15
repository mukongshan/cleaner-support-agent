import React, { useState, useEffect } from 'react';
import { Home } from './components/Home';
import { ChatPage } from './components/ChatPageNew';
import { ProfilePage } from './components/ProfilePageNew';
import { KnowledgePage } from './components/KnowledgePage';
import { TicketsPage, Ticket } from './components/TicketsPage';
import { TicketDetailPage } from './components/TicketDetailPage';
import { LoginPage } from './components/LoginPage';
import { Home as HomeIcon, MessageSquare, User, BookOpen, ClipboardList } from 'lucide-react';
import { getToken } from './services/api';

type TabType = 'home' | 'chat' | 'knowledge' | 'tickets' | 'profile' | 'ticket-detail';
export type UserRole = 'dealer' | 'enduser';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
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

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveTab('chat');
  };

  const handleShowLogin = () => {
    setShowLogin(true);
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col max-w-md mx-auto">
      {/* 主内容区 */}
      <div className="flex-1 overflow-y-auto">
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
        />
      )}

      {/* 底部导航栏 */}
      <nav className="bg-white border-t border-gray-200 safe-area-bottom">
        <div className="flex justify-around items-center h-16">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              activeTab === 'chat' ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            <MessageSquare className={`w-6 h-6 mb-1 ${activeTab === 'chat' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-xs">问答</span>
          </button>

          <button
            onClick={() => setActiveTab('knowledge')}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              activeTab === 'knowledge' ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            <BookOpen className={`w-6 h-6 mb-1 ${activeTab === 'knowledge' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-xs">知识库</span>
          </button>

          <button
            onClick={() => setActiveTab('tickets')}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              activeTab === 'tickets' ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            <ClipboardList className={`w-6 h-6 mb-1 ${activeTab === 'tickets' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-xs">工单</span>
          </button>
          
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              activeTab === 'profile' ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            <User className={`w-6 h-6 mb-1 ${activeTab === 'profile' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-xs">我的</span>
          </button>
        </div>
      </nav>
    </div>
  );
}