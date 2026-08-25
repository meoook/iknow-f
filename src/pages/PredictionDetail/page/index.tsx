import style from './page.module.scss'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useGetPredictionQuery } from '../../../services/api'
import { useModalContext } from '../../../services/ModalContext'
import { intlNumber } from '../../../hooks/hooks'
import { wsManager } from '../../../services/websocket'
import type { IChoice } from '../../../types/app.types'
import TradePanel from '../panel'
import PredictionTabs from '../tabs/main'
import PredictionHead from '../../../components/head'
import Empty from '../../../elements/empty'
import PredictionStatus from '../../../elements/status'
import TradeModal from '../panel/TradeModal'
import { PredictionTimeLine } from '../timeline'

export default function PredictionDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: prediction, isLoading, error } = useGetPredictionQuery(Number(id), { skip: !id })
  const { openModal } = useModalContext()

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

  const select = (choice: IChoice) => {
    setSelectedChoice(choice)
    if (window.innerWidth <= 768) openModal(TradeModal, 'bottom', { prediction, choice })
  }

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
    <div className='main'>
      <div className='column grow w-0'>
        <div className={style.sticky}>
          <PredictionHead
            icon={prediction.icon}
            title={prediction.title}
            groups={prediction.groups}
            progress={scrollProgress}
            big
          />
        </div>
        <div className='column gap-3'>
          <PredictionStatus
            state={prediction.state}
            date={prediction.end_date}
            volume={prediction.volume}
            closed={prediction.closed}
            created={prediction.created}
            bet_end={prediction.bet_date}
            link={prediction.link}
          />
          <PredictionTimeLine prediction={prediction} />
          <div className='pv-3'>
            <div className='label'>Правила</div>
            <div>{prediction.rules}</div>
          </div>
          <div>
            {prediction.choices?.map((choice) => (
              <ChoiceItem
                key={choice.id}
                choice={choice}
                volume={prediction.volume}
                selected={selectedChoice?.id}
                select={select}
                disabled={prediction.state === 'ENDED'}
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
  disabled?: boolean
}

const ChoiceItem = ({ choice, volume, selected, select, disabled }: ChoiceItemProps) => {
  const onClick = () => select(choice)
  const className = `${style.item}${selected === choice.id ? ' active' : ''}`
  return (
    <button className={className} onClick={onClick} disabled={disabled}>
      <div className='grow column'>
        {choice.win ? (
          <div className='row center gap-1'>
            <div className={style.win}>WIN</div>
            <span className='clamp-1'>{choice.title}</span>
          </div>
        ) : (
          <span className='clamp-1'>{choice.title}</span>
        )}
        <span className='label'>Объем ${intlNumber('ru-RU', choice.volume)}</span>
      </div>
      <div className={style.metrics}>
        <span>{((choice.volume / volume) * 100).toFixed(2)}%</span>
        <span className={style.change}>{choice.multiplier.toFixed(2)}X</span>
      </div>
    </button>
  )
}
