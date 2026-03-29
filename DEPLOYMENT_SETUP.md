# 部署环境配置指南

## 项目概述
- **后端**: NestJS + Prisma + PostgreSQL
- **前端**: React + Vite + TypeScript + Tailwind CSS
- **Node.js 版本**: v20 LTS

---

## 一、环境要求

| 组件 | 版本 | 说明 |
|------|------|------|
| Node.js | v20.x | 使用 nvm 管理 |
| PostgreSQL | 15+ | 数据库服务 |
| npm | 10.x | 包管理器 |
| Git | 任意 | 代码版本控制 |

---

## 二、系统环境配置

### 2.1 Linux (Arch/Ubuntu/Debian)

#### 安装 nvm 和 Node.js
```bash
# 安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# 重新加载 shell 配置
source ~/.bashrc

# 安装并启用 Node.js 20
nvm install 20
nvm use 20
nvm alias default 20

# 验证安装
node --version  # v20.x.x
npm --version   # 10.x.x
```

#### 安装 PostgreSQL (Arch Linux)
```bash
# 安装 PostgreSQL
sudo pacman -S postgresql

# 初始化数据库
sudo -iu postgres initdb --locale=en_US.UTF-8 -D /var/lib/postgres/data

# 启动服务
sudo systemctl enable --now postgresql
```

#### 安装 PostgreSQL (Ubuntu/Debian)
```bash
# 安装 PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# 启动服务
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

---

### 2.2 Windows

#### 安装 nvm-windows 和 Node.js
```powershell
# 1. 下载安装 nvm-windows
# 访问: https://github.com/coreybutler/nvm-windows/releases
# 下载 nvm-setup.exe 并安装

# 2. 使用 nvm 安装 Node.js
nvm install 20.20.0
nvm use 20.20.0
nvm alias default 20.20.0

# 验证
node --version
npm --version
```

#### 安装 PostgreSQL (Windows)

**方式一：官方安装包（推荐）**
1. 访问 https://www.postgresql.org/download/windows/
2. 下载 PostgreSQL 15+ 安装程序
3. 运行安装向导，记住设置的密码
4. 保持默认端口 5432

**方式二：使用 Docker Desktop**
1. 安装 Docker Desktop: https://www.docker.com/products/docker-desktop
2. 启动 PostgreSQL 容器:
```powershell
docker run -d `
  --name scooter-db `
  -e POSTGRES_USER=scooter `
  -e POSTGRES_PASSWORD=scooter `
  -e POSTGRES_DB=scooter `
  -p 5432:5432 `
  postgres:15-alpine
```

**方式三：使用 WSL2 (推荐开发者使用)**
```bash
# 在 WSL2 Ubuntu 中执行
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo service postgresql start
```

---

## 三、数据库配置

### 3.1 创建数据库和用户

#### Linux
```bash
# 切换到 postgres 用户
sudo -iu postgres psql

# 在 psql 中执行
CREATE USER scooter WITH PASSWORD 'scooter';
CREATE DATABASE scooter OWNER scooter;
ALTER USER scooter CREATEDB;  -- Prisma Migrate 需要
\q
```

#### Windows (psql 命令行)
```powershell
# 打开 SQL Shell (psql) 或使用命令行
psql -U postgres

# 执行 SQL 命令
CREATE USER scooter WITH PASSWORD 'scooter';
CREATE DATABASE scooter OWNER scooter;
ALTER USER scooter CREATEDB;
\q
```

### 3.2 验证数据库连接
```bash
# Linux
psql -U scooter -d scooter -h localhost -W

# Windows
psql -U scooter -d scooter -h localhost
```

---

## 四、项目配置

### 4.1 克隆项目并安装依赖
```bash
# 克隆仓库
git clone <repository-url>
cd scooter-rental

# 安装根目录依赖
npm install

# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

### 4.2 配置环境变量

在 `backend/` 目录下创建 `.env` 文件：

```env
# Database
DATABASE_URL="postgresql://scooter:scooter@localhost:5432/scooter?schema=public"

# JWT Secret (生产环境请使用强随机字符串)
JWT_SECRET="your-secret-key-change-this-in-production"

# Server
PORT=3000
NODE_ENV=development
```

**Windows 注意**: 如果 PostgreSQL 使用不同端口或需要 SSL，调整 DATABASE_URL:
```env
# Windows 示例 (如果使用默认 postgres 用户)
DATABASE_URL="postgresql://postgres:你的密码@localhost:5432/scooter?schema=public"
```

### 4.3 初始化数据库
```bash
cd backend

# 生成 Prisma Client
npx prisma generate

# 运行数据库迁移
npx prisma migrate dev --name init

# (可选) 查看数据库 GUI
npx prisma studio
```

**常见问题**:
- **P3014 错误**: 用户没有 CREATEDB 权限 → 执行 `ALTER USER scooter CREATEDB;`
- **ECONNREFUSED**: PostgreSQL 未启动 → 检查服务状态

---

## 五、启动服务

### 5.1 开发模式（推荐开发使用）

**终端 1 - 启动后端:**
```bash
cd backend
npm run start:dev
```
后端地址: http://localhost:3000  
API 文档: http://localhost:3000/api

**终端 2 - 启动前端:**
```bash
cd frontend
npm run dev
```
前端地址: http://localhost:5173

### 5.2 生产模式

**构建前端:**
```bash
cd frontend
npm run build
npm run preview  # 预览生产构建
```

**构建后端:**
```bash
cd backend
npm run build
npm run start:prod
```

---

## 六、系统特定注意事项

### Windows 特有

1. **PowerShell 执行策略** (如果使用 ps1 脚本):
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

2. **路径分隔符**: 项目使用 `/`，Windows 通常兼容，但在某些脚本中需要注意

3. **环境变量设置** (PowerShell):
```powershell
$env:DATABASE_URL="postgresql://scooter:scooter@localhost:5432/scooter?schema=public"
```

4. **换行符**: Git 可能会转换换行符，建议设置:
```bash
git config --global core.autocrlf false
```

### Linux 特有

1. **权限问题**: 如果遇到权限错误，检查 npm 全局安装目录:
```bash
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

2. **PostgreSQL 权限**:
```bash
# 如果无法连接，检查 pg_hba.conf
sudo vim /var/lib/postgres/data/pg_hba.conf
# 确保有: host all all 127.0.0.1/32 md5
sudo systemctl restart postgresql
```

---

## 七、验证部署

### 7.1 服务状态检查
```bash
# 检查后端
curl http://localhost:3000

# 检查前端 (浏览器打开)
http://localhost:5173

# 检查 API 文档
http://localhost:3000/api
```

### 7.2 CORS 测试
```bash
# 测试 CORS 头
curl -I -H "Origin: http://localhost:5173" http://localhost:3000

# 测试 OPTIONS 预检
curl -X OPTIONS \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  http://localhost:3000
```

### 7.3 数据库检查
```bash
# 连接数据库
psql -U scooter -d scooter

# 查看表
\dt

# 查看用户数据
SELECT * FROM "User";
\q
```

---

## 八、常见问题 (FAQ)

### Q1: npm install 失败
```bash
# 清除缓存重试
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Q2: 端口被占用
```bash
# Linux 查找并终止进程
sudo lsof -i :3000
sudo kill -9 <PID>

# Windows 查找并终止
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Q3: Prisma Client 未生成
```bash
cd backend
npx prisma generate
```

### Q4: 数据库连接超时
- 检查防火墙设置
- 确认 PostgreSQL 监听 `localhost:5432`
- 检查 `pg_hba.conf` 配置

---

## 九、生产环境部署建议

1. **使用 Docker Compose** 统一部署前后端和数据库
2. **配置 Nginx** 反向代理和负载均衡
3. **使用 PM2** 管理 Node.js 进程
4. **配置 SSL/TLS** 证书
5. **设置环境变量** 使用安全的 JWT 密钥
6. **定期备份** 数据库

---

## 十、快速启动命令总结

```bash
# 完整启动流程 (Linux/macOS)
git clone <repo> && cd scooter-rental
npm install && cd backend && npm install && cd ../frontend && npm install
cd backend && cp .env.example .env  # 编辑 .env
npx prisma migrate dev && npx prisma generate
npm run start:dev &
cd ../frontend && npm run dev

# 完整启动流程 (Windows PowerShell)
git clone <repo>; cd scooter-rental
npm install; cd backend; npm install; cd ../frontend; npm install
cd backend; copy .env.example .env  # 编辑 .env
npx prisma migrate dev; npx prisma generate
Start-Process npm -ArgumentList "run start:dev"
cd ../frontend; npm run dev
```

---

## 附录: 目录结构

```
scooter-rental/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma    # 数据库模型
│   │   └── migrations/      # 迁移文件
│   ├── src/
│   ├── .env                 # 环境变量 (不提交到 Git)
│   └── package.json
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
└── package.json
```
