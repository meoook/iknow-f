import style from './vote.module.scss'
import type { TCurrency } from '../../../types/auth.types'
import type { IMyBet } from '../../../types/app.types'

interface VoteItemProps {
  vote: string
  currency: TCurrency
  amount: number
  bet?: IMyBet
}

export default function VoteItem({ vote, currency, amount, bet }: VoteItemProps) {
  return (
    <div className={style.prediction}>
      <div>
        <h3 className='label'>Ваш выбор</h3>
        <div>{vote || '—'}</div>
      </div>

      <div>
        <h3 className='label'>Ставка</h3>
        <div>
          {Number(amount).toFixed(2)} {currency === 'POINT' ? 'Баллов' : 'Кэш'}
        </div>
      </div>

      {bet?.state === 'WIN' && (
        <div>
          <h3 className='label'>Выигрыш</h3>
          <div>{bet.win.toFixed(2)}</div>
        </div>
      )}
      {bet?.state === 'ACTIVE' && (
        <div>
          <h3 className='label'>Возможный выигрыш</h3>
          <div>{(bet.amount * bet.choice.multiplier).toFixed(2)}</div>
        </div>
      )}
      {bet?.state === 'CANCEL' && (
        <div>
          <h3 className='label'>Возврат</h3>
          <div>{bet.amount.toFixed(2)}</div>
        </div>
      )}
    </div>
  )
}
