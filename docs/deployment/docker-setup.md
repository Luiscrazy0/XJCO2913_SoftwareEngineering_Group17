# Docker部署指南

## 概述
本项目提供两种Docker部署方案：
1. **轻量方案**：仅容器化PostgreSQL数据库，前后端本地运行
2. **完整方案**：所有服务都容器化

## 轻量方案（推荐用于开发）

### 方案特点
- 只运行PostgreSQL容器
- 前后端继续本地开发
- 统一数据库环境
- 占用资源少，启动快

### 文件结构
```
项目根目录/
├── docker-compose.yml        # PostgreSQL容器配置
├── .env.example              # 环境变量模板
├── scripts/
│   ├── setup.sh              # Linux/macOS初始化脚本
│   └── setup.bat             # Windows初始化脚本
└── backend/
    └── .env                  # 本地环境变量（脚本生成）
```

### 一键启动
```bash
# Linux/macOS
bash scripts/setup.sh

# Windows
scripts\setup.bat
```

### 手动设置
1. 启动PostgreSQL容器：
```bash
docker-compose up -d
```

2. 设置后端环境：
```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npx prisma generate
npm run start:dev
```

3. 设置前端环境：
```bash
cd frontend
npm install
npm run dev
```

### 端口配置
- **PostgreSQL**: 5433（避免与本地5432冲突）
- **后端API**: 3000
- **前端应用**: 5174

## 完整Docker方案

### 方案特点
- 所有服务都容器化
- 适合演示和测试环境
- 环境一致性高

### 文件结构
```
项目根目录/
├── docker-compose.full.yml   # 完整服务配置
├── Dockerfile.backend        # 后端Dockerfile
├── Dockerfile.frontend       # 前端Dockerfile
└── nginx/
    └── nginx.conf           # Nginx反向代理配置
```

### 启动完整服务
```bash
# 使用完整配置启动所有服务
docker-compose -f docker-compose.full.yml up -d

# 查看服务状态
docker-compose -f docker-compose.full.yml ps

# 查看日志
docker-compose -f docker-compose.full.yml logs -f
```

### 服务访问
- **前端应用**: http://localhost:80
- **后端API**: http://localhost:3000
- **PostgreSQL**: localhost:5432（容器内部）

## 环境变量配置

### 后端环境变量
```env
# 数据库配置
DATABASE_URL=postgresql://postgres:postgres@db:5432/scooter_rental

# JWT配置
JWT_SECRET=your-secret-key-change-in-production

# 服务器配置
PORT=3000
NODE_ENV=production

# CORS配置
CORS_ORIGIN=http://localhost:80
```

### 前端环境变量
```env
# API基础URL
VITE_API_BASE_URL=http://localhost:3000

# 环境标识
VITE_APP_ENV=production
```

## 数据库管理

### 数据持久化
数据库数据存储在命名卷中：
```yaml
volumes:
  postgres_data:
```

### 备份数据库
```bash
# 备份
docker exec -t postgres_container pg_dumpall -c -U postgres > dump_$(date +%Y-%m-%d).sql

# 恢复
cat dump.sql | docker exec -i postgres_container psql -U postgres
```

### 重置数据库
```bash
# 进入后端容器
docker-compose exec backend sh

# 在容器内运行
npx prisma migrate reset
npx prisma db seed
```

## 生产环境部署建议

### 安全配置
1. **修改默认密码**：更改PostgreSQL和JWT密钥
2. **启用HTTPS**：配置SSL证书
3. **设置防火墙**：限制不必要的端口访问
4. **定期备份**：设置自动备份策略

### 性能优化
1. **数据库连接池**：配置适当的连接数
2. **缓存策略**：考虑添加Redis缓存
3. **CDN加速**：静态资源使用CDN
4. **负载均衡**：多实例部署

### 监控和日志
1. **日志收集**：配置日志轮转和集中存储
2. **健康检查**：设置健康检查端点
3. **性能监控**：使用APM工具监控性能
4. **错误追踪**：集成错误追踪服务

## 常见问题

### 端口冲突
如果端口被占用，可以修改`docker-compose.yml`中的端口映射：
```yaml
ports:
  - "5434:5432"  # 主机端口:容器端口
```

### 容器启动失败
1. 检查Docker日志：
```bash
docker-compose logs [service_name]
```

2. 检查资源限制：
```bash
docker stats
```

3. 清理无用容器和镜像：
```bash
docker system prune -a
```

### 数据库连接问题
1. 检查容器网络：
```bash
docker network ls
docker network inspect [network_name]
```

2. 测试数据库连接：
```bash
docker-compose exec db psql -U postgres -d scooter_rental
```

## 维护命令

### 日常维护
```bash
# 更新容器
docker-compose pull
docker-compose up -d

# 查看资源使用
docker stats

# 清理无用数据
docker system prune
```

### 故障恢复
```bash
# 重启服务
docker-compose restart

# 重建服务
docker-compose up -d --build

# 查看服务日志
docker-compose logs -f --tail=100
```

## 扩展部署选项

### Kubernetes部署
项目可以扩展为Kubernetes部署，需要创建以下资源：
- Deployment（后端、前端、数据库）
- Service（负载均衡）
- ConfigMap（配置管理）
- Secret（敏感信息）
- Ingress（路由规则）

### 云平台部署
支持部署到主流云平台：
- **AWS**: ECS + RDS + S3
- **Azure**: AKS + Azure SQL + Blob Storage
- **Google Cloud**: GKE + Cloud SQL + Cloud Storage
- **阿里云**: ACK + RDS + OSS

## 支持与帮助
如有部署问题，请参考：
- [Docker文档](https://docs.docker.com/)
- [Docker Compose文档](https://docs.docker.com/compose/)
- [项目GitHub Issues](https://github.com/your-repo/issues)