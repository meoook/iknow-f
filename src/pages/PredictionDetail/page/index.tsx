import style from './prediction.module.scss'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { intlNumber } from '../../../hooks/hooks'
import { config } from '../../../config/config'
import type { IChoice } from '../../../types/app.types'
import { useGetPredictionQuery } from '../../../services/api'
import IconSprite from '../../../elements/icon/Icon'
import Loader from '../../../elements/loader'
import TradePanel from '../panel'

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

  useEffect(() => {
    if (prediction && prediction.choices && prediction.choices.length > 0 && !selectedChoice) {
      setSelectedChoice(prediction.choices[0])
    }
  }, [prediction, selectedChoice])

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
      <div className='column gap20 grow'>
        <div className={style.header}>
          <div className='row center gap12'>
            <img src={prediction.icon || `${config.imgBaseUrl}/icon/no_icon.png`} alt={prediction.title} />
            <h1>{prediction.title}</h1>
          </div>
          <div className='row center gap12'>
            <div className={style.date}>
              <IconSprite name='finish' size={16} />
              {prediction.closed ? (
                <span>Завершено: {new Date(prediction.closed).toLocaleDateString()}</span>
              ) : (
                <span>Завершение: {new Date(prediction.end_date).toLocaleDateString()}</span>
              )}
            </div>
            <div className='row center gap4'>
              <span className='label'>Группа</span>
              <span>{prediction.group}</span>
            </div>
            <div className='row center gap4'>
              <span className='label'>Статус</span>
              <span>{prediction.state}</span>
            </div>
            <div className='row center gap4'>
              <span className='label'>Создано</span>
              <span>{new Date(prediction.created).toLocaleDateString()}</span>
            </div>
          </div>
          <h2>Правила</h2>
          <div>{prediction.rules}</div>
        </div>

        <div>
          {/* <div className={style.thead}>
            <div>Варианты</div>
            <div>Вероятность</div>
          </div> */}
          {prediction.choices?.map((choice) => (
            <div
              key={choice.id}
              className={`${style.item}${selectedChoice?.id === choice.id ? ` ${style.active}` : ''}`}
              onClick={() => setSelectedChoice(choice)}>
              <div className='grow column'>
                <span className='clamp-1'>{choice.title}</span>
                <span className='label'>Объем ${intlNumber('ru-RU', choice.volume_y + choice.volume_n)}</span>
              </div>
              <div className='row center gap8'>
                <span className={style.value}>{(choice.bet_diff || 0).toFixed(0)}%</span>
                <span className={style.change}>
                  <IconSprite name='arrow_down' />
                  <span>4%</span>
                </span>
              </div>
            </div>
          ))}
        </div>
        <div></div>
      </div>
      <TradePanel prediction={prediction} selectedChoice={selectedChoice} />
    </div>
  )
}
