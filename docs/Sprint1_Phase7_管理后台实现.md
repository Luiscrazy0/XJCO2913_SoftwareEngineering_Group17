整理完 Sprint 1 阶段7内容后，可以得到一个完整的管理后台实现文档和落地方案。核心可以总结如下：

---

# Sprint 1 - 阶段7：管理后台实现总结

## 目标

为管理员提供完整车辆管理能力，包括查看车辆列表、添加车辆，并保证权限控制和系统安全。

## 完成标准

* AdminFleetPage 页面完成
* 车辆管理表格实现
* 添加车辆表单与弹窗功能
* 集成 GET /scooters 与 POST /scooters
* 管理员权限验证完整

## 页面架构

```
/pages/admin/AdminFleetPage.tsx
/layouts/AdminLayout.tsx
/components/admin/
  ├── FleetTable.tsx
  ├── AddScooterModal.tsx
  ├── FleetStats.tsx
  └── StatusBadge.tsx
```

* **AdminLayout**: 侧边栏导航 + Topbar + 内容区
* **FleetTable**: 显示车辆列表，支持状态标签
* **StatusBadge**: 统一管理状态显示颜色
* **FleetStats**: 统计车辆数量与状态分布
* **AddScooterModal**: 表单弹窗添加新车辆

## 数据层

* **TanStack Query** 用于缓存和刷新车辆数据
* **QueryKey** 统一管理

  ```ts
  scooters: ['scooters']
  ```
* **API 层**

  ```ts
  getScooters() → GET /scooters
  createScooter(data) → POST /scooters
  ```
* **Mutation**

  * 成功后自动刷新车辆列表
  * 显示 Toast 提示

## 核心功能

* 车辆状态显示：

  * AVAILABLE → 绿色
  * BOOKED → 黄色
  * MAINTENANCE → 红色
* 添加车辆表单：

  * location 必填
  * status 默认 AVAILABLE
* 数据管理：

  * 页面加载时获取所有车辆
  * 添加成功后刷新列表
  * 错误提示与重试机制
* 权限控制：

  * ProtectedRoute 校验 MANAGER
  * 非管理员显示 403 页面
  * 前端按钮/操作根据角色显示

## 页面状态处理

* Loading → Spinner
* Error → ErrorState
* Empty → EmptyState 提示

## 安全与用户体验

* 后端严格验证 role
* 前端守卫避免未授权访问
* 操作反馈（Toast）与确认弹窗
* 键盘操作和表单验证增强体验

## 验证测试

* MANAGER 能访问 /admin，CUSTOMER 无法访问
* 表格数据完整显示
* 添加车辆功能正常
* 状态样式正确
* API 错误处理、响应式布局测试
* 统计信息准确

## MVP 判定

* 能查看所有车辆
* 能添加车辆并刷新表格
* 非管理员无法访问
* Token 认证正常工作

## 下一步建议

1. **Edit Scooter Status（PATCH /scooters/:id/status）**

   * 完整管理闭环
2. 表格增强（排序、搜索）
3. 管理员视角的 Booking 管理
