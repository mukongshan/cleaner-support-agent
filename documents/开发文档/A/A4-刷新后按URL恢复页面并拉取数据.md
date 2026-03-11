# A4：刷新后按 URL 恢复页面并拉取数据

## 修改点

> 确保刷新页面后根据当前 URL 恢复对应页面并重新拉取该页所需数据。

## 实现说明

### 1. 页面由路由驱动

- 所有主视图均对应独立路由（见 A2），刷新后 React Router 根据当前 URL 匹配路由并渲染对应组件。
- 不再依赖内存中的 `activeTab` 或 `selectedTicket`，因此刷新后不会「回到默认 Tab」。

### 2. 数据拉取与 URL 绑定

- **列表/静态页**（如 `/chat`、`/knowledge`、`/tickets`、`/profile`）  
  - 组件在挂载时（或 `useEffect` 依赖 pathname/params）自行拉取数据。  
  - 刷新后组件重新挂载，会再次执行拉取逻辑，从而得到最新数据。

- **工单详情 `/tickets/:id`**  
  - 由 **`TicketDetailRoute`**（`src/frontend/src/pages/TicketDetailRoute.tsx`）根据 `useParams().id` 调用 `getTicketDetail(id)` 拉取详情。  
  - 刷新后重新执行该逻辑，即根据当前 URL 的 `id` 重新请求详情。

### 3. 验收要点

- 在任意有效路径下刷新（如 `/tickets`、`/tickets/123`），页面仍为该路径对应内容。
- 工单详情页刷新后，该工单数据会重新从接口拉取并展示。
