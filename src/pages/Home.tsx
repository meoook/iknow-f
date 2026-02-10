import { useEffect, useRef, useState } from 'react'
import PredictionCard from '../components/card'
import Empty from '../elements/empty'
import { usePredictionIds } from '../store/prediction.adapter'
import { useAppDispatch } from '../hooks/useRedux'
import { apiBase } from '../services/api'

export const Home = () => {
  const limit = 10
  const dispatch = useAppDispatch()
  const observerTarget = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState(0)
  const { predictionIds, isLoading, total, isFetching, isError } = usePredictionIds()

  const loadMore = () => {
    if (predictionIds.length >= total || isFetching) return
    const newOffset = offset + limit
    setOffset(newOffset)
    dispatch(apiBase.endpoints.getPredictions.initiate({ limit, offset: newOffset }, { forceRefetch: true }))
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && predictionIds.length < total && !isLoading && !isFetching) loadMore()
      },
      { threshold: 1.0 },
    )
    if (observerTarget.current) observer.observe(observerTarget.current)
    return () => {
      if (observerTarget.current) observer.unobserve(observerTarget.current)
    }
  }, [predictionIds.length, total, isLoading, isFetching, loadMore])

  if (isLoading) return <Empty title='Загрузка...' loading={true} size={24} />
  if (isError) return <Empty title='Ошибка загрузки' size={24} />
  if (predictionIds.length === 0) return <Empty title='Предсказания отсутствуют' size={24} />

  return (
    <section>
      {predictionIds.map((id: number) => (
        <PredictionCard key={id} predictionId={id} />
      ))}
      <div ref={observerTarget} className='more' />
    </section>
  )
}
