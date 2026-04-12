# 高德地图API集成指南

## 概述

本文档详细介绍了如何在滑板车租赁系统中集成高德地图API，包括环境配置、API Key申请、组件集成和安全注意事项。

## 1. 高德地图API Key申请

### 1.1 注册高德开放平台账号
1. 访问 [高德开放平台](https://lbs.amap.com/)
2. 注册新账号或使用现有账号登录
3. 完成实名认证（个人或企业）

### 1.2 创建应用并获取API Key
1. 进入控制台 -> 应用管理 -> 我的应用
2. 点击"创建新应用"
3. 填写应用信息：
   - 应用名称：滑板车租赁系统
   - 应用类型：Web端(JS API)
4. 为应用添加Key：
   - Key名称：Web端JS API Key
   - 服务平台：Web端(JS API)
   - 域名白名单：添加你的域名（开发时可使用 `localhost` 和 `127.0.0.1`）

### 1.3 获取的API Key
- **JS API Key**: 用于前端地图显示
- **Web API Key**: 用于后端地理编码、路径规划等（可选）

## 2. 环境配置

### 2.1 更新环境变量
在项目根目录的 `.env` 文件中添加：

```bash
# 高德地图API
VITE_AMAP_JS_KEY=your_js_api_key_here
VITE_AMAP_WEB_KEY=your_web_api_key_here
```

### 2.2 更新环境变量示例文件
`.env.example` 文件已包含占位符：

```bash
# 高德地图API
VITE_AMAP_WEB_KEY=your_web_api_key_here
VITE_AMAP_JS_KEY=your_js_api_key_here
```

## 3. 组件集成

### 3.1 已创建的组件

#### 3.1.1 类型定义 (`frontend/src/types/amap.d.ts`)
- 定义了高德地图相关的TypeScript类型
- 包括地图配置、标记点、信息窗口等接口

#### 3.1.2 地图组件 (`frontend/src/components/map/AmapMap.tsx`)
- 可复用的高德地图React组件
- 支持标记点、用户位置、点击事件等
- 内置加载状态和错误处理

#### 3.1.3 地图页面 (`frontend/src/pages/MapPage.tsx`)
- 已集成高德地图组件
- 替换了原有的模拟地图
- 保持原有UI布局和交互逻辑

### 3.2 组件特性

#### 地图功能
- ✅ 真实地图显示（高德地图）
- ✅ 站点标记点（根据可用车辆数量显示不同颜色）
- ✅ 用户位置标记
- ✅ 标记点点击交互
- ✅ 信息窗口显示站点详情
- ✅ 地图图例说明

#### 交互功能
- ✅ 点击站点列表项 → 地图居中显示该站点
- ✅ 点击地图标记点 → 显示站点详情
- ✅ 点击地图空白处 → 取消选中站点
- ✅ 用户位置获取和显示

#### 状态管理
- ✅ 加载状态显示
- ✅ 错误处理
- ✅ 数据缓存（5分钟）

## 4. 安全注意事项

### 4.1 API Key安全
- **JS API Key**: 会暴露在浏览器中，但仅用于地图显示是安全的
- **Web API Key**: 包含更多权限，建议通过后端代理调用
- **域名白名单**: 务必配置域名白名单限制

### 4.2 建议的安全措施
1. **开发环境**: 使用测试Key，配置 `localhost` 和 `127.0.0.1` 到白名单
2. **生产环境**: 
   - 使用独立的Key
   - 配置生产域名到白名单
   - 定期轮换Key
3. **监控**: 关注API使用量和异常调用

### 4.3 后端代理（可选增强）
对于敏感操作（如地理编码、路径规划），建议通过后端代理：

```typescript
// 后端路由示例
@Get('geocode')
async geocode(@Query('address') address: string) {
  const apiKey = process.env.AMAP_WEB_KEY;
  const response = await axios.get(
    `https://restapi.amap.com/v3/geocode/geo?address=${address}&key=${apiKey}`
  );
  return response.data;
}
```

## 5. 测试验证

### 5.1 测试页面
已创建测试页面：`frontend/src/test-amap.html`
- 环境变量测试
- 高德地图API加载测试
- 地图功能测试
- 站点数据测试

### 5.2 验证步骤
1. 配置正确的API Key到 `.env` 文件
2. 启动前端开发服务器：`npm run dev`
3. 访问地图页面：`/map`
4. 验证功能：
   - 地图是否正确加载
   - 站点标记点是否正确显示
   - 点击交互是否正常
   - 用户位置是否获取

## 6. 故障排除

### 6.1 常见问题

#### 地图无法加载
1. 检查API Key是否正确
2. 检查域名是否在白名单中
3. 检查网络连接
4. 查看浏览器控制台错误信息

#### 标记点不显示
1. 检查站点数据是否加载
2. 检查经纬度坐标格式
3. 查看组件控制台日志

#### 用户位置无法获取
1. 检查浏览器位置权限
2. 检查HTTPS环境（某些浏览器要求HTTPS）

### 6.2 调试工具
1. 浏览器开发者工具 → Console
2. 高德地图调试工具：`AMap.plugin('AMap.ToolBar')`
3. 网络请求监控

## 7. 性能优化

### 7.1 地图优化
- 使用合适的缩放级别
- 限制标记点数量（分页或聚合）
- 使用地图缓存

### 7.2 数据优化
- 实现数据分页
- 使用虚拟滚动
- 缓存API响应

### 7.3 代码优化
- 组件懒加载
- 图片和资源优化
- 代码分割

## 8. 扩展功能（未来增强）

### 8.1 地理编码服务
- 地址转坐标
- 坐标转地址

### 8.2 路径规划
- 用户位置到站点的路线
- 距离和时间计算

### 8.3 地图样式
- 自定义地图样式
- 夜间模式
- 主题切换

### 8.4 高级功能
- 热力图显示
- 区域边界
- 实时交通

## 9. 部署指南

### 9.1 开发环境
1. 使用测试API Key
2. 配置本地域名白名单
3. 启用详细日志

### 9.2 生产环境
1. 申请生产API Key
2. 配置生产域名白名单
3. 启用API使用监控
4. 设置使用量告警

### 9.3 CI/CD集成
1. 环境变量管理
2. 自动化测试
3. 部署验证

## 10. 相关资源

### 10.1 官方文档
- [高德地图JS API文档](https://lbs.amap.com/api/javascript-api/summary)
- [Web服务API文档](https://lbs.amap.com/api/webservice/summary)
- [示例中心](https://lbs.amap.com/demo-center/js-api)

### 10.2 开发工具
- [API Key管理](https://console.amap.com/)
- [在线调试工具](https://lbs.amap.com/api/javascript-api/example/map-lifecycle/map-show)
- [样式编辑器](https://lbs.amap.com/api/javascript-api/guide/map-styles/style-edit)

### 10.3 技术支持
- [开发者论坛](https://lbsbbs.amap.com/)
- [工单系统](https://console.amap.com/ticket)
- [客服电话：400-810-0080](tel:4008100080)

---

## 附录：API使用限制

### 免费额度
- JS API：无限制
- Web服务API：每日限额（根据认证级别）

### 收费说明
- 超出免费额度后按量计费
- 具体价格参考官方定价

### 最佳实践
1. 合理使用缓存
2. 批量处理请求
3. 监控使用量
4. 设置预算告警