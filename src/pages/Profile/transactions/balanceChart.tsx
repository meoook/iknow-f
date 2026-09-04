import s from './tx.module.scss'
import { useMemo, useState } from 'react'
import { useAppSelector } from '../../../hooks/useRedux'
import { useGetUserBalanceHistoryQuery } from '../../../services/api'
import { TimeChart, type ChartSeries, type HoverInfo } from '../../../components/TimeChart'
import IconSprite from '../../../elements/icon'
import Empty from '../../../elements/empty'

interface RangeConfig {
  key: string
  label: string
  apiPeriod: string
  title: string
}

const BALANCE_RANGES: RangeConfig[] = [
  { key: '1d', label: '1Д', apiPeriod: '1d', title: 'За последние 24 часа' },
  { key: '1w', label: '1Н', apiPeriod: '1w', title: 'За последнюю неделю' },
  { key: '1m', label: '1М', apiPeriod: '1m', title: 'За последний месяц' },
  { key: 'all', label: 'Все', apiPeriod: 'all', title: 'За все время' },
]

export default function BalanceChart() {
  const { user } = useAppSelector((state) => state.auth)
  const [selectedRangeKey, setSelectedRangeKey] = useState<string>('all')
  const [hoveredInfo, setHoveredInfo] = useState<HoverInfo | null>(null)

  const currentRange = useMemo(
    () => BALANCE_RANGES.find((r) => r.key === selectedRangeKey) ?? BALANCE_RANGES[3],
    [selectedRangeKey]
  )

  const {
    data: balanceHistory,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetUserBalanceHistoryQuery(
    { id: user?.id ?? 0, period: currentRange.apiPeriod },
    { skip: !user?.id }
  )

  const isBusy = isLoading || isFetching

  const startBalance: number = balanceHistory && balanceHistory.length > 0 ? balanceHistory[0].v : (user?.balance ?? 0)
  const endBalance: number =
    balanceHistory && balanceHistory.length > 0 ? balanceHistory[balanceHistory.length - 1].v : (user?.balance ?? 0)
  const periodDiff = endBalance - startBalance

  const isHovered = hoveredInfo !== null && hoveredInfo.points.length > 0
  const displayBalance = isHovered
    ? hoveredInfo.points[0].value
    : (balanceHistory && balanceHistory.length > 0 ? endBalance : (user?.balance ?? 0))
  const displayPeriodTitle = isHovered ? hoveredInfo.formattedTime : currentRange.title

  const chartSeries: ChartSeries[] = useMemo(() => {
    return [
      {
        id: 'balance',
        name: 'Баланс',
        color: 'var(--color-brand)',
        data: balanceHistory ?? [],
        gradient: true,
        strokeWidth: 2,
      },
    ]
  }, [balanceHistory])

  return (
    <div className={s.chartCard}>
      <div className={s.chartHead}>
        <div className={s.chartTitle}>
          <IconSprite name='trend' size={18} color='var(--color-brand)' />
          <span>Динамика баланса</span>
        </div>
        <div className={s.rangeButtons}>
          {BALANCE_RANGES.map((range) => (
            <button
              key={range.key}
              type='button'
              className={`${s.rangeBtn} ${selectedRangeKey === range.key ? s.active : ''}`}
              onClick={() => {
                setSelectedRangeKey(range.key)
                setHoveredInfo(null)
              }}>
              {range.label}
            </button>
          ))}
        </div>
      </div>

      <div className={s.chartValueRow}>
        <div>
          <div className={s.balanceNumber}>
            ${displayBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className={s.chartMeta}>
            <span className={s.periodTitle}>{displayPeriodTitle}</span>
            {!isHovered && balanceHistory && balanceHistory.length > 1 && (
              <span className={periodDiff >= 0 ? s.diffPositive : s.diffNegative}>
                {periodDiff >= 0 ? '+' : ''}${periodDiff.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className={s.chartWrapper}>
        {isError ? (
          <div className={s.chartError}>
            <span>Не удалось загрузить историю баланса</span>
            <button type='button' className='btn gray' onClick={() => refetch()}>
              Повторить
            </button>
          </div>
        ) : isBusy ? (
          <Empty title='' loading />
        ) : (
          <TimeChart
            series={chartSeries}
            height={130}
            snapToPoint={true}
            showYAxis={false}
            showXAxis={false}
            showInternalTooltip={false}
            showCrosshair={true}
            dimAfterCursor={true}
            lastPoint={false}
            margins={{ top: 8, bottom: 4, left: 0, right: 0 }}
            onHover={setHoveredInfo}
          />
        )}
      </div>
    </div>
  )
}
