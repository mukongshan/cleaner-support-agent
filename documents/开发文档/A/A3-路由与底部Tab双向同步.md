# A3：路由与底部 Tab 双向同步

## 修改点

> 实现路由与底部 Tab 双向同步：用户点击 Tab 时更新 URL；通过链接或浏览器前进/后退进入时，根据 URL 展示对应页面并高亮对应 Tab。

## 实现说明

### 1. Tab 点击 → 更新 URL

- 底部导航栏在 **`src/frontend/src/routes/index.tsx`** 的 `MainLayoutContent` 中实现。
- 每个 Tab 按钮的 `onClick` 使用 `navigate(ROUTES.CHAT)`、`navigate(ROUTES.KNOWLEDGE)`、`navigate(ROUTES.TICKETS)`、`navigate(ROUTES.PROFILE)`，不再用本地 `activeTab` 状态切换内容。
- 点击 Tab 后地址栏变为对应路径，且仅该路径对应的页面通过 `<Outlet />` 渲染。

### 2. URL / 前进后退 → 展示页面并高亮 Tab

- 使用 `useLocation()` 得到当前 `pathname`。
- 使用 **`pathnameToTab(pathname)`**（定义在 `constants/routes.ts`）将路径映射为 Tab 高亮键：`/chat`、`/knowledge`、`/tickets`、`/profile`。
- 规则示例：  
  - `pathname === '/chat'` 或以 `/chat/` 开头 → 高亮「问答」  
  - `/knowledge`、`/knowledge/` → 高亮「知识库」  
  - `/tickets`、`/tickets/123` 等 → 高亮「工单」  
  - `/profile`、`/profile/` → 高亮「个人中心」
- 底部 Tab 的高亮样式根据 `activeTab === pathnameToTab(location.pathname)` 判断。

### 3. 验收要点

- 点击任一底部 Tab，URL 变为对应路径，且内容为对应页面。
- 在地址栏输入或通过链接进入某路径（如 `/tickets`），展示对应页面且底部 Tab 高亮正确。
- 浏览器前进/后退后，页面与 Tab 高亮与 URL 一致。
