import s from './notifications.module.scss'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAppSelector } from '../../../hooks/useRedux'
import type { IUser } from '../../../types/auth.types'
import { useGetTelegramNonceMutation, useSetUserParamsMutation } from '../../../services/api'
import Toggle from '../../../elements/toggle'
import IconSprite from '../../../elements/icon'

export default function ProfileNotifications({ user, loading }: { user: IUser | null; loading: boolean }) {
  const [getTelegramNonce, { isLoading: isNonceLoading }] = useGetTelegramNonceMutation()
  const [setUserParams] = useSetUserParamsMutation()
  const [, setSearchParams] = useSearchParams()

  const tgNonceTtl = useAppSelector((state) => state.app.settings.tg_nonce_ttl) || 120
  const [nonce, setNonce] = useState('')
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [isExpired, setIsExpired] = useState<boolean>(false)
  const [copied, setCopied] = useState(false)

  const botName = import.meta.env.VITE_TG_BOT || 'the_vanga_bot'

  // При получении/обновлении telegram_id (например, через WebSocket) схлопываем карточку с nonce
  const [prevTgId, setPrevTgId] = useState(user?.telegram_id)
  if (user?.telegram_id !== prevTgId) {
    setPrevTgId(user?.telegram_id)
    if (user?.telegram_id) {
      setNonce('')
      setTimeLeft(0)
      setIsExpired(false)
    }
  }
  useEffect(() => {
    if (!nonce || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setNonce('')
          setIsExpired(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [nonce, timeLeft])

  const handleGetCode = async () => {
    try {
      const srvData = await getTelegramNonce().unwrap()
      if (srvData?.nonce) {
        setNonce(`${srvData.nonce}`)
        setTimeLeft(tgNonceTtl)
        setIsExpired(false)
      }
    } catch {
      // Ошибка отображается сервисом
    }
  }

  const handleCopyCode = () => {
    if (!nonce) return
    navigator.clipboard.writeText(nonce)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const toggleTelegram = () => {
    setUserParams({ telegram_notify: !user?.telegram_notify })
  }

  const toggleMail = () => {
    setUserParams({ email_notify: !user?.email_notify })
  }

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  if (loading) {
    return (
      <div className='column gap-3'>
        <h1>Уведомления</h1>
        <hr />
        <div className='column gap-4'>
          <div className='p-card bg-card bd bdr shadow'>
            <div className='row center pb-2'>
              <div className={`${s.icon} shimmer`} />
              <div className='column gap-1'>
                <div className={`${s.skeleton} ${s.title} shimmer`} />
                <div className={`${s.skeleton} ${s.text} shimmer`} />
              </div>
            </div>
            <div className={`${s.skeleton} ${s.btn} shimmer`} />
          </div>
          <div className='p-card bg-card bd bdr shadow'>
            <div className='row center pb-2'>
              <div className={`${s.icon} shimmer`} />
              <div className='column gap-1'>
                <div className={`${s.skeleton} ${s.title} shimmer`} />
                <div className={`${s.skeleton} ${s.text} shimmer`} />
              </div>
            </div>
            <div className={`${s.skeleton} ${s.btn} shimmer`} />
          </div>
        </div>
      </div>
    )
  }

  const isTgConnected = Boolean(user?.telegram_id)
  const isEmailConnected = Boolean(user?.email)

  return (
    <div className='column gap-3'>
      <h1>Уведомления</h1>
      <hr />

      <div className='column gap-4'>
        {/* Telegram Card */}
        <div className='p-card bg-card bd bdr shadow'>
          <div className='row center pb-3 bd-b'>
            <div className={`${s.icon} alert-blue`}>
              <IconSprite name='bell' size={22} />
            </div>
            <div className='column w-full'>
              <div className='row center justify w-full gap-2'>
                <div className='w-600'>Telegram</div>
                <span className={`${s.badge} ${isTgConnected ? 'alert-green' : 'alert-gray bd'}`}>
                  {isTgConnected ? 'Подключен' : 'Не подключен'}
                </span>
              </div>
              <div className='text-xs secondary pt-1'>Мгновенные алерты в мессенджере</div>
            </div>
          </div>

          <div className='column gap-3 pt-2'>
            {isTgConnected ? (
              <>
                <div className='row center gap-2 text-sm'>
                  <span className='secondary'>Telegram ID:</span>
                  <span className='primary w-600'>{user?.telegram_id}</span>
                </div>

                <div className='row center justify gap-3'>
                  <span className='text-sm primary w-500'>Получать уведомления в Telegram</span>
                  <Toggle checked={Boolean(user?.telegram_notify)} onChange={toggleTelegram} />
                </div>

                {!nonce && !isExpired && (
                  <div className='pt-2'>
                    <button type='button' className='btn gray' onClick={handleGetCode} disabled={isNonceLoading}>
                      {isNonceLoading ? 'Получение кода...' : 'Изменить аккаунт'}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <p className='text-sm secondary lh-5'>
                  Подключите Telegram-бота, чтобы оперативно получать оповещения о результатах ставок, выигрышах и
                  финансовых транзакциях.
                </p>

                {!nonce && !isExpired && (
                  <div>
                    <button type='button' className='btn blue' onClick={handleGetCode} disabled={isNonceLoading}>
                      <IconSprite name='bell' size={18} />
                      <span>{isNonceLoading ? 'Подготовка...' : 'Подключить Telegram'}</span>
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Истекший срок действия кода */}
            {isExpired && !nonce && (
              <div className='column start gap-2 bg-input bd bdr p-4'>
                <div className='row center gap-2 text-sm color-red'>
                  <IconSprite name='warning' size={18} />
                  <span className='w-600'>Срок действия кода истек</span>
                </div>
                <p className='text-xs secondary'>
                  Предыдущий код устарел. Запросите новый для подтверждения аккаунта.
                </p>
                <button type='button' className='btn blue' onClick={handleGetCode} disabled={isNonceLoading}>
                  <IconSprite name='bell' size={18} />
                  <span>{isNonceLoading ? 'Подготовка...' : 'Получить новый код'}</span>
                </button>
              </div>
            )}

            {/* Активная карточка с кодом и таймером */}
            {nonce && (
              <div className='column gap-3 bg-input bd bdr p-4'>
                <div className='row center justify pb-2 bd-b'>
                  <span className='text-xs secondary'>Код действителен еще</span>
                  <span className={`${s.timer} ${timeLeft <= 30 ? s.danger : ''}`}>
                    ⏱ {formatTimer(timeLeft)}
                  </span>
                </div>

                <p className='text-xs secondary'>
                  Нажмите кнопку ниже — Telegram откроется с ботом <b>@{botName}</b> и автоматически отправит код
                  активации
                </p>

                <div className='row gap-2 wrap'>
                  <a
                    href={`https://t.me/${botName}?start=${nonce}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='btn blue'>
                    <span>Открыть Telegram и отправить</span>
                    <span>↗</span>
                  </a>
                </div>

                <div className='row center justify gap-2 wrap pt-1'>
                  <span className='text-xs secondary'>Либо отправьте код боту вручную</span>
                  <div className='row center gap-2'>
                    <span className={s.nonce}>{nonce}</span>
                    <button
                      type='button'
                      className={`btn btn-icon bd ${copied ? 'green' : 'gray'}`}
                      onClick={handleCopyCode}
                      title={copied ? 'Скопировано' : 'Скопировать код'}>
                      <IconSprite name={copied ? 'check' : 'copy'} size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Email Card */}
        <div className='p-card bg-card bd bdr shadow'>
          <div className='row center pb-3 bd-b'>
            <div className={`${s.icon} alert-orange`}>
              <IconSprite name='mail' size={22} />
            </div>
            <div className='column w-full'>
              <div className='row center justify w-full gap-2'>
                <div className='w-600'>Электронная почта</div>
                <span className={`${s.badge} ${isEmailConnected ? 'alert-green' : 'alert-gray bd'}`}>
                  {isEmailConnected ? 'Подтверждена' : 'Не привязана'}
                </span>
              </div>
              <div className='text-xs secondary pt-1'>Финансовые отчеты и важные оповещения</div>
            </div>
          </div>

          <div className='column gap-3 pt-2'>
            {isEmailConnected ? (
              <>
                <div className='row center gap-2 text-sm'>
                  <span className='secondary'>Адрес почты:</span>
                  <span className='primary w-600'>{user?.email}</span>
                </div>

                <div className='row center justify gap-3'>
                  <span className='text-sm primary w-500'>Получать уведомления на почту</span>
                  <Toggle checked={Boolean(user?.email_notify)} onChange={toggleMail} />
                </div>
              </>
            ) : (
              <>
                <p className='text-sm secondary lh-5'>
                  Почта еще не привязана к вашему аккаунту. Чтобы получать уведомления на email, подтвердите адрес в
                  настройках профиля.
                </p>
                <div>
                  <button
                    type='button'
                    className='btn gray'
                    onClick={() => {
                      setSearchParams({ tab: 'account' })
                    }}>
                    <IconSprite name='pencil' size={16} />
                    <span>Перейти в профиль</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
