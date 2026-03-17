import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Outlet, useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import { MessageSquare, User, BookOpen, ClipboardList } from 'lucide-react';
import { Toaster } from 'sonner';
import { ROUTES, pathnameToTab, ticketDetailPath, type TabPath } from '../constants/routes';
import { useLanguage } from '../contexts/LanguageContext';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { ChatPage } from '../components/ChatPageNew';
import { ProfilePage } from '../components/ProfilePageNew';
import { KnowledgePage } from '../components/KnowledgePage';
import { TicketsPage } from '../components/TicketsPage';
import { LoginPage } from '../components/LoginPage';
import { RegisterPage } from '../components/RegisterPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { TicketDetailRoute } from '../pages/TicketDetailRoute';
import { getToken, getStoredUserRole, setStoredUserRole, setNavigateToLogin } from '../services/api';
import type { UserRole } from '../types/app';

/** 登录页包装：从 URL 读取 redirect，登录成功后跳转 */
function LoginPageWrapper() {
  const location = useLocation();
  const navigate = useNavigate();
  const redirect = new URLSearchParams(location.search).get('redirect');
  const onSuccess = () => {
    const target = redirect ? decodeURIComponent(redirect) : ROUTES.CHAT;
    navigate(target, { replace: true });
  };
  return (
    <LoginPage
      onLoginSuccess={onSuccess}
      onClose={() => navigate(-1)}
      onSwitchToRegister={() => navigate(ROUTES.REGISTER, { replace: true })}
    />
  );
}

/** 注册页包装 */
function RegisterPageWrapper() {
  const location = useLocation();
  const navigate = useNavigate();
  const redirect = new URLSearchParams(location.search).get('redirect');
  const onSuccess = () => {
    const target = redirect ? decodeURIComponent(redirect) : ROUTES.CHAT;
    navigate(target, { replace: true });
  };
  return (
    <RegisterPage
      onRegisterSuccess={onSuccess}
      onClose={() => navigate(-1)}
      onSwitchToLogin={() => navigate(ROUTES.LOGIN, { replace: true })}
    />
  );
}

export type LayoutContext = {
  userRole: UserRole;
  setUserRole: (r: UserRole) => void;
  navigate: ReturnType<typeof useNavigate>;
  location: ReturnType<typeof useLocation>;
  isLoggedIn: boolean;
};

function ChatPageWithContext() {
  const ctx = useOutletContext<LayoutContext>();
  const [initialMessage, setInitialMessage] = useState('');
  return (
    <ChatPage
      initialMessage={initialMessage}
      onInitialMessageConsumed={() => setInitialMessage('')}
      onCreateTicket={() => ctx.navigate(ROUTES.TICKETS)}
      userRole={ctx.userRole}
      isLoggedIn={ctx.isLoggedIn}
      onShowLogin={() => ctx.navigate(`${ROUTES.LOGIN}?redirect=${encodeURIComponent(ctx.location.pathname + ctx.location.search)}`)}
      onSaveInput={() => {}}
    />
  );
}

function KnowledgePageWithContext() {
  return <KnowledgePage />;
}

function TicketsPageWithContext() {
  const ctx = useOutletContext<LayoutContext>();
  return (
    <TicketsPage
      onTicketClick={(ticket) => ctx.navigate(ticketDetailPath(ticket.id))}
      onCreateTicket={() => ctx.navigate(ROUTES.TICKETS)}
      onGoToChat={() => ctx.navigate(ROUTES.CHAT)}
      isLoggedIn={ctx.isLoggedIn}
      onShowLogin={() => ctx.navigate(`${ROUTES.LOGIN}?redirect=${encodeURIComponent(ctx.location.pathname + ctx.location.search)}`)}
    />
  );
}

function ProfilePageWithContext() {
  const ctx = useOutletContext<LayoutContext>();
  return (
    <ProfilePage
      userRole={ctx.userRole}
      onRoleChange={ctx.setUserRole}
      onLogout={() => {
        ctx.setUserRole('enduser');
        ctx.navigate(ROUTES.CHAT);
      }}
      isLoggedIn={ctx.isLoggedIn}
      onShowLogin={() => ctx.navigate(`${ROUTES.LOGIN}?redirect=${encodeURIComponent(ctx.location.pathname + ctx.location.search)}`)}
    />
  );
}

function MainLayoutContent() {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab: TabPath | null = pathnameToTab(location.pathname);

  const [userRole, setUserRole] = useState<UserRole>(() => getStoredUserRole() ?? 'enduser');
  const isLoggedIn = !!getToken();

  const contextValue: LayoutContext = {
    userRole,
    setUserRole: (r) => {
      setUserRole(r);
      setStoredUserRole(r);
    },
    navigate,
    location,
    isLoggedIn,
  };

  return (
    <div className="global-layout-container h-screen flex flex-col mx-auto relative overflow-hidden md:border-x md:shadow-2xl bg-white">
      <div className="fixed inset-0 z-0" style={{ backgroundColor: '#ffffff' }} />

      <div className="flex-1 relative z-10 overflow-hidden safe-area-top">
        <Outlet context={contextValue} />
      </div>

      <nav
        className="safe-area-bottom safe-area-x relative z-10"
        style={{
          backdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
        }}
      >
        <div className="flex justify-around items-center h-16">
          <button
            type="button"
            onClick={() => navigate(ROUTES.CHAT)}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 min-w-[44px] min-h-[44px] hover:bg-black/5 active:scale-95 focus-visible:ring-2 focus-visible:ring-gray-400 ${activeTab === '/chat' ? 'text-gray-950' : 'text-gray-600'}`}
          >
            <MessageSquare className={`w-6 h-6 mb-1 ${activeTab === '/chat' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-xs">{t('tab_chat')}</span>
          </button>
          <button
            type="button"
            onClick={() => navigate(ROUTES.KNOWLEDGE)}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 min-w-[44px] min-h-[44px] hover:bg-black/5 active:scale-95 focus-visible:ring-2 focus-visible:ring-gray-400 ${activeTab === '/knowledge' ? 'text-gray-950' : 'text-gray-600'}`}
          >
            <BookOpen className={`w-6 h-6 mb-1 ${activeTab === '/knowledge' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-xs">{t('tab_knowledge')}</span>
          </button>
          <button
            type="button"
            onClick={() => navigate(ROUTES.TICKETS)}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 min-w-[44px] min-h-[44px] hover:bg-black/5 active:scale-95 focus-visible:ring-2 focus-visible:ring-gray-400 ${activeTab === '/tickets' ? 'text-gray-950' : 'text-gray-600'}`}
          >
            <ClipboardList className={`w-6 h-6 mb-1 ${activeTab === '/tickets' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-xs">{t('tab_ticket')}</span>
          </button>
          <button
            type="button"
            onClick={() => navigate(ROUTES.PROFILE)}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 min-w-[44px] min-h-[44px] hover:bg-black/5 active:scale-95 focus-visible:ring-2 focus-visible:ring-gray-400 ${activeTab === '/profile' ? 'text-gray-950' : 'text-gray-600'}`}
          >
            <User className={`w-6 h-6 mb-1 ${activeTab === '/profile' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-xs">{t('tab_profile')}</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

function MainLayout() {
  return (
    <ProtectedRoute>
      <MainLayoutContent />
    </ProtectedRoute>
  );
}

export function AppRoutes() {
  const navigate = useNavigate();
  useEffect(() => {
    setNavigateToLogin((path) => navigate(path));
    return () => setNavigateToLogin(() => {});
  }, [navigate]);

  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to={ROUTES.CHAT} replace />} />
        <Route path="chat" element={<ChatPageWithContext />} />
        <Route path="knowledge" element={<KnowledgePageWithContext />} />
        <Route path="tickets" element={<TicketsPageWithContext />} />
        <Route path="tickets/:id" element={<TicketDetailRoute />} />
        <Route path="profile" element={<ProfilePageWithContext />} />
      </Route>
      <Route path="login" element={<LoginPageWrapper />} />
      <Route path="register" element={<RegisterPageWrapper />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
