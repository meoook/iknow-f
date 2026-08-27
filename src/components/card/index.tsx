import React from 'react'
import style from './card.module.scss'
import { Link } from 'react-router-dom'
import { intlNumber } from '../../hooks/hooks'
import type { IPrediction } from '../../types/app.types'
import { TPredictionState } from '../../types/app.types'
import Badge from '../../elements/badge'
import IconSprite from '../../elements/icon'

interface PredictionCardProps {
  prediction: IPrediction
}

const PredictionCard = ({ prediction }: PredictionCardProps) => {
  if (!prediction) return null
  const volume = intlNumber('ru-RU', prediction.volume)
  const imgUrl = import.meta.env.VITE_IMG_URL
  const src = prediction.icon ? `${imgUrl}${prediction.icon}` : `${imgUrl}/icon/no_icon.png`
  return (
    <Link to={`/prediction/${prediction.id}`} className={style.card}>
      <div className='row center gap-2'>
        <img src={src} alt={prediction.title} />
        <div className='clamp-3 w-600' title={prediction.title}>
          {prediction.title}
        </div>
      </div>
      <div className='column gap-3 w-full'>
        {prediction.choices?.map((choice) => {
          const percent = prediction.volume > 0 ? ((choice.volume || 0) / prediction.volume) * 100 : 0
          const multiplier = `${(choice.multiplier || 1).toFixed(2)}`
          const progressWidth = Math.min(Math.max(percent, 0), 100)

          return (
            <div key={choice.id} className='column gap-1 w-full'>
              <div className='row center justify gap-2'>
                <div className='truncate'>{choice.title}</div>
                <div className='row center gap-1'>
                  <div className='row center color-green w-600'><span>{multiplier}</span><span>x</span></div>
                  <div className={style.percent}>{percent.toFixed()}%</div>
                </div>
              </div>
              <div className={style.progress}>
                <div className={style.bar} style={{ width: `${progressWidth}%` }} />
              </div>
            </div>
          )
        })}
      </div>
      <div className='row center justify'>
        <div className='row center gap-1'>
          {!prediction.hot && <IconSprite name='fire' size={28} color='var(--color-red)' />}
          <div className='column'>
            <span className='label'>Объем</span>
            <span className='w-600'>${volume}</span>
          </div>
        </div>
        <StatusBlock prediction={prediction} />
      </div>
    </Link>
  )
}

const StatusBlock = ({ prediction }: { prediction: IPrediction }) => {
  if (prediction.state === TPredictionState.DISPUTE) {
    return (
      <div className='column end'>
        <Badge color='blue'>Обсуждение</Badge>
      </div>
    )
  }
  if (prediction.created > Date.now() - 24 * 60 * 60 * 1000) {
    return (
      <div className='column end'>
        <Badge color='orange'>Новое</Badge>
      </div>
    )
  }
  if (prediction.state === TPredictionState.ENDED) {
    return (
      <div className='column end'>
        <span className='label'>Завершено</span>
        <span>{new Date(prediction.end_date).toLocaleDateString()}</span>
      </div>
    )
  }
  return (
    <div className='column end'>
      <span className='label'>Ставки до</span>
      <span>{new Date(prediction.bet_date).toLocaleDateString()}</span>
    </div>
  )
}

export default React.memo(PredictionCard)
