import style from './tabs.module.scss'
import type { IPredictionDetail } from '../../../../types/app.types'
import { useState } from 'react'
import { useAppSelector } from '../../../../hooks/useRedux'
import { useCreateCommentMutation } from '../../../../services/comments/api'
import { useCommentIds } from '../../../../services/comments/adapter'
import { useModalContext } from '../../../../services/ModalContext'
import { useHorizontalScroll } from '../../../../hooks/hooks'
import ModalLogin from '../../../../modals/login'
import IconSprite from '../../../../elements/icon'
import PredictionTabComments from '../comments'
import PredictionTabBets from '../bets'
import PredictionTabTop from '../top'

interface PredictionTabsProps {
  prediction: IPredictionDetail
}

export default function PredictionTabs({ prediction }: PredictionTabsProps) {
  const { openModal } = useModalContext()
  const { user } = useAppSelector((state) => state.auth)
  const [createComment, { isLoading: isPosting }] = useCreateCommentMutation()
  const [activeTab, setActiveTab] = useState<'comments' | 'holders' | 'activity'>('comments')
  const { total } = useCommentIds(prediction.id)
  const scrollRef = useHorizontalScroll(true)
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user) return openModal(ModalLogin)
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
    <div className='column gap-3'>
      <div className='row gap-4 noscroll-x w-full' ref={scrollRef}>
        <button
          className={`${style.tab}${activeTab === 'comments' ? ' active' : ''}`}
          onClick={() => setActiveTab('comments')}>
          Комментарии{total ? ` (${total})` : ''}
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

      <div className='column gap-4'>
        {activeTab === 'comments' && (
          <>
            <form className={style.input} onSubmit={handleSubmit}>
              <input className='outline' name='comment' placeholder='Добавить комментарий' required />
              <button type='submit' disabled={isPosting}>
                {isPosting ? 'Публикация...' : 'Опубликовать'}
              </button>
            </form>

            <div className={style.filters}>
              <div className='row center gap-3'>
                <div className={style.sort}>
                  <span>Новые</span>
                  <IconSprite name='arrow_down' size={14} />
                </div>
                {/* <label className={style.holders}>
                  <input type='checkbox' />
                  Предсказатели
                </label> */}
              </div>
              <div className={style.warning}>
                <IconSprite name='draft' size={14} />
                <span>Остерегайтесь внешних ссылок</span>
              </div>
            </div>

            <PredictionTabComments predictionId={prediction.id} />
          </>
        )}

        {activeTab === 'holders' && <PredictionTabTop predictionId={prediction.id} />}

        {activeTab === 'activity' && <PredictionTabBets predictionId={prediction.id} />}
      </div>
    </div>
  )
}
