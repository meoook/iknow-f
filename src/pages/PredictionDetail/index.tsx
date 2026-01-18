import style from './prediction.module.scss'
import { useParams } from 'react-router-dom'
import IconSprite from '../../elements/icon/Icon'
import Loader from '../../elements/loader'
import { useGetPredictionQuery } from '../../services/api'
import type { IChoice, IPrediction } from '../../types/app.types'
import { useEffect, useState } from 'react'
import { intlNumber } from '../../hooks/hooks'
import { config } from '../../config/config'

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
          </div>
          <div>{prediction.rules}</div>
        </div>

        <div>
          <div className={style.thead}>
            <div>Варианты</div>
            <div>Вероятность</div>
          </div>
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
      </div>
      <TradePanel prediction={prediction} selectedChoice={selectedChoice} />
    </div>
  )
}

function TradePanel({ prediction, selectedChoice }: { prediction: IPrediction; selectedChoice: IChoice | null }) {
  const [currency, setCurrency] = useState<'cash' | 'point'>('cash')
  const [amount, setAmount] = useState<string>('0')

  return (
    <aside className={style.panel}>
      <div className='row center gap12'>
        <img className={style.icon} src={prediction.icon || `${config.imgBaseUrl}/icon/no_icon.png`} alt='' />
        <h3 className='clamp-2'>{selectedChoice?.title || 'Select an option'}</h3>
      </div>

      <div className={style.tabs}>
        <button className={`${style.tab} ${currency === 'cash' ? 'active' : ''}`} onClick={() => setCurrency('cash')}>
          Кэш
        </button>
        <button className={`${style.tab} ${currency === 'point' ? 'active' : ''}`} onClick={() => setCurrency('point')}>
          Баллы
        </button>
      </div>

      <div className='column gap12'>
        <div className='row justify center'>
          <label>Количество</label>
          <div className={style.input}>
            <span>{currency === 'point' ? '¢' : '$'}</span>
            <input type='text' value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
        </div>

        <div className='quick-amounts row gap8'>
          <button className='btn gray chip' onClick={() => setAmount((prev) => (Number(prev) + 1).toString())}>
            {currency === 'point' ? '+¢1' : '+$1'}
          </button>
          <button className='btn gray chip' onClick={() => setAmount((prev) => (Number(prev) + 20).toString())}>
            {currency === 'point' ? '+¢20' : '+$20'}
          </button>
          <button className='btn gray chip' onClick={() => setAmount((prev) => (Number(prev) + 100).toString())}>
            {currency === 'point' ? '+¢100' : '+$100'}
          </button>
          <button className='btn gray chip'>Max</button>
        </div>
      </div>

      <button className='btn blue w100 big'>Сделать ставку</button>

      <div className={style.terms}>
        Сделав ставку, вы соглашаетесь с <a href='#'>условиями</a>.
      </div>
    </aside>
  )
}
