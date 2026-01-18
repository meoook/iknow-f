import style from './bet.module.scss'
import type { IBet } from '../../../types/app.types'
import VoteItem from '../vote'
import BetTitle from '../title'
import PredictionProgress from '../../progress'
import { Link } from 'react-router-dom'

interface ToggleProps {
  bet: IBet
}

export default function BetItem({ bet }: ToggleProps) {
  let badgeStyle = style.badge
  if (bet.state === 'WIN') badgeStyle += ` ${style.green}`
  else if (bet.state === 'LOSE') badgeStyle += ` ${style.red}`
  else if (bet.state === 'CANCEL') badgeStyle += ` ${style.orange}`

  let diff = 0
  if (bet.choice.volume_y !== 0 && bet.choice.volume_n !== 0) {
    diff = bet.vote ? bet.choice.volume_n / bet.choice.volume_y : bet.choice.volume_y / bet.choice.volume_n
  }
  const possibleWin = bet.amount * diff
  return (
    <Link to={`/prediction/${bet.choice.prediction_id}`} className={style.bet}>
      {bet.state !== 'ACTIVE' && <div className={badgeStyle}>{bet.state}</div>}
      <div className={style.main}>
        <BetTitle
          icon={bet.choice.prediction_icon}
          title={bet.choice.prediction_title}
          date={bet.choice.prediction_end_date}
        />
        <PredictionProgress yes={bet.choice.volume_y} no={bet.choice.volume_n} diff={bet.choice.bet_diff} />
        <div className='row center justify gap16 grow'>
          <div>
            {bet.state === 'WIN' && (
              <div className='column'>
                <span className='label'>Выигрыш</span>
                <span>{bet.win.toFixed(2)}</span>
              </div>
            )}
            {bet.state === 'ACTIVE' && (
              <div className='column'>
                <span className='label'>Возможный выигрыш</span>
                <span>{(bet.amount + possibleWin).toFixed(2)}</span>
              </div>
            )}
            {bet.state === 'CANCEL' && (
              <div className='column'>
                <span className='label'>Возврат</span>
                <span>{bet.amount.toFixed(2)}</span>
              </div>
            )}
          </div>
          <div className='row center gap16'>
            <div className='column'>
              <span className='label'>Группа</span>
              <span>{bet.choice.prediction_group}</span>
            </div>
            <div className='column'>
              <span className='label'>Создано</span>
              <span>{new Date(bet.created).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
      <VoteItem choice={bet.choice.title} vote={bet.vote} currency={bet.currency} amount={bet.amount} />
    </Link>
  )
}
