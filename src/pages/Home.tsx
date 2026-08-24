import { useEffect, useRef, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { predictionSelectors } from '../store/prediction.adapter'
import { useGetPredictionsQuery } from '../services/api'

import PredictionCard from '../components/card'
import Empty from '../elements/empty'

const SORT_MAP: Record<string, string | undefined> = {
  top: undefined,
  volume: 'volume',
  new: 'new',
  finish: 'date',
}

export default function Home() {
  const limit = 20

  const observerTarget = useRef<HTMLDivElement>(null)
  const { pathname } = useLocation()
  const [searchParams] = useSearchParams()

  const group = pathname === '/' ? undefined : pathname.slice(1)
  const order = searchParams.get('order') || 'top'
  const sort = SORT_MAP[order]

  const [offset, setOffset] = useState(0)

  useEffect(() => {
    setOffset(0)
  }, [group, order])

  const { data, isLoading, isFetching, isError } = useGetPredictionsQuery({
    limit,
    offset,
    ...(group && { group }),
    sort,
  })

  const predictions = data ? predictionSelectors.selectAll(data) : []
  const total = data?.total ?? 0

  const loadMore = () => {
    if (predictions.length >= total || isFetching) return
    setOffset((prev) => prev + limit)
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && predictions.length < total && !isLoading && !isFetching) loadMore()
      },
      { threshold: 1.0 },
    )
    if (observerTarget.current) observer.observe(observerTarget.current)
    return () => {
      if (observerTarget.current) observer.unobserve(observerTarget.current)
    }
  }, [predictions.length, total, isLoading, isFetching, loadMore])

  if (isLoading) return <Empty title='Загрузка...' loading={true} size={24} />
  if (isError) return <Empty title='Ошибка загрузки' size={24} />
  if (predictions.length === 0) return <Empty title='Предсказания отсутствуют' size={24} />

  return (
    <section>
      {predictions.map((prediction) => (
        <PredictionCard key={prediction.id} prediction={prediction} />
      ))}
      <div ref={observerTarget} className='more' />
    </section>
  )
}
