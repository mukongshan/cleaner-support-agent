# 修改后的售后支持系统 API 接口文档 (v2.0)

## 0. 接口规范

- **Base Path:** `/api/cleaner-support/v2`
- **请求头:** `Authorization: Bearer <token>`, `Content-Type: application/json`
- **通用响应结构:**

```
{
  "code": 200,          // 200-成功, 400-业务错误, 401-未登录, 500-服务器错误
  "message": "操作成功", // 提示信息
  "data": {}            // 具体业务数据
}
```

------

## 1. 用户与认证接口

### 1.1 用户登录

- **请求方法:** POST
- **请求路径:** `/users/login`
- **请求参数:**

```
{
  "username": "13800138000",
  "password": "hashed_password",
  "loginType": "sms" 
}
```

- **响应示例:**

```
{
  "code": 200,
  "data": {
    "token": "eyJhbGciOiJIUzI1Ni...",
    "userId": "U12345",
    "nickname": "张先生",
    "avatar": "https://cdn.com/avatar.jpg"
  }
}
```

### 1.2 用户信息查询

- **请求方法:** GET
- **请求路径:** `/users/profile`
- **请求头:** `Authorization: Bearer <token>`
- **响应示例:**

```
{
  "code": 200,
  "data": {
    "userId": "U12345",
    "nickname": "张先生",
    "avatar": "https://cdn.com/avatar.jpg",
    "phone": "13800138000",
    "memberTag": "高级用户"
  }
}
```

### 1.3 用户信息更新

- **请求方法:** PUT
- **请求路径:** `/users/profile`
- **请求头:** `Authorization: Bearer <token>`
- **请求参数:**

```
{
  "nickname": "新昵称",
  "avatar": "https://cdn.com/new_avatar.jpg"
}
```

- **响应示例:**

```
{
  "code": 200,
  "message": "用户信息更新成功"
}
```

------

## 2. AI 智能问答接口 (Dify 桥接)

### 2.1 发送 AI 对话消息 (支持流式)

- **请求方法:** POST
- **请求路径:** `/ai/chat`
- **请求参数:**（存疑，如果不提供机器数据，就只能提供用户问题）

```
{
  "query": "主刷卷入地毯了怎么办？",
  "conversationId": "可选，用于关联历史会话",
  "deviceInfo": {
    "model": "X10 Pro",
    "errorCode": "E04"
  }
}
```

- **响应示例 (Java 后端作为 SSE 转发 Dify 的响应):**

```
data: {"event": "message", "answer": "检测到您的机器人报...", "conversation_id": "conv_123"}
data: {"event": "message_end", "metadata": {"retriever_resources": [...]}}
```

### 2.2 获取历史会话列表

- **请求方法:** GET
- **请求路径:** `/ai/conversations`
- **响应示例:**

```
{
  "code": 200,
  "data": [
    {
      "id": "conv_123",
      "title": "如何清理主刷？",
      "messageCount": 4,
      "updatedAt": "2024-01-20 14:30"
    }
  ]
}
```

### 2.3 获取会话详情

- **请求方法:** GET
- **请求路径:** `/ai/conversations/{conversationId}`
- **响应示例:**

```
{
  "code": 200,
  "data": {
    "id": "conv_123",
    "messages": [
      {
        "role": "user",
        "content": "主刷卷入地毯了怎么办？",
        "timestamp": "2024-01-20 14:30"
      },
      {
        "role": "assistant",
        "content": "检测到您的机器人报...",
        "timestamp": "2024-01-20 14:31"
      }
    ]
  }
}
```

------

## 3. 工单管理接口 (Tickets)

### 3.1 创建服务工单

- **请求方法:** POST
- **请求路径:** `/tickets`
- **请求参数:**

```
{
  "title": "传感器持续报错",
  "description": "已清理但无效，需报修",
  "priority": "medium", // low, medium, high
  "relatedChatId": "conv_123", // 关联对话记录
  "attachmentUrls": ["https://..."]
}
```

- **响应示例:**

```
{
  "code": 200,
  "data": { "ticketId": "WO20240120001", "status": "pending" }
}
```

### 3.2 获取工单列表

- **请求方法:** GET
- **请求路径:** `/tickets`
- **查询参数:** `status=processing`
- **响应示例:**

```
{
  "code": 200,
  "data": [
    {
      "ticketId": "WO20240120001",
      "title": "传感器故障",
      "status": "processing", // pending, processing, completed, cancelled
      "priority": "high",
      "createdAt": "2024-01-20 10:00",
      "engineerName": "李师傅",
      "estimatedTime": "2小时内"
    }
  ]
}
```

### 3.3 获取工单详情

- **请求方法:** GET
- **请求路径:** `/tickets/{ticketId}`
- **响应示例:**

```
{
  "code": 200,
  "data": {
    "ticketId": "WO20240120001",
    "title": "传感器故障",
    "description": "已清理但无效，需报修",
    "status": "processing",
    "priority": "high",
    "createdAt": "2024-01-20 10:00",
    "updatedAt": "2024-01-20 11:00",
    "engineerName": "李师傅",
    "estimatedTime": "2小时内",
    "attachments": ["https://..."]
  }
}
```

### 3.4 更新工单状态

- **请求方法:** PUT
- **请求路径:** `/tickets/{ticketId}`
- **请求参数:**

```
{
  "status": "completed",
  "comments": "问题已解决"
}
```

- **响应示例:**

```
{
  "code": 200,
  "message": "工单状态更新成功"
}
```

------

## 4. 媒体文件/知识文档接口 (Media / Knowledge Files)

### 4.1 搜索/获取媒体文件列表

- **请求方法:** GET
- **请求路径:** `/media/files`
- **查询参数:** `category=maintenance`, `query=传感器`
- **响应示例:**

```
{
  "code": 200,
  "data": [
    {
      "id": "KB001",
      "title": "传感器清洁维护指南",
      "summary": "定期清洁下视传感器可防止防跌落功能失效...",
      "type": "Article", // Article, Video, PDF
      "coverUrl": "https://...",
      "duration": "03:45" // 视频类特有
    }
  ]
}
```

### 4.2 获取媒体文件详情/下载信息

- **请求方法:** GET
- **请求路径:** `/media/files/{id}`
- **响应示例:**

```
{
  "code": 200,
  "data": {
    "id": "KB001",
    "content": "# 维护指南\n1. 请使用柔软干布...",
    "mediaUrl": "https://...",
    "relateProducts": ["X10", "X20"]
  }
}
```

### 4.3 上传媒体文件

- **请求方法:** POST
- **请求路径:** `/media/upload`
- **请求格式:** `multipart/form-data`
- **响应示例:**

```
{
  "code": 200,
  "data": {
    "url": "https://your-oss.com/path/to/image.jpg",
    "fileType": "image"
  }
}
```

------

## 5. 文件上传接口 (Media)

### 5.1 上传图片/视频

- **请求方法:** POST
- **请求路径:** `/media/upload`
- **请求格式:** `multipart/form-data`
- **响应示例:**

```
{
  "code": 200,
  "data": {
    "url": "https://your-oss.com/path/to/image.jpg",
    "fileType": "image"
  }
}
```





## 第二部分：McpController (面向 Dify AI 助手)

**设计原则**：遵循 MCP 协议标准，强化**字段描述 (Description)**，方便 LLM 理解意图并进行逻辑推理。

### 1. 用户上下文信息工具 (get_user_info)

- 

  **描述**：供 AI 了解当前提问者的身份、名下资产概况，以便提供个性化话术。

- 

  **MCP 工具名称**：get_user_info

- 

  **响应示例**：

codeJSON

```
{
  "user_profile": {
    "name": "张先生",
    "phone_suffix": "8888",
    "member_tag": "高级用户",
    "devices": [
      {"sn": "SN202401150001", "model": "X10 Pro", "nickname": "客厅小助手"}
    ]
  },
  "context": "该用户近期有2次关于‘回充失败’的咨询记录"
}
```

### 2. 机器人基础档案查询 (get_robot_hardware_profile)

- 

  **描述**：当用户问及保修、版本、型号参数时，AI 调用此工具。

- 

  **MCP 工具名称**：get_robot_hardware_profile

- 

  **请求参数**：{"deviceId": "SN123"}

- 

  **响应示例**：

codeJSON

```
{
  "model_info": {
    "brand": "RobotMaster",
    "model_name": "扫地僧 X10 Pro",
    "firmware": "v2.3.5",
    "is_latest": false,
    "new_version": "v2.4.0"
  },
  "warranty": {
    "status": "in_warranty",
    "expire_date": "2025-01-15",
    "remaining_days": 345
  }
}
```

### 3. 机器人实时运行参数诊断 (get_robot_realtime_telemetry)

- 

  **描述**：AI 诊断问题的核心工具。包含电量、错误码、传感器状态、耗材寿命。

- 

  **MCP 工具名称**：get_robot_realtime_telemetry

- 

  **请求参数**：{"deviceId": "SN123"}

- 

  **响应示例**：

codeJSON

```
{
  "realtime_status": {
    "battery": 15,
    "work_mode": "fault",
    "error_code": "E01",
    "error_description": "左轮堵塞或缠绕异物",
    "wifi_rssi": -65
  },
  "consumables_status": {
    "main_brush": "12% (建议更换)",
    "side_brush": "45%",
    "filter_mesh": "5% (极低，可能导致吸力变小)"
  },
  "sensors": {
    "lidar": "healthy",
    "cliff_sensors": "dirty (需要擦拭)"
  }
}
```

