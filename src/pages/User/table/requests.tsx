import style from './table.module.scss'
import { useEffect, useRef, useState } from 'react'
import { useRequestIds } from '../../../store/requests.adapter'
import { useAppDispatch } from '../../../hooks/useRedux'
import { apiBase } from '../../../services/api'
import Empty from '../../../elements/empty'
import RequestItem from '../../../components/prediction/request'

export default function RequestsTable() {
  const limit = 10
  const dispatch = useAppDispatch()

  const observerTarget = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState(0)
  const { requestIds, total, isLoading, isError, isFetching } = useRequestIds()

  const loadMore = () => {
    if (requestIds.length >= total || isFetching) return
    const newOffset = offset + limit
    setOffset(newOffset)
    dispatch(apiBase.endpoints.getRequests.initiate({ limit, offset: newOffset }, { forceRefetch: true }))
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && requestIds.length < total && !isLoading && !isFetching) loadMore()
      },
      { threshold: 1.0 },
    )
    if (observerTarget.current) observer.observe(observerTarget.current)
    return () => {
      if (observerTarget.current) observer.unobserve(observerTarget.current)
    }
  }, [requestIds.length, total, isLoading, isFetching, loadMore])

  if (isLoading && offset === 0) return <Empty title='Загрузка...' loading size={16} />
  if (isError) return <Empty title='Ошибка загрузки' size={16} />
  if (!requestIds.length) return <Empty title='Прогнозы не найдены' size={16} />

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
