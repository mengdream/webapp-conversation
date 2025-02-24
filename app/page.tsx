import type { FC } from 'react'
import React from 'react'

import type { IMainProps } from '@/app/components'
import Main from '@/app/components'

// 设置页面为动态渲染
export const dynamic = 'force-dynamic'
export const revalidate = 0

const App: FC<IMainProps> = ({
  params,
}: any) => {
  return (
    <Main params={params} />
  )
}

export default React.memo(App)
