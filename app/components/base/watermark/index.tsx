'use client'

import { FC, useEffect, useState } from 'react'
import { getSessionId } from '@/utils/auth'

const Watermark: FC = () => {
  const [userId, setUserId] = useState('')

  useEffect(() => {
    const sessionId = getSessionId()
    if (sessionId) {
      setUserId(sessionId)
    }
  }, [])

  if (!userId) return null

  // 创建一个32个元素的数组用于填充网格
  const watermarkItems = Array(32).fill(null)

  return (
    <div className="watermark">
      {watermarkItems.map((_, index) => (
        <div key={index} className="watermark-item">{userId}</div>
      ))}
    </div>
  )
}

export default Watermark
