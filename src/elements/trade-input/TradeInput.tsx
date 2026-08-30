import s from './input.module.scss'
import { useRef } from 'react'
import { formatWithCommas } from '../../utils/date'

interface TradeInputProps {
  maximum: number
  minimum: number
  value: number
  isTilt: boolean
  setValue: (value: number) => void
  tilt: () => void
}

export default function TradeInput({ maximum, minimum, value, isTilt, setValue, tilt }: TradeInputProps) {
  const MAX_VALUE: number = 9999999
  const inputRef = useRef<HTMLInputElement>(null)

  const handlClick = () => {
    if (inputRef.current) inputRef.current.focus()
  }

  const addAmount = (val: number) => {
    const num = val + value
    if (num <= MAX_VALUE) setValue(num)
    else tilt()
  }

  const setMaxAmount = () => {
    const val = Math.floor(maximum)
    setValue(Math.min(val, MAX_VALUE))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '')
    const num = parseInt(raw, 10)
    if (raw === '') setValue(0)
    else if (num <= MAX_VALUE) setValue(num)
    else tilt()
  }

  const displayValue = formatWithCommas(value)

  const className = `row center gap-1 justify-end grow text-bet${isTilt ? ` ${s.tilt}` : ''}`
  return (
    <>
      <div className='row justify center' onClick={handlClick}>
        <div>Количество</div>
        <div className={className}>
          <span>$</span>
          <div className={s.input}>
            <input
              ref={inputRef}
              name='amount'
              type='text'
              value={displayValue}
              onChange={handleInputChange}
              inputMode='decimal'
              autoComplete='off'
              placeholder='$0'
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
            +$1
          </button>
          <button className='chip hover' onClick={() => addAmount(10)}>
            +$10
          </button>
          <button className='chip hover' onClick={() => addAmount(50)}>
            +$50
          </button>
          <button className='chip hover' onClick={setMaxAmount}>
            Max
          </button>
        </div>
      </div>
    </>
  )
}
