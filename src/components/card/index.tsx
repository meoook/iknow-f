import style from './card.module.scss'
import type { IPrediction } from '../../types/app.types'

interface PredictionCardProps {
  prediction: IPrediction
}

export default function PredictionCard({ prediction }: PredictionCardProps) {
  return (
    <div className={style.card}>
      <h3>{prediction.title}</h3>
      <p>{prediction.group}</p>
      <p>{prediction.icon}</p>
      <p>{prediction.volume}</p>
      <p>{prediction.bet_diff}</p>
      <p>{prediction.end_date}</p>
    </div>
  )
}
