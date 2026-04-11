import style from './table.module.scss'
import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useGetUserBetsQuery } from '../../../services/api'
import type { IUserBet } from '../../../types/app.types'
import { formatRelativeTime } from '../../../utils/date'
import Empty from '../../../elements/empty'

interface BetsTableProps {
  userId: number | string
}

export default function BetsTable({ userId }: BetsTableProps) {
  const [offset, setOffset] = useState(0)
  const limit = 20
  const observerTarget = useRef<HTMLDivElement>(null)

  const { data, isLoading, isFetching, isError } = useGetUserBetsQuery({ id: userId, limit, offset })

  const bets = data?.data ?? []
  const total = data?.total ?? 0

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && bets.length < total && !isLoading && !isFetching) {
          setOffset((prev) => prev + limit)
        }
      },
      { threshold: 1.0 },
    )
    if (observerTarget.current) observer.observe(observerTarget.current)
    return () => {
      if (observerTarget.current) observer.unobserve(observerTarget.current)
    }
  }, [bets.length, total, isLoading, isFetching])

  if (isLoading && offset === 0) return <Empty title='Загрузка...' loading size={16} />
  if (isError) return <Empty title='Ошибка загрузки' size={16} />
  if (!bets.length) return <Empty title='Прогнозы не найдены' size={16} />

  return (
    <div className={style.table}>
      <div className={style.head}>
        <div className='grow'>Предсказание</div>
        <div className='right'>Сумма</div>
      </div>

      {bets.map((p) => (
        <BetItem key={p.id} bet={p} />
      ))}

      <div ref={observerTarget} className='more' />
      {isFetching && offset > 0 && <Empty title='Загрузка...' loading size={12} />}
    </div>
  )
}

const BetItem = ({ bet }: { bet: IUserBet }) => {
  const url = `${import.meta.env.VITE_IMG_URL}${bet.prediction.icon ? bet.prediction.icon : '/icon/no_icon.png'}`

  return (
    <div key={bet.id} className='row center pv-3 ph-4 gap-4 bdr'>
      <div className='grow row center gap-2 w-0'>
        <Link to={`/prediction/${bet.prediction.id}`} className={style.icon}>
          <img src={url} alt='' />
        </Link>

        <div className='column w-0'>
          <Link to={`/prediction/${bet.prediction.id}`} className='h-underline clamp-2'>
            {bet.prediction.title}
          </Link>
          <div className='label clamp-1'>{bet.choice}</div>
        </div>
      </div>

      <div className='column right gap-1'>
        <div className='w-600'>${bet.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        <div className='label'>{formatRelativeTime(bet.created)}</div>
      </div>
    </div>
  )
}
