import style from './comments.module.scss'
import { useAppSelector } from '../../../../hooks/useRedux'
import { useAddLikeMutation, useRemoveLikeMutation } from '../../../../services/api'
import type { IComment } from '../../../../types/app.types'
import { formatRelativeTime } from '../../../../utils/date'
import IconSprite from '../../../../elements/icon/Icon'
import Avatar from '../../../../elements/avatar'
import Empty from '../../../../elements/empty'
import { useClickOutside } from '../../../../hooks/hooks'

interface PredictionTabCommentsProps {
  loading: boolean
  comments?: IComment[]
}

export default function PredictionTabComments({ loading, comments }: PredictionTabCommentsProps) {
  const { user } = useAppSelector((state) => state.auth)

  if (loading) return <Empty title='Загрузка...' loading={true} />
  if (!comments?.length) return <Empty title='Нет комментариев' size={24} />

  return (
    <div className={style.comments}>
      {comments.map((comment) => (
        <Comment key={comment.id} comment={comment} authed={!!user} />
      ))}
    </div>
  )
}

function Comment({ comment, authed }: { comment: IComment; authed: boolean }) {
  const [likeComment] = useAddLikeMutation()
  const [dislikeComment] = useRemoveLikeMutation()
  const [menuRef, isMenuOpen, menuToogle] = useClickOutside()

  const toggleLike = (comment: IComment) => {
    if (!authed) return
    if (comment.is_liked) dislikeComment({ comment: comment.id })
    else likeComment({ comment: comment.id })
  }

  return (
    <div className='row gap12'>
      <Avatar src={comment.avatar} size='medium' />
      <div className='column start grow'>
        <div className='row center justify w100' ref={menuRef}>
          <div className='row center gap12'>
            <b>{comment.username.length > 20 ? `${comment.username.slice(0, 17)}...` : comment.username}</b>
            <span className='label'>{formatRelativeTime(comment.created)}</span>
          </div>
          <div className={style.wrapper} ref={menuRef}>
            <button className={style.more} onClick={menuToogle}>
              <IconSprite name='more' size={18} />
            </button>
            {isMenuOpen && (
              <div className={style.dropdown}>
                <button className='btn' onClick={() => toggleLike(comment)}>
                  {comment.is_liked ? 'Отменить лайк' : 'Лайк'}
                </button>
              </div>
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
