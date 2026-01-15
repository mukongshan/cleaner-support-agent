# 数据库
$env:SPRING_DATASOURCE_URL="jdbc:mysql://localhost:3306/cleaner_support?useUnicode=true&characterEncoding=utf8&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Shanghai"
$env:SPRING_DATASOURCE_USERNAME="kongshan"
$env:SPRING_DATASOURCE_PASSWORD="zmt20041204"

# AI服务
$env:APP_AI_BASE_URL="https://api.dify.ai/v1"
$env:APP_AI_API_KEY="your_api_key"

# 前端地址
$env:APP_CORS_ALLOWED_ORIGINS="http://localhost:5173"

# 启动端口
$env:SERVER_PORT="8080"

Write-Host "Environment variables set successfully!" -ForegroundColor Green
Write-Host "Note: These variables are only valid in current PowerShell session" -ForegroundColor Yellow