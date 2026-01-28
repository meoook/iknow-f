import { useMemo } from 'react'
import style from './comments.module.scss'
import { useAppSelector } from '../../../../hooks/useRedux'
import { useAddLikeMutation, useDeleteCommentMutation, useRemoveLikeMutation } from '../../../../services/api'
import type { IComment } from '../../../../types/app.types'
import { formatRelativeTime } from '../../../../utils/date'
import IconSprite from '../../../../elements/icon/Icon'
import Avatar from '../../../../elements/avatar'
import Empty from '../../../../elements/empty'
import { useClickOutside, useModal } from '../../../../hooks/hooks'
import Modal from '../../../../elements/modal'

interface PredictionTabCommentsProps {
  loading: boolean
  prediction: number
  comments?: IComment[]
}

export default function PredictionTabComments({ loading, prediction, comments }: PredictionTabCommentsProps) {
  const { user } = useAppSelector((state) => state.auth)

  if (loading) return <Empty title='Загрузка...' loading={true} />
  if (!comments?.length) return <Empty title='Нет комментариев' size={24} />

  return (
    <div className={style.comments}>
      {comments.map((comment) => (
        <Comment key={comment.id} comment={comment} authed={!!user} prediction={prediction} />
      ))}
    </div>
  )
}

function Comment({ comment, authed, prediction }: { comment: IComment; authed: boolean; prediction: number }) {
  const [likeComment] = useAddLikeMutation()
  const [dislikeComment] = useRemoveLikeMutation()
  const [deleteComment] = useDeleteCommentMutation()
  const [menuRef, isMenuOpen, menuToogle] = useClickOutside()
  const [modal, open, close] = useModal()

  const { settings } = useAppSelector((state) => state.app)

  const canDelete = useMemo(() => {
    if (!comment.owner) return false
    const created = new Date(comment.created).getTime()
    const now = new Date().getTime()
    const diffHours = (now - created) / (1000 * 60 * 60)
    return diffHours <= settings.delete
  }, [comment.owner, comment.created, settings.delete])

  const toggleLike = (comment: IComment) => {
    if (!authed) return
    if (comment.is_liked) dislikeComment({ comment: comment.id })
    else likeComment({ comment: comment.id })
  }
  const handleModalOpen = () => {
    menuToogle(undefined as any)
    open()
  }

  return (
    <div className='row gap12'>
      <Modal modal={modal} close={close}>
        <div>Жалоба</div>
      </Modal>
      <Avatar src={comment.avatar} size='medium' />
      <div className='column start grow'>
        <div className='row center justify w100'>
          <div className='row center gap12'>
            <b>{comment.username.length > 20 ? `${comment.username.slice(0, 17)}...` : comment.username}</b>
            <span className='label'>{formatRelativeTime(comment.created)}</span>
          </div>
          <div className={style.wrapper} ref={menuRef}>
            <button className={style.more} onClick={menuToogle}>
              <IconSprite name='more' size={18} />
            </button>
            {isMenuOpen && (
              <>
                <div className={style.dropdown}>
                  <button className={style.btn} onClick={handleModalOpen}>
                    <IconSprite name='flag' size={24} />
                    <span>Пожаловаться</span>
                  </button>
                  {canDelete && (
                    <button
                      className={style.btn}
                      onClick={() => deleteComment({ prediction: prediction, comment: comment.id })}>
                      <IconSprite name='delete' size={24} />
                      <span>Удалить</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
        <div className={style.text}>{comment.text}</div>
        <button className={`${style.like}${comment.is_liked ? ' active' : ''}`} onClick={() => toggleLike(comment)}>
          <IconSprite name='favorite' size={16} />
          <span>{comment.reactions}</span>
        </button>
      </div>
    </div>
  )
}
