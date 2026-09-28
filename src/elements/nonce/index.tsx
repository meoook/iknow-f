import style from './nonce.module.scss'
import { useEffect, useRef, useState } from 'react'

interface NonceProps {
  length: number
  value: string
  onChange: (nonce: string) => void
}

export default function Nonce({ length, value, onChange }: NonceProps) {
  const [nonce, setNonce] = useState<string[]>(Array.from({ length }, () => ''))
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])

  // Sync internal state with value prop (primarily for resets)
  useEffect(() => {
    if (value === '') {
      setNonce(Array.from({ length }, () => ''))
      inputsRef.current[0]?.focus()
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
      inputsRef.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !nonce[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent, index: number) => {
    e.preventDefault()
    const data = e.clipboardData.getData('text').trim()
    const digits = data.replace(/\D/g, '')
    if (!digits) return

    const startFrom = digits.length >= length ? 0 : index
    const newNonce = [...nonce]
    for (let i = 0; i < digits.length && startFrom + i < length; i++) {
      newNonce[startFrom + i] = digits[i]
    }
    setNonce(newNonce)

    const nextValue = newNonce.join('')
    onChange(nextValue)

    const nextIndex = Math.min(startFrom + digits.length, length - 1)
    inputsRef.current[nextIndex]?.focus()
  }

  return (
    <div className={style.nonce}>
      {nonce.map((digit, i) => (
        <input
          key={i}
          id={`nonce-${i}`}
          type='text'
          inputMode='numeric'
          // autoComplete='one-time-code'
          value={digit}
          onChange={(e) => handleNonceChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={(e) => handlePaste(e, i)}
          maxLength={1}
          className={style.cell}
          ref={(el) => {
            inputsRef.current[i] = el
          }}
        />
      ))}
    </div>
  )
}
