import s from './input.module.scss'
import { useRef } from 'react'
import type { TCurrency } from '../../types/auth.types'
import { formatWithCommas } from '../../utils/date'

interface TradeInputProps {
  currency: TCurrency
  maximum: number
  minimum: number
  value: string
  isTilt: boolean
  setValue: (value: React.SetStateAction<string>) => void
  tilt: () => void
}

export default function TradeInput({ currency, maximum, minimum, value, isTilt, setValue, tilt }: TradeInputProps) {
  const MAX_VALUE: number = 9999999
  const inputRef = useRef<HTMLInputElement>(null)

  const handlClick = () => {
    if (inputRef.current) inputRef.current.focus()
  }

  const addAmount = (value: number) => {
    setValue((prev) => {
      const num = Number(prev) + value
      if (num > MAX_VALUE) {
        tilt()
        return prev
      }
      return num.toString()
    })
  }

  const setMaxAmount = () => {
    const val = Math.floor(maximum)
    setValue(`${Math.min(val, MAX_VALUE)}`)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '')
    const num = parseInt(raw, 10)
    if (raw === '') setValue('0')
    else if (num <= MAX_VALUE) setValue(num.toString())
    else tilt()
  }

  const displayValue = formatWithCommas(value)

  const className = `row center gap-1 text-bet${isTilt ? ` ${s.tilt}` : ''}`
  return (
    <>
      <div className='row justify center'>
        <div>Количество</div>
        <div className={className} onClick={handlClick}>
          <span>{currency === 'POINT' ? '¢' : '$'}</span>
          <div className={s.input}>
            <input
              ref={inputRef}
              name='amount'
              type='text'
              value={displayValue}
              onChange={handleInputChange}
              inputMode='decimal'
              autoComplete='off'
              autoFocus={true}
              placeholder={`${currency === 'POINT' ? '¢' : '$'}0`}
            />
            <span className={s.mirror}>{displayValue || '0'}</span>
          </div>
        </div>
      </div>

      <div className='row justify center gap-2'>
        <div className='row center gap-1'>
          <span className='label'>Мин.</span>
          <span className='label'>${minimum}</span>
        </div>
        <div className='row gap-2'>
          <button className='chip hover' onClick={() => addAmount(1)}>
            {currency === 'POINT' ? '+¢1' : '+$1'}
          </button>
          <button className='chip hover' onClick={() => addAmount(20)}>
            {currency === 'POINT' ? '+¢20' : '+$20'}
          </button>
          <button className='chip hover' onClick={() => addAmount(100)}>
            {currency === 'POINT' ? '+¢100' : '+$100'}
          </button>
          <button className='chip hover' onClick={setMaxAmount}>
            Max
          </button>
        </div>
      </div>
    </>
  )
}
