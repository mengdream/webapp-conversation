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
import { flow } from 'lodash'
import ThinkBlock from './markdown-blocks/think-block'

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

// 预处理 Think 标签
const preprocessThinkTag = (content: string) => {
  if (typeof content !== 'string')
    return content

  return content.replace(
    /<details style="[^"]*">/g,
    '<details style="color:gray;background-color: #f8f8f8;padding: 8px;border-radius: 4px;" open>'
  )
}

export function Markdown({ content }: { content: string }) {
  // 预处理内容
  const processedContent = preprocessThinkTag(content)

  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[RemarkMath, RemarkGfm, RemarkBreaks]}
        rehypePlugins={[RehypeKatex, RehypeRaw]}
        components={{
          code: CodeBlock,
          details: ({ node, ...props }) => <ThinkBlock {...props} />,
        }}
        linkTarget={'_blank'}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  )
}
