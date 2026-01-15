# 数据库初始化说明

## 方式一：使用SQL脚本（推荐）

### 1. 确保MySQL已安装并运行

检查MySQL服务是否运行：
```bash
# Windows
net start MySQL80

# Linux/Mac
sudo systemctl start mysql
# 或
sudo service mysql start
```

### 2. 使用MySQL命令行创建数据库

```bash
# 登录MySQL（使用root用户）
mysql -u kongshan -pzmt20041204

# 执行初始化脚本
source src/backend/cleaner-support-agent-backend/src/main/resources/db/init.sql

# 或者直接执行SQL命令
CREATE DATABASE IF NOT EXISTS cleaner_support 
    CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;
```

### 3. 验证数据库创建成功

```sql
SHOW DATABASES;
USE cleaner_support;
SHOW TABLES;  -- 此时应该还没有表，启动应用后JPA会自动创建
```

## 方式二：使用MySQL Workbench或其他GUI工具

1. 打开MySQL Workbench
2. 连接到MySQL服务器
3. 执行 `init.sql` 脚本
4. 或手动创建数据库：
   - 右键点击左侧面板
   - 选择 "Create Schema"
   - 数据库名：`cleaner_support`
   - 字符集：`utf8mb4`
   - 排序规则：`utf8mb4_unicode_ci`

## 方式三：修改配置让JPA自动创建数据库（仅开发环境）

**注意：此方式需要MySQL用户有创建数据库的权限**

修改 `application.yml`：

```yaml
spring:
  datasource:
    # 连接到MySQL服务器（不指定数据库）
    url: jdbc:mysql://localhost:3306?useUnicode=true&characterEncoding=utf8&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Shanghai&createDatabaseIfNotExist=true
    username: root
    password: root
  
  jpa:
    hibernate:
      ddl-auto: create  # 首次启动使用create，之后改为update
```

**警告：** `ddl-auto: create` 会删除并重建所有表，仅用于首次初始化！

## 配置说明

### 当前配置（application.yml）

- **数据库名**：`cleaner_support`
- **默认用户名**：`root`
- **默认密码**：`root`
- **端口**：`3306`
- **字符集**：`utf8mb4`

### 修改数据库配置

如果您的MySQL配置不同，可以通过环境变量覆盖：

```bash
# Windows PowerShell
$env:SPRING_DATASOURCE_URL="jdbc:mysql://localhost:3306/cleaner_support?useUnicode=true&characterEncoding=utf8&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Shanghai"
$env:SPRING_DATASOURCE_USERNAME="your_username"
$env:SPRING_DATASOURCE_PASSWORD="your_password"

# Linux/Mac
export SPRING_DATASOURCE_URL="jdbc:mysql://localhost:3306/cleaner_support?useUnicode=true&characterEncoding=utf8&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Shanghai"
export SPRING_DATASOURCE_USERNAME="your_username"
export SPRING_DATASOURCE_PASSWORD="your_password"
```

## 启动应用

数据库创建完成后，启动Spring Boot应用：

```bash
cd src/backend/cleaner-support-agent-backend
./mvnw spring-boot:run
# 或
mvnw.cmd spring-boot:run
```

应用启动时，JPA会根据实体类自动创建所有表结构。

## 验证表结构

应用启动后，可以登录MySQL查看表：

```sql
USE cleaner_support;
SHOW TABLES;

-- 应该看到以下表：
-- users
-- conversations
-- messages
-- tickets
-- ticket_attachments
-- ticket_feedbacks
-- media_files
-- media_file_products
-- message_feedbacks
```

## 常见问题

### 1. 连接被拒绝（Connection refused）

- 检查MySQL服务是否运行
- 检查端口是否正确（默认3306）
- 检查防火墙设置

### 2. 访问被拒绝（Access denied）

- 检查用户名和密码是否正确
- 检查用户是否有访问数据库的权限

### 3. 数据库不存在（Unknown database）

- 先执行 `init.sql` 创建数据库
- 或使用方式三让JPA自动创建

### 4. 字符集问题

- 确保数据库使用 `utf8mb4` 字符集
- 确保连接URL中包含 `useUnicode=true&characterEncoding=utf8`
