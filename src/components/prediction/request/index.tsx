import React from 'react'
import s from './request.module.scss'
import { useRequest } from '../../../services/requests/adapter'
import IconSprite from '../../../elements/icon'
import Loader from '../../../elements/loader'
import VoteItem from '../vote'
import PredictionHead from '../../head'
import PredictionStatus from '../../../elements/status'

const RequestItem = ({ requestId, isLast }: { requestId: number; isLast?: boolean }) => {
  const request = useRequest(requestId)
  if (!request) return null

  const color = request.state === 'REJECTED' ? 'red' : request.state === 'VALIDATE' ? 'blue' : 'green'
  return (
    <>
      <div className='row gap-4 pv-1 hidden'>
        <div className={`${s.indicator} ${color}`} />

        <div className='grow row gap-5'>
          <div className='column gap-3 grow'>
            <PredictionHead title={request.title} icon={request.icon} tags={request.tags} />
            <PredictionStatus state={request.state} date={request.end_date} />
            <p className='text-sm secondary lh-5'>{request.rules}</p>

            <div className='grow row gap-2 start wrap'>
              {request.choices.map((choice) => (
                <span key={choice} className='text-sm bg-dialog bd bdr-4 pv-1 ph-2 secondary'>
                  {choice}
                </span>
              ))}
            </div>

            {request.state === 'REJECTED' && (
              <div className={`${s.state} ${s.error}`}>
                <div className='row center gap4'>
                  <IconSprite name='warning' size={18} />
                  <span>Отклонено</span>
                </div>
                {request.reject_reason && <div className={s.reason}>{request.reject_reason}</div>}
              </div>
            )}

            {request.state === 'VALIDATE' && (
              <div className={`${s.state} ${s.pending}`}>
                <div className='row center gap8'>
                  <Loader />
                  <span>Ожидает подтверждения...</span>
                </div>
              </div>
            )}

            {request.state === 'APPROVED' && (
              <div className={`${s.state} ${s.ok}`}>
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
