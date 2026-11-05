export const richTextSamples = {
  /** A small document with every node family the docs demo uses. */
  document: [
    '<h2>Composable editor</h2>',
    '<p>Some <strong>bold</strong>, <em>italic</em>, <u>underline</u> and <s>strike</s> text with <code>inline code</code> and a <a href="https://example.com">link</a>.</p>',
    '<p>Hard break inside a paragraph.<br>Second line.</p>',
  ].join(''),
  /** A single paragraph, handy for controlled value tests. */
  paragraph: '<p>Hello world</p>',
  /** The diff sample the code editor tests compare against. */
  code: 'const answer = 42\nconsole.log(answer)\n',
}

export const codeSamples = {
  typescript: [
    'type User = {',
    '  id: string',
    '  name: string',
    '}',
    '',
    'export function greet(user: User) {',
    // eslint-disable-next-line no-template-curly-in-string -- sample source text
    '  return `Hello ${user.name}`',
    '}',
  ].join('\n'),
  diffOriginal: 'const answer = 41\nconsole.log(answer)\n',
  diffUpdated: 'const answer = 42\nconsole.log(answer)\n',
}
