import style from './tabs.module.scss'
import { useState } from 'react'
import {
  useAddLikeMutation,
  useCreateCommentMutation,
  useGetBetsQuery,
  useGetCommentsQuery,
  useRemoveLikeMutation,
} from '../../../../services/api'
import type { IComment, IPredictionDetail } from '../../../../types/app.types'
import { formatRelativeTime } from '../../../../utils/date'
import IconSprite from '../../../../elements/icon/Icon'
import Avatar from '../../../../elements/avatar'
import Loader from '../../../../elements/loader'
import Empty from '../../../../elements/empty'
import { useAppSelector } from '../../../../hooks/useRedux'
import PredictionTabComments from '../comments'

interface PredictionTabsProps {
  prediction: IPredictionDetail
}

export default function PredictionTabs({ prediction }: PredictionTabsProps) {
  const [activeTab, setActiveTab] = useState<'comments' | 'holders' | 'activity'>('comments')
  const { data, isLoading } = useGetCommentsQuery({ id: prediction.id })
  const [createComment, { isLoading: isPosting }] = useCreateCommentMutation()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const text = formData.get('comment') as string
    if (!text.trim()) return

    createComment({ prediction: prediction.id, text })
      .unwrap()
      .then(() => {
        form.reset()
      })
  }

  return (
    <div className='column gap20'>
      <div className={style.tabs}>
        <button
          className={`${style.tab}${activeTab === 'comments' ? ' active' : ''}`}
          onClick={() => setActiveTab('comments')}>
          Комментарии {data?.data.length ? `(${data.data.length})` : ''}
        </button>
        <button
          className={`${style.tab}${activeTab === 'holders' ? ' active' : ''}`}
          onClick={() => setActiveTab('holders')}>
          Топ Холдеров
        </button>
        <button
          className={`${style.tab}${activeTab === 'activity' ? ' active' : ''}`}
          onClick={() => setActiveTab('activity')}>
          Активность
        </button>
      </div>

      <div className='column gap16'>
        {activeTab === 'comments' && (
          <>
            <form className={style.input} onSubmit={handleSubmit}>
              <input className='outline' name='comment' placeholder='Добавить комментарий' required />
              <button type='submit' disabled={isPosting}>
                {isPosting ? 'Публикация...' : 'Опубликовать'}
              </button>
            </form>

            <div className={style.filters}>
              <div className='row center gap12'>
                <div className={style.sort}>
                  Новые <IconSprite name='arrow_down' size={14} />
                </div>
                <label className={style.holders}>
                  <input type='checkbox' />
                  Холдеры
                </label>
              </div>
              <div className={style.warning}>
                <IconSprite name='draft' size={14} />
                <span>Остерегайтесь внешних ссылок</span>
              </div>
            </div>

            <PredictionTabComments loading={isLoading} comments={data?.data} />
          </>
        )}

        {activeTab === 'holders' && <Empty title='Список топ-холдеров скоро появится' size={48} icon='star' />}

        {activeTab === 'activity' && <PredictionTabBets prediction={prediction} />}
      </div>
    </div>
  )
}

function PredictionTabBets({ prediction }: PredictionTabsProps) {
  const { data, isLoading } = useGetBetsQuery({ id: prediction.id })
  if (isLoading) return <Empty title='Загрузка...' loading={true} />
  return (
    <>
      {data?.data.map((bet) => (
        <div key={bet.id} className='row gap12 center'>
          <Avatar src={bet.avatar} />
          <div className='row grow gap4'>
            <b>{bet.username.length > 20 ? `${bet.username.slice(0, 17)}...` : bet.username}</b>
            <span className='color-gray'>ставка</span>
            <b className='color-green'>
              {bet.currency === 'POINT' ? '¢' : '$'}
              {bet.amount.toFixed(2)}
            </b>
            <span className='color-gray'>на</span>
            <b>{bet.title}</b>
          </div>
          <div className='color-gray'>{formatRelativeTime(bet.created)}</div>
        </div>
      ))}
      <div className='row gap12 center middle'>
        <Loader />
        <span>Загрузка...</span>
      </div>
    </>
  )
}
