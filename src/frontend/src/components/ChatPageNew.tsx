import React, { useState, useRef, useEffect } from 'react';
import {
  Image as ImageIcon,
  Mic,
  Send,
  History,
  FileText,
  AlertCircle,
  Loader,
  X,
  ClipboardList,
  Sparkles,
  Check,
  Plus,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Clock,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserRole } from '../App';
import {
  sendAIMessage,
  getConversations,
  getConversationDetail,
  createTicket,
  Conversation,
  ConversationDetail
} from '../services/api';
import { getToken } from '../services/api/config';
import { TicketForm } from './TicketForm';
import aiAvatar from '../assets/images/ai_avatar.png';
import { useLanguage } from '../contexts/LanguageContext';

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

interface ChatPageProps {
  initialMessage?: string;
  onCreateTicket?: () => void;
  userRole: UserRole;
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

export function ChatPage({ initialMessage, onCreateTicket, userRole }: ChatPageProps) {
  const { t, language } = useLanguage();
  // 聊天会话管理
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [hasCreatedNewChat, setHasCreatedNewChat] = useState(false); // 是否创建过新对话
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false); // 是否已完成初始加载
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: language === 'zh' ? '你好！我是您的智能助手。有什么我可以帮助您的吗？' : 'Hello! I am your AI assistant. How can I help you?',
      timestamp: new Date(Date.now() - 60000)
    }
  ]);

  // UI状态
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [thinkingStep, setThinkingStep] = useState(0);
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const prevMessagesLength = useRef(0);

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
    setLoadingConversation(true);
    try {
      // 调用真实API获取会话详情
      const detail = await getConversationDetail(conversationId);

      // 转换消息格式：从 API 格式转换为组件需要的格式
      const convertedMessages: Message[] = detail.messages.map((msg, index) => ({
        id: `${conversationId}-${index}`,
        type: msg.role === 'user' ? 'user' : 'ai',
        content: msg.content,
        timestamp: new Date(msg.timestamp),
        rating: null
      }));

      setMessages(convertedMessages);
      setCurrentSessionId(conversationId);
      setIsHistoryConversation(true); // 标记为历史对话
    } catch (error) {
      console.error('加载会话详情失败:', error);
      // 出错时显示错误提示
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

  // 当打开历史对话时加载列表
  useEffect(() => {
    if (showHistoryDialog) {
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

          // 转换消息格式
          const convertedMessages: Message[] = detail.messages.map((msg, index) => ({
            id: `${latestConversation.id}-${index}`,
            type: msg.role === 'user' ? 'user' : 'ai',
            content: msg.content,
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

  const handleSendMessage = (text: string) => {
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
    setThinkingStep(0);

    // 思考步骤动画
    const stepInterval = setInterval(() => {
      setThinkingStep(prev => {
        if (prev >= thinkingSteps.length - 1) {
          clearInterval(stepInterval);
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

    // 调用真实的 AI API
    sendAIMessage(
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

          // 更新或添加 AI 消息
          setMessages(prev => {
            const lastMsg = prev[prev.length - 1];
            if (lastMsg && lastMsg.id === aiMessageId) {
              // 更新现有消息
              return prev.map(msg =>
                msg.id === aiMessageId
                  ? { ...msg, content: fullAnswer }
                  : msg
              );
            } else {
              // 添加新消息
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

          // 立即保存 conversation_id（如果存在且尚未保存），以便后续消息能继续同一会话
          // conversation_id 可能在 message 事件中就已经返回，需要立即保存
          if (event.conversation_id && !conversationIdSaved) {
            conversationIdSaved = true;
            console.log('保存 conversation_id:', event.conversation_id);

            // 立即保存会话ID，确保用户在同一轮对话中发送多条消息时能正确关联
            setCurrentSessionId(event.conversation_id);

            // 如果是新会话，添加到历史记录列表
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
            }
          }
        }

        if (event.event === 'message_end') {
          console.log('消息结束');
          clearInterval(stepInterval);
          setAiThinking(false);

          // 确保会话 ID 已保存（如果 message 事件中没有保存，在这里保存）
          // 有些情况下 conversation_id 可能在 message_end 事件中才返回
          if (event.conversation_id && !conversationIdSaved) {
            conversationIdSaved = true;
            console.log('在 message_end 中保存 conversation_id:', event.conversation_id);

            // 保存会话ID
            setCurrentSessionId(event.conversation_id);

            // 如果是新会话，添加到历史记录列表
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
            }
          }

          // 如果没有收到任何回答，显示错误提示
          if (!fullAnswer || fullAnswer.trim() === '') {
            console.warn('未收到 AI 回答');
            setMessages(prev => [...prev, {
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
            setMessages(prev => prev.map(msg =>
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
        }
      },
      // onError: 错误处理
      (error) => {
        console.error('AI 对话错误:', error);
        clearInterval(stepInterval);
        setAiThinking(false);

        // 显示详细的错误消息
        const errorMessage = error.message || '未知错误';
        console.error('错误详情:', errorMessage);

        setMessages(prev => [...prev, {
          id: aiMessageId,
          type: 'ai' as const,
          content: `抱歉，我遇到了问题：${errorMessage}\n\n请检查网络连接或稍后再试。`,
          timestamp: new Date(),
          rating: null
        }]);
      },
      // onComplete: 完成
      () => {
        clearInterval(stepInterval);
        setAiThinking(false);
      }
    );

    // cancelRequest 可用于取消请求，例如用户快速发送新消息或组件卸载时
    // 当前未使用，但保留以便将来需要时使用
  };

  // 处理初始消息
  useEffect(() => {
    // 等待初始加载完成后再处理 initialMessage
    if (isInitialLoadComplete && initialMessage && initialMessage.trim()) {
      handleSendMessage(initialMessage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMessage, isInitialLoadComplete]);

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
    setIsRecording(!isRecording);

    if (!isRecording) {
      setTimeout(() => {
        setIsRecording(false);
        setInputText('机器人的边刷不转了怎么办');
      }, 2000);
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
    setMessages([
      {
        id: Date.now().toString(),
        type: 'ai',
        content: language === 'zh' ? '你好！我是您的智能助手。有什么我可以帮助您的吗？' : 'Hello! I am your AI assistant. How can I help you?',
        timestamp: new Date()
      }
    ]);
    // 重置会话ID，下次发送消息时将创建新会话
    setCurrentSessionId(null);
    setTicketCreated(false);
    setShowTicketPrompt(false); // 重置工单提示关闭状态
    setIsHistoryConversation(false); // 重置为非历史对话
    setShowNewChatDialog(false);
    setHasCreatedNewChat(true); // 标记已创建过新对话
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
          /* 加载历史对话的加载动画 */
          <div className="h-full flex flex-col items-center justify-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <Loader className="w-8 h-8 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="mt-4 text-sm text-gray-600">{t('loading_conversation')}</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-8">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('no_conversations')}</h3>
            <p className="text-sm text-gray-500 mb-6">
              {t('no_conversations_desc')}
            </p>
          </div>
        ) : (
          messages.map((message, index) => {
            // 检查是否是最后一条AI消息
            const lastAIMessageIndex = messages.map((m, i) => m.type === 'ai' ? i : -1).filter(i => i !== -1).pop();
            const isLastAI = message.type === 'ai' && index === lastAIMessageIndex && !aiThinking;

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
                    <motion.img
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      src={aiAvatar}
                      alt="AI Avatar"
                      className="w-8 h-8 rounded-full mb-2 object-cover"
                    />
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
                    {message.image && (
                      <img
                        src={message.image}
                        alt="上传的图片"
                        className="w-full rounded-lg mb-2"
                      />
                    )}
                    <p className="text-sm whitespace-pre-line">{message.content}</p>

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

        {aiThinking && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex justify-start"
          >
            <div className="max-w-[80%]">
              <motion.img
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                src={aiAvatar}
                alt="AI Avatar"
                className="w-8 h-8 rounded-full mb-2 object-cover"
              />
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl rounded-tl-sm shadow-sm px-4 py-3"
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-sm text-gray-600 mb-2"
                >
                  <Loader className="w-4 h-4 animate-spin" />
                  <motion.span
                    key={thinkingStep}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    {thinkingSteps[thinkingStep]}
                  </motion.span>
                </motion.div>
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1, 0] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.2,
                        ease: 'easeInOut'
                      }}
                      className="w-2 h-2 bg-gray-400 rounded-full"
                    />
                  ))}
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
                <button
                  onClick={() => setShowHistoryDialog(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto px-4 py-4">
                {loadingHistory ? (
                  <div className="text-center py-12">
                    <Loader className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
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
                      <button
                        key={session.id}
                        onClick={() => {
                          loadConversationDetail(session.id);
                          setShowHistoryDialog(false);
                        }}
                        className="w-full bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-400 hover:bg-blue-50 transition-all text-left haptic-feedback"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 mb-1 truncate">
                              {session.title}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              <span>{session.createdAt.toLocaleDateString('zh-CN')}</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
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


      {/* 输入区域 */}
      <div
        className="px-4 py-3 pb-safe relative z-10"
        style={{
          backdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(255, 255, 255, 0.1)'
        }}
      >
        {isRecording && (
          <div className="mb-3 flex items-center justify-center gap-3 py-2">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-red-500 rounded-full"
                  style={{
                    height: '20px',
                    animation: `wave 1s ease-in-out infinite`,
                    animationDelay: `${i * 0.1}s`
                  }}
                />
              ))}
            </div>
            <span className="text-sm text-red-600">正在录音...</span>
          </div>
        )}

        <div className="flex items-end gap-2">
          {/* Mic Button - Far Left, Always Visible */}
          <button
            onClick={handleVoiceRecord}
            className={`p-2.5 rounded-lg transition-colors haptic-feedback flex-shrink-0 ${isRecording
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-gray-100 hover:bg-gray-200'
              }`}
          >
            <Mic className={`w-5 h-5 ${isRecording ? 'text-white' : 'text-gray-600'}`} />
          </button>

          {/* Textarea - Middle, Takes Remaining Space, Auto-Resize */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                // Auto-resize textarea
                if (textareaRef.current) {
                  textareaRef.current.style.height = 'auto';
                  textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (inputText.trim()) {
                    handleSendMessage(inputText);
                  }
                }
              }}
              placeholder={t('input_placeholder')}
              className="w-full px-4 py-2.5 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none overflow-y-auto max-h-24"
              rows={1}
            />
          </div>

          {/* Image Button - Right of Input, Gray Box Style */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors haptic-feedback flex-shrink-0"
          >
            <ImageIcon className="w-5 h-5 text-gray-600" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          {/* Send Button - Far Right, Always Visible */}
          <button
            onClick={() => handleSendMessage(inputText)}
            disabled={!inputText.trim()}
            className={`p-2.5 rounded-lg transition-colors haptic-feedback flex-shrink-0 ${inputText.trim()
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-gray-200 cursor-not-allowed'
              }`}
          >
            <Send className={`w-5 h-5 ${inputText.trim() ? 'text-white' : 'text-gray-400'}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
