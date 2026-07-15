import s from './leaderboard.module.scss'
import { useState } from 'react'
import { GROUPS_MAP } from '../../utils/date'
import LeaderboardTable from './components/table'
import SidebarWins from './components/Sidebar'
import { useClickOutside } from '../../hooks/hooks'
import IconSprite from '../../elements/icon'

type TPeriod = 'day' | 'week' | 'month' | 'all'

const PERIODS: { id: TPeriod; label: string }[] = [
  { id: 'day', label: 'Сегодня' },
  { id: 'week', label: 'Неделя' },
  { id: 'month', label: 'Месяц' },
  { id: 'all', label: 'Все' },
]

export default function PageLeaderboard() {
  const [period, setPeriod] = useState<TPeriod>('month')
  const [tag, setTag] = useState('')
  const [periodRef, isPeriodOpen, togglePeriod] = useClickOutside()
  const tags = Object.entries(GROUPS_MAP).map(([key, value]) => ({ id: key, label: value }))

  const handleSetPeriod = (periodId: TPeriod) => {
    setPeriod(periodId)
    if (isPeriodOpen) togglePeriod()
  }

  return (
    <div className='main'>
      <div className='grow w-full w-0'>
        <h1 className='pv-2'>Таблица лидеров</h1>

        <div className='row justify center pv-4 gap-4'>
          <div className={s.tabs} ref={periodRef}>
            <button className={`${s.btn}${isPeriodOpen ? ' open' : ''}`} onClick={togglePeriod}>
              <span>{PERIODS.find((v) => v.id === period)?.label}</span>
              <IconSprite name='arrow_down' />
            </button>

            <div className={`${s.dropdown}${isPeriodOpen ? ' open' : ''}`}>
              {PERIODS.map((p) => (
                <button
                  key={p.id}
                  className={`${s.item} ${period === p.id ? 'active' : ''}`}
                  onClick={() => handleSetPeriod(p.id)}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className='flex-i bd bdr'>
            <select name='tag' value={tag} onChange={(e) => setTag(e.target.value)}>
              {tags.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label} {t.id === '' ? 'категории' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <LeaderboardTable period={period} tag={tag} />
      </div>

      <SidebarWins period={period} tag={tag} />
    </div>
  )
}
