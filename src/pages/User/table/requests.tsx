import style from './table.module.scss'
import { useEffect, useRef, useState } from 'react'
import Empty from '../../../elements/empty'
import { useRequestIds } from '../../../services/requests/adapter'
import RequestItem from '../../../components/prediction/request'

export default function RequestsTable() {
  const { requestIds, total, isLoading, isError, isFetching } = useRequestIds()
  const [offset, setOffset] = useState(0)
  const limit = 20
  const observerTarget = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && requestIds.length < total && !isLoading && !isFetching) {
          setOffset((prev) => prev + limit)
        }
      },
      { threshold: 1.0 },
    )
    if (observerTarget.current) observer.observe(observerTarget.current)
    return () => {
      if (observerTarget.current) observer.unobserve(observerTarget.current)
    }
  }, [requestIds.length, total, isLoading, isFetching])

  if (isLoading && offset === 0) return <Empty title='Загрузка...' loading size={16} />
  if (isError) return <Empty title='Ошибка загрузки' size={16} />
  if (requestIds.length === 0) return <Empty title='Прогнозы не найдены' size={16} />

  return (
    <div className={style.table}>
      {requestIds.map((requestId: number, idx: number) => (
        <RequestItem key={requestId} requestId={requestId} isLast={idx === requestIds.length - 1} />
      ))}

      <div ref={observerTarget} className='more' />
      {isFetching && offset > 0 && <Empty title='Загрузка...' loading size={12} />}
    </div>
  )
}
