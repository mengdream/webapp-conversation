'use client'
import { useEffect } from 'react'
export default function DingEntry() {
  useEffect(() => {
    let cancelled = false
      ; (async () => {
      // 只在客户端加载
      const mod = await import('dingtalk-jsapi')
      const dd: any = (mod as any).default || mod

      const corpId = new URLSearchParams(location.search).get('corpId') || ''

      dd.ready(async () => {
        try {
          const { code } = await dd.runtime.permission.requestAuthCode({ corpId })
          const resp = await fetch('/api/dingtalk/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code }),
          })
          const data = await resp.json()
          if (!cancelled && data?.redirect)
            dd.biz.util.openLink({ url: data.redirect })
        }
        catch (e) {
          if (!cancelled)
            alert('免登失败：请从钉钉工作台重新打开。')
          console.error(e)
        }
      })
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return <div style={{ padding: 16 }}>正在拉取身份…</div>
}
