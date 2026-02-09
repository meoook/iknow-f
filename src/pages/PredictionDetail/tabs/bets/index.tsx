import React, { useEffect, useState, useRef } from 'react'
import style from './comments.module.scss'
import { useAppDispatch } from '../../../../hooks/useRedux'
import { commentsApi } from '../../../../services/comments/api'
import { useBet, useBetIds } from '../../../../store/bet.adapter'
import { formatRelativeTime } from '../../../../utils/date'
import Avatar from '../../../../elements/avatar'
import Empty from '../../../../elements/empty'

export interface PredictionTabBetsProps {
  predictionId: number
}

export default function PredictionTabBets({ predictionId }: PredictionTabBetsProps) {
  const limit = 10
  const dispatch = useAppDispatch()
  const observerTarget = useRef<HTMLDivElement>(null)
  const { betIds, isLoading, total, isFetching } = useBetIds(predictionId)
  const [offset, setOffset] = useState(0)

  const loadMore = () => {
    if (betIds.length >= total || isFetching) return
    const newOffset = offset + limit
    setOffset(newOffset)
    dispatch(
      commentsApi.endpoints.getComments.initiate(
        { id: predictionId, limit, offset: newOffset },
        { forceRefetch: true },
      ),
    )
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
    <div key={betId} className='row gap12 center'>
      <Avatar src={bet.avatar} />
      <div className='row grow gap4'>
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
