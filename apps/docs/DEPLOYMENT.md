# Deployment Guide - SemaJSX Docs

本文档说明如何将 SemaJSX 文档站点部署到 Vercel。

## 前置要求

- Vercel 账号
- GitHub 仓库已连接到 Vercel

## Vercel 部署配置

### 方法 1: 使用 vercel.json（推荐）

项目中已包含 `vercel.json` 配置文件，包含了完整的构建和部署设置。

### 方法 2: 在 Vercel Dashboard 手动配置

如果您更喜欢在 Vercel 控制台配置，请使用以下设置：

#### Project Settings

**Framework Preset**: Other

**Root Directory**: `apps/docs`

**Build & Development Settings**:

- **Build Command**:

  ```bash
  cd ../.. && bun install && cd packages/semajsx && bun run build && cd ../../apps/docs && bun run build
  ```

- **Output Directory**: `dist`

- **Install Command**:
  ```bash
  bun install
  ```

#### Environment Variables

当前项目不需要额外的环境变量。

## 部署步骤

### 1. 连接 GitHub 仓库

1. 登录 [Vercel Dashboard](https://vercel.com)
2. 点击 "New Project"
3. 选择您的 `semajsx` 仓库
4. 点击 "Import"

### 2. 配置项目

#### 选项 A: 使用 vercel.json（自动配置）

Vercel 会自动检测 `apps/docs/vercel.json` 并应用配置。您只需要：

1. 设置 Root Directory 为 `apps/docs`
2. 点击 "Deploy"

#### 选项 B: 手动配置

按照上面"方法 2"中的设置手动配置。

### 3. 部署

点击 "Deploy" 按钮开始部署。首次部署大约需要 2-3 分钟。

### 4. 配置自定义域名（可选）

1. 在项目设置中点击 "Domains"
2. 添加您的自定义域名
3. 按照 Vercel 的说明配置 DNS

## 部署后验证

部署完成后，访问 Vercel 提供的 URL，验证以下页面：

- ✅ 首页: `/`
- ✅ 文档列表: `/docs`
- ✅ 单个文档页: `/docs/getting-started`
- ✅ 指南列表: `/guides`
- ✅ 单个指南页: `/guides/building-a-counter`

## 自动部署

Vercel 会自动为以下情况触发部署：

- **Production**: 推送到 `main` 分支时
- **Preview**: 创建或更新 Pull Request 时

## 性能优化

`vercel.json` 已包含以下优化：

- ✅ 静态资源缓存（CSS, JS, 图片）
- ✅ 安全头部（X-Content-Type-Options, X-Frame-Options, X-XSS-Protection）
- ✅ HTML 文件自动重写（支持无扩展名 URL）

## 故障排查

### 构建失败

1. **检查依赖安装**

   ```bash
   # 本地测试构建
   cd apps/docs
   bun install
   bun run build
   ```

2. **检查 semajsx 包构建**

   ```bash
   cd packages/semajsx
   bun run build
   ```

3. **查看 Vercel 构建日志**
   - 在 Vercel Dashboard 中查看详细的构建日志
   - 检查是否有依赖或构建错误

### 页面 404

1. **检查路由配置**
   - 确认 `build.tsx` 中的路由配置正确
   - 确认对应的内容文件存在于 `content/` 目录

2. **检查构建输出**
   ```bash
   # 本地查看构建输出
   ls -R dist/
   ```

### 样式缺失

1. **检查 CSS 生成**
   - 确认 Tailwind CSS 正确生成
   - 检查 `dist/` 中是否包含 CSS 文件

2. **检查 HTML 中的 CSS 引用**
   - 打开生成的 HTML 文件
   - 确认 `<style>` 或 `<link>` 标签正确

## 注意事项

### Monorepo 部署

由于这是一个 monorepo 项目，构建命令需要：

1. 从根目录安装依赖（包括 workspace 链接）
2. 构建 `semajsx` 包（docs 的依赖）
3. 构建 docs 应用

这就是为什么 `buildCommand` 需要在多个目录间切换。

### Bun 支持

Vercel 原生支持 Bun 运行时，所以：

- ✅ 使用 `bun install` 而不是 `npm install`
- ✅ 使用 `bun run` 执行脚本
- ✅ 更快的安装和构建速度

## 更多资源

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel CLI](https://vercel.com/docs/cli)
- [Custom Domains](https://vercel.com/docs/concepts/projects/custom-domains)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

## 本地预览

在推送到 Vercel 之前，您可以本地预览：

```bash
# 构建站点
cd apps/docs
bun run build

# 预览构建结果
bun run serve
```

然后访问 `http://localhost:4173`
