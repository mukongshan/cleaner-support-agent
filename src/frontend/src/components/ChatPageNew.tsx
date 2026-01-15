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
  RefreshCw,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserRole } from '../App';

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
  // 聊天会话管理
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([
    {
      id: '1',
      title: '如何清理主刷？',
      messages: [],
      createdAt: new Date(Date.now() - 86400000),
      updatedAt: new Date(Date.now() - 86400000)
    }
  ]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: '你好！我是您的智能助手。有什么我可以帮助您的吗？',
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
  const [showNewMenu, setShowNewMenu] = useState(false);

  // 工单相关
  const [aiExtractedInfo, setAiExtractedInfo] = useState<AIExtractedInfo | null>(null);
  const [useAISuggestion, setUseAISuggestion] = useState(true);
  const [ticketFormData, setTicketFormData] = useState<TicketFormData>({
    problemType: 'maintenance',
    priority: 'medium',
    problemSummary: '',
    deviceModel: 'CR-X3000',
    deviceSN: 'SN202401120001',
    additionalNotes: '',
    images: []
  });

  // 继续问我相关问题状态
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);
  const [currentMessageId, setCurrentMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const thinkingSteps = [
    '正在识别故障码...',
    '正在查询维修知识库...',
    '正在生成解决方案...'
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
    const newQuestions = getFollowUpQuestions(aiContent);
    setFollowUpQuestions(newQuestions);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, aiThinking]);

  // 处理初始消息
  useEffect(() => {
    if (initialMessage && initialMessage.trim()) {
      handleSendMessage(initialMessage);
    }
  }, [initialMessage]);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showNewMenu && !target.closest('.new-menu-container')) {
        setShowNewMenu(false);
      }
    };

    if (showNewMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showNewMenu]);

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

    setAiThinking(true);
    setThinkingStep(0);

    const stepInterval = setInterval(() => {
      setThinkingStep(prev => {
        if (prev >= thinkingSteps.length - 1) {
          clearInterval(stepInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);

    setTimeout(() => {
      clearInterval(stepInterval);
      setAiThinking(false);

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: getAIResponse(text),
        timestamp: new Date(),
        citation: {
          title: '用户手册 - 维护保养',
          page: 'P.23-25'
        },
        rating: null
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 4500);
  };

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
        content: '你好！我是您的智能助手。有什么我可以帮助您的吗？',
        timestamp: new Date()
      }
    ]);
    setTicketCreated(false);
    setShowNewChatDialog(false);
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
    const extractedInfo = extractInfoFromChat();
    setAiExtractedInfo(extractedInfo);
    setUseAISuggestion(true);

    setTicketFormData({
      problemType: extractedInfo.suggestedType,
      priority: extractedInfo.suggestedPriority,
      problemSummary: extractedInfo.problemSummary,
      deviceModel: 'CR-X3000',
      deviceSN: 'SN202401120001',
      additionalNotes: '',
      images: extractedInfo.images
    });

    setShowTicketPrompt(true);
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
    <div className="h-full flex flex-col bg-gray-50">
      {/* 顶部工具栏 */}
      <div className="bg-white px-4 py-3 shadow-sm flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">AI 智能助手</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowHistoryDialog(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors haptic-feedback"
          >
            <History className="w-5 h-5 text-gray-600" />
          </button>
          <div className="relative new-menu-container">
            <button
              onClick={() => setShowNewMenu(!showNewMenu)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors haptic-feedback flex items-center gap-1"
            >
              <Plus className="w-5 h-5 text-gray-600" />
              <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${showNewMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* 下拉菜单 */}
            <AnimatePresence>
              {showNewMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-2 top-full mt-2 w-32 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50"
                >
                  <button
                    onClick={() => {
                      setShowNewMenu(false);
                      handleNewChat();
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors haptic-feedback whitespace-nowrap"
                  >
                    新建对话
                  </button>
                  <button
                    onClick={() => {
                      setShowNewMenu(false);
                      handleOpenTicketDialog();
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors haptic-feedback border-t border-gray-100 whitespace-nowrap"
                  >
                    新建工单
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* 对话区域 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-8">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">还没有对话记录</h3>
            <p className="text-sm text-gray-500 mb-6">
              试试下面的常见问题，或者直接向我提问
            </p>
          </div>
        ) : (
          messages.map((message, index) => {
            // 检查是否是最后一条AI消息
            const lastAIMessageIndex = messages.map((m, i) => m.type === 'ai' ? i : -1).filter(i => i !== -1).pop();
            const isLastAI = message.type === 'ai' && index === lastAIMessageIndex && !aiThinking;

            return (
              <div
                key={message.id}
                className={`flex flex-col ${message.type === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className={`max-w-[80%]`}>
                  {message.type === 'ai' && (
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mb-2">
                      <span className="text-white text-sm font-semibold">AI</span>
                    </div>
                  )}

                  <div
                    className={`rounded-2xl px-4 py-3 ${message.type === 'user'
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
                  </div>

                  {/* AI回答评价按钮 */}
                  {message.type === 'ai' && (
                    <div className="flex items-center gap-2 mt-2 ml-1">
                      <button
                        onClick={() => handleRateMessage(message.id, 'like')}
                        className={`p-1.5 rounded-lg transition-all haptic-feedback ${message.rating === 'like'
                          ? 'bg-green-100 text-green-600'
                          : 'hover:bg-gray-100 text-gray-400'
                          }`}
                      >
                        <ThumbsUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRateMessage(message.id, 'dislike')}
                        className={`p-1.5 rounded-lg transition-all haptic-feedback ${message.rating === 'dislike'
                          ? 'bg-red-100 text-red-600'
                          : 'hover:bg-gray-100 text-gray-400'
                          }`}
                      >
                        <ThumbsDown className="w-4 h-4" />
                      </button>
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
                      <div className="mt-3 ml-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <MessageSquare className="w-3 h-3" />
                            <span>继续问我</span>
                          </div>
                          <button
                            onClick={() => refreshFollowUpQuestions(message.content)}
                            className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors haptic-feedback"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>换一换</span>
                          </button>
                        </div>
                        <div className="space-y-2">
                          {questionsToShow.slice(0, 3).map((question, qIndex) => (
                            <button
                              key={qIndex}
                              onClick={() => handleSendMessage(question)}
                              className="w-full text-left px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-700 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 transition-colors haptic-feedback"
                            >
                              {question}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {message.type === 'user' && (
                    <div className="text-xs text-gray-400 mt-1 text-right">
                      {message.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {aiThinking && (
          <div className="flex justify-start">
            <div className="max-w-[80%]">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mb-2">
                <span className="text-white text-sm font-semibold">AI</span>
              </div>
              <div className="bg-white rounded-2xl rounded-tl-sm shadow-sm px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>{thinkingSteps[thinkingStep]}</span>
                </div>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 问题解决提示区 */}
      {messages.length > 3 && !aiThinking && !ticketCreated && (
        <div className="px-4 pb-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">问题解决了吗？</h4>
                <p className="text-sm text-gray-600 mb-3">
                  如果以上方案未能解决您的问题，我可以为您创建工单，由专业工程师为您提供支持。
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setTicketCreated(true);
                      const ticketMsg: Message = {
                        id: Date.now().toString(),
                        type: 'ai',
                        content: '✅ 太好了！很高兴能帮到您。如果还有其他问题，随时可以来咨询我。',
                        timestamp: new Date()
                      };
                      setMessages(prev => [...prev, ticketMsg]);
                    }}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors haptic-feedback"
                  >
                    已解决
                  </button>
                  <button
                    onClick={handleOpenTicketDialog}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors haptic-feedback flex items-center gap-1"
                  >
                    <ClipboardList className="w-4 h-4" />
                    创建工单
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

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
                <h3 className="text-lg font-semibold text-gray-900 mb-2">创建新对话？</h3>
                <p className="text-sm text-gray-600">
                  当前对话记录将被保存。您确定要开始新的对话吗？
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowNewChatDialog(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors haptic-feedback"
                >
                  取消
                </button>
                <button
                  onClick={confirmNewChat}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors haptic-feedback"
                >
                  确认
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
                <h3 className="text-lg font-semibold text-gray-900">历史对话</h3>
                <button
                  onClick={() => setShowHistoryDialog(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto px-4 py-4">
                {chatSessions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500">暂无历史对话记录</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {chatSessions.map((session) => (
                      <button
                        key={session.id}
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
                              <span>•</span>
                              <span>{session.messages.length} 条消息</span>
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

      {/* 创建工单弹窗 - 保持原有代码 */}
      <AnimatePresence>
        {showTicketPrompt && aiExtractedInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-end justify-center z-50"
            onClick={() => setShowTicketPrompt(false)}
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
                <h3 className="text-lg font-semibold text-gray-900">创建服务工单</h3>
                <button
                  onClick={() => setShowTicketPrompt(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="max-h-[70vh] overflow-y-auto px-6 py-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4 mb-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                        AI 已为您智能填充信息
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                        >
                          ✨
                        </motion.div>
                      </h4>
                      <p className="text-xs text-gray-600 mb-2">
                        根据您的对话内容，我已自动提取关键信息。您可以选择使用或手动修改。
                      </p>
                      <button
                        onClick={() => setUseAISuggestion(!useAISuggestion)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${useAISuggestion
                          ? 'bg-purple-600 text-white'
                          : 'bg-white border border-gray-300 text-gray-700'
                          }`}
                      >
                        <div className={`w-4 h-4 rounded flex items-center justify-center ${useAISuggestion ? 'bg-white/20' : 'bg-gray-100'
                          }`}>
                          {useAISuggestion && <Check className="w-3 h-3" />}
                        </div>
                        {useAISuggestion ? '已采纳 AI 建议' : '使用 AI 建议'}
                      </button>
                    </div>
                  </div>
                </motion.div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      问题类型
                      {useAISuggestion && (
                        <span className="ml-2 text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                          AI 推荐
                        </span>
                      )}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: 'malfunction', label: '设备故障' },
                        { value: 'maintenance', label: '维护保养' },
                        { value: 'consultation', label: '使用咨询' },
                        { value: 'parts', label: '配件需求' }
                      ].map((type) => (
                        <button
                          key={type.value}
                          onClick={() =>
                            setTicketFormData({ ...ticketFormData, problemType: type.value })
                          }
                          className={`px-3 py-2 border rounded-lg text-sm transition-all ${ticketFormData.problemType === type.value
                            ? 'border-purple-500 bg-purple-50 text-purple-700 font-medium'
                            : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      优先级
                      {useAISuggestion && (
                        <span className="ml-2 text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                          AI 推荐
                        </span>
                      )}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: 'low' as const, label: '低', color: 'gray' },
                        { value: 'medium' as const, label: '中', color: 'blue' },
                        { value: 'high' as const, label: '高', color: 'red' }
                      ].map((priority) => (
                        <button
                          key={priority.value}
                          onClick={() =>
                            setTicketFormData({ ...ticketFormData, priority: priority.value })
                          }
                          className={`px-3 py-2 border rounded-lg text-sm transition-all ${ticketFormData.priority === priority.value
                            ? `border-${priority.color}-500 bg-${priority.color}-50 text-${priority.color}-700 font-medium`
                            : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                          {priority.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      问题摘要
                      {useAISuggestion && aiExtractedInfo.problemSummary && (
                        <span className="ml-2 text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                          AI 提取
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={useAISuggestion ? aiExtractedInfo.problemSummary : ticketFormData.problemSummary}
                      onChange={(e) =>
                        setTicketFormData({ ...ticketFormData, problemSummary: e.target.value })
                      }
                      placeholder="简要描述问题..."
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        设备型号
                      </label>
                      <input
                        type="text"
                        value={ticketFormData.deviceModel}
                        onChange={(e) =>
                          setTicketFormData({ ...ticketFormData, deviceModel: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        设备 SN 码
                      </label>
                      <input
                        type="text"
                        value={ticketFormData.deviceSN}
                        onChange={(e) =>
                          setTicketFormData({ ...ticketFormData, deviceSN: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      />
                    </div>
                  </div>

                  {useAISuggestion && aiExtractedInfo.keyDialogues.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        关键对话记录
                        <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                          将自动附加到工单
                        </span>
                      </label>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 max-h-32 overflow-y-auto">
                        <div className="space-y-2">
                          {aiExtractedInfo.keyDialogues.slice(0, 4).map((dialogue, index) => (
                            <p key={index} className="text-xs text-gray-600 leading-relaxed">
                              {dialogue}
                            </p>
                          ))}
                          {aiExtractedInfo.keyDialogues.length > 4 && (
                            <p className="text-xs text-gray-400 italic">
                              还有 {aiExtractedInfo.keyDialogues.length - 4} 条对话记录...
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {aiExtractedInfo.images.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        已上传图片
                        <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                          {aiExtractedInfo.images.length} 张
                        </span>
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {aiExtractedInfo.images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`上传的图片 ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg border border-gray-200"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      补充说明（选填）
                    </label>
                    <textarea
                      value={ticketFormData.additionalNotes}
                      onChange={(e) =>
                        setTicketFormData({ ...ticketFormData, additionalNotes: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm resize-none"
                      rows={3}
                      placeholder="补充其他信息..."
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-xs text-blue-800">
                        <p className="font-medium mb-1">提交后将包含：</p>
                        <ul className="space-y-0.5">
                          <li>• 问题详细描述和完整对话记录</li>
                          <li>• 所有上传的图片和视频</li>
                          <li>• 设备信息和故障时间</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => {
                    setShowTicketPrompt(false);
                    setTicketCreated(true);

                    const ticketMsg: Message = {
                      id: Date.now().toString(),
                      type: 'ai',
                      content: `✅ 工单已创建成功！\n\n工单编号：WO${Date.now().toString().slice(-9)}\n问题类型：${getProblemTypeLabel(ticketFormData.problemType)}\n优先级：${getPriorityLabel(ticketFormData.priority)}\n\n我们的工程师将在2小时内与您联系。您可以在"工单"页面查看进度。`,
                      timestamp: new Date()
                    };
                    setMessages(prev => [...prev, ticketMsg]);

                    setTimeout(() => {
                      onCreateTicket?.();
                    }, 1500);
                  }}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl haptic-feedback"
                >
                  确认创建工单
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 输入区域 */}
      <div className="bg-white border-t border-gray-200 px-4 py-3 safe-area-bottom">
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
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors haptic-feedback flex-shrink-0"
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

          <div className="flex-1 relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
              placeholder="描述您遇到的问题..."
              className="w-full px-4 py-2.5 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {inputText.trim() ? (
            <button
              onClick={() => handleSendMessage(inputText)}
              className="p-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors haptic-feedback flex-shrink-0"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          ) : (
            <button
              onClick={handleVoiceRecord}
              className={`p-2.5 rounded-lg transition-colors haptic-feedback flex-shrink-0 ${isRecording
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-gray-100 hover:bg-gray-200'
                }`}
            >
              <Mic className={`w-5 h-5 ${isRecording ? 'text-white' : 'text-gray-600'}`} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
