# Rich Text Editor Extensions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 19 组 Tiptap 插件以可组合 registry item 的形式接入 Blocove 的 rich text editor 家族，每项都有组件、registry 条目、文档页、示例与测试。

**Architecture:** 沿用 `defineExtensionComponent(name, factory)` 声明式收集机制。先加固 shell（扩展去重、history 开关、FloatingMenu、共享 suggestion 弹层），再按「节点 → 标记 → 功能」三个批次各交付一组自包含 item。每个 item 一个源文件、一个 registry 条目、一个文档页、一个示例、一组测试。

**Tech Stack:** React 19 · TypeScript · Tiptap 3.32.2 · shadcn/ui registry · Tailwind · Vitest · TanStack Start

**Spec:** `docs/superpowers/specs/2026-11-07-rich-text-editor-extensions-design.md`

## Global Constraints

- 所有 `@tiptap/*` 依赖固定为 `3.32.2`，不升级到 3.33.0。
- item 的 `dependencies` 里每个带版本的条目，版本必须与 `package.json` 完全一致（`tests/unit/registry/manifest.test.ts` 会失败）。
- `src/registry/blocove/**` 下每个源文件必须恰好属于一个 item。
- 每个非 `internal` item 必须在 `src/docs/nav.ts` 出现且仅出现一次，并且必须有对应文档页。
- 文件 `target` 必须以 `components/blocove/` 或 `lib/blocove/` 开头。
- 不显式声明 `@tiptap/extension-drag-handle`、`@tiptap/extension-node-range`、`@tiptap/extension-collaboration`、`@tiptap/y-tiptap`、`yjs`、`y-protocols`。
- 不新增主题 CSS 或 CSS 变量；样式只用 Tailwind 工具类或复用 `typeset.css`。
- 文档文案沿用现有英文风格；代码注释英文。
- 每个阶段结束必须 `pnpm run typecheck && pnpm run lint && pnpm test` 全绿。
- 提交信息使用 Conventional Commits。

## Review Focus

1. **只声明 `<EditorColor />`、不声明 `<EditorTextStyle />`** —— 用户期望照样能着色。测试：Task 15 中单独渲染 `EditorColor` 并断言 `textStyle` 扩展已注册。
2. **中文输入法拼字过程** —— 用户期望在输入框里打「你好」时不会在中途触发替换。测试：Task 18 中派发 `compositionstart` 后 `setSearchTerm` 不应改动文档。
3. **消费者的包管理器关闭 `autoInstallPeers`** —— 用户期望安装说明能让他们装起来。测试：Task 16 断言 item 的 `dependencies` 只含 `@tiptap/extension-drag-handle-react`，且文档 note 提到需要补 `@tiptap/extension-drag-handle`。
4. **KaTeX 样式缺失** —— 用户期望公式不可读但页面不崩。测试：Task 9 中不引入 katex CSS 渲染数学节点，断言不抛错且节点存在。
5. **空文档 + TrailingNode** —— 用户期望占位符仍然可见。测试：Task 20 中断言空文档时 `.is-editor-empty` 仍存在。

---

## Common Item Recipe

每个新 item 都按这套步骤产出。后续任务只写「deltas」（导出名、扩展配置、工具栏行为、文档文案、测试断言）。

**产出文件**

1. `src/registry/blocove/ui/rich-text-editor/<stem>.tsx` — 组件
2. `src/registry/blocove/registry.json` — 追加 item（**Lead 单写**）
3. `src/docs/examples/rich-text-editor/<stem>.tsx` — 示例
4. `src/docs/examples/rich-text-editor/content.ts` — 追加初始文档键（**Lead 单写**）
5. `src/docs/pages/rich-text-editor/<stem>.ts` — 文档页
6. `src/docs/snippets/rich-text-editor.ts` — 导出映射与模块顺序（**Lead 单写**）
7. `src/docs/nav.ts` — 导航条目（**Lead 单写**）
8. `tests/unit/rich-text-editor/<category>.test.tsx` — 测试

**组件骨架**

```tsx
import type { Editor } from '@tiptap/react'
import type { ExtensionComponent } from '@/lib/blocove/rich-text-editor-extension'
import { X } from '@tiptap/extension-x'
import { useCurrentEditor, useEditorState } from '@tiptap/react'
import { XIcon } from 'lucide-react'
import { EditorToolbarButton } from '@/components/blocove/rich-text-editor/editor'
import { defineExtensionComponent } from '@/lib/blocove/rich-text-editor-extension'

export const EditorX: ExtensionComponent<Partial<XOptions>> = defineExtensionComponent(
  'x',
  props => [X.configure(props)],
)

export interface EditorXToolbarProps { className?: string }

export function EditorXToolbar({ className }: EditorXToolbarProps) {
  const { editor } = useCurrentEditor()
  if (!editor) { return null }
  return <EditorXToolbarContent editor={editor} className={className} />
}
```

`extensionName` 用 kebab-case 的扩展短名（`blockquote`、`highlight`、`text-style`）。它只用于去重与告警，不参与 Tiptap 注册。

**registry 条目模板**

```json
{
  "name": "rich-text-editor-<stem>",
  "type": "registry:ui",
  "title": "<Title>",
  "description": "<One sentence, ends with a period.>",
  "dependencies": [
    "@tiptap/extension-<pkg>@3.32.2",
    "@tiptap/react@3.32.2",
    "cn",
    "lucide-react"
  ],
  "registryDependencies": [
    "litingyes/blocove/rich-text-editor",
    "litingyes/blocove/rich-text-editor-extension"
  ],
  "categories": ["rich-text-editor", "<node|mark|extension>"],
  "files": [
    {
      "path": "ui/rich-text-editor/<stem>.tsx",
      "type": "registry:ui",
      "target": "components/blocove/rich-text-editor/<stem>.tsx"
    }
  ]
}
```

`dependencies` 只列该文件真正 `import` 的包；未写版本号的（`cn`、`lucide-react`）表示项目自带。

**文档页模板**

```ts
import type { DocsPage } from '@/docs/types'
import EditorXDemo from '@/docs/examples/rich-text-editor/<stem>'
import { richTextEditorUsage } from '@/docs/snippets/rich-text-editor'

export const docsPage: DocsPage = {
  item: 'rich-text-editor-<stem>',
  requiresTypeset: true,
  examples: [
    {
      title: 'Default',
      component: EditorXDemo,
      code: richTextEditorUsage({
        extensions: ['EditorX', /* 前置 */],
        toolbar: ['EditorXToolbar'],
        bubble: ['EditorXToolbar'],
        content: '<p>…</p>',
      }),
    },
  ],
  api: [
    { name: 'EditorX', description: '<…>', rows: [] },
    { name: 'EditorXToolbar', description: '<…>', rows: [ { prop: 'className', type: 'string', default: '-' } ] },
  ],
}
```

`richTextEditorUsage` 的 `extensions`/`toolbar`/`bubble` 每一项都必须是 `src/docs/snippets/rich-text-editor.ts` 里 `richTextEditorModules` 的 key，否则 `tests/unit/registry/docs.test.ts` 会失败。

**示例模板**

```tsx
import { richTextEditorDemoContent } from '@/docs/examples/rich-text-editor/content'
import { RichTextEditorDemoFrame } from '@/docs/examples/rich-text-editor/frame'
import { EditorX, EditorXToolbar } from '@/registry/blocove/ui/rich-text-editor/<stem>'

export default function EditorXDemo() {
  return (
    <RichTextEditorDemoFrame
      content={richTextEditorDemoContent.x}
      extensions={<EditorX />}
      toolbar={<EditorXToolbar />}
      bubble={<EditorXToolbar />}
    />
  )
}
```

**测试骨架**

```tsx
import { act, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EditorX, EditorXToolbar } from '@/components/blocove/rich-text-editor/<stem>'
import { renderRichTextEditor } from '../../helpers/render-rich-text-editor'

describe('EditorX', () => {
  it('<behavior>', async () => {
    const { editor } = await renderRichTextEditor({
      content: '…',
      extensions: <EditorX />,
      toolbar: <EditorXToolbar />,
    })
    // assertions
  })
})
```

单元测试里 `@/components/blocove/...` 由 vitest alias 指向 `src/registry/blocove/ui/...`。

---

## Phase 1 — 基础设施 + 节点

### Task 1: 扩展解析去重（D1）

**Files:**
- Modify: `src/registry/blocove/lib/rich-text-editor-extension.ts:117-119`
- Test: `tests/unit/lib/rich-text-editor-extension.test.ts`

**Interfaces:**
- Produces: `resolveExtensions(configs: ExtensionConfig[]): Extensions` 现在保证：返回数组内 `extension.name` 唯一，重复项保留首次出现。

- [ ] **Step 1: 写失败测试**

在 `tests/unit/lib/rich-text-editor-extension.test.ts` 追加：

```ts
it('dedupes resolved extensions by name, keeping the first declaration', () => {
  const a = defineExtensionComponent('a', () => [Document, SomeExtensionA])
  const b = defineExtensionComponent('b', () => [Document, SomeExtensionB])
  const resolved = resolveExtensions([{ component: a, props: {} }, { component: b, props: {} }])
  const names = resolved.map(extension => extension.name)
  expect(names.filter(name => name === 'doc')).toHaveLength(1)
  expect(new Set(names).size).toBe(names.length)
})
```

用一个真实共享扩展替代 `Document`（例如两个 item 都携带 `TextStyle`），断言数组长度等于去重后长度，且保留的是第一次出现的实例。

- [ ] **Step 2: 运行，确认失败**

Run: `pnpm vitest run --project unit tests/unit/lib/rich-text-editor-extension.test.ts`
Expected: FAIL —— 解析结果里出现两个同名扩展。

- [ ] **Step 3: 实现去重**

`resolveExtensions` 改为在 flatMap 之后按 `extension.name` 过滤，保留首次出现；遇到重复时 `console.warn`，文案与 `collectEditorChildren` 已有告警同风格：`[blocove/rich-text-editor] Duplicate extension "<name>" ignored...`。

- [ ] **Step 4: 运行测试**

Run: `pnpm vitest run --project unit tests/unit/lib/rich-text-editor-extension.test.ts`
Expected: PASS

- [ ] **Step 5: 提交**

```bash
git add src/registry/blocove/lib/rich-text-editor-extension.ts tests/unit/lib/rich-text-editor-extension.test.ts
git commit -m "feat(rich-text-editor): dedupe resolved extensions by name"
```

---

### Task 2: Editor 历史开关（D2）

**Files:**
- Modify: `src/registry/blocove/ui/rich-text-editor/editor.tsx`
- Test: `tests/unit/rich-text-editor/editor.test.tsx`

**Interfaces:**
- Produces: `EditorProps.history?: boolean`。`false` 时不注册 `UndoRedo`；`undefined` 时若解析出的扩展含 `name === 'collaboration'` 则跳过 `UndoRedo`，否则注册。

- [ ] **Step 1: 写失败测试**

```ts
it('omits undo/redo when history is false', async () => {
  const { editor } = await renderRichTextEditor({ extensions: null as never })
  // 改为直接 render Editor 并传 history={false}
  expect(editor.extensionManager.extensions.some(e => e.name === 'undoRedo')).toBe(false)
})
```

测试文件里直接 `render(<Editor history={false}>…)`，通过 `onReady` 拿实例断言 `undoRedo` 扩展缺失；再加一条 `history={true}` 的用例断言存在。

- [ ] **Step 2: 运行，确认失败**

Run: `pnpm vitest run --project unit tests/unit/rich-text-editor/editor.test.tsx`
Expected: FAIL —— `history` prop 不存在，`undoRedo` 始终注册。

- [ ] **Step 3: 实现**

`EditorProps` 加 `history?: boolean`。构造 extensions 时先解析用户声明，再决定是否插入 `UndoRedo`。把 `history` 加入 `useEditor` 的依赖数组。

- [ ] **Step 4: 运行测试**

Run: `pnpm vitest run --project unit tests/unit/rich-text-editor/editor.test.tsx`
Expected: PASS

- [ ] **Step 5: 提交**

```bash
git commit -m "feat(rich-text-editor): add history switch for collaboration-ready editors"
```

---

### Task 3: EditorFloatingMenu（D3）

**Files:**
- Modify: `src/registry/blocove/ui/rich-text-editor/editor.tsx`
- Test: `tests/unit/rich-text-editor/editor.test.tsx`
- Modify: `src/docs/pages/rich-text-editor/editor.ts`（api 表追加一行）

**Interfaces:**
- Produces: `EditorFloatingMenu({ className?, children? })`。
- 默认 `shouldShow`：`editor.isEmpty === false` 时不显示；显示条件为「当前块为空、`editor.isEditable`、不在 `codeBlock`」。

- [ ] **Step 1: 写失败测试**

断言在空段落中 `document.querySelector('[data-slot="editor-floating-menu"]')` 存在，且选中文本后不出现（FloatingMenu 只在空块显示）。

- [ ] **Step 2: 运行，确认失败**

Run: `pnpm vitest run --project unit tests/unit/rich-text-editor/editor.test.tsx`
Expected: FAIL —— 组件不存在。

- [ ] **Step 3: 实现**

从 `@tiptap/react/menus` 导入 `FloatingMenu`，实现与 `EditorBubbleMenu` 同构的组件（结构、`TooltipProvider` 包裹、`data-slot`）。

- [ ] **Step 4: 运行测试**

Run: `pnpm vitest run --project unit tests/unit/rich-text-editor/editor.test.tsx`
Expected: PASS

- [ ] **Step 5: 提交**

```bash
git commit -m "feat(rich-text-editor): add floating menu to the editor shell"
```

---

### Task 4: 内部 suggestion item（D4）

**Files:**
- Create: `src/registry/blocove/lib/rich-text-editor-suggestion.tsx`
- Modify: `src/registry/blocove/registry.json`
- Test: `tests/unit/lib/rich-text-editor-suggestion.test.tsx`

**Interfaces:**
- Produces:
  - `EditorSuggestionList(props: { items: SuggestionItem[]; command: (item: SuggestionItem) => void; query: string; activeIndex: number })`
  - `createSuggestionRenderer<T>(): SuggestionOptions<T>['render']`
  - `interface SuggestionItem { id: string; label: string; [key: string]: unknown }`

- [ ] **Step 1: 写失败测试**

断言 `createSuggestionRenderer()` 返回的对象含 `onStart/onUpdate/onKeyDown/onExit`；键盘 `ArrowDown`/`Enter`/`Escape` 通过回调处理（用 mock 的 `props` 驱动）。

- [ ] **Step 2: 运行，确认失败**

Run: `pnpm vitest run --project unit tests/unit/lib/rich-text-editor-suggestion.test.tsx`
Expected: FAIL —— 模块不存在。

- [ ] **Step 3: 实现**

registry 条目：`type: registry:lib`、`categories: ["rich-text-editor", "internal"]`、`target: lib/blocove/rich-text-editor-suggestion.tsx`、`dependencies` 含 `@tiptap/suggestion@3.32.2`、`@tiptap/react@3.32.2`、`@floating-ui/dom`、`cn`、`lucide-react`。

实现要点：`ReactRenderer` + floating-ui 定位；列表项 `role="option"`、`aria-selected`、容器 `role="listbox"`；`aria-activedescendant` 指向当前项。

- [ ] **Step 4: 运行测试**

Run: `pnpm vitest run --project unit tests/unit/lib/rich-text-editor-suggestion.test.tsx`
Expected: PASS

- [ ] **Step 5: 提交**

```bash
git commit -m "feat(rich-text-editor): add shared suggestion popup for emoji and mention"
```

---

### Task 5: 依赖安装 + 文档管线脚手架

**Files:**
- Modify: `package.json`、`pnpm-lock.yaml`
- Modify: `src/styles.css`
- Modify: `src/docs/snippets/rich-text-editor.ts`
- Modify: `src/docs/examples/rich-text-editor/content.ts`
- Modify: `src/docs/nav.ts`

**Interfaces:**
- Produces: 文档 snippet 生成器可识别的全部新导出名；`content.ts` 可用的新键；nav 中的新分组骨架。

- [ ] **Step 1: 安装依赖**

```bash
pnpm add @tiptap/extension-blockquote@3.32.2 @tiptap/extension-list@3.32.2 @tiptap/extension-emoji@3.32.2 @tiptap/extension-mathematics@3.32.2 @tiptap/extension-mention@3.32.2 @tiptap/extension-highlight@3.32.2 @tiptap/extension-ruby-text@3.32.2 @tiptap/extension-subscript@3.32.2 @tiptap/extension-superscript@3.32.2 @tiptap/extension-text-style@3.32.2 @tiptap/extension-drag-handle-react@3.32.2 @tiptap/extension-file-handler@3.32.2 @tiptap/extension-find-and-replace@3.32.2 @tiptap/extension-typography@3.32.2 @tiptap/extension-unique-id@3.32.2 @tiptap/extension-invisible-characters@3.32.2 @tiptap/suggestion@3.32.2
pnpm add katex
```

- [ ] **Step 2: 引入 KaTeX 样式**

`src/styles.css` 在现有 `@import` 之后追加 `@import 'katex/dist/katex.min.css';`。

- [ ] **Step 3: 扩充 snippet 映射**

`richTextEditorModules` 追加全部新导出 → 模块 stem；`moduleOrder` 追加对应 stem（顺序与 nav 一致）。

- [ ] **Step 4: 扩充 demo content 与 nav**

`content.ts` 追加本阶段 5 个键（`blockquote`、`list`、`emoji`、`mathematics`、`mention`），`nav.ts` 的 `components` 树 Nodes 组追加 5 项、新增 `Extensions` 分组（本阶段先放空数组占位，Phase 3/4 填充）。

- [ ] **Step 5: 验证**

Run: `pnpm run typecheck`
Expected: PASS（此时还没有组件，nav 里也没有引用未创建 item，因为 item 在后续任务才加入 registry）

- [ ] **Step 6: 提交**

```bash
git commit -m "chore(rich-text-editor): install extension packages and scaffold docs pipeline"
```

---

### Task 6: blockquote item

**Files:**
- Create: `src/registry/blocove/ui/rich-text-editor/blockquote.tsx`
- Create: `src/docs/examples/rich-text-editor/blockquote.tsx`
- Create: `src/docs/pages/rich-text-editor/blockquote.ts`
- Modify: `src/registry/blocove/registry.json`
- Test: `tests/unit/rich-text-editor/nodes.test.tsx`

**Interfaces:**
- Produces: `EditorBlockquote`（`ExtensionComponent<Partial<BlockquoteOptions>>`）、`EditorBlockquoteToolbar`
- 工具栏：`EditorToolbarButton` 切换按钮，`label="Blockquote"`，`shortcut` 无，`aria-pressed` 反映 `editor.isActive('blockquote')`。

按 Common Item Recipe 执行，deltas：

- 扩展：`Blockquote`，`extensionName: 'blockquote'`
- registry：`title: "Blockquote"`、`categories: [..., "node"]`、`dependencies` 含 `@tiptap/extension-blockquote@3.32.2`
- 命令：`editor.chain().focus().toggleBlockquote().run()`
- 图标：`TextQuoteIcon`
- 示例内容：一段引用 + 一段普通段落
- 文档示例 `richTextEditorUsage`：`extensions: ['EditorText','EditorParagraph','EditorHardBreak','EditorBlockquote']`、`toolbar: ['EditorBlockquoteToolbar']`、`bubble: []`
- 测试断言：点击工具栏后 `editor.isActive('blockquote')` 为 true、`html()` 含 `<blockquote>`；再点一次回到 false。

- [ ] **Step 1–5:** 按 Common Item Recipe 的 TDD 循环执行（写测试 → 失败 → 实现 → 通过 → 提交）

```bash
git commit -m "feat(rich-text-editor): add blockquote node"
```

---

### Task 7: list item

**Files:**
- Create: `src/registry/blocove/ui/rich-text-editor/list.tsx`
- Create: `src/docs/examples/rich-text-editor/list.tsx`
- Create: `src/docs/pages/rich-text-editor/list.ts`
- Modify: `src/registry/blocove/registry.json`
- Test: `tests/unit/rich-text-editor/nodes.test.tsx`

**Interfaces:**
- Produces: `EditorBulletList`、`EditorOrderedList`、`EditorTaskList`、`EditorListToolbar`
- `EditorBulletList` 注册 `[BulletList, ListItem, ListKeymap]`；`EditorOrderedList` 注册 `[OrderedList, ListItem, ListKeymap]`；`EditorTaskList` 注册 `[TaskList, TaskItem.configure({ nested: true }), ListItem, ListKeymap]`
- `EditorListToolbar` 是一个 Popover 内的三按钮组（bullet / ordered / task），每个按钮 `aria-pressed` 反映对应 `isActive`。

deltas：

- **TaskList 样式**：`TaskList` 与 `TaskItem` 用 `.extend({ renderHTML })` 或 `HTMLAttributes` 输出类名 `contains-task-list` 与 `task-list-item`，命中 `src/typeset.css` 已有规则。
- 命令：`toggleBulletList()`、`toggleOrderedList()`、`toggleTaskList()`
- 图标：`ListIcon`、`ListOrderedIcon`、`ListTodoIcon`
- 示例内容：无序列表 + 有序列表 + 任务列表各一
- 测试断言：三种列表各能切换；任务列表 HTML 含 `contains-task-list`；**断言 `EditorBulletList` 与 `EditorOrderedList` 同时声明时不报重复扩展告警**（验证 Task 1 的去重）。

```bash
git commit -m "feat(rich-text-editor): add bullet, ordered and task list nodes"
```

---

### Task 8: emoji item

**Files:**
- Create: `src/registry/blocove/ui/rich-text-editor/emoji.tsx`
- Create: `src/docs/examples/rich-text-editor/emoji.tsx`
- Create: `src/docs/pages/rich-text-editor/emoji.ts`
- Modify: `src/registry/blocove/registry.json`
- Test: `tests/unit/rich-text-editor/nodes.test.tsx`

**Interfaces:**
- Produces: `EditorEmoji`（props: `{ emojis?: EmojiItem[]; char?: string }`）、`EditorEmojiToolbar`
- `EditorEmoji` 工厂内构造 `suggestion`（用 Task 4 的 `createSuggestionRenderer`），对外**只暴露可序列化 props**（D8）。
- `EditorEmojiToolbar` 是 Popover 内的 emoji 网格，点击插入 `editor.chain().focus().insertContent({ type: 'emoji', attrs: { name } }).run()`。

deltas：

- registry `dependencies`：`@tiptap/extension-emoji@3.32.2`、`@tiptap/suggestion@3.32.2`、`@tiptap/react@3.32.2`、`cn`、`lucide-react`
- registry `registryDependencies` 追加 `litingyes/blocove/rich-text-editor-suggestion`
- 默认 `emojis` 用 `@tiptap/extension-emoji` 导出的 `emojis`，但 props 可覆盖
- 测试断言：输入 `:smile` 后弹层出现（mock suggestion 或直接调用命令）；插入后 `html()` 含 `data-type="emoji"`

```bash
git commit -m "feat(rich-text-editor): add emoji node with suggestion popup"
```

---

### Task 9: mathematics item

**Files:**
- Create: `src/registry/blocove/ui/rich-text-editor/mathematics.tsx`
- Create: `src/docs/examples/rich-text-editor/mathematics.tsx`
- Create: `src/docs/pages/rich-text-editor/mathematics.ts`
- Modify: `src/registry/blocove/registry.json`
- Test: `tests/unit/rich-text-editor/nodes.test.tsx`

**Interfaces:**
- Produces: `EditorMathematics`（`ExtensionComponent<Partial<MathematicsOptions>>`）、`EditorMathematicsToolbar`
- 工具栏：Popover 内含两个按钮「Inline math」「Block math」，各自打开输入框，确认后执行 `insertInlineMath` / `insertBlockMath` 命令。

deltas：

- registry `dependencies`：`@tiptap/extension-mathematics@3.32.2`、`katex`、`@tiptap/react@3.32.2`、`cn`、`lucide-react`
- 文档页 `note` 写明需要在项目中引入 `katex/dist/katex.min.css`
- **Review Focus #4 测试**：不引入 KaTeX CSS 渲染含数学节点的文档，断言不抛错且 `[data-type="inlineMath"]` 存在。

```bash
git commit -m "feat(rich-text-editor): add KaTeX mathematics nodes"
```

---

### Task 10: mention item

**Files:**
- Create: `src/registry/blocove/ui/rich-text-editor/mention.tsx`
- Create: `src/docs/examples/rich-text-editor/mention.tsx`
- Create: `src/docs/pages/rich-text-editor/mention.ts`
- Modify: `src/registry/blocove/registry.json`
- Test: `tests/unit/rich-text-editor/nodes.test.tsx`

**Interfaces:**
- Produces: `EditorMention`（props: `{ users?: MentionUser[]; char?: string }`，`MentionUser = { id: string; label: string }`）
- `extensionName: 'mention'`；suggestion 内建，`renderHTML` 输出 `span[data-type="mention"][data-id]`。

deltas：

- registry `dependencies`：`@tiptap/extension-mention@3.32.2`、`@tiptap/suggestion@3.32.2`、`@tiptap/react@3.32.2`、`cn`、`lucide-react`
- registry `registryDependencies` 追加 `litingyes/blocove/rich-text-editor-suggestion`
- 默认用户列表 `[{ id: '1', label: 'Ada Lovelace' }, { id: '2', label: 'Alan Turing' }]`
- 测试断言：输入 `@` 后弹层出现；插入后 HTML 含 `data-type="mention"` 与 `data-id`

```bash
git commit -m "feat(rich-text-editor): add mention node with suggestion popup"
```

**Phase 1 验收**：`pnpm run typecheck && pnpm run lint && pnpm test`

---

## Phase 2 — 标记

### Task 11: highlight item

**Files:** Create `highlight.tsx` / 示例 / 文档页；Modify `registry.json`；Test `marks.test.tsx`

**Interfaces:** `EditorHighlight`（`{ multicolor?: boolean }`）、`EditorHighlightToolbar`（Popover 色板）

- 扩展 `Highlight`，`extensionName: 'highlight'`
- 默认 `multicolor: false`（配合 typeset 的 `mark` 规则）；`multicolor: true` 时工具栏显示色板
- 命令 `toggleHighlight({ color })`
- 测试：工具栏切换 `aria-pressed`；HTML 含 `<mark>`；multicolor 时 HTML 含 `data-color`

```bash
git commit -m "feat(rich-text-editor): add highlight mark"
```

### Task 12: ruby item

**Files:** Create `ruby.tsx` / 示例 / 文档页；Modify `registry.json`；Test `marks.test.tsx`

**Interfaces:** `EditorRuby`、`EditorRubyToolbar`（Popover：正文 + 注音两个输入框）

- 扩展 `RubyText`，`extensionName: 'ruby'`
- 命令 `setRubyText({ ruby })` / `unsetRubyText()`
- 最小 Tailwind 类：`rt` 注音字号 `text-[0.6em]`
- 测试：设置后 HTML 含 `<ruby>` 与 `<rt>`

```bash
git commit -m "feat(rich-text-editor): add ruby annotation mark"
```

### Task 13: subscript item

**Files:** Create `subscript.tsx` / 示例 / 文档页；Modify `registry.json`；Test `marks.test.tsx`

**Interfaces:** `EditorSubscript`、`EditorSubscriptToolbar`

- 扩展 `Subscript`，`extensionName: 'subscript'`
- 命令 `toggleSubscript()`；图标 `SubscriptIcon`
- 测试：切换后 `isActive('subscript')`、HTML 含 `<sub>`

```bash
git commit -m "feat(rich-text-editor): add subscript mark"
```

### Task 14: superscript item

同 Task 13，用 `Superscript` / `toggleSuperscript()` / `SuperscriptIcon` / `<sup>`。

```bash
git commit -m "feat(rich-text-editor): add superscript mark"
```

### Task 15: text-style item

**Files:**
- Create: `src/registry/blocove/ui/rich-text-editor/text-style.tsx`
- Create: `src/docs/examples/rich-text-editor/text-style.tsx`
- Create: `src/docs/pages/rich-text-editor/text-style.ts`
- Modify: `src/registry/blocove/registry.json`
- Test: `tests/unit/rich-text-editor/marks.test.tsx`

**Interfaces:**
- Produces: `EditorTextStyle`、`EditorTextStyleToolbar`
- 工厂注册顺序固定：`[TextStyle, Color, BackgroundColor, FontFamily, FontSize, LineHeight]`
- `EditorTextStyleToolbar` 是一个 Popover，内含分组控件：Color 色板、BackgroundColor 色板、FontFamily 选择、FontSize 输入、LineHeight 选择

- [ ] **Step 1: 写失败测试（含 Review Focus #1）**

```ts
it('registers textStyle when only EditorColor is declared', async () => {
  const { editor } = await renderRichTextEditor({ extensions: <EditorColor /> })
  expect(editor.extensionManager.extensions.some(e => e.name === 'textStyle')).toBe(true)
})
it('does not double-register textStyle when both are declared', async () => {
  const { editor } = await renderRichTextEditor({ extensions: <><EditorTextStyle /><EditorColor /></> })
  expect(editor.extensionManager.extensions.filter(e => e.name === 'textStyle')).toHaveLength(1)
})
```

- [ ] **Step 2: 运行，确认失败**

Run: `pnpm vitest run --project unit tests/unit/rich-text-editor/marks.test.tsx`
Expected: FAIL

- [ ] **Step 3: 实现**

`EditorTextStyle` 注册 `[TextStyle]`；每个子扩展（`EditorColor` 等）在自己的工厂里先 `TextStyle` 再自身扩展，靠 Task 1 去重。命令 `setColor`/`unsetColor`、`setBackgroundColor`/`unsetBackgroundColor`、`setFontFamily`/`unsetFontFamily`、`setFontSize`/`unsetFontSize`、`setLineHeight`/`unsetLineHeight`。

- [ ] **Step 4: 运行测试**

Run: `pnpm vitest run --project unit tests/unit/rich-text-editor/marks.test.tsx`
Expected: PASS

- [ ] **Step 5: 提交**

```bash
git commit -m "feat(rich-text-editor): add text style family with color, font and line height controls"
```

**Phase 2 验收**：`pnpm run typecheck && pnpm run lint && pnpm test`

---

## Phase 3 — 功能扩展 A

### Task 16: drag-handle item

**Files:**
- Create: `src/registry/blocove/ui/rich-text-editor/drag-handle.tsx`
- Create: `src/docs/examples/rich-text-editor/drag-handle.tsx`
- Create: `src/docs/pages/rich-text-editor/drag-handle.ts`
- Modify: `src/registry/blocove/registry.json`
- Test: `tests/unit/rich-text-editor/extensions.test.tsx`

**Interfaces:**
- Produces: `EditorDragHandle({ className? })`
- 内部使用 `useCurrentEditor()` 拿 editor，渲染 `<DragHandle editor={editor} nested className>`

- [ ] **Step 1: 写失败测试（含 Review Focus #3）**

```ts
it('declares only the react drag handle package as a dependency', () => {
  const item = manifest.items.find(i => i.name === 'rich-text-editor-drag-handle')
  expect(item?.dependencies).toContain('@tiptap/extension-drag-handle-react@3.32.2')
  expect(item?.dependencies ?? []).not.toContain('@tiptap/extension-collaboration@3.32.2')
  expect(item?.dependencies ?? []).not.toContain('yjs')
})
```

再加渲染测试：`editable={false}` 时不渲染拖拽手柄 DOM。

- [ ] **Step 2: 运行，确认失败**

Run: `pnpm vitest run --project unit tests/unit/rich-text-editor/extensions.test.tsx`
Expected: FAIL

- [ ] **Step 3: 实现**

registry `dependencies` 只含 `@tiptap/extension-drag-handle-react@3.32.2` 与 `@tiptap/react@3.32.2`、`cn`、`lucide-react`。文档页 `note` 写明：若项目关闭了 `autoInstallPeers` 或使用 `--legacy-peer-deps`，需手动安装 `@tiptap/extension-drag-handle`。

- [ ] **Step 4: 运行测试**

Run: `pnpm vitest run --project unit tests/unit/rich-text-editor/extensions.test.tsx`
Expected: PASS

- [ ] **Step 5: 提交**

```bash
git commit -m "feat(rich-text-editor): add drag handle for block reordering"
```

### Task 17: file-handler item

**Files:** Create `file-handler.tsx` / 示例 / 文档页；Modify `registry.json`；Test `extensions.test.tsx`

**Interfaces:** `EditorFileHandler({ allowedMimeTypes?: string[], onFile?: (file: File) => Promise<string> | string })`

- 默认把文件读成 base64 data URL 插入
- object URL 必须在使用后 `revokeObjectURL`
- 测试：粘贴一个 `File` 后 `onFile` 被调用；默认实现插入 `img[src^="data:"]`

```bash
git commit -m "feat(rich-text-editor): add file handler for pasted and dropped files"
```

### Task 18: find-and-replace item

**Files:** Create `find-and-replace.tsx` / 示例 / 文档页；Modify `registry.json`；Test `extensions.test.tsx`

**Interfaces:** `EditorFindAndReplace`、`EditorFindAndReplaceToolbar`（Popover：搜索框、替换框、上一个、下一个、替换、全部替换、大小写、正则、整词）

- [ ] **Step 1: 写失败测试（含 Review Focus #2）**

```ts
it('does not apply replacements while an IME composition is active', async () => {
  const { editor } = await renderRichTextEditor({ content: '<p>你好 world</p>', extensions: <EditorFindAndReplace />, toolbar: <EditorFindAndReplaceToolbar /> })
  const input = screen.getByRole('searchbox', { name: 'Find' })
  fireEvent.compositionStart(input)
  fireEvent.change(input, { target: { value: '你' } })
  expect(editor.getHTML()).toBe('<p>你好 world</p>')
  fireEvent.compositionEnd(input)
  // 组合结束后才允许搜索/替换
})
```

- [ ] **Step 2: 运行，确认失败**

Run: `pnpm vitest run --project unit tests/unit/rich-text-editor/extensions.test.tsx`
Expected: FAIL

- [ ] **Step 3: 实现**

`setSearchTerm` 只在非 composition 状态派发；监听 `compositionstart`/`compositionend`。命令映射：`goToNextResult`、`goToPreviousResult`、`replace`、`replaceAll`、`clearSearch`。

- [ ] **Step 4: 运行测试**

Run: `pnpm vitest run --project unit tests/unit/rich-text-editor/extensions.test.tsx`
Expected: PASS

- [ ] **Step 5: 提交**

```bash
git commit -m "feat(rich-text-editor): add find and replace toolbar with IME-safe search"
```

### Task 19: FloatingMenu 文档

**Files:**
- Modify: `src/docs/pages/rich-text-editor/editor.ts`（示范 `EditorFloatingMenu`）
- Modify: `src/docs/snippets/rich-text-editor.ts`（`EditorFloatingMenu` 映射与顺序）

- [ ] **Step 1: 更新文档页**

在 `rich-text-editor` 文档页的 `api` 表追加 `EditorFloatingMenu` 条目，并在示例 `richTextEditorUsage` 中加入 floating menu 的用法说明。

- [ ] **Step 2: 验证**

Run: `pnpm vitest run --project unit tests/unit/registry/docs.test.ts`
Expected: PASS

- [ ] **Step 3: 提交**

```bash
git commit -m "docs: document the editor floating menu"
```

**Phase 3 验收**：`pnpm run typecheck && pnpm run lint && pnpm test`

---

## Phase 4 — 功能扩展 B + 收尾

### Task 20: behavior item

**Files:** Create `behavior.tsx` / 示例 / 文档页；Modify `registry.json`；Test `extensions.test.tsx`

**Interfaces:** `EditorFocus({ className?, mode? })`、`EditorGapcursor()`、`EditorTrailingNode({ node? })`

- [ ] **Step 1: 写失败测试（含 Review Focus #5）**

```ts
it('keeps the placeholder visible on an empty document with a trailing node', async () => {
  const { container } = await renderRichTextEditor({ content: '', extensions: <><EditorTrailingNode /><EditorFocus /></> })
  expect(container.querySelector('.is-editor-empty')).not.toBeNull()
})
```

- [ ] **Step 2: 运行，确认失败**

Run: `pnpm vitest run --project unit tests/unit/rich-text-editor/extensions.test.tsx`
Expected: FAIL

- [ ] **Step 3: 实现**

从 `@tiptap/extensions` 导入 `Focus`、`Gapcursor`、`TrailingNode`，各自包一层 `defineExtensionComponent`。

- [ ] **Step 4: 运行测试**

Run: `pnpm vitest run --project unit tests/unit/rich-text-editor/extensions.test.tsx`
Expected: PASS

- [ ] **Step 5: 提交**

```bash
git commit -m "feat(rich-text-editor): add focus, gapcursor and trailing node behaviors"
```

### Task 21: typography item

**Files:** Create `typography.tsx` / 示例 / 文档页；Modify `registry.json`；Test `extensions.test.tsx`

**Interfaces:** `EditorTypography()`

- 测试：输入 `-->` 后文档文本含 `→`；输入 `...` 后含 `…`

```bash
git commit -m "feat(rich-text-editor): add typography input rules"
```

### Task 22: unique-id item

**Files:** Create `unique-id.tsx` / 示例 / 文档页；Modify `registry.json`；Test `extensions.test.tsx`

**Interfaces:** `EditorUniqueId({ types?: string[] | 'all', attributeName?: string })`

- 默认 `types: 'all'`、`attributeName: 'id'`
- 测试：渲染含两个段落的文档，HTML 中每个块都有唯一的 `id`

```bash
git commit -m "feat(rich-text-editor): add unique id attribute to blocks"
```

### Task 23: invisible-characters item

**Files:** Create `invisible-characters.tsx` / 示例 / 文档页；Modify `registry.json`；Test `extensions.test.tsx`

**Interfaces:** `EditorInvisibleCharacters({ visible?: boolean })`、`EditorInvisibleCharactersToolbar`

- 工具栏切换 `showInvisibleCharacters()` / `hideInvisibleCharacters()`
- 测试：切换后 `editor.storage.invisibleCharacters.visibility()` 取反

```bash
git commit -m "feat(rich-text-editor): add invisible character toggle"
```

### Task 24: playground 组合 + 全量回归

**Files:**
- Modify: `src/registry/blocove/blocks/rich-text-editor-playground.tsx`
- Modify: `src/docs/pages/rich-text-editor/playground.ts`
- Test: `tests/unit/rich-text-editor/playground.test.tsx`、`tests/e2e/rich-text-editor.test.tsx`

**Interfaces:** `RichTextEditorPlayground` 的 props 不变；内部组合全部新扩展。

- [ ] **Step 1: 更新 playground**

按「块级 / 行内 / 文本样式 / 其他」分组工具栏，组间插入 `Separator`。加入全部新扩展与控件；`EditorFloatingMenu` 与 `EditorDragHandle` 也接入。

- [ ] **Step 2: 更新 playground 文档页**

`demoDeps` 追加全部新 item name；`note` 说明 block 现在包含完整扩展集。

- [ ] **Step 3: 追加测试**

playground 单元测试断言新工具栏分组存在；e2e 断言至少一个新增控件可点击并改变文档。

- [ ] **Step 4: 全量验收**

Run: `pnpm run check`
Expected: 全部通过（preset:check / registry:prepare / typecheck / lint / test:coverage / test:e2e / build）

- [ ] **Step 5: 提交**

```bash
git commit -m "feat(rich-text-editor): compose every extension in the playground block"
```

---

## 执行顺序与并发

| 批次 | 任务 | 并发 |
|---|---|---|
| Phase 1 基础设施 | Task 1–5 | Lead 串行（共享文件单写） |
| Phase 1 节点 | Task 6–10 | 各 teammate 并行，Lead 写 registry/nav/snippet |
| Phase 2 标记 | Task 11–15 | 同上 |
| Phase 3 功能 A | Task 16–19 | 同上 |
| Phase 4 功能 B | Task 20–24 | 同上，Task 24 由 Lead 收尾 |
