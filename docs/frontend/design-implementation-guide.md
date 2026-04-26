为了帮你精准落地“迈凯伦风”设计，我将按你梳理的 **P0-P2 优先级**，列出每一阶段需要修改或新建的关键文件名及核心操作。

---

### 🏎️ P0：统一底座与全局规范（基础加固）

这一步的目标是清理 Vite 模板痕迹，建立赛道感的色彩体系。

* **`frontend/src/index.css`**
    * **操作**：删除 `#root` 的居中和边框样式；定义 `@theme` 变量（橙、黑、灰、线）。
* **`frontend/src/utils/axiosClient.ts`**
    * **操作**：将硬编码的 URL 替换为 `import.meta.env.VITE_API_BASE_URL`。
* **`frontend/.env` (新建)**
    * **操作**：写入 `VITE_API_BASE_URL=http://localhost:3000`。
* **`frontend/src/context/ToastContext.tsx`**
    * **操作**：修改 Toast 样式，将背景设为深灰（#111827），边框设为橙色细线。

---

### 🛠️ P1：最小 Design System（原子组件）

这一步在 `components/ui/` 文件夹下建立可复用的“零件”。

* **`frontend/src/components/ui/Button.tsx` (新建)**
    * **功能**：实现 3D 压感逻辑，封装 Primary (橙), Secondary (黑), Danger (红)。
* **`frontend/src/components/ui/Input.tsx` (新建)**
    * **功能**：深色背景、橙色 Focus 光晕、下方 1px 细线。
* **`frontend/src/components/ui/Card.tsx` (新建)**
    * **功能**：带 `#374151` 边框和碳纤维微纹理的容器。
* **`frontend/src/components/ui/Badge.tsx` (新建)**
    * **功能**：用于状态显示（如 AVAILABLE 绿点、BOOKED 灰点）。
* **`frontend/src/components/Navbar.tsx`**
    * **操作**：将导航栏改为半透明磨砂黑，增加底部 1px 橙色/灰色区分线。

---

### 🏗️ P2：页面级重构（视觉飞跃）

将原子组件拼装到现有页面，彻底替换掉旧样式。

* **`frontend/src/pages/AuthPage.tsx`**
    * **操作**：**彻底重写**。移除所有 inline `style={{...}}`，改用 `Button` 和 `Input` 组件，卡片居中。
* **`frontend/src/pages/ScooterListPage.tsx`**
    * **操作**：
        * 引入 `Card` 和 `Badge`。
        * 重构 Grid 布局，将车辆图片与下方数据用灰线（`border-t border-mclaren-line`）隔开。
        * 数据部分切换为 `font-mono` 字体。
* **`frontend/src/pages/MyBookingsPage.tsx`**
    * **操作**：
        * 删除页面内的 `notification` 逻辑，统一调用 `useToast`。
        * 预约项之间使用 `border-b border-mclaren-line` 区分。
* **`frontend/src/pages/AdminFleetPage.tsx`**
    * **操作**：
        * 重写统计卡片（Statistics Cards）为 3D 悬浮效果。
        * 表格行增加 Hover 时的橙色左边框（Accent Line）。

---

### 🏁 P3：高级体验与调试（最后打磨）

* **`frontend/src/components/DebugPanel.tsx` (新建或从 Page 移入)**
    * **操作**：将原有的 `DEV` 调试信息封装成侧边抽屉或可折叠面板，标记为“PIT STOP”。
* **`frontend/src/router/AppRouter.tsx`**
    * **操作**：检查所有页面跳转，确保使用 `useNavigate` 而非 `window.location`，保持 SPA 的丝滑感。

---

**💡 执行建议：**
先从 **`index.css`** 和 **`Button.tsx`** 开始。当你看到第一个“迈凯伦橙” 3D 按钮在黑色背景上亮起时，整个项目的开发动力会瞬间提升。

如果你在修改 `AuthPage` 的 inline styles 时遇到棘手的逻辑耦合，可以发代码片段给我，我帮你做“无痛剥离”。