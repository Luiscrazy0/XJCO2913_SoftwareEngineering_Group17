---
name: Productization + Security Enhancement
description: Branding, landing page, onboarding, guest mode, admin dashboard, Swagger docs, security hardening for AAA电动车租凭
type: project
---

# AA电动车租凭 — 产品化升级 + 安全加固

## 目标

融合方案 B（产品化升级）与方案 C（技术展示）的核心内容，在一周内完成可演示的产品化改造 + 关键工程展示点。

## 范围

### 方案 B — 品牌塑造 + 商业成熟感

1. **品牌统一**
   - 品牌名: "AAA电动车租凭"
   - Navbar / 页面标题统一
   - Logo SVG（盾牌+闪电图标）

2. **Landing Page** (`/` 路径)
   - HeroSection: 标题 + 副标题 + CTA 按钮 + CSS 背景光晕
   - FeaturesSection: 3 列特色功能卡片
   - HowItWorksSection: 3 步流程（选车→支付→骑行）
   - PricingSection: 时租/日租/月卡对比
   - CTASection: 底部行动号召

3. **游客模式**
   - AuthPage 添加"游客浏览"按钮
   - ScooterListPage / MapPage 对未登录用户可见（但预约需登录）
   - ProtectedRoute 放宽限制

4. **Onboarding 引导**
   - 注册成功后弹出 3 步引导（localStorage 控制仅一次）
   - 步骤: 选车→支付→骑行
   - 全屏半透明遮罩 + 磨砂玻璃卡片

5. **管理后台数据卡片**
   - 今日订单数 / 今日收入 / 活跃车辆数
   - 使用现有统计 API
   - 骨架屏 + 静默降级

6. **骑行计时器**
   - 已有 RideTimer 组件，确认功能完备

### 方案 C — 技术展示

1. **Swagger 装饰器补全**
   - amap / events / health / user 四个模块加 @ApiTags + @ApiOperation

2. **安全加固 (Helmet)**
   - 安装 helmet 包
   - 在 main.ts 注册
   - 配置安全 HTTP 头

3. **报告文档**
   - docs/reports/swagger-security-report.md

## 路由变化

| 路径 | 当前 | 改后 |
|------|------|------|
| `/` | → AuthPage | → LandingPage |
| `/auth` | → AuthPage | 不变 |
| `/scooters` | Protected | 公开（功能受限） |
| `/map` | Protected | 公开（功能受限） |
| 其他 | - | 不变 |

## 组件结构

```
pages/
├── LandingPage.tsx          # 新建
components/landing/
├── HeroSection.tsx          # 新建
├── FeaturesSection.tsx      # 新建
├── HowItWorksSection.tsx    # 新建
├── PricingSection.tsx       # 新建
├── CTASection.tsx           # 新建
components/admin/
├── StatsOverviewCards.tsx   # 新建
components/
├── OnboardingOverlay.tsx    # 新建
```

## 安全加固

- `helmet` 中间件: 设置 Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Strict-Transport-Security 等安全头
- 已存在: ThrottlerModule（限流）、ValidationPipe（输入验证）、CORS 配置

## 未纳入范围

- CI/CD 流水线
- 性能优化（代码分割/懒加载）
- 架构图
- 完整的测试覆盖报告
