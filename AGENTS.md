# AGENTS.md

本文件说明 AI 编程助手在本仓库工作时的约定（仓库：`kartwatt-cpu/web-week9`）。

## 这是什么

深圳大学《Web 编程》课程的作业仓库。仓库根目录既是**个人简历页面**（第 5 周响应式布局、
第 6 周加入 JavaScript），也是**第 9 周的 Todo V3.0**：TypeScript 重构 + Vitest 单元测试。

页面仍是纯静态站点：`index.html` + `style.css` + `头像.jpg` + 打包好的 `app.js`。
测试与类型检查需要 Node.js / npm：`npm install` 后跑 `npm run test`、`npm run typecheck`。

## 常用命令

- 预览：直接用浏览器打开 `index.html`（`app.js` 是 IIFE，全部资源走相对路径，`file://` 可用）。
- 起本地服务：`python -m http.server 8000`，然后访问打印出来的地址。
- 类型检查：`npm run typecheck`（即 `tsc --noEmit`）。
- 单元测试：`npm run test`（即 `vitest run`）。
- 重新打包：`npm run build`（先 `tsc --noEmit`，再用 esbuild 把 `app.ts` 打成 `app.js`）。

## 架构

- `index.html`：语义化 `header` / `main` / `footer`。`main` 内是 `.resume-content`
  （`section.todo-section` + 专业技能 + 课程与项目）与 `aside.resume-sidebar`。
  页面末尾用 `<script src="app.js" defer>` 引入打包后的脚本。
- `style.css`：Grid 负责页面分区与卡片轨道，Flex 负责一维排列；`.todo-*` 是 Todo 组件样式。
  选择器只用 class / 元素，**不使用 ID 选择器**。
- `todo.ts`：唯一数据模型 `interface Todo`、`Filter` 字面量联合类型、纯数据操作
  （`addTodo` / `toggleTodo` / `removeTodo` / `editTodo` / `clearCompleted`），
  以及两个脏数据入口的运行时校验（`parseTodoId` / `parseTodos`）。
- `app.ts`：DOM 渲染与事件委托。`todos` 是唯一数据源；每个操作都走
  「改副本 → 替换 → `save()` → `render()`」；`filter` 只是视图状态；DOM 只在 `render()` 里创建。
- `todo.test.ts`：任务 2 的 5 条手写用例；`todo.review.test.ts`：任务 3 的修补用例。

## 编码约定（第 9 周起）

1. **严禁 `any`**：不确定的运行时输入用 `unknown`，进函数后先收窄 / 校验；
   不用非空断言 `!`，不用 `as` 硬转。
2. 两个脏数据入口必须显式校验：`dataset.id` 用 `Number()` + `Number.isSafeInteger`；
   `localStorage` 的 JSON 逐条过 `isTodo`，坏数据丢弃而不是让页面崩。
3. 页面状态不就地修改：`commit()` 先 `slice()` 出副本，操作只改副本，再整体替换。
4. 事件委托只在 `ul.todo-list` 上挂一个 `click`；删除 / 编辑 / 切换三个分支互斥。
5. 测试数据必须写在每个 `test` 内部；断言要验证具体业务结果，禁止只写 `toBeDefined()`。
6. 只改必要的地方，保持既有主题色（`#3b82f6` / `#1d4ed8`）与可访问性属性。

## 交付物

本周提交物是 AI 协作日志 `[王梓健][2024150200]AI协作日志W9.docx`，
其格式由课程模板 `第9周AI协作记录.docx` 固定：正文一律使用默认 `Normal` 样式、
不额外加粗或着色、保留模板原有的字段顺序与提示文字。

**提交物格式规则**：填充模板时要「只换文字、不动格式」——沿用模板既有的段落与 run，
新增段落用模板段落克隆；页面设置（A4、左右 3.17cm、上下 2.54cm）、字体与段落顺序保持不变。
生成脚本为 `_tools/build_docx.py`，配套的格式校验脚本为 `_tools/verify_docx.py`。
