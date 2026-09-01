import style from './page.module.scss'
import { useEffect } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useAppSelector } from '../../hooks/useRedux'
import { useGetUserByIdQuery } from '../../services/api'
import { useModalContext } from '../../services/ModalContext'
import { wsManager } from '../../services/websocket'
import ModalDeposit from '../../modals/deposit'
import IconSprite from '../../elements/icon'
import Empty from '../../elements/empty'
import Avatar from '../../elements/avatar'
import PredictionsTable from './table/predictions'
import BetsTable from './table/bets'
import RequestsTable from './table/requests'
import PnlCard from './pnlCard'

type TabType = 'predictions' | 'activity' | 'created'
const VALID_TABS: TabType[] = ['predictions', 'activity', 'created']


export default function PageUser() {
  const { id } = useParams<{ id: string }>()
  const { openModal } = useModalContext()
  const [searchParams, setSearchParams] = useSearchParams()

  const { data: userO, isLoading, isError } = useGetUserByIdQuery(id as string, { skip: !id })
  const { user } = useAppSelector((state) => state.auth)

  useEffect(() => {
    if (!userO?.id) return
    wsManager.userJoin(userO.id)

    return () => {
      wsManager.userLeave(userO.id)
    }
  }, [userO?.id])

  if (isLoading) return <Empty title='Загрузка...' loading />
  if (isError) return <Empty title='Ошибка...' />
  if (!userO) return <Empty title='Пользователь не найден' />

  const isOwner = user?.id === userO?.id

  const tab = searchParams.get('tab') as TabType | null
  const activeTab: TabType = tab && VALID_TABS.includes(tab) && (tab !== 'created' || isOwner) ? tab : 'predictions'

  const setActiveTab = (newTab: TabType) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set('tab', newTab)
    setSearchParams(newParams, { replace: true })
  }

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
              <div className='grow row center gap-1'>
                <h1 className='grow truncate'>{userO.username}</h1>
                <div className='row gap-1'>
                  {/* <button className='btn btn-icon'>
                    <IconSprite name='more' size={16} />
                  </button> */}
                  {isOwner && (
                    <Link to='/profile' className='btn btn-icon'>
                      <IconSprite name='pencil' size={16} />
                    </Link>
                  )}
                  {/* <button className='btn btn-icon'>
                    <IconSprite name='upload' size={16} />
                  </button> */}
                </div>
              </div>
              <div className='grow text-sm secondary'>Дата присоединения {formatDate(userO.created)}</div>
            </div>
          </div>

          {!isOwner && <div className='grow clamp-3'>{userO.bio}</div>}

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
            {/* <div className='grow column center gap-1'>
              <h1>${Intl.NumberFormat('en-US', { notation: 'compact' }).format(userO.amount)}</h1>
              <div className='label'>Позиций</div>
            </div>
            <div className={style.divider} /> */}
            <div className='grow column center gap-1'>
              <h1>
                {userO.max_win > 0
                  ? `$${userO.max_win.toLocaleString(undefined, {
                    notation: 'compact',
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
                  : '—'}
              </h1>
              {/* <div className='label'>Наибольший выигрыш</div> */}
              <div className='label'>Макс. выигрыш</div>
            </div>
          </div>

          {isOwner && (
            <div className='row gap-4'>
              <button className='btn blue mid w-full' onClick={() => openModal(ModalDeposit)}>
                <IconSprite name='arrow_down' size={18} />
                Депозит
              </button>
              <button className='btn gray mid w-full'>
                <IconSprite name='upload' size={18} />
                Вывод
              </button>
            </div>
          )}
        </div>

        {/* PnL Card */}
        <PnlCard userId={userO.id} />
      </div>

      {/* Tabs section */}
      <div className='row gap-4 noscroll-x'>
        <button
          className={`${style.tab} ${activeTab === 'predictions' ? 'active' : ''}`}
          onClick={() => setActiveTab('predictions')}>
          Предсказания
        </button>
        <button
          className={`${style.tab} ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}>
          Активность
        </button>
        {isOwner && (
          <button
            className={`${style.tab} ${activeTab === 'created' ? 'active' : ''}`}
            onClick={() => setActiveTab('created')}>
            Созданные мной
          </button>
        )}
      </div>
      {id && (
        <>
          {activeTab === 'predictions' && <PredictionsTable userId={id} />}
          {activeTab === 'activity' && <BetsTable userId={id} />}
        </>
      )}
      {isOwner && activeTab === 'created' && <RequestsTable />}
    </div>
  )
}
