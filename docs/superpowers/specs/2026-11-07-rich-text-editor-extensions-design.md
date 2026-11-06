# Rich Text Editor — 插件扩展设计

- **日期**：2026-11-07
- **分支**：`feature/doc-editor`
- **状态**：已批准

## 1. 意图与动机

Blocove 的 rich text editor 目前只覆盖基础形状：文本、段落、硬换行、标题、代码块、折叠块、图片、表格，以及 bold / italic / underline / strike / code / link 六个行内标记。

用户要求在 `rich-text-editor` 家族上支持 19 组更多 Tiptap 插件：节点类（blockquote、list、emoji、mathematics、mention）、标记类（highlight、ruby、subscript、superscript、text-style），以及功能类（menus、text-style 控件、drag handle、file handler、find & replace、focus/gapcursor/trailing node、typography、unique id、invisible characters）。

**为什么现在做**：这个仓库的卖点是「可组合的 Tiptap 编辑器组件」。当前可组合的清单太短，用户搭建真实文档编辑器时会在缺口处直接遇到能力上限。补齐这批扩展后，Blocove 的编辑器家族才配得上 README 里「composable building blocks」的定位。

**成功的样子**：文档站上每一项都能独立安装、独立演示、独立测试；用户只装自己需要的那几项，得到恰好够用的编辑器。

## 2. 目标

1. 19 组插件全部以 registry item 的形式交付，遵循仓库既有规范（一个 item + 一个文档页 + 一个示例 + 导航 + 测试）。
2. 每一项都可单独安装使用，不隐式要求用户安装额外的 Blocove item。
3. `pnpm run check` 全绿（preset:check → registry:prepare → typecheck → lint → test:coverage → test:e2e → build）。
4. 现有 330 个单元测试零回归；现有 item 的导出与 props 不变。

## 3. 非目标

- 不提供 Collaboration 的 registry item 与示例（依赖随 drag-handle 的 peer 链被动引入，但不暴露任何协作 API）。
- 不为新节点引入主题 CSS / CSS 变量；样式只用 Tailwind 工具类或复用 `typeset.css` 既有规则。
- 不升级 Tiptap 版本（继续锁 `3.32.2`）。
- 不重写现有 item 的内部实现。

## 4. 反目标（即使技术可行也算失败）

- 用户装了 `rich-text-editor-color`，却在运行时因为缺 `TextStyle` 报错。
- 文档页只有 API 表格、没有可交互演示。
- 为了「省事」把所有扩展塞进一个巨型 item，牺牲可组合性。
- 引入了 peer 依赖却不在文档里说明，用户在关闭 `autoInstallPeers` 的项目里踩坑。

## 5. 约束（已核实）

| 约束           | 说明                                                                                                |
| -------------- | --------------------------------------------------------------------------------------------------- |
| 文件归属       | `tests/unit/registry/manifest.test.ts`：`src/registry/blocove/**` 下每个源文件必须恰好属于一个 item |
| 版本 pin       | item 的 `dependencies` 版本必须与 `package.json` 完全一致                                           |
| 导航完整性     | `docsNav` 必须不重不漏列全所有非 `internal` item                                                    |
| 文档页         | 每个 nav item 必须有 `src/docs/pages/**` 页面；反向也不允许多余页面                                 |
| snippet 可解析 | 生成的 usage 片段中的每个导入必须能在对应 item 的已发布模块中找到同名函数导出                       |
| 产物一致性     | `src/generated/registry.json` 必须镜像源 manifest；`public/r` 不得有陈旧 payload                    |
| 命名空间       | 文件 `target` 必须落在 `components/blocove/` 或 `lib/blocove/`                                      |

## 6. 方案对比

### 方案 A：严格一扩展一 item（完全沿用 bold/italic 模式）

最灵活，但 `@tiptap/extension-text-style` 会被拆成 `text-style` + `color` + `background-color` + `font-family` + `font-size` + `line-height` 六个互相依赖的 item。用户想用字号得装两个包，且文档要解释依赖顺序。

### 方案 B：全部合并成一个 `rich-text-editor-extras`

安装最省事，但一个 item 里塞 19 个扩展、十几个组件，用户无法裁剪 bundle，也失去了这个仓库的核心卖点。

### 方案 C：按家族合并，只有不可分割的才合并（**采用**）

- 独立节点/标记各自一个 item（blockquote、emoji、mathematics、mention、highlight、ruby、subscript、superscript）
- 不可分割的家族合并成一个 item：
  - `rich-text-editor-list` = BulletList + OrderedList + TaskList + ListItem + TaskItem + ListKeymap（TaskItem 继承 ListItem，拆开无法工作）
  - `rich-text-editor-text-style` = TextStyle + Color + BackgroundColor + FontFamily + FontSize + LineHeight（后五者都 `extend` TextStyle）
  - `rich-text-editor-behavior` = Focus + Gapcursor + TrailingNode（三者都是无 UI 的编辑器行为）
- 纯 React 层的东西并入 shell：`EditorFloatingMenu` 进 `rich-text-editor`

**为什么选 C**：它把「不可分割性」当作唯一的合并依据，而不是按好恶打包。用户仍然可以只装 blockquote 不装 list，但不会被迫处理一个装不上就报错的半成品家族。

## 7. 设计

### 7.1 扩展解析去重（D1）

现状：`resolveExtensions` 只做 flatMap；如果两个 item 各自携带同一个前置扩展，Tiptap 会重复注册。

改为：按 `extension.name` 去重，保留首次出现，重复时 `console.warn`（沿用 `collectEditorChildren` 已有的告警风格）。

这允许每个 item 在自己的工厂里携带前置扩展：

```ts
// text-style item 内部
export const EditorColor = defineExtensionComponent('color', props => [
  TextStyle, // 前置，由 D1 兜底去重
  Color.configure(props),
])
```

`Editor` 的最终 extensions 数组（`Document` / `UndoRedo` / `Placeholder` / `CharacterCount` / `TextAlign` + 用户声明 + `extensions` prop）也走同一个去重，避免用户通过 `extensions` prop 重复传入。

### 7.2 历史开关（D2）

`Editor` 新增 `history?: boolean`：

- `true` → 注册内置 `UndoRedo`
- `false` → 不注册
- `undefined`（默认）→ 自动检测：解析出的扩展里存在名为 `collaboration` 的扩展时跳过 `UndoRedo`，否则注册

本期不交付协作 item，这个开关是为后续预留，同时保证现在行为不变。

### 7.3 FloatingMenu（D3）

`editor.tsx` 新增 `EditorFloatingMenu`，与 `EditorBubbleMenu` 同级：

- 基于 `@tiptap/react/menus` 的 `FloatingMenu`
- 默认 `shouldShow`：当前块为空、编辑器可编辑、且不在 codeBlock 内
- 与 BubbleMenu 共用同一套 `TooltipProvider` 包裹

不新建 item，因为 `BubbleMenu` 已经是 shell 的一部分。

### 7.4 共享建议弹层（D4）

Emoji 与 Mention 都需要「输入触发字符 → 浮层候选 → 键盘导航 → 插入」的链路。两者的弹层实现相同。

新增内部 item `rich-text-editor-suggestion`（`categories: ["rich-text-editor", "internal"]`），导出：

- `createSuggestionRenderer()` — 返回符合 Tiptap `SuggestionOptions['render']` 的对象
- `EditorSuggestionList` — 无样式倾向的候选列表组件

内部 item 不出现在导航中（契约测试显式允许 `internal` 类目被排除）。

**注意**：suggestion 的回调必须在 item 的工厂内部构造，对外只暴露可序列化数据 props（`emojis`、`users`、`char`）。原因是 `extensionSignature` 会过滤掉函数类型的 props，函数进 props 会导致编辑器实例不重建。

### 7.5 节点与标记的样式策略

| 项                      | 样式来源                                                                            |
| ----------------------- | ----------------------------------------------------------------------------------- |
| blockquote              | `typeset.css` 已覆盖                                                                |
| bullet / ordered list   | `typeset.css` 已覆盖 `ul`/`ol`/`li` 与 marker                                       |
| task list               | `renderHTML` 输出 `contains-task-list` / `task-list-item` 类，命中 typeset 已有规则 |
| highlight               | `typeset.css` 已覆盖 `mark`                                                         |
| subscript / superscript | `typeset.css` 已覆盖 `sub`/`sup`                                                    |
| ruby                    | typeset 未覆盖；用最小 Tailwind 类（ruby 元素浏览器原生排版）                       |
| mathematics             | KaTeX 自带排版；样式由 `katex/dist/katex.min.css` 提供                              |
| emoji / mention         | 行内节点，Tailwind 工具类                                                           |

KaTeX 样式：文档站 `src/styles.css` 直接 `@import 'katex/dist/katex.min.css'`；消费端在文档 usage 片段里说明需要自行引入。仓库不分发主题 CSS 的原则不被破坏——KaTeX 是第三方排版资源，不是主题。

### 7.6 需要新增的 registry item

**节点（5）**

| item                           | 导出                                                                           | 依赖                                                                             |
| ------------------------------ | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| `rich-text-editor-blockquote`  | `EditorBlockquote`、`EditorBlockquoteToolbar`                                  | `@tiptap/extension-blockquote`                                                   |
| `rich-text-editor-list`        | `EditorBulletList`、`EditorOrderedList`、`EditorTaskList`、`EditorListToolbar` | `@tiptap/extension-list`                                                         |
| `rich-text-editor-emoji`       | `EditorEmoji`、`EditorEmojiToolbar`                                            | `@tiptap/extension-emoji`、`@tiptap/suggestion`、`rich-text-editor-suggestion`   |
| `rich-text-editor-mathematics` | `EditorMathematics`、`EditorMathematicsToolbar`                                | `@tiptap/extension-mathematics`、`katex`                                         |
| `rich-text-editor-mention`     | `EditorMention`                                                                | `@tiptap/extension-mention`、`@tiptap/suggestion`、`rich-text-editor-suggestion` |

**标记（5）**

| item                           | 导出                                            | 依赖                            |
| ------------------------------ | ----------------------------------------------- | ------------------------------- |
| `rich-text-editor-highlight`   | `EditorHighlight`、`EditorHighlightToolbar`     | `@tiptap/extension-highlight`   |
| `rich-text-editor-ruby`        | `EditorRuby`、`EditorRubyToolbar`               | `@tiptap/extension-ruby-text`   |
| `rich-text-editor-subscript`   | `EditorSubscript`、`EditorSubscriptToolbar`     | `@tiptap/extension-subscript`   |
| `rich-text-editor-superscript` | `EditorSuperscript`、`EditorSuperscriptToolbar` | `@tiptap/extension-superscript` |
| `rich-text-editor-text-style`  | `EditorTextStyle`、`EditorTextStyleToolbar`     | `@tiptap/extension-text-style`  |

**功能（7）**

| item                                    | 导出                                                            | 依赖                                     |
| --------------------------------------- | --------------------------------------------------------------- | ---------------------------------------- |
| `rich-text-editor-drag-handle`          | `EditorDragHandle`                                              | `@tiptap/extension-drag-handle-react`    |
| `rich-text-editor-file-handler`         | `EditorFileHandler`                                             | `@tiptap/extension-file-handler`         |
| `rich-text-editor-find-and-replace`     | `EditorFindAndReplace`、`EditorFindAndReplaceToolbar`           | `@tiptap/extension-find-and-replace`     |
| `rich-text-editor-behavior`             | `EditorFocus`、`EditorGapcursor`、`EditorTrailingNode`          | `@tiptap/extensions`                     |
| `rich-text-editor-typography`           | `EditorTypography`                                              | `@tiptap/extension-typography`           |
| `rich-text-editor-unique-id`            | `EditorUniqueId`                                                | `@tiptap/extension-unique-id`            |
| `rich-text-editor-invisible-characters` | `EditorInvisibleCharacters`、`EditorInvisibleCharactersToolbar` | `@tiptap/extension-invisible-characters` |

**内部（1）**

| item                          | 导出                                               |
| ----------------------------- | -------------------------------------------------- |
| `rich-text-editor-suggestion` | `createSuggestionRenderer`、`EditorSuggestionList` |

### 7.7 依赖与 peer 链

显式新增到 `package.json`：

`@tiptap/extension-blockquote`、`-list`、`-emoji`、`-mathematics`、`-mention`、`-highlight`、`-ruby-text`、`-subscript`、`-superscript`、`-text-style`、`-drag-handle-react`、`-file-handler`、`-find-and-replace`、`-typography`、`-unique-id`、`-invisible-characters`（全部 `3.32.2`），`@tiptap/suggestion@3.32.2`，`katex`。

**不显式声明**：`@tiptap/extension-drag-handle`、`@tiptap/extension-node-range`、`@tiptap/extension-collaboration`、`@tiptap/y-tiptap`、`yjs`、`y-protocols`。

依据（已实测）：只安装 `@tiptap/extension-drag-handle-react@3.32.2` 即可 `import` 使用；包管理器会自动把 peer 链装进各自的解析范围。本仓库 `pnpm-workspace.yaml` 与 `.npmrc` 均未关闭 `autoInstallPeers`。

代价：拖拽手柄会经 peer 链带入约 680 KB 协作代码。这是 `@tiptap/extension-drag-handle` 的实现决定（它在 `dist/index.js` 顶层静态导入 `isChangeOrigin` 与 `ySyncPluginKey` 等并真实调用），无法通过换用 React 包装层规避。

### 7.8 数据流

```
用户 JSX
  <Editor>
    <EditorBold />          ← defineExtensionComponent 标记的组件
    <EditorList />          ← 一个组件携带多个扩展
  </Editor>
        │
        ▼
collectEditorChildren(children)   → 按 extensionName 去重
        │
        ▼
resolveExtensions(configs)        → flatMap + 按 extension.name 去重（D1）
        │
        ▼
useEditor({ extensions: [Document, …defaults, …resolved] })
        │
        ▼
extensionSignature(configs) 变化 → 重建编辑器实例
```

## 8. 分阶段交付

| 阶段    | 内容                                                                          | 验收                    |
| ------- | ----------------------------------------------------------------------------- | ----------------------- |
| Phase 1 | 基础设施（D1/D2/D3/D4、snippet、nav、依赖）+ 5 个节点 item                    | typecheck + lint + test |
| Phase 2 | 5 个标记 item                                                                 | typecheck + lint + test |
| Phase 3 | drag-handle、file-handler、find-and-replace + FloatingMenu 文档               | typecheck + lint + test |
| Phase 4 | behavior、typography、unique-id、invisible-characters + playground + 全量回归 | `pnpm run check`        |

## 9. 边界情况

1. `<EditorTextStyle />` 与 `<EditorColor />` 并存 → 去重，不报错
2. `TextStyle` 必须先于其子扩展 → item 工厂内固定顺序
3. TrailingNode + Placeholder：空文档时占位符不能消失
4. KaTeX 样式缺失 → 公式不可读但不崩，文档显式提示
5. FindAndReplace 与中文输入法：`setSearchTerm` 必须挂 `compositionend`
6. FileHandler：object URL 在卸载/替换时 `revokeObjectURL`
7. 拖拽手柄：消费者关闭 `autoInstallPeers` 或使用 `--legacy-peer-deps` 时需手动补 base 包，文档注明
8. SSR：`immediatelyRender: false` 已成立；`InvisibleCharacters.injectCSS` 与 `is-emoji-supported` 仅浏览器执行
9. suggestion 弹层键盘可访问性：上下 + Enter + Esc，`aria-activedescendant`
10. `extensionSignature` 只序列化非函数 props → 新 item 的 props 必须是数据

## 10. 留给实现者的自由

- 每个工具栏控件具体用 Popover / Select / Toggle 中的哪一种（参照同类现有控件）
- Emoji 默认数据集取全量还是精简子集（默认全量，props 可覆盖）
- Find & Replace 工具栏的布局与按钮顺序
- 各文档示例的初始文档文案
- 内部 suggestion item 的组件拆分粒度

## 11. 执行方式

阶段串行；阶段内用 Agent Teams 并行，每位 teammate 拥有互不重叠的 item 文件。共享文件（`registry.json`、`nav.ts`、`snippets/rich-text-editor.ts`、`content.ts`、`editor.tsx`、`playground.tsx`）由 Lead 单写，避免并发覆盖。每阶段结束由 Lead 审 diff 并跑验收命令。
