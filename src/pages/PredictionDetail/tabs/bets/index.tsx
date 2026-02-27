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
    <div className='row gap8 center'>
      <Avatar src={bet.avatar} />
      <div className='row grow gap4 lh-1'>
        <b>{bet.username.length > 20 ? `${bet.username.slice(0, 17)}...` : bet.username}</b>
        <span className='color-gray'>ставка</span>
        <b className='color-green'>
          {bet.currency === 'POINT' ? '¢' : '$'}
          {bet.amount.toFixed(2)}
        </b>
        <span className='color-gray'>на</span>
        <b>{bet.title}</b>
      </div>
      <div className='color-gray nowrap'>{formatRelativeTime(bet.created)}</div>
    </div>
  )
}

const Bet = React.memo(BetBase)
