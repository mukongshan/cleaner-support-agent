import React, { useState, useRef, useEffect } from 'react';
import {
  Image as ImageIcon,
  Mic,
  Send,
  History,
  FileText,
  AlertCircle,
  X,
  ClipboardList,
  Sparkles,
  Check,
  Plus,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Clock,
  RefreshCw,
  Loader2,
  RotateCcw,
  ChevronDown,
  Brain,
  Square,
  Trash2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { UserRole } from '../App';
import {
  sendAIMessage,
  stopAIMessage,
  getConversations,
  getConversationDetail,
  deleteConversation as apiDeleteConversation,
  createTicket,
  Conversation,
  ConversationDetail
} from '../services/api';
import { getToken, API_BASE_URL, getConfirmBeforeDeleteHistory, setConfirmBeforeDeleteHistory } from '../services/api/config';
import { TicketForm } from './TicketForm';
// ai_avatar.png 体积过大（7MB+），改用内联 SVG 零加载延迟
import { useLanguage } from '../contexts/LanguageContext';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { uploadAndRecognizeImage, sendAIMessageWithImage, ImageRecognitionResponse } from '../services/api/imageRecognition';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { ImageWithAuth } from './ImageWithAuth';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  image?: string;
  timestamp: Date;
  citation?: {
    title: string;
    page: string;
  };
  rating?: 'like' | 'dislike' | null;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

/** 后台对话槽位：存储在 ref 中，不触发 React 渲染 */
interface BackgroundSlot {
  messages: Message[];
  sessionId: string | null;
  isStreaming: boolean;
  isPaused: boolean;
  cancelFn: (() => void) | null;
  activeConvId: string | null;
  stepInterval: ReturnType<typeof setInterval> | null;
  isHistoryConversation: boolean;
  followUpQuestions: string[];
  currentMessageId: string | null;
}

interface ChatPageProps {
  initialMessage?: string;
  onInitialMessageConsumed?: () => void; // 初始消息已发送后调用，用于清除 App 中的 initialChatMessage，避免切换页面回来后重复发送
  onCreateTicket?: () => void;
  userRole: UserRole;
  isLoggedIn?: boolean;
  onShowLogin?: () => void;
  onSaveInput?: (input: string) => void;
}

interface TicketFormData {
  problemType: string;
  priority: 'low' | 'medium' | 'high';
  problemSummary: string;
  deviceModel: string;
  deviceSN: string;
  additionalNotes: string;
  images: string[];
}

interface AIExtractedInfo {
  problemSummary: string;
  suggestedType: string;
  suggestedPriority: 'low' | 'medium' | 'high';
  keyDialogues: string[];
  images: string[];
}

// ──────────────────────────────────────────────────────────
// AI 头像（SVG，零加载延迟）
// ──────────────────────────────────────────────────────────
function AIAvatar({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="16" cy="16" r="16" fill="url(#avatar-gradient)" />
      <defs>
        <linearGradient id="avatar-gradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>
      </defs>
      {/* 天线 */}
      <line x1="16" y1="5" x2="16" y2="9" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="16" cy="4" r="1.5" fill="white" />
      {/* 头部 */}
      <rect x="8" y="9" width="16" height="14" rx="3" fill="white" fillOpacity="0.9" />
      {/* 眼睛 */}
      <circle cx="12.5" cy="14.5" r="2" fill="url(#avatar-gradient)" />
      <circle cx="19.5" cy="14.5" r="2" fill="url(#avatar-gradient)" />
      <circle cx="13" cy="14" r="0.7" fill="white" />
      <circle cx="20" cy="14" r="0.7" fill="white" />
      {/* 嘴巴 */}
      <path d="M12 19 Q16 21.5 20 19" stroke="url(#avatar-gradient)" strokeWidth="1.2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// ──────────────────────────────────────────────────────────
// 解析 AI 消息中的思考内容（<think>...</think>）
// ──────────────────────────────────────────────────────────
function parseMessageContent(content: string): {
  thinking: string | null;
  answer: string;
  isThinkingComplete: boolean;
} {
  // 已完成的思考：<think>...</think>answer
  const thinkCompleteMatch = content.match(/^<think>([\s\S]*?)<\/think>([\s\S]*)$/);
  if (thinkCompleteMatch) {
    return {
      thinking: thinkCompleteMatch[1],
      answer: thinkCompleteMatch[2].trim(),
      isThinkingComplete: true,
    };
  }
  // 思考仍在流式输出（无闭合标签）
  if (content.startsWith('<think>')) {
    return {
      thinking: content.slice(7),
      answer: '',
      isThinkingComplete: false,
    };
  }
  return { thinking: null, answer: content, isThinkingComplete: true };
}

// ──────────────────────────────────────────────────────────
// 可折叠的「思考过程」块
// ──────────────────────────────────────────────────────────
function ThinkingBlock({
  content,
  isComplete,
  isStreaming = false,
}: {
  content: string;
  isComplete: boolean;
  /** 是否是当前正在流式输出的消息 — 只有当 isStreaming=true 时才显示"思考中"动画 */
  isStreaming?: boolean;
}) {
  // 真正"思考中"：内容未完成 且 该消息是当前流
  const isActivelyThinking = !isComplete && isStreaming;

  const [isExpanded, setIsExpanded] = useState(isActivelyThinking);

  useEffect(() => {
    if (isComplete || !isStreaming) {
      // 流结束（正常完成或被停止）→ 自动折叠
      setIsExpanded(false);
    } else if (isActivelyThinking) {
      setIsExpanded(true);
    }
  }, [isComplete, isStreaming, isActivelyThinking]);

  return (
    <div className="mb-3">
      <button
        onClick={() => setIsExpanded(v => !v)}
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-500 transition-colors select-none"
      >
        <Brain className="w-3 h-3" />
        <span>{isActivelyThinking ? '思考中…' : '查看思考过程'}</span>
        {isActivelyThinking && <Loader2 className="w-3 h-3 animate-spin" />}
        <ChevronDown
          className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? '' : '-rotate-90'}`}
        />
      </button>
      {isExpanded && (
        <div className="mt-2 pl-3 border-l-2 border-gray-100 rounded thinking-md">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children }) => (
                <p className="text-xs text-gray-400 mb-1.5 last:mb-0 leading-relaxed">{children}</p>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-gray-400">{children}</strong>
              ),
              em: ({ children }) => (
                <em className="italic text-gray-400">{children}</em>
              ),
              ul: ({ children }) => (
                <ul className="text-xs text-gray-400 list-disc pl-4 mb-1.5 space-y-0.5">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="text-xs text-gray-400 list-decimal pl-4 mb-1.5 space-y-0.5">{children}</ol>
              ),
              li: ({ children }) => <li className="leading-relaxed">{children}</li>,
              h1: ({ children }) => (
                <h1 className="text-xs font-bold text-gray-400 mb-1 mt-1">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-xs font-bold text-gray-400 mb-1 mt-1">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-xs font-semibold text-gray-400 mb-0.5 mt-1">{children}</h3>
              ),
              pre: ({ children }) => (
                <pre className="bg-gray-50 p-2 rounded text-xs font-mono overflow-x-auto mb-1.5 text-gray-400">
                  {children}
                </pre>
              ),
              code: ({ className, children }) => {
                const isBlock = !!className;
                if (isBlock) return <code className={className}>{children}</code>;
                return (
                  <code className="bg-gray-50 px-1 py-0.5 rounded text-xs font-mono text-gray-400">
                    {children}
                  </code>
                );
              },
              blockquote: ({ children }) => (
                <blockquote className="border-l-2 border-gray-200 pl-2 italic text-gray-400 mb-1.5">
                  {children}
                </blockquote>
              ),
              hr: () => <hr className="my-1.5 border-gray-200" />,
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Markdown 渲染（仅用于 AI 回答）
// ──────────────────────────────────────────────────────────
function AIMarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => (
          <p className="text-sm mb-2 last:mb-0 leading-relaxed">{children}</p>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-gray-900">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="italic text-gray-700">{children}</em>
        ),
        ul: ({ children }) => (
          <ul className="text-sm list-disc pl-4 mb-2 space-y-0.5">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="text-sm list-decimal pl-4 mb-2 space-y-0.5">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="leading-relaxed">{children}</li>
        ),
        h1: ({ children }) => (
          <h1 className="text-base font-bold mb-2 mt-1 text-gray-900">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-sm font-bold mb-1.5 mt-1 text-gray-900">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-sm font-semibold mb-1 mt-1 text-gray-800">{children}</h3>
        ),
        pre: ({ children }) => (
          <pre className="bg-gray-100 p-3 rounded-lg text-xs font-mono overflow-x-auto mb-2 mt-1">
            {children}
          </pre>
        ),
        code: ({ className, children }) => {
          const isBlock = !!className;
          if (isBlock) {
            return <code className={className}>{children}</code>;
          }
          return (
            <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono text-gray-800">
              {children}
            </code>
          );
        },
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-gray-300 pl-3 italic text-gray-600 mb-2">
            {children}
          </blockquote>
        ),
        hr: () => <hr className="my-2 border-gray-200" />,
        a: ({ href, children }) => (
          <a
            href={href}
            className="text-blue-600 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto mb-2">
            <table className="text-xs border-collapse w-full">{children}</table>
          </div>
        ),
        th: ({ children }) => (
          <th className="border border-gray-300 px-2 py-1 bg-gray-50 font-semibold text-left">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border border-gray-300 px-2 py-1">{children}</td>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

export function ChatPage({ initialMessage, onInitialMessageConsumed, onCreateTicket, userRole, isLoggedIn = false, onShowLogin, onSaveInput }: ChatPageProps) {
  const { t, language } = useLanguage();
  // 聊天会话管理
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  // 标记历史记录是否已在本次 session 中加载过，避免重复拉取
  const historyLoadedRef = useRef(false);
  // 记录上一条删除 toast 的 id，用于连续删除时替换旧提示
  const deleteToastIdRef = useRef<string | number | null>(null);
  const [hasCreatedNewChat, setHasCreatedNewChat] = useState(false); // 是否创建过新对话
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false); // 是否已完成初始加载
  const [messages, setMessages] = useState<Message[]>([]);

  // UI状态
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [thinkingPaused, setThinkingPaused] = useState(false);
  const [thinkingStep, setThinkingStep] = useState(0);
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [deleteConfirmSession, setDeleteConfirmSession] = useState<ChatSession | null>(null);
  const [deleteConfirmDontShowAgain, setDeleteConfirmDontShowAgain] = useState(false);
  const [showTicketPrompt, setShowTicketPrompt] = useState(false);
  const [ticketCreated, setTicketCreated] = useState(false);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [isHistoryConversation, setIsHistoryConversation] = useState(false); // 标记是否为历史对话

  // 工单相关
  const [ticketFormData, setTicketFormData] = useState<TicketFormData>({
    problemType: 'maintenance',
    priority: 'medium',
    problemSummary: '',
    deviceModel: 'CR-X3000',
    deviceSN: 'SN202401120001',
    additionalNotes: '',
    images: []
  });
  const [ticketSubmitting, setTicketSubmitting] = useState(false);
  const [ticketError, setTicketError] = useState<string | null>(null);
  const [aiAssisting, setAiAssisting] = useState(false);

  // 继续问我相关问题状态
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);
  const [currentMessageId, setCurrentMessageId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 登录提示框状态
  const [showLoginTip, setShowLoginTip] = useState(false);

  // 图片识别相关状态
  interface ImageItem {
    id: string;
    file: File;
    preview: string;
    recognitionId?: string;
    imageUrl?: string;
    description?: string;
    status: 'uploading' | 'recognizing' | 'completed' | 'failed';
    error?: string;
    abortController?: AbortController; // 用于取消请求
  }
  const [uploadedImages, setUploadedImages] = useState<ImageItem[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const prevMessagesLength = useRef(0);

  // 停止生成相关：保存取消函数和当前活跃的 conversationId
  const cancelChatRef = useRef<(() => void) | null>(null);
  const activeConvIdRef = useRef<string | null>(null);
  const stepIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { start: startSpeechRecognition, stop: stopSpeechRecognition, isSupported: isSpeechSupported } = useSpeechRecognition({
    language,
    onResult: (text) => setInputText(prev => prev + text),
    onEnd: () => setIsRecording(false),
    onError: (err) => {
      setIsRecording(false);
      if (err === 'not-allowed') {
        toast.error(t('voice_permission_denied'));
      } else if (err === 'network') {
        toast.error(t('voice_network_error'));
      }
    }
  });

  // ── 后台槽位（Background Slot）──────────────────────────────
  // 存储后台继续运行的对话状态，key 为 slotKey（通常等于 sessionId 或 slot-{timestamp}）
  const backgroundSlotsRef = useRef<Map<string, BackgroundSlot>>(new Map());
  // 当前视图对应的 slotKey；SSE 回调用它判断路由到视图还是后台
  const currentSlotKeyRef = useRef<string>(`slot-${Date.now()}`);

  const thinkingSteps = [
    t('ai_thinking'),
    t('ai_thinking_2'),
    t('ai_thinking_3')
  ];

  const suggestedQuestions = [
    '如何清理主刷？',
    '更换边刷教程',
    '机器人不回充怎么办？',
    '如何清洁传感器？'
  ];

  // 根据AI回复内容生成相关的问题建议
  const getFollowUpQuestions = (aiContent: string): string[] => {
    const content = aiContent.toLowerCase();
    const followUpMap: { [key: string]: string[][] } = {
      '主刷': [
        ['主刷如何拆卸？', '主刷多久更换一次？', '主刷不转怎么办？'],
        ['主刷卡住了怎么处理？', '主刷清洁步骤', '主刷安装方法'],
        ['主刷型号选择', '主刷购买渠道', '主刷使用注意事项']
      ],
      '边刷': [
        ['边刷如何更换？', '边刷磨损严重怎么办？', '边刷不转的原因？'],
        ['边刷安装教程', '边刷清洁方法', '边刷使用寿命'],
        ['边刷型号匹配', '边刷购买推荐', '边刷故障排查']
      ],
      '传感器': [
        ['传感器如何清洁？', '传感器故障怎么办？', '传感器位置在哪里？'],
        ['传感器维护方法', '传感器校准步骤', '传感器常见问题'],
        ['传感器更换指南', '传感器购买建议', '传感器故障代码']
      ],
      '充电': [
        ['充电座无法识别？', '充电时间需要多久？', '充电指示灯不亮？'],
        ['充电故障排查', '充电座清洁方法', '充电异常处理'],
        ['充电座安装位置', '充电座购买推荐', '充电注意事项']
      ],
      '故障': [
        ['还有哪些常见故障？', '如何预防故障？', '故障代码如何查询？'],
        ['故障诊断方法', '故障处理流程', '故障报修步骤'],
        ['故障预防措施', '故障维修建议', '故障联系客服']
      ],
      '维护': [
        ['日常维护需要做什么？', '多久维护一次？', '维护工具哪里买？'],
        ['维护保养清单', '维护时间安排', '维护注意事项'],
        ['维护工具推荐', '维护视频教程', '维护常见问题']
      ]
    };

    // 根据内容匹配相关建议
    for (const [key, questionGroups] of Object.entries(followUpMap)) {
      if (content.includes(key)) {
        // 随机返回一组问题
        return questionGroups[Math.floor(Math.random() * questionGroups.length)];
      }
    }

    // 默认建议（多组）
    const defaultGroups = [
      ['还有其他问题吗？', '需要更详细的说明吗？', '还有其他故障吗？'],
      ['问题解决了吗？', '需要进一步帮助？', '还有其他疑问？'],
      ['操作步骤清楚吗？', '需要视频教程？', '还有其他问题？']
    ];
    return defaultGroups[Math.floor(Math.random() * defaultGroups.length)];
  };

  // 刷新继续问我的问题
  const refreshFollowUpQuestions = (aiContent: string) => {
    setIsRefreshing(true);
    const newQuestions = getFollowUpQuestions(aiContent);
    setFollowUpQuestions(newQuestions);
    setTimeout(() => setIsRefreshing(false), 600); // 动画完成后重置状态
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Only scroll if AI is thinking (streaming) OR if a new message was added
    if (aiThinking || messages.length > prevMessagesLength.current) {
      scrollToBottom();
    }
    // Update the ref to current length
    prevMessagesLength.current = messages.length;
  }, [messages, aiThinking]);

  /**
   * 将当前视图状态保存到后台槽位。
   * @param cancelStream 是否同时取消当前流（切往纯历史对话时需要；新建/切回后台对话时不需要）
   */
  const saveCurrentToBackground = (cancelStream = false) => {
    const slotKey = currentSlotKeyRef.current;
    if (aiThinking && cancelChatRef.current) {
      if (cancelStream) {
        // 取消旧流（切往无后台槽的纯历史对话）
        cancelChatRef.current();
        cancelChatRef.current = null;
        if (stepIntervalRef.current) { clearInterval(stepIntervalRef.current); stepIntervalRef.current = null; }
        activeConvIdRef.current = null;
      } else {
        // 保留流，将引用转移到后台槽位
        const slot: BackgroundSlot = {
          messages: [...messages],
          sessionId: currentSessionId,
          isStreaming: true,
          isPaused: false,
          cancelFn: cancelChatRef.current,
          activeConvId: activeConvIdRef.current,
          stepInterval: stepIntervalRef.current,
          isHistoryConversation,
          followUpQuestions: [...followUpQuestions],
          currentMessageId,
        };
        // 以 slotKey 存储（流式回调用此 key 路由更新）
        backgroundSlotsRef.current.set(slotKey, slot);
        // 若 sessionId 已知，也以 conversationId 为 key 建立别名（loadConversationDetail 查找用）
        if (currentSessionId && currentSessionId !== slotKey) {
          backgroundSlotsRef.current.set(currentSessionId, slot);
        }
        // 清空当前引用（不取消流，流继续在后台运行）
        cancelChatRef.current = null;
        activeConvIdRef.current = null;
        stepIntervalRef.current = null;
      }
    }
  };

  // 加载历史会话列表（调用真实API）
  const loadHistoryConversations = async () => {
    try {
      setLoadingHistory(true);

      // 调用真实API获取历史会话列表
      const conversations = await getConversations();

      // 转换为组件需要的格式
      const sessions: ChatSession[] = conversations.map(conv => ({
        id: conv.id,
        title: conv.title,
        messages: [], // 列表不包含详细消息
        createdAt: new Date(conv.updatedAt), // 使用 updatedAt 作为创建时间
        updatedAt: new Date(conv.updatedAt)
      }));

      setChatSessions(sessions);
      historyLoadedRef.current = true;
    } catch (error) {
      console.error('加载历史会话失败:', error);
      // 出错时设置为空数组，避免显示假数据
      setChatSessions([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  // 加载特定会话的详情（调用真实API）
  const loadConversationDetail = async (conversationId: string) => {
    // ── 优先检查后台槽位 ──────────────────────────────────────
    // 若该对话正在后台生成（用户新建了新对话但旧流仍在运行），直接从槽位恢复，无需网络请求
    const bgSlot = backgroundSlotsRef.current.get(conversationId);
    if (bgSlot) {
      // 将当前视图（若也在生成）转移到后台槽
      saveCurrentToBackground(false);

      // 切换槽位标识，让旧对话的 SSE 回调重新路由到当前视图
      currentSlotKeyRef.current = conversationId;
      // 清理所有指向该槽位的 key（可能有 slotKey 和 conversationId 两个 key）
      backgroundSlotsRef.current.forEach((v, k) => {
        if (v === bgSlot) backgroundSlotsRef.current.delete(k);
      });

      // 恢复后台槽位的状态到视图
      setMessages(bgSlot.messages);
      setCurrentSessionId(bgSlot.sessionId);
      setAiThinking(bgSlot.isStreaming);
      setThinkingPaused(bgSlot.isPaused);
      setFollowUpQuestions(bgSlot.followUpQuestions);
      setCurrentMessageId(bgSlot.currentMessageId);
      setIsHistoryConversation(bgSlot.isHistoryConversation);
      cancelChatRef.current = bgSlot.cancelFn;
      activeConvIdRef.current = bgSlot.activeConvId;
      stepIntervalRef.current = bgSlot.stepInterval;
      return; // 无需网络请求
    }

    // ── 无后台槽位：取消当前流，拉取历史数据 ──────────────────
    // 取消旧流（若有），切往纯历史对话
    saveCurrentToBackground(true);
    // 将当前视图切换到新槽位，防止旧流回调（若取消有延迟）污染新视图
    currentSlotKeyRef.current = conversationId;
    setAiThinking(false);
    setThinkingPaused(false);

    setLoadingConversation(true);
    try {
      // 调用真实API获取会话详情
      const detail = await getConversationDetail(conversationId);

      // 转换消息格式：从 API 格式转换为组件需要的格式（含 imageUrl，历史记录中显示图片不显示图片描述）
      const convertedMessages: Message[] = detail.messages.map((msg, index) => ({
        id: `${conversationId}-${index}`,
        type: msg.role === 'user' ? 'user' : 'ai',
        content: msg.content ?? '',
        image: msg.imageUrl,
        timestamp: new Date(msg.timestamp),
        rating: null
      }));

      setMessages(convertedMessages);
      setCurrentSessionId(conversationId);
      setIsHistoryConversation(true); // 标记为历史对话
    } catch (error) {
      console.error('加载会话详情失败:', error);
      setMessages([
        {
          id: 'error',
          type: 'ai',
          content: '加载会话详情失败，请稍后重试。',
          timestamp: new Date(),
          rating: null
        }
      ]);
    } finally {
      setLoadingConversation(false);
    }
  };

  // 当打开历史对话时加载列表（仅首次，后续由本地状态驱动，不重复拉取）
  useEffect(() => {
    if (showHistoryDialog && !historyLoadedRef.current) {
      loadHistoryConversations();
    }
  }, [showHistoryDialog]);

  // 阻止历史对话框打开时背景滚动
  useEffect(() => {
    if (showHistoryDialog) {
      // 保存当前滚动位置
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';

      return () => {
        // 恢复滚动位置
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [showHistoryDialog]);

  // 阻止新建对话确认框打开时背景滚动
  useEffect(() => {
    if (showNewChatDialog) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';

      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [showNewChatDialog]);

  // 阻止工单表单打开时背景滚动
  useEffect(() => {
    if (showTicketForm) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';

      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [showTicketForm]);

  // 组件挂载时自动加载最近的对话
  useEffect(() => {
    const loadRecentConversation = async () => {
      // 如果有 initialMessage，则不加载历史对话
      if (initialMessage && initialMessage.trim()) {
        setIsInitialLoadComplete(true);
        return;
      }

      // 检查用户是否已登录，未登录则不加载历史对话
      const token = getToken();
      if (!token) {
        setIsInitialLoadComplete(true);
        return;
      }

      try {
        setLoadingConversation(true);
        // 获取历史会话列表
        const conversations = await getConversations();

        if (conversations && conversations.length > 0) {
          // 加载最近的一条对话
          const latestConversation = conversations[0];
          const detail = await getConversationDetail(latestConversation.id);

          // 转换消息格式（含 imageUrl，切换到问答界面时显示图片）
          const convertedMessages: Message[] = detail.messages.map((msg, index) => ({
            id: `${latestConversation.id}-${index}`,
            type: msg.role === 'user' ? 'user' : 'ai',
            content: msg.content ?? '',
            image: msg.imageUrl,
            timestamp: new Date(msg.timestamp),
            rating: null
          }));

          setMessages(convertedMessages);
          setCurrentSessionId(latestConversation.id);
          setIsHistoryConversation(true);
        }
      } catch (error) {
        console.error('加载最近对话失败:', error);
        // 失败时保持默认的欢迎消息
      } finally {
        setLoadingConversation(false);
        setIsInitialLoadComplete(true);
      }
    };

    loadRecentConversation();
  }, []); // 只在组件挂载时执行一次

  // 处理图片上传和识别（可重用的函数）
  const processImageRecognition = async (imageId: string, file: File, signal?: AbortSignal) => {
    const startTime = Date.now();
    console.log('[ChatPage] [图片上传] 开始处理图片识别', {
      imageId,
      fileName: file.name,
      fileSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      fileType: file.type,
      timestamp: new Date().toISOString()
    });

    try {
      // 更新状态为 recognizing
      console.log('[ChatPage] [图片上传] 更新状态为 recognizing', { imageId });
      setUploadedImages(prev =>
        prev.map(img =>
          img.id === imageId
            ? { ...img, status: 'recognizing' as const }
            : img
        )
      );

      // 调用上传和识别接口
      console.log('[ChatPage] [图片上传] 调用上传和识别接口', {
        imageId,
        url: `${API_BASE_URL}/image-reco`,
        hasSignal: !!signal,
        signalAborted: signal?.aborted
      });
      const uploadStartTime = Date.now();
      const result: ImageRecognitionResponse = await uploadAndRecognizeImage(file, signal);
      const uploadDuration = Date.now() - uploadStartTime;

      console.log('[ChatPage] [图片上传] 上传和识别接口调用成功', {
        imageId,
        duration: `${uploadDuration}ms`,
        result: {
          recognitionId: result.recognitionId,
          imageUrl: result.imageUrl,
          description: result.description?.substring(0, 50) + '...',
          status: result.status,
          createdAt: result.createdAt
        }
      });

      // 检查是否被取消
      if (signal?.aborted) {
        console.warn('[ChatPage] [图片上传] 请求已被取消', { imageId });
        return;
      }

      // 更新图片信息
      const finalStatus = result.status === 'completed' ? 'completed' as const : 'failed' as const;
      console.log('[ChatPage] [图片上传] 更新图片信息到最终状态', {
        imageId,
        finalStatus,
        recognitionId: result.recognitionId
      });

      setUploadedImages(prev =>
        prev.map(img =>
          img.id === imageId
            ? {
              ...img,
              recognitionId: result.recognitionId,
              imageUrl: result.imageUrl,
              description: result.description,
              status: finalStatus,
              error: result.status === 'failed' ? '识别失败' : undefined,
              abortController: undefined // 清除控制器
            }
            : img
        )
      );

      const totalDuration = Date.now() - startTime;
      console.log('[ChatPage] [图片上传] 图片识别处理完成', {
        imageId,
        totalDuration: `${totalDuration}ms`,
        uploadDuration: `${uploadDuration}ms`,
        status: finalStatus
      });
    } catch (error: any) {
      const errorDuration = Date.now() - startTime;

      // 如果请求被取消，不更新状态
      if (error.message === '请求已取消' || error.name === 'AbortError') {
        console.warn('[ChatPage] [图片上传] 请求被取消，不更新状态', {
          imageId,
          duration: `${errorDuration}ms`,
          errorName: error.name,
          errorMessage: error.message
        });
        return;
      }

      console.error('[ChatPage] [图片上传] 图片识别失败', {
        imageId,
        duration: `${errorDuration}ms`,
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      });

      setUploadedImages(prev =>
        prev.map(img =>
          img.id === imageId
            ? {
              ...img,
              status: 'failed' as const,
              error: error.message || '图片识别失败',
              abortController: undefined // 清除控制器
            }
            : img
        )
      );
    }
  };

  // 处理图片选择
  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('[ChatPage] [图片选择] 用户选择图片', {
      filesCount: event.target.files?.length || 0,
      timestamp: new Date().toISOString()
    });

    const files = event.target.files;
    if (!files || files.length === 0) {
      console.warn('[ChatPage] [图片选择] 未选择文件');
      return;
    }

    const file = files[0];
    console.log('[ChatPage] [图片选择] 文件信息', {
      fileName: file.name,
      fileSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      fileType: file.type,
      lastModified: new Date(file.lastModified).toISOString()
    });

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      console.error('[ChatPage] [图片选择] 文件类型不支持', {
        fileType: file.type,
        allowedTypes
      });
      alert('仅支持 JPG、PNG、WEBP 格式的图片');
      return;
    }

    // 验证文件大小（10MB）
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      console.error('[ChatPage] [图片选择] 文件大小超限', {
        fileSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
        maxSize: `${(maxSize / 1024 / 1024).toFixed(2)}MB`
      });
      alert('图片大小不能超过 10MB');
      return;
    }

    // 创建预览URL
    const preview = URL.createObjectURL(file);
    const imageId = Date.now().toString();
    const abortController = new AbortController();

    console.log('[ChatPage] [图片选择] 创建图片项', {
      imageId,
      previewUrl: preview.substring(0, 50) + '...',
      hasAbortController: !!abortController
    });

    // 添加图片到列表（初始状态为 uploading）
    const newImage: ImageItem = {
      id: imageId,
      file,
      preview,
      status: 'uploading',
      abortController
    };

    console.log('[ChatPage] [图片选择] 添加到图片列表', {
      imageId,
      currentImagesCount: uploadedImages.length,
      newStatus: 'uploading'
    });

    setUploadedImages(prev => {
      const newList = [...prev, newImage];
      console.log('[ChatPage] [图片选择] 图片列表已更新', {
        imageId,
        totalImages: newList.length
      });
      return newList;
    });

    // 开始上传和识别
    console.log('[ChatPage] [图片选择] 开始上传和识别流程', { imageId });
    await processImageRecognition(imageId, file, abortController.signal);

    // 清空文件输入
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      console.log('[ChatPage] [图片选择] 已清空文件输入', { imageId });
    }
  };

  // 删除图片
  const handleRemoveImage = (imageId: string) => {
    console.log('[ChatPage] [图片删除] 用户请求删除图片', {
      imageId,
      timestamp: new Date().toISOString()
    });

    setUploadedImages(prev => {
      const image = prev.find(img => img.id === imageId);

      if (!image) {
        console.warn('[ChatPage] [图片删除] 未找到要删除的图片', { imageId });
        return prev;
      }

      console.log('[ChatPage] [图片删除] 找到图片信息', {
        imageId,
        status: image.status,
        hasAbortController: !!image.abortController,
        hasPreview: !!image.preview,
        recognitionId: image.recognitionId
      });

      // 中断正在进行的请求
      if (image?.abortController) {
        image.abortController.abort();
        console.log('[ChatPage] [图片删除] 已中断图片识别请求', {
          imageId,
          signalAborted: image.abortController.signal.aborted
        });
      }

      // 清理预览URL
      if (image && image.preview) {
        URL.revokeObjectURL(image.preview);
        console.log('[ChatPage] [图片删除] 已清理预览URL', { imageId });
      }

      const newList = prev.filter(img => img.id !== imageId);
      console.log('[ChatPage] [图片删除] 图片已从列表中移除', {
        imageId,
        remainingImages: newList.length,
        previousCount: prev.length
      });

      return newList;
    });
  };

  // 重试图片识别
  const handleRetryImage = async (imageId: string) => {
    console.log('[ChatPage] [图片重试] 用户请求重试图片识别', {
      imageId,
      timestamp: new Date().toISOString()
    });

    const image = uploadedImages.find(img => img.id === imageId);
    if (!image) {
      console.error('[ChatPage] [图片重试] 未找到要重试的图片', { imageId });
      return;
    }

    console.log('[ChatPage] [图片重试] 找到图片信息', {
      imageId,
      previousStatus: image.status,
      previousError: image.error,
      fileName: image.file.name,
      fileSize: `${(image.file.size / 1024 / 1024).toFixed(2)}MB`
    });

    // 创建新的AbortController
    const abortController = new AbortController();
    console.log('[ChatPage] [图片重试] 创建新的AbortController', {
      imageId,
      hasSignal: !!abortController.signal
    });

    // 更新状态为 uploading
    setUploadedImages(prev => {
      const updated = prev.map(img =>
        img.id === imageId
          ? {
            ...img,
            status: 'uploading' as const,
            error: undefined,
            abortController
          }
          : img
      );
      console.log('[ChatPage] [图片重试] 状态已更新为 uploading', {
        imageId,
        updatedStatus: updated.find(img => img.id === imageId)?.status
      });
      return updated;
    });

    // 重新开始上传和识别
    console.log('[ChatPage] [图片重试] 开始重新上传和识别', { imageId });
    await processImageRecognition(imageId, image.file, abortController.signal);
  };

  // 检查是否可以发送（有文本或已识别的图片）
  const canSend = () => {
    const hasText = inputText.trim().length > 0;
    const hasCompletedImages = uploadedImages.some(img => img.status === 'completed');

    // 如果有正在识别或失败的图片，不能发送
    const hasProcessingOrFailedImages = uploadedImages.some(
      img => img.status === 'uploading' || img.status === 'recognizing' || img.status === 'failed'
    );

    return (hasText || hasCompletedImages) && !hasProcessingOrFailedImages;
  };

  // 获取发送按钮的提示信息
  const getSendButtonTooltip = () => {
    const hasText = inputText.trim().length > 0;
    const hasCompletedImages = uploadedImages.some(img => img.status === 'completed');
    const hasProcessingImages = uploadedImages.some(
      img => img.status === 'uploading' || img.status === 'recognizing'
    );
    const hasFailedImages = uploadedImages.some(img => img.status === 'failed');

    if (hasProcessingImages) {
      return '图片正在识别中，请稍候...';
    }
    if (hasFailedImages) {
      return '存在识别失败的图片，请重试或删除';
    }
    if (!hasText && !hasCompletedImages) {
      return '请输入消息或上传图片';
    }
    return '';
  };

  const handleSendMessage = (text: string) => {
    console.log('[ChatPage] [发送消息] 开始处理发送消息', {
      text: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
      textLength: text.length,
      uploadedImagesCount: uploadedImages.length,
      timestamp: new Date().toISOString()
    });

    // 检查登录状态
    if (!isLoggedIn) {
      // 保存用户输入的问题
      if (text.trim() && onSaveInput) {
        onSaveInput(text.trim());
      }
      // 显示登录提示框
      setShowLoginTip(true);
      // 2秒后自动隐藏提示框
      setTimeout(() => {
        setShowLoginTip(false);
      }, 2000);
      // 跳转到登录页面
      if (onShowLogin) {
        onShowLogin();
      }
      return;
    }

    // ── 后台槽位路由函数 ─────────────────────────────────────────
    // 捕获发送时的槽位 key；SSE 回调触发时，通过对比决定路由到当前视图还是后台
    const slotKey = currentSlotKeyRef.current;

    /** 路由 setMessages：当前视图则触发渲染；后台则静默写 ref */
    const routeMessages = (updater: (prev: Message[]) => Message[]) => {
      if (currentSlotKeyRef.current === slotKey) {
        setMessages(updater);
      } else {
        const slot = backgroundSlotsRef.current.get(slotKey);
        if (slot) slot.messages = updater(slot.messages);
      }
    };

    /** 路由 setAiThinking */
    const routeThinking = (val: boolean) => {
      if (currentSlotKeyRef.current === slotKey) {
        setAiThinking(val);
      } else {
        const slot = backgroundSlotsRef.current.get(slotKey);
        if (slot) slot.isStreaming = val;
      }
    };

    /** 路由 setCurrentSessionId + activeConvIdRef */
    const routeSessionId = (id: string) => {
      if (currentSlotKeyRef.current === slotKey) {
        setCurrentSessionId(id);
        activeConvIdRef.current = id;
      } else {
        const slot = backgroundSlotsRef.current.get(slotKey);
        if (slot) { slot.sessionId = id; slot.activeConvId = id; }
      }
    };

    /** 路由收尾清理（取消函数置 null） */
    const routeCleanup = () => {
      if (currentSlotKeyRef.current === slotKey) {
        cancelChatRef.current = null;
        activeConvIdRef.current = null;
      } else {
        const slot = backgroundSlotsRef.current.get(slotKey);
        if (slot) { slot.cancelFn = null; slot.activeConvId = null; slot.isStreaming = false; }
      }
    };
    // ─────────────────────────────────────────────────────────────

    // 模式A：图文混发 - 有文本且有已识别的图片
    // 模式B：仅发图片 - 无文本但有已识别的图片
    const hasText = text.trim().length > 0;
    const completedImages = uploadedImages.filter(img => img.status === 'completed');
    const processingImages = uploadedImages.filter(img =>
      img.status === 'uploading' || img.status === 'recognizing' || img.status === 'failed'
    );

    console.log('[ChatPage] [发送消息] 图片状态统计', {
      totalImages: uploadedImages.length,
      completedImages: completedImages.length,
      processingImages: processingImages.length,
      imageStatuses: uploadedImages.map(img => ({ id: img.id, status: img.status }))
    });

    if (!hasText && completedImages.length === 0) {
      console.warn('[ChatPage] [发送消息] 无法发送：既没有文本也没有已识别的图片', {
        hasText,
        completedImagesCount: completedImages.length
      });
      return; // 既没有文本也没有已识别的图片，不发送
    }

    // 如果有已识别的图片，使用图片对话接口
    if (completedImages.length > 0) {
      console.log('[ChatPage] [发送消息] 使用图片对话模式', {
        mode: hasText ? '图文混发' : '仅发图片',
        completedImagesCount: completedImages.length
      });

      // 使用第一张已识别图片的 recognitionId
      const recognitionId = completedImages[0].recognitionId;
      if (!recognitionId) {
        console.error('[ChatPage] [发送消息] 图片识别ID不存在', {
          imageId: completedImages[0].id,
          imageUrl: completedImages[0].imageUrl,
          description: completedImages[0].description
        });
        return;
      }

      console.log('[ChatPage] [发送消息] 准备发送图片消息', {
        recognitionId,
        imageUrl: completedImages[0].imageUrl,
        hasText,
        query: hasText ? text : undefined,
        conversationId: currentSessionId || undefined
      });

      // 添加用户消息（如果有文本）
      if (hasText) {
        const userMessage: Message = {
          id: Date.now().toString(),
          type: 'user',
          content: text,
          image: completedImages[0].imageUrl,
          timestamp: new Date()
        };
        console.log('[ChatPage] [发送消息] 添加图文混发用户消息', {
          messageId: userMessage.id,
          contentLength: text.length,
          hasImage: !!userMessage.image,
          imageUrl: userMessage.image,
          completedImageUrl: completedImages[0]?.imageUrl
        });
        setMessages(prev => [...prev, userMessage]);
      } else {
        // 仅发图片，添加图片消息（不显示文字，只显示图片）
        const userMessage: Message = {
          id: Date.now().toString(),
          type: 'user',
          content: '', // 仅发图片时不显示文字
          image: completedImages[0].imageUrl,
          timestamp: new Date()
        };
        console.log('[ChatPage] [发送消息] 添加仅图片用户消息', {
          messageId: userMessage.id,
          imageUrl: userMessage.image,
          completedImageUrl: completedImages[0]?.imageUrl,
          completedImagesCount: completedImages.length
        });
        setMessages(prev => [...prev, userMessage]);
      }

      // 清空输入和图片
      console.log('[ChatPage] [发送消息] 清空输入和图片列表', {
        clearedImagesCount: uploadedImages.length
      });
      setInputText('');
      setUploadedImages([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }

      // 调用图片对话接口
      console.log('[ChatPage] [发送消息] 设置AI思考状态并调用图片对话接口', {
        recognitionId,
        query: hasText ? text : undefined
      });
      setAiThinking(true);
      setThinkingPaused(false);
      setThinkingStep(0);

      stepIntervalRef.current = setInterval(() => {
        setThinkingStep(prev => {
          if (prev >= thinkingSteps.length - 1) {
            clearInterval(stepIntervalRef.current!);
            stepIntervalRef.current = null;
            return prev;
          }
          return prev + 1;
        });
      }, 1500);

      let aiMessageId = (Date.now() + 1).toString();
      let fullAnswer = '';
      let conversationIdSaved = false;

      console.log('[ChatPage] [发送消息] 调用 sendAIMessageWithImage', {
        aiMessageId,
        recognitionId,
        query: hasText ? text : undefined,
        conversationId: currentSessionId || undefined
      });

      cancelChatRef.current = sendAIMessageWithImage(
        {
          recognitionId,
          query: hasText ? text : undefined,
          conversationId: currentSessionId || undefined
        },
        (event) => {
          // 收到 conversation_id 时立即保存，供终止按钮调用后端 abort 使用
          if (event.conversation_id && !conversationIdSaved) {
            conversationIdSaved = true;
            routeSessionId(event.conversation_id);
            console.log('[ChatPage] [发送消息] 保存会话ID（图片对话）', {
              conversationId: event.conversation_id
            });
          }
          if (event.event === 'message' && event.answer) {
            // 累积流式响应内容（event.answer 是增量内容）
            fullAnswer += event.answer;
            console.log('[ChatPage] [发送消息] 收到AI消息片段', {
              aiMessageId,
              answerLength: event.answer.length,
              fullAnswerLength: fullAnswer.length
            });
            // 更新或添加 AI 消息（通过路由函数：当前视图触发渲染，后台静默写 ref）
            routeMessages(prev => {
              const lastMsg = prev[prev.length - 1];
              if (lastMsg && lastMsg.id === aiMessageId) {
                return prev.map(msg =>
                  msg.id === aiMessageId
                    ? { ...msg, content: fullAnswer }
                    : msg
                );
              } else {
                console.log('[ChatPage] [发送消息] 添加新 AI 消息（图片对话）');
                return [...prev, {
                  id: aiMessageId,
                  type: 'ai' as const,
                  content: fullAnswer,
                  timestamp: new Date(),
                  rating: null
                }];
              }
            });
          } else if (event.event === 'message_end') {
            console.log('[ChatPage] [发送消息] AI消息结束', {
              aiMessageId,
              finalAnswerLength: fullAnswer.length,
              conversationId: event.conversation_id,
              metadata: event.metadata
            });
            if (stepIntervalRef.current) { clearInterval(stepIntervalRef.current); stepIntervalRef.current = null; }
            routeThinking(false);
            setThinkingStep(0);

            // 确保消息存在且内容正确
            routeMessages(prev => {
              const existingMsg = prev.find(msg => msg.id === aiMessageId);
              if (!existingMsg) {
                console.log('[ChatPage] [发送消息] 消息结束时创建新消息（图片对话）');
                return [...prev, {
                  id: aiMessageId,
                  type: 'ai' as const,
                  content: fullAnswer || '抱歉，没有收到回复。请稍后重试。',
                  timestamp: new Date(),
                  rating: null
                }];
              } else if (!fullAnswer || fullAnswer.trim() === '') {
                console.warn('[ChatPage] [发送消息] 未收到 AI 回答（图片对话）');
                return prev.map(msg =>
                  msg.id === aiMessageId
                    ? { ...msg, content: '抱歉，没有收到回复。请稍后重试。' }
                    : msg
                );
              } else {
                return prev.map(msg =>
                  msg.id === aiMessageId
                    ? { ...msg, content: fullAnswer }
                    : msg
                );
              }
            });

            if (event.conversation_id && !conversationIdSaved) {
              console.log('[ChatPage] [发送消息] 保存会话ID', {
                conversationId: event.conversation_id,
                previousSessionId: currentSessionId
              });
              routeSessionId(event.conversation_id);
              conversationIdSaved = true;
            }

            // 生成相关问题（仅当前视图）
            if (fullAnswer && fullAnswer.trim() && currentSlotKeyRef.current === slotKey) {
              const questions = getFollowUpQuestions(fullAnswer);
              console.log('[ChatPage] [发送消息] 生成相关问题', {
                aiMessageId,
                questionsCount: questions.length,
                questions
              });
              setFollowUpQuestions(questions);
              setCurrentMessageId(aiMessageId);
            }
          }
        },
        (error) => {
          if (error.name === 'AbortError') {
            if (stepIntervalRef.current) { clearInterval(stepIntervalRef.current); stepIntervalRef.current = null; }
            routeThinking(false);
            routeCleanup();
            return;
          }
          console.error('[ChatPage] [发送消息] 图片对话失败', {
            aiMessageId,
            recognitionId,
            error: {
              name: error.name,
              message: error.message,
              stack: error.stack?.substring(0, 500)
            }
          });
          if (stepIntervalRef.current) { clearInterval(stepIntervalRef.current); stepIntervalRef.current = null; }
          routeThinking(false);
          routeCleanup();
          routeMessages(prev =>
            prev.map(msg =>
              msg.id === aiMessageId
                ? { ...msg, content: '抱歉，处理图片时出现了错误。请稍后重试。' }
                : msg
            )
          );
        },
        () => {
          console.log('[ChatPage] [发送消息] 图片对话完成', { aiMessageId });
          if (stepIntervalRef.current) { clearInterval(stepIntervalRef.current); stepIntervalRef.current = null; }
          routeCleanup();
        }
      );

      // 注册取消函数已在 sendAIMessageWithImage 调用时写入 cancelChatRef

      // 添加AI消息占位
      const aiMessage: Message = {
        id: aiMessageId,
        type: 'ai',
        content: '',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);

      return;
    }

    // 原有的文本消息处理逻辑
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    // Reset textarea height after sending
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    setAiThinking(true);
    setThinkingPaused(false);
    setThinkingStep(0);

    // 思考步骤动画
    stepIntervalRef.current = setInterval(() => {
      setThinkingStep(prev => {
        if (prev >= thinkingSteps.length - 1) {
          clearInterval(stepIntervalRef.current!);
          stepIntervalRef.current = null;
          return prev;
        }
        return prev + 1;
      });
    }, 1500);

    let aiMessageId = (Date.now() + 1).toString();
    let fullAnswer = '';
    let conversationIdSaved = false; // 跟踪是否已保存 conversation_id，避免重复处理
    let requestCancelled = false; // 跟踪请求是否被取消

    // 构建请求参数
    // 规则：
    // 1. 用户发送第一条消息时，currentSessionId 为 null，不传 conversationId，后端会创建新会话
    // 2. 用户继续追问时，currentSessionId 有值，传递 conversationId，用于多轮对话
    const requestParams: { query: string; conversationId?: string } = {
      query: text,
    };

    // 只有在存在会话ID时才传递，用于多轮对话
    const isNewConversation = !currentSessionId;
    if (currentSessionId) {
      requestParams.conversationId = currentSessionId;
    }

    console.log('=== 准备调用 sendAIMessage ===');
    console.log('请求参数:', requestParams);
    console.log('当前会话ID:', currentSessionId);
    console.log('是否新会话:', isNewConversation);

    // 调用真实的 AI API，保存取消函数以供停止按钮使用
    cancelChatRef.current = sendAIMessage(
      requestParams,
      // onMessage: 收到消息片段
      (event) => {
        console.log('sendmessage');
        if (requestCancelled) {
          console.log('请求已取消，忽略事件');
          return;
        }

        console.log('收到 SSE 事件:', event);

        if (event.event === 'message' && event.answer) {
          fullAnswer += event.answer;
          console.log('累积回答:', fullAnswer.slice(0, 50) + '...');

          // 更新或添加 AI 消息（路由：当前视图触发渲染，后台静默写 ref）
          routeMessages(prev => {
            const lastMsg = prev[prev.length - 1];
            if (lastMsg && lastMsg.id === aiMessageId) {
              return prev.map(msg =>
                msg.id === aiMessageId
                  ? { ...msg, content: fullAnswer }
                  : msg
              );
            } else {
              console.log('添加新 AI 消息');
              return [...prev, {
                id: aiMessageId,
                type: 'ai' as const,
                content: fullAnswer,
                timestamp: new Date(),
                rating: null
              }];
            }
          });

          // 立即保存 conversation_id（路由到正确的槽位）
          if (event.conversation_id && !conversationIdSaved) {
            conversationIdSaved = true;
            console.log('保存 conversation_id:', event.conversation_id);
            routeSessionId(event.conversation_id);

            // 如果是新会话，添加到历史记录列表（无论当前视图还是后台均执行）
            if (isNewConversation) {
              setHasCreatedNewChat(true);
              const newSession: ChatSession = {
                id: event.conversation_id,
                title: text.slice(0, 20) + (text.length > 20 ? '...' : ''),
                messages: [],
                createdAt: new Date(),
                updatedAt: new Date()
              };
              setChatSessions(prev => [newSession, ...prev]);
              // 同步后台槽位的 slotKey（使 loadConversationDetail 能用 conversationId 找到它）
              if (currentSlotKeyRef.current !== slotKey) {
                const slot = backgroundSlotsRef.current.get(slotKey);
                if (slot) {
                  backgroundSlotsRef.current.delete(slotKey);
                  backgroundSlotsRef.current.set(event.conversation_id, slot);
                }
              }
            }
          }
        }

        if (event.event === 'message_end') {
          console.log('消息结束');
          if (stepIntervalRef.current) { clearInterval(stepIntervalRef.current); stepIntervalRef.current = null; }
          routeThinking(false);

          // 确保会话 ID 已保存
          if (event.conversation_id && !conversationIdSaved) {
            conversationIdSaved = true;
            console.log('在 message_end 中保存 conversation_id:', event.conversation_id);
            routeSessionId(event.conversation_id);

            if (isNewConversation) {
              setHasCreatedNewChat(true);
              const newSession: ChatSession = {
                id: event.conversation_id,
                title: text.slice(0, 20) + (text.length > 20 ? '...' : ''),
                messages: [],
                createdAt: new Date(),
                updatedAt: new Date()
              };
              setChatSessions(prev => [newSession, ...prev]);
              if (currentSlotKeyRef.current !== slotKey) {
                const slot = backgroundSlotsRef.current.get(slotKey);
                if (slot) {
                  backgroundSlotsRef.current.delete(slotKey);
                  backgroundSlotsRef.current.set(event.conversation_id, slot);
                }
              }
            }
          }

          // 如果没有收到任何回答，显示错误提示
          if (!fullAnswer || fullAnswer.trim() === '') {
            console.warn('未收到 AI 回答');
            routeMessages(prev => [...prev, {
              id: aiMessageId,
              type: 'ai' as const,
              content: '抱歉，我没有收到回复。请重试。',
              timestamp: new Date(),
              rating: null
            }]);
          }

          // 如果有检索资源，可以添加引用
          if (event.metadata?.retriever_resources && event.metadata.retriever_resources.length > 0) {
            const resource = event.metadata.retriever_resources[0];
            routeMessages(prev => prev.map(msg =>
              msg.id === aiMessageId
                ? {
                  ...msg,
                  citation: {
                    title: resource.title || '知识库文档',
                    page: resource.page || '参考资料'
                  }
                }
                : msg
            ));
          }

          // 生成相关问题（仅当前视图）
          if (fullAnswer && fullAnswer.trim() && currentSlotKeyRef.current === slotKey) {
            const questions = getFollowUpQuestions(fullAnswer);
            setFollowUpQuestions(questions);
            setCurrentMessageId(aiMessageId);
          }
        }
      },
      // onError: 错误处理
      (error) => {
        console.error('AI 对话错误:', error);
        if (stepIntervalRef.current) { clearInterval(stepIntervalRef.current); stepIntervalRef.current = null; }
        routeThinking(false);
        routeCleanup();

        const errorMessage = error.message || '未知错误';
        console.error('错误详情:', errorMessage);

        routeMessages(prev => [...prev, {
          id: aiMessageId,
          type: 'ai' as const,
          content: `抱歉，我遇到了问题：${errorMessage}\n\n请检查网络连接或稍后再试。`,
          timestamp: new Date(),
          rating: null
        }]);
      },
      // onComplete: 完成
      () => {
        if (stepIntervalRef.current) { clearInterval(stepIntervalRef.current); stepIntervalRef.current = null; }
        routeThinking(false);
        routeCleanup();
      }
    );
  };

  // 停止正在生成的 AI 回复（仅对当前视图的对话有效）
  const handleStopGeneration = async () => {
    // 立即更新显示状态
    setThinkingPaused(true);

    // 1. 中断前端 SSE 连接
    if (cancelChatRef.current) {
      cancelChatRef.current();
      cancelChatRef.current = null;
    }

    // 2. 通知后端停止 Dify 流（有 conversationId 时才调用）
    const convId = activeConvIdRef.current;
    if (convId) {
      activeConvIdRef.current = null;
      try {
        await stopAIMessage(convId);
      } catch (e) {
        console.warn('停止生成接口调用失败（可能已自然结束）', e);
      }
    }

    // 3. 在最后一条 AI 消息末尾追加已停止标记
    setMessages(prev => {
      const lastAiIdx = [...prev].map((m, i) => (m.type === 'ai' ? i : -1)).filter(i => i !== -1).pop();
      if (lastAiIdx === undefined) return prev;
      return prev.map((m, i) =>
        i === lastAiIdx ? { ...m, content: m.content + '\n\n*[已停止生成]*' } : m
      );
    });

    // 4. 恢复 UI 状态
    if (stepIntervalRef.current) {
      clearInterval(stepIntervalRef.current);
      stepIntervalRef.current = null;
    }
    setAiThinking(false);
    // 注：isPaused 已通过 setThinkingPaused(true) 更新视图，无需额外操作
  };

  // 处理初始消息
  useEffect(() => {
    // 等待初始加载完成后再处理 initialMessage
    if (isInitialLoadComplete && initialMessage && initialMessage.trim()) {
      // 如果用户已登录，恢复输入框内容（这是登录后恢复的问题）
      if (isLoggedIn) {
        setInputText(initialMessage);
        // 自动发送消息
        handleSendMessage(initialMessage);
        // 立即通知父组件清除 initialMessage，避免切换页面回来后重复发送（如用户终止回答后切走再切回）
        onInitialMessageConsumed?.();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMessage, isInitialLoadComplete, isLoggedIn]);

  const getAIResponse = (userText: string): string => {
    const lowerText = userText.toLowerCase();

    if (lowerText.includes('主刷') || lowerText.includes('清理')) {
      return '清理主刷的步骤如下：\n\n1. 关闭机器人电源\n2. 翻转机器人，找到主刷盖板\n3. 按下卡扣，取出主刷\n4. 使用清洁工具剪除缠绕的毛发\n5. 用清水冲洗主刷，晾干后装回\n\n建议每周清理一次主刷，以保持最佳清洁效果。需要观看视频教程吗？';
    } else if (lowerText.includes('边刷')) {
      return '更换边刷很简单：\n\n1. 准备好新的边刷配件\n2. 用手逆时针旋转旧边刷取下\n3. 将新边刷对准轴心\n4. 顺时针旋转直到卡紧\n\n建议每3-6个月更换一次边刷。您需要购买新的边刷吗？';
    } else if (lowerText.includes('回充') || lowerText.includes('充电')) {
      return '如果机器人无法回充，请检查：\n\n1. 充电座是否通电（指示灯亮起）\n2. 充电座周围1米内是否有障碍物\n3. 充电触点是否干净（用干布擦拭）\n4. 尝试手动将机器人放在充电座上测试\n\n如果以上都正常但仍无法回充，可能是导航系统问题，建议申请上门检修。';
    } else if (lowerText.includes('传感器')) {
      return '清洁传感器的方法：\n\n1. 使用柔软的干布轻轻擦拭各个传感器\n2. 重点清理：\n   - 防跌落传感器（底部4个）\n   - 碰撞传感器（前方）\n   - 回充传感器（前方两侧）\n3. 不要使用湿布或化学清洁剂\n\n建议每2周清洁一次传感器，保持灵敏度。';
    } else {
      return '我理解您遇到的问题。为了更好地帮助您，您可以：\n\n1. 拍摄设备照片发送给我分析\n2. 告诉我具体的报错代码\n3. 描述设备的具体表现\n\n这样我可以提供更精准的解决方案。';
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        const userMessage: Message = {
          id: Date.now().toString(),
          type: 'user',
          content: '我上传了一张图片，请帮我看看',
          image: imageUrl,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);

        setAiThinking(true);
        setTimeout(() => {
          setAiThinking(false);
          const aiResponse: Message = {
            id: (Date.now() + 1).toString(),
            type: 'ai',
            content: '我看到图片中主刷位置有毛发缠绕。建议按照以下步骤清理：\n\n1. 使用随机附带的清洁工具\n2. 小心剪除缠绕的毛发\n3. 取出主刷用水冲洗\n4. 完全晾干后重新安装\n\n是否需要详细的拆卸教程？',
            timestamp: new Date(),
            rating: null
          };
          setMessages(prev => [...prev, aiResponse]);
        }, 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVoiceRecord = () => {
    if (!isSpeechSupported) {
      toast.error(t('voice_unsupported'));
      return;
    }
    if (isRecording) {
      stopSpeechRecognition();
      setIsRecording(false);
    } else {
      startSpeechRecognition();
      setIsRecording(true);
    }
  };

  // 评价AI回答
  const handleRateMessage = (messageId: string, rating: 'like' | 'dislike') => {
    setMessages(prev => prev.map(msg =>
      msg.id === messageId
        ? { ...msg, rating: msg.rating === rating ? null : rating }
        : msg
    ));
  };

  // 新建对话
  const handleNewChat = () => {
    setShowNewChatDialog(true);
  };

  const confirmNewChat = () => {
    resetToNewChat();
    setShowNewChatDialog(false);
  };

  /** 重置为"新对话"状态（用于新建对话或删除当前会话后） */
  const resetToNewChat = () => {
    // 将旧对话保存为后台槽位（若正在生成，则流继续在后台运行，不取消）
    saveCurrentToBackground(false);

    // 切换到新槽位
    const newSlotKey = `slot-${Date.now()}`;
    currentSlotKeyRef.current = newSlotKey;

    // 重置当前视图状态（新建对话）
    setAiThinking(false);
    setThinkingPaused(false);
    setMessages([]);
    setCurrentSessionId(null);
    setFollowUpQuestions([]);
    setCurrentMessageId(null);
    setTicketCreated(false);
    setShowTicketPrompt(false);
    setIsHistoryConversation(false);
    setHasCreatedNewChat(true);
  };
  /** 弹出删除提示：先 dismiss 上一条，立即弹新的，确保每次都有明显的入场动画 */
  const showDeleteToast = (type: 'success' | 'error') => {
    if (deleteToastIdRef.current !== null) {
      toast.dismiss(deleteToastIdRef.current);
      deleteToastIdRef.current = null;
    }
    const id = type === 'success'
      ? toast.success('对话已删除', { duration: 2000 })
      : toast.error('删除失败，请重试', { duration: 3000 });
    deleteToastIdRef.current = id;
  };

  /** 执行删除会话：乐观更新本地列表，无需重新拉取 */
  const doDeleteConversation = async (sessionId: string) => {
    const prevSessions = chatSessions;
    setChatSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentSessionId === sessionId) {
      resetToNewChat();
    }
    try {
      await apiDeleteConversation(sessionId);
      showDeleteToast('success');
    } catch (err) {
      setChatSessions(prevSessions);
      showDeleteToast('error');
      console.error('删除会话失败:', err);
    }
  };

  /** 点击历史项删除按钮：根据设置决定直接删除或弹出确认框 */
  const handleDeleteSession = (e: React.MouseEvent, session: ChatSession) => {
    e.stopPropagation();
    if (!getConfirmBeforeDeleteHistory()) {
      doDeleteConversation(session.id);
      return;
    }
    setDeleteConfirmSession(session);
    setDeleteConfirmDontShowAgain(false);
  };

  /** 确认删除弹窗中点击“确认删除” */
  const confirmDeleteSession = () => {
    if (!deleteConfirmSession) return;
    if (deleteConfirmDontShowAgain) {
      setConfirmBeforeDeleteHistory(false);
    }
    const id = deleteConfirmSession.id;
    setDeleteConfirmSession(null);
    doDeleteConversation(id);
  };

  // 智能提取聊天信息
  const extractInfoFromChat = (): AIExtractedInfo => {
    const userMessages = messages.filter(m => m.type === 'user');
    const images = messages.filter(m => m.image).map(m => m.image as string);
    const recentMessages = messages.slice(-6);
    const keyDialogues = recentMessages.map(m =>
      `${m.type === 'user' ? '用户' : 'AI'}：${m.content.substring(0, 100)}${m.content.length > 100 ? '...' : ''}`
    );

    let problemSummary = '';
    let suggestedType = 'maintenance';
    let suggestedPriority: 'low' | 'medium' | 'high' = 'medium';

    if (userMessages.length > 0) {
      const firstUserMsg = userMessages[0].content;
      problemSummary = firstUserMsg.length > 50
        ? firstUserMsg.substring(0, 50) + '...'
        : firstUserMsg;

      const allUserContent = userMessages.map(m => m.content.toLowerCase()).join(' ');

      if (allUserContent.includes('故障') || allUserContent.includes('不转') ||
        allUserContent.includes('不工作') || allUserContent.includes('异常')) {
        suggestedType = 'malfunction';
        suggestedPriority = 'high';
      } else if (allUserContent.includes('如何') || allUserContent.includes('怎么') ||
        allUserContent.includes('教程')) {
        suggestedType = 'consultation';
        suggestedPriority = 'low';
      } else if (allUserContent.includes('清理') || allUserContent.includes('更换') ||
        allUserContent.includes('维护')) {
        suggestedType = 'maintenance';
        suggestedPriority = 'medium';
      }
    }

    return {
      problemSummary,
      suggestedType,
      suggestedPriority,
      keyDialogues,
      images
    };
  };

  const handleOpenTicketDialog = () => {
    // 重置表单数据
    setTicketFormData({
      problemType: 'maintenance',
      priority: 'medium',
      problemSummary: '',
      deviceModel: 'CR-X3000',
      deviceSN: 'SN202401120001',
      additionalNotes: '',
      images: []
    });
    setTicketError(null);
    setShowTicketForm(true);
  };

  // AI 辅助填写工单
  const handleAIAssist = () => {
    setAiAssisting(true);

    // 模拟 AI 分析对话记录
    setTimeout(() => {
      const extractedInfo = extractInfoFromChat();

      setTicketFormData({
        problemType: extractedInfo.suggestedType,
        priority: extractedInfo.suggestedPriority,
        problemSummary: extractedInfo.problemSummary,
        deviceModel: 'CR-X3000',
        deviceSN: 'SN202401120001',
        additionalNotes: extractedInfo.keyDialogues.join('\n'),
        images: extractedInfo.images
      });

      setAiAssisting(false);
    }, 1500);
  };

  // 提交工单
  const handleSubmitTicket = async () => {
    try {
      setTicketSubmitting(true);
      setTicketError(null);

      const result = await createTicket({
        title: ticketFormData.problemSummary || '工单',
        description: `问题类型: ${getProblemTypeLabel(ticketFormData.problemType)}\n设备型号: ${ticketFormData.deviceModel}\n设备SN: ${ticketFormData.deviceSN}\n\n${ticketFormData.additionalNotes}`,
        priority: ticketFormData.priority,
        relatedChatId: currentSessionId || undefined,
        attachmentUrls: ticketFormData.images.length > 0 ? ticketFormData.images : undefined
      });

      console.log('工单创建成功:', result);

      setShowTicketForm(false);
      setTicketCreated(true);

      // 3秒后隐藏成功提示
      setTimeout(() => {
        setTicketCreated(false);
      }, 3000);

      if (onCreateTicket) {
        onCreateTicket();
      }
    } catch (err: any) {
      console.error('创建工单失败:', err);
      setTicketError(err.message || '创建工单失败');
    } finally {
      setTicketSubmitting(false);
    }
  };

  const getProblemTypeLabel = (type: string) => {
    const typeMap: { [key: string]: string } = {
      malfunction: '设备故障',
      maintenance: '维护保养',
      consultation: '使用咨询',
      parts: '配件需求'
    };
    return typeMap[type] || '其他';
  };

  const getPriorityLabel = (priority: 'low' | 'medium' | 'high') => {
    const priorityMap = {
      low: '低',
      medium: '中',
      high: '高'
    };
    return priorityMap[priority];
  };

  return (
    <div className="h-full flex flex-col bg-transparent">
      {/* 顶部工具栏 */}
      <div
        className="relative z-10 px-4 py-3 flex items-center justify-between"
        style={{
          backdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(255, 255, 255, 0.1)'
        }}
      >
        <h2 className="font-semibold text-gray-900">{t('app_name')}</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowHistoryDialog(true)}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors haptic-feedback"
          >
            <History className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={handleNewChat}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors haptic-feedback"
          >
            <Plus className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* 问题解决提示横幅 - QQ群待办样式 */}
      <AnimatePresence>
        {(() => {
          // 检查最后一条消息是否是工单创建相关的系统消息
          const lastMessage = messages[messages.length - 1];
          const ticketKeywords = language === 'zh' ? ['工单', '太好了', '创建成功'] : ['ticket', 'great', 'created successfully'];
          const isLastMessageTicketRelated = lastMessage?.content &&
            (ticketKeywords.some(keyword => lastMessage.content.includes(keyword)) || ticketCreated);

          // 显示条件：消息数>3 && AI不在思考 && 未创建工单 && 非历史对话 && 未关闭提示 && 最后一条消息不是工单相关
          const shouldShow = messages.length > 3 &&
            !aiThinking &&
            !ticketCreated &&
            !isHistoryConversation &&
            !showTicketPrompt &&
            !isLastMessageTicketRelated;

          return shouldShow ? (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="w-full py-2 px-4 bg-blue-50/90 border-b border-blue-100"
            >
              <div className="flex items-center justify-between">
                {/* Left: Text */}
                <p className="text-sm text-gray-700">
                  {t('switch_human')}
                </p>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => {
                      setShowTicketPrompt(true);
                      handleOpenTicketDialog();
                    }}
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors haptic-feedback flex items-center gap-1"
                  >
                    <ClipboardList className="w-3 h-3" />
                    {t('create_ticket')}
                  </button>
                  <button
                    onClick={() => setShowTicketPrompt(true)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                    aria-label="关闭提示"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ) : null;
        })()}
      </AnimatePresence>

      {/* 对话区域 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-2 space-y-4 relative z-0">
        {loadingConversation ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <p className="text-sm text-gray-500">{t('loading_conversation')}</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <AIAvatar className="w-12 h-12" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{t('no_conversations')}</h3>
            <p className="text-sm text-gray-500 mb-6">
              {t('no_conversations_desc')}
            </p>
            <div className="w-full grid grid-cols-2 gap-2">
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => setInputText(q)}
                  className="text-left text-sm text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2.5 transition-colors leading-snug"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message, index) => {
            // 检查是否是最后一条AI消息
            const lastAIMessageIndex = messages.map((m, i) => m.type === 'ai' ? i : -1).filter(i => i !== -1).pop();
            const isLastAI = message.type === 'ai' && index === lastAIMessageIndex && !aiThinking;
            // 是否是当前正在流式输出的消息
            const isStreamingMessage = message.type === 'ai' && index === lastAIMessageIndex && aiThinking;

            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 25,
                  duration: 0.4
                }}
                className={`flex flex-col ${message.type === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className={`max-w-[80%]`}>
                  {message.type === 'ai' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className="w-8 h-8 mb-2"
                    >
                      <AIAvatar className="w-8 h-8" />
                    </motion.div>
                  )}

                  <motion.div
                    whileHover={{
                      scale: 1.02,
                      boxShadow: message.type === 'user'
                        ? '0 10px 25px -5px rgba(59, 130, 246, 0.3)'
                        : '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
                      transition: { duration: 0.2 }
                    }}
                    className={`rounded-2xl px-4 py-3 cursor-default ${message.type === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-sm'
                      : 'bg-white text-gray-900 rounded-tl-sm shadow-sm'
                      }`}
                  >
                    {message.type === 'user' && message.image ? (
                      // 用户消息：图片在右侧，文字在下方
                      (() => {
                        // 处理图片URL：支持完整URL和相对路径
                        const getImageUrl = (imageUrl: string | undefined): string => {
                          if (!imageUrl) return '';
                          // 如果是完整 URL（以 http:// 或 https:// 开头），直接返回
                          if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
                            return imageUrl;
                          }
                          // 如果路径已经包含 /api，直接使用 API_BASE_URL 拼接
                          if (imageUrl.startsWith('/api')) {
                            const match = API_BASE_URL.match(/^(https?:\/\/[^\/]+)/);
                            const serverUrl = match ? match[1] : window.location.origin;
                            return `${serverUrl}${imageUrl}`;
                          }
                          // 如果是相对路径，拼接服务器基础URL（不包含 /api 路径）
                          const match = API_BASE_URL.match(/^(https?:\/\/[^\/]+)/);
                          const serverUrl = match ? match[1] : window.location.origin;
                          // 确保路径以 / 开头
                          const path = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
                          return `${serverUrl}${path}`;
                        };

                        const imageUrl = getImageUrl(message.image);

                        return (
                          <div className="flex flex-col">
                            {/* 上半部分：图片缩略图贴着右侧 */}
                            <div className="flex justify-end mb-2">
                              <ImageWithAuth
                                src={message.image}
                                alt="上传的图片"
                                className="max-w-[120px] max-h-[120px] rounded-lg object-cover border-2 border-white/20 shadow-sm"
                                style={{
                                  cursor: 'pointer'
                                }}
                                onClick={() => {
                                  // 点击图片可以放大查看
                                  const fullUrl = getImageUrl(message.image);
                                  window.open(fullUrl, '_blank');
                                }}
                              />
                            </div>
                            {/* 下半部分：用户补充的文字内容 */}
                            {message.content && message.content.trim() && (
                              <p className="text-sm whitespace-pre-line">
                                {message.content}
                              </p>
                            )}
                          </div>
                        );
                      })()
                    ) : message.image ? (
                      // AI消息或其他消息：保持原有布局
                      (() => {
                        const getImageUrl = (imageUrl: string | undefined): string => {
                          if (!imageUrl) return '';
                          // 如果是完整 URL（以 http:// 或 https:// 开头），直接返回
                          if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
                            return imageUrl;
                          }
                          // 如果路径已经包含 /api，直接使用 API_BASE_URL 拼接
                          if (imageUrl.startsWith('/api')) {
                            const match = API_BASE_URL.match(/^(https?:\/\/[^\/]+)/);
                            const serverUrl = match ? match[1] : window.location.origin;
                            return `${serverUrl}${imageUrl}`;
                          }
                          // 如果是相对路径，拼接服务器基础URL（不包含 /api 路径）
                          const match = API_BASE_URL.match(/^(https?:\/\/[^\/]+)/);
                          const serverUrl = match ? match[1] : window.location.origin;
                          const path = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
                          return `${serverUrl}${path}`;
                        };

                        const imageUrl = getImageUrl(message.image);

                        return (
                          <div className="mb-2">
                            <ImageWithAuth
                              src={message.image}
                              alt="上传的图片"
                              className="max-w-[200px] max-h-[200px] rounded-lg object-cover border-2 border-white/20 shadow-sm"
                              style={{
                                cursor: 'pointer'
                              }}
                              onClick={() => {
                                const fullUrl = getImageUrl(message.image);
                                window.open(fullUrl, '_blank');
                              }}
                            />
                          </div>
                        );
                      })()
                    ) : null}
                    {/* 文字消息 */}
                    {!message.image && message.content && (
                      message.type === 'ai' ? (() => {
                        const { thinking, answer, isThinkingComplete } = parseMessageContent(message.content);
                        return (
                          <div>
                            {thinking !== null && (
                              <ThinkingBlock
                                content={thinking}
                                isComplete={isThinkingComplete}
                                isStreaming={isStreamingMessage}
                              />
                            )}
                            {answer && (
                              <AIMarkdownContent content={answer} />
                            )}
                            {/* 思考仍在进行、无answer时显示等待提示 */}
                            {!answer && thinking === null && (
                              <p className="text-sm text-gray-500">{message.content}</p>
                            )}
                          </div>
                        );
                      })() : (
                        <p className="text-sm whitespace-pre-line">
                          {message.content}
                        </p>
                      )
                    )}

                    {/* 流式输出时显示加载动画；停止后显示"思考已暂停" */}
                    {(isStreamingMessage || (thinkingPaused && message.type === 'ai' && index === lastAIMessageIndex)) && (
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-400">
                        {thinkingPaused ? (
                          <span>思考已暂停</span>
                        ) : (
                          <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
                        )}
                      </div>
                    )}

                    {message.citation && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <FileText className="w-3 h-3" />
                          <span>来源：{message.citation.title} {message.citation.page}</span>
                        </div>
                      </div>
                    )}
                  </motion.div>

                  {/* AI回答评价按钮 */}
                  {message.type === 'ai' && (
                    <div className="flex items-center gap-2 mt-2 ml-1">
                      <motion.button
                        onClick={() => handleRateMessage(message.id, 'like')}
                        whileTap={{
                          scale: 0.85,
                          rotate: message.rating === 'like' ? [0, -10, 10, -10, 0] : 0
                        }}
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                        className={`p-1.5 rounded-lg transition-all haptic-feedback ${message.rating === 'like'
                          ? 'bg-green-100 text-green-600'
                          : 'hover:bg-gray-100 text-gray-400'
                          }`}
                      >
                        <ThumbsUp className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        onClick={() => handleRateMessage(message.id, 'dislike')}
                        whileTap={{
                          scale: 0.85,
                          rotate: message.rating === 'dislike' ? [0, 10, -10, 10, 0] : 0
                        }}
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                        className={`p-1.5 rounded-lg transition-all haptic-feedback ${message.rating === 'dislike'
                          ? 'bg-red-100 text-red-600'
                          : 'hover:bg-gray-100 text-gray-400'
                          }`}
                      >
                        <ThumbsDown className="w-4 h-4" />
                      </motion.button>
                      <span className="text-xs text-gray-400 ml-1">
                        {message.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}

                  {/* 继续问我 - 在AI回复下方显示（只显示最后一条AI消息） */}
                  {isLastAI && (() => {
                    // 如果是新的AI消息，初始化问题列表
                    if (currentMessageId !== message.id) {
                      const questions = getFollowUpQuestions(message.content);
                      setFollowUpQuestions(questions);
                      setCurrentMessageId(message.id);
                    }

                    // 确保有问题列表
                    const questionsToShow = followUpQuestions.length > 0
                      ? followUpQuestions
                      : getFollowUpQuestions(message.content);

                    return (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                        className="mt-3 ml-1"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <MessageSquare className="w-3 h-3" />
                            <span>{t('continue_asking')}</span>
                          </div>
                          <button
                            onClick={() => refreshFollowUpQuestions(message.content)}
                            className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors haptic-feedback"
                          >
                            <motion.div
                              animate={{ rotate: isRefreshing ? 360 : 0 }}
                              transition={{ duration: 0.6, ease: 'easeInOut' }}
                            >
                              <RefreshCw className="w-3 h-3" />
                            </motion.div>
                            <span>{t('refresh_questions')}</span>
                          </button>
                        </div>
                        <div className="space-y-2">
                          {questionsToShow.slice(0, 3).map((question, qIndex) => (
                            <motion.button
                              key={qIndex}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.4 + qIndex * 0.1 }}
                              whileHover={{
                                scale: 1.02,
                                x: 4,
                                transition: { duration: 0.2 }
                              }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleSendMessage(question)}
                              className="w-full text-left px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-700 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 transition-colors haptic-feedback"
                            >
                              {question}
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    );
                  })()}

                  {message.type === 'user' && (
                    <div className="text-xs text-gray-400 mt-1 text-right">
                      {message.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })
        )}

        {/* 独立思考气泡：仅在 AI 还未开始输出任何内容时显示；停止后改为"思考已暂停" */}
        {(aiThinking || thinkingPaused) && messages[messages.length - 1]?.type !== 'ai' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex justify-start"
          >
            <div className="max-w-[80%]">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="w-8 h-8 mb-2"
              >
                <AIAvatar className="w-8 h-8" />
              </motion.div>
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl rounded-tl-sm shadow-sm px-4 py-3"
              >
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  {thinkingPaused ? (
                    <span>思考已暂停</span>
                  ) : (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                      <span>正在思考…</span>
                    </>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>


      {/* 新建对话确认弹窗 */}
      <AnimatePresence>
        {showNewChatDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowNewChatDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('confirm_new_chat')}</h3>
                <p className="text-sm text-gray-600">
                  {t('confirm_new_chat_desc')}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowNewChatDialog(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors haptic-feedback"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={confirmNewChat}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors haptic-feedback"
                >
                  {t('confirm')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 历史对话列表弹窗 */}
      <AnimatePresence>
        {showHistoryDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-end justify-center z-50"
            onClick={() => setShowHistoryDialog(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="bg-white w-full max-w-md rounded-t-3xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">{t('history')}</h3>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => loadHistoryConversations()}
                    disabled={loadingHistory}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40"
                    title="刷新"
                  >
                    <RefreshCw className={`w-4 h-4 text-gray-500 ${loadingHistory ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={() => setShowHistoryDialog(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="max-h-[60vh] overflow-y-auto px-4 py-4" style={{ minHeight: '196px' }}>
                {loadingHistory ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center px-8">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                    <p className="text-sm text-gray-500">{t('loading_history')}</p>
                  </div>
                ) : chatSessions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500">{t('no_history')}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {chatSessions.map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center gap-2 w-full bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-blue-400 hover:bg-blue-50 transition-all group"
                      >
                        <button
                          onClick={() => {
                            loadConversationDetail(session.id);
                            setShowHistoryDialog(false);
                          }}
                          className="flex-1 min-w-0 p-4 text-left haptic-feedback"
                        >
                          <h4 className="font-medium text-gray-900 mb-1 truncate">
                            {session.title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>{session.createdAt.toLocaleDateString('zh-CN')}</span>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteSession(e, session)}
                          className="p-2 mr-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors haptic-feedback shrink-0"
                          title={t('delete')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 删除历史对话确认弹窗 */}
      <AnimatePresence>
        {deleteConfirmSession && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setDeleteConfirmSession(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('delete_history_confirm_title')}</h3>
                <p className="text-sm text-gray-600">
                  {t('delete_history_confirm_desc')}
                </p>
              </div>
              <label className="flex items-center gap-2 mb-6 cursor-pointer">
                <input
                  type="checkbox"
                  checked={deleteConfirmDontShowAgain}
                  onChange={(e) => setDeleteConfirmDontShowAgain(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">{t('dont_show_again')}</span>
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmSession(null)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors haptic-feedback"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={confirmDeleteSession}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors haptic-feedback"
                >
                  {t('confirm_delete_history')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 创建工单表单 */}
      <AnimatePresence>
        {showTicketForm && (
          <TicketForm
            formData={ticketFormData}
            onFormDataChange={setTicketFormData}
            onSubmit={handleSubmitTicket}
            onCancel={() => setShowTicketForm(false)}
            submitting={ticketSubmitting}
            error={ticketError}
            showAIAssist={messages.filter(m => m.type === 'user').length > 0}
            onAIAssist={handleAIAssist}
            aiAssisting={aiAssisting}
          />
        )}
      </AnimatePresence>

      {/* 工单创建成功提示 */}
      <AnimatePresence>
        {ticketCreated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50"
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="bg-white px-6 py-4 rounded-2xl shadow-2xl border border-green-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{t('ticket_created_success')}</p>
                  <p className="text-sm text-gray-600">{t('ticket_created_desc')}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 登录提示框 */}
      <AnimatePresence>
        {showLoginTip && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'fixed',
              // 1. 改用 bottom 定位，更容易控制在页面下方
              bottom: '15%',
              left: 0,
              // 2. 宽度设为 100%，配合 flex 布局实现真正的水平居中
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 60,
              pointerEvents: 'none',
              boxSizing: 'border-box',
              padding: '0 16px'
            }}
          >
            <div
              style={{
                backgroundColor: '#ffffff',
                padding: '8px 16px',
                borderRadius: '8px',
                // 优化阴影，使其看起来更轻盈
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                border: '1px solid #e5e7eb',
                whiteSpace: 'nowrap',
                pointerEvents: 'auto' // 如果需要点击提示框，可以设为 auto
              }}
            >
              <p style={{ fontSize: '14px', color: '#374151', margin: 0 }}>请登录后使用</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* 输入区域 */}
      <div
        className="px-4 py-3 pb-safe relative z-10"
        style={{
          backdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* 图片缩略图区域（在输入框上方） */}
        {uploadedImages.length > 0 && (
          <div className="mb-3 flex gap-2 overflow-x-auto pb-2 px-1">
            <AnimatePresence mode="popLayout">
              {uploadedImages.map((image) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8, x: -20 }}
                  transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                  layout
                  className="relative flex-shrink-0 group shadow-sm hover:shadow-md transition-shadow"
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    backgroundColor: '#1f2937', // 深灰底色
                    border: image.status === 'failed' ? '1.5px solid #ef4444' : '1px solid #e5e7eb'
                  }}
                >
                  {/* 1. 底层图片预览 */}
                  <img
                    src={image.preview}
                    alt="预览"
                    className="w-full h-full object-cover"
                    style={{
                      filter: image.status !== 'completed' ? 'grayscale(30%)' : 'none'
                    }}
                  />

                  {/* 2. 图片变暗遮罩 (100%可靠方案) - 只有未完成时显示 */}
                  {image.status !== 'completed' && (
                    <div
                      className="absolute inset-0"
                      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', zIndex: 10 }} // 60%黑色遮罩让图片变暗
                    />
                  )}

                  {/* 3. 加载/识别状态提示 */}
                  {(image.status === 'uploading' || image.status === 'recognizing') && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
                      style={{ zIndex: 20 }} // 层级在暗色遮罩之上
                    >
                      <Loader2 className="w-5 h-5 text-white animate-spin mb-1" />
                      <span className="text-[10px] text-white font-bold tracking-wider" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                        {image.status === 'uploading' ? '上传中...' : '识别中...'}
                      </span>
                    </motion.div>
                  )}

                  {/* 4. 错误状态提示 & 重试按钮 */}
                  {image.status === 'failed' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 flex flex-col items-center justify-center"
                      style={{ zIndex: 20, backgroundColor: 'rgba(127, 29, 29, 0.3)' }} // 微微偏红的遮罩
                    >
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRetryImage(image.id);
                        }}
                        whileHover={{ scale: 1.1, rotate: 180 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        className="w-8 h-8 bg-white text-red-600 rounded-full flex items-center justify-center shadow-lg cursor-pointer"
                        title="重新上传"
                        style={{ pointerEvents: 'auto' }} // 确保可以点击
                      >
                        <RotateCcw className="w-4 h-4" />
                      </motion.button>
                      <span className="text-[10px] text-white font-bold mt-1.5" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                        上传失败
                      </span>
                    </motion.div>
                  )}

                  {/* 5. 识别完成标记 */}
                  {image.status === 'completed' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className="absolute bottom-1.5 left-1.5 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-md"
                      style={{ zIndex: 20 }}
                    >
                      <Check className="w-3 h-3 text-white" />
                    </motion.div>
                  )}

                  {/* 6. 删除按钮 - 纯内联样式（100%强制生效，绝不依赖 Tailwind） */}
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage(image.id);
                    }}
                    whileHover={{ scale: 1.15, backgroundColor: 'rgba(239, 68, 68, 0.9)' }}
                    whileTap={{ scale: 0.9 }}
                    title="删除图片"
                    // 移除了所有 Tailwind 的定位和尺寸类名，全部写进 style
                    className="rounded-full flex items-center justify-center transition-all duration-200 shadow-sm cursor-pointer"
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      width: '24px',
                      height: '24px',
                      zIndex: 999, // 顶级层级
                      backgroundColor: 'rgba(0, 0, 0, 0.6)', // 默认底色，确保能看清
                      border: 'none',
                      padding: 0
                    }}
                  >
                    {/* 强制指定图标大小和颜色 */}
                    <X style={{ width: '14px', height: '14px', color: '#ffffff' }} />
                  </motion.button>

                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* 输入框和按钮行 */}
        <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '8px'
          }}
        >
          {/* 1. 麦克风按钮 - 固定 40x40 */}
          <button
            onClick={handleVoiceRecord}
            className="haptic-feedback flex-shrink-0"
            style={{
              height: '40px',
              width: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
              backgroundColor: isRecording ? '#dc2626' : '#f3f4f6',
              transition: 'background-color 0.2s'
            }}
          >
            <Mic style={{ width: '20px', height: '20px', color: isRecording ? '#fff' : '#4b5563' }} />
          </button>

          {/* 2. Textarea 容器 - 通过 minHeight 锁定初始高度 */}
          <div className="flex-1 relative" style={{ minHeight: '40px' }}>
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                if (textareaRef.current) {
                  textareaRef.current.style.height = '40px'; // 重置回单行高度
                  textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
                }
              }}
              placeholder={t('input_placeholder')}
              className="focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none overflow-y-auto"
              style={{
                width: '100%',
                padding: '8px 16px',     // 上下各 8px
                lineHeight: '24px',      // 24px + 8px*2 = 40px
                minHeight: '40px',
                maxHeight: '96px',
                borderRadius: '8px',
                backgroundColor: '#f3f4f6',
                border: 'none',
                display: 'block',
                boxSizing: 'border-box'  // 极其重要：确保 padding 不增加总高度
              }}
              rows={1}
            />
          </div>

          {/* 3. 图片按钮 - 固定 40x40 */}
          <button
            onClick={() => {
              // 检查登录状态
              if (!isLoggedIn) {
                // 显示登录提示框
                setShowLoginTip(true);
                // 2秒后自动隐藏提示框
                setTimeout(() => {
                  setShowLoginTip(false);
                }, 2000);
                // 跳转到登录页面
                if (onShowLogin) {
                  onShowLogin();
                }
                return;
              }
              fileInputRef.current?.click();
            }}
            className="haptic-feedback flex-shrink-0"
            style={{
              height: '40px',
              width: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f3f4f6',
              borderRadius: '8px'
            }}
          >
            <ImageIcon style={{ width: '20px', height: '20px', color: '#4b5563' }} />
          </button>

          {/* 隐藏的文件输入 */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleImageSelect}
            style={{ display: 'none' }}
          />

          {/* 4. 发送/停止按钮 - 固定 40x40 */}
          {aiThinking ? (
            /* 生成中：显示停止按钮 */
            <button
              onClick={handleStopGeneration}
              className="haptic-feedback flex-shrink-0"
              style={{
                height: '40px',
                width: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                backgroundColor: '#2563eb',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              <Square style={{ width: '16px', height: '16px', color: '#fff', fill: '#fff' }} />
            </button>
          ) : (
            /* 空闲中：显示发送按钮 */
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => handleSendMessage(inputText)}
                  disabled={!canSend()}
                  className="haptic-feedback flex-shrink-0"
                  style={{
                    height: '40px',
                    width: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px',
                    backgroundColor: canSend() ? '#2563eb' : '#e5e7eb',
                    cursor: canSend() ? 'pointer' : 'not-allowed',
                    transition: 'background-color 0.2s'
                  }}
                >
                  <Send style={{ width: '20px', height: '20px', color: canSend() ? '#fff' : '#9ca3af' }} />
                </button>
              </TooltipTrigger>
              {!canSend() && getSendButtonTooltip() && (
                <TooltipContent side="top" className="bg-gray-900 text-white text-xs">
                  {getSendButtonTooltip()}
                </TooltipContent>
              )}
            </Tooltip>
          )}
        </div>
        {isRecording && (
          <div style={{ marginTop: '6px', fontSize: '12px', color: '#6b7280' }}>
            {t('voice_listening')}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
