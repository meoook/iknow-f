import style from './balance.module.scss'
import { useEffect, useState, useRef } from 'react'

interface BalanceProps {
  name: string
  balance: number | string
  currency?: string
}

export default function Balance({ name, balance, currency }: BalanceProps) {
  const targetValue = typeof balance === 'string' ? Number(balance) || 0 : balance
  const [displayValue, setDisplayValue] = useState(0)
  const prevValueRef = useRef(0)

  useEffect(() => {
    const startValue = prevValueRef.current
    const diff = targetValue - startValue

    if (Math.abs(diff) < 0.01) {
      setDisplayValue(targetValue)
      prevValueRef.current = targetValue
      return
    }

    const duration = 1200
    const fps = 60
    const totalFrames = (duration / 1000) * fps
    const increment = diff / totalFrames
    let current = startValue

    const timer = setInterval(() => {
      current += increment

      const isComplete = diff > 0 ? current >= targetValue : current <= targetValue

      if (isComplete) {
        setDisplayValue(targetValue)
        prevValueRef.current = targetValue
        clearInterval(timer)
      } else {
        setDisplayValue(current)
      }
    }, 1000 / fps)

    return () => {
      clearInterval(timer)
      prevValueRef.current = current
    }
  }, [targetValue])

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
