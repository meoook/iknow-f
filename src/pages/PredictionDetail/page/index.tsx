import style from './page.module.scss'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useGetPredictionQuery } from '../../../services/api'
import { intlNumber } from '../../../hooks/hooks'
import { wsManager } from '../../../services/websocket'
import type { IChoice } from '../../../types/app.types'
import TradePanel from '../panel'
import PredictionTabs from '../tabs/main'
import PredictionHead from '../../../components/head'
import Empty from '../../../elements/empty'
import PredictionStatus from '../../../elements/status'

export default function PredictionDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: prediction, isLoading, error } = useGetPredictionQuery(Number(id), { skip: !id })

  const [selectedChoice, setSelectedChoice] = useState<IChoice | null>(null)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    if (prediction && prediction.choices && prediction.choices.length > 0 && !selectedChoice) {
      setSelectedChoice(prediction.choices[0])
    }
  }, [prediction, selectedChoice])

  useEffect(() => {
    if (!prediction?.id) return
    wsManager.predictionJoin(prediction.id)

    return () => {
      wsManager.predictionLeave(prediction.id)
    }
  }, [prediction?.id])

  useEffect(() => {
    const handleScroll = () => {
      if (document.body.style.position === 'fixed') return
      const scrollY = window.scrollY
      const maxScroll = 100 // Дистанция, за которую произойдет полное изменение
      const progress = Math.min(scrollY / maxScroll, 1)
      setScrollProgress(progress)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (isLoading) {
    return (
      <div className={style.main}>
        <Empty title='Загрузка...' loading />
      </div>
    )
  }
  if (error && !('status' in error && error.status === 404)) {
    return (
      <div className={style.main}>
        <Empty title='Ошибка загрузки' icon='error' />
      </div>
    )
  }
  if (!prediction) {
    return (
      <div className={style.main}>
        <Empty title='Предсказание не найдено' icon='draft' />
      </div>
    )
  }

  return (
    <div className={style.main}>
      <div className='column grow w-0'>
        <div className={style.sticky}>
          <PredictionHead
            icon={prediction.icon}
            title={prediction.title}
            tags={prediction.tags}
            big
            progress={scrollProgress}
          />
        </div>
        <div className='column gap12'>
          <PredictionStatus
            state={prediction.state}
            date={prediction.end_date}
            closed={prediction.closed}
            created={prediction.created}
          />
          <div className='pv-3'>
            <h2>Правила</h2>
            <div>{prediction.rules}</div>
          </div>
          <div>
            {prediction.choices?.map((choice) => (
              <ChoiceItem
                key={choice.id}
                choice={choice}
                volume={prediction.volume}
                selected={selectedChoice?.id}
                select={setSelectedChoice}
              />
            ))}
          </div>
          <PredictionTabs prediction={prediction} />
        </div>
      </div>
      <TradePanel prediction={prediction} selectedChoice={selectedChoice} />
    </div>
  )
}

interface ChoiceItemProps {
  choice: IChoice
  volume: number
  selected?: number
  select: (choice: IChoice) => void
}

const ChoiceItem = ({ choice, volume, selected, select }: ChoiceItemProps) => {
  const onClick = () => select(choice)
  const className = `${style.item}${selected === choice.id ? ' active' : ''}`
  return (
    <button className={className} onClick={onClick}>
      <div className='grow column'>
        <span className='clamp-1'>{choice.title}</span>
        <span className='label'>Объем ${intlNumber('ru-RU', choice.volume)}</span>
      </div>
      <div className={style.metrics}>
        <span>{((choice.volume / volume) * 100).toFixed(2)}%</span>
        <span className={style.change}>{choice.multiplier.toFixed(2)}X</span>
      </div>
    </button>
  )
}
