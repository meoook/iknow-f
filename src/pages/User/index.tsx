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

  const [activeTab, setActiveTab] = useState<'predictions' | 'activity'>('predictions')
  const [pnlRange, setPnlRange] = useState<'1Д' | '1Н' | '1М' | 'ВСЕ'>('ВСЕ')

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
              {(['1Д', '1Н', '1М', 'ВСЕ'] as const).map((range) => (
                <button
                  key={range}
                  className={`btn blue-l${pnlRange === range ? ' active' : ''}`}
                  onClick={() => setPnlRange(range)}>
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div className='row center gap-3 pv-1'>
            <h1 className='w-600 text-xl'>
              $
              {(
                {
                  '1Д': userO.profit_d,
                  '1Н': userO.profit_w,
                  '1М': userO.profit_m,
                  ВСЕ: userO.profit_all,
                }[pnlRange] ?? 0
              )
                .toFixed(2)
                .replace('.', ',')}
            </h1>
            <button className='btn btn-icon'>
              <IconSprite name='upload' size={20} color='var(--color-secondary)' />
            </button>
          </div>
          <div className='text-xs secondary pv-1'>
            {
              {
                '1Д': 'За последний день',
                '1Н': 'За последнюю неделю',
                '1М': 'За последний месяц',
                ВСЕ: 'За все время',
              }[pnlRange]
            }
          </div>

          <div className={style.chart}>
            <div className={style.line}></div>
          </div>
        </div>
      </div>

      {/* Tabs section */}
      <div className='row gap-4'>
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
      </div>

      <div className={style.table}>
        <div className={style.head}>
          <div className='grow'>Предсказание</div>
          <div className={style.cell}>Ставка</div>
          <div className={style.cell}>Выигрыш</div>
        </div>

        <Empty title='Предсказания не найдены' size={16} />
      </div>
    </div>
  )
}
