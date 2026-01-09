import style from './card.module.scss'
import type { IPrediction } from '../../types/app.types'
import { config } from '../../config/config'
import { intlNumber } from '../../hooks/hooks'
import { Link } from 'react-router-dom'

interface PredictionCardProps {
  prediction: IPrediction
}

export default function PredictionCard({ prediction }: PredictionCardProps) {
  const volume = intlNumber('ru-RU', prediction.volume)
  const color = prediction.bet_diff > 80 ? style.red : prediction.bet_diff > 50 ? style.orange : style.green
  return (
    <Link to={`/prediction/${prediction.id}`} className={style.card}>
      <div className='row center gap8'>
        <img src={prediction.icon || `${config.imgBaseUrl}/icon/no_icon1.png`} alt={prediction.title} />
        <h3 className='line-clamp-2' title={prediction.title}>
          {prediction.title}
        </h3>
      </div>
      {/* <div className='grow'>{prediction.group}</div> */}
      <div className='column grow'>
        <span className={style.subtitle}>Разница</span>
        <div className={style.progress}>
          <div className={`${style.bar} ${color}`} style={{ width: prediction.bet_diff + '%' }}>
            &nbsp;
          </div>
          <span>{prediction.bet_diff.toFixed(0) || 0}</span>
        </div>
      </div>
      <div className='row center justify'>
        <div className='column'>
          <span className={style.subtitle}>Объем</span>
          <span>${volume}</span>
        </div>
        <div className='column'>
          <span className={style.subtitle}>Дата завершения</span>
          <span className={style.right}>{new Date(prediction.end_date).toLocaleDateString()}</span>
        </div>
      </div>
    </Link>
  )
}
