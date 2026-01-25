import style from './panel.module.scss'
import { useRef, useState } from 'react'
import { useAppSelector } from '../../../hooks/useRedux'
import { useCreateMyBetMutation } from '../../../services/api'
import type { IChoice, IPredictionDetail } from '../../../types/app.types'
import type { TCurrency } from '../../../types/auth.types'
import { config } from '../../../config/config'
import IconSprite from '../../../elements/icon/Icon'

interface TradePanelProps {
  prediction: IPredictionDetail
  selectedChoice: IChoice | null
}

export default function TradePanel({ prediction, selectedChoice }: TradePanelProps) {
  const MAX_VALUE: number = 99999999
  const { user, loading } = useAppSelector((state) => state.auth)
  const [createBet, { isLoading }] = useCreateMyBetMutation()

  const [currency, setCurrency] = useState<TCurrency>('CASH')
  const [amount, setAmount] = useState<string>('0')
  const [isTilt, setIsTilt] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleCreateBet = async () => {
    if (!selectedChoice) return
    const balance = currency === 'CASH' ? user?.balances.CASH : user?.balances.POINT
    if (Number(amount) > (balance || 0)) {
      setIsTilt(true)
      setTimeout(() => setIsTilt(false), 1000)
      return
    }

    try {
      await createBet({ choice_id: selectedChoice.id, currency, amount: Number(amount) }).unwrap()
      setAmount('0')
    } catch (e) {
      setIsTilt(true)
      setTimeout(() => setIsTilt(false), 1000)
    }
  }

  const setMaxAmount = () => {
    if (currency === 'CASH') {
      const value = user?.balances.CASH ? Math.floor(user.balances.CASH) : 0
      setAmount(`${Math.min(value, MAX_VALUE)}`)
    } else {
      const value = user?.balances.POINT ? Math.floor(user.balances.POINT) : 0
      setAmount(`${Math.min(value, MAX_VALUE)}`)
    }
  }

  const formatWithCommas = (val: string) => {
    const num = parseInt(val.replace(/\D/g, ''), 10)
    if (isNaN(num)) return ''
    return new Intl.NumberFormat('en-US').format(num)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '')
    const num = parseInt(raw, 10)
    if (raw === '') setAmount('0')
    else if (num <= MAX_VALUE) setAmount(num.toString())
  }

  const displayValue = formatWithCommas(amount)
  const displayPayout = Number(amount) > 0 && selectedChoice && selectedChoice.multiplier > 1

  return (
    <aside className={style.panel}>
      <div className={style.bet}>
        <div className='row center gap12'>
          <img className={style.icon} src={prediction.icon || `${config.imgBaseUrl}/icon/no_icon.png`} alt='' />
          <h3 className='clamp-2'>{selectedChoice?.title || 'Select an option'}</h3>
        </div>

        <div className={style.tabs}>
          <button className={`${style.tab}${currency === 'CASH' ? ' active' : ''}`} onClick={() => setCurrency('CASH')}>
            Кэш
          </button>
          <button
            className={`${style.tab}${currency === 'POINT' ? ' active' : ''}`}
            onClick={() => setCurrency('POINT')}>
            Баллы
          </button>
        </div>

        <div className='column gap12'>
          <div className='row justify center'>
            <div>Количество</div>
            <div
              className={`${style.inputWrapper}${isTilt ? ` ${style.tilt}` : ''}`}
              onClick={() => inputRef.current?.focus()}>
              <div className={style.inputContainer}>
                <span>{currency === 'POINT' ? '¢' : '$'}</span>
                <div className={style.inputContent}>
                  <input
                    ref={inputRef}
                    name='amount'
                    type='text'
                    value={displayValue}
                    onChange={handleInputChange}
                    // spellCheck={false}
                    inputMode='decimal'
                    autoComplete='off'
                    autoFocus={true}
                    placeholder={`${currency === 'POINT' ? '¢' : '$'}0`}
                  />
                  <span className={style.mirror}>{displayValue || '0'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className={style.quickWrapper}>
            <div className='row gap8'>
              <button
                className='btn gray chip'
                onClick={() => setAmount((prev) => Math.min(Number(prev) + 1, MAX_VALUE).toString())}>
                {currency === 'POINT' ? '+¢1' : '+$1'}
              </button>
              <button
                className='btn gray chip'
                onClick={() => setAmount((prev) => Math.min(Number(prev) + 20, MAX_VALUE).toString())}>
                {currency === 'POINT' ? '+¢20' : '+$20'}
              </button>
              <button
                className='btn gray chip'
                onClick={() => setAmount((prev) => Math.min(Number(prev) + 100, MAX_VALUE).toString())}>
                {currency === 'POINT' ? '+¢100' : '+$100'}
              </button>
              <button className='btn gray chip' onClick={setMaxAmount}>
                Max
              </button>
            </div>
          </div>

          <div className={`${style.payoutWrapper}${displayPayout ? ' show' : ''}${isTilt ? ` ${style.tilt}` : ''}`}>
            <div className='row justify bottom'>
              <div className='column'>
                <div>Возможный</div>
                <div className='row center gap4'>
                  <span>выигрыш</span>
                  <span className={style.info}>
                    <IconSprite name='info' size={18} />
                    <div className={style.tooltip}>
                      Размер выигрыша формируется по итогам предсказания с учётом всех ставок
                    </div>
                  </span>
                </div>
              </div>
              <div className={style.inputWrapper} onClick={() => inputRef.current?.focus()}>
                <div className={`${style.inputContainer} green`}>
                  <span>{currency === 'POINT' ? '¢' : '$'}</span>
                  <div className={style.inputContent}>
                    {formatWithCommas((Number(amount) * (selectedChoice?.multiplier || 1)).toFixed(0))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button className='btn blue w100 big' disabled={loading || isLoading} onClick={handleCreateBet}>
          Сделать ставку
        </button>
      </div>
      <div className={style.terms}>
        Сделав ставку, вы соглашаетесь с <a href='#'>условиями</a>.
      </div>
    </aside>
  )
}
