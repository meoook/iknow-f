import s from './table.module.scss'
import Avatar from '../../../../elements/avatar'
import type { ILeaderboardUser } from '../../../../types/app.types'
import Empty from '../../../../elements/empty'
import { apiBase } from '../../../../services/api'
import { useLeaderboard } from '../../../../store/leaderboard.adapter'
import React, { useRef } from 'react'
import { useAppDispatch } from '../../../../hooks/useRedux'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'

interface TableProps {
  tag: string
  period: string
}

export default function LeaderboardTable({ tag, period }: TableProps) {
  const limit = 20
  const dispatch = useAppDispatch()
  const observerTarget = useRef<HTMLDivElement>(null)
  const { users, total, isLoading, isError, isFetching } = useLeaderboard(tag, period, limit, 0)

  const loadMore = () => {
    if (users.length >= total || isFetching) return
    const nextOffset = users.length
    dispatch(apiBase.endpoints.getLeaderboard.initiate({ tag, period, limit, offset: nextOffset }))
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && users.length < total && !isLoading && !isFetching) loadMore()
      },
      { threshold: 1.0 },
    )
    if (observerTarget.current) observer.observe(observerTarget.current)
    return () => {
      if (observerTarget.current) observer.unobserve(observerTarget.current)
    }
  }, [users.length, total, isLoading, isFetching, loadMore])

  if (isLoading && users.length === 0) return <Empty title='Загрузка...' loading size={20} />
  if (isError) return <Empty title='Ошибка загрузки' size={20} />
  if (!users.length) return <Empty title='Лидеры не найдены' size={20} />

  return (
    <>
      <div className='column w-full'>
        <div className='row center bd-b secondary gap-4 pv-4'>
          <div className={s.number}>#</div>
          <div className='grow'>Предсказатель</div>
          <div className={`right ${s.cell}`}>Прибыль/убыток</div>
          <div className={`right ${s.cell} md-hide`}>Объем</div>
        </div>
        {users.map((user, idx) => (
          <UserItem key={user.id} user={user} idx={idx} />
        ))}
      </div>

      <div ref={observerTarget} className='more' />
      {isFetching && users.length > 0 && <Empty title='Загрузка...' loading size={12} />}
    </>
  )
}

const UserItem = React.memo(({ user, idx }: { user: ILeaderboardUser; idx: number }) => {
  const className = idx <= 2 ? s[`rank${idx + 1}Avatar`] : ''
  return (
    <div className='row center bd-b secondary gap-4 pv-3'>
      <div className={s.number}>{idx + 1}</div>
      <div className='grow row center gap-3 primary w-0'>
        <Link to={`/user/${user.id}`} className={`${s.ava} ${className}`}>
          <Avatar src={user.avatar} size='md' />
          {idx <= 2 && (
            <div className={`${s.badge} ${s[`rank${idx + 1}`]}`}>
              {idx === 0 && '👑'}
              {idx === 1 && '🥈'}
              {idx === 2 && '🥉'}
            </div>
          )}
        </Link>
        <Link to={`/user/${user.id}`} className='h-brand ellipsis' title={user.username}>
          {user.username}
        </Link>
      </div>
      <div className={`right w-500 ${s.cell} ${user.profit >= 0 ? 'color-green' : 'color-red'}`}>
        {user.profit >= 0 ? '+' : ''}$
        {user.profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
      <div className={`right w-500 ${s.cell} md-hide`}>
        ${user.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
    </div>
  )
})
