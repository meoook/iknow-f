import style from './page.module.scss'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import IconSprite from '../../elements/icon'
import { useModalContext } from '../../services/ModalContext'
import ModalDeposit from '../../modals/deposit'
import { useGetUserByIdQuery } from '../../services/api'
import Avatar from '../../elements/avatar'
import { useAppSelector } from '../../hooks/useRedux'
import Empty from '../../elements/empty'

export default function PageUser() {
  const { id } = useParams<{ id: string }>()
  const { openModal } = useModalContext()

  const [activeTab, setActiveTab] = useState<'positions' | 'orders' | 'history'>('positions')
  const [pnlRange, setPnlRange] = useState<'1D' | '1W' | '1M' | 'ALL'>('1W')

  const { data: userO, isLoading, isError } = useGetUserByIdQuery(id ?? '')
  const { user } = useAppSelector((state) => state.auth)

  if (isLoading) return <Empty title='Загрузка...' loading />
  if (isError) return <Empty title='Ошибка...' />
  if (!userO) return <Empty title='Пользователь не найден' />

  const isOwner = user?.id === userO?.id

  const formatDate = (timestamp: number) => {
    if (!timestamp) return '...'
    const date = new Date(timestamp)
    const formatter = new Intl.DateTimeFormat('ru-RU', { month: 'short', year: 'numeric' })
    return formatter.format(date).replace(' г.', '')
  }

  return (
    <div className='container'>
      <div className={style.grid}>
        {/* User Card */}
        <div className={style.user}>
          <div className='row gap-4'>
            <Avatar src={userO.avatar} size='lg' />
            <div className='column grow gap-1 w-0'>
              <div className='row center gap-1'>
                <h1 className='grow ellipsis'>{userO.username}</h1>
                <div className='row gap-1'>
                  <button className='btn btn-icon'>
                    <IconSprite name='more' size={16} />
                  </button>
                  {isOwner && (
                    <Link to='/profile' className='btn btn-icon'>
                      <IconSprite name='pencil' size={16} />
                    </Link>
                  )}
                  <button className='btn btn-icon'>
                    <IconSprite name='upload' size={16} />
                  </button>
                </div>
              </div>
              <div className='text-sm secondary'>Дата присоединения {formatDate(userO.created)}</div>
            </div>
          </div>

          {!isOwner && (
            <div className='flex-i grow w-0'>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas, doloremque. Lorem ipsum dolor sit amet
              consectetur adipisicing elit. Quas, doloremque.
            </div>
          )}

          <div className='row center'>
            <div className='grow column center gap-1'>
              <h1>{userO.predictions.toLocaleString()}</h1>
              <div className='label'>Прогнозы</div>
            </div>
            <div className={style.divider} />
            <div className='grow column center gap-1'>
              <h1>
                {Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(userO.count)}
              </h1>
              <div className='label'>Ставок</div>
            </div>
            <div className={style.divider} />
            <div className='grow column center gap-1'>
              {/* <h1>
                {userO.amount === 0
                  ? '$0.00'
                  : `$${Intl.NumberFormat('en-US', { notation: 'compact', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(userO.amount)}`}
              </h1> */}
              <h1>
                $
                {Intl.NumberFormat('en-US', {
                  notation: 'compact',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(userO.amount)}
              </h1>
              {/* <div className='label'>Стоимость позиций</div> */}
              <div className='label'>Позиций</div>
            </div>
            <div className={style.divider} />
            <div className='grow column center gap-1'>
              <h1>{userO.max_win > 0 ? `$${userO.max_win.toLocaleString()}` : '—'}</h1>
              <div className='label'>Наибольший выигрыш</div>
            </div>
          </div>

          {isOwner && (
            <div className={style.ownerActions}>
              <button className={style.btnDeposit} onClick={() => openModal(ModalDeposit)}>
                <IconSprite name='arrow_down' size={18} />
                Депозит
              </button>
              <button className={style.btnWithdraw}>
                <IconSprite name='upload' size={18} />
                Вывод
              </button>
            </div>
          )}
        </div>

        {/* PnL Card */}
        <div className={style.card}>
          <div className={style.cardHeader}>
            <div className={style.title}>
              <IconSprite name='trend' size={16} color='var(--color-secondary)' /> Прибыль/убыток
            </div>
            <div className={style.ranges}>
              {(['1D', '1W', '1M', 'ALL'] as const).map((range) => (
                <button
                  key={range}
                  className={`btn blue-l${pnlRange === range ? ' active' : ''}`}
                  onClick={() => setPnlRange(range)}>
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div className={style.balanceRow}>
            <h1 className={style.balance}>${(123.45).toFixed(2).replace('.', ',')}</h1>
            <button className={style.iconBtn}>
              <IconSprite name='upload' size={20} color='var(--color-secondary)' />
            </button>
          </div>
          <div className={style.subText}>За последнюю неделю</div>

          <div className={style.chartPlaceholder}>
            <div className={style.chartLine}></div>
          </div>
        </div>
      </div>

      {/* Tabs section */}
      <div className={style.contentSection}>
        <div className={style.tabs}>
          <button
            className={`${style.tab} ${activeTab === 'positions' ? style.activeTab : ''}`}
            onClick={() => setActiveTab('positions')}>
            Позиции
          </button>
          <button
            className={`${style.tab} ${activeTab === 'orders' ? style.activeTab : ''}`}
            onClick={() => setActiveTab('orders')}>
            Открытые заявки
          </button>
          <button
            className={`${style.tab} ${activeTab === 'history' ? style.activeTab : ''}`}
            onClick={() => setActiveTab('history')}>
            История
          </button>
        </div>

        <div className={style.tableControls}>
          <div className={style.searchWrapper}>
            <IconSprite name='search' size={18} color='var(--color-secondary)' />
            <input type='text' placeholder='Поиск' />
          </div>
          <button className={style.sortBtn}>
            <IconSprite name='filter' size={18} />
            Текущая стоимость
          </button>
        </div>

        <div className={style.tableHeader}>
          <div className={style.col}>
            РЫНОК <IconSprite name='diff' size={12} />
          </div>
          <div className={style.col}>
            СРЕДН. → СЕЙЧАС <IconSprite name='info' size={12} /> <IconSprite name='diff' size={12} />
          </div>
          <div className={style.col}>
            СТАВКА <IconSprite name='diff' size={12} />
          </div>
          <div className={style.col}>
            ВЫИГРЫШ <IconSprite name='diff' size={12} />
          </div>
          <div className={style.col}>
            СТОИМОСТЬ <IconSprite name='diff' size={12} />
          </div>
        </div>

        <div className={style.emptyState}>Позиции не обнаружены</div>
      </div>
    </div>
  )
}
