import style from './page.module.scss'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { intlNumber } from '../../../hooks/hooks'
import type { IChoice } from '../../../types/app.types'
import { useGetPredictionQuery } from '../../../services/api'
import IconSprite from '../../../elements/icon/Icon'
import Loader from '../../../elements/loader'
import TradePanel from '../panel'
import PredictionTabs from '../tabs'
import PredictionHead from '../../../components/head'
import PredictionStatus from '../../../components/status'

export const PredictionDetail = () => {
  const { id } = useParams<{ id: string }>()
  const {
    data: prediction,
    isLoading,
    isError,
  } = useGetPredictionQuery(Number(id), {
    skip: !id,
  })

  const [selectedChoice, setSelectedChoice] = useState<IChoice | null>(null)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    if (prediction && prediction.choices && prediction.choices.length > 0 && !selectedChoice) {
      setSelectedChoice(prediction.choices[0])
    }
  }, [prediction, selectedChoice])

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
        <Loader />
        <span>Загрузка...</span>
      </div>
    )
  }
  if (isError) {
    return (
      <div className={style.main}>
        <IconSprite name='error' />
        <span>Ошибка загрузки</span>
      </div>
    )
  }
  if (!prediction) {
    return (
      <div className={style.main}>
        <IconSprite name='draft' />
        <span>Предсказание не найдено</span>
      </div>
    )
  }

  return (
    <div className={style.main}>
      <div className='column grow'>
        <div className={style.sticky}>
          <PredictionHead icon={prediction.icon} title={prediction.title} big progress={scrollProgress} />
        </div>
        <div className='column gap12'>
          <PredictionStatus
            group={prediction.group}
            state={prediction.state}
            date={prediction.end_date}
            closed={prediction.closed}
            created={prediction.created}
          />
          <div>
            <h2>Правила</h2>
            <div>{prediction.rules}</div>
          </div>
          <div>
            {prediction.choices?.map((choice) => (
              <div
                key={choice.id}
                className={`${style.item}${selectedChoice?.id === choice.id ? ` ${style.active}` : ''}`}
                onClick={() => setSelectedChoice(choice)}>
                <div className='grow column'>
                  <span className='clamp-1'>{choice.title}</span>
                  <span className='label'>Объем ${intlNumber('ru-RU', choice.volume)}</span>
                </div>
                <div className='row center gap8'>
                  <span className={style.value}>{((choice.volume / prediction.volume) * 100).toFixed(0)}%</span>
                  <span className={style.change}>
                    <IconSprite name='arrow_down' />
                    <span>4%</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
          <PredictionTabs prediction={prediction} />
        </div>
      </div>

      <TradePanel prediction={prediction} selectedChoice={selectedChoice} />
    </div>
  )
}
