import s from './panel.module.scss'
import { useState } from 'react'
import { useAppSelector } from '../../../hooks/useRedux'
import { useCreateBetMutation } from '../../../services/api'
import { useModalContext } from '../../../services/ModalContext'
import { formatWithCommas } from '../../../utils/date'
import type { IChoice, IPredictionDetail } from '../../../types/app.types'
import ModalLogin from '../../../modals/login'
import IconSprite from '../../../elements/icon'
import TradeInput from '../../../elements/trade-input/TradeInput'

interface TradeContentProps {
  prediction: IPredictionDetail
  selectedChoice: IChoice | null
  onSuccess?: () => void
}

export default function TradeContent({ prediction, selectedChoice, onSuccess }: TradeContentProps) {
  const { user, loading } = useAppSelector((state) => state.auth)
  const { settings } = useAppSelector((state) => state.app)
  const { openModal } = useModalContext()
  const [createBet, { isLoading }] = useCreateBetMutation()

  const [amount, setAmount] = useState<number>(0)
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
    if (amount > (user.balance || 0)) {
      tilt()
      return
    }

    try {
      await createBet({ prediction_id: prediction.id, choice_id: selectedChoice.id, amount }).unwrap()
      setAmount(0)
      onSuccess?.()
    } catch (e) {
      tilt()
    }
  }

  const displayPayout = amount > 0 && selectedChoice && selectedChoice.multiplier > 1

  const imgUrl = import.meta.env.VITE_IMG_URL
  const src = prediction.icon ? `${imgUrl}${prediction.icon}` : `${imgUrl}/icon/no_icon.png`

  return (
    <div className={s.bet}>
      <div className='row center gap-3 pv-2 bd-b'>
        <img className={s.icon} src={src} alt='' />
        <h3 className='clamp-2'>{selectedChoice?.title || 'Выберите вариант'}</h3>
      </div>

      <div className='column gap-3'>
        <TradeInput
          value={amount}
          setValue={setAmount}
          minimum={settings.min_bet}
          maximum={user?.balance ? Math.floor(user.balance) : 0}
          isTilt={isTilt}
          tilt={tilt}
        />

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
              <span>$</span>
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
