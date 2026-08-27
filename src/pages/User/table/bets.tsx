import s from './table.module.scss'
import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { apiBase } from '../../../services/api'
import { formatRelativeTime } from '../../../utils/date'
import { useAppDispatch } from '../../../hooks/useRedux'
import { useUserBets } from '../../../store/user_bet.adapter'
import type { IUserBet } from '../../../types/app.types'
import Empty from '../../../elements/empty'

export default function BetsTable({ userId }: { userId: string }) {
  const limit = 20
  const dispatch = useAppDispatch()
  const observerTarget = useRef<HTMLDivElement>(null)
  const { bets, total, isLoading, isError, isFetching } = useUserBets(userId, limit, 0)

  const loadMore = () => {
    if (bets.length >= total || isFetching) return
    const nextOffset = bets.length
    dispatch(apiBase.endpoints.getUserBets.initiate({ id: userId, limit, offset: nextOffset }))
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && bets.length < total && !isLoading && !isFetching) loadMore()
      },
      { threshold: 1.0 },
    )
    if (observerTarget.current) observer.observe(observerTarget.current)
    return () => {
      if (observerTarget.current) observer.unobserve(observerTarget.current)
    }
  }, [bets.length, total, isLoading, isFetching, loadMore])

  if (isLoading && bets.length === 0) return <Empty title='Загрузка...' loading size={16} />
  if (isError) return <Empty title='Ошибка загрузки' size={16} />
  if (!bets.length) return <Empty title='Прогнозы не найдены' size={16} />

  return (
    <div className={s.table}>
      <div className={s.head}>
        <div className='grow'>Предсказание</div>
        <div className='right'>Сумма</div>
      </div>

      {bets.map((bet) => (
        <UserBetItem key={bet.id} bet={bet} />
      ))}

      <div ref={observerTarget} className='more' />
      {isFetching && bets.length > 0 && <Empty title='Загрузка...' loading size={12} />}
    </div>
  )
}

const UserBetItem = React.memo(({ bet }: { bet: IUserBet }) => {
  const url = `${import.meta.env.VITE_IMG_URL}${bet.prediction.icon ? bet.prediction.icon : '/icon/no_icon.png'}`

  return (
    <div key={bet.id} className='row center pv-3 ph-4 gap-4 bdr'>
      <div className='grow row center gap-2 w-0'>
        <Link to={`/prediction/${bet.prediction.id}`} className={s.icon}>
          <img src={url} alt='' />
        </Link>

        <div className='column w-0'>
          <Link to={`/prediction/${bet.prediction.id}`} className='h-underline clamp-2'>
            {bet.prediction.title}
          </Link>
          <div className='label ellipsis'>{bet.choice}</div>
        </div>
      </div>

      <div className='column gap-1 right'>
        <div className='w-600'>${bet.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        <div className='label'>{formatRelativeTime(bet.created)}</div>
      </div>
    </div>
  )
})
