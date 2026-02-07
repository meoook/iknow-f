import style from './tabs.module.scss'
import type { IPredictionDetail } from '../../../../types/app.types'
import { useState } from 'react'
import { useGetBetsQuery } from '../../../../services/api'
import { useAppDispatch, useAppSelector } from '../../../../hooks/useRedux'
import { useCreateCommentMutation } from '../../../../services/comments/api'
import { useCommentIds } from '../../../../services/comments/adapter'
import { setShowLoginModal } from '../../../../store/auth.slice'
import { formatRelativeTime } from '../../../../utils/date'
import IconSprite from '../../../../elements/icon/Icon'
import Avatar from '../../../../elements/avatar'
import Loader from '../../../../elements/loader'
import Empty from '../../../../elements/empty'
import PredictionTabComments from '../comments'

interface PredictionTabsProps {
  prediction: IPredictionDetail
}

export default function PredictionTabs({ prediction }: PredictionTabsProps) {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const [createComment, { isLoading: isPosting }] = useCreateCommentMutation()
  const [activeTab, setActiveTab] = useState<'comments' | 'holders' | 'activity'>('comments')
  const { commentIds, isLoading } = useCommentIds(prediction.id)
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user) return dispatch(setShowLoginModal(true))
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
          Комментарии {commentIds.length ? `(${commentIds.length})` : ''}
        </button>
        <button
          className={`${style.tab}${activeTab === 'holders' ? ' active' : ''}`}
          onClick={() => setActiveTab('holders')}>
          Топ предсказателей
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
                  Предсказатели
                </label>
              </div>
              <div className={style.warning}>
                <IconSprite name='draft' size={14} />
                <span>Остерегайтесь внешних ссылок</span>
              </div>
            </div>

            <PredictionTabComments loading={isLoading} prediction={prediction.id} commentIds={commentIds} />
          </>
        )}

        {activeTab === 'holders' && <Empty title='Список топ-предсказателей скоро появится' size={48} icon='star' />}

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
          <div className='color-gray nowrap'>{formatRelativeTime(bet.created)}</div>
        </div>
      ))}
      <div className='row gap12 center middle'>
        <Loader />
        <span>Загрузка...</span>
      </div>
    </>
  )
}
