import type { DocsPageData } from '@/docs/types'
import LoginDemo from '@/docs/examples/login-01'
import loginDemoCode from '@/docs/examples/login-01?raw'

const usageSnippet = `import { LoginForm } from "@/components/login-form"

export function Example() {
  return (
    <div className="w-full max-w-sm">
      <LoginForm />
    </div>
  )
}`

export const loginDocs: DocsPageData = {
  examples: [
    {
      title: 'Default',
      component: LoginDemo,
      code: loginDemoCode,
    },
  ],
  usage: [
    {
      title: 'Usage',
      code: usageSnippet,
      language: 'tsx',
    },
  ],
  api: [
    {
      name: 'LoginForm',
      description: 'A login form composed from shadcn/ui primitives.',
      extends: 'React.ComponentProps<\'div\'>',
      rows: [
        { prop: 'className', type: 'string', default: '-' },
        { prop: '...props', type: 'React.ComponentProps<\'div\'>', default: '-' },
      ],
    },
  ],
}
