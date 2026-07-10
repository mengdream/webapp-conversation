// markdown.tsx
import ReactMarkdown from 'react-markdown'
import 'katex/dist/katex.min.css'
import RemarkMath from 'remark-math'
import RemarkBreaks from 'remark-breaks'
import RehypeKatex from 'rehype-katex'
import RemarkGfm from 'remark-gfm'
import RehypeRaw from 'rehype-raw'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { atelierHeathLight } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import { memo } from 'react'
import type { CodeComponent } from 'react-markdown/lib/ast-to-react'
import ThinkBlock from './markdown-blocks/think-block'
import { normalizeReasoning } from './markdown-blocks/normalize-reasoning'

const CodeBlock: CodeComponent = memo(({ inline, className, children, ...props }) => {
  const match = /language-(\w+)/.exec(className || '')
  return !inline && match ? (
    <SyntaxHighlighter
      {...props}
      style={atelierHeathLight}
      language={match[1]}
      PreTag="div"
    >
      {String(children).replace(/\n$/, '')}
    </SyntaxHighlighter>
  ) : (
    <code className={className} {...props}>
      {children}
    </code>
  )
})
CodeBlock.displayName = 'CodeBlock'

export function Markdown({ content }: { content: string }) {
  const processedContent = normalizeReasoning(content)

  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[RemarkMath, RemarkGfm, RemarkBreaks]}
        rehypePlugins={[RehypeKatex, RehypeRaw]}
        components={{
          code: CodeBlock,
          // 仅当是 data-think 的 details 才用 ThinkBlock 渲染；否则走原生 details
          details: ({ node, ...props }) => {
            const isThink = Object.prototype.hasOwnProperty.call(props as any, 'data-think')
            return isThink ? <ThinkBlock {...props} /> : <details {...props} />
          },
        }}
        linkTarget="_blank"
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  )
}