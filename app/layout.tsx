import { getLocaleOnServer } from '@/i18n/server'

import './styles/globals.css'
import './styles/markdown.scss'

const LocaleLayout = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const locale = getLocaleOnServer()
  return (
    <html lang={locale ?? 'en'} className="h-full">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
      </head>
      <body className="h-full">
        <div className="fixed inset-0 overflow-hidden">
          <div className="h-full min-w-[300px] relative">
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}

export default LocaleLayout
