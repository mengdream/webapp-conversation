import 'server-only'

import { cookies, headers } from 'next/headers'
import Negotiator from 'negotiator'
import { match } from '@formatjs/intl-localematcher'
import type { Locale } from '.'
import { i18n } from '.'

export const getLocaleOnServer = (): Locale => {
  // @ts-expect-error locales are readonly
  const locales: string[] = i18n.locales

  let languages: string[] | undefined
  // get locale from cookie
  const localeCookie = cookies().get('locale')
  languages = localeCookie?.value ? [localeCookie.value] : []

  if (!languages.length) {
    // Negotiator expects plain object so we need to transform headers
    const negotiatorHeaders: Record<string, string> = {}
    headers().forEach((value, key) => (negotiatorHeaders[key] = value))
    // Use negotiator and intl-localematcher to get best locale
    // 剔除 '*'（无 Accept-Language 时 Negotiator 会返回 ['*']，会让 Intl 抛 RangeError）
    languages = new Negotiator({ headers: negotiatorHeaders }).languages().filter(l => l !== '*')
  }

  if (!languages.length)
    return i18n.defaultLocale as Locale

  // match locale
  try {
    return match(languages, locales, i18n.defaultLocale) as Locale
  }
  catch {
    return i18n.defaultLocale as Locale
  }
}
