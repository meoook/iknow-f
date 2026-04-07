import React, { useEffect, useState, useRef, useMemo } from 'react'
import style from './comments.module.scss'
import { useAppDispatch, useAppSelector } from '../../../../hooks/useRedux'
import { commentsApi } from '../../../../services/comments/api'
import { useComment, useCommentIds } from '../../../../services/comments/adapter'
import { useAddLikeMutation, useRemoveLikeMutation, useDeleteCommentMutation } from '../../../../services/comments/api'
import { formatRelativeTime } from '../../../../utils/date'
import { useClickOutside } from '../../../../hooks/hooks'
import { useModalContext } from '../../../../services/ModalContext'
import ModalReport from '../../../../modals/report'
import ModalLogin from '../../../../modals/login'
import IconSprite from '../../../../elements/icon'
import Avatar from '../../../../elements/avatar'
import Empty from '../../../../elements/empty'

export interface PredictionTabCommentsProps {
  predictionId: number
}

export default function PredictionTabComments({ predictionId }: PredictionTabCommentsProps) {
  const limit = 10
  const dispatch = useAppDispatch()
  const observerTarget = useRef<HTMLDivElement>(null)
  const { user } = useAppSelector((state) => state.auth)
  const { commentIds, isLoading, total, isFetching } = useCommentIds(predictionId)
  const [offset, setOffset] = useState(0)

  const loadMore = () => {
    if (commentIds.length >= total || isFetching) return
    const newOffset = offset + limit
    setOffset(newOffset)
    dispatch(
      commentsApi.endpoints.getComments.initiate(
        { id: predictionId, limit, offset: newOffset },
        { forceRefetch: true },
      ),
    )
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && commentIds.length < total && !isLoading && !isFetching) loadMore()
      },
      { threshold: 1.0 },
    )
    if (observerTarget.current) observer.observe(observerTarget.current)

    return () => {
      if (observerTarget.current) observer.unobserve(observerTarget.current)
    }
  }, [commentIds.length, total, isLoading, isFetching, loadMore])

  if (isLoading) return <Empty title='Загрузка...' loading={true} />
  if (!commentIds.length) return <Empty title='Нет комментариев' size={24} />

  return (
    <div className={style.comments}>
      {commentIds.map((commentId) => (
        <Comment key={commentId} authed={!!user} predictionId={predictionId} commentId={commentId} />
      ))}
      <div ref={observerTarget} className='more' />
    </div>
  )
}

interface CommentProps {
  authed: boolean
  predictionId: number
  commentId: number
}

const CommentBase = ({ authed, predictionId, commentId }: CommentProps) => {
  const comment = useComment(predictionId, commentId)

  if (!comment) return null

  const [likeComment] = useAddLikeMutation()
  const [dislikeComment] = useRemoveLikeMutation()
  const [deleteComment] = useDeleteCommentMutation()
  const [menuRef, isMenuOpen, menuToogle] = useClickOutside()
  const { openModal } = useModalContext()

  const deleteHours = useAppSelector((s) => s.app.settings.delete)

  const canDelete = useMemo(() => {
    if (!comment.owner) return false
    const created = new Date(comment.created).getTime()
    const diffHours = (Date.now() - created) / 36e5
    return diffHours <= deleteHours
  }, [comment.owner, comment.created, deleteHours])

  const toggleLike = () => {
    if (!authed) return openModal(ModalLogin)
    if (comment.is_liked) dislikeComment({ predictionId, commentId: comment.id })
    else likeComment({ predictionId, commentId: comment.id })
  }
  const handleModalOpen = () => {
    if (!authed) return openModal(ModalLogin)
    menuToogle()
    openModal(ModalReport, 'common', { predictionId, commentId: comment.id })
  }

  return (
    <div className='row gap12'>
      <Avatar src={comment.avatar} size='md' />
      <div className='column start grow'>
        <div className='row center justify w-full'>
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
                      onClick={() => deleteComment({ predictionId, commentId: comment.id })}>
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
