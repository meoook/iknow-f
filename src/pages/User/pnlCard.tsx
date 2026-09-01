import s from './page.module.scss'
import { useMemo, useState } from 'react'
import { useGetUserProfitHistoryQuery } from '../../services/api'
import { TimeChart, type ChartSeries, type HoverInfo } from '../../components/TimeChart'
import IconSprite from '../../elements/icon'
import Empty from '../../elements/empty'
import logo from '../../assets/ivanga.png'

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

interface PnlCardProps {
  userId: number | string
}

export default function PnlCard({ userId }: PnlCardProps) {
  const [selectedRangeKey, setSelectedRangeKey] = useState<string>('all')
  const [hoveredInfo, setHoveredInfo] = useState<HoverInfo | null>(null)

  const currentRange = useMemo(
    () => PNL_RANGES.find((r) => r.key === selectedRangeKey) ?? PNL_RANGES[3],
    [selectedRangeKey]
  )

  const {
    data: profitHistory,
    isLoading: isProfitLoading,
    isFetching: isProfitFetching,
    isError: isProfitError,
    refetch: refetchProfit,
  } = useGetUserProfitHistoryQuery(
    { id: userId, period: currentRange.apiPeriod },
    { skip: !userId }
  )

  const isProfitBusy = isProfitLoading || isProfitFetching

  const startProfit: number = profitHistory && profitHistory.length > 0 ? profitHistory[0].v : 0
  const endProfit: number = profitHistory && profitHistory.length > 0 ? profitHistory[profitHistory.length - 1].v : 0
  const currentPeriodProfit = endProfit - startProfit

  const isHovered = hoveredInfo !== null && hoveredInfo.points.length > 0
  const displayProfit = isHovered ? hoveredInfo.points[0].value - startProfit : currentPeriodProfit
  const displayPeriodTitle = isHovered ? hoveredInfo.formattedTime : currentRange.title

  const chartSeries: ChartSeries[] = useMemo(() => {
    const color = 'var(--color-brand)'
    return [
      {
        id: 'pnl',
        name: 'Прибыль',
        color,
        data: profitHistory ?? [],
        gradient: true,
        strokeWidth: 2,
      },
    ]
  }, [profitHistory])

  return (
    <div className={s.card}>
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

      <div className='row justify center gap-3 pt-2'>
        <h1 className='w-600 text-xl'>
          {isProfitError || isProfitBusy || !profitHistory
            ? '—'
            : `${displayProfit < 0 ? '-' : ''}$${Math.abs(displayProfit).toFixed(2)}`}
        </h1>

        {/* <button className='btn btn-icon'>
          <IconSprite name='upload' size={20} color='var(--color-secondary)' />
        </button> */}
        <img className={s.logo} src={logo} alt="logo" />
      </div>
      <div className='text-xs secondary pt-2'>
        {isProfitError || isProfitBusy ? 'Данные графика' : displayPeriodTitle}
      </div>

      <div className={s.chart}>
        {isProfitError ? (
          <div className={s.chartError}>
            <span>График временно недоступен</span>
            <button className='btn blue-l text-xs ph-2' onClick={() => refetchProfit()}>
              Обновить
            </button>
          </div>
        ) : isProfitBusy ? (
          <Empty title='' loading />
        ) : (
          <TimeChart
            series={chartSeries}
            height={100}
            snapToPoint={true}
            showYAxis={false}
            showXAxis={false}
            showInternalTooltip={false}
            showCrosshair={true}
            dimAfterCursor={true}
            lastPoint={false}
            margins={{ top: 8, bottom: 0, left: 0, right: 0 }}
            onHover={setHoveredInfo}
          />
        )}
      </div>
    </div>
  )
}
