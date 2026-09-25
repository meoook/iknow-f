import s from './tx.module.scss'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useAppDispatch } from '../../../hooks/useRedux'
import { apiBase } from '../../../services/api'
import { useTx, useTxIds } from '../../../store/tx.adapter'
import { TxStatus } from '../../../types/app.types'
import Empty from '../../../elements/empty'
import IconSprite from '../../../elements/icon'
import BalanceChart from './balanceChart'

type FilterType = 'ALL' | 'IN' | 'OUT'

export default function ProfileTxs() {
  const limit = 10
  const dispatch = useAppDispatch()
  const observerTarget = useRef<HTMLDivElement>(null)
  const { txIds, isLoading, total, isFetching } = useTxIds()
  const [offset, setOffset] = useState(0)
  const [filter, setFilter] = useState<FilterType>('ALL')

  const loadMore = useCallback(() => {
    if (txIds.length >= total || isFetching) return
    const newOffset = offset + limit
    setOffset(newOffset)
    dispatch(apiBase.endpoints.getTx.initiate({ limit, offset: newOffset }, { forceRefetch: true }))
  }, [txIds.length, total, isFetching, offset, dispatch])

  useEffect(() => {
    const targetEl = observerTarget.current
    if (!targetEl) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && txIds.length < total && !isLoading && !isFetching) {
          loadMore()
        }
      },
      { threshold: 1.0 }
    )

    observer.observe(targetEl)
    return () => {
      observer.unobserve(targetEl)
    }
  }, [txIds.length, total, isLoading, isFetching, loadMore])

  return (
    <div className='column gap-3'>
      <h1>Баланс</h1>
      <hr />

      {/* Balance Chart Card */}
      <BalanceChart />

      {/* Transactions Section */}
      <div className='row center justify wrap gap-5 pt-4 pb-2'>
        <h2>История операций</h2>
        <div className='row center gap-2'>
          <button
            type='button'
            className={`${s.chip}${filter === 'ALL' ? ' active' : ''}`}
            onClick={() => setFilter('ALL')}>
            Все
          </button>
          <button
            type='button'
            className={`${s.chip}${filter === 'IN' ? ' active' : ''}`}
            onClick={() => setFilter('IN')}>
            Пополнения
          </button>
          <button
            type='button'
            className={`${s.chip}${filter === 'OUT' ? ' active' : ''}`}
            onClick={() => setFilter('OUT')}>
            Выводы
          </button>
        </div>
      </div>

      {isLoading ? (
        <Empty title='Загрузка операций...' loading={true} />
      ) : !txIds.length ? (
        <Empty title='Нет транзакций' size={24} />
      ) : (
        <div className='column gap-2'>
          {txIds.map((txId) => (
            <Tx key={txId} txId={txId} filter={filter} />
          ))}
        </div>
      )}

      <div ref={observerTarget} className='more' />
    </div>
  )
}

interface TxProps {
  txId: number
  filter: FilterType
}

const TxBase = ({ txId, filter }: TxProps) => {
  const tx = useTx(txId)
  if (!tx) return null

  const positive = tx.direction === 'IN'

  if (filter === 'IN' && !positive) return null
  if (filter === 'OUT' && positive) return null

  const getStatusInfo = (status?: string) => {
    switch (status) {
      case TxStatus.PENDING:
      case TxStatus.APPROVED:
      case TxStatus.PROCESSING:
      case TxStatus.SUBMITTED:
        return { label: 'В обработке', className: 'alert-orange' }
      case TxStatus.REJECTED:
      case TxStatus.FAILED:
        return { label: 'Отклонен', className: 'alert-red' }
      case TxStatus.COMPLETED:
      default:
        return { label: 'Выполнен', className: 'alert-green' }
    }
  }

  const statusInfo = getStatusInfo(tx.status)
  const shortHash = tx.tx_id
    ? tx.tx_id.length > 12
      ? `${tx.tx_id.slice(0, 6)}...${tx.tx_id.slice(-4)}`
      : tx.tx_id
    : ''

  const formattedDate = new Date(tx.created).toLocaleDateString()
  const formattedTime = new Date(tx.created).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <div className={s.txItem}>
      <div className={`${s.txIcon} ${positive ? 'alert-green' : 'alert-orange'}`}>
        <IconSprite name={positive ? 'arrow_down' : 'upload'} size={18} />
      </div>
      <div className='column gap-1 w-0 grow'>
        <div className='row center gap-2 nowrap'>
          <span className='w-600'>{positive ? 'Пополнение' : 'Вывод'}</span>
          <span className={`${s.statusBadge} ${statusInfo.className}`}>{statusInfo.label}</span>
        </div>
        <div className='row center gap-1 text-xs secondary wrap'>
          <span className={s.dt}>{formattedDate} {formattedTime}</span>
          <div className='row center gap-1 nowrap'>
            {tx.token && <span className={s.chain}>{tx.token.chain}</span>}
            {shortHash && (
              <>
                <span>•</span>
                {tx.url ? (
                  <a
                    href={tx.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className={s.link}
                    title='Посмотреть в блокчейн-сканере'>
                    <span>{shortHash}</span>
                    <IconSprite name='open_in_new' size={12} />
                  </a>
                ) : (
                  <span className={s.link}>{shortHash}</span>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {tx.token && <div className='ph-4 w-600 secondary sm-hide'>{tx.token.currency}</div>}

      <div className={`${s.amount}${positive ? ' color-green' : ''}`}>
        {positive ? '+' : '-'}${tx.amount.toFixed(2)}
      </div>
    </div>
  )
}

const Tx = React.memo(TxBase)
