# Web 编程课程实践 · Todo V3.0（TypeScript + 单元测试，第 9 周）

深圳大学《Web 编程》课程作业仓库。第 9 周把第 8 周的 Todo V2.0 从纯 JS 收紧到 TypeScript：数据结构用 `interface Todo` 描述，`dataset.id` 与 `localStorage` 两个脏数据入口都做显式转换与运行时校验，再用 Vitest 手写 5 条“正常 + 边界”用例，最后审查 AI 生成的测试并补上遗漏维度。

- 仓库地址：<https://github.com/kartwatt-cpu/web-week9>
- 直接本地运行：浏览器打开 `index.html` 即可（`app.js` 已打包，全部资源走相对路径，`file://` 也能跑）
- 仅需 Node.js + npm：`npm install` → `npm run test`

## 第 9 周做了什么

- **TypeScript 重构**：拆成 `todo.ts`（数据层）与 `app.ts`（视图层）；`tsconfig.json` 开启 `strict: true` + `noEmit: true`，全程没有 `any`、非空断言 `!` 与 `as` 硬转；
- **两个脏数据入口**：`parseTodoId` 用 `trim` + `/^\d+$/` + `Number.isSafeInteger` 把 `dataset.id` 转成 `number`；`parseTodos` 对 `localStorage` 的 JSON 逐条做 `isTodo` 校验，坏数据直接丢弃；
- **手写 5 条单测**：`addTodo` 正常 / 纯空格 / 空字符串，`toggleTodo` 正常切换 / 不存在的 ID，每条用例内部新建数据、互不共享；
- **AI 审查与修补**：用结构化 Prompt 让 AI 生成测试，指出 `toBeDefined()` 弱断言、`toBe(1)` 期望值写反、顶层数据污染三处问题，并补上 null / undefined、超长文本、类型不匹配、重复、`<script>` 注入、无效 ID 不改数据六类边界；
- **保持页面行为**：事件委托仍只挂在 `ul.todo-list` 上，删除 / 编辑 / 切换三个分支互斥；`app.js` 由 `tsc` 检查、`esbuild` 打包成 IIFE，页面可直接双击打开。

## 文件结构

| 文件 | 作用 |
| --- | --- |
| `todo.ts` | 数据模型、纯数据操作、`parseTodoId` / `parseTodos` 运行时校验 |
| `app.ts` | DOM 渲染与事件委托，调用 `todo.ts` |
| `todo.test.ts` | 任务 2 的 5 条手写用例 |
| `todo.review.test.ts` | 任务 3 的修补用例（null、undefined、类型、超长、重复、安全、无效 ID） |
| `app.js` | `npm run build` 生成的浏览器脚本 |
| `index.html` / `style.css` | 个人简历页面与 Todo 组件样式 |
| `docs/images/test-run-final.png` | `npm run test` 全绿截图（2 个文件、13 条用例） |

## 常用命令

```bash
npm install        # 安装 vitest / typescript / esbuild
npm run typecheck  # tsc --noEmit，只做类型检查
npm run test       # vitest run，跑全部单测
npm run build      # 先类型检查，再把 app.ts 打包成 app.js
```

## 验证方式

1. `npm run typecheck` 零报错；
2. `npm run test` 全绿：手写 5 条 + 修补 8 条，共 13 条；
3. 浏览器打开 `index.html`：添加 → 切换 → 编辑 → 删除 → 三个筛选 → 刷新，数据仍在；
4. 点列表空白处、点带脏 `data-id` 的项，控制台不报错；
5. 控制台 `localStorage.getItem('todos')` 里的 `id` 为 `number`。

## 相关记录

- `[王梓健][2024150200]AI协作日志W9.docx` —— 第 9 周 AI 协作日志（本次提交物）
- `第9周AI协作记录.docx` —— 本周实验记录模板（原始格式）
- `Web编程第9周(1).pptx` / `Web编程第9周实验(1).pptx` —— 本周课件
- `_tools/build_docx.py` / `_tools/verify_docx.py` —— 日志生成与格式校验脚本（已被 `.gitignore` 排除）

## 分支

开发在 `feature/typescript-refactor` 分支完成 TS 重构与单测，验证后合并回 `main`。
