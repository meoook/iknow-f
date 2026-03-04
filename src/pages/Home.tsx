import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { usePredictionIds } from '../store/prediction.adapter'

import PredictionCard from '../components/card'
import Empty from '../elements/empty'

export default function Home() {
  const limit = 20

  const observerTarget = useRef<HTMLDivElement>(null)
  const { pathname } = useLocation()

  const group = pathname === '/' ? undefined : pathname.slice(1)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    setOffset(0)
  }, [group])

  const { predictionIds, isLoading, total, isFetching, isError } = usePredictionIds({
    limit,
    offset,
    ...(group && { group }),
  })

  const loadMore = () => {
    if (predictionIds.length >= total || isFetching) return
    setOffset((prev) => prev + limit)
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
