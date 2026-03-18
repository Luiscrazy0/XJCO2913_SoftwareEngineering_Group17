---
description: 确保所有API端点都正确支持CORS，避免前端访问问题
alwaysApply: true
---

部署后端服务后，必须验证所有API端点是否正确处理CORS请求。测试应包括：1) 普通请求的CORS头返回 2) OPTIONS预检请求的正确响应 3) 不同HTTP方法的CORS支持 4) 前端实际访问测试