import style from './bet.module.scss'
import React from 'react'
import { Link } from 'react-router-dom'
import { useMybet } from '../../../store/mybet.adapter'
import VoteItem from '../vote'
import PredictionHead from '../../head'
import Progress from '../../../elements/progress'
import PredictionStatus from '../../../elements/status'

interface ToggleProps {
  betId: number
}

const BetItem = ({ betId }: ToggleProps) => {
  const bet = useMybet(betId)
  if (!bet) return null
  let badgeStyle = style.badge
  if (bet.state === 'WIN') badgeStyle += ` ${style.green}`
  else if (bet.state === 'LOSE') badgeStyle += ` ${style.red}`
  else if (bet.state === 'CANCEL') badgeStyle += ` ${style.orange}`
  return (
    <Link to={`/prediction/${bet.prediction.id}`} className={style.bet}>
      {['WIN', 'LOSE', 'CANCEL'].includes(bet.state) && <div className={badgeStyle}>{bet.state}</div>}
      <div className={style.main}>
        <PredictionHead icon={bet.prediction.icon} title={bet.prediction.title} tags={bet.prediction.tags} />
        <PredictionStatus state={bet.state} date={bet.prediction.end_date} created={bet.created} />
        <Progress total={bet.prediction.volume} volume={bet.choice.volume} />
      </div>
      <VoteItem vote={bet.choice.title} currency={bet.currency} amount={bet.amount} bet={bet} />
    </Link>
  )
}

export default React.memo(BetItem)
