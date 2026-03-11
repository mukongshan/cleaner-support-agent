# A1：引入 React Router 与根组件配置

## 修改点

> 引入 React Router（或等价方案），在项目中配置路由与根组件。

## 实现说明

### 1. 依赖

- 在 `src/frontend/package.json` 中新增依赖：`react-router-dom`（建议 `^6.28.0`）。
- 安装：在 frontend 目录下执行 `npm install react-router-dom`。

### 2. 根组件与路由挂载

- **入口 `src/frontend/src/main.tsx`**  
  - 使用 `BrowserRouter` 包裹整个应用，保证路由在根级可用。  
  - 结构：`ErrorBoundary` → `BrowserRouter` → `App`。

- **应用根组件 `src/frontend/src/App.tsx`**  
  - 仅负责全局 Provider（如 `LanguageProvider`）与路由入口。  
  - 通过 `AppRoutes` 渲染 `Routes`，具体路由表在 `src/frontend/src/routes/index.tsx` 中定义。

### 3. 路由配置位置

- 路由表集中在 **`src/frontend/src/routes/index.tsx`** 中维护（与设计约定「App.tsx 或 src/routes/index.tsx 二选一」一致）。
- 根组件只做包装与 `<AppRoutes />` 的挂载，不在此处手写 `<Route>`。

### 4. 验收要点

- 访问前端应用时，地址栏可随导航变化（在完成 A2、A3 后验证）。
- 刷新页面不报错，仍由 React 应用接管（SPA）。
- 未配置路径访问时由后续 404 路由处理（见 A5）。
