// Initial document for each demo. The demos and the generated usage snippets
// share it, so the preview always matches the code sample.
export const richTextEditorDemoContent = {
  overview: [
    '<h2>Composable by design</h2>',
    '<p>Blocove ships the rich text editor as small Tiptap components. Compose the ones you need and keep the rest out of your bundle.</p>',
    '<p>Try <strong>bold</strong>, <em>italic</em>, <u>underline</u>, <s>strikethrough</s>, <code>inline code</code> and a <a href="https://ui.shadcn.com/docs/typeset">link</a>.</p>',
    '<p>Select some text to open the bubble menu.</p>',
  ].join(''),

  text: [
    '<p>Text is the leaf node every editor document is built from. Marks and inline content live inside it.</p>',
    '<p>Blocove keeps extensions explicit: register the text node, then add only the nodes and marks you compose.</p>',
    '<p>This demo wires the text node next to paragraphs and hard breaks. The toolbar still works because the base editor owns history and alignment.</p>',
  ].join(''),

  paragraph: [
    '<p>Paragraphs are the default block. The node splits on Enter, merges on Backspace and owns the block attributes of the document.</p>',
    '<p>Every paragraph carries its own alignment. Place the caret in a block and use the alignment controls in the toolbar.</p>',
    '<p>Because the paragraph is declared as a component, you can pass HTML attributes such as a shared class for the reading rhythm.</p>',
  ].join(''),

  hardBreak: [
    '<p>Hard breaks keep two lines inside the same block.<br>Press Shift + Enter at the end of a line to insert one.</p>',
    '<p>Use hard breaks for addresses, lyrics and short lines.<br>Each line keeps the paragraph attributes, including alignment.</p>',
  ].join(''),

  heading: [
    '<h1>Heading 1</h1>',
    '<h2>Heading 2</h2>',
    '<h3>Heading 3</h3>',
    '<p>Headings anchor the document and are styled by typeset. Place the caret in any block and pick a level from the toolbar.</p>',
  ].join(''),

  codeBlock: [
    '<p>Code blocks keep preformatted content inside the document.</p>',
    '<pre><code>const editor = createEditor({ extensions: [Text, Paragraph] })</code></pre>',
    '<p>Place the caret in a paragraph and use the toolbar to toggle a code block.</p>',
  ].join(''),

  details: [
    '<details open><summary>What is Tiptap?</summary><div data-type="detailsContent"><p>Tiptap is a headless editor framework built on ProseMirror. Blocove wraps its extensions as composable components.</p></div></details>',
    '<p>Details blocks collapse long content. Click the chevron to toggle the block, or insert a new one from the toolbar.</p>',
  ].join(''),

  image: [
    '<p>Images are block nodes in the document.</p>',
    '<img src="/editor-image.svg" alt="Blocove editor example">',
    '<p>Use the toolbar to insert an image by URL. Selecting an image pre-fills its current source.</p>',
  ].join(''),

  table: [
    '<p>Tables are rendered as native table elements and styled by typeset.</p>',
    '<table><tbody><tr><th>Component</th><th>Package</th></tr><tr><td>Editor</td><td>@tiptap/react</td></tr><tr><td>Table</td><td>@tiptap/extension-table</td></tr><tr><td>Placeholder</td><td>@tiptap/extensions</td></tr></tbody></table>',
    '<p>Use the table menu to insert a 3×3 table and add or remove rows and columns.</p>',
  ].join(''),

  blockquote: [
    '<p>Blockquotes set a passage apart from the body of the document.</p>',
    '<blockquote><p>Typst was never meant to replace the tools people already use; it was meant to make them stop fighting their documents.</p></blockquote>',
    '<p>Place the caret in any paragraph and toggle the quote from the toolbar.</p>',
  ].join(''),

  list: [
    '<p>Lists group related items. Three kinds ship together because they share the same item node.</p>',
    '<ul><li><p>Unordered item</p></li><li><p>Another item</p></li></ul>',
    '<ol><li><p>First step</p></li><li><p>Second step</p></li></ol>',
    '<ul data-type="taskList"><li data-type="taskItem" data-checked="true"><p>Shipped the component</p></li><li data-type="taskItem" data-checked="false"><p>Write the docs</p></li></ul>',
  ].join(''),

  emoji: [
    '<p>Emoji are inline nodes, so they flow with the surrounding text like any other character.</p>',
    '<p>Type <code>:smile</code> to open the picker, or insert one from the toolbar: <span data-type="emoji" data-name="smile"></span></p>',
  ].join(''),

  mathematics: [
    '<p>Mathematics renders through KaTeX, both inline and as its own block.</p>',
    '<p>Energy and mass: <span data-type="inline-math" data-latex="E = mc^2"></span></p>',
    '<div data-type="block-math" data-latex="\sum_{i=1}^{n} x_i = X"></div>',
    '<p>Use the toolbar to insert either form and edit the LaTeX source.</p>',
  ].join(''),

  mention: [
    '<p>Mentions are inline nodes that point at a record in your own data.</p>',
    '<p>Morning standup with <span data-type="mention" data-id="ada" data-label="Ada Lovelace"></span> and <span data-type="mention" data-id="alan" data-label="Alan Turing"></span>.</p>',
    '<p>Type <code>@</code> to open the suggestion list.</p>',
  ].join(''),

  highlight: [
    '<p>This paragraph contains <mark>highlighted text</mark> next to regular text.</p>',
    '<p>Select a word and toggle the mark from the toolbar or the bubble menu.</p>',
  ].join(''),

  ruby: [
    '<p>Ruby annotations place a reading above the base text: <ruby>漢字<rt>かんじ</rt></ruby>.</p>',
    '<p>Select a word, open the toolbar control and give it the annotation.</p>',
  ].join(''),

  subscript: [
    '<p>Chemical formulas use the mark: H<sub>2</sub>O and CO<sub>2</sub>.</p>',
    '<p>Select a word and toggle the mark from the toolbar.</p>',
  ].join(''),

  superscript: [
    '<p>Exponents use the mark: E = mc<sup>2</sup> and x<sup>2</sup> + y<sup>2</sup>.</p>',
    '<p>Select a word and toggle the mark from the toolbar.</p>',
  ].join(''),

  textStyle: [
    '<p>The text style mark carries <span style="color: #dc2626">a color</span>, <span style="font-size: 22px">a font size</span> and <span style="font-family: Georgia, serif">a font family</span>.</p>',
    '<p>Select a word, then pick a value from the text style control in the toolbar.</p>',
  ].join(''),

  dragHandle: [
    '<p>Hover the left edge of a block to reveal the drag handle.</p>',
    '<p>Drag a block to move it above or below its neighbours, including the blocks nested inside lists and quotes.</p>',
    '<ul><li><p>Nested blocks can be dragged on their own.</p></li></ul>',
  ].join(''),

  fileHandler: [
    '<p>Paste or drop a file onto the editor and the handler inserts it as an image.</p>',
    '<p>Images pasted from the clipboard become data URLs, so the document stays self-contained.</p>',
  ].join(''),

  findAndReplace: [
    '<p>The word editor appears more than once in this document: editor.</p>',
    '<p>Open the toolbar control, search for editor and step through the results.</p>',
  ].join(''),

  behavior: [
    '<p>This document wires the focus ring, the gap cursor and the trailing node.</p>',
    '<p>Click outside the editor to see the focus ring appear, and place the caret between blocks to see the gap cursor.</p>',
  ].join(''),

  typography: [
    '<p>Type two hyphens for an em dash, three dots for an ellipsis, or quotes for smart punctuation.</p>',
    '<p>The rules rewrite "--", "..." and straight quotes as you type.</p>',
  ].join(''),

  uniqueId: [
    '<p>Every block gets a stable id attribute the first time it is parsed.</p>',
    '<p>Open the HTML panel to see the generated ids on each block.</p>',
  ].join(''),

  invisibleCharacters: [
    '<p>Toggle the control to reveal the spaces and the paragraph marks in this document.</p>',
    '<p>Invisible characters are decorations: they never enter the document itself.</p>',
  ].join(''),

  bold: [
    '<p>This paragraph contains <strong>bold text</strong> next to regular text.</p>',
    '<p>Select a word and use the toolbar or the bubble menu to toggle the mark.</p>',
  ].join(''),

  italic: [
    '<p>This paragraph contains <em>italic text</em> next to regular text.</p>',
    '<p>Select a word and use the toolbar or the bubble menu to toggle the mark.</p>',
  ].join(''),

  underline: [
    '<p>This paragraph contains <u>underlined text</u> next to regular text.</p>',
    '<p>Select a word and use the toolbar or the bubble menu to toggle the mark.</p>',
  ].join(''),

  strike: [
    '<p>This paragraph contains <s>struck text</s> next to regular text.</p>',
    '<p>Select a word and use the toolbar or the bubble menu to toggle the mark.</p>',
  ].join(''),

  code: [
    '<p>This paragraph contains <code>inline code</code> next to regular text.</p>',
    '<p>Use the mark for identifiers, commands and short snippets. Code blocks are a separate node.</p>',
  ].join(''),

  link: [
    '<p>This paragraph contains a <a href="https://ui.shadcn.com">link</a> next to regular text.</p>',
    '<p>Select a word and use the toolbar to add, replace or remove its URL.</p>',
  ].join(''),
}
