---
globs: backend/src/main.ts
description: 防止NestJS应用启动函数重复调用导致的问题
alwaysApply: false
---

NestJS应用的bootstrap()函数只能被调用一次，不能重复调用。确保main.ts文件末尾只有一个bootstrap()调用。