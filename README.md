# 电动车租赁系统

> 基于NestJS和React的现代化电动车租赁管理系统

## 🌟 功能特性

### 👥 用户功能
- ✅ 用户注册与登录（JWT认证）
- ✅ 电动车发现与搜索
- ✅ 在线预订与支付
- ✅ 预约续租与取消
- ✅ 反馈提交与跟踪
- ✅ 个人资料管理

### 🗺️ 地图功能
- ✅ 高德地图集成
- ✅ 实时位置展示
- ✅ 站点位置标记
- ✅ 距离计算与导航
- ✅ 地理编码服务

### 👨‍💼 管理功能
- ✅ 管理员后台
- ✅ 反馈管理系统
- ✅ 高优先级问题处理
- ✅ 收入统计与分析
- ✅ 车辆与站点管理
- ✅ 用户权限控制

## 🚀 快速开始

```bash
# 克隆项目
git clone <repository-url>
cd XJCO2913_SoftwareEngineering_Group17

# 启动后端服务
cd backend
npm install
npm run start:dev

# 启动前端服务
cd ../frontend
npm install
npm run dev
```

详细设置请查看[开发环境设置文档](./docs/quick-start/development-setup.md)

## 📂 项目结构

```
XJCO2913_SoftwareEngineering_Group17/
├── backend/           # NestJS后端服务
│   ├── src/          # 源代码
│   ├── prisma/       # 数据库配置
│   └── test/         # 测试文件
├── frontend/         # React前端应用
│   ├── src/          # 源代码
│   ├── public/       # 静态资源
│   └── [components/  # React组件
├── docs/             # 项目文档
│   ├── api/          # API文档
│   ├── architecture/ # 架构设计
│   ├── project/      # 项目规划
│   └── sprints/      # Sprint文档
└── docker-compose.yml # Docker编排配置
```

## 📖 详细文档

完整的技术文档和API参考请查看 **[文档目录](./docs/README.md)**

## 🛠️ 技术栈

- **前端**: React 18 + TypeScript + Vite + Tailwind CSS
- **后端**: NestJS + TypeScript + Prisma + PostgreSQL
- **认证**: JWT + bcrypt
- **API文档**: Swagger/OpenAPI
- **地图服务**: 高德地图API
- **容器化**: Docker + Docker Compose
- **数据库**: PostgreSQL
- **邮件服务**: 集成邮件通知

## 📦 部署

项目支持多种部署方式：

1. **本地开发**: 使用npm/yarn运行开发服务器
2. **Docker部署**: 使用docker-compose一键部署
3. **生产环境**: 配置环境变量和反向代理

详细部署指南请查看[部署文档](./docs/deployment/docker-setup.md)

## 🤝 贡献指南

1. Fork项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开Pull Request

## 📄 许可证

本项目遵循MIT许可证。详见[LICENSE](./LICENSE)文件。

## 📞 联系

如有问题或建议，请通过GitHub Issues提交反馈。

---
*电动车租赁系统 - 为可持续城市交通而设计*