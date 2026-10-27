# AGENTS.md

本文件说明 AI 编程助手在本仓库工作时的约定（仓库：`kartwatt-cpu/web-week7`）。

## 这是什么

深圳大学《Web 编程》课程的作业仓库。仓库根目录既是**个人简历页面**（第 5 周响应式布局、
第 6 周加入 JavaScript），也是**第 7 周的 Todo V2.0**：数据驱动重构 + `localStorage` 持久化 + 筛选。
纯静态站点：`index.html` + `style.css` + `头像.jpg`，没有构建工具、包管理器或测试框架。

## 常用命令

- 预览：直接用浏览器打开 `index.html`（全部资源走相对路径，`file://` 可用）。
- 起本地服务：`python -m http.server 8000`，然后访问打印出来的地址。
- 语法自检：`node --check <提取出的 js>`（页面里的脚本是内联的，改动后建议单独过一遍）。
- 手动回归：添加 → 切换 → 删除 → 三个筛选 → 刷新 → 控制台 `localStorage.getItem('todos')`。

## 架构

- `index.html`：语义化 `header` / `main` / `footer`。`main` 内是 `.resume-content`
  （`section.todo-section` + 专业技能 + 课程与项目）与 `aside.resume-sidebar`。
  页面末尾一个 IIFE 形式的 `<script>`，确保 DOM 已加载。
- `style.css`：Grid 负责页面分区与卡片轨道，Flex 负责一维排列；`.todo-*` 是 Todo 组件样式。
  选择器只用 class / 元素，**不使用 ID 选择器**。
- Todo 状态机：唯一数据源 `todos`；三个操作都「生成新数组 → `save()` → `render()`」；
  `filter` 是视图状态，只影响渲染；DOM 只在 `render()` 里创建。

## 编码约定（第 7 周起）

1. 不许就地修改：不用 `push` / `splice` / 直接改对象属性，改用 `concat` / `filter` / `map` + `Object.assign`。
2. 每个操作函数结尾固定 `save(); render();`，不要只做其中一步。
3. 功能函数里禁止出现 `createElement` / `appendChild` / `innerHTML` / `removeChild`，DOM 操作集中在 `render()`。
4. 代码风格沿用第 5/6 周的 ES5 写法（`var` + `function`），不引入构建工具；
   但循环里创建元素并绑定事件时不要用 `var` 声明循环变量（闭包会共享同一个变量），
   改用 `forEach` 或 `let`。
5. 边界要设防：空输入、`id` 撞号、`localStorage` 读写异常都要处理，坏数据不能让整页脚本挂掉。
6. 只改必要的地方，保持既有主题色（`#3b82f6` / `#1d4ed8`）与可访问性属性。

## 交付物

本周提交物是 AI 协作日志 `docs/[王梓健][2024150200]AI协作日志W7.docx`，
其格式由课程模板 `docs/第7周AI协作记录.docx` 固定：正文一律使用默认 `Normal` 样式、
不额外加粗或着色、保留模板原有的字段顺序与提示文字。

**提交物格式规则**：填充模板时要「只换文字、不动格式」——沿用模板既有的段落与 run，
新增段落用模板段落克隆；页面设置（A4、左右 3.17cm、上下 2.54cm）、字体与段落顺序保持不变。
生成脚本为仓库外的 `_tools/build_docx.py`，配套的格式校验脚本为 `_tools/verify_docx.py`。
