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

// 在 Markdown 里定位一个不在 ``` 代码块中的结束标记
const findEndMarkerOutsideCode = (s: string) => {
  const tokens = ['</details>', '&lt;/details&gt;', '[ENDTHINKFLAG]']
  let i = 0
  let inFence = false
  while (i < s.length) {
    if (s.startsWith('```', i)) { inFence = !inFence; i += 3; continue }
    if (!inFence) {
      for (const t of tokens) {
        if (s.startsWith(t, i)) return { index: i, token: t }
      }
    }
    i++
  }
  return null
}

// 把“尾部的 </details> / &lt;/details&gt; / [ENDTHINKFLAG]”归一化为完整 <details>
const normalizeReasoning = (raw: string) => {
  if (typeof raw !== 'string') return raw

  // 已处理过（我们自己打的标记），直接返回，避免二次包裹
  if (/<details[^>]*\bdata-think\b/i.test(raw)) return raw

  let s = raw

  // 兼容旧格式：<think>...</think> → <details data-think data-complete="true">...</details>
  s = s.replace(/<think[^>]*>/gi, '<details data-think data-complete="true">')
       .replace(/<\/think>/gi, '</details>')

  // 查找不在代码块内的尾标识
  const m = findEndMarkerOutsideCode(s)
  if (m) {
    const before = s.slice(0, m.index)
    const after = s.slice(m.index + m.token.length)
    // 这里认为“思考内容在前，尾标识之后是正式回答”
    return `<details data-think data-complete="true">${before}</details>${after}`
  }

  // 没有尾标识：保持原样（若你想在流式阶段也显示“思考中…”，可以把下一行注释取消）
  // return `<details data-think data-complete="false">${s}</details>`

  return s
}

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