// hooks/use-keyboard-height.ts
import { useEffect, useState } from 'react'
import { useIsMobile } from './use-is-mobile'

const isDingTalkAndroid = () => {
  const ua = window.navigator.userAgent.toLowerCase()
  return ua.includes('dingtalk') && ua.includes('android')
}

export const useKeyboardHeight = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const isMobile = useIsMobile()
  const [isDingTalkAndroidEnv] = useState(isDingTalkAndroid())

  useEffect(() => {
    if (!isMobile) return

    const handleResize = () => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        if (isDingTalkAndroidEnv) {
          // 钉钉Android环境使用固定的底部padding
          setKeyboardHeight(240)
        } else {
          const viewportHeight = window.visualViewport?.height || window.innerHeight
          const keyboardHeight = window.innerHeight - viewportHeight
          setKeyboardHeight(keyboardHeight)
        }
      } else {
        setKeyboardHeight(0)
      }
    }

    const handleFocus = () => {
      if (isDingTalkAndroidEnv) {
        // 在钉钉Android环境中，当输入框获得焦点时，滚动到底部
        setTimeout(() => {
          window.scrollTo(0, document.body.scrollHeight)
        }, 300)
      }
    }

    window.visualViewport?.addEventListener('resize', handleResize)
    window.visualViewport?.addEventListener('scroll', handleResize)
    document.addEventListener('focus', handleFocus, true)

    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize)
      window.visualViewport?.removeEventListener('scroll', handleResize)
      document.removeEventListener('focus', handleFocus, true)
    }
  }, [isMobile, isDingTalkAndroidEnv])

  return {
    keyboardHeight,
    isDingTalkAndroidEnv
  }
}