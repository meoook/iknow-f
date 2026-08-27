import s from './page.module.scss'
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
import TradeModal from '../panel/TradeModal'
import { PredictionTimeLine } from '../timeline'
import PredictionChart from '../chart'

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
      <div className={s.main}>
        <Empty title='Загрузка...' loading />
      </div>
    )
  }
  if (error && !('status' in error && error.status === 404)) {
    return (
      <div className={s.main}>
        <Empty title='Ошибка загрузки' icon='error' />
      </div>
    )
  }
  if (!prediction) {
    return (
      <div className={s.main}>
        <Empty title='Предсказание не найдено' icon='draft' />
      </div>
    )
  }

  return (
    <div className='main'>
      <div className='column grow w-0'>
        <div className={s.sticky}>
          <PredictionHead
            icon={prediction.icon}
            title={prediction.title}
            groups={prediction.groups}
            progress={scrollProgress}
            big
          />
        </div>
        <div className='column gap-3'>
          <PredictionChart prediction={prediction} />
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

          <PredictionTimeLine prediction={prediction} />

          <div className='column gap-1 pv-2'>
            <div>Правила и условия</div>
            <div className='secondary text-sm'>{prediction.rules}</div>
            {prediction.link && (
              <div className={s.link}>
                <div className='label pt-1'>Источник валидации</div>
                <a className='h-underline brand text-sm truncate w-500' href={prediction.link} target='_blank' rel='noopener noreferrer'>
                  {prediction.link}
                </a>
              </div>
            )}
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
  const className = `${s.item}${selected === choice.id ? ' active' : ''}`
  return (
    <button className={className} onClick={onClick} disabled={disabled}>
      <div className='grow column'>
        {choice.win ? (
          <div className='row center gap-1'>
            <div className={s.win}>WIN</div>
            <span className='truncate'>{choice.title}</span>
          </div>
        ) : (
          <span className='truncate'>{choice.title}</span>
        )}
        <span className='label'>Объем ${intlNumber('ru-RU', choice.volume)}</span>
      </div>
      <div className={s.metrics}>
        <span>{((choice.volume / volume) * 100).toFixed(2)}%</span>
        <span className={s.change}>{choice.multiplier.toFixed(2)}X</span>
      </div>
    </button>
  )
}
