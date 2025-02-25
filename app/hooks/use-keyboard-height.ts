// hooks/use-keyboard-height.ts
import { useEffect, useState } from 'react'
import { useIsMobile } from './use-is-mobile'

export const useKeyboardHeight = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const isMobile = useIsMobile()

  useEffect(() => {
    if (!isMobile) return

    const handleResize = () => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        const viewportHeight = window.visualViewport?.height || window.innerHeight
        const keyboardHeight = window.innerHeight - viewportHeight
        setKeyboardHeight(keyboardHeight)
      } else {
        setKeyboardHeight(0)
      }
    }

    window.visualViewport?.addEventListener('resize', handleResize)
    window.visualViewport?.addEventListener('scroll', handleResize)

    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize)
      window.visualViewport?.removeEventListener('scroll', handleResize)
    }
  }, [isMobile])

  return keyboardHeight
}