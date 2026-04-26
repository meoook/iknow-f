// import style from './tx.module.scss'
import React, { useEffect, useRef, useState } from 'react'
import { useAppDispatch } from '../../../hooks/useRedux'
import { apiBase } from '../../../services/api'
import { useTx, useTxIds } from '../../../store/tx.adapter'
import Empty from '../../../elements/empty'

export default function ProfileTxs() {
  const limit = 10
  const dispatch = useAppDispatch()
  const observerTarget = useRef<HTMLDivElement>(null)
  const { txIds, isLoading, total, isFetching } = useTxIds()
  const [offset, setOffset] = useState(0)

  const loadMore = () => {
    if (txIds.length >= total || isFetching) return
    const newOffset = offset + limit
    setOffset(newOffset)
    dispatch(apiBase.endpoints.getTx.initiate({ limit, offset: newOffset }, { forceRefetch: true }))
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && txIds.length < total && !isLoading && !isFetching) loadMore()
      },
      { threshold: 1.0 },
    )
    if (observerTarget.current) observer.observe(observerTarget.current)
    return () => {
      if (observerTarget.current) observer.unobserve(observerTarget.current)
    }
  }, [txIds.length, total, isLoading, isFetching, loadMore])

  if (isLoading) return <Empty title='Загрузка...' loading={true} />
  if (!txIds.length) return <Empty title='Нет транзакций' size={24} />

  return (
    <div className='column gap12'>
      <h1>Транзакции</h1>
      <hr />
      <div className='column gap12'>
        {txIds.map((txId) => (
          <Tx key={txId} txId={txId} />
        ))}
      </div>
      <div ref={observerTarget} className='more' />
    </div>
  )
}

const TxBase = ({ txId }: { txId: number }) => {
  const tx = useTx(txId)
  if (!tx) return null

  const positive = tx.direction === 'IN'
  return (
    <div className='row center justify gap4 lh-1'>
      <div className='column gap4 grow'>
        <b>{positive ? 'Пополнение' : 'Вывод'}</b>
        <div className='row gap8 label'>
          <b>{new Date(tx.created).toLocaleDateString()}</b>
          <b>{new Date(tx.created).toLocaleTimeString()}</b>
        </div>
      </div>
      <h2 className='row gap8'>
        <b className={positive ? 'color-green' : 'color-red'}>
          {positive ? '+' : '-'}${tx.amount.toFixed(2)}
        </b>
      </h2>
    </div>
  )
}

const Tx = React.memo(TxBase)
