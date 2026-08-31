import style from './page.module.scss'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useAppSelector } from '../../hooks/useRedux'
import { useGetUserByIdQuery, useGetUserProfitHistoryQuery } from '../../services/api'
import { useModalContext } from '../../services/ModalContext'
import { wsManager } from '../../services/websocket'
import { TimeChart, type ChartSeries, type HoverInfo } from '../../components/TimeChart'
import { normalizeTime } from '../../components/TimeChart/utils/timeUtils'
import ModalDeposit from '../../modals/deposit'
import IconSprite from '../../elements/icon'
import Empty from '../../elements/empty'
import Avatar from '../../elements/avatar'
import PredictionsTable from './table/predictions'
import BetsTable from './table/bets'
import RequestsTable from './table/requests'

type TabType = 'predictions' | 'activity' | 'created'
const VALID_TABS: TabType[] = ['predictions', 'activity', 'created']

interface PnlRangeConfig {
  key: string
  label: string
  apiPeriod: string
  title: string
}

const PNL_RANGES: PnlRangeConfig[] = [
  { key: '1d', label: '1Д', apiPeriod: '1d', title: 'За последний день' },
  { key: '1w', label: '1Н', apiPeriod: '1w', title: 'За последнюю неделю' },
  { key: '1m', label: '1М', apiPeriod: '1m', title: 'За последний месяц' },
  { key: 'all', label: 'ВСЕ', apiPeriod: 'all', title: 'За все время' },
]


export default function PageUser() {
  const { id } = useParams<{ id: string }>()
  const { openModal } = useModalContext()
  const [searchParams, setSearchParams] = useSearchParams()

  const [selectedRangeKey, setSelectedRangeKey] = useState<string>('all')
  const [hoveredInfo, setHoveredInfo] = useState<HoverInfo | null>(null)

  const currentRange = useMemo(
    () => PNL_RANGES.find((r) => r.key === selectedRangeKey) ?? PNL_RANGES[3],
    [selectedRangeKey]
  )

  const { data: userO, isLoading, isError } = useGetUserByIdQuery(id as string, { skip: !id })
  const { data: profitHistory } = useGetUserProfitHistoryQuery(
    { id: id as string, period: currentRange.apiPeriod },
    { skip: !id }
  )
  const { user } = useAppSelector((state) => state.auth)

  useEffect(() => {
    if (!userO?.id) return
    wsManager.userJoin(userO.id)

    return () => {
      wsManager.userLeave(userO.id)
    }
  }, [userO?.id])

  const startProfit: number = profitHistory && profitHistory.length > 0 ? profitHistory[0].v : 0
  const endProfit: number = profitHistory && profitHistory.length > 0 ? profitHistory[profitHistory.length - 1].v : 0
  const currentPeriodProfit = endProfit - startProfit

  const isHovered = hoveredInfo !== null && hoveredInfo.points.length > 0
  const displayProfit = isHovered ? hoveredInfo.points[0].value - startProfit : currentPeriodProfit
  const displayPeriodTitle = isHovered ? hoveredInfo.formattedTime : currentRange.title

  const chartSeries: ChartSeries[] = useMemo(() => {
    const color = 'var(--color-brand)'

    if (!profitHistory || profitHistory.length === 0) {
      const now = Date.now()
      const created = userO?.created ? new Date(userO.created).getTime() : now - 3600 * 1000
      return [
        {
          id: 'pnl',
          name: 'Прибыль',
          color,
          data: [
            { time: Math.min(now - 60000, created), value: 0 },
            { time: now, value: 0 },
          ],
          gradient: true,
          strokeWidth: 2,
        },
      ]
    }

    const data = profitHistory.map((pt) => ({ time: normalizeTime(pt.t), value: pt.v }))

    return [
      {
        id: 'pnl',
        name: 'Прибыль',
        color,
        data,
        gradient: true,
        strokeWidth: 2,
      },
    ]
  }, [profitHistory, userO?.created])

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
              <div className='row center gap-1'>
                <h1 className='grow truncate'>{userO.username}</h1>
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

          {!isOwner && <div className='flex-i grow w-0'>Супер предсказатель</div>}

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
              <h1>
                $
                {Intl.NumberFormat('en-US', {
                  notation: 'compact',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
                  .format(userO.amount)
                  .replace('.', ',')}
              </h1>
              {/* <div className='label'>Стоимость позиций</div> */}
              <div className='label'>Позиций</div>
            </div>
            <div className={style.divider} />
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
        <div className={style.card}>
          <div className='row center justify text-sm secondary'>
            <div className='row center gap-1 w-500'>
              <IconSprite name='trend' size={16} />
              <span>Прибыль/убыток</span>
            </div>
            <div className='row ph-1 gap-1'>
              {PNL_RANGES.map((range) => (
                <button
                  key={range.key}
                  className={`btn blue-l${selectedRangeKey === range.key ? ' active' : ''}`}
                  onClick={() => {
                    setSelectedRangeKey(range.key)
                    setHoveredInfo(null)
                  }}>
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          <div className='row center gap-3 pv-1'>
            <h1 className='w-600 text-xl'>
              {displayProfit < 0 ? '-' : ''}${Math.abs(displayProfit).toFixed(2).replace('.', ',')} {displayProfit}
            </h1>

            <button className='btn btn-icon'>
              <IconSprite name='upload' size={20} color='var(--color-secondary)' />
            </button>
          </div>
          <div className='text-xs secondary pv-1'>{displayPeriodTitle}</div>

          <div className={style.chart}>
            <TimeChart
              series={chartSeries}
              height={74}
              smooth={true}
              snapToPoint={true}
              showYAxis={false}
              showXAxis={false}
              showInternalTooltip={false}
              showCrosshair={true}
              dimAfterCursor={true}
              lastPoint={true}
              margins={{ top: 8, bottom: 6, left: 0, right: 0 }}
              onHover={setHoveredInfo}
            />
          </div>
        </div>
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
