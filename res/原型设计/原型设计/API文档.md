# 售后问答机器人系统 API 文档

## 文档说明

本文档描述了售后问答机器人系统的所有后端API接口。所有接口采用RESTful风格设计，使用JSON格式进行数据交换。

**基础信息：**
- **API版本：** v1
- **基础URL：** `https://api.example.com/v1`
- **数据格式：** JSON
- **字符编码：** UTF-8

---

## 目录

1. [通用说明](#通用说明)
2. [认证授权](#认证授权)
3. [设备管理](#设备管理)
4. [智能问答](#智能问答)
5. [知识库](#知识库)
6. [工单管理](#工单管理)
7. [用户信息](#用户信息)
8. [错误码说明](#错误码说明)

---

## 通用说明

### 请求头

所有API请求必须包含以下请求头：

```
Content-Type: application/json
Authorization: Bearer {token}
X-Device-ID: {device_id}  // 设备ID（可选，用于设备相关接口）
```

### 响应格式

所有API响应遵循统一格式：

**成功响应：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    // 具体数据
  },
  "timestamp": 1705123456789
}
```

**错误响应：**
```json
{
  "code": 400,
  "message": "错误描述",
  "data": null,
  "timestamp": 1705123456789
}
```

### 分页参数

列表接口支持分页，通用分页参数：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | integer | 否 | 页码，从1开始，默认1 |
| page_size | integer | 否 | 每页数量，默认20，最大100 |

分页响应格式：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total": 100,
      "total_pages": 5
    }
  }
}
```

---

## 认证授权

### 1. 用户登录

**接口地址：** `POST /auth/login`

**请求参数：**
```json
{
  "phone": "13800138000",
  "code": "123456"  // 验证码，或使用密码
}
```

**响应数据：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user_123",
      "name": "张先生",
      "phone": "138****8888",
      "avatar": "https://example.com/avatar.jpg"
    },
    "expires_in": 7200  // token过期时间（秒）
  }
}
```

### 2. 获取验证码

**接口地址：** `POST /auth/send-code`

**请求参数：**
```json
{
  "phone": "13800138000",
  "type": "login"  // login | reset_password
}
```

**响应数据：**
```json
{
  "code": 200,
  "message": "验证码已发送",
  "data": {
    "expires_in": 300  // 验证码有效期（秒）
  }
}
```

### 3. 刷新Token

**接口地址：** `POST /auth/refresh`

**请求头：**
```
Authorization: Bearer {refresh_token}
```

**响应数据：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 7200
  }
}
```

### 4. 用户登出

**接口地址：** `POST /auth/logout`

**响应数据：**
```json
{
  "code": 200,
  "message": "登出成功",
  "data": null
}
```

---

## 设备管理

### 1. 获取设备列表

**接口地址：** `GET /devices`

**响应数据：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "devices": [
      {
        "id": "device_123",
        "name": "客厅的扫地僧 X10",
        "model": "扫地僧 X10 Pro",
        "sn": "SN202401150001",
        "status": "standby",  // cleaning | charging | standby | error
        "is_online": true,
        "wifi_strength": 4,  // 1-4
        "battery": 85,  // 0-100
        "last_online_at": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

### 2. 获取设备详情

**接口地址：** `GET /devices/{device_id}`

**路径参数：**
- `device_id`: 设备ID

**响应数据：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "device_123",
    "name": "客厅的扫地僧 X10",
    "model": "扫地僧 X10 Pro",
    "sn": "SN202401150001",
    "status": "standby",
    "is_online": true,
    "wifi_strength": 4,
    "battery": 85,
    "estimated_remaining_area": 45,  // 预计可清扫面积（平方米）
    "cleaned_area_today": 45.8,  // 今日清扫面积
    "cleaned_time_today": 38,  // 今日清扫时长（分钟）
    "clean_water_level": 75,  // 清水箱水位 0-100
    "dirty_water_level": 45,  // 污水箱水位 0-100
    "error_info": {  // 故障信息（仅故障状态时返回）
      "code": "ERROR_001",
      "message": "悬空传感器异常",
      "occurred_at": "2024-01-15T10:25:00Z"
    },
    "last_online_at": "2024-01-15T10:30:00Z",
    "firmware_version": "v2.3.5"
  }
}
```

### 3. 控制设备

**接口地址：** `POST /devices/{device_id}/control`

**路径参数：**
- `device_id`: 设备ID

**请求参数：**
```json
{
  "action": "start"  // start | pause | return_charge | locate
}
```

**参数说明：**
- `start`: 开始清扫
- `pause`: 暂停清扫
- `return_charge`: 返回充电
- `locate`: 寻找设备（发出声音）

**响应数据：**
```json
{
  "code": 200,
  "message": "指令已发送",
  "data": {
    "command_id": "cmd_123",
    "status": "pending",  // pending | executing | completed | failed
    "estimated_time": 5  // 预计执行时间（秒）
  }
}
```

### 4. 获取设备实时状态（WebSocket）

**接口地址：** `WS /devices/{device_id}/status`

**连接参数：**
- `token`: 认证token（通过query参数或header传递）

**消息格式：**

客户端订阅：
```json
{
  "type": "subscribe",
  "device_id": "device_123"
}
```

服务端推送：
```json
{
  "type": "status_update",
  "device_id": "device_123",
  "data": {
    "status": "cleaning",
    "battery": 84,
    "cleaned_area": 46.5,
    "clean_water_level": 74,
    "dirty_water_level": 46,
    "timestamp": "2024-01-15T10:31:00Z"
  }
}
```

### 5. 设备状态统计

**接口地址：** `GET /devices/{device_id}/stats`

**查询参数：**
- `period`: 统计周期，`today` | `week` | `month`，默认`today`

**响应数据：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "period": "today",
    "total_cleaned_area": 45.8,  // 总清扫面积（平方米）
    "total_cleaned_time": 38,  // 总清扫时长（分钟）
    "cleaning_count": 2,  // 清扫次数
    "average_area_per_clean": 22.9,  // 平均每次清扫面积
    "battery_usage": 15  // 电池消耗百分比
  }
}
```

---

## 智能问答

### 1. 发送消息

**接口地址：** `POST /chat/messages`

**请求参数：**
```json
{
  "content": "如何清理主刷？",
  "chat_id": "chat_123",  // 可选，如果为空则创建新对话
  "images": [  // 可选，图片URL数组（需要先上传图片）
    "https://example.com/image1.jpg"
  ],
  "device_id": "device_123"  // 可选，关联设备ID
}
```

**响应数据：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "message_id": "msg_123",
    "chat_id": "chat_123",
    "user_message": {
      "id": "msg_user_123",
      "type": "user",
      "content": "如何清理主刷？",
      "timestamp": "2024-01-15T10:30:00Z"
    },
    "ai_message": {
      "id": "msg_ai_123",
      "type": "ai",
      "content": "清理主刷的步骤如下：\n\n1. 关闭机器人电源\n2. 翻转机器人，找到主刷盖板\n...",
      "timestamp": "2024-01-15T10:30:05Z",
      "citation": {
        "title": "用户手册 - 维护保养",
        "page": "P.23-25",
        "url": "https://example.com/knowledge/article_123"
      },
      "thinking_steps": [  // AI思考步骤（可选）
        "正在识别故障码...",
        "正在查询维修知识库...",
        "正在生成解决方案..."
      ]
    }
  }
}
```

### 2. 流式响应（Server-Sent Events）

**接口地址：** `POST /chat/messages/stream`

**请求参数：** 同发送消息接口

**响应格式：** Server-Sent Events (text/event-stream)

```
event: thinking
data: {"step": "正在识别故障码..."}

event: message
data: {"content": "清理主刷的步骤", "is_complete": false}

event: message
data: {"content": "如下：", "is_complete": false}

event: complete
data: {"message_id": "msg_ai_123", "citation": {...}}
```

### 3. 上传图片

**接口地址：** `POST /chat/upload-image`

**请求格式：** `multipart/form-data`

**请求参数：**
- `file`: 图片文件（支持 jpg, png, gif，最大 10MB）

**响应数据：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "url": "https://example.com/images/upload_123.jpg",
    "thumbnail_url": "https://example.com/images/upload_123_thumb.jpg",
    "size": 1024000,
    "width": 1920,
    "height": 1080
  }
}
```

### 4. 获取对话列表

**接口地址：** `GET /chat/conversations`

**查询参数：**
- `page`: 页码
- `page_size`: 每页数量

**响应数据：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "id": "chat_123",
        "title": "如何清理主刷？",
        "message_count": 6,
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T10:35:00Z",
        "last_message": {
          "content": "好的，我已经明白了",
          "timestamp": "2024-01-15T10:35:00Z"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total": 15,
      "total_pages": 1
    }
  }
}
```

### 5. 获取对话详情

**接口地址：** `GET /chat/conversations/{chat_id}`

**路径参数：**
- `chat_id`: 对话ID

**查询参数：**
- `page`: 消息分页（可选）
- `page_size`: 每页消息数量（可选）

**响应数据：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "chat_123",
    "title": "如何清理主刷？",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:35:00Z",
    "device_id": "device_123",
    "messages": [
      {
        "id": "msg_1",
        "type": "user",
        "content": "如何清理主刷？",
        "images": [],
        "timestamp": "2024-01-15T10:30:00Z"
      },
      {
        "id": "msg_2",
        "type": "ai",
        "content": "清理主刷的步骤如下：...",
        "timestamp": "2024-01-15T10:30:05Z",
        "citation": {
          "title": "用户手册 - 维护保养",
          "page": "P.23-25"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "page_size": 50,
      "total": 6,
      "total_pages": 1
    }
  }
}
```

### 6. 删除对话

**接口地址：** `DELETE /chat/conversations/{chat_id}`

**路径参数：**
- `chat_id`: 对话ID

**响应数据：**
```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

### 7. 标记问题已解决

**接口地址：** `POST /chat/conversations/{chat_id}/resolve`

**路径参数：**
- `chat_id`: 对话ID

**请求参数：**
```json
{
  "is_resolved": true,
  "feedback": "问题已解决，非常感谢"  // 可选
}
```

**响应数据：**
```json
{
  "code": 200,
  "message": "标记成功",
  "data": null
}
```

---

## 知识库

### 1. 获取知识库列表

**接口地址：** `GET /knowledge/articles`

**查询参数：**
- `category`: 分类，`all` | `guide` | `maintenance` | `demo`，默认`all`
- `type`: 类型，`article` | `video` | `pdf`，可选
- `keyword`: 搜索关键词，可选
- `page`: 页码
- `page_size`: 每页数量

**响应数据：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "id": "article_123",
        "title": "首次使用设置指南",
        "description": "详细介绍机器人的首次开箱、连接Wi-Fi和初始化设置流程",
        "category": "guide",
        "type": "article",  // article | video | pdf
        "icon": "📱",
        "cover_image": "https://example.com/covers/article_123.jpg",
        "duration": null,  // 视频时长（秒），仅视频类型有值
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-10T00:00:00Z"
      },
      {
        "id": "video_456",
        "title": "日常清洁与维护",
        "description": "学习如何正确清洁主刷、边刷、滤网等关键部件",
        "category": "maintenance",
        "type": "video",
        "icon": "🧹",
        "cover_image": "https://example.com/covers/video_456.jpg",
        "duration": 512,  // 8分32秒
        "video_url": "https://example.com/videos/video_456.mp4",
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-10T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total": 50,
      "total_pages": 3
    }
  }
}
```

### 2. 获取知识库详情

**接口地址：** `GET /knowledge/articles/{article_id}`

**路径参数：**
- `article_id`: 文章ID

**响应数据：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "article_123",
    "title": "首次使用设置指南",
    "description": "详细介绍机器人的首次开箱、连接Wi-Fi和初始化设置流程",
    "category": "guide",
    "type": "article",
    "content": "完整的内容HTML或Markdown格式...",
    "cover_image": "https://example.com/covers/article_123.jpg",
    "images": [
      "https://example.com/images/article_123_1.jpg"
    ],
    "video_url": null,  // 视频类型时返回视频URL
    "pdf_url": null,  // PDF类型时返回PDF下载URL
    "duration": null,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-10T00:00:00Z",
    "related_articles": [  // 相关文章
      {
        "id": "article_124",
        "title": "相关文章标题",
        "cover_image": "https://example.com/covers/article_124.jpg"
      }
    ]
  }
}
```

### 3. 搜索知识库

**接口地址：** `GET /knowledge/search`

**查询参数：**
- `keyword`: 搜索关键词（必填）
- `category`: 分类筛选（可选）
- `type`: 类型筛选（可选）
- `page`: 页码
- `page_size`: 每页数量

**响应数据：** 同获取知识库列表接口

### 4. 获取知识库分类

**接口地址：** `GET /knowledge/categories`

**响应数据：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "categories": [
      {
        "id": "all",
        "name": "全部",
        "icon": "book",
        "color": "blue",
        "count": 50  // 该分类下的文章数量
      },
      {
        "id": "guide",
        "name": "操作指南",
        "icon": "book",
        "color": "blue",
        "count": 20
      },
      {
        "id": "maintenance",
        "name": "维护保养",
        "icon": "wrench",
        "color": "green",
        "count": 15
      },
      {
        "id": "demo",
        "name": "产品演示",
        "icon": "video",
        "color": "purple",
        "count": 15
      }
    ]
  }
}
```

---

## 工单管理

### 1. 获取工单列表

**接口地址：** `GET /tickets`

**查询参数：**
- `status`: 状态筛选，`all` | `pending` | `processing` | `completed` | `cancelled`，默认`all`
- `keyword`: 搜索关键词（工单编号、标题、描述）
- `page`: 页码
- `page_size`: 每页数量

**响应数据：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "id": "WO20240112001",
        "title": "悬空传感器异常",
        "description": "机器人在清扫过程中突然停止，显示悬空传感器异常错误",
        "status": "processing",  // pending | processing | completed | cancelled
        "priority": "high",  // low | medium | high
        "type": "report",  // report | question
        "device_id": "device_123",
        "device_name": "客厅的扫地僧 X10",
        "assigned_to": {
          "id": "engineer_123",
          "name": "李工程师",
          "phone": "138****1234"
        },
        "estimated_completion_time": "2024-01-15T14:00:00Z",
        "has_image": true,
        "images": [
          "https://example.com/tickets/WO20240112001/image1.jpg"
        ],
        "created_at": "2024-01-12T10:30:00Z",
        "updated_at": "2024-01-12T11:15:00Z",
        "completed_at": null
      }
    ],
    "statistics": {
      "all": 15,
      "pending": 2,
      "processing": 3,
      "completed": 9,
      "cancelled": 1
    },
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total": 15,
      "total_pages": 1
    }
  }
}
```

### 2. 获取工单详情

**接口地址：** `GET /tickets/{ticket_id}`

**路径参数：**
- `ticket_id`: 工单ID

**响应数据：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "WO20240112001",
    "title": "悬空传感器异常",
    "description": "机器人在清扫过程中突然停止，显示悬空传感器异常错误",
    "status": "processing",
    "priority": "high",
    "type": "report",
    "device_id": "device_123",
    "device_info": {
      "id": "device_123",
      "name": "客厅的扫地僧 X10",
      "model": "扫地僧 X10 Pro",
      "sn": "SN202401150001"
    },
    "assigned_to": {
      "id": "engineer_123",
      "name": "李工程师",
      "phone": "138****1234",
      "avatar": "https://example.com/avatars/engineer_123.jpg"
    },
    "estimated_completion_time": "2024-01-15T14:00:00Z",
    "has_image": true,
    "images": [
      "https://example.com/tickets/WO20240112001/image1.jpg"
    ],
    "chat_history": [  // 关联的对话记录
      {
        "id": "chat_123",
        "title": "悬空传感器异常",
        "message_count": 8
      }
    ],
    "timeline": [  // 工单时间线
      {
        "id": "timeline_1",
        "action": "created",
        "description": "工单已创建",
        "operator": "用户",
        "timestamp": "2024-01-12T10:30:00Z"
      },
      {
        "id": "timeline_2",
        "action": "assigned",
        "description": "已分配给李工程师",
        "operator": "系统",
        "timestamp": "2024-01-12T10:35:00Z"
      },
      {
        "id": "timeline_3",
        "action": "processing",
        "description": "工程师开始处理",
        "operator": "李工程师",
        "timestamp": "2024-01-12T11:15:00Z"
      }
    ],
    "created_at": "2024-01-12T10:30:00Z",
    "updated_at": "2024-01-12T11:15:00Z",
    "completed_at": null
  }
}
```

### 3. 创建工单

**接口地址：** `POST /tickets`

**请求参数：**
```json
{
  "title": "悬空传感器异常",
  "description": "机器人在清扫过程中突然停止，显示悬空传感器异常错误",
  "priority": "high",  // low | medium | high
  "type": "report",  // report | question
  "device_id": "device_123",
  "images": [  // 可选，图片URL数组
    "https://example.com/upload/image1.jpg"
  ],
  "chat_id": "chat_123",  // 可选，关联的对话ID
  "supplementary_info": "补充说明信息"  // 可选
}
```

**响应数据：**
```json
{
  "code": 200,
  "message": "工单创建成功",
  "data": {
    "id": "WO20240112001",
    "title": "悬空传感器异常",
    "status": "pending",
    "estimated_response_time": "2024-01-15T12:30:00Z",  // 预计响应时间（2小时内）
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

### 4. 取消工单

**接口地址：** `POST /tickets/{ticket_id}/cancel`

**路径参数：**
- `ticket_id`: 工单ID

**请求参数：**
```json
{
  "reason": "问题已自行解决"  // 可选
}
```

**响应数据：**
```json
{
  "code": 200,
  "message": "工单已取消",
  "data": null
}
```

### 5. 发送消息给工程师

**接口地址：** `POST /tickets/{ticket_id}/messages`

**路径参数：**
- `ticket_id`: 工单ID

**请求参数：**
```json
{
  "content": "请问大概什么时候能处理完？",
  "images": []  // 可选
}
```

**响应数据：**
```json
{
  "code": 200,
  "message": "消息已发送",
  "data": {
    "message_id": "msg_123",
    "content": "请问大概什么时候能处理完？",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### 6. 获取工单消息列表

**接口地址：** `GET /tickets/{ticket_id}/messages`

**路径参数：**
- `ticket_id`: 工单ID

**查询参数：**
- `page`: 页码
- `page_size`: 每页数量

**响应数据：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "id": "msg_123",
        "sender": {
          "id": "user_123",
          "name": "用户",
          "type": "user"  // user | engineer | system
        },
        "content": "请问大概什么时候能处理完？",
        "images": [],
        "timestamp": "2024-01-15T10:30:00Z"
      },
      {
        "id": "msg_124",
        "sender": {
          "id": "engineer_123",
          "name": "李工程师",
          "type": "engineer"
        },
        "content": "预计今天下午2点可以完成",
        "images": [],
        "timestamp": "2024-01-15T10:32:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "page_size": 50,
      "total": 5,
      "total_pages": 1
    }
  }
}
```

### 7. 请求工程师回电

**接口地址：** `POST /tickets/{ticket_id}/request-call`

**路径参数：**
- `ticket_id`: 工单ID

**请求参数：**
```json
{
  "preferred_time": "2024-01-15T14:00:00Z",  // 可选，期望的回电时间
  "note": "希望尽快回电"  // 可选
}
```

**响应数据：**
```json
{
  "code": 200,
  "message": "回电请求已提交",
  "data": {
    "request_id": "call_req_123",
    "estimated_call_time": "2024-01-15T14:00:00Z"
  }
}
```

---

## 用户信息

### 1. 获取用户信息

**接口地址：** `GET /users/me`

**响应数据：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "user_123",
    "name": "张先生",
    "phone": "138****8888",
    "avatar": "https://example.com/avatars/user_123.jpg",
    "email": "zhang@example.com",  // 可选
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### 2. 更新用户信息

**接口地址：** `PUT /users/me`

**请求参数：**
```json
{
  "name": "张先生",
  "avatar": "https://example.com/avatars/user_123.jpg",  // 可选
  "email": "zhang@example.com"  // 可选
}
```

**响应数据：** 同获取用户信息接口

### 3. 获取设备档案

**接口地址：** `GET /users/devices/{device_id}/profile`

**路径参数：**
- `device_id`: 设备ID

**响应数据：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "device_123",
    "sn": "SN202401150001",
    "model": "扫地僧 X10 Pro",
    "firmware_version": "v2.3.5",
    "activated_date": "2024-01-15",
    "warranty_days": 345,
    "warranty_start_date": "2024-01-15",
    "warranty_end_date": "2025-01-15",
    "purchase_date": "2024-01-15",
    "purchase_channel": "官方商城"
  }
}
```

### 4. 获取耗材信息

**接口地址：** `GET /users/devices/{device_id}/consumables`

**路径参数：**
- `device_id`: 设备ID

**响应数据：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "consumables": [
      {
        "id": "consumable_1",
        "name": "主刷",
        "type": "main_brush",
        "lifespan": 100,  // 设计寿命（百分比）
        "remaining": 68,  // 剩余寿命（百分比）
        "installed_date": "2024-01-01",
        "estimated_replacement_date": "2024-06-01",
        "icon": "🌀"
      },
      {
        "id": "consumable_2",
        "name": "边刷",
        "type": "side_brush",
        "lifespan": 100,
        "remaining": 42,
        "installed_date": "2024-01-01",
        "estimated_replacement_date": "2024-04-15",
        "icon": "🔄"
      },
      {
        "id": "consumable_3",
        "name": "滤网",
        "type": "filter",
        "lifespan": 100,
        "remaining": 15,
        "installed_date": "2023-12-01",
        "estimated_replacement_date": "2024-02-01",
        "icon": "🔵"
      },
      {
        "id": "consumable_4",
        "name": "拖布",
        "type": "mop",
        "lifespan": 100,
        "remaining": 55,
        "installed_date": "2024-01-01",
        "estimated_replacement_date": "2024-05-15",
        "icon": "🧹"
      }
    ]
  }
}
```

### 5. 获取清洁统计

**接口地址：** `GET /users/devices/{device_id}/cleaning-stats`

**路径参数：**
- `device_id`: 设备ID

**查询参数：**
- `period`: 统计周期，`week` | `month` | `year`，默认`week`
- `start_date`: 开始日期（YYYY-MM-DD），可选
- `end_date`: 结束日期（YYYY-MM-DD），可选

**响应数据：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "period": "week",
    "start_date": "2024-01-08",
    "end_date": "2024-01-15",
    "summary": {
      "total_cleaning_count": 14,
      "total_cleaned_area": 542,  // 平方米
      "total_cleaning_time": 510,  // 分钟
      "average_area_per_clean": 38.7,
      "average_time_per_clean": 36.4
    },
    "daily_stats": [
      {
        "date": "2024-01-08",
        "cleaning_count": 2,
        "cleaned_area": 85,
        "cleaning_time": 60
      },
      {
        "date": "2024-01-09",
        "cleaning_count": 1,
        "cleaned_area": 45,
        "cleaning_time": 30
      }
      // ... 更多日期数据
    ],
    "chart_data": {  // 用于绘制图表的数据
      "labels": ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
      "areas": [85, 45, 92, 48, 125, 95, 52],
      "counts": [2, 1, 2, 1, 3, 2, 1]
    }
  }
}
```

### 6. 获取清洁日志

**接口地址：** `GET /users/devices/{device_id}/cleaning-logs`

**路径参数：**
- `device_id`: 设备ID

**查询参数：**
- `page`: 页码
- `page_size`: 每页数量
- `start_date`: 开始日期（可选）
- `end_date`: 结束日期（可选）

**响应数据：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "id": "log_123",
        "device_id": "device_123",
        "started_at": "2024-01-15T09:00:00Z",
        "completed_at": "2024-01-15T09:42:00Z",
        "duration": 42,  // 分钟
        "cleaned_area": 52,  // 平方米
        "cleaning_mode": "full_house",  // full_house | spot | edge
        "map_image_url": "https://example.com/maps/log_123.jpg",
        "battery_before": 90,
        "battery_after": 75
      },
      {
        "id": "log_124",
        "device_id": "device_123",
        "started_at": "2024-01-14T10:00:00Z",
        "completed_at": "2024-01-14T11:18:00Z",
        "duration": 78,
        "cleaned_area": 95,
        "cleaning_mode": "full_house",
        "map_image_url": "https://example.com/maps/log_124.jpg",
        "battery_before": 85,
        "battery_after": 65
      }
    ],
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total": 50,
      "total_pages": 3
    }
  }
}
```

### 7. 获取清洁日志详情

**接口地址：** `GET /users/devices/{device_id}/cleaning-logs/{log_id}`

**路径参数：**
- `device_id`: 设备ID
- `log_id`: 日志ID

**响应数据：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "log_123",
    "device_id": "device_123",
    "started_at": "2024-01-15T09:00:00Z",
    "completed_at": "2024-01-15T09:42:00Z",
    "duration": 42,
    "cleaned_area": 52,
    "cleaning_mode": "full_house",
    "map_image_url": "https://example.com/maps/log_123.jpg",
    "battery_before": 90,
    "battery_after": 75,
    "path_data": "https://example.com/maps/log_123_path.json",  // 清扫路径数据
    "obstacles": [  // 障碍物位置
      {
        "x": 100,
        "y": 200,
        "type": "furniture"
      }
    ]
  }
}
```

---

## 错误码说明

### HTTP状态码

- `200`: 请求成功
- `400`: 请求参数错误
- `401`: 未授权（token无效或过期）
- `403`: 禁止访问（权限不足）
- `404`: 资源不存在
- `429`: 请求过于频繁（限流）
- `500`: 服务器内部错误
- `503`: 服务暂不可用

### 业务错误码

| 错误码 | HTTP状态码 | 说明 |
|--------|-----------|------|
| 200 | 200 | 成功 |
| 40001 | 400 | 参数错误 |
| 40002 | 400 | 参数缺失 |
| 40003 | 400 | 参数格式错误 |
| 40101 | 401 | 未登录 |
| 40102 | 401 | Token已过期 |
| 40103 | 401 | Token无效 |
| 40301 | 403 | 无权限访问 |
| 40401 | 404 | 资源不存在 |
| 40402 | 404 | 设备不存在 |
| 40403 | 404 | 工单不存在 |
| 42901 | 429 | 请求频率过高 |
| 50001 | 500 | 服务器错误 |
| 50002 | 500 | 数据库错误 |
| 50003 | 500 | 外部服务错误 |

### 错误响应示例

```json
{
  "code": 40101,
  "message": "未登录或登录已过期",
  "data": null,
  "timestamp": 1705123456789
}
```

---

## WebSocket 实时通信

### 连接地址

```
wss://api.example.com/v1/ws?token={token}
```

### 消息格式

所有WebSocket消息采用JSON格式：

```json
{
  "type": "message_type",
  "data": {
    // 消息数据
  },
  "timestamp": 1705123456789
}
```

### 消息类型

#### 1. 设备状态更新

**消息类型：** `device_status_update`

**消息数据：**
```json
{
  "type": "device_status_update",
  "data": {
    "device_id": "device_123",
    "status": "cleaning",
    "battery": 84,
    "cleaned_area": 46.5,
    "clean_water_level": 74,
    "dirty_water_level": 46
  },
  "timestamp": 1705123456789
}
```

#### 2. 工单状态更新

**消息类型：** `ticket_status_update`

**消息数据：**
```json
{
  "type": "ticket_status_update",
  "data": {
    "ticket_id": "WO20240112001",
    "status": "processing",
    "assigned_to": {
      "id": "engineer_123",
      "name": "李工程师"
    },
    "estimated_completion_time": "2024-01-15T14:00:00Z"
  },
  "timestamp": 1705123456789
}
```

#### 3. 工单消息推送

**消息类型：** `ticket_message`

**消息数据：**
```json
{
  "type": "ticket_message",
  "data": {
    "ticket_id": "WO20240112001",
    "message": {
      "id": "msg_123",
      "sender": {
        "id": "engineer_123",
        "name": "李工程师",
        "type": "engineer"
      },
      "content": "预计今天下午2点可以完成",
      "timestamp": "2024-01-15T10:32:00Z"
    }
  },
  "timestamp": 1705123456789
}
```

#### 4. 心跳

**消息类型：** `ping` / `pong`

客户端发送：
```json
{
  "type": "ping"
}
```

服务端响应：
```json
{
  "type": "pong"
}
```

---

## 文件上传

### 图片上传

**接口地址：** `POST /upload/image`

**请求格式：** `multipart/form-data`

**请求参数：**
- `file`: 图片文件（必填）
  - 支持格式：jpg, jpeg, png, gif, webp
  - 最大大小：10MB
  - 建议尺寸：不超过4096x4096

**响应数据：**
```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "url": "https://cdn.example.com/images/upload_123.jpg",
    "thumbnail_url": "https://cdn.example.com/images/upload_123_thumb.jpg",
    "size": 1024000,
    "width": 1920,
    "height": 1080,
    "format": "jpg"
  }
}
```

---

## 附录

### 数据模型

#### 设备状态枚举

- `cleaning`: 清扫中
- `charging`: 回充中
- `standby`: 待机
- `error`: 故障

#### 工单状态枚举

- `pending`: 待处理
- `processing`: 处理中
- `completed`: 已完成
- `cancelled`: 已取消

#### 工单优先级枚举

- `low`: 低
- `medium`: 中
- `high`: 高

#### 工单类型枚举

- `report`: 故障报修
- `question`: 问题咨询

#### 知识库分类枚举

- `guide`: 操作指南
- `maintenance`: 维护保养
- `demo`: 产品演示

#### 知识库类型枚举

- `article`: 图文
- `video`: 视频
- `pdf`: PDF文档

---

### 版本历史

- **v1.0.0** (2024-01-15): 初始版本

---

### 联系方式

如有API相关问题，请联系：
- 技术支持：support@example.com
- API文档：https://docs.example.com/api

---

**文档版本：** v1.0.0  
**最后更新：** 2024-01-15