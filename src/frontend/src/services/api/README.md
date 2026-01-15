# API 服务使用说明

本目录包含所有与后端 API 交互的服务模块。

## 目录结构

```
api/
├── config.ts       # API 配置和工具函数
├── request.ts      # HTTP 请求封装
├── auth.ts         # 用户认证 API
├── ai.ts           # AI 对话 API
├── ticket.ts       # 工单管理 API
├── media.ts        # 媒体文件 API
└── index.ts        # 统一导出
```

## 配置

在项目根目录创建 `.env.development` 文件：

```env
VITE_API_BASE_URL=http://localhost:8080/api/cleaner-support/v2
```

## 使用示例

### 1. 用户认证

```typescript
import { login, getUserProfile, updateUserProfile } from '@/services/api';

// 登录
const loginData = await login({
  username: '13800138000',
  password: 'hashed_password',
  loginType: 'sms'
});

// 获取用户信息
const userProfile = await getUserProfile();

// 更新用户信息
await updateUserProfile({
  nickname: '新昵称',
  avatar: 'https://cdn.com/avatar.jpg'
});
```

### 2. AI 对话（流式）

```typescript
import { sendAIMessage } from '@/services/api';

// 发送 AI 消息（支持流式响应）
const cancelFn = sendAIMessage(
  {
    query: '主刷卷入地毯了怎么办？',
    conversationId: 'conv_123', // 可选
    deviceInfo: {
      model: 'X10 Pro',
      errorCode: 'E04'
    }
  },
  // 接收消息回调
  (event) => {
    if (event.event === 'message') {
      console.log('AI 回复:', event.answer);
      console.log('会话 ID:', event.conversation_id);
    } else if (event.event === 'message_end') {
      console.log('消息结束');
    }
  },
  // 错误回调
  (error) => {
    console.error('对话出错:', error);
  },
  // 完成回调
  () => {
    console.log('对话完成');
  }
);

// 取消请求
// cancelFn();
```

### 3. 获取会话历史

```typescript
import { getConversations, getConversationDetail } from '@/services/api';

// 获取会话列表
const conversations = await getConversations();

// 获取会话详情
const detail = await getConversationDetail('conv_123');
```

### 4. 工单管理

```typescript
import { createTicket, getTickets, getTicketDetail, updateTicket } from '@/services/api';

// 创建工单
const ticket = await createTicket({
  title: '传感器持续报错',
  description: '已清理但无效，需报修',
  priority: 'high',
  relatedChatId: 'conv_123',
  attachmentUrls: ['https://...']
});

// 获取工单列表
const tickets = await getTickets('processing'); // 可选状态筛选

// 获取工单详情
const ticketDetail = await getTicketDetail('WO20240120001');

// 更新工单
await updateTicket('WO20240120001', {
  status: 'completed',
  comments: '问题已解决'
});
```

### 5. 知识库/媒体文件

```typescript
import { getMediaFiles, getMediaFileDetail, uploadMedia } from '@/services/api';

// 获取媒体文件列表
const files = await getMediaFiles({
  category: 'maintenance',
  query: '传感器'
});

// 获取文件详情
const fileDetail = await getMediaFileDetail('KB001');

// 上传文件
const uploadResult = await uploadMedia(file);
console.log('上传成功:', uploadResult.url);
```

## React 组件中使用示例

### 使用 useState 和 useEffect

```typescript
import { useState, useEffect } from 'react';
import { getTickets, TicketListItem } from '@/services/api';

function TicketsPage() {
  const [tickets, setTickets] = useState<TicketListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const data = await getTickets();
        setTickets(data);
      } catch (error) {
        console.error('获取工单失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  if (loading) return <div>加载中...</div>;

  return (
    <div>
      {tickets.map(ticket => (
        <div key={ticket.ticketId}>{ticket.title}</div>
      ))}
    </div>
  );
}
```

### AI 流式对话示例

```typescript
import { useState } from 'react';
import { sendAIMessage } from '@/services/api';

function ChatComponent() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([]);
  const [isThinking, setIsThinking] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;

    // 添加用户消息
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');
    setIsThinking(true);

    let aiResponse = '';

    sendAIMessage(
      { query: input },
      (event) => {
        if (event.event === 'message' && event.answer) {
          aiResponse += event.answer;
          // 实时更新 AI 回复
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage?.role === 'assistant') {
              lastMessage.content = aiResponse;
            } else {
              newMessages.push({ role: 'assistant', content: aiResponse });
            }
            return newMessages;
          });
        }
      },
      (error) => {
        console.error('AI 对话错误:', error);
        setIsThinking(false);
      },
      () => {
        setIsThinking(false);
      }
    );
  };

  return (
    <div>
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={msg.role}>
            {msg.content}
          </div>
        ))}
      </div>
      <input 
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
      />
      <button onClick={handleSend} disabled={isThinking}>
        发送
      </button>
    </div>
  );
}
```

## 错误处理

所有 API 调用都应该使用 try-catch 处理错误：

```typescript
try {
  const data = await someApiCall();
  // 处理成功
} catch (error) {
  // 处理错误
  console.error('API 调用失败:', error);
  // 显示错误提示给用户
}
```

## Token 管理

- Token 会自动保存到 localStorage
- Token 会自动添加到请求头
- Token 过期（401）会自动清除并跳转登录页
- 可以使用 `getToken()`, `setToken()`, `clearToken()` 手动管理

## 类型定义

所有 API 的请求和响应类型都已定义，可以直接导入使用，享受 TypeScript 的类型检查和自动补全。
