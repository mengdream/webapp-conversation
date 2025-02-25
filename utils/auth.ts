// /app/utils/auth.ts

import md5 from 'md5'

// 设置 session_id cookie
export const setSessionId = (sessionId: string) => {
  // 清空原有的session
  document.cookie = 'session_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;'
  if (typeof document === 'undefined')
    return
  document.cookie = `session_id=${sessionId}; path=/`
}

// 获取 session_id 从 cookie
export const getSessionId = () => {
  if (typeof document === 'undefined')
    return null
  const cookies = document.cookie.split(';')
  const sessionCookie = cookies.find(cookie => cookie.trim().startsWith('session_id='))
  return sessionCookie ? sessionCookie.trim().split('=')[1] : null
}

export const validateAccess = (userid: string, current: string, verify: string) => {
  if (!userid || !current || !verify)
    return false

  // 在生产环境下验证时间戳
  if (process.env.NODE_ENV === 'production') {
    // 验证时间格式是否正确（14位数字：年月日时分秒）
    if (!/^\d{14}$/.test(current))
      return false

    // 解析时间字符串
    const year = parseInt(current.substring(0, 4))
    const month = parseInt(current.substring(4, 6)) - 1 // 月份从0开始
    const day = parseInt(current.substring(6, 8))
    const hour = parseInt(current.substring(8, 10))
    const minute = parseInt(current.substring(10, 12))
    const second = parseInt(current.substring(12, 14))

    const timestamp = new Date(year, month, day, hour, minute, second).getTime()
    const now = Date.now()
    const fiveMinutes = 5 * 60 * 1000 // 5分钟的毫秒数

    // 验证时间戳不能超过当前时间5分钟
    if (Math.abs(now - timestamp) > fiveMinutes)
      return false
  }

  const verifyKey = process.env.NEXT_PUBLIC_VERIFY_KEY
  const stringToHash = `${userid}${current}${verifyKey}`
  const calcHash = md5(stringToHash)
  
  if (verify !== calcHash)
    return false

  // 将 URL 中的 userid 设置为 session_id
  setSessionId(userid)
  return true
}

export const getUrlParams = () => {
  if (typeof window === 'undefined')
    return {}
  const urlParams = new URLSearchParams(window.location.search)
  return {
    userid: urlParams.get('userid'),
    verify: urlParams.get('verify'),
    current: urlParams.get('current'),
  }
}
