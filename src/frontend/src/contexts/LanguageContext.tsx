import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'zh' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  zh: {
    // App & Navigation
    app_name: 'AI 智能助手',
    tab_chat: '问答',
    tab_knowledge: '知识库',
    tab_ticket: '工单',
    tab_profile: '我的',

    // Chat Page
    input_placeholder: '描述您遇到的问题...',
    create_ticket: '创建工单',
    history: '历史对话',
    new_chat: '新建对话',
    confirm_new_chat: '创建新对话？',
    confirm_new_chat_desc: '当前对话记录将被保存。您确定要开始新的对话吗？',
    cancel: '取消',
    confirm: '确认',
    no_conversations: '还没有对话记录',
    no_conversations_desc: '试试下面的常见问题，或者直接向我提问',
    loading_conversation: '加载对话记录中...',
    no_history: '暂无历史对话记录',
    loading_history: '加载历史对话...',
    delete_history_confirm_title: '删除历史对话',
    delete_history_confirm_desc: '删除后数据不可恢复，确定要删除该对话吗？',
    dont_show_again: '不再提示',
    confirm_delete_history: '确认删除',
    settings_confirm_before_delete_history: '删除前二次确认',
    settings_confirm_before_delete_history_desc: '删除对话时弹出确认窗口，防止误删',
    continue_asking: '继续问我',
    refresh_questions: '换一换',
    problem_solved: '问题解决了吗？',
    problem_solved_desc: '如果以上方案未能解决您的问题，我可以为您创建工单，由专业工程师为您提供支持。',
    resolved: '已解决',
    switch_human: '如需协助，可转接人工服务',
    ticket_created_success: '工单创建成功！',
    ticket_created_desc: '我们将尽快处理您的问题',
    ai_thinking: '正在识别故障码...',
    ai_thinking_2: '正在查询维修知识库...',
    ai_thinking_3: '正在生成解决方案...',
    problem_resolved_message: '太好了！很高兴能帮到您。如果还有其他问题，随时可以来咨询我。',

    // Ticket Page
    my_tickets: '我的工单',
    search_ticket_placeholder: '搜索工单编号或问题描述...',
    all_tickets: '全部工单',
    processing: '处理中',
    completed: '已完成',
    pending: '待处理',
    all: '全部',

    // Profile Page
    settings: '设置',
    settings_general: '通用',
    language: '语言',
    language_setting: '语言设置',
    chinese: '简体中文',
    english: 'English',
    about: '关于',
    version: '版本 1.0.0',
    logout: '退出账号',
    logout_confirm: '确定要退出吗？',
    logout_confirm_desc: '退出后需要重新登录才能使用',
    confirm_logout: '确认退出',
    user_role: '用户身份',
    user_role_desc: '选择您的身份以获得对应服务',
    enduser: '终端用户',
    enduser_desc: '个人/家庭使用',
    dealer: '经销商',
    dealer_desc: '企业/批量使用',
    role_distributor: '经销商',
    role_distributor_desc: '批发/代理商',
    language_select_title: '选择语言',
    profile_info: '个人信息',
    avatar: '头像',
    nickname: '昵称',
    phone_number: '手机号',
    edit_nickname: '修改昵称',
    saving: '保存中...',
    phone_number_cannot_change: '手机号不支持直接修改',
    login_required: '去登录',
    login_desc: '登录后享受完整服务',

    // Common
    close: '关闭',
    save: '保存',
    edit: '编辑',
    delete: '删除',
    back: '返回',
    next: '下一步',
    submit: '提交',
    loading: '加载中...',
    error: '错误',
    success: '成功',
  },
  en: {
    // App & Navigation
    app_name: 'AI Assistant',
    tab_chat: 'Chat',
    tab_knowledge: 'Knowledge',
    tab_ticket: 'Tickets',
    tab_profile: 'Profile',

    // Chat Page
    input_placeholder: 'Describe your issue...',
    create_ticket: 'Create Ticket',
    history: 'History',
    new_chat: 'New Chat',
    confirm_new_chat: 'Create New Chat?',
    confirm_new_chat_desc: 'Current conversation will be saved. Are you sure you want to start a new conversation?',
    cancel: 'Cancel',
    confirm: 'Confirm',
    no_conversations: 'No conversations yet',
    no_conversations_desc: 'Try the common questions below, or ask me directly',
    loading_conversation: 'Loading conversation...',
    no_history: 'No conversation history',
    loading_history: 'Loading history...',
    delete_history_confirm_title: 'Delete conversation',
    delete_history_confirm_desc: 'Data cannot be recovered after deletion. Are you sure?',
    dont_show_again: "Don't show again",
    confirm_delete_history: 'Delete',
    settings_confirm_before_delete_history: 'Confirm before deleting',
    settings_confirm_before_delete_history_desc: 'Show a confirmation dialog when deleting a conversation',
    continue_asking: 'Continue Asking',
    refresh_questions: 'Refresh',
    problem_solved: 'Problem Solved?',
    problem_solved_desc: 'If the above solution did not solve your problem, I can create a ticket for you, and a professional engineer will provide support.',
    resolved: 'Resolved',
    switch_human: 'Need help? Switch to human support',
    ticket_created_success: 'Ticket Created Successfully!',
    ticket_created_desc: 'We will process your issue as soon as possible',
    ai_thinking: 'Identifying error code...',
    ai_thinking_2: 'Querying maintenance knowledge base...',
    ai_thinking_3: 'Generating solution...',
    problem_resolved_message: 'Great! Glad I could help. If you have any other questions, feel free to ask me anytime.',

    // Ticket Page
    my_tickets: 'My Tickets',
    search_ticket_placeholder: 'Search ticket number or description...',
    all_tickets: 'All Tickets',
    processing: 'Processing',
    completed: 'Completed',
    pending: 'Pending',
    all: 'All',

    // Profile Page
    settings: 'Settings',
    settings_general: 'General',
    language: 'Language',
    language_setting: 'Language Settings',
    chinese: '简体中文',
    english: 'English',
    about: 'About',
    version: 'Version 1.0.0',
    logout: 'Logout',
    logout_confirm: 'Are you sure you want to logout?',
    logout_confirm_desc: 'You will need to login again to use the service',
    confirm_logout: 'Confirm Logout',
    user_role: 'User Role',
    user_role_desc: 'Select your role to get corresponding services',
    enduser: 'End User',
    enduser_desc: 'Personal/Home Use',
    dealer: 'Dealer',
    dealer_desc: 'Business/Bulk Use',
    role_distributor: 'Distributor',
    role_distributor_desc: 'Wholesale/Agent',
    language_select_title: 'Select Language',
    profile_info: 'Profile Information',
    avatar: 'Avatar',
    nickname: 'Nickname',
    phone_number: 'Phone Number',
    edit_nickname: 'Edit Nickname',
    saving: 'Saving...',
    phone_number_cannot_change: 'Phone number cannot be changed directly',
    login_required: 'Login',
    login_desc: 'Login to enjoy full service',

    // Common
    close: 'Close',
    save: 'Save',
    edit: 'Edit',
    delete: 'Delete',
    back: 'Back',
    next: 'Next',
    submit: 'Submit',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem('app_language');
    return (saved === 'zh' || saved === 'en') ? saved : 'zh';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.zh] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
