import style from './vote.module.scss'
import type { ICurrency } from '../../../types/auth.types'

interface VoteItemProps {
  choice: string
  vote: boolean
  currency: ICurrency
  amount: number
}

export default function VoteItem({ choice, vote, currency, amount }: VoteItemProps) {
  return (
    <div className={style.prediction}>
      <div className={style.vote}>
        <span className={style.label}>Ваш выбор</span>
        <span>{choice || '—'}</span>
      </div>

      <div className={style.vote}>
        <span className={style.label}>Ставка</span>
        <span>
          {Number(amount).toFixed(2)} {currency === 'POINT' ? 'Баллов' : 'Кэш'}
        </span>
      </div>

      <div className={style.vote}>
        <span className={style.label}>Прогноз</span>
        <span className={vote ? style.yes : style.no}>{vote ? 'Сбудется' : 'Не сбудется'}</span>
      </div>
    </div>
  )
}
