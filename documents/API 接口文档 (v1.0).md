根据您提供的技术架构（Flutter + Java + Dify）以及详细的页面设计报告，我为您制定了这份详尽的 API 接口设计文档。

---

# 售后支持系统 API 接口文档 (v1.0)

## 0. 接口规范
- **Base Path:** `/api/cleaner-support/v1`
- **请求头:** `Authorization: Bearer <token>`, `Content-Type: application/json`
- **通用响应结构:**
```json
{
  "code": 200,          // 200-成功, 400-业务错误, 401-未登录, 500-服务器错误
  "message": "操作成功", // 提示信息
  "data": {}            // 具体业务数据
}
```

---

## 1. 用户与认证接口

### 1.1 用户登录
- **描述:** 支持手机号与密码或验证码登录。
- **请求路径:** `POST /users/login`
- **请求参数:**
```json
{
  "username": "13800138000",
  "password": "hashed_password",
  "loginType": "sms" 
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

---

## 2. 设备管理接口 (Device Management)

### 2.1 获取设备实时状态
- **描述:** 首页展示的核心数据，包括电量、工作状态、水箱等。
- **请求路径:** `GET /devices/status`
- **响应示例:**
```json
{
  "code": 200,
  "data": {
    "deviceId": "SN202401150001",
    "deviceName": "客厅的扫地僧 X10",
    "onlineStatus": true,
    "workStatus": "cleaning", // cleaning-清扫中, recharging-回充, standby-待机, error-故障
    "battery": 85,
    "areaCovered": 45.2,
    "duration": 35,
    "cleanWaterLevel": 90,
    "dirtyWaterLevel": 15,
    "hasError": false,
    "errorCode": ""
  }
}
```

### 2.2 发送设备控制指令
- **描述:** 控制机器人动作。
- **请求路径:** `POST /devices/control`
- **请求参数:**
```json
{
  "command": "START", // START, PAUSE, DOCK(回充), FIND(寻找)
  "deviceId": "SN202401150001"
}
```
- **响应示例:**
```json
{ "code": 200, "message": "指令已下发" }
```

### 2.3 获取耗材状态
- **描述:** “我的”页面耗材管理数据。
- **请求路径:** `GET /devices/consumables`
- **响应示例:**
```json
{
  "code": 200,
  "data": [
    { "name": "主刷", "remaining": 68, "type": "main_brush" },
    { "name": "边刷", "remaining": 42, "type": "side_brush" },
    { "name": "滤网", "remaining": 15, "type": "filter" }
  ]
}
```

---

## 3. AI 智能问答接口 (Dify 桥接)

### 3.1 发送 AI 对话消息 (支持流式)
- **描述:** 前端发送消息给 Java 后端，后端透传给 Dify。
- **请求路径:** `POST /ai/chat`
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
- **响应示例 (Java 后端作为 SSE 转发 Dify 的响应):**
```text
data: {"event": "message", "answer": "检测到您的机器人报...", "conversation_id": "conv_123"}
data: {"event": "message_end", "metadata": {"retriever_resources": [...]}}
```

### 3.2 获取历史会话列表
- **描述:** 问答页面的历史记录视图。
- **请求路径:** `GET /ai/conversations`
- **响应示例:**
```json
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

---

## 4. 知识库接口 (Knowledge Base)

### 4.1 搜索/获取知识库列表
- **描述:** 根据分类或关键词获取文档。
- **请求路径:** `GET /knowledge/articles`
- **查询参数:** `category=maintenance`, `query=传感器`
- **响应示例:**
```json
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

### 4.2 获取知识库详情
- **描述:** 获取具体 Markdown 内容或视频地址。
- **请求路径:** `GET /knowledge/articles/{id}`
- **响应示例:**
```json
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

---

## 5. 工单管理接口 (Tickets)

### 5.1 创建服务工单
- **描述:** 由 AI 引导或手动创建。
- **请求路径:** `POST /tickets`
- **请求参数:**
```json
{
  "title": "传感器持续报错",
  "description": "已清理但无效，需报修",
  "priority": "medium", // low, medium, high
  "relatedChatId": "conv_123", // 关联对话记录
  "attachmentUrls": ["https://..."]
}
```
- **响应示例:**
```json
{
  "code": 200,
  "data": { "ticketId": "WO20240120001", "status": "pending" }
}
```

### 5.2 获取工单列表
- **描述:** 工单页面展示用。
- **请求路径:** `GET /tickets`
- **查询参数:** `status=processing`
- **响应示例:**
```json
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

---

## 6. 清洁统计接口 (Statistics)

### 6.1 获取清洁统计数据
- **描述:** 个人中心展示统计图表。
- **请求路径:** `GET /stats/cleaning/summary`
- **查询参数:** `range=week` // week, month
- **响应示例:**
```json
{
  "code": 200,
  "data": {
    "totalTimes": 14,
    "totalArea": 542,
    "totalDuration": 510,
    "chartData": [
      { "date": "周一", "value": 45 },
      { "date": "周二", "value": 52 }
    ]
  }
}
```

### 6.2 获取清洁日志
- **描述:** 个人中心查看详细记录。
- **请求路径:** `GET /stats/cleaning/logs`
- **响应示例:**
```json
{
  "code": 200,
  "data": [
    {
      "id": "log_99",
      "date": "1月15日",
      "area": 52,
      "duration": 42,
      "mapSnapshot": "https://..."
    }
  ]
}
```

---

## 7. 文件上传接口 (Media)

### 7.1 上传图片/视频
- **描述:** 问答发送图片或工单附件。
- **请求路径:** `POST /media/upload`
- **请求格式:** `multipart/form-data`
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

















## 第二部分：McpController (面向 Dify AI 助手)

**设计原则**：遵循 MCP 协议标准，强化**字段描述 (Description)**，方便 LLM 理解意图并进行逻辑推理。

### 1. 用户上下文信息工具 (get_user_info)

- **描述**：供 AI 了解当前提问者的身份、名下资产概况，以便提供个性化话术。
- **MCP 工具名称**：get_user_info
- **响应示例**：

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

- **描述**：当用户问及保修、版本、型号参数时，AI 调用此工具。
- **MCP 工具名称**：get_robot_hardware_profile
- **请求参数**：{"deviceId": "SN123"}
- **响应示例**：

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

- **描述**：AI 诊断问题的核心工具。包含电量、错误码、传感器状态、耗材寿命。
- **MCP 工具名称**：get_robot_realtime_telemetry
- **请求参数**：{"deviceId": "SN123"}
- **响应示例**：

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