import s from './panel.module.scss'
import { useState } from 'react'
import { useAppSelector } from '../../../hooks/useRedux'
import { useCreateMyBetMutation } from '../../../services/api'
import { useModalContext } from '../../../services/ModalContext'
import ModalLogin from '../../../modals/login'
import type { IChoice, IPredictionDetail } from '../../../types/app.types'
import type { TCurrency } from '../../../types/auth.types'
import IconSprite from '../../../elements/icon'
import TradeInput from '../../../elements/trade-input/TradeInput'

interface TradeContentProps {
  prediction: IPredictionDetail
  selectedChoice: IChoice | null
  onSuccess?: () => void
}

export default function TradeContent({ prediction, selectedChoice, onSuccess }: TradeContentProps) {
  const MAX_VALUE: number = 9999999
  const { user, loading } = useAppSelector((state) => state.auth)
  const { settings } = useAppSelector((state) => state.app)
  const { openModal } = useModalContext()
  const [createBet, { isLoading }] = useCreateMyBetMutation()

  const [currency, setCurrency] = useState<TCurrency>('CASH')
  const [amount, setAmount] = useState<string>('0')
  const [isTilt, setIsTilt] = useState(false)

  const tilt = () => {
    setIsTilt(true)
    setTimeout(() => setIsTilt(false), 500)
  }

  const handleCreateBet = async () => {
    if (!user) {
      openModal(ModalLogin)
      return
    }
    if (!selectedChoice) return
    const balance = currency === 'CASH' ? user.balances.CASH : user.balances.POINT
    if (Number(amount) > (balance || 0)) {
      tilt()
      return
    }

    try {
      await createBet({ choice_id: selectedChoice.id, currency, amount: Number(amount) }).unwrap()
      setAmount('0')
      onSuccess?.()
    } catch (e) {
      tilt()
    }
  }

  const addAmount = (value: number) => {
    setAmount((prev) => {
      const num = Number(prev) + value
      if (num > MAX_VALUE) {
        tilt()
        return prev
      }
      return num.toString()
    })
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
    else tilt()
  }

  const displayValue = formatWithCommas(amount)
  const displayPayout = currency !== 'POINT' && Number(amount) > 0 && selectedChoice && selectedChoice.multiplier > 1

  const imgUrl = import.meta.env.VITE_IMG_URL
  const src = prediction.icon ? `${imgUrl}${prediction.icon}` : `${imgUrl}/icon/no_icon.png`

  return (
    <div className={s.bet}>
      <div className='row center gap-3'>
        <img className={s.icon} src={src} alt='' />
        <h3 className='clamp-2'>{selectedChoice?.title || 'Выберите вариант'}</h3>
      </div>

      <div className={s.tabs}>
        <button className={`${s.tab}${currency === 'CASH' ? ' active' : ''}`} onClick={() => setCurrency('CASH')}>
          Кэш
        </button>
        <button className={`${s.tab}${currency === 'POINT' ? ' active' : ''}`} onClick={() => setCurrency('POINT')}>
          Баллы
        </button>
      </div>

      <div className='column gap-3'>
        <div className='row justify center'>
          <div>Количество</div>
          <TradeInput currency={currency} value={displayValue} onChange={handleInputChange} tilt={isTilt} />
        </div>

        <div className='row justify center gap-2'>
          <div className='row center gap-1'>
            <span className='label'>Мин.</span>
            <span className='label'>{currency === 'POINT' ? `¢${settings.min_point}` : `$${settings.min_cash}`}</span>
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

        <div className={`${s.payout}${displayPayout ? ' show' : ''}`}>
          <div className='row justify end'>
            <div className='column'>
              <div>Возможный</div>
              <div className='row center gap-1'>
                <span>выигрыш</span>
                <span className={s.info}>
                  <IconSprite name='info' size={18} />
                  <div className={s.tooltip}>
                    Размер выигрыша формируется по итогам предсказания с учётом всех ставок
                  </div>
                </span>
              </div>
            </div>
            <div className='row center gap-1 text-bet color-green'>
              <span>{currency === 'POINT' ? '¢' : '$'}</span>
              <div>{formatWithCommas((Number(amount) * (selectedChoice?.multiplier || 1)).toFixed(0))}</div>
            </div>
          </div>
        </div>
      </div>

      <button className='btn blue big w-full' disabled={loading || isLoading} onClick={handleCreateBet}>
        Сделать ставку
      </button>
    </div>
  )
}
