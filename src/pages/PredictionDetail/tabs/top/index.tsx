import React, { useEffect, useState, useRef } from 'react'
import { useAppDispatch } from '../../../../hooks/useRedux'
import { useTop, useTopIds } from '../../../../store/top.adapter'
import { apiBase } from '../../../../services/api'
import Avatar from '../../../../elements/avatar'
import Empty from '../../../../elements/empty'

export interface PredictionTabTopProps {
  predictionId: number
}

export default function PredictionTabTop({ predictionId }: PredictionTabTopProps) {
  const limit = 10
  const dispatch = useAppDispatch()
  const observerTarget = useRef<HTMLDivElement>(null)
  const { topIds, isLoading, total, isFetching } = useTopIds(predictionId)
  const [offset, setOffset] = useState(0)

  const loadMore = () => {
    if (topIds.length >= total || isFetching) return
    const newOffset = offset + limit
    setOffset(newOffset)
    dispatch(apiBase.endpoints.getTop.initiate({ id: predictionId, limit, offset: newOffset }, { forceRefetch: true }))
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && topIds.length < total && !isLoading && !isFetching) loadMore()
      },
      { threshold: 1.0 },
    )
    if (observerTarget.current) observer.observe(observerTarget.current)
    return () => {
      if (observerTarget.current) observer.unobserve(observerTarget.current)
    }
  }, [topIds.length, total, isLoading, isFetching, loadMore])

  if (isLoading) return <Empty title='Загрузка...' loading={true} />
  if (!topIds.length) return <Empty title='Нет предсказаний' size={24} />

  return (
    <>
      {topIds.map((topId) => (
        <TopUser key={topId} predictionId={predictionId} topId={topId} />
      ))}
      <div ref={observerTarget} className='more' />
    </>
  )
}

interface BetProps {
  predictionId: number
  topId: string
}

const TopUserBase = ({ predictionId, topId }: BetProps) => {
  const topUser = useTop(predictionId, topId)
  if (!topUser) return null

  return (
    <div className='row justify center'>
      <div className='row center gap8 lh-1'>
        <Avatar src={topUser.avatar} size='sm' />
        <b>{topUser.username.length > 20 ? `${topUser.username.slice(0, 17)}...` : topUser.username}</b>
      </div>
      <div className='row gap4'>
        <b className='color-green'>
          {topUser.currency === 'POINT' ? '¢' : '$'}
          {topUser.total.toFixed(2)}
        </b>
      </div>
    </div>
  )
}

const TopUser = React.memo(TopUserBase)
