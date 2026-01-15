import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Image as ImageIcon,
  Mic,
  Send,
  History,
  RefreshCw,
  FileText,
  AlertCircle,
  CheckCircle,
  Loader,
  X,
  ClipboardList,
  Sparkles,
  Check,
  Plus,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserRole } from '../App';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  image?: string;
  timestamp: Date;
  thinking?: boolean;
  thinkingSteps?: string[];
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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: '你好！我是您的智能助手。有什么我可以帮助您的吗？',
      timestamp: new Date(Date.now() - 60000)
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [thinkingStep, setThinkingStep] = useState(0);
  const [showTicketPrompt, setShowTicketPrompt] = useState(false);
  const [ticketCreated, setTicketCreated] = useState(false);
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理初始消息
  useEffect(() => {
    if (initialMessage && initialMessage.trim()) {
      handleSendMessage(initialMessage);
    }
  }, [initialMessage]);

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, aiThinking]);

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    // 添加用户消息
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // 模拟AI思考和响应
    setAiThinking(true);
    setThinkingStep(0);

    // 模拟思考步骤
    const stepInterval = setInterval(() => {
      setThinkingStep(prev => {
        if (prev >= thinkingSteps.length - 1) {
          clearInterval(stepInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);

    // 模拟AI响应
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
        }
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

        // 模拟图片分析
        setAiThinking(true);
        setTimeout(() => {
          setAiThinking(false);
          const aiResponse: Message = {
            id: (Date.now() + 1).toString(),
            type: 'ai',
            content: '我看到图片中主刷位置有毛发缠绕。建议按照以下步骤清理：\n\n1. 使用随机附带的清洁工具\n2. 小心剪除缠绕的毛发\n3. 取出主刷用水冲洗\n4. 完全晾干后重新安装\n\n是否需要详细的拆卸教程？',
            timestamp: new Date()
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
      // 模拟语音识别
      setTimeout(() => {
        setIsRecording(false);
        setInputText('机器人的边刷不转了怎么办');
      }, 2000);
    }
  };

  // 智能提取聊天信息的函数
  const extractInfoFromChat = (): AIExtractedInfo => {
    // 提取用户消息
    const userMessages = messages.filter(m => m.type === 'user');

    // 提取上传的图片
    const images = messages
      .filter(m => m.image)
      .map(m => m.image as string);

    // 提取关键对话（最近3-4轮）
    const recentMessages = messages.slice(-6);
    const keyDialogues = recentMessages.map(m =>
      `${m.type === 'user' ? '用户' : 'AI'}：${m.content.substring(0, 100)}${m.content.length > 100 ? '...' : ''}`
    );

    // 生成问题摘要（取第一条用户消息）
    let problemSummary = '';
    let suggestedType = 'maintenance';
    let suggestedPriority: 'low' | 'medium' | 'high' = 'medium';

    if (userMessages.length > 0) {
      const firstUserMsg = userMessages[0].content;
      problemSummary = firstUserMsg.length > 50
        ? firstUserMsg.substring(0, 50) + '...'
        : firstUserMsg;

      // 根据关键词判断问题类型和优先级
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

  // 打开工单创建弹窗时提取信息
  const handleOpenTicketDialog = () => {
    const extractedInfo = extractInfoFromChat();
    setAiExtractedInfo(extractedInfo);
    setUseAISuggestion(true);

    // 初始化表单数据
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

  // 获取问题类型的标签
  const getProblemTypeLabel = (type: string) => {
    const typeMap: { [key: string]: string } = {
      malfunction: '设备故障',
      maintenance: '维护保养',
      consultation: '使用咨询',
      parts: '配件需求'
    };
    return typeMap[type] || '其他';
  };

  // 获取优先级标签
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
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors haptic-feedback">
            <History className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={() => setMessages([])}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors haptic-feedback"
          >
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* 对话区域 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 ? (
          // 空状态
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
          messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                {/* AI头像 */}
                {message.type === 'ai' && (
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mb-2">
                    <span className="text-white text-sm font-semibold">AI</span>
                  </div>
                )}

                {/* 消息气泡 */}
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

                  {/* 引用来源 */}
                  {message.citation && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <FileText className="w-3 h-3" />
                        <span>来源：{message.citation.title} {message.citation.page}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 时间戳 */}
                <div className={`text-xs text-gray-400 mt-1 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                  {message.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))
        )}

        {/* AI思考状态 */}
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

      {/* 猜你想问 */}
      {messages.length <= 1 && !aiThinking && (
        <div className="px-4 pb-3">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleSendMessage(question)}
                className="flex-shrink-0 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:border-blue-400 hover:text-blue-600 transition-colors haptic-feedback whitespace-nowrap"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 问题解决提示区 - 多轮对话后显示 */}
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

      {/* 创建工单弹窗 */}
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
              {/* 标题栏 */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">创建服务工单</h3>
                <button
                  onClick={() => setShowTicketPrompt(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* 滚动内容区 */}
              <div className="max-h-[70vh] overflow-y-auto px-6 py-4">
                {/* AI智能建议提示 */}
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
                  {/* 问题类型 */}
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

                  {/* 优先级 */}
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

                  {/* 问题摘要 */}
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

                  {/* 设备信息 */}
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

                  {/* 关键对话记录预览 */}
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

                  {/* 已上传图片 */}
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

                  {/* 补充说明 */}
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

                  {/* 工单内容说明 */}
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

              {/* 底部按钮 */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => {
                    setShowTicketPrompt(false);
                    setTicketCreated(true);

                    // 显示工单创建成功消息
                    const ticketMsg: Message = {
                      id: Date.now().toString(),
                      type: 'ai',
                      content: `✅ 工单已创建成功！\n\n工单编号：WO${Date.now().toString().slice(-9)}\n问题类型：${getProblemTypeLabel(ticketFormData.problemType)}\n优先级：${getPriorityLabel(ticketFormData.priority)}\n\n我们的工程师将在2小时内与您联系。您可以在"工单"页面查看进度。`,
                      timestamp: new Date()
                    };
                    setMessages(prev => [...prev, ticketMsg]);

                    // 跳转到工单页面
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
          {/* 图片上传 */}
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

          {/* 文字输入框 */}
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

          {/* 语音/发送按钮 */}
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