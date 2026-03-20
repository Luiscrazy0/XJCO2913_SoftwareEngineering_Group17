---
globs: frontend/src/utils/axiosClient.ts
description: 确保前端API配置正确，避免CORS和路由不匹配问题
alwaysApply: false
---

前端API基础URL必须与后端实际路由匹配。当前后端没有设置全局前缀，因此前端axiosClient的baseURL应为'http://localhost:3000'而不是'http://localhost:3000/api'。所有API调用必须通过src/api/目录下的模块，组件不能直接调用axios。