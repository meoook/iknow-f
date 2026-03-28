import React from 'react'
import style from './request.module.scss'
import { useRequest } from '../../../services/requests/adapter'
import IconSprite from '../../../elements/icon'
import Loader from '../../../elements/loader'
import VoteItem from '../vote'
import PredictionHead from '../../head'
import PredictionStatus from '../../status'

const RequestItem = ({ requestId, isLast }: { requestId: number; isLast?: boolean }) => {
  const request = useRequest(requestId)
  if (!request) return null

  const iClass = request.state === 'REJECTED' ? style.red : request.state === 'VALIDATE' ? style.blue : style.green
  return (
    <>
      <div className={style.item}>
        <div className={`${style.indicator} ${iClass}`} />

        <div className={style.main}>
          <div className='column gap12 grow'>
            <PredictionHead title={request.title} icon={request.icon} />
            <PredictionStatus tags={request.tags} state={request.state} date={request.end_date} />
            <p className={style.rules}>{request.rules}</p>

            <div className={style.chips}>
              {request.choices.map((choice) => (
                <span key={choice} className={style.chip}>
                  {choice}
                </span>
              ))}
            </div>

            {request.state === 'REJECTED' && (
              <div className={`${style.state} ${style.error}`}>
                <div className='row center gap4'>
                  <IconSprite name='warning' size={18} />
                  <span>Отклонено</span>
                </div>
                {request.reject_reason && <div className={style.reason}>{request.reject_reason}</div>}
              </div>
            )}

            {request.state === 'VALIDATE' && (
              <div className={`${style.state} ${style.pending}`}>
                <div className='row center gap8'>
                  <Loader />
                  <span>Ожидает подтверждения...</span>
                </div>
              </div>
            )}

            {request.state === 'APPROVED' && (
              <div className={`${style.state} ${style.ok}`}>
                <div className='row center gap4'>
                  <IconSprite name='check' size={18} />
                  <span>Одобрено</span>
                </div>
              </div>
            )}
          </div>

          <VoteItem vote={request.vote} currency={request.currency} amount={request.amount} />
        </div>
      </div>
      {!isLast && <hr />}
    </>
  )
}
export default React.memo(RequestItem)
