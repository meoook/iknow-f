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
