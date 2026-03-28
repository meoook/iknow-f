import style from './notifications.module.scss'
import { useEffect, useState } from 'react'
import { REGEX_EMAIL } from '../../../utils/date'
import type { IUser } from '../../../types/auth.types'
import { useGetTelegramNonceMutation, useSetUserParamsMutation, useEmailNonceMutation } from '../../../services/api'
import Toggle from '../../../elements/toggle'
import IconSprite from '../../../elements/icon'
import { useModalContext } from '../../../services/ModalContext'
import ModalApprove from '../../../modals/approve'

export default function ProfileNotifications({ user, loading }: { user: IUser | null; loading: boolean }) {
  const [getTelegramNonce] = useGetTelegramNonceMutation()
  const [setUserParams] = useSetUserParamsMutation()
  const [emailNonce] = useEmailNonceMutation()
  const { openModal } = useModalContext()

  const [nonce, setNonce] = useState('')
  const [email, setEmail] = useState(user?.email || '')

  useEffect(() => {
    if (user?.email) setEmail(user?.email)
  }, [user?.email])

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

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
  }

  const handleEmailSave = async () => {
    await emailNonce({ email })
      .unwrap()
      .then(() => openModal(ModalApprove, 'common', { email }))
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
    <div className='column gap12'>
      <h1>Уведомления</h1>
      <hr />
      <h2>Telegram</h2>
      {user?.telegram_id && <div>Telegram id: {user.telegram_id}</div>}
      <div className={style.tg_block}>
        {nonce ? (
          <div className='row center'>
            <div className={style.nonce}>{nonce}</div>
            <div>
              <span>Отправьте сообщение с этим кодом в телеграм канал</span>
              <br />
              <a href={`https://t.me/${import.meta.env.VITE_TG_BOT}`} className='brand' target='blank'>
                @{import.meta.env.VITE_TG_BOT}
              </a>
              <span> для активации уведомления</span>
            </div>
          </div>
        ) : (
          <div className='row center gap8 lh-1'>
            {!user?.telegram_id ? (
              <button className='btn green' onClick={getCode}>
                Подключить
              </button>
            ) : (
              <button className='btn orange' onClick={getCode}>
                Изменить
              </button>
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
      <h2>Почта</h2>
      <div className={style.email}>
        <input type='email' value={email} onChange={handleEmailChange} disabled={!!user?.email} />
        {!user?.email && REGEX_EMAIL.test(email) && (
          <button className={`${style.btn} green`} onClick={handleEmailSave} title='сохранить'>
            <IconSprite name='check' />
          </button>
        )}
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
