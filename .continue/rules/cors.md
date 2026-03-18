---
description: 避免前端因CORS问题无法访问后端API
alwaysApply: true
---

所有后端API服务必须显式配置CORS，允许前端应用跨域访问。CORS配置应包括：允许的前端域名、支持的HTTP方法、允许的请求头、是否允许携带凭证。开发环境中应允许本地开发服务器（如localhost:5173）的跨域请求。