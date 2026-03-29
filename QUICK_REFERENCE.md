# 快速参考卡片

## 🚀 日常开发命令

### 启动服务
```bash
# 后端 (端口 3000)
cd backend && npm run start:dev

# 前端 (端口 5173)
cd frontend && npm run dev

# Prisma Studio (数据库 GUI，端口 5555)
cd backend && npx prisma studio
```

---

## 🗄️ 数据库操作

```bash
cd backend

# 创建新迁移
npx prisma migrate dev --name <迁移名称>

# 生成 Prisma Client (schema 变更后)
npx prisma generate

# 重置数据库（谨慎！）
npx prisma migrate reset

# 查看数据库
npx prisma studio

# 直接执行 SQL
npx prisma db execute --file <sql文件>
```

---

## 🐛 故障排查

### 数据库连接问题
```bash
# Linux - 检查 PostgreSQL 状态
sudo systemctl status postgresql

# Windows - 检查服务
Get-Service postgresql*

# 测试连接
psql -U scooter -d scooter -h localhost
```

### 端口占用
```bash
# Linux
sudo lsof -i :3000
sudo kill -9 <PID>

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### 清除重建
```bash
# 清除所有依赖
rm -rf node_modules package-lock.json
rm -rf backend/node_modules backend/package-lock.json
rm -rf frontend/node_modules frontend/package-lock.json
npm install && cd backend && npm install && cd ../frontend && npm install
```

---

## 🌐 API 端点

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | http://localhost:3000/api | Swagger 文档 |
| POST | /auth/login | 用户登录 |
| POST | /auth/register | 用户注册 |
| GET | /scooters | 获取滑板车列表 |
| POST | /bookings | 创建预订 |

---

## 🔧 环境变量模板

### backend/.env
```env
DATABASE_URL="postgresql://scooter:scooter@localhost:5432/scooter?schema=public"
JWT_SECRET="your-secret-key-change-this-in-production"
PORT=3000
NODE_ENV=development
```

---

## 📋 检查清单

### 首次部署
- [ ] Node.js v20 已安装
- [ ] PostgreSQL 已安装并运行
- [ ] 数据库 `scooter` 已创建
- [ ] 用户 `scooter` 有 CREATEDB 权限
- [ ] `backend/.env` 文件已配置
- [ ] 运行 `npx prisma migrate dev`
- [ ] 运行 `npx prisma generate`
- [ ] 后端服务启动成功 (http://localhost:3000)
- [ ] 前端服务启动成功 (http://localhost:5173)

### 代码更新后
- [ ] 拉取最新代码 `git pull`
- [ ] 安装新依赖 `npm install`
- [ ] 运行新迁移 `npx prisma migrate dev`
- [ ] 重新生成 Prisma Client `npx prisma generate`
- [ ] 重启服务

---

## 💡 实用技巧

### 同时查看前后端日志
```bash
# Linux/macOS - 使用 tmux 或开启多个终端
# 或使用后台运行
backend:  npm run start:dev > backend.log 2>&1 &
frontend: npm run dev > frontend.log 2>&1 &
tail -f backend.log frontend.log
```

### 快速重置数据库（开发环境）
```bash
cd backend
npx prisma migrate reset --force
# 然后按提示输入 y 确认
```

### 导出/导入数据库
```bash
# 导出
pg_dump -U scooter scooter > backup.sql

# 导入
psql -U scooter scooter < backup.sql
```

---

## 🆘 获取帮助

| 资源 | 链接 |
|------|------|
| NestJS 文档 | https://docs.nestjs.com/ |
| Prisma 文档 | https://www.prisma.io/docs/ |
| React 文档 | https://react.dev/ |
| Tailwind CSS | https://tailwindcss.com/ |

---

## 📞 常用联系方式

**项目维护者**: XJCO2913 Software Engineering Group 17  
**文档版本**: v1.0  
**最后更新**: 2026-03-29
