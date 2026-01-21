import style from './tabs.module.scss'
import { useState } from 'react'
import { useCreateCommentMutation, useGetBetsQuery, useGetCommentsQuery } from '../../../services/api'
import type { IComment, IPredictionDetail } from '../../../types/app.types'
import { formatRelativeTime } from '../../../utils/date'
import IconSprite from '../../../elements/icon/Icon'
import Avatar from '../../../elements/avatar'
import Loader from '../../../elements/loader'
import Empty from '../../../elements/empty'

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

      <div>
        {activeTab === 'comments' && (
          <div className='column gap16'>
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
                <span>Остерегайтесь внешних ссылок.</span>
              </div>
            </div>

            <div className={style.commentList}>
              <PredictionTabComments loading={isLoading} comments={data?.data} />
            </div>
          </div>
        )}

        {activeTab === 'holders' && (
          <div className='column gap12 center' style={{ padding: '40px 0', color: 'var(--color-secondary)' }}>
            <IconSprite name='star' size={48} />
            <span>Список топ-холдеров скоро появится</span>
          </div>
        )}

        {activeTab === 'activity' && <PredictionTabBets prediction={prediction} />}
      </div>
    </div>
  )
}

function PredictionTabComments({ loading, comments }: { loading: boolean; comments: IComment[] | undefined }) {
  if (loading) return <Empty title='Загрузка...' loading={true} />
  if (!comments?.length) return <Empty title='Нет комментариев' size={24} />
  return (
    <div className='column gap12'>
      {comments.map((comment) => (
        <div key={comment.id} className={style.commentItem}>
          <Avatar src={comment.avatar} size='medium' />
          <div className={style.content}>
            <div className={style.head}>
              <span className={style.name}>
                {comment.username.length > 20 ? `${comment.username.slice(0, 17)}...` : comment.username}
              </span>
              <span className={style.time}>{formatRelativeTime(comment.created)}</span>
            </div>
            <div className={style.text}>{comment.text}</div>
            <div className={style.footer}>
              <div className={style.like}>
                <IconSprite name='favorite' size={16} />
                <span>2</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function PredictionTabBets({ prediction }: PredictionTabsProps) {
  const { data, isLoading } = useGetBetsQuery({ id: prediction.id })
  if (isLoading) return <Empty title='Загрузка...' loading={true} />
  return (
    <div className='column gap12'>
      {data?.data.map((bet) => (
        <div key={bet.id} className='row gap12 center'>
          <Avatar src={bet.avatar} />
          <div className='row grow gap4'>
            <span>{bet.username.length > 20 ? `${bet.username.slice(0, 17)}...` : bet.username}</span>
            <span>ставка</span>
            <span>
              {bet.currency === 'POINT' ? '¢' : '$'}
              {bet.amount.toFixed(2)}
            </span>
            <span>на {bet.title}</span>
          </div>
          <div className=''>{formatRelativeTime(bet.created)}</div>
        </div>
      ))}
      <div className='row gap12 center middle'>
        <Loader />
        <span>Загрузка...</span>
      </div>
    </div>
  )
}
