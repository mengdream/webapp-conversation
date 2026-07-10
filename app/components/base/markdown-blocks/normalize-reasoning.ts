// 把模型输出里的思考段与正式回答拆开。
// 实测上游（Dify + DeepSeek）有三种形态：
// 1. '<think>\n' + 正文（无闭合标签、无思考内容，思考被上游剥离但开标签残留）
//    → 整段都是正文，剥掉开标签直接显示
// 2. '<think>思考...</think>' + 正文（思考可能为空，如 '<think>\n\n</think>\n\n正文'）
//    → 思考非空时包进 data-think details，正文独立在外；思考为空则只显示正文
// 3. 纯正文，无任何标签 → 原样返回

// 在 Markdown 里定位一个不在 ``` 代码块中的结束标记
const findEndMarkerOutsideCode = (s: string) => {
  const tokens = ['</think>', '</details>', '&lt;/details&gt;', '[ENDTHINKFLAG]']
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

// 只认内容开头的 <think>（聊天模板发出的首 token），避免误伤代码块/正文里的同名标签
const OPEN_TAG_RE = /^\s*<think[^>]*>/i

export const normalizeReasoning = (raw: string): string => {
  if (typeof raw !== 'string') return raw

  // 已处理过（我们自己打的标记），直接返回，避免二次包裹
  if (/<details[^>]*\bdata-think\b/i.test(raw)) return raw

  // 统一转义形态 &lt;think&gt; → <think>
  const s = raw.replace(/&lt;(\/?)think&gt;/gi, '<$1think>')

  const m = findEndMarkerOutsideCode(s)
  if (m) {
    // 思考在前、正文在后
    let thinking = s.slice(0, m.index)
    const answer = s.slice(m.index + m.token.length).replace(/^\s+/, '')
    // 剥掉思考段自身的开标签/上游 details 包装，
    // 否则拼出嵌套且未闭合的 <details>，会把正文一起吞进思考块
    thinking = thinking
      .replace(OPEN_TAG_RE, '')
      .replace(/<details[^>]*>/gi, '')
      .replace(/<summary[^>]*>[\s\S]*?<\/summary>/gi, '')
      .trim()
    // 思考内容为空 → 不渲染思考块
    if (!thinking) return answer
    return `<details data-think data-complete="true">${thinking}</details>\n\n${answer}`
  }

  // 只有开标签、没有闭合：当前上游关思考时输出 '<think>\n正文'，
  // 后面的内容就是正式回答，剥掉开标签当正文显示。
  // （若换成真思考的流式输出，闭合标签到达前思考会先按正文渲染，到达后自动归位为思考块）
  if (OPEN_TAG_RE.test(s)) return s.replace(OPEN_TAG_RE, '').replace(/^\s+/, '')

  return s
}
