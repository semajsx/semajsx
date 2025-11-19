# SSR Islands 实现对比

## 两种方案

SemaJSX 现在提供**两种 Island 架构实现**：

### 1. 完全打包方案（Bun.build）

```tsx
import { createRouter } from "semajsx/server";

const router = createRouter({
  "/": () => <App />,
});
```

**工作原理**：

- 使用 `Bun.build` 将每个 Island + 所有依赖打包成单个文件
- 每个 Island 约 18KB（包含完整的 semajsx/dom）
- 浏览器获得自包含的 bundle，无需额外请求

**优势**：

- ✅ **零配置** - 无需 dev server
- ✅ **简单部署** - 生成的是标准 JS 文件
- ✅ **可靠性高** - 不依赖模块解析
- ✅ **适合生产** - 预打包，加载稳定

**劣势**：

- ❌ **重复代码** - 每个 Island 都包含一份 semajsx
- ❌ **无法共享依赖** - 浏览器无法缓存共享模块
- ❌ **构建较慢** - 每次修改都要重新打包
- ❌ **bundle 较大** - 18KB x Island 数量

### 2. Vite 模块方案（推荐）

```tsx
import { createViteRouter } from "semajsx/server";

const router = await createViteRouter(
  {
    "/": () => <App />,
  },
  { dev: true },
);
```

**工作原理**：

- 使用 Vite dev server 实时转换模块
- 保留 ESM import，让浏览器按需加载
- 所有 Island 共享同一份 semajsx/dom
- 依赖可以被浏览器长期缓存

**优势**：

- ✅ **共享依赖** - semajsx 只加载一次
- ✅ **浏览器缓存** - 依赖可以长期缓存
- ✅ **即时编译** - 无需等待打包
- ✅ **代码分割** - 自动按需加载
- ✅ **开发体验** - HMR 就绪
- ✅ **更小的首屏** - 依赖共享，总体积更小

**劣势**：

- ❌ **需要 Vite** - 增加一个依赖
- ❌ **模块请求** - 首次加载会有多个请求（但可缓存）

## 性能对比

### 场景：页面有 3 个 Island

#### 方案 1: 完全打包

```
浏览器请求：
- /islands/island-0.js  → 18KB（包含 semajsx）
- /islands/island-1.js  → 18KB（包含 semajsx）
- /islands/island-2.js  → 18KB（包含 semajsx）

总计：54KB
重复代码：3 份 semajsx
缓存效率：低（每个 island 独立）
```

#### 方案 2: Vite 模块

```
浏览器请求：
- /islands/island-0.js  → 1KB  （仅入口点）
- /@fs/.../semajsx/dom/index.ts → 15KB（转换后，所有 island 共享）
- /islands/island-1.js  → 1KB
- /islands/island-2.js  → 1KB

总计：18KB
重复代码：0
缓存效率：高（semajsx 可以永久缓存）
```

**结论**：Vite 方案总体积减少 **67%**！

## 使用示例

### 完全打包方案

```tsx
// server.tsx
import { createRouter } from "semajsx/server";

const router = createRouter({
  /* routes */
});

// 处理请求
const { html, scripts } = await router.get("/");
// scripts: <script src="/islands/island-0.js"></script>

// Island 代码请求
const code = await router.getIslandCode("island-0");
// 返回完整的打包代码（~18KB）
```

### Vite 方案

```tsx
// server-vite.tsx
import { createViteRouter } from "semajsx/server";

const router = await createViteRouter(
  {
    /* routes */
  },
  { dev: true },
);

// 处理 Island 入口点请求
if (url.startsWith("/islands/")) {
  const code = await router.getIslandEntryPoint(islandId);
  // 返回：import { render } from 'semajsx/dom'
  //      import * as Comp from '/@fs/...'
}

// 处理模块转换请求
if (url.startsWith("/@") || url.includes("semajsx")) {
  const result = await router.handleModuleRequest(url);
  // Vite 转换模块并返回
}
```

## 运行示例

```bash
# 完全打包方案
bun run example:ssr

# Vite 方案（推荐）
bun run example:ssr:vite
```

## 选择建议

### 使用完全打包（Bun.build）

- 🎯 **生产部署** - 需要可预测的静态文件
- 🎯 **简单场景** - 只有 1-2 个 Islands
- 🎯 **无 Node 环境** - CDN 静态托管

### 使用 Vite 方案（推荐）

- 🎯 **开发环境** - 最佳开发体验
- 🎯 **多个 Islands** - 共享依赖，节省流量
- 🎯 **性能优先** - 需要最小化传输体积
- 🎯 **现代应用** - 充分利用浏览器缓存

## 混合使用

你可以在不同环境使用不同方案：

```tsx
const isDev = process.env.NODE_ENV === "development";

const router = isDev
  ? await createViteRouter(routes, { dev: true })
  : createRouter(routes); // 生产用打包版本
```

## 未来优化

- [ ] 生产模式 Vite 预构建
- [ ] 智能代码分割
- [ ] HTTP/2 Server Push
- [ ] 更激进的缓存策略
