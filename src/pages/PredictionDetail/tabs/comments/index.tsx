import React from 'react'
import style from './comments.module.scss'
import { useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '../../../../hooks/useRedux'
import {
  useAddLikeMutation,
  useDeleteCommentMutation,
  useGetCommentsQuery,
  useRemoveLikeMutation,
} from '../../../../services/comments/api'
import { commentsSelectors } from '../../../../services/comments/adapter'
import { useClickOutside, useModal } from '../../../../hooks/hooks'
import { formatRelativeTime } from '../../../../utils/date'
import { setShowLoginModal } from '../../../../store/auth.slice'
import IconSprite from '../../../../elements/icon/Icon'
import Avatar from '../../../../elements/avatar'
import Empty from '../../../../elements/empty'
import Modal from '../../../../elements/modal'
import ModalReport from '../../../../modals/report'

interface PredictionTabCommentsProps {
  loading: boolean
  prediction: number
  commentIds: number[]
}

interface CommentProps {
  commentId: number
  authed: boolean
  prediction: number
}

export default function PredictionTabComments({ loading, prediction, commentIds }: PredictionTabCommentsProps) {
  const { user } = useAppSelector((state) => state.auth)

  if (loading) return <Empty title='Загрузка...' loading={true} />
  if (!commentIds.length) return <Empty title='Нет комментариев' size={24} />

  return (
    <div className={style.comments}>
      {commentIds.map((commentId) => (
        <Comment key={commentId} commentId={commentId} authed={!!user} prediction={prediction} />
      ))}
    </div>
  )
}

const CommentBase = ({ commentId, authed, prediction }: CommentProps) => {
  const dispatch = useAppDispatch()
  const { comment } = useGetCommentsQuery(
    { id: prediction },
    {
      selectFromResult: ({ data }) => ({
        comment: data ? commentsSelectors.selectById(data, commentId) : undefined,
      }),
    },
  )

  if (!comment) return null

  const [likeComment] = useAddLikeMutation()
  const [dislikeComment] = useRemoveLikeMutation()
  const [deleteComment] = useDeleteCommentMutation()
  const [menuRef, isMenuOpen, menuToogle] = useClickOutside()
  const [modal, open, close] = useModal()

  const deleteHours = useAppSelector((s) => s.app.settings.delete)

  const canDelete = useMemo(() => {
    if (!comment.owner) return false
    const created = new Date(comment.created).getTime()
    const diffHours = (Date.now() - created) / 36e5
    return diffHours <= deleteHours
  }, [comment.owner, comment.created, deleteHours])

  const toggleLike = () => {
    if (!authed) return dispatch(setShowLoginModal(true))
    if (comment.is_liked) dislikeComment({ prediction, comment: comment.id })
    else likeComment({ prediction, comment: comment.id })
  }
  const handleModalOpen = () => {
    if (!authed) return dispatch(setShowLoginModal(true))
    menuToogle(undefined as any)
    open()
  }

  return (
    <div className='row gap12'>
      <Modal modal={modal} close={close}>
        <ModalReport prediction={prediction} commentId={comment.id} close={close} />
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
                    <IconSprite name='flag' size={18} />
                    <span>Пожаловаться</span>
                  </button>
                  {canDelete && (
                    <button
                      className={style.btn}
                      onClick={() => deleteComment({ prediction: prediction, comment: comment.id })}>
                      <IconSprite name='delete' size={18} />
                      <span>Удалить</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
        <div className={style.text}>{comment.text}</div>
        <button className={`${style.like}${comment.is_liked ? ' active' : ''}`} onClick={toggleLike}>
          <IconSprite name='favorite' size={16} />
          <span>{comment.reactions}</span>
        </button>
      </div>
    </div>
  )
}

const Comment = React.memo(CommentBase)
