import React, { useEffect, useState, useRef } from 'react'
import { useAppDispatch } from '../../../../hooks/useRedux'
import { useBet, useBetIds } from '../../../../store/bet.adapter'
import { formatRelativeTime } from '../../../../utils/date'
import Avatar from '../../../../elements/avatar'
import Empty from '../../../../elements/empty'
import { apiBase } from '../../../../services/api'

export interface PredictionTabBetsProps {
  predictionId: number
}

export default function PredictionTabBets({ predictionId }: PredictionTabBetsProps) {
  const limit = 10
  const dispatch = useAppDispatch()
  const observerTarget = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState(0)
  const { betIds, isLoading, total, isFetching } = useBetIds(predictionId)

  const loadMore = () => {
    if (betIds.length >= total || isFetching) return
    const newOffset = offset + limit
    setOffset(newOffset)
    dispatch(apiBase.endpoints.getBets.initiate({ id: predictionId, limit, offset: newOffset }, { forceRefetch: true }))
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && betIds.length < total && !isLoading && !isFetching) loadMore()
      },
      { threshold: 1.0 },
    )
    if (observerTarget.current) observer.observe(observerTarget.current)
    return () => {
      if (observerTarget.current) observer.unobserve(observerTarget.current)
    }
  }, [betIds.length, total, isLoading, isFetching, loadMore])

  if (isLoading) return <Empty title='Загрузка...' loading={true} />
  if (!betIds.length) return <Empty title='Нет предсказаний' size={24} />

  return (
    <>
      {betIds.map((betId) => (
        <Bet key={betId} predictionId={predictionId} betId={betId} />
      ))}
      <div ref={observerTarget} className='more' />
    </>
  )
}

interface BetProps {
  predictionId: number
  betId: number
}

const BetBase = ({ predictionId, betId }: BetProps) => {
  const bet = useBet(predictionId, betId)
  if (!bet) return null

  return (
    <div className='row gap-1 center text-sm'>
      <Avatar src={bet.avatar} size='sm' />
      <div className='row grow gap4 lh-1 wrap'>
        <span className='w-500'>{bet.username.length > 20 ? `${bet.username.slice(0, 17)}...` : bet.username}</span>
        <span className='color-gray'>ставка</span>
        <span className='w-500 color-green'>
          {bet.currency === 'POINT' ? '¢' : '$'}
          {bet.amount.toFixed(2)}
        </span>
        <span className='color-gray'>на</span>
        <span className='w500 clamp-1'>{bet.title}</span>
      </div>
      <div className='color-gray nowrap'>{formatRelativeTime(bet.created)}</div>
    </div>
  )
}

const Bet = React.memo(BetBase)
