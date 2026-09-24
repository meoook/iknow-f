import s from './login.module.scss'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useEmailNonceMutation, useEmailAuthMutation, useW3authMutation, useW3nonceMutation } from '../../services/api'
import { web3AuthService } from '../../services/web3Auth'
import { REGEX_EMAIL } from '../../utils/date'
import IconSprite from '../../elements/icon'
import Nonce from '../../elements/nonce'
import Loader from '../../elements/loader'

interface ModalLoginProps {
  close: () => void
}

export default function ModalLogin({ close }: ModalLoginProps) {
  const NONCE_LENGTH: number = 6
  const initialEmail = localStorage.getItem('email') || ''
  const [email, setEmail] = useState(initialEmail)
  const [emailValid, setEmailValid] = useState(REGEX_EMAIL.test(initialEmail))
  const [error, setError] = useState('')
  const [step, setStep] = useState<'email' | 'nonce'>('email')
  const [nonce, setNonce] = useState<string>('')
  const [expireTime, setExpireTime] = useState<number | null>(null)
  const [expired, setExpired] = useState<boolean>(false)

  useEffect(() => {
    if (step === 'nonce' && expireTime) {
      const delay = (expireTime - Math.floor(Date.now() / 1000)) * 1000

      if (delay <= 0) {
        setExpireTime(null)
        setExpired(true)
        return
      }

      const timer = setTimeout(() => {
        setExpireTime(null)
        setExpired(true)
      }, delay)

      return () => clearTimeout(timer)
    }
  }, [step, expireTime])

  const [emailNonce, { isLoading: isOauthLoading }] = useEmailNonceMutation()
  const [emailAuth, { isLoading: isEmailLoading }] = useEmailAuthMutation()
  const [w3auth, { isLoading: isWeb3Loading }] = useW3authMutation()
  const [w3nonce] = useW3nonceMutation()

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailValid(REGEX_EMAIL.test(e.target.value))
    setEmail(e.target.value)
  }

  const handleEmailLogin = async () => {
    setError('')
    setExpired(false)
    try {
      const { expire } = await emailNonce({ email }).unwrap()
      if (expire) setExpireTime(expire)
      localStorage.setItem('email', email)
      setStep('nonce')
    } catch (err: any) {
      setError(err || 'Ошибка входа')
    }
  }

  const handleNonceLogin = async () => {
    if (nonce.length !== NONCE_LENGTH) {
      setError('Введите код')
      return
    }
    setError('')
    try {
      await emailAuth({ email, nonce })
        .unwrap()
        .then(() => close())
    } catch (err: any) {
      setError(err.data?.message || 'Неверный код')
    }
  }

  const handleWeb3Login = async (type: 'metamask' | 'phantom') => {
    setError('')
    try {
      const { signature, message } = await web3AuthService.authenticateWithWeb3(w3nonce, type)
      await w3auth({ message, signature })
        .unwrap()
        .then(() => close())
    } catch (err: any) {
      setError(err.message || 'Web3 login failed')
    }
  }

  const handleGoogleLogin = () => {
    const clientId = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID
    if (!clientId) {
      setError('Google OAuth Client ID не настроен')
      return
    }

    const currentPath = window.location.pathname + window.location.search
    sessionStorage.setItem('oauth_return_to', currentPath)

    const statePayload = {
      csrf: crypto.randomUUID(),
      returnTo: currentPath,
    }
    const state = btoa(unescape(encodeURIComponent(JSON.stringify(statePayload))))
    sessionStorage.setItem('oauth_state', state)

    const redirectUri = `${window.location.origin}/oauth/google`

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email',
      state: state,
      access_type: 'online',
      prompt: 'select_account',
    })

    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  }

  const stepBack = () => {
    setStep('email')
    setError('')
    setNonce('')
    setExpireTime(null)
    setExpired(false)
  }

  return (
    <div className={s.wrapper}>
      <h2 className='column center'>Добро пожаловать в iVanga</h2>

      <div className={s.steps} style={{ gridTemplateRows: step === 'email' ? '1fr 0fr' : '0fr 1fr' }}>
        <div className={s.step}>
          <div className='column gap-5'>
            <button type='button' onClick={handleGoogleLogin} className='btn gray big'>
              <IconSprite name='google' size={24} />
              <span>Войти через Google</span>
            </button>

            <div className='row center gap-5'>
              <hr className='grow' />
              <span>ИЛИ</span>
              <hr className='grow' />
            </div>

            <div className={s.email}>
              <input
                name='email'
                type='email'
                value={email}
                onChange={handleEmailChange}
                placeholder='Почтовый адрес'
                autoComplete='off'
              />
              <button
                type='submit'
                className='btn blue'
                disabled={!emailValid || isOauthLoading}
                onClick={handleEmailLogin}>
                {isOauthLoading ? <Loader /> : 'Продолжить'}
              </button>
            </div>

            <div className='row center gap-5'>
              <button
                onClick={() => handleWeb3Login('metamask')}
                disabled={isWeb3Loading}
                className='btn gray grow big'>
                <IconSprite name='metamask' size={28} />
                Metamask
              </button>
              <button
                onClick={() => handleWeb3Login('phantom')}
                disabled={isWeb3Loading}
                className='btn gray grow big'>
                <IconSprite name='phantom' size={28} />
                Phantom
              </button>
            </div>
          </div>
        </div>

        <div className={s.step}>
          <div className='column center gap-3'>
            <div className='column center gap-2'>
              {/* <h2>Подтвердите вход</h2> */}
              <div className='color-gray text-center'>Код подтверждения отправлен на почту</div>
              <div>{email}</div>
            </div>

            {step === 'email' ? (
              <div className={s.expired} />
            ) : expired ? (
              <h3 className={s.expired}>Срок действия кода истёк</h3>
            ) : (
              <Nonce length={NONCE_LENGTH} value={nonce} onChange={setNonce} />
            )}

            {expired ? (
              <button className='btn blue big w-full' disabled={isOauthLoading} onClick={handleEmailLogin}>
                {isOauthLoading ? <Loader /> : 'Отправить код повторно'}
              </button>
            ) : (
              <button
                className='btn blue big w-full'
                disabled={nonce.length !== NONCE_LENGTH || isEmailLoading}
                onClick={handleNonceLogin}>
                {isEmailLoading ? <Loader /> : 'Подтвердить'}
              </button>
            )}

            <button className='btn' onClick={stepBack}>
              Изменить почту
            </button>
          </div>
        </div>
      </div>

      <small className={s.error}>{error ? error : '\u00A0'}</small>

      <Link to='/tos' onClick={() => close()}>
        <small className='column center color-gray'>Условия использования</small>
      </Link>
    </div>
  )
}
