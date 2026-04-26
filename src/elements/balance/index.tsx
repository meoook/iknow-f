import s from './balance.module.scss'
import { useEffect, useState, useRef } from 'react'

interface BalanceProps {
  name: string
  balance: number | string
}

export default function Balance({ name, balance }: BalanceProps) {
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

  return (
    <div className={s.balance}>
      <div className={s.name}>{name}</div>
      <div className={s.amount}>${displayValue.toFixed(2)}</div>
    </div>
  )
}
