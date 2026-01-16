# API 使用示例

本文档提供工单和问答接口的使用示例。

## 1. 工单管理 API

### 1.1 创建工单

```typescript
import { createTicket } from '@/services/api';

// 创建工单
const createNewTicket = async () => {
  try {
    const result = await createTicket({
      title: '传感器持续报错',
      description: '已清理但无效，需报修',
      priority: 'medium',
      relatedChatId: 'conv_123', // 可选：关联对话记录
      attachmentUrls: ['https://...'] // 可选：附件
    });
    
    console.log('工单创建成功:', result.ticketId);
    // result: { ticketId: 'WO20240120001', status: 'pending' }
  } catch (error) {
    console.error('创建工单失败:', error);
  }
};
```

### 1.2 获取工单列表

```typescript
import { getTickets } from '@/services/api';

// 获取所有工单
const fetchAllTickets = async () => {
  try {
    const tickets = await getTickets();
    console.log('所有工单:', tickets);
  } catch (error) {
    console.error('获取工单失败:', error);
  }
};

// 按状态筛选工单
const fetchProcessingTickets = async () => {
  try {
    const tickets = await getTickets('processing');
    console.log('处理中的工单:', tickets);
  } catch (error) {
    console.error('获取工单失败:', error);
  }
};
```

### 1.3 获取工单详情

```typescript
import { getTicketDetail } from '@/services/api';

const fetchTicketDetail = async (ticketId: string) => {
  try {
    const detail = await getTicketDetail(ticketId);
    console.log('工单详情:', detail);
    // detail 包含: ticketId, title, description, status, priority, 
    // createdAt, updatedAt, engineerName, estimatedTime, attachments
  } catch (error) {
    console.error('获取工单详情失败:', error);
  }
};
```

### 1.4 更新工单状态

```typescript
import { updateTicket } from '@/services/api';

// 完成工单
const completeTicket = async (ticketId: string) => {
  try {
    await updateTicket(ticketId, {
      status: 'completed',
      comments: '问题已解决'
    });
    console.log('工单状态更新成功');
  } catch (error) {
    console.error('更新工单失败:', error);
  }
};

// 取消工单
const cancelTicket = async (ticketId: string) => {
  try {
    await updateTicket(ticketId, {
      status: 'cancelled',
      comments: '用户取消工单'
    });
  } catch (error) {
    console.error('取消工单失败:', error);
  }
};
```

## 2. AI 问答 API

### 2.1 发送 AI 消息（流式）

```typescript
import { sendAIMessage, AIChatStreamEvent } from '@/services/api';

const chatWithAI = () => {
  let fullAnswer = '';
  let conversationId = '';

  const cancelFn = sendAIMessage(
    {
      query: '主刷卷入地毯了怎么办？',
      conversationId: 'conv_123', // 可选：关联历史会话
      deviceInfo: { // 可选：设备信息
        model: 'X10 Pro',
        errorCode: 'E04'
      }
    },
    // onMessage: 收到消息片段
    (event: AIChatStreamEvent) => {
      if (event.event === 'message' && event.answer) {
        fullAnswer += event.answer;
        console.log('收到消息片段:', event.answer);
        
        // 更新 UI 显示
        updateChatUI(fullAnswer);
      }
      
      if (event.event === 'message_end') {
        conversationId = event.conversation_id || '';
        console.log('消息完成，会话ID:', conversationId);
        console.log('完整回答:', fullAnswer);
        
        // 可以获取检索到的知识库资源
        if (event.metadata?.retriever_resources) {
          console.log('相关知识库:', event.metadata.retriever_resources);
        }
      }
    },
    // onError: 错误处理
    (error: Error) => {
      console.error('AI 对话错误:', error);
    },
    // onComplete: 流式传输完成
    () => {
      console.log('流式传输完成');
    }
  );

  // 如需取消请求
  // cancelFn();
};

// UI 更新函数示例
const updateChatUI = (message: string) => {
  // 更新界面显示的消息
  // setMessages([...messages, { role: 'assistant', content: message }]);
};
```

### 2.2 获取历史会话列表

```typescript
import { getConversations } from '@/services/api';

const fetchConversationHistory = async () => {
  try {
    const conversations = await getConversations();
    console.log('历史会话:', conversations);
    
    // conversations 是一个数组，每项包含:
    // - id: 会话ID
    // - title: 会话标题
    // - messageCount: 消息数量
    // - updatedAt: 最后更新时间
    
    conversations.forEach(conv => {
      console.log(`${conv.title} (${conv.messageCount}条消息)`);
    });
  } catch (error) {
    console.error('获取会话历史失败:', error);
  }
};
```

### 2.3 获取单次会话详情

```typescript
import { getConversationDetail } from '@/services/api';

const fetchConversationMessages = async (conversationId: string) => {
  try {
    const detail = await getConversationDetail(conversationId);
    console.log('会话详情:', detail);
    
    // detail.messages 是消息数组，每条消息包含:
    // - role: 'user' | 'assistant'
    // - content: 消息内容
    // - timestamp: 时间戳
    
    detail.messages.forEach(msg => {
      console.log(`[${msg.role}] ${msg.content}`);
    });
  } catch (error) {
    console.error('获取会话详情失败:', error);
  }
};
```

## 3. 在 React 组件中使用示例

### 3.1 工单列表组件

```typescript
import React, { useEffect, useState } from 'react';
import { getTickets, TicketListItem } from '@/services/api';

export function TicketList() {
  const [tickets, setTickets] = useState<TicketListItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const data = await getTickets();
      setTickets(data);
    } catch (error) {
      console.error('加载工单失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loading ? (
        <div>加载中...</div>
      ) : (
        <ul>
          {tickets.map(ticket => (
            <li key={ticket.ticketId}>
              {ticket.title} - {ticket.status}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### 3.2 AI 聊天组件

```typescript
import React, { useState } from 'react';
import { sendAIMessage } from '@/services/api';

export function AIChat() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([]);
  const [loading, setLoading] = useState(false);

  const handleSend = () => {
    if (!message.trim()) return;

    // 添加用户消息
    setMessages(prev => [...prev, { role: 'user', content: message }]);
    setLoading(true);

    let aiResponse = '';

    sendAIMessage(
      { query: message },
      (event) => {
        if (event.event === 'message' && event.answer) {
          aiResponse += event.answer;
          // 实时更新 AI 回复
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMsg = newMessages[newMessages.length - 1];
            if (lastMsg?.role === 'assistant') {
              lastMsg.content = aiResponse;
            } else {
              newMessages.push({ role: 'assistant', content: aiResponse });
            }
            return newMessages;
          });
        }
      },
      (error) => {
        console.error('AI 错误:', error);
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );

    setMessage('');
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
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        disabled={loading}
      />
      <button onClick={handleSend} disabled={loading}>
        发送
      </button>
    </div>
  );
}
```

## 4. TypeScript 类型定义

所有 API 都有完整的 TypeScript 类型定义：

- `TicketStatus`: 工单状态类型
- `TicketPriority`: 工单优先级类型
- `CreateTicketParams`: 创建工单参数
- `TicketListItem`: 工单列表项
- `TicketDetail`: 工单详情
- `UpdateTicketParams`: 更新工单参数
- `AIChatParams`: AI 对话参数
- `AIChatStreamEvent`: AI 流式响应事件
- `Conversation`: 会话信息
- `ConversationDetail`: 会话详情

使用 TypeScript 可以获得完整的类型提示和检查。
