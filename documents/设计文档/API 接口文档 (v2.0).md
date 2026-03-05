# 修改后的售后支持系统 API 接口文档 (v2.0)

## 0. 接口规范

- **Base Path:** `/api/cleaner-support/v2`（除 MCP 接口外）
- **请求头:** `Authorization: Bearer <token>`（需登录接口）, `Content-Type: application/json`
- **通用响应结构:**

```
{
  "code": 200,          // 200-成功, 400-业务错误, 401-未登录, 500-服务器错误, 501-未实现
  "message": "操作成功", // 提示信息
  "data": {}            // 具体业务数据
}
```

------

## 1. 用户与认证接口

### 1.1 用户注册

- **请求方法:** POST
- **请求路径:** `/users/register`
- **请求参数:**

```json
{
  "phone": "13800138000",
  "password": "hashed_password",
  "nickname": "张先生"
}
```

- **响应示例:**

```json
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

### 1.2 用户登录

- **请求方法:** POST
- **请求路径:** `/users/login`
- **请求参数:**

```json
{
  "username": "13800138000",
  "password": "hashed_password",
  "loginType": "password"
}
```

- **loginType:** `password` 或 `sms`
- **响应示例:**

```json
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

### 1.3 用户信息查询

- **请求方法:** GET
- **请求路径:** `/users/profile`
- **请求头:** `Authorization: Bearer <token>`
- **响应示例:**

```json
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

### 1.4 用户信息更新

- **请求方法:** PUT
- **请求路径:** `/users/profile`
- **请求头:** `Authorization: Bearer <token>`
- **请求参数:**

```json
{
  "nickname": "新昵称",
  "avatar": "https://cdn.com/new_avatar.jpg"
}
```

- **响应示例:**

```json
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
- **请求头:** `Authorization: Bearer <token>`
- **Content-Type:** `application/json`
- **Accept:** `text/event-stream`（SSE 流式响应）
- **请求参数:**

```json
{
  "query": "主刷卷入地毯了怎么办？",
  "conversationId": "可选，用于关联历史会话",
  "deviceInfo": {
    "model": "X10 Pro",
    "errorCode": "E04"
  }
}
```

- **响应:** SSE 流式，Java 后端转发 Dify 的响应

```
data: {"event": "message", "answer": "检测到您的机器人报...", "conversation_id": "conv_123"}
data: {"event": "message_end", "metadata": {"retriever_resources": [...]}}
```

### 2.2 基于图片识别结果进行 AI 对话

- **请求方法:** POST
- **请求路径:** `/ai/chat/with-image`
- **请求头:** `Authorization: Bearer <token>`
- **Accept:** `text/event-stream`（SSE 流式响应）
- **请求参数:**

```json
{
  "recognitionId": "图片识别记录ID（必填）",
  "query": "用户问题（可选，不提供则只基于图片描述）",
  "conversationId": "会话ID（可选，用于关联历史会话）"
}
```

- **响应:** 同 2.1，SSE 流式

### 2.3 获取历史会话列表

- **请求方法:** GET
- **请求路径:** `/ai/conversations`
- **请求头:** `Authorization: Bearer <token>`
- **响应示例:**

```json
{
  "code": 200,
  "data": [
    {
      "id": "conv_123",
      "title": "如何清理主刷？",
      "messageCount": 4,
      "updatedAt": "2024-01-20T14:30:00"
    }
  ]
}
```

### 2.4 获取会话详情

- **请求方法:** GET
- **请求路径:** `/ai/conversations/{conversationId}`
- **请求头:** `Authorization: Bearer <token>`
- **响应示例:**

```json
{
  "code": 200,
  "data": {
    "id": "conv_123",
    "messages": [
      {
        "role": "user",
        "content": "主刷卷入地毯了怎么办？",
        "timestamp": "2024-01-20T14:30:00",
        "recognitionId": null,
        "mediaFileId": null,
        "imageUrl": null
      },
      {
        "role": "assistant",
        "content": "检测到您的机器人报...",
        "timestamp": "2024-01-20T14:31:00",
        "recognitionId": null,
        "mediaFileId": null,
        "imageUrl": null
      }
    ]
  }
}
```

- **MessageResponse 字段说明:**
  - `recognitionId`: 关联的图片识别记录ID（消息包含图片时）
  - `mediaFileId`: 关联的媒体文件业务ID，可调用媒体文件接口获取图片
  - `imageUrl`: 图片URL，可直接展示

------

## 3. 工单管理接口 (Tickets)

### 3.1 创建服务工单

- **请求方法:** POST
- **请求路径:** `/tickets`
- **请求头:** `Authorization: Bearer <token>`
- **请求参数:**

```json
{
  "title": "传感器持续报错",
  "description": "已清理但无效，需报修",
  "priority": "medium",
  "relatedChatId": "conv_123",
  "attachmentUrls": ["https://..."]
}
```

- **priority:** `low`, `medium`, `high`（默认 medium）
- **响应示例:**

```json
{
  "code": 200,
  "data": {
    "ticketId": "WO20240120001",
    "title": "传感器故障",
    "status": "pending",
    "priority": "high",
    "createdAt": "2024-01-20T10:00:00",
    "engineerName": null,
    "estimatedTime": null
  }
}
```

### 3.2 获取工单列表

- **请求方法:** GET
- **请求路径:** `/tickets`
- **请求头:** `Authorization: Bearer <token>`
- **查询参数:** `status`（可选）如 `processing`
- **响应示例:**

```json
{
  "code": 200,
  "data": [
    {
      "ticketId": "WO20240120001",
      "title": "传感器故障",
      "status": "processing",
      "priority": "high",
      "createdAt": "2024-01-20T10:00:00",
      "engineerName": "李师傅",
      "estimatedTime": "2小时内"
    }
  ]
}
```

### 3.3 获取工单详情

- **请求方法:** GET
- **请求路径:** `/tickets/{ticketId}`
- **请求头:** `Authorization: Bearer <token>`
- **响应示例:**

```json
{
  "code": 200,
  "data": {
    "ticketId": "WO20240120001",
    "title": "传感器故障",
    "description": "已清理但无效，需报修",
    "status": "processing",
    "priority": "high",
    "createdAt": "2024-01-20T10:00:00",
    "updatedAt": "2024-01-20T11:00:00",
    "engineerName": "李师傅",
    "estimatedTime": "2小时内",
    "attachments": ["https://..."],
    "comments": "问题已解决"
  }
}
```

### 3.4 更新工单状态

- **请求方法:** PUT
- **请求路径:** `/tickets/{ticketId}`
- **请求头:** `Authorization: Bearer <token>`
- **请求参数:**

```json
{
  "status": "completed",
  "comments": "问题已解决"
}
```

- **响应示例:**

```json
{
  "code": 200,
  "message": "工单状态更新成功"
}
```

------

## 4. 媒体文件/知识文档接口 (Media)

### 4.1 图片识别上传的图片展示

- **请求方法:** GET
- **请求路径:** `/media/images/{filename}`
- **说明:** 当前会话与历史会话均使用此 URL 展示图片
- **响应:** 图片二进制流（Content-Type: image/jpeg | image/png | image/gif | image/webp）

### 4.2 搜索/获取媒体文件列表

- **请求方法:** GET
- **请求路径:** `/media/files`
- **查询参数:** `category`（可选）, `query`（可选）
- **响应示例:**

```json
{
  "code": 200,
  "data": [
    {
      "id": "KB001",
      "title": "传感器清洁维护指南",
      "type": "Article",
      "coverUrl": "https://..."
    }
  ]
}
```

### 4.3 获取媒体文件详情

- **请求方法:** GET
- **请求路径:** `/media/files/{id}`
- **响应示例:**

```json
{
  "code": 200,
  "data": {
    "id": "KB001",
    "mediaUrl": "https://...",
    "previewUrl": "https://...",
    "downloadUrl": "https://...",
    "isViewable": true
  }
}
```

### 4.4 获取文件访问信息（预览链接和下载链接）

- **请求方法:** GET
- **请求路径:** `/media/files/{id}/access`
- **响应示例:**

```json
{
  "code": 200,
  "data": {
    "fileId": "KB001",
    "title": "传感器清洁维护指南",
    "isViewable": true,
    "previewUrl": "https://...",
    "downloadUrl": "https://...",
    "repoToken": "xxx"
  }
}
```

### 4.5 获取文件下载链接（供前端重定向）

- **请求方法:** GET
- **请求路径:** `/media/files/{id}/download`
- **响应示例:**

```json
{
  "code": 200,
  "data": {
    "url": "https://...",
    "repoToken": "xxx",
    "title": "传感器清洁维护指南",
    "isPreview": false
  }
}
```

### 4.6 获取文件二进制内容

- **请求方法:** GET
- **请求路径:** `/media/files/{id}/content`
- **说明:** 用于前端带鉴权请求后直接展示（如历史消息中的图片）
- **响应:** 图片二进制流（Content-Type: image/jpeg | image/png | image/gif | image/webp）

### 4.7 获取文件预览链接（供前端重定向）

- **请求方法:** GET
- **请求路径:** `/media/files/{id}/preview`
- **响应示例:**

```json
{
  "code": 200,
  "data": {
    "url": "https://...",
    "repoToken": "xxx",
    "title": "传感器清洁维护指南",
    "isPreview": true
  }
}
```

### 4.8 上传媒体文件

- **请求方法:** POST
- **请求路径:** `/media/upload`
- **请求格式:** `multipart/form-data`
- **表单字段:** `file`（MultipartFile）
- **响应示例:**

```json
{
  "code": 200,
  "data": {
    "url": "https://your-oss.com/path/to/image.jpg",
    "fileType": "image"
  }
}
```

------

## 5. 图片识别接口 (Image Recognition)

### 5.1 上传图片并识别

- **请求方法:** POST
- **请求路径:** `/image-reco`
- **请求头:** `Authorization: Bearer <token>`
- **请求格式:** `multipart/form-data`
- **表单字段:** `image`（MultipartFile）
- **响应示例:**

```json
{
  "code": 200,
  "data": {
    "recognitionId": "IR001",
    "imageUrl": "/api/cleaner-support/v2/media/images/xxx.jpg",
    "description": "AI 识别的图片描述",
    "status": "success",
    "createdAt": "2024-01-20T14:30:00"
  }
}
```

### 5.2 Base64 上传并识别

- **请求方法:** POST
- **请求路径:** `/image-reco/base64`
- **请求头:** `Authorization: Bearer <token>`
- **请求参数:**（便于联调/自动化测试）

```json
{
  "base64": "iVBORw0KGgo...",
  "format": "png"
}
```

- **base64:** 支持纯 base64 或 data URI（`data:image/png;base64,xxxx`）
- **format:** 图片格式（png/jpg/jpeg/webp），若传 data URI 可不填
- **响应:** 同 5.1

### 5.3 获取图片识别历史

- **请求方法:** GET
- **请求路径:** `/image-reco/history`
- **请求头:** `Authorization: Bearer <token>`
- **查询参数:** `status`（可选）, `page`（默认 1）, `size`（默认 10）
- **响应示例:**

```json
{
  "code": 200,
  "data": {
    "total": 20,
    "page": 1,
    "size": 10,
    "items": [
      {
        "recognitionId": "IR001",
        "imageUrl": "/api/cleaner-support/v2/media/images/xxx.jpg",
        "description": "AI 识别的图片描述",
        "status": "success",
        "createdAt": "2024-01-20T14:30:00"
      }
    ]
  }
}
```

------

## 第二部分：McpController (面向 Dify AI 助手)

**Base Path:** `/mcp`（不包含在 `/api/cleaner-support/v2` 下）

**说明:** MCP 接口不需要登录认证，当前均返回 `501 Not Implemented`。

### 1. 用户上下文信息工具 (get_user_info)

- **描述:** 供 AI 了解当前提问者的身份、名下资产概况，以便提供个性化话术。
- **请求方法:** POST
- **请求路径:** `/mcp/get_user_info`
- **请求体:** 可选，`Map<String, Object>`
- **当前状态:** 501 未实现

### 2. 机器人基础档案查询 (get_robot_hardware_profile)

- **描述:** 当用户问及保修、版本、型号参数时，AI 调用此工具。
- **请求方法:** POST
- **请求路径:** `/mcp/get_robot_hardware_profile`
- **请求参数:** `{"deviceId": "SN123"}`
- **当前状态:** 501 未实现

### 3. 机器人实时运行参数诊断 (get_robot_realtime_telemetry)

- **描述:** AI 诊断问题的核心工具。包含电量、错误码、传感器状态、耗材寿命。
- **请求方法:** POST
- **请求路径:** `/mcp/get_robot_realtime_telemetry`
- **请求参数:** `{"deviceId": "SN123"}`
- **当前状态:** 501 未实现
