import style from './bet.module.scss'
import type { IMyBet } from '../../../types/app.types'
import VoteItem from '../vote'
import { Link } from 'react-router-dom'
import PredictionHead from '../../head'
import PredictionStatus from '../../status'
import Progress from '../../../elements/progress'

interface ToggleProps {
  bet: IMyBet
}

export default function BetItem({ bet }: ToggleProps) {
  let badgeStyle = style.badge
  if (bet.state === 'WIN') badgeStyle += ` ${style.green}`
  else if (bet.state === 'LOSE') badgeStyle += ` ${style.red}`
  else if (bet.state === 'CANCEL') badgeStyle += ` ${style.orange}`
  return (
    <Link to={`/prediction/${bet.prediction.id}`} className={style.bet}>
      {bet.state !== 'ACTIVE' && <div className={badgeStyle}>{bet.state}</div>}
      <div className={style.main}>
        <PredictionHead icon={bet.prediction.icon} title={bet.prediction.title} />
        <PredictionStatus
          tags={bet.prediction.tags}
          state={bet.state}
          date={bet.prediction.end_date}
          created={bet.created}
        />
        <Progress total={bet.prediction.volume} volume={bet.choice.volume} />
      </div>
      <VoteItem vote={bet.choice.title} currency={bet.currency} amount={bet.amount} bet={bet} />
    </Link>
  )
}
