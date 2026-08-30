export const formatRelativeTime = (date: string | number | Date): string => {
  const now = new Date()
  const past = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)

  if (diffInSeconds < 0) return past.toLocaleDateString()

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)

  if (diffInDays > 30) return past.toLocaleDateString()
  if (diffInDays >= 1) return `${diffInDays} д назад`
  if (diffInHours >= 1) return `${diffInHours} ч назад`
  if (diffInMinutes >= 1) return `${diffInMinutes} мин назад`
  if (diffInSeconds >= 20) return `${diffInSeconds} сек назад`

  return 'только что'
}

export const formatWithCommas = (val: string | number) => {
  const num = typeof val === 'string' ? parseInt(val.replace(/\D/g, ''), 10) : val
  if (isNaN(num)) return ''
  return new Intl.NumberFormat('en-US').format(num)
}

export const getCookie = (name: string) => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift()
}

export const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
export const REGEX_ADDRESS = /^0x[a-fA-F0-9]{40}$/

export const GROUPS_MAP: Record<string, string> = {
  '': 'Все',
  politics: 'Политика',
  sport: 'Спорт',
  finance: 'Финансы',
  crypto: 'Крипта',
  geopolitics: 'Геополитика',
  tech: 'Технологии',
  culture: 'Культура',
  world: 'Мир',
  economy: 'Экономика',
  elections: 'Выборы',
  mentions: 'Упоминания',
  other: 'Другое',
}
