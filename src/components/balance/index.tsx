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
    const duration = 1200
    const steps = 60
    const increment = targetValue / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= targetValue) {
        setDisplayValue(targetValue)
        clearInterval(timer)
      } else {
        setDisplayValue(current)
      }
    }, duration / steps)

    return () => clearInterval(timer)
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

  return (
    <div className={style.balance}>
      <div className={style.name}>{name}</div>
      <div className={style.amount}>
        {getCurrencySymbol(currency)}
        {displayValue.toFixed(2)}
      </div>
    </div>
  )
}
