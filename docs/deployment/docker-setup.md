# Docker 部署指南

## 架构

```
客户端 → :8080 (nginx:alpine) → 静态文件 (React SPA)
                               → /api/* → :3001 (NestJS) → :5432 (PostgreSQL 16)
```

## 快速部署

### 1. 准备环境变量

```bash
cp .env.example .env.production
# 编辑 .env.production，填入生产环境密钥
```

### 2. 部署到服务器

```bash
# 打包上传
tar czf /tmp/scooter-deploy.tar.gz \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='.env' \
  --exclude='.env.production' \
  .
scp /tmp/scooter-deploy.tar.gz root@<server>:/tmp/
scp .env.production root@<server>:/opt/scooter/.env

# 解压并启动
ssh root@<server> "mkdir -p /opt/scooter && rm -rf /opt/scooter/* && tar xzf /tmp/scooter-deploy.tar.gz -C /opt/scooter/"
ssh root@<server> "cd /opt/scooter && docker compose up -d --build"
```

### 3. 开放端口

阿里云安全组添加 TCP 8080 入站规则。

### 4. 验证

```bash
curl http://<server>:8080/        # 前端
curl http://<server>:8080/api/    # API
```

## 服务端口

| 服务 | 容器端口 | 主机绑定 | 说明 |
|------|---------|---------|------|
| 前端 (nginx) | 80 | 0.0.0.0:8080 | 公网访问 |
| 后端 (NestJS) | 3001 | 127.0.0.1:3001 | 仅本地/nginx 代理 |
| 数据库 (PostgreSQL) | 5432 | 127.0.0.1:5433 | 仅本地 |

## 更新部署

```bash
# 重新打包、上传、重建
tar czf /tmp/scooter-deploy.tar.gz --exclude='node_modules' --exclude='.git' --exclude='.env' .
scp /tmp/scooter-deploy.tar.gz root@<server>:/tmp/
ssh root@<server> "rm -rf /opt/scooter/* && tar xzf /tmp/scooter-deploy.tar.gz -C /opt/scooter/"
scp .env.production root@<server>:/opt/scooter/.env
ssh root@<server> "cd /opt/scooter && docker compose up -d --build"
```

## 数据库管理

### 备份

```bash
ssh root@<server> "docker exec scooter-postgres-1 pg_dumpall -c -U scooter > dump_\$(date +%Y-%m-%d).sql"
```

### 恢复

```bash
ssh root@<server> "cat dump.sql | docker exec -i scooter-postgres-1 psql -U scooter"
```

## 排查

```bash
# 查看所有服务状态
ssh root@<server> "cd /opt/scooter && docker compose ps"

# 查看日志
ssh root@<server> "cd /opt/scooter && docker compose logs -f --tail=50"

# 重建单个服务
ssh root@<server> "cd /opt/scooter && docker compose up -d --build backend"
```
