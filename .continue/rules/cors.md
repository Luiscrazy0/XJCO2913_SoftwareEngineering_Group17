---
globs: backend/src/main.ts
description: 确保CORS配置能够灵活支持Vite开发服务器的不同端口，避免端口冲突导致的CORS错误
alwaysApply: false
---

后端CORS配置必须使用正则表达式匹配Vite开发服务器的任意51xx端口（如5173、5174、5175等）。正则表达式应为：/^https?:\/\/(localhost|127\.0\.0\.1):51[0-9]{2}$/。必须允许无origin的请求（如移动应用或curl）。需要在控制台记录被CORS阻止的请求以便调试。