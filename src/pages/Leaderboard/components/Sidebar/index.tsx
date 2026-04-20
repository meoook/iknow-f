import s from './sidebar.module.scss'
import Avatar from '../../../../elements/avatar'
import Empty from '../../../../elements/empty'
import { useGetTopWinsQuery } from '../../../../services/api'
import { Link } from 'react-router-dom'

interface SidebarProps {
  tag: string
  period: string
}

export default function SidebarWins({ tag, period }: SidebarProps) {
  const periodTitle = {
    day: 'последний день',
    week: 'последнюю неделю',
    month: 'последний месяц',
    all: 'все время',
  }[period]

  return (
    <aside className={s.sidebar}>
      <h2 className='pv-1'>Крупнейшие выигрыши за {periodTitle}</h2>
      <WinList tag={tag} period={period} />
    </aside>
  )
}

const WinList = ({ tag, period }: SidebarProps) => {
  const { data, isLoading, isError } = useGetTopWinsQuery({ tag, period })

  if (isLoading) return <Empty title='Загрузка...' loading size={16} />
  if (isError) return <Empty title='Ошибка загрузки' size={16} />
  if (!data?.length) return <Empty title='Лидеры не найдены' size={16} />

  return (
    <div className='column gap-1 pv-1 text-sm noscroll hidden'>
      {data.map((win, idx) => (
        <>
          <div key={win.id} className='row center gap-2 pv-3 bd-b'>
            <div className={s.rank}>{idx + 1}</div>
            <Avatar src={win.avatar} size='md' />
            <div className='grow w-0'>
              <div className={s.top}>
                <Link to={`/user/${win.id}`} className='ellipsis w-500 h-brand'>
                  {win.username}
                </Link>
                <Link to={`/prediction/${win.prediction.id}`} className='ellipsis secondary h-brand w-full'>
                  {win.prediction.title}
                </Link>
              </div>
              <div className='row center gap-2 w-500'>
                <span>
                  ${win.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className='secondary'>→</span>
                <span className='color-green'>
                  ${win.payout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </>
      ))}
    </div>
  )
}
