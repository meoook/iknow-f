import React from 'react'
import style from './card.module.scss'
import { Link } from 'react-router-dom'
import { useAppSelector } from '../../hooks/useRedux'
import { intlNumber } from '../../hooks/hooks'
import type { IPrediction } from '../../types/app.types'
import Badge from '../../elements/badge'

interface PredictionCardProps {
  prediction: IPrediction
}

const PredictionCard = ({ prediction }: PredictionCardProps) => {
  const { settings } = useAppSelector((state) => state.app)
  if (!prediction) return null
  const volume = intlNumber('ru-RU', prediction.volume)
  const color = prediction.multiplier > 80 ? style.red : prediction.multiplier > 50 ? style.orange : style.green
  const imgUrl = import.meta.env.VITE_IMG_URL
  const src = prediction.icon ? `${imgUrl}${prediction.icon}` : `${imgUrl}/icon/no_icon.png`
  const percent = Math.round((prediction.multiplier / settings.multiplier) * 100)
  return (
    <Link to={`/prediction/${prediction.id}`} className={style.card}>
      <div className='row center gap8'>
        <img src={src} alt={prediction.title} />
        <h3 className='clamp-2' title={prediction.title}>
          {prediction.title}
        </h3>
      </div>
      <div className='column'>
        <span className='label'>Разница</span>
        <div className={style.progress}>
          <div className={`${style.bar} ${color}`} style={{ width: percent + '%' }}>
            &nbsp;
          </div>
          <span>{prediction.multiplier.toFixed(0) || 0}X</span>
        </div>
      </div>
      <div className='row center justify'>
        <div className='column'>
          <span className='label'>Объем</span>
          <span>${volume}</span>
        </div>
        {prediction.state === 'DISPUTE' ? (
          <div className='column end'>
            <span className='label'>Статус</span>
            <Badge color='blue'>Обсуждение</Badge>
          </div>
        ) : (
          <div className='column end'>
            <span className='label'>{prediction.state === 'ENDED' ? 'Завершено' : 'Дата завершения'}</span>
            <span className={style.right}>{new Date(prediction.end_date).toLocaleDateString()}</span>
          </div>
        )}
      </div>
    </Link>
  )
}
export default React.memo(PredictionCard)
