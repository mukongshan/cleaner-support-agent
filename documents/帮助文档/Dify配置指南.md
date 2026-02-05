# Dify AI 配置指南

本文档说明如何配置 Dify AI 平台以启用智能对话功能。

## 1. 获取 Dify API Key

1. 登录 Dify 平台：`http://dify.seec.seecoder.cn`
2. 进入应用管理页面
3. 选择对应的 Agent 应用
4. 在「API 访问」或「开发」页面获取 API Key

## 2. 配置本地环境

### 方式一：使用本地配置文件（推荐开发环境）

1. 复制配置模板：

```bash
cd src/backend/cleaner-support-agent-backend/src/main/resources
cp application-local.yml.example application-local.yml
```

2. 编辑 `application-local.yml`，填入实际的 API Key：

```yaml
app:
  dify:
    api-key: your-actual-dify-api-key-here
```

3. 在 `application.yml` 中激活本地配置（可选）：

```yaml
spring:
  profiles:
    include: local
```

或者通过环境变量激活：

```bash
# Windows PowerShell
$env:SPRING_PROFILES_INCLUDE="local"

# Linux/Mac
export SPRING_PROFILES_INCLUDE=local
```

### 方式二：使用环境变量（推荐生产环境）

直接设置环境变量：

```bash
# Windows PowerShell
$env:APP_DIFY_API_KEY="your-dify-api-key"

# Linux/Mac
export APP_DIFY_API_KEY=your-dify-api-key
```

## 3. 配置项说明

| 配置项 | 环境变量 | 默认值 | 说明 |
|--------|----------|--------|------|
| `app.dify.base-url` | `APP_DIFY_BASE_URL` | `http://dify.seec.seecoder.cn/v1` | Dify API 基础URL |
| `app.dify.api-key` | `APP_DIFY_API_KEY` | (无) | Dify API 密钥 |
| `app.dify.user-prefix` | `APP_DIFY_USER_PREFIX` | `__CSA_developer_` | 用户标识前缀 |
| `app.dify.timeout` | `APP_DIFY_TIMEOUT` | `60000` | SSE连接超时时间(毫秒) |

## 4. 验证配置

启动后端服务后，可以通过以下方式验证配置：

1. 查看启动日志，确认没有配置相关的警告
2. 通过前端发起一次 AI 对话
3. 如果配置正确，应该能收到真实的 AI 回复

## 5. 常见问题

### Q: 对话返回"AI服务未配置"

**原因**：API Key 未配置或为空

**解决**：检查 `application-local.yml` 或环境变量是否正确设置

### Q: 对话返回"AI服务认证失败"

**原因**：API Key 无效或过期

**解决**：重新从 Dify 平台获取有效的 API Key

### Q: 对话超时

**原因**：网络问题或 Dify 服务响应慢

**解决**：
1. 检查网络连接
2. 可以增大超时时间：`APP_DIFY_TIMEOUT=120000`

## 6. 安全注意事项

- **请勿**将 `application-local.yml` 提交到版本控制（已在 `.gitignore` 中忽略）
- 生产环境建议使用环境变量或密钥管理服务
- API Key 应定期轮换
