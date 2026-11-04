import type { DocsPageData } from '@/docs/types'
import { editorDocs } from './editor'
import { boldDocs } from './editor-bold'
import { codeDocs } from './editor-code'
import { codeBlockDocs } from './editor-code-block'
import { detailsDocs } from './editor-details'
import { hardBreakDocs } from './editor-hard-break'
import { headingDocs } from './editor-heading'
import { imageDocs } from './editor-image'
import { italicDocs } from './editor-italic'
import { linkDocs } from './editor-link'
import { paragraphDocs } from './editor-paragraph'
import { strikeDocs } from './editor-strike'
import { tableDocs } from './editor-table'
import { textDocs } from './editor-text'
import { underlineDocs } from './editor-underline'
import { loginDocs } from './login-01'

const docsPages: Record<string, DocsPageData> = {
  'editor': editorDocs,
  'editor-text': textDocs,
  'editor-paragraph': paragraphDocs,
  'editor-hard-break': hardBreakDocs,
  'editor-heading': headingDocs,
  'editor-code-block': codeBlockDocs,
  'editor-details': detailsDocs,
  'editor-image': imageDocs,
  'editor-table': tableDocs,
  'editor-bold': boldDocs,
  'editor-italic': italicDocs,
  'editor-underline': underlineDocs,
  'editor-strike': strikeDocs,
  'editor-code': codeDocs,
  'editor-link': linkDocs,
  'login-01': loginDocs,
}

export function getDocsPage(name: string) {
  return docsPages[name]
}
