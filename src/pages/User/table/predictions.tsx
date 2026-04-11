import style from './table.module.scss'
import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useGetUserPredictionsQuery } from '../../../services/api'
import type { IUserPrediction } from '../../../types/app.types'
import Empty from '../../../elements/empty'

interface PredictionsTableProps {
  userId: number | string
}

export default function PredictionsTable({ userId }: PredictionsTableProps) {
  const [offset, setOffset] = useState(0)
  const limit = 20
  const observerTarget = useRef<HTMLDivElement>(null)

  const { data, isLoading, isFetching, isError } = useGetUserPredictionsQuery({ id: userId, limit, offset })

  const predictions = data?.data ?? []
  const total = data?.total ?? 0

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && predictions.length < total && !isLoading && !isFetching) {
          setOffset((prev) => prev + limit)
        }
      },
      { threshold: 1.0 },
    )
    if (observerTarget.current) observer.observe(observerTarget.current)
    return () => {
      if (observerTarget.current) observer.unobserve(observerTarget.current)
    }
  }, [predictions.length, total, isLoading, isFetching])

  if (isLoading && offset === 0) return <Empty title='Загрузка...' loading size={16} />
  if (isError) return <Empty title='Ошибка загрузки' size={16} />
  if (predictions.length === 0) return <Empty title='Прогнозы не найдены' size={16} />

  return (
    <div className={style.table}>
      <div className={style.head}>
        <div className='grow'>Предсказание</div>
        <div className={`${style.cell} ph-1`}>Сумма</div>
        <div className={`${style.cell} right`}>Выплата</div>
      </div>

      {predictions.map((p) => (
        <PredictionItem key={p.id} prediction={p} />
      ))}

      <div ref={observerTarget} className='more' />
      {isFetching && offset > 0 && <Empty title='Загрузка...' loading size={12} />}
    </div>
  )
}

const PredictionItem = ({ prediction }: { prediction: IUserPrediction }) => {
  const diff = prediction.payout - prediction.amount
  const percent = prediction.amount > 0 ? (diff / prediction.amount) * 100 : 0
  const percentStyle = `text-xs w-500 ${prediction.payout >= prediction.amount ? 'color-green' : 'color-red'}`
  const url = `${import.meta.env.VITE_IMG_URL}${prediction.icon ? prediction.icon : '/icon/no_icon.png'}`

  return (
    <div key={prediction.id} className={style.item}>
      <div className='grow row center gap-2'>
        <Link to={`/prediction/${prediction.id}`} className={style.icon}>
          <img src={url} alt='' />
        </Link>

        <div className='column'>
          <Link to={`/prediction/${prediction.id}`} className='h-underline clamp-2'>
            {prediction.title}
          </Link>
          <div className='label'>Объем ${prediction.volume.toLocaleString()}</div>
        </div>
      </div>

      <div className={style.numbers}>
        <div className={style.cell}>
          <div className='label hide md'>Ставка</div>
          <div className='w-600'>${prediction.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </div>

        <div className={`${style.cell} right`}>
          <div className='label hide md'>Выплата</div>
          <div className='label md-hide'>&nbsp;</div>
          <div className='w-600'>${prediction.payout.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          <div className={percentStyle}>{percent.toFixed(2)}%</div>
        </div>
      </div>
    </div>
  )
}
