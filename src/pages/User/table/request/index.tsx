import s from './request.module.scss'
import React from 'react'
import { useRequest } from '../../../../store/requests.adapter'
import IconSprite from '../../../../elements/icon'
import Loader from '../../../../elements/loader'
import PredictionHead from '../../../../components/head'
import PredictionStatus from '../../../../elements/status'

const RequestItem = ({ requestId }: { requestId: number }) => {
  const request = useRequest(requestId)
  if (!request) return null

  const color = request.state === 'REJECTED' ? 'red' : request.state === 'VALIDATE' ? 'blue' : 'green'
  return (
    <>
      <div className='row gap-4 pv-1 hidden'>
        <div className={`${s.indicator} ${color}`} />

        <div className='grow row gap-5 w-0'>
          <div className='grow column gap-3 w-full'>
            <PredictionHead title={request.title} icon={request.icon} tags={request.tags} />
            <PredictionStatus
              state={request.state}
              date={request.end_date}
              volume={request.amount}
              bet_end={request.bet_date}
              link={request.link}
            />
            <p className='text-sm secondary lh-5'>{request.rules}</p>

            <div className='grow row gap-2 start wrap'>
              {request.choices.map((c) => (
                <span key={c} className={`${s.choice} ellipsis ${c === request.vote ? 'alert-green' : 'alert-gray'}`}>
                  {c}
                </span>
              ))}
            </div>

            {request.state === 'REJECTED' && (
              <div className={`${s.state} alert-red`}>
                <div className='row center gap-1'>
                  <IconSprite name='warning' size={18} />
                  <span>Отклонено</span>
                </div>
                {request.reject_reason && <div className={s.reason}>{request.reject_reason}</div>}
              </div>
            )}

            {request.state === 'VALIDATE' && (
              <div className={`${s.state} alert-blue`}>
                <div className='row center gap-2'>
                  <Loader />
                  <span>Ожидает подтверждения...</span>
                </div>
              </div>
            )}

            {request.state === 'APPROVED' && (
              <div className={`${s.state} alert-green`}>
                <div className='row center gap-1'>
                  <IconSprite name='check' size={18} />
                  <span>Одобрено</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
export default React.memo(RequestItem)
