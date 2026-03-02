import style from './nonce.module.scss'
import { useEffect, useRef, useState } from 'react'

interface NonceProps {
  length: number
  value: string
  onChange: (nonce: string) => void
}

export default function Nonce({ length, value, onChange }: NonceProps) {
  const [nonce, setNonce] = useState<string[]>(Array.from({ length }, () => ''))
  const firstInput = useRef<HTMLInputElement>(null)

  // Sync internal state with value prop (primarily for resets)
  useEffect(() => {
    if (value === '') {
      setNonce(Array.from({ length }, () => ''))
      firstInput.current?.focus()
    } else if (value.length <= length) {
      const newNonce = Array.from({ length }, (_, i) => value[i] || '')
      setNonce(newNonce)
    }
  }, [value, length])

  const handleNonceChange = (index: number, char: string) => {
    if (!/^\d*$/.test(char)) return
    const newNonce = [...nonce]
    newNonce[index] = char.slice(-1)
    setNonce(newNonce)

    const nextValue = newNonce.join('')
    onChange(nextValue)

    if (char && index < length - 1) {
      const nextInput = document.getElementById(`nonce-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !nonce[index] && index > 0) {
      const prevInput = document.getElementById(`nonce-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const data = e.clipboardData.getData('text').trim()
    const digits = data.replace(/\D/g, '').slice(0, length)
    if (!digits) return

    onChange(digits)

    const nextIndex = Math.min(digits.length, length - 1)
    document.getElementById(`nonce-${nextIndex}`)?.focus()
  }

  return (
    <div className={style.nonce}>
      {nonce.map((digit, i) => (
        <input
          key={i}
          id={`nonce-${i}`}
          type='text'
          inputMode='numeric'
          value={digit}
          onChange={(e) => handleNonceChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          maxLength={1}
          className={style.cell}
          ref={i === 0 ? firstInput : undefined}
        />
      ))}
    </div>
  )
}
