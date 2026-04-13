import s from './table.module.scss'
import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { apiBase } from '../../../services/api'
import { useAppDispatch } from '../../../hooks/useRedux'
import { useUserPredictions } from '../../../store/user_prediction.adapter'
import type { IUserPrediction } from '../../../types/app.types'
import Empty from '../../../elements/empty'

export default function PredictionsTable({ userId }: { userId: string }) {
  const limit = 20
  const dispatch = useAppDispatch()
  const observerTarget = useRef<HTMLDivElement>(null)
  const { predictions, total, isLoading, isFetching, isError } = useUserPredictions(userId, limit, 0)

  const loadMore = () => {
    if (predictions.length >= total || isFetching) return
    const nextOffset = predictions.length
    dispatch(apiBase.endpoints.getUserPredictions.initiate({ id: userId, limit, offset: nextOffset }))
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && predictions.length < total && !isLoading && !isFetching) loadMore()
      },
      { threshold: 1.0 },
    )
    if (observerTarget.current) observer.observe(observerTarget.current)
    return () => {
      if (observerTarget.current) observer.unobserve(observerTarget.current)
    }
  }, [predictions.length, total, isLoading, isFetching, loadMore])

  if (isLoading && predictions.length === 0) return <Empty title='Загрузка...' loading size={16} />
  if (isError) return <Empty title='Ошибка загрузки' size={16} />
  if (!predictions.length) return <Empty title='Прогнозы не найдены' size={16} />

  return (
    <div className={s.table}>
      <div className={s.head}>
        <div className='grow'>Предсказание</div>
        <div className={`${s.cell} ph-1`}>Сумма</div>
        <div className={`${s.cell} right`}>Выплата</div>
      </div>

      {predictions.map((p) => (
        <PredictionItem key={p.id} prediction={p} />
      ))}

      <div ref={observerTarget} className='more' />
      {isFetching && predictions.length > 0 && <Empty title='Загрузка...' loading size={12} />}
    </div>
  )
}

const PredictionItem = React.memo(({ prediction }: { prediction: IUserPrediction }) => {
  const diff = prediction.payout - prediction.amount
  const percent = prediction.amount > 0 ? (diff / prediction.amount) * 100 : 0
  const percentStyle = `text-xs w-500 ${prediction.payout >= prediction.amount ? 'color-green' : 'color-red'}`
  const url = `${import.meta.env.VITE_IMG_URL}${prediction.icon ? prediction.icon : '/icon/no_icon.png'}`

  return (
    <div key={prediction.id} className={s.item}>
      <div className='grow row center gap-2'>
        <Link to={`/prediction/${prediction.id}`} className={s.icon}>
          <img src={url} alt='' />
        </Link>

        <div className='column'>
          <Link to={`/prediction/${prediction.id}`} className='h-underline clamp-2'>
            {prediction.title}
          </Link>
          <div className='label'>Объем ${prediction.volume.toLocaleString()}</div>
        </div>
      </div>

      <div className={s.numbers}>
        <div className={s.cell}>
          <div className='label hide md'>Ставка</div>
          <div className='w-600'>${prediction.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </div>

        <div className={`${s.cell} right`}>
          <div className='label hide md'>Выплата</div>
          <div className='label md-hide'>&nbsp;</div>
          <div className='w-600'>${prediction.payout.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          <div className={percentStyle}>{percent.toFixed(2)}%</div>
        </div>
      </div>
    </div>
  )
})
