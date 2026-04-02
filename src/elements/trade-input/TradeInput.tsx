import s from './input.module.scss'
import { useRef } from 'react'
import type { TCurrency } from '../../types/auth.types'

interface TradeInputProps {
  currency: TCurrency
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  tilt?: boolean
  autoFocus?: boolean
}

export default function TradeInput({ currency, value, onChange, tilt }: TradeInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const handlClick = () => {
    if (inputRef.current) inputRef.current.focus()
  }

  const className = `row center gap-1 text-bet${tilt ? ` ${s.tilt}` : ''}`

  return (
    <div className={className} onClick={handlClick}>
      <span>{currency === 'POINT' ? '¢' : '$'}</span>
      <div className={s.input}>
        <input
          ref={inputRef}
          name='amount'
          type='text'
          value={value}
          onChange={onChange}
          inputMode='decimal'
          autoComplete='off'
          autoFocus={true}
          placeholder={`${currency === 'POINT' ? '¢' : '$'}0`}
        />
        <span className={s.mirror}>{value || '0'}</span>
      </div>
    </div>
  )
}
