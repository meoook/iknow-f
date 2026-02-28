import style from './notifications.module.scss'
import { useState } from 'react'
import { config } from '../../../config/config'
import type { IUser } from '../../../types/auth.types'
import { useGetTelegramNonceMutation, useSetUserParamsMutation } from '../../../services/api'
import Toggle from '../../../components/toggle'

export default function ProfileNotifications({ user, loading }: { user: IUser | null; loading: boolean }) {
  const [getTelegramNonce] = useGetTelegramNonceMutation()
  const [setUserParams] = useSetUserParamsMutation()

  const [nonce, setNonce] = useState('')

  const getCode = async () => {
    const srvData = await getTelegramNonce()
    if (srvData.data) setNonce(`${srvData.data.nonce}`)
  }

  const toggleTelegram = () => {
    setUserParams({ telegram_notify: !user?.telegram_notify })
  }

  const toggleMail = () => {
    setUserParams({ email_notify: !user?.email_notify })
  }

  if (loading) {
    return (
      <>
        <h1>Настройки профиля</h1>
        <div className={style.head}>
          <div className={`${style.avatar} shimmer`} />
          <div className={`${style.btn} shimmer`} />
        </div>
        {['Почта', 'Никнейм'].map((i) => (
          <div className='form-row' key={i}>
            <label>{i}</label>
            <div className={`${style.input} shimmer`} />
          </div>
        ))}
        <div className='form-row'>
          <label>О себе</label>
          <div className={`${style.textarea} shimmer`} />
        </div>
        <div className={`${style.btn} shimmer`} />
      </>
    )
  }
  return (
    <div className='column gap8'>
      <h1>Уведомления в Telegram</h1>
      <div className={style.tg_block}>
        {nonce ? (
          <div className='row center'>
            <div className={style.nonce}>{nonce}</div>
            <div>
              <span>Отправьте сообщение с этим кодом в телеграм канал</span>
              <br />
              <a href={`https://t.me/${config.telegramBot}`} className='brand' target='blank'>
                @{config.telegramBot}
              </a>
              <span> для активации уведомления</span>
            </div>
          </div>
        ) : (
          <div className='row center gap8'>
            {!user?.telegram_id ? (
              <button className='btn green' onClick={getCode}>
                Подключить
              </button>
            ) : (
              <>
                <div>Telegram id: {user?.telegram_id}</div>
                <button className='btn orange' onClick={getCode}>
                  Изменить
                </button>
              </>
            )}
          </div>
        )}
      </div>
      {user?.telegram_id && (
        <div className='row center gap8'>
          <Toggle checked={user?.telegram_notify} onChange={toggleTelegram} />
          <div>Получать уведомления в Telegram</div>
        </div>
      )}
      <hr />
      <h1>Уведомления на почту</h1>
      <div>
        <label>Почта</label>
        <input type='email' value={user?.email} disabled />
      </div>
      {user?.email && (
        <div className='row center gap8'>
          <Toggle checked={user?.email_notify} onChange={toggleMail} />
          <div>Получать уведомления на почту</div>
        </div>
      )}
    </div>
  )
}
