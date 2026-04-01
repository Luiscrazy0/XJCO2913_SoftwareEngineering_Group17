# Docker 化方案总览

本仓库当前默认落地的是 **轻量方案（仅 PostgreSQL 容器化）**。

## 轻量方案（已落地）
- 说明：`docs/docker化/轻量方案`
- 执行：`docs/docker化/执行方案`

## 后续可扩展（未落地）
如果需要把前端/后端也容器化（Nginx + NestJS + PostgreSQL），可以在此方案基础上新增 `frontend/Dockerfile`、`backend/Dockerfile` 和全量 `docker-compose.yml`（当前仓库未实现该路径）。

