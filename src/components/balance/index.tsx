import style from './balance.module.scss'
import { useEffect, useState } from 'react'

interface BalanceProps {
  name: string
  balance: number | string
  currency?: string
}

export default function Balance({ name, balance, currency }: BalanceProps) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const targetValue = typeof balance === 'string' ? Number(balance) : balance
    const duration = 700 // Длительность анимации в миллисекундах
    const startTime = Date.now()
    const startValue = 0

    const animate = () => {
      const currentTime = Date.now()
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing function для плавности (ease-out)
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentValue = startValue + (targetValue - startValue) * easeOutQuart

      setDisplayValue(currentValue)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [balance])

  const getCurrencySymbol = (curr?: string): string => {
    if (!curr) return ''
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      RUB: '₽',
      GBP: '£',
      JPY: '¥',
      CNY: '¥',
      STR: '⭐',
    }
    return symbols[curr] || curr
  }

  const formatBalance = (value: number): string => {
    return value.toFixed(2)
  }

  return (
    <div className={style.balance}>
      <div className={style.name}>{name}</div>
      <div className={style.amount}>
        {getCurrencySymbol(currency)}
        {formatBalance(displayValue)}
      </div>
    </div>
  )
}
