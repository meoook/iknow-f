import style from './request.module.scss'
import IconSprite from '../../elements/icon/Icon'
import Loader from '../../elements/loader'
import type { IRequest } from '../../types/app.types'

export default function RequestItem({ request, isLast }: { request: IRequest; isLast?: boolean }) {
  const iClass = request.state === 'REJECTED' ? style.red : request.state === 'VALIDATE' ? style.blue : style.green
  return (
    <>
      <div className={style.item}>
        <div className={`${style.indicator} ${iClass}`} />

        <div className={style.main}>
          <div className='column gap12 grow'>
            <div className='column gap4'>
              <h3>{request.title}</h3>
              <div className={style.date}>
                <IconSprite name='finish' size={16} />
                <span>Завершение: {new Date(request.end_date).toLocaleDateString()}</span>
              </div>
            </div>

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

          <div className={style.prediction}>
            <div className={style.vote}>
              <span className={style.label}>Ваш выбор</span>
              <span>{request.vote_choice || '—'}</span>
            </div>

            <div className={style.vote}>
              <span className={style.label}>Ставка</span>
              <span>
                {Number(request.amount).toFixed(2)} {request.currency === 'POINT' ? 'Баллов' : 'Кэш'}
              </span>
            </div>

            <div className={style.vote}>
              <span className={style.label}>Прогноз</span>
              <span className={request.vote ? style.yes : style.no}>{request.vote ? 'Сбудется' : 'Не сбудется'}</span>
            </div>
          </div>
        </div>
      </div>
      {!isLast && <hr />}
    </>
  )
}
