# 开发环境设置指南

## 系统要求
- Node.js 18+ 
- npm 9+ 或 yarn 1.22+
- PostgreSQL 14+ (或使用Docker)
- Git

## 快速开始

### 1. 克隆项目
```bash
git clone <repository-url>
cd XJCO2913_SoftwareEngineering_Group17
```

### 2. 使用Docker启动数据库（推荐）
```bash
# 启动PostgreSQL容器
docker-compose up -d

# 查看容器状态
docker-compose ps
```

### 3. 设置后端
```bash
cd backend

# 安装依赖
npm install

# 复制环境变量文件
cp .env.example .env

# 运行数据库迁移
npx prisma migrate dev

# 生成Prisma客户端
npx prisma generate

# 启动开发服务器
npm run start:dev
```

### 4. 设置前端
```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 环境变量配置

### 后端环境变量 (.env)
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/scooter_rental"
JWT_SECRET="your-jwt-secret-key-here"
PORT=3000
```

### 前端环境变量 (.env)
```env
VITE_API_BASE_URL=http://localhost:3000
```

## 数据库管理

### 重置数据库
```bash
cd backend
npm run db:reset
```

### 查看数据库
```bash
# 使用Prisma Studio
npx prisma studio
```

### 运行种子数据
```bash
cd backend
npx prisma db seed
```

## 测试账户

系统预置了以下测试账户：

### 管理员账户
- **邮箱**: admin@scooter.com
- **密码**: admin123
- **角色**: MANAGER

### 普通用户账户
- **邮箱**: test1@example.com
- **密码**: user123
- **角色**: CUSTOMER

- **邮箱**: test2@example.com
- **密码**: user123
- **角色**: CUSTOMER

## 访问地址

- **前端应用**: http://localhost:5174
- **后端API**: http://localhost:3000
- **API文档**: http://localhost:3000/api (Swagger UI)
- **数据库管理**: http://localhost:5555 (Prisma Studio)

## 常用命令

### 后端命令
```bash
# 开发模式
npm run start:dev

# 生产构建
npm run build

# 生产运行
npm run start:prod

# 运行测试
npm test

# 运行E2E测试
npm run test:e2e

# 代码格式化
npm run format

# 代码检查
npm run lint
```

### 前端命令
```bash
# 开发模式
npm run dev

# 生产构建
npm run build

# 预览生产版本
npm run preview

# 代码格式化
npm run format

# 代码检查
npm run lint
```

## 故障排除

### 端口冲突
如果端口被占用，可以修改以下配置：

**后端端口**: 修改 `backend/.env` 中的 `PORT` 变量
**前端端口**: 修改 `frontend/vite.config.ts` 中的 `server.port`

### 数据库连接问题
1. 确保Docker容器正在运行: `docker-compose ps`
2. 检查数据库连接字符串: `backend/.env` 中的 `DATABASE_URL`
3. 重启数据库: `docker-compose restart`

### 依赖安装问题
```bash
# 清除npm缓存
npm cache clean --force

# 删除node_modules重新安装
rm -rf node_modules package-lock.json
npm install
```

## 开发工具推荐

### 代码编辑器
- VS Code (推荐)
- WebStorm
- Sublime Text

### 浏览器扩展
- React Developer Tools
- Redux DevTools
- JSON Formatter

### API测试工具
- Postman
- Insomnia
- Thunder Client (VS Code扩展)

## 下一步
- 查看 [API文档](../api/api-reference.md)
- 了解 [系统架构](../architecture/system-overview.md)
- 阅读 [开发指南](../development/frontend-guide.md)