import s from './request.module.scss'
import React from 'react'
import { useRequest } from '../../../../store/requests.adapter'
import IconSprite from '../../../../elements/icon'
import Loader from '../../../../elements/loader'
import PredictionHead from '../../../../components/head'

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
            <PredictionHead title={request.title} icon={request.icon} groups={request.groups} />

            <div className='flex-i center gap-1 text-sm color-brand nowrap'>
              <IconSprite name='finish' size={16} />
              <span className='truncate'>Завершение: {new Date(request.end_date).toLocaleDateString()}</span>
            </div>
            <div className='flex-i center gap-1 text-sm'>
              <div className='secondary'>Закрытие ставок</div>
              <span className='truncate'>{new Date(request.bet_date).toLocaleDateString()}</span>
            </div>

            <p className='text-sm secondary pre-line lh-5'>{request.rules}</p>
            <div className='flex-i center gap-1 text-sm'>
              <div className='secondary'>Источник валидации</div>
              <span className='truncate'>{request.link}</span>
            </div>

            <div className='flex-i center gap-1 text-sm'>
              <div className='secondary'>Ставка</div>
              <span>${new Intl.NumberFormat('en-US').format(request.amount)}</span>
            </div>
            <div className='grow row gap-2 start wrap'>
              {request.choices.map((c) => (
                <span key={c} className={`${s.choice} truncate ${c === request.vote ? 'alert-green' : 'alert-gray'}`}>
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
