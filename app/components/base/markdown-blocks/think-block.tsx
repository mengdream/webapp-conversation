// markdown-blocks/think-block.tsx
'use client'
import React from 'react'

const hasEndThink = (children: any): boolean => {
  if (typeof children === 'string') return children.includes('[ENDTHINKFLAG]')
  if (Array.isArray(children)) return children.some(child => hasEndThink(child))
  if (children?.props?.children) return hasEndThink(children.props.children)
  return false
}

const removeEndThink = (children: any): any => {
  if (typeof children === 'string') return children.replace('[ENDTHINKFLAG]', '')
  if (Array.isArray(children)) return children.map(child => removeEndThink(child))
  if (children?.props?.children) {
    return React.cloneElement(children, {
      ...children.props,
      children: removeEndThink(children.props.children),
    })
  }
  return children
}

const parseBool = (v: any): boolean | undefined => {
  if (v === undefined) return undefined
  const s = String(v).toLowerCase()
  if (s === 'true' || s === '') return true
  if (s === 'false') return false
  return undefined
}

const ThinkBlock = ({ children, ...props }: any) => {
  // 优先用 data-complete；没有则回退到旧探测
  const forced = parseBool((props as any)['data-complete'])
  const isComplete = typeof forced === 'boolean' ? forced : hasEndThink(children)
  const displayContent = removeEndThink(children)
  // 默认展开，点击 summary 仍可手动收起
  const [open, setOpen] = React.useState(true)

  return (
    <details
      open={open}
      onToggle={(e: any) => setOpen(e.currentTarget.open)}
      className="group"
      style={{
        color: 'gray',
        backgroundColor: '#f8f8f8',
        padding: '8px',
        borderRadius: '4px',
      }}
    >
      <summary className="text-gray-500 font-bold list-none pl-2 flex items-center cursor-pointer select-none whitespace-nowrap">
        <div className="flex-shrink-0 flex items-center">
          <svg
            className="w-3 h-3 mr-2 transform transition-transform duration-500 group-open:rotate-90"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          {isComplete ? '思考完成' : '思考中...'}
        </div>
      </summary>
      <div className="text-gray-500 p-3 ml-2 bg-gray-50 border-l border-gray-300 whitespace-pre-wrap break-words">
        {displayContent}
      </div>
    </details>
  )
}

export default ThinkBlock