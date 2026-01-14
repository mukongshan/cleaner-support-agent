import React, { useState } from 'react';
import { Home } from './components/Home';
import { ChatPage } from './components/ChatPage';
import { ProfilePage } from './components/ProfilePage';
import { KnowledgePage } from './components/KnowledgePage';
import { TicketsPage } from './components/TicketsPage';
import { Home as HomeIcon, MessageSquare, User, BookOpen, ClipboardList } from 'lucide-react';

type TabType = 'home' | 'chat' | 'knowledge' | 'tickets' | 'profile';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [initialChatMessage, setInitialChatMessage] = useState<string>('');

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

  return (
    <div className="h-screen bg-gray-50 flex flex-col max-w-md mx-auto">
      {/* 主内容区 */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'home' && (
          <Home 
            onOpenChat={handleOpenChat}
            onOpenKnowledge={handleOpenKnowledge}
          />
        )}
        {activeTab === 'chat' && (
          <ChatPage 
            initialMessage={initialChatMessage}
            onCreateTicket={handleCreateTicket}
          />
        )}
        {activeTab === 'knowledge' && (
          <KnowledgePage onClose={() => setActiveTab('home')} />
        )}
        {activeTab === 'tickets' && (
          <TicketsPage 
            onCreateTicket={() => handleOpenChat('创建工单')}
          />
        )}
        {activeTab === 'profile' && <ProfilePage />}
      </div>

      {/* 底部导航栏 */}
      <nav className="bg-white border-t border-gray-200 safe-area-bottom">
        <div className="flex justify-around items-center h-16">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              activeTab === 'home' ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            <HomeIcon className={`w-6 h-6 mb-1 ${activeTab === 'home' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-xs">首页</span>
          </button>
          
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